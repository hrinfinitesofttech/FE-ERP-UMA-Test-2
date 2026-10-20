'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Trash2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmployeeFormModal } from '../../components/employees/EmployeeFormModal';
import { PermissionMatrixModal } from '../../components/employees/PermissionMatrixModal';
import { EmployeeProfileModal } from '../../components/employees/EmployeeProfileModal';
import { ERPListPageLayout } from '../../components/ui/ERPListPageLayout';
import { CustomSelect } from '../../components/ui/CustomSelect';

export default function UsersPage() {
  const {
    employees,
    roles,
    departments,
    currentUser,
    deleteEmployee,
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const prevEmpCountRef = React.useRef(employees.length);
  React.useEffect(() => {
    if (employees.length > prevEmpCountRef.current) {
      setCurrentPage(1);
    }
    prevEmpCountRef.current = employees.length;
  }, [employees.length]);

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

  // Permanent Delete Confirmation Modal State
  const [confirmDeleteModalEmp, setConfirmDeleteModalEmp] = useState<Employee | null>(null);
  const [isDeletingEmp, setIsDeletingEmp] = useState(false);

  // Password Reset Modal State
  const [resetModalEmployee, setResetModalEmployee] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mounting State to guarantee 0 hydration mismatches with SSR
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Available unique designations from employees
  const availableDesignations = useMemo(() => {
    const desigs = new Set<string>();
    const safeEmployees = Array.isArray(employees) ? employees : [];
    safeEmployees.forEach((emp) => {
      if (emp && emp.designation && emp.designation.trim()) desigs.add(emp.designation.trim());
    });
    return Array.from(desigs).sort();
  }, [employees]);

  // Review Required count
  const reviewRequiredCount = useMemo(() => {
    const safeEmployees = Array.isArray(employees) ? employees : [];
    return safeEmployees.filter((e) => e?.permissionsReviewRequired).length;
  }, [employees]);

  // Active / Inactive counts
  const activeCount = useMemo(() => {
    const safeEmployees = Array.isArray(employees) ? employees : [];
    return safeEmployees.filter((e) => e?.status === 'active' || e?.isActive === true).length;
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
        case 'id': {
          const empA = a as any;
          const empB = b as any;
          const timeA = empA.createdAt || empA.created_at || empA.date_joined || empA.joiningDate;
          const timeB = empB.createdAt || empB.created_at || empB.date_joined || empB.joiningDate;
          if (timeA && timeB && timeA !== timeB) {
            const dtA = new Date(timeA).getTime();
            const dtB = new Date(timeB).getTime();
            if (!isNaN(dtA) && !isNaN(dtB) && dtA !== dtB) {
              return sortOrder === 'asc' ? dtA - dtB : dtB - dtA;
            }
          }
          valA = a.id || '';
          valB = b.id || '';
          break;
        }
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

  const columns = [
    {
      key: 'id',
      header: 'EMPLOYEE ID',
      isCodeLink: true,
      onCodeClick: (emp: Employee) => {
        setEmployeeForProfile(emp);
        setIsProfileModalOpen(true);
      },
      cell: (emp: Employee) => (
        <div>
          <span className="font-mono font-semibold text-[#7C3AED] hover:underline cursor-pointer block">{emp.id}</span>
          {emp.permissionsReviewRequired && (
            <span
              title="Transferred department: review permissions"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold mt-0.5 border border-amber-300"
            >
              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> Review
            </span>
          )}
          {Array.isArray(emp.explicitRestrictions) && emp.explicitRestrictions.length > 0 && (
            <span
              title="Active explicit restrictions"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-bold mt-0.5 border border-rose-200"
            >
              <Lock className="w-2.5 h-2.5 text-rose-600" />
              <span>Restricted</span>
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'EMPLOYEE & IDENTITY',
      cell: (emp: Employee) => {
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.username;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7C3AED] font-bold text-xs flex items-center justify-center border border-purple-200 flex-shrink-0">
              {emp.firstName ? emp.firstName.slice(0, 1).toUpperCase() : emp.username?.slice(0, 1).toUpperCase() || 'U'}
              {emp.lastName ? emp.lastName.slice(0, 1).toUpperCase() : ''}
            </div>
            <div>
              <span className="font-semibold text-gray-900 block">{fullName}</span>
              <span className="text-[11px] text-gray-400 font-mono">@{emp.username}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'department',
      header: 'DEPARTMENT & DESIGNATION',
      cell: (emp: Employee) => (
        <div>
          <span className="font-semibold text-gray-800 block">{emp.designation || 'Staff'}</span>
          <span className="text-[11px] text-gray-500">{emp.departmentName || emp.department || 'General'}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'ROLE & SCOPE',
      cell: (emp: Employee) => (
        <div>
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold border border-purple-200 block w-max">
            {emp.roleName || emp.role || 'Staff'}
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5 capitalize">
            Scope: {emp.dataScope || 'own'}
          </span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'CONTACT DETAILS',
      cell: (emp: Employee) => (
        <div className="space-y-0.5 text-[11px]">
          <span className="text-gray-600 block flex items-center gap-1">
            <Mail className="w-3 h-3 text-gray-400" /> {emp.email || 'N/A'}
          </span>
          <span className="text-gray-600 block flex items-center gap-1">
            <Phone className="w-3 h-3 text-gray-400" /> {emp.mobile || emp.phone || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (emp: Employee) => {
        const isActive = emp.status === 'active' || emp.isActive === true;
        return (
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
        );
      },
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (emp: Employee) => {
        const isActive = emp.status === 'active' || emp.isActive === true;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => {
                setEmployeeForProfile(emp);
                setIsProfileModalOpen(true);
              }}
              title="View Full Staff Profile"
              className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setEmployeeToEdit(emp);
                setIsFormModalOpen(true);
              }}
              title="Edit Staff Member Details"
              className="p-1 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-800 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setEmployeeForPermissions(emp);
                setIsPermissionsModalOpen(true);
              }}
              title="Configure Granular RBAC Permissions Matrix"
              className={cn(
                'p-1 rounded transition cursor-pointer',
                emp.permissionsReviewRequired
                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                  : 'hover:bg-purple-50 text-purple-600 hover:text-purple-800'
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openResetPasswordModal(emp)}
              title="Reset Password"
              className="p-1 hover:bg-amber-50 rounded text-amber-600 hover:text-amber-800 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmStatusModalEmp(emp)}
              title={isActive ? 'Deactivate Employee Account' : 'Reactivate Employee Account'}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              {isActive ? <XCircle className="w-3.5 h-3.5 text-rose-500" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
            </button>
            <button
              onClick={() => setConfirmDeleteModalEmp(emp)}
              disabled={
                emp.username === 'admin' ||
                emp.id === 'EMP-001' ||
                emp.id === currentUser?.id ||
                emp.username === currentUser?.username
              }
              title={
                emp.username === 'admin' ||
                emp.id === 'EMP-001' ||
                emp.id === currentUser?.id ||
                emp.username === currentUser?.username
                  ? 'Cannot delete Root Super Admin or active session account'
                  : 'Delete Employee Record Permanently'
              }
              className={cn(
                'p-1 rounded transition cursor-pointer',
                emp.username === 'admin' ||
                emp.id === 'EMP-001' ||
                emp.id === currentUser?.id ||
                emp.username === currentUser?.username
                  ? 'opacity-30 cursor-not-allowed text-gray-400'
                  : 'hover:bg-rose-50 text-rose-600 hover:text-rose-800'
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  const handleExport = () => {
    if (employees.length === 0) return;
    const headers = ['Employee ID', 'Name', 'Username', 'Email', 'Phone', 'Department', 'Designation', 'Role', 'Status'];
    const rows = employees.map((emp) => [
      emp.id,
      `"${(`${emp.firstName || ''} ${emp.lastName || ''}`).trim() || emp.name || ''}"`,
      `"${emp.username || ''}"`,
      `"${emp.email || ''}"`,
      `"${emp.mobile || emp.phone || ''}"`,
      `"${emp.departmentName || emp.department || ''}"`,
      `"${emp.designation || ''}"`,
      `"${emp.roleName || emp.role || ''}"`,
      emp.status || (emp.isActive ? 'active' : 'inactive'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshEmployees(true);
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

  // Permanent Delete Employee Execution
  const handleExecuteDelete = async () => {
    if (!confirmDeleteModalEmp) return;
    if (
      confirmDeleteModalEmp.username === 'admin' ||
      confirmDeleteModalEmp.id === 'EMP-001' ||
      confirmDeleteModalEmp.id === currentUser?.id ||
      confirmDeleteModalEmp.username === currentUser?.username
    ) {
      setActionError('Cannot delete Root Super Admin or the currently logged-in account.');
      setConfirmDeleteModalEmp(null);
      return;
    }

    setIsDeletingEmp(true);
    setActionError('');
    try {
      const res = await deleteEmployee(confirmDeleteModalEmp.id);
      if (res && res.success === false) {
        setActionError(res.error || 'Failed to delete employee.');
      } else {
        setActionSuccess(
          `Employee ${confirmDeleteModalEmp.firstName || ''} ${confirmDeleteModalEmp.lastName || confirmDeleteModalEmp.id} (${confirmDeleteModalEmp.id}) deleted permanently.`
        );
      }
      setConfirmDeleteModalEmp(null);
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err: any) {
      setActionError(err?.message || 'An error occurred while deleting employee.');
    } finally {
      setIsDeletingEmp(false);
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
        `Password updated for ${resetModalEmployee.firstName} ${resetModalEmployee.lastName} (@${resetModalEmployee.username})! New password: "${newPassword}"`
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
          <p suppressHydrationWarning className="text-xl font-extrabold text-slate-900">{employees?.length || 0}</p>
          <span className="text-[10px] text-slate-500">Registered records</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#EBE3DB] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span>Active Accounts</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p suppressHydrationWarning className="text-xl font-extrabold text-emerald-800">{activeCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Authorized to login</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#EBE3DB] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-700">
            <span>Inactive Accounts</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p suppressHydrationWarning className="text-xl font-extrabold text-rose-800">{(employees?.length || 0) - activeCount}</p>
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
            {filterReviewRequiredOnly ? 'Filter active (click to reset)' : 'Department transferred staff'}
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

      {/* Department & Role Quick Filter Pills */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2.5">
        <CustomSelect
          size="sm"
          value={selectedDept}
          onChange={(val) => setSelectedDept(val)}
          searchable
          className="w-48"
          options={[
            { value: 'all', label: 'All Departments' },
            ...(isMounted && departments
              ? departments.map((d) => ({
                  value: d.id,
                  label: d.name || d.departmentName || '',
                }))
              : []),
          ]}
        />

        <CustomSelect
          size="sm"
          value={selectedRole}
          onChange={(val) => setSelectedRole(val)}
          searchable
          className="w-44"
          options={[
            { value: 'all', label: 'All Roles' },
            ...(isMounted && roles
              ? roles.map((r) => ({
                  value: r.id,
                  label: r.name,
                }))
              : []),
          ]}
        />

        <CustomSelect
          size="sm"
          value={selectedDesignation}
          onChange={(val) => setSelectedDesignation(val)}
          searchable
          className="w-48"
          options={[
            { value: 'all', label: 'All Designations' },
            ...(isMounted
              ? availableDesignations.map((desig) => ({
                  value: desig,
                  label: desig,
                }))
              : []),
          ]}
        />

        <CustomSelect
          size="sm"
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val)}
          className="w-36"
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active Only' },
            { value: 'inactive', label: 'Inactive Only' },
          ]}
        />

        {(selectedDept !== 'all' ||
          selectedRole !== 'all' ||
          selectedStatus !== 'all' ||
          selectedDesignation !== 'all' ||
          filterReviewRequiredOnly) && (
          <button
            onClick={() => {
              setSelectedDept('all');
              setSelectedRole('all');
              setSelectedStatus('all');
              setSelectedDesignation('all');
              setFilterReviewRequiredOnly(false);
            }}
            className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      <ERPListPageLayout<Employee>
        breadcrumbs={['DASHBOARD', 'SETTINGS', 'USERS & RBAC DIRECTORY']}
        columns={columns}
        data={filteredEmployees}
        addNewLabel="+ Add Employee"
        onAddNew={() => {
          setEmployeeToEdit(null);
          setIsFormModalOpen(true);
        }}
        onExport={handleExport}
        searchPlaceholder="Search by name, ID, email, username, phone..."
      />

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

      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {confirmDeleteModalEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#211B17]">Delete Employee Record</h3>
                <p className="text-xs text-[#70665F]">
                  Employee ID: <span className="font-mono font-bold text-slate-800">{confirmDeleteModalEmp.id}</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Warning: Irreversible Database Deletion</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-slate-900">
                  {confirmDeleteModalEmp.firstName} {confirmDeleteModalEmp.lastName}
                </span>{' '}
                (@{confirmDeleteModalEmp.username})? This action will remove their record from both the database and UmaERP system.
              </p>
            </div>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeletingEmp}
                onClick={() => setConfirmDeleteModalEmp(null)}
                className="px-4 py-2 bg-[#FAF7F5] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingEmp}
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingEmp ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Yes, Delete Permanently
                  </>
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
