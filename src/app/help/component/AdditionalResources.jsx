import React from 'react';
import { FaBookOpen, FaGraduationCap, FaNewspaper } from 'react-icons/fa';
import SectionContainer from './SectionContainer';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const AdditionalResources = () => {
  return (
    <SectionContainer title="Additional Resources">
      <p className="text-gray-700 mb-6">
        Explore additional materials to help you get the most out of PRGminer.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <a
          href={`${basePath}/standalone`}
          className="block p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all duration-300 border border-emerald-100 hover:scale-105"
          aria-label="Go to Download"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg mr-3">
              <FaBookOpen className="text-emerald-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-800">Standalone Version</h3>
          </div>
          <p className="text-gray-600">
            Access the standalone version of PRGminer for large-scale sequence analysis.
          </p>
        </a>

        <a
          href={`${basePath}/tutorial`}
          className="block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg transition-all duration-300 border border-blue-100 hover:scale-105"
          aria-label="Go to Tutorials"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <FaGraduationCap className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-blue-800">Tutorial</h3>
          </div>
          <p className="text-gray-600">
            Step-by-step guides and tutorials to help you use PRGminer effectively.
          </p>
        </a>

        <a
          href={`${basePath}/publications`}
          className="block p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl hover:shadow-lg transition-all duration-300 border border-purple-100 hover:scale-105"
          aria-label="Go to Publications"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <FaNewspaper className="text-purple-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-purple-800">Publications</h3>
          </div>
          <p className="text-gray-600">
            Scientific papers and citations related to PRGminer.
          </p>
        </a>

        <a
          href="https://github.com/usubioinfo/PRGminer"
          className="block p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl hover:shadow-lg transition-all duration-300 border border-amber-100 hover:scale-105"
          aria-label="Go to GitHub Repository"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-amber-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">GitHub Repository</h3>
          </div>
          <p className="text-gray-600 pl-11">
            Access the source code, contribute to development, or report issues
          </p>
        </a>
      </div>
    </SectionContainer>
  );
};

export default AdditionalResources;