'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Compass,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Trash2,
  Search,
  Filter,
  ShieldCheck,
  X,
  AlertCircle,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import { WFHRequest } from '../../../types/hr';

export default function WFHRemoteWorkPage() {
  const {
    wfhRequests,
    updateWFHRequestStatus,
    updateWFHRequest,
    deleteWFHRequest,
    availableEmployees,
  } = useERP();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Edit / Update Modal State
  const [editingRequest, setEditingRequest] = useState<WFHRequest | null>(null);
  const [editFormData, setEditFormData] = useState({
    fromDate: '',
    toDate: '',
    numberOfDays: 1,
    reason: '',
    workDescription: '',
    status: 'Pending' as WFHRequest['status'],
    remarks: '',
  });

  // Reject Modal State
  const [rejectingRequest, setRejectingRequest] = useState<WFHRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Stats
  const totalCount = wfhRequests.length;
  const pendingCount = wfhRequests.filter((w) => w.status === 'Pending').length;
  const approvedCount = wfhRequests.filter((w) => w.status === 'Approved').length;
  const rejectedCount = wfhRequests.filter((w) => w.status === 'Rejected').length;

  // Filtered List
  const filteredRequests = wfhRequests.filter((req) => {
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.wfhNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.workDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenEditModal = (req: WFHRequest) => {
    setEditingRequest(req);
    setEditFormData({
      fromDate: req.fromDate,
      toDate: req.toDate,
      numberOfDays: req.numberOfDays,
      reason: req.reason || '',
      workDescription: req.workDescription || '',
      status: req.status,
      remarks: req.remarks || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    updateWFHRequest(editingRequest.id, {
      fromDate: editFormData.fromDate,
      toDate: editFormData.toDate,
      numberOfDays: Number(editFormData.numberOfDays) || 1,
      reason: editFormData.reason,
      workDescription: editFormData.workDescription,
      status: editFormData.status,
      remarks: editFormData.remarks,
    });
    setEditingRequest(null);
  };

  const handleOpenRejectModal = (req: WFHRequest) => {
    setRejectingRequest(req);
    setRejectReason('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    updateWFHRequestStatus(
      rejectingRequest.id,
      'Rejected',
      rejectReason.trim() || 'Work From Home request rejected by HR Admin'
    );
    setRejectingRequest(null);
  };

  const handleConfirmDelete = (id: string) => {
    deleteWFHRequest(id);
    setDeletingId(null);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#EBE3DB] p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-violet-50 border border-violet-200 rounded-xl text-violet-600">
              <Compass className="w-6 h-6" />
            </div>
            WFH / Remote Work Portal
          </h1>
          <p className="text-xs text-[#70665F] mt-1.5">
            Admin HR Approval & Management Hub — Work From Home Requests with Automated Daily Attendance Sync
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-violet-50 border border-violet-200 text-violet-800 px-3.5 py-2 rounded-xl text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-violet-600" />
          <span>Admin Review & Approval Mode</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-[#70665F] font-medium">Total WFH Requests</div>
          <div className="text-2xl font-bold text-[#211B17] font-mono">{totalCount}</div>
          <div className="text-[10px] text-[#70665F]">Overall Submissions</div>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-amber-700 font-medium flex items-center justify-between">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono">{pendingCount}</div>
          <div className="text-[10px] text-amber-600">Awaiting Admin Action</div>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-emerald-700 font-medium flex items-center justify-between">
            <span>Approved WFH</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{approvedCount}</div>
          <div className="text-[10px] text-emerald-600">Attendance Synced</div>
        </div>

        <div className="bg-white border border-rose-200 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-rose-700 font-medium flex items-center justify-between">
            <span>Rejected Requests</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono">{rejectedCount}</div>
          <div className="text-[10px] text-rose-600">Declined / Closed</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
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
            placeholder="Search employee, WFH ref, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF7F2] text-xs text-[#211B17] pl-9 pr-4 py-2 rounded-xl border border-[#EBE3DB] focus:outline-none focus:border-violet-500 transition"
          />
        </div>
      </div>

      {/* WFH Requests Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#211B17]">
            <FileText className="w-4 h-4 text-violet-600" />
            WFH Applications ({filteredRequests.length})
          </div>
          <span className="text-xs text-[#70665F]">
            Approve, Reject, or Update remote work allocations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[11px] font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="py-3.5 px-4">WFH Ref</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Duration & Dates</th>
                <th className="py-3.5 px-4">Reason & Deliverables</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Approval Details</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#544B45]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#70665F]">
                    No WFH requests found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF7F2]/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-violet-700">
                      {req.wfhNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#211B17]">{req.employeeName}</div>
                      <div className="text-[11px] text-[#70665F]">{req.department}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono">
                      <div className="text-[#211B17]">{req.fromDate} to {req.toDate}</div>
                      <div className="text-violet-600 font-bold">{req.numberOfDays} Day(s)</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs space-y-0.5">
                      <div className="text-[#211B17] font-medium text-[11px] truncate">
                        {req.reason || 'Remote working'}
                      </div>
                      <div className="text-[10px] text-[#70665F] italic truncate">
                        &quot;{req.workDescription}&quot;
                      </div>
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
                    <td className="py-3 px-4 text-[11px] text-[#70665F]">
                      {req.approvedBy ? (
                        <div>
                          <div className="font-medium text-[#211B17]">{req.approvedBy}</div>
                          <div className="text-[10px] font-mono">{req.approvedDate || '—'}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#9E9E9E]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateWFHRequestStatus(req.id, 'Approved')}
                              title="Approve WFH Request"
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded-lg shadow-sm transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(req)}
                              title="Reject WFH Request"
                              className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold rounded-lg shadow-sm transition cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(req)}
                          title="Update / Edit WFH Details"
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

      {/* Edit / Update WFH Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-violet-600" />
                Update WFH Request: {editingRequest.wfhNumber}
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
                  <div className="text-[#70665F] text-[10px]">Department</div>
                  <div className="font-semibold text-[#544B45]">{editingRequest.department}</div>
                </div>
                <div>
                  <div className="text-[#70665F] text-[10px]">Ref No.</div>
                  <div className="font-mono font-bold text-violet-600">{editingRequest.wfhNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">From Date</label>
                  <input
                    type="date"
                    value={editFormData.fromDate}
                    onChange={(e) => setEditFormData({ ...editFormData, fromDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-violet-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">To Date</label>
                  <input
                    type="date"
                    value={editFormData.toDate}
                    onChange={(e) => setEditFormData({ ...editFormData, toDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-violet-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Days</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={editFormData.numberOfDays}
                    onChange={(e) => setEditFormData({ ...editFormData, numberOfDays: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-violet-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Reason for WFH</label>
                <input
                  type="text"
                  value={editFormData.reason}
                  onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Work Deliverables Description</label>
                <textarea
                  rows={2}
                  value={editFormData.workDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, workDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-violet-500 font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Admin Remarks / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Approved with daily work report requirement"
                    value={editFormData.remarks}
                    onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] font-semibold rounded-xl border border-[#EBE3DB] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject WFH Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Reject WFH Request
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
                Are you sure you want to reject the WFH request for{' '}
                <span className="font-bold text-[#211B17]">{rejectingRequest.employeeName}</span>{' '}
                ({rejectingRequest.wfhNumber})?
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter reason for rejection (e.g. Critical plant fabrication milestone requiring on-site presence)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] font-semibold rounded-xl border border-[#EBE3DB] transition"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-[#211B17]">Delete WFH Request?</h3>
            </div>
            <p className="text-xs text-[#70665F]">
              Are you sure you want to permanently delete this WFH request record? This action cannot be undone.
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
