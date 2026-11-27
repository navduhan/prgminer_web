'use client';

import {
  Check,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  FileSpreadsheet,
  HardDrive,
  Layers,
  Terminal,
} from 'lucide-react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { withBasePath } from '@/lib/base-path';

type InstallTabId = 'github' | 'tarball' | 'conda';

const INSTALL_TABS: ReadonlyArray<{
  id: InstallTabId;
  label: string;
  summary: string;
  commands: string;
}> = [
  {
    id: 'github',
    label: 'GitHub + uv / pip',
    summary:
      'Clone directly from usubioinfo/PRGminer. All Phase I & Phase II .keras and .tflite weights are bundled inside the repository and verified via SHA-256 checksums.',
    commands: `# 1. Clone repository (includes bundled .keras and .tflite models)
git clone https://github.com/usubioinfo/PRGminer.git
cd PRGminer

# 2. Install with uv (or standard pip install .)
uv sync --python 3.11
uv run prgminer --models-status

# 3. Run two-phase R-gene prediction (.keras default, or -b tflite)
uv run prgminer -i PRGminer/example/example.fasta -od results_phase2 -l Phase2`,
  },
  {
    id: 'tarball',
    label: 'Versioned Tarball (.tar.gz)',
    summary:
      'Download the pinned standalone source archive built directly from GitHub with its published commit hash and SHA-256 checksum.',
    commands: `# 1. Download standalone archive & verify SHA-256 checksum
curl -fLO https://kaabil.net/prgminer/download/prgminer-standalone.tar.gz
curl -fLO https://kaabil.net/prgminer/download/SHA256SUMS
sha256sum -c SHA256SUMS

# 2. Extract and install into an isolated Python environment
tar -xzf prgminer-standalone.tar.gz
cd PRGminer
pip install .

# 3. Execute fast TFLite or Keras inference
prgminer -i PRGminer/example/example.fasta -od results_phase2 -l Phase2 -b tflite`,
  },
  {
    id: 'conda',
    label: 'Conda / Mamba',
    summary:
      'Create a reproducible Conda environment from environment.yml for Linux or macOS workstations.',
    commands: `# 1. Create and activate the PRGminer Conda environment
conda env create -f environment.yml
conda activate PRGminer

# 2. Verify bundled .keras & .tflite model checksums
PRGminer --models-status

# 3. Screen a whole-genome translated plant proteome
PRGminer -i proteome.fasta -od ./prgminer_out -o PRGminer_results.tsv -l Phase2`,
  },
];

const OUTPUT_FILES = [
  {
    filename: 'PRGminer_results.txt',
    phase: 'Phase1 & Phase2',
    description:
      'Primary consolidated report (customizable via -o) listing each input sequence ID, predicted R-gene status or family, and top confidence score.',
  },
  {
    filename: 'Phase1_predictions.tsv',
    phase: 'Phase1 & Phase2',
    description:
      'Complete binary CNN gate matrix reporting Non-Rgene (%) and Rgene (%) softmax probabilities for every screened protein.',
  },
  {
    filename: 'Phase2_predictions.tsv',
    phase: 'Phase2 only',
    description:
      '8-class softmax distribution (CNL, KIN, LYK, LECRK, RLK, RLP, TIR, TNL) for all candidates passing Phase I (Rgene >= 50%).',
  },
  {
    filename: 'prediction_summary.txt',
    phase: 'Phase1 & Phase2',
    description:
      'Plain-text run ledger recording input FASTA path, sequence counts, Phase I pass rate, per-class tallies, and execution wall time.',
  },
] as const;

