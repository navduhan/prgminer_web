// Accession Input

// Author: Naveen Duhan

// import dependencies

import { motion } from 'framer-motion';

const AccessionInput = ({ formData, setFormData, hasMultipleInputs }) => {
  return (
    <motion.div 
      className={`bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-purple-50/30 rounded-2xl p-6 transition-all duration-300 border-2 
        ${hasMultipleInputs ? 'border-red-300 bg-red-50' : 'border-transparent'} 
        focus-within:border-blue-500 shadow-md hover:shadow-lg`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        Accession ID
        {hasMultipleInputs && (
          <span className="ml-2 text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full">
            Multiple inputs selected
          </span>
        )}
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-gray-700 font-medium min-w-[80px]">Database:</label>
          <div className="flex gap-6">
            <label className="inline-flex items-center group cursor-pointer">
              <input
                type="radio"
                className="form-radio text-green-600 h-5 w-5"
                checked={formData.accType === "ncbi"}
                onChange={() => setFormData(prev => ({ ...prev, accType: "ncbi" }))}
              />
              <span className="ml-2 group-hover:text-purple-600 transition-colors">NCBI</span>
            </label>
            <label className="inline-flex items-center group cursor-pointer">
              <input
                type="radio"
                className="form-radio text-purple-600 h-5 w-5"
                checked={formData.accType === "uniprot"}
                onChange={() => setFormData(prev => ({ ...prev, accType: "uniprot" }))}
              />
              <span className="ml-2 group-hover:text-purple-600 transition-colors">Uniprot</span>
            </label>
          </div>
        </div>
        <motion.input
          type="text"
          className="w-full form-input rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500 shadow-sm
                   py-3 px-4 text-base"
          placeholder="Enter accession ID (e.g., MBA0760395)"
          value={formData.accessionId}
          onChange={(e) => setFormData(prev => ({ ...prev, accessionId: e.target.value }))}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>
    </motion.div>
  );
};

export default AccessionInput;
