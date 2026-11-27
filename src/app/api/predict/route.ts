import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  createPredictionJob,
  hashJobToken,
  JobCapacityError,
  parseJobFastaMap,
  type PredictionJobRecord,
  readPredictionJob,
  verifyJobToken,
} from '@/lib/prediction-jobs';
import {
  assertSameOrigin,
  bearerToken,
  clientIp,
  enforceRateLimit,
  ownerHash,
  readJsonBody,
  sanitizeProteinFasta,
  securityErrorResponse,
  validateProteinFasta,
  verifyTurnstile,
} from '@/lib/request-security';
import { structureStatus } from '@/lib/structure-cache';

export const runtime = 'nodejs';

const validLevels = new Set(['Phase1', 'Phase2']);
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));
const isMissingFile = (error: unknown) =>
  (error as NodeJS.ErrnoException)?.code === 'ENOENT';

const publicJob = (job: PredictionJobRecord) => ({
  jobId: job.jobId,
  status: job.status,
  level: job.level,
  sequenceCount: job.sequenceCount,
  message: job.message,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  results: job.results,
  summary: job.summary,
  error: job.error,
});

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = clientIp(req);
    enforceRateLimit('predict-submit', ip, 4, 10 * 60 * 1000);

    const body = await readJsonBody<{
      sequence?: unknown;
      level?: unknown;
      turnstileToken?: unknown;
    }>(req);

    const rawSequence = typeof body.sequence === 'string' ? body.sequence.trim() : '';
    const level = typeof body.level === 'string' ? body.level : 'Phase2';
    if (!validLevels.has(level)) {
      return NextResponse.json({ error: 'Prediction level must be Phase1 or Phase2.' }, { status: 400 });
    }

    const validation = validateProteinFasta(rawSequence);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await verifyTurnstile(body.turnstileToken, ip);

    const sanitized = sanitizeProteinFasta(rawSequence);
    const jobId = `prg_${crypto.randomUUID().replaceAll('-', '')}`;
    const jobToken = crypto.randomBytes(32).toString('base64url');
    const job = await createPredictionJob({
      jobId,
      sequence: sanitized,
      sequenceCount: validation.sequenceCount,
      level: level as 'Phase1' | 'Phase2',
      tokenHash: hashJobToken(jobToken),
      ownerHash: ownerHash(ip),
    });

    return NextResponse.json(
      { ...publicJob(job), jobToken },
      { status: 202, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const securityResponse = securityErrorResponse(error);
    if (securityResponse) return securityResponse;
    if (error instanceof JobCapacityError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } },
      );
    }
    console.error('Unable to create PRGminer job:', error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId') || '';
  const includeFasta = req.nextUrl.searchParams.get('fasta') === '1';
  try {
    enforceRateLimit('predict-status', clientIp(req), 120, 60 * 1000);
    const job = await readPredictionJob(jobId);
    if (!verifyJobToken(job, bearerToken(req))) {
      return NextResponse.json(
        { error: 'Prediction job was not found.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const structures = job.status === 'completed' ? await structureStatus(jobId).catch(() => ({})) : {};
    let sequences: Record<string, string> | undefined;
    if (includeFasta && job.status === 'completed') {
      const fastaMap = await parseJobFastaMap(jobId);
      sequences = Object.fromEntries(
        Array.from(fastaMap.entries(), ([id, v]) => [id, v.sequence]),
      );
    }

    return NextResponse.json(
      { ...publicJob(job), structures, ...(sequences ? { sequences } : {}) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const securityResponse = securityErrorResponse(error);
    if (securityResponse) return securityResponse;
    return NextResponse.json(
      { error: isMissingFile(error) ? 'Prediction job was not found.' : errorMessage(error) },
      { status: isMissingFile(error) ? 404 : 400 },
    );
  }
}
