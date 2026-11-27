'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Bookmark,
  Check,
  Database,
  FileUp,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { DEMO_SEQUENCES, type DemoSequenceKey } from '@/data/demo-sequences';
import { withBasePath } from '@/lib/base-path';
import { buildJobBookmark } from '@/lib/job-bookmark';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

const QUICK_SPECIMENS: ReadonlyArray<{ key: DemoSequenceKey; code: string }> = [
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
  if (!trimmed) return 'Provide protein FASTA sequences, upload a FASTA file, or fetch an accession.';
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

  // Poll active prediction job until completion
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
        // Transient network hiccup; keep polling
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

  const handleFetchAccessions = async () => {
    if (!accessionInput.trim()) {
      setFieldError('Enter at least one UniProtKB or NCBI Protein accession ID to fetch.');
      requestAnimationFrame(() => errorBannerRef.current?.focus());
      return;
    }
    setFetchingAcc(true);
    setFieldError('');
    try {
      const res = await fetch(withBasePath('/api/accession'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessions: accessionInput, db: accessionDb }),
      });
      const data = (await res.json()) as { fasta?: string; error?: string };
      if (!res.ok || !data.fasta) {
        throw new Error(data.error || 'Unable to retrieve protein FASTA for those accessions.');
      }
      setFastaText(data.fasta);
      setSelectedDemo('');
      setUploadedName(`${accessionDb.toUpperCase()}: ${accessionInput.trim()}`);
      setFastaEdited(true);
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : 'Failed to fetch accession.');
      requestAnimationFrame(() => errorBannerRef.current?.focus());
    } finally {
      setFetchingAcc(false);
    }
  };

  const handleReset = () => {
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
    const validationErr = validateClientFasta(fastaText);
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
          sequence: fastaText,
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
    <div className="space-y-6 py-5 sm:py-8">
      {/* Flat Architectural Header Row */}
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--tomato)]">
            Plant R-Gene Prediction Workbench
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-[var(--navy)] sm:text-3xl">
            Screen protein sequences for resistance architectures
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--muted)]">
            Paste protein FASTA sequences, load a curated family specimen, upload a proteome file,
            or fetch records directly from UniProtKB and NCBI Protein.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => applyDemo('panel')}
            className="btn-navy text-xs !py-2 !px-3.5"
          >
            <span>Load 9-Protein Benchmark</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-ghost-rule text-xs !py-2 !px-3"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </header>

      {/* Focusable Validation / Submission Error Banner */}
      {fieldError ? (
        <div
          id="fasta-error-banner"
          ref={errorBannerRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-[var(--tomato-border)] border-l-4 border-l-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3.5 text-sm font-medium text-[var(--danger)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{fieldError}</span>
        </div>
      ) : null}

      {/* Live Prediction Job Status & Private Bookmark Copy Banner */}
      {activeJob ? (
        <section
          role="status"
          aria-live="polite"
          className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-[var(--navy-soft)] px-5 py-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Loader2
                className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-[var(--tomato)]"
                aria-hidden="true"
              />
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
                  PRGminer Prediction Job · {activeJob.status.toUpperCase()}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--ink)]">{activeJob.message}</p>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                  Job ID: {activeJob.jobId} · Results open automatically when complete (retained 30 days)
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
              className="btn-outline-sharp shrink-0 text-xs !py-2 !px-3"
            >
              {copiedBookmark ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--tomato)]" aria-hidden="true" />
                  <span>Copied Private Link</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy Private Result Link</span>
                </>
              )}
            </button>
          </div>
        </section>
      ) : null}

      {/* Architectural 2-Column Split Console */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        method="POST"
        action={withBasePath('/api/predict')}
        noValidate
        className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white grid lg:grid-cols-[1.32fr_0.68fr] divide-y lg:divide-y-0 lg:divide-x divide-[var(--line)]"
      >
        {/* LEFT PANE: Specimen Selection, Remote Fetch, File Dropzone & FASTA Editor */}
        <div className="space-y-5 bg-white p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="demo-specimen-select"
                className="block text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]"
              >
                Curated plant R-gene specimens
              </label>
              <select
                id="demo-specimen-select"
                name="demoSpecimen"
                value={selectedDemo}
                onChange={(e) => {
                  const val = e.target.value as DemoSequenceKey | '';
                  if (val) applyDemo(val);
                }}
                className="mt-1.5 w-full rounded-[3px] border border-[var(--field-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)]"
              >
                <option value="">Select benchmark panel or family…</option>
                {Object.values(DEMO_SEQUENCES).map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="accession-fetch-input"
                className="block text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]"
              >
                Fetch UniProtKB / NCBI accession
              </label>
              <div className="mt-1.5 flex gap-1.5">
                <select
                  aria-label="Accession database"
                  name="accessionDb"
                  value={accessionDb}
                  onChange={(e) => setAccessionDb(e.target.value as 'uniprot' | 'ncbi')}
                  className="rounded-[3px] border border-[var(--field-border)] bg-[var(--surface)] px-2.5 py-2 text-xs font-bold text-[var(--navy)]"
                >
                  <option value="uniprot">UniProt</option>
                  <option value="ncbi">NCBI Prot</option>
                </select>
                <input
                  id="accession-fetch-input"
                  name="accessions"
                  type="text"
                  value={accessionInput}
                  onChange={(e) => {
                    setAccessionInput(e.target.value);
                    if (fieldError) setFieldError('');
                  }}
                  onKeyDown={(e) => {
                    if (!e.nativeEvent.isComposing && e.key === 'Enter') {
                      e.preventDefault();
                      void handleFetchAccessions();
                    }
                  }}
                  placeholder="e.g. F4HT77, Q39214"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="go"
                  className="min-w-0 flex-1 rounded-[3px] border border-[var(--field-border)] bg-white px-3 py-2 font-mono text-sm text-[var(--ink)]"
                />
                <button
                  type="button"
                  disabled={fetchingAcc}
                  onClick={() => void handleFetchAccessions()}
                  className="btn-outline-sharp shrink-0 !px-3 !py-2 text-xs"
                >
                  {fetchingAcc ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Database className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>Fetch</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Clickable Family Code Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
            <span className="mr-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Quick specimen:
            </span>
            {QUICK_SPECIMENS.map((item) => {
              const active = selectedDemo === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => applyDemo(item.key)}
                  className={`rounded-[2px] border px-2.5 py-1 font-mono text-xs font-bold transition ${
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

          {/* Flat Dashed FASTA File Dropzone */}
          <div
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
            className={`flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-dashed px-4 py-3 transition ${
              dragActive
                ? 'border-[var(--tomato)] bg-[var(--tomato-soft)]'
                : 'border-[var(--line-strong)] bg-[var(--surface)]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs text-[var(--muted)]">
              <FileUp className="h-4 w-4 shrink-0 text-[var(--navy)]" aria-hidden="true" />
              <span>
                {uploadedName ? (
                  <>
                    Loaded source:{' '}
                    <strong className="font-mono text-[var(--navy)]">{uploadedName}</strong>
                  </>
                ) : (
                  'Drag & drop a protein FASTA file (.fasta, .fa, .faa) or browse from disk'
                )}
              </span>
            </div>
            <div>
              <label
                htmlFor="fasta-file-upload"
                className="btn-ghost-rule cursor-pointer !py-1.5 !px-3 text-xs"
              >
                Browse FASTA…
              </label>
              <input
                ref={fileInputRef}
                id="fasta-file-upload"
                name="fastaFile"
                type="file"
                accept=".fa,.faa,.fasta,.txt"
                onChange={(e) => void handleFileLoad(e.target.files?.[0])}
                className="sr-only"
              />
            </div>
          </div>

          {/* Monospace FASTA Textarea */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label
                htmlFor="protein-fasta-editor"
                className="text-sm font-bold text-[var(--navy)]"
              >
                Protein FASTA sequences{' '}
                <span aria-hidden="true" className="text-[var(--tomato)]">
                  *
                </span>
              </label>
              <span
                id="fasta-editor-hint"
                className="font-mono text-xs tabular-nums text-[var(--muted)]"
              >
                {stats.sequences.toLocaleString()}{' '}
                {stats.sequences === 1 ? 'sequence' : 'sequences'} ·{' '}
                {stats.residues.toLocaleString()} aa (10–5,000 aa/seq · max 10,000 seqs)
              </span>
            </div>

            <textarea
              id="protein-fasta-editor"
              name="sequence"
              required
              rows={13}
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
              className={`mt-2 w-full rounded-[3px] border bg-white p-3.5 font-mono text-xs leading-relaxed text-[var(--ink)] placeholder:text-[var(--muted)]/60 ${
                fieldError ? 'border-[var(--danger)]' : 'border-[var(--field-border)]'
              }`}
            />
          </div>
        </div>

        {/* RIGHT PANE: Cascade Depth Fieldset, Execution Spec Ledger, Turnstile & Submit */}
        <div className="flex flex-col justify-between gap-6 bg-[var(--surface)] p-5 sm:p-7">
          <div className="space-y-5">
            <fieldset className="space-y-3">
              <legend className="font-display text-lg font-semibold text-[var(--navy)]">
                Prediction cascade depth
              </legend>
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                Select the full two-phase screening and 8-class architectural assignment or stop
                after binary R-gene filtering.
              </p>

              {/* Option 1: Phase II Full 8-Class Cascade */}
              <div
                className={`rounded-[3px] border p-3.5 transition ${
                  level === 'Phase2'
                    ? 'border-[var(--navy)] border-l-[3px] border-l-[var(--tomato)] bg-white'
                    : 'border-[var(--line)] bg-white/75 hover:border-[var(--line-strong)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    id="level-phase2"
                    type="radio"
                    name="level"
                    value="Phase2"
                    checked={level === 'Phase2'}
                    onChange={() => setLevel('Phase2')}
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                  <label htmlFor="level-phase2" className="cursor-pointer">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--navy)]">
                      <span>Phase I → Phase II Full 8-Class Cascade</span>
                      <span className="rounded-[2px] border border-[var(--tomato-border)] bg-[var(--tomato-soft)] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-[var(--tomato)]">
                        Recommended
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">
                      Screens candidate R-genes in Phase I, then classifies every positive R-gene
                      across{' '}
                      <span className="font-mono font-semibold text-[var(--ink)]">
                        CNL, TNL, RLK, RLP, LECRK, LYK, TIR, KIN
                      </span>
                      .
                    </span>
                  </label>
                </div>
              </div>

              {/* Option 2: Phase I Binary Screen */}
              <div
                className={`rounded-[3px] border p-3.5 transition ${
                  level === 'Phase1'
                    ? 'border-[var(--navy)] border-l-[3px] border-l-[var(--navy)] bg-white'
                    : 'border-[var(--line)] bg-white/75 hover:border-[var(--line-strong)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    id="level-phase1"
                    type="radio"
                    name="level"
                    value="Phase1"
                    checked={level === 'Phase1'}
                    onChange={() => setLevel('Phase1')}
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                  <label htmlFor="level-phase1" className="cursor-pointer">
                    <span className="block text-sm font-bold text-[var(--navy)]">
                      Phase I Binary R-Gene Screen
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">
                      Rapidly scores sequences as{' '}
                      <span className="font-mono font-semibold text-[var(--ink)]">Rgene</span> vs.{' '}
                      <span className="font-mono font-semibold text-[var(--ink)]">Non-Rgene</span>{' '}
                      without running 8-family subclassification.
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Execution & Privacy Specification Ledger */}
            <div className="border border-[var(--line)] bg-white text-xs">
              <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--navy-soft)] px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
                <ShieldCheck className="h-4 w-4 text-[var(--navy)]" aria-hidden="true" />
                <span>Execution &amp; Privacy Specification</span>
              </div>
              <dl className="divide-y divide-[var(--line)]">
                <div className="flex items-baseline justify-between gap-3 px-3.5 py-2">
                  <dt className="text-[var(--muted)]">Feature encoding</dt>
                  <dd className="text-right font-semibold text-[var(--ink)]">
                    400-D Dipeptide Composition (CNN)
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 px-3.5 py-2">
                  <dt className="text-[var(--muted)]">Structural suite</dt>
                  <dd className="text-right font-semibold text-[var(--ink)]">
                    S4PRED 2D + ESMFold / SWISS-MODEL 3D
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 px-3.5 py-2">
                  <dt className="text-[var(--muted)]">Molecule policy</dt>
                  <dd className="text-right font-semibold text-[var(--ink)]">
                    Protein FASTA (20 aa + X)
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 px-3.5 py-2">
                  <dt className="text-[var(--muted)]">Result retention</dt>
                  <dd className="text-right font-semibold text-[var(--ink)]">
                    30-day tokenized link (unindexed)
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-4">
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
              className="btn-tomato w-full py-3 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Submitting Job…</span>
                </>
              ) : (
                <span>Run PRGminer Prediction →</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function PredictionPage() {
  return (
    <Suspense
      fallback={
        <div
          className="my-6 border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]"
          role="status"
        >
          Loading prediction workbench…
        </div>
      }
    >
      <PredictionWorkbenchInner />
    </Suspense>
  );
}
