import React, { useState, useMemo, useEffect } from "react";
import { Vehicle } from "../types";
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
  Calendar,
  CheckCircle2,
  Check,
  Circle,
  ArrowUpDown,
  AlertTriangle,
  Mail,
  Gauge,
  ShieldAlert,
  Info,
} from "lucide-react";

// Driver interface matching the professional fleet standards
export interface Driver {
  id: string; // DRV-001..DRV-142
  name: string;
  phone: string;
  email: string;
  licenseClass: "Class A CDL" | "Class B CDL";
  licenseNumber: string;
  status: "Available" | "Driving" | "Loading" | "Resting" | "Off Duty" | "On Leave";
  safetyScore: number; // 0..100
  hoursWorkedThisWeek: number;
  experienceYears: number;
  location: string;
  assignedVehicle: string; // e.g. "VEH-012" or "Unassigned"
  hireDate: string;
  emergencyContact: string;
  activeTripId: string;
  lastActivity: string;
}

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

const CITIES = [
  "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Los Angeles, CA", "New York, NY",
  "Atlanta, GA", "Seattle, WA", "Dallas, TX", "Miami, FL", "Denver, CO",
  "San Francisco, CA", "Boston, MA", "Detroit, MI", "Las Vegas, NV", "Orlando, FL"
];

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

// Reusable mock driver generator
const generateDriversMock = (): Driver[] => {
  return Array.from({ length: 142 }, (_, i) => {
    const id = `DRV-${String(i + 1).padStart(3, "0")}`;
    const firstIdx = (i * 7 + 12) % FIRST_NAMES.length;
    const lastIdx = (i * 9 + 8) % LAST_NAMES.length;
    const cityIdx = (i * 11) % CITIES.length;

    const name = `${FIRST_NAMES[firstIdx]} ${LAST_NAMES[lastIdx]}`;
    const phone = `(${200 + (i % 8) * 103}) 555-${String(1001 + (i * 47) % 8990).padStart(4, "0")}`;
    const email = `${FIRST_NAMES[firstIdx].toLowerCase()}.${LAST_NAMES[lastIdx].toLowerCase()}@fleetcorp.com`;
    
    const licenseClass = i % 4 === 0 ? "Class B CDL" : "Class A CDL";
    const licenseNumber = `DL-${1000000 + (i * 29471) % 8999999}`;
    
    let status: "Available" | "Driving" | "Loading" | "Resting" | "Off Duty" | "On Leave";
    if (i % 8 === 0) {
      status = "On Leave";
    } else if (i % 6 === 0) {
      status = "Resting";
    } else if (i % 5 === 0) {
      status = "Loading";
    } else if (i % 3 === 0) {
      status = "Off Duty";
    } else if (i % 2 === 0) {
      status = "Driving";
    } else {
      status = "Available";
    }

    const safetyScore = 75 + ((i * 13) % 26); // 75 to 100
    const hoursWorkedThisWeek = ((i * 7) % 55) + 5; // 5 to 60 hours
    const experienceYears = 2 + (i % 18); // 2 to 20 years
    const location = CITIES[cityIdx];
    
    const assignedVehicle = i % 5 === 0 ? "Unassigned" : `VEH-${String(1 + (i * 3) % 100).padStart(3, "0")}`;
    const hireDate = `${2016 + (i % 10)}-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i * 7) % 28).padStart(2, "0")}`;
    
    const emgFirst = FIRST_NAMES[(firstIdx + 4) % FIRST_NAMES.length];
    const emgLast = LAST_NAMES[(lastIdx + 2) % LAST_NAMES.length];
    const relationship = i % 3 === 0 ? "Spouse" : i % 3 === 1 ? "Sibling" : "Parent";
    const emergencyContact = `${emgFirst} ${emgLast} (${relationship}) - (${200 + (i % 8) * 103}) 555-${String(2001 + (i * 59) % 7990).padStart(4, "0")}`;

    const activeTripId = (status === "Driving" || status === "Loading" || status === "Resting")
      ? `TRP-${String(10000 + i * 29)}`
      : "None";

    let lastActivity = "";
    if (status === "Driving") {
      lastActivity = "Driving - In Transit";
    } else if (status === "Loading") {
      lastActivity = "Loading at facility";
    } else if (status === "Resting") {
      lastActivity = "Mandatory rest break";
    } else if (status === "Available") {
      lastActivity = "Active & Available for Dispatch";
    } else if (status === "Off Duty") {
      lastActivity = "Off Duty";
    } else if (status === "On Leave") {
      lastActivity = "Approved Leave";
    }

    return {
      id,
      name,
      phone,
      email,
      licenseClass,
      licenseNumber,
      status,
      safetyScore,
      hoursWorkedThisWeek,
      experienceYears,
      location,
      assignedVehicle,
      hireDate,
      emergencyContact,
      activeTripId,
      lastActivity,
    };
  });
};

