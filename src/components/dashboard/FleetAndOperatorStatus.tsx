/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from "react";
import { VehicleStatusWidget } from "./VehicleStatusWidget";
import { DriverStatusWidget } from "./DriverStatusWidget";
import { Truck, Users } from "lucide-react";

export const FleetAndOperatorStatus: React.FC = () => {
  const [activeView, setActiveView] = useState<"Vehicles" | "Operators">("Vehicles");

  return (
    <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-[#2d2d2d] flex flex-col h-full" id="fleet-operator-status-card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white leading-[28px] h-[28px]">
            {activeView === "Vehicles" ? "Vehicles Status Fleet Pool" : "Operators Status Pool"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {activeView === "Vehicles" 
              ? "Real-time mechanical & dispatch state" 
              : "Operator shifts, breaks & active hours"}
          </p>
        </div>
        <div className="flex bg-gray-100/80 dark:bg-[#1a1a1a] rounded-lg p-1 mt-2 sm:mt-0">
          <button
            onClick={() => setActiveView("Vehicles")}
            className={`flex items-center gap-2 px-4 py-1 text-[11px] font-bold rounded-md transition-all ${
              activeView === "Vehicles"
                ? "bg-white dark:bg-[#2d2d2d] text-[#111827] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => setActiveView("Operators")}
            className={`flex items-center gap-2 px-4 py-1 text-[11px] font-bold rounded-md transition-all ${
              activeView === "Operators"
                ? "bg-white dark:bg-[#2d2d2d] text-[#111827] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Operators
          </button>
        </div>
      </div>

      <div className="flex-1">
        {activeView === "Vehicles" ? <VehicleStatusWidget noWrapper={true} /> : <DriverStatusWidget noWrapper={true} />}
      </div>
    </div>
  );
};
