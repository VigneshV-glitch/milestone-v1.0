/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { ListChecks, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";

const weekData: any[] = [];
const monthData: any[] = [];
const yearData: any[] = [];
const lineData: any[] = [];
const line30DData: any[] = [];
const line7DData: any[] = [];

export const ChartsSection: React.FC = () => {
  const [barPeriod, setBarPeriod] = useState("Week");
  const [linePeriod, setLinePeriod] = useState("7D");

  const getFilteredBarData = () => {
    if (barPeriod === "Month") {
      return [...monthData];
    } else if (barPeriod === "Year") {
      return [...yearData];
    }
    return [...weekData];
  };

  const activeBarData = getFilteredBarData();

  const getActiveLineData = () => {
    if (linePeriod === "7D") return line7DData;
    if (linePeriod === "30D") return line30DData;
    return lineData;
  };

  const activeLineData = getActiveLineData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-0" id="dashboard-charts-section">
      {/* Chart 1: Bar Chart */}
      <div className="bg-white dark:bg-[#121212] p-6 rounded-[24px] border border-gray-100 dark:border-[#2d2d2d] flex flex-col min-h-[480px]" id="chart-trips-by-day">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 mb-6">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white leading-[28px] h-[28px] text-[16px]">
              Trips by Day
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Daily Status Breakdown
            </p>
          </div>
          <div className="flex bg-gray-100/80 dark:bg-[#1a1a1a] rounded-lg p-1 mt-2 sm:mt-0">
            {[
              { label: "1W", value: "Week" },
              { label: "1M", value: "Month" },
              { label: "1Y", value: "Year" }
            ].map((period) => (
              <button
                key={period.value}
                type="button"
                onClick={() => setBarPeriod(period.value)}
                className={`px-4 py-1 text-[11px] font-bold rounded-md transition-all ${
                  barPeriod === period.value
                    ? "bg-white dark:bg-[#2d2d2d] text-[#111827] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-1 mb-6">
          {[
            { label: "Completed", color: "bg-[#2563eb]" },
            { label: "In Transit", color: "#8b5cf6" },
            { label: "Scheduled", color: "bg-[#64748b]" },
            { label: "Delayed", color: "bg-[#ec4899]" }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-[3px] ${typeof item.color === 'string' && item.color.startsWith('bg') ? item.color : ''}`} style={!item.color.startsWith('bg') ? { backgroundColor: item.color } : {}} />
              <span className="text-[13px] font-bold text-[#3e3e3e] dark:text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-[240px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeBarData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              barGap={4}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 600 }}
                dy={8}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 600 }}
                tickFormatter={(value) => `${value}k`}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-[#2d2d2d] rounded-xl shadow-lg p-3.5 space-y-1.5 text-xs font-semibold">
                        <p className="text-gray-900 dark:text-white font-bold mb-1">
                          {label} Operations
                        </p>
                        {payload.map((item: any) => (
                          <div key={item.name} className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span>{item.name}:</span>
                            </div>
                            <span className="text-gray-900 dark:text-white">
                              {item.value}k trips
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="Completed" fill="#2563eb" radius={[2, 2, 0, 0]} barSize={6} />
              <Bar dataKey="In Transit" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={6} />
              <Bar dataKey="Scheduled" fill="#64748b" radius={[2, 2, 0, 0]} barSize={6} />
              <Bar dataKey="Delayed" fill="#ec4899" radius={[2, 2, 0, 0]} barSize={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-normal text-gray-400">Aggregate Target</span>
            <span className="text-[13px] font-bold text-[#111827] dark:text-white">Varies by period</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800/60 rounded-full overflow-hidden">
            <div className="h-full bg-[#10b981] rounded-full" style={{ width: "70%" }} />
          </div>
        </div>
      </div>

      {/* Chart 2: OTP */}
      <div className="bg-white dark:bg-[#121212] p-6 rounded-[24px] border border-gray-100 dark:border-[#2d2d2d] flex flex-col min-h-[480px]" id="chart-metrics-reports">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 mb-6">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white leading-[28px] h-[28px] text-[16px]">
              On-Time Performance (OTP)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Average SLA Delivery Trend
            </p>
          </div>
          <div className="flex bg-gray-100/80 dark:bg-[#1a1a1a] rounded-lg p-1 mt-2 sm:mt-0">
            {[
              { label: "1W", value: "7D" },
              { label: "1M", value: "30D" },
              { label: "1Y", value: "ALL" }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setLinePeriod(period.value)}
                className={`px-4 py-1 text-[11px] font-bold rounded-md transition-all ${
                  linePeriod === period.value
                    ? "bg-white dark:bg-[#2d2d2d] text-[#111827] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-[240px] w-full relative mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeLineData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              barCategoryGap={0}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
                dy={8}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-[#2d2d2d] rounded-lg shadow-lg px-3 py-2 text-[11px] font-bold">
                        {payload[0].value}% OTP
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                shape={(props: any) => {
                  const { x, y, width, height } = props;
                  return (
                    <g>
                      <rect x={x} y={y} width={width} height={height} fill="url(#barGradient)" />
                      <rect x={x} y={y} width={width} height={2} fill="#8b5cf6" />
                    </g>
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-normal text-gray-400">Average SLA Adherence</span>
            <span className="text-[13px] font-bold text-[#111827] dark:text-white">94.2% Compliance</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800/60 rounded-full overflow-hidden">
            <div className="h-full bg-[#10b981] rounded-full" style={{ width: "94.2%" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
