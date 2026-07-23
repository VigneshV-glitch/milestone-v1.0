/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { useTMSData } from "../../utils/useTMSData";
import {
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Truck,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export const KPICards: React.FC = () => {
  const { trips, vehicles, drivers } = useTMSData();

  const metrics = [
// ... (metrics array)
    { 
      title: "Active Trips", 
      value: trips.filter(t => t.status === "In Transit").length.toString(), 
      trend: "+ 2", 
      trendDesc: "vs yesterday", 
      color: "text-blue-500", 
      bg: "bg-blue-500/10", 
      icon: Truck, 
      trendUp: true,
      filter: { status: "In Transit" }
    },
    { 
      title: "Completed Today", 
      value: trips.filter(t => t.status === "Completed" || t.status === "Delivered").length.toString(), 
      trend: "+ 5", 
      trendDesc: "91% completion", 
      color: "text-green-500", 
      bg: "bg-emerald-500/10", 
      icon: CheckCircle2, 
      trendUp: true,
      filter: { status: "Completed" }
    },
    { 
      title: "Pending Dispatch", 
      value: trips.filter(t => t.status === "Scheduled" || t.status === "Draft").length.toString(), 
      trend: "- 3", 
      trendDesc: "awaiting assignment", 
      color: "text-purple-500", 
      bg: "bg-purple-500/10", 
      icon: Clock, 
      trendUp: false,
      filter: { status: "Scheduled" }
    },
    { 
      title: "Delayed Routes", 
      value: trips.filter(t => t.status === "Delayed").length.toString(), 
      trend: "+ 1", 
      trendDesc: "need attention", 
      color: "text-red-500", 
      bg: "bg-rose-500/10", 
      icon: AlertCircle, 
      trendUp: true,
      filter: { status: "Delayed" }
    },
    { 
      title: "Total Vehicles", 
      value: vehicles.length.toString(), 
      trend: "0", 
      trendDesc: "fleet capacity", 
      color: "text-blue-500", 
      bg: "bg-blue-500/10", 
      icon: Truck, 
      trendUp: true,
      path: "/vehicles"
    },
    { 
      title: "Active Drivers", 
      value: drivers.filter(d => d.status === "Driving" || d.status === "Active").length.toString(), 
      trend: "+ 2", 
      trendDesc: "on duty", 
      color: "text-orange-500", 
      bg: "bg-orange-500/10", 
      icon: Download, 
      trendUp: true,
      path: "/drivers"
    },
    { 
      title: "Maintenance", 
      value: vehicles.filter(v => v.status === "Maintenance").length.toString(), 
      trend: "- 1", 
      trendDesc: "in workshop", 
      color: "text-purple-500", 
      bg: "bg-purple-500/10", 
      icon: FileText, 
      trendUp: false,
      path: "/vehicles",
      filter: { status: "Maintenance" }
    },
    { 
      title: "Incidents", 
      value: "0", 
      trend: "0", 
      trendDesc: "safety status", 
      color: "text-green-500", 
      bg: "bg-emerald-500/10", 
      icon: CheckCircle2, 
      trendUp: false 
    },
  ];

  const handleDrillDown = (metric: any) => {
    if (metric.path) {
      const tabName = metric.path.replace("/", "");
      const formattedTab = tabName.charAt(0).toUpperCase() + tabName.slice(1);
      window.dispatchEvent(new CustomEvent("tms-navigate", { detail: { tab: formattedTab } }));
    } else if (metric.filter) {
      const field = Object.keys(metric.filter)[0];
      const value = metric.filter[field];
      window.dispatchEvent(new CustomEvent("tms-navigate", { 
        detail: { 
          tab: "Trips",
          filter: field.charAt(0).toUpperCase() + field.slice(1),
          value: value
        } 
      }));
    }
  };

  return (
    <div id="dashboard-kpi-grid" className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#2d2d2d] p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white leading-[28px] h-[28px] text-[16px]">Operational KPIs</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 border-t border-l border-gray-100 dark:border-[#2d2d2d] rounded-xl overflow-hidden">
        {metrics.map((m, i) => (
          <div 
            key={i}
            onClick={() => handleDrillDown(m)}
            className="p-5 flex flex-col justify-between gap-2 transition-all border-r border-b border-gray-100 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer group" 
          >
            <div className="flex items-start justify-between mb-1">
              <div className={`w-8 h-8 rounded-full ${m.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className={`flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold ${m.trendUp ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                {m.trendUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {m.trend}
              </div>
            </div>
            
            <div className="flex flex-col mt-2">
              <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-none mb-1">
                {m.value}
              </div>
              <p className="text-[13px] font-medium text-gray-900 dark:text-gray-300 font-sans truncate">
                {m.title}
              </p>
              <div className="text-[#9c9c9c] font-normal font-sans truncate text-[11px] mt-0.5">
                {m.trendDesc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


