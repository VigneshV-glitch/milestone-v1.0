/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Trip, Vehicle, Driver, ExecutionReason, Severity } from "../types";

export const TRIP_LIFECYCLE = ["Draft", "Planned", "Scheduled", "Assigned", "Loading", "Dispatched", "In Transit", "Delivered", "Completed"];

/**
 * Retrieves the actual cargo items for a stop, or creates a single cargo record from actual step/trip data.
 * Does not generate fake mock items.
 */
export const getGoodsForStep = (step: any, stopIdx: number, trip?: any, totalSteps?: number) => {
  if (!step) {
    const name = trip?.loadType || "General Cargo";
    const quantity = "1 Load";
    const type: "Pickup" | "Delivery" = stopIdx === 0 ? "Pickup" : "Delivery";
    return [{ name, quantity, type }];
  }

  // 1. Check for real cargo items array stored on the step from DB
  const rawItems = step.cargoItems || step.cargo_items || step.goods || step.items;
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    return rawItems.map((item: any, idx: number) => ({
      name: item.name || item.cargoCommodity || item.commodity || item.description || step.goodsType || trip?.loadType || "General Cargo",
      quantity: item.quantity || item.plannedQuantity || step.quantity || "1 Load",
      type: (item.type || step.type || (stopIdx === 0 ? "Pickup" : "Delivery")) as "Pickup" | "Delivery"
    }));
  }

  // 2. Return real commodity name & quantity directly from the step or trip DB record
  const name = step.goodsType || step.cargoType || step.commodity || trip?.loadType || "General Cargo";
  const quantity = step.quantity || "1 Load";
  const type: "Pickup" | "Delivery" = step.type === "Pickup" ? "Pickup" : step.type === "Delivery" ? "Delivery" : (stopIdx === 0 ? "Pickup" : "Delivery");

  return [{ name, quantity, type }];
};

export const getSpecificGoodsList = (goodsType: string, stopIdx: number, tripId: string, totalSteps: number, step?: any, trip?: any) => {
  return getGoodsForStep(step, stopIdx, trip, totalSteps);
};

/**
 * Parses a quantity string into value and unit.
 */
export const parsePlannedQuantity = (qtyStr: string) => {
  const clean = (qtyStr || "").trim();
  const match = clean.match(/^(\d+)\s*(.*)$/);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: match[2] || "Units"
    };
  }
  return {
    value: 0,
    unit: "Units"
  };
};

export const TRIP_STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  Planned: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  Scheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Assigned: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400",
  Loading: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Dispatched: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  "In Transit": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Delivered: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Delayed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  Closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

/**
 * Validates trip status transition
 */
export function validateTripTransition(currentStatus: string, nextStatus: string): { valid: boolean; error?: string } {
  const currentIndex = TRIP_LIFECYCLE.indexOf(currentStatus);
  const nextIndex = TRIP_LIFECYCLE.indexOf(nextStatus);

  if (currentIndex === -1 || nextIndex === -1) return { valid: true }; // Custom or untracked status
  
  if (nextStatus === "Delayed" || nextStatus === "Closed" || nextStatus === "Cancelled") return { valid: true }; // Exceptions are always allowed

  if (nextIndex >= currentIndex) return { valid: true }; // Allow moving forward or staying
  
  return { 
    valid: false, 
    error: `Cannot move back to ${nextStatus} from ${currentStatus}.` 
  };
}

/**
 * Validates driver and vehicle availability for assignment
 */
export function validateAssignment(
  tripId: string,
  driver?: Driver,
  vehicle?: Vehicle
): { valid: boolean; error?: string } {
  if (driver) {
    if (driver.status !== "Available" && driver.activeTripId !== tripId) {
      return { valid: false, error: `Driver ${driver.name} is currently ${driver.status}.` };
    }
  }
  
  if (vehicle) {
    if (vehicle.status !== "Available" && vehicle.activeTripId !== tripId) {
      return { valid: false, error: `Vehicle ${vehicle.id} is currently ${vehicle.status}.` };
    }
  }
  
  return { valid: true };
}

/**
 * Synchronizes driver and vehicle status based on trip status
 */
export function getSynchronizedStatuses(tripStatus: string): { vehicleStatus: Vehicle["status"]; driverStatus: Driver["status"] } {
  switch (tripStatus) {
    case "Assigned":
    case "Loading":
    case "Dispatched":
    case "Scheduled":
      return { vehicleStatus: "Assigned", driverStatus: "Available" };
    case "In Transit":
      return { vehicleStatus: "In Transit", driverStatus: "Driving" };
    case "Delivered":
    case "Completed":
      return { vehicleStatus: "Available", driverStatus: "Available" };
    case "Delayed":
      return { vehicleStatus: "In Transit", driverStatus: "Driving" };
    default:
      return { vehicleStatus: "Available", driverStatus: "Available" };
  }
}

/**
 * Logs an activity
 */
export function logActivity(
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  user: string = "Admin"
) {
  const activities = JSON.parse(localStorage.getItem("tms_activities") || "[]");
  const newActivity = {
    id: `ACT-${Date.now()}`,
    message,
    type,
    user,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem("tms_activities", JSON.stringify([newActivity, ...activities].slice(0, 50)));
  window.dispatchEvent(new Event("tms_data_changed"));
}

/**
 * Calculates severity based on execution reason and variance
 */
export function calculateSeverity(
  reason: ExecutionReason,
  plannedQty: number,
  actualQty: number
): Severity {
  const variance = plannedQty === 0 ? 0 : (Math.abs(plannedQty - actualQty) / plannedQty) * 100;

  switch (reason) {
    case "Missing Goods":
      return "Critical";

    case "Customer Rejected":
      return "Critical";

    case "Damaged Goods":
      if (variance >= 20) return "Critical";
      if (variance >= 10) return "High";
      return "Medium";

    case "Warehouse Shortage":
      if (variance >= 20) return "High";
      return "Medium";

    case "Incorrect Goods":
      return "High";

    case "Weight Restriction":
      return "Medium";

    case "Partial Delivery":
      if (variance >= 20) return "High";
      if (variance >= 10) return "Medium";
      return "Low";

    case "Partial Pickup":
      if (variance >= 20) return "High";
      if (variance >= 10) return "Medium";
      return "Low";

    case "Over Shipment":
      if (variance >= 10) return "Medium";
      return "Low";

    case "No Discrepancy":
      return "None";

    case "Other":
      return "Medium";

    default:
      return "Low";
  }
}
