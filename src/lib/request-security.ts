import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export class RequestSecurityError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'RequestSecurityError';
  }
}

type RateWindow = { count: number; resetAt: number };
const rateWindows = new Map<string, RateWindow>();

const positiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const REQUEST_LIMITS = {
  bodyBytes: positiveInteger(process.env.MAX_REQUEST_BODY_BYTES, 67_108_864),
  accessionCount: positiveInteger(process.env.MAX_ACCESSION_COUNT, 100),
  accessionLength: positiveInteger(process.env.MAX_ACCESSION_LENGTH, 64),
  sequenceCount: positiveInteger(process.env.PREDICTION_MAX_SEQUENCES, 10_000),
  totalResidues: positiveInteger(process.env.PREDICTION_MAX_RESIDUES, 50_000_000),
  sequenceLength: positiveInteger(process.env.PREDICTION_MAX_SEQUENCE_LENGTH, 5_000),
};

export function clientIp(req: NextRequest) {
  return (
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export function assertSameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin) return;
  const expectedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!expectedHost) {
    throw new RequestSecurityError('Request origin could not be verified.', 403);
  }
  try {
    if (new URL(origin).host !== expectedHost) {
      throw new RequestSecurityError('Cross-origin requests are not allowed.', 403);
    }
  } catch (error) {
    if (error instanceof RequestSecurityError) throw error;
    throw new RequestSecurityError('Invalid request origin.', 403);
  }
}

export function enforceRateLimit(scope: string, identity: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = `${scope}:${identity}`;
  const current = rateWindows.get(key);
  if (!current || current.resetAt <= now) {
    rateWindows.set(key, { count: 1, resetAt: now + windowMs });
  } else if (current.count >= limit) {
    throw new RequestSecurityError(
      'Too many requests. Please try again shortly.',
      429,
      Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    );
  } else {
    current.count += 1;
  }

  if (rateWindows.size > 10_000) {
    for (const [entryKey, value] of rateWindows) {
      if (value.resetAt <= now) rateWindows.delete(entryKey);
    }
  }
}

export async function readJsonBody<T>(req: NextRequest): Promise<T> {
  const declaredLength = Number.parseInt(req.headers.get('content-length') || '0', 10);
  if (declaredLength > REQUEST_LIMITS.bodyBytes) {
    throw new RequestSecurityError('Request body is too large.', 413);
  }
  const raw = await req.text();
  if (Buffer.byteLength(raw, 'utf8') > REQUEST_LIMITS.bodyBytes) {
    throw new RequestSecurityError('Request body is too large.', 413);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new RequestSecurityError('Request body must be valid JSON.', 400);
  }
}

export function validateProteinFasta(fastaText: string) {
  if (!fastaText || !fastaText.trim()) {
    return { valid: false as const, error: 'FASTA sequence content is empty.' };
  }
  if (Buffer.byteLength(fastaText, 'utf8') > REQUEST_LIMITS.bodyBytes) {
    return { valid: false as const, error: 'FASTA input exceeds the maximum upload size.' };
  }

  const records: number[] = [];
  const seenIds = new Set<string>();
  let currentId = '';
  let currentLength = -1;
  let totalResidues = 0;

  for (const rawLine of fastaText.trim().split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('>')) {
      const id = line.slice(1).trim().split(/\s+/)[0] || '';
      if (!id) {
        return { valid: false as const, error: 'Each FASTA record must include an identifier after ">".' };
      }
      if (currentLength === 0) {
        return { valid: false as const, error: `Header ">${currentId}" is missing its amino acid sequence.` };
      }
      if (currentLength > 0 && currentLength < 10) {
        return {
          valid: false as const,
          error: `Sequence "${currentId}" is too short (${currentLength} aa; minimum 10 aa required for DPC encoding).`,
        };
      }
      if (seenIds.has(id)) {
        return { valid: false as const, error: `Duplicate FASTA identifier detected: "${id}".` };
      }
      if (currentLength > 0) records.push(currentLength);
      if (records.length + 1 > REQUEST_LIMITS.sequenceCount) {
        return {
          valid: false as const,
          error: `A maximum of ${REQUEST_LIMITS.sequenceCount.toLocaleString()} sequences is allowed per web submission.`,
        };
      }
      seenIds.add(id);
      currentId = id;
      currentLength = 0;
      continue;
    }

    if (currentLength < 0) {
      return { valid: false as const, error: 'FASTA input must start with a ">" sequence header.' };
    }

    const cleaned = line.replace(/\s+/g, '').replace(/\*+$/, '').toUpperCase();
    if (!cleaned) continue;
    if (!/^[ACDEFGHIKLMNPQRSTVWYX]+$/.test(cleaned)) {
      return {
        valid: false as const,
        error: `Sequence "${currentId}" contains unsupported characters. Provide protein FASTA (standard 20 amino acids and X).`,
      };
    }

    currentLength += cleaned.length;
    totalResidues += cleaned.length;
    if (currentLength > REQUEST_LIMITS.sequenceLength) {
      return {
        valid: false as const,
        error: `Sequence "${currentId}" exceeds the maximum length of ${REQUEST_LIMITS.sequenceLength.toLocaleString()} residues.`,
      };
    }
    if (totalResidues > REQUEST_LIMITS.totalResidues) {
      return {
        valid: false as const,
        error: `Total input size exceeds ${REQUEST_LIMITS.totalResidues.toLocaleString()} residues.`,
      };
    }
  }

  if (currentLength <= 0) {
    return { valid: false as const, error: 'Each FASTA header must be followed by an amino acid sequence.' };
  }
  if (currentLength < 10) {
    return {
      valid: false as const,
      error: `Sequence "${currentId}" is too short (${currentLength} aa; minimum 10 aa required for DPC encoding).`,
    };
  }
  records.push(currentLength);

  return {
    valid: true as const,
    sequenceCount: records.length,
    totalResidues,
  };
}

