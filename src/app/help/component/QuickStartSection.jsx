import React from 'react';
import { motion } from "framer-motion";
import Link from 'next/link';
import SectionContainer from "./SectionContainer";


const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const QuickStartSection = () => {
  return (
    <SectionContainer title="Quick Start Guide">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-gray-600">
          Welcome to PRGminer! This guide will walk you through submitting sequences for analysis, understanding prediction options, and interpreting results.
        </p>
        
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <p className="text-gray-700">
            New to PRGminer? Explore our{ " " }
            <Link href="/tutorial" className="text-blue-600 hover:text-blue-800 font-medium">
              step-by-step tutorial
            </Link>{ " " }
            with visual guides and explanations.
          </p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Getting Started</h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-600 ml-2">
            <li className="pl-2">Go to the <strong>Prediction</strong> page.</li>
            <li className="pl-2">
              Select an input method:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Upload a FASTA file</li>
                <li>Paste sequences directly</li>
                <li>Enter sequence identifiers</li>
              </ul>
            </li>
            <li className="pl-2">Choose your analysis phase:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li><strong>Phase 1:</strong> R-gene detection (binary classification)</li>
                <li><strong>Phase 2:</strong> R-gene family classification</li>
              </ul>
            </li>
            <li className="pl-2">Submit sequences for analysis.</li>
            <li className="pl-2">Review detailed predictions and confidence scores.</li>
            <li className="pl-2">Download results in multiple formats for further analysis.</li>
          </ol>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-green-800 mb-3">Input Requirements</h3>
          <ul className="space-y-3 text-gray-600">
            {[
              "Sequences must be in FASTA format",
              "Each sequence must have a unique identifier",
              "Maximum file size: 10MB",
              "Supported file extensions: .fasta, .fa, .txt"
            ].map((requirement, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </SectionContainer>
  );
};

export default QuickStartSection;
