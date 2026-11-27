import { execFile } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { PREDICTION_CONFIG } from './config';

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

export const ESMFOLD_MAX_RESIDUES = 400;

export type SecondaryStructure = {
  amino_acids: string;
  prediction: string;
  confidence: string;
};

export class StructurePending extends Error {
  readonly method: string;

  constructor(msg: string, method = 'ESMFold') {
    super(msg);
    this.name = 'StructurePending';
    this.method = method;
  }
}

export async function predictSecondary(sequence: string): Promise<SecondaryStructure> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'prgminer-s4pred-'));
  const fasta = path.join(directory, 'sequence.fasta');
  try {
    await fs.writeFile(fasta, `>query\n${sequence}\n`, { encoding: 'utf8', mode: 0o600 });
    const output = await new Promise<string>((resolve, reject) => {
      execFile(
        PREDICTION_CONFIG.structure.s4predPython,
        [PREDICTION_CONFIG.structure.s4predScript, '-T', '1', '-t', 'horiz', fasta],
        { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) =>
          error ? reject(new Error(stderr || error.message)) : resolve(stdout),
      );
    });
    let amino_acids = '';
    let prediction = '';
    let confidence = '';
    for (const line of output.split(/\r?\n/)) {
      const value = line.trim().split(/\s+/)[1] || '';
      if (line.startsWith('  AA:')) amino_acids += value;
      else if (line.startsWith('Pred:')) prediction += value;
      else if (line.startsWith('Conf:')) confidence += value;
    }
    if (!prediction || prediction.length !== amino_acids.length) {
      throw new Error('S4PRED returned an incomplete secondary-structure result.');
    }
    return { amino_acids, prediction, confidence };
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

async function esmFold(sequence: string) {
  let lastError = 'The ESMFold service did not respond.';
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch('https://api.esmatlas.com/foldSequence/v1/pdb/', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: sequence,
        signal: AbortSignal.timeout(180_000),
        cache: 'no-store',
      });
      if (response.ok) return response.text();
      lastError = `ESMFold returned HTTP ${response.status}.`;
      if (![429, 502, 503, 504].includes(response.status)) break;
    } catch (error) {
      lastError = message(error);
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 3_000));
  }
  throw new Error(lastError);
}

export async function predictTertiary(sequence: string, beforeEsm?: () => void) {
  beforeEsm?.();
  try {
    return { pdb: await esmFold(sequence), method: 'ESMFold' };
  } catch (error) {
    throw new Error(
      `The ESMFold 3D folding service is temporarily unavailable. Please retry shortly (${message(error)}).`,
    );
  }
}
