'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Lock,
  ShieldCheck,
  Check,
  Save,
  AlertCircle,
  Users,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  UserCheck,
  Sliders,
  Building,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  CheckSquare,
} from 'lucide-react';
import { Employee } from '../../types/crm';
import { cn } from '../../lib/utils';
import { PermissionMatrixModal } from '../../components/employees/PermissionMatrixModal';

const ALL_ERP_MODULES = [
  { id: 'crm', label: 'CRM & Sales', desc: 'Leads, Opportunities, Quotations, Sales Orders' },
  { id: 'projects', label: 'Projects & Planning', desc: 'Job Master, Project Milestones, Gantt Tracking' },
  { id: 'design', label: 'Designer & BOM', desc: 'Drawings, Design BOM, CAD Revision Approval' },
  { id: 'purchase', label: 'Purchase & RFQ', desc: 'Vendor RFQ, Purchase Orders, Vendor Rating' },
  { id: 'store', label: 'Store & Inventory', desc: 'GRN, Material Stock, BIN Location, Dispatch' },
  { id: 'production', label: 'Production & Shop Floor', desc: 'Work Orders, Routing, WIP Tracking, Shift Log' },
  { id: 'quality', label: 'Quality Inspection', desc: 'PDI, In-process QC, Material Test Reports' },
  { id: 'maintenance', label: 'Plant Maintenance', desc: 'Equipment AMC, Breakdown Log, Preventive Maint' },
  { id: 'hr', label: 'HR & Payroll', desc: 'Staff Master, Web Punch, Leave Approvals, Salary' },
  { id: 'accounting', label: 'Accounts & Finance', desc: 'Invoices, Receivables, Payables, Ledger' },
];

const MODULE_PAGES_LIST = [
  { module: 'crm', moduleLabel: 'CRM', page: 'Leads & Inquiries' },
  { module: 'crm', moduleLabel: 'CRM', page: 'Quotations & Estimation' },
  { module: 'crm', moduleLabel: 'CRM', page: 'Customer PO & Sales Orders' },
  { module: 'projects', moduleLabel: 'Projects', page: 'Job Master & Milestone Planning' },
  { module: 'projects', moduleLabel: 'Projects', page: 'Task Assignment & Daily Progress' },
  { module: 'design', moduleLabel: 'Designer', page: 'Drawings & CAD Repository' },
  { module: 'design', moduleLabel: 'Designer', page: 'Engineering BOM (EBOM)' },
  { module: 'purchase', moduleLabel: 'Purchase', page: 'Purchase Indents & RFQs' },
  { module: 'purchase', moduleLabel: 'Purchase', page: 'Purchase Orders & Vendor Terms' },
  { module: 'store', moduleLabel: 'Store', page: 'Goods Receipt Note (GRN)' },
  { module: 'store', moduleLabel: 'Store', page: 'Inventory Stock & Stock Transfer' },
  { module: 'production', moduleLabel: 'Production', page: 'Work Orders & Shop Floor' },
  { module: 'production', moduleLabel: 'Production', page: 'WIP Tracking & Shift Logging' },
  { module: 'quality', moduleLabel: 'Quality', page: 'Incoming & In-Process QC' },
  { module: 'maintenance', moduleLabel: 'Maintenance', page: 'Breakdown Logs & Preventative' },
  { module: 'accounting', moduleLabel: 'Accounting', page: 'Tax Invoices & Credit Notes' },
  { module: 'accounting', moduleLabel: 'Accounting', page: 'Payment Collection & Ledgers' },
  { module: 'hr', moduleLabel: 'HR', page: 'Employee Directory & Hierarchy' },
  { module: 'hr', moduleLabel: 'HR', page: 'Attendance Punch & Regularization' },
  { module: 'hr', moduleLabel: 'HR', page: 'Leave Applications & Approvals' },
];

const ACTIONS = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'approve', label: 'Approve' },
  { id: 'export', label: 'Export' },
  { id: 'print', label: 'Print' },
];

