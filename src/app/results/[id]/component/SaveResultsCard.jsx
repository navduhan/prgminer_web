// src/components/results/SaveResultsCard.jsx
'use client';

import { motion } from "framer-motion";
import { useState, Suspense } from "react";
import BookmarkToast from "./BookmarkToast";
import { useSearchParams } from 'next/navigation';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Component that uses useSearchParams
const SaveResultsCardContent = ({ resultId, onBookmark, selectedPhase }) => {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    
    // Construct the full ID with phase information
    const fullId = selectedPhase ? `${resultId}_${selectedPhase}` : resultId;
    const path = basePath ? `${basePath}/results/${fullId}` : `/results/${fullId}`;
    
    return `${baseUrl}${path}`;
  };

  const handleCopyUrl = async () => {
    const url = getFullUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      onBookmark?.(); // Call the bookmark callback if provided
      setCopied(true);
      
      // Hide toast after 2 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <>
      <BookmarkToast show={showToast} />
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-blue-100/50 h-full flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Save Results</h2>
        <div className="flex flex-col gap-4 flex-grow">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 flex-grow flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-auto">
              <motion.button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm
                         hover:shadow-md transition-all duration-300 text-gray-700 hover:text-indigo-600"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                title="Copy results URL to clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                </svg>
                <span>{copied ? 'Copied!' : 'Copy URL'}</span>
              </motion.button>
            </div>
            
            {resultId && (
              <div className="mt-3 mb-2">
                <div className="flex flex-col gap-2">
                  <span className="text-gray-600 text-sm font-medium">Result URL:</span>
                  <div className="relative group">
                    <div className="font-mono bg-white/80 px-3 py-2 rounded text-indigo-700 text-xs break-all border border-indigo-100">
                      {getFullUrl()}
                    </div>
                    <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/50 rounded transition-colors duration-200"></div>
                  </div>
                  <div className="text-xs text-gray-500 italic">
                    Current phase: {selectedPhase || 'Phase1'}
                  </div>
                </div>
              </div>
            )}
            
            <p className="mt-auto text-sm text-gray-600">
              Save this URL to access your results later. Results will be available for 30 days.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Main component with Suspense boundary
const SaveResultsCard = (props) => {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    }>
      <SaveResultsCardContent {...props} />
    </Suspense>
  );
};

export default SaveResultsCard;
