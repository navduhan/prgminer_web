'use client';

import Link from 'next/link';
import {
  ArrowRight,
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
import { RGENE_CLASSES } from '@/data/rgene-classes';

type HelpTabId = 'workflow' | 'classes' | 'outputs' | 'faq';

const HELP_TABS: ReadonlyArray<{
  id: HelpTabId;
  label: string;
  icon: typeof Microscope;
}> = [
  { id: 'workflow', label: 'Quick Start & Quotas', icon: Microscope },
  { id: 'classes', label: '8 R-Gene Families', icon: Layers },
  { id: 'outputs', label: 'Results & Structures', icon: Terminal },
  { id: 'faq', label: 'Citation & FAQ', icon: HelpCircle },
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
    q: 'Can I submit nucleotide CDS or transcriptomes directly?',
    a: 'PRGminer accepts translated protein FASTA sequences (20 standard amino acids plus X). Translate coding sequences or transcripts into protein FASTA first using TransDecoder, gffread -y, or Augustus.',
    defaultOpen: true,
  },
  {
    q: 'When should I run Phase I alone versus Phase I + Phase II?',
    a: 'Use Phase I + Phase II (default) to screen candidate R-genes and classify positives across all 8 receptor families (CNL, TNL, RLK, RLP, LECRK, LYK, TIR, KIN). Choose Phase I only if you just want a fast Rgene vs. Non-Rgene filter.',
    defaultOpen: false,
  },
  {
    q: 'Why is in-browser 3D folding limited to proteins up to 400 amino acids?',
    a: 'In-browser 3D structure generation uses single-sequence ESMFold, which supports sequences up to 400 residues (such as TIR sensors, KIN decoys, or excised domains). Longer multi-domain R-genes (>400 aa) support full-length S4PRED 2D topology plus one-click FASTA handoff to AlphaFold Server and SWISS-MODEL.',
    defaultOpen: false,
  },
  {
    q: 'How long are private result links retained?',
    a: 'Each job generates an unindexed capability token in the URL hash (#job=...&token=...) and remains accessible for 30 days.',
    defaultOpen: false,
  },
] as const;

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<HelpTabId>('workflow');
  const [copiedBib, setCopiedBib] = useState(false);

  const panelsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<HelpTabId, HTMLButtonElement | null>>({
    workflow: null,
    classes: null,
    outputs: null,
    faq: null,
  });

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
    if (event.key === 'ArrowRight') nextIdx = (idx + 1) % HELP_TABS.length;
    else if (event.key === 'ArrowLeft')
      nextIdx = (idx - 1 + HELP_TABS.length) % HELP_TABS.length;
    else if (event.key === 'Home') nextIdx = 0;
    else if (event.key === 'End') nextIdx = HELP_TABS.length - 1;
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
      // Ignore clipboard errors
    }
  };

  return (
    <div className="space-y-8 py-6 pb-10">
      {/* Compact User Guide Header */}
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--line-strong)] pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--navy)] sm:text-[1.68rem]">
            PRGminer User Guide &amp; Quotas
          </h1>
          <p className="mt-1 text-[15px] text-[var(--ink-secondary)]">
            Sequence input rules, two-phase R-gene classification, structure modeling &amp; server
            limits
          </p>
        </div>

        <Link href="/prediction" className="btn-tomato shrink-0">
          <span>Open Prediction Workspace</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      {/* Rounded Tabbed Guide Container */}
      <section className="surface-card overflow-hidden">
        <div
          className="prg-tablist bg-[var(--surface)] px-4"
          role="tablist"
          aria-label="PRGminer guide sections"
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
          {/* TAB 1: Quick Start & Quotas */}
          <div
            role="tabpanel"
            data-tab-id="workflow"
            aria-labelledby="help-tab-workflow"
            hidden={activeTab !== 'workflow' ? ('until-found' as unknown as boolean) : undefined}
          >
            <div className="space-y-8 p-5 sm:p-7">
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-5">
                  <span className="font-mono text-xs font-extrabold text-[var(--tomato)]">
                    01 · INPUT
                  </span>
                  <h2 className="font-display text-lg font-bold text-[var(--navy)]">
                    Provide protein FASTA
                  </h2>
                  <p className="text-[14.5px] leading-relaxed text-[var(--ink)]">
                    Paste protein FASTA sequences, upload a <code>.fasta</code> file, fetch
                    UniProtKB / NCBI Protein IDs, or load an example set.
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-5">
                  <span className="font-mono text-xs font-extrabold text-[var(--navy)]">
                    02 · CASCADE
                  </span>
                  <h2 className="font-display text-lg font-bold text-[var(--navy)]">
                    Screen &amp; classify
                  </h2>
                  <p className="text-[14.5px] leading-relaxed text-[var(--ink)]">
                    <strong>Phase I</strong> separates <code>Rgene</code> from{' '}
                    <code>Non-Rgene</code>. <strong>Phase II</strong> classifies positives (
                    <code>Rgene ≥ 50%</code>) into 8 receptor families.
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-5">
                  <span className="font-mono text-xs font-extrabold text-[var(--steel)]">
                    03 · EXPORT &amp; FOLD
                  </span>
                  <h2 className="font-display text-lg font-bold text-[var(--navy)]">
                    Inspect results &amp; structures
                  </h2>
                  <p className="text-[14.5px] leading-relaxed text-[var(--ink)]">
                    Download TSV/CSV/JSON tables or per-family <code>.fasta</code> files, and view
                    S4PRED 2D topology or ESMFold 3D structures (≤400 aa).
                  </p>
                </div>
              </div>

              {/* Quotas Table */}
              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold text-[var(--navy)]">
                  Web Server Input Rules &amp; Quotas
                </h2>
                <div className="overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white">
                  <table className="w-full border-collapse text-left text-[15px]">
                    <thead>
                      <tr className="border-b border-[var(--line-strong)] bg-[var(--surface)] font-mono text-xs uppercase tracking-wider text-[var(--navy)]">
                        <th className="px-4 py-3 font-bold">Parameter</th>
                        <th className="px-4 py-3 font-bold">Web Server Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      <tr>
                        <td className="px-4 py-3">Sequences per job</td>
                        <td className="px-4 py-3 font-mono font-bold text-[var(--navy)]">
                          10,000
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Residue length per sequence</td>
                        <td className="px-4 py-3 font-mono font-bold text-[var(--navy)]">
                          10 – 5,000 aa
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Supported alphabet</td>
                        <td className="px-4 py-3 font-mono font-bold text-[var(--navy)]">
                          20 standard amino acids + X
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Protein accessions per fetch</td>
                        <td className="px-4 py-3 font-mono font-bold text-[var(--navy)]">
                          Up to 100 UniProtKB / NCBI IDs
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Private result retention</td>
                        <td className="px-4 py-3 font-mono font-bold text-[var(--navy)]">
                          30 days (#job=...&amp;token=...)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 2: 8 R-Gene Families */}
          <div
            role="tabpanel"
            data-tab-id="classes"
            aria-labelledby="help-tab-classes"
            hidden={activeTab !== 'classes' ? ('until-found' as unknown as boolean) : undefined}
          >
            <div className="space-y-5 p-5 sm:p-7">
              <p className="max-w-3xl text-[15px] leading-relaxed text-[var(--ink)]">
                Phase II classifies resistance proteins into four plasma-membrane PRR families (
                <strong>RLK, RLP, LECRK, LYK</strong>), two intracellular NLRs (
                <strong>CNL, TNL</strong>), and two intracellular signaling/sensor modules (
                <strong>TIR, KIN</strong>).
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                {RGENE_CLASSES.map((cls) => (
                  <article
                    key={cls.key}
                    className="flex flex-col justify-between rounded-xl border border-[var(--line-strong)] bg-white p-5"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-[var(--navy)] px-2.5 py-0.5 font-mono text-xs font-extrabold text-white">
                            {cls.code}
                          </span>
                          <span className="font-mono text-xs font-bold text-[var(--tomato)]">
                            {cls.architectureFormula}
                          </span>
                        </div>
                        <span className="rounded-md border border-[var(--line-strong)] bg-[var(--surface)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--navy)]">
                          {cls.immuneLayerLabel}
                        </span>
                      </div>

                      <h2 className="font-display text-xl font-bold text-[var(--navy)]">
                        {cls.name}
                      </h2>

                      <DomainSchematic
                        domains={cls.domains}
                        compartment={cls.compartment}
                        compact
                      />

                      <p className="text-[14.5px] leading-relaxed text-[var(--ink)]">{cls.summary}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
                      <span className="font-mono text-[13px] font-medium text-[var(--ink-secondary)]">
                        {cls.canonicalExamples.slice(0, 2).join(', ')}
                      </span>
                      <Link
                        href={`/prediction?example=${cls.key}`}
                        className="text-sm font-bold text-[var(--tomato)] hover:underline"
                      >
                        Load {cls.code} Example →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* TAB 3: Results & Structures */}
          <div
            role="tabpanel"
            data-tab-id="outputs"
            aria-labelledby="help-tab-outputs"
            hidden={activeTab !== 'outputs' ? ('until-found' as unknown as boolean) : undefined}
          >
            <div className="space-y-6 p-5 sm:p-7">
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="space-y-3 rounded-xl border border-[var(--line-strong)] bg-white p-5">
                  <h2 className="font-display text-xl font-bold text-[var(--navy)]">
                    Probability Ranks &amp; Exports
                  </h2>
                  <p className="text-[14.5px] leading-relaxed text-[var(--ink)]">
                    Result tables highlight the top three softmax probabilities per sequence and
                    let you export TSV, CSV, JSON, or per-family <code>.fasta</code> subsets.
                  </p>
                  <div className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line-strong)] font-mono text-[13.5px]">
                    <div className="prob-rank prob-rank-1 flex items-center justify-between px-3.5 py-2.5">
                      <span>
                        <span className="prob-rank-badge">1</span>
                        <strong className="text-[var(--navy)]">Rank 1</strong>
                      </span>
                      <span className="text-[var(--ink)]">Top predicted family</span>
                    </div>
                    <div className="prob-rank prob-rank-2 flex items-center justify-between px-3.5 py-2.5">
                      <span>
                        <span className="prob-rank-badge">2</span>
                        <strong className="text-[var(--navy)]">Rank 2</strong>
                      </span>
                      <span className="text-[var(--ink-secondary)]">Second-highest score</span>
                    </div>
                    <div className="prob-rank prob-rank-3 flex items-center justify-between px-3.5 py-2.5">
                      <span>
                        <span className="prob-rank-badge">3</span>
                        <strong className="text-[var(--navy)]">Rank 3</strong>
                      </span>
                      <span className="text-[var(--ink-secondary)]">Third-highest score</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-3 rounded-xl border border-[var(--line-strong)] bg-white p-5">
                  <h2 className="font-display text-xl font-bold text-[var(--navy)]">
                    2D Topology &amp; 3D Folding
                  </h2>
                  <ul className="divide-y divide-[var(--line)] text-[14.5px] text-[var(--ink)]">
                    <li className="py-2.5">
                      <strong className="text-[var(--navy)]">S4PRED 2D Topology:</strong> Predicts
                      Helix (<code>H</code>), Strand (<code>E</code>), and Coil (<code>C</code>)
                      states across full-length sequences with confidence tracks.
                    </li>
                    <li className="py-2.5">
                      <strong className="text-[var(--tomato)]">ESMFold 3D (≤400 aa):</strong>{' '}
                      Generates interactive 3D atomic coordinates colored by pLDDT with PDB
                      download.
                    </li>
                    <li className="pt-2.5">
                      <strong className="text-[var(--steel)]">Receptors &gt;400 aa:</strong>{' '}
                      Provides full-length 2D topology plus direct FASTA copy for AlphaFold Server
                      and SWISS-MODEL.
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>

          {/* TAB 4: Citation & FAQ */}
          <div
            role="tabpanel"
            data-tab-id="faq"
            aria-labelledby="help-tab-faq"
            hidden={activeTab !== 'faq' ? ('until-found' as unknown as boolean) : undefined}
          >
            <div className="space-y-6 p-5 sm:p-7">
              <section className="space-y-3 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-xl font-bold text-[var(--navy)]">
                    Primary Citation
                  </h2>
                  <button
                    type="button"
                    onClick={() => void copyBibtex()}
                    className="btn-outline-sharp py-1.5 px-3.5 text-sm"
                  >
                    {copiedBib ? (
                      <>
                        <Check className="h-4 w-4 text-[var(--tomato)]" aria-hidden="true" />
                        <span>Copied BibTeX</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        <span>Copy BibTeX</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[15px] leading-relaxed text-[var(--ink)]">
                  Duhan, N., &amp; Kaundal, R. (2025). PRGminer: harnessing deep learning for the
                  prediction of resistance genes involved in plant defense mechanisms.{' '}
                  <em className="font-semibold text-[var(--navy)]">Frontiers in Plant Science</em>,
                  16, 1411525.{' '}
                  <a
                    href="https://doi.org/10.3389/fpls.2025.1411525"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[var(--tomato)] hover:underline"
                  >
                    https://doi.org/10.3389/fpls.2025.1411525
                  </a>
                </p>
              </section>

              <section className="overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white">
                <div className="divide-y divide-[var(--line)]">
                  {FAQ_ITEMS.map((item) => (
                    <details key={item.q} open={item.defaultOpen} className="group">
                      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-5 py-4 text-[15.5px] font-bold text-[var(--navy)] hover:bg-[var(--surface)] [&::-webkit-details-marker]:hidden">
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-[var(--tomato)] transition-transform duration-150 group-open:rotate-90"
                          aria-hidden="true"
                        />
                        <span>{item.q}</span>
                      </summary>
                      <div className="px-5 pb-4 pl-11 text-[14.5px] leading-relaxed text-[var(--ink-secondary)]">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              <section className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-display text-lg font-bold text-[var(--navy)]">
                    Contact &amp; Support
                  </h2>
                  <p className="text-sm text-[var(--ink-secondary)]">
                    KAABiL Bioinformatics Laboratory · Utah State University
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <a href="mailto:naveen.duhan@usu.edu" className="btn-navy py-2 px-3.5 text-sm">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>naveen.duhan@usu.edu</span>
                  </a>
                  <a
                    href="https://github.com/usubioinfo/PRGminer/issues"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost-rule py-2 px-3.5 text-sm"
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
