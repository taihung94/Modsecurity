
import React from 'react';

interface AnalysisCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg backdrop-blur-sm overflow-hidden">
      <div className="p-4 bg-gray-900/30 border-b border-gray-700 flex items-center space-x-3">
        <span className="text-cyan-400">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default AnalysisCard;
