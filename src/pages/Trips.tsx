import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ListTable, Column } from "../components/layout/ListTable";
import { DateRangeSelector } from "../components/dashboard/DateRangeSelector";
import { useTMSData } from "../utils/useTMSData";
import { showFeedback } from "../components/layout/FeedbackOverlay";
import { 
  TRIP_STATUS_COLORS, 
  TRIP_LIFECYCLE, 
  logActivity,
  calculateSeverity,
  getSpecificGoodsList,
  parsePlannedQuantity
} from "../utils/businessRules";
import { DelayReason, Severity, DelayEvent } from "../types";
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Upload,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Eye,
  FileText,
  RefreshCw,
  Share2,
  Edit2,
  Trash2,
  MapPin,
  User,
  UserPlus,
  Truck,
  Settings2,
  Activity,
  Phone,
  Clock,
  FileCheck,
  Info,
  Calendar,
  Hash,
  CheckCircle2,
  Check,
  Circle,
  ArrowUpDown,
  Package,
  AlertTriangle,
} from "lucide-react";

const tripStatuses = TRIP_LIFECYCLE.concat(["Delayed", "Closed"]);
const tripCities = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
];

const generateTrips = (count: number) => {
  const statusColors: Record<string, string> = {
    "In Transit":
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Completed:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Delayed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Scheduled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  return Array.from({ length: count }, (_, i) => {
    const origin = tripCities[Math.floor(Math.random() * tripCities.length)];
    let destination = tripCities[Math.floor(Math.random() * tripCities.length)];
    while (origin === destination) {
      destination = tripCities[Math.floor(Math.random() * tripCities.length)];
    }

    const delayReasons = [
      "Traffic Congestion",
      "Weather",
      "Vehicle Breakdown",
      "Warehouse Delay",
      "Customer Delay",
    ];
    let status =
      tripStatuses[Math.floor(Math.random() * tripStatuses.length)];
    let delayReason: string | undefined;

    if (i < 3) {
      status = "Delayed";
      delayReason = "Traffic Congestion";
    } else if (i < 5) {
      status = "Delayed";
      delayReason = "Warehouse Delay";
    } else if (i < 6) {
      status = "Delayed";
      delayReason = "Vehicle Breakdown";
    } else if (i < 7) {
      status = "Delayed";
      delayReason = "Customer Delay";
    } else if (i < 11) {
      status = "Delayed";
      delayReason = "Weather";
    } else {
      delayReason =
        status === "Delayed" ? delayReasons[i % delayReasons.length] : undefined;
    }

    // Generate route steps
    const totalStops = Math.floor(Math.random() * 3) + 1; // 1 to 3 intermediate stops
    const intermediateCities = tripCities
      .filter((c) => c !== origin && c !== destination)
      .sort(() => 0.5 - Math.random())
      .slice(0, totalStops);

    let completedStopsCount = 0;
    if (status === "Completed")
      completedStopsCount = totalStops + 1; // all completed
    else if (status === "Scheduled")
      completedStopsCount = -1; // -1 means origin not even started
    else completedStopsCount = Math.floor(Math.random() * totalStops); // 0 to totalStops-1 intermediate completed

    const loadTypes = [
      "Electronics",
      "Furniture",
      "Medical Supplies",
      "Machinery",
      "Groceries",
      "Automotive",
      "Textiles",
    ];
    const priorities = ["Low", "Medium", "High", "Critical"];
    const now = new Date(Date.now() - Math.floor(Math.random() * 10000000000));

    const vehicleNo = `TN ${String(Math.floor(Math.random() * 99)).padStart(2, "0")} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const driverContact = `+1 (${String(Math.floor(Math.random() * 900) + 100)}) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const loadType = loadTypes[Math.floor(Math.random() * loadTypes.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const currentLocation =
      status === "Completed"
        ? "Delivered"
        : status === "Scheduled"
          ? "At Origin Facility"
          : `Highway Near ${intermediateCities.length > 0 ? intermediateCities[0] : origin}`;

    const getRandomGoods = (lType: string, index: number) => {
      const qty = Math.floor(Math.random() * 120) + 15;
      const units = ["Pallets", "Boxes", "Crates", "Cartons", "Units"];
      const unit = units[index % units.length];
      return { goodsType: lType, quantity: `${qty} ${unit}` };
    };

    const routeSteps = [];

    // Add Origin
    const originStatus =
      status === "Scheduled"
        ? "pending"
        : status === "Completed" || completedStopsCount >= 0
          ? "completed"
          : "current";

    const originGoods = getRandomGoods(loadType, 0);
    routeSteps.push({
      location: origin,
      type: "Pickup",
      time:
        originStatus === "pending"
          ? new Date(now.getTime()).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : new Date(now.getTime() - 48 * 60 * 60 * 1000).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              },
            ),
      status: originStatus,
      ...originGoods,
    });

    for (let j = 0; j < totalStops; j++) {
      const stepStatus =
        status === "Scheduled"
          ? "pending"
          : status === "Completed"
            ? "completed"
            : j < completedStopsCount
              ? "completed"
              : j === completedStopsCount
                ? "current"
                : "pending";

      const stepGoods = getRandomGoods(loadType, j + 1);
      routeSteps.push({
        location: intermediateCities[j],
        type: j % 3 === 0 ? "Transit" : j % 3 === 1 ? "Delivery" : "Pickup",
        time:
          stepStatus === "pending"
            ? new Date(
                now.getTime() + (j + 1) * 6 * 60 * 60 * 1000,
              ).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : new Date(
                now.getTime() - (24 - j * 10) * 60 * 60 * 1000,
              ).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
        status: stepStatus,
        ...stepGoods,
      });
    }

    // Add Destination
    const destStatus =
      status === "Completed"
        ? "completed"
        : completedStopsCount === totalStops
          ? "current"
          : "pending";

    const destGoods = getRandomGoods(loadType, totalStops + 1);
    routeSteps.push({
      location: destination,
      type: "Delivery",
      time:
        destStatus === "pending"
          ? new Date(now.getTime() + 48 * 60 * 60 * 1000).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              },
            )
          : new Date(now.getTime() + 48 * 60 * 60 * 1000).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              },
            ),
      status: destStatus,
      ...destGoods,
    });

    const completedCount = routeSteps.filter(
      (s) => s.status === "completed",
    ).length;
    let nextStop = routeSteps.find((s) => s.status === "pending");
    if (!nextStop) nextStop = routeSteps.find((s) => s.status === "current");
    if (status === "Completed") nextStop = routeSteps[routeSteps.length - 1]; // if completed, next is destination (doesn't matter)

    const routeProgress = {
      steps: routeSteps,
      totalStops: routeSteps.length,
      completedCount,
      nextStopLocation: nextStop?.location.split(",")[0] || "N/A",
    };
    const etaDt = new Date(now.getTime() + Math.random() * 86400000 * 5);
    const eta = etaDt.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour12: false,
    });
    const podStatus = status === "Completed" ? "Verified" : "Pending";
    const lastUpdated = `${Math.floor(Math.random() * 59) + 1} mins ago`;
    const distance = `${(Math.random() * 2000 + 100).toFixed(0)} km`;
    const fuelUsed = `${(Math.random() * 400 + 50).toFixed(0)} L`;
    const expectedDelivery = etaDt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return {
      id: `TRP-${10000 + i}`,
      date: now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      driver: ["John Doe", "Jane Smith", "Michael Johnson", "Emily Davis"][i % 4],
      origin: origin,
      destination: destination,
      status: status,
      statusColor: statusColors[status],
      delayReason,
      amount: `$${(Math.random() * 5000 + 500).toFixed(2)}`,
      vehicleNo,
      driverContact,
      loadType,
      priority,
      currentLocation,
      eta,
      podStatus,
      lastUpdated,
      distance,
      totalStops,
      fuelUsed,
      expectedDelivery,
      createdTime: new Date(now.getTime() - 86400000).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      assignedTime: new Date(now.getTime() - 43200000).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      loadedTime:
        status === "Scheduled"
          ? "--"
          : new Date(now.getTime() - 21600000).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
      dispatchedTime:
        status === "Scheduled"
          ? "--"
          : new Date(now.getTime() - 10800000).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
      inTransitTime:
        status === "Scheduled"
          ? "--"
          : new Date(now.getTime() - 5400000).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
      deliveredTime:
        status === "Completed"
          ? new Date(now.getTime() - 3600000).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "--",
      routeProgress,
    };
  });
};


  // 2. At the last stop (Destination), everything must be delivered (cannot pick up new items at the end of the trip)


