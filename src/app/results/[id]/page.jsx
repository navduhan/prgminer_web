// src/app/results/[id]/page.jsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";


// Import components
import LoadingState from "./component/LoadingState";
import ErrorState from "./component/ErrorState";
import ResultsHeader from "./component/ResultsHeader";
import PhaseSelection from "./component/PhaseSelection";
import SaveResultsCard from "./component/SaveResultsCard";
import ResultsDisplay from "./component/ResultsDisplay";
import DownloadOptions from "./component/DownloadOptions";
import BookmarkToast from "./component/BookmarkToast";
import ClassDetailsDisplay from "./component/ClassDetailsDisplay";


// Get basePath from Next.js config
const basePath = process.env.NODE_ENV === "production" ? "/prgminer" : "";

const parseJobInfo = (resultIdParam) => {
    if (!resultIdParam) return { id: null, phase: null };
  
    // Try to parse with new format first (id_phase)
    const parts = resultIdParam.split('_');
  
    if (parts.length >= 1) {
      try {
        const id = parts[0];
        let phase = parts.length > 1 ? parts[1] : null;
  
        // Normalize phase name to ensure proper capitalization
        phase = phase?.toLowerCase() === 'phase2' ? 'Phase2' : 'Phase1';
  
        return { id, phase };
      } catch (e) {
        console.error("Error parsing job info:", e);
      }
    }
  
    return { id: resultIdParam, phase: 'Phase2' }; // Default phase
  };

