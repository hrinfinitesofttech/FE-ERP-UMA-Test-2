'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Calendar,
  Plus,
  Users,
  Building,
  Layers,
  CheckCircle2,
  Filter,
  X,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  Clock,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { ShiftRosterItem } from '../../../types/hr';

export default function ShiftRosterPage() {
  const {
    shiftRosters = [],
    addShiftRoster,
    updateShiftRoster,
    deleteShiftRoster,
    availableEmployees = [],
    shiftMasters = [],
    departments = [],
    leaveRequests = [],
    holidays = [],
    attendanceRecords = [],
  } = useERP();

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmRoster, setDeleteConfirmRoster] = useState<ShiftRosterItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Form State
  const initialFormState = {
    employeeId: '',
    startDate: getTodayDate(),
    endDate: getTodayDate(),
    shiftId: shiftMasters[0]?.id || '',
    remarks: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isFormDirty = useMemo(() => {
    return formData.employeeId !== '' || formData.remarks !== '';
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
    setFormData(initialFormState);
    setFormErrors({});
    setConflictWarning(null);
    setTouched({});
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) closeModalWithConfirm();
        if (deleteConfirmRoster) setDeleteConfirmRoster(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isFormDirty, deleteConfirmRoster]);

  // Conflict Checking Function (Leave, Holiday, Weekly Off)
  const checkConflicts = (empId: string, dateStr: string, shfId: string): string | null => {
    if (!empId || !dateStr) return null;

    // 1. Check Approved Leave Requests
    const leaveConflict = leaveRequests.find((l) => {
      if (l.employeeId !== empId || l.status !== 'Approved') return false;
      const start = l.fromDate || (l as any).startDate;
      const end = l.toDate || (l as any).endDate;
      return Boolean(start && end && dateStr >= start && dateStr <= end);
    });

    if (leaveConflict) {
      const lName = leaveConflict.leaveName || (leaveConflict as any).leaveType || 'Leave';
      return `Conflict: Employee is on approved leave (${lName}) on ${dateStr}. Shift cannot be assigned.`;
    }

    // 2. Check Attendance records for existing On Leave / WFH
    const attConflict = attendanceRecords.find(
      (a) => a.employeeId === empId && a.date === dateStr && (a.status === 'On Leave' || a.status === 'WFH' || a.status === 'Absent')
    );
    if (attConflict) {
      return `Warning: Employee has attendance marked as "${attConflict.status}" on ${dateStr}.`;
    }

    // 3. Check Declared Holidays
    const holidayConflict = holidays.find((h) => h.holidayDate === dateStr);
    if (holidayConflict) {
      return `Notice: ${dateStr} is a declared company holiday (${holidayConflict.holidayName}).`;
    }

    // 4. Check Shift Weekly Off
    const shf = shiftMasters.find((s) => s.id === shfId);
    if (shf && shf.weeklyOff) {
      const dateObj = new Date(dateStr);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      if (shf.weeklyOff.toLowerCase() === dayName.toLowerCase()) {
        return `Notice: ${dayName} (${dateStr}) is designated as the weekly off for ${shf.shiftName}.`;
      }
    }

    return null;
  };

  // Run conflict check whenever employee, date, or shift changes
  useEffect(() => {
    if (formData.employeeId && formData.startDate) {
      const conflict = checkConflicts(formData.employeeId, formData.startDate, formData.shiftId);
      setConflictWarning(conflict);
    } else {
      setConflictWarning(null);
    }
  }, [formData.employeeId, formData.startDate, formData.shiftId, leaveRequests, holidays, attendanceRecords]);

  // Field validation
  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'employeeId': {
        if (!value || value === '') return 'Please select the employee.';
        return null;
      }
      case 'startDate': {
        if (!value || value === '') return 'Please select the shift date.';
        return null;
      }
      case 'endDate': {
        if (formData.startDate && value && value < formData.startDate) {
          return 'The end date cannot be earlier than the start date.';
        }
        return null;
      }
      case 'shiftId': {
        if (!value || value === '') return 'Please select the shift.';
        return null;
      }
      default:
        return null;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    const empErr = validateField('employeeId', formData.employeeId);
    if (empErr) errors.employeeId = empErr;

    const startErr = validateField('startDate', formData.startDate);
    if (startErr) errors.startDate = startErr;

    const endErr = validateField('endDate', formData.endDate);
    if (endErr) errors.endDate = endErr;

    const shiftErr = validateField('shiftId', formData.shiftId);
    if (shiftErr) errors.shiftId = shiftErr;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, (formData as any)[field]);
    setFormErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field] || formErrors[field]) {
      const error = validateField(field, value);
      setFormErrors((prev) => {
        const next = { ...prev };
        if (error) next[field] = error;
        else delete next[field];
        return next;
      });
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      shiftId: shiftMasters[0]?.id || '',
    });
    setFormErrors({});
    setConflictWarning(null);
    setTouched({});
    setShowModal(true);
  };

  const handleOpenEditModal = (roster: ShiftRosterItem) => {
    setEditingId(roster.id);
    setFormData({
      employeeId: roster.employeeId,
      startDate: roster.date,
      endDate: roster.date,
      shiftId: roster.shiftId,
      remarks: (roster as any).remarks || '',
    });
    setFormErrors({});
    setTouched({});
    setShowModal(true);
  };

  const executeDelete = () => {
    if (!deleteConfirmRoster) return;
    deleteShiftRoster(deleteConfirmRoster.id);
    setSuccessToast(`Shift allocation for ${deleteConfirmRoster.employeeName} deleted.`);
    setDeleteConfirmRoster(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      employeeId: true,
      startDate: true,
      endDate: true,
      shiftId: true,
    });

    if (!validateForm()) return;

    // Block if hard leave conflict
    if (conflictWarning && conflictWarning.startsWith('Conflict:')) {
      alert(conflictWarning);
      return;
    }

    try {
      const emp = availableEmployees.find((e) => e.id === formData.employeeId);
      const empName = emp?.name || `${(emp as any)?.firstName || ''} ${(emp as any)?.lastName || ''}`.trim() || 'Staff Employee';
      const dept = emp?.department || 'Production';
      const shf = shiftMasters.find((s) => s.id === formData.shiftId);
      const shiftName = shf?.shiftName || 'General Shift';

      if (editingId) {
        updateShiftRoster(editingId, {
          employeeId: formData.employeeId,
          employeeName: empName,
          department: dept,
          date: formData.startDate,
          shiftId: formData.shiftId,
          shiftName,
          assignedBy: 'Shop Floor Planning Head',
        });
        setSuccessToast(`Roster updated for ${empName} (${shiftName}).`);
      } else {
        addShiftRoster({
          employeeId: formData.employeeId,
          employeeName: empName,
          department: dept,
          date: formData.startDate,
          shiftId: formData.shiftId,
          shiftName,
          assignedBy: 'Shop Floor Planning Head',
        });
        setSuccessToast(`Shift "${shiftName}" successfully assigned to ${empName}.`);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(initialFormState);
      setFormErrors({});
      setConflictWarning(null);
      setTouched({});
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to assign shift roster:', err);
      setLoadError('The shift roster could not be saved. Please try again.');
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadError(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Filtered Roster
  const filteredRosters = useMemo(() => {
    return (shiftRosters || []).filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q) ||
        r.shiftName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);

      const matchesDept = selectedDeptFilter === 'ALL' || r.department.toLowerCase() === selectedDeptFilter.toLowerCase();
      const matchesDate = !selectedDateFilter || r.date === selectedDateFilter;

      return matchesSearch && matchesDept && matchesDate;
    });
  }, [shiftRosters, searchTerm, selectedDeptFilter, selectedDateFilter]);

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
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-700">
              <Calendar className="w-6 h-6" />
            </div>
            Shift Roster & Worker Allocation
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Weekly / Monthly Shift Scheduling across Production Cells, Assembly Lines, Maintenance & Office
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EBE3DB] hover:bg-[#F5EFEB] text-[#544B45] font-semibold text-xs rounded-lg transition shadow-sm"
            title="Reload roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Assign Shift Roster
          </button>
        </div>
      </div>

      {/* Error Banner */}
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

      {/* Filter Bar */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by employee, department, shift..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        <div>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.departmentName}>
                {d.departmentName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-indigo-600"
            title="Filter by shift date"
          />
        </div>
      </div>

      {/* Roster Table */}
      {isLoading ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#544B45]">Loading shift roster...</p>
        </div>
      ) : filteredRosters.length === 0 ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Calendar className="w-12 h-12 text-[#A89F91] mx-auto" />
          <h3 className="text-base font-bold text-[#211B17]">No shift allocations found</h3>
          <p className="text-xs text-[#70665F] max-w-md mx-auto">
            {searchTerm || selectedDeptFilter !== 'ALL' || selectedDateFilter
              ? 'No shift allocations match the selected filters.'
              : 'No shift roster assignments have been scheduled yet. Click "+ Assign Shift Roster" above.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#70665F] font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Roster Ref</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Assigned Date</th>
                  <th className="py-3.5 px-4">Shift Assigned</th>
                  <th className="py-3.5 px-4">Planner</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB]/60 text-[#211B17]">
                {filteredRosters.map((rst) => (
                  <tr key={rst.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {rst.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#211B17]">{rst.employeeName}</div>
                      <div className="text-[11px] text-[#70665F]">{rst.employeeId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#544B45]">{rst.department}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-800">
                      {rst.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200 inline-block text-[11px]">
                        {rst.shiftName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#70665F]">{rst.assignedBy || 'Shop Floor Head'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(rst)}
                          className="p-1.5 text-[#70665F] hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit roster"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmRoster(rst)}
                          className="p-1.5 text-[#70665F] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete roster"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Shift Roster Modal */}
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
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#211B17]">
                    {editingId ? 'Edit Shift Roster' : 'Assign Shift Roster'}
                  </h2>
                  <p className="text-xs text-[#70665F]">
                    Allocate plant workers to operational shifts with automated leave & holiday validation
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

            {/* Conflict Warning / Block Banner */}
            {conflictWarning && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                  conflictWarning.startsWith('Conflict:')
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>{conflictWarning.startsWith('Conflict:') ? 'Leave Conflict Detected' : 'Schedule Notice'}:</strong>
                  <p className="mt-0.5">{conflictWarning}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Select Employee */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  onBlur={() => handleBlur('employeeId')}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                    formErrors.employeeId
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                >
                  <option value="">-- Choose Employee --</option>
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name || `${(e as any).firstName || ''} ${(e as any).lastName || ''}`.trim()} ({e.department || 'Production'})
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

              {/* 2. Shift Date (Start & End) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Shift Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onBlur={() => handleBlur('startDate')}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                      formErrors.startDate
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-indigo-600'
                    }`}
                  />
                  {formErrors.startDate && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    End Date (For Range)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onBlur={() => handleBlur('endDate')}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                      formErrors.endDate
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-indigo-600'
                    }`}
                  />
                  {formErrors.endDate && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Select Shift Master */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Select Shift Master <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.shiftId}
                  onBlur={() => handleBlur('shiftId')}
                  onChange={(e) => handleChange('shiftId', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                    formErrors.shiftId
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                >
                  <option value="">-- Choose Shift Timing --</option>
                  {shiftMasters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shiftName} ({s.startTime} - {s.endTime} • {s.weeklyOff ? `Off: ${s.weeklyOff}` : 'Daily'})
                    </option>
                  ))}
                </select>
                {formErrors.shiftId && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.shiftId}
                  </p>
                )}
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
                  className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {editingId ? 'Update Roster' : 'Assign Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmRoster && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmRoster(null);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#211B17]">Delete Shift Allocation</h3>
                <p className="text-xs text-[#70665F]">{deleteConfirmRoster.id} • {deleteConfirmRoster.employeeName}</p>
              </div>
            </div>

            <p className="text-sm text-[#544B45] leading-relaxed">
              Are you sure you want to delete this shift allocation for <strong>{deleteConfirmRoster.employeeName}</strong> on {deleteConfirmRoster.date}?
            </p>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmRoster(null)}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
