"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";


const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const StandalonePage = () => {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const requirements = [
    {
      title: "Python",
      version: "≥ 3.8",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
        </svg>
      )
    },
    {
      title: "Dependencies",
      version: "Listed in requirements.txt",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "GPU Support",
      version: "Optional (CUDA ≥ 11.0)",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    }
  ];

  const installSteps = [
    {
      title: "Option 1: Direct Download",
      description: "Download and install PRGminer directly",
      steps: [
        {
          title: "Download",
          description: "Download the PRGminer.tar.gz file",
          code: `wget ${basePath}/PRGminer.tar.gz`
        },
        {
          title: "Extract",
          description: "Extract the downloaded archive",
          code: "tar -xzf PRGminer.tar.gz"
        },
        {
          title: "Create Conda Environment",
          description: "Create and activate a new Conda environment",
          code: "cd PRGminer\nconda env create -f environment.yml\nconda activate PRGminer"
        },
        {
          title: "Install Dependencies",
          description: "Install required Python packages",
          code: "pip install ."
        },
        {
          title: "Verify Installation",
          description: "Check PRGminer installation and view available options",
          code: "PRGminer -h"
        }
      ]
    },
    {
      title: "Option 2: GitHub (Recommended)",
      description: "Install PRGminer using Git and Conda",
      steps: [
        {
          title: "Clone Repository",
          description: "Clone the PRGminer repository using Git LFS",
          code: "git lfs clone https://github.com/usubioinfo/PRGminer.git"
        },
        {
          title: "Create Conda Environment",
          description: "Create and activate a new Conda environment",
          code: "cd PRGminer\n conda env create -f environment.yml\nconda activate PRGminer"
        },
        {
          title: "Install Package",
          description: "Install PRGminer package",
          code: "pip install ."
        },
        {
          title: "Verify Installation",
          description: "Check PRGminer installation and view available options",
          code: "PRGminer -h"
        }
      ]
    }
  ];

  const handleDownload = () => {
    setDownloadStarted(true);
    // Simulate download completion after 2 seconds
    setTimeout(() => setDownloadStarted(false), 2000);
    // Trigger actual download
    window.location.href = `${basePath}/PRGminer.tar.gz`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50/30 pt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Standalone Version
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Download and run PRGminer locally on your machine with full functionality and GPU acceleration support.
          </p>
        </motion.div>

        {/* Download Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 p-6 md:p-8 border-b">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">PRGminer v1.0.0</h2>
                <p className="text-gray-600">Latest stable release with improved accuracy and performance</p>
              </div>
              <motion.button
                onClick={handleDownload}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl 
                          flex items-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={downloadStarted}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloadStarted ? 'Downloading...' : 'Download PRGminer'}
              </motion.button>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">System Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {requirements.map((req, index) => (
                <motion.div
                  key={req.title}
                  className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-6 border border-blue-100/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white/80 text-blue-600">
                      {req.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{req.title}</h4>
                      <p className="text-sm text-gray-600">{req.version}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Installation Guide */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Installation Guide</h2>
          </div>
          <div className="p-6 md:p-8">
            <div className="space-y-12">
              {installSteps.map((option, optionIndex) => (
                <motion.div
                  key={option.title}
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + optionIndex * 0.1, duration: 0.5 }}
                >
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                      {option.title}
                      {optionIndex === 1 && (
                        <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Recommended
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600">{option.description}</p>
                  </div>
                  
                  <div className="space-y-6 pl-4 border-l-2 border-blue-100">
                    {option.steps.map((step, index) => (
                      <motion.div
                        key={step.title}
                        className="space-y-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      >
                        <h4 className="font-medium text-gray-800 flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          {step.title}
                        </h4>
                        <p className="text-gray-600 pl-9">{step.description}</p>
                        <div className="pl-9">
                          <code className="block bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre">
                            $ {step.code}
                          </code>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {optionIndex === 1 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-lg bg-blue-100 text-blue-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-blue-800">
                            Make sure you have Git LFS installed. You can install it from{' '}
                            <a 
                              href="https://git-lfs.github.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              git-lfs.github.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link href="/documentation"
            className="bg-white rounded-2xl p-6 border border-blue-100/50 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Documentation</h3>
                <p className="text-gray-600">Read the full documentation and API reference</p>
              </div>
            </div>
          </Link>

          <Link href="/help"
            className="bg-white rounded-2xl p-6 border border-blue-100/50 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">Need Help?</h3>
                <p className="text-gray-600">Get support and troubleshooting guides</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </main>
  );
};

export default StandalonePage;
