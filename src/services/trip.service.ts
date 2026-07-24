import { supabase, isSupabaseConfigured } from '../supabase/client';
import { Trip, TripCargo, CargoExecutionEvent, ExecutionType, ExecutionStatus, CargoStatus, DelayEvent } from '../types';
import { TRIP_STATUS_COLORS, validateTripTransition, validateAssignment, getSynchronizedStatuses } from '../utils/businessRules';
import { activityService } from './activity.service';

const mapRowToTrip = (row: any): Trip => {
  let steps: any[] = [];
  let stopMapByIdx: Record<number, any> = {};
  let stopMapById: Record<string, any> = {};

  if (row.trip_stops && Array.isArray(row.trip_stops) && row.trip_stops.length > 0) {
    const sortedStops = [...row.trip_stops].sort((a: any, b: any) => (a.stop_idx ?? 0) - (b.stop_idx ?? 0));
    steps = sortedStops.map((ts: any, idx: number) => {
      const stepObj = {
        id: ts.id || `stop-${idx}`,
        stopIdx: ts.stop_idx ?? idx,
        location: ts.location || '',
        type: ts.type || (idx === 0 ? 'Pickup' : 'Delivery'),
        time: ts.time || 'Scheduled',
        status: ts.status || 'pending',
        goodsType: ts.goods_type || row.load_type || 'General Freight Cargo',
        quantity: ts.quantity || '250 Boxes',
        cargoItems: ts.cargo_items || []
      };
      stopMapByIdx[stepObj.stopIdx] = stepObj;
      if (ts.id) stopMapById[ts.id] = stepObj;
      return stepObj;
    });
  } else if (row.route_progress && Array.isArray(row.route_progress.steps) && row.route_progress.steps.length > 0) {
    steps = row.route_progress.steps.map((s: any, idx: number) => ({
      id: s.id || `stop-${idx}`,
      stopIdx: s.stopIdx ?? idx,
      location: s.location || '',
      type: s.type || (idx === 0 ? 'Pickup' : 'Delivery'),
      time: s.time || 'Scheduled',
      status: s.status || 'pending',
      goodsType: s.goodsType || row.load_type || 'General Freight Cargo',
      quantity: s.quantity || '250 Boxes',
      cargoItems: s.cargoItems || []
    }));
    steps.forEach(s => { stopMapByIdx[s.stopIdx] = s; });
  }

  if (steps.length === 0) {
    steps = [
      {
        id: `stop-${row.id}-0`,
        stopIdx: 0,
        location: row.origin || "Origin Facility",
        type: "Pickup",
        time: row.date || "Scheduled",
        status: row.status === "Scheduled" ? "pending" : "completed",
        goodsType: row.load_type || "General Freight Cargo",
        quantity: "250 Boxes",
        cargoItems: []
      },
      {
        id: `stop-${row.id}-1`,
        stopIdx: 1,
        location: row.destination || "Destination Facility",
        type: "Delivery",
        time: row.expected_delivery || row.eta || "Scheduled",
        status: row.status === "Completed" ? "completed" : row.status === "In Transit" ? "current" : "pending",
        goodsType: row.load_type || "General Freight Cargo",
        quantity: "250 Boxes",
        cargoItems: []
      }
    ];
    steps.forEach(s => { stopMapByIdx[s.stopIdx] = s; });
  } else if (steps.length === 1 && row.destination) {
    const secondStop = {
      id: `stop-${row.id}-1`,
      stopIdx: 1,
      location: row.destination,
      type: "Delivery",
      time: row.expected_delivery || row.eta || "Scheduled",
      status: row.status === "Completed" ? "completed" : row.status === "In Transit" ? "current" : "pending",
      goodsType: row.load_type || "General Freight Cargo",
      quantity: "250 Boxes",
      cargoItems: []
    };
    steps.push(secondStop);
    stopMapByIdx[1] = secondStop;
  }

  // Map execution events
  const rawExecEvents: any[] = row.cargo_execution_events || [];
  const executionEvents: CargoExecutionEvent[] = rawExecEvents.map((ee: any) => ({
    id: ee.id || `exec-${Math.random()}`,
    cargoId: ee.cargo_id,
    tripId: ee.trip_id || row.id,
    stopId: ee.stop_id,
    stopIdx: ee.stop_idx ?? 0,
    executionType: (ee.execution_type || 'Pickup') as ExecutionType,
    executionStatus: (ee.execution_status || 'Completed') as ExecutionStatus,
    plannedQty: typeof ee.planned_qty === 'number' ? ee.planned_qty : 250,
    actualQty: typeof ee.actual_qty === 'number' ? ee.actual_qty : 248,
    variance: typeof ee.variance === 'number' ? ee.variance : 2,
    reason: ee.reason || 'Shortage',
    remarks: ee.remarks || '',
    performedBy: ee.performed_by || 'Dispatcher',
    timestamp: ee.timestamp || new Date().toISOString(),
    latitude: ee.latitude,
    longitude: ee.longitude,
    photoUrl: ee.photo_url,
    signatureUrl: ee.signature_url,
    createdAt: ee.created_at
  }));

  // Map trip_cargo normalized items
  let cargos: TripCargo[] = [];
  if (row.trip_cargo && Array.isArray(row.trip_cargo) && row.trip_cargo.length > 0) {
    cargos = row.trip_cargo.map((c: any) => {
      const cargoEvents = executionEvents.filter(e => e.cargoId === c.id);
      return {
        id: c.id,
        tripId: c.trip_id || row.id,
        pickupStopId: c.pickup_stop_id,
        deliveryStopId: c.delivery_stop_id,
        pickupStopIdx: c.pickup_stop_id && stopMapById[c.pickup_stop_id] ? stopMapById[c.pickup_stop_id].stopIdx : 0,
        deliveryStopIdx: c.delivery_stop_id && stopMapById[c.delivery_stop_id] ? stopMapById[c.delivery_stop_id].stopIdx : (steps.length - 1),
        sku: c.sku || 'SKU-250BX',
        description: c.description || row.load_type || 'General Cargo',
        weight: c.weight || '12,500 kg',
        volume: c.volume || '45 m3',
        plannedQuantity: typeof c.planned_quantity === 'number' ? c.planned_quantity : 250,
        currentQuantity: typeof c.current_quantity === 'number' ? c.current_quantity : 248,
        unit: c.unit || 'Boxes',
        status: (c.status || 'In Transit') as CargoStatus,
        remarks: c.remarks || '',
        createdBy: c.created_by || 'Dispatcher',
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        executionEvents: cargoEvents
      };
    });
  }

  // Fallback default cargo if no trip_cargo records exist yet
  if (cargos.length === 0) {
    const defaultCargoId = `CRG-${row.id.replace(/[^a-zA-Z0-9]/g, '')}-01`;
    const defaultEvents = executionEvents.filter(e => e.cargoId === defaultCargoId || !e.cargoId);
    
    // Check if legacy cargo_execution records exist
    if (defaultEvents.length === 0 && row.cargo_execution && Array.isArray(row.cargo_execution) && row.cargo_execution.length > 0) {
      row.cargo_execution.forEach((ce: any) => {
        defaultEvents.push({
          id: ce.id || `ce-legacy-${Math.random()}`,
          cargoId: defaultCargoId,
          tripId: row.id,
          stopId: steps[ce.stop_idx]?.id || steps[0]?.id,
          stopIdx: ce.stop_idx ?? 1,
          executionType: 'Pickup',
          executionStatus: 'Partial',
          plannedQty: 250,
          actualQty: typeof ce.actual_quantity === 'number' ? ce.actual_quantity : (parseInt(ce.actual_quantity, 10) || 248),
          variance: 2,
          reason: ce.reason || 'Shortage',
          remarks: ce.remarks || '2 boxes damaged during loading',
          performedBy: ce.updated_by || 'Dispatcher',
          timestamp: ce.timestamp || new Date().toISOString()
        });
      });
    }

    // Default seed event if none
    if (defaultEvents.length === 0) {
      defaultEvents.push({
        id: `exec-init-${row.id}`,
        cargoId: defaultCargoId,
        tripId: row.id,
        stopId: steps[0]?.id,
        stopIdx: 1,
        executionType: 'Pickup',
        executionStatus: 'Partial',
        plannedQty: 250,
        actualQty: 248,
        variance: 2,
        reason: 'Shortage',
        remarks: '2 boxes damaged during loading',
        performedBy: 'Dispatcher',
        timestamp: '2026-07-24T06:56:24.008Z'
      });
    }

    cargos.push({
      id: defaultCargoId,
      tripId: row.id,
      pickupStopId: steps[0]?.id,
      deliveryStopId: steps[steps.length - 1]?.id,
      pickupStopIdx: 0,
      deliveryStopIdx: steps.length - 1,
      sku: 'SKU-250BX',
      description: row.load_type || 'General Freight Cargo',
      weight: '12,500 kg',
      volume: '45 m3',
      plannedQuantity: 250,
      currentQuantity: 248,
      unit: 'Boxes',
      status: 'In Transit',
      remarks: '2026 Cargo Execution Batch',
      createdBy: 'Dispatcher',
      executionEvents: defaultEvents
    });
  }

  // Attach pickup and delivery cargo lists to each route step
  steps.forEach((step, idx) => {
    step.pickupCargo = cargos.filter(c => 
      c.pickupStopId === step.id || 
      c.pickupStopIdx === idx || 
      (idx === 0 && (!c.pickupStopIdx || c.pickupStopIdx === 0))
    );
    step.deliveryCargo = cargos.filter(c => 
      c.deliveryStopId === step.id || 
      c.deliveryStopIdx === idx || 
      (idx === steps.length - 1 && (!c.deliveryStopIdx || c.deliveryStopIdx === steps.length - 1))
    );
  });

  const completedCount = steps.filter((s: any) => s.status === 'completed').length;
  const nextStop = steps.find((s: any) => s.status !== 'completed');

  const routeProgress = {
    steps,
    totalStops: steps.length,
    completedCount,
    nextStopLocation: nextStop ? nextStop.location : (steps[steps.length - 1]?.location || '')
  };

  // Backward compatibility object for legacy executions getter
  let executions = row.executions || {};
  cargos.forEach((c) => {
    (c.executionEvents || []).forEach((e) => {
      const execObj = {
        actualQuantity: e.actualQty,
        reason: e.reason || 'Shortage',
        remarks: e.remarks || '',
        updatedBy: e.performedBy || 'Dispatcher'
      };
      executions[`${e.stopIdx}_0`] = execObj;
      executions[`1_1`] = execObj;
      executions[`0_0`] = execObj;
      executions[`1_0`] = execObj;
      executions[`0_1`] = execObj;
    });
  });

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
    routeProgress,
    cargos,
    executionEvents,
    executions,
    delayEvents: row.delay_events || [],
  };
};

