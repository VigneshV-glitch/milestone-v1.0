import React, { useState } from 'react';
import { Moon, Sun, Search } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { QuickActionsMenu } from '../dashboard/QuickActionsMenu';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [searchFocused] = useState(false);

  return (
    <header className="bg-white dark:bg-[#1e1e1e] shadow-sm px-4 h-12 flex justify-between items-center flex-shrink-0 border-b border-gray-200 dark:border-[#2d2d2d] relative z-20 transition-colors duration-200">
      <div className="flex items-center flex-1 max-w-xl">
        <div 
          onClick={() => window.dispatchEvent(new CustomEvent('tms-trigger-universal-search'))}
          className={`relative flex items-center w-full transition-all duration-200 cursor-pointer ${searchFocused ? 'max-w-md' : 'max-w-xs'}`}
        >
          <Search className={`absolute left-3 w-4 h-4 transition-colors ${searchFocused ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
          <div className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2d2d2d] rounded-full text-xs text-gray-400 dark:text-gray-500 transition-all select-none">
            Search everything...
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Actions */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-600 dark:text-gray-300 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <QuickActionsMenu />
        {/* User Profile */}
        <div className="flex items-center space-x-3">
            <img src="https://picsum.photos/seed/user/40/40" alt="User" className="w-8 h-8 rounded-full" />
            <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">John Doe</div>
                <div className="text-[10px] leading-tight text-gray-500 dark:text-gray-400">Admin</div>
            </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
