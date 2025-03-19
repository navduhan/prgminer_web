// src/components/help/DownloadSection.jsx
import { motion } from "framer-motion";
import SectionContainer from "./SectionContainer";

const DownloadSection = () => {
  return (
    <SectionContainer title="Download Options">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-gray-600">
          PRGminer provides several options for downloading and exporting your prediction results.
          These downloads can be used for further analysis, documentation, or sharing with colleagues.
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <h3 className="text-xl font-medium text-blue-800 mb-4">Available Download Formats</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-medium text-blue-800">CSV (Spreadsheet)</h4>
              </div>
              
              <p className="text-gray-700 text-sm mb-3">
                Comma-separated values format that can be opened in spreadsheet software like Excel or Google Sheets.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-blue-700 mb-1">Includes:</h5>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Sequence IDs</li>
                  <li>Classification results</li>
                  <li>Confidence scores for all classes</li>
                  <li>Prediction phase information</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-medium text-indigo-800">JSON (Data)</h4>
              </div>
              
              <p className="text-gray-700 text-sm mb-3">
                JavaScript Object Notation format ideal for programmatic use and data processing applications.
              </p>
              
              <div className="bg-indigo-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-indigo-700 mb-1">Best for:</h5>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Data integration with other software</li>
                  <li>Custom processing pipelines</li>
                  <li>Complete data structure preservation</li>
                  <li>Web application development</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
          <h3 className="text-xl font-medium text-emerald-800 mb-4">Class-Specific Downloads</h3>
          
          <p className="text-gray-700 text-sm mb-4">
            You can download sequences grouped by their prediction classes. This is useful for further analysis
            of specific gene families or for validation purposes.
          </p>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h4 className="font-medium text-emerald-800">FASTA Files by Class</h4>
            </div>
            
            <p className="text-gray-700 text-sm mb-3">
              Download sequences of specific classes in FASTA format. Available for both Phase 1 and Phase 2 results.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">RGene.fasta</span>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">Non-RGene.fasta</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">CNL.fasta</span>
              <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-xs font-medium">TNL.fasta</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">RLK.fasta</span>
            </div>
            
            <div className="text-sm text-gray-600 italic">
              Note: Downloaded files contain only sequences from the currently loaded prediction results.
            </div>
          </div>
        </div>
      </motion.div>
    </SectionContainer>
  );
};

export default DownloadSection;
