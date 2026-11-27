'use client';

import Link from 'next/link';
import { Check, Copy } from 'lucide-react';
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

const VALIDATION_METRICS = [
  {
    stage: 'Phase I · 5-Fold CV',
    scope: 'Binary (R-Gene vs. Non-R-Gene)',
    accuracy: '98.75%',
    mcc: '0.98',
  },
  {
    stage: 'Phase I · Independent Test',
    scope: 'Held-out proteome benchmark',
    accuracy: '95.72%',
    mcc: '0.91',
  },
  {
    stage: 'Phase II · 5-Fold CV',
    scope: 'Multi-class (8 R-Gene families)',
    accuracy: '97.55%',
    mcc: '0.93',
  },
  {
    stage: 'Phase II · Independent Test',
    scope: 'Held-out 8-family benchmark',
    accuracy: '97.21%',
    mcc: '0.92',
  },
] as const;

const CLI_CURL_SNIPPET =
  'curl -fLO https://kaabil.net/prgminer/download/prgminer-standalone.tar.gz';

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
      // Clipboard unavailable in restricted contexts
    }
  };

  const copyCliCommand = async () => {
    try {
      await navigator.clipboard.writeText(CLI_CURL_SNIPPET);
      setCopiedCli(true);
      window.setTimeout(() => setCopiedCli(false), 2200);
    } catch {
      // Clipboard unavailable in restricted contexts
    }
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const total = QUICK_JUMP_CLASSES.length;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % total;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + total) % total;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = total - 1;
    }

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
    <div className="bg-white">
      {/* ==================== BAND 1: OPEN HEADER + PLANT CELL CUTAWAY ATLAS + FLAT SPECIMEN DOSSIER ==================== */}
      <section aria-labelledby="home-editorial-title">
        {/* Top Open Editorial Header */}
        <header className="pt-6 pb-5 border-b border-[var(--line)]">
          <p className="border-l-2 border-[var(--tomato)] pl-2.5 font-mono text-xs font-semibold tracking-wide text-[var(--muted)]">
            <span className="font-bold text-[var(--navy)]">Frontiers in Plant Science</span>
            {' · '}
            <span>16:1411525 (2025)</span>
            {' · '}
            <a
              href="https://doi.org/10.3389/fpls.2025.1411525"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--tomato)] underline decoration-[var(--tomato)]/45 underline-offset-2 hover:decoration-[var(--tomato)]"
            >
              DOI: 10.3389/fpls.2025.1411525
            </a>
          </p>

          <div className="mt-3.5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl space-y-2.5">
              <h1
                id="home-editorial-title"
                className="font-display text-2xl font-bold leading-[1.15] text-[var(--navy)] sm:text-3xl lg:text-[2.25rem]"
              >
                Plant Innate Immunity — Two-Phase Identification &amp; Classification of Resistance Genes
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
                PRGminer screens plant proteomes without homology-alignment bottlenecks by encoding
                primary amino acid sequences into 400-dimensional Dipeptide Composition (DPC)
                tensors evaluated by sequential convolutional neural networks. Phase I isolates
                disease resistance proteins from background sequences (98.75% CV accuracy), and
                Phase II resolves eight cell-surface PRR and cytoplasmic NLR families (97.55% CV
                accuracy).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 lg:shrink-0 lg:justify-end">
              <Link href="/prediction" className="btn-tomato">
                <span>Analyze FASTA Sequences →</span>
              </Link>
              <Link href="/prediction?example=panel" className="btn-outline-sharp">
                <span>9-Protein Benchmark</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Seamless White Plant Cell Cutaway Atlas */}
        <div className="bg-white">
          <div className="flex flex-col justify-between gap-1.5 border-b border-[var(--line)] py-2.5 text-xs sm:flex-row sm:items-center">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
              Interactive Two-Tier Surveillance Cutaway · PTI &amp; ETI
            </span>
            <p className="text-xs text-[var(--muted)]">
              Click any cell-surface PRR or cytoplasmic NLR complex in the cutaway—or select a
              family code below—to inspect its domain architecture and load a specimen.
            </p>
          </div>

          <div className="bg-white py-2">
            <PlantCellCutawaySVG selected={selectedKey} onSelect={setSelectedKey} />
          </div>
        </div>

        {/* Directly Attached Flat Hairline Specimen Strip */}
        <div
          id="specimen-dossier"
          className="border-y border-[var(--line)] bg-[var(--surface)]"
        >
          {/* Quick-Jump Family Code Strip Along Top Border */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-white px-3 sm:px-5">
            <div
              className="prg-tablist border-b-0"
              role="tablist"
              aria-label="Inspect R-gene family specimen"
            >
              {QUICK_JUMP_CLASSES.map((cls, index) => {
                const isSelected = activeClass.key === cls.key;
                return (
                  <button
                    key={cls.key}
                    ref={(el) => {
                      tabRefs.current[cls.key] = el;
                    }}
                    id={`specimen-tab-${cls.key}`}
                    type="button"
                    role="tab"
                    tabIndex={isSelected ? 0 : -1}
                    aria-selected={isSelected}
                    aria-controls={`specimen-panel-${cls.key}`}
                    onClick={() => setSelectedKey(cls.key)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    className="prg-tab"
                  >
                    <span className="font-mono text-xs font-extrabold tracking-wide">
                      {cls.code}
                    </span>
                    <span className="hidden font-mono text-[10px] font-medium text-[var(--muted)] sm:inline">
                      {cls.immuneLayer}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="hidden py-2 font-mono text-[11px] text-[var(--muted)] xl:inline">
              Active specimen: <strong className="text-[var(--navy)]">{activeClass.code}</strong> ·{' '}
              {activeClass.architectureFormula}
            </span>
          </div>

          {/* 2-Column Flat Specimen Readout */}
          <div
            id={`specimen-panel-${activeClass.key}`}
            role="tabpanel"
            aria-labelledby={`specimen-tab-${activeClass.key}`}
            className="grid divide-y divide-[var(--line)] lg:grid-cols-12 lg:divide-y-0 lg:divide-x"
          >
            {/* Left Column: Taxonomic & Mechanistic Dossier */}
            <div className="space-y-4 p-5 sm:p-6 lg:col-span-7">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-block rounded-[2px] bg-[var(--navy)] px-2 py-0.5 font-mono text-xs font-extrabold tracking-wider text-white">
                    {activeClass.code}
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
                    {activeClass.immuneLayerLabel}
                  </span>
                  <span className="text-[var(--line-strong)]" aria-hidden="true">
                    |
                  </span>
                  <span className="font-mono text-xs font-semibold text-[var(--muted)]">
                    {activeClass.architectureFormula}
                  </span>
                </div>

                <h2 className="font-display text-xl font-bold text-[var(--navy)] sm:text-2xl">
                  {activeClass.name}
                </h2>
              </div>

              <p className="text-sm leading-relaxed text-[var(--ink)]">{activeClass.summary}</p>

              <div className="border-t border-[var(--line)] pt-3">
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
                  Pathogen Recognition &amp; Immune Mechanism
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted)] sm:text-[0.84rem]">
                  {activeClass.mechanism}
                </p>
              </div>

              <div className="grid gap-4 border-t border-[var(--line)] pt-3 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
                    Canonical Plant Genes
                  </p>
                  <p className="mt-1 font-mono text-xs leading-relaxed text-[var(--ink)]">
                    {activeClass.canonicalExamples.join(' · ')}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--tomato)]">
                    Conserved Sequence Motifs
                  </p>
                  <ul className="mt-1 space-y-1">
                    {activeClass.conservedMotifs.map((motif) => (
                      <li
                        key={motif}
                        className="flex items-baseline gap-2 font-mono text-xs text-[var(--ink)]"
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 shrink-0 bg-[var(--tomato)]"
                          aria-hidden="true"
                        />
                        <span>{motif}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Scaled Domain Schematic & Direct Specimen Action */}
            <div className="flex flex-col justify-between gap-5 p-5 sm:p-6 lg:col-span-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
                    Scaled Polypeptide Architecture
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[var(--muted)]">
                    {activeClass.domains.length}{' '}
                    {activeClass.domains.length === 1 ? 'module' : 'modules'}
                  </span>
                </div>

                <DomainSchematic
                  domains={activeClass.domains}
                  compartment={activeClass.compartment}
                />

                <dl className="grid grid-cols-1 gap-1.5 pt-1 text-xs sm:grid-cols-2">
                  {activeClass.domains.map((dom, idx) => (
                    <div key={`${dom.code}-${idx}`} className="flex items-baseline gap-1.5">
                      <dt className="font-mono font-bold text-[var(--navy)]">{dom.code}:</dt>
                      <dd className="text-[var(--muted)]">{dom.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-[11px] leading-snug text-[var(--muted)]">
                  Curated benchmark FASTA ready for Phase I &amp; II execution.
                </p>
                <Link
                  href={`/prediction?example=${activeClass.key}`}
                  className="btn-tomato shrink-0"
                >
                  <span>Predict with {activeClass.code} Specimen →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BAND 2: COMPUTATIONAL METHOD PLATE (<DpcPipelineSVG />) ==================== */}
      <section
        aria-labelledby="method-plate-heading"
        className="py-10 border-b border-[var(--line)] grid lg:grid-cols-12 gap-8 items-center"
      >
        <div className="space-y-4 lg:col-span-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--tomato)]">
            Computational Methodology
          </p>
          <h2
            id="method-plate-heading"
            className="font-display text-2xl font-bold leading-tight text-[var(--navy)]"
          >
            Alignment-Free DPC Convolutional Screening
          </h2>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Profile-HMM pipelines often miss divergent R-genes in wild crop relatives. PRGminer
            transforms each primary amino acid sequence directly into a length-invariant{' '}
            <strong className="font-semibold text-[var(--ink)]">
              20×20 = 400 Dipeptide Composition (DPC)
            </strong>{' '}
            frequency tensor for rapid two-stage deep convolutional inference.
          </p>

          <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-xs">
            <div className="py-2.5">
              <dt className="font-mono font-bold text-[var(--navy)]">
                01 · Phase I Binary Gate (prgminer_phase1.tflite)
              </dt>
              <dd className="mt-0.5 leading-relaxed text-[var(--muted)]">
                Filters non-R-gene housekeeping proteins from proteome inputs while retaining
                candidate resistance proteins (<code className="font-mono">P ≥ 0.50</code>).
              </dd>
            </div>
            <div className="py-2.5">
              <dt className="font-mono font-bold text-[var(--tomato)]">
                02 · Phase II Family Classifier (prgminer_phase2.tflite)
              </dt>
              <dd className="mt-0.5 leading-relaxed text-[var(--muted)]">
                Assigns calibrated 8-class probabilities across{' '}
                <code className="font-mono text-[var(--ink)]">
                  CNL, TNL, RLK, RLP, LECRK, LYK, TIR, KIN
                </code>
                .
              </dd>
            </div>
            <div className="py-2.5">
              <dt className="font-mono font-bold text-[var(--navy)]">
                03 · 2D Topology &amp; 3D Folding
              </dt>
              <dd className="mt-0.5 leading-relaxed text-[var(--muted)]">
                Integrates single-sequence S4PRED secondary structure tracks alongside ESMFold and
                SWISS-MODEL 3D coordinate inspection.
              </dd>
            </div>
          </dl>
        </div>

        <figure className="lg:col-span-8">
          <div className="border-y border-[var(--line)] bg-white py-3">
            <DpcPipelineSVG selected={selectedKey} onSelect={setSelectedKey} />
          </div>
          <figcaption className="mt-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[var(--muted)]">
            <span>
              <strong className="font-bold text-[var(--navy)]">Figure 1</strong> · Alignment-free
              DPC convolutional cascade
            </span>
            <span>
              Selected track: <strong className="text-[var(--tomato)]">{activeClass.code}</strong>{' '}
              (click any Phase II track to switch)
            </span>
          </figcaption>
        </figure>
      </section>

      {/* ==================== BAND 3: PUBLISHED VALIDATION TABLE & 8-CLASS REFERENCE MATRIX ==================== */}
      <section
        aria-label="Published validation metrics and 8-class reference matrix"
        className="py-10 border-b border-[var(--line)] grid lg:grid-cols-12 gap-8"
      >
        {/* Left 5 Cols: Published Validation Table */}
        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-[var(--navy)]">
                Published Validation Metrics
              </h2>
              <span className="font-mono text-[11px] font-semibold text-[var(--muted)]">
                Front. Plant Sci. (2025)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-t-2 border-[var(--navy)] border-b border-[var(--line)] text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--line-strong)] bg-[var(--surface)] font-mono text-[11px] uppercase tracking-wider text-[var(--navy)]">
                    <th scope="col" className="py-2.5 pr-3 pl-2 font-bold">
                      Benchmark Partition
                    </th>
                    <th scope="col" className="py-2.5 px-2 text-right font-bold">
                      Acc.
                    </th>
                    <th scope="col" className="py-2.5 pr-2 pl-2 text-right font-bold">
                      MCC
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {VALIDATION_METRICS.map((row) => (
                    <tr key={row.stage} className="hover:bg-[var(--surface)]">
                      <th scope="row" className="py-3 pr-3 pl-2 font-normal">
                        <span className="block font-semibold text-[var(--ink)]">{row.stage}</span>
                        <span className="block text-[11px] text-[var(--muted)]">{row.scope}</span>
                      </th>
                      <td className="py-3 px-2 text-right font-mono text-sm font-bold tabular-nums text-[var(--navy)]">
                        {row.accuracy}
                      </td>
                      <td className="py-3 pr-2 pl-2 text-right font-mono text-sm font-bold tabular-nums text-[var(--tomato)]">
                        {row.mcc}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-[var(--line-strong)] bg-[var(--surface)] font-mono text-xs">
                  <tr className="border-b border-[var(--line)]">
                    <th scope="row" className="py-2.5 pr-3 pl-2 font-semibold text-[var(--navy)]">
                      Web Workbench Throughput
                    </th>
                    <td
                      colSpan={2}
                      className="py-2.5 pr-2 pl-2 text-right font-bold text-[var(--ink)]"
                    >
                      ≤10,000 seqs / batch
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2.5 pr-3 pl-2 font-semibold text-[var(--navy)]">
                      Standalone CLI Throughput
                    </th>
                    <td
                      colSpan={2}
                      className="py-2.5 pr-2 pl-2 text-right font-bold text-[var(--tomato)]"
                    >
                      Unlimited (offline proteome)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
            Cross-validation (5-fold) and independent blind-test benchmarks reported in Duhan &amp;
            Kaundal (2025) using non-redundant plant resistance and background protein datasets.
          </p>
        </div>

        {/* Right 7 Cols: 8-Row Reference Matrix */}
        <div className="lg:col-span-7">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold text-[var(--navy)]">
              Eight-Class R-Gene Reference Matrix
            </h2>
            <span className="font-mono text-[11px] text-[var(--muted)]">
              Click any row to inspect above or launch its FASTA specimen
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-t-2 border-[var(--tomato)] border-b border-[var(--line)] text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--line-strong)] bg-[var(--surface)] font-mono text-[11px] uppercase tracking-wider text-[var(--navy)]">
                  <th scope="col" className="py-2.5 pr-3 pl-2.5 font-bold">
                    Family
                  </th>
                  <th scope="col" className="py-2.5 px-2.5 font-bold">
                    Localization
                  </th>
                  <th scope="col" className="py-2.5 px-2.5 font-bold">
                    Architecture
                  </th>
                  <th scope="col" className="hidden py-2.5 px-2.5 font-bold sm:table-cell">
                    Exemplars
                  </th>
                  <th scope="col" className="py-2.5 pr-2.5 pl-2 text-right font-bold">
                    Specimen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {RGENE_CLASSES.map((cls) => {
                  const isActive = activeClass.key === cls.key;
                  const shortLocalization =
                    cls.compartment === 'Plasma Membrane (Cell Surface)'
                      ? 'Plasma Membrane'
                      : 'Cytoplasmic';

                  return (
                    <tr
                      key={cls.key}
                      onClick={() => setSelectedKey(cls.key)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[var(--tomato-soft)]'
                          : 'bg-white hover:bg-[var(--surface)]'
                      }`}
                    >
                      <th
                        scope="row"
                        className={`py-2.5 pr-3 pl-2.5 font-mono font-extrabold ${
                          isActive
                            ? 'border-l-[3px] border-l-[var(--tomato)] text-[var(--tomato)]'
                            : 'border-l-[3px] border-l-transparent text-[var(--navy)]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedKey(cls.key);
                          }}
                          className="font-mono text-xs font-extrabold tracking-wide text-left focus-visible:underline"
                          aria-pressed={isActive}
                        >
                          {cls.code}
                        </button>
                      </th>
                      <td className="py-2.5 px-2.5 text-[var(--muted)]">
                        <span className="text-[var(--ink)]">{shortLocalization}</span>{' '}
                        <span className="font-mono text-[10px] text-[var(--muted)]">
                          ({cls.immuneLayer})
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-[11px] font-semibold text-[var(--navy)]">
                        {cls.architectureFormula}
                      </td>
                      <td className="hidden py-2.5 px-2.5 text-[var(--muted)] sm:table-cell">
                        {cls.canonicalExamples.slice(0, 2).join(', ')}
                      </td>
                      <td className="py-2.5 pr-2.5 pl-2 text-right whitespace-nowrap">
                        <Link
                          href={`/prediction?example=${cls.key}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs font-bold text-[var(--tomato)] hover:text-[var(--tomato-dark)] hover:underline"
                        >
                          [Test →]
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ==================== BAND 4: FLAT CITATION & STANDALONE CLI STRIP ==================== */}
      <section
        aria-label="Citation and standalone command-line distribution"
        className="pt-8 pb-4 grid lg:grid-cols-12 gap-8"
      >
        {/* Left 7 Cols: Formatted Citation + BibTeX Copy */}
        <div className="space-y-3.5 lg:col-span-7">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--navy)]">
            Primary Publication &amp; Citation
          </p>

          <blockquote className="border-l-2 border-[var(--tomato)] pl-4 text-sm leading-relaxed text-[var(--ink)]">
            Duhan, N., &amp; Kaundal, R. (2025). PRGminer: harnessing deep learning for the
            prediction of resistance genes involved in plant defense mechanisms.{' '}
            <em className="font-semibold text-[var(--navy)]">Frontiers in Plant Science</em>, 16,
            1411525.{' '}
            <a
              href="https://doi.org/10.3389/fpls.2025.1411525"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs font-semibold text-[var(--tomato)] underline decoration-[var(--tomato)]/45 underline-offset-2 hover:decoration-[var(--tomato)]"
            >
              https://doi.org/10.3389/fpls.2025.1411525
            </a>
          </blockquote>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => void copyBibtex()}
              className="btn-outline-sharp text-xs"
            >
              {copiedBib ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--tomato)]" aria-hidden="true" />
                  <span>Copied BibTeX</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy BibTeX</span>
                </>
              )}
            </button>

            <a
              href="https://doi.org/10.3389/fpls.2025.1411525"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost-rule text-xs"
            >
              <span>Read Journal Article ↗</span>
            </a>
          </div>
        </div>

        {/* Right 5 Cols: Compact USU Navy CLI Snippet & Standalone Link */}
        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--tomato)]">
              Standalone CLI · Whole-Proteome Scale
            </p>
            <Link
              href="/standalone"
              className="font-mono text-xs font-bold text-[var(--navy)] hover:text-[var(--tomato)] hover:underline"
            >
              Documentation &amp; SHA-256 →
            </Link>
          </div>

          <p className="text-xs leading-relaxed text-[var(--muted)]">
            Screen complete crop or wild-relative proteomes (&gt;10,000 sequences) locally on Linux
            or macOS workstations with bundled <code className="font-mono">.tflite</code> Phase I
            &amp; II checkpoints:
          </p>

          <div className="rounded-[3px] border border-[var(--navy-dark)] bg-[#0f2744] text-white">
            <div className="flex items-center justify-between border-b border-white/15 px-3 py-1.5 font-mono text-[11px] text-slate-300">
              <span>zsh / bash</span>
              <button
                type="button"
                onClick={() => void copyCliCommand()}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-200 hover:text-white"
              >
                {copiedCli ? (
                  <>
                    <Check className="h-3 w-3 text-[#ff6f61]" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto px-3.5 py-3 font-mono text-xs leading-relaxed text-slate-100">
              <code>{CLI_CURL_SNIPPET}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
