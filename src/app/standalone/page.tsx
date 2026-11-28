'use client';

import {
  Check,
  Copy,
  Download,
  ExternalLink,
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
    label: 'GitHub + uv',
    summary:
      'Clone from usubioinfo/PRGminer. Phase I and Phase II .tflite models are bundled in the repository with SHA-256 verification.',
    commands: `# 1. Clone repository (includes bundled .tflite models)
git clone https://github.com/usubioinfo/PRGminer.git
cd PRGminer

# 2. Install Python environment and verify model checksums
uv sync --python 3.11
uv run prgminer --models-status

# 3. Run two-phase R-gene prediction
uv run prgminer -i PRGminer/example/example.fasta -od results_phase2 -l Phase2`,
  },
  {
    id: 'tarball',
    label: 'Standalone Archive (.tar.gz)',
    summary:
      'Download the versioned standalone archive, verify its SHA-256 checksum, and install locally with pip.',
    commands: `# 1. Download standalone archive & verify SHA-256 checksum
curl -fLO https://kaabil.net/prgminer/download/prgminer-standalone.tar.gz
curl -fLO https://kaabil.net/prgminer/download/SHA256SUMS
sha256sum -c SHA256SUMS

# 2. Extract and install
tar -xzf prgminer-standalone.tar.gz
cd PRGminer
pip install .

# 3. Run prediction
prgminer -i PRGminer/example/example.fasta -od results_phase2 -l Phase2`,
  },
  {
    id: 'conda',
    label: 'Conda / Mamba',
    summary:
      'Create an isolated Conda environment from environment.yml on Linux or macOS.',
    commands: `# 1. Create and activate environment
conda env create -f environment.yml
conda activate PRGminer

# 2. Verify bundled .tflite models
PRGminer --models-status

# 3. Screen a protein FASTA file
PRGminer -i proteins.fasta -od ./prgminer_out -o PRGminer_results.tsv -l Phase2`,
  },
];

const OUTPUT_FILES = [
  {
    filename: 'PRGminer_results.txt',
    phase: 'Phase1 & Phase2',
    description:
      'Summary table listing each sequence ID, predicted R-gene status or family, and top probability.',
  },
  {
    filename: 'Phase1_predictions.tsv',
    phase: 'Phase1 & Phase2',
    description:
      'Non-Rgene (%) and Rgene (%) probabilities across all submitted sequences.',
  },
  {
    filename: 'Phase2_predictions.tsv',
    phase: 'Phase2 only',
    description:
      '8-family probabilities (CNL, KIN, LYK, LECRK, RLK, RLP, TIR, TNL) for sequences passing Phase I.',
  },
  {
    filename: 'prediction_summary.txt',
    phase: 'Phase1 & Phase2',
    description:
      'Run summary with sequence counts, per-family tallies, and runtime.',
  },
] as const;

