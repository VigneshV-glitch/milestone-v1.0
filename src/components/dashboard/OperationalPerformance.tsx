import React, { useMemo } from "react";
import { AlertTriangle, AlertCircle, Eye, Info, Activity, Target, RefreshCw } from "lucide-react";
import { useTMSData } from "../../utils/useTMSData";
import { calculateSeverity, getSpecificGoodsList, parsePlannedQuantity } from "../../utils/businessRules";

export const OperationalPerformance: React.FC = () => {
  const { trips, refresh } = useTMSData();

  const severityCounts = useMemo(() => {
    const counts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      None: 0
    };

    trips.forEach(trip => {
      if (trip.executions) {
        Object.entries(trip.executions).forEach(([key, exec]: [string, any]) => {
          const [stopIdx, itemIdx] = key.split("_").map(Number);
          const step = trip.routeProgress.steps[stopIdx];
          if (!step) return;

          // Get the goods item to find planned quantity
          let plannedVal = 0;
          if (step.cargoItems?.[itemIdx]) {
            plannedVal = parsePlannedQuantity(step.cargoItems[itemIdx].plannedQuantity || "").value;
          } else {
            const goodsList = getSpecificGoodsList(
              step.goodsType || "",
              stopIdx,
              trip.id,
              trip.routeProgress.steps.length
            );
            const goodsItem = goodsList[itemIdx];
            if (goodsItem) {
              plannedVal = parsePlannedQuantity(goodsItem.quantity).value;
            } else if (itemIdx === 0 && step.quantity) {
              // Fallback to step-level quantity if it's the first item
              plannedVal = parsePlannedQuantity(step.quantity).value;
            }
          }

          if (plannedVal === 0) return;

          const severity = calculateSeverity(exec.reason as any, plannedVal, exec.actualQuantity);
          
          if (severity !== "None") {
            counts[severity]++;
          }
        });
      }
    });

    return counts;
  }, [trips]);


  // Dynamic Fleet Health: Based on percentage of trips without Critical/High issues
  const fleetHealth = useMemo(() => {
    if (trips.length === 0) return 100;
    const problematicTrips = trips.filter(trip => {
      if (!trip.executions) return false;
      return Object.entries(trip.executions).some(([key, exec]: [string, any]) => {
        const [stopIdx, itemIdx] = key.split("_").map(Number);
        const step = trip.routeProgress.steps[stopIdx];
        if (!step) return false;

        let plannedVal = 0;
        if (step.cargoItems?.[itemIdx]) {
          plannedVal = parsePlannedQuantity(step.cargoItems[itemIdx].plannedQuantity || "").value;
        } else {
          const goodsList = getSpecificGoodsList(
            step.goodsType || "",
            stopIdx,
            trip.id,
            trip.routeProgress.steps.length
          );
          const goodsItem = goodsList[itemIdx];
          if (goodsItem) {
            plannedVal = parsePlannedQuantity(goodsItem.quantity).value;
          } else if (itemIdx === 0 && step.quantity) {
            plannedVal = parsePlannedQuantity(step.quantity).value;
          }
        }

        if (plannedVal === 0) return false;

        const severity = calculateSeverity(exec.reason as any, plannedVal, exec.actualQuantity);
        return severity === "Critical" || severity === "High";
      });
    }).length;
    return Math.round(((trips.length - problematicTrips) / trips.length) * 100);
  }, [trips]);


  // Dynamic SLA: Based on completed vs planned
  const slaValue = useMemo(() => {
    if (trips.length === 0) return 100;
    const completedTrips = trips.filter(t => t.status === "Completed").length;
    const totalProcessed = trips.filter(t => t.status === "Completed" || t.status === "In Transit").length || 1;
    return Math.round((completedTrips / totalProcessed) * 100);
  }, [trips]);

  const metrics = [
    {
      title: "Critical",
      value: severityCounts.Critical.toString(),
      subtitle: severityCounts.Critical > 0 ? "Immediate action" : "All clear",
      icon: AlertTriangle,
      color: "text-red-400",
      iconBg: "bg-red-500/10",
      borderColor: "border-red-100 dark:border-red-900/30",
      bgGradient: "bg-gradient-to-b from-white to-red-50/50 dark:from-[#1a1c1a] dark:to-red-900/10",
      chartType: "line",
      chartPath: "M0,25 C10,25 15,10 25,15 C35,20 40,25 50,15 C60,5 65,15 75,25 C85,35 90,10 100,5",
      chartBg: "text-red-100 dark:text-red-900/20",
      linkText: "View Issues"
    },
    {
      title: "High",
      value: severityCounts.High.toString(),
      subtitle: severityCounts.High > 0 ? "Needs attention" : "Normal",
      icon: AlertCircle,
      color: "text-orange-400",
      iconBg: "bg-orange-500/10",
      borderColor: "border-orange-100 dark:border-orange-900/30",
      bgGradient: "bg-gradient-to-b from-white to-orange-50/50 dark:from-[#1a1c1a] dark:to-orange-900/10",
      chartType: "line",
      chartPath: "M0,25 C15,25 20,15 30,15 C40,15 45,25 55,20 C65,15 75,25 85,25 C95,25 95,15 100,15",
      chartBg: "text-orange-100 dark:text-orange-900/20",
      linkText: "View Details"
    },
    {
      title: "Medium",
      value: severityCounts.Medium.toString(),
      subtitle: severityCounts.Medium > 0 ? "Monitor" : "Stable",
      icon: Eye,
      color: "text-yellow-400",
      iconBg: "bg-yellow-500/10",
      borderColor: "border-yellow-100 dark:border-yellow-900/30",
      bgGradient: "bg-gradient-to-b from-white to-yellow-50/50 dark:from-[#1a1c1a] dark:to-yellow-900/10",
      chartType: "line",
      chartPath: "M0,20 C10,20 15,25 25,25 C35,25 40,5 50,5 C60,5 65,25 75,25 C85,25 90,15 100,15",
      chartBg: "text-yellow-100 dark:text-yellow-900/20",
      linkText: "View Trends"
    },
    {
      title: "Low",
      value: severityCounts.Low.toString(),
      subtitle: "Informational",
      icon: Info,
      color: "text-blue-400",
      iconBg: "bg-blue-500/10",
      borderColor: "border-blue-100 dark:border-blue-900/30",
      bgGradient: "bg-gradient-to-b from-white to-blue-50/50 dark:from-[#1a1c1a] dark:to-blue-900/10",
      chartType: "line",
      chartPath: "M0,25 C15,25 20,20 30,20 C40,20 50,25 60,20 C70,15 80,25 90,20 C95,15 95,10 100,10",
      chartBg: "text-blue-100 dark:text-blue-900/20",
      linkText: "View Logs"
    },
    {
      title: "Fleet Health",
      value: `${fleetHealth}%`,
      subtitle: fleetHealth > 90 ? "Excellent" : fleetHealth > 75 ? "Good" : "Warning",
      icon: Activity,
      color: "text-green-400",
      iconBg: "bg-green-500/10",
      borderColor: "border-green-100 dark:border-green-900/30",
      bgGradient: "bg-gradient-to-b from-white to-green-50/50 dark:from-[#1a1c1a] dark:to-green-900/10",
      chartType: "progress",
      progressValue: fleetHealth,
      chartBg: "bg-green-100 dark:bg-green-900/30",
      chartColor: "bg-green-400",
      linkText: "View Health"
    },
    {
      title: "Today's SLA",
      value: `${slaValue}%`,
      subtitle: slaValue > 95 ? "On Track" : slaValue > 85 ? "Stable" : "Critical",
      icon: Target,
      color: "text-green-400",
      iconBg: "bg-green-500/10",
      borderColor: "border-green-100 dark:border-green-900/30",
      bgGradient: "bg-gradient-to-b from-white to-green-50/50 dark:from-[#1a1c1a] dark:to-green-900/10",
      chartType: "progress",
      progressValue: slaValue,
      chartBg: "bg-green-100 dark:bg-green-900/30",
      chartColor: "bg-green-400",
      linkText: "View SLA"
    }
  ];

  return (
    <div className="bg-white dark:bg-[#121212] rounded-[24px] border border-gray-100 dark:border-[#2d2d2d] p-4 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white leading-[28px] h-[28px] text-[16px]">
            Operational Health
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time overview of fleet and operational status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={refresh}
            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#1a1c1a] border border-gray-200 dark:border-[#2d2d2d] rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 flex-1">
        {metrics.map((m, i) => (
          <div
            key={i}
            className={`rounded-[8px] border ${m.borderColor} ${m.bgGradient} p-5 flex flex-col relative overflow-hidden`}
          >
            {/* Top Row: Icon */}
            <div className="flex justify-between items-start mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.iconBg}`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>

            {/* Middle: Value + Titles */}
            <div className="flex flex-col mb-2">
              <div className={`text-[30px] font-bold mb-1 ${m.color}`}>
                {m.value}
              </div>
              <div className="text-[14px] font-bold text-[#101828] dark:text-white">
                {m.title}
              </div>
              <div className={`text-sm font-medium ${m.color}`}>
                {m.subtitle}
              </div>
            </div>

            {/* Bottom: Chart/Progress + Link */}
            <div className="mt-auto">
              {m.chartType === 'line' ? (
                <div className={`h-16 ${m.color} -mx-5 -mb-5 mt-0`}>
                  <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                    <path 
                      d={m.chartPath} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                    <path 
                      d={`${m.chartPath} L100,40 L0,40 Z`} 
                      className={m.chartBg} 
                      fill="currentColor" 
                    />
                  </svg>
                </div>
              ) : (
                <div className="h-16 w-full flex items-end pb-4">
                  <div className={`w-full h-2.5 ${m.chartBg} rounded-full overflow-hidden`}>
                    <div className={`h-full ${m.chartColor} rounded-full`} style={{ width: `${m.progressValue}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

