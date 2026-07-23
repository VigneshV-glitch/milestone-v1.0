import React from "react";
import { SearchResult, EntityType } from "./types";
import { Navigation, Truck, User, Box, MapPin, AlertCircle } from "lucide-react";

interface SearchResultsProps {
  results: SearchResult[];
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
}

const EntityIcons: Record<EntityType, any> = {
  Trip: Navigation,
  Vehicle: Truck,
  Driver: User,
  Cargo: Box,
  Stop: MapPin,
  Exception: AlertCircle
};

const SearchResults: React.FC<SearchResultsProps> = ({ results, selectedIndex, onSelect }) => {
  // Group results by type
  const groups = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<EntityType, SearchResult[]>);

  // We need to keep track of the absolute index across groups for selection
  let absoluteIndex = 0;

  return (
    <div className="space-y-4 py-2">
      {(Object.entries(groups) as [EntityType, SearchResult[]][]).map(([type, items]) => {
        const Icon = EntityIcons[type];
        
        return (
          <div key={type}>
            <div className="flex items-center gap-2 px-3 mb-1">
              <Icon className="w-3.5 h-3.5 text-gray-400" />
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{type}s</h3>
            </div>
            
            <div className="space-y-0.5">
              {items.map((result) => {
                const currentIndex = absoluteIndex++;
                const isSelected = currentIndex === selectedIndex;
                
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    id={`search-result-${currentIndex}`}
                    onClick={() => onSelect(result)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                      isSelected 
                        ? "bg-primary-500/10 dark:bg-primary-500/20 border-l-2 border-primary-500" 
                        : "hover:bg-gray-50 dark:hover:bg-[#252525] border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isSelected ? "text-primary-700 dark:text-primary-400" : "text-gray-900 dark:text-gray-100"}`}>
                          {result.title}
                        </span>
                        {result.status && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${result.statusColor || "bg-gray-100 text-gray-600 dark:bg-[#333] dark:text-gray-400"}`}>
                            {result.status}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {result.subtitle}
                      </div>
                    </div>
                    
                    {/* Preview Info */}
                    <div className="hidden sm:flex flex-col items-end text-[10px] text-gray-400 dark:text-gray-500">
                      {result.metadata.eta && (
                        <span>ETA: {result.metadata.eta}</span>
                      )}
                      {result.metadata.driverName && (
                        <span>{result.metadata.driverName}</span>
                      )}
                      {result.metadata.severity && (
                        <span className={result.metadata.severity === "Critical" ? "text-red-500 font-bold" : ""}>
                          {result.metadata.severity}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
