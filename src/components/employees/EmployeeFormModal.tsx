'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AccessPicker } from './AccessPicker';
import {
  PAGE_REGISTRY,
  actionsFor,
  buildCustomPermissions,
  getPageGrants,
  modulesFromGrants,
  normalizeModuleId,
  type PageGrants,
} from '@/lib/pageRegistry';
import {
  UserPlus,
  Edit2,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Sliders,
  CreditCard,
  Building2,
} from 'lucide-react';
import { Employee, Department, Role } from '../../types/crm';
import { api } from '../../lib/apiClient';
import { cn } from '../../lib/utils';
import { useERP } from '../../context/ERPContext';
import { ERP_MODULES } from './PermissionMatrixModal';
import { CustomSelect } from '../ui/CustomSelect';
import { ERPDatePicker } from '../ui/ERPDatePicker';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null; // null if creating a new employee
  onSaved: (employee: Employee) => void;
  /** Open directly on a tab (e.g. 'access' from the permissions shortcut). */
  initialTab?: 'personal' | 'employment' | 'login' | 'access';
}

export function EmployeeFormModal({
  isOpen,
  onClose,
  employeeToEdit,
  onSaved,
  initialTab,
}: EmployeeFormModalProps) {
  const {
    currentUser,
    departments = [],
    roles = [],
    employees = [],
    addEmployee,
    updateEmployee,
  } = useERP();

  const isEditing = Boolean(employeeToEdit && employeeToEdit.id);
  const isSuperAdmin = currentUser?.roleType === 'super_admin' || currentUser?.roleName === 'Super Admin' || currentUser?.username === 'admin';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'login' | 'access'>('personal');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dob: '1995-01-01',
    mobile: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bankName: '',
    bankAccountNo: '',
    bankAccountName: '',
    bankIfsc: '',
    bankBranch: '',
    profilePhoto: '',
    departmentId: '',
    designation: 'Staff',
    roleId: '',
    roleType: 'employee' as 'employee' | 'department_manager' | 'admin' | 'super_admin',
    reportingManagerId: '',
    employmentType: 'full_time',
    status: 'active',
    workLocation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    username: '',
    password: 'password123',
    forcePasswordChange: false,
    dataScope: 'own' as 'own' | 'assigned' | 'department' | 'all',
    assignedModules: [] as string[],
    canAssignTasks: false,
    canApproveLeaves: false,
    canManageAttendance: false,
    canExportData: true,
  });

  const [initialDepartmentId, setInitialDepartmentId] = useState('');
  // Page-level access (modules -> pages -> actions)
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [pageGrants, setPageGrants] = useState<PageGrants>({});
  const [accessImported, setAccessImported] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Selected Department Details
  const selectedDepartment = useMemo(() => {
    return departments.find((d) => d.id === formData.departmentId || d.code?.toLowerCase() === formData.departmentId?.toLowerCase()) || departments[0] || null;
  }, [formData.departmentId, departments]);

  // Detect Department Change for existing employees
  const isDepartmentChanged = isEditing && initialDepartmentId && formData.departmentId && formData.departmentId !== initialDepartmentId;

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'personal');
      setServerError('');
      setErrors({});
      if (employeeToEdit) {
        setFormData({
          id: employeeToEdit.id || '',
          firstName: employeeToEdit.firstName || '',
          lastName: employeeToEdit.lastName || '',
          gender: (employeeToEdit.gender as any) || 'male',
          dob: employeeToEdit.dob || '',
          mobile: employeeToEdit.mobile || employeeToEdit.phone || '',
          phone: employeeToEdit.phone || employeeToEdit.mobile || '',
          email: employeeToEdit.email || '',
          address: employeeToEdit.address || '',
          emergencyContact: employeeToEdit.emergencyContact || '',
          bankName: (employeeToEdit as any).bankName || (employeeToEdit as any).bank_name || '',
          bankAccountNo: (employeeToEdit as any).bankAccountNo || (employeeToEdit as any).bank_account_no || '',
          bankAccountName: (employeeToEdit as any).bankAccountName || (employeeToEdit as any).bank_account_name || '',
          bankIfsc: (employeeToEdit as any).bankIfsc || (employeeToEdit as any).bank_ifsc || '',
          bankBranch: (employeeToEdit as any).bankBranch || (employeeToEdit as any).bank_branch || '',
          profilePhoto: employeeToEdit.profilePhoto || '',
          departmentId: employeeToEdit.departmentId || departments[0]?.id || 'dept-crm',
          designation: employeeToEdit.designation || 'Staff',
          roleId: employeeToEdit.roleId || roles[0]?.id || '',
          roleType: (employeeToEdit.roleType as any) || 'employee',
          reportingManagerId: employeeToEdit.reportingManagerId || '',
          employmentType: employeeToEdit.employmentType || 'full_time',
          status: employeeToEdit.status || 'active',
          workLocation: employeeToEdit.workLocation || '',
          joiningDate: employeeToEdit.joiningDate || new Date().toISOString().split('T')[0],
          username: employeeToEdit.username || '',
          password: '',
          forcePasswordChange: Boolean(employeeToEdit.forcePasswordChange),
          dataScope: (employeeToEdit.dataScope as any) || 'own',
          assignedModules: employeeToEdit.assignedModules || [],
          canAssignTasks: Boolean(employeeToEdit.canAssignTasks),
          canApproveLeaves: Boolean(employeeToEdit.canApproveLeaves),
          canManageAttendance: Boolean(employeeToEdit.canManageAttendance),
          canExportData: employeeToEdit.canExportData !== false,
        });
        setInitialDepartmentId(employeeToEdit.departmentId || '');

        // Load page-level access. Employees saved before this feature (no `pages`)
        // are imported once: their current modules become "all pages · view" (+ legacy actions).
        const existing = getPageGrants(employeeToEdit);
        if (existing) {
          setPageGrants(existing);
          setSelectedModules(modulesFromGrants(existing));
          setAccessImported(false);
        } else {
          const legacyMods = Array.from(
            new Set(((employeeToEdit.assignedModules as string[]) || []).map((m) => normalizeModuleId(m)))
          ).filter((m) => PAGE_REGISTRY.some((r) => r.id === m));
          const legacyPerms: Record<string, any> = (employeeToEdit as any).customPermissions || {};
          const imported: PageGrants = {};
          legacyMods.forEach((mid) => {
            const mod = PAGE_REGISTRY.find((r) => r.id === mid)!;
            const legacyActs: string[] = Array.isArray(legacyPerms[mid]) ? legacyPerms[mid] : [];
            mod.pages.forEach((pg) => {
              const allowed = actionsFor(pg) as string[];
              imported[pg.key] = Array.from(new Set(['view', ...legacyActs.filter((a) => allowed.includes(a))]));
            });
          });
          setPageGrants(imported);
          setSelectedModules(legacyMods);
          setAccessImported(legacyMods.length > 0);
        }
      } else {
        setPageGrants({});
        setSelectedModules([]);
        setAccessImported(false);
        // Initialize new employee with first department defaults
        const defaultDept = departments[0];
        setFormData({
          id: '',
          firstName: '',
          lastName: '',
          gender: 'male',
          dob: '',
          mobile: '',
          phone: '',
          email: '',
          address: '',
          emergencyContact: '',
          bankName: '',
          bankAccountNo: '',
          bankAccountName: '',
          bankIfsc: '',
          bankBranch: '',
          profilePhoto: '',
          departmentId: defaultDept?.id || 'dept-crm',
          designation: 'Sales Executive',
          roleId: roles[0]?.id || '',
          roleType: 'employee',
          reportingManagerId: employees[0]?.id || '',
          employmentType: 'full_time',
          status: 'active',
          workLocation: '',
          joiningDate: new Date().toISOString().split('T')[0],
          username: '',
          password: 'password123',
          forcePasswordChange: true,
          dataScope: 'own',
          assignedModules: [],
          canAssignTasks: false,
          canApproveLeaves: false,
          canManageAttendance: false,
          canExportData: true,
        });
        setInitialDepartmentId('');
      }
    }
  }, [isOpen, employeeToEdit, departments, roles, employees]);

  // Handle department change & trigger auto-seeding
  const handleDepartmentChange = (newDeptId: string) => {
    const dept = departments.find((d) => d.id === newDeptId || d.code?.toLowerCase() === newDeptId.toLowerCase());
    setFormData((prev) => ({
      ...prev,
      departmentId: newDeptId,
      // Modules are never auto-selected; admin picks them explicitly.
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const fn = formData.firstName.trim();
    if (!fn) errs.firstName = 'First name is required.';
    else if (!nameRegex.test(fn)) errs.firstName = 'Letters only.';
    else if (fn.length < 2) errs.firstName = 'At least 2 characters.';

    // Only First Name is mandatory. Everything else is optional,
    // but if a value IS entered it must still be well-formed.
    const ln = formData.lastName.trim();
    if (ln && !nameRegex.test(ln)) errs.lastName = 'Letters only.';

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile && cleanMobile.length !== 10) errs.mobile = 'Must be exactly 10 digits.';

    const em = formData.email.trim();
    if (em && !emailRegex.test(em)) errs.email = 'Valid email required (e.g. name@uma.com).';

    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    const cleanMobile = formData.mobile.replace(/\D/g, '').slice(0, 10);
    const dept = departments.find((d) => d.id === formData.departmentId);
    const mgr = employees.find((emp) => emp.id === formData.reportingManagerId);
    const role = roles.find((r) => r.id === formData.roleId);

    // Username is optional in the form: generate one from the first name if left blank
    const autoUsername =
      formData.username.trim() ||
      `${formData.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}${Date.now().toString().slice(-4)}`;

    const payload: any = {
      ...formData,
      username: autoUsername,
      mobile: cleanMobile,
      phone: cleanMobile,
      departmentName: dept?.name || '',
      department: dept?.name || '',
      reportingManagerName: mgr ? `${mgr.firstName} ${mgr.lastName}`.trim() : '',
      // Page-level access: authoritative `pages` + legacy module lists, and the modules actually granted
      customPermissions: buildCustomPermissions(pageGrants, (employeeToEdit as any)?.customPermissions),
      assignedModules: modulesFromGrants(pageGrants),
      roleName: role?.name || '',
      role: role?.name || '',
    };

    if (!payload.password) {
      delete payload.password;
    }

    try {
      if (isEditing && employeeToEdit?.id) {
        const res = await api.employees.update(employeeToEdit.id, payload);
        updateEmployee(employeeToEdit.id, res || payload);
        onSaved(res || payload);
        onClose();
      } else {
        const res = await api.employees.create(payload);
        addEmployee(res);
        onSaved(res);
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to save employee on backend:', err);
      let errorMsg = err?.message || 'Server error while saving employee.';
      if (err?.data && typeof err.data === 'object') {
        const details = Object.entries(err.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        if (details) errorMsg = details;
      }
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
    let pass = 'Uma@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!formData.password) return;
    navigator.clipboard.writeText(formData.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-crm-brand-900 text-white flex items-center justify-center font-bold shadow-xs">
              {isEditing ? <Edit2 className="w-5 h-5 text-crm-brand-300" /> : <UserPlus className="w-5 h-5 text-crm-brand-300" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {isEditing ? `Edit Employee Profile: ${employeeToEdit?.firstName} ${employeeToEdit?.lastName}` : 'Add New Employee'}
              </h2>
              <p className="text-xs text-stone-500">
                {isEditing ? `Employee ID: ${employeeToEdit?.id}` : 'Fill in personal, employment, authentication and access configuration details.'}
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

        {/* Section Tabs */}
        <div className="flex items-center gap-1 px-6 pt-2.5 border-b border-stone-200 bg-stone-50/50">
          {[
            { id: 'personal', label: '1. Personal Information' },
            { id: 'employment', label: '2. Employment & Dept' },
            { id: 'login', label: '3. Login & Credentials' },
            { id: 'access', label: '4. RBAC & Data Scope' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2',
                activeTab === tab.id
                  ? 'border-crm-brand-800 text-crm-brand-900 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Department Transfer Notice */}
          {isDepartmentChanged && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-crm-brand-600 flex-shrink-0" />
              <div>
                <strong>Department Transfer Warning:</strong> Changing this employee from <em>{employeeToEdit?.departmentName}</em> to <em>{selectedDepartment?.name}</em> will automatically reset department custom permissions and set the <code>permissions_review_required</code> flag.
              </div>
            </div>
          )}

          {/* SECTION 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Ramesh"
                  className={cn(
                    'w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700',
                    errors.firstName ? 'border-red-400 bg-red-50/50' : 'border-stone-300'
                  )}
                />
                {errors.firstName && <p className="text-[10px] text-red-500 mt-0.5">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Patel"
                  className={cn(
                    'w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700',
                    errors.lastName ? 'border-red-400 bg-red-50/50' : 'border-stone-300'
                  )}
                />
                {errors.lastName && <p className="text-[10px] text-red-500 mt-0.5">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mobile Number (10 digits)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g. 9825012345"
                  className={cn(
                    'w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700',
                    errors.mobile ? 'border-red-400 bg-red-50/50' : 'border-stone-300'
                  )}
                />
                {errors.mobile && <p className="text-[10px] text-red-500 mt-0.5">{errors.mobile}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. ramesh.patel@umatechnofab.com"
                  className={cn(
                    'w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700',
                    errors.email ? 'border-red-400 bg-red-50/50' : 'border-stone-300'
                  )}
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Gender</label>
                <CustomSelect
                  value={formData.gender}
                  onChange={(val) => setFormData({ ...formData, gender: val as any })}
                  options={[
                    { label: 'Male', value: 'male' },
                    { label: 'Female', value: 'female' },
                    { label: 'Other', value: 'other' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Date of Birth</label>
                <ERPDatePicker
                  value={formData.dob}
                  onChange={(val) => setFormData({ ...formData, dob: val })}
                  placeholder="Select Date of Birth..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. +91 98250 99887 (Father/Spouse)"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700',
                    errors.address ? 'border-red-400 bg-red-50/50' : 'border-stone-300'
                  )}
                />
                {errors.address && <p className="text-[10px] text-red-500 mt-0.5">{errors.address}</p>}
              </div>

              {/* Bank Account Details */}
              <div className="md:col-span-2 pt-3 border-t border-stone-200">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-crm-brand-700" />
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Bank Account Details (બેંક ખાતાની વિગતો)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. State Bank of India / HDFC Bank / BOB"
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.bankAccountNo}
                      onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                      placeholder="e.g. 123456789012"
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.bankAccountName}
                      onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                      placeholder="e.g. Name as per bank passbook"
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.bankIfsc}
                      onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                      placeholder="e.g. SBIN0001234"
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700 font-mono uppercase"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Branch Name / City</label>
                    <input
                      type="text"
                      value={formData.bankBranch}
                      onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                      placeholder="e.g. Kalol Highway Branch, Gandhinagar"
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: EMPLOYMENT INFORMATION */}
          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>Employee ID</span>
                  {isEditing ? (
                    <span className="text-[10px] text-amber-800 font-semibold flex items-center gap-1 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                      <Lock className="w-2.5 h-2.5" /> Locked (View Only)
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400 font-normal">Auto-generated if blank</span>
                  )}
                </label>
                <input
                  type="text"
                  disabled={isEditing}
                  readOnly={isEditing}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g. EMP-009"
                  className={cn(
                    "w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden font-mono",
                    isEditing
                      ? "bg-stone-100 text-stone-600 cursor-not-allowed select-none font-bold"
                      : "focus:ring-2 focus:ring-crm-brand-700"
                  )}
                />
                {isEditing && (
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Permanent system employee ID — cannot be edited by any user.
                  </p>
                )}
              </div>

              <div>
                <CustomSelect
                  label="Assigned Department"
                  required
                  value={formData.departmentId}
                  onChange={(val) => handleDepartmentChange(val)}
                  options={departments.map((dept) => ({
                    value: dept.id,
                    label: `${dept.code} — ${dept.name}`,
                  }))}
                  searchable
                  placeholder="Select Department..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Job Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Sr. Production Supervisor"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700"
                />
              </div>

              <div>
                <CustomSelect
                  label="Reporting Manager"
                  value={formData.reportingManagerId}
                  onChange={(val) => setFormData({ ...formData, reportingManagerId: val })}
                  options={[
                    { value: '', label: 'No Direct Manager / Top Level' },
                    ...employees
                      .filter((emp) => emp.id !== formData.id)
                      .map((emp) => ({
                        value: emp.id,
                        label: `${emp.name || `${emp.firstName} ${emp.lastName}`} (${emp.id} - ${emp.departmentName || 'Staff'})`,
                      })),
                  ]}
                  searchable
                  placeholder="Select Reporting Manager..."
                />
              </div>

              <div>
                <CustomSelect
                  label="Employment Type"
                  value={formData.employmentType}
                  onChange={(val) => setFormData({ ...formData, employmentType: val })}
                  options={[
                    { value: 'full_time', label: 'Full Time Permanent' },
                    { value: 'contract', label: 'Contractual' },
                    { value: 'probation', label: 'Probationary Period' },
                  ]}
                />
              </div>

              <div>
                <ERPDatePicker
                  label="Joining Date"
                  value={formData.joiningDate}
                  onChange={(val) => setFormData({ ...formData, joiningDate: val })}
                />
              </div>

              <div>
                <CustomSelect
                  label="Account Status"
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={[
                    { value: 'active', label: 'Active (Full Access)' },
                    { value: 'inactive', label: 'Inactive (Deactivated)' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* SECTION 3: LOGIN & AUTHENTICATION */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    System Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. ramesh.patel"
                    className={cn(
                      'w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700 font-mono',
                      errors.username ? 'border-red-400 bg-red-50/50' : 'border-stone-300'
                    )}
                  />
                  {errors.username && <p className="text-[10px] text-red-500 mt-0.5">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isEditing ? 'New Password (Leave blank to keep current)' : 'Initial Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter minimum 6 characters"
                      className={cn(
                        'w-full px-3 py-2 pr-20 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700 font-mono',
                        errors.password ? 'border-red-400 bg-red-50/50' : 'border-stone-300'
                      )}
                    />
                    <div className="absolute right-2 top-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="p-1 text-stone-400 hover:text-crm-brand-700 rounded transition-colors"
                        title="Generate random password"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="p-1 text-stone-400 hover:text-crm-brand-700 rounded transition-colors"
                        title="Copy password"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  {errors.password && <p className="text-[10px] text-red-500 mt-0.5">{errors.password}</p>}
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.forcePasswordChange}
                    onChange={(e) => setFormData({ ...formData, forcePasswordChange: e.target.checked })}
                    className="w-4 h-4 text-crm-brand-700 rounded border-stone-300 focus:ring-crm-brand-600"
                  />
                  <span className="text-xs font-semibold text-stone-800">
                    Force password change on first login
                  </span>
                </label>
                <p className="text-[11px] text-stone-500 ml-6">
                  Recommended for newly created employees. The user will be required to choose a new private password upon their initial sign-in.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 4: ACCESS CONFIGURATION & DEPARTMENT DEFAULTS (PHASE 2.3) */}
          {activeTab === 'access' && (
            <div className="space-y-5">
              {accessImported && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-[11px] text-amber-800 leading-relaxed">
                  This employee's existing modules were imported as <strong>all pages · view</strong>. Review the pages
                  below and click <strong>Save Changes</strong> to switch them to page-level access.
                </div>
              )}

              <AccessPicker
                selectedModules={selectedModules}
                grants={pageGrants}
                onChange={({ selectedModules: sm, grants: g }) => {
                  setSelectedModules(sm);
                  setPageGrants(g);
                  setAccessImported(false);
                }}
              />


            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-crm-brand-800 hover:bg-crm-brand-900 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> {isEditing ? 'Save Changes' : 'Create Employee'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
