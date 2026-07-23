import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const AppShell: React.FC<{ children: React.ReactNode; activeTab: string; onTabChange: (tab: string) => void }> = ({ children, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212] overflow-hidden font-sans text-gray-800 dark:text-gray-100 transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main 
          className="flex-1 bg-gray-100 dark:bg-[#121212] overflow-hidden flex flex-col"
        >
          <div className={`flex-1 text-gray-800 dark:text-gray-100 ${['Settings', 'Trips', 'Vehicles', 'Drivers'].includes(activeTab) ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
            <div className={`p-[18px] flex flex-col ${['Settings', 'Trips', 'Vehicles', 'Drivers'].includes(activeTab) ? 'flex-1 h-full overflow-hidden' : 'min-h-full'}`}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default AppShell;
