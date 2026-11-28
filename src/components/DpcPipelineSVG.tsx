'use client';

import type { RGeneClassKey } from '@/data/rgene-classes';

const NAVY = '#0f2744';
const TOMATO = '#d93829';
const STEEL = '#5b7c99';
const SAGE = '#7d9a8c';

const TRACKS: ReadonlyArray<{
  key: RGeneClassKey;
  code: string;
}> = [
  { key: 'cnl', code: 'CNL' },
  { key: 'tnl', code: 'TNL' },
  { key: 'rlk', code: 'RLK' },
  { key: 'rlp', code: 'RLP' },
  { key: 'lecrk', code: 'LECRK' },
  { key: 'lyk', code: 'LYK' },
  { key: 'tir', code: 'TIR' },
  { key: 'kin', code: 'KIN' },
];

export default function DpcPipelineSVG({
  selected,
  onSelect,
}: {
  selected: RGeneClassKey;
  onSelect: (key: RGeneClassKey) => void;
}) {
  const gx = 198;
  const gy = 28;
  const cellSize = 11.2;
  const gridDim = 16; // Clean 16x16 visual lattice representing the 20x20=400 DPC matrix

  return (
    <svg
      viewBox="0 0 760 256"
      className="w-full block select-none bg-white"
      role="img"
      aria-label="PRGminer computational workflow: plant proteome leaf to 400-D dipeptide matrix, Phase I gate, and Phase II 8-class domain tracks"
    >
      {/* Scan lines from botanical leaf into DPC matrix */}
      {Array.from({ length: 11 }, (_, i) => {
        const y = 48 + i * 14;
        return (
          <line
            key={i}
            x1="126"
            y1={y}
            x2={gx - 6}
            y2={y}
            stroke={NAVY}
            strokeWidth="1.1"
            opacity="0.4"
          />
        );
      })}

      {/* Left: Geometric Veined Botanical Leaf */}
      <g transform="translate(84, 24)">
        <path
          d="M 0 0 C 56 44, 60 130, 0 178 C -60 130, -56 44, 0 0 Z"
          fill="#ffffff"
          stroke={NAVY}
          strokeWidth="2.6"
        />
        <line x1="0" y1="2" x2="0" y2="196" stroke={NAVY} strokeWidth="3" />
        <path
          d="M 0 38 Q 24 25 34 18 M 0 66 Q 31 49 43 40 M 0 94 Q 35 75 46 66 M 0 122 Q 30 105 42 96 M 0 148 Q 22 135 30 126"
          fill="none"
          stroke={NAVY}
          strokeWidth="1.6"
        />
        <path
          d="M 0 46 Q -24 31 -35 23 M 0 76 Q -32 58 -44 48 M 0 106 Q -33 88 -45 78 M 0 134 Q -26 118 -36 110"
          fill="none"
          stroke={SAGE}
          strokeWidth="1.7"
        />
      </g>
      <text
        x="84"
        y="240"
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="800"
        fill={NAVY}
        fontFamily="ui-monospace, monospace"
      >
        PROTEIN FASTA
      </text>

      {/* Center-Left: 20x20 = 400 Dipeptide Composition Matrix */}
      {Array.from({ length: gridDim }, (_, r) =>
        Array.from({ length: gridDim }, (__, c) => {
          const isDiag = r === c || r + c === gridDim - 1;
          const isHot = (r * 5 + c * 11) % 13 === 0;
          const fill = isDiag
            ? TOMATO
            : isHot
              ? NAVY
              : (r + c) % 3 === 0
                ? STEEL
                : '#dbe4ee';
          return (
            <rect
              key={`${r}-${c}`}
              x={(gx + c * cellSize).toFixed(1)}
              y={(gy + r * cellSize).toFixed(1)}
              width={(cellSize - 1.5).toFixed(1)}
              height={(cellSize - 1.5).toFixed(1)}
              rx="1.5"
              fill={fill}
            />
          );
        }),
      )}
      <text
        x={gx + (gridDim * cellSize) / 2}
        y="240"
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="800"
        fill={NAVY}
        fontFamily="ui-monospace, monospace"
      >
        20×20 DPC TENSOR (400-D)
      </text>

      {/* Phase I Binary Gate Bar */}
      <rect
        x="408"
        y="28"
        width="24"
        height="178"
        rx="6"
        fill={NAVY}
      />
      <text
        x="420"
        y="117"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="800"
        fill="#ffffff"
        fontFamily="ui-monospace, monospace"
        transform="rotate(-90 420 117)"
      >
        PHASE I · R-GENE SCREEN
      </text>

      {/* Short connectors from DPC Matrix -> Phase I Gate */}
      {Array.from({ length: 8 }, (_, i) => {
        const y = 46 + i * 20;
        return (
          <line
            key={i}
            x1={gx + gridDim * cellSize + 2}
            y1={y}
            x2="408"
            y2={y}
            stroke={NAVY}
            strokeWidth="1.4"
          />
        );
      })}

      {/* Bezier Fan-Out into 8 Shaped R-Gene Domain Tracks */}
      {TRACKS.map((t, idx) => {
        const y = 32 + idx * 24.5;
        const gateY = 48 + idx * 19.5;
        const active = selected === t.key;

        return (
          <g
            key={t.key}
            onClick={() => onSelect(t.key)}
            className="svg-receptor"
            role="button"
            tabIndex={0}
            aria-label={`Select ${t.code} track`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(t.key)}
          >
            <path
              d={`M 430 ${gateY} C 458 ${gateY}, 462 ${y}, 488 ${y}`}
              fill="none"
              stroke={active ? TOMATO : NAVY}
              strokeWidth={active ? '2.4' : '1.2'}
              opacity={active ? '1' : '0.45'}
            />
            <g transform={`translate(0, ${y})`}>
              <line
                x1="488"
                y1="0"
                x2="684"
                y2="0"
                stroke={active ? TOMATO : '#cbd5e1'}
                strokeWidth={active ? '2.2' : '1.4'}
              />

              {t.key === 'cnl' ? (
                <>
                  <polyline
                    points="496,0 502,-6 508,6 514,-6 520,6 526,-6 532,0"
                    fill="none"
                    stroke={TOMATO}
                    strokeWidth="2.6"
                  />
                  <rect x="540" y="-6.5" width="58" height="13" rx="6.5" fill={TOMATO} />
                  <rect x="606" y="-6.5" width="68" height="13" rx="6.5" fill={STEEL} />
                </>
              ) : null}

              {t.key === 'tnl' ? (
                <>
                  <rect x="496" y="-6.5" width="40" height="13" rx="6.5" fill="#9e261b" />
                  <rect x="544" y="-6.5" width="54" height="13" rx="6.5" fill={TOMATO} />
                  <rect x="606" y="-6.5" width="68" height="13" rx="6.5" fill={STEEL} />
                </>
              ) : null}

              {t.key === 'rlk' ? (
                <>
                  <polyline
                    points="496,0 503,-5 510,5 517,-5 524,5 531,-5 538,5 545,0"
                    fill="none"
                    stroke={STEEL}
                    strokeWidth="2.6"
                  />
                  <rect x="555" y="-7.5" width="15" height="15" rx="2" fill={NAVY} />
                  <polygon points="580,-7.5 646,-7.5 660,0 646,7.5 580,7.5" fill={NAVY} />
                </>
              ) : null}

              {t.key === 'rlp' ? (
                <>
                  <polyline
                    points="496,0 503,-5 510,5 517,-5 524,5 531,-5 538,5 545,-5 552,5 559,0"
                    fill="none"
                    stroke={STEEL}
                    strokeWidth="2.6"
                  />
                  <rect x="572" y="-7.5" width="15" height="15" rx="2" fill={NAVY} />
                  <rect x="596" y="-4" width="32" height="8" rx="4" fill={SAGE} />
                </>
              ) : null}

              {t.key === 'lecrk' ? (
                <>
                  <ellipse cx="512" cy="0" rx="14" ry="6.5" fill={SAGE} stroke={NAVY} strokeWidth="1.4" />
                  <ellipse cx="543" cy="0" rx="14" ry="6.5" fill={SAGE} stroke={NAVY} strokeWidth="1.4" />
                  <rect x="565" y="-7.5" width="15" height="15" rx="2" fill={NAVY} />
                  <polygon points="590,-7.5 650,-7.5 664,0 650,7.5 590,7.5" fill={TOMATO} />
                </>
              ) : null}

              {t.key === 'lyk' ? (
                <>
                  <circle cx="506" cy="0" r="6.2" fill={STEEL} />
                  <circle cx="522" cy="0" r="6.2" fill={STEEL} />
                  <circle cx="538" cy="0" r="6.2" fill={STEEL} />
                  <rect x="556" y="-7.5" width="15" height="15" rx="2" fill={NAVY} />
                  <polygon points="580,-7.5 646,-7.5 660,0 646,7.5 580,7.5" fill={NAVY} />
                </>
              ) : null}

              {t.key === 'tir' ? (
                <rect x="496" y="-7" width="88" height="14" rx="7" fill={TOMATO} />
              ) : null}

              {t.key === 'kin' ? (
                <polygon points="496,-7.5 594,-7.5 610,0 594,7.5 496,7.5" fill={NAVY} />
              ) : null}

              <text
                x="694"
                y="4"
                fontSize="12"
                fontWeight="800"
                fill={active ? TOMATO : NAVY}
                fontFamily="ui-monospace, monospace"
              >
                {t.code}
              </text>
            </g>
          </g>
        );
      })}

      <text
        x="590"
        y="240"
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="800"
        fill={NAVY}
        fontFamily="ui-monospace, monospace"
      >
        PHASE II · 8 R-GENE FAMILIES
      </text>
    </svg>
  );
}
