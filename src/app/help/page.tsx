'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  HelpCircle,
  Layers,
  Mail,
  Microscope,
  Terminal,
} from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import DomainSchematic from '@/components/DomainSchematic';
import DpcPipelineSVG from '@/components/DpcPipelineSVG';
import { RGENE_CLASSES, type RGeneClassKey } from '@/data/rgene-classes';

type HelpTabId = 'workflow' | 'classes' | 'outputs' | 'faq';

const HELP_TABS: ReadonlyArray<{
  id: HelpTabId;
  label: string;
  icon: typeof Microscope;
}> = [
  { id: 'workflow', label: 'Quick Start & Workflow', icon: Microscope },
  { id: 'classes', label: '8 R-Gene Architectures', icon: Layers },
  { id: 'outputs', label: 'Output & Structure Guide', icon: Terminal },
  { id: 'faq', label: 'Citation, FAQ & Contact', icon: HelpCircle },
];

const BIBTEX = `@article{Duhan2025PRGminer,
  author  = {Duhan, Naveen and Kaundal, Rakesh},
  title   = {PRGminer: harnessing deep learning for the prediction of resistance genes involved in plant defense mechanisms},
  journal = {Frontiers in Plant Science},
  volume  = {16},
  pages   = {1411525},
  year    = {2025},
  doi     = {10.3389/fpls.2025.1411525}
}`;

