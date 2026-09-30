'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Building,
  Users,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  Layers,
  ArrowRight,
  X,
  AlertCircle,
  Search,
  Loader2,
} from 'lucide-react';
import { Department } from '../../../types/crm';

export default function DepartmentsPage() {
  const { departments, availableEmployees, addDepartment, updateDepartment, deleteDepartment, updateEmployee } = useERP();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [originalDept, setOriginalDept] = useState<Department | null>(null);
  const [viewStaffDept, setViewStaffDept] = useState<Department | null>(null);

  // Add Form State
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [selectedHodId, setSelectedHodId] = useState<string>('');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Edit Form State
  const [editStaffIds, setEditStaffIds] = useState<string[]>([]);
  const [originalEditStaffIds, setOriginalEditStaffIds] = useState<string[]>([]);
  const [editHodId, setEditHodId] = useState<string>('');
  const [editStaffSearchQuery, setEditStaffSearchQuery] = useState('');
  const [isEditStaffDropdownOpen, setIsEditStaffDropdownOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const deptNameRegex = /^[a-zA-Z0-9\s&/-]+$/;

  // Check if Add form has unsaved user inputs
  const isAddFormDirty = useMemo(() => {
    return (
      deptName.trim() !== '' ||
      deptCode.trim() !== '' ||
      description.trim() !== '' ||
      selectedStaffIds.length > 0 ||
      selectedHodId !== ''
    );
  }, [deptName, deptCode, description, selectedStaffIds, selectedHodId]);

  // Check if Edit form has changes compared to original
  const isEditFormDirty = useMemo(() => {
    if (!editingDept || !originalDept) return false;
    const nameChanged = (editingDept.departmentName || editingDept.name || '').trim() !== (originalDept.departmentName || originalDept.name || '').trim();
    const codeChanged = (editingDept.code || '').trim().toUpperCase() !== (originalDept.code || '').trim().toUpperCase();
    const statusChanged = (editingDept.status || 'active') !== (originalDept.status || 'active');
    const descChanged = (editingDept.description || '').trim() !== (originalDept.description || '').trim();
    const hodChanged = editHodId !== (originalDept.managerId || '');
    const staffChanged =
      editStaffIds.length !== originalEditStaffIds.length ||
      editStaffIds.some((id) => !originalEditStaffIds.includes(id));

    return nameChanged || codeChanged || statusChanged || descChanged || hodChanged || staffChanged;
  }, [editingDept, originalDept, editHodId, editStaffIds, originalEditStaffIds]);

  const openAddModal = () => {
    setDeptName('');
    setDeptCode('');
    setDescription('');
    setStatus('active');
    setSelectedStaffIds([]);
    setSelectedHodId('');
    setStaffSearchQuery('');
    setAddErrors({});
    setShowAddModal(true);
  };

  const closeAddModalWithConfirm = () => {
    if (isAddFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setShowAddModal(false);
        setAddErrors({});
      }
    } else {
      setShowAddModal(false);
      setAddErrors({});
    }
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(JSON.parse(JSON.stringify(dept)));
    setOriginalDept(JSON.parse(JSON.stringify(dept)));
    const deptNameKey = (dept.departmentName || dept.name || '').toLowerCase();
    const assigned = availableEmployees
      .filter((e) => (e.department || e.departmentName || '').toLowerCase() === deptNameKey)
      .map((e) => e.id);

    let hodId = dept.managerId || '';
    if (!hodId && dept.managerName) {
      const found = availableEmployees.find(
        (e) => (e.name || `${e.firstName || ''} ${e.lastName || ''}`).toLowerCase() === dept.managerName?.toLowerCase()
      );
      if (found) hodId = found.id;
    }
    if (!hodId && assigned.length > 0) {
      hodId = assigned[0];
    }

    const staffList = Array.from(new Set([...assigned, ...(hodId ? [hodId] : [])]));
    setEditStaffIds(staffList);
    setOriginalEditStaffIds(staffList);
    setEditHodId(hodId);
    setEditStaffSearchQuery('');
    setIsEditStaffDropdownOpen(false);
    setEditErrors({});
  };

  const closeEditModalWithConfirm = () => {
    if (isEditFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setEditingDept(null);
        setOriginalDept(null);
        setEditErrors({});
      }
    } else {
      setEditingDept(null);
      setOriginalDept(null);
      setEditErrors({});
    }
  };

  const validateAddForm = () => {
    const errs: Record<string, string> = {};
    const trimmedName = deptName.trim();
    if (!trimmedName) {
      errs.deptName = 'Please enter the department name.';
    } else if (trimmedName.length < 2 || trimmedName.length > 50 || !deptNameRegex.test(trimmedName)) {
      errs.deptName = 'The department name must be between 2 and 50 characters and cannot contain special characters.';
    } else if (departments.some(d => (d.departmentName || d.name || '').toLowerCase() === trimmedName.toLowerCase())) {
      errs.deptName = 'A department with this name already exists.';
    }

    const trimmedCode = deptCode.trim();
    if (trimmedCode && departments.some(d => (d.code || '').toUpperCase() === trimmedCode.toUpperCase())) {
      errs.deptCode = 'A department with this code already exists.';
    }

    if (selectedStaffIds.length === 0) {
      errs.staff = 'Please assign at least one staff member to the department.';
    }

    if (!selectedHodId) {
      errs.hod = 'Please select a department head from the assigned staff.';
    }

    if (!description.trim()) {
      errs.description = 'Please enter a description for the department.';
    }

    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEditForm = () => {
    if (!editingDept) return false;
    const errs: Record<string, string> = {};
    const trimmedName = (editingDept.departmentName || editingDept.name || '').trim();
    if (!trimmedName) {
      errs.departmentName = 'Please enter the department name.';
    } else if (trimmedName.length < 2 || trimmedName.length > 50 || !deptNameRegex.test(trimmedName)) {
      errs.departmentName = 'The department name must be between 2 and 50 characters and cannot contain special characters.';
    } else if (departments.some(d => d.id !== editingDept.id && (d.departmentName || d.name || '').toLowerCase() === trimmedName.toLowerCase())) {
      errs.departmentName = 'A department with this name already exists.';
    }

    if (editStaffIds.length === 0) {
      errs.staff = 'Please assign at least one staff member to the department.';
    }

    if (!editHodId) {
      errs.hod = 'Please select a department head from the assigned staff.';
    }

    if (!(editingDept.description || '').trim()) {
      errs.description = 'Please enter a description for the department.';
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddForm()) {
      setFeedbackMessage({
        type: 'error',
        text: 'The form could not be validated. Please check the details and submit again.',
      });
      return;
    }

    setIsSaving(true);
    setFeedbackMessage(null);

    const trimmedName = deptName.trim();
    const code = (deptCode.trim() || trimmedName.replace(/[^A-Za-z]/g, '').slice(0, 4)).toUpperCase();
    const hodEmp = availableEmployees.find((e) => e.id === selectedHodId);
    const hodName = hodEmp
      ? (hodEmp.name || `${hodEmp.firstName || ''} ${hodEmp.lastName || ''}`.trim() || 'HOD')
      : 'HOD';

    try {
      addDepartment({
        code,
        name: trimmedName,
        departmentName: trimmedName,
        managerId: selectedHodId || 'EMP-001',
        managerName: hodName,
        description: description.trim(),
        status,
        employeeCount: selectedStaffIds.length,
      });

      // Synchronize assigned staff members to the new department
      selectedStaffIds.forEach((empId) => {
        updateEmployee(empId, {
          department: trimmedName,
          departmentName: trimmedName,
        });
      });

      setFeedbackMessage({
        type: 'success',
        text: `The department "${trimmedName}" has been created and staff assigned successfully.`,
      });
      setDeptName('');
      setDeptCode('');
      setDescription('');
      setSelectedStaffIds([]);
      setSelectedHodId('');
      setStaffSearchQuery('');
      setAddErrors({});
      setShowAddModal(false);
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('duplicate') || msg.includes('already exists')) {
        setAddErrors((prev) => ({ ...prev, deptName: 'A department with this name already exists.' }));
        setFeedbackMessage({ type: 'error', text: 'A department with this name already exists.' });
      } else {
        setFeedbackMessage({ type: 'error', text: 'Something went wrong while creating the department. Please try again.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    if (!isEditFormDirty) {
      setFeedbackMessage({
        type: 'error',
        text: 'No changes were made to update.',
      });
      return;
    }

    if (!validateEditForm()) {
      setFeedbackMessage({
        type: 'error',
        text: 'The form could not be validated. Please check the details and submit again.',
      });
      return;
    }

    setIsUpdating(true);
    setFeedbackMessage(null);

    try {
      const trimmedName = (editingDept.departmentName || editingDept.name || '').trim();
      const trimmedCode = (editingDept.code || '').trim().toUpperCase();
      const hodEmp = availableEmployees.find((e) => e.id === editHodId);
      const hodName = hodEmp
        ? (hodEmp.name || `${hodEmp.firstName || ''} ${hodEmp.lastName || ''}`.trim() || 'HOD')
        : (editingDept.managerName || 'HOD');

      updateDepartment(editingDept.id, {
        ...editingDept,
        name: trimmedName,
        departmentName: trimmedName,
        code: trimmedCode,
        managerId: editHodId,
        managerName: hodName,
        description: (editingDept.description || '').trim(),
        status: editingDept.status || 'active',
        employeeCount: editStaffIds.length,
      });

      // Synchronize assigned staff members
      const oldDeptName = (originalDept?.departmentName || originalDept?.name || '').toLowerCase();

      // 1. Assign updated staff members
      editStaffIds.forEach((empId) => {
        updateEmployee(empId, {
          department: trimmedName,
          departmentName: trimmedName,
        });
      });

      // 2. Unassign removed staff members
      availableEmployees.forEach((emp) => {
        if (
          (emp.department || emp.departmentName || '').toLowerCase() === oldDeptName &&
          !editStaffIds.includes(emp.id)
        ) {
          updateEmployee(emp.id, {
            department: 'Unassigned',
            departmentName: 'Unassigned',
          });
        }
      });

      setFeedbackMessage({
        type: 'success',
        text: `Department "${trimmedName}" and staff assignments updated successfully.`,
      });
      setEditingDept(null);
      setOriginalDept(null);
      setEditErrors({});
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: 'Something went wrong while updating the department. Please try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete department "${name}"?`)) {
      deleteDepartment(id);
      if (viewStaffDept?.id === id) setViewStaffDept(null);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-crm-brand-500" />
            Departments Master (Integrated ERP Master)
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Single Source of Truth for Organizational Hierarchy, Department Managers & Staff Headcount
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Info Alert */}
      <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl flex items-center gap-3 text-xs text-cyan-900">
        <Shield className="w-5 h-5 text-crm-brand-500 flex-shrink-0" />
        <div>
          <span className="font-bold">ERP Integration Integrity Rule:</span> This page references the central ERP Department Master. All employee assignments across Production, Maintenance, Accounting, and Store synchronize with this hierarchy.
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const currentName = dept.departmentName || dept.name || '';
          const deptKey = currentName.toLowerCase();
          const deptEmployees = availableEmployees.filter(
            (e) => ((e.department || e.departmentName || '')?.toLowerCase()) === deptKey
          );

          return (
            <div
              key={dept.id}
              className="bg-white border border-[#EBE3DB] rounded-2xl p-5 hover:border-crm-brand-600/50 transition space-y-4 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-crm-brand-600/10 border border-crm-brand-600/20 flex items-center justify-center text-crm-brand-600 font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        dept.status === 'inactive'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      }`}
                    >
                      {dept.status === 'inactive' ? 'Inactive' : 'Active'}
                    </span>
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                      title="Edit Department & Staff Assignments"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id, currentName)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#211B17]">{currentName}</h3>
                  <p className="text-xs text-[#70665F] mt-0.5">{dept.description || 'No description provided'}</p>
                </div>

                <div className="border-t border-[#EBE3DB] pt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#544B45]">
                    <span className="text-[#70665F]">Department Manager (HOD):</span>
                    <span className="font-semibold text-[#211B17]">{dept.managerName || 'Assigned Lead'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#544B45]">
                    <span className="text-[#70665F]">Assigned Headcount:</span>
                    <span className="font-bold text-crm-brand-600">{deptEmployees.length} Staff</span>
                  </div>
                  <div className="flex justify-between items-center text-[#544B45]">
                    <span className="text-[#70665F]">Reporting Hierarchy:</span>
                    <span className="text-[#544B45]">General Manager → MD</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between text-xs">
                <span className="text-[#70665F] font-mono">Code: {dept.code || dept.id}</span>
                <button
                  onClick={() => setViewStaffDept(dept)}
                  className="text-crm-brand-600 hover:text-crm-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  View Staff ({deptEmployees.length}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD DEPARTMENT MODAL (With backdrop close and unsaved changes confirmation) */}
      {showAddModal && (
        <div
          onClick={closeAddModalWithConfirm}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Building className="w-5 h-5 text-crm-brand-600" />
                Add New Department
              </h2>
              <button
                type="button"
                onClick={closeAddModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} noValidate className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance / R&D"
                  value={deptName}
                  onChange={(e) => {
                    setDeptName(e.target.value);
                    if (addErrors.deptName) setAddErrors((prev) => ({ ...prev, deptName: '' }));
                    if (!deptCode) {
                      setDeptCode(e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase());
                    }
                  }}
                  className={`w-full bg-[#FAF7F2] border rounded-xl px-3 py-2 text-[#211B17] font-semibold focus:outline-none ${
                    addErrors.deptName ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-crm-brand-600'
                  }`}
                />
                {addErrors.deptName && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.deptName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Department Code</label>
                  <input
                    type="text"
                    placeholder="e.g. QA, RD, FIN"
                    value={deptCode}
                    onChange={(e) => {
                      setDeptCode(e.target.value.toUpperCase());
                      if (addErrors.deptCode) setAddErrors((prev) => ({ ...prev, deptCode: '' }));
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-crm-brand-600"
                  />
                  {addErrors.deptCode && (
                    <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {addErrors.deptCode}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Assign Staff Multi-Select (Searchable + Tags) */}
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">
                  Assign Staff (Multi-Select) *
                </label>

                {/* Selected Staff Tags */}
                {selectedStaffIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl">
                    {selectedStaffIds.map((id) => {
                      const emp = availableEmployees.find((e) => e.id === id);
                      const name = emp ? (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id) : id;
                      const desig = emp?.designation || emp?.role || 'Staff';
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EBE3DB] text-[11px] font-semibold text-[#211B17] shadow-sm"
                        >
                          <Users className="w-3 h-3 text-crm-brand-600" />
                          <span>{name}</span>
                          <span className="text-[10px] text-[#70665F]">({desig})</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStaffIds((prev) => {
                                const next = prev.filter((item) => item !== id);
                                if (next.length === 0 && addErrors.staff) {
                                  setAddErrors((err) => ({ ...err, staff: 'Please assign at least one staff member to the department.' }));
                                }
                                return next;
                              });
                              if (selectedHodId === id) {
                                setSelectedHodId('');
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 ml-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Staff Search Input */}
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
                    <input
                      type="text"
                      placeholder="Search active staff by name or designation..."
                      value={staffSearchQuery}
                      onFocus={() => setIsStaffDropdownOpen(true)}
                      onChange={(e) => {
                        setStaffSearchQuery(e.target.value);
                        setIsStaffDropdownOpen(true);
                      }}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                    />
                  </div>

                  {/* Dropdown list */}
                  {isStaffDropdownOpen && (
                    <div className="mt-1 border border-[#EBE3DB] rounded-xl bg-white shadow-xl max-h-48 overflow-y-auto z-20">
                      {(() => {
                        const filtered = availableEmployees.filter((emp) => {
                          const fullName = (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`).toLowerCase();
                          const desig = (emp.designation || emp.role || '').toLowerCase();
                          const q = staffSearchQuery.toLowerCase();
                          return fullName.includes(q) || desig.includes(q);
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="p-3 text-center text-[#70665F] text-xs">
                              No active staff member found.
                            </div>
                          );
                        }

                        return filtered.map((emp) => {
                          const isSelected = selectedStaffIds.includes(emp.id);
                          const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id;
                          const desig = emp.designation || emp.role || 'Staff';
                          const otherDept = emp.department || emp.departmentName;

                          return (
                            <div
                              key={emp.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedStaffIds((prev) => prev.filter((id) => id !== emp.id));
                                  if (selectedHodId === emp.id) setSelectedHodId('');
                                } else {
                                  setSelectedStaffIds((prev) => [...prev, emp.id]);
                                  setAddErrors((prev) => ({ ...prev, staff: '', hod: '' }));
                                  if (!selectedHodId) setSelectedHodId(emp.id);
                                }
                              }}
                              className={`p-2.5 px-3 flex items-center justify-between border-b last:border-b-0 border-[#EBE3DB] cursor-pointer hover:bg-[#FAF7F2] transition ${
                                isSelected ? 'bg-crm-brand-50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="rounded text-crm-brand-600 cursor-pointer"
                                />
                                <div>
                                  <div className="font-semibold text-[#211B17]">{name}</div>
                                  <div className="text-[10px] text-[#70665F]">{desig}</div>
                                </div>
                              </div>
                              {otherDept && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                  Currently in {otherDept}
                                </span>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {addErrors.staff && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.staff}
                  </p>
                )}
              </div>

              {/* Department Head (HOD) selection - Strictly Dropdown of assigned staff */}
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">
                  Department Head (HOD) *
                </label>
                <select
                  value={selectedHodId}
                  onChange={(e) => {
                    setSelectedHodId(e.target.value);
                    if (e.target.value) {
                      setAddErrors((prev) => ({ ...prev, hod: '' }));
                    }
                  }}
                  className={`w-full bg-[#FAF7F2] border rounded-xl px-3 py-2 text-[#211B17] focus:outline-none ${
                    addErrors.hod ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-crm-brand-600'
                  }`}
                >
                  <option value="">-- Select Department Head from Assigned Staff --</option>
                  {selectedStaffIds.map((id) => {
                    const emp = availableEmployees.find((e) => e.id === id);
                    if (!emp) return null;
                    const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id;
                    const desig = emp.designation || emp.role || 'Staff';
                    return (
                      <option key={id} value={id}>
                        {name} ({desig})
                      </option>
                    );
                  })}
                </select>
                {selectedStaffIds.length === 0 && (
                  <p className="text-[#70665F] text-[10px] mt-0.5">
                    Assign staff members above to select a Department Head.
                  </p>
                )}
                {addErrors.hod && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.hod}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Description *</label>
                <textarea
                  required
                  placeholder="Responsibilities, operational scope, and key deliverables..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (addErrors.description) setAddErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  rows={2}
                  className={`w-full bg-[#FAF7F2] border rounded-xl px-3 py-2 text-[#211B17] focus:outline-none ${
                    addErrors.description ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-crm-brand-600'
                  }`}
                />
                {addErrors.description && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.description}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={closeAddModalWithConfirm}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-slate-200 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 disabled:opacity-50 text-white font-bold cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Department...
                    </>
                  ) : (
                    'Create Department'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEPARTMENT MODAL (With strict HOD dropdown, change tracking, and backdrop unsaved confirmation) */}
      {editingDept && (
        <div
          onClick={closeEditModalWithConfirm}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                Edit Department: {editingDept.departmentName || editingDept.name}
              </h2>
              <button
                type="button"
                onClick={closeEditModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} noValidate className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={editingDept.departmentName || editingDept.name || ''}
                  onChange={(e) => {
                    setEditingDept({
                      ...editingDept,
                      departmentName: e.target.value,
                      name: e.target.value,
                    });
                    if (editErrors.departmentName) setEditErrors((prev) => ({ ...prev, departmentName: '' }));
                  }}
                  className={`w-full bg-[#FAF7F2] border rounded-xl px-3 py-2 text-[#211B17] font-semibold focus:outline-none ${
                    editErrors.departmentName ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-amber-600'
                  }`}
                />
                {editErrors.departmentName && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {editErrors.departmentName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Department Code</label>
                  <input
                    type="text"
                    value={editingDept.code || ''}
                    onChange={(e) => {
                      setEditingDept({ ...editingDept, code: e.target.value.toUpperCase() });
                      if (editErrors.code) setEditErrors((prev) => ({ ...prev, code: '' }));
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Status</label>
                  <select
                    value={editingDept.status || 'active'}
                    onChange={(e) => setEditingDept({ ...editingDept, status: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Assign Staff Multi-Select for Edit Modal */}
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">
                  Assign Staff (Multi-Select) *
                </label>

                {/* Selected Staff Tags */}
                {editStaffIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl">
                    {editStaffIds.map((id) => {
                      const emp = availableEmployees.find((e) => e.id === id);
                      const name = emp ? (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id) : id;
                      const desig = emp?.designation || emp?.role || 'Staff';
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EBE3DB] text-[11px] font-semibold text-[#211B17] shadow-sm"
                        >
                          <Users className="w-3 h-3 text-amber-600" />
                          <span>{name}</span>
                          <span className="text-[10px] text-[#70665F]">({desig})</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditStaffIds((prev) => {
                                const next = prev.filter((item) => item !== id);
                                if (next.length === 0 && editErrors.staff) {
                                  setEditErrors((err) => ({ ...err, staff: 'Please assign at least one staff member to the department.' }));
                                }
                                return next;
                              });
                              if (editHodId === id) {
                                setEditHodId('');
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 ml-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Staff Search Input */}
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
                    <input
                      type="text"
                      placeholder="Search staff to add or reassign..."
                      value={editStaffSearchQuery}
                      onFocus={() => setIsEditStaffDropdownOpen(true)}
                      onChange={(e) => {
                        setEditStaffSearchQuery(e.target.value);
                        setIsEditStaffDropdownOpen(true);
                      }}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  {/* Dropdown list */}
                  {isEditStaffDropdownOpen && (
                    <div className="mt-1 border border-[#EBE3DB] rounded-xl bg-white shadow-xl max-h-48 overflow-y-auto z-20">
                      {(() => {
                        const filtered = availableEmployees.filter((emp) => {
                          const fullName = (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`).toLowerCase();
                          const desig = (emp.designation || emp.role || '').toLowerCase();
                          const q = editStaffSearchQuery.toLowerCase();
                          return fullName.includes(q) || desig.includes(q);
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="p-3 text-center text-[#70665F] text-xs">
                              No active staff member found.
                            </div>
                          );
                        }

                        return filtered.map((emp) => {
                          const isSelected = editStaffIds.includes(emp.id);
                          const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id;
                          const desig = emp.designation || emp.role || 'Staff';
                          const otherDept = emp.department || emp.departmentName;

                          return (
                            <div
                              key={emp.id}
                              onClick={() => {
                                if (isSelected) {
                                  setEditStaffIds((prev) => prev.filter((id) => id !== emp.id));
                                  if (editHodId === emp.id) setEditHodId('');
                                } else {
                                  setEditStaffIds((prev) => [...prev, emp.id]);
                                  setEditErrors((prev) => ({ ...prev, staff: '', hod: '' }));
                                  if (!editHodId) setEditHodId(emp.id);
                                }
                              }}
                              className={`p-2.5 px-3 flex items-center justify-between border-b last:border-b-0 border-[#EBE3DB] cursor-pointer hover:bg-[#FAF7F2] transition ${
                                isSelected ? 'bg-amber-50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="rounded text-amber-600 cursor-pointer"
                                />
                                <div>
                                  <div className="font-semibold text-[#211B17]">{name}</div>
                                  <div className="text-[10px] text-[#70665F]">{desig}</div>
                                </div>
                              </div>
                              {otherDept && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                  Currently in {otherDept}
                                </span>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {editErrors.staff && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {editErrors.staff}
                  </p>
                )}
              </div>

              {/* Department Head (HOD) selection - Strictly Dropdown of assigned staff */}
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">
                  Department Head (HOD) *
                </label>
                <select
                  value={editHodId}
                  onChange={(e) => {
                    setEditHodId(e.target.value);
                    if (e.target.value) {
                      setEditErrors((prev) => ({ ...prev, hod: '' }));
                    }
                  }}
                  className={`w-full bg-[#FAF7F2] border rounded-xl px-3 py-2 text-[#211B17] focus:outline-none ${
                    editErrors.hod ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-amber-600'
                  }`}
                >
                  <option value="">-- Select Department Head from Assigned Staff --</option>
                  {editStaffIds.map((id) => {
                    const emp = availableEmployees.find((e) => e.id === id);
                    if (!emp) return null;
                    const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id;
                    const desig = emp.designation || emp.role || 'Staff';
                    return (
                      <option key={id} value={id}>
                        {name} ({desig})
                      </option>
                    );
                  })}
                </select>
                {editStaffIds.length === 0 && (
                  <p className="text-[#70665F] text-[10px] mt-0.5">
                    Assign staff members above to select a Department Head.
                  </p>
                )}
                {editErrors.hod && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {editErrors.hod}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Description *</label>
                <textarea
                  required
                  placeholder="Responsibilities, operational scope, and key deliverables..."
                  value={editingDept.description || ''}
                  onChange={(e) => {
                    setEditingDept({ ...editingDept, description: e.target.value });
                    if (editErrors.description) setEditErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  rows={2}
                  className={`w-full bg-[#FAF7F2] border rounded-xl px-3 py-2 text-[#211B17] focus:outline-none ${
                    editErrors.description ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-amber-600'
                  }`}
                />
                {editErrors.description && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {editErrors.description}
                  </p>
                )}
              </div>

              {!isEditFormDirty && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>No changes made yet. Change any field to enable update.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={closeEditModalWithConfirm}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-slate-200 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditFormDirty || isUpdating}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer flex items-center gap-2 shadow-md shadow-amber-600/20"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating Department...
                    </>
                  ) : (
                    'Update Department'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STAFF MODAL */}
      {viewStaffDept && (
        <div
          onClick={() => setViewStaffDept(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Users className="w-5 h-5 text-crm-brand-600" />
                Staff Members in {viewStaffDept.departmentName || viewStaffDept.name}
              </h2>
              <button onClick={() => setViewStaffDept(null)} className="text-[#70665F] hover:text-[#211B17] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const currentName = viewStaffDept.departmentName || viewStaffDept.name || '';
              const deptKey = currentName.toLowerCase();
              const deptEmployees = availableEmployees.filter(
                (e) => ((e.department || e.departmentName || '')?.toLowerCase()) === deptKey
              );

              if (deptEmployees.length === 0) {
                return (
                  <div className="p-8 text-center text-[#70665F] text-xs">
                    No staff currently assigned to this department.
                  </div>
                );
              }

              return (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {deptEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#211B17]">
                          {emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`}
                        </div>
                        <div className="text-[11px] text-[#70665F]">
                          {emp.role || emp.designation || 'Staff'} • {emp.email || emp.phone}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {emp.status || 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-[#EBE3DB]">
              <button
                type="button"
                onClick={() => setViewStaffDept(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-slate-200 text-[#211B17] font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
