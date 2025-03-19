// src/components/results/DownloadOptions.jsx
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

const DownloadOptions = ({ 
  selectedPhase, 
  getAvailableClasses, 
  handleCSVDownload, 
  handleJSONDownload, 
  handleClassDownload,
  // For backward compatibility
  onCSVDownload = handleCSVDownload,
  onJSONDownload = handleJSONDownload,
  onClassDownload = handleClassDownload,
  availableClasses: propAvailableClasses,
  loadingDownload = false // Add loadingDownload prop with default value
}) => {
  const [classesData, setClassesData] = useState([]);
  
  // Safely get available classes
  useEffect(() => {
    try {
      if (Array.isArray(propAvailableClasses)) {
        // Use prop directly if provided
        setClassesData(propAvailableClasses);
      } else if (typeof getAvailableClasses === 'function') {
        // Call function to get classes if provided
        const classes = getAvailableClasses();
        setClassesData(Array.isArray(classes) ? classes : []);
      } else {
        setClassesData([]);
      }
    } catch (error) {
      console.error("Error getting available classes:", error);
      setClassesData([]);
    }
  }, [getAvailableClasses, propAvailableClasses, selectedPhase]);
  
  // Filter classes based on the selected phase
  const phaseFilteredClasses = useMemo(() => {
    // Filter classes to show only the ones relevant to the selected phase
    if (selectedPhase === 'Phase1') {
      // For Phase1, we typically only have 'RGene' and 'Non-RGene' classes
      return classesData.filter(className => 
        className === 'RGene' || 
        className === 'Non-RGene' || 
        className === 'Rgene' || 
        className === 'Non-Rgene'
      );
    } else {
      // For Phase2, we filter out the Phase1 classes
      return classesData.filter(className => 
        className !== 'RGene' && 
        className !== 'Non-RGene' && 
        className !== 'Rgene' && 
        className !== 'Non-Rgene'
      );
    }
  }, [classesData, selectedPhase]);
  
  // Function to determine button colors based on class name and phase
  const getButtonStyle = (className) => {
    if (selectedPhase === "Phase1") {
      if (className.toLowerCase() === "rgene") {
        return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200";
      } else if (className.toLowerCase() === "non-rgene") {
        return "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200";
      }
    } else {
      // Phase 2 colors based on class position (just for visual variety)
      const index = phaseFilteredClasses.findIndex(c => c === className);
      const position = index % 4; // Cycle through 4 styles
      
      if (position === 0) return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200";
      if (position === 1) return "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200";
      if (position === 2) return "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200";
      return "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200";
    }
    
    // Default style
    return "bg-white text-gray-700 hover:text-indigo-600 hover:bg-indigo-50";
  };

  // Safe handlers for all download actions
  const safeHandleCSVDownload = () => {
    if (loadingDownload) return; // Skip if already loading
    try {
      if (typeof onCSVDownload === 'function') {
        onCSVDownload();
      } else if (typeof handleCSVDownload === 'function') {
        handleCSVDownload();
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  const safeHandleJSONDownload = () => {
    if (loadingDownload) return; // Skip if already loading
    try {
      if (typeof onJSONDownload === 'function') {
        onJSONDownload();
      } else if (typeof handleJSONDownload === 'function') {
        handleJSONDownload();
      }
    } catch (error) {
      console.error("Error downloading JSON:", error);
    }
  };

  const safeHandleClassDownload = (className, event) => {
    if (loadingDownload) return; // Skip if already loading
    try {
      // Prevent default behavior if this is triggered by a link
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      if (typeof onClassDownload === 'function') {
        onClassDownload(className);
      } else if (typeof handleClassDownload === 'function') {
        handleClassDownload(className);
      }
    } catch (error) {
      console.error(`Error downloading class ${className}:`, error);
    }
  };
  
  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-blue-100/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Download {selectedPhase} Results
        {loadingDownload && (
          <span className="ml-2 inline-flex items-center">
            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
      </h2>
      
      <div className="space-y-5">
        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">Export All Results</h3>
          <p className="text-sm text-gray-600 mb-3">
            Download complete prediction results with sequence IDs, classifications, and confidence scores.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={safeHandleCSVDownload}
              disabled={loadingDownload}
              className={`inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm
                       hover:shadow-md transition-all duration-300 text-gray-700 hover:text-indigo-600 border border-gray-100
                       ${loadingDownload ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={{ scale: loadingDownload ? 1 : 1.03 }}
              whileTap={{ scale: loadingDownload ? 1 : 0.97 }}
              title="Download as CSV spreadsheet format"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV (Spreadsheet)
            </motion.button>
            <motion.button
              onClick={safeHandleJSONDownload}
              disabled={loadingDownload}
              className={`inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm
                       hover:shadow-md transition-all duration-300 text-gray-700 hover:text-indigo-600 border border-gray-100
                       ${loadingDownload ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={{ scale: loadingDownload ? 1 : 1.03 }}
              whileTap={{ scale: loadingDownload ? 1 : 0.97 }}
              title="Download as JSON format for data processing"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              JSON (Data)
            </motion.button>
          </div>
        </div>
        
        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">Download Sequences by Class</h3>
          <p className="text-sm text-gray-600 mb-3">
            Download FASTA files containing only sequences from a specific prediction class.
            {selectedPhase === "Phase1" 
              ? " Separate R-gene and non-R-gene sequences."
              : " Get sequences grouped by predicted family."
            }
          </p>
          
          <div className="flex flex-wrap gap-3">
            {selectedPhase === "Phase1" && (
              <motion.button
                onClick={(event) => safeHandleClassDownload('all-sequences', event)}
                disabled={loadingDownload}
                className={`inline-flex items-center px-4 py-2 rounded-lg shadow-sm
                        hover:shadow-md transition-all duration-300 bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-700 hover:from-emerald-100 hover:to-blue-100 border border-emerald-200
                        ${loadingDownload ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: loadingDownload ? 1 : 1.03 }}
                whileTap={{ scale: loadingDownload ? 1 : 0.97 }}
                title="Download all sequences as FASTA file"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                All Sequences <span className="ml-1 text-xs">(.fasta)</span>
              </motion.button>
            )}
            {selectedPhase === "Phase2" && (
              <motion.button
                onClick={(event) => safeHandleClassDownload('r-genes', event)}
                disabled={loadingDownload}
                className={`inline-flex items-center px-4 py-2 rounded-lg shadow-sm
                        hover:shadow-md transition-all duration-300 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100 border border-blue-200
                        ${loadingDownload ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: loadingDownload ? 1 : 1.03 }}
                whileTap={{ scale: loadingDownload ? 1 : 0.97 }}
                title="Download R-gene sequences as FASTA file"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                R-genes <span className="ml-1 text-xs">(.fasta)</span>
              </motion.button>
            )}
            {phaseFilteredClasses.map((className) => (
              <motion.button
                key={className}
                onClick={(event) => safeHandleClassDownload(className, event)}
                disabled={loadingDownload}
                className={`inline-flex items-center px-4 py-2 rounded-lg shadow-sm
                         hover:shadow-md transition-all duration-300 ${getButtonStyle(className)}
                         ${loadingDownload ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: loadingDownload ? 1 : 1.03 }}
                whileTap={{ scale: loadingDownload ? 1 : 0.97 }}
                title={`Download ${className} sequences as FASTA file`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {className} <span className="ml-1 text-xs">(.fasta)</span>
              </motion.button>
            ))}
            {phaseFilteredClasses.length === 0 && selectedPhase === "Phase2" && (
              <div className="p-3 bg-amber-50 rounded-lg text-amber-700 text-sm">
                No specific class buttons available, but you can still download R-gene sequences using the "R-genes" button above.
              </div>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 italic">
          Note: Downloaded files contain only the currently loaded prediction results. 
          {selectedPhase === "Phase1" 
            ? " Phase 1 results contain R-gene and non-R-gene classifications."
            : " Phase 2 results contain detailed R-gene family classifications."
          }
        </div>
      </div>
    </motion.div>
  );
};

export default DownloadOptions;
