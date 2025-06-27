// IndicadorFinancieroSkeleton.tsx
import React from 'react';
import { motion } from 'framer-motion';

export const IndicadorFinancieroSkeleton: React.FC = () => {
  return (
    <motion.div
      className="bg-white w-[295px] rounded-lg shadow-sm border border-gray-200 overflow-hidden relative flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="h-1.5 w-full bg-gray-200 animate-pulse"></div>
      
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-grow">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded-full mr-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
          </div>
          
          <div className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded-full mr-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};