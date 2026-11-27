import crypto, { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { PREDICTION_CONFIG } from './config';
import { parseJobFastaMap } from './prediction-jobs';

export type StructureKind = 'secondary' | 'tertiary';
const LOCK_STALE_MS = 15 * 60 * 1000;
const pending = new Map<string, Promise<unknown>>();
const validJobId = /^[a-z0-9_-]+$/i;

const directory = (jobId: string) => {
  if (!validJobId.test(jobId)) throw new Error('Invalid job identifier.');
  return path.join(PREDICTION_CONFIG.jobDir, jobId, 'structures');
};

const digest = (sequence: string) =>
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

export async function cachedStructure<T>(
  jobId: string,
  sequence: string,
  kind: StructureKind,
  predict: () => Promise<T>,
): Promise<T> {
  const dir = directory(jobId);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const target = path.join(dir, `${digest(sequence)}.${kind}.json`);
  try {
    return JSON.parse(await fs.readFile(target, 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  const existing = pending.get(target);
  if (existing) return (await existing) as T;

  const lock = `${target}.lock`;
  await expireLock(lock);

  const task = (async () => {
    let handle: fs.FileHandle | undefined;
    try {
      handle = await fs.open(lock, 'wx', 0o600);
      await handle.close();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new Error('This structure is already being predicted. Please check again shortly.');
      }
      throw error;
    }
    try {
      const value = await predict();
      const temp = `${target}.${randomUUID()}.tmp`;
      await fs.writeFile(temp, JSON.stringify(value), { mode: 0o600 });
      await fs.rename(temp, target);
      return value;
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
  const dir = directory(jobId);
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
    const hash = digest(entry.sequence.replace(/X/g, ''));
    const state = (kind: StructureKind) =>
      entries.has(`${hash}.${kind}.json`)
        ? 'ready'
        : entries.has(`${hash}.${kind}.json.lock`)
          ? 'running'
          : 'missing';
    result[id] = { secondary: state('secondary'), tertiary: state('tertiary') };
  }
  return result;
}
