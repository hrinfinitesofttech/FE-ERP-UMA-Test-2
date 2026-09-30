'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  FileCheck2,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  X,
  ShieldAlert,
  Sparkles,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Building2,
  FileText,
  User,
} from 'lucide-react';
import { LeaveType, LeaveRequest } from '../../../types/hr';

const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  {
    id: 'LT-01',
    leaveCode: 'CL',
    leaveName: 'Casual Leave (CL)',
    annualQuota: 12,
    monthlyAccrual: 1,
    carryForwardAllowed: false,
    maxConsecutiveDays: 3,
    halfDayAllowed: true,
    attachmentRequired: false,
    status: 'Active',
  },
  {
    id: 'LT-02',
    leaveCode: 'SL',
    leaveName: 'Sick Leave (SL)',
    annualQuota: 12,
    monthlyAccrual: 1,
    carryForwardAllowed: true,
    maxConsecutiveDays: 7,
    halfDayAllowed: true,
    attachmentRequired: true,
    status: 'Active',
  },
  {
    id: 'LT-03',
    leaveCode: 'EL',
    leaveName: 'Earned / Privilege Leave (EL)',
    annualQuota: 18,
    monthlyAccrual: 1.5,
    carryForwardAllowed: true,
    maxConsecutiveDays: 15,
    halfDayAllowed: true,
    attachmentRequired: false,
    status: 'Active',
  },
  {
    id: 'LT-04',
    leaveCode: 'CO',
    leaveName: 'Compensatory Off (Comp-Off)',
    annualQuota: 6,
    monthlyAccrual: 0.5,
    carryForwardAllowed: false,
    maxConsecutiveDays: 2,
    halfDayAllowed: true,
    attachmentRequired: false,
    status: 'Active',
  },
  {
    id: 'LT-05',
    leaveCode: 'ML',
    leaveName: 'Maternity / Paternity Leave',
    annualQuota: 90,
    monthlyAccrual: 0,
    carryForwardAllowed: false,
    maxConsecutiveDays: 90,
    halfDayAllowed: false,
    attachmentRequired: true,
    status: 'Active',
  },
];

