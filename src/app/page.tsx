'use client';

import Link from 'next/link';
import { ArrowRight, Check, Copy, ExternalLink } from 'lucide-react';
import { useRef, useState } from 'react';
import DomainSchematic from '@/components/DomainSchematic';
import DpcPipelineSVG from '@/components/DpcPipelineSVG';
import PlantCellCutawaySVG from '@/components/PlantCellCutawaySVG';
import {
  RGENE_CLASSES,
  type RGeneClassInfo,
  type RGeneClassKey,
} from '@/data/rgene-classes';

const QUICK_JUMP_ORDER: readonly RGeneClassKey[] = [
  'rlk',
  'lecrk',
  'lyk',
  'rlp',
  'cnl',
  'tnl',
  'tir',
  'kin',
];

const QUICK_JUMP_CLASSES: readonly RGeneClassInfo[] = QUICK_JUMP_ORDER.map(
  (key) => RGENE_CLASSES.find((item) => item.key === key) ?? RGENE_CLASSES[0],
);

const CLI_SNIPPET = `git clone https://github.com/usubioinfo/PRGminer.git
cd PRGminer && uv sync --python 3.11
uv run prgminer -i PRGminer/example/example.fasta -od results_phase2 -l Phase2`;

const BIBTEX = `@article{Duhan2025PRGminer,
  author  = {Duhan, Naveen and Kaundal, Rakesh},
  title   = {PRGminer: harnessing deep learning for the prediction of resistance genes involved in plant defense mechanisms},
  journal = {Frontiers in Plant Science},
  volume  = {16},
  pages   = {1411525},
  year    = {2025},
  doi     = {10.3389/fpls.2025.1411525}
}`;

