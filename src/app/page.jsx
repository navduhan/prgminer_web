// Home page component

// Author: Naveen Duhan

// import dependencies

"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";


const Modal = ({ isOpen, onClose, title, content }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-rose-600 focus:outline-none transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-base leading-relaxed">{content}</p>
            </div>
            <div className="flex justify-end p-6 border-t bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <motion.button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HomePage = () => {
  const [selectedModal, setSelectedModal] = useState(null);
  const [basePath, setBasePath] = useState('');
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    // Get base path from environment variable
    setBasePath(process.env.NEXT_PUBLIC_BASE_PATH || '');
  }, []);

  const geneClasses = [
    {
      id: "cnl",
      name: "Coiled-coil-NBS-LRR (CNL)",
      description: "Contains a central nucleotide-binding (NB) subdomain as part of a larger entity called the NB-ARC domain. C-terminal to the NB-ARC domain lies a leucine-rich repeat (LRR) domain, which is sometimes followed by an extension of variable length. Hence, this group of R proteins is collectively referred to as NB-LRR proteins. If N-terminal region contain a predicted coiled-coil structures (CC), non-TIR NB-LRR proteins are collectively referred to as CC-NB-LRR or CNL."
    },
    {
      id: "kin",
      name: "Kinase (KIN)",
      description: "Kinase domain involved in resistance process"
    },
    {
      id: "lecrk",
      name: "Lectin receptor-like kinase (LECRK)",
      description: "Contains domains LECM, Kinase, and might also contain a TM domain."
    },
    {
      id: "lyk",
      name: "Lysin motif receptor kinase (LYK)",
      description: "Contains domains LYSM, Kinase, and might also contain a TM domain."
    },
    {
      id: "rlp",
      name: "Receptor like protein (RLP)",
      description: "Receptor Like Proteins consists of a leucine-rich receptor-like repeat, a transmembrane region of ~25 AA, and a short cytoplasmic region, with no kinase domain. The extracellular leucine rich repeat (eLRR) shows high homology with the RLKs eLRR. RLPs can recognise avirulence genes in a indirect way like Cf2 that recognise the avirulence gene Avr2 through the cysteine protease Rcr3. There are also some hypotheses about a direct recognition, but this has not yet been demonstrated. RLPs lack an obvious signalling domain, suggesting that defence response activation is mediated through interactions with other partner proteins. Activation of RLP typically results in a rapid accumulation of active oxygen species (AOS), changes in cellular ion fluxes, activation of protein kinase cascades, changes in gene expression and, possibly, targeted protein degradation."
    },
    {
      id: "rlk",
      name: "Receptor-like kinase (RLK)",
      description: "RLKs, or Receptor like Kinases, consist of an extracellullar leucine-rich repeat region (eLRR) that consist of 25-38aa conferring broad interaction surface that is well suited to interact with multiple ligands and an intracellular kinase domain. The eLRR domain plays the recognising role while the kinase triggers the downstream activation cascades. In Arabidopsis genome RLKs constitute a large gene family divided in 44 subclasses, 12 of them have the extracellular domain LRR while the other use different type of receptor like B-lactin and many others."
    },
    {
      id: "tir",
      name: "Toil-inteleukin receptor domain (TIR)",
      description: "Contains TIR domain only, lack of LRR or NBS"
    },
    {
      id: "tnl",
      name: "TIR-NB-LRR (TNL)",
      description: "Contains a central nucleotide-binding (NB) subdomain as part of a larger entity called the NB-ARC domain. C-terminal to the NB-ARC domain lies a leucine-rich repeat (LRR) domain, which is sometimes followed by an extension of variable length. Hence, this group of R proteins is collectively referred to as NB-LRR proteins. If N-terminal region shows homology to the protein domain Interleukin-1 Receptor (IL-1R), called the TIR domain, these proteins are referred to as TIR-NB-LRR or TNL."
    }
  ];

  const features = [
    {
      id: 'accuracy',
      title: 'High Accuracy',
      description: 'Advanced machine learning models trained on extensive protein sequence data for precise R-gene identification.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'speed',
      title: 'Fast Processing',
      description: 'Efficient analysis of large protein sequence datasets with optimized computational pipelines.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'phases',
      title: 'Two-Phase Analysis',
      description: 'Comprehensive analysis with initial R-gene identification followed by detailed classification.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  const stats = [
    { label: 'Accuracy', value: '98%' },
    { label: 'Processing Time', value: '~2 min' },
    { label: 'Scalability', value: 'Highly Efficient' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50/30 pt-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section - Full Width */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative bg-gradient-to-r from-blue-100/50 to-purple-100/50 p-6 md:p-8 border-b">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              What is PRGminer?
            </motion.h1>
            <p className="text-xl text-gray-600 max-w-5xl">
              A powerful deep learning tool for identifying and classifying plant resistance genes (R-genes) in plant genomes.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column - Image and Stats */}
              <div className="space-y-8">
                <motion.figure 
                  className="w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="relative w-full h-[300px] bg-white rounded-2xl shadow-lg 
                              transform transition-all duration-500 hover:shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50" />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-full h-full"
                    >
                      <Image 
                        src={`${basePath}/images/prgminer.png`} 
                        alt="PRGminer" 
                        fill
                        className="object-contain p-6 rounded-lg" 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    </motion.div>
                  </div>
                </motion.figure>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div 
                      key={stat.label}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center border border-blue-100/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Features */}
              <div className="space-y-6">
                {features.map((feature) => (
                  <motion.div
                    key={feature.id}
                    className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-6 border border-blue-100/50 hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-white/80 text-blue-600">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Quick Actions */}
                <div className="flex gap-4 mt-8">
                  <Link href={`${basePath}/prediction`} 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl 
                              flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Analysis
                  </Link>
                  <Link href={`${basePath}/help`} 
                    className="flex-1 border-2 border-purple-500 text-purple-600 font-semibold py-3 px-6 rounded-xl 
                              flex items-center justify-center gap-2 transition-all duration-300 hover:bg-purple-50 hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                    </svg>
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How It Works Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">How Plant Resistance Works</h2>
            </div>
            <div className="p-6">
              <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                <ul className="space-y-4">
                  {[
                    "When activated, these genes trigger a cascade of molecular processes",
                    "Produces antimicrobial compounds for defense",
                    "Strengthens cell walls to prevent pathogen invasion",
                    "Initiates programmed cell death in infected areas"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Two-Phase Analysis Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">Two-Phase Analysis</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="font-semibold text-blue-600 mb-2">Phase I: R-gene Prediction</h3>
                  <p className="text-gray-600">Predicts input protein sequences as R-genes or non-R-genes with {'>'}98% accuracy</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                  <h3 className="font-semibold text-purple-600 mb-2">Phase II: R-gene Classification</h3>
                  <p className="text-gray-600">Classifies R-genes into eight different classes with {'>'}98% accuracy with 5-fold cross validation.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gene Classes Section - Full Width */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Plant Resistance Gene Classes</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {geneClasses.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-4 border border-blue-100/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedModal(item)}
                >
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  <button
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    onClick={() => setSelectedModal(item)}
                  >
                    Learn More →
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedModal}
        onClose={() => setSelectedModal(null)}
        title={selectedModal?.name}
        content={selectedModal?.description}
      />
    </main>
  );
};

export default HomePage;
