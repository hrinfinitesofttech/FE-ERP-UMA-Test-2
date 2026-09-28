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

  const filteredEmployees = employees.filter((emp) => {
    if (selectedRole !== 'all' && emp.roleId !== selectedRole) return false;
    if (selectedDept !== 'all' && emp.departmentId !== selectedDept) return false;
    return true;
  });

  const handleToggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === 'active' ? 'inactive' : 'active';
    updateEmployee(emp.id, { status: nextStatus });
    setActionSuccess(`Employee ${emp.firstName} ${emp.lastName} status changed to ${nextStatus.toUpperCase()}`);
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
              {emp.firstName} {emp.lastName}
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
        <div className="flex items-center gap-2">
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
            Manage organizational staff, roles, reporting managers, credentials, and password resets.
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
              className="text-xs bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-[#544B45] focus:outline-none focus:border-crm-brand-500"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || d.departmentName}
                </option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-[#544B45] focus:outline-none focus:border-crm-brand-500"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name || (r as any).roleName}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Password Reset Modal */}
      {resetModalEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <KeyRound className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#211B17]">Reset Employee Password</h2>
                  <p className="text-[11px] text-[#70665F]">Set new login credentials for this staff member</p>
                </div>
              </div>
              <button
                onClick={() => setResetModalEmployee(null)}
                className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Employee Card Info */}
            <div className="p-3 bg-[#FAF7F5] border border-[#EBE3DB] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-crm-brand-100 text-crm-brand-800 font-bold flex items-center justify-center border border-crm-brand-200">
                  {resetModalEmployee.firstName?.slice(0, 1)}
                  {resetModalEmployee.lastName?.slice(0, 1)}
                </div>
                <div>
                  <div className="font-bold text-[#211B17]">
                    {resetModalEmployee.firstName} {resetModalEmployee.lastName}
                  </div>
                  <div className="text-[11px] text-[#70665F]">
                    Username: <span className="font-mono font-semibold text-crm-brand-700">@{resetModalEmployee.username}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#EBE3DB] text-[#544B45]">
                {resetModalEmployee.id}
              </span>
            </div>

            {actionError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSavePasswordReset} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#544B45] font-semibold">New Password *</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPassword('password123');
                        setConfirmPassword('password123');
                        setShowPassword(true);
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