export default function HomePage() {
  const [selectedKey, setSelectedKey] = useState<RGeneClassKey>('cnl');
  const [copiedBib, setCopiedBib] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeClass =
    RGENE_CLASSES.find((item) => item.key === selectedKey) ?? RGENE_CLASSES[0];

  const copyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      setCopiedBib(true);
      window.setTimeout(() => setCopiedBib(false), 2200);
    } catch {
      // Clipboard unavailable
    }
  };

  const copyCliCommand = async () => {
    try {
      await navigator.clipboard.writeText(CLI_SNIPPET);
      setCopiedCli(true);
      window.setTimeout(() => setCopiedCli(false), 2200);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const total = QUICK_JUMP_CLASSES.length;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % total;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + total) % total;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = total - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      const target = QUICK_JUMP_CLASSES[nextIndex];
      if (target) {
        setSelectedKey(target.key);
        tabRefs.current[target.key]?.focus();
      }
    }
  };

  return (
    <div className="space-y-12 py-6 pb-10">
      {/* ==================== SECTION 1: CONCISE HEADER + CAPABILITY STRIP + INTERACTIVE IMMUNITY CUTAWAY ==================== */}
      <section aria-labelledby="home-editorial-title" className="space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-[var(--line-strong)] pb-5 lg:flex-row lg:items-center">
          <div className="min-w-0 space-y-1.5">
            <h1
              id="home-editorial-title"
              className="font-display text-2xl font-bold tracking-tight text-[var(--navy)] sm:text-3xl"
            >
              PRGminer:{' '}
              <span className="text-[var(--tomato)]">
                Plant Resistance Gene Identification &amp; Classification
              </span>
            </h1>
            <p className="max-w-4xl text-base leading-7 text-[var(--ink)]">
              Identifies plant disease resistance proteins (Phase I) and classifies them across
              eight cell-surface PRR and intracellular NLR receptor families (Phase II) directly
              from amino acid FASTA sequences.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/prediction" className="btn-tomato py-3 px-6 text-base">
              <span>Predict Sequences</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Rounded 4-Capability Summary Row */}
        <dl className="grid grid-cols-2 divide-x divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] lg:grid-cols-4 lg:divide-y-0">
          {[
            ['2 Phases', 'Sequential CNN Cascade', 'Binary screen + family assignment'],
            ['8 Families', 'PRR & NLR Receptors', 'RLK, RLP, LECRK, LYK, CNL, TNL, TIR, KIN'],
            ['400-D DPC', 'Alignment-Free Encoding', '20×20 dipeptide frequency tensor'],
            ['2D & 3D Views', 'Structure Integration', 'S4PRED topology & ESMFold (≤400 aa)'],
          ].map(([val, label, note]) => (
            <div key={label} className="px-4 py-4 sm:px-5">
              <dt className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
                {label}
              </dt>
              <dd className="mt-1 font-display text-2xl font-bold text-[var(--navy)]">{val}</dd>
              <p className="mt-0.5 text-sm font-semibold text-[var(--tomato)]">{note}</p>
            </div>
          ))}
        </dl>

        {/* Rounded Interactive Plant Cell Cutaway + 8-Family Inspector */}
        <div className="overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-white shadow-[0_2px_12px_rgba(15,39,68,0.04)]">
          <figure className="border-b border-[var(--line)] bg-white p-4 sm:p-5">
            <div className="mb-3 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
                Interactive Plant Cell Immunity Cutaway · PTI &amp; ETI
              </span>
              <span className="text-sm font-medium text-[var(--ink-secondary)]">
                Click any receptor in the diagram or select a family tab below
              </span>
            </div>
            <PlantCellCutawaySVG selected={selectedKey} onSelect={setSelectedKey} />
          </figure>

          {/* Family Selector Tab Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-4">
            <div
              className="prg-tablist border-b-0"
              role="tablist"
              aria-label="Inspect R-gene family"
            >
              {QUICK_JUMP_CLASSES.map((cls, index) => {
                const isSelected = activeClass.key === cls.key;
                return (
                  <button
                    key={cls.key}
                    ref={(el) => {
                      tabRefs.current[cls.key] = el;
                    }}
                    id={`family-tab-${cls.key}`}
                    type="button"
                    role="tab"
                    tabIndex={isSelected ? 0 : -1}
                    aria-selected={isSelected}
                    aria-controls={`family-panel-${cls.key}`}
                    onClick={() => setSelectedKey(cls.key)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    className="prg-tab"
                  >
                    <span className="font-mono text-sm font-extrabold tracking-wide">
                      {cls.code}
                    </span>
                    <span className="hidden font-mono text-xs font-bold text-[var(--tomato)] sm:inline">
                      {cls.immuneLayer}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="hidden py-2 font-mono text-sm font-semibold text-[var(--ink-secondary)] xl:inline">
              Active: <strong className="text-[var(--navy)]">{activeClass.code}</strong> ·{' '}
              {activeClass.architectureFormula}
            </span>
          </div>

          {/* 2-Column Family Readout */}
          <div
            id={`family-panel-${activeClass.key}`}
            role="tabpanel"
            aria-labelledby={`family-tab-${activeClass.key}`}
            className="grid divide-y divide-[var(--line)] bg-white lg:grid-cols-12 lg:divide-y-0 lg:divide-x"
          >
            {/* Left Column */}
            <div className="space-y-4 p-5 sm:p-6 lg:col-span-7">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-block rounded-lg bg-[var(--navy)] px-2.5 py-1 font-mono text-xs font-extrabold tracking-wider text-white">
                    {activeClass.code}
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
                    {activeClass.immuneLayerLabel}
                  </span>
                  <span className="text-[var(--line-strong)]" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono text-sm font-bold text-[var(--ink-secondary)]">
                    {activeClass.architectureFormula}
                  </span>
                </div>

                <h2 className="font-display text-2xl font-bold text-[var(--navy)]">
                  {activeClass.name}
                </h2>
              </div>

              <p className="text-[15.5px] leading-relaxed text-[var(--ink)]">
                {activeClass.summary}
              </p>

              <div className="border-t border-[var(--line)] pt-3">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
                  Pathogen Recognition &amp; Immune Mechanism
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-secondary)]">
                  {activeClass.mechanism}
                </p>
              </div>

              <div className="grid gap-4 border-t border-[var(--line)] pt-3 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
                    Representative Plant R-Genes
                  </p>
                  <p className="mt-1.5 font-mono text-sm leading-relaxed text-[var(--ink)]">
                    {activeClass.canonicalExamples.join(' · ')}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
                    Conserved Sequence Motifs
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {activeClass.conservedMotifs.map((motif) => (
                      <li
                        key={motif}
                        className="flex items-baseline gap-2 font-mono text-sm text-[var(--ink)]"
                      >
                        <span
                          className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--tomato)]"
                          aria-hidden="true"
                        />
                        <span>{motif}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Scaled Domain Schematic & Direct Example Action */}
            <div className="flex flex-col justify-between gap-5 bg-[var(--surface)] p-5 sm:p-6 lg:col-span-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
                    Polypeptide Domain Organization
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--ink-secondary)]">
                    {activeClass.domains.length}{' '}
                    {activeClass.domains.length === 1 ? 'module' : 'modules'}
                  </span>
                </div>

                <DomainSchematic
                  domains={activeClass.domains}
                  compartment={activeClass.compartment}
                />

                <dl className="grid grid-cols-1 gap-1.5 pt-1 text-sm sm:grid-cols-2">
                  {activeClass.domains.map((dom, idx) => (
                    <div key={`${dom.code}-${idx}`} className="flex items-baseline gap-1.5">
                      <dt className="font-mono font-bold text-[var(--navy)]">{dom.code}:</dt>
                      <dd className="text-[var(--ink-secondary)]">{dom.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="border-t border-[var(--line)] pt-4">
                <Link
                  href={`/prediction?example=${activeClass.key}`}
                  className="btn-tomato w-full"
                >
                  <span>Load {activeClass.code} Example →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 2: PREDICTION WORKFLOW ==================== */}
      <section aria-labelledby="method-plate-heading" className="space-y-4">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
              Prediction Workflow
            </p>
            <h2
              id="method-plate-heading"
              className="mt-1 font-display text-2xl font-bold text-[var(--navy)] sm:text-[1.7rem]"
            >
              Alignment-free DPC convolutional pipeline
            </h2>
          </div>
          <p className="max-w-xl text-[15px] leading-6 text-[var(--ink-secondary)] lg:text-right">
            Encodes each primary amino acid sequence into a length-invariant 20×20 = 400 Dipeptide
            Composition (DPC) tensor for sequential Phase I and Phase II inference.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-white shadow-[0_2px_12px_rgba(15,39,68,0.04)]">
          <div className="p-4 sm:p-6">
            <DpcPipelineSVG selected={selectedKey} onSelect={setSelectedKey} />
          </div>

          <div className="grid divide-y divide-[var(--line)] border-t border-[var(--line-strong)] bg-[var(--surface)] md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="p-5">
              <span className="font-mono text-xs font-extrabold uppercase text-[var(--navy)]">
                01 · Phase I Binary Screen
              </span>
              <h3 className="mt-1 font-display text-lg font-bold text-[var(--navy)]">
                Rgene vs. Non-Rgene
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink)]">
                Separates candidate plant disease resistance proteins (<code>Rgene ≥ 50%</code>)
                from background sequences.
              </p>
            </div>

            <div className="p-5">
              <span className="font-mono text-xs font-extrabold uppercase text-[var(--tomato)]">
                02 · Phase II Family Classifier
              </span>
              <h3 className="mt-1 font-display text-lg font-bold text-[var(--navy)]">
                8 Receptor Families
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink)]">
                Assigns calibrated softmax probabilities across{' '}
                <code className="font-mono font-bold">CNL, TNL, RLK, RLP, LECRK, LYK, TIR, KIN</code>.
              </p>
            </div>

            <div className="p-5">
              <span className="font-mono text-xs font-extrabold uppercase text-[var(--steel)]">
                03 · Structure &amp; FASTA Export
              </span>
              <h3 className="mt-1 font-display text-lg font-bold text-[var(--navy)]">
                2D Topology &amp; 3D Coordinates
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink)]">
                Exports per-family <code>.fasta</code> subsets alongside S4PRED secondary structure
                and ESMFold 3D folding (≤400 aa).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 3: STANDALONE CLI + PRIMARY CITATION ==================== */}
      <section
        aria-label="Standalone CLI and primary publication"
        className="grid gap-6 border-t border-[var(--line-strong)] pt-10 lg:grid-cols-2"
      >
        <div className="space-y-3 rounded-2xl border border-[var(--line-strong)] bg-[var(--surface)] p-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
              Standalone Python CLI
            </p>
            <Link
              href="/standalone"
              className="text-sm font-bold text-[var(--navy)] hover:text-[var(--tomato)] hover:underline"
            >
              Download .tar.gz →
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--navy-dark)] bg-[#0f2744] text-white">
            <div className="flex items-center justify-between border-b border-white/15 px-3.5 py-2 font-mono text-xs text-slate-200">
              <span>bash / zsh</span>
              <button
                type="button"
                onClick={() => void copyCliCommand()}
                className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs font-semibold text-white hover:text-[#ff9c92]"
              >
                {copiedCli ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#ff867a]" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[13.5px] leading-6 text-slate-100">
              <code>{CLI_SNIPPET}</code>
            </pre>
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-3 rounded-2xl border border-[var(--line-strong)] bg-[var(--surface)] p-5">
          <div className="space-y-2">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
              Primary Publication
            </p>
            <p className="text-[15px] leading-relaxed text-[var(--ink)]">
              Duhan, N., &amp; Kaundal, R. (2025). PRGminer: harnessing deep learning for the
              prediction of resistance genes involved in plant defense mechanisms.{' '}
              <em className="font-semibold text-[var(--navy)]">Frontiers in Plant Science</em>, 16,
              1411525.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => void copyBibtex()}
              className="btn-outline-sharp py-2 px-4 text-sm"
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

            <a
              href="https://doi.org/10.3389/fpls.2025.1411525"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost-rule py-2 px-4 text-sm"
            >
              <span>Journal Article</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
