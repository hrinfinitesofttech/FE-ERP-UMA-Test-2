'use client';

import React, { useState } from 'react';
import {
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Check,
  Briefcase,
  Layers,
  Clock,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { Employee } from '../../types/crm';
import { cn } from '../../lib/utils';
import { ERP_MODULES } from './PermissionMatrixModal';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEdit?: (employee: Employee) => void;
  onOpenPermissions?: (employee: Employee) => void;
  onToggleStatus?: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
}

export function EmployeeProfileModal({
  isOpen,
  onClose,
  employee,
  onEdit,
  onOpenPermissions,
  onToggleStatus,
  onResetPassword,
}: EmployeeProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'access' | 'employment'>('overview');

  if (!isOpen || !employee) return null;

  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name || employee.username;
  const isSuperAdmin =
    employee.roleType === 'super_admin' ||
    employee.roleName === 'Super Admin' ||
    employee.role === 'Super Admin' ||
    employee.username === 'admin';
  const isAdmin =
    employee.roleType === 'admin' ||
    employee.roleName?.toLowerCase().includes('admin') ||
    employee.role?.toLowerCase().includes('admin');
  const isDeptManager =
    employee.roleType === 'department_manager' ||
    employee.roleName?.toLowerCase().includes('manager') ||
    employee.designation?.toLowerCase().includes('manager');

  const isActive = employee.status === 'active' || employee.isActive === true;

  const explicitRestrictions = Array.isArray(employee.explicitRestrictions)
    ? employee.explicitRestrictions
    : [];

  const assignedModules = Array.isArray(employee.assignedModules)
    ? employee.assignedModules
    : [];

  const formatScope = (scope?: string) => {
    switch (scope) {
      case 'all':
        return 'All Company Records (Full Scope)';
      case 'department':
        return 'Department Records Only';
      case 'assigned':
        return 'Assigned Records Only';
      case 'own':
      default:
        return 'Own Records Only (Strict Self)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-crm-brand-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-crm-brand-600 to-amber-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 flex-shrink-0">
              {employee.firstName ? employee.firstName.slice(0, 1).toUpperCase() : employee.username?.slice(0, 1).toUpperCase() || 'U'}
              {employee.lastName ? employee.lastName.slice(0, 1).toUpperCase() : ''}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-md bg-white/15 text-white font-mono text-xs font-bold border border-white/20">
                  {employee.id}
                </span>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1',
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-emerald-400' : 'bg-rose-400')} />
                  {employee.status || 'Active'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span className="font-mono text-amber-300 font-medium">@{employee.username}</span>
                <span>•</span>
                <span>{employee.designation || 'Staff Member'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  {employee.departmentName || employee.department || 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Department Transfer / Review Banner */}
          {employee.permissionsReviewRequired && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-bold text-amber-300">Permissions Review Required</p>
                <p className="text-[11px] text-amber-200/90">
                  This employee was recently transferred from{' '}
                  <span className="font-semibold text-white">
                    {employee.previousDepartmentName || 'another department'}
                  </span>
                  . Please audit and save their granular permissions matrix.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EBE3DB] bg-[#FAF7F2] px-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'py-3 px-4 border-b-2 flex items-center gap-2 transition',
              activeTab === 'overview'
                ? 'border-crm-brand-700 text-crm-brand-700 font-extrabold bg-white'
                : 'border-transparent text-[#70665F] hover:text-[#211B17]'
            )}
          >
            <User className="w-4 h-4" /> Personal & Contact
          </button>
          <button
            onClick={() => setActiveTab('employment')}
            className={cn(
              'py-3 px-4 border-b-2 flex items-center gap-2 transition',
              activeTab === 'employment'
                ? 'border-crm-brand-700 text-crm-brand-700 font-extrabold bg-white'
                : 'border-transparent text-[#70665F] hover:text-[#211B17]'
            )}
          >
            <Briefcase className="w-4 h-4" /> Employment Details
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={cn(
              'py-3 px-4 border-b-2 flex items-center gap-2 transition',
              activeTab === 'access'
                ? 'border-crm-brand-700 text-crm-brand-700 font-extrabold bg-white'
                : 'border-transparent text-[#70665F] hover:text-[#211B17]'
            )}
          >
            <Shield className="w-4 h-4" /> RBAC & Permissions
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                  <h4 className="font-bold text-[#211B17] uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <User className="w-4 h-4 text-crm-brand-700" /> Identity Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[#70665F] text-[11px] block">Full Name</span>
                      <span className="font-semibold text-slate-800 text-sm">{fullName}</span>
                    </div>
                    <div>
                      <span className="text-[#70665F] text-[11px] block">System Username</span>
                      <span className="font-mono font-bold text-crm-brand-800">@{employee.username}</span>
                    </div>
                    <div>
                      <span className="text-[#70665F] text-[11px] block">Gender</span>
                      <span className="font-medium text-slate-800 capitalize">{employee.gender || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[#70665F] text-[11px] block">Date of Birth</span>
                      <span className="font-medium text-slate-800">{employee.dob || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                  <h4 className="font-bold text-[#211B17] uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Phone className="w-4 h-4 text-crm-brand-700" /> Contact Channels
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[#70665F] text-[11px] block">Email Address</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-[#70665F]" />
                        {employee.email || 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#70665F] text-[11px] block">Mobile / WhatsApp</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#70665F]" />
                        {employee.mobile || employee.phone || 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#70665F] text-[11px] block">Emergency Contact</span>
                      <span className="font-medium text-slate-800">{employee.emergencyContact || 'None recorded'}</span>
                    </div>
                    <div>
                      <span className="text-[#70665F] text-[11px] block">Residential Address</span>
                      <span className="font-medium text-slate-800 flex items-start gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#70665F] flex-shrink-0 mt-0.5" />
                        {employee.address || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login & Security Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-600" /> Account Security & Credentials
                  </h4>
                  <p className="text-[#70665F] text-[11px]">
                    Last login recorded:{' '}
                    <span className="font-semibold text-slate-700">{employee.lastLogin || 'Never logged in'}</span>
                  </p>
                  {employee.forcePasswordChange && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] mt-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Password reset required on next login
                    </span>
                  )}
                </div>

                {onResetPassword && (
                  <button
                    onClick={() => onResetPassword(employee)}
                    className="px-3.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Reset Password
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-2">
                  <span className="text-[#70665F] text-[11px] block">Assigned Department</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-crm-brand-700" />
                    {employee.departmentName || employee.department || 'General'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-2">
                  <span className="text-[#70665F] text-[11px] block">Designation</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-crm-brand-700" />
                    {employee.designation || 'Staff Member'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-2">
                  <span className="text-[#70665F] text-[11px] block">Reporting Manager</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-crm-brand-700" />
                    {employee.reportingManagerName || 'None (Direct / Head)'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-2">
                  <span className="text-[#70665F] text-[11px] block">Joining Date</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-crm-brand-700" />
                    {employee.joiningDate || employee.joinedDate || 'Not recorded'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-2">
                  <span className="text-[#70665F] text-[11px] block">Employment Type</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {employee.employmentType ? employee.employmentType.replace('_', ' ') : 'Full Time'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-2">
                  <span className="text-[#70665F] text-[11px] block">Branch & Work Location</span>
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-crm-brand-700" />
                    {employee.workLocation || 'Main Plant / Head Office'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-5">
              {/* Role & Scope Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1">
                  <span className="text-purple-800 text-[11px] font-bold uppercase tracking-wider block">
                    Assigned Role
                  </span>
                  <span className="text-sm font-extrabold text-purple-950 block">
                    {employee.roleName || employee.role || 'Staff'}
                  </span>
                  <span className="text-[11px] text-purple-700 block">
                    Role Tier:{' '}
                    <span className="font-mono font-bold capitalize">
                      {isSuperAdmin
                        ? 'Super Admin (Full Root)'
                        : isAdmin
                        ? 'Company Admin'
                        : isDeptManager
                        ? 'Department Manager'
                        : 'Standard Employee'}
                    </span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
                  <span className="text-blue-800 text-[11px] font-bold uppercase tracking-wider block">
                    Data Record Scope
                  </span>
                  <span className="text-sm font-extrabold text-blue-950 block">
                    {formatScope(employee.dataScope)}
                  </span>
                  <span className="text-[11px] text-blue-700 block">
                    Determines visibility for leads, orders, jobs, indents, and documents.
                  </span>
                </div>
              </div>

              {/* Special Permissions / Capabilities */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                <h4 className="font-bold text-[#211B17] uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-crm-brand-700" /> Operational Privileges
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div
                    className={cn(
                      'p-2.5 rounded-lg border flex items-center gap-2',
                      employee.canApproveLeaves
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    )}
                  >
                    {employee.canApproveLeaves ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span>Approve Leaves</span>
                  </div>

                  <div
                    className={cn(
                      'p-2.5 rounded-lg border flex items-center gap-2',
                      employee.canAssignTasks
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    )}
                  >
                    {employee.canAssignTasks ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span>Assign Tasks</span>
                  </div>

                  <div
                    className={cn(
                      'p-2.5 rounded-lg border flex items-center gap-2',
                      employee.canManageAttendance
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    )}
                  >
                    {employee.canManageAttendance ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span>Manage Attendance</span>
                  </div>

                  <div
                    className={cn(
                      'p-2.5 rounded-lg border flex items-center gap-2',
                      employee.canExportData
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    )}
                  >
                    {employee.canExportData ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span>Export Excel/CSV</span>
                  </div>
                </div>
              </div>

              {/* Explicit Restrictions Banner */}
              {explicitRestrictions.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <h4 className="font-bold text-rose-900 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Active Explicit Restrictions (Strict Overrides)
                  </h4>
                  <p className="text-[11px] text-rose-700">
                    These actions are explicitly forbidden and override any department or role grants:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {explicitRestrictions.map((restr: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-mono text-[11px] font-bold border border-rose-300 flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        <span>{restr}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned ERP Modules */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#211B17] uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-crm-brand-700" /> Authorized ERP Modules (
                    {assignedModules.length})
                  </h4>
                  {onOpenPermissions && (
                    <button
                      onClick={() => onOpenPermissions(employee)}
                      className="text-xs font-bold text-crm-brand-700 hover:text-crm-brand-800 hover:underline flex items-center gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" /> Open Granular Matrix
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ERP_MODULES.map((mod) => {
                    const isGranted = assignedModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        className={cn(
                          'p-2.5 rounded-lg border text-xs flex items-center justify-between',
                          isGranted
                            ? 'bg-white border-crm-brand-200 text-slate-800 font-semibold shadow-2xs'
                            : 'bg-gray-50/50 border-gray-100 text-gray-400 opacity-60'
                        )}
                      >
                        <span>{mod.name}</span>
                        {isGranted ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-gray-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#EBE3DB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(employee)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs',
                  isActive
                    ? 'border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700'
                    : 'border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                )}
              >
                {isActive ? (
                  <>
                    <XCircle className="w-4 h-4" /> Deactivate Account
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Reactivate Account
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenPermissions && (
              <button
                onClick={() => onOpenPermissions(employee)}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Sliders className="w-4 h-4" /> Manage Permissions
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(employee)}
                className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#EBE3DB] bg-white hover:bg-gray-100 text-[#544B45] text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
