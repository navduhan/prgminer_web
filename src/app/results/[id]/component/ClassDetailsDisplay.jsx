import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const ClassDetailsDisplay = ({ 
  results, 
  selectedPhase, 
  displayClasses 
}) => {
  // Get color for Phase2 classes
  const getClassColor = (className, index) => {
    // Base colors for top classes
    const colors = [
      'bg-emerald-500', // 1st
      'bg-blue-500',    // 2nd
      'bg-violet-500',  // 3rd
      'bg-amber-500',   // 4th
      'bg-rose-500',    // 5th
    ];
    
    if (index < colors.length) {
      return colors[index];
    }
    
    return 'bg-gray-400'; // Default for other classes
  };

  // Calculate class distribution
  const classDistribution = useMemo(() => {
    if (!results || !Array.isArray(results) || results.length === 0) {
      return [];
    }

    // For Phase1, just count RGene vs Non-RGene
    if (selectedPhase === 'Phase1') {
      const rgeneCount = results.filter(r => 
        r.classification?.toLowerCase().includes('rgene') && 
        !r.classification?.toLowerCase().includes('non')
      ).length;
      
      const nonRgeneCount = results.filter(r => 
        r.classification?.toLowerCase().includes('non')
      ).length;
      
      const otherCount = results.length - rgeneCount - nonRgeneCount;
      
      return [
        { 
          name: 'RGene', 
          count: rgeneCount, 
          percentage: (rgeneCount / results.length) * 100,
          color: 'bg-emerald-500'
        },
        { 
          name: 'Non-RGene', 
          count: nonRgeneCount, 
          percentage: (nonRgeneCount / results.length) * 100,
          color: 'bg-rose-500'
        },
        ...(otherCount > 0 ? [{
          name: 'Other', 
          count: otherCount, 
          percentage: (otherCount / results.length) * 100,
          color: 'bg-gray-400'
        }] : [])
      ];
    } 
    // For Phase2, count by class distribution
    else {
      // Initialize counters for each class
      const classCounts = {};
      displayClasses.forEach(c => {
        classCounts[c] = 0;
      });
      
      // Count top classes for each result
      results.forEach(result => {
        if (result.confidence) {
          const confidenceEntries = Object.entries(result.confidence)
            .map(([className, value]) => ({ className, value }))
            .sort((a, b) => b.value - a.value);
          
          if (confidenceEntries.length > 0) {
            const topClass = confidenceEntries[0].className;
            if (classCounts[topClass] !== undefined) {
              classCounts[topClass]++;
            }
          }
        }
      });
      
      // Convert to array format with percentages
      return Object.entries(classCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: (count / results.length) * 100,
          color: getClassColor(name, Object.keys(classCounts).indexOf(name))
        }))
        .sort((a, b) => b.count - a.count);
    }
  }, [results, selectedPhase, displayClasses]);

  if (!results || !Array.isArray(results) || results.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-blue-100/50 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Class Distribution</h2>
      
      <div className="space-y-4 flex-grow flex flex-col">
        {/* Bar chart */}
        <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex">
          {classDistribution.map((item, index) => (
            <motion.div
              key={item.name}
              className={`${item.color} h-full flex items-center justify-center`}
              style={{ width: `${item.percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {classDistribution.map((item) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${item.color}`} />
              <div className="text-xs">
                <span className="font-medium">{item.name}:</span> {item.count} 
                <span className="text-gray-500 ml-1">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100 mt-auto">
          <div className="text-center">
            <div className="text-xs text-gray-500">Total Sequences</div>
            <div className="text-lg font-semibold text-indigo-600">{results.length}</div>
          </div>
          
          {selectedPhase === 'Phase1' && (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-500">R-Genes</div>
                <div className="text-lg font-semibold text-emerald-600">
                  {classDistribution.find(c => c.name === 'RGene')?.count || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Non-RGenes</div>
                <div className="text-lg font-semibold text-rose-600">
                  {classDistribution.find(c => c.name === 'Non-RGene')?.count || 0}
                </div>
              </div>
            </>
          )}
          
          {selectedPhase === 'Phase2' && (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-500">Classes</div>
                <div className="text-lg font-semibold text-indigo-600">{displayClasses.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Top Class</div>
                <div className="text-lg font-semibold text-emerald-600 truncate" title={classDistribution[0]?.name}>
                  {classDistribution[0]?.name || 'N/A'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ClassDetailsDisplay; 