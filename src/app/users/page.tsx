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
} from 'lucide-react';

export default function UsersPage() {
  const { employees, updateEmployee, roles, departments, currentUser } = useERP();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    if (selectedRole !== 'all' && emp.roleId !== selectedRole) return false;
    if (selectedDept !== 'all' && emp.departmentId !== selectedDept) return false;
    return true;
  });

  const handleToggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === 'active' ? 'inactive' : 'active';
    updateEmployee(emp.id, { status: nextStatus });
    setActionSuccess(`Employee ${emp.firstName} marked as ${nextStatus?.toUpperCase()}`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleResetPassword = (emp: Employee) => {
    updateEmployee(emp.id, { password: 'password123' });
    setActionSuccess(`Default password ('password123') set for ${emp.firstName} ${emp.lastName}`);
    setTimeout(() => setActionSuccess(''), 3000);
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
          <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#211B17] font-bold text-xs flex items-center justify-center">
            {emp.firstName.slice(0, 1)}{emp.lastName.slice(0, 1)}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-[#211B17] block">{emp.firstName} {emp.lastName}</span>
            <span className="text-[10px] text-[#70665F] font-mono">@{emp.username}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & Designation',
      cell: (emp) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-[#544B45] block">{emp.designation}</span>
          <span className="text-[11px] text-[#70665F]">{emp.departmentName}</span>
        </div>
      ),
    },
    {
      header: 'Role & Hierarchy',
      cell: (emp) => (
        <div>
          <span className="px-2 py-0.5 rounded bg-crm-brand- dark:bg-crm-brand-/60 text-crm-brand-800 dark:text-crm-brand- font-mono text-[10px] font-bold border border-crm-brand- dark:border-crm-brand- block w-max">
            {emp.roleName}
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
          <span className="text-slate-600 dark:text-[#70665F] block flex items-center gap-1">
            <Mail className="w-3 h-3 text-[#70665F]" /> {emp.email}
          </span>
          <span className="text-slate-600 dark:text-[#70665F] block flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#70665F]" /> {emp.mobile}
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
            onClick={() => handleToggleStatus(emp)}
            title={emp.status === 'active' ? 'Deactivate Employee' : 'Activate Employee'}
            className="p-1 rounded border border-slate-200 hover:bg-slate-100 dark:border-[#EBE3DB] dark:hover:bg-[#FAF7F2] text-slate-600 dark:text-[#544B45]"
          >
            {emp.status === 'active' ? <XCircle className="w-3.5 h-3.5 text-rose-500" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
          </button>
          <button
            onClick={() => handleResetPassword(emp)}
            title="Reset Password to default"
            className="p-1 rounded border border-slate-200 hover:bg-slate-100 dark:border-[#EBE3DB] dark:hover:bg-[#FAF7F2] text-slate-600 dark:text-[#544B45]"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17]">Users & Employee Master</h1>
          <p className="text-xs text-[#70665F]">
            Manage organizational staff, roles, reporting managers, and credentials.
          </p>
        </div>

        <Link
          href="/users/new"
          className="px-4 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200">
          {actionSuccess}
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
              className="text-xs bg-white dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-[#544B45]"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs bg-white dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-[#544B45]"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  );
}
