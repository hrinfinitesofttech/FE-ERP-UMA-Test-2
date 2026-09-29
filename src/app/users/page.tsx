'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../context/ERPContext';
import { DataTable, Column } from '../../components/data/DataTable';
import { Employee } from '../../types/crm';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  KeyRound,
  Edit,
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
  MapPin,
  Briefcase,
} from 'lucide-react';

export default function UsersPage() {
  const { employees, updateEmployee, resetEmployeePassword, roles, departments, currentUser } = useERP();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Password Reset Modal State
  const [resetModalEmployee, setResetModalEmployee] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit Staff Profile Modal State
  const [editingStaff, setEditingStaff] = useState<Employee | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[a-zA-Z\s]+$/;

  const filteredEmployees = employees.filter((emp) => {
    if (selectedRole !== 'all' && emp.roleId !== selectedRole) return false;
    if (selectedDept !== 'all' && emp.departmentId !== selectedDept) return false;
    return true;
  });

  const handleToggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === 'active' ? 'inactive' : 'active';
    updateEmployee(emp.id, { status: nextStatus });
    setActionSuccess(`Employee ${emp.firstName || ''} ${emp.lastName || ''} status changed to ${nextStatus.toUpperCase()}`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const openResetPasswordModal = (emp: Employee) => {
    setResetModalEmployee(emp);
    setNewPassword('password123');
    setConfirmPassword('password123');
    setShowPassword(true);
    setActionError('');
    setCopied(false);
  };

  const openEditStaffModal = (emp: Employee) => {
    setEditingStaff({ ...emp });
    setEditErrors({});
  };

  const validateEditStaff = () => {
    if (!editingStaff) return false;
    const errs: Record<string, string> = {};

    const firstNameTrim = (editingStaff.firstName || '').trim();
    if (!firstNameTrim) {
      errs.firstName = 'First name is required.';
    } else if (!nameRegex.test(firstNameTrim)) {
      errs.firstName = 'First name can only contain letters.';
    } else if (firstNameTrim.length < 2) {
      errs.firstName = 'First name must be at least 2 characters.';
    } else if (firstNameTrim.length > 50) {
      errs.firstName = 'First name cannot exceed 50 characters.';
    }

    const lastNameTrim = (editingStaff.lastName || '').trim();
    if (!lastNameTrim) {
      errs.lastName = 'Last name is required.';
    } else if (!nameRegex.test(lastNameTrim)) {
      errs.lastName = 'Last name can only contain letters.';
    } else if (lastNameTrim.length < 2) {
      errs.lastName = 'Last name must be at least 2 characters.';
    } else if (lastNameTrim.length > 50) {
      errs.lastName = 'Last name cannot exceed 50 characters.';
    }

    const cleanMobile = (editingStaff.mobile || editingStaff.phone || '').replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobile = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      errs.mobile = 'Mobile number must be exactly 10 digits.';
    }

    const emailTrim = (editingStaff.email || '').trim();
    if (!emailTrim) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrim)) {
      errs.email = 'Enter a valid email with domain (e.g. employee@umatechnofab.com).';
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveStaffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !validateEditStaff()) return;

    setIsSavingEdit(true);
    const cleanMobile = (editingStaff.mobile || editingStaff.phone || '').replace(/\D/g, '').slice(0, 10);
    const dept = departments.find((d) => d.id === editingStaff.departmentId);
    const role = roles.find((r) => r.id === editingStaff.roleId);
    const mgr = employees.find((emp) => emp.id === editingStaff.reportingManagerId);

    const fullName = `${editingStaff.firstName || ''} ${editingStaff.lastName || ''}`.trim() || editingStaff.name || 'Staff';

    updateEmployee(editingStaff.id, {
      ...editingStaff,
      firstName: editingStaff.firstName?.trim(),
      lastName: editingStaff.lastName?.trim(),
      name: fullName,
      mobile: cleanMobile,
      phone: cleanMobile,
      email: editingStaff.email?.trim(),
      departmentName: dept?.name || editingStaff.departmentName || editingStaff.department || 'General',
      department: dept?.name || editingStaff.department || 'General',
      roleName: role?.name || editingStaff.roleName || editingStaff.role || 'Staff',
      role: role?.name || editingStaff.role || 'Staff',
      reportingManagerName: mgr ? `${mgr.firstName} ${mgr.lastName}` : editingStaff.reportingManagerName,
    });

    setActionSuccess(`✓ Staff profile for ${fullName} (ID: ${editingStaff.id}) updated successfully without creating duplicate records.`);
    setEditingStaff(null);
    setIsSavingEdit(false);
    setTimeout(() => setActionSuccess(''), 6000);
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

    setIsSubmitting(true);
    setActionError('');

    try {
      const result = await resetEmployeePassword(resetModalEmployee.id, newPassword);
      setActionSuccess(
        `✓ Password successfully updated for ${resetModalEmployee.firstName} ${resetModalEmployee.lastName} (@${resetModalEmployee.username})! New password: "${newPassword}"`
      );
      setResetModalEmployee(null);
      setTimeout(() => setActionSuccess(''), 6000);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Employee ID',
      accessorKey: 'id',
      cell: (emp) => <span className="font-mono font-bold text-crm-brand-700">{emp.id}</span>,
    },
    {
      header: 'Employee Name & Photo',
      cell: (emp) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-crm-brand-100 text-crm-brand-800 font-bold text-xs flex items-center justify-center border border-crm-brand-200">
            {emp.firstName ? emp.firstName.slice(0, 1) : emp.username?.slice(0, 1) || 'U'}
            {emp.lastName ? emp.lastName.slice(0, 1) : ''}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">
              {emp.firstName ? `${emp.firstName} ${emp.lastName || ''}` : emp.name || emp.username}
            </span>
            <span className="text-[10px] text-[#70665F] font-mono">@{emp.username}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & Designation',
      cell: (emp) => (
        <div>
          <span className="font-semibold text-slate-800 block">{emp.designation || 'Staff'}</span>
          <span className="text-[11px] text-[#70665F]">{emp.departmentName || emp.department || 'General'}</span>
        </div>
      ),
    },
    {
      header: 'Role & Hierarchy',
      cell: (emp) => (
        <div>
          <span className="px-2 py-0.5 rounded bg-crm-brand-50 text-crm-brand-800 font-mono text-[10px] font-bold border border-crm-brand-200 block w-max">
            {emp.roleName || emp.role || 'Staff'}
          </span>
          {emp.reportingManagerName && (
            <span className="text-[10px] text-[#70665F] block mt-0.5">Mgr: {emp.reportingManagerName}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Contact Info',
      cell: (emp) => (
        <div className="space-y-0.5 text-[11px]">
          <span className="text-slate-600 block flex items-center gap-1">
            <Mail className="w-3 h-3 text-[#70665F]" /> {emp.email || 'N/A'}
          </span>
          <span className="text-slate-600 block flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#70665F]" /> {emp.mobile || emp.phone || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (emp) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            emp.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {emp.status}
        </span>
      ),
    },
    {
      header: 'Last Login',
      cell: (emp) => <span className="text-[11px] text-[#70665F]">{emp.lastLogin || 'Never'}</span>,
    },
    {
      header: 'Actions',
      cell: (emp) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEditStaffModal(emp)}
            title="Edit Staff Member Details (Preserves ID)"
            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 hover:border-blue-400 text-blue-700 transition shadow-2xs"
          >
            <Edit2 className="w-4 h-4 text-blue-700" />
          </button>
          <button
            onClick={() => handleToggleStatus(emp)}
            title={emp.status === 'active' ? 'Click to Deactivate Employee' : 'Click to Activate Employee'}
            className={`p-1.5 rounded-lg border transition ${
              emp.status === 'active'
                ? 'border-gray-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600'
                : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600'
            }`}
          >
            {emp.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          <button
            onClick={() => openResetPasswordModal(emp)}
            title="Reset Password for this employee"
            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 hover:border-amber-400 text-amber-600 transition shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
            <User className="w-5 h-5 text-crm-brand-700" /> Users & Employee Master
          </h1>
          <p className="text-xs text-[#70665F]">
            Manage organizational staff, roles, reporting managers, credentials, and profile updates.
          </p>
        </div>

        <Link
          href="/users/new"
          className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Employees Table */}
      <DataTable
        title="Employee Directory"
        subtitle={`Total ${filteredEmployees.length} Registered Staff Members`}
        columns={columns}
        data={filteredEmployees}
        searchPlaceholder="Search by name, ID, username, email..."
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#544B45] font-semibold focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#544B45] font-semibold focus:outline-none font-mono"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* EDIT STAFF PROFILE MODAL (Preserves Employee ID & Updates Employee Master in place) */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <div>
                <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                  Edit Staff Profile
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-mono font-bold text-xs border border-blue-200">
                    Employee ID: {editingStaff.id}
                  </span>
                  <span className="text-[11px] text-[#70665F]">
                    (ID is permanently locked to prevent duplicate employee records)
                  </span>
                </div>
              </div>
              <button onClick={() => setEditingStaff(null)} className="text-[#70665F] hover:text-[#211B17] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffEdit} noValidate className="space-y-4 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">First Name (Letters only, max 50) *</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={editingStaff.firstName || ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                      setEditingStaff({ ...editingStaff, firstName: clean });
                      if (editErrors.firstName) setEditErrors((prev) => ({ ...prev, firstName: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] ${
                      editErrors.firstName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.firstName && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Last Name (Letters only, max 50) *</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={editingStaff.lastName || ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                      setEditingStaff({ ...editingStaff, lastName: clean });
                      if (editErrors.lastName) setEditErrors((prev) => ({ ...prev, lastName: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] ${
                      editErrors.lastName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.lastName && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Mobile (10 Digits) *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={editingStaff.mobile || editingStaff.phone || ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setEditingStaff({ ...editingStaff, mobile: clean, phone: clean });
                      if (editErrors.mobile) setEditErrors((prev) => ({ ...prev, mobile: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] font-mono ${
                      editErrors.mobile ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.mobile && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.mobile}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingStaff.email || ''}
                    onChange={(e) => {
                      setEditingStaff({ ...editingStaff, email: e.target.value });
                      if (editErrors.email) setEditErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] ${
                      editErrors.email ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.email && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Gender</label>
                  <select
                    value={editingStaff.gender || 'male'}
                    onChange={(e) => setEditingStaff({ ...editingStaff, gender: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Department & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#EBE3DB]">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Department</label>
                  <select
                    value={editingStaff.departmentId || departments[0]?.id}
                    onChange={(e) => {
                      const dept = departments.find((d) => d.id === e.target.value);
                      setEditingStaff({
                        ...editingStaff,
                        departmentId: e.target.value,
                        departmentName: dept?.name || dept?.departmentName || e.target.value,
                        department: dept?.name || dept?.departmentName || e.target.value,
                      });
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name || d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingStaff.designation || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                    placeholder="e.g. Sales Manager"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Assigned Role</label>
                  <select
                    value={editingStaff.roleId || roles[0]?.id}
                    onChange={(e) => {
                      const r = roles.find((role) => role.id === e.target.value);
                      setEditingStaff({
                        ...editingStaff,
                        roleId: e.target.value,
                        roleName: r?.name || e.target.value,
                        role: r?.name || e.target.value,
                      });
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] font-mono"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Reporting Manager</label>
                  <select
                    value={editingStaff.reportingManagerId || ''}
                    onChange={(e) => {
                      const mgr = employees.find((emp) => emp.id === e.target.value);
                      setEditingStaff({
                        ...editingStaff,
                        reportingManagerId: e.target.value,
                        reportingManagerName: mgr ? `${mgr.firstName} ${mgr.lastName}` : undefined,
                      });
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  >
                    <option value="">None (Top Level)</option>
                    {employees
                      .filter((e) => e.id !== editingStaff.id)
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.designation})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={editingStaff.joiningDate || editingStaff.joinedDate || ''}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        joiningDate: e.target.value,
                        joinedDate: e.target.value,
                      })
                    }
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Employment Type</label>
                  <select
                    value={editingStaff.employmentType || 'full_time'}
                    onChange={(e) => setEditingStaff({ ...editingStaff, employmentType: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  >
                    <option value="full_time">Full Time Regular</option>
                    <option value="contract">Contractor</option>
                    <option value="probation">Probationary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editingStaff.address || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, address: e.target.value })}
                  placeholder="Plot / House No, Street, City, State, Pincode"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 bg-[#FAF7F5] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isSavingEdit ? 'Saving Profile...' : 'Save & Update Staff Profile'}
                </button>
              </div>
            </form>
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Updating...' : 'Update & Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