// Client component that uses dynamic route parameter
const ResultsPageClient = () => {
  const params = useParams();
  const resultIdParam = params?.id;
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false); // Separate loading state for downloads
  const [loadingSequence, setLoadingSequence] = useState(false); // Separate loading state for sequence view
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("table");
  const [selectedPhase, setSelectedPhase] = useState("Phase1");
  const [hasPhase2, setHasPhase2] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [sequenceDetails, setSequenceDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobInfo, setJobInfo] = useState({ id: null, submissionTime: null, phase: null });
  const [savedCompletionTime, setSavedCompletionTime] = useState(null);
  
  const resultId = jobInfo.id || resultIdParam;

  // Parse job info from URL parameter
  useEffect(() => {
    if (resultIdParam) {
      const parsedJobInfo = parseJobInfo(resultIdParam);
      setJobInfo(parsedJobInfo);
      
      // Check if we have a saved completion time in localStorage
      if (typeof window !== 'undefined' && parsedJobInfo.id) {
        const storedTime = localStorage.getItem(`completion_${parsedJobInfo.id}`);
        if (storedTime) {
          setSavedCompletionTime(new Date(storedTime));
        }
      }
      
      // Initial phase setting from URL if available
      if (parsedJobInfo.phase) {
        setSelectedPhase(parsedJobInfo.phase);
      }
    }
  }, [resultIdParam]);

  // Safe handlers to avoid "t is not a function" errors
  const handlePhaseChange = React.useCallback((phase) => {
    if (phase && typeof phase === 'string') {
      setSelectedPhase(phase);
      setCurrentPage(1);
    }
  }, []);

  const handleSearch = React.useCallback((term) => {
    setSearchTerm(term || '');
    setCurrentPage(1);
  }, []);

  const handleSequenceView = React.useCallback(async (seqId) => {
    if (seqId === selectedSequence) {
      setSelectedSequence(null);
      return;
    }
    
    try {
      setLoadingSequence(true);
      const response = await fetch(`${basePath}/api/results/${resultId}?seqId=${seqId}`);
      if (!response.ok) {
        throw new Error(`Error fetching sequence data: ${response.status}`);
      }
      
      const sequenceData = await response.json();
      if (!sequenceData) {
        throw new Error("No data found for sequence: " + seqId);
      }
      
      setSequenceDetails(sequenceData.sequence);
      setSelectedSequence(seqId);
    } catch (err) {
      console.error("Error fetching sequence details:", err);
    } finally {
      setLoadingSequence(false);
    }
  }, [selectedSequence, resultId]);

  const handleCloseSequence = React.useCallback(() => {
    setSelectedSequence(null);
  }, []);

  const handleBookmark = React.useCallback(() => {
    setShowBookmarkToast(true);
    setTimeout(() => setShowBookmarkToast(false), 3000);
  }, []);

  // Get current phase results - with null checks to prevent errors
  const getCurrentPhaseResults = React.useCallback(() => {
    if (!results) return [];
    
    if (selectedPhase === 'Phase1') {
      return Array.isArray(results.phase1) ? results.phase1 : [];
    } else {
      // For Phase2
      return Array.isArray(results.phase2) ? results.phase2 : [];
    }
  }, [results, selectedPhase]);

  // Get filtered results based on search term - with null checks
  const getFilteredResults = React.useCallback(() => {
    const currentResults = getCurrentPhaseResults();
    if (!searchTerm) return currentResults;
    
    try {
      return currentResults.filter(result => 
        (result.sequenceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (result.classification || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (err) {
      console.error("Error filtering results:", err);
      return currentResults;
    }
  }, [getCurrentPhaseResults, searchTerm]);

  // Get available classes for the current phase
  const getAvailableClasses = React.useCallback(() => {
    if (!results) return [];
    
    return selectedPhase === 'Phase1'
      ? (Array.isArray(results.phase1Classes) ? results.phase1Classes : [])
      : (Array.isArray(results.phase2Classes) ? results.phase2Classes : []);
  }, [results, selectedPhase]);

  // File download utility
  const downloadFile = React.useCallback((content, filename, contentType) => {
    try {
      const a = document.createElement('a');
      const file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = filename;
      // Append to the document to ensure browser handles the click properly
      document.body.appendChild(a);
      a.click();
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 100);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  }, []);

  // Class download handler - with error handling
  const handleClassDownload = React.useCallback(async (className) => {
    try {
      setLoadingDownload(true);
      
      // Special case for Phase 1 "all-sequences" - use our own data
      if (className === 'all-sequences' && results && Array.isArray(results.phase1)) {
        const fasta = results.phase1
          .filter(result => result && result.sequence)
          .map(result => `>${result.sequenceId || 'unknown'}\n${result.sequence || ''}`)
          .join('\n');
        
        if (!fasta) {
          const emptyFasta = `; No sequences found in Phase 1 results\n; Downloaded on ${new Date().toLocaleString()}\n`;
          downloadFile(emptyFasta, 'All_Sequences.fasta', 'text/plain');
          return;
        }
        
        downloadFile(fasta, 'All_Sequences.fasta', 'text/plain');
        return;
      }
      
      // Special case for Phase 2 "r-genes" - filter and use our own data
      if (className === 'r-genes' && results && Array.isArray(results.phase2)) {
        const rgeneSequences = results.phase2.filter(result => 
          result && 
          result.sequence && 
          result.classification && 
          result.classification !== 'Non-RGene' && 
          result.classification !== 'Unknown'
        );
        
        if (!rgeneSequences || rgeneSequences.length === 0) {
          const emptyFasta = `; No R-gene sequences found in Phase 2 results\n; Downloaded on ${new Date().toLocaleString()}\n`;
          downloadFile(emptyFasta, 'R-gene_Sequences.fasta', 'text/plain');
          return;
        }
        
        const fasta = rgeneSequences
          .map(result => `>${result.sequenceId || 'unknown'}|Rgene-class:${result.classification}\n${result.sequence || ''}`)
          .join('\n');
        
        downloadFile(fasta, 'R-gene_Sequences.fasta', 'text/plain');
        return;
      }
      
      // Use the API utility to get sequences for this class
      const response = await fetch(`${basePath}/api/results/${resultId}?class=${className}`);
      if (!response.ok) {
        throw new Error(`Error fetching class data: ${response.status}`);
      }
      
      const classData = await response.json();
      
      if (!classData || (!classData.sequences && !Array.isArray(classData.sequences))) {
        const emptyFasta = `; No sequences found for class: ${className}\n; Downloaded on ${new Date().toLocaleString()}\n`;
        downloadFile(emptyFasta, `${className}_sequences.fasta`, 'text/plain');
        return;
      }
      
      // If API returns a FASTA string directly, use it
      if (typeof classData.sequences === 'string') {
        downloadFile(classData.sequences, `${className}_sequences.fasta`, 'text/plain');
      } 
      // If API returns an array of objects, convert to FASTA
      else if (Array.isArray(classData.sequences)) {
        const fasta = classData.sequences
          .map(result => `>${result.sequenceId || 'unknown'}\n${result.sequence || ''}`)
          .join('\n');
        downloadFile(fasta, `${className}_sequences.fasta`, 'text/plain');
      }
    } catch (error) {
      console.error(`Error downloading class sequences for ${className}:`, error);
      const errorFasta = `; Error downloading sequences for class: ${className}\n; Error: ${error.message || 'Unknown error'}\n; Downloaded on ${new Date().toLocaleString()}\n`;
      downloadFile(errorFasta, `${className}_error.fasta`, 'text/plain');
    } finally {
      setLoadingDownload(false);
    }
  }, [resultId, downloadFile, results]);

  // JSON download handler - with error handling
  const handleJSONDownload = React.useCallback(() => {
    try {
      const currentResults = getCurrentPhaseResults();
      const json = JSON.stringify(currentResults, null, 2);
      downloadFile(json, `${selectedPhase}_results.json`, 'application/json');
    } catch (err) {
      console.error("Error downloading JSON:", err);
    }
  }, [getCurrentPhaseResults, downloadFile, selectedPhase]);

  // CSV download handler - with error handling
  const handleCSVDownload = React.useCallback(() => {
    try {
      const currentResults = getCurrentPhaseResults();
      if (!currentResults || currentResults.length === 0) return;
      
      const csv = convertToCSV(currentResults);
      downloadFile(csv, `${selectedPhase}_results.csv`, 'text/csv');
    } catch (err) {
      console.error("Error downloading CSV:", err);
    }
  }, [getCurrentPhaseResults, downloadFile, selectedPhase]);

  const convertToCSV = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return '';
    
    try {
      // Get all possible confidence classes
      const confidenceClasses = new Set();
      data.forEach(item => {
        if (Array.isArray(item.classes)) {
          item.classes.forEach(c => {
            if (c && c.className) {
              confidenceClasses.add(c.className);
            }
          });
        }
      });
      
      const classHeaders = Array.from(confidenceClasses);
      
      // Create headers
      const headers = ['Sequence ID', 'Classification', ...classHeaders, 'Sequence'];
      
      // Create rows
      const rows = data.map(item => {
        const confidenceValues = {};
        if (Array.isArray(item.classes)) {
          item.classes.forEach(c => {
            if (c && c.className && typeof c.value === 'number') {
              confidenceValues[c.className] = c.value.toFixed(4);
            }
          });
        }
        
        return [
          item.sequenceId || '',
          item.classification || '',
          ...classHeaders.map(className => confidenceValues[className] || '0.0000'),
          item.sequence || ''
        ];
      });
      
      // Convert to CSV
      return [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
    } catch (err) {
      console.error("Error converting to CSV:", err);
      return '';
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!resultId) {
        setError("No result ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${basePath}/api/results/${resultId}`);
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || (data.error && !data.phase1 && !data.phase2)) {
          throw new Error(data?.error || "Invalid data received from API");
        }
        
        let completionTime;
        
        if (savedCompletionTime) {
          completionTime = savedCompletionTime.toISOString();
        } else if (data.completedAt || data.updatedAt) {
          completionTime = data.completedAt || data.updatedAt;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(`completion_${resultId}`, completionTime);
            setSavedCompletionTime(new Date(completionTime));
          }
        } else {
          completionTime = new Date().toISOString();
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(`completion_${resultId}`, completionTime);
            setSavedCompletionTime(new Date(completionTime));
          }
        }
        
        const transformedData = {
          ...data,
          phase1: Array.isArray(data.phase1) ? data.phase1.map(result => ({
            ...result,
            classes: [
              {
                className: 'RGene',
                value: result.confidence && typeof result.confidence['Rgene'] === 'number' ? 
                  result.confidence['Rgene'] : 0
              },
              {
                className: 'Non-RGene',
                value: result.confidence && typeof result.confidence['Non-Rgene'] === 'number' ? 
                  result.confidence['Non-Rgene'] : 0
              }
            ],
            sequence: result.sequence || '',
            classification: result.classification || 'Unknown'
          })) : [],
          phase2: Array.isArray(data.phase2) ? data.phase2.map(result => ({
            ...result,
            classes: result.confidence ? 
              Object.entries(result.confidence || {}).map(([className, value]) => ({
                className,
                value: typeof value === 'number' ? value : 
                      typeof value === 'string' ? parseFloat(value) || 0 : 0
              })) : [],
            sequence: result.sequence || '',
            classification: result.classification || 
              (result.confidence && Object.keys(result.confidence).length > 0 ? 
                Object.entries(result.confidence)
                  .reduce((a, b) => {
                    const valA = typeof a[1] === 'number' ? a[1] : 
                               typeof a[1] === 'string' ? parseFloat(a[1]) || 0 : 0;
                    const valB = typeof b[1] === 'number' ? b[1] : 
                               typeof b[1] === 'string' ? parseFloat(b[1]) || 0 : 0;
                    return valA > valB ? a : b;
                  })[0] 
                : 'Unknown')
          })) : [],
          phase1Classes: ['RGene', 'Non-RGene'],
          phase2Classes: Array.isArray(data.availableClasses) ? data.availableClasses : [],
          createdAt: data.createdAt || data.timestamp || data.submissionTime,
          completedAt: completionTime
        };

        const hasPhase2Results = Array.isArray(transformedData.phase2) && 
                               transformedData.phase2.length > 0;
        
        setHasPhase2(hasPhase2Results);
        setResults(transformedData);
        
        if (jobInfo.phase) {
          if (jobInfo.phase === 'Phase2' && hasPhase2Results) {
            setSelectedPhase('Phase2');
          } else {
            setSelectedPhase('Phase1');
          }
        } else if (data.selectedPhase === 'Phase2' && hasPhase2Results) {
          setSelectedPhase('Phase2');
        } else {
          setSelectedPhase('Phase1');
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err.message || "Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResults();
    }
  }, [resultId]);

  // Return the component's UI
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!results) {
    return <ErrorState error="No results found" />;
  }

  // Check if the current phase matches the data availability
  const phase1Available = Array.isArray(results.phase1) && results.phase1.length > 0;
  const phase2Available = Array.isArray(results.phase2) && results.phase2.length > 0;

  // Debug information
  console.log("Rendering with:", {
    selectedPhase,
    phase1Available,
    phase2Available,
    phase1Count: phase1Available ? results.phase1.length : 0,
    phase2Count: phase2Available ? results.phase2.length : 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/20 to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Display the bookmark toast if shown */}
        {showBookmarkToast && <BookmarkToast />}
        
        {/* Results Header with title and ID */}
        <ResultsHeader resultId={resultId} />
        
        {/* Main results container */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl overflow-hidden relative">
          {/* Loading overlay for downloads */}
          {loadingDownload && (
            <div className="fixed top-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg flex items-center z-50 border border-indigo-100">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-indigo-700 font-medium">Preparing download...</span>
            </div>
          )}
          
          <div className="p-6">
            {/* Cards row with Class Details, Phase Selection, and Save Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Class Details Display - First */}
              <div className="h-full flex">
                <div className="w-full">
                  <ClassDetailsDisplay 
                    results={getCurrentPhaseResults()} 
                    selectedPhase={selectedPhase}
                    displayClasses={getAvailableClasses()}
                  />
                </div>
              </div>
              
              {/* Phase Selection - Second */}
              <div className="h-full flex">
                {phase1Available && phase2Available ? (
                  <PhaseSelection 
                    selectedPhase={selectedPhase}
                    onPhaseChange={handlePhaseChange}
                    phase1Count={results.phase1.length}
                    phase2Count={results.phase2.length}
                  />
                ) : (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-blue-100/50 w-full flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Phase Information</h2>
                    <div className="p-4 bg-indigo-50 rounded-xl flex-grow flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        <p className="text-gray-700 font-medium">
                          Currently viewing {selectedPhase}
                        </p>
                      </div>
                      {phase1Available && selectedPhase === "Phase1" && (
                        <p className="text-gray-600 ml-5">
                          {results.phase1.length} sequences analyzed
                        </p>
                      )}
                      {phase2Available && selectedPhase === "Phase2" && (
                        <p className="text-gray-600 ml-5">
                          {results.phase2.length} sequences analyzed
                        </p>
                      )}
                      {!phase2Available && selectedPhase === "Phase2" && (
                        <div className="text-amber-600 ml-5 mt-2 p-2 bg-amber-50 rounded">
                          No Phase2 results available. Showing Phase1 results instead.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Save/Share options - Third */}
              <div className="h-full flex">
                <div className="w-full">
                  <SaveResultsCard 
                    resultId={resultId} 
                    onBookmark={handleBookmark}
                    selectedPhase={selectedPhase}
                  />
                </div>
              </div>
            </div>
            
            {/* Results Display - Table, Visualization, etc. */}
            <ResultsDisplay 
              results={getFilteredResults()}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              onSequenceView={handleSequenceView}
              selectedSequence={selectedSequence}
              sequenceDetails={sequenceDetails}
              onCloseSequence={handleCloseSequence}
              searchTerm={searchTerm}
              onSearch={handleSearch}
              availableClasses={getAvailableClasses()}
              selectedPhase={selectedPhase}
              getFilteredResults={getFilteredResults}
              getAvailableClasses={getAvailableClasses}
              setSearchTerm={handleSearch}
              setSelectedSequence={handleSequenceView}
              downloadFile={downloadFile}
              loadingSequence={loadingSequence} // Pass loading state for sequences
            />
            
            {/* Download options */}
            <div className="mt-8">
              <DownloadOptions 
                selectedPhase={selectedPhase}
                getAvailableClasses={getAvailableClasses}
                handleCSVDownload={handleCSVDownload}
                handleJSONDownload={handleJSONDownload}
                handleClassDownload={handleClassDownload}
                loadingDownload={loadingDownload} // Pass download loading state
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Results page component with Suspense boundary
const ResultsPage = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResultsPageClient />
    </Suspense>
  );
};

export default ResultsPage;
