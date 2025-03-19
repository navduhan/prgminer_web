import { motion } from "framer-motion";
import SectionContainer from "./SectionContainer";

const rGeneClasses = [
  {
    title: "CNL (CC-NBS-LRR)",
    description:
      "Contains coiled-coil, nucleotide-binding site, and leucine-rich repeat domains. Important in disease resistance signaling.",
  },
  {
    title: "KIN (Kinase)",
    description:
      "Protein kinases involved in phosphorylation-based signaling. Critical for immune response activation and signal transduction.",
  },
  {
    title: "LYK (Lysin Motif Kinase)",
    description:
      "Receptor kinases with lysin motifs that recognize chitin and other pathogen-associated molecular patterns.",
  },
  {
    title: "LECRK (Lectin Receptor Kinase)",
    description:
      "Membrane-spanning proteins that combine lectin-based recognition with kinase signaling. Important for pathogen detection.",
  },
  {
    title: "RLK (Receptor-like Kinase)",
    description:
      "Transmembrane proteins with extracellular recognition and intracellular kinase domains. Key in pathogen perception and signal initiation.",
  },
  {
    title: "RLP (Receptor-like Protein)",
    description:
      "Surface receptors lacking kinase domains, often working with co-receptors. Important for pathogen recognition and immune response.",
  },
  {
    title: "TIR (Toll/Interleukin-1 Receptor)",
    description:
      "Proteins with Toll/Interleukin-1 receptor domains. Critical for immune signaling and defense response activation.",
  },
  {
    title: "TNL (TIR-NBS-LRR)",
    description:
      "Complex resistance proteins combining TIR, nucleotide-binding site, and leucine-rich repeat domains. Essential for pathogen recognition and defense.",
  },
];

const RGeneClassesSection = () => (
  <motion.div
    className="container mx-auto px-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-xl font-semibold text-gray-700 mb-4">R-gene Classes</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rGeneClasses.map((gene, index) => (
        <div key={index} className="bg-white rounded-xl p-5 shadow-sm">
          <h4 className="font-medium text-gray-800">{gene.title}</h4>
          <p className="text-sm text-gray-600">{gene.description}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

const PredictionStrategySection = () => {
  return (
    <SectionContainer title="Prediction Strategy">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Two-Phase Prediction Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Two-Phase Prediction Approach
          </h3>
          <div className="space-y-6">
            {/* Phase 1 */}
            <motion.div
              className="bg-emerald-50 rounded-xl p-6 border border-emerald-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                Phase 1: R-gene Detection
              </h4>
              <p className="text-gray-600 mb-4">
                In this initial phase, PRGminer analyzes protein sequences to
                determine if they are potential R-genes. The model provides
                confidence scores ranging from 0 to 1, where scores above 0.5
                indicate likely R-genes.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Fast preliminary screening of sequences</li>
                <li>Binary classification: RGene vs Non-RGene</li>
                <li>Confidence scores indicate prediction reliability</li>
              </ul>
            </motion.div>

            {/* Phase 2 */}
            <motion.div
              className="bg-violet-50 rounded-xl p-6 border border-violet-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                Phase 2: Family Classification
              </h4>
              <p className="text-gray-600 mb-4">
                Sequences identified as R-genes undergo detailed classification
                into specific functional categories. Each sequence is analyzed
                for characteristic domains and structural features to determine
                its R-gene family.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Detailed multi-class prediction</li>
                <li>Identifies specific R-gene families</li>
                <li>Provides confidence scores for each potential class</li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* R-Gene Classes Section */}  
        <RGeneClassesSection />
      </motion.div>
    </SectionContainer>
  );
};

export default PredictionStrategySection;