'use client';

export type DomainBlock = {
  code: string;
  label: string;
  widthPct: number;
  tone: 'cc' | 'tir' | 'nbarc' | 'lrr' | 'lectin' | 'lysm' | 'tm' | 'kinase';
};

export default function DomainSchematic({
  domains,
  compartment,
  compact = false,
}: {
  domains: readonly DomainBlock[];
  compartment: string;
  compact?: boolean;
}) {
  // Compute horizontal layout coordinates across viewBox width 560
  const startX = 28;
  const usableWidth = 504;
  const gap = 8;
  const totalGaps = Math.max(0, domains.length - 1) * gap;
  const netWidth = usableWidth - totalGaps;

  const positioned = domains.reduce<
    Array<DomainBlock & { x: number; w: number }>
  >((acc, d) => {
    const prevEnd = acc.length ? acc[acc.length - 1].x + acc[acc.length - 1].w + gap : startX;
    const w = Math.max(26, (d.widthPct / 100) * netWidth);
    acc.push({ ...d, x: prevEnd, w });
    return acc;
  }, []);

  const height = compact ? 54 : 74;
  const midY = compact ? 27 : 34;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between font-mono text-[13px] font-semibold text-[var(--ink-secondary)]">
        <span>NH₂ (N-term)</span>
        <span className="font-bold text-[var(--navy)]">{compartment}</span>
        <span>COOH (C-term)</span>
      </div>
      <svg
        viewBox={`0 0 560 ${height}`}
        className="w-full block select-none rounded-xl border border-[var(--line-strong)] bg-white"
        role="img"
        aria-label={`Protein domain schematic: ${domains.map((d) => d.code).join(' – ')}`}
      >
        {/* Polypeptide backbone */}
        <line x1="12" y1={midY} x2="548" y2={midY} stroke="#5c7087" strokeWidth="2.5" />
        <circle cx="12" cy={midY} r="3.5" fill="#0f2744" />
        <circle cx="548" cy={midY} r="3.5" fill="#d93829" />

        {positioned.map((seg, i) => {
          const { x, w, tone, code, label } = seg;

          if (tone === 'cc') {
            // Zig-zag coiled-coil α-helical spring
            const steps = Math.max(5, Math.floor(w / 10));
            const dx = w / steps;
            const pts = Array.from({ length: steps + 1 }, (_, k) => {
              const px = x + k * dx;
              const py = k === 0 || k === steps ? midY : midY + (k % 2 === 0 ? -10 : 10);
              return `${px.toFixed(1)},${py.toFixed(1)}`;
            }).join(' ');
            return (
              <g key={`${code}-${i}`}>
                <rect x={x} y={midY - 13} width={w} height={26} fill="#ffffff" />
                <polyline
                  points={pts}
                  fill="none"
                  stroke="#d93829"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
                <text
                  x={x + w / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="800"
                  fill="#0f2744"
                  fontFamily="ui-monospace, monospace"
                >
                  {code}
                </text>
              </g>
            );
          }

          if (tone === 'tm') {
            // Transmembrane bilayer anchor block
            return (
              <g key={`${code}-${i}`}>
                <rect
                  x={x}
                  y={midY - 15}
                  width={w}
                  height={30}
                  rx="4"
                  fill="#0f2744"
                />
                <text
                  x={x + w / 2}
                  y={midY + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="#ffffff"
                  fontFamily="ui-monospace, monospace"
                >
                  TM
                </text>
              </g>
            );
          }

          if (tone === 'kinase') {
            // Catalytic kinase arrowhead pentagon
            const tip = Math.min(14, w * 0.18);
            const pts = `${x},${midY - 13} ${x + w - tip},${midY - 13} ${x + w},${midY} ${x + w - tip},${midY + 13} ${x},${midY + 13}`;
            return (
              <g key={`${code}-${i}`}>
                <polygon points={pts} fill="#0f2744" />
                <text
                  x={x + (w - tip * 0.4) / 2}
                  y={midY + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="#ffffff"
                  fontFamily="ui-monospace, monospace"
                >
                  {code}
                </text>
                {!compact && w > 120 ? (
                  <text
                    x={x + w / 2}
                    y={height - 5}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#152840"
                  >
                    {label}
                  </text>
                ) : null}
              </g>
            );
          }

          if (tone === 'lysm') {
            // 3 tandem LysM beads
            const r = Math.min(12, w / 7.2);
            const cx1 = x + w * 0.24;
            const cx2 = x + w * 0.5;
            const cx3 = x + w * 0.76;
            return (
              <g key={`${code}-${i}`}>
                <circle cx={cx1} cy={midY} r={r} fill="#4e6e88" stroke="#0f2744" strokeWidth="1.6" />
                <circle cx={cx2} cy={midY} r={r} fill="#4e6e88" stroke="#0f2744" strokeWidth="1.6" />
                <circle cx={cx3} cy={midY} r={r} fill="#4e6e88" stroke="#0f2744" strokeWidth="1.6" />
                <text
                  x={x + w / 2}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="#0f2744"
                  fontFamily="ui-monospace, monospace"
                >
                  {code} (×3)
                </text>
              </g>
            );
          }

          if (tone === 'lectin') {
            // Paired lectin β-lobes
            return (
              <g key={`${code}-${i}`}>
                <ellipse
                  cx={x + w * 0.32}
                  cy={midY}
                  rx={Math.max(12, w * 0.2)}
                  ry="12"
                  fill="#7d9a8c"
                  stroke="#0f2744"
                  strokeWidth="1.6"
                />
                <ellipse
                  cx={x + w * 0.68}
                  cy={midY}
                  rx={Math.max(12, w * 0.2)}
                  ry="12"
                  fill="#7d9a8c"
                  stroke="#0f2744"
                  strokeWidth="1.6"
                />
                <text
                  x={x + w / 2}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="#0f2744"
                  fontFamily="ui-monospace, monospace"
                >
                  {code}
                </text>
              </g>
            );
          }

          if (tone === 'lrr') {
            // Repeated LRR solenoid blocks
            const repeats = Math.max(4, Math.min(10, Math.floor(w / 22)));
            const rw = (w - (repeats - 1) * 3) / repeats;
            return (
              <g key={`${code}-${i}`}>
                {Array.from({ length: repeats }, (_, rIdx) => (
                  <rect
                    key={rIdx}
                    x={x + rIdx * (rw + 3)}
                    y={midY - 12}
                    width={rw}
                    height={24}
                    rx="3"
                    fill="#4e6e88"
                    stroke="#0f2744"
                    strokeWidth="1"
                  />
                ))}
                <text
                  x={x + w / 2}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="#0f2744"
                  fontFamily="ui-monospace, monospace"
                >
                  {code}
                </text>
              </g>
            );
          }

          // Default capsule for NB-ARC and TIR
          const fill = tone === 'nbarc' ? '#d93829' : '#9e261b';
          return (
            <g key={`${code}-${i}`}>
              <rect
                x={x}
                y={midY - 13}
                width={w}
                height={26}
                rx="13"
                fill={fill}
              />
              <text
                x={x + w / 2}
                y={midY + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill="#ffffff"
                fontFamily="ui-monospace, monospace"
              >
                {code}
              </text>
              {!compact && w > 110 ? (
                <text
                  x={x + w / 2}
                  y={height - 5}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#152840"
                >
                  {label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