const CLI_FLAGS = [
  {
    flag: '-i, --fasta_file',
    defaultVal: 'Required',
    required: true,
    spec: 'Input protein FASTA path (≥10 aa).',
  },
  {
    flag: '-od, --output_dir',
    defaultVal: 'PRGminer_results',
    required: false,
    spec: 'Output directory for TSV tables and run summary.',
  },
  {
    flag: '-o, --output_file',
    defaultVal: 'PRGminer_results.txt',
    required: false,
    spec: 'Filename for the primary summary table inside -od.',
  },
  {
    flag: '-l, --level',
    defaultVal: 'Phase2',
    required: false,
    spec: 'Phase1 (binary screen) or Phase2 (Phase I + 8 families).',
  },
  {
    flag: '--models-status',
    defaultVal: 'Flag',
    required: false,
    spec: 'Verify SHA-256 checksums of bundled .tflite models.',
  },
  {
    flag: '-v, --version',
    defaultVal: 'Flag',
    required: false,
    spec: 'Print installed PRGminer version.',
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
      // Ignore clipboard errors
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
    if (event.key === 'ArrowRight') nextIdx = (idx + 1) % INSTALL_TABS.length;
    else if (event.key === 'ArrowLeft')
      nextIdx = (idx - 1 + INSTALL_TABS.length) % INSTALL_TABS.length;
    else if (event.key === 'Home') nextIdx = 0;
    else if (event.key === 'End') nextIdx = INSTALL_TABS.length - 1;
    if (nextIdx !== -1) {
      event.preventDefault();
      selectAndRevealTab(INSTALL_TABS[nextIdx].id, true);
    }
  };

  return (
    <div className="space-y-8 py-6 pb-10">
      {/* Compact Header */}
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--line-strong)] pb-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--navy)] sm:text-[1.68rem]">
            Standalone CLI Package (<code>prgminer</code>)
          </h1>
          <p className="mt-1 text-[15px] text-[var(--ink-secondary)]">
            Local Python distribution with bundled Phase I &amp; Phase II <code>.tflite</code>{' '}
            models for unrestricted proteome batch screening
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={withBasePath('/download/prgminer-standalone.tar.gz')}
            className="btn-tomato"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Download .tar.gz</span>
          </a>
          <a
            href="https://github.com/usubioinfo/PRGminer"
            target="_blank"
            rel="noreferrer"
            className="btn-outline-sharp"
          >
            <span>GitHub Repo</span>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={withBasePath('/download/SHA256SUMS')}
            className="btn-ghost-rule py-2 px-3.5 font-mono text-sm font-bold"
          >
            SHA-256
          </a>
        </div>
      </header>

      {/* Tabbed Installation Workflows */}
      <section aria-label="Installation workflows" className="surface-card overflow-hidden">
        <div
          className="prg-tablist bg-[var(--surface)] px-4"
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
                  <p className="max-w-3xl text-[15px] leading-relaxed text-[var(--ink)]">
                    {tab.summary}
                  </p>

                  <div className="overflow-hidden rounded-xl border border-[var(--navy-dark)] bg-[#0f2744] text-white">
                    <div className="flex items-center justify-between border-b border-white/15 px-4 py-2.5 font-mono text-xs text-slate-200">
                      <span>bash / zsh · Python ≥ 3.10</span>
                      <button
                        type="button"
                        onClick={() => void copyBlock(tab.id, tab.commands)}
                        className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs font-semibold text-white hover:text-[#ff9c92]"
                      >
                        {copiedId === tab.id ? (
                          <>
                            <Check className="h-4 w-4 text-[#ff867a]" aria-hidden="true" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" aria-hidden="true" />
                            <span>Copy commands</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-[13.5px] leading-6 text-slate-100">
                      <code>{tab.commands}</code>
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-Column CLI Flags & Output Files */}
      <section
        aria-label="Command-line flags and output files"
        className="grid gap-8 lg:grid-cols-12"
      >
        <div className="space-y-3 lg:col-span-7">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold text-[var(--navy)]">
              Command-Line Flags
            </h2>
            <span className="font-mono text-xs font-semibold text-[var(--ink-secondary)]">
              prgminer --help
            </span>
          </div>

          <div className="prg-table-region rounded-xl border border-[var(--line-strong)] bg-white">
            <table className="prg-table prg-table-responsive text-left text-[14.5px]">
              <thead>
                <tr className="border-b border-[var(--line-strong)] bg-[var(--surface)] font-mono text-xs uppercase tracking-wider text-[var(--navy)]">
                  <th scope="col" className="px-4 py-3 font-bold">
                    Option
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Default
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {CLI_FLAGS.map((row) => (
                  <tr key={row.flag}>
                    <th
                      scope="row"
                      className="whitespace-nowrap px-4 py-3 font-mono text-sm font-bold text-[var(--navy)]"
                    >
                      {row.flag}
                    </th>
                    <td
                      data-label="Default"
                      className={`whitespace-nowrap px-4 py-3 font-mono text-xs font-bold ${
                        row.required ? 'text-[var(--tomato)]' : 'text-[var(--ink-secondary)]'
                      }`}
                    >
                      {row.defaultVal}
                    </td>
                    <td data-label="Description" className="px-4 py-3 text-[var(--ink)]">
                      {row.spec}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold text-[var(--navy)]">
              Generated Output Files
            </h2>
            <span className="font-mono text-xs font-semibold text-[var(--ink-secondary)]">
              -od / --output_dir
            </span>
          </div>

          <div className="prg-table-region rounded-xl border border-[var(--line-strong)] bg-white">
            <table className="prg-table prg-table-responsive text-left text-[14.5px]">
              <thead>
                <tr className="border-b border-[var(--line-strong)] bg-[var(--surface)] font-mono text-xs uppercase tracking-wider text-[var(--navy)]">
                  <th scope="col" className="px-4 py-3 font-bold">
                    File
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Contents
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {OUTPUT_FILES.map((row) => (
                  <tr key={row.filename}>
                    <th scope="row" className="px-4 py-3 font-normal">
                      <span className="block font-mono text-sm font-bold text-[var(--navy)]">
                        {row.filename}
                      </span>
                      <span className="block font-mono text-xs font-bold text-[var(--tomato)]">
                        {row.phase}
                      </span>
                    </th>
                    <td data-label="Contents" className="px-4 py-3 text-[var(--ink)]">
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
