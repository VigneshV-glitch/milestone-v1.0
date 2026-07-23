/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useCallback } from 'react';
import { Trip, Vehicle, Driver } from '../types';
import { 
  validateTripTransition, 
  validateAssignment, 
  getSynchronizedStatuses, 
  logActivity,
  TRIP_STATUS_COLORS 
} from './businessRules';

export function useTMSData() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const loadData = useCallback(() => {
    setTrips(JSON.parse(localStorage.getItem("tms_trips") || "[]"));
    setVehicles(JSON.parse(localStorage.getItem("tms_vehicles") || "[]"));
    setDrivers(JSON.parse(localStorage.getItem("tms_drivers") || "[]"));
    setActivities(JSON.parse(localStorage.getItem("tms_activities") || "[]"));
  }, []);

  useEffect(() => {
    loadData();
    const handleChanged = () => loadData();
    window.addEventListener("tms_data_changed", handleChanged);
    window.addEventListener("storage", handleChanged);
    return () => {
      window.removeEventListener("tms_data_changed", handleChanged);
      window.removeEventListener("storage", handleChanged);
    };
  }, [loadData]);

  const saveData = (newTrips: Trip[], newVehicles: Vehicle[], newDrivers: Driver[]) => {
    localStorage.setItem("tms_trips", JSON.stringify(newTrips));
    localStorage.setItem("tms_vehicles", JSON.stringify(newVehicles));
    localStorage.setItem("tms_drivers", JSON.stringify(newDrivers));
    setTrips([...newTrips]);
    setVehicles([...newVehicles]);
    setDrivers([...newDrivers]);
    window.dispatchEvent(new Event("tms_data_changed"));
  };

  const updateTripStatus = (tripId: string, nextStatus: string) => {
    return bulkUpdateTripStatus([tripId], nextStatus);
  };

  const bulkUpdateTripStatus = (tripIds: string[], nextStatus: string) => {
    let currentTrips = JSON.parse(localStorage.getItem("tms_trips") || "[]");
    let currentVehicles = JSON.parse(localStorage.getItem("tms_vehicles") || "[]");
    let currentDrivers = JSON.parse(localStorage.getItem("tms_drivers") || "[]");

    let anySuccess = false;
    let lastError = "";

    tripIds.forEach(tripId => {
      const trip = currentTrips.find((t: any) => t.id === tripId);
      if (!trip) {
        lastError = "Trip not found";
        return;
      }

      const validation = validateTripTransition(trip.status, nextStatus);
      if (!validation.valid) {
        lastError = validation.error || "Invalid transition";
        return;
      }

      anySuccess = true;
      currentTrips = currentTrips.map((t: any) => {
        if (t.id === tripId) {
          let updatedRouteProgress = t.routeProgress;
          
          if (nextStatus === "Completed" || nextStatus === "Delivered") {
            updatedRouteProgress = {
              ...t.routeProgress,
              completedCount: t.routeProgress.steps.length,
              steps: t.routeProgress.steps.map((step: any) => ({ ...step, status: "completed" }))
            };
          } else if (nextStatus === "In Transit" || nextStatus === "Dispatched") {
            // Find the first step that isn't completed and make it current
            let foundCurrent = false;
            const updatedSteps = t.routeProgress.steps.map((step: any) => {
              if (step.status === "completed") return step;
              if (!foundCurrent) {
                foundCurrent = true;
                return { ...step, status: "current" };
              }
              return { ...step, status: "pending" };
            });
            
            updatedRouteProgress = {
              ...t.routeProgress,
              steps: updatedSteps,
              completedCount: updatedSteps.filter((s: any) => s.status === "completed").length
            };
          }

          return { 
            ...t, 
            status: nextStatus, 
            statusColor: TRIP_STATUS_COLORS[nextStatus] || t.statusColor,
            routeProgress: updatedRouteProgress,
            lastUpdated: "Just now"
          };
        }
        return t;
      });

      // Synchronize vehicle and driver
      const { vehicleStatus, driverStatus } = getSynchronizedStatuses(nextStatus);
      currentVehicles = currentVehicles.map((v: any) => {
        if (v.id === trip.vehicleNo) {
          return { ...v, status: vehicleStatus, activeTripId: nextStatus === "Completed" ? "None" : tripId };
        }
        return v;
      });

      currentDrivers = currentDrivers.map((d: any) => {
        if (d.name === trip.driver) {
          return { ...d, status: driverStatus, activeTripId: nextStatus === "Completed" ? "None" : tripId };
        }
        return d;
      });
    });

    if (anySuccess) {
      saveData(currentTrips, currentVehicles, currentDrivers);
      logActivity(`Status updated to ${nextStatus} for ${tripIds.length} trip(s)`, "success");
      return { success: true };
    }
    
    return { success: false, error: lastError };
  };

  const assignResources = (tripId: string, vehicleId: string, driverName: string) => {
    let currentTrips = JSON.parse(localStorage.getItem("tms_trips") || "[]");
    let currentVehicles = JSON.parse(localStorage.getItem("tms_vehicles") || "[]");
    let currentDrivers = JSON.parse(localStorage.getItem("tms_drivers") || "[]");

    const trip = currentTrips.find((t: any) => t.id === tripId);
    const vehicle = currentVehicles.find((v: any) => v.id === vehicleId);
    const driver = currentDrivers.find((d: any) => d.name === driverName);

    if (!trip) return { success: false, error: "Trip not found" };

    const validation = validateAssignment(tripId, driver, vehicle);
    if (!validation.valid) return { success: false, error: validation.error };

    const updatedTrips = currentTrips.map((t: any) => {
      if (t.id === tripId) {
        const isInitialStatus = ["Draft", "Planned", "Scheduled"].includes(t.status);
        return { 
          ...t, 
          vehicleNo: vehicleId, 
          driver: driverName, 
          status: isInitialStatus ? "Assigned" : t.status, 
          statusColor: isInitialStatus ? TRIP_STATUS_COLORS["Assigned"] : t.statusColor 
        };
      }
      return t;
    });

    const updatedVehicles = currentVehicles.map((v: any) => {
      if (v.id === vehicleId) return { ...v, status: "Assigned" as const, activeTripId: tripId, assignedDriver: driverName };
      if (v.id === trip.vehicleNo) return { ...v, status: "Available" as const, activeTripId: "None", assignedDriver: "Unassigned" };
      return v;
    });

    const updatedDrivers = currentDrivers.map((d: any) => {
      if (d.name === driverName) return { ...d, status: "Available" as const, activeTripId: tripId, assignedVehicle: vehicleId };
      if (d.name === trip.driver) return { ...d, status: "Available" as const, activeTripId: "None", assignedVehicle: "Unassigned" };
      return d;
    });

    saveData(updatedTrips, updatedVehicles, updatedDrivers);
    logActivity(`Resources assigned to Trip ${tripId}: ${vehicleId} & ${driverName}`, "info");
    return { success: true };
  };

  const saveTrip = (updatedTrip: Trip) => {
    let currentTrips = JSON.parse(localStorage.getItem("tms_trips") || "[]");
    let currentVehicles = JSON.parse(localStorage.getItem("tms_vehicles") || "[]");
    let currentDrivers = JSON.parse(localStorage.getItem("tms_drivers") || "[]");

    const updatedTrips = currentTrips.map((t: any) => t.id === updatedTrip.id ? updatedTrip : t);
    saveData(updatedTrips, currentVehicles, currentDrivers);
    return { success: true };
  };

  return {
    trips,
    vehicles,
    drivers,
    activities,
    updateTripStatus,
    bulkUpdateTripStatus,
    assignResources,
    saveTrip,
    refresh: loadData
  };
}
