import { SearchHistoryItem } from "./types";

const HISTORY_KEY = "tms_search_history";
const MAX_HISTORY = 10;

export const searchHistory = {
  get: (): SearchHistoryItem[] => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load search history", e);
      return [];
    }
  },

  add: (term: string) => {
    if (!term || term.trim().length < 2) return;
    
    const history = searchHistory.get();
    const filtered = history.filter(h => h.term.toLowerCase() !== term.toLowerCase());
    
    const newItem: SearchHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      term: term.trim(),
      timestamp: Date.now()
    };
    
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  },

  remove: (id: string) => {
    const history = searchHistory.get();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  },

  clear: () => {
    localStorage.removeItem(HISTORY_KEY);
  }
};
