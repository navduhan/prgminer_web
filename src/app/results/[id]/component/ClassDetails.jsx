import { motion } from "framer-motion";
import { useMemo } from "react";

// Reference information for common R-gene classes
const rGeneClassInfo = {
  "CNL": {
    title: "CNL (CC-NBS-LRR)",
    description:
      "Contains coiled-coil, nucleotide-binding site, and leucine-rich repeat domains. Important in disease resistance signaling.",
  },
  "KIN": {
    title: "KIN (Kinase)",
    description:
      "Protein kinases involved in phosphorylation-based signaling. Critical for immune response activation and signal transduction.",
  },
  "LYK": {
    title: "LYK (Lysin Motif Kinase)",
    description:
      "Receptor kinases with lysin motifs that recognize chitin and other pathogen-associated molecular patterns.",
  },
  "LECRK": {
    title: "LECRK (Lectin Receptor Kinase)",
    description:
      "Membrane-spanning proteins that combine lectin-based recognition with kinase signaling. Important for pathogen detection.",
  },
  "RLK": {
    title: "RLK (Receptor-like Kinase)",
    description:
      "Transmembrane proteins with extracellular recognition and intracellular kinase domains. Key in pathogen perception and signal initiation.",
  },
  "RLP": {
    title: "RLP (Receptor-like Protein)",
    description:
      "Surface receptors lacking kinase domains, often working with co-receptors. Important for pathogen recognition and immune response.",
  },
  "TIR": {
    title: "TIR (Toll/Interleukin-1 Receptor)",
    description:
      "Proteins with Toll/Interleukin-1 receptor domains. Critical for immune signaling and defense response activation.",
  },
  "TNL": {
    title: "TNL (TIR-NBS-LRR)",
    description:
      "Complex resistance proteins combining TIR, nucleotide-binding site, and leucine-rich repeat domains. Essential for pathogen recognition and defense.",
  },
  "RGene": {
    title: "RGene (Resistance Gene)",
    description:
      "Genes that provide plants with resistance against pathogens. These genes encode proteins that recognize pathogen effectors or their activity.",
  },
  "Non-RGene": {
    title: "Non-RGene",
    description:
      "Sequences that do not exhibit R-gene characteristics and are not involved in direct pathogen resistance mechanisms.",
  },
};

const ClassDetails = ({ selectedPhase, classes = [] }) => {
  // Process available classes to show only those relevant to the current phase
  const phaseFilteredClasses = useMemo(() => {
    if (selectedPhase === 'Phase1') {
      // For Phase1, we typically only have 'RGene' and 'Non-RGene' classes
      return classes.filter(className => 
        className === 'RGene' || 
        className === 'Non-RGene' || 
        className === 'Rgene' || 
        className === 'Non-Rgene'
      );
    } else {
      // For Phase2, we filter out the Phase1 classes
      return classes.filter(className => 
        className !== 'RGene' && 
        className !== 'Non-RGene' && 
        className !== 'Rgene' && 
        className !== 'Non-Rgene'
      );
    }
  }, [classes, selectedPhase]);

  // Map the filtered classes to their information, falling back to a default if not found
  const classesWithInfo = useMemo(() => {
    return phaseFilteredClasses.map(className => {
      // Try to find the class in our reference information
      const normalizedName = className.toUpperCase().replace('-', '');
      const info = Object.entries(rGeneClassInfo).find(([key]) => 
        key.toUpperCase() === normalizedName || key.toUpperCase().includes(normalizedName)
      );
      
      if (info) {
        return {
          ...info[1],
          className
        };
      }
      
      // Fall back to a default if we don't have information
      return {
        title: className,
        description: `A class of sequences identified as part of the ${selectedPhase} analysis.`,
        className
      };
    });
  }, [phaseFilteredClasses, selectedPhase]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {selectedPhase === "Phase1" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phase 1: R-gene Detection</h3>
          <div className="space-y-4">
            <p className="text-gray-700">
              In this initial phase, PRGminer analyzes protein sequences to determine if they are potential R-genes.
              The model provides confidence scores ranging from 0 to 1, where scores above 0.5 indicate likely R-genes.
            </p>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Classification Types:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>RGene: Sequences identified as plant resistance genes</li>
                <li>Non-RGene: Sequences that do not exhibit R-gene characteristics</li>
              </ul>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-50 to-violet-100/50 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Phase 2: Detailed R-gene Classification</h3>
            <p className="text-gray-700 mb-4">
              In Phase 2, sequences are classified into specific R-gene families based on their structural and functional characteristics.
              Each class represents a distinct type of resistance gene with unique features and roles in plant immunity.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {classesWithInfo.map((rClass, index) => (
              <motion.div
                key={rClass.className}
                variants={item}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{rClass.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rClass.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClassDetails; 