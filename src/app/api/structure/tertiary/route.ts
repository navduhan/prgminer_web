import { NextRequest, NextResponse } from 'next/server';
import { readJobSequence, readPredictionJob, verifyJobToken } from '@/lib/prediction-jobs';
import {
  assertSameOrigin,
  bearerToken,
  clientIp,
  enforceRateLimit,
  readJsonBody,
  securityErrorResponse,
} from '@/lib/request-security';
import { ESMFOLD_MAX_RESIDUES, predictTertiary, StructurePending } from '@/lib/structure';
import { cachedStructure, clearStructureFailure } from '@/lib/structure-cache';

export const runtime = 'nodejs';

const POLL_BUDGET_MS = 15_000;

export async function POST(req: NextRequest) {
  let sampleId = '';
  let sequenceLength = 0;
  try {
    assertSameOrigin(req);
    const body = await readJsonBody<{ jobId?: unknown; sampleId?: unknown; retry?: unknown }>(req);
    const jobId = typeof body.jobId === 'string' ? body.jobId : '';
    sampleId = typeof body.sampleId === 'string' ? body.sampleId : '';
    const retry = body.retry === true;

    const job = await readPredictionJob(jobId);
    if (!verifyJobToken(job, bearerToken(req))) {
      return NextResponse.json({ error: 'Prediction job was not found.' }, { status: 404 });
    }

    const sequence = await readJobSequence(jobId, sampleId);
    sequenceLength = sequence.length;

    // Clean, non-error response for proteins exceeding ESMFold's 400-residue single-chain limit
    if (sequenceLength > ESMFOLD_MAX_RESIDUES) {
      return NextResponse.json(
        {
          status: 'unsupported_length',
          sampleId,
          sequence,
          sequenceLength,
          maxResidues: ESMFOLD_MAX_RESIDUES,
          method: `ESMFold (≤ ${ESMFOLD_MAX_RESIDUES} aa)`,
          message: `Direct web 3D structure prediction via ESMFold supports protein sequences up to ${ESMFOLD_MAX_RESIDUES} amino acids (this sequence is ${sequenceLength.toLocaleString()} aa).`,
        },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    if (retry) {
      await clearStructureFailure(jobId, sequence, 'tertiary');
    }

    const task = cachedStructure(jobId, sequence, 'tertiary', () =>
      predictTertiary(sequence, () =>
        enforceRateLimit('tertiary-structure', clientIp(req), 30, 24 * 60 * 60 * 1000),
      ),
    );
    task.catch(() => {});

    const outcome = await Promise.race([
      task.then((data) => ({ ready: true as const, data })),
      new Promise<{ ready: false }>((resolve) =>
        setTimeout(() => resolve({ ready: false }), POLL_BUDGET_MS),
      ),
    ]);

    if (!outcome.ready) {
      return NextResponse.json(
        {
          status: 'running',
          sampleId,
          sequenceLength,
          method: 'ESMFold',
          message: 'Predicting 3D atomic coordinates with ESMFold…',
        },
        { status: 202, headers: { 'Retry-After': '8', 'Cache-Control': 'no-store' } },
      );
    }

    return NextResponse.json(
      { status: 'ready', sampleId, sequence, sequenceLength, ...outcome.data },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    if (error instanceof StructurePending) {
      return NextResponse.json(
        {
          status: 'running',
          sampleId,
          sequenceLength,
          method: error.method,
          message: error.message,
        },
        { status: 202, headers: { 'Retry-After': '8', 'Cache-Control': 'no-store' } },
      );
    }
    const security = securityErrorResponse(error);
    if (security) return security;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Tertiary-structure prediction failed.' },
      { status: 400 },
    );
  }
}
