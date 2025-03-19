// src/components/results/Pagination.jsx
import { motion } from "framer-motion";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  startItem,
  endItem,
  // For backward compatibility
  setCurrentPage = null 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("...");
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Safe handler for page changes
  const handlePageChange = (direction) => {
    try {
      if (typeof onPageChange === 'function') {
        onPageChange(direction);
      } else if (typeof setCurrentPage === 'function') {
        if (direction === 'prev' && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else if (direction === 'next' && currentPage < totalPages) {
          setCurrentPage(currentPage + 1);
        } else if (typeof direction === 'number') {
          setCurrentPage(direction);
        }
      }
    } catch (error) {
      console.error("Error changing page:", error);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-indigo-100 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => handlePageChange('prev')}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
            ${currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-indigo-50"
            } border border-indigo-200`}
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange('next')}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
            ${currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-indigo-50"
            } border border-indigo-200`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            {totalItems ? (
              <>
                Showing <span className="font-medium">{startItem}</span> to{" "}
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{totalItems}</span> results
              </>
            ) : (
              <>
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </>
            )}
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2
                ${currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-500 hover:bg-indigo-50"
                } border border-indigo-200`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-indigo-200"
                >
                  ...
                </span>
              ) : (
                <motion.button
                  key={`page-${page}`}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium
                    ${currentPage === page
                      ? "z-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-white text-gray-500 hover:bg-indigo-50"
                    } border border-indigo-200`}
                  whileHover={currentPage !== page ? { y: -2 } : {}}
                  whileTap={currentPage !== page ? { y: 0 } : {}}
                >
                  {page}
                </motion.button>
              )
            ))}
            
            <button
              onClick={() => handlePageChange('next')}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2
                ${currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-500 hover:bg-indigo-50"
                } border border-indigo-200`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
