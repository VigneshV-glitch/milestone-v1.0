import { supabase, isSupabaseConfigured } from '../supabase/client';
import { Vehicle } from '../types';
import { activityService } from './activity.service';

const mapRowToVehicle = (row: any): Vehicle => ({
  id: row.id,
  modelName: row.model_name || '',
  type: row.type || 'Truck',
  plateNumber: row.plate_number || '',
  assignedDriver: row.assigned_driver || 'Unassigned',
  fuelLevel: row.fuel_level ?? 100,
  fuelType: row.fuel_type || 'Diesel',
  status: row.status || 'Available',
  odometer: row.odometer || 0,
  location: row.location || 'Depot',
  activeTripId: row.active_trip_id || 'None',
  efficiencyMpg: row.efficiency_mpg || 8.5,
  nextServiceDate: row.next_service_date || '',
  year: row.year || 2024,
  payloadCapacity: row.payload_capacity || '20,000 lbs',
  vin: row.vin || '',
});

const mapVehicleToRow = (v: Vehicle) => ({
  id: v.id,
  model_name: v.modelName,
  type: v.type,
  plate_number: v.plateNumber,
  assigned_driver: v.assignedDriver,
  fuel_level: v.fuelLevel,
  fuel_type: v.fuelType,
  status: v.status,
  odometer: v.odometer,
  location: v.location,
  active_trip_id: v.activeTripId,
  efficiency_mpg: v.efficiencyMpg,
  next_service_date: v.nextServiceDate || null,
  year: v.year,
  payload_capacity: v.payloadCapacity,
  vin: v.vin,
  updated_at: new Date().toISOString(),
});

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    if (!isSupabaseConfigured) {
      return JSON.parse(localStorage.getItem('tms_vehicles') || '[]');
    }

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.warn('Supabase fetch notice (vehicles):', error.message || error);
        return JSON.parse(localStorage.getItem('tms_vehicles') || '[]');
      }

      const vehicles = data ? data.map(mapRowToVehicle) : [];
      localStorage.setItem('tms_vehicles', JSON.stringify(vehicles));
      return vehicles;
    } catch (err: any) {
      console.warn('Supabase getVehicles fallback:', err?.message || err);
      return JSON.parse(localStorage.getItem('tms_vehicles') || '[]');
    }
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    if (!isSupabaseConfigured) {
      const vehicles: Vehicle[] = JSON.parse(localStorage.getItem('tms_vehicles') || '[]');
      return vehicles.find((v) => v.id === id) || null;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapRowToVehicle(data);
  },

  async createVehicle(vehicle: Vehicle): Promise<{ success: boolean; error?: string }> {
    const row = mapVehicleToRow(vehicle);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('vehicles').insert(row);
      if (error) return { success: false, error: error.message };
    }

    const localVehicles: Vehicle[] = JSON.parse(localStorage.getItem('tms_vehicles') || '[]');
    localStorage.setItem('tms_vehicles', JSON.stringify([vehicle, ...localVehicles]));
    await activityService.logActivity(`Vehicle created: ${vehicle.id} (${vehicle.modelName})`, 'info');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },

  async updateVehicle(vehicle: Vehicle): Promise<{ success: boolean; error?: string }> {
    const row = mapVehicleToRow(vehicle);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('vehicles').update(row).eq('id', vehicle.id);
      if (error) return { success: false, error: error.message };
    }

    const localVehicles: Vehicle[] = JSON.parse(localStorage.getItem('tms_vehicles') || '[]');
    const updated = localVehicles.map((v) => (v.id === vehicle.id ? vehicle : v));
    localStorage.setItem('tms_vehicles', JSON.stringify(updated));
    await activityService.logActivity(`Vehicle updated: ${vehicle.id}`, 'info');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },

  async deleteVehicle(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    }

    const localVehicles: Vehicle[] = JSON.parse(localStorage.getItem('tms_vehicles') || '[]');
    const updated = localVehicles.filter((v) => v.id !== id);
    localStorage.setItem('tms_vehicles', JSON.stringify(updated));
    await activityService.logActivity(`Vehicle deleted: ${id}`, 'warning');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  }
};
