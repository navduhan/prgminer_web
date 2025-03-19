// src/components/help/ColorLegend.jsx
const ColorLegend = () => {
    return (
      <div className="bg-white/70 rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-indigo-700 mb-3">Color Coding:</h4>
        
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Phase 1 Colors:</h5>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2"></div>
              <span className="text-sm text-gray-700">RGene confidence</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-rose-500 mr-2"></div>
              <span className="text-sm text-gray-700">Non-RGene confidence</span>
            </div>
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Phase 2 Colors:</h5>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2"></div>
              <span className="text-sm text-gray-700">Highest confidence (1st)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-700">2nd highest confidence</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-violet-500 mr-2"></div>
              <span className="text-sm text-gray-700">3rd highest confidence</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gray-400 mr-2"></div>
              <span className="text-sm text-gray-700">Other classes</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ColorLegend;
  