const Trips: React.FC = () => {
  const { trips, drivers, vehicles, updateTripStatus, bulkUpdateTripStatus, assignResources, saveTrip } = useTMSData();
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);

  // Handle cross-page navigation with filters
  useEffect(() => {
    const navFilterField = sessionStorage.getItem("tms_nav_filter_field");
    const navFilterValue = sessionStorage.getItem("tms_nav_filter_value");
    if (navFilterField && navFilterValue) {
      sessionStorage.removeItem("tms_nav_filter_field");
      sessionStorage.removeItem("tms_nav_filter_value");
      
      if (navFilterField === "id" || navFilterField === "searchTerm") {
        setSearchTerm(navFilterValue);
      } else {
        const fieldName = navFilterField === "Status" ? "Status" : navFilterField;
        const newF = { id: "nav-filter", field: fieldName, operator: "equals", value: navFilterValue };
        setAdvancedFilters([newF]);
        setAppliedFilters([newF]);
        setActiveFiltersCount(1);
      }
    }
  }, []);

  // Modals for Actions
  const [activeModal, setActiveModal] = useState<"assign-driver" | "assign-vehicle" | "execution-details" | null>(null);
  const [selectedTripForAction, setSelectedTripForAction] = useState<any | null>(null);
  const [selectedDriverIdForModal, setSelectedDriverIdForModal] = useState("");
  const [selectedVehicleIdForModal, setSelectedVehicleIdForModal] = useState("");
  const [selectedStatusForModal, setSelectedStatusForModal] = useState("");

  const [selectedCargoItem, setSelectedCargoItem] = useState<{
    goodsItem: { name: string; quantity: string; type: "Pickup" | "Delivery" };
    itemIdx: number;
    stopIdx: number;
    tripId: string;
    location: string;
  } | null>(null);

  const [actualQuantity, setActualQuantity] = useState<number>(0);
  const [executionReason, setExecutionReason] = useState<string>("No Discrepancy");
  const [executionRemarks, setExecutionRemarksState] = useState<string>("");

  const tripDateRef = React.useRef<HTMLInputElement>(null);
  const expectedDeliveryRef = React.useRef<HTMLInputElement>(null);

  const convertFormattedDateToISO = (dateStr: string): string => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const convertISOToFormattedDate = (isoStr: string): string => {
    if (!isoStr) return "";
    const parts = isoStr.split("-");
    if (parts.length !== 3) return isoStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[monthIdx] || "Jan";
    return `${monthName} ${day}, ${year}`;
  };

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any | null>(null);

  // Accordion States
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>(['trip-info']);

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Delay Management State
  const [reportDelay, setReportDelay] = useState(false);
  const [delayReason, setDelayReason] = useState<DelayReason | "">("");
  const [delaySeverity, setDelaySeverity] = useState<Severity | "">("");
  const [delayRemarks, setDelayRemarks] = useState("");
  const [estimatedRecovery, setEstimatedRecovery] = useState("");
  const [delayErrors, setDelayErrors] = useState<{
    reason?: string;
    severity?: string;
    remarks?: string;
  }>({});

  // Reset delay state when drawer closes/opens
  useEffect(() => {
    if (!isEditDrawerOpen) {
      setReportDelay(false);
      setDelayReason("");
      setDelaySeverity("");
      setDelayRemarks("");
      setEstimatedRecovery("");
      setDelayErrors({});
    }
  }, [isEditDrawerOpen]);

  // Auto-calculate severity based on reason
  useEffect(() => {
    if (delayReason) {
      let autoSeverity: Severity = "Medium";
      switch (delayReason) {
        case "Vehicle Breakdown":
        case "Mechanical Inspection":
        case "Road Closure":
          autoSeverity = "High";
          break;
        case "Critical": // Not a reason, but just in case
          autoSeverity = "Critical";
          break;
        case "Damaged Goods":
        case "Customer Rejected":
          autoSeverity = "Medium";
          break;
        case "Traffic Congestion":
        case "Weather":
        case "Loading Delay":
        case "Unloading Delay":
          autoSeverity = "Low";
          break;
        default:
          autoSeverity = "Medium";
      }
      setDelaySeverity(autoSeverity);
    }
  }, [delayReason]);

  // Handle universal search event
  useEffect(() => {
    const handleUniversalSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ searchTerm: string }>;
      if (customEvent.detail && typeof customEvent.detail.searchTerm === 'string') {
        setSearchTerm(customEvent.detail.searchTerm);
        setSelectedView("Custom View");
      }
    };
    window.addEventListener('tms-universal-search', handleUniversalSearch);
    return () => {
      window.removeEventListener('tms-universal-search', handleUniversalSearch);
    };
  }, []);

  // Handle deep link event for universal search
  useEffect(() => {
    const handleDeepLink = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; id: string; metadata?: any }>;
      if (customEvent.detail && (customEvent.detail.type === 'Trip' || customEvent.detail.type === 'Cargo' || customEvent.detail.type === 'Stop' || customEvent.detail.type === 'Exception')) {
        const tripId = customEvent.detail.metadata?.tripId || (customEvent.detail.type === 'Trip' ? customEvent.detail.id : null);
        if (tripId) {
          setSearchTerm(tripId);
          setExpandedTripId(tripId);
          setSelectedView("Custom View");
          
          // Scroll into view logic
          setTimeout(() => {
            const element = document.getElementById(`row-${tripId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      }
    };
    window.addEventListener('tms-deep-link', handleDeepLink);
    return () => window.removeEventListener('tms-deep-link', handleDeepLink);
  }, []);

  const [activePicker, setActivePicker] = useState<'header' | 'form' | null>(null);

  useEffect(() => {
    if (!isEditDrawerOpen) {
      setActivePicker(null);
    }
  }, [isEditDrawerOpen]);

  const driversOptions = drivers;
  const vehiclesOptions = vehicles;

  const originOptions = useMemo(() => {
    const cities = new Set(tripCities);
    trips.forEach((t: any) => {
      if (t.origin) cities.add(t.origin);
    });
    return Array.from(cities);
  }, [trips]);

  const destinationOptions = useMemo(() => {
    const cities = new Set(tripCities);
    trips.forEach((t: any) => {
      if (t.destination) cities.add(t.destination);
    });
    return Array.from(cities);
  }, [trips]);

  const loadTypeOptions = useMemo(() => {
    const types = new Set([
      "Electronics",
      "Furniture",
      "Medical Supplies",
      "Machinery",
      "Groceries",
      "Automotive",
      "Textiles",
    ]);
    trips.forEach((t: any) => {
      if (t.loadType) types.add(t.loadType);
    });
    return Array.from(types);
  }, [trips]);

  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem('tms_search') || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importTab, setImportTab] = useState<"import" | "history">("import");
  const [currentPage, setCurrentPage] = useState(() => parseInt(sessionStorage.getItem('tms_page') || '1'));
  const [itemsPerPage, setItemsPerPage] = useState(() => parseInt(sessionStorage.getItem('tms_items_per_page') || '10'));
  const [openImportHistoryMenu, setOpenImportHistoryMenu] = useState<
    number | null
  >(null);
  const [openTripMenu, setOpenTripMenu] = useState<string | null>(null);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [selectedStopIdx, setSelectedStopIdx] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc" | null;
  }>(() => {
    const saved = sessionStorage.getItem('tms_sort');
    return saved ? JSON.parse(saved) : { field: "", direction: null };
  });

  // Persist state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('tms_search', searchTerm);
    sessionStorage.setItem('tms_page', currentPage.toString());
    sessionStorage.setItem('tms_items_per_page', itemsPerPage.toString());
    sessionStorage.setItem('tms_sort', JSON.stringify(sortConfig));
  }, [searchTerm, currentPage, itemsPerPage, sortConfig]);

  const [isSaveViewModalOpen, setIsSaveViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  type FilterAction = {
    id: string;
    field: string;
    operator: string;
    value: string;
  };

  type SavedView = {
    name: string;
    searchTerm: string;
    appliedFilters: FilterAction[];
  };

  const initialViews: SavedView[] = [
    { name: "Default View", searchTerm: "", appliedFilters: [] },
    {
      name: "Completed Trips",
      searchTerm: "",
      appliedFilters: [
        { id: "v1", field: "Status", operator: "is", value: "Completed" },
      ],
    },
    {
      name: "In Transit Trips",
      searchTerm: "",
      appliedFilters: [
        { id: "v2", field: "Status", operator: "is", value: "In Transit" },
      ],
    },
  ];

  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    const saved = localStorage.getItem("tms_saved_views");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialViews;
  });

  useEffect(() => {
    localStorage.setItem("tms_saved_views", JSON.stringify(savedViews));
  }, [savedViews]);

  const [selectedView, setSelectedView] = useState("Default View");
  const [activeFiltersCount, setActiveFiltersCount] = useState(() => parseInt(sessionStorage.getItem('tms_active_filters_count') || '0'));
  
  const handleViewChange = (viewName: string) => {
    setSelectedView(viewName);
    const view = savedViews.find((v) => v.name === viewName);
    if (view) {
      setSearchTerm(view.searchTerm);
      // Use clones to avoid reference sharing
      const filterClones = view.appliedFilters.map(f => ({ ...f }));
      setAdvancedFilters(filterClones);
      setAppliedFilters(filterClones);
      
      let count = 0;
      if (view.searchTerm) count++;
      count += view.appliedFilters.length;
      setActiveFiltersCount(count);
    }
  };

  const [advancedFilters, setAdvancedFilters] = useState<FilterAction[]>(() => {
    const saved = sessionStorage.getItem('tms_advanced_filters');
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterAction[]>(() => {
    const saved = sessionStorage.getItem('tms_applied_filters');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist advanced/applied filters
  useEffect(() => {
    sessionStorage.setItem('tms_active_filters_count', activeFiltersCount.toString());
    sessionStorage.setItem('tms_advanced_filters', JSON.stringify(advancedFilters));
    sessionStorage.setItem('tms_applied_filters', JSON.stringify(appliedFilters));
  }, [activeFiltersCount, advancedFilters, appliedFilters]);
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
  const availableFields = ["Status", "Driver", "Origin", "Destination", "Date", "Severity"];

  const addFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const field = e.target.value;
    if (!field) return;
    setAdvancedFilters([
      ...advancedFilters,
      { id: Math.random().toString(), field, operator: "is", value: "" },
    ]);
    setSelectedView("Custom View");
  };

  const removeFilter = (id: string) => {
    setAdvancedFilters(advancedFilters.filter((f) => f.id !== id));
    setSelectedView("Custom View");
  };

  const updateFilter = (id: string, key: keyof FilterAction, value: string) => {
    setAdvancedFilters(
      advancedFilters.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
    );
    setSelectedView("Custom View");
  };

  const handleApplyFilters = () => {
    const validFilters = advancedFilters.filter((f) => f.value.trim() !== "");
    let count = validFilters.length;
    if (searchTerm) count++;
    setActiveFiltersCount(count);
    setAppliedFilters(validFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setAdvancedFilters([]);
    setAppliedFilters([]);
    setActiveFiltersCount(0);
    setSelectedView("Default View");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;

    // Capture original trip to compare status later
    const originalTrip = trips.find(t => t.id === editingTrip.id);
    let targetStatus = editingTrip.status;

    // Prepare updated trip
    let updatedTrip = { ...editingTrip };

    // Validation for delay reporting
    if (reportDelay) {
      const errors: any = {};
      if (!delayReason) errors.reason = "Reason is required";
      if (!delaySeverity) errors.severity = "Severity is required";
      if (!delayRemarks) {
        errors.remarks = "Remarks are required";
      } else if (delayRemarks.length < 20) {
        errors.remarks = "Remarks must be at least 20 characters";
      } else if (delayRemarks.length > 500) {
        errors.remarks = "Remarks must not exceed 500 characters";
      }

      if (Object.keys(errors).length > 0) {
        setDelayErrors(errors);
        return;
      }

      // Handle Delay Event Creation
      const newDelayEvent: DelayEvent = {
        id: Math.random().toString(36).substring(2, 9),
        tripId: editingTrip.id,
        reason: delayReason as DelayReason,
        severity: delaySeverity as Severity,
        remarks: delayRemarks,
        reportedBy: "Current User",
        reportedAt: new Date().toISOString(),
        estimatedRecovery: estimatedRecovery || undefined,
        status: "Open"
      };

      updatedTrip.delayEvents = [...(updatedTrip.delayEvents || []), newDelayEvent];
      updatedTrip.status = "Delayed";
      targetStatus = "Delayed";
    }

    // Save all basic trip fields first (origin, destination, date, etc.)
    await saveTrip(updatedTrip);

    // Update resources (syncs driver and vehicle status)
    const result = await assignResources(updatedTrip.id, updatedTrip.vehicleNo, updatedTrip.driver);
    if (!result.success) {
      showFeedback(result.error || "Failed to update trip resources", "error");
      return;
    }

    // Now update the status (syncs trip progress and lifecycle)
    // We only call this if the status is actually changing, to avoid redundant validation errors
    if (!originalTrip || originalTrip.status !== targetStatus) {
      
      // Auto-log resumption if transitioning out of Delayed status
      if (originalTrip?.status === 'Delayed' && targetStatus !== 'Delayed') {
        const resumptionEvent: DelayEvent = {
          id: Math.random().toString(36).substring(2, 9),
          tripId: editingTrip.id,
          reason: "Other" as DelayReason,
          severity: "Low" as Severity,
          remarks: `Trip status changed from Delayed to ${targetStatus}`,
          reportedBy: "System (Auto-log)",
          reportedAt: new Date().toISOString(),
          status: "Open"
        };
        updatedTrip.delayEvents = [...(updatedTrip.delayEvents || []), resumptionEvent];
        await saveTrip(updatedTrip); // Save with the new event
      }

      const statusResult = await updateTripStatus(updatedTrip.id, targetStatus);
      if (!statusResult.success) {
        showFeedback(statusResult.error || "Failed to update status", "error");
        return;
      }
      
      if (reportDelay) {
        showFeedback("Delay reported successfully. Trip status updated to Delayed.", "success");
      } else {
        showFeedback(`Trip ${updatedTrip.id} status updated to ${targetStatus}`, "success");
      }
    } else {
      showFeedback(`Trip ${updatedTrip.id} updated successfully.`, "success");
    }

    setIsEditDrawerOpen(false);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    const res = await bulkUpdateTripStatus(selectedTripIds, status);
    if (res.success) {
      showFeedback(`Successfully updated ${selectedTripIds.length} trips to ${status}`, "success");
      setSelectedTripIds([]);
    } else {
      showFeedback(res.error || `Failed to update trips`, "error");
    }
  };

  const handleBulkExport = () => {
    showFeedback(`Exporting ${selectedTripIds.length} trips...`, "info");
    setSelectedTripIds([]);
  };

  const filteredTrips = useMemo(() => {
    let result = trips.filter((trip) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTerm =
          trip.id.toLowerCase().includes(term) ||
          trip.driver.toLowerCase().includes(term) ||
          trip.origin.toLowerCase().includes(term) ||
          trip.destination.toLowerCase().includes(term) ||
          trip.status.toLowerCase().includes(term) ||
          (trip.vehicleNo && trip.vehicleNo.toLowerCase().includes(term)) ||
          (trip.loadType && trip.loadType.toLowerCase().includes(term)) ||
          (trip.priority && trip.priority.toLowerCase().includes(term)) ||
          (trip.currentLocation && trip.currentLocation.toLowerCase().includes(term)) ||
          (trip.driverContact && trip.driverContact.toLowerCase().includes(term));
        if (!matchesTerm) return false;
      }

      for (const filter of appliedFilters) {
        if (!filter.value) continue;

        let tripValue = "";
        if (filter.field === "Status") tripValue = trip.status;
        else if (filter.field === "Driver") tripValue = trip.driver;
        else if (filter.field === "Origin") tripValue = trip.origin;
        else if (filter.field === "Destination") tripValue = trip.destination;
        else if (filter.field === "Date") tripValue = trip.date;
        else if (filter.field === "Severity") {
          const severities = Object.entries(trip.executions || {}).map(([key, exec]: [string, any]) => {
            const [stopIdx, itemIdx] = key.split("_").map(Number);
            const step = trip.routeProgress.steps[stopIdx];
            if (!step) return "None";

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

            if (plannedVal === 0) return "None";
            return calculateSeverity(exec.reason as any, plannedVal, exec.actualQuantity);
          });

          
          if (severities.length === 0) tripValue = "None";
          else {
            const severityOrder = ["Critical", "High", "Medium", "Low", "None"];
            severities.sort((a, b) => severityOrder.indexOf(a) - severityOrder.indexOf(b));
            tripValue = severities[0];
          }
        }

        const a = tripValue.toLowerCase();
        const b = filter.value.toLowerCase();

        let match = false;
        if (filter.operator === "is" || filter.operator === "equals") match = a === b;
        else if (filter.operator === "is_not") match = a !== b;
        else if (filter.operator === "contains") match = a.includes(b);

        if (!match) return false;
      }

      return true;
    });

    // Date Range Filtering
    if (dateRange.start) {
      result = result.filter(trip => {
        const tripDate = new Date(trip.date);
        tripDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(dateRange.start!);
        startDate.setHours(0, 0, 0, 0);
        
        if (dateRange.end) {
          const endDate = new Date(dateRange.end!);
          endDate.setHours(23, 59, 59, 999);
          return tripDate >= startDate && tripDate <= endDate;
        } else {
          return tripDate.getTime() === startDate.getTime();
        }
      });
    }

    if (sortConfig.direction && sortConfig.field) {
      result = [...result].sort((a, b) => {
        let valA = "";
        let valB = "";
        if (sortConfig.field === "Status") {
          valA = a.status;
          valB = b.status;
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [trips, searchTerm, appliedFilters, sortConfig, dateRange]);

  // Pagination Logic
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appliedFilters, itemsPerPage]);

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

  const paginatedTrips = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredTrips.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredTrips, currentPage, itemsPerPage]);

  const columns: Column<any>[] = [
    { 
      key: "Selection", 
      label: (
        <input 
          type="checkbox" 
          className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
          checked={selectedTripIds.length === paginatedTrips.length && paginatedTrips.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTripIds(paginatedTrips.map(t => t.id));
            } else {
              setSelectedTripIds([]);
            }
          }}
        />
      ),
      className: "w-10 px-6 py-2"
    },
    { key: "TripID", label: "Trip ID" },
    { key: "Date", label: "Date" },
    { key: "Driver", label: "Driver" },
    { key: "DriverContact", label: "Driver contact" },
    { key: "VehicleNo", label: "Vehicle number" },
    { key: "Route", label: "Route" },
    { key: "Status", label: "Status", sortable: true, sortKey: "Status" },
    { key: "Actions", label: "Actions", className: "text-right" },
  ];

  const getPageNumbers = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, 6, 7];
      } else if (currentPage >= totalPages - 3) {
        for (let i = totalPages - 6; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 3; i <= currentPage + 3; i++) pages.push(i);
      }
    }
    return pages;
  };

  return (
    <>
      <div className="animate-fade-in flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h1 className="text-[24px] font-bold text-[#3e3e3e] dark:text-white">
            Trips
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                View:
              </span>
              <select
                className="px-3 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-gray-900 dark:text-gray-100 text-xs font-medium outline-none focus:border-primary-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
                value={selectedView}
                onChange={(e) => handleViewChange(e.target.value)}
              >
                {savedViews.map((view) => (
                  <option key={view.name} value={view.name}>
                    {view.name}
                  </option>
                ))}
                {selectedView === "Custom View" && (
                  <option value="Custom View">Custom View*</option>
                )}
              </select>
            </div>
            <DateRangeSelector onRangeChange={(start, end) => setDateRange({start, end})} />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-md text-xs font-medium transition-colors ${
                isFilterOpen
                  ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500/50 dark:bg-primary-900/20 dark:text-primary-400"
                  : "border-gray-200 dark:border-[#3d3d3d] bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d]"
              }`}
            >
              <Filter className="h-3.5 w-3.5" /> Filter
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center bg-gray-200/80 dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-300 text-[10px] font-semibold rounded-full h-4 w-4 ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md bg-white dark:bg-[#1e1e1e] text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#295DAA] text-white rounded-md text-xs font-medium hover:opacity-90 transition-colors shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" /> Import Trips
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm border border-gray-100 dark:border-[#2d2d2d] transition-colors flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] shrink-0 animate-fade-in text-[13px] text-gray-800 dark:text-gray-300">
              <div className="max-w-4xl">
                {/* Filter by text */}
                <div className="flex items-center mb-5">
                  <div className="w-36 font-medium">Filter by text</div>
                  <input
                    type="text"
                    placeholder="Subject, description, comments, ..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedView("Custom View");
                    }}
                    className="w-[500px] px-3 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded text-gray-900 dark:text-gray-100 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="w-full h-px bg-gray-100 dark:bg-[#2d2d2d] mb-5" />

                {/* Dynamic Filters */}
                {advancedFilters.map((filter) => (
                  <div key={filter.id} className="flex items-center mb-3">
                    <div className="w-36 font-medium">{filter.field}</div>
                    <div className="w-[500px] flex items-center gap-3">
                      <select
                        value={filter.operator}
                        onChange={(e) =>
                          updateFilter(filter.id, "operator", e.target.value)
                        }
                        className="w-[120px] px-3 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded text-gray-900 dark:text-gray-100 outline-none focus:border-primary-500"
                      >
                        <option value="is">is</option>
                        <option value="is_not">is not</option>
                        <option value="contains">contains</option>
                      </select>
                      {filter.field === "Status" ? (
                        <div className="flex-1">
                          <select
                            value={filter.value}
                            onChange={(e) =>
                              updateFilter(filter.id, "value", e.target.value)
                            }
                            className={`w-full px-3 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded outline-none focus:border-primary-500 ${!filter.value ? "text-gray-400" : "text-gray-900 dark:text-gray-100"}`}
                          >
                            <option value="" disabled hidden>
                              Please select
                            </option>
                            {tripStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : filter.field === "Driver" ? (
                        <div className="flex-1">
                          <select
                            value={filter.value}
                            onChange={(e) =>
                              updateFilter(filter.id, "value", e.target.value)
                            }
                            className={`w-full px-3 py-1.5 bg-white dark:bg-[#121212] border ${!filter.value ? "border-red-500 text-gray-400" : "border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-100"} rounded outline-none focus:border-primary-500 hover:border-red-500 focus:border-red-500`}
                          >
                            <option value="" disabled hidden>
                              Please select
                            </option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : filter.field === "Origin" ||
                        filter.field === "Destination" ? (
                        <div className="flex-1">
                          <select
                            value={filter.value}
                            onChange={(e) =>
                              updateFilter(filter.id, "value", e.target.value)
                            }
                            className={`w-full px-3 py-1.5 bg-white dark:bg-[#121212] border ${!filter.value ? "border-red-500 text-gray-400" : "border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-100"} rounded outline-none focus:border-primary-500 hover:border-red-500 focus:border-red-500`}
                          >
                            <option value="" disabled hidden>
                              Please select
                            </option>
                            {tripCities.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : filter.field === "Severity" ? (
                        <div className="flex-1">
                          <select
                            value={filter.value}
                            onChange={(e) =>
                              updateFilter(filter.id, "value", e.target.value)
                            }
                            className={`w-full px-3 py-1.5 bg-white dark:bg-[#121212] border ${!filter.value ? "border-red-500 text-gray-400" : "border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-100"} rounded outline-none focus:border-primary-500 hover:border-red-500 focus:border-red-500`}
                          >
                            <option value="" disabled hidden>
                              Please select
                            </option>
                            {["Critical", "High", "Medium", "Low", "None"].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : filter.field === "Date" ? (
                        <div className="flex-1">
                          <input
                            type="date"
                            value={filter.value}
                            onChange={(e) =>
                              updateFilter(filter.id, "value", e.target.value)
                            }
                            className={`w-full px-3 py-1.5 bg-white dark:bg-[#121212] border ${!filter.value ? "border-red-500 text-gray-400" : "border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-100"} rounded outline-none focus:border-primary-500 hover:border-red-500 focus:border-red-500`}
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Enter value..."
                            value={filter.value}
                            onChange={(e) =>
                              updateFilter(filter.id, "value", e.target.value)
                            }
                            className={`w-full px-3 py-1.5 bg-white dark:bg-[#121212] border ${!filter.value ? "border-red-500 text-gray-400" : "border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-100"} rounded outline-none focus:border-primary-500 hover:border-red-500 focus:border-red-500`}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="ml-3 text-[#295DAA] hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add Filter */}
                <div className="flex items-center mt-5">
                  <div className="w-36 font-semibold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add filter:
                  </div>
                  <div className="w-[500px]">
                    <select
                      onChange={addFilter}
                      value=""
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded text-gray-500 outline-none focus:border-primary-500"
                    >
                      <option value="" disabled hidden>
                        Please select
                      </option>
                      {availableFields.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* Filter Actions */}
              <div className="max-w-4xl flex items-center justify-between mt-6">
                <button
                  className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                  onClick={() => setIsSaveViewModalOpen(true)}
                >
                  Save Current View
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-md transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-3 py-1.5 bg-primary-700 text-white rounded-md text-xs font-medium hover:bg-primary-800 transition-colors shadow-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            <ListTable
              columns={columns}
              data={paginatedTrips}
              rowKey={(trip) => trip.id}
              selectedRowKey={expandedTripId}
              sortConfig={sortConfig}
              onSort={(field) => {
                let direction: "asc" | "desc" | null = "asc";
                if (sortConfig.field === field) {
                  if (sortConfig.direction === "asc") direction = "desc";
                  else if (sortConfig.direction === "desc") direction = null;
                }
                setSortConfig({
                  field: direction ? field : "",
                  direction,
                });
              }}
              renderRow={(trip, isSelected) => {
                const isExpanded = expandedTripId === trip.id;
                return (
                  <>
                    <tr id={`row-${trip.id}`} className={`hover:bg-gray-50 dark:hover:bg-[#2d2d2d]/50 transition-colors ${selectedTripIds.includes(trip.id) ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                          checked={selectedTripIds.includes(trip.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTripIds(prev => [...prev, trip.id]);
                            } else {
                              setSelectedTripIds(prev => prev.filter(id => id !== trip.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedTripId(null);
                              setSelectedStopIdx(null);
                            } else {
                              setExpandedTripId(trip.id);
                              setSelectedStopIdx(null);
                            }
                          }}
                        >
                          <div className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                            {trip.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600 dark:text-gray-200">
                          {trip.date}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {trip.driver}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600 dark:text-gray-200 font-mono">
                          {trip.driverContact}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {trip.vehicleNo}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-900 dark:text-gray-100">
                              {trip.origin}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-200">
                              → {trip.destination}
                            </span>
                          </div>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-100/70 dark:border-primary-800/40 shadow-2xs">
                            ({trip.routeProgress.completedCount}/{trip.routeProgress.steps.length})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${trip.statusColor}`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
                            className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer"
                            title="View Trip Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingTrip({ ...trip });
                              setIsEditDrawerOpen(true);
                              setExpandedAccordions(trip.status === 'Delayed' ? ['trip-info', 'delay-mgmt'] : ['trip-info']);
                            }}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-450 transition-colors p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer"
                            title="Edit Trip Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              alert(`Live tracking link established for ${trip.id}. Current telemetry indicates active transit from ${trip.origin} towards ${trip.destination}.`);
                            }}
                            className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-450 transition-colors p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer"
                            title="Track Vehicle"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 dark:bg-[#1a1a1a]">
                        <td
                          colSpan={9}
                          className="p-0 border-b border-gray-200 dark:border-[#2d2d2d]"
                        >
                          <div className="py-2 px-5 sm:px-6 flex flex-col gap-6 items-stretch w-full">
                            {/* Horizontal Timeline Stepper container with horizontal scroll for responsiveness */}
                            <div className="relative min-h-[140px] w-[1247px] max-w-full pt-1 pb-1 pl-0 pr-2.5 overflow-x-auto select-none no-scrollbar">
                              <div className="min-w-[760px] relative px-4">
                                <div className="flex items-start justify-start w-full relative z-10">
                                  {trip.routeProgress.steps.map((step: any, index: number) => {
                                    const isDelayedStep =
                                      step.status === "current" &&
                                      trip.status === "Delayed";
                                    const isSelected = selectedStopIdx === index;

                                    return (
                                      <React.Fragment key={index}>
                                        {/* Step Column */}
                                        <div
                                          onClick={() => setSelectedStopIdx(isSelected ? null : index)}
                                          className={`flex flex-col items-center text-center cursor-pointer select-none transition-all duration-300 rounded-2xl p-3 pt-4 max-w-[110px] flex-1 ${
                                            isSelected
                                              ? "bg-primary-50/15 dark:bg-primary-950/10 border border-primary-100 dark:border-primary-500/25 shadow-xs scale-[1.01]"
                                              : "border border-transparent hover:bg-gray-100/60 dark:hover:bg-gray-900/20"
                                          }`}
                                        >
                                          {/* Circle Container */}
                                          <div className="h-[28px] flex items-center justify-center relative mb-4">
                                            {step.status === "completed" ? (
                                              <div className="w-[28px] h-[28px] rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-sm transition-all duration-300 hover:scale-105">
                                                <Check className="w-[17px] h-[17px] stroke-[3.5]" />
                                              </div>
                                            ) : step.status === "current" ? (
                                              <div className={`w-[28px] h-[28px] rounded-full border-[3px] bg-white dark:bg-[#121212] flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 ${
                                                isDelayedStep ? "border-red-500" : "border-primary-600"
                                              }`}>
                                                <div className={`w-4 h-4 rounded-full transition-all duration-300 animate-pulse ${
                                                  isDelayedStep ? "bg-red-500" : "bg-primary-600"
                                                }`} />
                                              </div>
                                            ) : (
                                              <div className="w-[28px] h-[28px] rounded-full bg-primary-100 dark:bg-[#1e293b] flex items-center justify-center transition-all duration-300 shadow-2xs hover:scale-105" />
                                            )}
                                          </div>
                                          {/* Subtext labels exactly styled like the design */}
                                          <span className={`text-[12px] font-medium text-gray-900 dark:text-white mt-1 truncate max-w-[130px] ${
                                            isSelected ? "text-primary-700 dark:text-primary-400 font-semibold" : ""
                                          }`}>
                                            {step.location.split(",")[0]}
                                          </span>
                                          
                                          <span className={`text-xs font-medium mt-1 ${
                                            step.status === "completed"
                                              ? "text-[#10b981]"
                                              : step.status === "current"
                                                ? isDelayedStep
                                                  ? "text-red-500 dark:text-red-400"
                                                  : "text-primary-600 dark:text-primary-400"
                                                : "text-gray-400 dark:text-gray-500"
                                          }`}>
                                            {step.status === "completed"
                                              ? "Completed"
                                              : step.status === "current"
                                                ? isDelayedStep
                                                  ? "Delayed"
                                                  : "In Progress"
                                                : "Pending"}
                                          </span>
                                          <span className="text-xs text-gray-600 dark:text-gray-200 mt-1 font-medium">
                                            {step.status === "pending" ? "Scheduled" : step.time}
                                          </span>
                                        </div>

                                        {/* Connecting Line Segment between adjacent steps */}
                                        {index < trip.routeProgress.steps.length - 1 && (
                                          <div className="flex-none w-10 h-[28px] mt-4 flex items-center justify-center">
                                            {step.status === "completed" ? (
                                              <div className="w-full h-[4px] bg-[#10b981] rounded-full transition-all duration-300" />
                                            ) : step.status === "current" ? (
                                              <div className="w-full h-[4px] bg-primary-100 dark:bg-primary-950/40 rounded-full overflow-hidden relative transition-all duration-300">
                                                <div className={`absolute top-0 bottom-0 left-0 w-1/2 rounded-full ${
                                                  isDelayedStep ? "bg-red-500" : "bg-primary-600"
                                                }`} />
                                              </div>
                                            ) : (
                                              <div className="w-full h-[4px] bg-[#bfdbfe] dark:bg-blue-950/40 rounded-full transition-all duration-300" />
                                            )}
                                          </div>
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Level 2 Expandable Goods Details Card */}
                            {selectedStopIdx !== null && trip.routeProgress.steps[selectedStopIdx] ? (
                              <div className="flex-1 w-full bg-transparent p-0 animate-fade-in">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-200 tracking-wider uppercase mb-3.5">
                                  <Package className="w-4 h-4 text-primary-500" />
                                  <span>Cargo &amp; Goods Details &mdash; {trip.routeProgress.steps[selectedStopIdx].location}</span>
                                </div>
                                {trip.routeProgress.steps[selectedStopIdx].type === "Transit" ? (
                                  <div className="p-8 text-center border border-dashed border-gray-200 dark:border-[#2d2d2d] rounded-2xl bg-gray-50/30 dark:bg-gray-900/10 max-w-xl mx-auto my-4 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center mb-3">
                                      <MapPin className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-[14px] font-bold text-gray-800 dark:text-white">Transit Waypoint Checkpoint</h4>
                                    <p className="text-[12px] text-gray-600 dark:text-gray-200 mt-1.5 leading-relaxed">
                                      This location is an intermediate transit waypoint for route monitoring, telemetry logging, and scheduling checks. No active cargo items are scheduled for pickup or delivery at this step.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto border border-gray-200 dark:border-[#2d2d2d] rounded-xl bg-gray-50/20 dark:bg-[#0e0e0e]/20">
                                    <table className="w-full min-w-[900px] divide-y divide-gray-200 dark:divide-[#2d2d2d] text-left text-xs">
                                      <thead className="bg-gray-50 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-200 font-bold uppercase tracking-wider text-[10px]">
                                        <tr>
                                          <th className="px-5 py-2.5">Type</th>
                                          <th className="px-5 py-2.5">Location</th>
                                          <th className="px-5 py-2.5">Cargo Commodity</th>
                                          <th className="px-5 py-2.5">Planned Qty</th>
                                          <th className="px-5 py-2.5">Execution Remarks</th>
                                          <th className="px-5 py-2.5">Severity</th>
                                          <th className="px-5 py-2.5">Time/ETA</th>
                                          <th className="px-5 py-2.5">Status</th>
                                          <th className="px-5 py-2.5 text-right">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 dark:divide-[#2d2d2d] bg-white dark:bg-[#121212]">
                                        {getSpecificGoodsList(
                                          trip.routeProgress.steps[selectedStopIdx].goodsType,
                                          selectedStopIdx,
                                          trip.id,
                                          trip.routeProgress.steps.length
                                        ).map((goodsItem, itemIdx) => {
                                          const execKey = `${selectedStopIdx}_${itemIdx}`;
                                          const execution = trip.executions?.[execKey];
                                          
                                          let executionRemarksText = "—";
                                          let hasPartialWarning = false;

                                          const { value: plannedVal, unit } = parsePlannedQuantity(goodsItem.quantity);


                                          if (execution) {
                                            const actualVal = execution.actualQuantity;
                                            const reason = execution.reason;
                                            const diff = plannedVal - actualVal;
                                            
                                            if (actualVal < plannedVal) {
                                              hasPartialWarning = true;
                                            }

                                            if (diff === 0) {
                                              executionRemarksText = "Completed without discrepancy";
                                            } else if (diff < 0) {
                                              const overCount = Math.abs(diff);
                                              const actionPast = goodsItem.type === "Pickup" ? "Picked" : "Delivered";
                                              const unitLowercase = unit.toLowerCase();
                                              executionRemarksText = `${actionPast} ${actualVal} / ${plannedVal} ${unitLowercase} • Over shipped by ${overCount}`;
                                            } else {
                                              const actionPast = goodsItem.type === "Pickup" ? "Picked" : "Delivered";
                                              const unitLowercase = unit.toLowerCase();
                                              
                                              if (reason === "Damaged Goods") {
                                                executionRemarksText = `${actionPast} ${actualVal} / ${plannedVal} ${unitLowercase} • ${diff} damaged`;
                                              } else if (reason === "Customer Rejected") {
                                                executionRemarksText = `${actionPast} ${actualVal} / ${plannedVal} ${unitLowercase} • Customer rejected remaining`;
                                              } else {
                                                executionRemarksText = `${actionPast} ${actualVal} / ${plannedVal} ${unitLowercase} • ${diff} ${reason.toLowerCase()}`;
                                              }
                                            }
                                          }

                                          const severity = execution 
                                            ? calculateSeverity(execution.reason as any, plannedVal, execution.actualQuantity) 
                                            : null;

                                          const getSeverityBadge = (sev: string | null) => {
                                            if (!sev) return <span className="text-gray-400 dark:text-gray-600">—</span>;
                                            
                                            let dotColor = "";
                                            let bgColor = "";

                                            switch (sev) {
                                              case "Critical":
                                                dotColor = "bg-red-500";
                                                bgColor = "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30";
                                                break;
                                              case "High":
                                                dotColor = "bg-orange-500";
                                                bgColor = "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30";
                                                break;
                                              case "Medium":
                                                dotColor = "bg-yellow-500";
                                                bgColor = "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30";
                                                break;
                                              case "Low":
                                                dotColor = "bg-blue-500";
                                                bgColor = "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
                                                break;
                                              case "None":
                                                dotColor = "bg-green-500";
                                                bgColor = "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30";
                                                break;
                                              default:
                                                return <span className="text-gray-400 dark:text-gray-600">—</span>;
                                            }

                                            return (
                                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${bgColor}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                                                {sev}
                                              </div>
                                            );
                                          };

                                          return (
                                            <tr key={itemIdx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                              <td className="px-5 py-3">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                  goodsItem.type === "Pickup"
                                                    ? "bg-blue-50/70 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                                                    : "bg-purple-50/70 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30"
                                                }`}>
                                                  {goodsItem.type}
                                                </span>
                                              </td>
                                              <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-200">
                                                {trip.routeProgress.steps[selectedStopIdx].location}
                                              </td>
                                              <td className="px-5 py-3 text-gray-750 dark:text-gray-300 font-semibold">
                                                {goodsItem.name}
                                              </td>
                                              <td className="px-5 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                                                  goodsItem.type === "Pickup"
                                                    ? "bg-blue-50/30 text-blue-600 border border-blue-100 dark:bg-blue-950/10 dark:text-blue-400 dark:border-blue-900/20"
                                                    : "bg-purple-50/30 text-purple-600 border border-purple-100 dark:bg-purple-950/10 dark:text-purple-400 dark:border-purple-900/20"
                                                }`}>
                                                  {goodsItem.quantity}
                                                </span>
                                              </td>
                                              <td className="px-5 py-3 text-gray-700 dark:text-gray-300 font-medium">
                                                {executionRemarksText}
                                              </td>
                                              <td className="px-5 py-3">
                                                {getSeverityBadge(severity)}
                                              </td>
                                              <td className="px-5 py-3 text-gray-550 dark:text-gray-450">
                                                {trip.routeProgress.steps[selectedStopIdx].time}
                                              </td>
                                              <td className="px-5 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                  trip.routeProgress.steps[selectedStopIdx].status === "completed"
                                                    ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/20"
                                                    : trip.routeProgress.steps[selectedStopIdx].status === "current"
                                                      ? "bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-950/20 dark:text-primary-400 dark:border-primary-900/20 font-extrabold animate-pulse"
                                                      : "bg-gray-50 text-gray-400 border-gray-100 dark:bg-[#1b1b1b] dark:text-gray-500"
                                                }`}>
                                                  {trip.routeProgress.steps[selectedStopIdx].status === "completed" 
                                                    ? "Completed" 
                                                    : trip.routeProgress.steps[selectedStopIdx].status === "current" 
                                                      ? "Active Current" 
                                                      : "Pending"}
                                                  {hasPartialWarning && " ⚠ Partial"}
                                                </span>
                                              </td>
                                              <td className="px-5 py-3 text-right">
                                                <button
                                                  onClick={() => {
                                                    setSelectedCargoItem({
                                                      goodsItem,
                                                      itemIdx,
                                                      stopIdx: selectedStopIdx,
                                                      tripId: trip.id,
                                                      location: trip.routeProgress.steps[selectedStopIdx].location
                                                    });
                                                    setActualQuantity(execution ? execution.actualQuantity : plannedVal);
                                                    setExecutionReason(execution ? execution.reason : "No Discrepancy");
                                                    setExecutionRemarksState(execution ? execution.remarks : "");
                                                    setActiveModal("execution-details");
                                                  }}
                                                  className="text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-bold hover:underline cursor-pointer"
                                                >
                                                  {execution ? "Edit" : "Add"}
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              }}
            />

            {paginatedTrips.length === 0 && (
              <div className="text-center py-12 text-gray-600 dark:text-gray-200 text-xs bg-white dark:bg-[#1e1e1e] border-t border-gray-100 dark:border-[#2d2d2d]">
                No trips found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-[#2d2d2d] flex items-center justify-between shrink-0 bg-white dark:bg-[#1e1e1e] rounded-b-lg text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-1.5">
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-gray-200 dark:border-[#3d3d3d] rounded flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors mr-2"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
              )}
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={
                    p === currentPage
                      ? "italic px-1 text-primary-700 dark:text-primary-400 font-medium"
                      : "px-2.5 py-1 border border-gray-200 dark:border-[#3d3d3d] rounded hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
                  }
                >
                  {p}
                </button>
              ))}
              {totalPages > 7 && currentPage < totalPages - 3 && (
                <span className="px-1 text-gray-400">...</span>
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2.5 py-1 border border-gray-200 dark:border-[#3d3d3d] rounded flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] disabled:opacity-50 transition-colors"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <span className="ml-3 text-gray-600 dark:text-gray-400">
                (
                {filteredTrips.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}{" "}
                - {Math.min(currentPage * itemsPerPage, filteredTrips.length)}/
                {filteredTrips.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">
                Per page:
              </span>
              {[10, 20, 50].map((num) => (
                <button
                  key={num}
                  onClick={() => setItemsPerPage(num)}
                  className={
                    num === itemsPerPage
                      ? "italic px-1 text-primary-700 dark:text-primary-400 font-medium"
                      : "px-2.5 py-1 border border-gray-200 dark:border-[#3d3d3d] rounded hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
                  }
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Off-Canvas Import Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[750px] flex flex-col bg-white dark:bg-[#1e1e1e] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isImportOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-4 shrink-0">
          <div>
            <h2 className="text-base leading-tight font-bold text-gray-900 dark:text-white mb-2">
              Import Trips
            </h2>
            <p className="text-xs font-normal text-gray-600 dark:text-gray-200">
              Upload a CSV or Excel file to import multiple trips at once.
            </p>
          </div>
          <button
            onClick={() => setIsImportOpen(false)}
            className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-[5px] border border-gray-200 dark:border-[#3d3d3d] rounded-full hover:bg-gray-50 dark:hover:bg-[#2d2d2d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="px-8 border-b border-gray-100 dark:border-[#2d2d2d] flex items-center gap-6 shrink-0 mt-2">
          <button
            onClick={() => setImportTab("import")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 px-1 ${
              importTab === "import"
                ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Import
          </button>
          <button
            onClick={() => setImportTab("history")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 px-1 ${
              importTab === "history"
                ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            History
          </button>
        </div>

        {/* Drawer Content */}
        <div className="px-8 pb-8 pt-6 flex-1 overflow-y-auto min-h-0">
          {importTab === "import" ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-[#3d3d3d] rounded-lg p-10 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer group mt-2">
              <Upload className="w-10 h-10 text-gray-400 group-hover:text-primary-500 mb-4 transition-colors" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-200 mt-1">
                CSV, XLS, XLSX up to 10MB
              </p>
            </div>
          ) : (
            <div className="mt-2 border border-gray-200 dark:border-[#3d3d3d] rounded-lg overflow-visible pb-40">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-[#2d2d2d]">
                <thead className="bg-gray-50 dark:bg-[#1a1a1a]">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider"
                    >
                      File Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider"
                    >
                      Records
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-[#2d2d2d]">
                  {[1, 2, 3].map((_, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-[#2d2d2d]/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                        trips_export_2026.csv
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                        100
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                        May 28, 2026 14:30
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full font-medium">
                          Completed
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="relative inline-block text-left">
                          <button
                            className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"
                            onClick={() =>
                              setOpenImportHistoryMenu(
                                openImportHistoryMenu === i ? null : i,
                              )
                            }
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {openImportHistoryMenu === i && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenImportHistoryMenu(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2d2d2d] z-[60] py-2">
                                <button
                                  className="w-full text-left px-4 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] flex items-center gap-2.5 transition-colors"
                                  onClick={() => setOpenImportHistoryMenu(null)}
                                >
                                  <Download className="w-3.5 h-3.5 text-blue-500" />{" "}
                                  Download
                                </button>
                                <button
                                  className="w-full text-left px-4 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] flex items-center gap-2.5 transition-colors"
                                  onClick={() => setOpenImportHistoryMenu(null)}
                                >
                                  <Eye className="w-3.5 h-3.5 text-gray-400" />{" "}
                                  Preview
                                </button>
                                <button
                                  className="w-full text-left px-4 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] flex items-center gap-2.5 transition-colors"
                                  onClick={() => setOpenImportHistoryMenu(null)}
                                >
                                  <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-gray-300" />{" "}
                                  View Details
                                </button>

                                <hr className="my-1.5 border-t border-dashed border-gray-200 dark:border-[#3d3d3d] mx-2" />

                                <button
                                  className="w-full text-left px-4 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] flex items-center gap-2.5 transition-colors"
                                  onClick={() => setOpenImportHistoryMenu(null)}
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-blue-500" />{" "}
                                  Re-import
                                </button>
                                <button
                                  className="w-full text-left px-4 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] flex items-center gap-2.5 transition-colors"
                                  onClick={() => setOpenImportHistoryMenu(null)}
                                >
                                  <Share2 className="w-3.5 h-3.5 text-purple-400" />{" "}
                                  Share
                                </button>
                                <button
                                  className="w-full text-left px-4 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] flex items-center gap-2.5 transition-colors"
                                  onClick={() => setOpenImportHistoryMenu(null)}
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-200" />{" "}
                                  Rename
                                </button>

                                <hr className="my-1.5 border-t border-dashed border-gray-200 dark:border-[#3d3d3d] mx-2" />

                                <button
                                  className="w-full text-left px-4 py-1.5 text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2.5 transition-colors"
                                  onClick={() => setOpenImportHistoryMenu(null)}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-gray-400" />{" "}
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-8 py-5 border-t border-gray-100 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] flex justify-end gap-3 shrink-0">
          <button
            onClick={() => setIsImportOpen(false)}
            className="px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
          >
            Cancel
          </button>
          {importTab === "import" && (
            <button className="px-4 py-2 bg-[#295DAA] text-white rounded-md text-xs font-medium hover:opacity-90 transition-opacity shadow-sm">
              Upload File
            </button>
          )}
        </div>
      </div>

      {/* Backdrop for Off-Canvas */}
      {isImportOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity"
          onClick={() => setIsImportOpen(false)}
        />
      )}

      {/* Save View Modal */}
      {isSaveViewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity"
            onClick={() => setIsSaveViewModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl w-full max-w-md border border-gray-100 dark:border-[#2d2d2d] flex flex-col p-6 animate-fade-in z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Save Current View
              </h3>
              <button
                onClick={() => setIsSaveViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                View Name
              </label>
              <input
                type="text"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="e.g., My Completed Routes"
                className="w-full px-3 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary-500 transition-colors"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsSaveViewModalOpen(false)}
                className="px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newViewName.trim()) {
                    const validFilters = advancedFilters.filter(f => f.value.trim() !== "");
                    const newView: SavedView = {
                      name: newViewName.trim(),
                      searchTerm,
                      appliedFilters: validFilters.map(f => ({ ...f })),
                    };
                    setSavedViews([...savedViews, newView]);
                    setSelectedView(newView.name);
                    setAppliedFilters(validFilters); // Also apply the filters when saving
                    setNewViewName("");
                    setIsSaveViewModalOpen(false);
                    alert(`View "${newView.name}" saved successfully!`);
                  }
                }}
                disabled={!newViewName.trim()}
                className="px-4 py-2 bg-primary-700 text-white rounded-md text-xs font-medium hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {activeModal === "assign-driver" && selectedTripForAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity"
            onClick={() => {
              setActiveModal(null);
              setSelectedDriverIdForModal("");
            }}
          />
          <div className="relative bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl w-full max-w-md border border-gray-100 dark:border-[#2d2d2d] flex flex-col p-6 animate-fade-in z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Reassign Operator - Trip {selectedTripForAction.id}
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedDriverIdForModal("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Active/Resting Driver
              </label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary-500 transition-colors"
                value={selectedDriverIdForModal}
                onChange={(e) => setSelectedDriverIdForModal(e.target.value)}
              >
                <option value="">-- Choose Operator --</option>
                {drivers.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status}) - Score: {d.safetyScore}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedDriverIdForModal("");
                }}
                className="px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const driver = drivers.find((d: any) => d.id === selectedDriverIdForModal);
                  if (!driver) {
                    showFeedback("Please select a valid driver.", "error");
                    return;
                  }

                  const res = await assignResources(selectedTripForAction.id, selectedTripForAction.vehicleNo, driver.name);
                  if (res.success) {
                    showFeedback(`Operator ${driver.name} assigned to Trip ${selectedTripForAction.id} successfully.`, "success");
                    setActiveModal(null);
                    setSelectedDriverIdForModal("");
                  } else {
                    showFeedback(res.error || "Failed to assign driver", "error");
                  }
                }}
                disabled={!selectedDriverIdForModal}
                className="px-4 py-2 bg-primary-700 text-white rounded-md text-xs font-medium hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Vehicle Modal */}
      {activeModal === "assign-vehicle" && selectedTripForAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity"
            onClick={() => {
              setActiveModal(null);
              setSelectedVehicleIdForModal("");
            }}
          />
          <div className="relative bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl w-full max-w-md border border-gray-100 dark:border-[#2d2d2d] flex flex-col p-6 animate-fade-in z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Change Assigned Vehicle - Trip {selectedTripForAction.id}
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedVehicleIdForModal("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Fleet Vehicle
              </label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary-500 transition-colors"
                value={selectedVehicleIdForModal}
                onChange={(e) => setSelectedVehicleIdForModal(e.target.value)}
              >
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.id} - {v.modelName} ({v.status}, Fuel: {v.fuelLevel}%)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedVehicleIdForModal("");
                }}
                className="px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const vehicle = vehicles.find((v: any) => v.id === selectedVehicleIdForModal);
                  if (!vehicle) {
                    showFeedback("Please select a valid vehicle.", "error");
                    return;
                  }

                  const res = await assignResources(selectedTripForAction.id, vehicle.id, selectedTripForAction.driver);
                  if (res.success) {
                    showFeedback(`Vehicle ${vehicle.id} assigned to Trip ${selectedTripForAction.id} successfully.`, "success");
                    setActiveModal(null);
                    setSelectedVehicleIdForModal("");
                  } else {
                    showFeedback(res.error || "Failed to assign vehicle", "error");
                  }
                }}
                disabled={!selectedVehicleIdForModal}
                className="px-4 py-2 bg-primary-700 text-white rounded-md text-xs font-medium hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirm Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Details Off-Canvas Drawer */}
      {activeModal === "execution-details" && selectedCargoItem && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity"
            onClick={() => {
              setActiveModal(null);
              setSelectedCargoItem(null);
            }}
          />
          <div className="relative bg-white dark:bg-[#1e1e1e] w-full max-w-md h-full border-l border-gray-100 dark:border-[#2d2d2d] flex flex-col p-6 animate-slide-in-right z-10 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-[#2d2d2d]">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Execution Details
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedCargoItem(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-only Information */}
            <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-[#141414] rounded-xl text-xs text-gray-755 dark:text-gray-300 border border-gray-100 dark:border-[#2d2d2d]">
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-500 font-medium">Cargo Commodity:</span>
                <span className="font-semibold text-right max-w-[200px]">{selectedCargoItem.goodsItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-500 font-medium">Location:</span>
                <span className="font-semibold text-right">{selectedCargoItem.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-500 font-medium">Stop Type:</span>
                <span className="font-semibold text-right">{selectedCargoItem.goodsItem.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-500 font-medium">Planned Quantity:</span>
                <span className="font-semibold text-right">{selectedCargoItem.goodsItem.quantity}</span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-5 mb-8 flex-1">
              {/* Actual Quantity & Unit */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-200 mb-1.5">
                  Actual Quantity
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={actualQuantity}
                    onChange={(e) => setActualQuantity(parseInt(e.target.value, 10) || 0)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary-500 transition-colors"
                  />
                  <div className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-sm text-gray-600 dark:text-gray-200 min-w-[90px] text-center select-none font-medium">
                    {(() => {
                      const clean = (selectedCargoItem.goodsItem.quantity || "").trim();
                      const match = clean.match(/^(\d+)\s*(.*)$/);
                      return match ? match[2] || "Units" : "Units";
                    })()}
                  </div>
                </div>
              </div>

              {/* Reason Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-200 mb-1.5">
                  Reason for Deviation
                </label>
                <select
                  value={executionReason}
                  onChange={(e) => setExecutionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="No Discrepancy">No Discrepancy</option>
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Missing Goods">Missing Goods</option>
                  <option value="Customer Rejected">Customer Rejected</option>
                  <option value="Partial Pickup">Partial Pickup</option>
                  <option value="Partial Delivery">Partial Delivery</option>
                  <option value="Warehouse Shortage">Warehouse Shortage</option>
                  <option value="Over Shipment">Over Shipment</option>
                  <option value="Weight Restriction">Weight Restriction</option>
                  <option value="Incorrect Goods">Incorrect Goods</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Remarks Multi-line Text Area */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-200 mb-1.5">
                  Execution Remarks
                </label>
                <textarea
                  value={executionRemarks}
                  onChange={(e) => setExecutionRemarksState(e.target.value)}
                  placeholder="Describe what happened during pickup or delivery..."
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2d2d2d]">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedCargoItem(null);
                }}
                className="px-4 py-2.5 border border-gray-200 dark:border-[#3d3d3d] rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updatedTrip = { ...trips.find(t => t.id === selectedCargoItem.tripId) };
                  if (!updatedTrip.id) return;

                  const execKey = `${selectedCargoItem.stopIdx}_${selectedCargoItem.itemIdx}`;
                  const existingExecutions = updatedTrip.executions || {};
                  
                  updatedTrip.executions = {
                    ...existingExecutions,
                    [execKey]: {
                      actualQuantity,
                      reason: executionReason,
                      remarks: executionRemarks
                    }
                  };

                  saveTrip(updatedTrip as any);
                  showFeedback("Execution details saved successfully.", "success");
                  setActiveModal(null);
                  setSelectedCargoItem(null);
                }}
                className="px-4 py-2.5 bg-primary-700 text-white rounded-md text-xs font-semibold hover:bg-primary-800 transition-colors cursor-pointer"
              >
                Save Execution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off-Canvas Edit Trip Drawer */}
      {isEditDrawerOpen && editingTrip && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop (no-blur, transparent overlay) */}
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity"
            onClick={() => setIsEditDrawerOpen(false)}
          />
          {/* Drawer Container */}
          <div className="relative bg-white dark:bg-[#1b1b1b] w-full max-w-2xl h-full border-l border-gray-200 dark:border-[#2d2d2d] flex flex-col py-6 px-[14px] animate-slide-in-right z-10 shadow-2xl overflow-hidden">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#2d2d2d]">
              <div>
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                  Trip Editor
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                  Edit Details: {editingTrip.id}
                  <div className="relative">
                    <span 
                      onClick={() => setActivePicker(activePicker === 'header' ? null : 'header')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer hover:ring-2 hover:ring-primary-500/30 transition-all ${TRIP_STATUS_COLORS[editingTrip.status]}`}
                    >
                      {editingTrip.status}
                    </span>
                    {activePicker === 'header' && (
                      <div className="absolute z-50 left-0 mt-2 p-2 bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#333] shadow-xl rounded-xl w-48">
                        <div className="grid grid-cols-2 gap-1.5">
                          {tripStatuses.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTrip({ ...editingTrip, status: st });
                                if (st === 'Delayed') {
                                  setExpandedAccordions(prev => prev.includes('delay-mgmt') ? prev : [...prev, 'delay-mgmt']);
                                  setReportDelay(true);
                                } else {
                                  setReportDelay(false);
                                }
                                setActivePicker(null);
                              }}
                              className={`flex items-center justify-center px-2 py-1.5 rounded text-[10px] font-medium transition-all ${
                                editingTrip.status === st
                                  ? "bg-primary-500 text-white"
                                  : "bg-gray-50 dark:bg-[#202020] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525]"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </h3>
              </div>
              <button
                onClick={() => setIsEditDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col overflow-hidden mt-4">
              <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1 pb-4 custom-scrollbar">
                
                {/* Accordion 1: Trip Information */}
                <div className="border border-gray-100 dark:border-[#2d2d2d] rounded-xl overflow-visible">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('trip-info')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#202020]/50 hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Info className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-[13px] font-sans truncate">
                        Trip Information
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedAccordions.includes('trip-info') ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {expandedAccordions.includes('trip-info') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-visible"
                      >
                        <div className="p-4 space-y-4 border-t border-gray-100 dark:border-[#2d2d2d]">
                          {/* Driver select */}
                          <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">
                              Assigned Operator
                            </label>
                            <select
                              value={editingTrip.driver}
                              onChange={(e) => {
                                const matched = driversOptions.find((d: any) => d.name === e.target.value);
                                setEditingTrip({
                                  ...editingTrip,
                                  driver: e.target.value,
                                  driverContact: matched ? matched.phone : editingTrip.driverContact
                                });
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-300 rounded-md outline-none cursor-pointer"
                            >
                              <option value="">-- Select Operator --</option>
                              {driversOptions.map((d: any) => (
                                <option key={d.id} value={d.name}>
                                  {d.name} ({d.status || "Active"})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Vehicle select */}
                          <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">
                              Assigned Vehicle
                            </label>
                            <select
                              value={editingTrip.vehicleNo}
                              onChange={(e) => setEditingTrip({ ...editingTrip, vehicleNo: e.target.value })}
                              className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-300 rounded-md outline-none cursor-pointer"
                            >
                              <option value="">-- Select Vehicle --</option>
                              {vehiclesOptions.map((v: any) => (
                                <option key={v.id} value={v.id}>
                                  {v.id} - {v.modelName || v.id} ({v.status || "Active"})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Grid for Origin and Destination */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">
                                Origin
                              </label>
                              <select
                                value={editingTrip.origin}
                                onChange={(e) => setEditingTrip({ ...editingTrip, origin: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-300 rounded-md outline-none cursor-pointer"
                              >
                                <option value="">-- Select Origin --</option>
                                {originOptions.map((city) => (
                                  <option key={city} value={city}>
                                    {city}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">
                                Destination
                              </label>
                              <select
                                value={editingTrip.destination}
                                onChange={(e) => setEditingTrip({ ...editingTrip, destination: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-300 rounded-md outline-none cursor-pointer"
                              >
                                <option value="">-- Select Destination --</option>
                                {destinationOptions.map((city) => (
                                  <option key={city} value={city}>
                                    {city}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Grid for Date & Expected Delivery */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">
                                Trip Date
                              </label>
                              <div className="relative">
                                <input
                                  ref={tripDateRef}
                                  type="date"
                                  required
                                  value={convertFormattedDateToISO(editingTrip.date)}
                                  onChange={(e) => {
                                    const formatted = convertISOToFormattedDate(e.target.value);
                                    setEditingTrip({ ...editingTrip, date: formatted });
                                  }}
                                  className="hide-date-indicator w-full pl-3 pr-9 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100 cursor-pointer"
                                  onClick={() => {
                                    try {
                                      tripDateRef.current?.showPicker();
                                    } catch (err) {}
                                  }}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                  <Calendar className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                Expected Delivery
                              </label>
                              <div className="relative">
                                <input
                                  ref={expectedDeliveryRef}
                                  type="date"
                                  required
                                  value={convertFormattedDateToISO(editingTrip.expectedDelivery || "")}
                                  onChange={(e) => {
                                    const formatted = convertISOToFormattedDate(e.target.value);
                                    setEditingTrip({ ...editingTrip, expectedDelivery: formatted });
                                  }}
                                  className="hide-date-indicator w-full pl-3 pr-9 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100 cursor-pointer"
                                  onClick={() => {
                                    try {
                                      expectedDeliveryRef.current?.showPicker();
                                    } catch (err) {}
                                  }}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                  <Calendar className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status and Priority */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                Trip Status
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActivePicker(activePicker === 'form' ? null : 'form')}
                                  className={`w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none cursor-pointer transition-all ${
                                    activePicker === 'form' ? "ring-2 ring-primary-500/30 border-primary-500" : ""
                                  }`}
                                >
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${TRIP_STATUS_COLORS[editingTrip.status]}`}>
                                    {editingTrip.status}
                                  </span>
                                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activePicker === 'form' ? "rotate-180" : ""}`} />
                                </button>

                                {activePicker === 'form' && (
                                  <div className="absolute z-[60] left-0 right-0 mt-2 p-2 bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#333] shadow-xl rounded-xl animate-in fade-in zoom-in duration-150">
                                    <div className="grid grid-cols-2 gap-2">
                                      {tripStatuses.map((st) => (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => {
                                            setEditingTrip({ ...editingTrip, status: st });
                                            // Auto-expand delay management if "Delayed" is selected
                                            if (st === 'Delayed') {
                                              setExpandedAccordions(prev => prev.includes('delay-mgmt') ? prev : [...prev, 'delay-mgmt']);
                                              setReportDelay(true);
                                            } else {
                                              setReportDelay(false);
                                            }
                                            setActivePicker(null);
                                          }}
                                          className={`flex items-center justify-center px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                                            editingTrip.status === st
                                              ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                                              : "bg-gray-50 dark:bg-[#202020] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525]"
                                          }`}
                                        >
                                          {st}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                Priority Level
                              </label>
                              <select
                                value={editingTrip.priority}
                                onChange={(e) => setEditingTrip({ ...editingTrip, priority: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-300 rounded-md outline-none cursor-pointer"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                          </div>

                          {/* Load Type & Freight Value */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                Cargo Load Type
                              </label>
                              <select
                                value={editingTrip.loadType}
                                onChange={(e) => setEditingTrip({ ...editingTrip, loadType: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-300 rounded-md outline-none cursor-pointer"
                              >
                                <option value="">-- Select Load Type --</option>
                                {loadTypeOptions.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                Freight Value
                              </label>
                              <input
                                type="text"
                                required
                                value={editingTrip.amount}
                                onChange={(e) => setEditingTrip({ ...editingTrip, amount: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100 font-mono"
                              />
                            </div>
                          </div>

                          {/* Distance & Current Location */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                Distance
                              </label>
                              <input
                                type="text"
                                required
                                value={editingTrip.distance}
                                onChange={(e) => setEditingTrip({ ...editingTrip, distance: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                Current Location
                              </label>
                              <input
                                type="text"
                                required
                                value={editingTrip.currentLocation}
                                onChange={(e) => setEditingTrip({ ...editingTrip, currentLocation: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 2: Delay Management - Shown if status is "Delayed" or if there is delay history */}
                <AnimatePresence>
                  {(editingTrip.status === 'Delayed' || (editingTrip.delayEvents && editingTrip.delayEvents.length > 0)) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border border-amber-100 dark:border-amber-900/30 rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleAccordion('delay-mgmt')}
                        className="w-full flex items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-[13px] font-sans truncate">
                            Delay Management
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${expandedAccordions.includes('delay-mgmt') ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {expandedAccordions.includes('delay-mgmt') && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="p-4 space-y-4 border-t border-amber-100 dark:border-amber-900/20">
                              
                              {/* Delay Timeline */}
                              {editingTrip.delayEvents && editingTrip.delayEvents.length > 0 && (
                                <div className="mb-6 space-y-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-4 bg-amber-500 rounded-full" />
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-200 uppercase tracking-widest">
                                      Event History
                                    </span>
                                  </div>
                                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-amber-100 dark:before:bg-amber-900/30">
                                    {editingTrip.delayEvents.map((event) => (
                                      <div key={event.id} className="relative">
                                        <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1b1b1b] bg-amber-500 z-10 flex items-center justify-center shadow-sm">
                                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#202020] rounded-xl p-3 border border-gray-100 dark:border-[#2d2d2d] hover:border-amber-200 dark:hover:border-amber-800/40 transition-colors">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                                                {event.reason}
                                              </span>
                                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                event.severity === 'Critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                                event.severity === 'High' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                                                event.severity === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                                              }`}>
                                                {event.severity}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                              #{event.id.split('-').pop()}
                                            </div>
                                          </div>
                                          <p className="text-[10px] text-gray-700 dark:text-gray-300 mb-3 leading-relaxed bg-white dark:bg-[#1b1b1b] p-2 rounded-lg border border-gray-50 dark:border-[#252525]">
                                            {event.remarks}
                                          </p>
                                          <div className="flex items-center justify-between text-[9px] text-gray-500 dark:text-gray-400 font-medium pt-2 border-t border-gray-100 dark:border-[#2d2d2d]">
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {new Date(event.reportedAt).toLocaleString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <User className="w-3 h-3" />
                                              {event.reportedBy}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-4 bg-primary-500 rounded-full" />
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-200 uppercase tracking-widest">
                                  Report New Delay
                                </span>
                              </div>

                              {/* Reason & Severity */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                    Delay Reason
                                  </label>
                                  <select
                                    value={delayReason}
                                    onChange={(e) => {
                                      setDelayReason(e.target.value as DelayReason);
                                      if (delayErrors.reason) {
                                        setDelayErrors(prev => ({ ...prev, reason: undefined }));
                                      }
                                    }}
                                    className={`w-full px-3 py-2 bg-white dark:bg-[#101010] border rounded-md outline-none cursor-pointer ${
                                      delayErrors.reason ? "border-red-500 text-red-600" : "border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-300"
                                    }`}
                                  >
                                    <option value="">-- Select Reason --</option>
                                    <option value="Vehicle Breakdown">Vehicle Breakdown</option>
                                    <option value="Traffic Congestion">Traffic Congestion</option>
                                    <option value="Warehouse Shortage">Warehouse Shortage</option>
                                    <option value="Damaged Goods">Damaged Goods</option>
                                    <option value="Missing Goods">Missing Goods</option>
                                    <option value="Customer Rejected">Customer Rejected</option>
                                    <option value="Loading Delay">Loading Delay</option>
                                    <option value="Unloading Delay">Unloading Delay</option>
                                    <option value="Weather">Weather</option>
                                    <option value="Road Closure">Road Closure</option>
                                    <option value="Mechanical Inspection">Mechanical Inspection</option>
                                    <option value="Other">Other</option>
                                  </select>
                                  {delayErrors.reason && <span className="text-[10px] text-red-500 font-medium">{delayErrors.reason}</span>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                    Severity
                                  </label>
                                  <select
                                    value={delaySeverity}
                                    onChange={(e) => {
                                      setDelaySeverity(e.target.value as Severity);
                                      if (delayErrors.severity) {
                                        setDelayErrors(prev => ({ ...prev, severity: undefined }));
                                      }
                                    }}
                                    className={`w-full px-3 py-2 bg-white dark:bg-[#101010] border rounded-md outline-none cursor-pointer ${
                                      delayErrors.severity ? "border-red-500 text-red-600" : "border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-300"
                                    }`}
                                  >
                                    <option value="">-- Select Severity --</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                  </select>
                                  {delayErrors.severity && <span className="text-[10px] text-red-500 font-medium">{delayErrors.severity}</span>}
                                </div>
                              </div>

                              {/* Remarks */}
                              <div className="flex flex-col gap-1.5">
                                <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                  Remarks
                                </label>
                                <textarea
                                  value={delayRemarks}
                                  onChange={(e) => {
                                    setDelayRemarks(e.target.value);
                                    if (delayErrors.remarks) {
                                      setDelayErrors(prev => ({ ...prev, remarks: undefined }));
                                    }
                                  }}
                                  placeholder="Min 20 characters, Max 500 characters..."
                                  rows={3}
                                  className={`w-full px-3 py-2 bg-white dark:bg-[#101010] border rounded-md outline-none focus:border-amber-500 text-gray-900 dark:text-gray-100 ${
                                    delayErrors.remarks ? "border-red-500" : "border-gray-200 dark:border-[#3d3d3d]"
                                  }`}
                                />
                                <div className="flex justify-between items-center">
                                  {delayErrors.remarks && <span className="text-[10px] text-red-500 font-medium">{delayErrors.remarks}</span>}
                                  <span className={`ml-auto text-[10px] ${delayRemarks.length < 20 || delayRemarks.length > 500 ? 'text-amber-500 font-bold' : 'text-gray-400 font-medium'}`}>
                                    {delayRemarks.length}/500
                                  </span>
                                </div>
                              </div>

                              {/* Reported Time & By */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                    Reported Time
                                  </label>
                                  <input
                                    type="text"
                                    readOnly
                                    value={new Date().toLocaleString()}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#3d3d3d] text-gray-500 rounded-md outline-none cursor-not-allowed font-medium"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                    Reported By
                                  </label>
                                  <input
                                    type="text"
                                    readOnly
                                    value="Current User"
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#3d3d3d] text-gray-500 rounded-md outline-none cursor-not-allowed font-medium"
                                  />
                                </div>
                              </div>

                              {/* Estimated Recovery Time */}
                              <div className="flex flex-col gap-1.5">
                                <label className="font-semibold text-gray-600 dark:text-gray-200 uppercase tracking-wider text-[10px]">
                                  Estimated Recovery Time (Optional)
                                </label>
                                <div className="relative">
                                  <input
                                    type="datetime-local"
                                    value={estimatedRecovery}
                                    onChange={(e) => setEstimatedRecovery(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-amber-500 text-gray-900 dark:text-gray-100 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2d2d2d] bg-white dark:bg-[#1b1b1b]">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to cancel Trip ${editingTrip.id}?`)) {
                      updateTripStatus(editingTrip.id, "Closed");
                      showFeedback(`Trip ${editingTrip.id} successfully cancelled.`, "success");
                      setIsEditDrawerOpen(false);
                    }
                  }}
                  className="mr-auto px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-450 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Trip
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditDrawerOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-700 text-white rounded-md text-xs font-semibold hover:bg-primary-800 transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {selectedTripIds.length > 0 && (
        <div 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3d3d3d] shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-8 animate-fade-in"
        >
          <div className="flex items-center gap-3 pr-8 border-r border-gray-100 dark:border-[#2d2d2d]">
            <div className="bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 font-bold px-2.5 py-1 rounded-lg text-sm">
              {selectedTripIds.length}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Trips Selected</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Bulk Actions:</span>
            <button 
              onClick={() => handleBulkStatusUpdate("In Transit")}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Truck className="w-4 h-4 text-blue-500" /> Start
            </button>
            <button 
              onClick={() => handleBulkStatusUpdate("Completed")}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Complete
            </button>
            <button 
              onClick={handleBulkExport}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-500" /> Export
            </button>
            <button 
              onClick={() => setSelectedTripIds([])}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Trips;
