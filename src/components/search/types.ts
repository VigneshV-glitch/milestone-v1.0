import { Trip, Vehicle, Driver } from "../../types";

export type EntityType = "Trip" | "Vehicle" | "Driver" | "Cargo" | "Stop" | "Exception";

export interface SearchResult {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
  status?: string;
  statusColor?: string;
  metadata: {
    tripId?: string;
    vehicleId?: string;
    driverName?: string;
    eta?: string;
    origin?: string;
    destination?: string;
    customer?: string;
    commodity?: string;
    severity?: string;
    reason?: string;
  };
  score: number;
}

export interface SearchHistoryItem {
  id: string;
  term: string;
  timestamp: number;
}

export interface SearchQuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}
