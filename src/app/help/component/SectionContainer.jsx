// src/components/help/SectionContainer.jsx
import { motion } from "framer-motion";

const SectionContainer = ({ title, children }) => {
  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-indigo-100/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{title}</h2>
      {children}
    </motion.div>
  );
};

export default SectionContainer;
