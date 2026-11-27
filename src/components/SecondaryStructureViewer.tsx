'use client';

type SecondaryData = {
  amino_acids: string;
  prediction: string;
  confidence: string;
};

type Segment = { state: string; start: number; end: number };

function segments(pred: string): Segment[] {
  const out: Segment[] = [];
  for (let i = 0; i < pred.length; i += 1) {
    const state = pred[i] || 'C';
    const prev = out[out.length - 1];
    if (prev && prev.state === state) {
      prev.end = i;
    } else {
      out.push({ state, start: i, end: i });
    }
  }
  return out;
}

export default function SecondaryStructureViewer({ data }: { data: SecondaryData }) {
  const rowWidth = 60;
  const cell = 13;
  const left = 52;
  const rows: number[] = [];
  for (let i = 0; i < data.amino_acids.length; i += rowWidth) rows.push(i);

  const helixCount = Array.from(data.prediction).filter((c) => c === 'H').length;
  const strandCount = Array.from(data.prediction).filter((c) => c === 'E').length;
  const coilCount = Math.max(0, data.prediction.length - helixCount - strandCount);
  const total = Math.max(1, data.prediction.length);

  return (
    <div className="space-y-5">
      {/* 3-Column Topology Composition Ledger */}
      <div className="grid sm:grid-cols-3 border border-[var(--line)] border-t-2 border-t-[var(--navy)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)] bg-white">
        <div className="p-4 sm:px-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#d93829]">
            α-Helix (H)
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[var(--ink)]">
            {((helixCount / total) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-[var(--muted)]">{helixCount.toLocaleString()} residues</p>
        </div>

        <div className="p-4 sm:px-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0f2744]">
            β-Strand (E)
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[var(--ink)]">
            {((strandCount / total) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-[var(--muted)]">{strandCount.toLocaleString()} residues</p>
        </div>

        <div className="p-4 sm:px-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
            Coil / Loop (C)
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[var(--ink)]">
            {((coilCount / total) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-[var(--muted)]">{coilCount.toLocaleString()} residues</p>
        </div>
      </div>

      {/* Per-Residue S4PRED Tracks */}
      <div className="space-y-3 overflow-x-auto border border-[var(--line)] bg-white p-5">
        {rows.map((start) => {
          const aa = data.amino_acids.slice(start, start + rowWidth);
          const pred = data.prediction.slice(start, start + rowWidth);
          const conf = data.confidence.slice(start, start + rowWidth);
          const svgWidth = left + rowWidth * cell + 24;

          return (
            <div key={start} className="overflow-x-auto">
              <svg
                width={svgWidth}
                height={158}
                viewBox={`0 0 ${svgWidth} 158`}
                role="img"
                aria-label={`Secondary structure residues ${start + 1} to ${start + aa.length}`}
              >
                <g
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fontSize="11"
                  fill="#0f1f33"
                >
                  <text x="8" y="37" fontWeight="700" fill="#526275">
                    Conf
                  </text>
                  <text x="8" y="69" fontWeight="700" fill="#526275">
                    Cart
                  </text>
                  <text x="8" y="101" fontWeight="700" fill="#526275">
                    Pred
                  </text>
                  <text x="8" y="127" fontWeight="700" fill="#526275">
                    AA
                  </text>

                  {Array.from(conf).map((value, i) => {
                    const score = Number(value) || 0;
                    return (
                      <rect
                        key={i}
                        x={left + i * cell}
                        y={42 - score * 3}
                        width={cell - 2}
                        height={Math.max(1, score * 3)}
                        rx="1"
                        fill={score >= 7 ? '#d93829' : score >= 4 ? '#4e6e88' : '#cbd5e1'}
                      >
                        <title>
                          Residue {start + i + 1}: confidence {score}
                        </title>
                      </rect>
                    );
                  })}

                  {segments(pred).map((segment, i) => {
                    const x = left + segment.start * cell;
                    const w = (segment.end - segment.start + 1) * cell;
                    if (segment.state === 'H') {
                      return (
                        <rect
                          key={i}
                          x={x}
                          y="57"
                          width={w - 1}
                          height="15"
                          rx="3"
                          fill="#d93829"
                        >
                          <title>α-Helix</title>
                        </rect>
                      );
                    }
                    if (segment.state === 'E') {
                      return (
                        <polygon
                          key={i}
                          points={`${x},57 ${x + Math.max(2, w - 8)},57 ${x + w - 1},64.5 ${x + Math.max(2, w - 8)},72 ${x},72`}
                          fill="#0f2744"
                        >
                          <title>β-Strand</title>
                        </polygon>
                      );
                    }
                    return (
                      <line
                        key={i}
                        x1={x}
                        x2={x + w}
                        y1="64.5"
                        y2="64.5"
                        stroke="#64748b"
                        strokeWidth="3.5"
                      >
                        <title>Coil</title>
                      </line>
                    );
                  })}

                  {Array.from(pred).map((value, i) => (
                    <text
                      key={i}
                      x={left + i * cell + 2.5}
                      y="101"
                      fontWeight="700"
                      fill={value === 'H' ? '#d93829' : value === 'E' ? '#0f2744' : '#64748b'}
                    >
                      {value}
                    </text>
                  ))}

                  {Array.from(aa).map((value, i) => (
                    <text key={i} x={left + i * cell + 2.5} y="127" fontWeight="600">
                      {value}
                      <title>
                        Residue {start + i + 1}: {value}, {pred[i]}, confidence {conf[i]}
                      </title>
                    </text>
                  ))}

                  {Array.from(aa).map((_, i) =>
                    i === 0 || (start + i + 1) % 10 === 0 ? (
                      <g key={i}>
                        <line
                          x1={left + i * cell + 5}
                          x2={left + i * cell + 5}
                          y1="132"
                          y2="137"
                          stroke="#94a3b8"
                        />
                        <text x={left + i * cell - 1} y="150" fontSize="9.5" fill="#526275">
                          {start + i + 1}
                        </text>
                      </g>
                    ) : null,
                  )}
                </g>
              </svg>
            </div>
          );
        })}
      </div>

      {/* Sharp Key Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-xs font-semibold text-[var(--muted)]">
        <div className="flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2 text-[var(--ink)]">
            <span className="h-3 w-5 rounded-[2px] bg-[#d93829]" aria-hidden="true" />
            <span>α-Helix (H)</span>
          </span>
          <span className="inline-flex items-center gap-2 text-[var(--ink)]">
            <span className="h-3 w-5 rounded-[2px] bg-[#0f2744]" aria-hidden="true" />
            <span>β-Strand (E)</span>
          </span>
          <span className="inline-flex items-center gap-2 text-[var(--ink)]">
            <span className="h-1 w-5 bg-[#64748b]" aria-hidden="true" />
            <span>Coil / Loop (C)</span>
          </span>
        </div>
        <span>S4PRED per-residue confidence: 0 (low) to 9 (high).</span>
      </div>
    </div>
  );
}
