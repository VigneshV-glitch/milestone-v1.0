import { supabase, isSupabaseConfigured } from '../supabase/client';
import { Driver } from '../types';
import { activityService } from './activity.service';

const mapRowToDriver = (row: any): Driver => ({
  id: row.id,
  name: row.name || '',
  phone: row.phone || '',
  email: row.email || '',
  licenseClass: row.license_class || 'Class A CDL',
  licenseNumber: row.license_number || '',
  status: row.status || 'Available',
  safetyScore: row.safety_score ?? 100,
  hoursWorkedThisWeek: row.hours_worked_this_week ?? 0,
  experienceYears: row.experience_years ?? 0,
  location: row.location || 'Depot',
  assignedVehicle: row.assigned_vehicle || 'Unassigned',
  hireDate: row.hire_date || '',
  emergencyContact: row.emergency_contact || '',
  activeTripId: row.active_trip_id || 'None',
  lastActivity: row.last_activity || 'Active',
});

const mapDriverToRow = (d: Driver) => ({
  id: d.id,
  name: d.name,
  phone: d.phone,
  email: d.email,
  license_class: d.licenseClass,
  license_number: d.licenseNumber,
  status: d.status,
  safety_score: d.safetyScore,
  hours_worked_this_week: d.hoursWorkedThisWeek,
  experience_years: d.experienceYears,
  location: d.location,
  assigned_vehicle: d.assignedVehicle,
  hire_date: d.hireDate || null,
  emergency_contact: d.emergencyContact,
  active_trip_id: d.activeTripId,
  last_activity: d.lastActivity,
  updated_at: new Date().toISOString(),
});

export const driverService = {
  async getDrivers(): Promise<Driver[]> {
    if (!isSupabaseConfigured) {
      return JSON.parse(localStorage.getItem('tms_drivers') || '[]');
    }

    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data || data.length === 0) {
        return JSON.parse(localStorage.getItem('tms_drivers') || '[]');
      }

      const drivers = data.map(mapRowToDriver);
      localStorage.setItem('tms_drivers', JSON.stringify(drivers));
      return drivers;
    } catch {
      return JSON.parse(localStorage.getItem('tms_drivers') || '[]');
    }
  },

  async getDriverById(id: string): Promise<Driver | null> {
    if (!isSupabaseConfigured) {
      const drivers: Driver[] = JSON.parse(localStorage.getItem('tms_drivers') || '[]');
      return drivers.find((d) => d.id === id) || null;
    }

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapRowToDriver(data);
  },

  async createDriver(driver: Driver): Promise<{ success: boolean; error?: string }> {
    const row = mapDriverToRow(driver);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('drivers').insert(row);
      if (error) return { success: false, error: error.message };
    }

    const localDrivers: Driver[] = JSON.parse(localStorage.getItem('tms_drivers') || '[]');
    localStorage.setItem('tms_drivers', JSON.stringify([driver, ...localDrivers]));
    await activityService.logActivity(`Driver onboarding completed: ${driver.name} (${driver.id})`, 'info');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },

  async updateDriver(driver: Driver): Promise<{ success: boolean; error?: string }> {
    const row = mapDriverToRow(driver);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('drivers').update(row).eq('id', driver.id);
      if (error) return { success: false, error: error.message };
    }

    const localDrivers: Driver[] = JSON.parse(localStorage.getItem('tms_drivers') || '[]');
    const updated = localDrivers.map((d) => (d.id === driver.id ? driver : d));
    localStorage.setItem('tms_drivers', JSON.stringify(updated));
    await activityService.logActivity(`Driver profile updated: ${driver.id}`, 'info');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },

  async deleteDriver(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('drivers').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    }

    const localDrivers: Driver[] = JSON.parse(localStorage.getItem('tms_drivers') || '[]');
    const updated = localDrivers.filter((d) => d.id !== id);
    localStorage.setItem('tms_drivers', JSON.stringify(updated));
    await activityService.logActivity(`Driver record removed: ${id}`, 'warning');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  }
};
