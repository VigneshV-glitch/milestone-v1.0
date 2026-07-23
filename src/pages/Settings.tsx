import React, { useState } from "react";
import { 
  User, 
  Building, 
  Users, 
  Shield, 
  Sliders, 
  Camera, 
  Activity, 
  Settings as SettingsIcon, 
  FileText, 
  Bell, 
  Key,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  ShieldCheck,
  Mail,
  Info,
  Phone,
  Lock,
  Globe,
  MapPin,
  Calendar,
  AlertTriangle,
  UserPlus
} from "lucide-react";
import { UserProfileSettings } from "../components/settings/UserProfileSettings";
import { CompanySettings } from "../components/settings/CompanySettings";

// Types
interface ModulePermissions {
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export?: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: {
    drivers: ModulePermissions;
    vehicles: ModulePermissions;
    trips: ModulePermissions;
    settings: ModulePermissions;
  };
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string;
  avatar?: string;
  phone?: string;
}

interface CustomField {
  id: string;
  entity: "Drivers" | "Vehicles" | "Trips";
  name: string;
  type: "Text" | "Number" | "Date" | "Boolean";
  required: boolean;
  defaultValue?: string;
}

// Initial Data
const initialRoles: Role[] = [
  {
    id: "role_admin",
    name: "Admin",
    description: "Has full access to all features and settings.",
    isSystem: true,
    permissions: {
      drivers: { read: true, create: true, edit: true, delete: true },
      vehicles: { read: true, create: true, edit: true, delete: true },
      trips: { read: true, create: true, edit: true, delete: true },
      settings: { read: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: "role_manager",
    name: "Manager",
    description: "Manages dock scheduling, operations, reporting for assigned warehouses.",
    isSystem: false,
    permissions: {
      drivers: { read: true, create: true, edit: true, delete: false },
      vehicles: { read: true, create: true, edit: true, delete: true },
      trips: { read: true, create: true, edit: true, delete: false },
      settings: { read: true, create: false, edit: false, delete: false },
    },
  },
  {
    id: "role_gate_keeper",
    name: "Gate Keeper",
    description: "Manages vehicle check-in and check-out at the gate.",
    isSystem: false,
    permissions: {
      drivers: { read: true, create: false, edit: false, delete: false },
      vehicles: { read: true, create: false, edit: false, delete: false },
      trips: { read: true, create: true, edit: true, delete: false },
      settings: { read: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: "role_dock_operator",
    name: "Dock Operator",
    description: "Handles operations at the dock, such as loading and unloading.",
    isSystem: false,
    permissions: {
      drivers: { read: true, create: false, edit: false, delete: false },
      vehicles: { read: true, create: false, edit: false, delete: false },
      trips: { read: true, create: false, edit: false, delete: false },
      settings: { read: false, create: false, edit: false, delete: false },
    },
  },
];

const initialUsers: UserItem[] = [
  {
    id: "usr_001",
    name: "Admin User",
    email: "admin@milestone.com",
    role: "Admin",
    status: "Active",
    lastLogin: "Active now",
    phone: "(312) 555-0100",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "usr_002",
    name: "Vignesh V",
    email: "vigneshv7678@gmail.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2 mins ago",
    phone: "(708) 555-9111",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "usr_003",
    name: "John Doe",
    email: "john.doe@milestone.com",
    role: "Gate Keeper",
    status: "Active",
    lastLogin: "1 hr ago",
    phone: "(312) 555-1234",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "usr_004",
    name: "Sarah Jane",
    email: "sarah.j@milestone.com",
    role: "Manager",
    status: "Active",
    lastLogin: "Yesterday",
    phone: "(630) 555-4321",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    id: "usr_005",
    name: "Bob Smith",
    email: "bob.smith@milestone.com",
    role: "Dock Operator",
    status: "Inactive",
    lastLogin: "5 days ago",
    phone: "(217) 555-8899",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

const initialFields: CustomField[] = [
  {
    id: "fld_001",
    entity: "Drivers",
    name: "CDL Medical Certificate Expiry",
    type: "Date",
    required: true,
  },
  {
    id: "fld_002",
    entity: "Vehicles",
    name: "EZPass Transponder ID",
    type: "Text",
    required: false,
  },
  {
    id: "fld_003",
    entity: "Trips",
    name: "Secondary Safety Coordinator",
    type: "Text",
    required: false,
  },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("User Profile");

  // State Management
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [customFields, setCustomFields] = useState<CustomField[]>(initialFields);
  
  const [selectedRoleId, setSelectedRoleId] = useState<string>("role_admin");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");
  
  // Notification States
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Modals / Drawers Open States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [roleSubTab, setRoleSubTab] = useState<"permissions" | "notifications">("permissions");
  const [newRolePerms, setNewRolePerms] = useState({
    trips: { read: true, create: false, edit: false, delete: false, export: false },
    vehicles: { read: true, create: false, edit: false, delete: false, export: false },
    drivers: { read: true, create: false, edit: false, delete: false, export: false },
    settings: { read: false, create: false, edit: false, delete: false, export: false }
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    appointments: { inapp: true, email: true, sms: false },
    docks: { inapp: true, email: false, sms: true },
    carriers: { inapp: false, email: true, sms: false },
    system: { inapp: true, email: true, sms: true }
  });

  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);

  // New Form Values
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Admin",
    status: "Active" as "Active" | "Inactive"
  });

  const [newRoleForm, setNewRoleForm] = useState({
    name: "",
    description: ""
  });

  const [newFieldForm, setNewFieldForm] = useState({
    entity: "Drivers" as "Drivers" | "Vehicles" | "Trips",
    name: "",
    type: "Text" as CustomField["type"],
    required: false,
    defaultValue: ""
  });

  // Company Form Value (Mock Editable State)
  const [companyForm, setCompanyForm] = useState({
    name: "Milestone Logistics Inc.",
    dotNumber: "USDOT-9872124",
    taxId: "FEIN-55-9014672",
    operationsCenter: "Central Hub - Chicago East",
    email: "finance@milestone.com",
    phone: "(312) 555-0100",
    regAuthority: "State of Illinois Dept. of Transportation",
    activeFleetSize: "75 Premium Assets",
    address: "123 Industrial Way, Suite 456, Metropolis, IL"
  });

  // Helper trigger Notification
  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // HANDLERS
  
  // Toggle Permission
  const handlePermissionToggle = (
    roleId: string, 
    module: "drivers" | "vehicles" | "trips" | "settings", 
    action: "read" | "create" | "edit" | "delete"
  ) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [module]: {
              ...r.permissions[module],
              [action]: !r.permissions[module][action],
            }
          }
        };
      }
      return r;
    }));
    triggerNotification("Access matrix cell updated successfully.");
  };

  // Add User Operation
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      triggerNotification("Please fill in all mandatory fields.", "error");
      return;
    }

    const nextId = `usr_${String(users.length + 1).padStart(3, "0")}`;
    const added: UserItem = {
      id: nextId,
      name: newUserForm.name,
      email: newUserForm.email,
      phone: newUserForm.phone || "(312) 555-9900",
      role: newUserForm.role,
      status: newUserForm.status,
      lastLogin: "Never",
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999)}?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
    };

    setUsers([added, ...users]);
    setIsAddUserOpen(false);
    setNewUserForm({
      name: "",
      email: "",
      phone: "",
      role: "Admin",
      status: "Active"
    });
    triggerNotification(`Operator ${added.name} registered successfully.`);
  };

  // Edit User Operation
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editingUser.name || !editingUser.email) {
      triggerNotification("Mandatory fields can't be empty.", "error");
      return;
    }

    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setIsEditUserOpen(false);
    triggerNotification(`Credentials updated for operator ${editingUser.name}.`);
  };

  // Delete User Operation
  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to revoke credentials and suspend access for ${name}?`)) {
      setUsers(users.filter(u => u.id !== userId));
      triggerNotification(`Access privileges revoked for ${name}.`, "success");
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const nextStatus: UserItem["status"] = u.status === "Active" ? "Inactive" : "Active";
        triggerNotification(`User status changed to ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Add Custom Role Operation
  const handleAddRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name) {
      triggerNotification("Role name is required.", "error");
      return;
    }

    const nextId = `role_${newRoleForm.name.toLowerCase().replace(/\s+/g, "_")}`;
    if (roles.some(r => r.id === nextId)) {
      triggerNotification("A role with this tag already exists.", "error");
      return;
    }

    const added: Role = {
      id: nextId,
      name: newRoleForm.name,
      description: newRoleForm.description || "Custom operator permission template",
      isSystem: false,
      permissions: {
        drivers: { ...newRolePerms.drivers },
        vehicles: { ...newRolePerms.vehicles },
        trips: { ...newRolePerms.trips },
        settings: { ...newRolePerms.settings }
      }
    };

    setRoles([...roles, added]);
    setSelectedRoleId(added.id);
    setIsAddRoleOpen(false);
    setNewRoleForm({ name: "", description: "" });
    setNewRolePerms({
      trips: { read: true, create: false, edit: false, delete: false, export: false },
      vehicles: { read: true, create: false, edit: false, delete: false, export: false },
      drivers: { read: true, create: false, edit: false, delete: false, export: false },
      settings: { read: false, create: false, edit: false, delete: false, export: false }
    });
    triggerNotification(`Custom profile matrix compiled for ${added.name}.`);
  };

  // Edit Custom Role Operation
  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    if (!editingRole.name) {
      triggerNotification("Role name is required.", "error");
      return;
    }

    setRoles(prev => prev.map(r => r.id === editingRole.id ? editingRole : r));
    setIsEditRoleOpen(false);
    triggerNotification(`Role policy updated for ${editingRole.name}.`);
  };

  // Delete Custom Role
  const handleDeleteRole = (roleId: string, name: string) => {
    const isAssigned = users.some(u => u.role.toLowerCase() === name.toLowerCase());
    if (isAssigned) {
      triggerNotification(`Cannot delete "${name}" because it's actively assigned to operators.`, "error");
      return;
    }

    if (confirm(`Are you sure you want to permanently delete permission role "${name}"?`)) {
      setRoles(roles.filter(r => r.id !== roleId));
      if (selectedRoleId === roleId) {
        setSelectedRoleId("role_admin");
      }
      triggerNotification(`Access matrix profile "${name}" successfully dismantled.`);
    }
  };

  // Add Schema Field Operation
  const handleAddFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldForm.name) {
      triggerNotification("Field name is required.", "error");
      return;
    }

    const nextId = `fld_${String(customFields.length + 1).padStart(3, "0")}`;
    const added: CustomField = {
      id: nextId,
      entity: newFieldForm.entity,
      name: newFieldForm.name,
      type: newFieldForm.type,
      required: newFieldForm.required,
      defaultValue: newFieldForm.defaultValue
    };

    setCustomFields([...customFields, added]);
    setIsAddFieldOpen(false);
    setNewFieldForm({
      entity: "Drivers",
      name: "",
      type: "Text",
      required: false,
      defaultValue: ""
    });
    triggerNotification(`Dynamic schema descriptor compiled for ${added.name}.`);
  };

  // Delete Custom field
  const handleDeleteField = (fieldId: string, name: string) => {
    if (confirm(`Remove dynamic data descriptor column "${name}"? It will prune diagnostic data across your active fleets.`)) {
      setCustomFields(customFields.filter(f => f.id !== fieldId));
      triggerNotification(`Pruned data field "${name}" from pipeline schemas.`);
    }
  };

  // Save general Profile configuration
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    triggerNotification("Profile preferences stored cleanly in session cache.");
  };

  // Save company configuration
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    triggerNotification("Company operations parameter set synchronized with central DOT schemas.");
  };

  const navGroups = [
    {
      title: "GENERAL SETTINGS",
      items: [
        { name: "User Profile", icon: <User className="w-5 h-5" /> },
        { name: "Company", icon: <Building className="w-5 h-5" /> },
      ],
    },
    {
      title: "USER PERMISSION & ACCESS",
      items: [
        { name: "Users", icon: <Users className="w-5 h-5" /> },
        { name: "Roles", icon: <Shield className="w-5 h-5" /> },
      ],
    },
    {
      title: "CUSTOMIZE",
      items: [
        {
          name: "Extra Form Fields",
          icon: <Sliders className="w-5 h-5" />,
        },
      ],
    },
  ];

  // Filters Users
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  return (
    <div className="animate-fade-in flex flex-col h-full overflow-hidden">
      
      {/* Dynamic Popups for Success/Error Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-in font-sans font-semibold text-xs leading-none ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
            : 'bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
        }`}>
          {notification.type === 'success' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] leading-[34px] font-bold text-[#3e3e3e] dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-[13px] leading-[16px] text-[#9c9c9c] dark:text-gray-400 font-sans font-normal">
            {activeTab === "Users" ? "Manage user access keys, directory assignments, and account statuses" :
             activeTab === "Roles" ? "Configure custom permission matrices and policy templates" :
             activeTab === "Company" ? "Synchronize carrier profiles and dispatch system parameters" :
             activeTab === "Extra Form Fields" ? "Tailor database schema descriptors and form configurations" : 
             "Manage your profile specifications and security preferences."}
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-8 items-start min-h-0 overflow-hidden">
        {/* Secondary Sidebar */}
        <div className="w-48 flex-shrink-0 h-full overflow-y-auto pr-2 space-y-8">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {navGroups[groupIdx].items.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => setActiveTab(item.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-semibold text-left transition-colors cursor-pointer ${
                        activeTab === item.name
                          ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#2d2d2d] dark:hover:text-white"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm transition-colors p-8 min-h-0 flex flex-col">
          
          {/* USER PROFILE TAB */}
          {activeTab === "User Profile" && (
            <UserProfileSettings onSubmit={handleSaveProfile} />
          )}

          {/* COMPANY TAB */}
          {activeTab === "Company" && (
            <CompanySettings
              companyForm={companyForm}
              setCompanyForm={setCompanyForm}
              onSubmit={handleSaveCompany}
              onReset={() =>
                setCompanyForm({
                  name: "Milestone Logistics Inc.",
                  dotNumber: "USDOT-9872124",
                  taxId: "FEIN-55-9014672",
                  operationsCenter: "Central Hub - Chicago East",
                  email: "finance@milestone.com",
                  phone: "(312) 555-0100",
                  regAuthority: "State of Illinois Dept. of Transportation",
                  activeFleetSize: "75 Premium Assets",
                  address: "123 Industrial Way, Suite 456, Metropolis, IL"
                })
              }
            />
          )}

          {/* USERS / ACCESS DIRECTORY TAB */}
          {activeTab === "Users" && (
            <div className="flex flex-col h-full min-h-0">
              
              {/* Directory Filter Rail */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-[#1f1f1f] mb-6 flex-shrink-0">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or role..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#2d2d2d] rounded-lg bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs font-semibold text-gray-950 dark:text-white"
                  />
                  {userSearchQuery && (
                    <button onClick={() => setUserSearchQuery("")} className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-600">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Register Access Operator
                </button>
              </div>

              {/* Operators Table Display */}
              <div className="flex-1 overflow-y-auto min-h-0 rounded-lg shadow-sm">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-gray-55 dark:bg-[#121212] text-gray-500 dark:text-gray-400 uppercase font-bold text-[10px] tracking-wider sticky top-0 border-b border-gray-100 dark:border-[#1f1f1f] z-10">
                    <tr>
                      <th className="px-6 py-3 font-semibold">User Ident</th>
                      <th className="px-6 py-3 font-semibold">Allocated Role</th>
                      <th className="px-6 py-3 font-semibold">Comms Channel</th>
                      <th className="px-6 py-3 font-semibold">Sync Status</th>
                      <th className="px-6 py-3 font-semibold">Last Synchronization</th>
                      <th className="px-6 py-3 font-semibold text-right">Revocation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-150 dark:divide-[#242424]">
                    {filteredUsers.map((user) => {
                      
                      // Custom role styling colors
                      let roleBadgeClass = "";
                      switch (user.role.toLowerCase()) {
                        case "super admin":
                          roleBadgeClass = "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200/50";
                          break;
                        case "admin":
                          roleBadgeClass = "bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 border border-primary-200/50";
                          break;
                        case "dispatcher":
                          roleBadgeClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50";
                          break;
                        case "fleet manager":
                          roleBadgeClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50";
                          break;
                        default:
                          roleBadgeClass = "bg-gray-50 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 border border-gray-200/50";
                      }

                      return (
                        <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2d2d2d]/25 transition-colors">
                          {/* User Ident */}
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full border border-gray-200"
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-gray-100 font-sans">
                                  {user.name}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-tight flex items-center gap-1 mt-0.5 leading-none">
                                  <Mail className="w-2.5 h-2.5 text-gray-400" />
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Allocated Role */}
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${roleBadgeClass}`}>
                              {user.role}
                            </span>
                          </td>

                          {/* Comms Channel */}
                          <td className="px-6 py-3.5 whitespace-nowrap font-mono font-semibold dark:text-gray-300">
                            {user.phone || "(312) 555-0199"}
                          </td>

                          {/* Sync Status */}
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user.id)}
                              className="focus:outline-none cursor-pointer group"
                              title="Toggle Access Switch"
                            >
                              {user.status === "Active" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                                  Active Sync
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-450 dark:border-gray-700">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
                                  Suspended
                                </span>
                              )}
                            </button>
                          </td>

                          {/* Last Synchronization */}
                          <td className="px-6 py-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono">
                            {user.lastLogin}
                          </td>

                          {/* Revocation */}
                          <td className="px-6 py-3.5 whitespace-nowrap text-right font-semibold">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsEditUserOpen(true);
                                }}
                                className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2d2d2d] cursor-pointer"
                                title="Edit Operator Profile"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2d2d2d] cursor-pointer"
                                title="Revoke Client Credentials"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-450">
                          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="font-semibold">No active matches found inside carrier access directories.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* REGISTER USER SLIDE SLIDER */}
              <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#1e1e1e] shadow-2xl border-l border-gray-100 dark:border-[#1f1f1f] z-40 transition-transform duration-300 transform p-6 flex flex-col ${
                isAddUserOpen ? "translate-x-0" : "translate-x-full"
              }`}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1f1f1f] mb-6 flex-shrink-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#295DAA]" /> Register Operator
                  </h3>
                  <button onClick={() => setIsAddUserOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddUserSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1 min-h-0">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Operator Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      placeholder="e.g. Mitchell Gant"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Operations Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      placeholder="mitchell@milestone.com"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Primary Comms Channel Phone</label>
                    <input
                      type="text"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                      placeholder="(312) 555-5555"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Allocated Access Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-950 dark:text-white"
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Primary Session Sync State</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-gray-750 dark:text-gray-300 font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="statusRadio"
                          checked={newUserForm.status === "Active"}
                          onChange={() => setNewUserForm({ ...newUserForm, status: "Active" })}
                          className="text-[#295DAA] focus:ring-primary-500"
                        />
                        Active Sync
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-750 dark:text-gray-300 font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="statusRadio"
                          checked={newUserForm.status === "Inactive"}
                          onChange={() => setNewUserForm({ ...newUserForm, status: "Inactive" })}
                          className="text-gray-500 focus:ring-primary-500"
                        />
                        Suspended
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-[#1f1f1f] flex justify-end gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-350 rounded-lg text-[11px] font-semibold hover:bg-gray-50 cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Compile Credentials
                    </button>
                  </div>
                </form>
              </div>

              {/* EDIT USER SLIDE SLIDER */}
              {isEditUserOpen && editingUser && (
                <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#1e1e1e] shadow-2xl border-l border-gray-100 dark:border-[#1f1f1f] z-40 p-6 flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1f1f1f] mb-6 flex-shrink-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-[#295DAA]" /> Edit Operator
                    </h3>
                    <button onClick={() => setIsEditUserOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleEditUserSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1 min-h-0">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Operator Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Operations Email Address *</label>
                      <input
                        type="email"
                        required
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Primary Comms Channel Phone</label>
                      <input
                        type="text"
                        value={editingUser.phone || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Allocated Access Role</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-900 dark:text-white"
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Primary Session Sync State</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs text-gray-750 dark:text-gray-300 font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="editStatusRadio"
                            checked={editingUser.status === "Active"}
                            onChange={() => setEditingUser({ ...editingUser, status: "Active" })}
                            className="text-[#295DAA] focus:ring-primary-500"
                          />
                          Active Sync
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-750 dark:text-gray-300 font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="editStatusRadio"
                            checked={editingUser.status === "Inactive"}
                            onChange={() => setEditingUser({ ...editingUser, status: "Inactive" })}
                            className="text-gray-500 focus:ring-primary-500"
                          />
                          Suspended
                        </label>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-[#1f1f1f] flex justify-end gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsEditUserOpen(false)}
                        className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-350 rounded-lg text-[11px] font-semibold hover:bg-gray-50 cursor-pointer"
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Save Parameter
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ROLES / POLICY CONTROL MATRIX TAB */}
          {activeTab === "Roles" && (
            <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent">
              
              {isAddRoleOpen || (isEditRoleOpen && editingRole) ? (
                // ----------------------------------------------------
                // CREATE NEW / EDIT ROLE IN-PLACE SCREEN (MATCHING SHOT)
                // ----------------------------------------------------
                <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                  
                  {/* Title & Navigation */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1f1f1f]">
                    <h2 className="text-[20px] font-bold text-[#1f2937] dark:text-white font-sans flex items-center gap-2.5">
                      <Shield className="w-5.5 h-5.5 text-[#295DAA] stroke-[1.8]" />
                      {isAddRoleOpen ? "Create New Role" : `Edit Role: ${editingRole?.name}`}
                    </h2>
                    
                    {/* Discard & Save Actions in the top bar */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddRoleOpen(false);
                          setIsEditRoleOpen(false);
                          setEditingRole(null);
                        }}
                        className="px-4 py-2 border border-gray-250 dark:border-gray-700 text-[#4b5563] dark:text-gray-350 rounded-lg text-xs font-bold hover:bg-gray-55 dark:hover:bg-[#222] transition-all cursor-pointer"
                      >
                        Discard
                      </button>
                      <button
                        onClick={(e) => {
                          if (isAddRoleOpen) {
                            handleAddRoleSubmit(e);
                          } else {
                            handleEditRoleSubmit(e);
                          }
                        }}
                        className="px-5 py-2 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer tracking-wider"
                      >
                        {isAddRoleOpen ? "CREATE ROLE" : "SAVE ROLE"}
                      </button>
                    </div>
                  </div>

                  {/* Role Details Section Card */}
                  <div className="p-6 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm">
                    <h3 className="text-[14px] font-bold text-[#1f2937] dark:text-white mb-4 font-sans">
                      Role Details
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Role Name */}
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 font-sans">
                          Role Name
                        </label>
                        <input
                          type="text"
                          required
                          disabled={editingRole?.isSystem ?? false}
                          value={isAddRoleOpen ? newRoleForm.name : (editingRole?.name || "")}
                          onChange={(e) => {
                            if (isAddRoleOpen) {
                              setNewRoleForm({ ...newRoleForm, name: e.target.value });
                            } else if (editingRole) {
                              setEditingRole({ ...editingRole, name: e.target.value });
                            }
                          }}
                          placeholder="e.g. Quality Controller"
                          className="w-full px-4 py-2.5 bg-[#f9fafb] dark:bg-[#121212] border border-gray-200 dark:border-[#2d2d2d] rounded-lg text-xs text-[#1f2937] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:bg-white dark:focus:bg-[#1a1a1a] font-semibold"
                        />
                      </div>

                      {/* Role Description */}
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 font-sans">
                          Role Description
                        </label>
                        <textarea
                          rows={3}
                          required
                          disabled={editingRole?.isSystem ?? false}
                          value={isAddRoleOpen ? newRoleForm.description : (editingRole?.description || "")}
                          onChange={(e) => {
                            if (isAddRoleOpen) {
                              setNewRoleForm({ ...newRoleForm, description: e.target.value });
                            } else if (editingRole) {
                              setEditingRole({ ...editingRole, description: e.target.value });
                            }
                          }}
                          placeholder="e.g. Inspects driving risk behaviors, checks vehicle log conformity and coordinates active safety parameters..."
                          className="w-full px-4 py-2.5 bg-[#f9fafb] dark:bg-[#121212] border border-gray-200 dark:border-[#2d2d2d] rounded-lg text-xs text-[#1f2937] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#295DAA] focus:bg-white dark:focus:bg-[#1a1a1a] font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* System Core Policy Alert indicator for default system roles */}
                  {!isAddRoleOpen && editingRole?.isSystem && (
                    <div className="bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/50 p-4 rounded-lg flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-amber-800 dark:text-amber-450 mb-0.5">System Standard Protection</h5>
                        <p className="text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-300 font-medium font-sans">
                          Standard system profile settings and access matrix thresholds represent vital platform modules. They cannot be modified to prevent carrier service interruptions.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Screen Sub-Tabs Row */}
                  <div className="border-b border-gray-100 dark:border-[#1f1f1f] flex items-center gap-6 mt-6 mb-4">
                    <button
                      type="button"
                      onClick={() => setRoleSubTab("permissions")}
                      className={`flex items-center gap-2 pb-2.5 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                        roleSubTab === "permissions"
                          ? "border-[#295DAA] text-[#295DAA] dark:text-blue-400"
                          : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white"
                      }`}
                    >
                      <Shield className="w-4 h-4 text-current" />
                      Permissions
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleSubTab("notifications")}
                      className={`flex items-center gap-2 pb-2.5 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                        roleSubTab === "notifications"
                          ? "border-[#295DAA] text-[#295DAA] dark:text-blue-400"
                          : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white"
                      }`}
                    >
                      <Bell className="w-4 h-4 text-current" />
                      Notifications
                    </button>
                  </div>

                  {/* Tab Render: Permissions */}
                  {roleSubTab === "permissions" && (
                    <div className="space-y-4">
                      <h3 className="text-[15px] font-bold text-[#1f2937] dark:text-white mt-1 mb-2 font-sans">
                        Permissions Assignment
                      </h3>

                      <div className="rounded-lg overflow-hidden bg-white dark:bg-[#1a1a1a] shadow-sm">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead className="bg-[#f9fafb] dark:bg-[#121212]">
                            <tr className="border-b border-gray-100 dark:border-[#1f1f1f]">
                              <th className="px-6 py-3.5 font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider text-[11px] w-[35%]">
                                Module
                              </th>
                              <th className="px-6 py-3.5 font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider text-[11px] text-center w-[20%] font-semibold">
                                Full
                              </th>
                              <th className="px-6 py-3.5 font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider text-[11px] text-center w-[20%] font-semibold">
                                Some
                              </th>
                              <th className="px-6 py-3.5 font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider text-[11px] text-center w-[25%] font-semibold">
                                None
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-[#1f1f1f]">
                            {[
                              { key: "trips", label: "Appointments" },
                              { key: "vehicles", label: "Dock Management" },
                              { key: "drivers", label: "Carrier Directory" },
                              { key: "settings", label: "System Settings" }
                            ].map((mod) => {
                              const moduleKey = mod.key as "trips" | "vehicles" | "drivers" | "settings";
                              const perms = isAddRoleOpen ? newRolePerms[moduleKey] : (editingRole?.permissions[moduleKey] || { read: false, create: false, edit: false, delete: false, export: false });
                              
                              // Determine current selection status
                              const isFull = perms.read && perms.create && perms.edit && perms.delete && (perms.export ?? false);
                              const isNone = !perms.read && !perms.create && !perms.edit && !perms.delete && !(perms.export ?? false);
                              const currentRadio = isFull ? "full" : (isNone ? "none" : "some");

                              // Toggle the entire row from radio selection
                              const handleRadioSelect = (value: "full" | "some" | "none") => {
                                if (editingRole?.isSystem) return; // read-only check

                                if (isAddRoleOpen) {
                                  setNewRolePerms(prev => {
                                    const updated = { ...prev };
                                    if (value === "full") {
                                      updated[moduleKey] = { read: true, create: true, edit: true, delete: true, export: true };
                                    } else if (value === "none") {
                                      updated[moduleKey] = { read: false, create: false, edit: false, delete: false, export: false };
                                    } else {
                                      updated[moduleKey] = { read: true, create: false, edit: false, delete: false, export: false };
                                    }
                                    return updated;
                                  });
                                } else if (editingRole) {
                                  setEditingRole(prev => {
                                    if (!prev) return null;
                                    const updatedPerms = { ...prev.permissions };
                                    if (value === "full") {
                                      updatedPerms[moduleKey] = { read: true, create: true, edit: true, delete: true, export: true };
                                    } else if (value === "none") {
                                      updatedPerms[moduleKey] = { read: false, create: false, edit: false, delete: false, export: false };
                                    } else {
                                      updatedPerms[moduleKey] = { read: true, create: false, edit: false, delete: false, export: false };
                                    }
                                    return { ...prev, permissions: updatedPerms };
                                  });
                                }
                              };

                              // Toggle specific checkbox
                              const handleCheckboxChange = (actionKey: "read" | "create" | "edit" | "delete" | "export", checked: boolean) => {
                                if (editingRole?.isSystem) return; // read-only check

                                if (isAddRoleOpen) {
                                  setNewRolePerms(prev => ({
                                    ...prev,
                                    [moduleKey]: {
                                      ...prev[moduleKey],
                                      [actionKey]: checked
                                    }
                                  }));
                                } else if (editingRole) {
                                  setEditingRole(prev => {
                                    if (!prev) return null;
                                    return {
                                      ...prev,
                                      permissions: {
                                        ...prev.permissions,
                                        [moduleKey]: {
                                          ...prev.permissions[moduleKey],
                                          [actionKey]: checked
                                        }
                                      }
                                    };
                                  });
                                }
                              };

                              return (
                                <React.Fragment key={moduleKey}>
                                  {/* Table Row */}
                                  <tr className="hover:bg-gray-55/20 dark:hover:bg-[#121212]/20 transition-colors leading-[18px]">
                                    <td className="px-6 py-[18px] align-middle">
                                      <span className="font-bold text-[#1f2937] dark:text-white text-[13px] font-sans">
                                        {mod.label}
                                      </span>
                                    </td>
                                    
                                    {/* Radio Full */}
                                    <td className="px-6 py-[18px] text-center align-middle">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                        <input
                                          type="radio"
                                          name={`radio_${moduleKey}`}
                                          disabled={editingRole?.isSystem ?? false}
                                          checked={currentRadio === "full"}
                                          onChange={() => handleRadioSelect("full")}
                                          className="text-[#295DAA] focus:ring-[#295DAA] border-gray-300 w-4.5 h-4.5 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">Full</span>
                                      </label>
                                    </td>

                                    {/* Radio Some */}
                                    <td className="px-6 py-[18px] text-center align-middle">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                        <input
                                          type="radio"
                                          name={`radio_${moduleKey}`}
                                          disabled={editingRole?.isSystem ?? false}
                                          checked={currentRadio === "some"}
                                          onChange={() => handleRadioSelect("some")}
                                          className="text-[#295DAA] focus:ring-[#295DAA] border-gray-300 w-4.5 h-4.5 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">Some</span>
                                      </label>
                                    </td>

                                    {/* Radio None */}
                                    <td className="px-6 py-[18px] text-center align-middle">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                        <input
                                          type="radio"
                                          name={`radio_${moduleKey}`}
                                          disabled={editingRole?.isSystem ?? false}
                                          checked={currentRadio === "none"}
                                          onChange={() => handleRadioSelect("none")}
                                          className="text-[#295DAA] focus:ring-[#295DAA] border-gray-300 w-4.5 h-4.5 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">None</span>
                                      </label>
                                    </td>
                                  </tr>

                                  {/* Expandable Sub-panel when 'Some' is active */}
                                  {currentRadio === "some" && (
                                    <tr>
                                      <td colSpan={4} className="bg-[#f4f7fc] dark:bg-[#161c2c]/30 px-6 py-4 border-t border-b border-gray-100 dark:border-[#1f1f1f]">
                                        <div className="flex flex-row flex-wrap gap-x-12 gap-y-3.5 items-center">
                                          {/* View check */}
                                          <label className="flex items-center gap-2 text-xs font-bold text-gray-650 dark:text-gray-350 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              disabled={editingRole?.isSystem ?? false}
                                              checked={perms.read}
                                              onChange={(e) => handleCheckboxChange("read", e.target.checked)}
                                              className="rounded border-gray-300 text-[#295DAA] focus:ring-[#295DAA] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                            View
                                          </label>

                                          {/* Add Check */}
                                          <label className="flex items-center gap-2 text-xs font-bold text-gray-655 dark:text-gray-350 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              disabled={editingRole?.isSystem ?? false}
                                              checked={perms.create}
                                              onChange={(e) => handleCheckboxChange("create", e.target.checked)}
                                              className="rounded border-gray-300 text-[#295DAA] focus:ring-[#295DAA] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                            Add
                                          </label>

                                          {/* Edit Check */}
                                          <label className="flex items-center gap-2 text-xs font-bold text-gray-655 dark:text-gray-350 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              disabled={editingRole?.isSystem ?? false}
                                              checked={perms.edit}
                                              onChange={(e) => handleCheckboxChange("edit", e.target.checked)}
                                              className="rounded border-gray-300 text-[#295DAA] focus:ring-[#295DAA] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                            Edit
                                          </label>

                                          {/* Delete Check */}
                                          <label className="flex items-center gap-2 text-xs font-bold text-gray-655 dark:text-gray-350 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              disabled={editingRole?.isSystem ?? false}
                                              checked={perms.delete}
                                              onChange={(e) => handleCheckboxChange("delete", e.target.checked)}
                                              className="rounded border-gray-300 text-[#295DAA] focus:ring-[#295DAA] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                            Delete
                                          </label>

                                          {/* Export Check */}
                                          <label className="flex items-center gap-2 text-xs font-bold text-gray-655 dark:text-gray-350 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              disabled={editingRole?.isSystem ?? false}
                                              checked={perms.export ?? false}
                                              onChange={(e) => handleCheckboxChange("export", e.target.checked)}
                                              className="rounded border-gray-300 text-[#295DAA] focus:ring-[#295DAA] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                            Export
                                          </label>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Tab Render: Notifications */}
                  {roleSubTab === "notifications" && (
                    <div className="space-y-4">
                      <h3 className="text-[15px] font-bold text-[#1f2937] dark:text-white mt-1 mb-2 font-sans">
                        Notification Subscriptions Assignment
                      </h3>

                      <div className="rounded-lg overflow-hidden bg-white dark:bg-[#1a1a1a] shadow-sm">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead className="bg-[#f9fafb] dark:bg-[#121212]">
                            <tr className="border-b border-gray-100 dark:border-[#1f1f1f]">
                              <th className="px-6 py-3.5 font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider text-[11px] w-[40%] text-left">
                                Event Category
                              </th>
                              <th className="px-6 py-3.5 font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider text-[11px] text-center w-[20%] font-semibold">
                                In-App Alerts
                              </th>
                              <th className="px-6 py-3.5 font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider text-[11px] text-center w-[20%] font-semibold">
                                Email Digests
                              </th>
                              <th className="px-6 py-3.5 font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider text-[11px] text-center w-[20%] font-semibold">
                                SMS Alerts
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-[#1f1f1f]">
                            {[
                              { key: "appointments", label: "Appointment Scheduling", desc: "All changes regarding spot bookings, scheduling changes or delays" },
                              { key: "docks", label: "Dock Management Alerts", desc: "Loading process alerts, gate entry updates and container status changes" },
                              { key: "carriers", label: "Carrier Exception Reports", desc: "Driver CDL expired notifications, trailer malfunction warnings" },
                              { key: "system", label: "System & Security Logins", desc: "Two factors auth triggers, direct access tokens changes" }
                            ].map((evt) => {
                              const eKey = evt.key as keyof typeof notificationPrefs;
                              const prefs = notificationPrefs[eKey];

                              const handleTogglePref = (option: "inapp" | "email" | "sms") => {
                                setNotificationPrefs(prev => ({
                                  ...prev,
                                  [eKey]: {
                                    ...prev[eKey],
                                    [option]: !prev[eKey][option]
                                  }
                                }));
                              };

                              return (
                                <tr key={evt.key} className="hover:bg-gray-55/15 dark:hover:bg-[#121212]/15 transition-colors leading-[18px]">
                                  <td className="px-6 py-4 align-middle">
                                    <div className="flex flex-col gap-0.5 select-none">
                                      <span className="font-bold text-[#1f2937] dark:text-white text-[13px] font-sans">
                                        {evt.label}
                                      </span>
                                      <span className="text-[11px] text-gray-500 font-sans">
                                        {evt.desc}
                                      </span>
                                    </div>
                                  </td>

                                  {/* In App Alert check */}
                                  <td className="px-6 py-4 text-center align-middle">
                                    <input
                                      type="checkbox"
                                      disabled={editingRole?.isSystem ?? false}
                                      checked={prefs.inapp}
                                      onChange={() => handleTogglePref("inapp")}
                                      className="rounded border-gray-300 text-[#295DAA] focus:ring-[#295DAA] w-4.5 h-4.5 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                  </td>

                                  {/* Email Alert check */}
                                  <td className="px-6 py-4 text-center align-middle">
                                    <input
                                      type="checkbox"
                                      disabled={editingRole?.isSystem ?? false}
                                      checked={prefs.email}
                                      onChange={() => handleTogglePref("email")}
                                      className="rounded border-gray-300 text-[#295DAA] focus:ring-[#295DAA] w-4.5 h-4.5 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                  </td>

                                  {/* SMS Alert check */}
                                  <td className="px-6 py-4 text-center align-middle">
                                    <input
                                      type="checkbox"
                                      disabled={editingRole?.isSystem ?? false}
                                      checked={prefs.sms}
                                      onChange={() => handleTogglePref("sms")}
                                      className="rounded border-gray-300 text-[#295DAA] focus:ring-[#295DAA] w-4.5 h-4.5 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Secondary Bottom action buttons */}
                  <div className="pt-6 border-t border-gray-100 dark:border-[#1f1f1f] flex justify-end gap-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddRoleOpen(false);
                        setIsEditRoleOpen(false);
                        setEditingRole(null);
                      }}
                      className="px-5 py-2.5 border border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-55 dark:hover:bg-[#222]"
                    >
                      Discard & Exit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        if (isAddRoleOpen) {
                          handleAddRoleSubmit(e);
                        } else {
                          handleEditRoleSubmit(e);
                        }
                      }}
                      className="px-6 py-2.5 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer font-sans"
                    >
                      {isAddRoleOpen ? "Create Access Policy" : "Save Access Policy"}
                    </button>
                  </div>

                </div>
              ) : (
                // ----------------------------------------------------
                // ORIGINAL ROLES LIST TABLE VIEW (MATCHING FIRST SHOT)
                // ----------------------------------------------------
                <>
                  {/* Header section matching the screenshot */}
                  <div className="flex flex-row items-center justify-between pb-6 mb-6">
                    <h2 className="text-[20px] font-bold text-[#1f2937] dark:text-white mb-2 font-sans">
                      Roles & Permissions
                    </h2>
                    <button
                      onClick={() => {
                        setIsAddRoleOpen(true);
                        setRoleSubTab("permissions");
                        setNewRoleForm({ name: "", description: "" });
                      }}
                      className="px-5 py-2.5 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" /> Add Role
                    </button>
                  </div>

                  {/* Roles Table Container Card matching exactly the screenshot */}
                  <div className="rounded-lg overflow-hidden bg-white dark:bg-[#1a1a1a] shadow-sm">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead className="bg-[#f9fafb] dark:bg-[#121212] leading-[18px]">
                        <tr className="border-b border-gray-100 dark:border-[#1f1f1f]">
                          <th className="px-6 py-4 font-bold text-[#475569] dark:text-gray-450 uppercase tracking-wider text-[11px] w-[20%]">
                            Role Name
                          </th>
                          <th className="px-6 py-4 font-bold text-[#475569] dark:text-gray-450 uppercase tracking-wider text-[11px] w-[65%]">
                            Description
                          </th>
                          <th className="px-6 py-4 font-bold text-[#475569] dark:text-gray-450 uppercase tracking-wider text-[11px] text-right pr-10 w-[15%]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#1f1f1f]">
                        {roles.map((role) => (
                          <tr 
                            key={role.id} 
                            className="hover:bg-gray-55/30 dark:hover:bg-[#222]/30 transition-colors leading-[18px]"
                          >
                            {/* Role Name */}
                            <td className="px-6 py-5 whitespace-nowrap align-middle">
                              <span className="font-bold text-[#1f2937] dark:text-white text-[13px] font-sans">
                                {role.name}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="px-6 py-5 align-middle">
                              <span className="text-[13px] font-normal text-[#4b5563] dark:text-gray-350 leading-relaxed">
                                {role.description}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-5 whitespace-nowrap text-right pr-10 align-middle">
                              <div className="flex items-center justify-end gap-3.5">
                                <button
                                  onClick={() => {
                                    setEditingRole(role);
                                    setIsEditRoleOpen(true);
                                    setRoleSubTab("permissions");
                                  }}
                                  className="text-gray-400 hover:text-[#295DAA] transition-colors p-1 rounded hover:bg-gray-55 dark:hover:bg-[#2d2d2d] cursor-pointer"
                                  title="Edit Role"
                                >
                                  <Edit2 className="w-[18px] h-[18px] stroke-[1.6]" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRole(role.id, role.name)}
                                  disabled={role.isSystem}
                                  className="text-gray-400 hover:text-red-650 disabled:opacity-30 disabled:hover:text-[#9ca3af] disabled:cursor-not-allowed transition-colors p-1 rounded hover:bg-gray-55 dark:hover:bg-[#2d2d2d] cursor-pointer"
                                  title={role.isSystem ? "System standard policies cannot be customized or revoked" : "Force-revoke custom role template"}
                                >
                                  <Trash2 className="w-[18px] h-[18px] stroke-[1.6]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* EXTRA FORM VIEWS - SCHEMA EXTENSION TAB */}
          {activeTab === "Extra Form Fields" && (
            <div className="flex flex-col h-full min-h-0">
              
              {/* Directory Filter Rail */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-[#1f1f1f] mb-6 flex-shrink-0">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    value={fieldSearchQuery}
                    onChange={(e) => setFieldSearchQuery(e.target.value)}
                    placeholder="Search custom fields by target target schema..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#2d2d2d] rounded-lg bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs font-semibold text-gray-950 dark:text-white"
                  />
                  {fieldSearchQuery && (
                    <button onClick={() => setFieldSearchQuery("")} className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-600">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setIsAddFieldOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Schema Descriptor Field
                </button>
              </div>

              {/* Dynamic Schemas description block */}
              <div className="p-4 rounded-lg bg-gray-50/55 border border-dashed border-gray-205 dark:bg-[#121212]/30 dark:border-zinc-800/20 mb-6 flex items-start gap-3 flex-shrink-0">
                <Sliders className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Custom Schema Architecture Manager</h4>
                  <p className="text-[10.5px] leading-relaxed text-gray-500 dark:text-gray-405 font-semibold">
                    Configure extra data fields inside core entity screens (Drivers, Vehicles, and Trips). Once created, these fields dynamically modify inputs and list summaries across active management workspaces.
                  </p>
                </div>
              </div>

              {/* Custom fields directory display */}
              <div className="flex-1 overflow-y-auto min-h-0 rounded-lg shadow-sm">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-gray-55 dark:bg-[#121212] text-gray-500 dark:text-gray-400 uppercase font-bold text-[10px] tracking-wider sticky top-0 border-b border-gray-100 dark:border-[#1f1f1f] z-10">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Target System Schema</th>
                      <th className="px-6 py-3 font-semibold">Dynamic Descriptor Tag</th>
                      <th className="px-6 py-3 font-semibold">Data Pipeline Format</th>
                      <th className="px-6 py-3 font-semibold text-center">Validation Requirement</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-150 dark:divide-[#242424]">
                    {customFields
                      .filter(f => f.entity.toLowerCase().includes(fieldSearchQuery.toLowerCase()) || f.name.toLowerCase().includes(fieldSearchQuery.toLowerCase()))
                      .map((field) => {
                        let textBadgeColor = "";
                        switch (field.entity) {
                          case "Drivers":
                            textBadgeColor = "text-primary-650 dark:text-primary-400 bg-primary-50/40 dark:bg-primary-950/20 border-primary-200/50";
                            break;
                          case "Vehicles":
                            textBadgeColor = "text-emerald-650 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/50";
                            break;
                          default:
                            textBadgeColor = "text-purple-650 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/50";
                        }

                        return (
                          <tr key={field.id} className="hover:bg-gray-55/25 dark:hover:bg-[#2d2d2d]/10 transition-colors">
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${textBadgeColor}`}>
                                {field.entity}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap font-bold text-gray-800 dark:text-gray-200">
                              {field.name}
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap font-mono text-gray-500 dark:text-gray-400 font-semibold">
                              {field.type} format
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-center">
                              {field.required ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950/80 uppercase">
                                  Mandatory Input
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-55 text-gray-600 border border-gray-150 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 uppercase">
                                  Optional Field
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-right font-semibold">
                              <button
                                onClick={() => handleDeleteField(field.id, field.name)}
                                className="text-gray-400 hover:text-red-650 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-50 dark:hover:bg-[#2d2d2d] cursor-pointer"
                                title="Prune dynamic attribute"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                    {customFields.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-450">
                          <Sliders className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="font-semibold">Empty descriptor directory. Append dynamic fleet parameters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* DYNAMIC SCHEMA FIELD ADD DRAWER */}
              <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#1e1e1e] shadow-2xl border-l border-gray-100 dark:border-[#1f1f1f] z-45 transition-transform duration-300 transform p-6 flex flex-col ${
                isAddFieldOpen ? "translate-x-0" : "translate-x-full"
              }`}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1f1f1f] mb-6 flex-shrink-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#295DAA]" /> Append Schema Column
                  </h3>
                  <button onClick={() => setIsAddFieldOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddFieldSubmit} className="flex-1 space-y-5 overflow-y-auto pr-1 min-h-0">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Target Schema Entity</label>
                    <select
                      value={newFieldForm.entity}
                      onChange={(e) => setNewFieldForm({ ...newFieldForm, entity: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-900 dark:text-white font-semibold"
                    >
                      <option value="Drivers">Drivers Registry Schema</option>
                      <option value="Vehicles">Vehicles Catalog Schema</option>
                      <option value="Trips">Dispatch Trips Journal Schema</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Dynamic Field Label Tag</label>
                    <input
                      type="text"
                      required
                      value={newFieldForm.name}
                      onChange={(e) => setNewFieldForm({ ...newFieldForm, name: e.target.value })}
                      placeholder="e.g. Safety Medical Certificate Expiry Date"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Format Type</label>
                    <select
                      value={newFieldForm.type}
                      onChange={(e) => setNewFieldForm({ ...newFieldForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-[#2d2d2d] bg-white dark:bg-[#121212] rounded-lg text-xs text-gray-900 dark:text-white font-semibold"
                    >
                      <option value="Text">Standard Character String Text</option>
                      <option value="Number">Decimal / Digit float bounds Number</option>
                      <option value="Date">Standard ISO Calendar Date</option>
                      <option value="Boolean">Binary Toggle Yes / No Checkbox Option</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Validation Status</label>
                    <label className="flex items-center gap-2.5 text-xs text-gray-750 dark:text-gray-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newFieldForm.required}
                        onChange={(e) => setNewFieldForm({ ...newFieldForm, required: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-700 text-[#295DAA] focus:ring-primary-500 cursor-pointer w-4 h-4"
                      />
                      Enforce Mandatory Validation
                    </label>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-[#1f1f1f] flex justify-end gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAddFieldOpen(false)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-350 rounded-lg text-[11px] font-semibold hover:bg-gray-50 cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#295DAA] hover:bg-[#1f4783] text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Inject Column schema
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