export default function LeaveManagementPage() {
  const {
    leaveTypes = [],
    leaveRequests = [],
    addLeaveRequest,
    updateLeaveRequestStatus,
    addLeaveType,
    availableEmployees = [],
    currentUser,
  } = useERP();

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activeLeaveTypes: LeaveType[] =
    leaveTypes && leaveTypes.length > 0 ? leaveTypes : DEFAULT_LEAVE_TYPES;

  // Apply Leave Form Initial State
  const initialApplyForm = {
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    leaveTypeId: activeLeaveTypes[0]?.id || 'LT-01',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    durationOption: 'Full Day' as 'Full Day' | 'First Half' | 'Second Half' | 'Half Day',
    reason: '',
  };

  const [formData, setFormData] = useState(initialApplyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Input refs for auto-focusing on first invalid field
  const employeeInputRef = useRef<HTMLSelectElement | null>(null);
  const leaveTypeInputRef = useRef<HTMLSelectElement | null>(null);
  const fromDateInputRef = useRef<HTMLInputElement | null>(null);
  const toDateInputRef = useRef<HTMLInputElement | null>(null);
  const reasonInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Admin New Leave Type Form Initial State
  const initialTypeForm = {
    leaveName: '',
    leaveCode: '',
    annualQuota: 12,
    monthlyAccrual: 1,
    maxConsecutiveDays: 5,
    carryForwardAllowed: false,
    halfDayAllowed: true,
    attachmentRequired: false,
  };

  const [newTypeData, setNewTypeData] = useState(initialTypeForm);
  const [typeErrors, setTypeErrors] = useState<Record<string, string>>({});

  // Calculate requested days
  const calculatedDays = useMemo(() => {
    if (formData.durationOption !== 'Full Day') return 0.5;
    if (!formData.fromDate || !formData.toDate) return 1;
    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [formData.fromDate, formData.toDate, formData.durationOption]);

  // Check if Apply form has unsaved modifications
  const isFormDirty = useMemo(() => {
    return (
      formData.reason.trim() !== '' ||
      formData.durationOption !== 'Full Day' ||
      formData.employeeId !== (availableEmployees[0]?.id || 'EMP-2026-001')
    );
  }, [formData, availableEmployees]);

  const closeApplyModalWithConfirm = () => {
    if (isFormDirty) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    setShowApplyModal(false);
    setFormData(initialApplyForm);
    setFormErrors({});
    setTouched({});
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showApplyModal) closeApplyModalWithConfirm();
        if (showAddTypeModal) setShowAddTypeModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showApplyModal, showAddTypeModal, isFormDirty]);

  // Field validation function
  const validateField = (field: string, val: any): string | null => {
    switch (field) {
      case 'employeeId': {
        if (!val || String(val).trim() === '') return 'Please select the employee.';
        return null;
      }
      case 'leaveTypeId': {
        if (!val || String(val).trim() === '') return 'Please select the leave type.';
        return null;
      }
      case 'fromDate': {
        if (!val || String(val).trim() === '') return 'Please select the start date.';
        return null;
      }
      case 'toDate': {
        if (!val || String(val).trim() === '') return 'Please select the end date.';
        if (formData.fromDate && val < formData.fromDate) {
          return 'The end date cannot be earlier than the start date.';
        }
        return null;
      }
      case 'reason': {
        const trimmed = (val || '').trim();
        if (!trimmed) return 'Please enter the reason for leave.';
        return null;
      }
      default:
        return null;
    }
  };

  const validateApplyForm = () => {
    const errors: Record<string, string> = {};

    const empErr = validateField('employeeId', formData.employeeId);
    if (empErr) errors.employeeId = empErr;

    const typeErr = validateField('leaveTypeId', formData.leaveTypeId);
    if (typeErr) errors.leaveTypeId = typeErr;

    const fromErr = validateField('fromDate', formData.fromDate);
    if (fromErr) errors.fromDate = fromErr;

    const toErr = validateField('toDate', formData.toDate);
    if (toErr) errors.toDate = toErr;

    const reasonErr = validateField('reason', formData.reason);
    if (reasonErr) errors.reason = reasonErr;

    // Leave Balance Check
    const selectedLeaveType = activeLeaveTypes.find((l) => l.id === formData.leaveTypeId);
    const annualQuota = selectedLeaveType?.annualQuota || 12;
    // Count used days by employee for this leave type
    const usedDays = leaveRequests
      .filter((r) => r.employeeId === formData.employeeId && r.leaveTypeId === formData.leaveTypeId && r.status !== 'Rejected')
      .reduce((sum, r) => sum + (Number(r.numberOfDays) || 1), 0);
    const availableBalance = Math.max(0, annualQuota - usedDays);

    if (calculatedDays > availableBalance) {
      errors.leaveTypeId = 'You do not have enough leave balance.';
    }

    setFormErrors(errors);

    // Auto focus first invalid field
    if (errors.employeeId && employeeInputRef.current) {
      employeeInputRef.current.focus();
    } else if (errors.leaveTypeId && leaveTypeInputRef.current) {
      leaveTypeInputRef.current.focus();
    } else if (errors.fromDate && fromDateInputRef.current) {
      fromDateInputRef.current.focus();
    } else if (errors.toDate && toDateInputRef.current) {
      toDateInputRef.current.focus();
    } else if (errors.reason && reasonInputRef.current) {
      reasonInputRef.current.focus();
    }

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

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      employeeId: true,
      leaveTypeId: true,
      fromDate: true,
      toDate: true,
      reason: true,
    });

    if (!validateApplyForm()) return;

    try {
      const emp = availableEmployees.find((e) => e.id === formData.employeeId);
      const lt = activeLeaveTypes.find((l) => l.id === formData.leaveTypeId) || activeLeaveTypes[0];
      const isHalf = formData.durationOption !== 'Full Day';
      const numDays = calculatedDays;

      addLeaveRequest({
        employeeId: formData.employeeId,
        employeeName: emp?.name || (emp as any)?.employeeName || 'Staff Member',
        department: emp?.department || 'Production',
        leaveTypeId: lt.id,
        leaveName: lt.leaveName || 'Casual Leave',
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        numberOfDays: numDays,
        isHalfDay: isHalf,
        halfDayType: isHalf ? (formData.durationOption as any) : 'Full Day',
        reason: formData.reason.trim(),
        reportingManager: (emp as any)?.reportingManagerName || (emp as any)?.reportingManager || 'Rajesh Patel (Department Head)',
      });

      setShowApplyModal(false);
      setFormData(initialApplyForm);
      setFormErrors({});
      setTouched({});
      setSuccessToast('Leave application submitted successfully.');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to submit leave:', err);
      setLoadError('The leave request could not be submitted. Please try again.');
    }
  };

  const handleCreateLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeData.leaveName.trim() || !newTypeData.leaveCode.trim()) return;

    try {
      if (addLeaveType) {
        addLeaveType({
          leaveName: newTypeData.leaveName.trim(),
          leaveCode: newTypeData.leaveCode.toUpperCase().trim(),
          annualQuota: Number(newTypeData.annualQuota) || 12,
          monthlyAccrual: Number(newTypeData.monthlyAccrual) || 1,
          maxConsecutiveDays: Number(newTypeData.maxConsecutiveDays) || 5,
          carryForwardAllowed: Boolean(newTypeData.carryForwardAllowed),
          halfDayAllowed: Boolean(newTypeData.halfDayAllowed),
          attachmentRequired: Boolean(newTypeData.attachmentRequired),
          status: 'Active',
        });
      }
      setShowAddTypeModal(false);
      setNewTypeData(initialTypeForm);
      setSuccessToast('New leave policy type created successfully.');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to create leave type:', err);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadError(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return (leaveRequests || []).filter((req) => {
      const empName = (req.employeeName || '').toLowerCase();
      const lName = (req.leaveName || '').toLowerCase();
      const lReason = (req.reason || '').toLowerCase();
      const lNo = (req.leaveNumber || req.id || '').toLowerCase();
      const q = (searchTerm || '').toLowerCase();

      const matchesSearch = !q || empName.includes(q) || lName.includes(q) || lReason.includes(q) || lNo.includes(q);
      const matchesStatus = statusFilter === 'all' || (req.status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === 'all' || req.leaveTypeId === typeFilter || req.leaveName === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaveRequests, searchTerm, statusFilter, typeFilter]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, pageSize]);

  // Paginated requests
  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#211B17] min-h-screen">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-700">
              <FileCheck2 className="w-6 h-6" />
            </div>
            Leave Policy Master & Application Portal
          </h1>
          <p className="text-xs text-[#70665F] mt-1">
            Configurable Leave Rules (CL, SL, EL, Comp-Off), Monthly Accruals & Half-Day Application Tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EBE3DB] hover:bg-[#FAF7F2] text-[#544B45] font-semibold text-xs rounded-xl transition shadow-xs cursor-pointer"
            title="Reload records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddTypeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Leave Type (Admin)
          </button>
          <button
            onClick={() => {
              setFormData(initialApplyForm);
              setFormErrors({});
              setTouched({});
              setShowApplyModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Apply for Leave
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-rose-800 text-xs">
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

      {/* Active Leave Types Quota Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#544B45] uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" /> Active Leave Quotas & Rules ({activeLeaveTypes.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeLeaveTypes.map((type) => (
            <div
              key={type.id}
              className="bg-white border border-[#EBE3DB] rounded-2xl p-4.5 space-y-3 shadow-xs hover:border-emerald-300 transition duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold font-mono">
                  {type.leaveCode}
                </span>
                <span className="text-[11px] font-semibold text-[#70665F]">
                  Quota: <strong className="text-[#211B17]">{type.annualQuota} Days/Yr</strong>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#211B17] leading-tight">{type.leaveName}</h3>
                <p className="text-[11px] text-[#70665F] mt-0.5">
                  Max {type.maxConsecutiveDays} days stretch • {type.halfDayAllowed ? 'Half-day allowed' : 'Full days only'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#EBE3DB]/60 flex items-center justify-between text-[11px] text-[#70665F]">
                <span>Accrual Rate:</span>
                <span className="font-semibold text-[#211B17]">{type.monthlyAccrual} day / mo</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#70665F]">
                <span>Carry Forward:</span>
                <span className={`font-semibold ${type.carryForwardAllowed ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {type.carryForwardAllowed ? 'Allowed' : 'No'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Leave Applications Management Section */}
      <div className="space-y-4">
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee, leave number, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Approval Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Leave Types</option>
              {activeLeaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.leaveName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#544B45]">Loading leave applications...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-[#A89F91] mx-auto" />
              <h3 className="text-base font-bold text-[#211B17]">No leave applications found</h3>
              <p className="text-xs text-[#70665F] max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No applications match your filter criteria.'
                  : 'No leave applications have been submitted yet. Click "Apply for Leave" to create a new application.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#70665F] font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4">Leave No.</th>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Leave Type</th>
                    <th className="py-3.5 px-4">Dates & Duration</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]/60 text-[#211B17]">
                  {paginatedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {req.leaveNumber || req.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#211B17]">{req.employeeName}</div>
                        <div className="text-[11px] text-[#70665F]">{req.department}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#544B45]">
                        {req.leaveName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-[#211B17]">
                          {req.fromDate} to {req.toDate}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                          {req.numberOfDays} Day(s) {req.isHalfDay ? `(${req.halfDayType || 'Half Day'})` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#70665F] max-w-xs truncate">
                        &ldquo;{req.reason}&rdquo;
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : req.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {req.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                updateLeaveRequestStatus(req.id, 'Approved', currentUser?.name || 'HR Manager');
                                setSuccessToast(`Leave ${req.leaveNumber || req.id} approved successfully.`);
                                setTimeout(() => setSuccessToast(null), 3000);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] transition shadow-xs cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                updateLeaveRequestStatus(req.id, 'Rejected', currentUser?.name || 'HR Manager');
                                setSuccessToast(`Leave ${req.leaveNumber || req.id} rejected.`);
                                setTimeout(() => setSuccessToast(null), 3000);
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-[11px] transition shadow-xs cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#A89F91] text-[11px] font-semibold">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination */}
          <div className="p-3.5 bg-white border-t border-[#EBE3DB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#70665F]">
            <div className="flex items-center gap-4">
              <div>
                Showing <span className="font-bold text-[#211B17]">{filteredRequests.length === 0 ? 0 : startIndex + 1}</span> to{' '}
                <span className="font-bold text-[#211B17]">{Math.min(startIndex + pageSize, filteredRequests.length)}</span> of{' '}
                <span className="font-bold text-[#211B17]">{filteredRequests.length}</span> requests
              </div>
              <div className="flex items-center gap-1.5">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-[#FAF7F2] border border-[#EBE3DB] rounded px-2 py-0.5 text-xs font-semibold text-[#211B17]"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#EBE3DB] disabled:opacity-30 hover:bg-[#FAF7F2] text-[#70665F] transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-[#211B17] px-2 font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#EBE3DB] disabled:opacity-30 hover:bg-[#FAF7F2] text-[#70665F] transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeApplyModalWithConfirm();
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative my-8"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" /> Apply for Employee Leave
                </h2>
              </div>
              <button
                type="button"
                onClick={closeApplyModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] p-1.5 rounded-lg hover:bg-[#FAF7F2] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} noValidate className="space-y-3.5 text-xs">
              {/* 1. Select Employee */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  ref={employeeInputRef}
                  value={formData.employeeId}
                  onBlur={() => handleBlur('employeeId')}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-[#211B17] font-semibold focus:outline-none transition ${
                    formErrors.employeeId
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-emerald-600'
                  }`}
                >
                  <option value="">-- Select Staff Member --</option>
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name || (e as any).employeeName} ({e.department || 'General'})
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.employeeId}
                  </p>
                )}
              </div>

              {/* 2. Leave Type */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Leave Type <span className="text-rose-500">*</span>
                </label>
                <select
                  ref={leaveTypeInputRef}
                  value={formData.leaveTypeId}
                  onBlur={() => handleBlur('leaveTypeId')}
                  onChange={(e) => handleChange('leaveTypeId', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-[#211B17] font-semibold focus:outline-none transition ${
                    formErrors.leaveTypeId
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-emerald-600'
                  }`}
                >
                  <option value="">-- Select Leave Category --</option>
                  {activeLeaveTypes.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.leaveName} • Quota: {l.annualQuota} Days/Yr
                    </option>
                  ))}
                </select>
                {formErrors.leaveTypeId && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.leaveTypeId}
                  </p>
                )}
              </div>

              {/* 3. Leave Duration Option */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Leave Duration / Half Day Option</label>
                <select
                  value={formData.durationOption}
                  onChange={(e) => setFormData({ ...formData, durationOption: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] font-medium focus:outline-none focus:border-emerald-600 transition"
                >
                  <option value="Full Day">Full Day (1 Day)</option>
                  <option value="First Half">First Half Leave (0.5 Day - 09:00 to 13:30)</option>
                  <option value="Second Half">Second Half Leave (0.5 Day - 13:30 to 18:00)</option>
                  <option value="Half Day">Half Day Leave (0.5 Day)</option>
                </select>
              </div>

              {/* 4. From Date & To Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    From Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={fromDateInputRef}
                    type="date"
                    value={formData.fromDate}
                    onBlur={() => handleBlur('fromDate')}
                    onChange={(e) => handleChange('fromDate', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono text-[#211B17] focus:outline-none transition ${
                      formErrors.fromDate
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.fromDate && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.fromDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    To Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={toDateInputRef}
                    type="date"
                    value={formData.toDate}
                    onBlur={() => handleBlur('toDate')}
                    onChange={(e) => handleChange('toDate', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono text-[#211B17] focus:outline-none transition ${
                      formErrors.toDate
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.toDate && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.toDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Calculated Total Days */}
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB] flex items-center justify-between text-xs">
                <span className="text-[#544B45] font-semibold">Total Days Requested:</span>
                <span className="font-bold text-emerald-800 text-sm font-mono">{calculatedDays} Day(s)</span>
              </div>

              {/* 5. Reason for Leave */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Reason for Leave <span className="text-rose-500">*</span>
                </label>
                <textarea
                  ref={reasonInputRef}
                  rows={2}
                  placeholder="Enter reason for leave..."
                  value={formData.reason}
                  onBlur={() => handleBlur('reason')}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-[#211B17] focus:outline-none transition ${
                    formErrors.reason
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-emerald-600'
                  }`}
                />
                {formErrors.reason && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.reason}
                  </p>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeApplyModalWithConfirm}
                  className="px-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] font-semibold rounded-xl hover:bg-[#EBE3DB] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin: Add New Leave Type Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-600" /> Add New Leave Type (Admin Policy)
                </h2>
                <p className="text-[11px] text-[#70665F]">Create custom company leave rules & yearly quotas</p>
              </div>
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeaveType} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[#544B45] font-semibold mb-1">Leave Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Festival Leave, Marriage Leave"
                    value={newTypeData.leaveName}
                    onChange={(e) => setNewTypeData({ ...newTypeData, leaveName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Leave Code (2-4 letters)</label>
                  <input
                    type="text"
                    placeholder="e.g. FL, ML"
                    value={newTypeData.leaveCode}
                    onChange={(e) => setNewTypeData({ ...newTypeData, leaveCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Annual Quota (Days/Year)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTypeData.annualQuota}
                    onChange={(e) => setNewTypeData({ ...newTypeData, annualQuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-amber-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Monthly Accrual (Days)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTypeData.monthlyAccrual}
                    onChange={(e) => setNewTypeData({ ...newTypeData, monthlyAccrual: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Max Consecutive Days</label>
                  <input
                    type="number"
                    value={newTypeData.maxConsecutiveDays}
                    onChange={(e) => setNewTypeData({ ...newTypeData, maxConsecutiveDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EBE3DB]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTypeData.halfDayAllowed}
                    onChange={(e) => setNewTypeData({ ...newTypeData, halfDayAllowed: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-[#3E2723]">Allow Half Day Applications</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTypeData.carryForwardAllowed}
                    onChange={(e) => setNewTypeData({ ...newTypeData, carryForwardAllowed: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-[#3E2723]">Allow Year-End Carry Forward</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddTypeModal(false)}
                  className="px-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] font-semibold rounded-xl hover:bg-[#EBE3DB] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Leave Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
