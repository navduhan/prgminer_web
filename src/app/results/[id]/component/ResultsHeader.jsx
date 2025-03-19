// src/components/results/ResultsHeader.jsx
import { motion } from "framer-motion";

const ResultsHeader = () => {
  return (
    <motion.div 
      className="text-center space-y-4 relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
        Prediction Results
      </h1>
      <p className="text-gray-600 text-lg">
        Analysis completed successfully
      </p>
    </motion.div>
  );
};

export default ResultsHeader;
