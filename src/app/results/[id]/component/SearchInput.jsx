// src/components/results/SearchInput.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SearchInput = ({ 
  searchTerm = "", 
  setSearchTerm = null, 
  setCurrentPage = null,
  value = searchTerm,
  onChange = setSearchTerm
}) => {
  // Local state for controlled component
  const [localValue, setLocalValue] = useState(value || searchTerm || "");
  
  // Update local state when props change
  useEffect(() => {
    setLocalValue(value || searchTerm || "");
  }, [value, searchTerm]);
  
  // Safely handle search updates
  const handleChange = (newValue) => {
    setLocalValue(newValue);
    
    try {
      // Try new props first
      if (typeof onChange === 'function') {
        onChange(newValue);
      } 
      // Try legacy props
      else if (typeof setSearchTerm === 'function') {
        setSearchTerm(newValue);
      }
      
      // Reset to first page when searching
      if (typeof setCurrentPage === 'function') {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error handling search:", error);
    }
  };
  
  // Handle search clear
  const handleClear = () => {
    handleChange("");
  };

  return (
    <motion.div 
      className="w-full sm:w-96"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search by Sequence ID or Classification..."
          className="w-full px-4 py-2 pl-10 pr-8 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default SearchInput;
