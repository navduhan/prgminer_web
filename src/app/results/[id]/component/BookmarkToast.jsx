// src/components/results/BookmarkToast.jsx
import { motion, AnimatePresence } from "framer-motion";

const BookmarkToast = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed top-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg z-50"
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Results URL copied! Available for 30 days.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookmarkToast;
