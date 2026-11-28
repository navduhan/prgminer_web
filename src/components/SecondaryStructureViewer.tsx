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
  const cell = 13.5;
  const left = 56;
  const rows: number[] = [];
  for (let i = 0; i < data.amino_acids.length; i += rowWidth) rows.push(i);

  const helixCount = Array.from(data.prediction).filter((c) => c === 'H').length;
  const strandCount = Array.from(data.prediction).filter((c) => c === 'E').length;
  const coilCount = Math.max(0, data.prediction.length - helixCount - strandCount);
  const total = Math.max(1, data.prediction.length);

  return (
    <div className="space-y-5">
      {/* 3-Column Secondary Structure Summary */}
      <div className="grid divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-4 sm:px-5">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--tomato)]">
            α-Helix (H)
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-[var(--navy)]">
            {((helixCount / total) * 100).toFixed(1)}%
          </p>
          <p className="mt-0.5 text-sm font-medium text-[var(--ink-secondary)]">
            {helixCount.toLocaleString()} residues
          </p>
        </div>

        <div className="p-4 sm:px-5">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
            β-Strand (E)
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-[var(--navy)]">
            {((strandCount / total) * 100).toFixed(1)}%
          </p>
          <p className="mt-0.5 text-sm font-medium text-[var(--ink-secondary)]">
            {strandCount.toLocaleString()} residues
          </p>
        </div>

        <div className="p-4 sm:px-5">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--steel)]">
            Coil / Loop (C)
          </p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-[var(--navy)]">
            {((coilCount / total) * 100).toFixed(1)}%
          </p>
          <p className="mt-0.5 text-sm font-medium text-[var(--ink-secondary)]">
            {coilCount.toLocaleString()} residues
          </p>
        </div>
      </div>

      {/* Per-Residue S4PRED Tracks */}
      <div className="space-y-3 overflow-x-auto rounded-xl border border-[var(--line-strong)] bg-white p-5">
        {rows.map((start) => {
          const aa = data.amino_acids.slice(start, start + rowWidth);
          const pred = data.prediction.slice(start, start + rowWidth);
          const conf = data.confidence.slice(start, start + rowWidth);
          const svgWidth = left + rowWidth * cell + 24;

          return (
            <div key={start} className="overflow-x-auto">
              <svg
                width={svgWidth}
                height={164}
                viewBox={`0 0 ${svgWidth} 164`}
                role="img"
                aria-label={`Secondary structure residues ${start + 1} to ${start + aa.length}`}
              >
                <g
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fontSize="12"
                  fill="#0c1929"
                >
                  <text x="8" y="38" fontWeight="700" fill="#152840">
                    Conf
                  </text>
                  <text x="8" y="70" fontWeight="700" fill="#152840">
                    Cart
                  </text>
                  <text x="8" y="103" fontWeight="700" fill="#152840">
                    Pred
                  </text>
                  <text x="8" y="129" fontWeight="700" fill="#152840">
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
                        height={Math.max(2, score * 3)}
                        rx="2"
                        fill={score >= 7 ? '#c93325' : score >= 4 ? '#274766' : '#9fb0c4'}
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
                          y="58"
                          width={w - 1}
                          height="15"
                          rx="4"
                          fill="#c93325"
                        >
                          <title>α-Helix</title>
                        </rect>
                      );
                    }
                    if (segment.state === 'E') {
                      return (
                        <polygon
                          key={i}
                          points={`${x},58 ${x + Math.max(2, w - 8)},58 ${x + w - 1},65.5 ${x + Math.max(2, w - 8)},73 ${x},73`}
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
                        y1="65.5"
                        y2="65.5"
                        stroke="#274766"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      >
                        <title>Coil</title>
                      </line>
                    );
                  })}

                  {Array.from(pred).map((value, i) => (
                    <text
                      key={i}
                      x={left + i * cell + 2.5}
                      y="103"
                      fontWeight="700"
                      fill={value === 'H' ? '#c93325' : value === 'E' ? '#0f2744' : '#274766'}
                    >
                      {value}
                    </text>
                  ))}

                  {Array.from(aa).map((value, i) => (
                    <text key={i} x={left + i * cell + 2.5} y="129" fontWeight="700" fill="#0c1929">
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
                          x1={left + i * cell + 5.5}
                          x2={left + i * cell + 5.5}
                          y1="135"
                          y2="141"
                          stroke="#5c7087"
                          strokeWidth="1.2"
                        />
                        <text
                          x={left + i * cell - 1}
                          y="155"
                          fontSize="11"
                          fontWeight="700"
                          fill="#152840"
                        >
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

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--ink-secondary)]">
        <div className="flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2 text-[var(--ink)]">
            <span className="h-3.5 w-5 rounded bg-[var(--tomato)]" aria-hidden="true" />
            <span>α-Helix (H)</span>
          </span>
          <span className="inline-flex items-center gap-2 text-[var(--ink)]">
            <span className="h-3.5 w-5 rounded bg-[var(--navy)]" aria-hidden="true" />
            <span>β-Strand (E)</span>
          </span>
          <span className="inline-flex items-center gap-2 text-[var(--ink)]">
            <span className="h-1 w-5 rounded-full bg-[var(--steel)]" aria-hidden="true" />
            <span>Coil / Loop (C)</span>
          </span>
        </div>
        <span>S4PRED per-residue confidence: 0 (low) to 9 (high)</span>
      </div>
    </div>
  );
}
