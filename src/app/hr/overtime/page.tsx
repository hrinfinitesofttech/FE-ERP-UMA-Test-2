'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Zap,
  Plus,
  DollarSign,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  Search,
  Filter,
  Edit3,
  Trash2,
  AlertCircle,
  Check,
  XCircle,
  Eye,
  Calendar,
  Building2,
  FileText,
  TrendingUp,
  User,
} from 'lucide-react';
import { OvertimeRecord } from '../../../types/hr';

export default function OvertimeManagementPage() {
  const {
    overtimeRecords,
    addOvertimeRecord,
    updateOvertimeStatus,
    updateOvertimeRecord,
    deleteOvertimeRecord,
    employees,
    availableEmployees: ctxAvailableEmployees,
  } = useERP();

  // Combine and deduplicate employees for reliable dropdown selection
  const employeeList = useMemo(() => {
    const list = ctxAvailableEmployees && ctxAvailableEmployees.length > 0
      ? ctxAvailableEmployees
      : employees && employees.length > 0
      ? employees
      : [];
    return list;
  }, [ctxAvailableEmployees, employees]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Processed in Payroll'>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OvertimeRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<OvertimeRecord | null>(null);
  const [rejectingRecord, setRejectingRecord] = useState<OvertimeRecord | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Form State for Log OT
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    regularHours: 8,
    overtimeHours: 4,
    reason: '',
    overtimeRateMultiplier: 1.5,
    hourlyBasicRate: 300,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form State for Edit OT
  const [editFormData, setEditFormData] = useState<Partial<OvertimeRecord> & { hourlyBasicRate?: number }>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Helper: Get employee display name & department
  const getEmployeeInfo = (empId: string) => {
    const emp = employeeList.find((e) => e.id === empId);
    if (!emp) return { name: 'Staff Member', department: 'Production', designation: 'Operator', id: empId };
    const name = emp.name || (emp as any).employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id;
    const department = emp.department || (emp as any).departmentName || 'Production';
    const designation = emp.designation || 'Staff';
    return { name, department, designation, id: emp.id };
  };

  const getEmployeeDisplayName = (emp: any) => {
    if (!emp) return 'Staff Member';
    const fullName = emp.name || emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id;
    const dept = emp.department || emp.departmentName || 'General';
    const desg = emp.designation ? ` - ${emp.designation}` : '';
    return `${emp.id}: ${fullName} (${dept}${desg})`;
  };

  // Open Log Modal with default values
  const handleOpenLogModal = () => {
    const firstEmp = employeeList[0];
    setFormData({
      employeeId: firstEmp ? firstEmp.id : '',
      date: new Date().toISOString().split('T')[0],
      regularHours: 8,
      overtimeHours: 4,
      reason: '',
      overtimeRateMultiplier: 1.5,
      hourlyBasicRate: 300,
    });
    setFormErrors({});
    setShowLogModal(true);
  };

  // Calculated OT Amount for Create
  const calculatedLogAmount = useMemo(() => {
    const hours = Number(formData.overtimeHours) || 0;
    const rate = Number(formData.hourlyBasicRate) || 0;
    const mult = Number(formData.overtimeRateMultiplier) || 1.5;
    return Math.round(hours * rate * mult);
  }, [formData.overtimeHours, formData.hourlyBasicRate, formData.overtimeRateMultiplier]);

  // Calculated OT Amount for Edit
  const calculatedEditAmount = useMemo(() => {
    const hours = Number(editFormData.overtimeHours) || 0;
    const rate = Number(editFormData.hourlyBasicRate) || 300;
    const mult = Number(editFormData.overtimeRateMultiplier) || 1.5;
    return Math.round(hours * rate * mult);
  }, [editFormData.overtimeHours, editFormData.hourlyBasicRate, editFormData.overtimeRateMultiplier]);

  // Validation for Create Form
  const validateLogForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.employeeId || formData.employeeId.trim() === '') {
      errors.employeeId = 'Please select an employee.';
    }
    if (!formData.date || formData.date.trim() === '') {
      errors.date = 'Please select a valid date.';
    }
    if (!formData.overtimeHours || formData.overtimeHours <= 0) {
      errors.overtimeHours = 'Overtime hours must be greater than 0.';
    } else if (formData.overtimeHours > 24) {
      errors.overtimeHours = 'Overtime hours cannot exceed 24 hours per shift.';
    }
    if (!formData.hourlyBasicRate || formData.hourlyBasicRate <= 0) {
      errors.hourlyBasicRate = 'Hourly basic rate must be greater than 0.';
    }
    if (!formData.reason || formData.reason.trim().length < 5) {
      errors.reason = 'Please enter a valid overtime justification (minimum 5 characters).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation for Edit Form
  const validateEditForm = () => {
    const errors: Record<string, string> = {};
    if (!editFormData.employeeId || editFormData.employeeId.trim() === '') {
      errors.employeeId = 'Please select an employee.';
    }
    if (!editFormData.date || editFormData.date.trim() === '') {
      errors.date = 'Please select a valid date.';
    }
    if (!editFormData.overtimeHours || editFormData.overtimeHours <= 0) {
      errors.overtimeHours = 'Overtime hours must be greater than 0.';
    }
    if (!editFormData.reason || editFormData.reason.trim().length < 5) {
      errors.reason = 'Please enter a valid overtime justification (minimum 5 characters).';
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogForm()) return;

    const empInfo = getEmployeeInfo(formData.employeeId);

    addOvertimeRecord({
      employeeId: formData.employeeId,
      employeeName: empInfo.name,
      department: empInfo.department,
      date: formData.date,
      regularHours: Number(formData.regularHours),
      overtimeHours: Number(formData.overtimeHours),
      reason: formData.reason.trim(),
      overtimeRateMultiplier: Number(formData.overtimeRateMultiplier),
      overtimeAmount: calculatedLogAmount,
      approvedBy: 'Pending Supervisor Approval',
    });

    setShowLogModal(false);
    showToast(`Overtime record successfully logged for ${empInfo.name}!`);
  };

  // Open Edit Modal
  const handleOpenEditModal = (record: OvertimeRecord) => {
    setEditingRecord(record);
    const hourlyRate = record.overtimeHours && record.overtimeRateMultiplier && record.overtimeAmount
      ? Math.round(record.overtimeAmount / (record.overtimeHours * record.overtimeRateMultiplier))
      : 300;

    setEditFormData({
      ...record,
      hourlyBasicRate: hourlyRate,
    });
    setEditErrors({});
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !validateEditForm()) return;

    const empInfo = getEmployeeInfo(editFormData.employeeId || editingRecord.employeeId);

    updateOvertimeRecord(editingRecord.id, {
      employeeId: editFormData.employeeId,
      employeeName: empInfo.name,
      department: empInfo.department,
      date: editFormData.date,
      regularHours: Number(editFormData.regularHours ?? 8),
      overtimeHours: Number(editFormData.overtimeHours),
      reason: editFormData.reason?.trim(),
      overtimeRateMultiplier: Number(editFormData.overtimeRateMultiplier),
      overtimeAmount: calculatedEditAmount,
    });

    setEditingRecord(null);
    showToast(`Overtime record ${editingRecord.overtimeNo} updated successfully!`);
  };

  // Approve OT
  const handleApprove = (id: string, refNo: string) => {
    updateOvertimeStatus(id, 'Approved', 'HR Admin / Production Supervisor');
    showToast(`Overtime ${refNo} has been approved and marked for payroll flow.`);
  };

  // Reject OT Modal & Submit
  const handleOpenRejectModal = (record: OvertimeRecord) => {
    setRejectingRecord(record);
    setRejectRemarks('');
  };

  const handleConfirmReject = () => {
    if (!rejectingRecord) return;
    updateOvertimeStatus(rejectingRecord.id, 'Rejected', 'HR Manager');
    if (rejectRemarks.trim()) {
      updateOvertimeRecord(rejectingRecord.id, {
        reason: `${rejectingRecord.reason} [Rejected: ${rejectRemarks.trim()}]`,
      });
    }
    setRejectingRecord(null);
    showToast(`Overtime record ${rejectingRecord.overtimeNo} has been rejected.`);
  };

  // Delete OT
  const handleConfirmDelete = () => {
    if (!deletingId) return;
    deleteOvertimeRecord(deletingId);
    setDeletingId(null);
    showToast('Overtime record deleted successfully.');
  };

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return overtimeRecords.filter((ot) => {
      const matchesStatus = statusFilter === 'All' || ot.status === statusFilter;
      const matchesDept = departmentFilter === 'All' || ot.department.toLowerCase() === departmentFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ot.overtimeNo.toLowerCase().includes(q) ||
        ot.employeeName.toLowerCase().includes(q) ||
        ot.employeeId.toLowerCase().includes(q) ||
        ot.department.toLowerCase().includes(q) ||
        ot.reason.toLowerCase().includes(q);
      return matchesStatus && matchesDept && matchesSearch;
    });
  }, [overtimeRecords, statusFilter, departmentFilter, searchQuery]);

  // Unique Departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    overtimeRecords.forEach((ot) => {
      if (ot.department) set.add(ot.department);
    });
    return Array.from(set);
  }, [overtimeRecords]);

  // KPI Statistics
  const totalCount = overtimeRecords.length;
  const totalOTHours = overtimeRecords.reduce((sum, r) => sum + (Number(r.overtimeHours) || 0), 0);
  const totalOTAmount = overtimeRecords.reduce((sum, r) => sum + (Number(r.overtimeAmount) || 0), 0);
  const pendingCount = overtimeRecords.filter((r) => r.status === 'Pending').length;
  const approvedCount = overtimeRecords.filter((r) => r.status === 'Approved' || r.status === 'Processed in Payroll').length;

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen text-[color:var(--crm-text-primary)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[color:var(--crm-border-default)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
              Module 9: HR & Payroll
            </span>
            <span className="text-xs text-[color:var(--crm-text-secondary)]">Real-time Database & Shift Sync</span>
          </div>
          <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight flex items-center gap-2 mt-1">
            <Zap className="w-7 h-7 text-red-600" />
            Overtime (OT) Management & Payroll Integration
          </h1>
          <p className="text-xs text-[color:var(--crm-text-secondary)] mt-1">
            Shop Floor Extra Work Hours Logging, Hourly Rate Multipliers (1.5x / 2.0x), Supervisor Approvals & Automated Flow to Monthly Payroll
          </p>
        </div>
        <button
          onClick={handleOpenLogModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" /> Log Overtime Entry
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-[color:var(--crm-border-default)] rounded-xl p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[color:var(--crm-text-secondary)]">Total OT Requests</span>
            <Clock className="w-5 h-5 text-[#607095]" />
          </div>
          <div className="text-2xl font-black text-[color:var(--crm-text-primary)] mt-2">{totalCount}</div>
          <div className="text-xs text-[color:var(--crm-text-secondary)] mt-1">Total entries logged</div>
        </div>

        <div className="bg-white border border-[color:var(--crm-border-default)] rounded-xl p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[color:var(--crm-text-secondary)]">Total OT Hours</span>
            <Zap className="w-5 h-5 text-crm-brand-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{totalOTHours} <span className="text-sm font-normal text-[color:var(--crm-text-secondary)]">Hrs</span></div>
          <div className="text-xs text-[color:var(--crm-text-secondary)] mt-1">Cumulative extra shop-floor time</div>
        </div>

        <div className="bg-white border border-[color:var(--crm-border-default)] rounded-xl p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[color:var(--crm-text-secondary)]">Total OT Payout</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">₹{totalOTAmount.toLocaleString()}</div>
          <div className="text-xs text-[color:var(--crm-text-secondary)] mt-1">Calculated overtime wages</div>
        </div>

        <div className="bg-white border border-[color:var(--crm-border-default)] rounded-xl p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[color:var(--crm-text-secondary)]">Pending Approval</span>
            <AlertCircle className="w-5 h-5 text-crm-brand-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</div>
          <div className="text-xs text-[color:var(--crm-text-secondary)] mt-1">Awaiting supervisor signoff</div>
        </div>

        <div className="bg-white border border-[color:var(--crm-border-default)] rounded-xl p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[color:var(--crm-text-secondary)]">Approved / Payroll</span>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{approvedCount}</div>
          <div className="text-xs text-[color:var(--crm-text-secondary)] mt-1">Ready for monthly payout</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[color:var(--crm-border-default)] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[color:var(--crm-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Employee, ID, OT Ref, Justification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[color:var(--crm-text-secondary)]">
            <Filter className="w-3.5 h-3.5" />
            <span>Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[color:var(--crm-bg-app)] p-1 rounded-lg border border-[color:var(--crm-border-default)] text-xs">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  statusFilter === st
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overtime Records Table */}
      <div className="bg-white border border-[color:var(--crm-border-default)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[color:var(--crm-bg-app)] border-b border-[color:var(--crm-border-default)] text-[11px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">
                <th className="p-3.5">OT Ref No</th>
                <th className="p-3.5">Employee Name & ID</th>
                <th className="p-3.5">Date & Department</th>
                <th className="p-3.5">Hours Logged</th>
                <th className="p-3.5">Rate & Amount</th>
                <th className="p-3.5">Justification / Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)] text-[color:var(--crm-text-primary)]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[color:var(--crm-text-secondary)]">
                    <Zap className="w-10 h-10 text-[#475467]/40 mx-auto mb-2" />
                    <p className="font-semibold">No overtime records found matching your filters.</p>
                    <p className="text-xs text-[#475467]/80 mt-1">Click "Log Overtime Entry" above to add new extra work hours.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((ot) => (
                  <tr key={ot.id} className="hover:bg-[#F4F6FA]/60 transition">
                    <td className="p-3.5 font-mono font-bold text-red-600">{ot.overtimeNo}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-[color:var(--crm-text-primary)] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[color:var(--crm-text-secondary)]" />
                        {ot.employeeName}
                      </div>
                      <div className="text-[11px] text-[color:var(--crm-text-secondary)] font-mono pl-5">ID: {ot.employeeId}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[color:var(--crm-text-primary)] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[color:var(--crm-text-secondary)]" />
                        {ot.date}
                      </div>
                      <div className="text-[11px] text-[color:var(--crm-text-secondary)] flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-[color:var(--crm-text-secondary)]" />
                        {ot.department}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-[color:var(--crm-text-secondary)]">Regular: {ot.regularHours} Hrs</div>
                      <div className="text-red-600 font-extrabold flex items-center gap-1 mt-0.5">
                        <Zap className="w-3 h-3 text-red-500" />
                        OT: +{ot.overtimeHours} Hrs
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">
                      <div className="text-[11px] text-[color:var(--crm-text-secondary)]">Multiplier: {ot.overtimeRateMultiplier}x</div>
                      <div className="text-emerald-700 font-black text-sm">₹{ot.overtimeAmount?.toLocaleString()}</div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="line-clamp-2 text-[color:var(--crm-text-secondary)] text-[11px] italic">
                        "{ot.reason}"
                      </p>
                      {ot.approvedBy && (
                        <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-0.5">By: {ot.approvedBy}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ot.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : ot.status === 'Processed in Payroll'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : ot.status === 'Rejected'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {ot.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                        {ot.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        {ot.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {ot.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick View */}
                        <button
                          onClick={() => setViewingRecord(ot)}
                          title="View Details"
                          className="p-1.5 text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] hover:bg-[#E2E7EF]/40 rounded transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {ot.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(ot.id, ot.overtimeNo)}
                              title="Approve OT"
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(ot)}
                              title="Reject OT"
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        ) : ot.status === 'Approved' ? (
                          <button
                            onClick={() => handleOpenRejectModal(ot)}
                            title="Reject this approved overtime"
                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        ) : ot.status === 'Rejected' ? (
                          <button
                            onClick={() => handleApprove(ot.id, ot.overtimeNo)}
                            title="Re-Approve overtime"
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition"
                          >
                            <Check className="w-3.5 h-3.5" /> Re-Approve
                          </button>
                        ) : null}

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(ot)}
                          title="Edit OT Record"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingId(ot.id)}
                          title="Delete OT Record"
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: LOG OVERTIME ENTRY ================= */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
              <h2 className="text-lg font-black text-[color:var(--crm-text-primary)] flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-600" /> Log Overtime Entry
              </h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              {/* Employee Selection */}
              <div>
                <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">
                  Select Employee <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => {
                    setFormData({ ...formData, employeeId: e.target.value });
                    if (formErrors.employeeId) setFormErrors({ ...formErrors, employeeId: '' });
                  }}
                  className={`w-full px-3 py-2.5 bg-white border ${
                    formErrors.employeeId ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500' : 'border-[color:var(--crm-border-default)]'
                  } rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500/30 font-medium`}
                >
                  <option value="">-- Choose Employee from List --</option>
                  {employeeList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {getEmployeeDisplayName(e)}
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="text-red-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.employeeId}
                  </p>
                )}
              </div>

              {/* Date & Regular Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                    }}
                    className={`w-full px-3 py-2 bg-white border ${
                      formErrors.date ? 'border-red-500' : 'border-[color:var(--crm-border-default)]'
                    } rounded-lg text-xs text-[color:var(--crm-text-primary)]`}
                  />
                  {formErrors.date && (
                    <p className="text-red-600 text-[11px] font-semibold mt-1">{formErrors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">Regular Shift Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="12"
                    value={formData.regularHours}
                    onChange={(e) => setFormData({ ...formData, regularHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)]"
                  />
                </div>
              </div>

              {/* OT Hours Logged & Hourly Basic Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">
                    OT Hours Logged <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={formData.overtimeHours}
                    onChange={(e) => {
                      setFormData({ ...formData, overtimeHours: Number(e.target.value) });
                      if (formErrors.overtimeHours) setFormErrors({ ...formErrors, overtimeHours: '' });
                    }}
                    className={`w-full px-3 py-2 bg-white border ${
                      formErrors.overtimeHours ? 'border-red-500' : 'border-[color:var(--crm-border-default)]'
                    } rounded-lg text-xs text-[color:var(--crm-text-primary)] font-bold`}
                    placeholder="e.g. 4.0"
                  />
                  {formErrors.overtimeHours && (
                    <p className="text-red-600 text-[11px] font-semibold mt-1">{formErrors.overtimeHours}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">
                    Hourly Basic Rate (₹) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={formData.hourlyBasicRate}
                    onChange={(e) => {
                      setFormData({ ...formData, hourlyBasicRate: Number(e.target.value) });
                      if (formErrors.hourlyBasicRate) setFormErrors({ ...formErrors, hourlyBasicRate: '' });
                    }}
                    className={`w-full px-3 py-2 bg-white border ${
                      formErrors.hourlyBasicRate ? 'border-red-500' : 'border-[color:var(--crm-border-default)]'
                    } rounded-lg text-xs text-[color:var(--crm-text-primary)]`}
                    placeholder="e.g. 300"
                  />
                  {formErrors.hourlyBasicRate && (
                    <p className="text-red-600 text-[11px] font-semibold mt-1">{formErrors.hourlyBasicRate}</p>
                  )}
                </div>
              </div>

              {/* Rate Multiplier & Live Calculated Amount Box */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">Rate Multiplier</label>
                  <select
                    value={formData.overtimeRateMultiplier}
                    onChange={(e) => setFormData({ ...formData, overtimeRateMultiplier: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)]"
                  >
                    <option value={1.5}>1.5x (Weekday Overtime)</option>
                    <option value={2.0}>2.0x (Holiday / Sunday Overtime)</option>
                    <option value={1.25}>1.25x (Early Morning Shift)</option>
                    <option value={1.0}>1.0x (Standard Hourly Extension)</option>
                  </select>
                </div>

                <div className="bg-[color:var(--crm-bg-app)] p-3 rounded-lg border border-[color:var(--crm-border-default)] flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-[color:var(--crm-text-secondary)]">Calculated Amount:</span>
                  <div className="text-lg font-black text-emerald-700">
                    ₹{calculatedLogAmount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[color:var(--crm-text-secondary)]">
                    ({formData.overtimeHours || 0} hrs × ₹{formData.hourlyBasicRate || 0} × {formData.overtimeRateMultiplier}x)
                  </span>
                </div>
              </div>

              {/* Overtime Justification (Reason) */}
              <div>
                <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">
                  Overtime Justification / Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({ ...formData, reason: e.target.value });
                    if (formErrors.reason) setFormErrors({ ...formErrors, reason: '' });
                  }}
                  placeholder="e.g. Urgent machine assembly and fabrication work for production dispatch..."
                  className={`w-full px-3 py-2 bg-white border ${
                    formErrors.reason ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500' : 'border-[color:var(--crm-border-default)]'
                  } rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500/30`}
                />
                {formErrors.reason ? (
                  <p className="text-red-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.reason}
                  </p>
                ) : (
                  <p className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">
                    Provide detailed justification for supervisor and payroll audit compliance.
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[color:var(--crm-border-default)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[color:var(--crm-text-secondary)] font-semibold rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-md transition"
                >
                  Save & Flow to Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT OVERTIME RECORD ================= */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
              <div>
                <h2 className="text-lg font-black text-[color:var(--crm-text-primary)] flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" /> Edit Overtime Record
                </h2>
                <p className="text-[11px] font-mono text-red-600 font-bold">{editingRecord.overtimeNo}</p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Employee Selection */}
              <div>
                <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">
                  Employee <span className="text-red-600">*</span>
                </label>
                <select
                  value={editFormData.employeeId}
                  onChange={(e) => setEditFormData({ ...editFormData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)]"
                >
                  {employeeList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {getEmployeeDisplayName(e)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Regular Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">Regular Shift Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editFormData.regularHours}
                    onChange={(e) => setEditFormData({ ...editFormData, regularHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)]"
                  />
                </div>
              </div>

              {/* OT Hours Logged & Hourly Basic Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">
                    OT Hours Logged <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={editFormData.overtimeHours}
                    onChange={(e) => setEditFormData({ ...editFormData, overtimeHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">Hourly Basic Rate (₹)</label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={editFormData.hourlyBasicRate}
                    onChange={(e) => setEditFormData({ ...editFormData, hourlyBasicRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)]"
                  />
                </div>
              </div>

              {/* Rate Multiplier & Calculated Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">Rate Multiplier</label>
                  <select
                    value={editFormData.overtimeRateMultiplier}
                    onChange={(e) => setEditFormData({ ...editFormData, overtimeRateMultiplier: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)]"
                  >
                    <option value={1.5}>1.5x (Weekday Overtime)</option>
                    <option value={2.0}>2.0x (Holiday / Sunday Overtime)</option>
                    <option value={1.25}>1.25x (Early Morning Shift)</option>
                    <option value={1.0}>1.0x (Standard Hourly Extension)</option>
                  </select>
                </div>

                <div className="bg-[color:var(--crm-bg-app)] p-3 rounded-lg border border-[color:var(--crm-border-default)] flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-[color:var(--crm-text-secondary)]">Calculated Amount:</span>
                  <div className="text-lg font-black text-emerald-700">
                    ₹{calculatedEditAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-[color:var(--crm-text-primary)] mb-1">
                  Overtime Justification <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editFormData.reason}
                  onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)]"
                />
                {editErrors.reason && (
                  <p className="text-red-600 text-[11px] font-semibold mt-1">{editErrors.reason}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[color:var(--crm-border-default)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[color:var(--crm-text-secondary)] font-semibold rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: VIEW OVERTIME DETAILS ================= */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
              <div>
                <h2 className="text-lg font-black text-[color:var(--crm-text-primary)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" /> Overtime Record Details
                </h2>
                <p className="text-xs font-mono font-bold text-red-600">{viewingRecord.overtimeNo}</p>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs divide-y divide-[color:var(--crm-border-default)]">
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Employee:</span>
                  <span className="font-bold text-[color:var(--crm-text-primary)]">{viewingRecord.employeeName}</span>
                </div>
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Employee ID:</span>
                  <span className="font-mono font-semibold text-[color:var(--crm-text-primary)]">{viewingRecord.employeeId}</span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Department:</span>
                  <span className="font-semibold text-[color:var(--crm-text-primary)]">{viewingRecord.department}</span>
                </div>
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Date:</span>
                  <span className="font-semibold text-[color:var(--crm-text-primary)]">{viewingRecord.date}</span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Regular Hrs:</span>
                  <span className="font-semibold text-[color:var(--crm-text-primary)]">{viewingRecord.regularHours} hrs</span>
                </div>
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">OT Hours:</span>
                  <span className="font-bold text-red-600">+{viewingRecord.overtimeHours} hrs</span>
                </div>
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Multiplier:</span>
                  <span className="font-bold text-[color:var(--crm-text-primary)]">{viewingRecord.overtimeRateMultiplier}x</span>
                </div>
              </div>

              <div className="pt-2 bg-[color:var(--crm-bg-app)] p-3 rounded-lg">
                <span className="text-[color:var(--crm-text-secondary)] block font-semibold">Total Overtime Calculated Amount:</span>
                <span className="text-xl font-black text-emerald-700">₹{viewingRecord.overtimeAmount?.toLocaleString()}</span>
              </div>

              <div className="pt-2">
                <span className="text-[color:var(--crm-text-secondary)] block font-semibold">Justification / Reason:</span>
                <p className="mt-1 text-[color:var(--crm-text-primary)] italic bg-[color:var(--crm-bg-app)] p-2.5 rounded-lg border border-[color:var(--crm-border-default)]">
                  "{viewingRecord.reason}"
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Status:</span>
                  <span className="font-bold text-[color:var(--crm-text-primary)]">{viewingRecord.status}</span>
                </div>
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Approver / Reviewer:</span>
                  <span className="font-semibold text-[color:var(--crm-text-primary)]">{viewingRecord.approvedBy || 'Pending'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[color:var(--crm-border-default)] flex justify-end">
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[color:var(--crm-text-secondary)] font-semibold rounded-lg text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: REJECT CONFIRMATION ================= */}
      {rejectingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
              <h2 className="text-lg font-black text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Reject Overtime Request
              </h2>
              <button
                onClick={() => setRejectingRecord(null)}
                className="text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[color:var(--crm-text-secondary)]">
              Are you sure you want to reject overtime record <strong>{rejectingRecord.overtimeNo}</strong> for{' '}
              <strong>{rejectingRecord.employeeName}</strong>?
            </p>

            <div>
              <label className="block font-bold text-[color:var(--crm-text-primary)] text-xs mb-1">
                Reason for Rejection (Optional)
              </label>
              <textarea
                rows={2}
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="e.g. Extra hours were not pre-authorized by shop supervisor..."
                className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)]"
              />
            </div>

            <div className="pt-3 border-t border-[color:var(--crm-border-default)] flex justify-end gap-3">
              <button
                onClick={() => setRejectingRecord(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[color:var(--crm-text-secondary)] font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: DELETE CONFIRMATION ================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-crm-brand-50 text-crm-brand-700 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[color:var(--crm-text-primary)]">Delete Overtime Record?</h3>
            <p className="text-xs text-[color:var(--crm-text-secondary)]">
              This action cannot be undone and will permanently remove this overtime record from the system and database.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[color:var(--crm-text-secondary)] font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
