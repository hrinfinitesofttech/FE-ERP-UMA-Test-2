'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../context/ERPContext';
import { DataTable, Column } from '../../components/data/DataTable';
import { Role } from '../../types/crm';
import {
  ShieldCheck,
  Plus,
  Lock,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function RolesPage() {
  const { roles, addRole, updateRole, deleteRole } = useERP();

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Edit Modal State
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete Modal State
  const [confirmDeleteRole, setConfirmDeleteRole] = useState<Role | null>(null);
  const [isDeletingRole, setIsDeletingRole] = useState(false);

  // Notification States
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const isSystemRole = (role: Role) => {
    return (
      role.isSystem ||
      role.id === 'role-superadmin' ||
      role.id === 'role-super_admin' ||
      role.id === 'role-admin-family' ||
      role.id === 'role-crm-manager' ||
      role.id === 'role-crm-employee' ||
      role.name === 'Super Admin'
    );
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    addRole({
      name,
      description,
      isSystem: false,
      permissions: [
        { module: 'CRM', page: 'Leads', view: true, create: true, edit: true, delete: false, approve: false, reject: false, assign: false, export: true, print: true },
        { module: 'CRM', page: 'Quotations', view: true, create: true, edit: false, delete: false, approve: false, reject: false, assign: false, export: true, print: true },
      ],
    });
    setActionSuccess(`Role "${name}" created successfully.`);
    setName('');
    setDescription('');
    setShowModal(false);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const openEditModal = (role: Role) => {
    setEditRole(role);
    setEditName(role.name || '');
    setEditDescription(role.description || '');
  };

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRole) return;
    setActionError('');

    updateRole(editRole.id, {
      name: editName,
      description: editDescription,
    });

    setActionSuccess(`Role "${editName}" updated successfully.`);
    setEditRole(null);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const handleDeleteRole = async () => {
    if (!confirmDeleteRole) return;
    if (isSystemRole(confirmDeleteRole)) {
      setActionError('System defined roles cannot be deleted.');
      setConfirmDeleteRole(null);
      return;
    }

    setIsDeletingRole(true);
    setActionError('');

    try {
      const res = await deleteRole(confirmDeleteRole.id);
      if (res && res.success === false) {
        setActionError(res.error || 'Failed to delete role.');
      } else {
        setActionSuccess(`Role "${confirmDeleteRole.name}" deleted successfully.`);
      }
      setConfirmDeleteRole(null);
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err: any) {
      setActionError(err?.message || 'Error occurred while deleting role.');
    } finally {
      setIsDeletingRole(false);
    }
  };

  const columns: Column<Role>[] = [
    {
      header: 'Role Name',
      cell: (role) => (
        <div>
          <span className="font-bold text-slate-900 block font-mono">{role.name}</span>
          <span className="text-[11px] text-[#70665F]">{role.description}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (role) => (
        <span
          className={cn(
            'px-2 py-0.5 rounded text-[10px] font-bold font-mono',
            role.isSystem
              ? 'bg-slate-100 text-slate-800 border border-slate-300'
              : 'bg-crm-brand-50 text-crm-brand-800 border border-crm-brand-200'
          )}
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
          <span>Configure Matrix ({role.permissions?.length || 0} modules)</span>
        </Link>
      ),
    },
    {
      header: 'Actions',
      cell: (role) => {
        const isSystem = isSystemRole(role);
        return (
          <div className="flex items-center gap-1.5">
            {/* Edit Role Button */}
            <button
              onClick={() => openEditModal(role)}
              title="Edit Role Details"
              className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 hover:border-blue-400 text-blue-700 transition shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-700" />
            </button>

            {/* Delete Role Button */}
            <button
              onClick={() => setConfirmDeleteRole(role)}
              disabled={isSystem}
              title={isSystem ? 'System defined core roles cannot be deleted' : 'Delete Custom Role'}
              className={cn(
                'p-1.5 rounded-lg border transition shadow-2xs',
                isSystem
                  ? 'opacity-30 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                  : 'border-rose-200 bg-rose-50/60 hover:bg-rose-100 hover:border-rose-400 text-rose-600'
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
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

      {/* Action Notification Messages */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
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
        <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold border border-rose-200 flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <DataTable
        title="Configured ERP Roles"
        subtitle="Roles govern access across CRM, Project, Production, Purchase, Store & Accounts"
        columns={columns}
        data={roles}
      />

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-crm-brand-100 text-crm-brand-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#211B17]">Create Custom System Role</h3>
                  <p className="text-[11px] text-[#70665F]">Configure title and access scope</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Senior Estimation Engineer"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Role responsibilities and department scope..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#EBE3DB] rounded-lg hover:bg-[#FAF7F5] text-[#544B45] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#211B17]">Edit Role</h3>
                  <p className="text-[11px] text-[#70665F]">Update role title and description</p>
                </div>
              </div>
              <button onClick={() => setEditRole(null)} className="text-[#70665F] hover:text-[#211B17] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-3">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Role Title"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Role responsibilities and department scope..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditRole(null)}
                  className="px-4 py-2 border border-[#EBE3DB] rounded-lg hover:bg-[#FAF7F5] text-[#544B45] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md p-6 text-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#211B17]">Delete Role</h3>
                <p className="text-xs text-[#70665F]">Confirm permanent deletion of custom role</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Warning: Role Deletion</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Are you sure you want to permanently delete the custom role{' '}
                <span className="font-bold text-slate-900">{confirmDeleteRole.name}</span>?
                Staff members assigned this role will need to be assigned another role.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EBE3DB]">
              <button
                type="button"
                disabled={isDeletingRole}
                onClick={() => setConfirmDeleteRole(null)}
                className="px-4 py-2 border border-[#EBE3DB] rounded-lg hover:bg-[#FAF7F5] text-[#544B45] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingRole}
                onClick={handleDeleteRole}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingRole ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Yes, Delete Role
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
