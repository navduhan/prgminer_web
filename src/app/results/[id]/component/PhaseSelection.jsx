// src/components/results/PhaseSelection.jsx
import { motion } from "framer-motion";

const PhaseSelection = ({ 
  selectedPhase, 
  onPhaseChange, 
  phase1Count, 
  phase2Count,
  // For backward compatibility
  setSelectedPhase = onPhaseChange
}) => {
  // Safe handler to call either onPhaseChange or setSelectedPhase
  const handlePhaseChange = (phase) => {
    try {
      if (typeof onPhaseChange === 'function') {
        onPhaseChange(phase);
      } else if (typeof setSelectedPhase === 'function') {
        setSelectedPhase(phase);
      }
    } catch (error) {
      console.error("Error changing phase:", error);
    }
  };

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-blue-100/50 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Phase</h2>
      <div className="flex flex-col gap-3 flex-grow">
        <motion.button
          onClick={() => handlePhaseChange("Phase1")}
          className={`flex items-center px-5 py-3 rounded-xl transition-all duration-300 ${
            selectedPhase === "Phase1"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          whileHover={{ scale: selectedPhase !== "Phase1" ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Phase 1: RGene vs Non-RGene</span>
            </div>
            {phase1Count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                selectedPhase === "Phase1" 
                  ? "bg-white bg-opacity-20 text-gray-800" 
                  : "bg-indigo-100 text-indigo-700"
              }`}>
                {phase1Count} sequences
              </span>
            )}
          </div>
        </motion.button>
        
        <motion.button
          onClick={() => handlePhaseChange("Phase2")}
          className={`flex items-center px-5 py-3 rounded-xl transition-all duration-300 ${
            selectedPhase === "Phase2"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          whileHover={{ scale: selectedPhase !== "Phase2" ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Phase 2: Detailed Classification</span>
            </div>
            {phase2Count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                selectedPhase === "Phase2" 
                  ? "bg-white bg-opacity-20 text-gray-800" 
                  : "bg-indigo-100 text-indigo-700"
              }`}>
                {phase2Count} sequences
              </span>
            )}
          </div>
        </motion.button>
        
        <div className="mt-auto p-4 bg-indigo-50/50 rounded-xl">
          <p className="text-sm text-gray-600">
            {selectedPhase === "Phase1" 
              ? "Phase 1 classifies sequences as R-genes or non-R-genes."
              : "Phase 2 provides detailed classification of R-gene families."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PhaseSelection;
