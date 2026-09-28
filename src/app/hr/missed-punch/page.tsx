'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Edit3,
  Trash2,
  Search,
  Filter,
  FileText,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';
import { MissedPunchRequest } from '../../../types/hr';

export default function MissedPunchPage() {
  const {
    missedPunchRequests,
    addMissedPunchRequest,
    updateMissedPunchStatus,
    updateMissedPunchRequest,
    deleteMissedPunchRequest,
    availableEmployees,
  } = useERP();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Submit Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    missingPunchType: 'Check-Out' as 'Check-In' | 'Check-Out' | 'Both',
    requestedTime: '18:05',
    reason: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Edit / Update Modal State
  const [editingRequest, setEditingRequest] = useState<MissedPunchRequest | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<MissedPunchRequest>>({});

  // Reject Modal State
  const [rejectingRequest, setRejectingRequest] = useState<MissedPunchRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Stats
  const totalCount = missedPunchRequests.length;
  const pendingCount = missedPunchRequests.filter((m) => m.status === 'Pending').length;
  const approvedCount = missedPunchRequests.filter((m) => m.status === 'Approved').length;
  const rejectedCount = missedPunchRequests.filter((m) => m.status === 'Rejected').length;

  // Filtered List
  const filteredRequests = missedPunchRequests.filter((req) => {
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.missingPunchType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getEmployeeDisplayName = (emp: any) => {
    if (!emp) return 'Staff Member';
    const fullName = emp.name || emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    const dept = emp.department || emp.departmentName || 'General';
    return `${fullName || emp.id} (${dept})`;
  };

  const handleOpenSubmitModal = () => {
    setFormData({
      employeeId: availableEmployees[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      missingPunchType: 'Check-Out',
      requestedTime: '18:05',
      reason: 'Biometric terminal network failure at main gate during evening shift exit.',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateSubmitForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.employeeId || formData.employeeId.trim() === '') {
      errors.employeeId = 'Please select a valid employee.';
    }
    if (!formData.date || formData.date.trim() === '') {
      errors.date = 'Please select the missed punch date.';
    }
    if (!formData.requestedTime || formData.requestedTime.trim() === '') {
      errors.requestedTime = 'Please enter the requested punch time (e.g. 18:05).';
    }
    if (!formData.reason || formData.reason.trim().length < 5) {
      errors.reason = 'Please provide a valid explanation/reason (minimum 5 characters).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSubmitForm()) return;

    const emp = availableEmployees.find((e) => e.id === formData.employeeId);
    const empName = emp?.name || (emp as any)?.employeeName || `${(emp as any)?.firstName || ''} ${(emp as any)?.lastName || ''}`.trim() || 'Staff Member';

    addMissedPunchRequest({
      employeeId: formData.employeeId,
      employeeName: empName,
      date: formData.date,
      missingPunchType: formData.missingPunchType,
      requestedTime: formData.requestedTime.trim(),
      reason: formData.reason.trim(),
      reportingManager: (emp as any)?.reportingManager || 'Rajesh Patel',
    });
    setShowModal(false);
  };

  const handleOpenEditModal = (req: MissedPunchRequest) => {
    setEditingRequest(req);
    setEditFormData({
      date: req.date,
      missingPunchType: req.missingPunchType,
      requestedTime: req.requestedTime,
      reason: req.reason,
      status: req.status,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    updateMissedPunchRequest(editingRequest.id, editFormData);
    setEditingRequest(null);
  };

  const handleOpenRejectModal = (req: MissedPunchRequest) => {
    setRejectingRequest(req);
    setRejectReason('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    updateMissedPunchStatus(
      rejectingRequest.id,
      'Rejected',
      rejectReason.trim() || 'Missed punch request rejected by HR Admin'
    );
    setRejectingRequest(null);
  };

  const handleConfirmDelete = (id: string) => {
    deleteMissedPunchRequest(id);
    setDeletingId(null);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#EBE3DB] p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            Missed Punch Request Portal
          </h1>
          <p className="text-xs text-[#70665F] mt-1.5">
            Biometric Technical Fault Corrections & Gate Punch Override Approvals • Stored in Database
          </p>
        </div>

        <button
          onClick={handleOpenSubmitModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Submit Missed Punch
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-[#70665F] font-medium">Total Requests</div>
          <div className="text-2xl font-bold text-[#211B17] font-mono">{totalCount}</div>
          <div className="text-[10px] text-[#70665F]">Overall Submissions</div>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-amber-700 font-medium flex items-center justify-between">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono">{pendingCount}</div>
          <div className="text-[10px] text-amber-600">Awaiting HR Sign-off</div>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-emerald-700 font-medium flex items-center justify-between">
            <span>Approved Punches</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{approvedCount}</div>
          <div className="text-[10px] text-emerald-600">Attendance Adjusted</div>
        </div>

        <div className="bg-white border border-rose-200 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-rose-700 font-medium flex items-center justify-between">
            <span>Rejected Requests</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono">{rejectedCount}</div>
          <div className="text-[10px] text-rose-600">Declined by HR</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#EBE3DB] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#EBE3DB]">
            <Filter className="w-3.5 h-3.5 text-[#70665F]" />
            <span className="text-xs text-[#544B45] font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs text-[#211B17] font-medium focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses ({totalCount})</option>
              <option value="Pending">Pending ({pendingCount})</option>
              <option value="Approved">Approved ({approvedCount})</option>
              <option value="Rejected">Rejected ({rejectedCount})</option>
            </select>
          </div>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, request no, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF7F2] text-xs text-[#211B17] pl-9 pr-4 py-2 rounded-xl border border-[#EBE3DB] focus:outline-none focus:border-orange-500 transition"
          />
        </div>
      </div>

      {/* Missed Punch Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#211B17]">
            <FileText className="w-4 h-4 text-orange-600" />
            Missed Punch Requests ({filteredRequests.length})
          </div>
          <span className="text-xs text-[#70665F]">
            Approve, Reject, or Edit attendance regularization overrides
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[11px] font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="py-3.5 px-4">Req No.</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Punch Type & Time</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#544B45]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#70665F]">
                    No missed punch requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF7F2]/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-orange-700">
                      {req.requestNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#211B17]">
                      {req.employeeName}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#544B45]">
                      {req.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-sky-700">
                      <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
                        {req.missingPunchType} @ {req.requestedTime}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-[#70665F] italic">
                      &quot;{req.reason}&quot;
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-300'
                        }`}
                      >
                        {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {req.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        {req.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => updateMissedPunchStatus(req.id, 'Approved')}
                              title="Approve Punch"
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(req)}
                              title="Reject Request"
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        ) : req.status === 'Approved' ? (
                          <button
                            onClick={() => handleOpenRejectModal(req)}
                            title="Reject this approved punch"
                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        ) : (
                          <button
                            onClick={() => updateMissedPunchStatus(req.id, 'Approved')}
                            title="Re-Approve punch"
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Re-Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(req)}
                          title="Edit Details"
                          className="p-1.5 bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] border border-[#EBE3DB] rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#544B45]" />
                        </button>
                        <button
                          onClick={() => setDeletingId(req.id)}
                          title="Delete Request"
                          className="p-1.5 bg-[#FAF7F2] hover:bg-rose-50 text-rose-600 border border-[#EBE3DB] rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Submit Missed Punch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Submit Missed Punch Request
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#70665F] hover:text-[#211B17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => {
                    setFormData({ ...formData, employeeId: e.target.value });
                    if (formErrors.employeeId) setFormErrors({ ...formErrors, employeeId: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none focus:border-orange-500 cursor-pointer font-medium ${
                    formErrors.employeeId ? 'border-rose-400 bg-rose-50' : 'border-[#EBE3DB]'
                  }`}
                >
                  <option value="">-- Select Employee --</option>
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {getEmployeeDisplayName(e)}
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="text-rose-600 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.employeeId}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                    }}
                    className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none focus:border-orange-500 font-mono ${
                      formErrors.date ? 'border-rose-400 bg-rose-50' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {formErrors.date && (
                    <p className="text-rose-600 text-[10px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">
                    Punch Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.missingPunchType}
                    onChange={(e) => setFormData({ ...formData, missingPunchType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-orange-500 cursor-pointer font-medium"
                  >
                    <option value="Check-In">Check-In</option>
                    <option value="Check-Out">Check-Out</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">
                  Requested Exact Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 18:05"
                  value={formData.requestedTime}
                  onChange={(e) => {
                    setFormData({ ...formData, requestedTime: e.target.value });
                    if (formErrors.requestedTime) setFormErrors({ ...formErrors, requestedTime: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-orange-500 ${
                    formErrors.requestedTime ? 'border-rose-400 bg-rose-50' : 'border-[#EBE3DB]'
                  }`}
                />
                {formErrors.requestedTime && (
                  <p className="text-rose-600 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.requestedTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">
                  Reason / Technical Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter reason for missed punch (e.g. Biometric sensor failure, official gate visit)..."
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({ ...formData, reason: e.target.value });
                    if (formErrors.reason) setFormErrors({ ...formErrors, reason: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none focus:border-orange-500 ${
                    formErrors.reason ? 'border-rose-400 bg-rose-50' : 'border-[#EBE3DB]'
                  }`}
                />
                {formErrors.reason && (
                  <p className="text-rose-600 text-[10px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.reason}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] font-semibold rounded-xl border border-[#EBE3DB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Update Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-600" />
                Update Missed Punch: {editingRequest.requestNumber}
              </h2>
              <button
                onClick={() => setEditingRequest(null)}
                className="text-[#70665F] hover:text-[#211B17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB] flex items-center justify-between">
                <div>
                  <div className="text-[#70665F] text-[10px]">Employee</div>
                  <div className="font-bold text-[#211B17]">{editingRequest.employeeName}</div>
                </div>
                <div>
                  <div className="text-[#70665F] text-[10px]">Req Number</div>
                  <div className="font-mono font-bold text-orange-600">{editingRequest.requestNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={editFormData.date || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Punch Type</label>
                  <select
                    value={editFormData.missingPunchType || 'Check-Out'}
                    onChange={(e) => setEditFormData({ ...editFormData, missingPunchType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="Check-In">Check-In</option>
                    <option value="Check-Out">Check-Out</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Requested Time</label>
                  <input
                    type="text"
                    value={editFormData.requestedTime || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, requestedTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Status</label>
                  <select
                    value={editFormData.status || 'Pending'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Reason</label>
                <textarea
                  rows={2}
                  value={editFormData.reason || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] font-semibold rounded-xl border border-[#EBE3DB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Reject Missed Punch Request
              </h2>
              <button
                onClick={() => setRejectingRequest(null)}
                className="text-[#70665F] hover:text-[#211B17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3.5 text-xs">
              <div className="text-[#544B45]">
                Are you sure you want to reject the missed punch request for{' '}
                <span className="font-bold text-[#211B17]">{rejectingRequest.employeeName}</span>{' '}
                ({rejectingRequest.requestNumber})?
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] font-semibold rounded-xl border border-[#EBE3DB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-[#211B17]">Delete Missed Punch Record?</h3>
            </div>
            <p className="text-xs text-[#70665F]">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] text-xs font-semibold rounded-xl border border-[#EBE3DB]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deletingId)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md"
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
