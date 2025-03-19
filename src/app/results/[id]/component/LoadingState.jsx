// src/components/results/LoadingState.jsx
import { motion } from "framer-motion";

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-purple-50/30 flex items-center justify-center">
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="mx-auto"
          animate={{ 
            rotate: 360,
            borderColor: ['#6366f1', '#a855f7', '#6366f1']
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear",
            borderColor: { duration: 3, repeat: Infinity }
          }}
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            border: "4px solid",
            borderTopColor: "transparent"
          }}
        />
        <p className="text-xl text-gray-700 font-medium">Loading results...</p>
      </motion.div>
    </div>
  );
};

export default LoadingState;
