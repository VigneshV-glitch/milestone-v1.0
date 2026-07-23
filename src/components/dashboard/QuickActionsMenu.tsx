import React from 'react';

export const QuickActionsMenu: React.FC = () => {
  return (
    <div className="relative">
      <button 
        className="flex items-center gap-2 px-4 py-2 bg-[#295DAA] text-white rounded-md text-xs font-medium hover:opacity-90 transition-colors shadow-sm"
      >
        <span>Action</span>
      </button>
    </div>
  );
};
