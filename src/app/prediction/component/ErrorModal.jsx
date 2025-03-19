// Error Modal

// Author: Naveen Duhan

// import dependencies

import { motion, AnimatePresence } from 'framer-motion';

const ErrorModal = ({ show, onClose, error }) => {
  const isPredictionError = error?.includes('contact our support team');

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="bg-white rounded-2xl max-w-2xl w-full p-8 transform transition-all duration-300"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {error ? (isPredictionError ? 'Prediction Error' : 'Error') : 'Prediction Information'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-medium">{error}</p>
                      {isPredictionError && (
                        <div className="mt-4">
                          <a
                            href="mailto:support@prgminer.com"
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Support
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-2">Phase 1: Initial Screening</h4>
                    <p className="text-gray-600">
                      This phase determines whether a query sequence is a plant resistance gene or a non-resistance gene.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-2">Phase 2: Detailed Classification</h4>
                    <p className="text-gray-600">
                      Plant resistance genes are classified into eight classes: CNL, KIN, LYK, LECRK, RLK, RLP, TIR, and TNL.
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPredictionError ? 'Close' : 'Got it'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal;
