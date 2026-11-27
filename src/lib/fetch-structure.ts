import { withBasePath } from './base-path';

export type StructureProgressInfo = {
  method?: string;
  message?: string;
  sequenceLength?: number;
};

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Initiates or resumes 2D (S4PRED) / 3D (ESMFold or SWISS-MODEL) structure
 * prediction using short HTTP polls (<15s per request) so reverse proxies never time out.
 */
export async function pollStructure<T>(
  kind: 'secondary' | 'tertiary',
  jobId: string,
  sampleId: string,
  token: string,
  options?: {
    retry?: boolean;
    signal?: AbortSignal;
    onProgress?: (info: StructureProgressInfo) => void;
  },
): Promise<T> {
  let firstAttempt = true;
  let gatewayBlips = 0;

  for (;;) {
    if (options?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const res = await fetch(withBasePath(`/api/structure/${kind}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PRGminer-Job-Token': token,
      },
      body: JSON.stringify({
        jobId,
        sampleId,
        retry: firstAttempt && options?.retry === true,
      }),
      signal: options?.signal,
      cache: 'no-store',
    });
    firstAttempt = false;

    const rawText = await res.text();
    let payload: Record<string, unknown> | null = null;
    try {
      payload = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      payload = null;
    }

    if (res.status === 202) {
      gatewayBlips = 0;
      options?.onProgress?.({
        method: typeof payload?.method === 'string' ? payload.method : undefined,
        message: typeof payload?.message === 'string' ? payload.message : undefined,
        sequenceLength:
          typeof payload?.sequenceLength === 'number' ? payload.sequenceLength : undefined,
      });
      const retryAfterSec = Number.parseInt(res.headers.get('Retry-After') || '', 10);
      const delayMs =
        Number.isFinite(retryAfterSec) && retryAfterSec > 0
          ? retryAfterSec * 1000
          : kind === 'secondary'
            ? 5_000
            : 12_000;
      await sleep(delayMs, options?.signal);
      continue;
    }

    if ([502, 503, 504].includes(res.status) && gatewayBlips < 3) {
      gatewayBlips += 1;
      await sleep(8_000, options?.signal);
      continue;
    }

    if (!res.ok) {
      const errMsg =
        (typeof payload?.error === 'string' && payload.error) ||
        `Structure service returned HTTP ${res.status}.`;
      throw new Error(errMsg);
    }

    if (!payload) {
      throw new Error('Structure service returned an invalid JSON payload.');
    }

    return payload as T;
  }
}
