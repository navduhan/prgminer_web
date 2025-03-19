// src/app/publications/page.jsx
// This file is the main component for the publications page.
// Author: Naveen Duhan

'use client';

import { motion } from "framer-motion";
import Link from 'next/link';

const PublicationsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Publications</h1>
          
          {/* PRGminer Paper Status */}
          <div className="mb-8 p-4 bg-indigo-50 rounded-xl">
            <h2 className="text-xl font-semibold text-indigo-900 mb-2">PRGminer Paper</h2>
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Under Review
              </span>
            </div>
            <p className="text-gray-700">
              The PRGminer paper is currently under review. We will update this page once it is published.
            </p>
          </div>

          {/* Other Publications Section */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Other Related Publications</h2>
              <p className="text-gray-600 mb-6">
                While the PRGminer paper is under review, you can explore our other related publications 
                in computational biology and machine learning.
              </p>
              
              <motion.a
                href="https://kaabil.net/publications"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 
                         text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mr-2">View All Publications</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>
            </div>

            {/* Contact Section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Stay Updated</h3>
              <p className="text-gray-600">
                Want to be notified when the PRGminer paper is published? Follow us on 
                <Link href="https://kaabil.net" 
                      className="text-indigo-600 hover:text-indigo-800 mx-1">
                  Kaabil.net
                </Link>
                or check back here for updates.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicationsPage;
