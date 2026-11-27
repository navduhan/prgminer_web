import type { DomainBlock } from '@/components/DomainSchematic';

export type RGeneClassKey = 'cnl' | 'tnl' | 'rlk' | 'rlp' | 'lecrk' | 'lyk' | 'tir' | 'kin';

export type RGeneClassInfo = {
  key: RGeneClassKey;
  code: 'CNL' | 'TNL' | 'RLK' | 'RLP' | 'LECRK' | 'LYK' | 'TIR' | 'KIN';
  name: string;
  immuneLayer: 'ETI' | 'PTI' | 'Signaling';
  immuneLayerLabel: string;
  compartment: 'Cytoplasm / Nucleocytoplasmic' | 'Plasma Membrane (Cell Surface)';
  architectureFormula: string;
  canonicalExamples: readonly string[];
  summary: string;
  mechanism: string;
  conservedMotifs: readonly string[];
  domains: readonly DomainBlock[];
};

export const RGENE_CLASSES: readonly RGeneClassInfo[] = [
  {
    key: 'cnl',
    code: 'CNL',
    name: 'Coiled-coil–NB-ARC–LRR Receptor',
    immuneLayer: 'ETI',
    immuneLayerLabel: 'Intracellular NLR (ETI)',
    compartment: 'Cytoplasm / Nucleocytoplasmic',
    architectureFormula: 'CC – NB-ARC – LRR',
    canonicalExamples: ['ZAR1 (Arabidopsis)', 'RPM1 (Arabidopsis)', 'MLA10 (Barley)', 'Rx1 (Potato)'],
    summary:
      'Canonical non-TIR intracellular nucleotide-binding leucine-rich repeat (NLR) immune receptors carrying an N-terminal coiled-coil (CC / Rx-CC) domain.',
    mechanism:
      'Recognizes pathogen-secreted cytoplasmic effectors directly or via guardee/decoy host proteins; oligomerizes into a wheel-like resistosome calcium-permeable channel at the plasma membrane to trigger hypersensitive cell death.',
    conservedMotifs: ['EDVID motif (CC)', 'P-loop / Walker A', 'Kinase-2 / Walker B', 'MHD motif (NB-ARC)'],
    domains: [
      { code: 'CC', label: 'Coiled-Coil', widthPct: 22, tone: 'cc' },
      { code: 'NB-ARC', label: 'Nucleotide-Binding Switch', widthPct: 38, tone: 'nbarc' },
      { code: 'LRR', label: 'Leucine-Rich Repeat', widthPct: 40, tone: 'lrr' },
    ],
  },
  {
    key: 'tnl',
    code: 'TNL',
    name: 'TIR–NB-ARC–LRR Receptor',
    immuneLayer: 'ETI',
    immuneLayerLabel: 'Intracellular NLR (ETI)',
    compartment: 'Cytoplasm / Nucleocytoplasmic',
    architectureFormula: 'TIR – NB-ARC – LRR',
    canonicalExamples: ['RPP1 (Arabidopsis)', 'RPS4 (Arabidopsis)', 'ROQ1 (Nicotiana)', 'N (Tobacco)'],
    summary:
      'Intracellular NLR receptors featuring an N-terminal Toll/Interleukin-1 Receptor (TIR) enzymatic signaling domain fused to central NB-ARC and C-terminal LRR modules.',
    mechanism:
      'Effector binding induces tetrameric TNL holoenzyme assembly, activating NAD⁺-cleaving NADase/2′,3′-cAMP/cGMP synthetase activity in the TIR domain to signal via EDS1–PAD4/SAG101 helper NLRs.',
    conservedMotifs: ['BB-loop & catalytic Glu (TIR)', 'P-loop / Walker A', 'GLPL & MHD (NB-ARC)', 'C-JID'],
    domains: [
      { code: 'TIR', label: 'Toll/IL-1R NADase', widthPct: 24, tone: 'tir' },
      { code: 'NB-ARC', label: 'Nucleotide-Binding Switch', widthPct: 36, tone: 'nbarc' },
      { code: 'LRR', label: 'Leucine-Rich Repeat', widthPct: 40, tone: 'lrr' },
    ],
  },
  {
    key: 'rlk',
    code: 'RLK',
    name: 'Leucine-Rich Repeat Receptor-Like Kinase',
    immuneLayer: 'PTI',
    immuneLayerLabel: 'Cell-Surface PRR (PTI)',
    compartment: 'Plasma Membrane (Cell Surface)',
    architectureFormula: 'eLRR – TM – Kinase',
    canonicalExamples: ['FLS2 (Arabidopsis)', 'EFR (Arabidopsis)', 'XA21 (Rice)', 'BAK1 / SERK3'],
    summary:
      'Transmembrane pattern-recognition receptors coupling an apoplastic leucine-rich repeat (eLRR) ectodomain to a single-pass transmembrane helix and cytoplasmic Ser/Thr kinase.',
    mechanism:
      'Perceives conserved microbial or damage-associated molecular patterns (e.g. bacterial flagellin flg22, EF-Tu elf18), recruiting co-receptors such as BAK1 to trans-phosphorylate RLCKs and launch MAPK/ROS cascades.',
    conservedMotifs: ['LxxLxLxxN eLRR solenoid', 'Single-pass TM helix', 'HRD / DFG catalytic kinase'],
    domains: [
      { code: 'eLRR', label: 'Extracellular LRR', widthPct: 48, tone: 'lrr' },
      { code: 'TM', label: 'TM', widthPct: 12, tone: 'tm' },
      { code: 'Kinase', label: 'Cytoplasmic Kinase', widthPct: 40, tone: 'kinase' },
    ],
  },
  {
    key: 'rlp',
    code: 'RLP',
    name: 'Receptor-Like Protein',
    immuneLayer: 'PTI',
    immuneLayerLabel: 'Cell-Surface PRR (PTI)',
    compartment: 'Plasma Membrane (Cell Surface)',
    architectureFormula: 'eLRR – TM – Short Tail',
    canonicalExamples: ['Cf-2 / Cf-4 / Cf-9 (Tomato)', 'RLP23 (Arabidopsis)', 'Ve1 (Tomato)'],
    summary:
      'Cell-surface eLRR receptors anchored by a ~25-aa transmembrane helix with a short cytoplasmic tail lacking an intracellular kinase domain.',
    mechanism:
      'Binds apoplastic fungal/oomycete avirulence effectors or NLP peptides (direct or via guarded apoplastic proteases such as Rcr3) and constitutively partners with SOBIR1 and BAK1 to initiate defense signaling.',
    conservedMotifs: ['Extracellular LRR island', 'GxxxG juxtamembrane TM', 'Short acidic cytosolic tail'],
    domains: [
      { code: 'eLRR', label: 'Extracellular LRR Ectodomain', widthPct: 74, tone: 'lrr' },
      { code: 'TM', label: 'TM', widthPct: 14, tone: 'tm' },
      { code: 'Tail', label: 'Tail', widthPct: 12, tone: 'cc' },
    ],
  },
  {
    key: 'lecrk',
    code: 'LECRK',
    name: 'Lectin Receptor-Like Kinase',
    immuneLayer: 'PTI',
    immuneLayerLabel: 'Cell-Surface PRR (PTI)',
    compartment: 'Plasma Membrane (Cell Surface)',
    architectureFormula: 'LECM – TM – Kinase',
    canonicalExamples: ['DORN1 / LecRK-I.9 (Arabidopsis)', 'LecRK-VI.2', 'Pi-d2 (Rice)'],
    summary:
      'Membrane-spanning receptor kinases combining an extracellular carbohydrate- or eATP-binding lectin (G-, L-, or C-type LECM) domain with an intracellular kinase.',
    mechanism:
      'Detects cell-wall glycans, lipopolysaccharides, and extracellular ATP danger signals released upon wounding or pathogen ingress, strengthening stomatal immunity and cell-wall-plasma-membrane continuum integrity.',
    conservedMotifs: ['Lectin β-barrel (G/L/C-type)', 'Transmembrane helix', 'RD / non-RD Ser/Thr kinase'],
    domains: [
      { code: 'LECM', label: 'Extracellular Lectin', widthPct: 44, tone: 'lectin' },
      { code: 'TM', label: 'TM', widthPct: 12, tone: 'tm' },
      { code: 'Kinase', label: 'Cytoplasmic Kinase', widthPct: 44, tone: 'kinase' },
    ],
  },
  {
    key: 'lyk',
    code: 'LYK',
    name: 'Lysin-Motif Receptor Kinase',
    immuneLayer: 'PTI',
    immuneLayerLabel: 'Cell-Surface PRR (PTI)',
    compartment: 'Plasma Membrane (Cell Surface)',
    architectureFormula: 'LYSM (×1–3) – TM – Kinase',
    canonicalExamples: ['CERK1 (Arabidopsis)', 'LYK5 (Arabidopsis)', 'OsCERK1 (Rice)', 'NFR1 (Lotus)'],
    summary:
      'Specialized pattern-recognition receptor kinases carrying tandem extracellular Lysin Motifs (LysM / LYSM) that bind GlcNAc-containing glycans.',
    mechanism:
      'Directly recognizes fungal chitin oligomers and bacterial peptidoglycan fragments at the cell surface, forming ligand-induced heterocomplexes (e.g. LYK5–CERK1) to trigger chitin-induced innate immunity.',
    conservedMotifs: ['Tandem βααβ LysM modules', 'Single-pass TM', 'Intracellular kinase / pseudokinase'],
    domains: [
      { code: 'LYSM', label: 'Tandem LysM Ectodomain', widthPct: 44, tone: 'lysm' },
      { code: 'TM', label: 'TM', widthPct: 12, tone: 'tm' },
      { code: 'Kinase', label: 'Cytoplasmic Kinase', widthPct: 44, tone: 'kinase' },
    ],
  },
  {
    key: 'tir',
    code: 'TIR',
    name: 'Truncated TIR-Only Immune Protein',
    immuneLayer: 'Signaling',
    immuneLayerLabel: 'Intracellular TIR Module',
    compartment: 'Cytoplasm / Nucleocytoplasmic',
    architectureFormula: 'TIR (lacks NB-ARC & LRR)',
    canonicalExamples: ['RBA1 (Arabidopsis)', 'TX14 (Arabidopsis)', 'TN2 / TIR-Xhubs'],
    summary:
      'Standalone Toll/Interleukin-1 Receptor (TIR) domain proteins lacking NB-ARC and LRR regions that act as autonomous effector sensors and NADase signaling amplifiers.',
    mechanism:
      'Self-associates upon pathogen effector challenge (such as HopBA1 recognition by RBA1) to catalyze NAD⁺/nucleic-acid-derived small signaling molecules that engage EDS1 immune hubs.',
    conservedMotifs: ['Conserved TIR box 1–3', 'Catalytic glutamate (E) NADase active site'],
    domains: [
      { code: 'TIR', label: 'Standalone Catalytic TIR Domain', widthPct: 100, tone: 'tir' },
    ],
  },
  {
    key: 'kin',
    code: 'KIN',
    name: 'Resistance-Associated Cytoplasmic Kinase',
    immuneLayer: 'Signaling',
    immuneLayerLabel: 'Intracellular Kinase / Decoy',
    compartment: 'Cytoplasm / Nucleocytoplasmic',
    architectureFormula: 'Cytoplasmic Ser/Thr/Tyr Kinase',
    canonicalExamples: ['Pto (Tomato)', 'PBS1 (Arabidopsis)', 'BIK1 / RIPK (Arabidopsis)', 'RPG1 (Barley)'],
    summary:
      'Soluble or myristoylated cytoplasmic protein kinases lacking extracellular or transmembrane domains that act either as direct signal transducers or NLR-guarded decoys.',
    mechanism:
      'Phosphorylates downstream defense substrates (e.g. RBOHD, MAPK modules) or serves as an effector cleavage/modification bait guarded by CNL/TNL receptors (e.g. AvrPphB cleavage of PBS1 activating RPS5).',
    conservedMotifs: ['Gly-rich ATP-binding loop', 'Catalytic HRD motif', 'Activation segment DFG–APE'],
    domains: [
      { code: 'Kinase', label: 'Intracellular Resistance Kinase Domain', widthPct: 100, tone: 'kinase' },
    ],
  },
] as const;

export const RGENE_CLASS_MAP: Record<string, RGeneClassInfo> = Object.fromEntries(
  RGENE_CLASSES.map((item) => [item.code, item]),
);
