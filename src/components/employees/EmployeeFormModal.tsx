'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Sliders
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
}

export function EmployeeFormModal({
  isOpen,
  onClose,
  employeeToEdit,
  onSaved,
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
    address: 'Plot No. 48/B, GIDC Industrial Estate, Makarpura, Vadodara, Gujarat',
    emergencyContact: '',
    profilePhoto: '',
    departmentId: '',
    designation: 'Staff',
    roleId: '',
    roleType: 'employee' as 'employee' | 'department_manager' | 'admin' | 'super_admin',
    reportingManagerId: '',
    employmentType: 'full_time',
    status: 'active',
    workLocation: 'Makarpura Plant, Vadodara',
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
      setServerError('');
      setErrors({});
      if (employeeToEdit) {
        setFormData({
          id: employeeToEdit.id || '',
          firstName: employeeToEdit.firstName || '',
          lastName: employeeToEdit.lastName || '',
          gender: (employeeToEdit.gender as any) || 'male',
          dob: employeeToEdit.dob || '1995-01-01',
          mobile: employeeToEdit.mobile || employeeToEdit.phone || '',
          phone: employeeToEdit.phone || employeeToEdit.mobile || '',
          email: employeeToEdit.email || '',
          address: employeeToEdit.address || 'Plot No. 48/B, GIDC Industrial Estate, Makarpura, Vadodara, Gujarat',
          emergencyContact: employeeToEdit.emergencyContact || '',
          profilePhoto: employeeToEdit.profilePhoto || '',
          departmentId: employeeToEdit.departmentId || departments[0]?.id || 'dept-crm',
          designation: employeeToEdit.designation || 'Staff',
          roleId: employeeToEdit.roleId || roles[0]?.id || '',
          roleType: (employeeToEdit.roleType as any) || 'employee',
          reportingManagerId: employeeToEdit.reportingManagerId || '',
          employmentType: employeeToEdit.employmentType || 'full_time',
          status: employeeToEdit.status || 'active',
          workLocation: employeeToEdit.workLocation || 'Makarpura Plant, Vadodara',
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
      } else {
        // Initialize new employee with first department defaults
        const defaultDept = departments[0];
        setFormData({
          id: '',
          firstName: '',
          lastName: '',
          gender: 'male',
          dob: '1995-01-01',
          mobile: '',
          phone: '',
          email: '',
          address: 'Plot No. 48/B, GIDC Industrial Estate, Makarpura, Vadodara, Gujarat',
          emergencyContact: '',
          profilePhoto: '',
          departmentId: defaultDept?.id || 'dept-crm',
          designation: 'Sales Executive',
          roleId: roles[0]?.id || '',
          roleType: 'employee',
          reportingManagerId: employees[0]?.id || '',
          employmentType: 'full_time',
          status: 'active',
          workLocation: 'Makarpura Plant, Vadodara',
          joiningDate: new Date().toISOString().split('T')[0],
          username: '',
          password: 'password123',
          forcePasswordChange: true,
          dataScope: 'own',
          assignedModules: defaultDept?.assignedModules || ['crm'],
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
    const deptModules = dept?.assignedModules || [];

    setFormData((prev) => ({
      ...prev,
      departmentId: newDeptId,
      // For new employee or switched department, align assigned modules with department defaults
      assignedModules: deptModules.length > 0 ? deptModules : prev.assignedModules,
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

    const ln = formData.lastName.trim();
    if (!ln) errs.lastName = 'Last name is required.';
    else if (!nameRegex.test(ln)) errs.lastName = 'Letters only.';

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!cleanMobile) errs.mobile = 'Mobile number is required.';
    else if (cleanMobile.length !== 10) errs.mobile = 'Must be exactly 10 digits.';

    const em = formData.email.trim();
    if (!em) errs.email = 'Email is required.';
    else if (!emailRegex.test(em)) errs.email = 'Valid email required (e.g. name@uma.com).';

    if (!formData.username.trim()) {
      errs.username = 'Username is required.';
    }

    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (formData.address.trim().length < 10) {
      errs.address = 'Address must be at least 10 characters long.';
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

    const payload: any = {
      ...formData,
      mobile: cleanMobile,
      phone: cleanMobile,
      departmentName: dept?.name || '',
      department: dept?.name || '',
      reportingManagerName: mgr ? `${mgr.firstName} ${mgr.lastName}`.trim() : '',
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
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
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
                  Last Name <span className="text-red-500">*</span>
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
                  Mobile Number (10 digits) <span className="text-red-500">*</span>
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
                  Email Address <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  value={formData.profilePhoto}
                  onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                  placeholder="e.g. /avatars/employee1.jpg"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Residential Address <span className="text-red-500">*</span>
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
            </div>
          )}

          {/* SECTION 2: EMPLOYMENT INFORMATION */}
          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Employee ID {isEditing ? '(Locked)' : '(Auto-generated if blank)'}
                </label>
                <input
                  type="text"
                  disabled={isEditing && !isSuperAdmin}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g. EMP-009"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700 font-mono disabled:bg-stone-100"
                />
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
                <label className="block text-xs font-semibold text-stone-700 mb-1">Work Location</label>
                <input
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  placeholder="e.g. Makarpura Heavy Works, Vadodara"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700"
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
              {/* Department Driven Defaults Card */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-crm-brand-700" />
                    <span className="text-xs font-bold text-stone-900">
                      Department-Driven Defaults: {selectedDepartment?.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                    Code: {selectedDepartment?.code}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Inherited Default Modules:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDepartment?.assignedModules?.length ? (
                      selectedDepartment.assignedModules.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-medium"
                        >
                          <Check className="w-3 h-3 text-blue-600" />
                          <span>{m} (Inherited)</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-400">No default modules defined for this department.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Modules Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Select Assigned Modules (Department Defaults + Custom Additions)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ERP_MODULES.map((mod) => {
                    const isInherited = selectedDepartment?.assignedModules?.includes(mod.id);
                    const isChecked = formData.assignedModules.includes(mod.id) || isInherited;

                    return (
                      <label
                        key={mod.id}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors',
                          isChecked ? 'bg-crm-brand-50/60 border-crm-brand-300 text-stone-900' : 'bg-white border-stone-200 text-stone-600'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (isInherited) return; // cannot uncheck inherited dept defaults here
                            if (e.target.checked) {
                              setFormData({ ...formData, assignedModules: [...formData.assignedModules, mod.id] });
                            } else {
                              setFormData({ ...formData, assignedModules: formData.assignedModules.filter((m) => m !== mod.id) });
                            }
                          }}
                          className="w-3.5 h-3.5 text-crm-brand-700 rounded border-stone-300"
                        />
                        <span className="truncate">{mod.name}</span>
                        {isInherited && (
                          <span className="ml-auto text-[9px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-medium">
                            Dept
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Role Type & Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <CustomSelect
                    label="Role Type"
                    value={formData.roleType}
                    onChange={(val) => setFormData({ ...formData, roleType: val as any })}
                    options={[
                      { value: 'employee', label: 'Department Employee' },
                      { value: 'department_manager', label: 'Department Manager' },
                      { value: 'admin', label: 'Administrator' },
                      ...(isSuperAdmin ? [{ value: 'super_admin', label: 'Super Admin' }] : []),
                    ]}
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Data Visibility Scope"
                    value={formData.dataScope}
                    onChange={(val) => setFormData({ ...formData, dataScope: val as any })}
                    options={[
                      { value: 'own', label: 'Own Records Only (Highest Isolation)' },
                      { value: 'assigned', label: 'Assigned Records (Assigned Tasks & Jobs)' },
                      { value: 'department', label: 'Department Records (All Team Records)' },
                      ...((isSuperAdmin || currentUser?.dataScope === 'all')
                        ? [{ value: 'all', label: 'All Company Records (Full Visibility)' }]
                        : []),
                    ]}
                  />
                </div>
              </div>

              {/* Operations Toggles */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">Authority Flags</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canAssignTasks}
                      onChange={(e) => setFormData({ ...formData, canAssignTasks: e.target.checked })}
                      className="w-3.5 h-3.5 text-crm-brand-700 rounded border-stone-300"
                    />
                    <span>Can Assign Tasks</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canApproveLeaves}
                      onChange={(e) => setFormData({ ...formData, canApproveLeaves: e.target.checked })}
                      className="w-3.5 h-3.5 text-crm-brand-700 rounded border-stone-300"
                    />
                    <span>Can Approve Leaves</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canManageAttendance}
                      onChange={(e) => setFormData({ ...formData, canManageAttendance: e.target.checked })}
                      className="w-3.5 h-3.5 text-crm-brand-700 rounded border-stone-300"
                    />
                    <span>Can Manage Attendance</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canExportData}
                      onChange={(e) => setFormData({ ...formData, canExportData: e.target.checked })}
                      className="w-3.5 h-3.5 text-crm-brand-700 rounded border-stone-300"
                    />
                    <span>Can Export Data</span>
                  </label>
                </div>
              </div>
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
