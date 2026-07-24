import React, { useState, useMemo, useEffect } from "react";
import { Driver, Vehicle } from "../types";
import { BusinessRules } from "../lib/businessRules";
import { vehicleService } from "../services/vehicle.service";
import { ListTable, Column } from "../components/layout/ListTable";
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
  Mail,
  BatteryCharging,
  Gauge,
  Wrench,
  Flame,
  ShieldAlert,
} from "lucide-react";

// Vehicle interface defining the rich properties of modern rigs

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

// Seed arrays for deterministic mock generation
const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph",
  "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy",
  "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
];

const CITIES = [
  "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Los Angeles, CA", "New York, NY",
  "Atlanta, GA", "Seattle, WA", "Dallas, TX", "Miami, FL", "Denver, CO",
  "San Francisco, CA", "Boston, MA", "Detroit, MI", "Las Vegas, NV", "Orlando, FL"
];

const VEHICLE_MODELS = [
  { model: "Peterbilt 579", type: "Heavy Semi-Truck", fuel: "Diesel" as const, mpg: 7.2, cap: "45,000 lbs" },
  { model: "Freightliner Cascadia", type: "Heavy Semi-Truck", fuel: "Diesel" as const, mpg: 7.8, cap: "46,000 lbs" },
  { model: "Volvo VNL 860", type: "Premium Sleeper", fuel: "Diesel" as const, mpg: 7.4, cap: "44,500 lbs" },
  { model: "Kenworth T680", type: "Heavy Duty Day Cab", fuel: "Diesel" as const, mpg: 7.0, cap: "45,000 lbs" },
  { model: "Mack Anthem", type: "Sleeper Cab", fuel: "Diesel" as const, mpg: 6.8, cap: "48,000 lbs" },
  { model: "Tesla Semi", type: "Electric Heavy Rig", fuel: "Electric" as const, mpg: 1.8, cap: "40,000 lbs" },
  { model: "Hino 338 Box", type: "Medium Duty Box", fuel: "Diesel" as const, mpg: 11.5, cap: "14,500 lbs" },
  { model: "Volvo VNR Electric", type: "Electric Day Cab", fuel: "Electric" as const, mpg: 1.9, cap: "42,000 lbs" },
  { model: "Kenworth T370 Flatbed", type: "Medium Flatbed", fuel: "CNG" as const, mpg: 10.2, cap: "20,000 lbs" },
  { model: "Peterbilt 520EV", type: "Electric Medium Duty", fuel: "Electric" as const, mpg: 1.5, cap: "32,000 lbs" }
];

