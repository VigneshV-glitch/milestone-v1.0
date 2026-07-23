import { Trip, Vehicle, Driver, Exception } from "../../types";
import { SearchResult, EntityType } from "./types";

export function searchTrips(trips: Trip[], term: string): SearchResult[] {
  const t = term.toLowerCase();
  return trips.map(trip => {
    let score = 0;
    if (trip.id.toLowerCase() === t) score += 100;
    else if (trip.id.toLowerCase().startsWith(t)) score += 80;
    else if (trip.id.toLowerCase().includes(t)) score += 40;

    if (trip.origin.toLowerCase().includes(t)) score += 20;
    if (trip.destination.toLowerCase().includes(t)) score += 20;
    if (trip.driver.toLowerCase().includes(t)) score += 20;
    if (trip.status.toLowerCase().includes(t)) score += 10;
    if (trip.loadType.toLowerCase().includes(t)) score += 5;

    return {
      id: trip.id,
      type: "Trip" as EntityType,
      title: trip.id,
      subtitle: `${trip.origin} → ${trip.destination}`,
      status: trip.status,
      statusColor: trip.statusColor,
      metadata: {
        tripId: trip.id,
        driverName: trip.driver,
        vehicleId: trip.vehicleNo,
        eta: trip.eta,
        origin: trip.origin,
        destination: trip.destination
      },
      score
    };
  }).filter(r => r.score > 0);
}

export function searchVehicles(vehicles: Vehicle[], term: string): SearchResult[] {
  const t = term.toLowerCase();
  return vehicles.map(v => {
    let score = 0;
    if (v.id.toLowerCase() === t) score += 100;
    else if (v.id.toLowerCase().startsWith(t)) score += 80;
    else if (v.id.toLowerCase().includes(t)) score += 40;

    if (v.plateNumber.toLowerCase().includes(t)) score += 30;
    if (v.modelName.toLowerCase().includes(t)) score += 20;
    if (v.status.toLowerCase().includes(t)) score += 10;

    return {
      id: v.id,
      type: "Vehicle" as EntityType,
      title: v.id,
      subtitle: `${v.modelName} • ${v.plateNumber}`,
      status: v.status,
      metadata: {
        vehicleId: v.id,
        driverName: v.assignedDriver
      },
      score
    };
  }).filter(r => r.score > 0);
}

export function searchDrivers(drivers: Driver[], term: string): SearchResult[] {
  const t = term.toLowerCase();
  return drivers.map(d => {
    let score = 0;
    if (d.name.toLowerCase() === t) score += 100;
    else if (d.name.toLowerCase().startsWith(t)) score += 80;
    else if (d.name.toLowerCase().includes(t)) score += 40;

    if (d.phone.toLowerCase().includes(t)) score += 30;
    if (d.status.toLowerCase().includes(t)) score += 10;

    return {
      id: d.id,
      type: "Driver" as EntityType,
      title: d.name,
      subtitle: d.phone,
      status: d.status,
      metadata: {
        driverName: d.name,
        vehicleId: d.assignedVehicle
      },
      score
    };
  }).filter(r => r.score > 0);
}

export function searchCargo(trips: Trip[], term: string): SearchResult[] {
  const t = term.toLowerCase();
  const results: SearchResult[] = [];
  
  trips.forEach(trip => {
    trip.routeProgress.steps.forEach(step => {
      if (step.cargoItems) {
        step.cargoItems.forEach(item => {
          let score = 0;
          const commodity = (item.commodity || item.name || "").toLowerCase();
          const cargoId = (item.id || "").toLowerCase();

          if (cargoId === t) score += 100;
          else if (cargoId.startsWith(t)) score += 80;
          else if (cargoId.includes(t)) score += 40;

          if (commodity.includes(t)) score += 30;

          if (score > 0) {
            results.push({
              id: item.id || `cargo-${Math.random()}`,
              type: "Cargo" as EntityType,
              title: item.commodity || item.name || "Unknown Cargo",
              subtitle: `Trip ${trip.id} • ${step.location}`,
              metadata: {
                tripId: trip.id,
                commodity: item.commodity || item.name
              },
              score
            });
          }
        });
      }
    });
  });

  return results;
}

export function searchStops(trips: Trip[], term: string): SearchResult[] {
  const t = term.toLowerCase();
  const results: SearchResult[] = [];
  const seenStops = new Set<string>();

  trips.forEach(trip => {
    trip.routeProgress.steps.forEach(step => {
      const loc = step.location.toLowerCase();
      if (loc.includes(t)) {
        const key = `${step.location}-${step.type}`;
        if (!seenStops.has(key)) {
          seenStops.add(key);
          results.push({
            id: `stop-${Math.random()}`,
            type: "Stop" as EntityType,
            title: step.location,
            subtitle: `${step.type} • Trip ${trip.id}`,
            metadata: {
              tripId: trip.id,
              origin: step.location
            },
            score: 40 + (loc.startsWith(t) ? 20 : 0)
          });
        }
      }
    });
  });

  return results;
}

export function searchExceptions(trips: Trip[], term: string): SearchResult[] {
  const t = term.toLowerCase();
  const results: SearchResult[] = [];

  trips.forEach(trip => {
    if (trip.executions) {
      Object.entries(trip.executions).forEach(([key, exec]: [string, any]) => {
        const reason = (exec.reason || "").toLowerCase();
        const severity = (exec.severity || "Info").toLowerCase();
        
        let score = 0;
        if (reason.includes(t)) score += 40;
        if (severity.includes(t)) score += 20;

        if (score > 0) {
          results.push({
            id: exec.id || `exec-${Math.random()}`,
            type: "Exception" as EntityType,
            title: exec.reason || "Operational Exception",
            subtitle: `Trip ${trip.id} • ${exec.severity}`,
            metadata: {
              tripId: trip.id,
              severity: exec.severity,
              reason: exec.reason
            },
            score
          });
        }
      });
    }
  });

  return results;
}
