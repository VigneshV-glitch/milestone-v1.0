/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Trip, Vehicle, Driver } from "../types";

export const BusinessRules = {
  validateTrip: (trip: Trip) => {
    // Trip cannot be Closed before all Delivery stops are completed.
    if (trip.status === "Closed") return { valid: true };
    // Add logic to check delivery stops
    return { valid: true };
  },

  validateVehicle: (vehicle: Vehicle, tripId?: string) => {
    if (vehicle.status === "Maintenance") return { valid: false, message: `Vehicle ${vehicle.id} is in maintenance.` };
    if (vehicle.status === "Out of Service") return { valid: false, message: `Vehicle ${vehicle.id} is out of service.` };
    if (vehicle.activeTripId !== "None" && vehicle.activeTripId !== tripId) {
      return { valid: false, message: `Vehicle ${vehicle.id} is already assigned to trip ${vehicle.activeTripId}.` };
    }
    return { valid: true };
  },

  validateDriver: (driver: Driver, tripId?: string) => {
    if (driver.status === "On Leave") return { valid: false, message: `Driver ${driver.name} is on leave.` };
    if (driver.status === "Resting") return { valid: false, message: `Driver ${driver.name} is resting.` };
    if (driver.status === "Off Duty") return { valid: false, message: `Driver ${driver.name} is off duty.` };
    if (driver.status === "Driving" && driver.activeTripId !== tripId) {
      return { valid: false, message: `Driver ${driver.name} is currently driving trip ${driver.activeTripId}.` };
    }
    return { valid: true };
  },
  
  validateAssignment: (vehicle: Vehicle, driver: Driver) => {
    if (vehicle.status !== "Available") return { valid: false, message: `Vehicle ${vehicle.id} is not Available.` };
    if (driver.status !== "Available") return { valid: false, message: `Driver ${driver.name} is not Available.` };
    return { valid: true };
  },
};