const initialDrivers = generateDriversMock();

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem("tms_drivers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialDrivers;
  });

  // Sync drivers to localStorage
  useEffect(() => {
    localStorage.setItem("tms_drivers", JSON.stringify(drivers));
  }, [drivers]);

  // Fresh vehicles list state
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("tms_vehicles");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Reload fresh vehicles list when drawer or edit modal opens to stay synced
  // Moved below definition of isAddDrawerOpen and isEditModalOpen

  // Handle cross-page navigation with filters
  useEffect(() => {
    const navFilterField = sessionStorage.getItem("tms_nav_filter_field");
    const navFilterValue = sessionStorage.getItem("tms_nav_filter_value");
    if (navFilterField && navFilterValue) {
      sessionStorage.removeItem("tms_nav_filter_field");
      sessionStorage.removeItem("tms_nav_filter_value");
      
      if (navFilterField === "name" || navFilterField === "searchTerm") {
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
      if (customEvent.detail && customEvent.detail.type === 'Driver') {
        const driverName = customEvent.detail.id; // Use ID or Name as search term
        setSearchTerm(driverName);
        setSelectedDriverId(driverName);
        setSelectedView("Custom View");
        
        // Scroll into view logic
        setTimeout(() => {
          const element = document.getElementById(`row-${driverName}`);
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
  
  // Drawers & Dialog State
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    licenseClass: "Class A CDL" as const,
    licenseNumber: "",
    status: "Available" as const,
    safetyScore: 95,
    hoursWorkedThisWeek: 0,
    experienceYears: 5,
    location: "Chicago, IL",
    hireDate: new Date().toISOString().slice(0, 10),
    emergencyContact: "",
  });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Reload fresh vehicles list when drawer or edit modal opens to stay synced
  useEffect(() => {
    if (isAddDrawerOpen || isEditModalOpen) {
      const savedVehicles = localStorage.getItem("tms_vehicles");
      if (savedVehicles) {
        try {
          setVehicles(JSON.parse(savedVehicles));
        } catch (e) {}
      }
    }
  }, [isAddDrawerOpen, isEditModalOpen]);

  // Pagination & Sort Configuration
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openDriverMenu, setOpenDriverMenu] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Close driver menu when user clicks outside of the action menu container
  useEffect(() => {
    if (!openDriverMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".action-menu-container")) {
        setOpenDriverMenu(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [openDriverMenu]);
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
      name: "On Duty Drivers",
      searchTerm: "",
      appliedFilters: [
        { id: "d1", field: "Status", operator: "is", value: "On Duty" },
      ],
    },
    {
      name: "Class A CDL",
      searchTerm: "",
      appliedFilters: [
        { id: "d2", field: "License Class", operator: "is", value: "Class A CDL" },
      ],
    },
    {
      name: "Unassigned Operators",
      searchTerm: "",
      appliedFilters: [
        { id: "d3", field: "Assigned Vehicle", operator: "is", value: "Unassigned" },
      ],
    },
  ];

  const [savedViews, setSavedViews] = useState<SavedView[]>(initialViews);
  const [selectedView, setSelectedView] = useState("Default View");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const [advancedFilters, setAdvancedFilters] = useState<FilterAction[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterAction[]>([]);
  
  const availableFields = ["Status", "License Class", "Location", "Assigned Vehicle"];
  const driverStatusOptions = ["Available", "Driving", "Loading", "Resting", "Off Duty", "On Leave"];
  const licenseClassOptions = ["Class A CDL", "Class B CDL"];

  // Filter Actions Handlers
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
    setSelectedView(newView.name);
    setNewViewName("");
    setIsSaveViewModalOpen(false);
  };

  // Add / Edit submission handlers
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `DRV-${String(drivers.length + 1).padStart(3, "0")}`;
    const fileDriver: Driver = {
      id: newId,
      name: newDriver.name,
      phone: newDriver.phone || "(555) 555-5555",
      email: newDriver.email || `${newDriver.name.toLowerCase().replace(/\s+/g, ".")}@fleetcorp.com`,
      licenseClass: newDriver.licenseClass,
      licenseNumber: newDriver.licenseNumber || `DL-${Math.floor(1000000 + Math.random() * 8999999)}`,
      status: newDriver.status,
      safetyScore: Number(newDriver.safetyScore) || 95,
      hoursWorkedThisWeek: Number(newDriver.hoursWorkedThisWeek) || 0,
      experienceYears: Number(newDriver.experienceYears) || 3,
      location: newDriver.location,
      assignedVehicle: "Unassigned",
      hireDate: newDriver.hireDate || new Date().toISOString().slice(0, 10),
      emergencyContact: newDriver.emergencyContact || "No recorded emergency contact info.",
      activeTripId: (newDriver.status === "Driving" || newDriver.status === "Loading" || newDriver.status === "Resting") ? "TRP-10042" : "None",
      lastActivity: newDriver.status === "Driving" ? "Driving - In Transit" : newDriver.status === "Loading" ? "Loading at facility" : newDriver.status === "Resting" ? "Mandatory rest break" : "Active & Available for Dispatch",
    };

    setDrivers([fileDriver, ...drivers]);

    setIsAddDrawerOpen(false);
    setNewDriver({
      name: "",
      phone: "",
      email: "",
      licenseClass: "Class A CDL",
      licenseNumber: "",
      status: "On Duty" as any,
      safetyScore: 95,
      hoursWorkedThisWeek: 0,
      experienceYears: 5,
      location: "Chicago, IL",
      hireDate: new Date().toISOString().slice(0, 10),
      emergencyContact: "",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    setDrivers(drivers.map((d) => (d.id === editingDriver.id ? editingDriver : d)));

    setIsEditModalOpen(false);
    setEditingDriver(null);
  };

  const handleDeleteDriver = (id: string) => {
    const driverToDelete = drivers.find(d => d.id === id);
    if (!driverToDelete) return;
    if (confirm(`Are you sure you want to decommission / remove driver (${id}) from the fleet?`)) {
      const updatedDrivers = drivers.filter((d) => d.id !== id);
      setDrivers(updatedDrivers);
      if (selectedDriverId === id) setSelectedDriverId(null);
      setOpenDriverMenu(null);

      // Relational sync: unassign their name from any vehicle
      const updatedVehicles = vehicles.map(v => {
        if (v.assignedDriver === driverToDelete.name) {
          return { ...v, assignedDriver: "Unassigned" };
        }
        return v;
      });
      setVehicles(updatedVehicles);
      localStorage.setItem("tms_vehicles", JSON.stringify(updatedVehicles));
    }
  };

  // CSV Dynamic Export
  const handleExport = () => {
    const headers = [
      "Driver ID", "Name", "Phone", "Email", "CDL Class", "CDL Number",
      "Status", "Safety Score", "Weekly Hours Worked", "Experience (Years)",
      "Depot Base Hub", "Assigned Rig", "Hire Date", "Emergency Contact", "Active Trip", "Last Activity"
    ].join(",");
    const rows = filteredDrivers.map((d) =>
      `"${d.id}","${d.name}","${d.phone}","${d.email}","${d.licenseClass}","${d.licenseNumber}","${d.status}",${d.safetyScore},${d.hoursWorkedThisWeek},${d.experienceYears},"${d.location}","${d.assignedVehicle}","${d.hireDate}","${d.emergencyContact}","${d.activeTripId}","${d.lastActivity}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_drivers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import mock simulation
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate appending a high quality batch of drivers
    const batchImport: Driver[] = [
      {
        id: `DRV-${String(drivers.length + 1).padStart(3, "0")}`,
        name: "Arthur Pendelton",
        phone: "(312) 555-9012",
        email: "arthur.pendelton@fleetcorp.com",
        licenseClass: "Class A CDL",
        licenseNumber: "DL-6725319",
        status: "Driving",
        safetyScore: 98,
        hoursWorkedThisWeek: 12,
        experienceYears: 14,
        location: "Chicago, IL",
        assignedVehicle: "Unassigned",
        hireDate: "2026-05-18",
        emergencyContact: "Guinevere Pendelton (Spouse) - (312) 555-9013",
        activeTripId: "TRP-402",
        lastActivity: "Active now",
      },
      {
        id: `DRV-${String(drivers.length + 2).padStart(3, "0")}`,
        name: "Sarah Jenkins",
        phone: "(713) 555-8831",
        email: "sarah.jenkins@fleetcorp.com",
        licenseClass: "Class B CDL",
        licenseNumber: "DL-1109032",
        status: "Off Duty",
        safetyScore: 92,
        hoursWorkedThisWeek: 35,
        experienceYears: 4,
        location: "Houston, TX",
        assignedVehicle: "VEH-018",
        hireDate: "2026-02-10",
        emergencyContact: "David Jenkins (Father) - (713) 555-8832",
        activeTripId: "None",
        lastActivity: "3 hrs ago",
      }
    ];
    setDrivers([...batchImport, ...drivers]);
    setIsImportOpen(false);
    alert("Successfully imported 2 driver nodes into active registers.");
  };

  // Searching, sorting, and filtering logic combined
  const filteredDrivers = useMemo(() => {
    let result = drivers.filter((driver) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTerm =
          driver.id.toLowerCase().includes(term) ||
          driver.name.toLowerCase().includes(term) ||
          driver.licenseNumber.toLowerCase().includes(term) ||
          driver.location.toLowerCase().includes(term) ||
          driver.assignedVehicle.toLowerCase().includes(term) ||
          driver.status.toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }

      for (const filter of appliedFilters) {
        if (!filter.value) continue;

        let attributeValue = "";
        if (filter.field === "Status") attributeValue = driver.status;
        else if (filter.field === "License Class") attributeValue = driver.licenseClass;
        else if (filter.field === "Location") attributeValue = driver.location;
        else if (filter.field === "Assigned Vehicle") attributeValue = driver.assignedVehicle;

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

        if (sortConfig.field === "Name") {
          valA = a.name;
          valB = b.name;
        } else if (sortConfig.field === "ID") {
          valA = a.id;
          valB = b.id;
        } else if (sortConfig.field === "Score") {
          valA = a.safetyScore;
          valB = b.safetyScore;
        } else if (sortConfig.field === "Hours") {
          valA = a.hoursWorkedThisWeek;
          valB = b.hoursWorkedThisWeek;
        } else if (sortConfig.field === "Status") {
          valA = a.status;
          valB = b.status;
        } else if (sortConfig.field === "AssignedVehicle") {
          valA = a.assignedVehicle;
          valB = b.assignedVehicle;
        } else if (sortConfig.field === "Location") {
          valA = a.location;
          valB = b.location;
        } else if (sortConfig.field === "ActiveTrip") {
          valA = a.activeTripId;
          valB = b.activeTripId;
        } else if (sortConfig.field === "LastActivity") {
          valA = a.lastActivity;
          valB = b.lastActivity;
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [drivers, searchTerm, appliedFilters, sortConfig]);

  // Reset page when search or conditions change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appliedFilters, itemsPerPage]);

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  const paginatedDrivers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredDrivers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredDrivers, currentPage, itemsPerPage]);

  const columns: Column<Driver>[] = [
    { key: "Name", label: "Driver", sortable: true, sortKey: "Name" },
    { key: "Contact", label: "Contact" },
    { key: "AssignedVehicle", label: "Assigned Vehicle", sortable: true, sortKey: "AssignedVehicle" },
    { key: "Location", label: "Current Location", sortable: true, sortKey: "Location" },
    { key: "Status", label: "Status", sortable: true, sortKey: "Status" },
    { key: "ActiveTrip", label: "Active Trip", sortable: true, sortKey: "ActiveTrip" },
    { key: "LastActivity", label: "Last Activity", sortable: true, sortKey: "LastActivity" },
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

  const handleRowClick = (driverId: string) => {
    setSelectedDriverId(selectedDriverId === driverId ? null : driverId);
  };

  const selectedDriver = useMemo(() => {
    return drivers.find((d) => d.id === selectedDriverId) || null;
  }, [drivers, selectedDriverId]);

  return (
    <>
      <div className="animate-fade-in flex flex-col h-full">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-[24px] font-bold text-[#3e3e3e] dark:text-white">
              Drivers
            </h1>
            <p className="text-[13px] font-normal text-[#9c9c9c] m-0.5 font-sans">Manage operator rosters and trace driver performance logs</p>
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
              <Plus className="h-3.5 w-3.5" /> Add Driver
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
                    placeholder="Search Driver Name, Id, License, Location, or Vehicle ID..."
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
                            {driverStatusOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : filter.field === "License Class" ? (
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
                            {licenseClassOptions.map((opt) => (
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
                      className="ml-3 text-[#295DAA] hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add Filter Selector */}
                <div className="flex items-center mt-5">
                  <div className="w-36 font-semibold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add filter:
                  </div>
                  <div className="w-[500px]">
                    <select
                      onChange={addFilter}
                      value=""
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#3d3d3d] rounded text-gray-500 outline-none focus:border-primary-500 cursor-pointer"
                    >
                      <option value="" disabled hidden>
                        Please select
                      </option>
                      {availableFields
                        .filter((f) => !advancedFilters.some((af) => af.field === f))
                        .map((f) => (
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
                  className="px-3 py-1.5 text-xs font-medium text-primary-650 dark:text-primary-450 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors cursor-pointer"
                  onClick={() => setIsSaveViewModalOpen(true)}
                >
                  Save Current View
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-md transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-3 py-1.5 bg-primary-700 text-white rounded-md text-xs font-medium hover:bg-primary-800 transition-colors shadow-sm cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table and Split Screen Layout System */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* List side / Table component */}
            <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-auto">
                <ListTable
                  columns={columns}
                  data={paginatedDrivers}
                  rowKey={(driver) => driver.id}
                  selectedRowKey={selectedDriverId}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onRowClick={(driver) => handleRowClick(driver.id)}
                  renderRowCells={(driver) => {
                    // Status styling helper
                    let statusStyle = "";
                    switch (driver.status) {
                      case "Available":
                        statusStyle = "bg-green-55 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30";
                        break;
                      case "Driving":
                        statusStyle = "bg-blue-55 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30";
                        break;
                      case "Loading":
                        statusStyle = "bg-amber-55 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30";
                        break;
                      case "Resting":
                        statusStyle = "bg-teal-55 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900/30";
                        break;
                      case "Off Duty":
                        statusStyle = "bg-gray-55 dark:bg-gray-950/15 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-800";
                        break;
                      case "On Leave":
                        statusStyle = "bg-purple-55 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30";
                        break;
                    }

                    return (
                      <>
                        {/* Driver Column */}
                        <td className="px-6 py-2.5 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-[#295DAA] dark:text-primary-400 flex items-center justify-center font-bold font-sans uppercase shrink-0">
                              {driver.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-sans font-bold text-gray-900 dark:text-white">
                                {driver.name}
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono font-semibold mt-0.5">
                                {driver.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Contact Column */}
                        <td className="px-6 py-2.5 whitespace-nowrap text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-primary-500 shrink-0" />
                              {driver.phone}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-tight flex items-center gap-1 mt-0.5 leading-none">
                              <Mail className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                              {driver.email}
                            </span>
                          </div>
                        </td>
                        
                        {/* Assigned Vehicle Column */}
                        <td className="px-6 py-2.5 whitespace-nowrap text-xs">
                          {driver.assignedVehicle === "Unassigned" ? (
                            <span className="text-gray-400 dark:text-gray-500 italic text-[11px]">
                              Unassigned
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.dispatchEvent(
                                  new CustomEvent("tms-navigate", {
                                    detail: { tab: "Vehicles", filter: "id", value: driver.assignedVehicle },
                                  })
                                );
                              }}
                              className="font-mono text-[11px] bg-gray-50 dark:bg-[#202020] border border-gray-100 dark:border-gray-800/80 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Truck className="w-3 h-3 text-[#295DAA] dark:text-primary-400" />
                              {driver.assignedVehicle}
                            </button>
                          )}
                        </td>
                        
                        {/* Current Location Column */}
                        <td className="px-6 py-2.5 whitespace-nowrap text-xs">
                          <span className="font-semibold text-gray-805 dark:text-gray-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            {driver.location}
                          </span>
                        </td>
                        
                        {/* Status Column */}
                        <td className="px-6 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 border rounded-full text-xs font-medium ${statusStyle}`}>
                            {driver.status}
                          </span>
                        </td>
                        
                        {/* Active Trip Column */}
                        <td className="px-6 py-2.5 whitespace-nowrap text-xs">
                          {driver.activeTripId && driver.activeTripId !== "None" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.dispatchEvent(
                                  new CustomEvent("tms-navigate", {
                                    detail: { tab: "Trips", filter: "id", value: driver.activeTripId },
                                  })
                                );
                              }}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-450 border border-primary-200/50 dark:border-primary-900/30 font-mono hover:underline cursor-pointer"
                            >
                              {driver.activeTripId}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                              None
                            </span>
                          )}
                        </td>
                        
                        {/* Last Activity Column */}
                        <td className="px-6 py-2.5 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">{driver.lastActivity}</span>
                        </td>
                        
                        {/* Actions Column */}
                        <td className="px-6 py-2.5 whitespace-nowrap text-right text-xs font-semibold relative" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingDriver(driver);
                                setIsEditModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-[#295DAA] dark:hover:text-[#4176c2] transition-colors p-1 rounded hover:bg-gray-150 dark:hover:bg-[#2d2d2d]"
                              title="Edit Driver Profile"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            
                            <div className="relative inline-block text-left action-menu-container">
                              <button
                                onClick={() =>
                                  setOpenDriverMenu(openDriverMenu === driver.id ? null : driver.id)
                                }
                                className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1 rounded hover:bg-gray-150 dark:hover:bg-[#2d2d2d]"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                              
                              {openDriverMenu === driver.id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2d2d2d] rounded-md shadow-lg z-30 py-1 text-left font-sans font-semibold text-gray-700 dark:text-gray-250 animate-fade-in text-xs">
                                  <button
                                    onClick={() => {
                                      setSelectedDriverId(driver.id);
                                      setOpenDriverMenu(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-gray-400" /> View Details
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setOpenDriverMenu(null);
                                      window.dispatchEvent(
                                        new CustomEvent("tms-navigate", {
                                          detail: { tab: "Vehicles", filter: "searchTerm", value: driver.name },
                                        })
                                      );
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5 text-blue-550" /> Assign Vehicle
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenDriverMenu(null);
                                      window.dispatchEvent(
                                        new CustomEvent("tms-navigate", {
                                          detail: { tab: "Trips", filter: "searchTerm", value: driver.name },
                                        })
                                      );
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-indigo-500" /> Assign Trip
                                  </button>

                                  <button
                                    onClick={() => {
                                      setDrivers(drivers.map(d => d.id === driver.id ? { ...d, status: "Resting" } : d));
                                      setOpenDriverMenu(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Mark Resting
                                  </button>

                                  <button
                                    onClick={() => {
                                      setDrivers(drivers.map(d => d.id === driver.id ? { ...d, status: "Off Duty" } : d));
                                      setOpenDriverMenu(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-gray-400" /> Mark Off Duty
                                  </button>

                                  <button
                                    onClick={() => {
                                      setDrivers(drivers.map(d => d.id === driver.id ? { ...d, status: "Off Duty" } : d));
                                      alert(`Operator ${driver.name} has been suspended. Safety score and HOS limits are under review.`);
                                      setOpenDriverMenu(null);
                                    }}
                                    className="w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Suspend Driver
                                  </button>

                                  <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                                  <button
                                    onClick={() => handleDeleteDriver(driver.id)}
                                    className="w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Decommission Operator
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
                
                {paginatedDrivers.length === 0 && (
                  <div className="min-w-full text-center py-12 text-gray-500 dark:text-gray-400 text-xs bg-white dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-[#2d2d2d]">
                    No active fleet drivers match the specified query filters.
                  </div>
                )}
              </div>

              {/* Pagination Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-[#2d2d2d] flex items-center justify-between shrink-0 bg-white dark:bg-[#1e1e1e] rounded-b-lg text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-1.5 animate-fade-in">
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
                  {currentPage < totalPages && (
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2.5 py-1 border border-gray-200 dark:border-[#3d3d3d] rounded flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] disabled:opacity-50 transition-colors cursor-pointer text-xs"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span className="ml-3 text-gray-600 dark:text-gray-400 text-xs font-semibold">
                    (
                    {filteredDrivers.length === 0
                      ? 0
                      : (currentPage - 1) * itemsPerPage + 1}{" "}
                    - {Math.min(currentPage * itemsPerPage, filteredDrivers.length)}/
                    {filteredDrivers.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                    Per page:
                  </span>
                  {[10, 20, 50, 100].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setItemsPerPage(num);
                        setCurrentPage(1);
                      }}
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
            {selectedDriver && (
              <div className="w-full md:w-[350px] xl:w-[400px] border-l border-gray-100 dark:border-[#2d2d2d] bg-white dark:bg-[#111111] shrink-0 p-5 overflow-auto flex flex-col gap-5 animate-fade-in">
                {/* Header detail */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded bg-primary-100 dark:bg-primary-950/40 text-primary-750 dark:text-primary-450 flex items-center justify-center font-bold text-base uppercase font-sans">
                      {selectedDriver.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {selectedDriver.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                        ID: {selectedDriver.id}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDriverId(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="border-t border-gray-100 dark:border-[#252525] pt-4 flex flex-col gap-4">
                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">
                        Safety score
                      </span>
                      <span
                        className={`text-sm font-extrabold inline-flex items-center gap-1 mt-1 justify-center w-full ${
                          selectedDriver.safetyScore >= 95
                            ? "text-emerald-500"
                            : selectedDriver.safetyScore >= 85
                            ? "text-[#295DAA] dark:text-primary-400"
                            : "text-amber-500"
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {selectedDriver.safetyScore}%
                      </span>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">
                        experience
                      </span>
                      <span className="text-sm font-extrabold text-gray-800 dark:text-gray-150 inline-flex items-center gap-0.5 mt-1 justify-center w-full font-mono">
                        {selectedDriver.experienceYears} Yrs
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg text-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block">
                        Logged Hrs
                      </span>
                      <span className="text-sm font-extrabold text-green-600 mt-1 block font-mono">
                        {selectedDriver.hoursWorkedThisWeek}h
                      </span>
                    </div>
                  </div>

                  {/* Driver Identity Dossier */}
                  <div className="bg-gray-50/50 dark:bg-[#151515] rounded-xl border border-gray-100 dark:border-[#202020] p-4 shrink-0 flex flex-col gap-3 font-medium text-xs">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>CDL License</span>
                      <span className="font-mono text-gray-950 dark:text-gray-100 text-[10px] tracking-tight">{selectedDriver.licenseNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>License Type</span>
                      <span className="text-gray-955 dark:text-gray-100">{selectedDriver.licenseClass}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Email address</span>
                      <span className="text-gray-955 dark:text-gray-100 text-[10px] tracking-tight">{selectedDriver.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Hub Base</span>
                      <span className="text-gray-955 dark:text-gray-100 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {selectedDriver.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Hire register Date</span>
                      <span className="text-gray-955 dark:text-gray-100 font-mono">{selectedDriver.hireDate}</span>
                    </div>
                  </div>

                  {/* Assigned Rig Indicator */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 mt-1 tracking-wider">
                      ASSIGNED FLEET EQUIPMENT
                    </h4>
                    <div className="p-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/25 flex items-center justify-center text-[#295DAA] dark:text-primary-400 font-bold text-xs">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          {selectedDriver.assignedVehicle === "Unassigned" ? (
                            <span className="text-xs font-semibold text-gray-400 italic">
                              Unassigned
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                window.dispatchEvent(
                                  new CustomEvent("tms-navigate", {
                                    detail: { tab: "Vehicles", filter: "id", value: selectedDriver.assignedVehicle },
                                  })
                                );
                              }}
                              className="text-xs font-semibold text-[#295DAA] dark:text-primary-400 hover:underline text-left cursor-pointer"
                            >
                              {selectedDriver.assignedVehicle}
                            </button>
                          )}
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {selectedDriver.assignedVehicle === "Unassigned" ? "Standby / Dispatch pool operator" : "Active dispatch lead rig"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Route Section */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      ACTIVE DISPATCH ROUTE
                    </h4>
                    <div className="p-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/25 flex items-center justify-center text-indigo-650 dark:text-indigo-400 font-bold text-xs">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          {selectedDriver.activeTripId && selectedDriver.activeTripId !== "None" ? (
                            <button
                              onClick={() => {
                                window.dispatchEvent(
                                  new CustomEvent("tms-navigate", {
                                    detail: { tab: "Trips", filter: "id", value: selectedDriver.activeTripId },
                                  })
                                );
                              }}
                              className="text-xs font-semibold text-[#295DAA] dark:text-primary-400 hover:underline text-left cursor-pointer"
                            >
                              {selectedDriver.activeTripId}
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-gray-400 italic">
                              No Active Dispatch
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {selectedDriver.activeTripId && selectedDriver.activeTripId !== "None" ? "Currently en route" : "Available for duty"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      emergency contact details
                    </h4>
                    <div className="p-4 bg-gray-55/70 dark:bg-[#181818] rounded-xl border border-gray-100 dark:border-gray-800/60 flex flex-col gap-2 leading-relaxed">
                      <div className="text-xs flex flex-col gap-1">
                        <span className="text-gray-500 font-medium">Primary Contact:</span>
                        <span className="font-sans font-bold text-gray-800 dark:text-gray-100">
                          {selectedDriver.emergencyContact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save View Modal dialog */}
      {isSaveViewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white dark:bg-[#1b1b1b] border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-xl max-w-sm w-full p-6 text-gray-800 dark:text-gray-200">
            <h3 className="text-sm font-bold mb-1">Save Customized Filter View</h3>
            <p className="text-[11px] text-gray-400 mb-4">Assign a custom preset name to access this snapshot later.</p>
            <form onSubmit={handleSaveViewSubmit}>
              <input
                type="text"
                placeholder="e.g., Chicago Drivers"
                required
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 mb-5 text-gray-900 dark:text-gray-100"
              />
              <div className="flex justify-end gap-3 font-semibold text-xs text-right">
                <button
                  type="button"
                  onClick={() => setIsSaveViewModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-[#3d3d3d] rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300 pointer cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#295DAA] text-white rounded-md hover:bg-opacity-95 transition cursor-pointer"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backdrop for Off-Canvas Edit Drawer */}
      {isEditModalOpen && editingDriver && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity"
          onClick={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Off-Canvas Slide Drawer - Edit Driver */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-[#1b1b1b] border-l border-gray-200 dark:border-[#2d2d2d] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isEditModalOpen && editingDriver ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {editingDriver && (
          <div className="p-6 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a] mb-5 shrink-0">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-650" />
                <h3 className="text-sm font-bold">Edit Driver Profile</h3>
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
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Driver Name</label>
                  <input
                    type="text"
                    required
                    value={editingDriver.name}
                    onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editingDriver.phone}
                      onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">CDL Number</label>
                    <input
                      type="text"
                      required
                      value={editingDriver.licenseNumber}
                      onChange={(e) => setEditingDriver({ ...editingDriver, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingDriver.email}
                    onChange={(e) => setEditingDriver({ ...editingDriver, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">License Class</label>
                    <select
                      value={editingDriver.licenseClass}
                      onChange={(e) => setEditingDriver({ ...editingDriver, licenseClass: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer"
                    >
                      <option value="Class A CDL">Class A CDL</option>
                      <option value="Class B CDL">Class B CDL</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Status</label>
                    <select
                      value={editingDriver.status}
                      onChange={(e) => setEditingDriver({ ...editingDriver, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer"
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Safety Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={editingDriver.safetyScore}
                      onChange={(e) => setEditingDriver({ ...editingDriver, safetyScore: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Weekly Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={editingDriver.hoursWorkedThisWeek}
                      onChange={(e) => setEditingDriver({ ...editingDriver, hoursWorkedThisWeek: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none font-mono focus:border-primary-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Experience (Years)</label>
                    <input
                      type="number"
                      required
                      value={editingDriver.experienceYears}
                      onChange={(e) => setEditingDriver({ ...editingDriver, experienceYears: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Depot hub</label>
                    <select
                      value={editingDriver.location}
                      onChange={(e) => setEditingDriver({ ...editingDriver, location: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer font-sans"
                    >
                      {CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Operational Rig Assignment</label>
                  <div className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-[#2d2d2d] text-gray-500 dark:text-gray-400 rounded-md text-[11px] flex items-center justify-between italic">
                    <span>Rig managed via Trips workspace</span>
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

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Emergency contact</label>
                  <input
                    type="text"
                    required
                    value={editingDriver.emergencyContact}
                    onChange={(e) => setEditingDriver({ ...editingDriver, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* STICKY FOOTER with consistent color, styling & placement */}
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

      {/* Off-Canvas Slide Drawer - Add Driver */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-[#1b1b1b] border-l border-gray-200 dark:border-[#2d2d2d] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isAddDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a] mb-5 shrink-0">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-650" />
              <h3 className="text-sm font-bold">Add New Driver</h3>
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
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Driver Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. (312) 555-1425"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">CDL Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-8294155"
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none font-mono focus:border-primary-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. johnathan.doe@corp.com"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none focus:border-primary-500 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">License Class</label>
                  <select
                    value={newDriver.licenseClass}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseClass: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer"
                  >
                    <option value="Class A CDL">Class A CDL</option>
                    <option value="Class B CDL">Class B CDL</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Status</label>
                  <select
                    value={newDriver.status}
                    onChange={(e) => setNewDriver({ ...newDriver, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer"
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Safety Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={newDriver.safetyScore}
                    onChange={(e) => setNewDriver({ ...newDriver, safetyScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Logged Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={newDriver.hoursWorkedThisWeek}
                    onChange={(e) => setNewDriver({ ...newDriver, hoursWorkedThisWeek: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    value={newDriver.experienceYears}
                    onChange={(e) => setNewDriver({ ...newDriver, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Depot hub</label>
                  <select
                    value={newDriver.location}
                    onChange={(e) => setNewDriver({ ...newDriver, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] text-gray-900 dark:text-gray-150 rounded-md outline-none cursor-pointer"
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Operational Rig Assignment</label>
                <div className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-[#2d2d2d] text-gray-500 dark:text-gray-400 rounded-md text-[11px] flex items-center justify-between italic">
                  <span>Rig managed via Trips workspace</span>
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

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Emergency contact</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins (Mother) - (312) 555-1212"
                  value={newDriver.emergencyContact}
                  onChange={(e) => setNewDriver({ ...newDriver, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#101010] border border-gray-200 dark:border-[#3d3d3d] rounded-md outline-none"
                />
              </div>
            </div>

            {/* STICKY FOOTER with consistent color, styling & placement */}
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
                Add Driver
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
        <div className="p-8 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a] mb-5 shrink-0">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-650" />
              <h3 className="text-sm font-bold">Import Batch Driver Data</h3>
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
              className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
                importTab === "import"
                  ? "border-[#295DAA] text-gray-900 dark:text-white"
                  : "border-transparent text-gray-450 hover:text-gray-700"
              }`}
            >
              Upload Data Log
            </button>
            <button
              onClick={() => setImportTab("history")}
              className={`py-2 px-4 border-b-2 transition-colors cursor-pointer ${
                importTab === "history"
                  ? "border-[#295DAA] text-gray-900 dark:text-white"
                  : "border-transparent text-gray-450 hover:text-gray-700"
              }`}
            >
              Previous Logs
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {importTab === "import" ? (
              <form onSubmit={handleImportSubmit} className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Drag & Drop Logsheet</h4>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 hover:border-primary-500/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer select-none bg-gray-50/20 dark:bg-black/5">
                    <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Drag any driver spreadsheet (.csv, .xlsx) here</span>
                    <span className="text-[10px] text-gray-450 mt-1">Maximum file size: 10MB</span>
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs rounded-md bg-white dark:bg-[#202020] text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Browse Storage
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50/20 dark:bg-primary-950/10 border border-blue-100/50 dark:border-primary-900/30 rounded-lg p-4 flex gap-3 text-xs leading-5">
                  <Info className="w-4 h-4 text-[#295DAA] shrink-0 mt-0.5" />
                  <div className="text-gray-655 dark:text-gray-300">
                    <span className="font-bold">Required schema:</span> Ensure headers include <code className="font-mono bg-blue-100/40 px-1 py-0.5 rounded text-gray-800 dark:text-white">Name</code>, <code className="font-mono bg-blue-100/40 px-1 py-0.5 rounded text-gray-800 dark:text-white">Email</code>, <code className="font-mono bg-blue-100/40 px-1 py-0.5 rounded text-gray-800 dark:text-white">CDL_License</code>, and <code className="font-mono bg-blue-100/40 px-1 py-0.5 rounded text-gray-800 dark:text-white">Emergency_Contact</code>. Non-conforming logs are auto-quarantined.
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-150 dark:border-[#333] flex justify-end gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => setIsImportOpen(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#295DAA] hover:bg-opacity-95 text-white text-xs rounded-md font-bold transition cursor-pointer"
                  >
                    Simulate Process Import
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-850 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <span className="font-bold block">drivers_roster_q2_chicago.csv</span>
                      <span className="text-gray-400 text-[10px] block mt-0.5">Imported on 2026-06-03 • 25 driver files</span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded uppercase text-[10px]">Success</span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-850 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <span className="font-bold block">active_contractors_may.xlsx</span>
                      <span className="text-gray-400 text-[10px] block mt-0.5">Imported on 2026-05-14 • 12 driver files</span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded uppercase text-[10px]">Success</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Drivers;