const FAQ_ITEMS = [
  {
    q: 'Can I submit nucleotide CDS, transcriptomes, or genomic contigs directly?',
    a: 'No. PRGminer encodes translated amino acid sequences into 400-dimensional Dipeptide Composition (DPC) vectors. Translate coding sequences or assembled transcripts into protein FASTA first using tools such as TransDecoder, gffread -y, Prodigal, or Augustus.',
    defaultOpen: true,
  },
  {
    q: 'When should I run Phase I alone versus the full Phase II cascade?',
    a: 'Choose Phase I when you only need a fast binary partition (Rgene vs. Non-Rgene) across a large proteome. Choose Phase II (recommended default) to automatically route every protein scoring Rgene >= 50.0% into the 8-family classifier (CNL, TNL, RLK, RLP, LECRK, LYK, TIR, KIN).',
    defaultOpen: false,
  },
  {
    q: 'Why is in-browser 3D folding limited to proteins up to 400 amino acids?',
    a: 'PRGminer uses single-sequence ESMFold atomic inference for rapid in-browser 3D coordinate generation (~5–20s), which supports compact immune proteins and standalone domains up to 400 residues (such as TIR sensors, KIN decoys, or excised NB-ARC/kinase domains). For full-length multi-domain NLRs and receptor kinases (>400 aa), PRGminer computes full-length S4PRED 2D topology locally and provides one-click FASTA handoff to AlphaFold Server and SWISS-MODEL.',
    defaultOpen: false,
  },
  {
    q: 'How are model weights distributed in the standalone CLI?',
    a: 'Both Phase I (prgminer_phase1.tflite, 48.4 MiB) and Phase II (prgminer_phase2.tflite, 24.8 MiB) checkpoints are bundled directly inside the repository as LiteRT / TensorFlow Lite flatbuffers verified via SHA-256 checksums (prgminer --models-status)—no separate weight download step is required.',
    defaultOpen: false,
  },
  {
    q: 'How private are web submissions and how long are job links retained?',
    a: 'Each run is isolated under a 256-bit cryptographic job token stored in the browser URL hash (#job=...&token=...) so the token is never transmitted in external HTTP Referer headers. Result directories remain accessible via your bookmark link for 30 days before automatic purge.',
    defaultOpen: false,
  },
] as const;

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<HelpTabId>('workflow');
  const [selectedClass, setSelectedClass] = useState<RGeneClassKey>('cnl');
  const [copiedBib, setCopiedBib] = useState(false);

  const panelsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<HelpTabId, HTMLButtonElement | null>>({
    workflow: null,
    classes: null,
    outputs: null,
    faq: null,
  });

  const selectedClassInfo =
    RGENE_CLASSES.find((cls) => cls.key === selectedClass) || RGENE_CLASSES[0];

  const selectAndRevealTab = (id: HelpTabId, focus = false) => {
    setActiveTab(id);
    const btn = tabRefs.current[id];
    if (btn) {
      if (focus) btn.focus();
      btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  useEffect(() => {
    const container = panelsContainerRef.current;
    if (!container) return;
    const handleBeforeMatch = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const panel = target.closest<HTMLElement>('[role="tabpanel"][data-tab-id]');
      const matchedId = panel?.dataset.tabId as HelpTabId | undefined;
      if (matchedId) {
        setActiveTab(matchedId);
        tabRefs.current[matchedId]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    };
    container.addEventListener('beforematch', handleBeforeMatch);
    return () => container.removeEventListener('beforematch', handleBeforeMatch);
  }, []);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const idx = HELP_TABS.findIndex((t) => t.id === activeTab);
    if (idx === -1) return;
    let nextIdx = -1;
    if (event.key === 'ArrowRight') {
      nextIdx = (idx + 1) % HELP_TABS.length;
    } else if (event.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + HELP_TABS.length) % HELP_TABS.length;
    } else if (event.key === 'Home') {
      nextIdx = 0;
    } else if (event.key === 'End') {
      nextIdx = HELP_TABS.length - 1;
    }
    if (nextIdx !== -1) {
      event.preventDefault();
      selectAndRevealTab(HELP_TABS[nextIdx].id, true);
    }
  };

  const copyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      setCopiedBib(true);
      setTimeout(() => setCopiedBib(false), 2200);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <div className="space-y-6 py-4 sm:py-6">
      {/* Clean Manual Masthead */}
      <header className="border-b border-[var(--line)] pb-6">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--tomato)]">
          Documentation &amp; Technical Reference Manual
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-[var(--navy)] sm:text-4xl">
          Plant resistance gene screening, architecture &amp; interpretation guide
        </h1>
        <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          Reference protocols for formatting protein FASTA inputs, operating the two-phase Dipeptide
          Composition CNN cascade, auditing softmax class probabilities, inspecting S4PRED 2D and
          ESMFold 3D (&le;400 aa) structures, and citing PRGminer.
        </p>
      </header>

      {/* Architectural Tabbed Reference Container */}
      <section className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white">
        <div
          className="prg-tablist bg-[var(--surface)] px-3 sm:px-6"
          role="tablist"
          aria-label="PRGminer manual sections"
          onKeyDown={handleTabKeyDown}
        >
          {HELP_TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[id] = el;
                }}
                id={`help-tab-${id}`}
                type="button"
                role="tab"
                tabIndex={active ? 0 : -1}
                aria-selected={active}
                onClick={() => selectAndRevealTab(id)}
                className="prg-tab"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div ref={panelsContainerRef}>
          {/* TAB 1: Quick Start & Workflow */}
          <div
            role="tabpanel"
            data-tab-id="workflow"
            aria-labelledby="help-tab-workflow"
            hidden={activeTab !== 'workflow' ? ('until-found' as unknown as boolean) : undefined}
          >
            <div className="space-y-8 p-5 sm:p-7">
              {/* Crisp 3-Step Numbered Ledger */}
              <div className="grid divide-y divide-[var(--line)] border border-[var(--line)] bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-extrabold text-[var(--tomato)]">01 · INPUT</span>
                    <span className="text-[11px] text-[var(--muted)]">10–5,000 aa</span>
                  </div>
                  <h2 className="font-display text-lg font-semibold text-[var(--navy)]">
                    Prepare protein sequences
                  </h2>
                  <p className="text-xs leading-relaxed text-[var(--muted)]">
                    Paste standard amino acid FASTA (up to 10,000 sequences per web run), upload a{' '}
                    <code className="font-mono text-[var(--ink)]">.fasta</code> file, load a
                    benchmark specimen, or fetch directly via UniProtKB / NCBI Protein accessions.
                  </p>
                </div>

                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-extrabold text-[var(--navy)]">
                      02 · TWO-PHASE CASCADE
                    </span>
                    <span className="text-[11px] text-[var(--muted)]">400-D DPC CNN</span>
                  </div>
                  <h2 className="font-display text-lg font-semibold text-[var(--navy)]">
                    Gate &amp; resolve receptor class
                  </h2>
                  <p className="text-xs leading-relaxed text-[var(--muted)]">
                    <strong>Phase I</strong> screens every protein as{' '}
                    <code className="font-mono text-[var(--ink)]">Rgene</code> vs.{' '}
                    <code className="font-mono text-[var(--ink)]">Non-Rgene</code> (98.75% test
                    accuracy). <strong>Phase II</strong> forwards{' '}
                    <code className="font-mono text-[var(--ink)]">Rgene &ge; 50%</code> hits into
                    the 8-family CNN (97.55% accuracy).
                  </p>
                </div>

                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-extrabold text-[var(--steel)]">
                      03 · RESULTS &amp; STRUCTURE
                    </span>
                    <span className="text-[11px] text-[var(--muted)]">2D + 3D</span>
                  </div>
                  <h2 className="font-display text-lg font-semibold text-[var(--navy)]">
                    Export FASTA &amp; inspect folds
                  </h2>
                  <p className="text-xs leading-relaxed text-[var(--muted)]">
                    Bookmark your tokenized 30-day result URL, export TSV/CSV/JSON or per-class{' '}
                    <code className="font-mono text-[var(--ink)]">.fasta</code> subsets, and launch
                    S4PRED 2D secondary topology and ESMFold 3D (&le;400 aa) viewers.
                  </p>
                </div>
              </div>

              {/* Embedded Interactive DPC Pipeline Schematic */}
              <div className="border border-[var(--line)] border-t-2 border-t-[var(--tomato)] bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3">
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
                      Interactive Two-Phase Architecture Schematic
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Click any Phase II receptor track in the diagram to inspect its domain formula
                      and load its benchmark protein.
                    </p>
                  </div>
                  <span className="rounded-[2px] bg-[var(--navy)] px-2.5 py-1 font-mono text-xs font-bold text-white">
                    Active Track: {selectedClassInfo.code}
                  </span>
                </div>

                <div className="p-4 sm:p-6">
                  <DpcPipelineSVG selected={selectedClass} onSelect={setSelectedClass} />
                </div>

                <div className="flex flex-col gap-3 border-t border-[var(--line)] bg-[var(--surface)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-[var(--tomato)]">
                        {selectedClassInfo.code}
                      </span>
                      <span className="text-xs font-semibold text-[var(--navy)]">
                        {selectedClassInfo.name}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--muted)]">
                        ({selectedClassInfo.architectureFormula})
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">{selectedClassInfo.summary}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Link
                      href={`/prediction?example=${selectedClassInfo.key}`}
                      className="btn-tomato text-xs"
                    >
                      <span>Load {selectedClassInfo.code} in Workbench</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => selectAndRevealTab('classes')}
                      className="btn-ghost-rule text-xs"
                    >
                      <span>Compare All 8 Classes</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-5">
                <Link href="/prediction?example=panel" className="btn-navy text-xs">
                  <span>Run 9-Protein Benchmark Panel</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/standalone" className="btn-outline-sharp text-xs">
                  <span>Whole-Proteome CLI (&gt;10,000 Proteins)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* TAB 2: 8 R-Gene Architectures */}
          <div
            role="tabpanel"
            data-tab-id="classes"
            aria-labelledby="help-tab-classes"
            hidden={activeTab !== 'classes' ? ('until-found' as unknown as boolean) : undefined}
          >
            <div className="space-y-5 p-5 sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="max-w-3xl text-xs leading-relaxed text-[var(--muted)]">
                  Phase II resolves resistance candidates into four plasma-membrane pattern
                  recognition receptor families (<strong className="text-[var(--ink)]">RLK</strong>,{' '}
                  <strong className="text-[var(--ink)]">RLP</strong>,{' '}
                  <strong className="text-[var(--ink)]">LECRK</strong>,{' '}
                  <strong className="text-[var(--ink)]">LYK</strong>), two canonical intracellular
                  NLRs (<strong className="text-[var(--ink)]">CNL</strong>,{' '}
                  <strong className="text-[var(--ink)]">TNL</strong>), and two intracellular
                  signaling/sensor modules (<strong className="text-[var(--ink)]">TIR</strong>,{' '}
                  <strong className="text-[var(--ink)]">KIN</strong>).
                </p>
                <span className="font-mono text-[11px] font-bold text-[var(--navy)]">
                  8 Phase II Output Classes
                </span>
              </div>

              {/* Clean 1px-Divided Architectural Grid */}
              <div className="grid gap-px border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-[var(--line)] md:grid-cols-2">
                {RGENE_CLASSES.map((cls) => (
                  <article
                    key={cls.key}
                    className="flex flex-col justify-between bg-white p-5 sm:p-6"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-[2px] bg-[var(--navy)] px-2.5 py-0.5 font-mono text-xs font-extrabold text-white">
                            {cls.code}
                          </span>
                          <span className="font-mono text-xs font-bold text-[var(--tomato)]">
                            {cls.architectureFormula}
                          </span>
                        </div>
                        <span className="rounded-[2px] border border-[var(--line-strong)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--navy)]">
                          {cls.immuneLayerLabel}
                        </span>
                      </div>

                      <h2 className="font-display text-xl font-semibold text-[var(--navy)]">
                        {cls.name}
                      </h2>

                      <DomainSchematic
                        domains={cls.domains}
                        compartment={cls.compartment}
                        compact
                      />

                      <p className="text-xs leading-relaxed text-[var(--muted)]">{cls.summary}</p>

                      <div className="border-t border-[var(--line)] pt-3">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          Conserved Motifs &amp; Structural Signatures
                        </p>
                        <ul className="mt-1.5 flex flex-wrap gap-1.5 list-none p-0">
                          {cls.conservedMotifs.map((motif) => (
                            <li
                              key={motif}
                              className="rounded-[2px] border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink)]"
                            >
                              {motif}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
                      <span className="font-mono text-[11px] text-[var(--muted)]">
                        Ref: {cls.canonicalExamples.slice(0, 2).join(', ')}
                      </span>
                      <Link
                        href={`/prediction?example=${cls.key}`}
                        className="font-mono text-xs font-bold text-[var(--tomato)] hover:text-[var(--tomato-dark)] hover:underline"
                      >
                        [Load in Workbench &rarr;]
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* TAB 3: Output & Structure Guide */}
          <div
            role="tabpanel"
            data-tab-id="outputs"
            aria-labelledby="help-tab-outputs"
            hidden={activeTab !== 'outputs' ? ('until-found' as unknown as boolean) : undefined}
          >
            <div className="space-y-8 p-5 sm:p-7">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Softmax Probabilities & Rank Badge Key */}
                <section
                  aria-labelledby="softmax-guide-heading"
                  className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white p-5 sm:p-6"
                >
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--tomato)]">
                    Probability Interpretation
                  </p>
                  <h2
                    id="softmax-guide-heading"
                    className="mt-1 font-display text-xl font-semibold text-[var(--navy)]"
                  >
                    Phase I &amp; Phase II Softmax Percentages
                  </h2>
                  <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-[var(--muted)]">
                    <p>
                      <strong className="text-[var(--ink)]">Phase I Binary Gate:</strong> Outputs
                      calibrated softmax percentages for{' '}
                      <code className="font-mono text-[var(--ink)]">Non-Rgene</code> and{' '}
                      <code className="font-mono text-[var(--ink)]">Rgene</code> summing to{' '}
                      <code className="font-mono text-[var(--ink)]">100.0%</code>. Any sequence with{' '}
                      <code className="font-mono text-[var(--ink)]">Rgene &ge; 50.0%</code> is
                      classified as a putative resistance protein and forwarded to Phase II.
                    </p>
                    <p>
                      <strong className="text-[var(--ink)]">Phase II 8-Class Matrix:</strong>{' '}
                      Evaluates every forwarded R-gene across{' '}
                      <code className="font-mono text-[var(--ink)]">
                        CNL, KIN, LYK, LECRK, RLK, RLP, TIR, TNL
                      </code>
                      . Each row highlights the top three candidate classes using architectural rank
                      badges so multi-domain hybrids or close paralogs are immediately visible:
                    </p>
                  </div>

                  <div className="mt-4 divide-y divide-[var(--line)] border border-[var(--line)] font-mono text-xs">
                    <div className="prob-rank prob-rank-1 flex items-center justify-between px-3.5 py-2.5">
                      <span>
                        <span className="prob-rank-badge">1</span>
                        <strong className="text-[var(--navy)]">Rank 1 · KAABiL Tomato</strong>
                      </span>
                      <span className="text-[var(--ink)]">Primary assigned family (argmax)</span>
                    </div>
                    <div className="prob-rank prob-rank-2 flex items-center justify-between px-3.5 py-2.5">
                      <span>
                        <span className="prob-rank-badge">2</span>
                        <strong className="text-[var(--navy)]">Rank 2 · USU Navy</strong>
                      </span>
                      <span className="text-[var(--muted)]">Runner-up family score</span>
                    </div>
                    <div className="prob-rank prob-rank-3 flex items-center justify-between px-3.5 py-2.5">
                      <span>
                        <span className="prob-rank-badge">3</span>
                        <strong className="text-[var(--navy)]">Rank 3 · Slate Steel</strong>
                      </span>
                      <span className="text-[var(--muted)]">Third-ranked softmax probability</span>
                    </div>
                  </div>
                </section>

                {/* Exports &Per-Class FASTA Downloads */}
                <section
                  aria-labelledby="exports-guide-heading"
                  className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white p-5 sm:p-6"
                >
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
                    Downstream Bioinformatic Exports
                  </p>
                  <h2
                    id="exports-guide-heading"
                    className="mt-1 font-display text-xl font-semibold text-[var(--navy)]"
                  >
                    Tabular Reports &amp; Per-Class FASTA Subsets
                  </h2>
                  <ul className="mt-3 divide-y divide-[var(--line)] border-t border-[var(--line)] text-xs">
                    <li className="py-3">
                      <p className="font-semibold text-[var(--ink)]">
                        Per-Class FASTA Partitioning (.fasta)
                      </p>
                      <p className="mt-1 leading-relaxed text-[var(--muted)]">
                        Export all Phase I R-genes together or download single-family FASTA subsets
                        (for example <code className="font-mono text-[var(--ink)]">CNL.fasta</code>,{' '}
                        <code className="font-mono text-[var(--ink)]">TNL.fasta</code>, or{' '}
                        <code className="font-mono text-[var(--ink)]">RLK.fasta</code>) directly
                        into MAFFT/IQ-TREE phylogenetics, InterPro domain verification, or
                        chromosomal NLR-cluster mapping.
                      </p>
                    </li>
                    <li className="py-3">
                      <p className="font-semibold text-[var(--ink)]">
                        Machine-Readable Tables (TSV, CSV, JSON)
                      </p>
                      <p className="mt-1 leading-relaxed text-[var(--muted)]">
                        Download full numeric probability matrices in TSV, CSV, or structured JSON
                        for R, Pandas, or Nextflow post-processing without loss of floating-point
                        precision.
                      </p>
                    </li>
                    <li className="pt-3">
                      <p className="font-semibold text-[var(--ink)]">
                        Fragment-Protected 30-Day Bookmarks
                      </p>
                      <p className="mt-1 leading-relaxed text-[var(--muted)]">
                        Save the <code className="font-mono text-[var(--ink)]">#job=...&amp;token=...</code>{' '}
                        bookmark URL to revisit completed tables and cached 2D/3D structures from
                        any browser within 30 days.
                      </p>
                    </li>
                  </ul>
                </section>
              </div>

              {/* 2D & 3D Structural Modeling Pipeline */}
              <section
                aria-labelledby="structure-guide-heading"
                className="border border-[var(--line)] border-t-2 border-t-[var(--tomato)] bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3.5">
                  <h2
                    id="structure-guide-heading"
                    className="font-display text-xl font-semibold text-[var(--navy)]"
                  >
                    On-Demand 2D Topology &amp; 3D Structure Modeling
                  </h2>
                  <span className="font-mono text-[11px] font-semibold text-[var(--muted)]">
                    S4PRED 2D · ESMFold 3D (&le;400 aa)
                  </span>
                </div>

                <div className="grid divide-y divide-[var(--line)] md:grid-cols-3 md:divide-x md:divide-y-0">
                  <div className="space-y-2 p-5">
                    <p className="font-mono text-xs font-extrabold text-[var(--navy)]">
                      2D TOPOLOGY · S4PRED
                    </p>
                    <h3 className="font-semibold text-sm text-[var(--ink)]">
                      Single-sequence secondary structure
                    </h3>
                    <p className="text-xs leading-relaxed text-[var(--muted)]">
                      Runs locally inside the compute backend to assign per-residue{' '}
                      <code className="font-mono text-[var(--ink)]">H</code> (&alpha;-helix),{' '}
                      <code className="font-mono text-[var(--ink)]">E</code> (&beta;-strand), and{' '}
                      <code className="font-mono text-[var(--ink)]">C</code> (coil) states with
                      residue-level confidence bars across coiled-coil, NB-ARC, and LRR repeats.
                    </p>
                  </div>

                  <div className="space-y-2 p-5">
                    <p className="font-mono text-xs font-extrabold text-[var(--tomato)]">
                      3D DE NOVO · ESMFOLD (&le; 400 AA)
                    </p>
                    <h3 className="font-semibold text-sm text-[var(--ink)]">
                      Language-model atomic coordinates
                    </h3>
                    <p className="text-xs leading-relaxed text-[var(--muted)]">
                      Compact resistance proteins up to 400 residues (such as standalone{' '}
                      <code className="font-mono text-[var(--ink)]">TIR</code> NADase sensors and
                      soluble <code className="font-mono text-[var(--ink)]">KIN</code> decoys) are
                      folded directly via ESMFold and rendered with per-residue pLDDT confidence
                      coloring.
                    </p>
                  </div>

                  <div className="space-y-2 p-5">
                    <p className="font-mono text-xs font-extrabold text-[var(--steel)]">
                      FULL-LENGTH RECEPTORS (&gt; 400 AA)
                    </p>
                    <h3 className="font-semibold text-sm text-[var(--ink)]">
                      2D topology &amp; external 3D handoff
                    </h3>
                    <p className="text-xs leading-relaxed text-[var(--muted)]">
                      Multi-domain <code className="font-mono text-[var(--ink)]">CNL</code>,{' '}
                      <code className="font-mono text-[var(--ink)]">TNL</code>,{' '}
                      <code className="font-mono text-[var(--ink)]">RLK</code>,{' '}
                      <code className="font-mono text-[var(--ink)]">RLP</code>,{' '}
                      <code className="font-mono text-[var(--ink)]">LECRK</code>, and{' '}
                      <code className="font-mono text-[var(--ink)]">LYK</code> receptors (&gt;400
                      aa) display a clear sequence-length notice with one-click full-length S4PRED
                      2D topology and direct FASTA handoff to AlphaFold Server and SWISS-MODEL.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* TAB 4: Citation, FAQ & Contact */}
          <div
            role="tabpanel"
            data-tab-id="faq"
            aria-labelledby="help-tab-faq"
            hidden={activeTab !== 'faq' ? ('until-found' as unknown as boolean) : undefined}
          >
            <div className="space-y-8 p-5 sm:p-7">
              {/* Primary Publication & Copyable BibTeX */}
              <section
                aria-labelledby="citation-heading"
                className="border border-[var(--line)] border-t-2 border-t-[var(--tomato)] bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider text-[var(--tomato)]">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    <span id="citation-heading">Primary Literature Citation</span>
                  </div>
                  <a
                    href="https://doi.org/10.3389/fpls.2025.1411525"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs font-bold text-[var(--navy)] underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--tomato)]"
                  >
                    DOI: 10.3389/fpls.2025.1411525
                  </a>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">
                  Duhan, N., &amp; Kaundal, R. (2025). PRGminer: harnessing deep learning for the
                  prediction of resistance genes involved in plant defense mechanisms.{' '}
                  <em>Frontiers in Plant Science</em>, 16, 1411525.{' '}
                  <a
                    href="https://doi.org/10.3389/fpls.2025.1411525"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[var(--tomato)] hover:underline"
                  >
                    https://doi.org/10.3389/fpls.2025.1411525
                  </a>
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      BibTeX Record
                    </span>
                    <button
                      type="button"
                      onClick={() => void copyBibtex()}
                      className="btn-ghost-rule !min-h-0 !px-3 !py-1.5 font-mono text-xs"
                    >
                      {copiedBib ? (
                        <>
                          <Check
                            className="h-3.5 w-3.5 text-[var(--tomato)]"
                            aria-hidden="true"
                          />
                          <span>Copied BibTeX</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy BibTeX</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-[2px] border border-[var(--navy-dark)] bg-[#0f2744] p-4 font-mono text-xs leading-6 text-slate-100">
                    <code>{BIBTEX}</code>
                  </pre>
                </div>
              </section>

              {/* Practical FAQs (Accessible Non-Exclusive Native Details) */}
              <section
                aria-labelledby="faq-list-heading"
                className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white"
              >
                <div className="border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3.5">
                  <h2
                    id="faq-list-heading"
                    className="font-display text-xl font-semibold text-[var(--navy)]"
                  >
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="divide-y divide-[var(--line)]">
                  {FAQ_ITEMS.map((item) => (
                    <details key={item.q} open={item.defaultOpen} className="group">
                      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-5 py-4 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--surface)] [&::-webkit-details-marker]:hidden">
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-[var(--tomato)] transition-transform duration-150 group-open:rotate-90"
                          aria-hidden="true"
                        />
                        <span>{item.q}</span>
                      </summary>
                      <div className="px-5 pb-4 pl-11 text-xs leading-relaxed text-[var(--muted)]">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {/* KAABiL Lab Support & Issue Reporting */}
              <section
                aria-labelledby="contact-heading"
                className="flex flex-col gap-4 border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="space-y-1">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
                    KAABiL Bioinformatics Support · Utah State University
                  </p>
                  <h2
                    id="contact-heading"
                    className="font-display text-lg font-semibold text-[var(--ink)]"
                  >
                    Kaundal Artificial Intelligence &amp; Advanced Bioinformatics Lab
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Report bug traces, request taxon-specific benchmarks, or inquire about
                    collaborative plant immunogenomics analyses.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <a href="mailto:naveen.duhan@usu.edu" className="btn-navy text-xs">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>naveen.duhan@usu.edu</span>
                  </a>
                  <a href="mailto:rkaundal@usu.edu" className="btn-outline-sharp text-xs">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>rkaundal@usu.edu</span>
                  </a>
                  <a
                    href="https://github.com/usubioinfo/PRGminer/issues"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost-rule text-xs"
                  >
                    <span>GitHub Issues</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
