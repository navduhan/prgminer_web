'use client';

import type { RGeneClassKey } from '@/data/rgene-classes';

const NAVY = '#0f2744';
const TOMATO = '#d93829';
const STEEL = '#5b7c99';
const LIGHT_STEEL = '#89a4bc';
const SAGE = '#8fa89b';

// Precompute phospholipid bilayer coordinates along an arch centered at (560, 625)
const CX = 560;
const CY = 635;
const R_OUT = 445;
const R_IN = 404;

const LIPID_ANGLES: number[] = [];
for (let deg = -144; deg <= -36; deg += 1.95) {
  // Leave clean channels where the 4 transmembrane PRRs cross the membrane
  if ([-118, -99, -81, -62].some((gap) => Math.abs(deg - gap) < 2.2)) continue;
  LIPID_ANGLES.push(deg);
}

const FIBRIL_LINES = Array.from({ length: 14 }, (_, i) => {
  const d1 = -146 + i * 7.8;
  const d2 = -124 + i * 7.4;
  const r1 = (d1 * Math.PI) / 180;
  const r2 = (d2 * Math.PI) / 180;
  return {
    x1: CX + 518 * Math.cos(r1),
    y1: CY + 518 * Math.sin(r1),
    x2: CX + 474 * Math.cos(r2),
    y2: CY + 474 * Math.sin(r2),
  };
});

