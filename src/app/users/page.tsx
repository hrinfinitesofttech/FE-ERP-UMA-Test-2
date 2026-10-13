'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../context/ERPContext';
import { Employee } from '../../types/crm';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  KeyRound,
  User,
  Building,
  Mail,
  Phone,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Lock,
  Edit2,
  Calendar,
  AlertCircle,
  AlertTriangle,
  MapPin,
  Briefcase,
  Sliders,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmployeeFormModal } from '../../components/employees/EmployeeFormModal';
import { PermissionMatrixModal } from '../../components/employees/PermissionMatrixModal';
import { EmployeeProfileModal } from '../../components/employees/EmployeeProfileModal';

export default function UsersPage() {
  const {
    employees,
    roles,
    departments,
    currentUser,
    deactivateEmployee,
    activateEmployee,
    resetEmployeePassword,
    refreshEmployees,
  } = useERP();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [filterReviewRequiredOnly, setFilterReviewRequiredOnly] = useState(false);

  // Sorting & Pagination States
  const [sortField, setSortField] = useState<'id' | 'name' | 'department' | 'role' | 'status'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Notification States
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [employeeForPermissions, setEmployeeForPermissions] = useState<Employee | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [employeeForProfile, setEmployeeForProfile] = useState<Employee | null>(null);

  // Status Change Confirmation Modal State
  const [confirmStatusModalEmp, setConfirmStatusModalEmp] = useState<Employee | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Password Reset Modal State
  const [resetModalEmployee, setResetModalEmployee] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Available unique designations from employees
  const availableDesignations = useMemo(() => {
    const desigs = new Set<string>();
    employees.forEach((emp) => {
      if (emp.designation && emp.designation.trim()) desigs.add(emp.designation.trim());
    });
    return Array.from(desigs).sort();
  }, [employees]);

  // Review Required count
  const reviewRequiredCount = useMemo(() => {
    return employees.filter((e) => e.permissionsReviewRequired).length;
  }, [employees]);

  // Active / Inactive counts
  const activeCount = useMemo(() => {
    return employees.filter((e) => e.status === 'active' || e.isActive === true).length;
  }, [employees]);

  // Multi-field Filter Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Text Search across Name, ID, Username, Email, Phone
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.name || ''}`.toLowerCase();
        const idMatch = (emp.id || '').toLowerCase().includes(q);
        const usernameMatch = (emp.username || '').toLowerCase().includes(q);
        const emailMatch = (emp.email || '').toLowerCase().includes(q);
        const phoneMatch = (emp.mobile || emp.phone || '').toLowerCase().includes(q);
        const nameMatch = fullName.includes(q);

        if (!idMatch && !usernameMatch && !emailMatch && !phoneMatch && !nameMatch) {
          return false;
        }
      }

      // 2. Department Filter
      if (selectedDept !== 'all') {
        const matchesDeptId = emp.departmentId === selectedDept;
        const matchesDeptName =
          (emp.departmentName || emp.department || '').toLowerCase() === selectedDept.toLowerCase();
        if (!matchesDeptId && !matchesDeptName) return false;
      }

      // 3. Role Filter
      if (selectedRole !== 'all') {
        const matchesRoleId = emp.roleId === selectedRole;
        const matchesRoleType = emp.roleType === selectedRole;
        const matchesRoleName = (emp.roleName || emp.role || '').toLowerCase() === selectedRole.toLowerCase();
        if (!matchesRoleId && !matchesRoleType && !matchesRoleName) return false;
      }

      // 4. Status Filter
      if (selectedStatus !== 'all') {
        const isEmpActive = emp.status === 'active' || emp.isActive === true;
        if (selectedStatus === 'active' && !isEmpActive) return false;
        if (selectedStatus === 'inactive' && isEmpActive) return false;
      }

      // 5. Designation Filter
      if (selectedDesignation !== 'all') {
        if ((emp.designation || '').toLowerCase() !== selectedDesignation.toLowerCase()) return false;
      }

      // 6. Review Required Filter
      if (filterReviewRequiredOnly && !emp.permissionsReviewRequired) {
        return false;
      }

      return true;
    });
  }, [
    employees,
    searchQuery,
    selectedDept,
    selectedRole,
    selectedStatus,
    selectedDesignation,
    filterReviewRequiredOnly,
  ]);

  // Sorting Logic
  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let valA: string = '';
      let valB: string = '';

      switch (sortField) {
        case 'id':
          valA = a.id || '';
          valB = b.id || '';
          break;
        case 'name':
          valA = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.name || a.username;
          valB = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.name || b.username;
          break;
        case 'department':
          valA = a.departmentName || a.department || '';
          valB = b.departmentName || b.department || '';
          break;
        case 'role':
          valA = a.roleName || a.role || '';
          valB = b.roleName || b.role || '';
          break;
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
      }

      const cmp = valA.localeCompare(valB, undefined, { numeric: true });
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [filteredEmployees, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [sortedEmployees, currentPage, pageSize]);

  const handleSort = (field: 'id' | 'name' | 'department' | 'role' | 'status') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshEmployees();
      setActionSuccess('Employee records synchronized with backend database.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch {
      setActionError('Failed to synchronize employees from backend.');
      setTimeout(() => setActionError(''), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Status Change Confirmation Execution
  const handleExecuteStatusToggle = async () => {
    if (!confirmStatusModalEmp) return;
    setIsTogglingStatus(true);
    setActionError('');

    const emp = confirmStatusModalEmp;
    const isCurrentlyActive = emp.status === 'active' || emp.isActive === true;
    const nextStatus = isCurrentlyActive ? 'inactive' : 'active';

    try {
      if (isCurrentlyActive) {
        const res = await deactivateEmployee(emp.id);
        if (res.success) {
          setActionSuccess(`Employee ${emp.firstName || ''} ${emp.lastName || emp.id} deactivated successfully.`);
        } else {
          setActionError(res.error || 'Failed to deactivate employee.');
        }
      } else {
        const res = await activateEmployee(emp.id);
        if (res.success) {
          setActionSuccess(`Employee ${emp.firstName || ''} ${emp.lastName || emp.id} activated successfully.`);
        } else {
          setActionError(res.error || 'Failed to activate employee.');
        }
      }
      setConfirmStatusModalEmp(null);
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err: any) {
      setActionError(err?.message || `Failed to change employee status to ${nextStatus}.`);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Password Reset Handling
  const openResetPasswordModal = (emp: Employee) => {
    setResetModalEmployee(emp);
    setNewPassword('password123');
    setConfirmPassword('password123');
    setShowPassword(true);
    setActionError('');
    setCopied(false);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
    let pass = 'Uma@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setConfirmPassword(pass);
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalEmployee) return;

    if (!newPassword || newPassword.length < 4) {
      setActionError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setActionError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmittingPassword(true);
    setActionError('');

    try {
      const result = await resetEmployeePassword(resetModalEmployee.id, newPassword);
      setActionSuccess(
        `✓ Password updated for ${resetModalEmployee.firstName} ${resetModalEmployee.lastName} (@${resetModalEmployee.username})! New password: "${newPassword}"`
      );
      setResetModalEmployee(null);
      setTimeout(() => setActionSuccess(''), 6000);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
            <User className="w-5 h-5 text-crm-brand-700" /> Employee & Staff Management
          </h1>
          <p className="text-xs text-[#70665F]">
            Central directory for staff identity, organization hierarchy, credentials, and granular ERP permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Synchronize employees from backend"
            className="p-2 border border-[#EBE3DB] rounded-xl hover:bg-[#FAF7F2] text-[#544B45] text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RefreshCw className={cn('w-4 h-4 text-crm-brand-700', isRefreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => {
              setEmployeeToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs ml-auto sm:ml-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#EBE3DB] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#70665F]">
            <span>Total Staff</span>
            <Users className="w-4 h-4 text-crm-brand-700" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{employees.length}</p>
          <span className="text-[10px] text-slate-500">Registered records</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#EBE3DB] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span>Active Accounts</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-800">{activeCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Authorized to login</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#EBE3DB] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-700">
            <span>Inactive Accounts</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-extrabold text-rose-800">{employees.length - activeCount}</p>
          <span className="text-[10px] text-rose-600 font-medium">Deactivated / Suspended</span>
        </div>

        <div
          onClick={() => setFilterReviewRequiredOnly(!filterReviewRequiredOnly)}
          className={cn(
            'p-3.5 rounded-xl border shadow-2xs space-y-1 cursor-pointer transition',
            reviewRequiredCount > 0
              ? filterReviewRequiredOnly
                ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-amber-50 border-amber-300 hover:bg-amber-100/60'
              : 'bg-white border-[#EBE3DB]'
          )}
        >
          <div className="flex items-center justify-between text-xs text-amber-800">
            <span className="font-bold">Review Required</span>
            <AlertTriangle className={cn('w-4 h-4 text-amber-600', reviewRequiredCount > 0 && 'animate-pulse')} />
          </div>
          <p className="text-xl font-extrabold text-amber-900">{reviewRequiredCount}</p>
          <span className="text-[10px] text-amber-700">
            {filterReviewRequiredOnly ? '✓ Filter applied (click to reset)' : 'Department transferred staff'}
          </span>
        </div>
      </div>

      {/* Review Required Alert Banner */}
      {reviewRequiredCount > 0 && !filterReviewRequiredOnly && (
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-bold">Permissions Review Required: </span>
              <span>
                {reviewRequiredCount} employee(s) were transferred to a new department and need their permissions matrix audited.
              </span>
            </div>
          </div>
          <button
            onClick={() => setFilterReviewRequiredOnly(true)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition shadow-2xs self-end sm:self-auto"
          >
            Show Transferred Staff
          </button>
        </div>
      )}

      {/* Action Notification Messages */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center justify-between animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold border border-rose-200 flex items-center justify-between animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#EBE3DB] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by employee name, ID (EMP-001), email, phone, username..."
              className="w-full pl-9 pr-8 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs text-[#544B45] font-semibold focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name || d.departmentName}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs text-[#544B45] font-semibold focus:outline-none font-mono"
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Designation Filter */}
          <select
            value={selectedDesignation}
            onChange={(e) => {
              setSelectedDesignation(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs text-[#544B45] font-semibold focus:outline-none"
          >
            <option value="all">All Designations</option>
            {availableDesignations.map((desig) => (
              <option key={desig} value={desig}>
                {desig}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs text-[#544B45] font-semibold focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery ||
            selectedDept !== 'all' ||
            selectedRole !== 'all' ||
            selectedStatus !== 'all' ||
            selectedDesignation !== 'all' ||
            filterReviewRequiredOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setSelectedRole('all');
                setSelectedStatus('all');
                setSelectedDesignation('all');
                setFilterReviewRequiredOnly(false);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="bg-white rounded-xl border border-[#EBE3DB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF7F2] text-[#544B45] font-bold border-b border-[#EBE3DB] select-none">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:bg-[#F3ECE4] transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Employee ID</span>
                    <ArrowUpDown className="w-3 h-3 text-[#70665F]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:bg-[#F3ECE4] transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Employee & Identity</span>
                    <ArrowUpDown className="w-3 h-3 text-[#70665F]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('department')}
                  className="py-3 px-4 cursor-pointer hover:bg-[#F3ECE4] transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department & Designation</span>
                    <ArrowUpDown className="w-3 h-3 text-[#70665F]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('role')}
                  className="py-3 px-4 cursor-pointer hover:bg-[#F3ECE4] transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role & Scope</span>
                    <ArrowUpDown className="w-3 h-3 text-[#70665F]" />
                  </div>
                </th>
                <th className="py-3 px-4">Contact Details</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:bg-[#F3ECE4] transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-[#70665F]" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]/60">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No staff records match your criteria.</p>
                    <p className="text-xs text-[#70665F] mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const isActive = emp.status === 'active' || emp.isActive === true;
                  const fullName =
                    `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.username;

                  const hasExplicitRestrictions =
                    Array.isArray(emp.explicitRestrictions) && emp.explicitRestrictions.length > 0;

                  return (
                    <tr key={emp.id} className="hover:bg-[#FAF7F2]/60 transition">
                      {/* ID & Flags */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-crm-brand-700 block">{emp.id}</span>
                        {emp.permissionsReviewRequired && (
                          <span
                            title="Transferred department: review permissions"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold mt-1 border border-amber-300"
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> Review
                          </span>
                        )}
                        {hasExplicitRestrictions && (
                          <span
                            title="Active explicit restrictions"
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-bold mt-1 border border-rose-200 ml-1"
                          >
                            🚫 Restricted
                          </span>
                        )}
                      </td>

                      {/* Employee Photo & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-crm-brand-100 text-crm-brand-800 font-bold text-xs flex items-center justify-center border border-crm-brand-200 flex-shrink-0">
                            {emp.firstName ? emp.firstName.slice(0, 1).toUpperCase() : emp.username?.slice(0, 1).toUpperCase() || 'U'}
                            {emp.lastName ? emp.lastName.slice(0, 1).toUpperCase() : ''}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{fullName}</span>
                            <span className="text-[11px] text-[#70665F] font-mono">@{emp.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department & Designation */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{emp.designation || 'Staff'}</span>
                        <span className="text-[11px] text-[#70665F]">
                          {emp.departmentName || emp.department || 'General'}
                        </span>
                      </td>

                      {/* Role & Scope */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-crm-brand-50 text-crm-brand-800 font-mono text-[10px] font-bold border border-crm-brand-200 block w-max">
                          {emp.roleName || emp.role || 'Staff'}
                        </span>
                        <span className="text-[10px] text-[#70665F] block mt-0.5 capitalize">
                          Scope: {emp.dataScope || 'own'}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          <span className="text-slate-600 block flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#70665F]" /> {emp.email || 'N/A'}
                          </span>
                          <span className="text-slate-600 block flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#70665F]" /> {emp.mobile || emp.phone || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-rose-500')} />
                          {emp.status || (isActive ? 'active' : 'inactive')}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => {
                              setEmployeeForProfile(emp);
                              setIsProfileModalOpen(true);
                            }}
                            title="View Full Staff Profile"
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-700" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEmployeeToEdit(emp);
                              setIsFormModalOpen(true);
                            }}
                            title="Edit Staff Member Details"
                            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 hover:border-blue-400 text-blue-700 transition shadow-2xs"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-700" />
                          </button>

                          {/* Manage Permissions */}
                          <button
                            onClick={() => {
                              setEmployeeForPermissions(emp);
                              setIsPermissionsModalOpen(true);
                            }}
                            title="Configure Granular RBAC Permissions Matrix"
                            className={cn(
                              'p-1.5 rounded-lg border transition shadow-2xs',
                              emp.permissionsReviewRequired
                                ? 'border-amber-300 bg-amber-100 text-amber-800 animate-pulse'
                                : 'border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-700'
                            )}
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => openResetPasswordModal(emp)}
                            title="Reset Password"
                            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 hover:border-amber-400 text-amber-600 transition shadow-2xs"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            onClick={() => setConfirmStatusModalEmp(emp)}
                            title={isActive ? 'Deactivate Employee Account' : 'Reactivate Employee Account'}
                            className={cn(
                              'p-1.5 rounded-lg border transition shadow-2xs',
                              isActive
                                ? 'border-gray-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600'
                                : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600'
                            )}
                          >
                            {isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 bg-[#FAF7F2] border-t border-[#EBE3DB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#544B45]">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-[#EBE3DB] rounded font-semibold focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>of {sortedEmployees.length} records</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded border border-[#EBE3DB] bg-white hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded border border-[#EBE3DB] bg-white hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT EMPLOYEE MODAL */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEmployeeToEdit(null);
        }}
        employeeToEdit={employeeToEdit}
        onSaved={(savedEmp) => {
          setActionSuccess(
            `Employee ${savedEmp.firstName || ''} ${savedEmp.lastName || savedEmp.id} (${savedEmp.id}) saved and persisted.`
          );
          setIsFormModalOpen(false);
          setEmployeeToEdit(null);
          setTimeout(() => setActionSuccess(''), 5000);
        }}
      />

      {/* GRANULAR PERMISSIONS MATRIX MODAL */}
      <PermissionMatrixModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setEmployeeForPermissions(null);
        }}
        employee={employeeForPermissions}
        onSaved={(updatedEmp) => {
          setActionSuccess(
            `RBAC permission matrix for ${updatedEmp.firstName || ''} ${updatedEmp.lastName || updatedEmp.id} successfully updated.`
          );
          setIsPermissionsModalOpen(false);
          setEmployeeForPermissions(null);
          setTimeout(() => setActionSuccess(''), 5000);
        }}
      />

      {/* READ-ONLY EMPLOYEE PROFILE MODAL */}
      <EmployeeProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setEmployeeForProfile(null);
        }}
        employee={employeeForProfile}
        onEdit={(emp) => {
          setIsProfileModalOpen(false);
          setEmployeeToEdit(emp);
          setIsFormModalOpen(true);
        }}
        onOpenPermissions={(emp) => {
          setIsProfileModalOpen(false);
          setEmployeeForPermissions(emp);
          setIsPermissionsModalOpen(true);
        }}
        onToggleStatus={(emp) => {
          setIsProfileModalOpen(false);
          setConfirmStatusModalEmp(emp);
        }}
        onResetPassword={(emp) => {
          setIsProfileModalOpen(false);
          openResetPasswordModal(emp);
        }}
      />

      {/* SENSITIVE ACTION CONFIRMATION MODAL: ACTIVATE / DEACTIVATE */}
      {confirmStatusModalEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0',
                  confirmStatusModalEmp.status === 'active' || confirmStatusModalEmp.isActive
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                )}
              >
                {confirmStatusModalEmp.status === 'active' || confirmStatusModalEmp.isActive ? (
                  <XCircle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#211B17]">
                  {confirmStatusModalEmp.status === 'active' || confirmStatusModalEmp.isActive
                    ? 'Confirm Account Deactivation'
                    : 'Confirm Account Reactivation'}
                </h3>
                <p className="text-xs text-[#70665F]">
                  Employee ID: <span className="font-mono font-bold text-slate-800">{confirmStatusModalEmp.id}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-[#544B45] leading-relaxed">
              {confirmStatusModalEmp.status === 'active' || confirmStatusModalEmp.isActive ? (
                <>
                  Are you sure you want to deactivate{' '}
                  <span className="font-bold text-slate-900">
                    {confirmStatusModalEmp.firstName} {confirmStatusModalEmp.lastName}
                  </span>{' '}
                  (@{confirmStatusModalEmp.username})? This will immediately revoke their ability to log into UmaERP and access assigned modules.
                </>
              ) : (
                <>
                  Are you sure you want to reactivate{' '}
                  <span className="font-bold text-slate-900">
                    {confirmStatusModalEmp.firstName} {confirmStatusModalEmp.lastName}
                  </span>{' '}
                  (@{confirmStatusModalEmp.username})? Their account credentials and assigned module permissions will be restored.
                </>
              )}
            </p>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isTogglingStatus}
                onClick={() => setConfirmStatusModalEmp(null)}
                className="px-4 py-2 bg-[#FAF7F5] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isTogglingStatus}
                onClick={handleExecuteStatusToggle}
                className={cn(
                  'px-4 py-2 text-white font-bold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50',
                  confirmStatusModalEmp.status === 'active' || confirmStatusModalEmp.isActive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {isTogglingStatus ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...
                  </>
                ) : confirmStatusModalEmp.status === 'active' || confirmStatusModalEmp.isActive ? (
                  'Yes, Deactivate Account'
                ) : (
                  'Yes, Reactivate Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {resetModalEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#211B17]">Reset Employee Password</h2>
                  <p className="text-[11px] text-[#70665F]">
                    {resetModalEmployee.firstName} {resetModalEmployee.lastName} ({resetModalEmployee.id})
                  </p>
                </div>
              </div>
              <button onClick={() => setResetModalEmployee(null)} className="text-[#70665F] hover:text-[#211B17] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSavePasswordReset} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Username / System Account</label>
                <input
                  type="text"
                  disabled
                  value={`@${resetModalEmployee.username || resetModalEmployee.id}`}
                  className="w-full px-3 py-2 bg-gray-100 border border-[#EBE3DB] rounded-lg text-[#70665F] font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[#544B45] font-semibold">New Password *</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPassword('password123');
                        setConfirmPassword('password123');
                      }}
                      className="text-[10px] text-crm-brand-700 hover:text-crm-brand-900 font-medium hover:underline"
                    >
                      Default (password123)
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-crm-brand-700 hover:text-crm-brand-900 font-medium flex items-center gap-0.5 hover:underline"
                    >
                      <Sparkles className="w-3 h-3" /> Generate Random
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full pl-3 pr-20 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono text-xs focus:outline-none focus:border-crm-brand-500"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      title="Copy to clipboard"
                      className="p-1 text-gray-400 hover:text-[#211B17] rounded"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      className="p-1 text-gray-400 hover:text-[#211B17] rounded"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Confirm New Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password..."
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono text-xs focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResetModalEmployee(null)}
                  className="px-4 py-2 bg-[#FAF7F5] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isSubmittingPassword ? 'Updating...' : 'Update & Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
