import { supabase, isSupabaseConfigured } from '../supabase/client';
import { tripService } from './trip.service';
import { vehicleService } from './vehicle.service';
import { driverService } from './driver.service';

export interface DashboardKPIs {
  totalTrips: number;
  activeTrips: number;
  delayedTrips: number;
  completedTrips: number;
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  availableDrivers: number;
  onTimeDeliveryRate: number;
  totalDistance: string;
}

export const dashboardService = {
  async getKPIs(): Promise<DashboardKPIs> {
    const [trips, vehicles, drivers] = await Promise.all([
      tripService.getTrips(),
      vehicleService.getVehicles(),
      driverService.getDrivers(),
    ]);

    const activeTrips = trips.filter((t) => t.status === 'In Transit' || t.status === 'Dispatched' || t.status === 'Loading').length;
    const delayedTrips = trips.filter((t) => t.status === 'Delayed').length;
    const completedTrips = trips.filter((t) => t.status === 'Completed').length;
    const activeVehicles = vehicles.filter((v) => v.status === 'In Transit' || v.status === 'Assigned' || v.status === 'Loading').length;
    const availableDrivers = drivers.filter((d) => d.status === 'Available').length;

    const totalProcessed = completedTrips + delayedTrips;
    const onTimeDeliveryRate = totalProcessed > 0 ? Math.round((completedTrips / totalProcessed) * 100) : 100;

    let totalDistKm = 0;
    trips.forEach((t) => {
      const parsed = parseFloat((t.distance || '0').replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed)) totalDistKm += parsed;
    });

    return {
      totalTrips: trips.length,
      activeTrips,
      delayedTrips,
      completedTrips,
      totalVehicles: vehicles.length,
      activeVehicles,
      totalDrivers: drivers.length,
      availableDrivers,
      onTimeDeliveryRate,
      totalDistance: `${totalDistKm.toLocaleString()} km`,
    };
  },
};
