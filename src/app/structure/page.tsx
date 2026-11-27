'use client';

import dynamic from 'next/dynamic';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Info,
  Layers,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SecondaryStructureViewer from '@/components/SecondaryStructureViewer';
import { withBasePath } from '@/lib/base-path';
import { pollStructure, type StructureProgressInfo } from '@/lib/fetch-structure';

type StructurePayload = {
  status?: 'ready' | 'unsupported_length';
  sampleId: string;
  sequence: string;
  sequenceLength?: number;
  maxResidues?: number;
  message?: string;
  amino_acids: string;
  prediction: string;
  confidence: string;
  pdb: string;
  method: string;
};

const StructureViewer = dynamic(() => import('@/components/StructureViewer'), { ssr: false });

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

export default function StructurePage() {
  const [data, setData] = useState<StructurePayload | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copiedFasta, setCopiedFasta] = useState(false);
  const [progress, setProgress] = useState<StructureProgressInfo>({});
  const [elapsedSec, setElapsedSec] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const [info, setInfo] = useState({
    job: '',
    token: '',
    sample: '',
    kind: 'secondary' as 'secondary' | 'tertiary',
    phase: 'Phase2',
  });

  useEffect(() => {
    const syncHash = () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      setData(null);
      setError('');
      setProgress({});
      setInfo({
        job: params.get('job') || '',
        token: params.get('token') || '',
        sample: params.get('sample') || '',
        kind: params.get('kind') === 'tertiary' ? 'tertiary' : 'secondary',
        phase: params.get('phase') || 'Phase2',
      });
    };
    const timer = window.setTimeout(syncHash, 0);
    window.addEventListener('hashchange', syncHash);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('hashchange', syncHash);
    };
  }, []);

  useEffect(() => {
    if (!busy) return;
    const started = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [busy]);

  const loadStructure = useCallback(
    async (retry = false) => {
      if (!info.job || !info.token || !info.sample) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setElapsedSec(0);
      setBusy(true);
      setError('');
      if (retry) {
        setData(null);
        try {
          sessionStorage.removeItem('prgminer_structure_view');
        } catch {
          // Ignore storage errors
        }
      }

      try {
        const payload = await pollStructure<StructurePayload>(
          info.kind,
          info.job,
          info.sample,
          info.token,
          {
            retry,
            signal: controller.signal,
            onProgress: (p) => setProgress((prev) => ({ ...prev, ...p })),
          },
        );
        if (controller.signal.aborted) return;
        setData(payload);
        try {
          sessionStorage.setItem(
            'prgminer_structure_view',
            JSON.stringify({
              job: info.job,
              sample: info.sample,
              kind: info.kind,
              data: payload,
            }),
          );
        } catch {
          // Ignore storage quota
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Structure prediction unavailable.');
        }
      } finally {
        if (abortRef.current === controller) {
          setBusy(false);
        }
      }
    },
    [info],
  );

  useEffect(() => {
    if (!info.job || !info.token || !info.sample) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const cached = JSON.parse(sessionStorage.getItem('prgminer_structure_view') || 'null');
        if (
          cached?.job === info.job &&
          cached?.sample === info.sample &&
          cached?.kind === info.kind &&
          cached?.data
        ) {
          setData(cached.data as StructurePayload);
          return;
        }
      } catch {
        // Fallback to API fetch
      }
      void loadStructure(false);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [info, loadStructure]);

  const backHref =
    withBasePath('/results') +
    '#' +
    new URLSearchParams({ job: info.job, token: info.token, phase: info.phase }).toString();

  const switchToSecondary = () => {
    const frag = new URLSearchParams({
      job: info.job,
      token: info.token,
      sample: info.sample,
      kind: 'secondary',
      phase: info.phase,
    });
    window.location.hash = frag.toString();
  };

  const activeMethod =
    data?.method || progress.method || (info.kind === 'secondary' ? 'S4PRED' : 'ESMFold');

  const isUnsupportedLength =
    info.kind === 'tertiary' && data?.status === 'unsupported_length';

  return (
    <div className="space-y-6 py-5 sm:py-8">
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <a href={backHref} className="btn-ghost-rule mb-3 text-xs !py-1.5 !px-3">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Results Dossier</span>
          </a>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--tomato)]">
            {info.kind === 'secondary' ? 'S4PRED Secondary Topology' : '3D Molecular Coordinates'}
          </p>
          <h1 className="mt-1 break-all font-display text-2xl font-semibold text-[var(--navy)] sm:text-3xl">
            {info.sample || 'R-gene protein structure'}
          </h1>
          {data && !isUnsupportedLength && data.method ? (
            <p className="mt-1 font-mono text-xs font-semibold text-[var(--steel)]">
              Predicted via {data.method}
              {data.sequenceLength || data.sequence?.length
                ? ` · ${(data.sequenceLength || data.sequence.length).toLocaleString()} aa`
                : ''}
            </p>
          ) : null}
        </div>

        {data && info.kind === 'secondary' ? (
          <button
            type="button"
            className="btn-navy text-xs !py-2 !px-3.5"
            onClick={() => {
              const blob = new Blob(
                [
                  `>${data.sampleId}\nAA:   ${data.amino_acids}\nPred: ${data.prediction}\nConf: ${data.confidence}\n`,
                ],
                { type: 'text/plain;charset=utf-8' },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${data.sampleId}_s4pred.txt`;
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Download S4PRED (.txt)</span>
          </button>
        ) : null}
      </header>

      {!data && !error ? (
        <div
          role="status"
          aria-live="polite"
          className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-[var(--surface)] p-8 sm:p-10"
        >
          <div className="mx-auto max-w-2xl space-y-3.5 text-center">
            <Loader2
              className="mx-auto h-7 w-7 animate-spin text-[var(--tomato)]"
              aria-hidden="true"
            />
            <div className="inline-flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--navy)]">
              <span>Engine: {activeMethod}</span>
              {progress.sequenceLength ? <span>· {progress.sequenceLength} aa</span> : null}
              <span className="inline-flex items-center gap-1 text-[var(--tomato)]">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{formatElapsed(elapsedSec)}</span>
              </span>
            </div>
            <p className="font-display text-lg font-semibold text-[var(--navy)]">
              {progress.message ||
                (info.kind === 'secondary'
                  ? 'Computing S4PRED single-sequence secondary structure…'
                  : 'Predicting 3D atomic coordinates with ESMFold…')}
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="space-y-3 border border-[var(--tomato-border)] border-l-4 border-l-[var(--danger)] bg-[var(--danger-soft)] p-5"
        >
          <div className="flex items-start gap-2.5 text-sm font-semibold text-[var(--danger)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            disabled={busy || !info.job}
            onClick={() => void loadStructure(true)}
            className="btn-outline-sharp text-xs !py-1.5 !px-3"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Retry Structure Prediction</span>
          </button>
        </div>
      ) : null}

      {isUnsupportedLength && data ? (
        <section
          aria-labelledby="large-protein-notice-heading"
          className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-6 py-3.5">
            <div className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider text-[var(--navy)]">
              <Info className="h-4 w-4 text-[var(--tomato)]" aria-hidden="true" />
              <span>Sequence Length Notice · Direct 3D Folding Limit</span>
            </div>
            <span className="rounded-[2px] border border-[var(--line-strong)] bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--navy)]">
              {(data.sequenceLength || data.sequence.length).toLocaleString()} aa &gt;{' '}
              {data.maxResidues || 400} aa limit
            </span>
          </div>

          <div className="space-y-5 p-6 sm:p-7">
            <div className="space-y-2">
              <h2
                id="large-protein-notice-heading"
                className="font-display text-xl font-semibold text-[var(--navy)]"
              >
                In-browser 3D folding is available for proteins up to {data.maxResidues || 400}{' '}
                amino acids
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
                <strong className="font-mono text-[var(--ink)]">{data.sampleId}</strong> contains{' '}
                <strong className="font-mono text-[var(--ink)]">
                  {(data.sequenceLength || data.sequence.length).toLocaleString()} amino acids
                </strong>
                . PRGminer performs rapid, single-sequence 3D folding via <strong>ESMFold</strong>,
                which supports compact immune receptors and standalone domains up to{' '}
                <strong>{data.maxResidues || 400} residues</strong> (such as standalone{' '}
                <code className="font-mono text-[var(--ink)]">TIR</code> sensors, cytoplasmic{' '}
                <code className="font-mono text-[var(--ink)]">KIN</code> decoys, or excised NB-ARC /
                kinase domains). Full-length multi-domain plant R-genes (
                <code className="font-mono text-[var(--ink)]">CNL</code>,{' '}
                <code className="font-mono text-[var(--ink)]">TNL</code>,{' '}
                <code className="font-mono text-[var(--ink)]">RLK</code>,{' '}
                <code className="font-mono text-[var(--ink)]">RLP</code>,{' '}
                <code className="font-mono text-[var(--ink)]">LECRK</code>,{' '}
                <code className="font-mono text-[var(--ink)]">LYK</code>) exceed this single-chain
                web folding limit.
              </p>
            </div>

            {/* Recommended Actions */}
            <div className="grid gap-4 border-t border-[var(--line)] pt-5 md:grid-cols-2">
              <div className="space-y-3 border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-[var(--tomato)]">
                  01 · Built-In Full-Length 2D Topology
                </p>
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  Inspect per-residue α-helix (<code className="font-mono">H</code>), β-strand (
                  <code className="font-mono">E</code>), and coil (
                  <code className="font-mono">C</code>) secondary structure across all{' '}
                  {(data.sequenceLength || data.sequence.length).toLocaleString()} residues locally
                  with <strong>S4PRED</strong> (no sequence length cap).
                </p>
                <button
                  type="button"
                  onClick={switchToSecondary}
                  className="btn-tomato text-xs !py-2 !px-3.5"
                >
                  <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Inspect 2D Secondary Structure (S4PRED)</span>
                </button>
              </div>

              <div className="space-y-3 border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-[var(--navy)]">
                  02 · Full-Length 3D Modeling Suites
                </p>
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  Copy this protein&apos;s FASTA sequence and submit it to dedicated multi-domain
                  folding servers for full-length NLR / receptor-kinase 3D coordinates:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {data.sequence ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const wrapped = data.sequence.match(/.{1,70}/g)?.join('\n') || data.sequence;
                        await navigator.clipboard.writeText(`>${data.sampleId}\n${wrapped}\n`);
                        setCopiedFasta(true);
                        setTimeout(() => setCopiedFasta(false), 2000);
                      }}
                      className="btn-navy text-xs !py-2 !px-3"
                    >
                      {copiedFasta ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[var(--tomato)]" aria-hidden="true" />
                          <span>Copied FASTA</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy FASTA</span>
                        </>
                      )}
                    </button>
                  ) : null}

                  <a
                    href="https://alphafoldserver.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-sharp text-xs !py-2 !px-3"
                  >
                    <span>AlphaFold Server</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>

                  <a
                    href="https://swissmodel.expasy.org/interactive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-sharp text-xs !py-2 !px-3"
                  >
                    <span>SWISS-MODEL</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {data && !isUnsupportedLength ? (
        info.kind === 'secondary' ? (
          <SecondaryStructureViewer data={data} />
        ) : (
          <StructureViewer pdb={data.pdb} sequence={data.sequence} sampleId={data.sampleId} />
        )
      ) : null}
    </div>
  );
}
