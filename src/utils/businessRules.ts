/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Trip, Vehicle, Driver, ExecutionReason, Severity } from "../types";

export const TRIP_LIFECYCLE = ["Draft", "Planned", "Scheduled", "Assigned", "Loading", "Dispatched", "In Transit", "Delivered", "Completed"];

/**
 * Deterministically generates a list of cargo items for a stop.
 */
export const getSpecificGoodsList = (goodsType: string, stopIdx: number, tripId: string, totalSteps: number) => {
  const seed = (tripId || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + (stopIdx || 0);
  const typeKey = (goodsType || "Standard Freight").toLowerCase();
  
  let list: { name: string; quantity: string; type: "Pickup" | "Delivery" }[] = [];
  
  if (typeKey.includes("electronics")) {
    list = [
      { name: "Precision Silicon IC Wafers (3nm)", quantity: `${(seed % 30) + 15} Cases`, type: "Pickup" },
      { name: "OLED Micro-Display Panels (Ultra-HD)", quantity: `${(seed % 6) + 4} Pallets`, type: "Delivery" },
      { name: "High-Frequency Transceiver Modules", quantity: `${(seed % 25) + 10} Crates`, type: "Pickup" },
    ];
  } else if (typeKey.includes("furniture")) {
    list = [
      { name: "Ergonomic Pneumatic Task Chairs", quantity: `${(seed % 40) + 20} Units`, type: "Delivery" },
      { name: "Polished Oak Conference Desks (Modular)", quantity: `${(seed % 8) + 4} Crates`, type: "Pickup" },
      { name: "Tempered Glass Partition Panels", quantity: `${(seed % 12) + 6} Cartons`, type: "Delivery" },
    ];
  } else if (typeKey.includes("medical") || typeKey.includes("medicine")) {
    list = [
      { name: "Sterile Polystyrene Petri Dishes", quantity: `${(seed % 150) + 80} Packs`, type: "Pickup" },
      { name: "Titanium Surgical Implant Screws", quantity: `${(seed % 60) + 30} Units`, type: "Delivery" },
      { name: "Disposable Nitrile Protective Gloves", quantity: `${(seed % 12) + 5} Cartons`, type: "Pickup" },
    ];
  } else if (typeKey.includes("machinery") || typeKey.includes("machine")) {
    list = [
      { name: "Hydraulic Radial Piston Pumps", quantity: `${(seed % 8) + 4} Crates`, type: "Pickup" },
      { name: "Pneumatic Solenoid Valve Manifolds", quantity: `${(seed % 20) + 10} Units`, type: "Delivery" },
      { name: "Carbide-Tipped CNC Router Bits", quantity: `${(seed % 100) + 50} Packs`, type: "Delivery" },
    ];
  } else if (typeKey.includes("grocery") || typeKey.includes("groceries") || typeKey.includes("food")) {
    list = [
      { name: "Organic Cold-Pressed Extra Virgin Olive Oil", quantity: `${(seed % 55) + 20} Cases`, type: "Delivery" },
      { name: "Gluten-Free Handcut Rolled Oats", quantity: `${(seed % 8) + 4} Pallets`, type: "Pickup" },
      { name: "Fair-Trade Dark Chocolate Cocoa Nibs", quantity: `${(seed % 12) + 8} Sacks`, type: "Delivery" },
    ];
  } else if (typeKey.includes("automotive") || typeKey.includes("auto")) {
    list = [
      { name: "Brushless DC Radiator Cooling Fans", quantity: `${(seed % 100) + 40} Units`, type: "Pickup" },
      { name: "Asbestos-Free Ceramic Brake Pads", quantity: `${(seed % 35) + 15} Boxes`, type: "Delivery" },
      { name: "Forged Steel CV Axle Shaft Assembly", quantity: `${(seed % 5) + 3} Pallets`, type: "Pickup" },
    ];
  } else if (typeKey.includes("textile") || typeKey.includes("textiles")) {
    list = [
      { name: "Mercerized Combed Egyptian Cotton Yarn", quantity: `${(seed % 12) + 6} Bales`, type: "Pickup" },
      { name: "Flame-Retardant Polyester Webbing Reels", quantity: `${(seed % 25) + 10} Rolls`, type: "Delivery" },
      { name: "Waterproof Polyurethane-Coated Ripstop Nylon", quantity: `${(seed % 8) + 3} Pallets`, type: "Delivery" },
    ];
  } else {
    list = [
      { name: "Industrial Grade Galvanized Fasteners", quantity: `${(seed % 40) + 15} Cartons`, type: "Pickup" },
      { name: "Heavy Duty Polyethylene Stretch Wrap Reels", quantity: `${(seed % 18) + 6} Rolls`, type: "Delivery" },
      { name: "Reinforced Corrugated Shipping Boxes", quantity: `${(seed % 12) + 5} Pallets`, type: "Pickup" },
    ];
  }

  return list.map((item, idx) => {
    let typeOverride: "Pickup" | "Delivery" = item.type;
    if (stopIdx === 0) {
      typeOverride = "Pickup";
    } else if (stopIdx === totalSteps - 1) {
      typeOverride = "Delivery";
    } else {
      typeOverride = idx % 2 === 0 ? "Delivery" : "Pickup";
    }
    return {
      ...item,
      type: typeOverride
    };
  });
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