export default function PlantCellCutawaySVG({
  selected,
  onSelect,
}: {
  selected: RGeneClassKey;
  onSelect: (key: RGeneClassKey) => void;
}) {
  const isSel = (k: RGeneClassKey) => selected === k;
  const stroke = (k: RGeneClassKey) => (isSel(k) ? TOMATO : NAVY);

  return (
    <svg
      viewBox="0 0 1120 392"
      className="w-full block select-none bg-white"
      role="img"
      aria-label="Interactive plant cell wall, plasma membrane, and cytoplasmic R-gene immunity cutaway"
    >
      <defs>
        <marker
          id="elicitor-arrow"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill={NAVY} />
        </marker>
      </defs>

      {/* Compartments annotation */}
      <text x="24" y="28" fontSize="11" fontWeight="800" fill="#64748b" fontFamily="ui-monospace, monospace">
        EXTRACELLULAR APOPLAST &amp; CELL WALL
      </text>
      <text x="24" y="376" fontSize="11" fontWeight="800" fill="#64748b" fontFamily="ui-monospace, monospace">
        PLANT CYTOPLASM (INTRACELLULAR IMMUNE COMPLEXES)
      </text>
      <text x="852" y="28" fontSize="11" fontWeight="700" fill={TOMATO} fontFamily="ui-monospace, monospace">
        ● PATHOGEN PAMPs &amp; EFFECTORS
      </text>

      {/* Arched Plant Cell Wall Band + Cellulose Microfibrils */}
      <path
        d="M 48 318 A 540 540 0 0 1 1072 318"
        fill="none"
        stroke={SAGE}
        strokeWidth="44"
        opacity="0.2"
      />
      <path
        d="M 56 300 A 520 520 0 0 1 1064 300"
        fill="none"
        stroke={SAGE}
        strokeWidth="7"
        opacity="0.65"
      />
      {FIBRIL_LINES.map((f, idx) => (
        <line
          key={idx}
          x1={f.x1.toFixed(1)}
          y1={f.y1.toFixed(1)}
          x2={f.x2.toFixed(1)}
          y2={f.y2.toFixed(1)}
          stroke={SAGE}
          strokeWidth="1.5"
          opacity="0.55"
        />
      ))}

      {/* Curved Phospholipid Bilayer */}
      {LIPID_ANGLES.map((deg, idx) => {
        const rad = (deg * Math.PI) / 180;
        const xOut = CX + R_OUT * Math.cos(rad);
        const yOut = CY + R_OUT * Math.sin(rad);
        const xIn = CX + R_IN * Math.cos(rad);
        const yIn = CY + R_IN * Math.sin(rad);
        const xmOut = CX + (R_OUT - 16) * Math.cos(rad);
        const ymOut = CY + (R_OUT - 16) * Math.sin(rad);
        const xmIn = CX + (R_IN + 16) * Math.cos(rad);
        const ymIn = CY + (R_IN + 16) * Math.sin(rad);
        return (
          <g key={idx}>
            <line
              x1={xOut.toFixed(1)}
              y1={yOut.toFixed(1)}
              x2={xmOut.toFixed(1)}
              y2={ymOut.toFixed(1)}
              stroke="#64748b"
              strokeWidth="1.15"
            />
            <line
              x1={xIn.toFixed(1)}
              y1={yIn.toFixed(1)}
              x2={xmIn.toFixed(1)}
              y2={ymIn.toFixed(1)}
              stroke="#64748b"
              strokeWidth="1.15"
            />
            <circle
              cx={xOut.toFixed(1)}
              cy={yOut.toFixed(1)}
              r="4.8"
              fill={LIGHT_STEEL}
              stroke={NAVY}
              strokeWidth="1.1"
            />
            <circle
              cx={xIn.toFixed(1)}
              cy={yIn.toFixed(1)}
              r="4.8"
              fill={LIGHT_STEEL}
              stroke={NAVY}
              strokeWidth="1.1"
            />
          </g>
        );
      })}

      {/* ==================== 1. RLK (eLRR Solenoid + TM + Kinase) ==================== */}
      <g
        onClick={() => onSelect('rlk')}
        className="svg-receptor"
        transform="translate(362, 236) rotate(-27)"
        role="button"
        tabIndex={0}
        aria-label="RLK: Leucine-rich repeat receptor-like kinase"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect('rlk')}
      >
        {isSel('rlk') ? (
          <circle cx="-4" cy="-8" r="68" fill={TOMATO} opacity="0.08" />
        ) : null}
        {/* Pathogen PAMP elicitors */}
        <rect x="-34" y="-128" width="12" height="12" rx="2" transform="rotate(18 -28 -122)" fill={TOMATO} />
        <rect x="-12" y="-138" width="12" height="12" rx="2" transform="rotate(-15 -6 -132)" fill={TOMATO} />
        <path
          d="M -18 -112 Q -10 -96 -10 -84"
          fill="none"
          stroke={NAVY}
          strokeWidth="1.6"
          markerEnd="url(#elicitor-arrow)"
        />
        {/* Transmembrane stem */}
        <line x1="0" y1="-34" x2="0" y2="54" stroke={stroke('rlk')} strokeWidth="6" />
        {/* Curved segmented LRR horseshoe solenoid */}
        <path
          d="M 0 -34 C 28 -74, -36 -104, -40 -52"
          fill="none"
          stroke={isSel('rlk') ? TOMATO : LIGHT_STEEL}
          strokeWidth="14"
          strokeDasharray="6 3"
        />
        <path
          d="M 0 -34 C 28 -74, -36 -104, -40 -52"
          fill="none"
          stroke={stroke('rlk')}
          strokeWidth="15.5"
          strokeDasharray="1.5 7.5"
        />
        <rect x="-15" y="-76" width="11" height="11" rx="2" fill={TOMATO} />
        {/* Cytoplasmic Kinase domain */}
        <rect
          x="-9"
          y="46"
          width="18"
          height="34"
          rx="9"
          fill={isSel('rlk') ? TOMATO : NAVY}
        />
        <g transform="rotate(27 0 96)">
          <rect
            x="-24"
            y="84"
            width="48"
            height="20"
            rx="2"
            fill={isSel('rlk') ? TOMATO : '#ffffff'}
            stroke={stroke('rlk')}
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="98"
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            fill={isSel('rlk') ? '#ffffff' : NAVY}
            fontFamily="ui-monospace, monospace"
          >
            RLK
          </text>
        </g>
      </g>

      {/* ==================== 2. LECRK (Paired Lectin Lobes + TM + Kinase) ==================== */}
      <g
        onClick={() => onSelect('lecrk')}
        className="svg-receptor"
        transform="translate(492, 198) rotate(-9)"
        role="button"
        tabIndex={0}
        aria-label="LECRK: Lectin receptor-like kinase"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect('lecrk')}
      >
        {isSel('lecrk') ? (
          <circle cx="0" cy="-4" r="64" fill={TOMATO} opacity="0.08" />
        ) : null}
        <polygon points="-16,-132 -9,-138 -2,-132 -9,-126" fill={TOMATO} />
        <polygon points="8,-140 15,-146 22,-140 15,-134" fill={TOMATO} />
        <path
          d="M 2 -124 Q 4 -104 2 -88"
          fill="none"
          stroke={NAVY}
          strokeWidth="1.6"
          markerEnd="url(#elicitor-arrow)"
        />
        <line x1="0" y1="-34" x2="0" y2="54" stroke={stroke('lecrk')} strokeWidth="5.5" />
        {/* Paired Lectin β-barrel lobes */}
        <ellipse
          cx="-16"
          cy="-54"
          rx="13"
          ry="18"
          transform="rotate(-24 -16 -54)"
          fill={isSel('lecrk') ? '#fde2df' : LIGHT_STEEL}
          stroke={stroke('lecrk')}
          strokeWidth="2.4"
        />
        <ellipse
          cx="16"
          cy="-54"
          rx="13"
          ry="18"
          transform="rotate(24 16 -54)"
          fill={isSel('lecrk') ? '#fde2df' : LIGHT_STEEL}
          stroke={stroke('lecrk')}
          strokeWidth="2.4"
        />
        <polygon points="0,-78 9,-69 0,-60 -9,-69" fill={TOMATO} />
        <rect
          x="-9"
          y="46"
          width="18"
          height="34"
          rx="9"
          fill={isSel('lecrk') ? TOMATO : NAVY}
        />
        <g transform="rotate(9 0 96)">
          <rect
            x="-30"
            y="84"
            width="60"
            height="20"
            rx="2"
            fill={isSel('lecrk') ? TOMATO : '#ffffff'}
            stroke={stroke('lecrk')}
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="98"
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            fill={isSel('lecrk') ? '#ffffff' : NAVY}
            fontFamily="ui-monospace, monospace"
          >
            LECRK
          </text>
        </g>
      </g>

      {/* ==================== 3. LYK (3-Bead LysM Ectodomain + TM + Kinase) ==================== */}
      <g
        onClick={() => onSelect('lyk')}
        className="svg-receptor"
        transform="translate(628, 198) rotate(9)"
        role="button"
        tabIndex={0}
        aria-label="LYK: Lysin-motif receptor kinase"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect('lyk')}
      >
        {isSel('lyk') ? (
          <circle cx="0" cy="-6" r="64" fill={TOMATO} opacity="0.08" />
        ) : null}
        <rect x="-14" y="-144" width="11" height="11" rx="2" transform="rotate(20 -8 -138)" fill={TOMATO} />
        <rect x="6" y="-136" width="11" height="11" rx="2" transform="rotate(-12 12 -130)" fill={TOMATO} />
        <path
          d="M 2 -120 L 0 -96"
          fill="none"
          stroke={NAVY}
          strokeWidth="1.6"
          markerEnd="url(#elicitor-arrow)"
        />
        <line x1="0" y1="-22" x2="0" y2="54" stroke={stroke('lyk')} strokeWidth="5.5" />
        {[ -28, -50, -72 ].map((cyVal, bIdx) => (
          <circle
            key={bIdx}
            cx="0"
            cy={cyVal}
            r="10.5"
            fill={isSel('lyk') ? '#fde2df' : LIGHT_STEEL}
            stroke={stroke('lyk')}
            strokeWidth="2.4"
          />
        ))}
        <polygon points="0,-92 9,-83 0,-74 -9,-83" fill={TOMATO} />
        <rect
          x="-9"
          y="46"
          width="18"
          height="34"
          rx="9"
          fill={isSel('lyk') ? TOMATO : NAVY}
        />
        <g transform="rotate(-9 0 96)">
          <rect
            x="-24"
            y="84"
            width="48"
            height="20"
            rx="2"
            fill={isSel('lyk') ? TOMATO : '#ffffff'}
            stroke={stroke('lyk')}
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="98"
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            fill={isSel('lyk') ? '#ffffff' : NAVY}
            fontFamily="ui-monospace, monospace"
          >
            LYK
          </text>
        </g>
      </g>

      {/* ==================== 4. RLP (eLRR Coil + TM + Short Tail, Lacks Kinase) ==================== */}
      <g
        onClick={() => onSelect('rlp')}
        className="svg-receptor"
        transform="translate(758, 236) rotate(27)"
        role="button"
        tabIndex={0}
        aria-label="RLP: Receptor-like protein lacking cytoplasmic kinase"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect('rlp')}
      >
        {isSel('rlp') ? (
          <circle cx="0" cy="-14" r="64" fill={TOMATO} opacity="0.08" />
        ) : null}
        <rect x="4" y="-134" width="11" height="11" rx="2" fill={TOMATO} />
        <rect x="22" y="-122" width="11" height="11" rx="2" fill={TOMATO} />
        <path
          d="M 14 -108 Q 6 -96 3 -84"
          fill="none"
          stroke={NAVY}
          strokeWidth="1.6"
          markerEnd="url(#elicitor-arrow)"
        />
        <line x1="0" y1="-20" x2="0" y2="44" stroke={stroke('rlp')} strokeWidth="5.5" />
        <polyline
          points="0,-20 -10,-30 10,-40 -10,-50 10,-60 -10,-70 9,-80"
          fill="none"
          stroke={stroke('rlp')}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <polygon points="0,-94 10,-83 -8,-82" fill={TOMATO} />
        {/* Short cytoplasmic tail (no kinase) */}
        <circle cx="0" cy="48" r="5" fill={TOMATO} />
        <g transform="rotate(-27 0 74)">
          <rect
            x="-24"
            y="62"
            width="48"
            height="20"
            rx="2"
            fill={isSel('rlp') ? TOMATO : '#ffffff'}
            stroke={stroke('rlp')}
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="76"
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            fill={isSel('rlp') ? '#ffffff' : NAVY}
            fontFamily="ui-monospace, monospace"
          >
            RLP
          </text>
        </g>
      </g>

      {/* Intracellular signaling arcs from PRRs to NLRs / Kinases */}
      <path
        d="M 338 308 C 304 328, 322 355, 355 344"
        fill="none"
        stroke={NAVY}
        strokeWidth="1.4"
        strokeDasharray="4 4"
      />
      <path
        d="M 780 302 C 810 322, 815 342, 835 335"
        fill="none"
        stroke={NAVY}
        strokeWidth="1.4"
        strokeDasharray="4 4"
      />

      {/* ==================== 5. CNL (5-Spoke Pentameric Resistosome Wheel) ==================== */}
      <g
        onClick={() => onSelect('cnl')}
        className="svg-receptor"
        transform="translate(405, 326)"
        role="button"
        tabIndex={0}
        aria-label="CNL: Pentameric CC-NB-ARC-LRR resistosome"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect('cnl')}
      >
        {isSel('cnl') ? <circle cx="0" cy="0" r="62" fill={TOMATO} opacity="0.09" /> : null}
        {Array.from({ length: 5 }, (_, k) => {
          const angle = -90 + k * 72;
          const rad = (angle * Math.PI) / 180;
          const sx = Math.cos(rad) * 36;
          const sy = Math.sin(rad) * 36;
          return (
            <g key={k} transform={`translate(${sx.toFixed(1)},${sy.toFixed(1)}) rotate(${angle + 90})`}>
              <rect
                x="-12"
                y="-17"
                width="10.5"
                height="29"
                rx="5"
                fill={isSel('cnl') ? TOMATO : NAVY}
              />
              <rect x="1.5" y="-17" width="10.5" height="29" rx="5" fill={NAVY} />
            </g>
          );
        })}
        <circle cx="0" cy="0" r="18" fill={TOMATO} stroke={NAVY} strokeWidth="2.5" />
        <circle cx="0" cy="0" r="7.5" fill="#ffffff" stroke={NAVY} strokeWidth="2" />
        <rect
          x="58"
          y="-11"
          width="52"
          height="22"
          rx="2"
          fill={isSel('cnl') ? TOMATO : '#ffffff'}
          stroke={stroke('cnl')}
          strokeWidth="1.5"
        />
        <text
          x="84"
          y="4"
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fill={isSel('cnl') ? '#ffffff' : NAVY}
          fontFamily="ui-monospace, monospace"
        >
          CNL
        </text>
      </g>

      {/* ==================== 6. TNL (4-Leaf Tetrameric TIR-NLR Holoenzyme) ==================== */}
      <g
        onClick={() => onSelect('tnl')}
        className="svg-receptor"
        transform="translate(705, 326)"
        role="button"
        tabIndex={0}
        aria-label="TNL: Tetrameric TIR-NB-ARC-LRR holoenzyme"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect('tnl')}
      >
        {isSel('tnl') ? <circle cx="0" cy="0" r="62" fill={TOMATO} opacity="0.09" /> : null}
        {Array.from({ length: 4 }, (_, k) => (
          <g key={k} transform={`rotate(${45 + k * 90})`}>
            <ellipse
              cx="0"
              cy="-30"
              rx="17"
              ry="23"
              fill={isSel('tnl') ? '#163a63' : NAVY}
            />
            <ellipse cx="0" cy="-21" rx="9.5" ry="14" fill={TOMATO} />
            <circle cx="0" cy="-26" r="5.5" fill={LIGHT_STEEL} stroke={NAVY} strokeWidth="1.2" />
          </g>
        ))}
        <circle cx="0" cy="0" r="6" fill="#ffffff" stroke={NAVY} strokeWidth="2" />
        <rect
          x="-108"
          y="-11"
          width="52"
          height="22"
          rx="2"
          fill={isSel('tnl') ? TOMATO : '#ffffff'}
          stroke={stroke('tnl')}
          strokeWidth="1.5"
        />
        <text
          x="-82"
          y="4"
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fill={isSel('tnl') ? '#ffffff' : NAVY}
          fontFamily="ui-monospace, monospace"
        >
          TNL
        </text>
      </g>

      {/* ==================== 7. TIR (Standalone Catalytic TIR Dimer) ==================== */}
      <g
        onClick={() => onSelect('tir')}
        className="svg-receptor"
        transform="translate(558, 272)"
        role="button"
        tabIndex={0}
        aria-label="TIR: Truncated TIR-only NADase sensor"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect('tir')}
      >
        {isSel('tir') ? <circle cx="0" cy="4" r="42" fill={TOMATO} opacity="0.09" /> : null}
        <rect
          x="-27"
          y="-13"
          width="25"
          height="28"
          rx="9"
          fill={TOMATO}
          stroke={NAVY}
          strokeWidth="2"
        />
        <rect
          x="2"
          y="-13"
          width="25"
          height="28"
          rx="9"
          fill={STEEL}
          stroke={NAVY}
          strokeWidth="2"
        />
        <rect
          x="-24"
          y="21"
          width="48"
          height="20"
          rx="2"
          fill={isSel('tir') ? TOMATO : '#ffffff'}
          stroke={stroke('tir')}
          strokeWidth="1.5"
        />
        <text
          x="0"
          y="35"
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fill={isSel('tir') ? '#ffffff' : NAVY}
          fontFamily="ui-monospace, monospace"
        >
          TIR
        </text>
      </g>

      {/* ==================== 8. KIN (Cytoplasmic Decoy / Defense Kinase) ==================== */}
      <g
        onClick={() => onSelect('kin')}
        className="svg-receptor"
        transform="translate(875, 332)"
        role="button"
        tabIndex={0}
        aria-label="KIN: Resistance-associated cytoplasmic kinase"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect('kin')}
      >
        {isSel('kin') ? <circle cx="0" cy="0" r="44" fill={TOMATO} opacity="0.09" /> : null}
        <polygon
          points="-26,-15 16,-15 28,0 16,15 -26,15"
          fill={isSel('kin') ? TOMATO : NAVY}
        />
        <circle cx="18" cy="-16" r="8" fill={TOMATO} stroke="#ffffff" strokeWidth="1.5" />
        <text
          x="18"
          y="-12.5"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="800"
          fill="#ffffff"
          fontFamily="ui-monospace, monospace"
        >
          P
        </text>
        <rect
          x="-24"
          y="21"
          width="48"
          height="20"
          rx="2"
          fill={isSel('kin') ? TOMATO : '#ffffff'}
          stroke={stroke('kin')}
          strokeWidth="1.5"
        />
        <text
          x="0"
          y="35"
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fill={isSel('kin') ? '#ffffff' : NAVY}
          fontFamily="ui-monospace, monospace"
        >
          KIN
        </text>
      </g>
    </svg>
  );
}
