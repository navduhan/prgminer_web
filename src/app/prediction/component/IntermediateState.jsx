// Intermediate State

// Author: Naveen Duhan

// import dependencies

import { motion } from 'framer-motion';

const IntermediateState = ({ show, submissionUrl, navigation }) => {
  if (!show) return null;
  
  return (
    <motion.div 
      className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-10 transform transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center space-y-6">
        <motion.div 
          className="animate-pulse"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <h4 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Job Submitted Successfully
          </h4>
        </motion.div>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-600 border-r-blue-400 border-b-purple-600 border-l-purple-400"></div>
          <h4 className="text-xl text-gray-700">
            Processing your query...
          </h4>
        </div>
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-6 shadow-md">
          <h4 className="text-xl text-gray-800 mb-4">
            Your results will be available at:
          </h4>
          {submissionUrl && (
            <motion.a
              href={submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 break-all block p-4 bg-white rounded-xl
                       hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {submissionUrl}
            </motion.a>
          )}
          <p className="mt-4 text-gray-600">
            <strong className="text-gray-800">Important:</strong> Bookmark this link to access your results later.
            Results will be available for one month.
          </p>
        </div>
        <div className="mt-8">
          <motion.button
            onClick={() => navigation.push("/prediction")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300
                     shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Another Job
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default IntermediateState;
