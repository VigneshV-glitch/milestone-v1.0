import { supabase, isSupabaseConfigured } from '../supabase/client';
import { Trip, DelayEvent } from '../types';
import { TRIP_STATUS_COLORS, validateTripTransition, validateAssignment, getSynchronizedStatuses } from '../utils/businessRules';
import { activityService } from './activity.service';

const mapRowToTrip = (row: any): Trip => {
  return {
    id: row.id,
    date: row.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    driver: row.driver || 'Unassigned',
    origin: row.origin || '',
    destination: row.destination || '',
    status: row.status || 'Draft',
    statusColor: row.status_color || TRIP_STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-800',
    delayReason: row.delay_reason || undefined,
    amount: row.amount || '$0.00',
    vehicleNo: row.vehicle_no || 'Unassigned',
    driverContact: row.driver_contact || '--',
    loadType: row.load_type || 'General Freight',
    priority: row.priority || 'Medium',
    currentLocation: row.current_location || 'Depot',
    eta: row.eta ? new Date(row.eta).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) : '--',
    podStatus: row.pod_status || 'Pending',
    lastUpdated: row.last_updated || 'Just now',
    distance: row.distance || '0 km',
    totalStops: row.total_stops || 1,
    fuelUsed: row.fuel_used || '0 L',
    expectedDelivery: row.expected_delivery || '',
    createdTime: row.created_time || new Date().toLocaleString(),
    assignedTime: row.assigned_time || '--',
    loadedTime: row.loaded_time || '--',
    dispatchedTime: row.dispatched_time || '--',
    inTransitTime: row.in_transit_time || '--',
    deliveredTime: row.delivered_time || '--',
    routeProgress: row.route_progress || { steps: [], totalStops: 0, completedCount: 0, nextStopLocation: '' },
    executions: row.executions || {},
    delayEvents: row.delay_events || [],
  };
};

