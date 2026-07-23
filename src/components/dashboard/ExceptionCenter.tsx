import React from "react";
import { AlertTriangle, TrafficCone, Package, Cloud, XCircle, ArrowRight } from "lucide-react";

export const ExceptionCenter: React.FC = () => {
  const exceptions = [
    {
      title: "Traffic Congestion",
      count: 0,
      icon: TrafficCone,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      filterField: "Status",
      filterValue: "Delayed"
    },
    {
      title: "Warehouse Delay",
      count: 0,
      icon: Package,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-50 dark:bg-yellow-900/20",
      filterField: "Status",
      filterValue: "Delayed"
    },
    {
      title: "Vehicle Breakdown",
      count: 0,
      icon: AlertTriangle,
      iconColor: "text-red-500",
      iconBg: "bg-red-50 dark:bg-red-900/20",
      filterField: "Status",
      filterValue: "Delayed"
    },
    {
      title: "Customer Delay",
      count: 0,
      icon: XCircle,
      iconColor: "text-gray-500",
      iconBg: "bg-gray-50 dark:bg-gray-900/20",
      filterField: "Status",
      filterValue: "Delayed"
    },
    {
      title: "Weather",
      count: 0,
      icon: Cloud,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      filterField: "Status",
      filterValue: "Delayed"
    }
  ];

  const handleRedirect = (filterField: string, filterValue: string) => {
    window.dispatchEvent(new CustomEvent("tms-navigate", {
      detail: {
        tab: "Trips",
        filter: filterField,
        value: filterValue
      }
    }));
  };

  return (
    <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#2d2d2d] p-4 flex flex-col h-full gap-4">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-gray-900 dark:text-white leading-[28px] h-[28px] text-[16px]">
          Exception Center
        </h2>
        <button 
          onClick={() => handleRedirect("Status", "Delayed")}
          className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          view all <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col border-t border-l border-gray-100 dark:border-[#2d2d2d] rounded-xl overflow-hidden">
          {exceptions.map((exception, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-white dark:bg-[#121212] border-b border-r border-gray-100 dark:border-[#2d2d2d]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${exception.iconBg} flex items-center justify-center shrink-0`}>
                  <exception.icon className={`w-4 h-4 ${exception.iconColor}`} />
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">
                  {exception.title}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {exception.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
