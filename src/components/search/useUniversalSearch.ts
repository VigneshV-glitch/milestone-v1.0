import { useState, useEffect, useMemo } from "react";
import { useTMSData } from "../../utils/useTMSData";
import { SearchResult, EntityType } from "./types";
import { 
  searchTrips, 
  searchVehicles, 
  searchDrivers, 
  searchCargo, 
  searchStops, 
  searchExceptions 
} from "./searchUtils";

export function useUniversalSearch(query: string, currentTab: string) {
  const { trips, vehicles, drivers } = useTMSData();
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];

    const tripResults = searchTrips(trips, query);
    const vehicleResults = searchVehicles(vehicles, query);
    const driverResults = searchDrivers(drivers, query);
    const cargoResults = searchCargo(trips, query);
    const stopResults = searchStops(trips, query);
    const exceptionResults = searchExceptions(trips, query);

    const allResults = [
      ...tripResults,
      ...vehicleResults,
      ...driverResults,
      ...cargoResults,
      ...stopResults,
      ...exceptionResults
    ];

    // Boost results from current tab
    return allResults.map(res => {
      let boostedScore = res.score;
      if (currentTab === "Trips" && (res.type === "Trip" || res.type === "Cargo" || res.type === "Stop")) {
        boostedScore += 10;
      } else if (currentTab === "Vehicles" && res.type === "Vehicle") {
        boostedScore += 10;
      } else if (currentTab === "Drivers" && res.type === "Driver") {
        boostedScore += 10;
      }
      return { ...res, score: boostedScore };
    }).sort((a, b) => b.score - a.score);
  }, [query, trips, vehicles, drivers, currentTab]);

  return searchResults;
}
