'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Workflow,
  Plus,
  ArrowRight,
  CheckCircle2,
  Building,
  Calendar,
  X,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  MapPin,
  Briefcase,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { EmployeeTransferItem } from '../../../types/hr';

const PLANT_LOCATIONS = [
  'Plant 1 - Heavy Fabrication Yard',
  'Plant 2 - Precision Machining Unit',
  'Corporate HQ - Vadodara',
  'Customer Service Hub',
  'Central Warehouse & Logistics',
  'Site Office - Field Operations',
];

export default function EmployeeTransfersPage() {
  const {
    employeeTransfers = [],
    addEmployeeTransfer,
    updateEmployeeTransfer,
    deleteEmployeeTransfer,
    availableEmployees = [],
    departments = [],
    designations = [],
    updateEmployee,
  } = useERP();

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [deleteConfirmTrn, setDeleteConfirmTrn] = useState<EmployeeTransferItem | null>(null);

  // Form State
  const initialFormState = {
    employeeId: '',
    fromDepartment: '',
    fromDesignation: '',
    fromLocation: '',
    toDepartment: '',
    toDesignation: '',
    toLocation: PLANT_LOCATIONS[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Active department list from master
  const activeDepartments = useMemo(() => {
    return (departments || []).filter(
      (d) => !d.status || d.status.toLowerCase() === 'active'
    );
  }, [departments]);

  // Selected employee lookup
  const selectedEmployeeObj = useMemo(() => {
    if (!formData.employeeId) return null;
    return (
      (availableEmployees || []).find((e) => e.id === formData.employeeId) ||
      null
    );
  }, [availableEmployees, formData.employeeId]);

  // Handle employee selection and auto-populate previous position
  const handleEmployeeChange = (empId: string) => {
    const emp = (availableEmployees || []).find((e) => e.id === empId);
    if (emp) {
      const currentDept = emp.department || 'Unassigned';
      const currentDesg = emp.designation || 'Staff';
      const currentLoc = (emp as any).workLocation || (emp as any).location || 'Plant 1 - Heavy Fabrication Yard';

      setFormData((prev) => ({
        ...prev,
        employeeId: empId,
        fromDepartment: currentDept,
        fromDesignation: currentDesg,
        fromLocation: currentLoc,
        // Reset toDepartment if it matches the current dept
        toDepartment: prev.toDepartment === currentDept ? '' : prev.toDepartment,
        toDesignation: prev.toDepartment === currentDept ? '' : prev.toDesignation,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        employeeId: '',
        fromDepartment: '',
        fromDesignation: '',
        fromLocation: '',
      }));
    }

    if (formErrors.employeeId) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.employeeId;
        return next;
      });
    }
  };

  // Available designations for selected new department
  const availableDesignationsForNewDept = useMemo(() => {
    if (!formData.toDepartment) return [];
    const deptLower = formData.toDepartment.trim().toLowerCase();
    const matched = (designations || []).filter((d) => {
      const dDept = (d.department || '').trim().toLowerCase();
      const isActive = !d.status || d.status.toLowerCase() === 'active';
      return isActive && (dDept === deptLower || dDept === 'all' || dDept === 'all departments');
    });

    if (matched.length > 0) return matched;
    // Fallback to all active designations if no direct department match
    return (designations || []).filter(
      (d) => !d.status || d.status.toLowerCase() === 'active'
    );
  }, [designations, formData.toDepartment]);

  // Form dirty state check for unsaved changes confirmation
  const isFormDirty = useMemo(() => {
    return (
      formData.employeeId !== '' ||
      formData.toDepartment !== '' ||
      formData.toDesignation !== '' ||
      formData.reason.trim() !== ''
    );
  }, [formData]);

  const closeModalWithConfirm = () => {
    if (isFormDirty && !editingId) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    setShowModal(false);
    setEditingId(null);
    setFormErrors({});
    setFormData(initialFormState);
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) closeModalWithConfirm();
        if (deleteConfirmTrn) setDeleteConfirmTrn(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isFormDirty, deleteConfirmTrn]);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // 1. Employee
    if (!formData.employeeId) {
      errors.employeeId = 'Please select the employee.';
    }

    // 2. New Department
    if (!formData.toDepartment || formData.toDepartment.trim() === '') {
      errors.toDepartment = 'Please select the new department.';
    } else if (
      formData.fromDepartment &&
      formData.toDepartment.trim().toLowerCase() ===
        formData.fromDepartment.trim().toLowerCase()
    ) {
      errors.toDepartment =
        'The new department cannot be the same as the current department.';
    }

    // 3. New Designation
    if (!formData.toDesignation || formData.toDesignation.trim() === '') {
      errors.toDesignation = 'Please select the new designation.';
    }

    // 4. Effective Date
    if (!formData.effectiveDate || formData.effectiveDate.trim() === '') {
      errors.effectiveDate = 'Please select the transfer effective date.';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (formData.effectiveDate < todayStr) {
        errors.effectiveDate = 'The transfer effective date cannot be in the past.';
      }
    }

    // 5. Reason
    if (!formData.reason || formData.reason.trim() === '') {
      errors.reason = 'Please enter the transfer reason.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (trn: EmployeeTransferItem) => {
    setEditingId(trn.id);
    setFormData({
      employeeId: trn.employeeId,
      fromDepartment: trn.fromDepartment || '',
      fromDesignation: trn.fromDesignation || '',
      fromLocation: trn.fromLocation || '',
      toDepartment: trn.toDepartment,
      toDesignation: trn.toDesignation,
      toLocation: trn.toLocation || PLANT_LOCATIONS[0],
      effectiveDate: trn.effectiveDate,
      reason: trn.reason,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteRecord = (trn: EmployeeTransferItem) => {
    setDeleteConfirmTrn(trn);
  };

  const executeDelete = () => {
    if (!deleteConfirmTrn) return;
    deleteEmployeeTransfer(deleteConfirmTrn.id);
    setSuccessToast(`Transfer order ${deleteConfirmTrn.id} deleted successfully.`);
    setDeleteConfirmTrn(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const emp = (availableEmployees || []).find((e) => e.id === formData.employeeId);
    const empName = emp?.name || (emp ? `${(emp as any).firstName || ''} ${(emp as any).lastName || ''}`.trim() : 'Staff Member');

    try {
      if (editingId) {
        updateEmployeeTransfer(editingId, {
          employeeId: formData.employeeId,
          employeeName: empName,
          effectiveDate: formData.effectiveDate,
          fromDepartment: formData.fromDepartment || 'General',
          toDepartment: formData.toDepartment,
          fromDesignation: formData.fromDesignation || 'Staff',
          toDesignation: formData.toDesignation,
          fromLocation: formData.fromLocation || 'Plant 1',
          toLocation: formData.toLocation,
          reason: formData.reason.trim(),
        });
        setSuccessToast(`Transfer order ${editingId} updated successfully.`);
      } else {
        addEmployeeTransfer({
          employeeId: formData.employeeId,
          employeeName: empName,
          effectiveDate: formData.effectiveDate,
          fromDepartment: formData.fromDepartment || 'General',
          toDepartment: formData.toDepartment,
          fromDesignation: formData.fromDesignation || 'Staff',
          toDesignation: formData.toDesignation,
          fromLocation: formData.fromLocation || 'Plant 1',
          toLocation: formData.toLocation,
          reason: formData.reason.trim(),
          approvedBy: 'Sanjay Shah (HR Manager)',
          status: 'Approved',
        });
        setSuccessToast(`Transfer order issued successfully for ${empName}!`);
      }

      // Synchronize employee master profile
      if (updateEmployee && formData.employeeId) {
        updateEmployee(formData.employeeId, {
          department: formData.toDepartment,
          designation: formData.toDesignation,
          workLocation: formData.toLocation,
        } as any);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(initialFormState);
      setFormErrors({});
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to save transfer order:', err);
      setLoadError('The transfer details could not be loaded correctly. Please refresh the page and try again.');
    }
  };

  // Filter transfers list
  const filteredTransfers = useMemo(() => {
    return (employeeTransfers || []).filter((trn) => {
      const matchesSearch =
        trn.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trn.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trn.toDepartment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trn.fromDepartment || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        departmentFilter === 'ALL' ||
        trn.toDepartment === departmentFilter ||
        trn.fromDepartment === departmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [employeeTransfers, searchTerm, departmentFilter]);

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadError(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FDFBF9] min-h-screen text-[#211B17]">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Workflow className="w-6 h-6" />
            </div>
            Employee Transfers & Internal Mobility
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Department, Plant Location & Role Reassignments with Historical Audit Log
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EBE3DB] hover:bg-[#F5EFEB] text-[#544B45] font-semibold text-xs rounded-lg transition shadow-sm"
            title="Reload transfer records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Issue Transfer Order
          </button>
        </div>
      </div>

      {/* Error Banner if Load Failed */}
      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Total Transfers Logged
            </span>
            <span className="text-2xl font-black text-[#211B17]">
              {employeeTransfers.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Workflow className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Departments Active
            </span>
            <span className="text-2xl font-black text-[#211B17]">
              {departments.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Total Staff Mastered
            </span>
            <span className="text-2xl font-black text-[#211B17]">
              {availableEmployees.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Employee name, ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#70665F]" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
          >
            <option value="ALL">All Departments</option>
            {activeDepartments.map((dept) => (
              <option key={dept.id} value={dept.departmentName}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transfers List */}
      {isLoading ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#544B45]">
            Loading transfer orders...
          </p>
        </div>
      ) : filteredTransfers.length === 0 ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Workflow className="w-12 h-12 text-[#A89F91] mx-auto" />
          <h3 className="text-base font-bold text-[#211B17]">
            No transfer records found
          </h3>
          <p className="text-xs text-[#70665F] max-w-md mx-auto">
            {searchTerm || departmentFilter !== 'ALL'
              ? 'No transfer records match your filter criteria. Try resetting the filters.'
              : 'No transfer orders have been issued yet. Click "+ Issue Transfer Order" to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTransfers.map((trn) => {
            // Fresh employee info lookup
            const masterEmp = (availableEmployees || []).find(
              (e) => e.id === trn.employeeId
            );
            const displayName = masterEmp?.name || trn.employeeName;

            return (
              <div
                key={trn.id}
                className="bg-white border border-[#EBE3DB] hover:border-amber-600/40 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Top Row: ID, Name, Status, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE3DB]/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 text-xs font-mono font-bold rounded-md border border-amber-500/20">
                      {trn.id}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                        {displayName}
                        <span className="text-xs font-normal text-[#70665F]">
                          ({trn.employeeId})
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {trn.status || 'Approved'} (Effective: {trn.effectiveDate})
                    </span>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 border-l border-[#EBE3DB] pl-2">
                      <button
                        onClick={() => handleOpenEditModal(trn)}
                        className="p-1.5 text-[#544B45] hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit transfer order"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(trn)}
                        className="p-1.5 text-[#544B45] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete transfer order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transfer Details: Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Previous Position */}
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] space-y-2">
                    <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block border-b border-[#EBE3DB] pb-1.5">
                      Previous Position
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div className="text-[#70665F]">Dept:</div>
                      <div className="col-span-2 font-semibold text-[#211B17]">
                        {trn.fromDepartment || '—'}
                      </div>

                      <div className="text-[#70665F]">Designation:</div>
                      <div className="col-span-2 text-[#544B45]">
                        {trn.fromDesignation || '—'}
                      </div>

                      <div className="text-[#70665F]">Location:</div>
                      <div className="col-span-2 text-[#544B45]">
                        {trn.fromLocation || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Transferred Position */}
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block border-b border-amber-200/60 pb-1.5 flex items-center justify-between">
                      <span>Transferred Position</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div className="text-amber-900/70">Dept:</div>
                      <div className="col-span-2 font-bold text-amber-950">
                        {trn.toDepartment}
                      </div>

                      <div className="text-amber-900/70">Designation:</div>
                      <div className="col-span-2 font-medium text-[#211B17]">
                        {trn.toDesignation}
                      </div>

                      <div className="text-amber-900/70">Location:</div>
                      <div className="col-span-2 text-[#544B45]">
                        {trn.toLocation || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Reason & Approver */}
                <div className="text-xs text-[#70665F] flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#EBE3DB]/60 pt-3">
                  <div>
                    <span className="font-semibold text-[#544B45]">Reason:</span>{' '}
                    <span className="italic text-[#211B17]">
                      &quot;{trn.reason}&quot;
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#544B45]">Approved By:</span>{' '}
                    <strong className="text-[#211B17]">{trn.approvedBy || 'HR Manager'}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue / Edit Transfer Order Modal */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModalWithConfirm();
            }
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl relative my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#211B17]">
                    {editingId ? 'Edit Employee Transfer Order' : 'Issue Employee Transfer Order'}
                  </h2>
                  <p className="text-xs text-[#70665F]">
                    {editingId ? 'Modify transfer parameters and work assignment' : 'Assign a staff member to a new department or location'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] p-1.5 rounded-lg hover:bg-[#F5EFEB] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Select Employee */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  disabled={editingId !== null}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition disabled:bg-gray-100 ${
                    formErrors.employeeId
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-amber-600'
                  }`}
                >
                  <option value="">-- Choose Employee from Master --</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || `${(emp as any).firstName || ''} ${(emp as any).lastName || ''}`.trim()} ({emp.department || 'Unassigned'} • {emp.designation || 'Staff'})
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.employeeId}
                  </p>
                )}
              </div>

              {/* Current Position Snapshot (Auto-populated) */}
              {selectedEmployeeObj && (
                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">
                      Current Assignment
                    </span>
                    <span className="text-[11px] text-amber-700 font-semibold">
                      ID: {selectedEmployeeObj.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[#70665F] block text-[10px]">Department</span>
                      <strong className="text-[#211B17]">
                        {formData.fromDepartment || selectedEmployeeObj.department}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#70665F] block text-[10px]">Designation</span>
                      <span className="text-[#544B45]">
                        {formData.fromDesignation || selectedEmployeeObj.designation}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#70665F] block text-[10px]">Location</span>
                      <span className="text-[#544B45]">
                        {formData.fromLocation || 'Plant 1'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. New Department & Effective Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    New Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.toDepartment}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setFormData({
                        ...formData,
                        toDepartment: newDept,
                        toDesignation: '', // Reset designation on department change
                      });
                      if (formErrors.toDepartment) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.toDepartment;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                      formErrors.toDepartment
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-amber-600'
                    }`}
                  >
                    <option value="">-- Select New Department --</option>
                    {activeDepartments.map((dept) => (
                      <option key={dept.id} value={dept.departmentName}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                  {formErrors.toDepartment && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.toDepartment}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Transfer Effective Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setFormData({ ...formData, effectiveDate: e.target.value });
                      if (formErrors.effectiveDate) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.effectiveDate;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                      formErrors.effectiveDate
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-amber-600'
                    }`}
                  />
                  {formErrors.effectiveDate && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.effectiveDate}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. New Designation & New Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    New Designation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.toDesignation}
                    disabled={!formData.toDepartment}
                    onChange={(e) => {
                      setFormData({ ...formData, toDesignation: e.target.value });
                      if (formErrors.toDesignation) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.toDesignation;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition disabled:bg-gray-100 disabled:text-gray-400 ${
                      formErrors.toDesignation
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-amber-600'
                    }`}
                  >
                    <option value="">
                      {!formData.toDepartment
                        ? '-- Choose Department First --'
                        : '-- Select New Designation --'}
                    </option>
                    {availableDesignationsForNewDept.map((desg) => (
                      <option key={desg.id} value={desg.designationName}>
                        {desg.designationName}
                      </option>
                    ))}
                  </select>
                  {formErrors.toDesignation && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.toDesignation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    New Plant / Work Location
                  </label>
                  <select
                    value={formData.toLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, toLocation: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600 transition"
                  >
                    {PLANT_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Transfer Reason */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Transfer Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain the operational requirement or reason for this internal transfer..."
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({ ...formData, reason: e.target.value });
                    if (formErrors.reason) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.reason;
                        return next;
                      });
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                    formErrors.reason
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-amber-600'
                  }`}
                />
                {formErrors.reason && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.reason}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-[#EBE3DB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModalWithConfirm}
                  className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <Workflow className="w-4 h-4" />
                  {editingId ? 'Update Transfer Order' : 'Submit Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTrn && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmTrn(null);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#211B17]">Delete Transfer Order</h3>
                <p className="text-xs text-[#70665F]">Order ID: {deleteConfirmTrn.id}</p>
              </div>
            </div>

            <p className="text-sm text-[#544B45] leading-relaxed">
              Are you sure you want to delete this transfer order for <strong>{deleteConfirmTrn.employeeName}</strong>? This action will remove the transfer record from the history audit log.
            </p>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmTrn(null)}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow transition"
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
