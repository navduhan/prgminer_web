// src/components/results/ErrorState.jsx
import { motion } from "framer-motion";

const ErrorState = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-purple-50/30 flex items-center justify-center">
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-lg w-full mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-4">
          <motion.svg 
            className="w-16 h-16 text-red-500 mx-auto" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </motion.svg>
          <h2 className="text-2xl font-semibold text-gray-800">Error Loading Results</h2>
          <p className="text-gray-600">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl 
                     hover:from-indigo-700 hover:to-purple-700 transition-all duration-300
                     shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorState;
