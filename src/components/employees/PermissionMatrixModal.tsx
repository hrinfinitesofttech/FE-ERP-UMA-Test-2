'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Check,
  X,
  AlertCircle,
  Eye,
  RefreshCw,
  Save,
  CheckCircle2,
  Sliders,
  Building,
  User,
  Plus,
  Trash2,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Employee, Department } from '../../types/crm';
import { api } from '../../lib/apiClient';
import { cn } from '../../lib/utils';
import { useERP } from '../../context/ERPContext';

export const ERP_MODULES = [
  { id: 'crm', name: 'CRM & Sales', desc: 'Leads, Enquiries, Quotations, Sales Orders' },
  { id: 'projects', name: 'Project Management', desc: 'Job 360, Milestones, Tasks, Costing' },
  { id: 'designer', name: 'Design & Engineering', desc: 'Drawings 2D/3D, CAD, Engineering BOM' },
  { id: 'purchase', name: 'Purchase & RFQ', desc: 'PR, Indents, RFQ, PO, Supplier Management' },
  { id: 'store', name: 'Store & Inventory', desc: 'GRN, Stock Balance, Material Issue, Returns' },
  { id: 'production', name: 'Production & Shopfloor', desc: 'Work Orders, Routing, WIP, Shift Logs' },
  { id: 'maintenance', name: 'Plant Maintenance', desc: 'Breakdown Logs, AMC Contracts, Service' },
  { id: 'hr', name: 'HR & Payroll', desc: 'Attendance, Leaves, Payroll, Appraisals' },
  { id: 'accounting', name: 'Accounts & Finance', desc: 'Invoices, Receipts, Payments, Ledgers' },
  { id: 'integration', name: 'Integration & Approvals', desc: 'Workflow Approvals, ERP Alerts, 360 Logs' },
  { id: 'reports', name: 'Reports & Analytics', desc: 'Executive Analytics, Audit Trail, Exports' },
  { id: 'settings', name: 'System Settings', desc: 'Company Profile, Numbering Rules, Security' },
];

export const RBAC_ACTIONS = [
  { id: 'view', label: 'View', short: 'View' },
  { id: 'create', label: 'Create', short: 'Create' },
  { id: 'edit', label: 'Edit', short: 'Edit' },
  { id: 'delete', label: 'Delete', short: 'Delete' },
  { id: 'approve', label: 'Approve', short: 'Approve' },
  { id: 'assign', label: 'Assign', short: 'Assign' },
  { id: 'update_status', label: 'Status', short: 'Status' },
  { id: 'export', label: 'Export', short: 'Export' },
  { id: 'print', label: 'Print', short: 'Print' },
  { id: 'manage_settings', label: 'Settings', short: 'Settings' },
];

interface PermissionMatrixModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedEmp: Employee) => void;
}

