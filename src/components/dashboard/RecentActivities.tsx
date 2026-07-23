/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  User,
  X,
  Play,
  Check
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "alert" | "dispatch" | "delivery" | "maintenance";
  severity: "high" | "medium" | "info";
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  driverId?: string;
  vehicleId?: string;
  tripId?: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "alert",
    severity: "high",
    title: "Low Fuel Alert: VEH-012",
    description: "Vehicle VEH-012 (Driver Marcus Brody) is at 12% capacity near Dallas, TX. Immediate fuel stop recommended.",
    timestamp: "2026-07-12T21:45:00Z",
    relativeTime: "15 mins ago",
    driverId: "DRV-008",
    vehicleId: "VEH-012",
    tripId: "TRP-10029"
  },
  {
    id: "act-2",
    type: "alert",
    severity: "medium",
    title: "Delayed Trip Warning: TRP-10294",
    description: "Trip TRP-10294 (Miami -> New York) is running 45 minutes behind schedule due to dense traffic on I-95 North.",
    timestamp: "2026-07-12T21:30:00Z",
    relativeTime: "30 mins ago",
    tripId: "TRP-10294"
  },
  {
    id: "act-3",
    type: "dispatch",
    severity: "info",
    title: "Route Dispatched: TRP-10042",
    description: "Route Chicago (ORD) -> Los Angeles (LAX) has been dispatched. Assigned to Sarah Jenkins with VEH-005.",
    timestamp: "2026-07-12T21:10:00Z",
    relativeTime: "50 mins ago",
    driverId: "DRV-002",
    vehicleId: "VEH-005",
    tripId: "TRP-10042"
  },
  {
    id: "act-4",
    type: "delivery",
    severity: "info",
    title: "Delivery Completed: TRP-10031",
    description: "TRP-10031 successfully arrived at Denver Logistics Hub. 24 tons of Temperature-Controlled Cargo received. Proof of Delivery (POD) signed.",
    timestamp: "2026-07-12T20:15:00Z",
    relativeTime: "2 hrs ago",
    tripId: "TRP-10031"
  },
  {
    id: "act-5",
    type: "maintenance",
    severity: "medium",
    title: "Asset Sent to Maintenance",
    description: "VEH-088 (Class A Sleeper Cabin) checked into Chicago service shop for scheduled 100k mile preventative service.",
    timestamp: "2026-07-12T19:00:00Z",
    relativeTime: "3 hrs ago",
    vehicleId: "VEH-088"
  },
  {
    id: "act-6",
    type: "delivery",
    severity: "info",
    title: "POD Signed by Terminal Mgr",
    description: "Proof of Delivery uploaded for trip TRP-10018 (Houston Terminal). Digital receipt validated.",
    timestamp: "2026-07-12T18:30:00Z",
    relativeTime: "4 hrs ago",
    tripId: "TRP-10018"
  }
];

