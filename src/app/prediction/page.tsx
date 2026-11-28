'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ClipboardPaste,
  Database,
  FileUp,
  FlaskConical,
  Info,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { DEMO_SEQUENCES, type DemoSequenceKey } from '@/data/demo-sequences';
import { RGENE_CLASSES } from '@/data/rgene-classes';
import { withBasePath } from '@/lib/base-path';
import { buildJobBookmark } from '@/lib/job-bookmark';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

const QUICK_EXAMPLES: ReadonlyArray<{ key: DemoSequenceKey; code: string }> = [
  { key: 'cnl', code: 'CNL' },
  { key: 'tnl', code: 'TNL' },
  { key: 'rlk', code: 'RLK' },
  { key: 'rlp', code: 'RLP' },
  { key: 'lecrk', code: 'LECRK' },
  { key: 'lyk', code: 'LYK' },
  { key: 'tir', code: 'TIR' },
  { key: 'kin', code: 'KIN' },
  { key: 'non_rgene', code: 'Non-Rgene' },
];

const ACCESSION_SAMPLES = {
  uniprot: 'F4HT77, Q39214',
  ncbi: 'NP_190664.1, NP_199445.1',
} as const;

function countFastaStats(text: string) {
  let sequences = 0;
  let residues = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('>')) {
      sequences += 1;
    } else {
      residues += line.replace(/\s+/g, '').replace(/\*+$/, '').length;
    }
  }
  return { sequences, residues };
}

function validateClientFasta(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return 'Provide protein FASTA sequences, upload a FASTA file, or enter accession IDs.';
  if (!trimmed.startsWith('>')) return 'FASTA input must begin with a ">" sequence header line.';
  let currentId = '';
  let currentLen = -1;
  let seqCount = 0;
  const seen = new Set<string>();

  for (const raw of trimmed.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('>')) {
      const id = line.slice(1).trim().split(/\s+/)[0] || '';
      if (!id) return 'Every FASTA header must include an identifier immediately after ">".';
      if (currentLen === 0) return `Header ">${currentId}" is missing its amino acid sequence.`;
      if (currentLen > 0 && currentLen < 10) {
        return `Sequence "${currentId}" is too short (${currentLen} aa; minimum 10 aa required).`;
      }
      if (seen.has(id)) return `Duplicate FASTA sequence ID "${id}" detected.`;
      seen.add(id);
      currentId = id;
      currentLen = 0;
      seqCount += 1;
      if (seqCount > 10_000) return 'Maximum 10,000 protein sequences per web submission.';
    } else {
      const clean = line.replace(/\s+/g, '').replace(/\*+$/, '').toUpperCase();
      if (clean && !/^[ACDEFGHIKLMNPQRSTVWYX]+$/.test(clean)) {
        return `Sequence "${currentId}" contains non-protein characters. Only the 20 standard amino acids and X are supported.`;
      }
      currentLen += clean.length;
      if (currentLen > 5_000) return `Sequence "${currentId}" exceeds the 5,000-residue limit.`;
    }
  }
  if (currentLen <= 0) return 'Each FASTA header must be followed by an amino acid sequence.';
  if (currentLen < 10) return `Sequence "${currentId}" is too short (${currentLen} aa; minimum 10 aa required).`;
  return '';
}

function PredictionWorkbenchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedExample = searchParams.get('example') as DemoSequenceKey | null;
  const initialDemo =
    requestedExample && requestedExample in DEMO_SEQUENCES
      ? DEMO_SEQUENCES[requestedExample]
      : null;

  const [inputMode, setInputMode] = useState<'paste' | 'upload' | 'accession'>('paste');
  const [fastaText, setFastaText] = useState(() => initialDemo?.fasta || '');
  const [level, setLevel] = useState<'Phase1' | 'Phase2'>(
    () => initialDemo?.recommendedLevel || 'Phase2',
  );
  const [selectedDemo, setSelectedDemo] = useState<DemoSequenceKey | ''>(
    () => initialDemo?.key || '',
  );
  const [accessionInput, setAccessionInput] = useState('');
  const [accessionDb, setAccessionDb] = useState<'uniprot' | 'ncbi'>('uniprot');
  const [fetchingAcc, setFetchingAcc] = useState(false);
  const [uploadedName, setUploadedName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [fieldError, setFieldError] = useState('');
  const [fastaEdited, setFastaEdited] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileReset, setTurnstileReset] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [activeJob, setActiveJob] = useState<{
    jobId: string;
    jobToken: string;
    status: string;
    message: string;
    bookmarkUrl: string;
  } | null>(null);
  const [copiedBookmark, setCopiedBookmark] = useState(false);

  const errorBannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutsideDialog = useRef(false);

  const openGuideModal = () => {
    const dlg = dialogRef.current;
    if (dlg && !dlg.open) dlg.showModal();
  };

  const closeGuideModal = () => {
    const dlg = dialogRef.current;
    if (dlg?.open) {
      dlg.close();
      dlg.returnValue = '';
    }
  };

  const isPointerOutsideDialog = (event: React.PointerEvent<HTMLDialogElement>) => {
    const dlg = dialogRef.current;
    if (!dlg) return false;
    const rect = dlg.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  };

  const handleDialogPointerDown = (event: React.PointerEvent<HTMLDialogElement>) => {
    if (typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype) {
      return;
    }
    pressedOutsideDialog.current = isPointerOutsideDialog(event);
  };

  const handleDialogPointerUp = (event: React.PointerEvent<HTMLDialogElement>) => {
    if (typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype) {
      return;
    }
    if (pressedOutsideDialog.current && isPointerOutsideDialog(event)) {
      closeGuideModal();
    }
    pressedOutsideDialog.current = false;
  };

  useEffect(() => {
    if (!activeJob || activeJob.status === 'completed' || activeJob.status === 'failed') return;
    let cancelled = false;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          withBasePath(`/api/predict?jobId=${encodeURIComponent(activeJob.jobId)}`),
          {
            headers: { 'X-PRGminer-Job-Token': activeJob.jobToken },
            cache: 'no-store',
          },
        );
        const data = (await res.json()) as { status?: string; message?: string; error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setActiveJob((prev) =>
            prev ? { ...prev, status: 'failed', message: data.error || 'Job polling failed.' } : null,
          );
          return;
        }
        setActiveJob((prev) =>
          prev
            ? {
                ...prev,
                status: data.status || prev.status,
                message: data.message || prev.message,
              }
            : null,
        );
        if (data.status === 'completed') {
          const fragment = new URLSearchParams({
            job: activeJob.jobId,
            token: activeJob.jobToken,
          }).toString();
          router.push(`/results#${fragment}`);
        } else if (data.status === 'failed') {
          setFieldError(data.error || 'Prediction execution failed.');
        }
      } catch {
        // Keep polling on transient hiccups
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeJob, router]);

  const stats = useMemo(() => countFastaStats(fastaText), [fastaText]);

  const applyDemo = (key: DemoSequenceKey) => {
    const demo = DEMO_SEQUENCES[key];
    setInputMode('paste');
    setSelectedDemo(key);
    setFastaText(demo.fasta);
    setLevel(demo.recommendedLevel);
    setUploadedName('');
    setFieldError('');
    setFastaEdited(false);
  };

  const handleFileLoad = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setFastaText(text);
    setUploadedName(file.name);
    setSelectedDemo('');
    setFastaEdited(true);
    const err = validateClientFasta(text);
    setFieldError(err);
  };

  const fetchAccessionsData = async (accRaw: string): Promise<string> => {
    setFetchingAcc(true);
    setFieldError('');
    try {
      const res = await fetch(withBasePath('/api/accession'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessions: accRaw, db: accessionDb }),
      });
      const data = (await res.json()) as { fasta?: string; error?: string };
      if (!res.ok || !data.fasta) {
        throw new Error(data.error || 'Unable to retrieve protein FASTA for those accessions.');
      }
      setFastaText(data.fasta);
      setSelectedDemo('');
      setUploadedName(`${accessionDb.toUpperCase()}: ${accRaw.trim()}`);
      setFastaEdited(true);
      return data.fasta;
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : 'Failed to fetch accession.');
      requestAnimationFrame(() => errorBannerRef.current?.focus());
      return '';
    } finally {
      setFetchingAcc(false);
    }
  };

  const handleFetchAccessions = async () => {
    if (!accessionInput.trim()) {
      setFieldError('Enter at least one UniProtKB or NCBI Protein accession ID.');
      requestAnimationFrame(() => errorBannerRef.current?.focus());
      return;
    }
    await fetchAccessionsData(accessionInput);
  };

  const handleReset = () => {
    setInputMode('paste');
    setFastaText('');
    setLevel('Phase2');
    setSelectedDemo('');
    setAccessionInput('');
    setUploadedName('');
    setFieldError('');
    setFastaEdited(false);
    setActiveJob(null);
    setTurnstileToken('');
    setTurnstileReset((c) => c + 1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let seqToSubmit = fastaText;
    if (!seqToSubmit.trim() && inputMode === 'accession' && accessionInput.trim()) {
      const fetched = await fetchAccessionsData(accessionInput);
      if (!fetched) return;
      seqToSubmit = fetched;
    }

    const validationErr = validateClientFasta(seqToSubmit);
    if (validationErr) {
      setFieldError(validationErr);
      requestAnimationFrame(() => errorBannerRef.current?.focus());
      return;
    }

    setSubmitting(true);
    setFieldError('');
    try {
      const res = await fetch(withBasePath('/api/predict'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence: seqToSubmit,
          level,
          turnstileToken,
        }),
      });
      const data = (await res.json()) as {
        jobId?: string;
        jobToken?: string;
        status?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.jobId || !data.jobToken) {
        throw new Error(data.error || 'Unable to submit prediction job.');
      }
      const bookmarkUrl = buildJobBookmark({ jobId: data.jobId, jobToken: data.jobToken });
      setActiveJob({
        jobId: data.jobId,
        jobToken: data.jobToken,
        status: data.status || 'queued',
        message: data.message || 'Queued for PRGminer analysis…',
        bookmarkUrl,
      });
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : 'Submission failed.');
      setTurnstileToken('');
      setTurnstileReset((c) => c + 1);
      requestAnimationFrame(() => errorBannerRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-6 pb-10">
      {/* Compact Header Row */}
      <header className="flex flex-col justify-between gap-3 border-b border-[var(--line-strong)] pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--navy)] sm:text-[1.68rem]">
            Sequence Prediction Workspace
          </h1>
          <p className="mt-1 text-[15px] text-[var(--ink-secondary)]">
            Plant resistance gene screening &amp; 8-family classification · Up to 10,000 protein
            FASTA records · 30-day private results retention
          </p>
        </div>
        <Link href="/help" className="text-sm font-bold text-[var(--tomato)] hover:underline">
          Input rules &amp; quotas →
        </Link>
      </header>

      {fieldError ? (
        <div
          id="fasta-error-banner"
          ref={errorBannerRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-[var(--tomato-border)] bg-[var(--danger-soft)] px-4 py-3.5 text-sm font-semibold text-[var(--danger)] outline-none"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{fieldError}</span>
        </div>
      ) : null}

      {activeJob ? (
        <section
          role="status"
          aria-live="polite"
          className="rounded-xl border border-[var(--line-strong)] bg-[var(--navy-soft)] px-5 py-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Loader2
                className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-[var(--tomato)]"
                aria-hidden="true"
              />
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
                  PRGminer Prediction Job · {activeJob.status.toUpperCase()}
                </p>
                <p className="mt-0.5 text-base font-bold text-[var(--ink)]">{activeJob.message}</p>
                <p className="mt-1 font-mono text-xs text-[var(--ink-secondary)]">
                  Job ID: {activeJob.jobId} · Opens automatically when complete (30-day retention)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(activeJob.bookmarkUrl);
                setCopiedBookmark(true);
                setTimeout(() => setCopiedBookmark(false), 2000);
              }}
              className="btn-outline-sharp shrink-0 py-2 px-3.5 text-sm"
            >
              {copiedBookmark ? (
                <>
                  <Check className="h-4 w-4 text-[var(--tomato)]" aria-hidden="true" />
                  <span>Copied Link</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  <span>Copy Private Link</span>
                </>
              )}
            </button>
          </div>
        </section>
      ) : null}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        method="POST"
        action={withBasePath('/api/predict')}
        noValidate
        className="grid items-start gap-7 lg:grid-cols-12"
      >
        {/* LEFT COLUMN (7 cols): 01 Sequence Input */}
        <section
          className="surface-card space-y-5 p-5 sm:p-6 lg:col-span-7"
          aria-label="Protein sequence input"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-strong)] pb-3.5">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-base font-bold text-[var(--tomato)]">01</span>
              <h2 className="font-display text-xl font-bold text-[var(--navy)]">
                Plant protein sequence input
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyDemo('panel')}
                className="btn-navy py-2 px-3.5 text-sm"
              >
                <FlaskConical className="h-4 w-4" aria-hidden="true" />
                <span>Load 9-Protein Demo</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-ghost-rule py-2 px-3 text-sm"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* 3-Option Rounded Input Method Selector (Single-Line Title & Subtitle) */}
          <div className="space-y-2">
            <span id="prg-input-mode-label" className="block text-base font-bold text-[var(--ink)]">
              Choose input method (select one):
            </span>
            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
              role="tablist"
              aria-labelledby="prg-input-mode-label"
            >
              {[
                {
                  id: 'paste' as const,
                  label: 'Paste FASTA',
                  hint: 'FASTA sequences',
                  icon: ClipboardPaste,
                },
                {
                  id: 'upload' as const,
                  label: 'Upload File',
                  hint: '.fasta, .fa, .faa',
                  icon: FileUp,
                },
                {
                  id: 'accession' as const,
                  label: 'Accession IDs',
                  hint: 'UniProt or NCBI IDs',
                  icon: Database,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const selected = inputMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setInputMode(tab.id);
                      setFieldError('');
                    }}
                    className={`flex cursor-pointer flex-col gap-1 overflow-hidden rounded-xl border p-3 text-left transition ${
                      selected
                        ? 'border-2 border-[var(--navy)] bg-[var(--navy-soft)] shadow-[0_2px_8px_rgba(15,39,68,0.08)]'
                        : 'border-[var(--line-strong)] bg-white hover:border-[var(--navy)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected
                            ? 'border-[var(--navy)] bg-[var(--navy)]'
                            : 'border-[var(--field-border)] bg-white'
                        }`}
                      >
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          selected ? 'text-[var(--tomato)]' : 'text-[var(--ink-secondary)]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="whitespace-nowrap text-[14.5px] font-bold text-[var(--navy)]">
                        {tab.label}
                      </span>
                    </span>
                    <span className="pl-5.5 whitespace-nowrap text-[13.5px] leading-5 text-[var(--ink-secondary)]">
                      {tab.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: PASTE FASTA */}
          {inputMode === 'paste' && (
            <div
              role="tabpanel"
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                void handleFileLoad(e.dataTransfer.files?.[0]);
              }}
              className="space-y-3"
            >
              {/* Quick Family Examples Bar + Class Guide Modal Trigger */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 font-mono text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
                    Examples:
                  </span>
                  {QUICK_EXAMPLES.map((item) => {
                    const active = selectedDemo === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => applyDemo(item.key)}
                        className={`cursor-pointer rounded-lg border px-2.5 py-1 font-mono text-xs font-bold transition ${
                          active
                            ? 'border-[var(--tomato)] bg-[var(--tomato)] text-white'
                            : 'border-[var(--line-strong)] bg-white text-[var(--navy)] hover:border-[var(--navy)] hover:bg-[var(--navy-soft)]'
                        }`}
                      >
                        {item.code}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={openGuideModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--navy)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--navy)] transition hover:bg-[var(--navy-soft)]"
                >
                  <Info className="h-3.5 w-3.5 text-[var(--tomato)]" aria-hidden="true" />
                  <span>Class Guide</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="protein-fasta-editor"
                  className="text-base font-bold text-[var(--navy)]"
                >
                  Protein FASTA sequences
                </label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="demo-example-select"
                    className="text-sm font-semibold text-[var(--ink-secondary)]"
                  >
                    Select by name:
                  </label>
                  <select
                    id="demo-example-select"
                    name="demoExample"
                    value={selectedDemo}
                    onChange={(e) => {
                      const val = e.target.value as DemoSequenceKey | '';
                      if (val) applyDemo(val);
                    }}
                    className="prg-field !w-auto max-w-[260px] !py-1.5 !px-3 text-sm font-semibold"
                  >
                    <option value="">Choose example…</option>
                    {Object.values(DEMO_SEQUENCES).map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="protein-fasta-editor"
                  name="sequence"
                  required
                  rows={14}
                  value={fastaText}
                  aria-invalid={fieldError ? 'true' : 'false'}
                  aria-describedby={
                    fieldError ? 'fasta-editor-hint fasta-error-banner' : 'fasta-editor-hint'
                  }
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={(e) => {
                    setFastaText(e.target.value);
                    setFastaEdited(true);
                    if (fieldError) setFieldError('');
                  }}
                  onBlur={() => {
                    if (fastaEdited && fastaText.trim()) {
                      setFieldError(validateClientFasta(fastaText));
                    }
                  }}
                  placeholder={
                    '>AT3G50950.1|ZAR1 CC-NBS-LRR disease resistance protein\nMVDAVVTVFLEKTLNILEEKG...\n>AT5G46330.1|FLS2 LRR receptor-like serine/threonine-protein kinase\nMKLLSKTTLVLLFLTIL...'
                  }
                  className={`prg-field resize-y font-mono text-sm leading-6 ${
                    fieldError ? '!border-[var(--danger)]' : ''
                  }`}
                />
                {dragActive && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl border-2 border-dashed border-[var(--tomato)] bg-[var(--tomato-soft)]/95 text-base font-bold text-[var(--navy)]">
                    Drop FASTA file to load sequences
                  </div>
                )}
              </div>

              <div
                id="fasta-editor-hint"
                className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--ink-secondary)]"
              >
                <span className="font-mono">
                  <strong className="font-bold text-[var(--navy)]">
                    {stats.sequences.toLocaleString()}
                  </strong>{' '}
                  {stats.sequences === 1 ? 'sequence' : 'sequences'} ·{' '}
                  <strong className="font-bold text-[var(--navy)]">
                    {stats.residues.toLocaleString()}
                  </strong>{' '}
                  aa
                </span>
                <span className="font-mono text-xs font-bold text-[var(--navy)] sm:text-sm">
                  10–5,000 aa/seq · 20 standard AAs + X
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {inputMode === 'upload' && (
            <div
              role="tabpanel"
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                void handleFileLoad(e.dataTransfer.files?.[0]);
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="fasta-file-upload"
                  className="block text-base font-bold text-[var(--navy)]"
                >
                  Upload protein FASTA file
                </label>
                <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                  Supported formats: <code>.fasta</code>, <code>.fa</code>, <code>.faa</code>, and{' '}
                  <code>.txt</code> (up to 10,000 protein sequences).
                </p>
              </div>

              <label
                htmlFor="fasta-file-upload"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-11 text-center transition ${
                  dragActive
                    ? 'border-[var(--tomato)] bg-[var(--tomato-soft)]'
                    : 'border-[var(--line-strong)] bg-[var(--surface)] hover:border-[var(--navy)] hover:bg-[var(--navy-soft)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="fasta-file-upload"
                  name="fastaFile"
                  type="file"
                  accept=".fa,.faa,.fasta,.txt"
                  onChange={(e) => void handleFileLoad(e.target.files?.[0])}
                  className="sr-only"
                />
                <Upload className="h-7 w-7 text-[var(--tomato)]" aria-hidden="true" />
                <span className="mt-3 text-base font-bold text-[var(--navy)]">
                  {uploadedName ? `Selected: ${uploadedName}` : 'Choose or drop a FASTA file'}
                </span>
                <span className="mt-1 text-sm text-[var(--ink-secondary)]">
                  Click to browse from disk (10–5,000 aa per sequence)
                </span>
              </label>

              {fastaText && (
                <div className="space-y-2 border-t border-[var(--line)] pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-bold text-[var(--navy)]">
                      <CheckCircle2 className="h-4 w-4 text-[var(--tomato)]" aria-hidden="true" />
                      <span>
                        {stats.sequences.toLocaleString()} sequence
                        {stats.sequences === 1 ? '' : 's'} loaded
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFastaText('');
                        setUploadedName('');
                      }}
                      className="font-semibold text-[var(--ink-secondary)] hover:text-[var(--navy)] hover:underline"
                    >
                      Clear file
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={fastaText}
                    onChange={(e) => setFastaText(e.target.value)}
                    aria-label="Uploaded FASTA preview"
                    spellCheck={false}
                    className="prg-field resize-y bg-[var(--surface)] font-mono text-sm leading-6"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCESSION IDs */}
          {inputMode === 'accession' && (
            <div role="tabpanel" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3">
                <fieldset className="flex flex-wrap items-center gap-5">
                  <legend className="sr-only">Source protein database</legend>
                  <span className="text-sm font-bold text-[var(--ink-secondary)]">
                    Source Database:
                  </span>
                  {(
                    [
                      ['uniprot', 'UniProtKB'],
                      ['ncbi', 'NCBI Protein'],
                    ] as const
                  ).map(([dbKey, dbLabel]) => (
                    <label
                      key={dbKey}
                      className="inline-flex cursor-pointer items-center gap-2 text-[15px] font-bold text-[var(--navy)] sm:text-base"
                    >
                      <input
                        type="radio"
                        name="accessionDb"
                        value={dbKey}
                        checked={accessionDb === dbKey}
                        onChange={() => setAccessionDb(dbKey)}
                        className="h-4.5 w-4.5 accent-[var(--tomato)]"
                      />
                      <span>{dbLabel}</span>
                    </label>
                  ))}
                </fieldset>

                <button
                  type="button"
                  onClick={() => {
                    setAccessionInput(ACCESSION_SAMPLES[accessionDb]);
                    setFieldError('');
                  }}
                  className="text-sm font-bold text-[var(--tomato)] hover:underline"
                >
                  Load sample IDs ({ACCESSION_SAMPLES[accessionDb]})
                </button>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="accession-fetch-input"
                  className="block text-base font-bold text-[var(--navy)]"
                >
                  Protein accession identifiers (up to 100)
                </label>
                <p id="prg-acc-hint" className="text-sm text-[var(--ink-secondary)]">
                  Separate multiple accessions with commas, spaces, or newlines.
                </p>
                <textarea
                  id="accession-fetch-input"
                  name="accessions"
                  rows={4}
                  value={accessionInput}
                  onChange={(e) => {
                    setAccessionInput(e.target.value);
                    setFastaText('');
                    if (fieldError) setFieldError('');
                  }}
                  aria-describedby="prg-acc-hint"
                  placeholder={ACCESSION_SAMPLES[accessionDb]}
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="prg-field resize-y font-mono text-sm leading-6"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-[var(--ink-secondary)]">
                  Fetched automatically on submit, or preview FASTA below
                </span>
                <button
                  type="button"
                  disabled={fetchingAcc}
                  onClick={() => void handleFetchAccessions()}
                  className="btn-outline-sharp py-2 px-4 text-sm"
                >
                  {fetchingAcc ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Database className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{fetchingAcc ? 'Retrieving FASTA…' : 'Fetch & Preview FASTA'}</span>
                </button>
              </div>

              {fastaText && (
                <div className="space-y-2 border-t border-[var(--line)] pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-bold text-[var(--navy)]">
                      <CheckCircle2 className="h-4 w-4 text-[var(--tomato)]" aria-hidden="true" />
                      <span>
                        {stats.sequences.toLocaleString()} FASTA sequence
                        {stats.sequences === 1 ? '' : 's'} ready
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFastaText('')}
                      className="font-semibold text-[var(--ink-secondary)] hover:text-[var(--navy)] hover:underline"
                    >
                      Clear preview
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={fastaText}
                    onChange={(e) => setFastaText(e.target.value)}
                    aria-label="Fetched FASTA preview"
                    spellCheck={false}
                    className="prg-field resize-y bg-[var(--surface)] font-mono text-sm leading-6"
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN (5 cols): 02 Cascade Depth + Spec Summary + Submit */}
        <aside className="surface-card space-y-6 p-5 sm:p-6 lg:col-span-5">
          <div className="flex items-baseline gap-2.5 border-b border-[var(--line-strong)] pb-3.5">
            <span className="font-mono text-base font-bold text-[var(--tomato)]">02</span>
            <h2 className="font-display text-xl font-bold text-[var(--navy)]">
              Prediction cascade depth
            </h2>
          </div>

          <fieldset className="space-y-3">
            <legend className="sr-only">Choose screening mode</legend>
            <div className="flex items-center justify-between gap-2">
              <span aria-hidden="true" className="text-base font-bold text-[var(--ink)]">
                Choose screening mode:
              </span>
              <button
                type="button"
                onClick={openGuideModal}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[var(--tomato)] hover:underline"
              >
                <Info className="h-4 w-4" aria-hidden="true" />
                <span>Class &amp; phase guide</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white">
              <label
                htmlFor="level-phase2"
                className={`flex cursor-pointer items-start gap-3.5 p-4 transition ${
                  level === 'Phase2' ? 'bg-[var(--tomato-soft)]' : 'hover:bg-[var(--surface)]'
                }`}
              >
                <input
                  id="level-phase2"
                  type="radio"
                  name="level"
                  value="Phase2"
                  checked={level === 'Phase2'}
                  onChange={() => setLevel('Phase2')}
                  className="mt-1 h-4.5 w-4.5 shrink-0 accent-[var(--tomato)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[15px] font-bold text-[var(--navy)] sm:text-base">
                      Phase I + Phase II · 8 R-Gene Families
                    </span>
                    <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-[var(--tomato)]">
                      Recommended
                    </span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-[var(--ink-secondary)]">
                    Screens candidate R-genes in Phase I, then classifies positives across{' '}
                    <code className="font-mono font-bold text-[var(--navy)]">
                      CNL, TNL, RLK, RLP, LECRK, LYK, TIR, KIN
                    </code>
                    .
                  </span>
                </span>
              </label>

              <label
                htmlFor="level-phase1"
                className={`flex cursor-pointer items-start gap-3.5 p-4 transition ${
                  level === 'Phase1' ? 'bg-[var(--navy-soft)]' : 'hover:bg-[var(--surface)]'
                }`}
              >
                <input
                  id="level-phase1"
                  type="radio"
                  name="level"
                  value="Phase1"
                  checked={level === 'Phase1'}
                  onChange={() => setLevel('Phase1')}
                  className="mt-1 h-4.5 w-4.5 shrink-0 accent-[var(--tomato)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-[var(--navy)] sm:text-base">
                    Phase I Only · Binary R-Gene Screen
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-[var(--ink-secondary)]">
                    Scores sequences as{' '}
                    <code className="font-mono font-bold text-[var(--navy)]">Rgene</code> vs.{' '}
                    <code className="font-mono font-bold text-[var(--navy)]">Non-Rgene</code>{' '}
                    without 8-family subclassification.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          {/* Compact Rounded Server Capabilities Summary */}
          <div className="overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] text-sm">
            <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--navy-soft)] px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
              <ShieldCheck className="h-4 w-4 text-[var(--navy)]" aria-hidden="true" />
              <span>Run Summary &amp; Structure Options</span>
            </div>
            <dl className="divide-y divide-[var(--line)]">
              <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <dt className="font-medium text-[var(--ink-secondary)]">Feature vector</dt>
                <dd className="text-right font-semibold text-[var(--ink)]">
                  400-D Dipeptide Composition
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <dt className="font-medium text-[var(--ink-secondary)]">Structure viewers</dt>
                <dd className="text-right font-semibold text-[var(--ink)]">
                  S4PRED 2D + ESMFold 3D (≤400 aa)
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <dt className="font-medium text-[var(--ink-secondary)]">Private link</dt>
                <dd className="text-right font-semibold text-[var(--ink)]">
                  Retained for 30 days
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4 border-t border-[var(--line-strong)] pt-4">
            {TURNSTILE_SITE_KEY ? (
              <div>
                <TurnstileWidget
                  siteKey={TURNSTILE_SITE_KEY}
                  onToken={setTurnstileToken}
                  resetKey={turnstileReset}
                />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn-tomato w-full py-3.5 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                  <span>Submitting Job…</span>
                </>
              ) : (
                <>
                  <span>Start Prediction</span>
                  <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--navy-soft)] px-4 py-3 text-sm text-[var(--navy)]">
              <span>Screening &gt;10,000 sequences locally?</span>
              <Link href="/standalone" className="font-bold text-[var(--tomato)] hover:underline">
                Download CLI Package →
              </Link>
            </div>
          </div>
        </aside>
      </form>

      {/* Native Modal Dialog: 8 R-Gene Families & Two-Phase Cascade Guide */}
      <dialog
        ref={dialogRef}
        aria-labelledby="prg-guide-modal-title"
        onClose={() => {
          if (dialogRef.current) dialogRef.current.returnValue = '';
        }}
        onPointerDown={handleDialogPointerDown}
        onPointerUp={handleDialogPointerUp}
        {...({ closedby: 'any' } as Record<string, string>)}
      >
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line-strong)] bg-[var(--surface)] px-6 py-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
                PRGminer Reference Guide
              </p>
              <h1
                id="prg-guide-modal-title"
                className="mt-0.5 font-display text-xl font-bold text-[var(--navy)]"
              >
                8 Plant R-Gene Families &amp; Two-Phase Cascade
              </h1>
            </div>
            <form method="dialog">
              <button
                value="close"
                autoFocus
                aria-label="Close guide"
                className="btn-ghost-rule py-1.5 px-3 text-sm"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span>Close</span>
              </button>
            </form>
          </div>

          <div className="space-y-5 overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-4">
                <h2 className="text-base font-bold text-[var(--navy)]">
                  Phase I + Phase II vs. Phase I Only
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-[var(--ink)]">
                  <strong>Phase I + Phase II</strong> filters candidate R-genes (
                  <code className="font-mono font-bold">Rgene ≥ 50%</code>) and classifies them
                  into 8 receptor families. <strong>Phase I Only</strong> stops after binary{' '}
                  <code className="font-mono font-bold">Rgene</code> vs.{' '}
                  <code className="font-mono font-bold">Non-Rgene</code> screening.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-4">
                <h2 className="text-base font-bold text-[var(--navy)]">
                  9-Protein Demo vs. Single-Family Examples
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-[var(--ink)]">
                  <strong>Load 9-Protein Demo</strong> loads 1 representative protein per R-gene
                  family plus 1 negative control. Clicking a family code (
                  <code className="font-mono font-bold">CNL</code>–
                  <code className="font-mono font-bold">KIN</code>) loads a single example for that
                  class.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--line-strong)] bg-white">
              <table className="w-full border-collapse text-left text-[14.5px]">
                <thead>
                  <tr className="border-b border-[var(--line-strong)] bg-[var(--surface)] font-mono text-xs uppercase tracking-wider text-[var(--navy)]">
                    <th scope="col" className="px-4 py-3 font-bold">
                      Code
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Receptor Family
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Domain Formula
                    </th>
                    <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">
                      Localization
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {RGENE_CLASSES.map((cls) => (
                    <tr key={cls.key} className="hover:bg-[var(--surface)]">
                      <th
                        scope="row"
                        className="px-4 py-3 font-mono font-extrabold text-[var(--navy)]"
                      >
                        {cls.code}
                      </th>
                      <td className="px-4 py-3">
                        <span className="font-bold text-[var(--ink)]">{cls.name}</span>
                        <span className="block text-xs text-[var(--ink-secondary)]">
                          {cls.canonicalExamples.slice(0, 2).join(', ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-[var(--tomato)]">
                        {cls.architectureFormula}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-[var(--ink-secondary)] sm:table-cell">
                        {cls.immuneLayerLabel}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            applyDemo(cls.key);
                            closeGuideModal();
                          }}
                          className="btn-outline-sharp !min-h-0 py-1.5 px-3 text-xs"
                        >
                          Load {cls.code}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default function PredictionPage() {
  return (
    <Suspense
      fallback={
        <div
          className="my-6 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-10 text-center text-base text-[var(--ink-secondary)]"
          role="status"
        >
          Loading prediction workspace…
        </div>
      }
    >
      <PredictionWorkbenchInner />
    </Suspense>
  );
}
