/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import {
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Truck,
} from "lucide-react";

export const OperationalSummary: React.FC = () => {
  const metrics = [
    { title: "Trips Started", value: "42", desc: "Trips dispatched today", color: "text-blue-500", icon: Play },
    { title: "Trips Completed", value: "38", desc: "Completed successfully today", color: "text-green-500", icon: CheckCircle2 },
    { title: "Remaining Deliveries", value: "17", desc: "Deliveries to be completed", color: "text-gray-500", icon: Clock },
    { title: "Delayed Stops", value: "4", desc: "Delayed beyond planned ETA", color: "text-red-500", icon: AlertCircle },
    { title: "Pending POD", value: "6", desc: "Awaiting POD confirmation", color: "text-purple-500", icon: FileText },
    { title: "Loading", value: "8", desc: "Vehicles actively loading", color: "text-orange-500", icon: Upload },
    { title: "Unloading", value: "5", desc: "Vehicles actively unloading", color: "text-orange-500", icon: Download },
    { title: "Active Dispatches", value: "23", desc: "Currently in transit", color: "text-green-500", icon: Truck },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h2 className="text-[18px] font-semibold text-[#3e3e3e] dark:text-white font-sans">
          Today's Operations
        </h2>
        <p className="text-[13px] font-normal text-[#9c9c9c] font-sans">
          Real-time operational summary for today's dispatch activities
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4" id="operational-summary-grid">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-100 dark:border-[#2d2d2d] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className={`p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 ${m.color}`}>
                <m.icon className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#9c9c9c] font-sans truncate">{m.title}</p>
              <div className="text-[24px] font-bold text-gray-900 dark:text-white leading-tight mt-0.5">{m.value}</div>
            </div>
            <p className="text-[10px] font-normal text-[#9c9c9c] mt-2 font-sans line-clamp-2">{m.desc}</p>
          </div>
        ))}
      </div>
      
      <p className="text-[13px] text-[#9c9c9c] font-medium pt-2 text-center">
        17 deliveries remain before today's schedule is complete.
      </p>
    </div>
  );
};
