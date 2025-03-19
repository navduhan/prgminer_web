// src/components/help/NavigationTabs.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiBookOpen, FiHelpCircle, FiPhoneCall } from "react-icons/fi";
import { BiAnalyse, BiDownload, BiBarChartAlt2 } from "react-icons/bi";

// No need to modify this component as it doesn't handle navigation directly.
// It only manages active section state which is passed from the parent component.

const NavigationTabs = ({ activeSection, setActiveSection }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size to determine layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const tabs = [
    { id: "quickstart", label: "Quick Start", icon: <FiBookOpen />, path: "/quickstart" },
    { id: "prediction", label: "Prediction Strategy", icon: <BiAnalyse />, path: "/prediction" },
    { id: "results", label: "Results Guide", icon: <BiBarChartAlt2 />, path: "/results" },
    { id: "download", label: "Download Options", icon: <BiDownload />, path: "/download" },
    { id: "faq", label: "FAQ", icon: <FiHelpCircle />, path: "/faq" },
    { id: "contact", label: "Contact Support", icon: <FiPhoneCall />, path: "/contact" }
  ];
  
  // Split tabs into two rows for better mobile display
  const firstRowTabs = tabs.slice(0, isMobile ? 3 : tabs.length);
  const secondRowTabs = isMobile ? tabs.slice(3) : [];
  
  return (
    <div className="mb-8">
      {/* Main container with background */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-3 shadow-sm">
        {/* First row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {firstRowTabs.map(tab => (
            <TabButton 
              key={tab.id}
              tab={tab} 
              isActive={activeSection === tab.id} 
              onClick={() => setActiveSection(tab.id)}
            />
          ))}
        </div>
        
        {/* Second row (only on mobile) */}
        {secondRowTabs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {secondRowTabs.map(tab => (
              <TabButton 
                key={tab.id}
                tab={tab} 
                isActive={activeSection === tab.id} 
                onClick={() => setActiveSection(tab.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Visual indicator text for current section */}
      <div className="text-center mt-2 text-xs text-indigo-500 font-medium">
        Currently viewing: {tabs.find(tab => tab.id === activeSection)?.label}
      </div>
    </div>
  );
};

// Extracted tab button component
const TabButton = ({ tab, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`
      px-3 py-2.5 rounded-lg flex items-center justify-center sm:justify-start
      transition-all duration-200 
      ${isActive 
        ? "bg-white shadow-md text-indigo-700 font-medium border border-indigo-100" 
        : "text-gray-600 hover:text-indigo-600 hover:bg-white/50"}
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="text-xl mr-1.5">
      <IconWrapper isActive={isActive}>
        {tab.icon}
      </IconWrapper>
    </span>
    <span className="text-sm sm:text-base hidden sm:inline">{tab.label}</span>
    <span className="text-sm sm:hidden">{tab.label.split(' ')[0]}</span>
  </motion.button>
);

// Icon wrapper with consistent sizing
const IconWrapper = ({ children, isActive }) => (
  <div className={`flex items-center justify-center w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`}>
    {children}
  </div>
);

export default NavigationTabs;
