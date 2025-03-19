// Fasta File Input

// Author: Naveen Duhan

// import dependencies

import { motion } from 'framer-motion';

const FastaFileInput = ({ formData, setFormData, hasMultipleInputs }) => {
  return (
    <motion.div 
      className={`bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-green-50/30 rounded-2xl p-6 transition-all duration-300 border-2 
        ${hasMultipleInputs ? 'border-red-300 bg-red-50' : 'border-transparent'} 
        focus-within:border-purple-500 shadow-md hover:shadow-lg`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        FASTA File
        {hasMultipleInputs && (
          <span className="ml-2 text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full">
            Multiple inputs selected
          </span>
        )}
      </h3>
      <input
        type="file"
        className="w-full form-input rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm
                 py-3 px-4 text-base
                 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0
                 file:text-base file:font-medium file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100 file:transition-colors"
        onChange={(e) => setFormData(prev => ({ ...prev, fastaFile: e.target.files?.[0] || null }))}
        accept=".fasta,.fa,.txt"
      />
    </motion.div>
  );
};

export default FastaFileInput;
