'use client';

import { useEffect, useRef, useState } from 'react';
import type { Stage, StructureComponent } from 'ngl';

const REPRESENTATIONS = [
  'cartoon',
  'backbone',
  'ball+stick',
  'licorice',
  'ribbon',
  'rope',
  'spacefill',
  'surface',
  'tube',
] as const;

const COLOR_SCHEMES = [
  { value: 'bfactor', label: 'pLDDT / B-factor confidence' },
  { value: 'sstruc', label: 'Secondary structure' },
  { value: 'residueindex', label: 'N → C rainbow (residue index)' },
  { value: 'hydrophobicity', label: 'Hydrophobicity' },
  { value: 'electrostatic', label: 'Electrostatic' },
  { value: 'chainid', label: 'Chain ID' },
] as const;

const RGENE_MOTIFS = [
  { name: 'P-loop (Walker A)', pattern: 'G[A-Z]{4}GK[ST]' },
  { name: 'Kinase-2 (Walker B)', pattern: 'L[LI]VLDD[VW]' },
  { name: 'MHD motif', pattern: 'MHD' },
  { name: 'EDVID (CC)', pattern: 'ED[AVIL]ID' },
] as const;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function StructureViewer({
  pdb,
  sequence = '',
  sampleId = 'rgene_structure',
}: {
  pdb: string;
  sequence?: string;
  sampleId?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const componentRef = useRef<StructureComponent | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [representation, setRepresentation] = useState<(typeof REPRESENTATIONS)[number]>('cartoon');
  const [colorScheme, setColorScheme] = useState('bfactor');
  const [background, setBackground] = useState('#f8fafc');
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);

  const motifMatches = RGENE_MOTIFS.map((motif) => ({
    name: motif.name,
    ranges: Array.from(sequence.matchAll(new RegExp(motif.pattern, 'g')), (m) => ({
      start: (m.index ?? 0) + 1,
      end: (m.index ?? 0) + m[0].length,
    })),
  }));

  const activeSelection = motifMatches
    .filter((m) => selectedMotifs.includes(m.name))
    .flatMap((m) => m.ranges.map((r) => `${r.start}-${r.end}`))
    .join(' or ');

  const safeFilename = sampleId.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const coordFormat = /^\s*data_/m.test(pdb) || pdb.includes('_atom_site.') ? 'cif' : 'pdb';

  useEffect(() => {
    if (!containerRef.current || !pdb) return;
    let disposed = false;
    let stage: Stage | undefined;

    void import('ngl')
      .then((NGL) => {
        if (disposed || !containerRef.current) return;
        const currentStage = new NGL.Stage(containerRef.current, { backgroundColor: '#f8fafc' });
        stage = currentStage;
        stageRef.current = currentStage;
        return currentStage
          .loadFile(new Blob([pdb], { type: 'text/plain' }), { ext: coordFormat })
          .then((component) => {
            if (disposed || !component) return;
            componentRef.current = component as StructureComponent;
            setReady(true);
            component.autoView();
          });
      })
      .catch(() => {
        if (!disposed) {
          setError(
            `Unable to initialize WebGL 3D structure viewer. Download the ${coordFormat.toUpperCase()} file instead.`,
          );
        }
      });

    const handleResize = () => stage?.handleResize();
    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      stage?.dispose();
      stageRef.current = null;
      componentRef.current = null;
    };
  }, [pdb, coordFormat]);

  useEffect(() => {
    if (!ready || !componentRef.current) return;
    componentRef.current.removeAllRepresentations();
    componentRef.current.addRepresentation(representation, { colorScheme });
    if (activeSelection) {
      componentRef.current.addRepresentation('ball+stick', {
        sele: activeSelection,
        color: '#d93829',
        aspectRatio: 2.2,
      });
    }
  }, [ready, representation, colorScheme, activeSelection]);

  useEffect(() => {
    if (ready) stageRef.current?.setParameters({ backgroundColor: background });
  }, [ready, background]);

  useEffect(() => {
    if (ready && activeSelection) componentRef.current?.autoView(activeSelection);
  }, [ready, activeSelection]);

  async function exportSnapshot() {
    if (!stageRef.current) return;
    setSaving(true);
    setError('');
    try {
      const blob = await stageRef.current.makeImage({
        factor: 2,
        antialias: true,
        transparent: false,
      });
      triggerDownload(blob, `${safeFilename}.png`);
    } catch {
      setError('Snapshot export failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Sharp 1px/2px Architectural Control Bar */}
      <div className="grid gap-4 border border-[var(--line)] border-t-2 border-t-[var(--navy)] bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="ngl-repr"
            className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]"
          >
            Representation
          </label>
          <select
            id="ngl-repr"
            name="representation"
            value={representation}
            onChange={(e) => setRepresentation(e.target.value as (typeof REPRESENTATIONS)[number])}
            className="mt-1.5 w-full rounded-[3px] border border-[var(--field-border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
          >
            {REPRESENTATIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ngl-color"
            className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]"
          >
            Coloring scheme
          </label>
          <select
            id="ngl-color"
            name="colorScheme"
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value)}
            className="mt-1.5 w-full rounded-[3px] border border-[var(--field-border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
          >
            {COLOR_SCHEMES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ngl-bg"
            className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]"
          >
            Stage canvas
          </label>
          <select
            id="ngl-bg"
            name="background"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="mt-1.5 w-full rounded-[3px] border border-[var(--field-border)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
          >
            <option value="#f8fafc">Cool Surface (#f8fafc)</option>
            <option value="#ffffff">Pure White (#ffffff)</option>
            <option value="#09192d">USU Deep Navy (#09192d)</option>
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            className="btn-ghost-rule text-xs !py-2 !px-3"
            onClick={() => componentRef.current?.autoView()}
          >
            Reset view
          </button>
          <button
            type="button"
            className="btn-outline-sharp text-xs !py-2 !px-3"
            disabled={saving}
            onClick={() => void exportSnapshot()}
          >
            {saving ? 'Saving…' : 'PNG'}
          </button>
          <button
            type="button"
            className="btn-tomato text-xs !py-2 !px-3"
            onClick={() =>
              triggerDownload(
                new Blob([pdb], {
                  type: coordFormat === 'cif' ? 'chemical/x-cif' : 'chemical/x-pdb',
                }),
                `${safeFilename}.${coordFormat}`,
              )
            }
          >
            Download {coordFormat.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Sharp Conserved Motif Highlight Strip */}
      {sequence ? (
        <div className="flex flex-wrap items-center gap-2 border border-[var(--line)] bg-white px-4 py-3 text-xs">
          <span className="mr-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]">
            Conserved R-gene motifs:
          </span>
          {motifMatches.map((m) => {
            const hasHits = m.ranges.length > 0;
            const active = selectedMotifs.includes(m.name);
            return (
              <button
                key={m.name}
                type="button"
                aria-pressed={active}
                disabled={!hasHits}
                onClick={() =>
                  setSelectedMotifs((prev) =>
                    prev.includes(m.name) ? prev.filter((x) => x !== m.name) : [...prev, m.name],
                  )
                }
                className={`rounded-[2px] border px-2.5 py-1 font-mono text-xs font-bold transition ${
                  active
                    ? 'border-[#d93829] bg-[#d93829] text-white'
                    : hasHits
                      ? 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--navy)] hover:border-[#d93829] hover:text-[#d93829]'
                      : 'cursor-not-allowed border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] opacity-50'
                }`}
              >
                {m.name} ({m.ranges.length})
              </button>
            );
          })}
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-[2px] border border-[var(--tomato-border)] border-l-4 border-l-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <div
        ref={containerRef}
        className="h-[520px] w-full overflow-hidden border border-[var(--line)] bg-[#f8fafc]"
        aria-label={`Interactive 3D molecular structure for ${sampleId}`}
      />
    </div>
  );
}