const getEmpRoleInfo = (emp: any) => {
  if (!emp) return { type: 'employee', label: 'Staff', badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200' };
  const rType = emp.roleType || emp.role_type || (
    (emp.role?.toLowerCase().includes('super admin') || emp.designation?.toLowerCase().includes('super admin') || emp.name?.toLowerCase().includes('super admin') || emp.username?.toLowerCase() === 'admin') ? 'super_admin' :
    (emp.role?.toLowerCase().includes('admin') || emp.roleName?.toLowerCase().includes('admin') || emp.designation?.toLowerCase().includes('executive director') || emp.username?.toLowerCase() === 'ketan.admin' || emp.isFamilyMember || emp.is_family_member) ? 'admin' :
    (emp.role?.toLowerCase().includes('manager') || emp.roleName?.toLowerCase().includes('manager') || emp.designation?.toLowerCase().includes('director') || emp.designation?.toLowerCase().includes('manager') || emp.designation?.toLowerCase().includes('head')) ? 'department_manager' :
    'employee'
  );

  if (rType === 'super_admin') {
    return { type: 'super_admin', label: 'Super Admin', badgeClass: 'bg-purple-100 text-purple-700 border border-purple-200 font-semibold shadow-sm' };
  }
  if (rType === 'admin') {
    return { type: 'admin', label: 'Admin', badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200 font-semibold shadow-sm' };
  }
  if (rType === 'department_manager') {
    return { type: 'department_manager', label: 'Dept Manager', badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200 font-semibold shadow-sm' };
  }
  return { type: 'employee', label: 'Staff', badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold' };
};

export default function PermissionsPage() {
  const {
    roles,
    updateRole,
    availableEmployees = [],
    departments = [],
    updateEmployeePermissions,
    currentUser,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'employee' | 'roles'>('employee');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [empSearch, setEmpSearch] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);

  // Selected Employee Editable State
  const [empRoleType, setEmpRoleType] = useState<string>('employee');
  const [empDataScope, setEmpDataScope] = useState<string>('department');
  const [empAssignedModules, setEmpAssignedModules] = useState<string[]>([]);
  const [empCustomPermissions, setEmpCustomPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [empCanAssignTasks, setEmpCanAssignTasks] = useState(false);
  const [empCanApproveLeaves, setEmpCanApproveLeaves] = useState(false);
  const [empCanManageAttendance, setEmpCanManageAttendance] = useState(false);
  const [empCanExportData, setEmpCanExportData] = useState(false);

  // Role Template State
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'admin');
  const [roleMatrix, setRoleMatrix] = useState<Record<string, Record<string, boolean>>>({});

  // Initialize selected employee on mount or when availableEmployees changes
  useEffect(() => {
    if (!selectedEmpId && availableEmployees.length > 0) {
      setSelectedEmpId(availableEmployees[0].id);
    }
  }, [availableEmployees, selectedEmpId]);

  const selectedEmployee = useMemo(() => {
    return availableEmployees.find((e) => e.id === selectedEmpId || e.username === selectedEmpId) || availableEmployees[0] || null;
  }, [availableEmployees, selectedEmpId]);

  // Load employee config into form when selected employee changes
  useEffect(() => {
    if (!selectedEmployee) return;

    setEmpRoleType(selectedEmployee.roleType || 'employee');
    setEmpDataScope(selectedEmployee.dataScope || 'department');
    setEmpCanAssignTasks(Boolean(selectedEmployee.canAssignTasks));
    setEmpCanApproveLeaves(Boolean(selectedEmployee.canApproveLeaves));
    setEmpCanManageAttendance(Boolean(selectedEmployee.canManageAttendance));
    setEmpCanExportData(Boolean(selectedEmployee.canExportData));

    // Assigned modules
    if (selectedEmployee.assignedModules && Array.isArray(selectedEmployee.assignedModules) && selectedEmployee.assignedModules.length > 0) {
      setEmpAssignedModules([...selectedEmployee.assignedModules]);
    } else {
      // Default to department modules
      const deptName = (selectedEmployee.department || selectedEmployee.departmentName || '').toLowerCase();
      let defMods = ['production'];
      if (deptName.includes('crm') || deptName.includes('sales')) defMods = ['crm'];
      else if (deptName.includes('project')) defMods = ['projects'];
      else if (deptName.includes('design')) defMods = ['design'];
      else if (deptName.includes('purch')) defMods = ['purchase'];
      else if (deptName.includes('store') || deptName.includes('wareh')) defMods = ['store'];
      else if (deptName.includes('prod')) defMods = ['production'];
      else if (deptName.includes('qual') || deptName.includes('qc')) defMods = ['quality'];
      else if (deptName.includes('maint')) defMods = ['maintenance'];
      else if (deptName.includes('hr')) defMods = ['hr'];
      else if (deptName.includes('account') || deptName.includes('fin')) defMods = ['accounting'];
      setEmpAssignedModules(defMods);
    }

    // Custom permissions matrix
    setEmpCustomPermissions(selectedEmployee.customPermissions || {});
  }, [selectedEmployee]);

  const filteredEmployees = useMemo(() => {
    if (!empSearch.trim()) return availableEmployees;
    const q = empSearch.toLowerCase();
    return availableEmployees.filter(
      (e) =>
        (e.name || '').toLowerCase().includes(q) ||
        (e.firstName || '').toLowerCase().includes(q) ||
        (e.lastName || '').toLowerCase().includes(q) ||
        (e.id || '').toLowerCase().includes(q) ||
        (e.department || e.departmentName || '').toLowerCase().includes(q)
    );
  }, [availableEmployees, empSearch]);

  const toggleEmpModule = (moduleId: string) => {
    setEmpAssignedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const handleEmpPermissionToggle = (pageKey: string, action: string) => {
    setEmpCustomPermissions((prev) => {
      const pagePerms = prev[pageKey] || {};
      const currentVal = pagePerms[action];
      return {
        ...prev,
        [pageKey]: {
          ...pagePerms,
          [action]: !currentVal,
        },
      };
    });
  };

  const handleSelectDeptDefaults = () => {
    if (!selectedEmployee) return;
    const deptName = (selectedEmployee.department || selectedEmployee.departmentName || '').toLowerCase();
    let defMods = ['production'];
    if (deptName.includes('crm') || deptName.includes('sales')) defMods = ['crm'];
    else if (deptName.includes('project')) defMods = ['projects'];
    else if (deptName.includes('design')) defMods = ['design'];
    else if (deptName.includes('purch')) defMods = ['purchase'];
    else if (deptName.includes('store') || deptName.includes('wareh')) defMods = ['store'];
    else if (deptName.includes('prod')) defMods = ['production'];
    else if (deptName.includes('qual') || deptName.includes('qc')) defMods = ['quality'];
    else if (deptName.includes('maint')) defMods = ['maintenance'];
    else if (deptName.includes('hr')) defMods = ['hr'];
    else if (deptName.includes('account') || deptName.includes('fin')) defMods = ['accounting'];
    setEmpAssignedModules(defMods);
  };

  const handleSelectAllModules = () => {
    setEmpAssignedModules(ALL_ERP_MODULES.map((m) => m.id));
  };

  const handleSaveEmployeePermissions = async () => {
    if (!selectedEmployee) return;
    setIsSaving(true);
    try {
      const res = await updateEmployeePermissions(selectedEmployee.id, {
        roleType: empRoleType,
        dataScope: empDataScope,
        assignedModules: empAssignedModules,
        customPermissions: empCustomPermissions,
        canAssignTasks: empCanAssignTasks,
        canApproveLeaves: empCanApproveLeaves,
        canManageAttendance: empCanManageAttendance,
        canExportData: empCanExportData,
      });

      if (res?.success) {
        setSaveSuccessMsg(`Access permissions saved successfully for ${selectedEmployee.name || selectedEmployee.id}!`);
      } else {
        setSaveSuccessMsg(`Permissions updated locally for ${selectedEmployee.name || selectedEmployee.id}.`);
      }
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setSaveSuccessMsg('Error updating permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  // Role Template Handlers
  const currentRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleRoleToggle = (pageKey: string, action: string) => {
    setRoleMatrix((prev) => {
      const currentMod = prev[pageKey] || {};
      return {
        ...prev,
        [pageKey]: {
          ...currentMod,
          [action]: !currentMod[action],
        },
      };
    });
  };

  const handleSaveRole = () => {
    if (updateRole && currentRole) {
      updateRole(currentRole.id, {
        ...currentRole,
        permissions: roleMatrix,
      } as any);
    }
    setSaveSuccessMsg(`Role matrix saved for ${currentRole.name}.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-5 text-xs">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-crm-brand-700/10 text-crm-brand-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-[#211B17]">
              Role-Based Access Control (RBAC) & Employee Permissions
            </h1>
          </div>
          <p className="text-[#70665F] mt-1">
            Department default module auto-assignment, configurable cross-module permissions, and granular action authority.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#EBE3DB]">
          <button
            onClick={() => setActiveTab('employee')}
            className={cn(
              'px-4 py-2 rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer',
              activeTab === 'employee'
                ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-sm'
                : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#F3ECE4]'
            )}
          >
            <UserCheck className="w-4 h-4" />
            Employee Granular Access
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={cn(
              'px-4 py-2 rounded-lg font-bold text-xs transition flex items-center gap-2 cursor-pointer',
              activeTab === 'roles'
                ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-sm'
                : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#F3ECE4]'
            )}
          >
            <Sliders className="w-4 h-4" />
            Global Role Templates
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: EMPLOYEE GRANULAR ACCESS */}
      {activeTab === 'employee' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Column: Employee Selector */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#211B17] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-crm-brand-700" />
                  Select Employee
                </h3>
                <span className="text-[11px] text-[#70665F]">
                  {availableEmployees.length} total
                </span>
              </div>

              <input
                type="text"
                placeholder="Search by name, ID or department..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] placeholder:text-[#A89F91] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
              />

              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                {filteredEmployees.map((emp) => {
                  const isSelected = (selectedEmployee?.id === emp.id);
                  const empName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff';
                  const dept = emp.department || emp.departmentName || 'General';

                  return (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmpId(emp.id)}
                      className={cn(
                        'w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer',
                        isSelected
                          ? 'bg-crm-brand-700/10 border-crm-brand-700/40 text-crm-brand-900 shadow-sm'
                          : 'bg-[#FAF7F2]/60 border-transparent hover:bg-[#FAF7F2] text-[#3E2723]'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                          isSelected ? 'bg-crm-brand-700 text-white' : 'bg-white border border-[#EBE3DB] text-crm-brand-700'
                        )}>
                          {empName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate text-xs">{empName}</p>
                          <p className="text-[10px] text-[#70665F] truncate">{dept} • {emp.id}</p>
                        </div>
                      </div>
                      {(() => {
                        const roleInfo = getEmpRoleInfo(emp);
                        return (
                          <span className={cn(
                            'px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ml-1',
                            roleInfo.badgeClass
                          )}>
                            {roleInfo.label}
                          </span>
                        );
                      })()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Employee Access Config & Matrix */}
          <div className="lg:col-span-3 space-y-4">
            {selectedEmployee ? (
              <>
                {/* Employee Profile Header & Quick Privileges */}
                <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#EBE3DB]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-crm-brand-600 to-crm-brand-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {(selectedEmployee.name || selectedEmployee.firstName || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-bold text-[#211B17]">
                            {selectedEmployee.name || `${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim()}
                          </h2>
                          <span className="text-xs font-mono text-[#70665F]">({selectedEmployee.id})</span>
                          {(() => {
                            const selRole = getEmpRoleInfo(selectedEmployee);
                            return (
                              <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold', selRole.badgeClass)}>
                                {selRole.label}
                              </span>
                            );
                          })()}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {selectedEmployee.status || 'Active'}
                          </span>
                        </div>
                        <p className="text-xs text-[#70665F]">
                          {selectedEmployee.department || selectedEmployee.departmentName} • {selectedEmployee.designation || selectedEmployee.role || 'Specialist'} • {selectedEmployee.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMatrixModalOpen(true)}
                        className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer text-xs"
                      >
                        <Sliders className="w-4 h-4" />
                        <span>Open 12-Module Matrix</span>
                      </button>
                      <button
                        onClick={handleSaveEmployeePermissions}
                        disabled={isSaving}
                        className="px-5 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saving...' : 'Save Permissions'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Hierarchy & Scope Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#3E2723] mb-1">
                        1. Employee Hierarchy Level:
                      </label>
                      <select
                        value={empRoleType}
                        onChange={(e) => setEmpRoleType(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] font-bold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                      >
                        <option value="super_admin">Tier 1: Super Admin (Owner - Full ERP Control)</option>
                        <option value="admin">Tier 2: Admin (Operations & Department Overseer)</option>
                        <option value="department_manager">Tier 3: Department Manager (Assigns Tasks, Approves Leaves)</option>
                        <option value="employee">Tier 4: Department Employee (Self-Service & Workspace)</option>
                      </select>
                      <p className="text-[10px] text-[#8C7A6F] mt-1">
                        {empRoleType === 'super_admin' && 'Has unrestricted access to all modules, financial data, and system configurations.'}
                        {empRoleType === 'admin' && 'Can manage users, oversee departments, and access designated operational modules.'}
                        {empRoleType === 'department_manager' && 'Supervises their department team, assigns tasks, and approves attendance/leaves.'}
                        {empRoleType === 'employee' && 'Accesses personal workspace, punches attendance, updates assigned tasks.'}
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold text-[#3E2723] mb-1">
                        2. Data Visibility Scope:
                      </label>
                      <select
                        value={empDataScope}
                        onChange={(e) => setEmpDataScope(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] font-bold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                      >
                        <option value="own">Self Only (Personal Profile, Leaves, and Punches only)</option>
                        <option value="assigned">Assigned Records (Only Tasks & Orders assigned to them)</option>
                        <option value="department">Department Scope (All records within their department)</option>
                        <option value="all">Enterprise All (Full company-wide data visibility)</option>
                      </select>
                      <p className="text-[10px] text-[#8C7A6F] mt-1">
                        Restricts record visibility in listings, reports, and search queries.
                      </p>
                    </div>
                  </div>

                  {/* Operational Authorities */}
                  <div>
                    <label className="block font-bold text-[#3E2723] mb-2">
                      3. Operational Authorities & Action Privileges:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={empCanAssignTasks}
                          onChange={(e) => setEmpCanAssignTasks(e.target.checked)}
                          className="rounded text-crm-brand-700 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-bold text-[#211B17]">Can Assign Tasks</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={empCanApproveLeaves}
                          onChange={(e) => setEmpCanApproveLeaves(e.target.checked)}
                          className="rounded text-crm-brand-700 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-bold text-[#211B17]">Can Approve Leaves</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={empCanManageAttendance}
                          onChange={(e) => setEmpCanManageAttendance(e.target.checked)}
                          className="rounded text-crm-brand-700 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-bold text-[#211B17]">Can Manage Attendance</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={empCanExportData}
                          onChange={(e) => setEmpCanExportData(e.target.checked)}
                          className="rounded text-crm-brand-700 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-bold text-[#211B17]">Can Export Reports</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Module Access Assignment */}
                <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-[#211B17] flex items-center gap-1.5 text-sm">
                        <KeyRound className="w-4 h-4 text-crm-brand-700" />
                        4. Authorized ERP Modules ({empAssignedModules.length} of {ALL_ERP_MODULES.length} Granted)
                      </h3>
                      <p className="text-[11px] text-[#70665F]">
                        Controls which ERP navigation items appear in the employee sidebar.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectDeptDefaults}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#EBE3DB] hover:bg-[#EBE3DB] text-crm-brand-700 font-bold text-[11px] transition cursor-pointer"
                      >
                        Reset to Dept Defaults
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectAllModules}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#EBE3DB] hover:bg-[#EBE3DB] text-crm-brand-700 font-bold text-[11px] transition cursor-pointer"
                      >
                        Select All Modules
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                    {ALL_ERP_MODULES.map((mod) => {
                      const isChecked = empAssignedModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleEmpModule(mod.id)}
                          className={cn(
                            'p-3 rounded-xl border transition cursor-pointer select-none space-y-1',
                            isChecked
                              ? 'bg-crm-brand-700/10 border-crm-brand-700/40 text-crm-brand-900 shadow-sm'
                              : 'bg-[#FAF7F2]/60 border-[#EBE3DB] hover:bg-[#FAF7F2] text-[#70665F]'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{mod.label}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded text-crm-brand-700 pointer-events-none w-4 h-4"
                            />
                          </div>
                          <p className="text-[10px] text-[#8C7A6F] line-clamp-1">{mod.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Granular Permission Matrix */}
                <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden">
                  <div className="p-4 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[#211B17] text-sm flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-crm-brand-700" />
                        5. Granular Action Rights by Page & Resource
                      </h3>
                      <p className="text-[11px] text-[#70665F]">
                        Explicitly grant or revoke View, Create, Edit, Delete, Approve, Export and Print privileges.
                      </p>
                    </div>

                    <button
                      onClick={handleSaveEmployeePermissions}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Matrix'}</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#FAF7F2]/80 text-[#544B45] font-bold border-b border-[#EBE3DB] uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">Module</th>
                          <th className="py-2.5 px-4">Page / Feature</th>
                          {ACTIONS.map((act) => (
                            <th key={act.id} className="py-2.5 px-3 text-center">{act.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBE3DB]">
                        {MODULE_PAGES_LIST.map((item, idx) => {
                          const pageKey = `${item.module}-${item.page}`;
                          const isModuleAssigned = empAssignedModules.includes(item.module);
                          const isSuper = (empRoleType === 'super_admin');

                          return (
                            <tr
                              key={idx}
                              className={cn(
                                'transition',
                                isModuleAssigned ? 'hover:bg-[#FAF7F2]/60' : 'bg-slate-50/70 opacity-60'
                              )}
                            >
                              <td className="py-2 px-4 font-bold">
                                <span className={cn(
                                  'px-2 py-0.5 rounded text-[10px] font-mono border',
                                  isModuleAssigned
                                    ? 'bg-crm-brand-700/10 text-crm-brand-800 border-crm-brand-700/20'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                )}>
                                  {item.moduleLabel}
                                </span>
                              </td>
                              <td className="py-2 px-4 font-semibold text-[#211B17]">
                                <div className="flex items-center gap-1.5">
                                  <span>{item.page}</span>
                                  {!isModuleAssigned && (
                                    <span className="text-[9px] text-amber-700 font-normal italic">
                                      (Module not assigned)
                                    </span>
                                  )}
                                </div>
                              </td>

                              {ACTIONS.map((act) => {
                                // Default permission logic
                                const override = empCustomPermissions[pageKey]?.[act.id];
                                const hasAccess =
                                  isSuper ||
                                  (override !== undefined
                                    ? override
                                    : isModuleAssigned && (act.id === 'view' || act.id === 'print' || (empRoleType !== 'employee' && act.id === 'create')));

                                return (
                                  <td key={act.id} className="py-2 px-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(hasAccess)}
                                      disabled={isSuper}
                                      onChange={() => handleEmpPermissionToggle(pageKey, act.id)}
                                      className="w-4 h-4 rounded text-crm-brand-700 focus:ring-crm-brand-600 border-[#EBE3DB] cursor-pointer disabled:opacity-40"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-[#EBE3DB]">
                <Users className="w-8 h-8 text-[#A89F91] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#211B17]">No employee selected</p>
                <p className="text-xs text-[#70665F]">Choose an employee from the left panel to configure permissions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL ROLE TEMPLATES */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-[#211B17]">
                Baseline Role Templates
              </h2>
              <p className="text-[#70665F] mt-0.5">
                Default authorization templates applied to newly created employees based on their assigned role.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-bold font-mono focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    ROLE: {r.name?.toUpperCase()}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSaveRole}
                className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Role Matrix</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF7F2] text-[#544B45] font-bold border-b border-[#EBE3DB] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Page / Resource</th>
                    {ACTIONS.map((act) => (
                      <th key={act.id} className="py-3 px-3 text-center">{act.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {MODULE_PAGES_LIST.map((item, idx) => {
                    const key = `${item.module}-${item.page}`;
                    const isSuper = currentRole?.name === 'Super Admin';
                    const isManager = currentRole?.name?.toLowerCase().includes('manager');

                    return (
                      <tr key={idx} className="hover:bg-[#FAF7F2]/40 transition">
                        <td className="py-2.5 px-4 font-bold">
                          <span className="px-2 py-0.5 rounded bg-crm-brand-700/10 text-crm-brand-800 border border-crm-brand-700/20 font-mono text-[10px]">
                            {item.moduleLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-[#211B17]">{item.page}</td>

                        {ACTIONS.map((act) => {
                          const defaultChecked =
                            isSuper ||
                            (isManager && act.id !== 'delete') ||
                            (act.id === 'view' || act.id === 'print');
                          const checked = roleMatrix[key]?.[act.id] ?? defaultChecked;

                          return (
                            <td key={act.id} className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={isSuper}
                                onChange={() => handleRoleToggle(key, act.id)}
                                className="w-4 h-4 rounded text-crm-brand-700 focus:ring-crm-brand-600 border-[#EBE3DB] cursor-pointer disabled:opacity-50"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 12-Module Granular RBAC Permissions Modal */}
      <PermissionMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        employee={selectedEmployee}
        onSaved={(updatedEmp) => {
          setSaveSuccessMsg(`RBAC matrix for ${updatedEmp.firstName || ''} ${updatedEmp.lastName || updatedEmp.id} successfully updated.`);
          setIsMatrixModalOpen(false);
          setTimeout(() => setSaveSuccessMsg(null), 4000);
        }}
      />
    </div>
  );
}
