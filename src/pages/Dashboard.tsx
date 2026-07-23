/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { KPICards } from "../components/dashboard/KPICards";
import { OperationalPerformance } from "../components/dashboard/OperationalPerformance";
import { ExceptionCenter } from "../components/dashboard/ExceptionCenter";
import { FleetAndOperatorStatus } from "../components/dashboard/FleetAndOperatorStatus";
import { ChartsSection } from "../components/dashboard/ChartsSection";
import { RecentActivities } from "../components/dashboard/RecentActivities";

const Dashboard: React.FC = () => {
  return (
    <div className="animate-fade-in flex flex-col h-full animate-fade-in" id="dashboard-page-container">
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[24px] font-bold text-[#3e3e3e] dark:text-white">
              Dashboard
            </h1>
            <p className="text-[13px] font-normal text-[#9c9c9c] mt-1 font-sans">
              Milestone intelligence feed. Live updates from global verification nodes.
            </p>
          </div>
        </div>

        {/* Top KPI Cards Grid */}
        <KPICards />
        
        {/* Secondary Widgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <OperationalPerformance />
          </div>
          <div className="lg:col-span-1">
            <ExceptionCenter />
          </div>
        </div>

        {/* Charts & Interactive Data Visualizations Section */}
        <ChartsSection />

        {/* Fleet Resource & Operator Status Hub */}
        <div className="grid grid-cols-1">
          <FleetAndOperatorStatus />
        </div>

        {/* Recent Real-time Activities & System Alerts Feed */}
        <RecentActivities />
      </div>
    </div>
  );
};

export default Dashboard;