const mapTripToRow = (trip: Trip) => {
  return {
    id: trip.id,
    date: trip.date && !isNaN(Date.parse(trip.date)) ? new Date(trip.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    driver: trip.driver,
    origin: trip.origin,
    destination: trip.destination,
    status: trip.status,
    status_color: trip.statusColor || TRIP_STATUS_COLORS[trip.status] || 'bg-gray-100 text-gray-800',
    delay_reason: trip.delayReason || null,
    amount: trip.amount,
    vehicle_no: trip.vehicleNo,
    driver_contact: trip.driverContact,
    load_type: trip.loadType,
    priority: trip.priority,
    current_location: trip.currentLocation,
    pod_status: trip.podStatus,
    last_updated: 'Just now',
    distance: trip.distance,
    total_stops: trip.totalStops,
    fuel_used: trip.fuelUsed,
    expected_delivery: trip.expectedDelivery && !isNaN(Date.parse(trip.expectedDelivery)) ? new Date(trip.expectedDelivery).toISOString().split('T')[0] : null,
    route_progress: trip.routeProgress,
    executions: trip.executions || {},
    updated_at: new Date().toISOString(),
  };
};

export const tripService = {
  async getTrips(): Promise<Trip[]> {
    if (!isSupabaseConfigured) {
      return JSON.parse(localStorage.getItem('tms_trips') || '[]');
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return JSON.parse(localStorage.getItem('tms_trips') || '[]');
      }

      const trips = data.map(mapRowToTrip);
      localStorage.setItem('tms_trips', JSON.stringify(trips));
      return trips;
    } catch {
      return JSON.parse(localStorage.getItem('tms_trips') || '[]');
    }
  },

  async getTripById(id: string): Promise<Trip | null> {
    if (!isSupabaseConfigured) {
      const trips: Trip[] = JSON.parse(localStorage.getItem('tms_trips') || '[]');
      return trips.find((t) => t.id === id) || null;
    }

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapRowToTrip(data);
  },

  async createTrip(trip: Trip): Promise<{ success: boolean; error?: string }> {
    const row = mapTripToRow(trip);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('trips').insert(row);
      if (error) {
        console.error('Error creating trip:', error);
        return { success: false, error: error.message };
      }
    }

    // Local fallback/sync
    const localTrips: Trip[] = JSON.parse(localStorage.getItem('tms_trips') || '[]');
    localStorage.setItem('tms_trips', JSON.stringify([trip, ...localTrips]));
    await activityService.logActivity(`Trip created: ${trip.id} (${trip.origin} → ${trip.destination})`, 'info');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },

  async updateTrip(trip: Trip): Promise<{ success: boolean; error?: string }> {
    const row = mapTripToRow(trip);

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('trips')
        .update(row)
        .eq('id', trip.id);

      if (error) {
        console.error('Error updating trip:', error);
        return { success: false, error: error.message };
      }
    }

    const localTrips: Trip[] = JSON.parse(localStorage.getItem('tms_trips') || '[]');
    const updated = localTrips.map((t) => (t.id === trip.id ? trip : t));
    localStorage.setItem('tms_trips', JSON.stringify(updated));
    await activityService.logActivity(`Trip updated: ${trip.id}`, 'info');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },

  async deleteTrip(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
    }

    const localTrips: Trip[] = JSON.parse(localStorage.getItem('tms_trips') || '[]');
    const updated = localTrips.filter((t) => t.id !== id);
    localStorage.setItem('tms_trips', JSON.stringify(updated));
    await activityService.logActivity(`Trip deleted: ${id}`, 'warning');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },

  async updateTripStatus(tripId: string, nextStatus: string): Promise<{ success: boolean; error?: string }> {
    return this.bulkUpdateTripStatus([tripId], nextStatus);
  },

  async bulkUpdateTripStatus(tripIds: string[], nextStatus: string): Promise<{ success: boolean; error?: string }> {
    let currentTrips: Trip[] = JSON.parse(localStorage.getItem('tms_trips') || '[]');
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('trips').select('*');
      if (data) currentTrips = data.map(mapRowToTrip);
    }

    let anySuccess = false;
    let lastError = '';

    for (const tripId of tripIds) {
      const trip = currentTrips.find((t) => t.id === tripId);
      if (!trip) {
        lastError = 'Trip not found';
        continue;
      }

      const validation = validateTripTransition(trip.status, nextStatus);
      if (!validation.valid) {
        lastError = validation.error || 'Invalid transition';
        continue;
      }

      anySuccess = true;
      let updatedRouteProgress = { ...trip.routeProgress };

      if (nextStatus === 'Completed' || nextStatus === 'Delivered') {
        updatedRouteProgress = {
          ...trip.routeProgress,
          completedCount: trip.routeProgress.steps.length,
          steps: trip.routeProgress.steps.map((step) => ({ ...step, status: 'completed' })),
        };
      } else if (nextStatus === 'In Transit' || nextStatus === 'Dispatched') {
        let foundCurrent = false;
        const updatedSteps = trip.routeProgress.steps.map((step) => {
          if (step.status === 'completed') return step;
          if (!foundCurrent) {
            foundCurrent = true;
            return { ...step, status: 'current' };
          }
          return { ...step, status: 'pending' };
        });

        updatedRouteProgress = {
          ...trip.routeProgress,
          steps: updatedSteps,
          completedCount: updatedSteps.filter((s) => s.status === 'completed').length,
        };
      }

      const updatedTrip: Trip = {
        ...trip,
        status: nextStatus,
        statusColor: TRIP_STATUS_COLORS[nextStatus] || trip.statusColor,
        routeProgress: updatedRouteProgress,
        lastUpdated: 'Just now',
      };

      if (isSupabaseConfigured) {
        await supabase
          .from('trips')
          .update(mapTripToRow(updatedTrip))
          .eq('id', tripId);
      }

      // Synchronize vehicle and driver statuses in database
      const { vehicleStatus, driverStatus } = getSynchronizedStatuses(nextStatus);
      if (isSupabaseConfigured && trip.vehicleNo && trip.vehicleNo !== 'Unassigned') {
        await supabase
          .from('vehicles')
          .update({
            status: vehicleStatus,
            active_trip_id: nextStatus === 'Completed' ? 'None' : tripId,
          })
          .eq('id', trip.vehicleNo);
      }

      if (isSupabaseConfigured && trip.driver && trip.driver !== 'Unassigned') {
        await supabase
          .from('drivers')
          .update({
            status: driverStatus,
            active_trip_id: nextStatus === 'Completed' ? 'None' : tripId,
          })
          .eq('name', trip.driver);
      }
    }

    if (anySuccess) {
      await activityService.logActivity(`Status updated to ${nextStatus} for ${tripIds.length} trip(s)`, 'success');
      window.dispatchEvent(new Event('tms_data_changed'));
      return { success: true };
    }

    return { success: false, error: lastError };
  },

  async assignResources(tripId: string, vehicleId: string, driverName: string): Promise<{ success: boolean; error?: string }> {
    let currentTrips: Trip[] = [];
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('trips').select('*').eq('id', tripId).single();
      if (data) currentTrips = [mapRowToTrip(data)];
    } else {
      currentTrips = JSON.parse(localStorage.getItem('tms_trips') || '[]');
    }

    const trip = currentTrips.find((t) => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const isInitialStatus = ['Draft', 'Planned', 'Scheduled'].includes(trip.status);
    const nextStatus = isInitialStatus ? 'Assigned' : trip.status;

    const updatedTrip: Trip = {
      ...trip,
      vehicleNo: vehicleId,
      driver: driverName,
      status: nextStatus,
      statusColor: isInitialStatus ? TRIP_STATUS_COLORS['Assigned'] : trip.statusColor,
    };

    if (isSupabaseConfigured) {
      await supabase.from('trips').update(mapTripToRow(updatedTrip)).eq('id', tripId);
      await supabase.from('vehicles').update({ status: 'Assigned', active_trip_id: tripId, assigned_driver: driverName }).eq('id', vehicleId);
      await supabase.from('drivers').update({ status: 'Available', active_trip_id: tripId, assigned_vehicle: vehicleId }).eq('name', driverName);
    }

    await activityService.logActivity(`Resources assigned to Trip ${tripId}: Vehicle ${vehicleId} & Driver ${driverName}`, 'info');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  }
};
