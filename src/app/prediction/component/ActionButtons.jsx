// Action Buttons

// Author: Naveen Duhan

// import dependencies

import { motion } from 'framer-motion';

const ActionButtons = ({ loading, handleSubmit, resetForm }) => {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row justify-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <motion.button
        type="button"
        onClick={resetForm}
        className="px-6 py-3 bg-rose-400 text-gray-100 rounded-xl hover:bg-rose-600 transition-all duration-300
                 shadow-sm hover:shadow flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset All
      </motion.button>
      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl 
                 hover:from-blue-700 hover:to-purple-700 transition-all duration-300
                 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed 
                 disabled:hover:shadow-md flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            Run Prediction
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default ActionButtons;
