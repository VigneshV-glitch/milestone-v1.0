import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import SearchOverlay from "./SearchOverlay";

interface UniversalSearchProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({ activeTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSearch = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeSearch]);

  // Listen for a custom event from the header search bar if needed
  useEffect(() => {
    const handleTrigger = () => toggleSearch();
    window.addEventListener('tms-trigger-universal-search', handleTrigger);
    return () => window.removeEventListener('tms-trigger-universal-search', handleTrigger);
  }, [toggleSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <SearchOverlay 
          isOpen={isOpen} 
          onClose={closeSearch} 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
        />
      )}
    </AnimatePresence>
  );
};

export default UniversalSearch;
