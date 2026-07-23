import { useState, useEffect } from "react";
import { useTMSData } from "../../utils/useTMSData";
import { SearchResult } from "./types";
import { searchService } from "../../services/search.service";

export function useUniversalSearch(query: string, currentTab: string) {
  const { trips, vehicles, drivers } = useTMSData();
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    let isMounted = true;
    searchService.universalSearch(query, currentTab).then((res) => {
      if (isMounted) {
        setResults(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [query, currentTab, trips, vehicles, drivers]);

  return results;
}

