'use client';

import dynamic from 'next/dynamic';
import { AlertCircle, ArrowLeft, Download, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import SecondaryStructureViewer from '@/components/SecondaryStructureViewer';
import { withBasePath } from '@/lib/base-path';

type StructurePayload = {
  sampleId: string;
  sequence: string;
  amino_acids: string;
  prediction: string;
  confidence: string;
  pdb: string;
  method: string;
};

const StructureViewer = dynamic(() => import('@/components/StructureViewer'), { ssr: false });

export default function StructurePage() {
  const [data, setData] = useState<StructurePayload | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
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

  const loadStructure = useCallback(async () => {
    if (!info.job || !info.token || !info.sample) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(withBasePath(`/api/structure/${info.kind}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PRGminer-Job-Token': info.token,
        },
        body: JSON.stringify({ jobId: info.job, sampleId: info.sample }),
      });
      const payload = (await res.json()) as StructurePayload & { error?: string };
      if (!res.ok) throw new Error(payload.error || 'Structure prediction unavailable.');
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Structure prediction unavailable.');
    } finally {
      setBusy(false);
    }
  }, [info]);

  useEffect(() => {
    if (!info.job) return;
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
      void loadStructure();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [info, loadStructure]);

  const backHref =
    withBasePath('/results') +
    '#' +
    new URLSearchParams({ job: info.job, token: info.token, phase: info.phase }).toString();

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
          {data?.method ? (
            <p className="mt-1 font-mono text-xs font-semibold text-[var(--steel)]">
              Predicted via {data.method}
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
          className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-[var(--surface)] p-10 text-center"
        >
          <Loader2
            className="mx-auto h-7 w-7 animate-spin text-[var(--tomato)]"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-[var(--muted)]">
            Computing {info.kind === 'secondary' ? 'S4PRED secondary topology' : '3D coordinates'}…
          </p>
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
            onClick={() => void loadStructure()}
            className="btn-outline-sharp text-xs !py-1.5 !px-3"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Retry Structure Prediction</span>
          </button>
        </div>
      ) : null}

      {data ? (
        info.kind === 'secondary' ? (
          <SecondaryStructureViewer data={data} />
        ) : (
          <StructureViewer pdb={data.pdb} sequence={data.sequence} sampleId={data.sampleId} />
        )
      ) : null}
    </div>
  );
}
