'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  LogOut,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  X,
  AlertTriangle,
  AlertCircle,
  Edit2,
  Trash2,
  Search,
  Filter,
  UserCheck,
  Building,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { EmployeeExitItem } from '../../../types/hr';

export default function ResignationExitPage() {
  const {
    employeeExits = [],
    addEmployeeExit,
    updateEmployeeExit,
    deleteEmployeeExit,
    updateEmployeeExitClearance,
    availableEmployees = [],
    departments = [],
    updateEmployee,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [deleteConfirmExit, setDeleteConfirmExit] = useState<EmployeeExitItem | null>(null);

  const initialFormState = {
    employeeId: '',
    resignationDate: new Date().toISOString().split('T')[0],
    lastWorkingDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().split('T')[0];
    })(),
    noticePeriodDays: 30,
    reason: '',
    exitInterviewNotes: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Lookup selected employee
  const selectedEmp = useMemo(() => {
    if (!formData.employeeId) return null;
    return (availableEmployees || []).find((e) => e.id === formData.employeeId) || null;
  }, [availableEmployees, formData.employeeId]);

  // Handle employee change
  const handleEmployeeChange = (empId: string) => {
    setFormData((prev) => ({
      ...prev,
      employeeId: empId,
    }));
    if (formErrors.employeeId) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.employeeId;
        return next;
      });
    }
  };

  // Auto-calculate notice period days when dates change
  const handleDateChange = (type: 'resignation' | 'lwd', val: string) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        [type === 'resignation' ? 'resignationDate' : 'lastWorkingDate']: val,
      };

      if (next.resignationDate && next.lastWorkingDate) {
        const rDate = new Date(next.resignationDate);
        const lDate = new Date(next.lastWorkingDate);
        const diffTime = lDate.getTime() - rDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        next.noticePeriodDays = diffDays >= 0 ? diffDays : 0;
      }
      return next;
    });

    if (formErrors.resignationDate || formErrors.lastWorkingDate) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.resignationDate;
        delete next.lastWorkingDate;
        return next;
      });
    }
  };

  // Form dirty check
  const isFormDirty = useMemo(() => {
    return (
      formData.employeeId !== '' ||
      formData.reason.trim() !== '' ||
      formData.exitInterviewNotes.trim() !== ''
    );
  }, [formData]);

  const closeModalWithConfirm = () => {
    if (isFormDirty && !editingId) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    setShowModal(false);
    setEditingId(null);
    setFormErrors({});
    setFormData(initialFormState);
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) closeModalWithConfirm();
        if (deleteConfirmExit) setDeleteConfirmExit(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isFormDirty, deleteConfirmExit]);

  // Validations
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // 1. Employee
    if (!formData.employeeId) {
      errors.employeeId = 'Please select the employee.';
    }

    // 2. Resignation Date
    if (!formData.resignationDate || formData.resignationDate.trim() === '') {
      errors.resignationDate = 'Please select the resignation date.';
    }

    // 3. Last Working Day
    if (!formData.lastWorkingDate || formData.lastWorkingDate.trim() === '') {
      errors.lastWorkingDate = 'Please select the last working day.';
    } else if (
      formData.resignationDate &&
      formData.lastWorkingDate < formData.resignationDate
    ) {
      errors.lastWorkingDate = 'The last working day cannot be earlier than the resignation date.';
    }

    // 4. Reason
    if (!formData.reason || formData.reason.trim() === '') {
      errors.reason = 'Please enter the reason for leaving.';
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

  const handleOpenEditModal = (exit: EmployeeExitItem) => {
    setEditingId(exit.id);
    setFormData({
      employeeId: exit.employeeId,
      resignationDate: exit.resignationDate,
      lastWorkingDate: exit.lastWorkingDate,
      noticePeriodDays: exit.noticePeriodDays || 30,
      reason: exit.reason,
      exitInterviewNotes: exit.exitInterviewNotes || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteRecord = (exit: EmployeeExitItem) => {
    setDeleteConfirmExit(exit);
  };

  const executeDelete = () => {
    if (!deleteConfirmExit) return;

    deleteEmployeeExit(deleteConfirmExit.id);

    // Restore employee status to Active
    if (updateEmployee && deleteConfirmExit.employeeId) {
      updateEmployee(deleteConfirmExit.employeeId, {
        status: 'Active',
      } as any);
    }

    setSuccessToast(
      `Resignation entry ${deleteConfirmExit.id} cancelled. Active status restored for ${deleteConfirmExit.employeeName}.`
    );
    setDeleteConfirmExit(null);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const emp = (availableEmployees || []).find((e) => e.id === formData.employeeId);
    const empName = emp?.name || (emp ? `${(emp as any).firstName || ''} ${(emp as any).lastName || ''}`.trim() : 'Staff Member');
    const empDept = emp?.department || 'Production';
    const empRole = emp?.role || (emp as any)?.designation || 'Staff';

    if (editingId) {
      updateEmployeeExit(editingId, {
        employeeId: formData.employeeId,
        employeeName: empName,
        department: empDept,
        designation: empRole,
        resignationDate: formData.resignationDate,
        lastWorkingDate: formData.lastWorkingDate,
        noticePeriodDays: Number(formData.noticePeriodDays),
        reason: formData.reason.trim(),
        exitInterviewNotes: formData.exitInterviewNotes.trim(),
      });
      setSuccessToast(`Resignation record ${editingId} updated successfully.`);
    } else {
      addEmployeeExit({
        employeeId: formData.employeeId,
        employeeName: empName,
        department: empDept,
        designation: empRole,
        resignationDate: formData.resignationDate,
        lastWorkingDate: formData.lastWorkingDate,
        noticePeriodDays: Number(formData.noticePeriodDays),
        reason: formData.reason.trim(),
        exitInterviewNotes: formData.exitInterviewNotes.trim(),
        departmentClearance: false,
        assetReturnClearance: false,
        hrClearance: false,
        accountsClearance: false,
        status: 'Notice Period',
      });

      // Update employee status to Resigned / Notice Period in master
      if (updateEmployee && formData.employeeId) {
        updateEmployee(formData.employeeId, {
          status: 'Notice Period',
        } as any);
      }

      setSuccessToast(`Resignation recorded for ${empName} (Status: Under Notice Period).`);
    }

    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Filtered exit records
  const filteredExits = useMemo(() => {
    return (employeeExits || []).filter((exit) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        exit.employeeName.toLowerCase().includes(q) ||
        exit.employeeId.toLowerCase().includes(q) ||
        exit.id.toLowerCase().includes(q) ||
        exit.department.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        exit.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [employeeExits, searchTerm, statusFilter]);

  return (
    <div className="p-6 space-y-6 bg-[#FDFBF9] min-h-screen text-[#211B17]">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-600">
              <LogOut className="w-6 h-6" />
            </div>
            Resignation & Employee Exit Management
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Notice Period Tracking, Handover & 4-Department Clearance Workflow (Dept | Asset | HR | Accounts)
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Log Resignation Request
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Active Exit Cases
            </span>
            <span className="text-2xl font-black text-[#211B17]">
              {employeeExits.filter((e) => e.status !== 'Settlement Done').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Fully Cleared Exits
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {employeeExits.filter((e) => e.status === 'Cleared' || e.status === 'Settlement Done').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Total Staff Registered
            </span>
            <span className="text-2xl font-black text-[#211B17]">
              {availableEmployees.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
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
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-red-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#70665F]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-red-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Notice Period">Notice Period</option>
            <option value="Cleared">Cleared</option>
            <option value="Settlement Done">Settlement Done</option>
          </select>
        </div>
      </div>

      {/* Exit List */}
      {filteredExits.length === 0 ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <LogOut className="w-12 h-12 text-[#A89F91] mx-auto" />
          <h3 className="text-base font-bold text-[#211B17]">No resignation records found</h3>
          <p className="text-xs text-[#70665F] max-w-md mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No resignation records match your filter criteria.'
              : 'No resignation requests logged yet. Click "+ Log Resignation Request" to record one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredExits.map((exit) => {
            const masterEmp = (availableEmployees || []).find((e) => e.id === exit.employeeId);
            const displayName = masterEmp?.name || exit.employeeName;

            return (
              <div
                key={exit.id}
                className="bg-white border border-[#EBE3DB] hover:border-red-300 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Header Row: ID, Name, Status, Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE3DB]/60 pb-3.5">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                        {exit.id}
                      </span>
                      <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                        {displayName}
                        <span className="text-xs font-normal text-[#70665F]">({exit.employeeId})</span>
                      </h3>
                    </div>
                    <div className="text-xs text-[#70665F] mt-1">
                      Dept: <span className="text-[#211B17] font-semibold">{exit.department}</span> | Designation: {exit.designation}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        exit.status === 'Cleared' || exit.status === 'Settlement Done'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {exit.status === 'Cleared' || exit.status === 'Settlement Done' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      {exit.status}
                    </span>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 border-l border-[#EBE3DB] pl-3">
                      <button
                        onClick={() => handleOpenEditModal(exit)}
                        className="p-1.5 text-[#544B45] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Edit resignation details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(exit)}
                        className="p-1.5 text-[#544B45] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete / Cancel resignation entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timeline & Parameters Snapshot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] text-xs">
                  <div>
                    <span className="text-[#70665F] block text-[11px]">Resignation Date</span>
                    <span className="text-[#211B17] font-semibold">{exit.resignationDate}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[11px]">Last Working Date</span>
                    <span className="text-amber-800 font-bold">{exit.lastWorkingDate}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[11px]">Notice Period</span>
                    <span className="text-[#211B17] font-semibold">{exit.noticePeriodDays || 30} Days</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[11px]">Reason for Leaving</span>
                    <span className="text-[#544B45] font-medium italic truncate block">
                      &quot;{exit.reason}&quot;
                    </span>
                  </div>
                </div>

                {/* 4-Department Clearance Matrix */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">
                    Inter-Department Clearance Matrix (Click checkbox to verify)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Dept Head */}
                    <div className="p-3 bg-white rounded-xl border border-[#EBE3DB] flex items-center justify-between text-xs shadow-sm">
                      <div>
                        <div className="font-semibold text-[#211B17]">Department Head</div>
                        <div className="text-[10px] text-[#70665F]">Handover Completed</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateEmployeeExitClearance(exit.id, 'dept', !exit.departmentClearance)}
                        className={`p-1.5 rounded-lg border transition ${
                          exit.departmentClearance
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-[#FAF7F2] text-[#A89F91] border-[#EBE3DB] hover:text-[#544B45]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Store / Assets */}
                    <div className="p-3 bg-white rounded-xl border border-[#EBE3DB] flex items-center justify-between text-xs shadow-sm">
                      <div>
                        <div className="font-semibold text-[#211B17]">Store / Asset Return</div>
                        <div className="text-[10px] text-[#70665F]">Tools, Laptop, ID</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateEmployeeExitClearance(exit.id, 'asset', !exit.assetReturnClearance)}
                        className={`p-1.5 rounded-lg border transition ${
                          exit.assetReturnClearance
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-[#FAF7F2] text-[#A89F91] border-[#EBE3DB] hover:text-[#544B45]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* HR */}
                    <div className="p-3 bg-white rounded-xl border border-[#EBE3DB] flex items-center justify-between text-xs shadow-sm">
                      <div>
                        <div className="font-semibold text-[#211B17]">HR Clearance</div>
                        <div className="text-[10px] text-[#70665F]">Exit Interview & Feedback</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateEmployeeExitClearance(exit.id, 'hr', !exit.hrClearance)}
                        className={`p-1.5 rounded-lg border transition ${
                          exit.hrClearance
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-[#FAF7F2] text-[#A89F91] border-[#EBE3DB] hover:text-[#544B45]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Accounts */}
                    <div className="p-3 bg-white rounded-xl border border-[#EBE3DB] flex items-center justify-between text-xs shadow-sm">
                      <div>
                        <div className="font-semibold text-[#211B17]">Accounts Clearance</div>
                        <div className="text-[10px] text-[#70665F]">Advances & Dues Recovery</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateEmployeeExitClearance(exit.id, 'accounts', !exit.accountsClearance)}
                        className={`p-1.5 rounded-lg border transition ${
                          exit.accountsClearance
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-[#FAF7F2] text-[#A89F91] border-[#EBE3DB] hover:text-[#544B45]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit / Edit Resignation Modal */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModalWithConfirm();
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-600">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#211B17]">
                    {editingId ? 'Edit Resignation / Exit Entry' : 'Submit Resignation / Exit Entry'}
                  </h2>
                  <p className="text-xs text-[#70665F]">
                    {editingId ? 'Update resignation timeline or reason' : 'Initiate formal employee notice period and clearance workflow'}
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
                      : 'border-[#EBE3DB] focus:border-red-600'
                  }`}
                >
                  <option value="">-- Choose Employee from Master --</option>
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name || `${(e as any).firstName || ''} ${(e as any).lastName || ''}`.trim()} ({e.department || 'Production'} • {e.role || 'Staff'})
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

              {/* 2. Resignation Date & Last Working Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Resignation Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.resignationDate}
                    onChange={(e) => handleDateChange('resignation', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                      formErrors.resignationDate
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-red-600'
                    }`}
                  />
                  {formErrors.resignationDate && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.resignationDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Last Working Day <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.lastWorkingDate}
                    min={formData.resignationDate}
                    onChange={(e) => handleDateChange('lwd', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                      formErrors.lastWorkingDate
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-red-600'
                    }`}
                  />
                  {formErrors.lastWorkingDate && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.lastWorkingDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Notice Period Snapshot */}
              <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#70665F]">Calculated Notice Period:</span>
                <strong className="text-[#211B17]">{formData.noticePeriodDays || 0} Days</strong>
              </div>

              {/* 3. Reason for Leaving */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Reason for Leaving <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why the employee is resigning (higher studies, career progression, relocation)..."
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
                      : 'border-[#EBE3DB] focus:border-red-600'
                  }`}
                />
                {formErrors.reason && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.reason}
                  </p>
                )}
              </div>

              {/* 4. Exit Interview Notes */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Exit Interview Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes from initial discussion or exit interview regarding department feedback..."
                  value={formData.exitInterviewNotes}
                  onChange={(e) => setFormData({ ...formData, exitInterviewNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-red-600 transition"
                />
              </div>

              {/* Form Buttons */}
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
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {editingId ? 'Update Resignation Request' : 'Submit Resignation Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Cancel Confirmation Modal */}
      {deleteConfirmExit && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmExit(null);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#211B17]">Cancel Resignation Record</h3>
                <p className="text-xs text-[#70665F]">Order ID: {deleteConfirmExit.id}</p>
              </div>
            </div>

            <p className="text-sm text-[#544B45] leading-relaxed">
              Are you sure you want to delete this resignation record? Cancelling this resignation will remove the exit entry for <strong>{deleteConfirmExit.employeeName}</strong> and restore their active employee status.
            </p>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmExit(null)}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
              >
                Keep Record
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition"
              >
                Yes, Delete Resignation Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
