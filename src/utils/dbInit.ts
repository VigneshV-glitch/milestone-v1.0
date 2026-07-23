/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Driver, Vehicle, Trip, DelayEvent, DelayReason } from "../types";

const CITIES = [
  "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Los Angeles, CA", "New York, NY",
  "Atlanta, GA", "Seattle, WA", "Dallas, TX", "Miami, FL", "Denver, CO",
  "San Francisco, CA", "Boston, MA", "Detroit, MI", "Las Vegas, NV", "Orlando, FL"
];

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph",
  "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy",
  "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
];

const VEHICLE_MODELS = [
  { model: "Peterbilt 579", type: "Heavy Semi-Truck", fuel: "Diesel" as const, mpg: 7.2, cap: "45,000 lbs" },
  { model: "Freightliner Cascadia", type: "Heavy Semi-Truck", fuel: "Diesel" as const, mpg: 7.8, cap: "46,000 lbs" },
  { model: "Volvo VNL 860", type: "Premium Sleeper", fuel: "Diesel" as const, mpg: 7.4, cap: "44,500 lbs" },
  { model: "Kenworth T680", type: "Heavy Duty Day Cab", fuel: "Diesel" as const, mpg: 7.0, cap: "45,000 lbs" },
  { model: "Mack Anthem", type: "Sleeper Cab", fuel: "Diesel" as const, mpg: 6.8, cap: "48,000 lbs" },
  { model: "Tesla Semi", type: "Electric Heavy Rig", fuel: "Electric" as const, mpg: 1.8, cap: "40,000 lbs" },
  { model: "Hino 338 Box", type: "Medium Duty Box", fuel: "Diesel" as const, mpg: 11.5, cap: "14,500 lbs" },
  { model: "Volvo VNR Electric", type: "Electric Day Cab", fuel: "Electric" as const, mpg: 1.9, cap: "42,000 lbs" },
  { model: "Kenworth T370 Flatbed", type: "Medium Flatbed", fuel: "CNG" as const, mpg: 10.2, cap: "20,000 lbs" },
  { model: "Peterbilt 520EV", type: "Electric Medium Duty", fuel: "Electric" as const, mpg: 1.5, cap: "32,000 lbs" }
];

export function initializeTMSDatabase() {
  const CURRENT_VERSION = "1.2";
  const dbVersion = localStorage.getItem("tms_db_version");

  // If version matches, assume data is already managed
  if (dbVersion === CURRENT_VERSION) {
    return;
  }

  // Initialize with empty data
  localStorage.setItem("tms_drivers", JSON.stringify([]));
  localStorage.setItem("tms_vehicles", JSON.stringify([]));
  localStorage.setItem("tms_trips", JSON.stringify([]));
  localStorage.setItem("tms_db_version", CURRENT_VERSION);
}
