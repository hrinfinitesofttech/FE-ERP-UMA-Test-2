'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../components/ui/ERPListPageLayout';
import { Department } from '../../types/crm';
import {
  Building,
  Plus,
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  Edit2,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DepartmentsPage() {
  const { departments, addDepartment, updateDepartment, deleteDepartment, employees } = useERP();

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState(employees[0]?.id || '');
  const [description, setDescription] = useState('');

  // Edit Modal State
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editManagerId, setEditManagerId] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete Modal State
  const [confirmDeleteDept, setConfirmDeleteDept] = useState<Department | null>(null);
  const [isDeletingDept, setIsDeletingDept] = useState(false);

  // Notifications
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    const mgr = employees.find((emp) => emp.id === managerId);
    addDepartment({
      code,
      name,
      managerId,
      managerName: mgr ? `${mgr.firstName} ${mgr.lastName}` : 'Unassigned',
      description,
      status: 'active',
    });
    setCode('');
    setName('');
    setDescription('');
    setShowModal(false);
    setActionSuccess(`Department ${code} (${name}) created successfully.`);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const openEditModal = (dept: Department) => {
    setEditDept(dept);
    setEditCode(dept.code || '');
    setEditName(dept.name || '');
    setEditManagerId(dept.managerId || employees[0]?.id || '');
    setEditDescription(dept.description || '');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDept) return;
    setActionError('');

    const mgr = employees.find((emp) => emp.id === editManagerId);
    updateDepartment(editDept.id, {
      name: editName,
      managerId: editManagerId,
      managerName: mgr ? `${mgr.firstName} ${mgr.lastName}` : 'Unassigned',
      description: editDescription,
    });

    setActionSuccess(`Department ${editDept.code} (${editName}) updated successfully.`);
    setEditDept(null);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const handleDelete = async () => {
    if (!confirmDeleteDept) return;
    setIsDeletingDept(true);
    setActionError('');

    try {
      const res = await deleteDepartment(confirmDeleteDept.id);
      if (res && res.success === false) {
        setActionError(res.error || 'Failed to delete department.');
      } else {
        setActionSuccess(`Department ${confirmDeleteDept.code} (${confirmDeleteDept.name}) deleted successfully.`);
      }
      setConfirmDeleteDept(null);
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err: any) {
      setActionError(err?.message || 'Error occurred while deleting department.');
    } finally {
      setIsDeletingDept(false);
    }
  };

  const columns: ERPColumn<Department>[] = [
    {
      key: 'code',
      header: 'Code',
      isCodeLink: true,
      onCodeClick: (dept) => openEditModal(dept),
      cell: (dept) => (
        <span className="font-mono font-bold text-[#7C3AED] hover:underline cursor-pointer">
          {dept.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Department Name',
      cell: (dept) => (
        <div>
          <span className="font-bold text-slate-900 block">{dept.name}</span>
          <span className="text-[11px] text-slate-500">{dept.description}</span>
        </div>
      ),
    },
    {
      key: 'managerName',
      header: 'Department Head / Manager',
      cell: (dept) => (
        <span className="font-semibold text-slate-800">{dept.managerName || 'Unassigned'}</span>
      ),
    },
    {
      key: 'employeeCount',
      header: 'Active Staff',
      cell: (dept) => (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-700 font-bold text-[11px]">
          {dept.employeeCount || 0} Members
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (dept) => (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
            dept.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full', dept.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400')} />
          {dept.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (dept) => (
        <div className="flex items-center gap-1.5">
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => openEditModal(dept)}
            title="Edit Department Details"
            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition shadow-2xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Status Button */}
          <button
            type="button"
            onClick={() => {
              const newStatus = dept.status === 'active' ? 'inactive' : 'active';
              updateDepartment(dept.id, { status: newStatus });
              setActionSuccess(`Department ${dept.code} status changed to ${newStatus}.`);
              setTimeout(() => setActionSuccess(''), 4000);
            }}
            title={dept.status === 'active' ? 'Deactivate Department' : 'Activate Department'}
            className={cn(
              'p-1.5 rounded-lg border transition shadow-2xs cursor-pointer',
              dept.status === 'active'
                ? 'border-slate-200 hover:bg-rose-50 text-rose-600'
                : 'border-slate-200 hover:bg-emerald-50 text-emerald-600'
            )}
          >
            {dept.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setConfirmDeleteDept(dept)}
            title="Delete Department"
            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Notification Messages */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
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
          <button onClick={() => setActionError('')} className="text-rose-700 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Shasvatm ERP Standard List View */}
      <ERPListPageLayout<Department>
        breadcrumbs={['DASHBOARD', 'SETTINGS', 'DEPARTMENTS']}
        columns={columns}
        data={departments}
        addNewLabel="+ Add Custom Department"
        onAddNew={() => setShowModal(true)}
        onExport={() => {
          const csv = [
            ['Code', 'Department Name', 'Head / Manager', 'Active Staff', 'Status', 'Description'].join(','),
            ...departments.map(d => [
              `"${d.code}"`,
              `"${(d.name || '').replace(/"/g, '""')}"`,
              `"${(d.managerName || '').replace(/"/g, '""')}"`,
              d.employeeCount || 0,
              d.status || '',
              `"${(d.description || '').replace(/"/g, '""')}"`
            ].join(','))
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `departments_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        }}
        searchPlaceholder="Search departments by code, name, manager..."
      />

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-crm-brand-100 text-crm-brand-800 flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#211B17]">Add New Department</h3>
                  <p className="text-[11px] text-[#70665F]">Configure code, manager and workflow details</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value?.toUpperCase())}
                  placeholder="e.g. LOG"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono uppercase text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Logistics & Dispatch"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Assigned Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.designation || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Responsibilities of this department..."
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
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#211B17]">Edit Department</h3>
                  <p className="text-[11px] text-[#70665F]">Update name, manager and description</p>
                </div>
              </div>
              <button onClick={() => setEditDept(null)} className="text-[#70665F] hover:text-[#211B17] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Department Code</label>
                <input
                  type="text"
                  disabled
                  value={editCode}
                  className="w-full px-3 py-2 bg-gray-100 border border-[#EBE3DB] rounded-lg font-mono uppercase text-[#70665F] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Department Name"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Assigned Manager</label>
                <select
                  value={editManagerId}
                  onChange={(e) => setEditManagerId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.designation || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Responsibilities of this department..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditDept(null)}
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
      {confirmDeleteDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md p-6 text-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#211B17]">Delete Department</h3>
                <p className="text-xs text-[#70665F]">
                  Code: <span className="font-mono font-bold text-slate-800">{confirmDeleteDept.code}</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Warning: Irreversible Deletion</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Are you sure you want to permanently delete the department{' '}
                <span className="font-bold text-slate-900">{confirmDeleteDept.name}</span> ({confirmDeleteDept.code})?
                {confirmDeleteDept.employeeCount > 0 && (
                  <span className="block mt-1 font-semibold text-rose-800">
                    Note: There are currently {confirmDeleteDept.employeeCount} active staff member(s) listed under this department.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EBE3DB]">
              <button
                type="button"
                disabled={isDeletingDept}
                onClick={() => setConfirmDeleteDept(null)}
                className="px-4 py-2 border border-[#EBE3DB] rounded-lg hover:bg-[#FAF7F5] text-[#544B45] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingDept}
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingDept ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Yes, Delete Department
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
