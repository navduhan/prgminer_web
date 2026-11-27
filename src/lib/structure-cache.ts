import crypto, { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { PREDICTION_CONFIG } from './config';
import { parseJobFastaMap } from './prediction-jobs';
import { ESMFOLD_MAX_RESIDUES, StructurePending } from './structure';

export type StructureKind = 'secondary' | 'tertiary';

const LOCK_STALE_MS = 15 * 60 * 1000;
const pending = new Map<string, Promise<unknown>>();
const validJobId = /^[a-z0-9_-]+$/i;

export const structureDir = (jobId: string) => {
  if (!validJobId.test(jobId)) throw new Error('Invalid job identifier.');
  return path.join(PREDICTION_CONFIG.jobDir, jobId, 'structures');
};

export const structureDigest = (sequence: string) =>
  crypto.createHash('sha256').update(sequence).digest('hex').slice(0, 24);

async function expireLock(lockPath: string) {
  try {
    const stat = await fs.stat(lockPath);
    if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
      await fs.unlink(lockPath).catch(() => {});
    }
  } catch {
    // Ignore missing lock
  }
}

export async function clearStructureFailure(
  jobId: string,
  sequence: string,
  kind: StructureKind,
) {
  const dir = structureDir(jobId);
  const hash = structureDigest(sequence);
  await fs.unlink(path.join(dir, `${hash}.${kind}.error.json`)).catch(() => {});
}

export async function cachedStructure<T>(
  jobId: string,
  sequence: string,
  kind: StructureKind,
  predict: () => Promise<T>,
): Promise<T> {
  const dir = structureDir(jobId);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const hash = structureDigest(sequence);
  const target = path.join(dir, `${hash}.${kind}.json`);
  const errorFile = path.join(dir, `${hash}.${kind}.error.json`);

  try {
    return JSON.parse(await fs.readFile(target, 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  const existing = pending.get(target);
  if (existing) return (await existing) as T;

  try {
    const savedError = JSON.parse(await fs.readFile(errorFile, 'utf8')) as { error?: string };
    if (savedError.error) throw new Error(savedError.error);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  const lock = `${target}.lock`;
  await expireLock(lock);

  const task = (async () => {
    let handle: fs.FileHandle | undefined;
    try {
      handle = await fs.open(lock, 'wx', 0o600);
      await handle.close();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new StructurePending(
          'Structure prediction is already running. This page will update automatically.',
          kind === 'secondary' ? 'S4PRED' : 'ESMFold',
        );
      }
      throw error;
    }
    try {
      const value = await predict();
      const temp = `${target}.${randomUUID()}.tmp`;
      await fs.writeFile(temp, JSON.stringify(value), { mode: 0o600 });
      await fs.rename(temp, target);
      await fs.unlink(errorFile).catch(() => {});
      return value;
    } catch (error) {
      if (!(error instanceof StructurePending)) {
        const msg = error instanceof Error ? error.message : 'Structure prediction failed.';
        const tempErr = `${errorFile}.${randomUUID()}.tmp`;
        await fs
          .writeFile(tempErr, JSON.stringify({ error: msg, updatedAt: new Date().toISOString() }), {
            mode: 0o600,
          })
          .then(() => fs.rename(tempErr, errorFile))
          .catch(() => {});
      }
      throw error;
    } finally {
      await fs.unlink(lock).catch(() => {});
    }
  })();

  pending.set(target, task);
  try {
    return await task;
  } finally {
    pending.delete(target);
  }
}

export async function structureStatus(jobId: string) {
  const dir = structureDir(jobId);
  const entries = new Set(
    await fs.readdir(dir).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    }),
  );
  for (const entry of entries) {
    if (!entry.endsWith('.lock')) continue;
    await expireLock(path.join(dir, entry));
    try {
      await fs.stat(path.join(dir, entry));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') entries.delete(entry);
      else throw error;
    }
  }

  const fastaMap = await parseJobFastaMap(jobId);
  const result: Record<string, { secondary: string; tertiary: string }> = {};
  for (const [id, entry] of fastaMap.entries()) {
    const cleaned = entry.sequence.replace(/X/g, '');
    const hash = structureDigest(cleaned);
    const secondary = entries.has(`${hash}.secondary.json`)
      ? 'ready'
      : entries.has(`${hash}.secondary.error.json`)
        ? 'failed'
        : entries.has(`${hash}.secondary.json.lock`)
          ? 'running'
          : 'missing';
    const tertiary =
      cleaned.length > ESMFOLD_MAX_RESIDUES
        ? 'unsupported'
        : entries.has(`${hash}.tertiary.json`)
          ? 'ready'
          : entries.has(`${hash}.tertiary.error.json`)
            ? 'failed'
            : entries.has(`${hash}.tertiary.json.lock`)
              ? 'running'
              : 'missing';
    result[id] = { secondary, tertiary };
  }
  return result;
}
