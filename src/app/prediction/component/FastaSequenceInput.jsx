// Fasta Sequence Input

// Author: Naveen Duhan

// import dependencies

import { motion } from 'framer-motion';

const FastaSequenceInput = ({ formData, setFormData, hasMultipleInputs, loadDemoData }) => {
  return (
    <motion.div 
      className={`bg-gradient-to-br from-white to-blue-50/70 hover:from-blue-50/70 hover:to-purple-50/50 rounded-2xl p-6 transition-all duration-300 border-2 
        ${hasMultipleInputs ? 'border-red-300 bg-red-50' : 'border-transparent'} 
        focus-within:border-blue-500/50 shadow-md hover:shadow-lg`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        FASTA Sequence
        {hasMultipleInputs && (
          <span className="ml-2 text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full">
            Multiple inputs selected
          </span>
        )}
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">Paste Sequence:</label>
          <motion.button
            type="button"
            onClick={loadDemoData}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300
                     shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Load Example
          </motion.button>
        </div>
        <motion.textarea
          className="w-full h-40 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-purple-500 shadow-sm
                   resize-none transition-all duration-300 focus:shadow-lg"
          placeholder="Maximum 10000 sequences. Please remove version number from the FASTA headers"
          value={formData.fastaSequence}
          onChange={(e) => setFormData(prev => ({ ...prev, fastaSequence: e.target.value }))}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>
    </motion.div>
  );
};

export default FastaSequenceInput;
