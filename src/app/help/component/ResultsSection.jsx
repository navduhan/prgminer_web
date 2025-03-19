import { motion } from "framer-motion";
import SectionContainer from "./SectionContainer";
import ColorLegend from "./ColorLegend";

const ResultsSection = () => {
  return (
    <SectionContainer title="Understanding Results">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-gray-600">
          After submitting your sequences, PRGminer presents the results in an interactive table.
          Here's how to understand and interpret your results:
        </p>
        
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
          <h3 className="text-xl font-medium text-indigo-800 mb-4">Results Table</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-indigo-700 mb-2">Table Components:</h4>
              <ul className="space-y-3">
                {[
                  { title: "Sequence ID", description: "Identifier from your FASTA file" },
                  { title: "Classification", description: "The predicted class for each sequence" },
                  { title: "Confidence Scores", description: "Probability scores for each possible class" },
                  { title: "View Button", description: "Click to display the actual sequence" },
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <div>
                      <span className="font-medium text-gray-800">{item.title}</span>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <ColorLegend />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="text-lg font-medium text-amber-800 mb-3">Interpreting Confidence Scores</h3>
            <p className="text-gray-700 text-sm">
              Confidence scores represent the model's certainty in its prediction. Higher scores indicate 
              greater confidence.
            </p>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-amber-700 text-sm mb-2">How to interpret:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  { range: "90-100%", text: "Very high confidence prediction", color: "text-green-600" },
                  { range: "70-90%", text: "Strong confidence prediction", color: "text-emerald-600" },
                  { range: "50-70%", text: "Moderate confidence prediction", color: "text-amber-600" },
                  { range: "<50%", text: "Low confidence prediction", color: "text-rose-600" },
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className={`${item.color} font-bold mr-2`}>{item.range}:</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
            <h3 className="text-lg font-medium text-violet-800 mb-3">Search and Filter</h3>
            <p className="text-gray-700 text-sm mb-3">
              You can search and filter results to find specific sequences or patterns:
            </p>
            <div className="space-y-3">
              {[
                { title: "Search by:", options: ["Sequence ID", "Classification result", "Keywords in sequence"] },
                { title: "Adjust display:", options: ["Change rows per page", "Navigate between result pages", "View full sequences when needed"] },
              ].map((section, index) => (
                <div key={index} className="bg-white/70 rounded-lg p-3 shadow-sm">
                  <h4 className="font-medium text-violet-700 text-sm mb-2">{section.title}</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {section.options.map((option, idx) => (
                      <li key={idx}>• {option}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </SectionContainer>
  );
};

export default ResultsSection;