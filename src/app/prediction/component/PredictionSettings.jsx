// Prediction Settings

// Author: Naveen Duhan

// import dependencies

import { motion } from 'framer-motion';

const PredictionSettings = ({ formData, handlePhaseChange, setShowErrorModal }) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-white to-blue-50/70 hover:from-blue-50/70 hover:to-purple-50/50 rounded-2xl p-8 transition-all duration-300 shadow-md hover:shadow-lg"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Prediction Level</h3>
        <motion.button
          type="button"
          className="text-gray-400 hover:text-green-600 transition-colors"
          onClick={() => setShowErrorModal(true)}
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.button>
      </div>
      
      {/* Instructions */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <span className="text-sm font-medium text-blue-700">Select your prediction level:</span>
        <ul className="mt-2 ml-4 list-disc text-sm text-blue-700 space-y-1">
          <li>Phase 1 (RGene vs Non-RGene) is the basic prediction level</li>
          <li>Phase 2 (Detailed Classification) includes both levels</li>
        </ul>
      </div>

      <div className="space-y-4">
        <motion.label 
          className={`flex items-center p-4 rounded-xl transition-colors cursor-pointer group
            ${formData.phase1Checked ? 'bg-gradient-to-r from-blue-50 to-purple-100/50 shadow-sm' : 'hover:bg-white'}`}
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <input
            type="checkbox"
            className="form-checkbox text-blue-600 h-5 w-5 rounded"
            checked={formData.phase1Checked}
            onChange={() => handlePhaseChange("Phase1")}
          />
          <div className="ml-4">
            <span className="font-medium group-hover:text-blue-600 transition-colors">Phase 1: RGene vs Non-RGene</span>
            <p className="text-sm text-gray-500 mt-1">Determine if sequence is a resistance gene</p>
            {formData.phase2Checked && (
              <p className="text-xs text-blue-600 mt-1">Included in detailed classification</p>
            )}
          </div>
        </motion.label>

        <motion.label 
          className={`flex items-center p-4 rounded-xl transition-colors cursor-pointer group
            ${formData.phase2Checked ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-sm' : 'hover:bg-white'}`}
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <input
            type="checkbox"
            className="form-checkbox text-blue-600 h-5 w-5 rounded"
            checked={formData.phase2Checked}
            onChange={() => handlePhaseChange("Phase2")}
          />
          <div className="ml-4">
            <span className="font-medium group-hover:text-blue-600 transition-colors">Phase 2: Detailed Classification</span>
            <p className="text-sm text-gray-500 mt-1">Classify into specific resistance gene classes</p>
            {formData.phase2Checked && (
              <p className="text-xs text-blue-600 mt-1">Includes RGene screening</p>
            )}
          </div>
        </motion.label>
      </div>
    </motion.div>
  );
};

export default PredictionSettings;