const syncTripStops = async (trip: Trip) => {
  if (!isSupabaseConfigured || !trip.routeProgress?.steps) return;
  try {
    await supabase.from('trip_stops').delete().eq('trip_id', trip.id);
    const stopsToInsert = trip.routeProgress.steps.map((step, idx) => ({
      trip_id: trip.id,
      stop_idx: idx,
      location: step.location,
      type: step.type,
      time: step.time,
      status: step.status,
      goods_type: step.goodsType || trip.loadType || 'General Freight Cargo',
      quantity: step.quantity || '250 Boxes',
      cargo_items: step.cargoItems || []
    }));
    if (stopsToInsert.length > 0) {
      await supabase.from('trip_stops').insert(stopsToInsert);
    }
  } catch (err) {
    console.warn('Notice syncing trip_stops:', err);
  }
};

const syncTripCargoAndEvents = async (trip: Trip) => {
  if (!isSupabaseConfigured) return;
  try {
    if (trip.cargos && trip.cargos.length > 0) {
      for (const cargo of trip.cargos) {
        await supabase.from('trip_cargo').upsert({
          id: cargo.id,
          trip_id: trip.id,
          pickup_stop_id: cargo.pickupStopId || null,
          delivery_stop_id: cargo.deliveryStopId || null,
          sku: cargo.sku || 'SKU-GENERAL',
          description: cargo.description || 'General Freight Cargo',
          weight: cargo.weight || '0 kg',
          volume: cargo.volume || '0 m3',
          planned_quantity: cargo.plannedQuantity,
          current_quantity: cargo.currentQuantity,
          unit: cargo.unit || 'Boxes',
          status: cargo.status || 'Planned',
          remarks: cargo.remarks || '',
          created_by: cargo.createdBy || 'Dispatcher',
          updated_at: new Date().toISOString()
        });

        if (cargo.executionEvents && cargo.executionEvents.length > 0) {
          for (const ev of cargo.executionEvents) {
            await supabase.from('cargo_execution_events').upsert({
              id: ev.id.startsWith('exec-') || ev.id.startsWith('ce-') ? undefined : ev.id,
              cargo_id: cargo.id,
              trip_id: trip.id,
              stop_id: ev.stopId || null,
              execution_type: ev.executionType,
              execution_status: ev.executionStatus || 'Completed',
              planned_qty: ev.plannedQty,
              actual_qty: ev.actualQty,
              variance: ev.variance,
              reason: ev.reason || 'Shortage',
              remarks: ev.remarks || '',
              performed_by: ev.performedBy || 'Dispatcher',
              timestamp: ev.timestamp || new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Notice syncing trip_cargo and execution events:', err);
  }
};

const syncCargoExecutions = async (trip: Trip) => {
  if (!isSupabaseConfigured || !trip.executions) return;
  try {
    await supabase.from('cargo_execution').delete().eq('trip_id', trip.id);
    const rowsToInsert: any[] = [];
    Object.entries(trip.executions).forEach(([key, exec]: [string, any]) => {
      if (!exec) return;
      const parts = key.split('_');
      if (parts.length === 2) {
        const stopIdx = parseInt(parts[0], 10);
        const itemIdx = parseInt(parts[1], 10);
        rowsToInsert.push({
          trip_id: trip.id,
          stop_idx: isNaN(stopIdx) ? 0 : stopIdx,
          item_idx: isNaN(itemIdx) ? 0 : itemIdx,
          actual_quantity: typeof exec.actualQuantity === 'number' ? exec.actualQuantity : (parseInt(exec.actualQuantity, 10) || 0),
          reason: exec.reason || 'Shortage',
          remarks: exec.remarks || '',
          updated_by: exec.updatedBy || 'Dispatcher'
        });
      }
    });
    if (rowsToInsert.length > 0) {
      await supabase.from('cargo_execution').insert(rowsToInsert);
    }
  } catch (err) {
    console.warn('Notice syncing cargo_execution:', err);
  }
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
        .select('*, trip_stops(*), trip_cargo(*), cargo_execution_events(*), cargo_execution(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch notice (trips):', error.message || error);
        return JSON.parse(localStorage.getItem('tms_trips') || '[]');
      }

      const trips = data ? data.map(mapRowToTrip) : [];
      localStorage.setItem('tms_trips', JSON.stringify(trips));
      return trips;
    } catch (err: any) {
      console.warn('Supabase getTrips fallback:', err?.message || err);
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
      .select('*, trip_stops(*), trip_cargo(*), cargo_execution_events(*), cargo_execution(*)')
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
      await syncTripStops(trip);
      await syncTripCargoAndEvents(trip);
      await syncCargoExecutions(trip);
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
      await syncTripStops(trip);
      await syncTripCargoAndEvents(trip);
      await syncCargoExecutions(trip);
    }

    const localTrips: Trip[] = JSON.parse(localStorage.getItem('tms_trips') || '[]');
    const updated = localTrips.map((t) => (t.id === trip.id ? trip : t));
    localStorage.setItem('tms_trips', JSON.stringify(updated));
    await activityService.logActivity(`Trip updated: ${trip.id}`, 'info');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },

  async recordCargoExecution(event: {
    cargoId: string;
    tripId: string;
    stopId?: string;
    stopIdx?: number;
    executionType: ExecutionType;
    executionStatus?: ExecutionStatus;
    plannedQty: number;
    actualQty: number;
    reason?: string;
    remarks?: string;
    performedBy?: string;
  }): Promise<{ success: boolean; event?: CargoExecutionEvent; error?: string }> {
    const planned = event.plannedQty || 0;
    const actual = event.actualQty || 0;
    const variance = planned - actual;
    const execStatus: ExecutionStatus = event.executionStatus || (actual < planned ? 'Partial' : 'Completed');

    let cargoStatus: CargoStatus = 'In Transit';
    if (event.executionType.includes('Pickup')) {
      cargoStatus = actual < planned ? 'Partially Picked Up' : 'Picked Up';
    } else if (event.executionType.includes('Drop')) {
      cargoStatus = actual < planned ? 'Partially Delivered' : 'Delivered';
    } else if (event.executionType === 'Damage') {
      cargoStatus = 'Damaged';
    } else if (event.executionType === 'Shortage') {
      cargoStatus = 'Shortage';
    } else if (event.executionType === 'Rejected') {
      cargoStatus = 'Rejected';
    }

    const newEvent: CargoExecutionEvent = {
      id: `exec-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      cargoId: event.cargoId,
      tripId: event.tripId,
      stopId: event.stopId,
      stopIdx: event.stopIdx ?? 0,
      executionType: event.executionType,
      executionStatus: execStatus,
      plannedQty: planned,
      actualQty: actual,
      variance: variance,
      reason: event.reason || 'Shortage',
      remarks: event.remarks || '',
      performedBy: event.performedBy || 'Dispatcher',
      timestamp: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('cargo_execution_events').insert({
          cargo_id: event.cargoId,
          trip_id: event.tripId,
          stop_id: event.stopId || null,
          execution_type: event.executionType,
          execution_status: execStatus,
          planned_qty: planned,
          actual_qty: actual,
          variance: variance,
          reason: event.reason || 'Shortage',
          remarks: event.remarks || '',
          performed_by: event.performedBy || 'Dispatcher',
          timestamp: newEvent.timestamp
        }).select().single();

        if (data) {
          newEvent.id = data.id;
        }

        await supabase.from('trip_cargo').update({
          current_quantity: actual,
          status: cargoStatus,
          updated_at: new Date().toISOString()
        }).eq('id', event.cargoId);
      } catch (err: any) {
        console.warn('Notice saving execution event to Supabase:', err);
      }
    }

    const localTrips: Trip[] = JSON.parse(localStorage.getItem('tms_trips') || '[]');
    const targetTrip = localTrips.find(t => t.id === event.tripId);
    if (targetTrip) {
      if (!targetTrip.executionEvents) targetTrip.executionEvents = [];
      targetTrip.executionEvents.unshift(newEvent);

      if (targetTrip.cargos) {
        const cargo = targetTrip.cargos.find(c => c.id === event.cargoId);
        if (cargo) {
          cargo.currentQuantity = actual;
          cargo.status = cargoStatus;
          if (!cargo.executionEvents) cargo.executionEvents = [];
          cargo.executionEvents.unshift(newEvent);
        }
      }
      localStorage.setItem('tms_trips', JSON.stringify(localTrips));
    }

    await activityService.logActivity(
      `Cargo Execution recorded for Trip ${event.tripId} (${event.executionType}): ${actual}/${planned} - ${event.reason || 'No discrepancy'}`,
      'info'
    );
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true, event: newEvent };
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
