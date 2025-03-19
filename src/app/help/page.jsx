// src/components/help/HelpPage.jsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import HelpHeader from "./component/HelpHeader";
import NavigationTabs from "./component/NavigationTabs";
import QuickStartSection from "./component/QuickStartSection";
import PredictionStrategySection from "./component/PredictionStrategySection";
import ResultsSection from "./component/ResultsSection";
import DownloadSection from "./component/DownloadSection";
import FAQSection from "./component/FAQSection";
import ContactSection from "./component/ContactSection";
import AdditionalResources from "./component/AdditionalResources";

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState("quickstart");
  const [selectedFaq, setSelectedFaq] = useState(null);

  const supportChannels = [
    {
      title: "GitHub Issues",
      description: "Report bugs or request features",
      link: "https://github.com/usubioinfo/PRGminer/issues",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Email Support",
      description: "Direct technical assistance",
      link: "mailto:naveen.duhan@usu.edu",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Documentation",
      description: "Detailed user guides",
      link: "/documentation",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
        </svg>
      )
    }
  ];

  const commonIssues = [
    {
      title: "Installation Issues",
      description: "Common problems during installation",
      solutions: [
        {
          problem: "Conda environment creation fails",
          solution: "Make sure you have Conda installed and updated:\n$ conda update conda\n$ conda update --all",
        },
        {
          problem: "Missing dependencies",
          solution: "Try reinstalling dependencies:\n$ pip install -r requirements.txt --force-reinstall",
        },
        {
          problem: "Git LFS issues",
          solution: "Install Git LFS and pull files:\n$ git lfs install\n$ git lfs pull",
        }
      ]
    },
    {
      title: "Runtime Errors",
      description: "Issues when running PRGminer",
      solutions: [
        {
          problem: "CUDA not found",
          solution: "Check CUDA installation:\n$ nvidia-smi\nMake sure CUDA version matches requirements (≥11.0)",
        },
        {
          problem: "Memory errors",
          solution: "Reduce batch size or use CPU mode:\nAdd --cpu flag or reduce --batch_size",
        },
        {
          problem: "Input file format errors",
          solution: "Ensure input files are in correct FASTA format:\nCheck file encoding and remove special characters",
        }
      ]
    },
    {
      title: "Output Issues",
      description: "Problems with results and output",
      solutions: [
        {
          problem: "No results generated",
          solution: "Verify input sequences and parameters:\n$ PRGminer -h\nCheck log files for errors",
        },
        {
          problem: "Incorrect predictions",
          solution: "Ensure sequence quality and try different parameters:\nUse --threshold to adjust confidence cutoff",
        },
        {
          problem: "Missing output files",
          solution: "Check write permissions and disk space:\nSpecify output directory with --output",
        }
      ]
    }
  ];

  const faqs = [
    {
      question: "What are the minimum system requirements?",
      answer: "PRGminer requires Python ≥3.8, 8GB RAM, and optionally CUDA ≥11.0 for GPU support. For detailed requirements, check the installation guide."
    },
    {
      question: "How do I cite PRGminer?",
      answer: "The PRGminer paper is currently under review. Please check back later for citation information or contact the authors."
    },
    {
      question: "Can I use PRGminer for commercial purposes?",
      answer: "PRGminer is released under the GNU General Public License v3. Commercial use is permitted under the terms of this license."
    },
    {
      question: "How can I contribute to PRGminer?",
      answer: "You can contribute by submitting pull requests on GitHub, reporting bugs, or suggesting new features through the issue tracker."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/20 to-blue-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <HelpHeader />
        
        <NavigationTabs 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        
        {activeSection === "quickstart" && <QuickStartSection />}
        {activeSection === "prediction" && <PredictionStrategySection />}
        {activeSection === "results" && <ResultsSection />}
        {activeSection === "download" && <DownloadSection />}
        {activeSection === "faq" && <FAQSection />}
        {activeSection === "contact" && <ContactSection />}

        
        <AdditionalResources />
      </div>
    </div>
  );
};

export default HelpPage;
