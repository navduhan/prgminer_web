import { NextRequest, NextResponse } from 'next/server';
import { readPredictionJob, verifyJobToken } from '@/lib/prediction-jobs';
import { bearerToken } from '@/lib/request-security';
import { structureStatus } from '@/lib/structure-cache';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get('jobId') || '';
    const job = await readPredictionJob(jobId);
    if (!verifyJobToken(job, bearerToken(req))) {
      return NextResponse.json({ error: 'Structure results were not found.' }, { status: 404 });
    }
    return NextResponse.json(await structureStatus(jobId), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Structure results were not found.' }, { status: 404 });
  }
}
