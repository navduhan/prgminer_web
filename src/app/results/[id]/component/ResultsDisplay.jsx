// src/components/results/ResultsDisplay.jsx
import React, { useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import ResultsTable from "./ResultsTable";
import ResultsVisualization from "./ResultsVisualization";
import ClassDetails from "./ClassDetails";

const ResultsDisplay = ({ 
  activeTab, 
  setActiveTab, 
  selectedPhase,
  results,
  currentPage,
  setCurrentPage,
  rowsPerPage,
  setRowsPerPage,
  selectedSequence,
  sequenceDetails,
  searchTerm,
  onSearch,
  onSequenceView,
  onCloseSequence,
  availableClasses,
  // Function props for backward compatibility
  getFilteredResults,
  getAvailableClasses,
  setSearchTerm = onSearch, // Fallback to onSearch if setSearchTerm not provided
  setSelectedSequence = onSequenceView, // Fallback to onSequenceView
  downloadFile,
  loadingSequence = false, // Add loadingSequence prop with default value
  getCurrentPhaseResults
}) => {
  // Create wrapper functions to ensure we always have functions to pass to ResultsTable
  const getFilteredResultsWrapper = useCallback(() => {
    try {
      if (Array.isArray(results)) {
        return results;
      } else if (typeof getCurrentPhaseResults === 'function') {
        const funcResults = getCurrentPhaseResults();
        return Array.isArray(funcResults) ? funcResults : [];
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error in getFilteredResultsWrapper:", error);
      return [];
    }
  }, [results, getCurrentPhaseResults]);
    
  const getAvailableClassesWrapper = useCallback(() => {
    try {
      if (typeof getAvailableClasses === 'function') {
        const classes = getAvailableClasses();
        return Array.isArray(classes) ? classes : [];
      }
      return Array.isArray(availableClasses) ? availableClasses : [];
    } catch (error) {
      console.error("Error in getAvailableClassesWrapper:", error);
      return [];
    }
  }, [getAvailableClasses, availableClasses]);

  // Safety wrapper for search term updates
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

  // Safety wrapper for sequence selection
  const handleSequenceView = useCallback((seqId) => {
    try {
      if (typeof setSelectedSequence === 'function') {
        setSelectedSequence(seqId);
      } else if (typeof onSequenceView === 'function') {
        onSequenceView(seqId);
      }
    } catch (error) {
      console.error("Error in handleSequenceView:", error);
    }
  }, [setSelectedSequence, onSequenceView]);

  // Check if we have actual results to display
  const currentResults = getFilteredResultsWrapper();
  const hasResults = Array.isArray(currentResults) && currentResults.length > 0;
  


  // If we don't have results for the current phase, show a message
  if (!hasResults) {
    return (
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-blue-100/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-medium text-yellow-800 mb-2">No Results Available</h3>
            <p className="text-yellow-600">
              {selectedPhase === 'Phase1' 
                ? "No Phase 1 results are available for this analysis." 
                : "No Phase 2 results are available for this analysis."}
            </p>
            {selectedPhase === 'Phase2' && (
              <p className="mt-4 text-sm text-yellow-700">
                Phase 2 results might not be available if you only selected Phase 1 analysis
                when submitting your prediction job.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Generate paginationStats for table rendering based on current results
  const paginationStats = useMemo(() => {
    const totalResults = Array.isArray(currentResults) ? currentResults.length : 0;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalResults);
    return {
      total: totalResults,
      start: startIndex + 1, // Adjust to 1-indexed for display
      end: endIndex,
      page: currentPage,
      lastPage: Math.ceil(totalResults / rowsPerPage) || 1,
    };
  }, [currentResults, currentPage, rowsPerPage]);

  // Render sequence detail panel if a sequence is selected
  const renderSequenceDetail = () => {
    if (!selectedSequence) return null;
    
    if (loadingSequence) {
      return (
        <motion.div 
          className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Loading sequence details...</p>
            </div>
          </div>
        </motion.div>
      );
    }

    if (!sequenceDetails) {
      return (
        <motion.div 
          className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Sequence Details</h3>
            <button 
              onClick={onCloseSequence}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-amber-600">No details available for this sequence.</p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Sequence Details: <span className="font-mono text-sm bg-indigo-100 p-1 rounded">{selectedSequence}</span>
          </h3>
          <button 
            onClick={onCloseSequence}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Display the sequence details here */}
        <ClassDetails 
          sequence={sequenceDetails} 
          sequenceId={selectedSequence} 
          selectedPhase={selectedPhase}
        />
      </motion.div>
    );
  };

  // Memoize tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    if (activeTab === "table") {
      return (
        <ResultsTable
          key="table-view"
          getFilteredResults={getFilteredResultsWrapper}
          getAvailableClasses={getAvailableClassesWrapper}
          searchTerm={searchTerm}
          setSearchTerm={handleSearch}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          selectedSequence={selectedSequence}
          sequenceDetails={sequenceDetails}
          setSelectedSequence={handleSequenceView}
          selectedPhase={selectedPhase}
          results={currentResults}
          paginationStats={paginationStats}
          onSearch={onSearch}
          onSequenceView={onSequenceView}
          onCloseSequence={onCloseSequence}
          downloadFile={downloadFile}
        />
      );
    } else if (activeTab === "visualization") {
      return (
        <ResultsVisualization 
          key="visualization-view"
          selectedPhase={selectedPhase}
          results={currentResults}
          availableClasses={getAvailableClassesWrapper()}
        />
      );
    } else {
      return (
        <ClassDetails 
          key="class-details-view"
          selectedPhase={selectedPhase} 
          classes={getAvailableClassesWrapper()}
          downloadFile={downloadFile}
        />
      );
    }
  }, [
    activeTab, 
    currentResults, 
    searchTerm, 
    currentPage, 
    rowsPerPage, 
    selectedSequence, 
    sequenceDetails, 
    selectedPhase,
    paginationStats,
    getFilteredResultsWrapper,
    getAvailableClassesWrapper,
    handleSearch,
    setCurrentPage,
    setRowsPerPage,
    handleSequenceView,
    onSearch,
    onSequenceView,
    onCloseSequence,
    downloadFile
  ]);

  // Memoize the sequence detail component to prevent flashing
  const sequenceDetailPanel = useMemo(() => {
    return renderSequenceDetail();
  }, [selectedSequence, sequenceDetails, loadingSequence, onCloseSequence, selectedPhase]);

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-blue-100/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    >
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <motion.button
            onClick={() => setActiveTab("table")}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
              ${activeTab === "table"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table View
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("visualization")}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
              ${activeTab === "visualization"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M8 13v-1m4 1v-3m4 3V8M12 21l9-9-9-9-9 9 9 9z" />
            </svg>
            Visualization
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("classDetails")}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
              ${activeTab === "classDetails"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Class Details
          </motion.button>
        </nav>
      </div>

      <div className="mt-6">
        {tabContent}
      </div>

      {sequenceDetailPanel}
    </motion.div>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(ResultsDisplay);
