import { motion } from "framer-motion";
import SectionContainer from "./SectionContainer";

const ContactSection = () => {
  return (
    <SectionContainer title="Contact Support">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-4 bg-indigo-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-indigo-700">Technical Support</h3>
          <p className="text-gray-600">For issues with PRGminer, bugs, and technical inquiries:</p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Create an issue on <a href="https://github.com/navduhan/PRGminer" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">GitHub</a></span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email: rkaundal@usu.edu</span>
            </li>
            
          </ul>
          
          <div className="mt-4 pt-4 border-t border-indigo-100">
            <h4 className="font-medium text-indigo-700 mb-2">Bug Reports</h4>
            <p className="text-sm text-gray-600">
              When reporting bugs, please include:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              <li>Steps to reproduce the issue</li>
              <li>Expected vs. actual behavior</li>
              <li>Browser and device information</li>
              <li>Screenshots (if applicable)</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-4 bg-purple-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-purple-700">Scientific Inquiries</h3>
          <p className="text-gray-600">For questions related to R-gene prediction methodology, plant resistance research, or PRGminer’s scientific features:</p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Dr. Rakesh Kaundal: rkaundal@usu.edu</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Utah State University</span>
            </li>
     
          </ul>
          
          <div className="mt-4 pt-4 border-t border-purple-100">
            <h4 className="font-medium text-purple-700 mb-2">Research Collaboration</h4>
            <p className="text-sm text-gray-600">
              We welcome collaboration on plant resistance gene prediction and related research areas. If you are interested in working with us, please provide a brief description of your research interests.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Feedback Form</h3>
        <p className="text-gray-600 mb-4">
          We value your feedback! Please share your suggestions, questions, or general thoughts about PRGminer.
        </p>
        <div className="flex items-center justify-center">
          <motion.button
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Open Feedback Form
          </motion.button>
        </div>
      </div> */}
    </SectionContainer>
  );
};

export default ContactSection;