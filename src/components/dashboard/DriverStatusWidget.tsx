import React, { useState, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  PolarAngleAxis
} from "recharts";
import {
  Users,
  CheckCircle2,
  Truck,
  Coffee,
  Activity,
  Clock,
  ExternalLink
} from "lucide-react";
import { Driver } from "../../types";

export const DriverStatusWidget: React.FC<{ noWrapper?: boolean }> = ({ noWrapper }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filter, setFilter] = useState("Today");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const savedDrivers = localStorage.getItem("tms_drivers");
    if (savedDrivers) {
      setDrivers(JSON.parse(savedDrivers));
    }
  }, []);

  const triggerNavigate = (tab: string, filterField?: string, filterValue?: string) => {
    window.dispatchEvent(
      new CustomEvent("tms-navigate", {
        detail: { tab, filter: filterField, value: filterValue },
      })
    );
  };

  const totalDrivers = drivers.length || 1;

  const rawStats = [
    {
      status: "Driving",
      label: "Driving active",
      count: drivers.filter((d) => d.status === "Driving").length || 0,
      color: "#00d2ff", // Neon Cyan
      textColor: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      icon: <Truck className="w-5 h-5 text-cyan-500" />
    },
    {
      status: "Loading",
      label: "Supervising load",
      count: drivers.filter((d) => d.status === "Loading").length || 0,
      color: "#9d50bb", // Neon Purple
      textColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
      icon: <Activity className="w-5 h-5 text-purple-500" />
    },
    {
      status: "Available",
      label: "Standby / Duty",
      count: drivers.filter((d) => d.status === "Available").length || 0,
      color: "#3a7bd5", // Neon Blue
      textColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />
    },
    {
      status: "Resting",
      label: "Mandatory Break",
      count: drivers.filter((d) => d.status === "Resting").length || 0,
      color: "#f59e0b", // amber-500
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      icon: <Coffee className="w-5 h-5 text-amber-500" />
    },
    {
      status: "Off Duty",
      label: "Off-Clock",
      count: drivers.filter((d) => d.status === "Off Duty").length || 0,
      color: "#6b7280", // gray-500
      textColor: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100/10",
      icon: <Clock className="w-5 h-5 text-gray-500" />
    },
    {
      status: "On Leave",
      label: "Leave / Vacation",
      count: drivers.filter((d) => d.status === "On Leave").length || 0,
      color: "#ec4899", // pink-500
      textColor: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-500/10",
      icon: <Users className="w-5 h-5 text-pink-500" />
    }
  ];

  const chartData = rawStats.map((item, index) => ({
    name: item.status,
    value: Math.max(5, Math.round((item.count / totalDrivers) * 100)), // min 5% for visibility
    actualCount: item.count,
    fill: hoveredIndex === null || hoveredIndex === index ? item.color : `${item.color}33`,
    icon: item.icon,
    full: 100
  }));

  const activeSegment = hoveredIndex !== null ? chartData[hoveredIndex] : null;

  // Additional active ratio calculation
  const onDutyCount = totalDrivers - (rawStats[4].count);
  const onDutyPct = Math.round((onDutyCount / totalDrivers) * 100);

  const content = (
    <>
      {!noWrapper && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-[#3e3e3e] dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                Operators Status Pool
              </h3>
              <p className="text-[13px] font-normal text-[#9c9c9c] mt-1 font-sans">
                Operator shifts, breaks & active hours
              </p>
            </div>
          </div>
          <div className="flex bg-gray-100/80 dark:bg-[#1a1a1a] rounded-lg p-1 mt-2 sm:mt-0">
            {["Today", "This Week", "This Month"].map(option => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-1 text-[11px] font-bold rounded-md transition-all ${
                  filter === option
                    ? "bg-white dark:bg-[#2d2d2d] text-[#111827] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart and Status Grid Section */}
      <div className="flex flex-col xl:flex-row items-center xl:items-start justify-start gap-10 py-2 px-2 mt-auto" id="driver-status-pool-container">
        <div className="w-72 h-72 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="15%"
              outerRadius="100%"
              barSize={10}
              data={chartData}
              startAngle={90}
              endAngle={450}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: 'rgba(160, 160, 160, 0.2)' }}
                dataKey="value"
                cornerRadius={12}
                onMouseEnter={(_, idx) => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-gray-900 dark:bg-[#1a1a1a] text-white px-3 py-2 rounded-xl border border-gray-800 dark:border-[#333] shadow-2xl backdrop-blur-md flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }} />
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black leading-none">{data.value}%</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{data.name}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Grid of pool clickers */}
        <div className="grid grid-cols-2 gap-2 flex-1 w-full">
          {rawStats.map((item, index) => {
            const isCurrentHovered = hoveredIndex === index;
            return (
              <button
                key={item.status}
                onClick={() => triggerNavigate("Drivers", "Status", item.status)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer h-20 ${
                  isCurrentHovered
                    ? "border-primary-500 bg-primary-50/10 dark:bg-primary-950/10"
                    : "border-gray-100 dark:border-[#2d2d2d] bg-transparent hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 dark:text-gray-300 truncate">
                      {item.status}
                    </p>
                    <p className="text-[11px] text-[#9c9c9c] font-normal truncate leading-tight mt-0.5">
                      {item.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-right pl-2 shrink-0">
                  <span className="text-[20px] font-bold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return noWrapper ? content : (
    <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-[#2d2d2d] flex flex-col h-full" id="driver-status-card">
      {content}
    </div>
  );
};
