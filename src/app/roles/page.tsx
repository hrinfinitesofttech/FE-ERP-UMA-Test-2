'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../context/ERPContext';
import { DataTable, Column } from '../../components/data/DataTable';
import { Role } from '../../types/crm';
import { ShieldCheck, Plus, Lock, CheckCircle2 } from 'lucide-react';

export default function RolesPage() {
  const { roles, addRole } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    addRole({
      name,
      description,
      isSystem: false,
      permissions: [
        { module: 'CRM', page: 'Leads', view: true, create: true, edit: true, delete: false, approve: false, reject: false, assign: false, export: true, print: true },
        { module: 'CRM', page: 'Quotations', view: true, create: true, edit: false, delete: false, approve: false, reject: false, assign: false, export: true, print: true },
      ],
    });
    setName('');
    setDescription('');
    setShowModal(false);
  };

  const columns: Column<Role>[] = [
    {
      header: 'Role Name',
      cell: (role) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-[#211B17] block font-mono">{role.name}</span>
          <span className="text-[11px] text-[#70665F]">{role.description}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (role) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
            role.isSystem
              ? 'bg-slate-100 text-slate-800 border border-slate-300'
              : 'bg-crm-brand- text-crm-brand-800 border border-crm-brand-'
          }`}
        >
          {role.isSystem ? 'SYSTEM DEFINED' : 'CUSTOM ROLE'}
        </span>
      ),
    },
    {
      header: 'Privilege Matrix',
      cell: (role) => (
        <Link
          href="/permissions"
          className="text-crm-brand-700 hover:underline font-semibold text-xs flex items-center gap-1"
        >
          <Lock className="w-3 h-3" />
          <span>Configure Matrix ({role.permissions.length} modules)</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-crm-brand-700" />
            Role & Authorization Management
          </h1>
          <p className="text-xs text-[#70665F]">
            Configure system roles, department portfolios, and granular access rules for family members and employees.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Role</span>
        </button>
      </div>

      <DataTable
        title="Configured ERP Roles"
        subtitle="Roles govern access across CRM, Project, Production, Purchase, Store & Accounts"
        columns={columns}
        data={roles}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-xl w-full max-w-md p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17]">Create Custom System Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Senior Estimation Engineer"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Role responsibilities and department scope..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
