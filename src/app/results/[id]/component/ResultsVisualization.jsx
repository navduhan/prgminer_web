// src/components/results/ResultsVisualization.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const ResultsVisualization = ({ 
  selectedPhase, 
  results,
  // For backward compatibility
  getCurrentPhaseResults 
}) => {
  // Safely get results using either method
  const currentResults = useMemo(() => {
    try {
      if (Array.isArray(results)) {
        return results;
      } else if (typeof getCurrentPhaseResults === 'function') {
        const funcResults = getCurrentPhaseResults();
        return Array.isArray(funcResults) ? funcResults : [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }, [results, getCurrentPhaseResults]);
  
  // Define chart colors
  const chartColors = {
    phase1: ['#10b981', '#ef4444'], // Green for RGene, Red for Non-RGene
    phase2: [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#8b5cf6', // violet
      '#f59e0b', // amber
      '#ef4444', // red
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16'  // lime
    ]
  };

  // Prepare data for distribution chart
  const getDistributionData = () => {
    if (!currentResults || currentResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    try {
      // Count occurrences of each classification
      const classificationCounts = {};
      currentResults.forEach(result => {
        if (result && result.classification) {
          const classification = result.classification;
          classificationCounts[classification] = (classificationCounts[classification] || 0) + 1;
        }
      });

      // Sort by count (descending)
      const sortedClassifications = Object.keys(classificationCounts).sort(
        (a, b) => classificationCounts[b] - classificationCounts[a]
      );

      // Get colors based on phase
      const colors = selectedPhase === "Phase1" 
        ? chartColors.phase1 
        : chartColors.phase2.slice(0, sortedClassifications.length);

      // Ensure we have colors for all classifications
      const extendedColors = sortedClassifications.map((_, idx) => {
        if (idx < colors.length) return colors[idx];
        // Cycle through colors if we have more classifications than colors
        return colors[idx % colors.length];
      });

      return {
        labels: sortedClassifications,
        datasets: [{
          label: 'Number of Sequences',
          data: sortedClassifications.map(cls => classificationCounts[cls]),
          backgroundColor: extendedColors,
          borderColor: extendedColors,
          borderWidth: 1,
          borderRadius: 6,
        }]
      };
    } catch (error) {
      console.error("Error preparing chart data:", error);
      return { labels: [], datasets: [] };
    }
  };

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Number of sequences: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Sequences',
          font: {
            family: 'Inter, sans-serif',
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Classification',
          font: {
            family: 'Inter, sans-serif',
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // Get chart data
  const chartData = useMemo(() => getDistributionData(), [currentResults, selectedPhase]);
  
  // Check if we have data to display
  const hasData = chartData.labels && chartData.labels.length > 0;

  return (
    <div className="space-y-6">
      {hasData ? (
        <motion.div 
          className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-indigo-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-80">
            <Bar data={chartData} options={barOptions} />
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="text-center p-10 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-indigo-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No data available for visualization</h3>
          <p className="mt-2 text-gray-500">Select a different phase or wait for results to be processed.</p>
        </motion.div>
      )}

      {hasData && (
        <motion.div 
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 text-sm text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <p className="font-medium">Chart insights:</p>
          <p className="mt-1">
            This chart shows the distribution of predicted classifications across all sequences.
            {chartData.labels.length > 0 && chartData.datasets[0].data && chartData.datasets[0].data.length > 0 && (
              <> The most common classification is <span className="font-semibold">{chartData.labels[0]}</span> 
              with {chartData.datasets[0].data[0]} sequences.</>
            )}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ResultsVisualization;