export const RecentActivities: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem("tms_activities");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map simplified logs to ActivityItem format
        const realLogs = parsed
          .filter((log: any) => log.tripId && log.status)
          .map((log: any, idx: number) => ({
            id: `real-${idx}`,
            type: log.status === "In Transit" ? "dispatch" : (log.status === "Completed" ? "delivery" : "info"),
            severity: "info",
            title: `Trip ${log.tripId} status: ${log.status}`,
            description: log.details,
            timestamp: log.timestamp,
            relativeTime: "Just now",
            tripId: log.tripId
          }));
        return [...realLogs, ...INITIAL_ACTIVITIES].slice(0, 20);
      } catch (e) {}
    }
    return INITIAL_ACTIVITIES;
  });
  const [filter, setFilter] = useState<"all" | "alert" | "dispatch" | "delivery">("all");

  const filteredActivities = activities.filter(
    (act) => filter === "all" || act.type === filter
  );

  const handleClearActivity = (id: string) => {
    setActivities(activities.filter((act) => act.id !== id));
  };

  const handleAcknowledgeAlert = (id: string) => {
    setActivities(
      activities.map((act) =>
        act.id === id ? { ...act, severity: "info" as const, title: `[ACK] ${act.title}` } : act
      )
    );
  };

  return (
    <div className="bg-white dark:bg-[#121212] p-7 rounded-3xl border border-gray-100 dark:border-[#2d2d2d] flex flex-col" id="dashboard-recent-activities-widget">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white leading-[28px] h-[28px]">
            Recent Operational Activities & Alerts
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time fleet telemetry & dispatch feed
          </p>
        </div>
        
        {/* Filter Badges */}
        <div className="flex bg-gray-100/80 dark:bg-[#1a1a1a] rounded-lg p-1 text-xs font-semibold shrink-0">
          {(["all", "alert", "dispatch", "delivery"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all capitalize ${
                filter === type
                  ? "bg-white dark:bg-[#2d2d2d] text-[#111827] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {type === "all" ? "All Feed" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Feed Scroller */}
      <div className="flex-1 space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
            No activities fit the selected filter criteria.
          </div>
        ) : (
          filteredActivities.map((act) => {
            // Pick style and icon
            let iconElement = <Truck className="w-4.5 h-4.5 text-gray-500" />;
            let bgStyle = "bg-gray-50 dark:bg-gray-800/20";
            let borderStyle = "border-gray-100 dark:border-gray-800";

            if (act.type === "alert") {
              if (act.severity === "high") {
                iconElement = <AlertTriangle className="w-4.5 h-4.5 text-red-600 dark:text-red-400 animate-pulse" />;
                bgStyle = "bg-red-50/40 dark:bg-red-950/5";
                borderStyle = "border-red-100/60 dark:border-red-900/10";
              } else {
                iconElement = <AlertTriangle className="w-4.5 h-4.5 text-orange-500 dark:text-orange-400" />;
                bgStyle = "bg-orange-50/30 dark:bg-orange-950/5";
                borderStyle = "border-orange-100/50 dark:border-orange-900/10";
              }
            } else if (act.type === "dispatch") {
              iconElement = <Clock className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />;
              bgStyle = "bg-blue-50/30 dark:bg-blue-950/5";
              borderStyle = "border-blue-100/50 dark:border-blue-900/10";
            } else if (act.type === "delivery") {
              iconElement = <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />;
              bgStyle = "bg-emerald-50/30 dark:bg-emerald-950/5";
              borderStyle = "border-emerald-100/50 dark:border-emerald-900/10";
            } else if (act.type === "maintenance") {
              iconElement = <Truck className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />;
              bgStyle = "bg-purple-50/30 dark:bg-purple-950/5";
              borderStyle = "border-purple-100/50 dark:border-purple-900/10";
            }

            return (
              <div
                key={act.id}
                className={`p-4 rounded-2xl border ${bgStyle} ${borderStyle} flex items-start justify-between gap-4 transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)]`}
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-[#1a1a1a] flex items-center justify-center border border-gray-100 dark:border-gray-800/80 shadow-sm shrink-0">
                    {iconElement}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[13px] font-bold text-gray-900 dark:text-white">
                        {act.title}
                      </span>
                      {act.tripId && (
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono font-bold px-1.5 py-0.5 rounded">
                          {act.tripId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {act.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-semibold font-mono">
                      <span>{act.relativeTime}</span>
                      {act.driverId && (
                        <span className="flex items-center gap-0.5">
                          <User className="w-3 h-3" /> {act.driverId}
                        </span>
                      )}
                      {act.vehicleId && (
                        <span className="flex items-center gap-0.5">
                          <Truck className="w-3 h-3" /> {act.vehicleId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {act.type === "alert" && act.severity === "high" && (
                    <button
                      onClick={() => handleAcknowledgeAlert(act.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      title="Acknowledge Alert"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleClearActivity(act.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
