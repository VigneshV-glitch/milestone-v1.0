import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Search, History, Zap, Command, X } from "lucide-react";
import { useUniversalSearch } from "./useUniversalSearch";
import { searchHistory } from "./searchHistory";
import SearchResults from "./SearchResults";
import { SearchResult } from "./types";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, activeTab, onTabChange }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useUniversalSearch(debouncedQuery, activeTab);
  const history = searchHistory.get();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const selectedElement = document.getElementById(`search-result-${selectedIndex}`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedIndex]);

  const handleSelect = (result: SearchResult | string) => {
    let finalResult: SearchResult | null = null;
    
    if (typeof result === "string") {
      // Handle quick actions or history terms
      setQuery(result);
      return;
    } else {
      finalResult = result;
    }

    if (finalResult) {
      searchHistory.add(finalResult.title);
      
      // Determine target tab
      let targetTab = "Trips";
      if (finalResult.type === "Vehicle") targetTab = "Vehicles";
      else if (finalResult.type === "Driver") targetTab = "Drivers";
      
      onTabChange(targetTab);
      
      // Delay the event slightly to ensure the target page is mounted and listener is active
      setTimeout(() => {
        const event = new CustomEvent('tms-deep-link', {
          detail: {
            type: finalResult.type,
            id: finalResult.id,
            metadata: finalResult.metadata
          }
        });
        window.dispatchEvent(event);
      }, 100);
      
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const maxIndex = query.length === 0 
      ? history.length - 1 
      : results.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (maxIndex >= 0) {
        setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      if (query.length === 0) {
        if (selectedIndex < history.length && history[selectedIndex]) {
          handleSelect(history[selectedIndex].term);
        }
      } else if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 sm:pt-[10vh] px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 dark:border-[#333] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[70vh]"
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-[#2d2d2d]">
          <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search everything..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <div className="flex items-center gap-1.5 px-1.5 py-1 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#3d3d3d] rounded-md">
            <span className="text-[10px] font-medium text-gray-400">ESC</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {query.length === 0 ? (
            <div className="space-y-6 p-2">
              {history.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <History className="w-3.5 h-3.5 text-gray-400" />
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recent Searches</h3>
                  </div>
                  <div className="space-y-1">
                    {history.map((item, index) => {
                      const isSelected = selectedIndex === index;
                      return (
                        <button
                          key={item.id}
                          id={`search-result-${index}`}
                          onClick={() => setQuery(item.term)}
                          className={`w-full flex items-center px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                            isSelected ? "bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 font-medium" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]"
                          }`}
                        >
                          {item.term}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Create Trip", action: () => onTabChange("Trips") },
                    { label: "Add Vehicle", action: () => onTabChange("Vehicles") },
                    { label: "Add Driver", action: () => onTabChange("Drivers") },
                    { label: "Export Data", action: () => {} },
                  ].map((action) => {
                    return (
                      <button
                        key={action.label}
                        onClick={() => {
                          action.action();
                          onClose();
                        }}
                        className="flex items-center px-3 py-2 bg-gray-50 dark:bg-[#252525] border border-gray-100 dark:border-[#2d2d2d] rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all text-left"
                      >
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : results.length > 0 ? (
            <SearchResults 
              results={results} 
              selectedIndex={selectedIndex} 
              onSelect={handleSelect} 
            />
          ) : query.length >= 2 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-50 dark:bg-[#252525] rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No results found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try searching for something else</p>
            </div>
          ) : null}
        </div>

        <div className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-[#2d2d2d] flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1 py-0.5 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#3d3d3d] rounded leading-none font-sans">↑</kbd>
              <kbd className="px-1 py-0.5 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#3d3d3d] rounded leading-none font-sans">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1 py-0.5 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#3d3d3d] rounded leading-none font-sans">Enter</kbd>
              Select
            </span>
          </div>
          <div className="flex items-center gap-1">
             Search power by <span className="text-primary-600 font-bold">Milestone</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchOverlay;