const generateVehiclesMock = (): Vehicle[] => {
  return Array.from({ length: 100 }, (_, i) => {
    const id = `VEH-${String(i + 1).padStart(3, "0")}`;
    const modelIdx = (i * 13 + i * 3) % VEHICLE_MODELS.length;
    const cityIdx = (i * 17 + 5) % CITIES.length;
    const firstIdx = (i * 7 + 12) % FIRST_NAMES.length;
    const lastIdx = (i * 9 + 8) % LAST_NAMES.length;

    const vItem = VEHICLE_MODELS[modelIdx];
    const location = CITIES[cityIdx];
    const plateState = location.split(", ")[1];
    const plateNumber = `${plateState} ${String(10 + (i % 90))}-${String(1000 + (i * 19) % 9000)}`;

    // Chronological/logical manufacturing year (older index has older vehicles)
    const year = 2018 + (i % 8); // 2018 to 2025

    // Multi-factor logical status determined by index and status rules
    let status: "Available" | "Assigned" | "In Transit" | "Loading" | "Unloading" | "Maintenance" | "Out of Service";
    if (i % 12 === 0) {
      status = "Maintenance";
    } else if (i % 25 === 0) {
      status = "Out of Service";
    } else if (i % 3 === 0) {
      status = "In Transit";
    } else if (i % 10 === 0) {
      status = "Loading";
    } else if (i % 15 === 0) {
      status = "Unloading";
    } else if (i % 7 === 0) {
      status = "Assigned";
    } else {
      status = "Available";
    }

    // Driver Assignment Logic:
    // - If on a trip (In Transit, Loading, Unloading, Assigned), MUST have an assigned driver
    // - If Maintenance/Out of Service, drivers are unassigned (idle/off-duty)
    // - If Available (available at hub), some can be Unassigned, others have assigned standby drivers
    let driverName = "Unassigned";
    if (status === "In Transit" || status === "Loading" || status === "Unloading" || status === "Assigned") {
      driverName = `${FIRST_NAMES[firstIdx]} ${LAST_NAMES[lastIdx]}`;
    } else if (status === "Available" && i % 4 !== 0) {
      driverName = `${FIRST_NAMES[firstIdx]} ${LAST_NAMES[lastIdx]}`;
    }

    // Active Trip Alignment Logic:
    // - Only vehicles on a trip (In Transit, Loading, Unloading, Assigned) have an Active Trip ID.
    // - Available, Maintenance, and Out of Service vehicles always have "None".
    const activeTripId = (status === "In Transit" || status === "Loading" || status === "Unloading" || status === "Assigned") 
      ? `TRP-${10000 + i * 29}` 
      : "None";

    // Fuel Level Logic:
    // - Active trip vehicles require sufficient fuel/charge to be on route (min 35%)
    // - Maintenance vehicles might be undergoing service for low fuel/battery or general repairs
    let fuelLevel = 0;
    if (status === "In Transit" || status === "Loading" || status === "Unloading" || status === "Assigned") {
      fuelLevel = 35 + ((i * 7) % 61); // 35% to 95%
    } else if (status === "Maintenance" || status === "Out of Service") {
      fuelLevel = 8 + ((i * 13) % 45); // 8% to 53%
    } else {
      fuelLevel = 20 + ((i * 11) % 76); // 20% to 95%
    }

    // Odometer Proportional to Age/Year:
    // - Proportional mileage accumulation based on age (approx. 45,000 miles/year)
    const ageYears = 2026 - year;
    const baseMilage = ageYears * 45000;
    const variation = (i * 2317) % 35000;
    const odometer = baseMilage + variation + 1500;

    // Next Service Date Logic:
    // - If currently in Maintenance, service is happening today (2026-06-04) or tomorrow (2026-06-05)
    // - Otherwise, next service is in the future based on index
    let nextServiceDate = "";
    if (status === "Maintenance") {
      nextServiceDate = i % 2 === 0 ? "2026-06-04" : "2026-06-05";
    } else {
      const month = 7 + (i % 6); // July to December
      const day = 10 + ((i * 7) % 18);
      nextServiceDate = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    const vin = `1FVACWDB${i % 10}${String(100000 + (i * 2345) % 900000)}Y`;

    return {
      id,
      modelName: vItem.model,
      type: vItem.type,
      plateNumber,
      assignedDriver: driverName,
      fuelLevel,
      fuelType: vItem.fuel,
      status,
      odometer,
      location,
      activeTripId,
      efficiencyMpg: vItem.mpg,
      nextServiceDate,
      year,
      payloadCapacity: vItem.cap,
      vin
    };
  });
};

const initialVehicles = generateVehiclesMock();

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("tms_vehicles");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialVehicles;
  });

  // Sync vehicles with vehicleService / Supabase
  useEffect(() => {
    let isMounted = true;
    vehicleService.getVehicles().then((data) => {
      if (isMounted && data && data.length > 0) {
        setVehicles(data);
      }
    });

    const handleDataChange = () => {
      vehicleService.getVehicles().then((data) => {
        if (isMounted && data) {
          setVehicles(data);
        }
      });
    };

    window.addEventListener("tms_data_changed", handleDataChange);
    return () => {
      isMounted = false;
      window.removeEventListener("tms_data_changed", handleDataChange);
    };
  }, []);

  // Sync vehicles to localStorage
  useEffect(() => {
    localStorage.setItem("tms_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  // Fresh drivers list state
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem("tms_drivers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Reload fresh drivers list when drawer or edit modal opens to stay synced
  // Moved below definition of isAddDrawerOpen and isEditModalOpen

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
        const newF = { id: "nav-filter", field: fieldName, operator: "is", value: navFilterValue };
        setAdvancedFilters([newF]);
        setAppliedFilters([newF]);
        setActiveFiltersCount(1);
      }
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  
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
      const customEvent = e as CustomEvent<{ type: string; id: string }>;
      if (customEvent.detail && customEvent.detail.type === 'Vehicle') {
        const vehicleId = customEvent.detail.id;
        setSearchTerm(vehicleId);
        setSelectedVehicleId(vehicleId);
        setSelectedView("Custom View");
        
        // Scroll into view logic
        setTimeout(() => {
          const element = document.getElementById(`row-${vehicleId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    };
    window.addEventListener('tms-deep-link', handleDeepLink);
    return () => window.removeEventListener('tms-deep-link', handleDeepLink);
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importTab, setImportTab] = useState<"import" | "history">("import");
  
  // Drawer / Add Vehicle Dialog
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    modelName: "",
    type: "Heavy Semi-Truck",
    plateNumber: "",
    fuelLevel: 100,
    fuelType: "Diesel" as const,
    status: "Available" as const,
    odometer: 10000,
    location: "Chicago, IL",
    year: 2025,
    payloadCapacity: "45,000 lbs",
    vin: "",
  });
  
  // Edit Vehicle Dialog
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Reload fresh drivers list when drawer or edit modal opens to stay synced
  useEffect(() => {
    if (isAddDrawerOpen || isEditModalOpen) {
      const savedDrivers = localStorage.getItem("tms_drivers");
      if (savedDrivers) {
        try {
          setDrivers(JSON.parse(savedDrivers));
        } catch (e) {}
      }
    }
  }, [isAddDrawerOpen, isEditModalOpen]);

  // Pagination & Lists Configs
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openVehicleMenu, setOpenVehicleMenu] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Close vehicle menu when user clicks outside the action menu container
  useEffect(() => {
    if (!openVehicleMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".action-menu-container")) {
        setOpenVehicleMenu(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [openVehicleMenu]);
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc" | null;
  }>({ field: "", direction: null });

  // Custom Saved Views
  const [newViewName, setNewViewName] = useState("");
  const [isSaveViewModalOpen, setIsSaveViewModalOpen] = useState(false);

  const initialViews: SavedView[] = [
    { name: "Default View", searchTerm: "", appliedFilters: [] },
    {
      name: "In Transit Fleet",
      searchTerm: "",
      appliedFilters: [
        { id: "v1", field: "Status", operator: "is", value: "In Transit" },
      ],
    },
    {
      name: "Electric Vehicles",
      searchTerm: "",
      appliedFilters: [
        { id: "v2", field: "Fuel Type", operator: "is", value: "Electric" },
      ],
    },
    {
      name: "Under Maintenance",
      searchTerm: "",
      appliedFilters: [
        { id: "v3", field: "Status", operator: "is", value: "Maintenance" },
      ],
    },
  ];

  const [savedViews, setSavedViews] = useState<SavedView[]>(initialViews);
  const [selectedView, setSelectedView] = useState("Default View");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const [advancedFilters, setAdvancedFilters] = useState<FilterAction[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterAction[]>([]);
  
  const availableFields = ["Status", "Type", "Location", "Fuel Type"];
  const vehicleStatusOptions = ["Available", "Assigned", "In Transit", "Loading", "Unloading", "Maintenance", "Out of Service"];
  const fuelTypeOptions = ["Diesel", "Electric", "CNG", "Hybrid"];

  const handleViewChange = (viewName: string) => {
    setSelectedView(viewName);
    const view = savedViews.find((v) => v.name === viewName);
    if (view) {
      setSearchTerm(view.searchTerm);
      setAdvancedFilters(view.appliedFilters);
      setAppliedFilters(view.appliedFilters);
      let count = 0;
      if (view.searchTerm) count++;
      count += view.appliedFilters.length;
      setActiveFiltersCount(count);
    }
  };

  const addFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const field = e.target.value;
    if (!field) return;
    setAdvancedFilters([
      ...advancedFilters,
      { id: Math.random().toString(), field, operator: "is", value: "" },
    ]);
  };

  const removeFilter = (id: string) => {
    setAdvancedFilters(advancedFilters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof FilterAction, value: string) => {
    setAdvancedFilters(
      advancedFilters.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
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
  };

  const handleSaveViewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) return;
    const newView: SavedView = {
      name: newViewName.trim(),
      searchTerm,
      appliedFilters: [...appliedFilters],
    };
    setSavedViews([...savedViews, newView]);
    setSelectedView(newViewName.trim());
    setIsSaveViewModalOpen(false);
    setNewViewName("");
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm(`Are you sure you want to remove vehicle (${id}) from the fleet?`)) {
      const updatedVehicles = vehicles.filter((v) => v.id !== id);
      setVehicles(updatedVehicles);
      if (selectedVehicleId === id) setSelectedVehicleId(null);
      setOpenVehicleMenu(null);

      await vehicleService.deleteVehicle(id);

      // Relational sync: unassign from any driver
      const updatedDrivers = drivers.map(d => {
        if (d.assignedVehicle === id) {
          return { ...d, assignedVehicle: "Unassigned" };
        }
        return d;
      });
      setDrivers(updatedDrivers);
      localStorage.setItem("tms_drivers", JSON.stringify(updatedDrivers));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `VEH-${String(vehicles.length + 1).padStart(3, "0")}`;
    const vehicleToAdd: Vehicle = {
      id: nextId,
      ...newVehicle,
      assignedDriver: "Unassigned",
      activeTripId: newVehicle.status === "In Transit" ? "TRP-10999" : "None",
      vin: newVehicle.vin || `1FVACWDB${Math.floor(Math.random() * 10)}${Math.floor(100000 + Math.random() * 900000)}Y`,
      efficiencyMpg: newVehicle.fuelType === "Electric" ? 1.8 : 7.2,
      nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    };

    setVehicles([vehicleToAdd, ...vehicles]);
    await vehicleService.createVehicle(vehicleToAdd);

    setIsAddDrawerOpen(false);
    // Reset form
    setNewVehicle({
      modelName: "",
      type: "Heavy Semi-Truck",
      plateNumber: "",
      fuelLevel: 100,
      fuelType: "Diesel",
      status: "Available" as any,
      odometer: 10000,
      location: "Chicago, IL",
      year: 2025,
      payloadCapacity: "45,000 lbs",
      vin: "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? editingVehicle : v)));
    await vehicleService.updateVehicle(editingVehicle);

    setIsEditModalOpen(false);
    setEditingVehicle(null);
  };

  // CSV Dynamic Export for Vehicles
  const handleExport = () => {
    const headers = [
      "Vehicle ID", "Model Name", "Type", "Plate Number", "Assigned Driver",
      "Fuel Type", "Fuel Level (%)", "Status", "Odometer (mi)", "Location", "Active Trip ID",
      "VIN", "Year", "Payload Capacity", "Next Service Date"
    ].join(",");
    const rows = filteredVehicles.map((v) =>
      `"${v.id}","${v.modelName}","${v.type}","${v.plateNumber}","${v.assignedDriver}","${v.fuelType}",${v.fuelLevel},"${v.status}",${v.odometer},"${v.location}","${v.activeTripId}","${v.vin}",${v.year},"${v.payloadCapacity}","${v.nextServiceDate}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_vehicles_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Searching, sorting, and filtering logic combined
  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter((vehicle) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTerm =
          vehicle.id.toLowerCase().includes(term) ||
          vehicle.modelName.toLowerCase().includes(term) ||
          vehicle.type.toLowerCase().includes(term) ||
          vehicle.plateNumber.toLowerCase().includes(term) ||
          vehicle.assignedDriver.toLowerCase().includes(term) ||
          vehicle.location.toLowerCase().includes(term) ||
          vehicle.status.toLowerCase().includes(term) ||
          vehicle.fuelType.toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }

      for (const filter of appliedFilters) {
        if (!filter.value) continue;

        if (filter.field === "fuelAlert") {
          const match = vehicle.fuelLevel <= Number(filter.value);
          if (!match) return false;
          continue;
        }

        let attributeValue = "";
        if (filter.field === "Status") attributeValue = vehicle.status;
        else if (filter.field === "Type") attributeValue = vehicle.type;
        else if (filter.field === "Location") attributeValue = vehicle.location;
        else if (filter.field === "Fuel Type") attributeValue = vehicle.fuelType;

        const a = attributeValue.toLowerCase();
        const b = filter.value.toLowerCase();

        let match = false;
        if (filter.operator === "is") match = a === b;
        else if (filter.operator === "is_not") match = a !== b;
        else if (filter.operator === "contains") match = a.includes(b);

        if (!match) return false;
      }

      return true;
    });

    if (sortConfig.field && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        let valA: any = "";
        let valB: any = "";

        if (sortConfig.field === "Model") {
          valA = a.modelName;
          valB = b.modelName;
        } else if (sortConfig.field === "ID") {
          valA = a.id;
          valB = b.id;
        } else if (sortConfig.field === "Odometer") {
          valA = a.odometer;
          valB = b.odometer;
        } else if (sortConfig.field === "Fuel") {
          valA = a.fuelLevel;
          valB = b.fuelLevel;
        } else if (sortConfig.field === "Status") {
          valA = a.status;
          valB = b.status;
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [vehicles, searchTerm, appliedFilters, sortConfig]);

  // Reset page when search or layout changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appliedFilters, itemsPerPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  const paginatedVehicles = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  const columns: Column<Vehicle>[] = [
    { key: "ID", label: "Vehicle No", sortable: true, sortKey: "ID" },
    { key: "Model", label: "Vehicle Type", sortable: true, sortKey: "Model" },
    { key: "Driver", label: "Driver" },
    { key: "Location", label: "Current Location" },
    { key: "Status", label: "Status", sortable: true, sortKey: "Status" },
    { key: "Trips", label: "Active Trips" },
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

  const handleSort = (field: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.field === field) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = null;
    }
    setSortConfig({ field: direction ? field : "", direction });
  };

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  return (
    <>
      <div className="animate-fade-in flex flex-col h-full">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-[24px] font-bold text-[#3e3e3e] dark:text-white">
              Vehicles
            </h1>
            <p className="text-[13px] font-normal text-[#9c9c9c] m-0.5 font-sans">Manage vehicles and track fleet telemetry</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-medium text-gray-650 dark:text-gray-400">
                View:
              </span>
              <select
                className="px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3d3d3d] rounded-md text-gray-900 dark:text-gray-100 text-xs font-medium outline-none focus:border-primary-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
                value={selectedView}
                onChange={(e) => handleViewChange(e.target.value)}
              >
                {savedViews.map((view) => (
                  <option key={view.name} value={view.name}>
                    {view.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isFilterOpen
                  ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500/50 dark:bg-primary-900/20 dark:text-primary-400"
                  : "border-gray-200 dark:border-[#3d3d3d] bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#202020]"
              }`}
            >
              <Filter className="h-3.5 w-3.5" /> Filter
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center bg-gray-200/85 dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-350 text-[10px] font-bold rounded-full h-4 w-4 ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md bg-white dark:bg-[#1a1a1a] text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#202020] transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md bg-white dark:bg-[#1a1a1a] text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#202020] transition-colors"
            >
              <Upload className="h-3.5 w-3.5" /> Import
            </button>

            <button
              onClick={() => setIsAddDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#295DAA] text-white rounded-md text-xs font-medium hover:opacity-90 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Vehicle
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#191919] rounded-lg shadow-xs transition-colors flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Advanced Search & Filtering Panel */}
          {isFilterOpen && (
            <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] shrink-0 animate-fade-in text-[13px] text-gray-800 dark:text-gray-300">
              <div className="max-w-4xl">
                {/* Filter by text */}
                <div className="flex items-center mb-5">
                  <div className="w-36 font-medium">Filter by text</div>
                  <input
                    type="text"
                    placeholder="Search ID, model, plate, driver, depot location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                        <option value="is">is (OR)</option>
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
                            {vehicleStatusOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : filter.field === "Type" ? (
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
                            {[
                              "Heavy Semi-Truck",
                              "Premium Sleeper",
                              "Heavy Duty Day Cab",
                              "Sleeper Cab",
                              "Electric Heavy Rig",
                              "Medium Duty Box",
                              "Electric Day Cab",
                              "Medium Flatbed",
                              "Electric Medium Duty"
                            ].map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : filter.field === "Location" ? (
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
                            {CITIES.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : filter.field === "Fuel Type" ? (
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
                            {fuelTypeOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
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
                            className={`w-full px-3 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded outline-none focus:border-primary-500 ${!filter.value ? "text-gray-400" : "text-gray-900 dark:text-gray-100"}`}
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
                  className="px-3 py-1.5 text-xs font-medium text-primary-650 dark:text-primary-450 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
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

          {/* Layout Body (Split view system) */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* List side / Table component */}
            <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-auto">
                <ListTable
                  columns={columns}
                  data={paginatedVehicles}
                  rowKey={(vehicle) => vehicle.id}
                  selectedRowKey={selectedVehicleId}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onRowClick={(vehicle) => {
                    const isSelected = selectedVehicleId === vehicle.id;
                    setSelectedVehicleId(isSelected ? null : vehicle.id);
                  }}
                  renderRowCells={(vehicle) => {
                    // Status color profiles
                    let statusStyle = "";
                    switch (vehicle.status) {
                      case "Available":
                        statusStyle = "bg-green-55 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30";
                        break;
                      case "Assigned":
                        statusStyle = "bg-teal-55 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900/30";
                        break;
                      case "In Transit":
                        statusStyle = "bg-blue-55 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30";
                        break;
                      case "Loading":
                        statusStyle = "bg-amber-55 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30";
                        break;
                      case "Unloading":
                        statusStyle = "bg-purple-55 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30";
                        break;
                      case "Maintenance":
                        statusStyle = "bg-yellow-55 dark:bg-yellow-950/20 text-yellow-750 dark:text-yellow-400 border border-yellow-250 dark:border-yellow-900/30";
                        break;
                      case "Out of Service":
                        statusStyle = "bg-red-55 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30";
                        break;
                    }

                    return (
                      <>
                        {/* Vehicle No */}
                        <td className="px-6 py-2.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-primary-600 dark:text-primary-450 font-mono">
                              {vehicle.id}
                            </span>
                            <span className="mt-1 inline-flex items-center px-1.5 py-0.5 border border-gray-200 dark:border-gray-750 bg-gray-50/50 dark:bg-[#1a1a1a] rounded font-mono text-[9px] font-bold text-gray-600 dark:text-gray-400 w-fit uppercase tracking-wider">
                              {vehicle.plateNumber}
                            </span>
                          </div>
                        </td>
                        {/* Vehicle Type */}
                        <td className="px-6 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-[#2d2d2d] flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                              <Truck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                {vehicle.modelName} <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">({vehicle.year})</span>
                              </span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mt-0.5 block">
                                {vehicle.type}
                              </span>
                            </div>
                          </div>
                        </td>
                        {/* Driver */}
                        <td className="px-6 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#282828] flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400">
                              <User className="w-3 h-3 text-gray-400" />
                            </div>
                            {vehicle.assignedDriver === "Unassigned" ? (
                              <span className="text-gray-400 italic font-semibold">
                                Unassigned
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.dispatchEvent(
                                    new CustomEvent("tms-navigate", {
                                      detail: { tab: "Drivers", filter: "searchTerm", value: vehicle.assignedDriver },
                                    })
                                  );
                                }}
                                className="font-semibold text-gray-700 dark:text-gray-300 hover:underline cursor-pointer"
                              >
                                {vehicle.assignedDriver}
                              </button>
                            )}
                          </div>
                        </td>
                        {/* Current Location */}
                        <td className="px-6 py-2.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                              {vehicle.location}
                            </span>
                            <span className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5 flex items-center gap-1 leading-none font-mono">
                              <Gauge className="w-2.5 h-2.5 text-gray-400" />
                              {vehicle.odometer.toLocaleString()} mi
                            </span>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-6 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 border rounded-full text-xs font-medium ${statusStyle}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        {/* Active Trips */}
                        <td className="px-6 py-2.5 whitespace-nowrap">
                          {vehicle.activeTripId && vehicle.activeTripId !== "None" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.dispatchEvent(
                                  new CustomEvent("tms-navigate", {
                                    detail: { tab: "Trips", filter: "id", value: vehicle.activeTripId },
                                  })
                                );
                              }}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-450 border border-primary-200/50 dark:border-primary-900/30 font-mono hover:underline cursor-pointer"
                            >
                              {vehicle.activeTripId}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                              None
                            </span>
                          )}
                        </td>
                        {/* Actions trigger */}
                        <td className="px-6 py-2.5 whitespace-nowrap text-right text-xs font-semibold relative" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingVehicle(vehicle);
                                setIsEditModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-[#295DAA] dark:hover:text-[#4176c2] transition-colors p-1 rounded hover:bg-gray-150 dark:hover:bg-[#2d2d2d]"
                              title="Update Vehicle Records"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            
                            <div className="relative inline-block text-left action-menu-container">
                              <button
                                onClick={() =>
                                  setOpenVehicleMenu(openVehicleMenu === vehicle.id ? null : vehicle.id)
                                }
                                className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1 rounded hover:bg-gray-150 dark:hover:bg-[#2d2d2d]"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                              
                              {openVehicleMenu === vehicle.id && (
                                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2d2d2d] rounded-md shadow-lg z-30 py-1 text-left font-sans font-semibold text-gray-700 dark:text-gray-250 animate-fade-in text-xs">
                                  <button
                                    onClick={() => {
                                      setSelectedVehicleId(vehicle.id);
                                      setOpenVehicleMenu(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-gray-400" /> View Details
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setOpenVehicleMenu(null);
                                      window.dispatchEvent(
                                        new CustomEvent("tms-navigate", {
                                          detail: { tab: "Trips", filter: "searchTerm", value: vehicle.id },
                                        })
                                      );
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-blue-500" /> View Current Trip
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenVehicleMenu(null);
                                      window.dispatchEvent(
                                        new CustomEvent("tms-navigate", {
                                          detail: { tab: "Trips", filter: "searchTerm", value: vehicle.id },
                                        })
                                      );
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-indigo-500" /> Assign Trip
                                  </button>

                                  <button
                                    onClick={() => {
                                      const result = BusinessRules.validateVehicle(vehicle);
                                      if (!result.valid) {
                                        alert(result.message);
                                      } else {
                                        const updated = { ...vehicle, status: "Maintenance" as const };
                                        setVehicles(vehicles.map(v => v.id === vehicle.id ? updated : v));
                                        vehicleService.updateVehicle(updated);
                                        setOpenVehicleMenu(null);
                                      }
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                                    disabled={vehicle.status === "Maintenance"}
                                  >
                                    <Wrench className="w-3.5 h-3.5 text-amber-500" /> Schedule Maintenance
                                  </button>

                                  <button
                                    onClick={() => {
                                      const activeTrips = JSON.parse(localStorage.getItem("tms_trips") || "[]");
                                      const onActiveTrip = activeTrips.some((t: any) => t.vehicleNo === vehicle.id && t.status !== "Delivered" && t.status !== "Closed");
                                      if (onActiveTrip) {
                                        alert(`Error: Cannot mark vehicle ${vehicle.id} as Available because it is currently assigned to an active trip.`);
                                      } else {
                                        const updated = { ...vehicle, status: "Available" as const };
                                        setVehicles(vehicles.map(v => v.id === vehicle.id ? updated : v));
                                        vehicleService.updateVehicle(updated);
                                      }
                                      setOpenVehicleMenu(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Mark Available
                                  </button>

                                  <button
                                    onClick={() => {
                                      const updated = { ...vehicle, status: "Out of Service" as const };
                                      setVehicles(vehicles.map(v => v.id === vehicle.id ? updated : v));
                                      vehicleService.updateVehicle(updated);
                                      setOpenVehicleMenu(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Mark Out of Service
                                  </button>

                                  <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                                  <button
                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                    className="w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove Vehicle
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </>
                    );
                  }}
                />
                
                {paginatedVehicles.length === 0 && (
                  <div className="min-w-full text-center py-12 text-gray-500 dark:text-gray-400 text-xs bg-white dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-[#2d2d2d]">
                    No vehicle fleet matches current query criteria.
                  </div>
                )}
              </div>

              {/* Pagination Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-[#2d2d2d] flex items-center justify-between shrink-0 bg-white dark:bg-[#1e1e1e] rounded-b-lg text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-1.5">
                  {currentPage > 1 && (
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 border border-gray-200 dark:border-[#3d3d3d] rounded flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors mr-2 cursor-pointer"
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
                          ? "italic px-1 text-primary-700 dark:text-primary-400 font-medium cursor-pointer text-xs"
                          : "px-2.5 py-1 border border-gray-200 dark:border-[#3d3d3d] rounded hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors cursor-pointer text-xs"
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
                    className="px-2.5 py-1 border border-gray-200 dark:border-[#3d3d3d] rounded flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] disabled:opacity-50 transition-colors cursor-pointer text-xs"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="ml-3 text-gray-600 dark:text-gray-400 text-xs">
                    (
                    {filteredVehicles.length === 0
                      ? 0
                      : (currentPage - 1) * itemsPerPage + 1}{" "}
                    - {Math.min(currentPage * itemsPerPage, filteredVehicles.length)}/
                    {filteredVehicles.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                    Per page:
                  </span>
                  {[10, 20, 50, 100].map((num) => (
                    <button
                      key={num}
                      onClick={() => setItemsPerPage(num)}
                      className={
                        num === itemsPerPage
                          ? "italic px-1 text-primary-700 dark:text-primary-400 font-medium cursor-pointer text-xs"
                          : "px-2.5 py-1 border border-gray-200 dark:border-[#3d3d3d] rounded hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors cursor-pointer text-xs"
                      }
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Split Screen Panel -> Side Dossier details if selected */}
            {selectedVehicle && (
              <div className="w-full md:w-[350px] xl:w-[400px] border-l border-gray-100 dark:border-[#2d2d2d] bg-white dark:bg-[#111111] shrink-0 p-5 overflow-auto flex flex-col gap-5 animate-fade-in">
                {/* Header detail */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded bg-primary-100 dark:bg-primary-950/40 text-primary-750 dark:text-primary-450 flex items-center justify-center font-bold text-base">
                      <Truck className="w-6 h-6 text-[#295DAA] dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {selectedVehicle.modelName}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                        Plate: {selectedVehicle.plateNumber}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVehicleId(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="border-t border-gray-100 dark:border-[#252525] pt-4 flex flex-col gap-4">
                  {/* Vehicle Main Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">
                        Fuel Energy
                      </span>
                      <span className="text-sm font-extrabold text-gray-800 dark:text-gray-150 inline-flex items-center gap-1 mt-1 justify-center w-full">
                        {selectedVehicle.fuelType === "Electric" ? (
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        {selectedVehicle.fuelLevel}%
                      </span>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">
                        Efficiency
                      </span>
                      <span className="text-sm font-extrabold text-gray-800 dark:text-gray-150 inline-flex items-center gap-0.5 mt-1 justify-center w-full font-mono">
                        {selectedVehicle.efficiencyMpg} {selectedVehicle.fuelType === "Electric" ? "kW/m" : "MPG"}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">
                        Year Model
                      </span>
                      <span className="text-sm font-extrabold text-green-600 mt-1 block font-mono">
                        {selectedVehicle.year}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Identity Dossier */}
                  <div className="bg-gray-50/50 dark:bg-[#151515] rounded-xl border border-gray-100 dark:border-[#202020] p-4 shrink-0 flex flex-col gap-3 font-medium text-xs">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Vehicle Code</span>
                      <span className="font-mono text-gray-950 dark:text-gray-100 font-bold">{selectedVehicle.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>VIN Standard</span>
                      <span className="font-mono text-gray-950 dark:text-gray-100 text-[10px] tracking-tight">{selectedVehicle.vin}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Class / Body Type</span>
                      <span className="text-gray-950 dark:text-gray-100 font-medium">{selectedVehicle.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Capacity Limit</span>
                      <span className="text-gray-955 dark:text-gray-100 font-mono">{selectedVehicle.payloadCapacity}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Assigned Depot</span>
                      <span className="text-gray-955 dark:text-gray-100 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {selectedVehicle.location}
                      </span>
                    </div>
                  </div>

                  {/* Active Driver Assignment */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 mt-1 tracking-wider">
                      ASSIGNED OPERATOR
                    </h4>
                    <div className="p-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/25 flex items-center justify-center text-[#295DAA] dark:text-primary-400 font-bold uppercase text-xs">
                          {selectedVehicle.assignedDriver.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {selectedVehicle.assignedDriver}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {selectedVehicle.assignedDriver === "Unassigned" ? "Needs temporary operator" : "Active dispatch lead"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Log */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      SERVICE & SAFETY CHECKS
                    </h4>
                    <div className="p-4 bg-gray-55/70 dark:bg-[#181818] rounded-xl border border-gray-100 dark:border-gray-800/60 flex flex-col gap-2 leading-relaxed">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-medium">Odometer Total:</span>
                        <span className="font-mono font-extrabold text-gray-950 dark:text-gray-100 text-[11px]">
                          {selectedVehicle.odometer.toLocaleString()} miles
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-medium">Next Service Due:</span>
                        <span className="font-mono font-bold text-gray-950 dark:text-gray-100 text-[11px] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary-500" />
                          {selectedVehicle.nextServiceDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-100 dark:border-[#2a2a2a] mt-1">
                        <span className="text-gray-500 font-medium">Active Trip Code:</span>
                        {selectedVehicle.activeTripId && selectedVehicle.activeTripId !== "None" ? (
                          <button
                            onClick={() => {
                              window.dispatchEvent(
                                new CustomEvent("tms-navigate", {
                                  detail: { tab: "Trips", filter: "id", value: selectedVehicle.activeTripId },
                                })
                              );
                            }}
                            className="font-mono font-extrabold text-[#295DAA] dark:text-primary-450 text-[11px] hover:underline cursor-pointer"
                          >
                            {selectedVehicle.activeTripId}
                          </button>
                        ) : (
                          <span className="font-mono text-gray-400 dark:text-gray-500 text-[11px]">
                            None
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct quick action contacts */}
                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, status: "Maintenance" } : v));
                    }}
                    className="flex-1 py-1.5 border border-primary-100 dark:border-primary-900/35 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-900/30 text-primary-750 dark:text-primary-400 text-xs font-bold transition rounded-lg text-center cursor-pointer"
                  >
                    Send to Service
                  </button>
                  <button
                    onClick={() => {
                      setEditingVehicle(selectedVehicle);
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 py-1.5 border border-gray-200 dark:border-gray-750 bg-white hover:bg-gray-100 dark:bg-[#181818] dark:hover:bg-[#252525] text-gray-700 dark:text-gray-250 text-xs font-bold transition rounded-lg text-center cursor-pointer"
                  >
                    Edit Vehicle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save view modal */}
      {isSaveViewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white dark:bg-[#1b1b1b] border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-xl max-w-sm w-full p-6 text-gray-800 dark:text-gray-200">
            <h3 className="text-sm font-bold mb-1">Save Customized Filter View</h3>
            <p className="text-[11px] text-gray-400 mb-4">Assign a custom preset name to access this snapshot later.</p>
            <form onSubmit={handleSaveViewSubmit}>
              <input
                type="text"
                placeholder="e.g. Electric High Capacity Rigs"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 mb-5 text-gray-900 dark:text-gray-100"
              />
              <div className="flex justify-end gap-3 font-semibold text-xs text-right">
                <button
                  type="button"
                  onClick={() => setIsSaveViewModalOpen(false)}
                  className="px-3.5 py-2 text-gray-500 hover:text-gray-750 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newViewName.trim()}
                  className="px-4 py-2 bg-[#295DAA] text-white rounded-md hover:opacity-95 disabled:opacity-40 transition cursor-pointer"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backdrop for Off-Canvas Edit Drawer */}
      {isEditModalOpen && editingVehicle && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity"
          onClick={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Off-Canvas Slide Drawer - Edit Vehicle Asset */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-[#1b1b1b] border-l border-gray-200 dark:border-[#2d2d2d] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isEditModalOpen && editingVehicle ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {editingVehicle && (
          <div className="h-full p-6 text-gray-800 dark:text-gray-200 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a] mb-5 shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-650" />
                <h3 className="text-sm font-bold">Edit Vehicle Asset ({editingVehicle.id})</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto space-y-4 text-xs pr-1 pb-4">
                <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Model Manufacturer & Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peterbilt 579"
                  value={editingVehicle.modelName}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, modelName: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Year Manufactured</label>
                  <input
                    type="number"
                    min="2010"
                    max="2027"
                    required
                    value={editingVehicle.year}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TX 82FK-1433"
                    value={editingVehicle.plateNumber}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, plateNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Class / Body Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sleeper Cab Heavy Duty"
                  value={editingVehicle.type}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Operational Assignment</label>
                <div className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-[#2d2d2d] text-gray-500 dark:text-gray-400 rounded-md text-[11px] flex items-center justify-between italic">
                  <span>Assignment managed via Trips workspace</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      window.dispatchEvent(new CustomEvent("tms-navigate", { detail: { tab: "Trips" } }));
                    }}
                    className="text-primary-600 dark:text-primary-400 hover:underline not-italic font-bold"
                  >
                    Go to Trips
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Fuel Type</label>
                  <select
                    value={editingVehicle.fuelType}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, fuelType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer"
                  >
                    {fuelTypeOptions.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Fuel Level (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingVehicle.fuelLevel}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, fuelLevel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Odometer Reading</label>
                  <input
                    type="number"
                    required
                    value={editingVehicle.odometer}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, odometer: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none font-mono focus:border-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Service Status</label>
                  <select
                    value={editingVehicle.status}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer font-sans"
                  >
                    {vehicleStatusOptions.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Payload Capability</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45,000 lbs"
                    value={editingVehicle.payloadCapacity}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, payloadCapacity: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Depot Base Hub</label>
                  <select
                    value={editingVehicle.location}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer font-sans"
                  >
                    {CITIES.map(cty => (
                      <option key={cty} value={cty}>{cty}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">VIN Code Identifier</label>
                <input
                  type="text"
                  value={editingVehicle.vin}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, vin: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none font-mono focus:border-primary-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-[#2a2a2a] flex justify-end gap-3 mt-auto bg-white dark:bg-[#1b1b1b] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#295DAA] text-white rounded-md text-xs font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Backdrop for Off-Canvas Add Drawer */}
      {isAddDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity"
          onClick={() => setIsAddDrawerOpen(false)}
        />
      )}

      {/* Off-Canvas Slide Drawer - Add Vehicle Asset */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-[#1b1b1b] border-l border-gray-200 dark:border-[#2d2d2d] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isAddDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full p-6 text-gray-800 dark:text-gray-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a] mb-5 shrink-0">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-650" />
              <h3 className="text-sm font-bold">Add New Vehicle</h3>
            </div>
            <button
              onClick={() => setIsAddDrawerOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded text-gray-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto space-y-4 text-xs pr-1 pb-4">
              <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Model Manufacturer & Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Peterbilt 579"
                value={newVehicle.modelName}
                onChange={(e) => setNewVehicle({ ...newVehicle, modelName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Year Manufactured</label>
                <input
                  type="number"
                  min="2010"
                  max="2027"
                  required
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">License Plate</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TX 82FK-1433"
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Class / Body Type</label>
              <input
                type="text"
                required
                placeholder="e.g. Sleeper Cab Heavy Duty"
                value={newVehicle.type}
                onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Operational Assignment</label>
              <div className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-[#2d2d2d] text-gray-500 dark:text-gray-400 rounded-md text-[11px] flex items-center justify-between italic">
                <span>Assignment managed via Trips workspace</span>
                <button 
                  type="button"
                  onClick={() => {
                    setIsAddDrawerOpen(false);
                    window.dispatchEvent(new CustomEvent("tms-navigate", { detail: { tab: "Trips" } }));
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:underline not-italic font-bold"
                >
                  Go to Trips
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Fuel Type</label>
                <select
                  value={newVehicle.fuelType}
                  onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer"
                >
                  {fuelTypeOptions.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Initial Fuel Level (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newVehicle.fuelLevel}
                  onChange={(e) => setNewVehicle({ ...newVehicle, fuelLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none text-gray-900 dark:text-gray-150"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Initial Odometer Reading</label>
                <input
                  type="number"
                  required
                  value={newVehicle.odometer}
                  onChange={(e) => setNewVehicle({ ...newVehicle, odometer: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Service Status</label>
                <select
                  value={newVehicle.status}
                  onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer"
                >
                  {vehicleStatusOptions.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Payload Capability</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45,000 lbs"
                  value={newVehicle.payloadCapacity}
                  onChange={(e) => setNewVehicle({ ...newVehicle, payloadCapacity: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Depot Base Hub</label>
                <select
                  value={newVehicle.location}
                  onChange={(e) => setNewVehicle({ ...newVehicle, location: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer"
                >
                  {CITIES.map(cty => (
                    <option key={cty} value={cty}>{cty}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">VIN Code Identifier (Optional)</label>
              <input
                type="text"
                placeholder="Leave empty for auto-generation"
                value={newVehicle.vin}
                onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none font-mono"
              />
            </div>

            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-[#2a2a2a] flex justify-end gap-3 mt-auto bg-white dark:bg-[#1b1b1b] shrink-0">
              <button
                type="button"
                onClick={() => setIsAddDrawerOpen(false)}
                className="px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#295DAA] text-white rounded-md text-xs font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                Add Vehicle
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Backdrop for Off-Canvas Import Drawer */}
      {isImportOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity"
          onClick={() => setIsImportOpen(false)}
        />
      )}

      {/* Off-Canvas Import Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[750px] flex flex-col bg-white dark:bg-[#1b1b1b] border-l border-gray-200 dark:border-[#2d2d2d] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isImportOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full p-6 text-gray-800 dark:text-gray-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a] mb-5 shrink-0">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-650" />
              <h3 className="text-sm font-bold font-sans">Import Vehicles Fleet</h3>
            </div>
            <button
              onClick={() => setIsImportOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-850 rounded text-gray-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-gray-200 dark:border-[#333] mb-4 text-xs font-semibold uppercase shrink-0">
            <button
              onClick={() => setImportTab("import")}
              className={`py-2 px-4 border-b-2 transition cursor-pointer ${
                importTab === "import"
                  ? "border-primary-500 text-primary-650 dark:text-primary-400"
                  : "border-transparent text-gray-400 hover:text-gray-500"
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setImportTab("history")}
              className={`py-2 px-4 border-b-2 transition cursor-pointer ${
                importTab === "history"
                  ? "border-primary-500 text-primary-650 dark:text-primary-400"
                  : "border-transparent text-gray-400 hover:text-gray-500"
              }`}
            >
              Upload History
            </button>
          </div>

          <div className="flex-1 overflow-auto pr-1">
            {importTab === "import" ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 hover:border-primary-500/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer select-none bg-gray-50/20 dark:bg-black/5">
                  <FileText className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Drag & drop your vehicles CSV file here</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Accepts UTF-8 formatted .csv, .xls, .xlsx (max 10MB)</p>
                  <button className="mt-4 px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs rounded-md bg-white dark:bg-[#202020] text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    Browse Files
                  </button>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-900/30 p-3 error-dialog border border-blue-10/50 dark:border-blue-900/20 rounded-md flex items-start gap-2.5">
                  <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                    <strong>Standard template rule:</strong> The file must contain columns: `ModelName`, `PlateNumber`, `AssignedDriver`, `FuelType`, `Status`, `Odometer`. Click <span className="text-primary-600 dark:text-primary-400 underline hover:cursor-pointer">here to download sample schema</span>.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-bold text-gray-750 dark:text-gray-200">fleet_vehicles_midwest.csv</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">45 rows • Imported successfully on Jun 02, 2026</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded uppercase">Success</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-bold text-gray-750 dark:text-gray-200">contractor_haulers_california.xlsx</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">18 rows • Imported successfully on May 20, 2026</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded uppercase">Success</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2a2a2a] mt-6 font-semibold select-none text-xs text-right shrink-0">
            <button
              type="button"
              onClick={() => setIsImportOpen(false)}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-80 rounded-md text-gray-500 cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Vehicles;