const CLI_FLAGS = [
  {
    flag: '-i, --fasta_file',
    defaultVal: 'Required',
    required: true,
    spec: 'Input protein FASTA path (>= 10 aa standard amino acid sequences).',
  },
  {
    flag: '-od, --output_dir',
    defaultVal: 'PRGminer_results',
    required: false,
    spec: 'Destination directory for TSV tables and run summary; created if absent.',
  },
  {
    flag: '-o, --output_file',
    defaultVal: 'PRGminer_results.txt',
    required: false,
    spec: 'Filename for the primary consolidated report written inside -od.',
  },
  {
    flag: '-l, --level',
    defaultVal: 'Phase2',
    required: false,
    spec: 'Inference depth: Phase1 (binary Rgene/Non-Rgene) or Phase2 (Phase I + 8 families).',
  },
  {
    flag: '-b, --backend',
    defaultVal: 'auto',
    required: false,
    spec: 'Model runtime: auto, keras (.keras checkpoints), or tflite (.tflite XNNPACK engine).',
  },
  {
    flag: '--models-status',
    defaultVal: 'Flag',
    required: false,
    spec: 'Verify SHA-256 checksums of bundled .keras and .tflite weights and exit.',
  },
  {
    flag: '-v, --version',
    defaultVal: 'Flag',
    required: false,
    spec: 'Print installed PRGminer CLI version and exit.',
  },
] as const;