export function PermissionMatrixModal({
  employee,
  isOpen,
  onClose,
  onSaved,
}: PermissionMatrixModalProps) {
  const { currentUser, departments = [], updateEmployeePermissions, refreshCurrentUser } = useERP();

  const [activeTab, setActiveTab] = useState<'matrix' | 'restrictions' | 'scope' | 'preview'>('matrix');
  const [roleType, setRoleType] = useState<string>('employee');
  const [dataScope, setDataScope] = useState<string>('own');
  const [assignedModules, setAssignedModules] = useState<string[]>([]);
  const [customPermissions, setCustomPermissions] = useState<Record<string, string[]>>({});
  const [explicitRestrictions, setExplicitRestrictions] = useState<string[]>([]);
  const [canAssignTasks, setCanAssignTasks] = useState(false);
  const [canApproveLeaves, setCanApproveLeaves] = useState(false);
  const [canManageAttendance, setCanManageAttendance] = useState(false);
  const [canExportData, setCanExportData] = useState(true);

  const [effectivePreview, setEffectivePreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [newRestriction, setNewRestriction] = useState('');

  // Find department of this employee
  const employeeDept = useMemo(() => {
    if (!employee) return null;
    return departments.find((d) => d.id === employee.departmentId || d.code?.toLowerCase() === employee.departmentId?.toLowerCase()) || null;
  }, [employee, departments]);

  const isSuperAdmin = currentUser?.roleType === 'super_admin' || currentUser?.roleName === 'Super Admin' || currentUser?.username === 'admin';
  const isAdmin = isSuperAdmin || currentUser?.roleType === 'admin';
  const isEditingSelf = Boolean(employee && (employee.id === currentUser?.id || employee.username === currentUser?.username));

  useEffect(() => {
    if (employee && isOpen) {
      setRoleType(employee.roleType || 'employee');
      setDataScope(employee.dataScope || 'own');
      setAssignedModules(employee.assignedModules || (employeeDept?.assignedModules || []));
      setCustomPermissions(employee.customPermissions || (employeeDept?.defaultPermissions || {}));
      setExplicitRestrictions(Array.isArray(employee.explicitRestrictions) ? employee.explicitRestrictions : []);
      setCanAssignTasks(Boolean(employee.canAssignTasks));
      setCanApproveLeaves(Boolean(employee.canApproveLeaves));
      setCanManageAttendance(Boolean(employee.canManageAttendance));
      setCanExportData(employee.canExportData !== false);
      setSaveSuccess('');
      setSaveError('');

      fetchEffectivePermissions(employee.id);
    }
  }, [employee, isOpen, employeeDept]);

  const fetchEffectivePermissions = async (empId: string) => {
    setIsLoadingPreview(true);
    try {
      const eff = await api.employees.effectivePermissions(empId);
      setEffectivePreview(eff);
    } catch (err) {
      console.warn('Failed to load effective permissions preview:', err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  if (!isOpen || !employee) return null;

  // Determine if an action is restricted
  const isActionRestricted = (modKey: string, actionId: string) => {
    const target1 = `${modKey}:${actionId}`.toLowerCase();
    const target2 = `*:${actionId}`.toLowerCase();
    const target3 = `${modKey}:*`.toLowerCase();
    const target4 = `*:*`;
    return explicitRestrictions.some((r) => {
      const clean = String(r).trim().toLowerCase();
      return clean === target1 || clean === target2 || clean === target3 || clean === target4;
    });
  };

  // Check if granted by department defaults
  const isGrantedByDept = (modKey: string, actionId: string) => {
    if (!employeeDept?.defaultPermissions) return false;
    const actions = employeeDept.defaultPermissions[modKey] || [];
    return actions.includes(actionId);
  };

  // Check if granted in custom permissions
  const isGrantedCustom = (modKey: string, actionId: string) => {
    const actions = customPermissions[modKey] || [];
    return actions.includes(actionId);
  };

  const toggleCustomPermission = (modKey: string, actionId: string) => {
    if (isEditingSelf && !isSuperAdmin) {
      setSaveError('You cannot modify your own permissions.');
      return;
    }
    const currentActions = customPermissions[modKey] || [];
    let updatedActions: string[];
    if (currentActions.includes(actionId)) {
      updatedActions = currentActions.filter((a) => a !== actionId);
    } else {
      updatedActions = [...currentActions, actionId];
    }
    setCustomPermissions((prev) => ({
      ...prev,
      [modKey]: updatedActions,
    }));
  };

  const toggleModuleAssignment = (modKey: string) => {
    if (isEditingSelf && !isSuperAdmin) return;
    if (assignedModules.includes(modKey)) {
      setAssignedModules(assignedModules.filter((m) => m !== modKey));
    } else {
      setAssignedModules([...assignedModules, modKey]);
    }
  };

  const handleAddRestriction = (preset?: string) => {
    const val = (preset || newRestriction).trim();
    if (!val) return;
    if (explicitRestrictions.includes(val)) return;
    setExplicitRestrictions([...explicitRestrictions, val]);
    setNewRestriction('');
  };

  const handleRemoveRestriction = (item: string) => {
    setExplicitRestrictions(explicitRestrictions.filter((r) => r !== item));
  };

  const handleSave = async () => {
    if (isEditingSelf && !isSuperAdmin) {
      setSaveError('Security Policy: Employees and Administrators cannot modify their own permissions.');
      return;
    }

    if (roleType === 'super_admin' && !isSuperAdmin) {
      setSaveError('Security Policy: Only Super Admins can grant the Super Admin role.');
      return;
    }

    if (dataScope === 'all' && !isSuperAdmin && currentUser?.dataScope !== 'all') {
      setSaveError("Security Policy: You cannot grant 'all' data scope beyond your own authority.");
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    const payload = {
      roleType,
      dataScope,
      assignedModules,
      customPermissions,
      explicitRestrictions,
      permissionsReviewRequired: false,
      canAssignTasks,
      canApproveLeaves,
      canManageAttendance,
      canExportData,
    };

    try {
      const res = await updateEmployeePermissions(employee.id, payload);
      if (res.success) {
        setSaveSuccess(`✓ Permissions and RBAC policies successfully updated for ${employee.firstName} ${employee.lastName}.`);
        await fetchEffectivePermissions(employee.id);
        if (onSaved) {
          onSaved({
            ...employee,
            ...payload,
          });
        }
        if (isEditingSelf) {
          await refreshCurrentUser();
        }
      } else {
        setSaveError(res.error || 'Failed to update permissions.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Server error while saving permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-crm-brand-900 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6 text-crm-brand-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">
                  {employee.firstName} {employee.lastName}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-stone-200 text-stone-700">
                  {employee.id}
                </span>
                {employee.permissionsReviewRequired && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Dept Transfer: Review Required
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                {employee.designation || 'Staff'} • {employee.departmentName || employeeDept?.name || 'General'} • {employee.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner if Review is Required */}
        {employee.permissionsReviewRequired && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Department Transfer Detected:</strong> This employee was transferred from <em>{employee.previousDepartmentName || 'previous department'}</em> to <em>{employee.departmentName}</em>. Obsolete permissions were reset to department defaults. Please verify and save the updated configuration.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-stone-200 bg-stone-50/50">
          <button
            onClick={() => setActiveTab('matrix')}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2',
              activeTab === 'matrix'
                ? 'border-crm-brand-800 text-crm-brand-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Granular Permission Matrix
            </span>
          </button>
          <button
            onClick={() => setActiveTab('restrictions')}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2',
              activeTab === 'restrictions'
                ? 'border-crm-brand-800 text-crm-brand-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-600" /> Explicit Restrictions ({explicitRestrictions.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('scope')}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2',
              activeTab === 'scope'
                ? 'border-crm-brand-800 text-crm-brand-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Role, Scope & Capabilities
            </span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2',
              activeTab === 'preview'
                ? 'border-crm-brand-800 text-crm-brand-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" /> Effective Permissions Preview
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* TAB 1: GRANULAR PERMISSION MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-stone-700">Legend:</span>
                  <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium border border-blue-200">
                    <Building className="w-3 h-3" /> Dept Default
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                    <Check className="w-3 h-3" /> Custom Grant
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded font-medium border border-red-200">
                    <Lock className="w-3 h-3" /> Restricted
                  </span>
                </div>
                <div className="text-stone-500">
                  Department: <strong>{employeeDept?.name || 'General'}</strong> ({employeeDept?.assignedModules?.length || 0} Default Modules)
                </div>
              </div>

              {/* Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3 w-56">ERP Module</th>
                      <th className="py-2.5 px-2 text-center w-20">Assigned</th>
                      {RBAC_ACTIONS.map((act) => (
                        <th key={act.id} className="py-2.5 px-2 text-center" title={act.label}>
                          {act.short}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {ERP_MODULES.map((mod) => {
                      const isDeptAssigned = employeeDept?.assignedModules?.includes(mod.id);
                      const isModActive = assignedModules.includes(mod.id) || isDeptAssigned;

                      return (
                        <tr key={mod.id} className={cn('hover:bg-stone-50 transition-colors', !isModActive && 'opacity-60 bg-stone-50/40')}>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-stone-800">{mod.name}</div>
                            <div className="text-[10px] text-stone-400 truncate max-w-xs">{mod.desc}</div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleModuleAssignment(mod.id)}
                              className={cn(
                                'text-[11px] font-medium px-2 py-0.5 rounded transition-colors',
                                isModActive
                                  ? 'bg-crm-brand-100 text-crm-brand-900 border border-crm-brand-300'
                                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                              )}
                            >
                              {isModActive ? 'Active' : 'Off'}
                            </button>
                          </td>
                          {RBAC_ACTIONS.map((act) => {
                            const restricted = isActionRestricted(mod.id, act.id);
                            const deptDefault = isGrantedByDept(mod.id, act.id);
                            const custom = isGrantedCustom(mod.id, act.id);
                            const active = (deptDefault || custom) && !restricted;

                            return (
                              <td key={act.id} className="py-2 px-1 text-center">
                                {restricted ? (
                                  <div
                                    className="w-6 h-6 mx-auto rounded bg-red-100 border border-red-300 text-red-700 flex items-center justify-center cursor-not-allowed"
                                    title={`Explicitly Restricted: ${mod.id}:${act.id}`}
                                  >
                                    <Lock className="w-3 h-3" />
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => toggleCustomPermission(mod.id, act.id)}
                                    className={cn(
                                      'w-6 h-6 mx-auto rounded flex items-center justify-center transition-all',
                                      custom
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : deptDefault
                                        ? 'bg-blue-100 border border-blue-300 text-blue-800'
                                        : 'bg-stone-100 text-transparent hover:text-stone-300 hover:bg-stone-200'
                                    )}
                                    title={
                                      custom
                                        ? `Custom Grant: Click to revoke`
                                        : deptDefault
                                        ? `Department Default: Click to add custom override`
                                        : `Click to grant ${act.label} on ${mod.name}`
                                    }
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </button>
                                )}
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
          )}

          {/* TAB 2: EXPLICIT RESTRICTIONS */}
          {activeTab === 'restrictions' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50/60 border border-red-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-900 font-semibold text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Strict Override Policy</span>
                </div>
                <p className="text-xs text-red-700">
                  Explicit restrictions strictly supersede and revoke all permissions granted by Roles or Department Defaults. If an action or module is listed here, the employee is strictly denied access with HTTP 403.
                </p>
              </div>

              {/* Add restriction input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. crm:delete or *:export or production:approve"
                  value={newRestriction}
                  onChange={(e) => setNewRestriction(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleAddRestriction()}
                  className="px-3 py-2 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Restriction
                </button>
              </div>

              {/* Preset Quick Restriction Buttons */}
              <div>
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                  Quick Security Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Revoke CRM Delete', val: 'crm:delete' },
                    { label: 'Block All Data Exports', val: '*:export' },
                    { label: 'Revoke Production Approvals', val: 'production:approve' },
                    { label: 'Revoke Task Assignment', val: 'tasks:assign' },
                    { label: 'Block Settings Modifications', val: '*:manage_settings' },
                    { label: 'Block Finance/Accounts', val: 'accounting:*' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => handleAddRestriction(preset.val)}
                      className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-red-100 hover:text-red-800 text-stone-700 rounded-lg border border-stone-200 transition-colors"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Active Restrictions List */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Active Explicit Restrictions ({explicitRestrictions.length}):
                </label>
                {explicitRestrictions.length === 0 ? (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-center text-xs text-stone-400">
                    No explicit restrictions applied. Employee operates under standard department and role permissions.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {explicitRestrictions.map((r) => (
                      <div
                        key={r}
                        className="flex items-center justify-between p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2 text-red-900 font-mono font-medium">
                          <Lock className="w-3.5 h-3.5 text-red-600" />
                          <span>{r}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRestriction(r)}
                          className="p-1 text-red-400 hover:text-red-700 rounded transition-colors"
                          title="Remove this restriction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ROLE, DATA SCOPE & CAPABILITIES */}
          {activeTab === 'scope' && (
            <div className="space-y-6">
              {/* Role Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  System Role Profile
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    { id: 'employee', label: 'Department Employee', desc: 'Standard department execution' },
                    { id: 'department_manager', label: 'Department Manager', desc: 'Approvals & team delegation' },
                    { id: 'admin', label: 'Administrator', desc: 'Module & organizational management' },
                    { id: 'super_admin', label: 'Super Admin', desc: 'Unrestricted system control' },
                  ].map((role) => {
                    const disabled = role.id === 'super_admin' && !isSuperAdmin;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setRoleType(role.id)}
                        className={cn(
                          'p-3 text-left rounded-xl border transition-all',
                          roleType === role.id
                            ? 'bg-crm-brand-50 border-crm-brand-700 ring-2 ring-crm-brand-700/20'
                            : 'bg-white border-stone-200 hover:bg-stone-50',
                          disabled && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <div className="font-semibold text-xs text-stone-900">{role.label}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">{role.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data Scope Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Data Visibility Scope (Queryset Isolation)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    { id: 'own', label: 'Own Records', desc: 'Only records owned or created by employee' },
                    { id: 'assigned', label: 'Assigned Records', desc: 'Records explicitly assigned to employee' },
                    { id: 'department', label: 'Department Records', desc: 'All records in employee department' },
                    { id: 'all', label: 'All Company Records', desc: 'Global cross-department visibility' },
                  ].map((scope) => {
                    const disabled = scope.id === 'all' && !isSuperAdmin && currentUser?.dataScope !== 'all';
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setDataScope(scope.id)}
                        className={cn(
                          'p-3 text-left rounded-xl border transition-all',
                          dataScope === scope.id
                            ? 'bg-crm-brand-50 border-crm-brand-700 ring-2 ring-crm-brand-700/20'
                            : 'bg-white border-stone-200 hover:bg-stone-50',
                          disabled && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <div className="font-semibold text-xs text-stone-900">{scope.label}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">{scope.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Capability Toggles */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Special Operations & Authority Toggles
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      label: 'Task Assignment Permission',
                      desc: 'Allow delegating tasks and assigning jobs to department teammates',
                      checked: canAssignTasks,
                      setter: setCanAssignTasks,
                    },
                    {
                      label: 'Leave Approval Permission',
                      desc: 'Authorize approving/rejecting leave and WFH requests in department',
                      checked: canApproveLeaves,
                      setter: setCanApproveLeaves,
                    },
                    {
                      label: 'Attendance Management',
                      desc: 'Authorize regularizing missed punches and managing shift rosters',
                      checked: canManageAttendance,
                      setter: setCanManageAttendance,
                    },
                    {
                      label: 'Data Export Permission',
                      desc: 'Allow downloading CSV/Excel spreadsheets and sensitive exports',
                      checked: canExportData,
                      setter: setCanExportData,
                    },
                  ].map((cap, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={cap.checked}
                        onChange={(e) => cap.setter(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-crm-brand-700 rounded border-stone-300 focus:ring-crm-brand-600"
                      />
                      <div>
                        <div className="text-xs font-semibold text-stone-900">{cap.label}</div>
                        <div className="text-[11px] text-stone-500">{cap.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EFFECTIVE PERMISSIONS PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Computed Net Permissions Matrix (Backend Verified)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Calculated by resolving Department Defaults + Role Permissions + Custom Grants − Explicit Restrictions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchEffectivePermissions(employee.id)}
                  className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg hover:bg-stone-100 text-stone-700 flex items-center gap-1"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', isLoadingPreview && 'animate-spin')} /> Refresh
                </button>
              </div>

              {isLoadingPreview ? (
                <div className="p-8 text-center text-xs text-stone-400">Loading effective permissions matrix...</div>
              ) : effectivePreview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Effective Role</span>
                      <strong className="text-stone-800">{effectivePreview.role_type}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Data Scope</span>
                      <strong className="text-stone-800">{effectivePreview.data_scope}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Allowed Modules</span>
                      <strong className="text-stone-800">{effectivePreview.allowed_modules?.length || 0} Modules</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Active Restrictions</span>
                      <strong className="text-red-700">{effectivePreview.explicit_restrictions?.length || 0} Restrictions</strong>
                    </div>
                  </div>

                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                        <tr>
                          <th className="py-2 px-3">Module</th>
                          <th className="py-2 px-3">Authorized Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {Object.entries(effectivePreview.permissions_matrix || {}).map(([mod, actions]: any) => (
                          <tr key={mod} className="hover:bg-stone-50">
                            <td className="py-2 px-3 font-semibold text-stone-800 uppercase">{mod}</td>
                            <td className="py-2 px-3">
                              <div className="flex flex-wrap gap-1">
                                {actions.map((act: string) => (
                                  <span
                                    key={act}
                                    className="px-2 py-0.5 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-medium"
                                  >
                                    {act}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400">Preview not available.</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-stone-200 bg-stone-50">
          <div className="text-xs text-stone-500">
            {isEditingSelf && !isSuperAdmin ? (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Self-escalation blocked: You cannot modify your own permissions.
              </span>
            ) : (
              <span>Changes take effect immediately and are saved to the SQLite database.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving || (isEditingSelf && !isSuperAdmin)}
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-crm-brand-800 hover:bg-crm-brand-900 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
