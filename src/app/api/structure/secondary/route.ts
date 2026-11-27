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
import { predictSecondary, StructurePending } from '@/lib/structure';
import { cachedStructure, clearStructureFailure } from '@/lib/structure-cache';

export const runtime = 'nodejs';

const POLL_BUDGET_MS = 15_000;

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const body = await readJsonBody<{ jobId?: unknown; sampleId?: unknown; retry?: unknown }>(req);
    const jobId = typeof body.jobId === 'string' ? body.jobId : '';
    const sampleId = typeof body.sampleId === 'string' ? body.sampleId : '';
    const retry = body.retry === true;
    const job = await readPredictionJob(jobId);
    if (!verifyJobToken(job, bearerToken(req))) {
      return NextResponse.json({ error: 'Prediction job was not found.' }, { status: 404 });
    }
    const sequence = await readJobSequence(jobId, sampleId);
    if (retry) {
      await clearStructureFailure(jobId, sequence, 'secondary');
    }

    const task = cachedStructure(jobId, sequence, 'secondary', () => {
      enforceRateLimit('secondary-structure', clientIp(req), 60, 60 * 60 * 1000);
      return predictSecondary(sequence);
    });
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
          sequenceLength: sequence.length,
          method: 'S4PRED',
          message: 'Computing single-sequence secondary structure with S4PRED…',
        },
        { status: 202, headers: { 'Retry-After': '5', 'Cache-Control': 'no-store' } },
      );
    }

    return NextResponse.json(
      { sampleId, sequenceLength: sequence.length, method: 'S4PRED', ...outcome.data },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    if (error instanceof StructurePending) {
      return NextResponse.json(
        { status: 'running', method: error.method, message: error.message },
        { status: 202, headers: { 'Retry-After': '5', 'Cache-Control': 'no-store' } },
      );
    }
    const security = securityErrorResponse(error);
    if (security) return security;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Secondary-structure prediction failed.' },
      { status: 400 },
    );
  }
}