export function sanitizeProteinFasta(fastaText: string) {
  const out: string[] = [];
  for (const rawLine of fastaText.trim().split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('>')) {
      out.push(line);
    } else {
      const cleaned = line.replace(/\s+/g, '').replace(/\*+$/, '').toUpperCase();
      if (cleaned) out.push(cleaned);
    }
  }
  return out.join('\n') + '\n';
}

export function parseAccessions(raw: unknown): string[] {
  const items = Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === 'string')
    : typeof raw === 'string'
      ? raw.split(/[\s,;]+/)
      : [];
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  if (!cleaned.length) {
    throw new RequestSecurityError('Provide at least one UniProt or NCBI protein accession.', 400);
  }
  if (cleaned.length > REQUEST_LIMITS.accessionCount) {
    throw new RequestSecurityError(
      `At most ${REQUEST_LIMITS.accessionCount} accessions may be fetched per request.`,
      400,
    );
  }
  for (const acc of cleaned) {
    if (acc.length > REQUEST_LIMITS.accessionLength || !/^[A-Za-z0-9_.-]+$/.test(acc)) {
      throw new RequestSecurityError(`Invalid accession identifier: "${acc}".`, 400);
    }
  }
  return Array.from(new Set(cleaned));
}

export async function verifyTurnstile(token: unknown, ip: string) {
  const required = (process.env.TURNSTILE_REQUIRED || 'false').toLowerCase() === 'true';
  const secret = process.env.TURNSTILE_SECRET_KEY || '';
  if (!required && !secret) return;
  if (!secret) {
    throw new RequestSecurityError('Turnstile verification is required but not configured.', 503);
  }
  if (typeof token !== 'string' || !token.trim()) {
    throw new RequestSecurityError('Complete the verification check before submitting.', 400);
  }

  const form = new URLSearchParams({ secret, response: token.trim() });
  if (ip && ip !== 'unknown') form.set('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new RequestSecurityError('Verification service could not be reached. Please try again.', 502);
  }
  const data = (await res.json()) as { success?: boolean };
  if (!data.success) {
    throw new RequestSecurityError('Verification expired or failed. Please retry.', 403);
  }
}

export function ownerHash(ip: string) {
  const secret = process.env.JOB_OWNER_HMAC_SECRET || 'prgminer-dev-local-hmac-secret-do-not-use-in-prod';
  return crypto.createHmac('sha256', secret).update(ip || 'unknown').digest('hex');
}

export function bearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return req.headers.get('x-prgminer-job-token')?.trim() || '';
}

export function securityErrorResponse(error: unknown) {
  if (!(error instanceof RequestSecurityError)) return null;
  const headers: Record<string, string> = { 'Cache-Control': 'no-store' };
  if (error.retryAfter) headers['Retry-After'] = String(error.retryAfter);
  return NextResponse.json({ error: error.message }, { status: error.status, headers });
}
