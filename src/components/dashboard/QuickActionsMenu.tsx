import React from 'react';

export const QuickActionsMenu: React.FC = () => {
  return (
    <div className="relative">
      <button 
        disabled
        title="Action button disabled"
        className="flex items-center gap-2 px-4 py-2 bg-[#295DAA] text-white rounded-md text-xs font-medium opacity-50 cursor-not-allowed shadow-sm"
      >
        <span>Action</span>
      </button>
    </div>
  );
};

