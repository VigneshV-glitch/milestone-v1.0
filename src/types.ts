/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Filter Actions & Saved Views (Generic / Shared)
export interface FilterAction {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface SavedView {
  name: string;
  searchTerm: string;
  appliedFilters: FilterAction[];
}

// Driver specifications matching professional standards
export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseClass: "Class A CDL" | "Class B CDL";
  licenseNumber: string;
  status: "Available" | "Driving" | "Loading" | "Resting" | "Off Duty" | "On Leave";
  safetyScore: number;
  hoursWorkedThisWeek: number;
  experienceYears: number;
  location: string;
  assignedVehicle: string;
  hireDate: string;
  emergencyContact: string;
  activeTripId: string;
  lastActivity: string;
}

// Vehicle specifications
export interface Vehicle {
  id: string;
  modelName: string;
  type: string;
  plateNumber: string;
  assignedDriver: string;
  fuelLevel: number;
  fuelType: "Diesel" | "Electric" | "CNG" | "Hybrid";
  status: "Available" | "Assigned" | "In Transit" | "Loading" | "Unloading" | "Maintenance" | "Out of Service";
  odometer: number;
  location: string;
  activeTripId: string;
  efficiencyMpg: number;
  nextServiceDate: string;
  year: number;
  payloadCapacity: string;
  vin: string;
}

// ... (rest of the file as before)

// Execution and Exception structures (New)
export interface Exception {
  id: string;
  tripId: string;
  stopIdx: number;
  itemIdx: number;
  type: string; // From configurable catalog
  severity: "Info" | "Warning" | "Critical";
  remarks: string;
  createdAt: string;
  createdBy: string;
}

export type ExecutionReason = 
  | "Missing Goods" 
  | "Customer Rejected" 
  | "Damaged Goods" 
  | "Warehouse Shortage" 
  | "Incorrect Goods" 
  | "Weight Restriction" 
  | "Partial Delivery" 
  | "Partial Pickup" 
  | "Over Shipment" 
  | "No Discrepancy" 
  | "Other";

export type Severity = "Critical" | "High" | "Medium" | "Low" | "None";

export type DelayReason = 
  | "Vehicle Breakdown"
  | "Traffic Congestion"
  | "Warehouse Shortage"
  | "Damaged Goods"
  | "Missing Goods"
  | "Customer Rejected"
  | "Loading Delay"
  | "Unloading Delay"
  | "Weather"
  | "Road Closure"
  | "Mechanical Inspection"
  | "Other";

export interface DelayEvent {
  id: string;
  tripId: string;
  reason: DelayReason;
  severity: Severity;
  remarks: string;
  reportedBy: string;
  reportedAt: string;
  estimatedRecovery?: string;
  status: "Open";
}

export interface Execution {
  id: string;
  tripId: string;
  stopIdx: number;
  itemIdx: number;
  actualQuantity: number;
  reason: ExecutionReason;
  remarks: string;
  timestamp: string;
  updatedBy: string;
}

export interface RouteStep {
  location: string;
  type: string;
  time: string;
  status: string;
  goodsType?: string;
  quantity?: string;
  cargoItems?: any[];
}

export interface RouteProgress {
  steps: RouteStep[];
  totalStops: number;
  completedCount: number;
  nextStopLocation: string;
}

export interface Trip {
  id: string;
  date: string;
  driver: string;
  origin: string;
  destination: string;
  status: string;
  statusColor: string;
  delayReason?: string;
  amount: string;
  vehicleNo: string;
  driverContact: string;
  loadType: string;
  priority: string;
  currentLocation: string;
  eta: string;
  podStatus: string;
  lastUpdated: string;
  distance: string;
  totalStops: number;
  fuelUsed: string;
  expectedDelivery: string;
  createdTime: string;
  assignedTime: string;
  loadedTime: string;
  dispatchedTime: string;
  inTransitTime: string;
  deliveredTime: string;
  routeProgress: RouteProgress;
  executions?: Record<string, any>;
  delayEvents?: DelayEvent[];
}

// Role, Operator User & Custom Fields settings specifications
export interface ModulePermissions {
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: {
    drivers: ModulePermissions;
    vehicles: ModulePermissions;
    trips: ModulePermissions;
    settings: ModulePermissions;
    [key: string]: ModulePermissions; // index signature for key lookup
  };
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string;
  avatar?: string;
  phone?: string;
}

export interface CustomField {
  id: string;
  entity: "Drivers" | "Vehicles" | "Trips";
  name: string;
  type: "Text" | "Number" | "Date" | "Boolean";
  required: boolean;
  defaultValue?: string;
}
