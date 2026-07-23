import React from 'react';
import { LayoutDashboard, Route, Truck, Users, Settings as SettingsIcon, ChevronLeft, MapPin } from 'lucide-react';

const Sidebar: React.FC<{ isOpen: boolean; onToggle: () => void; activeTab: string; onTabChange: (tab: string) => void; }> = ({ isOpen, onToggle, activeTab, onTabChange }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Trips', icon: <Route className="w-5 h-5" /> },
    { name: 'Vehicles', icon: <Truck className="w-5 h-5" /> },
    { name: 'Drivers', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className={`relative z-30 text-brand-text flex-shrink-0 flex flex-col shadow-2xl transition-all duration-300 ease-in-out bg-gradient-to-b from-[#295DAA] to-[#0E192F] dark:from-[#000B2B] dark:to-[#121212] dark:border-r dark:border-[#2d2d2d] ${isOpen ? 'w-56' : 'w-20'}`}>
        <div className="h-full">
            <div className="p-4 flex flex-col h-full">
                <div className="flex items-center mb-4 px-2">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="bg-white/10 w-[40px] h-[40px] flex items-center justify-center rounded-full flex-shrink-0">
                          <MapPin className="w-[22px] h-[22px] text-white" />
                      </div>
                      <div className={`ml-3 min-w-0 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                          <h1 className="text-[18px] font-bold italic font-[Verdana] text-white whitespace-nowrap overflow-hidden text-ellipsis">MileStone</h1>
                      </div>
                    </div>
                </div>
                
                <nav className="flex-1 mt-2">
                    <ul>
                    {menuItems.map((item) => (
                      <li key={item.name}>
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); onTabChange(item.name); }}
                          className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 hover:text-white ${!isOpen && 'justify-center'} ${activeTab === item.name ? 'bg-black/10 dark:bg-white/10 text-white font-semibold' : ''}`}
                        >
                          <div className="flex-shrink-0">{item.icon}</div>
                          <span className={`ml-4 text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{item.name}</span>
                        </a>
                      </li>
                    ))}
                    </ul>
                </nav>

                <div className="mt-auto">
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); onTabChange('Settings'); }}
                      className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 hover:text-white ${!isOpen && 'justify-center'} ${activeTab === 'Settings' ? 'bg-black/10 dark:bg-white/10 text-white font-semibold' : ''}`}
                    >
                      <div className="flex-shrink-0"><SettingsIcon className="w-5 h-5" /></div>
                      <span className={`ml-4 text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Settings</span>
                    </a>
                </div>

                <div className="mt-2 pt-2 border-t border-white/10">
                    <button onClick={onToggle} className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 hover:text-white ${!isOpen && 'justify-center'}`}>
                        <div className={`flex-shrink-0 transition-transform duration-300 ${!isOpen && 'rotate-180'}`}><ChevronLeft className="w-5 h-5" /></div>
                        <span className={`ml-4 text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Collapse</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
export default Sidebar;
