// src/components/results/ResultsTable.jsx
import React, { useMemo, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchInput from "./SearchInput";
import Pagination from "./Pagination";

const ResultsTable = ({
  getFilteredResults,
  getAvailableClasses,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  rowsPerPage,
  setRowsPerPage,
  selectedSequence,
  sequenceDetails,
  setSelectedSequence,
  selectedPhase,
  onPageChange,
  downloadFile,
  paginationStats,
  results, // Accept direct results prop
  onSearch, // Accept search handler
  onSequenceView, // Accept sequence view handler
  onCloseSequence // Accept close sequence handler
}) => {
  // Use local state to store the results and classes as a safety measure
  const [localFilteredResults, setLocalFilteredResults] = useState([]);
  const [localClasses, setLocalClasses] = useState([]);

  // Use direct results if provided or fallback to function call
  useEffect(() => {
    console.log("ResultsTable - Phase:", selectedPhase);
    console.log("ResultsTable - Direct results:", Array.isArray(results) ? results.length : "none");
    
    if (Array.isArray(results) && results.length > 0) {
      setLocalFilteredResults(results);
    } else {
      try {
        if (typeof getFilteredResults === 'function') {
          const functionResults = getFilteredResults();
          console.log("ResultsTable - Function results:", Array.isArray(functionResults) ? functionResults.length : "none");
          setLocalFilteredResults(Array.isArray(functionResults) ? functionResults : []);
        }
      } catch (error) {
        console.error("Error getting filtered results:", error);
        setLocalFilteredResults([]);
      }
    }
  }, [getFilteredResults, searchTerm, currentPage, selectedPhase, results]);

  // Safely get classes and store in local state
  useEffect(() => {
    try {
      if (typeof getAvailableClasses === 'function') {
        const classes = getAvailableClasses();
        console.log("ResultsTable - Available classes:", Array.isArray(classes) ? classes.join(', ') : "none");
        console.log("ResultsTable - Current phase:", selectedPhase);
        setLocalClasses(Array.isArray(classes) ? classes : []);
      }
    } catch (error) {
      console.error("Error getting available classes:", error);
      setLocalClasses([]);
    }
  }, [getAvailableClasses, selectedPhase]);
  
  // Debug effect for phase changes
  useEffect(() => {
    console.log(`ResultsTable - Phase changed to: ${selectedPhase}`);
  }, [selectedPhase]);

  // Use local state for calculations
  const filteredResults = localFilteredResults;
  const currentClasses = localClasses;

  // Calculate pagination based on filtered results or use provided stats
  const tablePaginationStats = useMemo(() => {
    if (paginationStats) {
      return paginationStats;
    }
    
    const total = filteredResults.length;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, total);
    
    return {
      total,
      start: startIndex + 1,
      end: endIndex,
      page: currentPage,
      lastPage: Math.ceil(total / rowsPerPage) || 1,
    };
  }, [paginationStats, currentPage, rowsPerPage, filteredResults.length]);

  // Calculate paginated results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredResults.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredResults, currentPage, rowsPerPage]);

  // Memoize the sequence view handler to prevent unnecessary re-renders
  const handleSequenceView = useCallback((seqId) => {
    try {
      if (seqId === selectedSequence) {
        // If clicking on already selected sequence, use close handler or set to null
        if (typeof onCloseSequence === 'function') {
          onCloseSequence();
        } else if (typeof setSelectedSequence === 'function') {
          setSelectedSequence(null);
        }
      } else {
        // Viewing a new sequence
        if (typeof setSelectedSequence === 'function') {
          setSelectedSequence(seqId);
        } else if (typeof onSequenceView === 'function') {
          onSequenceView(seqId);
        }
      }
    } catch (error) {
      console.error("Error in handleSequenceView:", error);
    }
  }, [setSelectedSequence, onSequenceView, onCloseSequence, selectedSequence]);

  // Memoize the search handler to prevent unnecessary re-renders
  const handleSearch = useCallback((term) => {
    try {
      if (typeof setSearchTerm === 'function') {
        setSearchTerm(term);
      } else if (typeof onSearch === 'function') {
        onSearch(term);
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
    }
  }, [setSearchTerm, onSearch]);

  // Memoize the page change handler to prevent unnecessary re-renders
  const handlePageChange = useCallback((direction) => {
    try {
      if (typeof setCurrentPage === 'function') {
        if (direction === 'prev' && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else if (direction === 'next' && currentPage < paginationStats.lastPage) {
          setCurrentPage(currentPage + 1);
        } else if (typeof direction === 'number') {
          setCurrentPage(direction);
        }
      } else if (typeof onPageChange === 'function') {
        onPageChange(direction);
      }
    } catch (error) {
      console.error("Error in handlePageChange:", error);
    }
  }, [setCurrentPage, onPageChange, currentPage, paginationStats?.lastPage]);

  // Format confidence value
  const formatConfidence = useCallback((value) => {
    if (typeof value !== 'number') return '0%';
    return `${(value).toFixed(2)}%`;
  }, []);

  // Function to determine class colors for phase2 - extract for cleaner code
  const getPhase2Colors = useCallback((result, className) => {
    try {
      if (!result || !result.classes || !Array.isArray(result.classes)) {
        return { bg: 'bg-gray-400', text: 'text-gray-600' };
      }
      
      const confidenceValues = result.classes
        .filter(c => c && typeof c === 'object')
        .map(c => ({
          className: c.className || '',
          value: typeof c.value === 'number' ? c.value : 0
        }));
      
      const sortedConfidences = [...confidenceValues].sort((a, b) => b.value - a.value);
      const currentClassRank = sortedConfidences.findIndex(
        c => c.className.toLowerCase() === className.toLowerCase()
      );
      
      if (currentClassRank === 0) return { bg: 'bg-emerald-500', text: 'text-emerald-700' }; // Top confidence
      if (currentClassRank === 1) return { bg: 'bg-blue-500', text: 'text-blue-700' };  // Second highest
      if (currentClassRank === 2) return { bg: 'bg-violet-500', text: 'text-violet-700' }; // Third highest
      return { bg: 'bg-gray-400', text: 'text-gray-600' }; // Other classes
    } catch (error) {
      console.error("Error determining phase2 colors:", error);
      return { bg: 'bg-gray-400', text: 'text-gray-600' };
    }
  }, []);

  // Calculate optimal column width based on number of classes
  const getColumnStyle = useCallback(() => {
    if (!Array.isArray(currentClasses)) return "w-32";
    if (currentClasses.length <= 2) return "w-40";
    if (currentClasses.length <= 4) return "w-32";
    if (currentClasses.length <= 6) return "w-28";
    return "w-24"; // For many classes
  }, [currentClasses]);
  
  const columnStyle = getColumnStyle();

  // Color legend component
  const ColorLegend = () => (
    <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-indigo-100">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Color Legend: {selectedPhase}</h3>
      <div className="flex flex-wrap gap-3">
        {selectedPhase === "Phase1" ? (
          <>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2"></div>
              <span className="text-xs text-gray-600">RGene</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-rose-500 mr-2"></div>
              <span className="text-xs text-gray-600">Non-RGene</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2"></div>
              <span className="text-xs text-gray-600">Highest confidence (1st)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-xs text-gray-600">2nd highest</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-violet-500 mr-2"></div>
              <span className="text-xs text-gray-600">3rd highest</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gray-400 mr-2"></div>
              <span className="text-xs text-gray-600">Other classes</span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Only show results if we have any
  if (!Array.isArray(filteredResults) || filteredResults.length === 0) {
    return (
      <motion.div
        className="text-center py-10 bg-white/80 rounded-xl shadow-sm border border-indigo-100 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm ? `No results match "${searchTerm}"` : "No prediction results available"}
        </p>
        {searchTerm && (
          <div className="mt-6">
            <button
              onClick={() => handleSearch("")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Clear search
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4">
        <SearchInput 
          searchTerm={searchTerm}
          setSearchTerm={handleSearch}
          setCurrentPage={setCurrentPage}
          value={searchTerm}
          onChange={handleSearch}
        />

        <div className="flex items-center gap-2">
          <label htmlFor="rowsPerPage" className="text-sm text-gray-600">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => {
              if (typeof setRowsPerPage === 'function') {
                setRowsPerPage(Number(e.target.value));
              }
              if (typeof setCurrentPage === 'function') {
                setCurrentPage(1);
              }
            }}
            className="border border-indigo-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[5, 10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {searchTerm && (
          <span>
            Found {filteredResults.length} results
            {searchTerm && ` for "${searchTerm}"`}
          </span>
        )}
      </div>

      {/* Color Legend */}
      <ColorLegend />

      {/* Only render table if we have classes and results */}
      {Array.isArray(currentClasses) && currentClasses.length > 0 && (
        <>
          {/* Table */}
          <motion.div 
            className="overflow-x-auto rounded-xl border border-indigo-100 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: "100%" }}
          >
            <table className="min-w-full divide-y divide-indigo-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Sequence ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Classification
                  </th>
                  {currentClasses.map((className) => (
                    <th 
                      key={className} 
                      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                      title={className}
                    >
                      <div className="truncate max-w-[100px]">{className}</div>
                    </th>
                  ))}
                  <th className="sticky right-0 z-10 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Sequence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-indigo-100">
                {paginatedResults.map((result, index) => (
                  <React.Fragment key={`${result.sequenceId || index}-${index}`}>
                    <motion.tr 
                      className="hover:bg-indigo-50/30 transition-colors duration-150"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="sticky left-0 z-10 bg-white hover:bg-indigo-50/30 px-3 py-3 text-sm font-medium text-gray-900 transition-colors duration-150">
                        <div className="truncate max-w-[140px]" title={result.sequenceId}>
                          {result.sequenceId || `Sequence ${index + 1}`}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${result.classification?.toLowerCase().includes('rgene') && !result.classification?.toLowerCase().includes('non')
                            ? 'bg-emerald-100 text-emerald-800' 
                            : result.classification?.toLowerCase().includes('non')
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                          {result.classification || 'Unknown'}
                        </span>
                      </td>
                      {currentClasses.map((className, classIndex) => {
                        // Safe check for classes
                        if (!result.classes || !Array.isArray(result.classes)) {
                          return (
                            <td key={`${className}-${classIndex}`} className="px-3 py-3 text-sm text-gray-700">
                              <div className="flex items-center gap-1">
                                <div className="w-10 bg-gray-200 rounded-full h-2 overflow-hidden flex-shrink-0">
                                  <div className="h-2 rounded-full bg-gray-400" style={{ width: '0%' }} />
                                </div>
                                <span className="font-medium text-gray-600 text-xs whitespace-nowrap">0%</span>
                              </div>
                            </td>
                          );
                        }

                        // Find confidence class safely
                        const confidenceClass = result.classes.find(c => 
                          c && c.className && className && 
                          c.className.toLowerCase() === className.toLowerCase());
                        
                        // Confidence values need proper handling
                        const confidenceValue = confidenceClass && typeof confidenceClass.value === 'number' 
                          ? confidenceClass.value 
                          : 0;
                        const displayValue = formatConfidence(confidenceValue);
                        
                        // Choose colors based on phase
                        let barColor, textColor;
                        if (selectedPhase === "Phase1") {
                          barColor = className.toLowerCase() === "rgene" ? 'bg-emerald-500' : 'bg-rose-500';
                          textColor = className.toLowerCase() === "rgene" ? 'text-emerald-700' : 'text-rose-700';
                        } else {
                          const colors = getPhase2Colors(result, className);
                          barColor = colors.bg;
                          textColor = colors.text;
                        }
                        
                        // Adjust the progress bar width based on number of classes
                        const barWidth = currentClasses.length <= 4 ? "w-10" : currentClasses.length <= 8 ? "w-8" : "w-6";
                        
                        return (
                          <td key={`${className}-${classIndex}`} className="px-3 py-3 text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                              <div className={`${barWidth} bg-gray-200 rounded-full h-2 overflow-hidden flex-shrink-0`}>
                                <motion.div 
                                  className={`h-2 rounded-full ${barColor}`}
                                  initial={{ width: 0 }}
                                  animate={{ 
                                    width: `${confidenceValue * 100}%`
                                  }}
                                  transition={{ 
                                    duration: 0.7, 
                                    delay: index * 0.05 + classIndex * 0.02,
                                    ease: "easeOut"
                                  }}
                                />
                              </div>
                              <span className={`font-medium ${textColor} text-xs whitespace-nowrap`}>
                                {displayValue}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="sticky right-0 z-10 bg-white hover:bg-indigo-50/30 px-3 py-3 whitespace-nowrap text-sm font-medium text-center transition-colors duration-150">
                        <motion.button
                          onClick={() => handleSequenceView(result.sequenceId)}
                          className={`inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm
                            ${selectedSequence === result.sequenceId 
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                              : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                            } transition-colors duration-200`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {selectedSequence === result.sequenceId ? 'Hide' : 'View'}
                        </motion.button>
                      </td>
                    </motion.tr>
                    
                    {/* Sequence view row */}
                    <AnimatePresence>
                      {selectedSequence === result.sequenceId && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td colSpan={3 + (currentClasses.length || 0)} className="px-3 py-3 bg-gray-50/70">
                            <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-lg p-3 overflow-x-auto shadow-inner">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-indigo-700">FASTA Sequence</span>
                                <motion.button
                                  onClick={() => {
                                    if (result.sequence && typeof downloadFile === 'function') {
                                      // Handle both nested sequence object and direct string
                                      let sequenceData;
                                      if (typeof result.sequence === 'object' && result.sequence.sequence) {
                                        sequenceData = typeof result.sequence.sequence === 'string' 
                                          ? result.sequence.sequence 
                                          : JSON.stringify(result.sequence.sequence);
                                      } else if (typeof result.sequence === 'string') {
                                        sequenceData = result.sequence;
                                      } else {
                                        sequenceData = "[No valid sequence data available]";
                                      }
                                      
                                      const sequenceHeader = typeof result.sequence === 'object' && result.sequence.header 
                                        ? result.sequence.header 
                                        : `>${result.sequenceId || 'sequence'}|${result.classification || 'Unknown'}`;
                                      
                                      // Format properly without adding extra > if header already has it
                                      const headerPrefix = sequenceHeader.startsWith('>') ? '' : '>';
                                      const fastaContent = `${headerPrefix}${sequenceHeader}\n${sequenceData}`;
                                      
                                      downloadFile(fastaContent, `${result.sequenceId || 'sequence'}.fasta`, 'text/plain');
                                    }
                                  }}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md shadow-sm text-purple-700 bg-purple-100 hover:bg-purple-200"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Download FASTA
                                </motion.button>
                              </div>
                              <pre className="text-xs font-mono whitespace-pre-wrap break-all text-gray-800 bg-white/50 p-2 rounded-md max-h-40 overflow-y-auto">
                                {(() => {
                                  // Debug the sequence structure
                                  console.log("Sequence data:", result.sequence);
                                  
                                  // Handle both nested sequence object and direct string
                                  if (result.sequence && typeof result.sequence === 'object') {
                                    const header = result.sequence.header || `>${result.sequenceId || 'sequence'}|${result.classification || 'Unknown'}`;
                                    const headerPrefix = header.startsWith('>') ? '' : '>';
                                    
                                    // Ensure sequence is a string and not a number or other type
                                    const sequenceStr = typeof result.sequence.sequence === 'string' 
                                      ? result.sequence.sequence 
                                      : JSON.stringify(result.sequence.sequence);
                                      
                                    return `${headerPrefix}${header}\n${sequenceStr}`;
                                  } else if (typeof result.sequence === 'string') {
                                    return `>${result.sequenceId || 'sequence'}|${result.classification || 'Unknown'}\n${result.sequence}`;
                                  } else {
                                    // Handle invalid sequence data
                                    return `>${result.sequenceId || 'sequence'}|${result.classification || 'Unknown'}\n[No valid sequence data available]`;
                                  }
                                })()}
                              </pre>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          <Pagination 
            currentPage={tablePaginationStats.page}
            totalPages={tablePaginationStats.lastPage}
            setCurrentPage={handlePageChange}
            onPageChange={handlePageChange}
            totalItems={tablePaginationStats.total}
            startItem={tablePaginationStats.start}
            endItem={tablePaginationStats.end}
          />
        </>
      )}
    </div>
  );
};

// Export with React.memo for performance optimization
export default React.memo(ResultsTable);