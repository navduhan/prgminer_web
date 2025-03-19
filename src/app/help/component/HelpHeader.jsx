// src/components/help/HelpHeader.jsx
import { motion } from "framer-motion";

const HelpHeader = () => {
  return (
    <motion.div 
      className="text-center space-y-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold text-gray-800">Help Center</h1>
      <p className="text-xl text-gray-600">
        Find answers to common questions and learn how to use PRGmminer effectively
      </p>
    </motion.div>
  );
};

export default HelpHeader;