export default function StandalonePage() {
  const [selectedTab, setSelectedTab] = useState<InstallTabId>('github');
  const [copiedId, setCopiedId] = useState('');
  const tabRefs = useRef<Record<InstallTabId, HTMLButtonElement | null>>({
    github: null,
    tarball: null,
    conda: null,
  });

  const copyBlock = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const selectAndRevealTab = (id: InstallTabId, focus = false) => {
    setSelectedTab(id);
    const btn = tabRefs.current[id];
    if (btn) {
      if (focus) btn.focus();
      btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const idx = INSTALL_TABS.findIndex((t) => t.id === selectedTab);
    if (idx === -1) return;
    let nextIdx = -1;
    if (event.key === 'ArrowRight') {
      nextIdx = (idx + 1) % INSTALL_TABS.length;
    } else if (event.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + INSTALL_TABS.length) % INSTALL_TABS.length;
    } else if (event.key === 'Home') {
      nextIdx = 0;
    } else if (event.key === 'End') {
      nextIdx = INSTALL_TABS.length - 1;
    }
    if (nextIdx !== -1) {
      event.preventDefault();
      selectAndRevealTab(INSTALL_TABS[nextIdx].id, true);
    }
  };

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Open Architectural Masthead + Tomato-Ruled Download Ledger */}
      <header className="grid gap-6 border-b border-[var(--line)] pb-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <div className="space-y-3">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--tomato)]">
            Standalone CLI Distribution · Offline Proteome Screening
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-[var(--navy)] sm:text-4xl">
            Run PRGminer locally on whole plant proteomes
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            For unrestricted genome-wide screens exceeding the 10,000-sequence web workbench cap or
            automated integration into local bioinformatics workflows, install the standalone Python
            package. Both <code className="font-mono text-[var(--ink)]">.keras</code> (Keras 3) and{' '}
            <code className="font-mono text-[var(--ink)]">.tflite</code> (LiteRT / TensorFlow Lite)
            checkpoints are bundled directly in the repository with SHA-256 checksum verification—no
            separate model download step is required.
          </p>

          <dl className="flex flex-wrap gap-x-6 gap-y-2 pt-1 font-mono text-xs text-[var(--muted)]">
            <div>
              <dt className="inline font-bold text-[var(--navy)]">Bundled Formats: </dt>
              <dd className="inline">.keras (Keras 3) + .tflite (LiteRT)</dd>
            </div>
            <div>
              <dt className="inline font-bold text-[var(--navy)]">Encoding: </dt>
              <dd className="inline">400-D Dipeptide Composition</dd>
            </div>
            <div>
              <dt className="inline font-bold text-[var(--navy)]">License: </dt>
              <dd className="inline">GPL-3.0-or-later</dd>
            </div>
          </dl>
        </div>

        <div className="border border-[var(--line)] border-t-2 border-t-[var(--tomato)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
            <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-[var(--navy)]">
              Versioned GitHub Archive
            </span>
            <span className="rounded-[2px] border border-[var(--line-strong)] bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--tomato)]">
              .keras + .tflite
            </span>
          </div>

          <h2 className="mt-3 font-mono text-base font-bold text-[var(--navy)]">
            prgminer-standalone.tar.gz
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
            Packaged directly from the verified GitHub revision with{' '}
            <code className="font-mono text-[var(--ink)]">prgminer_phase1.{'{keras,tflite}'}</code>,{' '}
            <code className="font-mono text-[var(--ink)]">prgminer_phase2.{'{keras,tflite}'}</code>,{' '}
            <code className="font-mono text-[var(--ink)]">model_manifest.json</code>,{' '}
            <code className="font-mono text-[var(--ink)]">pyproject.toml</code>, and example FASTA
            sequences.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={withBasePath('/download/prgminer-standalone.tar.gz')}
              className="btn-tomato text-xs"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Download .tar.gz</span>
            </a>
            <a
              href={withBasePath('/download/SHA256SUMS')}
              className="btn-ghost-rule font-mono text-xs"
            >
              <span>SHA-256 Checksum</span>
            </a>
            <a
              href={withBasePath('/download/REVISION.txt')}
              className="btn-ghost-rule font-mono text-xs"
            >
              <span>Commit Revision</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main 2-Column Architectural Grid */}
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        {/* Left Column: Installation Workflows + Output File Specification */}
        <div className="space-y-8 min-w-0">
          <section
            aria-labelledby="install-heading"
            className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-5 py-3.5">
              <h2
                id="install-heading"
                className="font-display text-xl font-semibold text-[var(--navy)]"
              >
                Installation &amp; CLI Usage
              </h2>
              <span className="font-mono text-[11px] font-semibold text-[var(--muted)]">
                Python 3.10+ · Linux &amp; macOS
              </span>
            </div>

            <div
              className="prg-tablist bg-[var(--surface)] px-3 sm:px-5"
              role="tablist"
              aria-label="Standalone installation methods"
              onKeyDown={handleTabKeyDown}
            >
              {INSTALL_TABS.map((tab) => {
                const active = selectedTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[tab.id] = el;
                    }}
                    id={`install-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    tabIndex={active ? 0 : -1}
                    aria-selected={active}
                    onClick={() => selectAndRevealTab(tab.id)}
                    className="prg-tab"
                  >
                    <Terminal className="h-4 w-4" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div>
              {INSTALL_TABS.map((tab) => {
                const active = selectedTab === tab.id;
                return (
                  <div
                    key={tab.id}
                    role="tabpanel"
                    aria-labelledby={`install-tab-${tab.id}`}
                    hidden={!active}
                  >
                    <div className="space-y-4 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="max-w-xl text-xs leading-relaxed text-[var(--muted)]">
                          {tab.summary}
                        </p>
                        <button
                          type="button"
                          onClick={() => void copyBlock(tab.id, tab.commands)}
                          className="btn-ghost-rule shrink-0 !min-h-0 !px-3 !py-1.5 font-mono text-xs"
                        >
                          {copiedId === tab.id ? (
                            <>
                              <Check
                                className="h-3.5 w-3.5 text-[var(--tomato)]"
                                aria-hidden="true"
                              />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Copy Commands</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="overflow-x-auto rounded-[2px] border border-[var(--navy-dark)] bg-[#0f2744] p-4 font-mono text-xs leading-6 text-slate-100 sm:p-5">
                        <code>{tab.commands}</code>
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Output File Reference Table */}
          <section
            aria-labelledby="output-artifacts-heading"
            className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-[var(--tomato)]" aria-hidden="true" />
                <h2
                  id="output-artifacts-heading"
                  className="font-display text-xl font-semibold text-[var(--navy)]"
                >
                  Output Directory Schema
                </h2>
              </div>
              <span className="font-mono text-[11px] text-[var(--muted)]">
                Written to <code>-od / --output_dir</code>
              </span>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-labelledby="output-artifacts-heading"
              className="prg-table-region"
            >
              <table className="prg-table prg-table-responsive text-left text-xs">
                <caption className="sr-only">
                  Files generated by the PRGminer standalone command-line interface
                </caption>
                <thead>
                  <tr className="border-b border-[var(--line)] font-mono text-[11px] uppercase tracking-wider text-[var(--navy)]">
                    <th scope="col" className="px-4 py-3 font-bold">
                      Filename
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Cascade Mode
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Contents &amp; Columns
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {OUTPUT_FILES.map((row) => (
                    <tr key={row.filename}>
                      <th
                        scope="row"
                        className="whitespace-nowrap px-4 py-3 font-mono font-bold text-[var(--navy)]"
                      >
                        {row.filename}
                      </th>
                      <td
                        data-label="Cascade Mode"
                        className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-semibold text-[var(--tomato)]"
                      >
                        {row.phase}
                      </td>
                      <td
                        data-label="Contents"
                        className="px-4 py-3 leading-relaxed text-[var(--muted)]"
                      >
                        {row.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: System Requirements + CLI Flag Reference */}
        <aside className="space-y-8 min-w-0">
          <section
            aria-labelledby="sysreq-heading"
            className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white"
          >
            <div className="border-b border-[var(--line)] px-5 py-3.5">
              <h2
                id="sysreq-heading"
                className="font-display text-xl font-semibold text-[var(--navy)]"
              >
                Bundled Checkpoints &amp; Runtime
              </h2>
            </div>

            <ul className="divide-y divide-[var(--line)] text-xs">
              <li className="flex items-start gap-3 px-5 py-3.5">
                <Layers
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tomato)]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-[var(--ink)]">
                    Native Keras 3 (<code className="font-mono">.keras</code>) &amp; LiteRT (
                    <code className="font-mono">.tflite</code>)
                  </p>
                  <p className="mt-0.5 leading-relaxed text-[var(--muted)]">
                    Ships compact <code className="font-mono text-[var(--ink)]">float16</code>{' '}
                    checkpoints directly in Git (&lt;90 MB per model) with SHA-256 verification via{' '}
                    <code className="font-mono text-[var(--ink)]">model_manifest.json</code>.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 px-5 py-3.5">
                <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-[var(--navy)]" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[var(--ink)]">Python 3.10+ Scientific Stack</p>
                  <p className="mt-0.5 leading-relaxed text-[var(--muted)]">
                    Works with Keras 3 (TensorFlow or PyTorch backend) or ultra-lightweight TFLite /
                    LiteRT CPU execution alongside Biopython, NumPy, and Pandas.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 px-5 py-3.5">
                <HardDrive
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--steel)]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-[var(--ink)]">~300 MB Disk &amp; 2–4 GB RAM</p>
                  <p className="mt-0.5 leading-relaxed text-[var(--muted)]">
                    Screens 35,000+ translated plant proteins in under two minutes on standard
                    multi-core laptops or workstations.
                  </p>
                </div>
              </li>
            </ul>

            <div className="border-t border-[var(--line)] bg-[var(--surface)] px-5 py-3.5">
              <a
                href="https://github.com/usubioinfo/PRGminer"
                target="_blank"
                rel="noreferrer"
                className="btn-outline-sharp w-full text-xs"
              >
                <span>Open usubioinfo/PRGminer on GitHub</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </section>

          <section
            aria-labelledby="cli-flags-heading"
            className="border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-white"
          >
            <div className="border-b border-[var(--line)] px-5 py-3.5">
              <h2
                id="cli-flags-heading"
                className="font-display text-xl font-semibold text-[var(--navy)]"
              >
                CLI Flag Reference
              </h2>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-labelledby="cli-flags-heading"
              className="prg-table-region"
            >
              <table className="prg-table prg-table-responsive text-left text-xs">
                <caption className="sr-only">
                  Command-line flags accepted by the PRGminer executable
                </caption>
                <thead>
                  <tr className="border-b border-[var(--line)] font-mono text-[11px] uppercase tracking-wider text-[var(--navy)]">
                    <th scope="col" className="px-4 py-2.5 font-bold">
                      Flag
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-bold">
                      Default
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-bold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {CLI_FLAGS.map((row) => (
                    <tr key={row.flag}>
                      <th
                        scope="row"
                        className="whitespace-nowrap px-4 py-2.5 font-mono font-bold text-[var(--navy)]"
                      >
                        {row.flag}
                      </th>
                      <td
                        data-label="Default"
                        className={`whitespace-nowrap px-4 py-2.5 font-mono text-[11px] font-bold ${
                          row.required ? 'text-[var(--tomato)]' : 'text-[var(--muted)]'
                        }`}
                      >
                        {row.defaultVal}
                      </td>
                      <td
                        data-label="Description"
                        className="px-4 py-2.5 leading-relaxed text-[var(--muted)]"
                      >
                        {row.spec}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
