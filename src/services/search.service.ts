import { supabase, isSupabaseConfigured } from '../supabase/client';
import { SearchResult } from '../components/search/types';
import { tripService } from './trip.service';
import { vehicleService } from './vehicle.service';
import { driverService } from './driver.service';
import { searchTrips, searchVehicles, searchDrivers, searchCargo, searchStops, searchExceptions } from '../components/search/searchUtils';

export const searchService = {
  async universalSearch(query: string, currentTab: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    if (isSupabaseConfigured) {
      try {
        const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
          supabase.from('trips').select('*').or(`id.ilike.%${query}%,driver.ilike.%${query}%,origin.ilike.%${query}%,destination.ilike.%${query}%`).limit(10),
          supabase.from('vehicles').select('*').or(`id.ilike.%${query}%,model_name.ilike.%${query}%,plate_number.ilike.%${query}%`).limit(10),
          supabase.from('drivers').select('*').or(`id.ilike.%${query}%,name.ilike.%${query}%,phone.ilike.%${query}%`).limit(10),
        ]);

        const dbTrips = tripsRes.data || [];
        const dbVehicles = vehiclesRes.data || [];
        const dbDrivers = driversRes.data || [];

        const tripResults = searchTrips(dbTrips as any, query);
        const vehicleResults = searchVehicles(dbVehicles as any, query);
        const driverResults = searchDrivers(dbDrivers as any, query);

        const allResults = [...tripResults, ...vehicleResults, ...driverResults];

        return allResults
          .map((res) => {
            let score = res.score;
            if (currentTab === 'Trips' && (res.type === 'Trip' || res.type === 'Cargo')) score += 10;
            if (currentTab === 'Vehicles' && res.type === 'Vehicle') score += 10;
            if (currentTab === 'Drivers' && res.type === 'Driver') score += 10;
            return { ...res, score };
          })
          .sort((a, b) => b.score - a.score);
      } catch (err) {
        console.error('Database search error:', err);
      }
    }

    // Fallback search using service memory
    const [trips, vehicles, drivers] = await Promise.all([
      tripService.getTrips(),
      vehicleService.getVehicles(),
      driverService.getDrivers(),
    ]);

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
      ...exceptionResults,
    ];

    return allResults
      .map((res) => {
        let score = res.score;
        if (currentTab === 'Trips' && (res.type === 'Trip' || res.type === 'Cargo' || res.type === 'Stop')) score += 10;
        if (currentTab === 'Vehicles' && res.type === 'Vehicle') score += 10;
        if (currentTab === 'Drivers' && res.type === 'Driver') score += 10;
        return { ...res, score };
      })
      .sort((a, b) => b.score - a.score);
  },
};
