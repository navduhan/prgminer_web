'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DomainSchematic from '@/components/DomainSchematic';
import { RGENE_CLASS_MAP } from '@/data/rgene-classes';
import { withBasePath } from '@/lib/base-path';
import { buildJobBookmark, expiresAt, readJobBookmark } from '@/lib/job-bookmark';

type Row = Record<string, string | number>;
type JobPayload = {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  level: 'Phase1' | 'Phase2';
  sequenceCount: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  results?: Record<string, Row[]>;
  sequences?: Record<string, string>;
  structures?: Record<string, { secondary: string; tertiary: string }>;
  error?: string;
};

const PHASE2_CLASSES = ['CNL', 'KIN', 'LYK', 'LECRK', 'RLK', 'RLP', 'TIR', 'TNL'] as const;

function saveBlob(content: string, filename: string, mime = 'text/tab-separated-values;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toDelimited(rows: Row[], sep: '\t' | ','): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escapeCell = (val: string | number | undefined) => {
    const raw = String(val ?? '');
    if (sep === ',' && /[",\n]/.test(raw)) {
      return `"${raw.replaceAll('"', '""')}"`;
    }
    return raw;
  };
  return [
    headers.join(sep),
    ...rows.map((r) => headers.map((h) => escapeCell(r[h])).join(sep)),
  ].join('\n');
}

function topProbabilityRanks(row: Row, numericCols: string[]): Record<string, 1 | 2 | 3> {
  const scored = numericCols
    .map((col) => ({ col, val: Number(row[col]) }))
    .filter((x) => Number.isFinite(x.val) && x.val > 0)
    .sort((a, b) => b.val - a.val);

  const out: Record<string, 1 | 2 | 3> = {};
  if (scored[0]) out[scored[0].col] = 1;
  if (scored[1]) out[scored[1].col] = 2;
  if (scored[2]) out[scored[2].col] = 3;
  return out;
}

