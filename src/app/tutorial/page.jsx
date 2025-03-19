
// This file is the main component for the tutorial page.
// Author: Naveen Duhan

"use client";
import Image from 'next/image';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const TutorialSection = ({ title, description, children }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-6">
    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    <p className="text-gray-600">{description}</p>
    {children}
  </div>
);

const ImagePlaceholder = ({ caption }) => (
  <div className="bg-gray-100 rounded-xl p-8 text-center space-y-4">
    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Screenshot will be added here</p>
    </div>
    <p className="text-sm text-gray-600 italic">{caption}</p>
  </div>
);

const TutorialPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/20 to-blue-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">PRGMiner Tutorial</h1>
          <p className="text-xl text-gray-600">
            A comprehensive guide to using PRGMiner for plant resistance gene prediction
          </p>
        </div>

        {/* Navigation */}
        <TutorialSection
          title="Homepage"
          description="The homepage provides an overview of PRGMiner and quick access to all major features."
        >
          <div className="space-y-6">
            <div className="prose max-w-none text-gray-600">
              <ul>
                <li>Navigation bar with links to all major sections</li>
                <li>Quick introduction to PRGMiner's capabilities</li>
                <li>Direct access to prediction tools</li>
                <li>Latest updates and announcements</li>
              </ul>
            </div>
            <Image 
              src={`${basePath}/images/home.png`}
              alt="PRGMiner homepage" 
              width={1000} 
              height={600}
              className="rounded-lg shadow-md"
            />
          </div>
        </TutorialSection>

        {/* Prediction Page */}
        <TutorialSection
          title="Making Predictions"
          description="Learn how to submit sequences and get predictions using PRGMiner."
        >
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-700">Input Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-medium text-gray-800 mb-2">Accession ID</h4>
                  <p className="text-sm text-gray-600">Enter a valid protein accession ID from NCBI or UniProt to fetch and analyze the sequence.</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-medium text-gray-800 mb-2">FASTA File</h4>
                  <p className="text-sm text-gray-600">Upload a FASTA file containing one or multiple protein sequences for analysis.</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="font-medium text-gray-800 mb-2">Paste Sequence</h4>
                  <p className="text-sm text-gray-600">Directly paste FASTA-formatted sequences into the text area.</p>
                </div>
              </div>
              <Image 
                src={`${basePath}/images/prediction.png`}
                alt="Prediction page showing the three input methods" 
                width={1000} 
                height={600}
                className="rounded-lg shadow-md"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">Submission Process</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>Choose your preferred input method</li>
                <li>Click "Run Prediction" to start the analysis</li>
                <li>Wait for the analysis to complete</li>
              </ol>
              {/* <ImagePlaceholder caption="Sequence submission form and options" /> */}
            </div>
          </div>
        </TutorialSection>

        {/* Results Page */}
        <TutorialSection
          title="Understanding Results"
          description="Learn how to interpret and download your prediction results."
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">Results Table</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Sequence ID and basic information</li>
                <li>Prediction outcome (R-gene or Non-R-gene)</li>
                <li>Confidence scores for predictions</li>
                <li>Detailed classification for R-genes</li>
              </ul>
              <Image 
                src={`${basePath}/images/result_table.png`}
                alt="Results table showing prediction outcomes" 
                width={1000} 
                height={600}
                className="rounded-lg shadow-md"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">Download Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-2">Complete Results</h4>
                  <p className="text-sm text-gray-600">Download all results in CSV, JSON, or FASTA format, including sequences and predictions.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-2">Filtered Results</h4>
                  <p className="text-sm text-gray-600">Download results for specific R-gene classes or confidence thresholds.</p>
                </div>
              </div>
              <Image 
                src={`${basePath}/images/download_results.png`}
                alt="Download options and file format selection" 
                width={1000} 
                height={600}
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </TutorialSection>

        {/* Documentation */}
        <TutorialSection
          title="Documentation and Help"
          description="Access comprehensive documentation and get help when needed."
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-2">Documentation</h4>
                <p className="text-sm text-gray-600">
                  Detailed technical documentation covering:
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-600">
                  <li>Installation guide</li>
                  <li>API reference</li>
                  <li>File format specifications</li>
                  <li>Best practices</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-2">Help Center</h4>
                <p className="text-sm text-gray-600">
                  Get assistance through:
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-600">
                  <li>FAQs</li>
                  <li>Email support</li>
                  <li>GitHub issues</li>
                  <li>Community forums</li>
                </ul>
              </div>
            </div>
            <Image 
              src={`${basePath}/images/help.png`}
              alt="Help center and documentation resources" 
              width={1000} 
              height={600}
              className="rounded-lg shadow-md"
            />
          </div>
        </TutorialSection>

        {/* Download Section */}
        <TutorialSection
          title="Local Installation"
          description="Instructions for downloading and running PRGMiner locally."
        >
          <div className="space-y-6">
            <div className="prose max-w-none text-gray-600">
              <h3 className="text-xl font-semibold text-gray-700">System Requirements</h3>
              <ul>
                <li>Python 3.7 or higher</li>
                <li>Required dependencies (listed in requirements.txt)</li>
                <li>Sufficient RAM for large datasets</li>
                <li>GPU support (optional, for faster processing)</li>
              </ul>
            </div>
            <Image 
              src={`${basePath}/images/download.png`}
              alt="Downloads page with available resources" 
              width={1000} 
              height={600}
              className="rounded-lg shadow-md"
            />
            
            <div className="bg-yellow-50 rounded-xl p-6">
              <h4 className="font-medium text-gray-800 mb-2">Important Note</h4>
              <p className="text-sm text-gray-600">
                Local installation is recommended for:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                <li>Processing large datasets ({'>'}10,000 sequences)</li>
                <li>Integration with existing pipelines</li>
                <li>Customized analysis workflows</li>
                <li>Offline usage</li>
              </ul>
            </div>
          </div>
        </TutorialSection>
      </div>
    </div>
  );
};

export default TutorialPage;