export default function ResultsPage() {
  const router = useRouter();
  const [bookmark, setBookmark] = useState<{ jobId: string; jobToken: string } | null>(null);
  const [job, setJob] = useState<JobPayload | null>(null);
  const [error, setError] = useState('');
  const [activePhase, setActivePhase] = useState<'Phase2' | 'Phase1'>('Phase2');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedModalFasta, setCopiedModalFasta] = useState(false);
  const [liveStructures, setLiveStructures] = useState<
    Record<string, { secondary: string; tertiary: string }>
  >({});

  // Native <dialog> modal for viewing FASTA + domain schematic of a sequence
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [inspectedSeq, setInspectedSeq] = useState<{
    id: string;
    prediction: string;
    fasta: string;
  } | null>(null);

  useEffect(() => {
    const syncFromHash = () => {
      const parsed = readJobBookmark();
      if (!parsed) {
        setError(
          'No private job token was found in this URL. Submit a prediction job or open your saved bookmark link.',
        );
        return;
      }
      setError('');
      setBookmark(parsed);
      const frag = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      if (frag.get('phase') === 'Phase1') setActivePhase('Phase1');
    };
    const timer = window.setTimeout(syncFromHash, 0);
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  // Light-dismiss fallback for <dialog closedby="any"> on browsers lacking native closedBy
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) dialog.close();
    };
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  const fetchJob = useCallback(async (bm: { jobId: string; jobToken: string }) => {
    const res = await fetch(
      withBasePath(`/api/predict?jobId=${encodeURIComponent(bm.jobId)}&fasta=1`),
      {
        headers: { 'X-PRGminer-Job-Token': bm.jobToken },
        cache: 'no-store',
      },
    );
    const data = (await res.json()) as JobPayload & { error?: string };
    if (!res.ok) {
      throw new Error(data.error || 'Prediction job was not found.');
    }
    setJob(data);
    if (data.status === 'completed') {
      const hasP2 = Boolean(data.results?.['Phase2_predictions.tsv']?.length);
      setActivePhase(hasP2 && data.level === 'Phase2' ? 'Phase2' : 'Phase1');
    }
    return data.status;
  }, []);

  useEffect(() => {
    if (!bookmark) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const status = await fetchJob(bookmark);
        if (!cancelled && (status === 'queued' || status === 'running')) {
          timer = setTimeout(() => void poll(), 2500);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load job results.');
        }
      }
    };
    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [bookmark, fetchJob]);

  const phase1Rows = useMemo(
    () => job?.results?.['Phase1_predictions.tsv'] || job?.results?.['prgminer_predictions.tsv'] || [],
    [job],
  );
  const phase2Rows = useMemo(() => job?.results?.['Phase2_predictions.tsv'] || [], [job]);
  const hasPhase2 = phase2Rows.length > 0;

  const currentRows = activePhase === 'Phase2' && hasPhase2 ? phase2Rows : phase1Rows;
  const columns = useMemo(() => (currentRows[0] ? Object.keys(currentRows[0]) : []), [currentRows]);
  const probabilityCols = useMemo(
    () => columns.filter((c) => c !== 'SampleID' && c !== 'Prediction'),
    [columns],
  );

  // Summary ledger counts
  const rGeneCount = useMemo(
    () => phase1Rows.filter((r) => String(r.Prediction) === 'Rgene').length,
    [phase1Rows],
  );
  const nonRGeneCount = Math.max(0, phase1Rows.length - rGeneCount);

  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of currentRows) {
      const cls = String(row.Prediction || 'Unknown');
      counts[cls] = (counts[cls] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [currentRows]);

  const filteredRows = useMemo(() => {
    return currentRows.filter((row) => {
      const pred = String(row.Prediction || '');
      const id = String(row.SampleID || '');
      if (classFilter !== 'ALL' && pred !== classFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return id.toLowerCase().includes(q) || pred.toLowerCase().includes(q);
      }
      return true;
    });
  }, [currentRows, classFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = useMemo(
    () => filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredRows, safePage, pageSize],
  );

  const exportClassFasta = (targetClass: string) => {
    const seqMap = job?.sequences || {};
    const sourceRows =
      targetClass === 'ALL_RGENES'
        ? hasPhase2
          ? phase2Rows
          : phase1Rows.filter((r) => String(r.Prediction) === 'Rgene')
        : currentRows.filter((r) => String(r.Prediction) === targetClass);

    const lines = sourceRows
      .map((r) => {
        const id = String(r.SampleID || '');
        const pred = String(r.Prediction || '');
        const seq = seqMap[id];
        return seq ? `>${id}|PRGminer:${pred}\n${seq}` : '';
      })
      .filter(Boolean);

    if (!lines.length) return;
    saveBlob(
      lines.join('\n') + '\n',
      `${job?.jobId || 'prgminer'}_${targetClass}.fasta`,
      'text/plain;charset=utf-8',
    );
  };

  useEffect(() => {
    if (!bookmark || job?.status !== 'completed') return;
    let cancelled = false;
    const refreshStructures = async () => {
      try {
        const res = await fetch(
          withBasePath(`/api/structure/status?jobId=${encodeURIComponent(bookmark.jobId)}`),
          {
            headers: { 'X-PRGminer-Job-Token': bookmark.jobToken },
            cache: 'no-store',
          },
        );
        if (res.ok && !cancelled) {
          setLiveStructures(
            (await res.json()) as Record<string, { secondary: string; tertiary: string }>,
          );
        }
      } catch {
        // Keep last known structure states
      }
    };
    void refreshStructures();
    const timer = window.setInterval(() => void refreshStructures(), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [bookmark, job?.status]);

  const openStructure = (kind: 'secondary' | 'tertiary', sampleId: string) => {
    if (!bookmark) return;
    const frag = new URLSearchParams({
      job: bookmark.jobId,
      token: bookmark.jobToken,
      sample: sampleId,
      kind,
      phase: activePhase,
    });
    router.push(`/structure#${frag.toString()}`);
  };

  const openSequenceModal = (row: Row) => {
    const id = String(row.SampleID || '');
    const pred = String(row.Prediction || '');
    const seq = job?.sequences?.[id] || '';
    setCopiedModalFasta(false);
    setInspectedSeq({
      id,
      prediction: pred,
      fasta: seq
        ? `>${id} | PRGminer:${pred}\n${seq.match(/.{1,70}/g)?.join('\n') || seq}`
        : 'Sequence unavailable.',
    });
    dialogRef.current?.showModal();
  };

  if (error && !job) {
    return (
      <div className="py-10">
        <div className="mx-auto max-w-2xl space-y-4 border border-[var(--line)] border-t-2 border-t-[var(--tomato)] bg-white p-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--tomato)]">
            Results Lookup
          </p>
          <h1 className="font-display text-2xl font-semibold text-[var(--navy)]">
            Unable to open prediction results
          </h1>
          <p className="text-sm text-[var(--muted)]">{error}</p>
          <Link href="/prediction" className="btn-navy mt-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Return to Prediction Workbench</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!job || job.status === 'queued' || job.status === 'running') {
    return (
      <div className="py-10">
        <div
          role="status"
          aria-live="polite"
          className="mx-auto max-w-2xl space-y-4 border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-[var(--surface)] p-8 text-center"
        >
          <Loader2
            className="mx-auto h-7 w-7 animate-spin text-[var(--tomato)]"
            aria-hidden="true"
          />
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--navy)]">
            PRGminer Analysis in Progress
          </p>
          <h1 className="font-display text-2xl font-semibold text-[var(--navy)]">
            {job?.message || 'Loading your PRGminer prediction job…'}
          </h1>
          {job?.jobId ? (
            <p className="font-mono text-xs text-[var(--muted)]">Job ID: {job.jobId}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (job.status === 'failed') {
    return (
      <div className="py-10">
        <div
          role="alert"
          className="mx-auto max-w-2xl space-y-4 border border-[var(--line)] border-t-2 border-t-[var(--danger)] bg-white p-8"
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--danger)]">
            Prediction Job Failed
          </p>
          <h1 className="font-display text-2xl font-semibold text-[var(--navy)]">{job.message}</h1>
          <p className="rounded-[2px] border border-[var(--tomato-border)] bg-[var(--danger-soft)] p-4 font-mono text-xs text-[var(--danger)]">
            {job.error || 'Unknown execution error.'}
          </p>
          <Link href="/prediction" className="btn-tomato">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Start New Prediction</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-5 sm:py-8">
      {/* Flat Header Bar */}
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--tomato)]">
            PRGminer Screening Dossier
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-[var(--navy)] sm:text-3xl">
            Plant R-gene prediction &amp; architectural results
          </h1>
          <p className="mt-1.5 font-mono text-xs text-[var(--muted)]">
            Job {job.jobId} · Retained until {expiresAt(job.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {bookmark ? (
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(buildJobBookmark(bookmark));
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="btn-outline-sharp text-xs !py-2 !px-3.5"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--tomato)]" aria-hidden="true" />
                  <span>Copied Bookmark URL</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy Private Bookmark</span>
                </>
              )}
            </button>
          ) : null}
          <Link href="/prediction" className="btn-tomato text-xs !py-2 !px-3.5">
            <span>New Prediction</span>
          </Link>
        </div>
      </header>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-[var(--tomato-border)] border-l-4 border-l-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* 4-Column Architectural Metric Ledger */}
      <section className="grid sm:grid-cols-4 border border-[var(--line)] border-t-2 border-t-[var(--navy)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)] bg-white">
        <div className="p-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Proteins Screened
          </p>
          <p className="mt-1.5 font-mono text-3xl font-bold tabular-nums text-[var(--ink)]">
            {phase1Rows.length.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Phase I DPC CNN input</p>
        </div>

        <div className="p-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--tomato)]">
            Candidate R-Genes
          </p>
          <p className="mt-1.5 font-mono text-3xl font-bold tabular-nums text-[var(--tomato)]">
            {rGeneCount.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {phase1Rows.length ? ((rGeneCount / phase1Rows.length) * 100).toFixed(1) : '0.0'}% of
            screened input
          </p>
        </div>

        <div className="p-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Non-R-Genes Filtered
          </p>
          <p className="mt-1.5 font-mono text-3xl font-bold tabular-nums text-[var(--ink)]">
            {nonRGeneCount.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Background proteome</p>
        </div>

        <div className="p-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
            Dominant Family
          </p>
          <p className="mt-1.5 font-mono text-2xl font-extrabold text-[var(--navy)]">
            {classCounts[0]?.[0] || '—'}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {classCounts[0] ? `${classCounts[0][1]} sequence(s) in active view` : 'No predictions'}
          </p>
        </div>
      </section>

      {/* Flat Family Filter & .fasta Subset Export Bar */}
      <section className="border border-[var(--line)] bg-[var(--surface)] p-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
              Family Filter &amp; Subset FASTA Export
            </h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Click a family code to filter rows, or click its download icon to export{' '}
              <code className="font-mono text-[var(--ink)]">&lt;Class&gt;.fasta</code>.
            </p>
          </div>

          {rGeneCount > 0 && job.sequences ? (
            <button
              type="button"
              onClick={() => exportClassFasta('ALL_RGENES')}
              className="btn-navy text-xs !py-2 !px-3.5"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Download All R-Genes (.fasta)</span>
            </button>
          ) : null}
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={classFilter === 'ALL'}
            onClick={() => {
              setClassFilter('ALL');
              setPage(1);
            }}
            className={`rounded-[2px] border px-3 py-1.5 font-mono text-xs font-bold transition ${
              classFilter === 'ALL'
                ? 'border-[var(--navy)] bg-[var(--navy)] text-white'
                : 'border-[var(--line-strong)] bg-white text-[var(--ink)] hover:border-[var(--navy)]'
            }`}
          >
            All ({currentRows.length})
          </button>

          {classCounts.map(([cls, count]) => {
            const active = classFilter === cls;
            return (
              <div
                key={cls}
                className={`inline-flex items-stretch overflow-hidden rounded-[2px] border bg-white ${
                  active ? 'border-[var(--tomato)]' : 'border-[var(--line-strong)]'
                }`}
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setClassFilter(active ? 'ALL' : cls);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 font-mono text-xs font-bold transition ${
                    active
                      ? 'bg-[var(--tomato)] text-white'
                      : 'text-[var(--navy)] hover:bg-[var(--navy-soft)]'
                  }`}
                >
                  {cls} ({count})
                </button>
                {job.sequences ? (
                  <button
                    type="button"
                    title={`Download ${cls}.fasta`}
                    aria-label={`Download ${cls}.fasta`}
                    onClick={() => exportClassFasta(cls)}
                    className="flex items-center justify-center border-l border-[var(--line)] px-2 text-[var(--muted)] transition hover:bg-[var(--tomato-soft)] hover:text-[var(--tomato)]"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Sharp Bordered Results Table Container */}
      <section className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white">
        {/* Phase Tablist */}
        <div
          className="prg-tablist bg-[var(--surface)] px-4 sm:px-6"
          role="tablist"
          aria-label="Prediction phases"
        >
          {hasPhase2 ? (
            <button
              id="results-tab-phase2"
              type="button"
              role="tab"
              aria-selected={activePhase === 'Phase2'}
              onClick={() => {
                setActivePhase('Phase2');
                setClassFilter('ALL');
                setPage(1);
              }}
              className="prg-tab"
            >
              <span>Phase II · 8-Class Families ({phase2Rows.length})</span>
            </button>
          ) : null}

          <button
            id="results-tab-phase1"
            type="button"
            role="tab"
            aria-selected={activePhase === 'Phase1' || !hasPhase2}
            onClick={() => {
              setActivePhase('Phase1');
              setClassFilter('ALL');
              setPage(1);
            }}
            className="prg-tab"
          >
            <span>Phase I · Binary Screen ({phase1Rows.length})</span>
          </button>
        </div>

        <div
          role="tabpanel"
          aria-labelledby={
            activePhase === 'Phase2' && hasPhase2 ? 'results-tab-phase2' : 'results-tab-phase1'
          }
        >
          {/* Search, Probability Rank Key & Export Toolbar */}
          <div className="flex flex-col gap-3.5 border-b border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <search className="w-full sm:max-w-xs">
              <label htmlFor="results-search-box" className="sr-only">
                Filter results by sequence ID or predicted class
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
                  aria-hidden="true"
                />
                <input
                  id="results-search-box"
                  name="q"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Search sequence ID or class…"
                  className="w-full rounded-[3px] border border-[var(--field-border)] bg-white py-2 pl-9 pr-3 text-sm text-[var(--ink)]"
                />
              </div>
            </search>

            <div className="flex flex-wrap items-center gap-2">
              {/* Probability Rank Key */}
              <div className="mr-1.5 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[var(--muted)]">
                <span>Probability Rank:</span>
                <span className="inline-flex items-center">
                  <span className="prob-rank-badge bg-[#d93829]" aria-hidden="true">
                    1
                  </span>
                  <span className="text-[var(--ink)]">1st</span>
                </span>
                <span className="inline-flex items-center">
                  <span className="prob-rank-badge bg-[#0f2744]" aria-hidden="true">
                    2
                  </span>
                  <span className="text-[var(--ink)]">2nd</span>
                </span>
                <span className="inline-flex items-center">
                  <span className="prob-rank-badge bg-[#4e6e88]" aria-hidden="true">
                    3
                  </span>
                  <span className="text-[var(--ink)]">3rd</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  saveBlob(toDelimited(filteredRows, '\t'), `${job.jobId}_${activePhase}.tsv`)
                }
                className="btn-ghost-rule text-xs !py-1.5 !px-2.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                <span>TSV</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  saveBlob(
                    toDelimited(filteredRows, ','),
                    `${job.jobId}_${activePhase}.csv`,
                    'text/csv;charset=utf-8',
                  )
                }
                className="btn-ghost-rule text-xs !py-1.5 !px-2.5"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  saveBlob(
                    JSON.stringify(filteredRows, null, 2),
                    `${job.jobId}_${activePhase}.json`,
                    'application/json',
                  )
                }
                className="btn-ghost-rule text-xs !py-1.5 !px-2.5"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Responsive Sticky Data Table */}
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="prgminer-results-caption"
            className="prg-table-region"
          >
            <table className="prg-table prg-table-responsive text-left text-sm">
              <caption id="prgminer-results-caption" className="sr-only">
                {activePhase} R-gene prediction probabilities and structure actions
              </caption>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="border-b border-[var(--line)] px-4 py-3 font-mono text-[11px] font-extrabold uppercase tracking-wider text-[var(--navy)]"
                    >
                      {col === 'SampleID' ? 'Sequence ID' : col}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="border-b border-[var(--line)] px-4 py-3 font-mono text-[11px] font-extrabold uppercase tracking-wider text-[var(--navy)]"
                  >
                    Specimen &amp; Structure
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {pagedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-8 text-center text-xs text-[var(--muted)]"
                    >
                      No sequences match the active search or family filter.
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row, idx) => {
                    const sampleId = String(row.SampleID ?? `row_${idx}`);
                    const pred = String(row.Prediction ?? '');
                    const ranks = topProbabilityRanks(row, probabilityCols);
                    const structState = liveStructures[sampleId] || job.structures?.[sampleId];
                    const seqLength = job.sequences?.[sampleId]?.replace(/X/g, '').length ?? 0;
                    const exceeds3DLimit =
                      seqLength > 400 || structState?.tertiary === 'unsupported';

                    return (
                      <tr key={sampleId}>
                        {columns.map((col) => {
                          if (col === 'SampleID') {
                            return (
                              <th
                                key={col}
                                scope="row"
                                className="max-w-60 break-all border-b border-[var(--line)] px-4 py-3 font-mono text-xs font-bold text-[var(--navy)]"
                              >
                                {sampleId}
                              </th>
                            );
                          }
                          if (col === 'Prediction') {
                            const isPositive = pred !== 'Non-Rgene';
                            return (
                              <td
                                key={col}
                                data-label="Prediction"
                                className="whitespace-nowrap border-b border-[var(--line)] px-4 py-3"
                              >
                                <span
                                  className={`inline-flex items-center rounded-[2px] border px-2 py-0.5 font-mono text-xs font-extrabold ${
                                    isPositive
                                      ? 'border-[var(--tomato-border)] bg-[var(--tomato-soft)] text-[var(--tomato-dark)]'
                                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]'
                                  }`}
                                >
                                  {pred}
                                </span>
                              </td>
                            );
                          }
                          const rank = ranks[col];
                          const num = Number(row[col]);
                          const formatted = Number.isFinite(num)
                            ? `${num.toFixed(2)}%`
                            : String(row[col] ?? '');
                          return (
                            <td
                              key={col}
                              data-label={col}
                              className={`whitespace-nowrap border-b border-[var(--line)] px-3.5 py-3 font-mono text-xs font-semibold tabular-nums ${
                                rank ? `prob-rank prob-rank-${rank}` : 'text-[var(--muted)]'
                              }`}
                            >
                              {rank ? (
                                <span className="prob-rank-badge" aria-label={`Rank ${rank}`}>
                                  {rank}
                                </span>
                              ) : null}
                              <span>{formatted}</span>
                            </td>
                          );
                        })}

                        <td
                          data-label="Actions"
                          className="whitespace-nowrap border-b border-[var(--line)] px-4 py-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openSequenceModal(row)}
                              className="inline-flex items-center gap-1 rounded-[2px] border border-[var(--line-strong)] bg-white px-2 py-1 font-bold text-[var(--navy)] transition hover:border-[var(--navy)] hover:bg-[var(--navy-soft)]"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>FASTA</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openStructure('secondary', sampleId)}
                              className="rounded-[2px] border border-[var(--tomato-border)] bg-[var(--tomato-soft)] px-2 py-1 font-bold text-[var(--tomato-dark)] transition hover:border-[var(--tomato)]"
                            >
                              {structState?.secondary === 'ready'
                                ? 'View 2D'
                                : structState?.secondary === 'running'
                                  ? '2D Running…'
                                  : 'Predict 2D'}
                            </button>

                            <button
                              type="button"
                              title={
                                exceeds3DLimit
                                  ? `${seqLength ? `${seqLength} aa — ` : ''}Direct ESMFold 3D folding is limited to ≤400 aa. Click for full-length modeling options.`
                                  : 'Predict or view 3D coordinates via ESMFold (≤400 aa)'
                              }
                              onClick={() => openStructure('tertiary', sampleId)}
                              className={`rounded-[2px] border px-2 py-1 font-bold transition ${
                                exceeds3DLimit
                                  ? 'border-[var(--line-strong)] bg-white text-[var(--steel)] hover:border-[var(--navy)] hover:text-[var(--navy)]'
                                  : 'border-[var(--navy)] bg-[var(--navy-soft)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white'
                              }`}
                            >
                              {exceeds3DLimit
                                ? '3D (>400 aa)'
                                : structState?.tertiary === 'ready'
                                  ? 'View 3D'
                                  : structState?.tertiary === 'running'
                                    ? '3D Running…'
                                    : 'Predict 3D'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-xs text-[var(--muted)] sm:px-6">
            <div>
              Showing{' '}
              <strong className="font-mono text-[var(--ink)]">
                {filteredRows.length ? (safePage - 1) * pageSize + 1 : 0}–
                {Math.min(safePage * pageSize, filteredRows.length)}
              </strong>{' '}
              of <strong className="font-mono text-[var(--ink)]">{filteredRows.length}</strong>{' '}
              sequences
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="rows-per-page" className="font-semibold text-[var(--ink)]">
                Rows:
              </label>
              <select
                id="rows-per-page"
                name="pageSize"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-[2px] border border-[var(--field-border)] bg-white px-2 py-1 text-xs font-semibold text-[var(--ink)]"
              >
                {[15, 30, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-ghost-rule !py-1 !px-2.5 text-xs"
              >
                Prev
              </button>
              <span className="font-mono font-semibold tabular-nums text-[var(--ink)]">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn-ghost-rule !py-1 !px-2.5 text-xs"
              >
                Next
              </button>
            </div>
          </div>

          {/* Phase II 8-Class Key */}
          {activePhase === 'Phase2' && hasPhase2 ? (
            <div className="border-t border-[var(--line)] bg-white px-4 py-4 sm:px-6">
              <p className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-[var(--navy)]">
                Phase II 8-Class Architectural Key
              </p>
              <dl className="mt-2.5 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {PHASE2_CLASSES.map((code) => {
                  const info = RGENE_CLASS_MAP[code];
                  return (
                    <div key={code} className="flex items-baseline gap-2">
                      <dt className="font-mono font-extrabold text-[var(--tomato)]">{code}</dt>
                      <dd className="truncate text-[var(--muted)]">{info?.name || code}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ) : null}
        </div>
      </section>

      {/* Native Modal Dialog for Sequence FASTA & DomainSchematic */}
      <dialog
        ref={dialogRef}
        {...({ closedby: 'any' } as Record<string, string>)}
        aria-labelledby="seq-dialog-title"
        className="m-auto w-full max-w-2xl rounded-[3px] border border-[var(--line)] border-t-[3px] border-t-[var(--navy)] bg-white p-0 text-[var(--ink)] shadow-xl"
      >
        {inspectedSeq ? (
          <div>
            <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] bg-[var(--surface)] px-6 py-4">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--tomato)]">
                  Sequence Specimen · {inspectedSeq.prediction}
                </p>
                <h1
                  id="seq-dialog-title"
                  className="mt-0.5 break-all font-mono text-base font-bold text-[var(--navy)]"
                >
                  {inspectedSeq.id}
                </h1>
              </div>
              <form method="dialog">
                <button
                  type="submit"
                  autoFocus
                  className="btn-ghost-rule !py-1.5 !px-3 text-xs"
                >
                  Close
                </button>
              </form>
            </div>

            <div className="space-y-4 p-6">
              {RGENE_CLASS_MAP[inspectedSeq.prediction] ? (
                <DomainSchematic
                  domains={RGENE_CLASS_MAP[inspectedSeq.prediction].domains}
                  compartment={RGENE_CLASS_MAP[inspectedSeq.prediction].compartment}
                  compact
                />
              ) : null}

              <pre className="max-h-72 overflow-auto rounded-[2px] border border-[var(--line)] bg-[var(--navy-dark)] p-4 font-mono text-xs leading-relaxed text-slate-100">
                <code>{inspectedSeq.fasta}</code>
              </pre>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(inspectedSeq.fasta);
                    setCopiedModalFasta(true);
                    setTimeout(() => setCopiedModalFasta(false), 1800);
                  }}
                  className="btn-outline-sharp text-xs !py-2 !px-3"
                >
                  {copiedModalFasta ? (
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
                <button
                  type="button"
                  onClick={() =>
                    saveBlob(
                      inspectedSeq.fasta + '\n',
                      `${inspectedSeq.id}.fasta`,
                      'text/plain;charset=utf-8',
                    )
                  }
                  className="btn-tomato text-xs !py-2 !px-3.5"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Download .fasta</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
