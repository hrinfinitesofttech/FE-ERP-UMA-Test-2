'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  History,
  Plus,
  CheckCircle2,
  Clock,
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
  User,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { EarlyCheckoutRequest } from '../../../types/hr';

export default function EarlyCheckoutPage() {
  const {
    earlyCheckoutRequests,
    addEarlyCheckoutRequest,
    updateEarlyCheckoutStatus,
    updateEarlyCheckoutRequest,
    deleteEarlyCheckoutRequest,
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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<EarlyCheckoutRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<EarlyCheckoutRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<EarlyCheckoutRequest | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Form State for Request Early Checkout
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    shiftName: 'General Day Shift (09:00 - 18:00)',
    expectedCheckout: '18:00',
    requestedCheckout: '16:30',
    reason: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form State for Edit
  const [editFormData, setEditFormData] = useState<Partial<EarlyCheckoutRequest>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Helper: Get employee display name & info
  const getEmployeeInfo = (empId: string) => {
    const emp = employeeList.find((e) => e.id === empId);
    if (!emp) return { name: 'Staff Member', department: 'Production', designation: 'Staff', id: empId };
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

  // Open Submit Modal
  const handleOpenSubmitModal = () => {
    const firstEmp = employeeList[0];
    setFormData({
      employeeId: firstEmp ? firstEmp.id : '',
      date: new Date().toISOString().split('T')[0],
      shiftName: 'General Day Shift (09:00 - 18:00)',
      expectedCheckout: '18:00',
      requestedCheckout: '16:30',
      reason: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Form Validation for Submit
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.employeeId || formData.employeeId.trim() === '') {
      errors.employeeId = 'Please select an employee.';
    }
    if (!formData.date || formData.date.trim() === '') {
      errors.date = 'Please select the checkout date.';
    }
    if (!formData.requestedCheckout || formData.requestedCheckout.trim() === '') {
      errors.requestedCheckout = 'Please enter requested checkout time (e.g. 16:30).';
    }
    if (!formData.reason || formData.reason.trim().length < 5) {
      errors.reason = 'Please enter a valid reason for early checkout (minimum 5 characters).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const empInfo = getEmployeeInfo(formData.employeeId);

    addEarlyCheckoutRequest({
      employeeId: formData.employeeId,
      employeeName: empInfo.name,
      date: formData.date,
      shiftName: formData.shiftName,
      expectedCheckout: formData.expectedCheckout,
      requestedCheckout: formData.requestedCheckout,
      reason: formData.reason.trim(),
    });

    setShowModal(false);
    showToast(`Early checkout gate pass request submitted for ${empInfo.name}!`);
  };

  // Open Edit Modal
  const handleOpenEditModal = (req: EarlyCheckoutRequest) => {
    setEditingRequest(req);
    setEditFormData({ ...req });
    setEditErrors({});
  };

  // Submit Edit Form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    const errors: Record<string, string> = {};
    if (!editFormData.employeeId || editFormData.employeeId.trim() === '') {
      errors.employeeId = 'Please select an employee.';
    }
    if (!editFormData.requestedCheckout || editFormData.requestedCheckout.trim() === '') {
      errors.requestedCheckout = 'Please enter requested checkout time.';
    }
    if (!editFormData.reason || editFormData.reason.trim().length < 5) {
      errors.reason = 'Please enter a valid reason (minimum 5 characters).';
    }
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const empInfo = getEmployeeInfo(editFormData.employeeId || editingRequest.employeeId);

    updateEarlyCheckoutRequest(editingRequest.id, {
      ...editFormData,
      employeeName: empInfo.name,
      reason: editFormData.reason?.trim(),
    });

    setEditingRequest(null);
    showToast(`Early checkout request ${editingRequest.requestNumber} updated successfully!`);
  };

  // Approve Gate Pass
  const handleApprove = (id: string, refNo: string) => {
    updateEarlyCheckoutStatus(id, 'Approved');
    showToast(`Gate pass ${refNo} has been approved.`);
  };

  // Reject Modal & Submit
  const handleOpenRejectModal = (req: EarlyCheckoutRequest) => {
    setRejectingRequest(req);
    setRejectRemarks('');
  };

  const handleConfirmReject = () => {
    if (!rejectingRequest) return;
    updateEarlyCheckoutStatus(rejectingRequest.id, 'Rejected', rejectRemarks.trim() || 'Declined by HR Admin');
    setRejectingRequest(null);
    showToast(`Gate pass request ${rejectingRequest.requestNumber} has been rejected.`);
  };

  // Delete Gate Pass
  const handleConfirmDelete = () => {
    if (!deletingId) return;
    deleteEarlyCheckoutRequest(deletingId);
    setDeletingId(null);
    showToast('Early checkout record deleted successfully.');
  };

  // Filter & Search Logic
  const filteredRequests = useMemo(() => {
    return earlyCheckoutRequests.filter((req) => {
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.requestNumber.toLowerCase().includes(q) ||
        req.employeeName.toLowerCase().includes(q) ||
        req.employeeId.toLowerCase().includes(q) ||
        (req.shiftName && req.shiftName.toLowerCase().includes(q)) ||
        req.reason.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [earlyCheckoutRequests, statusFilter, searchQuery]);

  // KPI Statistics
  const totalCount = earlyCheckoutRequests.length;
  const pendingCount = earlyCheckoutRequests.filter((r) => r.status === 'Pending').length;
  const approvedCount = earlyCheckoutRequests.filter((r) => r.status === 'Approved').length;
  const rejectedCount = earlyCheckoutRequests.filter((r) => r.status === 'Rejected').length;

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen text-[#211B17]">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
              Module 9: HR & Attendance
            </span>
            <span className="text-xs text-[#70665F]">Real-time Database & Gate Security Sync</span>
          </div>
          <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2 mt-1">
            <History className="w-7 h-7 text-orange-600" />
            Early Checkout Permission Requests & Gate Passes
          </h1>
          <p className="text-xs text-[#70665F] mt-1">
            Pre-Approval Gate Passes for Early Shift Checkout, Official Site Visits & Half-Day Deduction Audits
          </p>
        </div>
        <button
          onClick={handleOpenSubmitModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-lg transition duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" /> Request Early Checkout
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#70665F]">Total Gate Passes</span>
            <History className="w-5 h-5 text-[#8D7B68]" />
          </div>
          <div className="text-2xl font-black text-[#211B17] mt-2">{totalCount}</div>
          <div className="text-xs text-[#70665F] mt-1">Total requests logged</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#70665F]">Pending Approvals</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</div>
          <div className="text-xs text-[#70665F] mt-1">Awaiting manager signoff</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#70665F]">Approved Passes</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{approvedCount}</div>
          <div className="text-xs text-[#70665F] mt-1">Authorized for gate exit</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#70665F]">Rejected Passes</span>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{rejectedCount}</div>
          <div className="text-xs text-[#70665F] mt-1">Declined requests</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Employee, ID, Req No, Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#EBE3DB] text-xs">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                statusFilter === st
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-[#70665F] hover:text-[#211B17]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Early Checkout Requests Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[11px] font-bold text-[#70665F] uppercase tracking-wider">
                <th className="p-3.5">Req No</th>
                <th className="p-3.5">Employee Name & ID</th>
                <th className="p-3.5">Date & Shift</th>
                <th className="p-3.5">Expected vs Requested Checkout</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#211B17]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#70665F]">
                    <History className="w-10 h-10 text-[#70665F]/40 mx-auto mb-2" />
                    <p className="font-semibold">No early checkout records found matching your filters.</p>
                    <p className="text-xs text-[#70665F]/80 mt-1">Click "Request Early Checkout" above to submit a new gate pass request.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="p-3.5 font-mono font-bold text-orange-600">{req.requestNumber}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#211B17] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#70665F]" />
                        {req.employeeName}
                      </div>
                      <div className="text-[11px] text-[#70665F] font-mono pl-5">ID: {req.employeeId}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#211B17] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#70665F]" />
                        {req.date}
                      </div>
                      <div className="text-[11px] text-[#70665F] flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-[#70665F]" />
                        {req.shiftName}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">
                      <div className="text-[#70665F]">Shift End: {req.expectedCheckout}</div>
                      <div className="text-orange-600 font-extrabold flex items-center gap-1 mt-0.5">
                        <LogOut className="w-3.5 h-3.5" /> Early Exit: {req.requestedCheckout}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="line-clamp-2 text-[#544B45] text-[11px] italic">
                        "{req.reason}"
                      </p>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                        {req.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        {req.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick View */}
                        <button
                          onClick={() => setViewingRequest(req)}
                          title="View Details"
                          className="p-1.5 text-[#70665F] hover:text-[#211B17] hover:bg-[#EBE3DB]/40 rounded transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve / Reject Actions */}
                        {req.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(req.id, req.requestNumber)}
                              title="Approve Gate Pass"
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(req)}
                              title="Reject Gate Pass"
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        ) : req.status === 'Approved' ? (
                          <button
                            onClick={() => handleOpenRejectModal(req)}
                            title="Reject this approved gate pass"
                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprove(req.id, req.requestNumber)}
                            title="Re-Approve gate pass"
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Re-Approve
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(req)}
                          title="Edit Details"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingId(req.id)}
                          title="Delete Request"
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition cursor-pointer"
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

      {/* ================= MODAL 1: REQUEST EARLY CHECKOUT ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-black text-[#211B17] flex items-center gap-2">
                <History className="w-5 h-5 text-orange-600" /> Request Early Checkout Permission
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Employee Selection */}
              <div>
                <label className="block font-bold text-[#211B17] mb-1">
                  Select Employee <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => {
                    setFormData({ ...formData, employeeId: e.target.value });
                    if (formErrors.employeeId) setFormErrors({ ...formErrors, employeeId: '' });
                  }}
                  className={`w-full px-3 py-2.5 bg-white border ${
                    formErrors.employeeId ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500' : 'border-[#EBE3DB]'
                  } rounded-lg text-xs text-[#211B17] focus:outline-none focus:ring-2 focus:ring-orange-500/30 font-medium`}
                >
                  <option value="">-- Choose Employee from List --</option>
                  {employeeList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {getEmployeeDisplayName(e)}
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.employeeId}
                  </p>
                )}
              </div>

              {/* Date & Shift Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#211B17] mb-1">
                    Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (formErrors.date) setFormErrors({ ...formErrors, date: '' });
                    }}
                    className={`w-full px-3 py-2 bg-white border ${
                      formErrors.date ? 'border-rose-500' : 'border-[#EBE3DB]'
                    } rounded-lg text-xs text-[#211B17]`}
                  />
                  {formErrors.date && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-[#211B17] mb-1">Current Assigned Shift</label>
                  <input
                    type="text"
                    value={formData.shiftName}
                    onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17]"
                  />
                </div>
              </div>

              {/* Expected Checkout & Requested Checkout */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#211B17] mb-1">Shift Standard End Time</label>
                  <input
                    type="text"
                    value={formData.expectedCheckout}
                    onChange={(e) => setFormData({ ...formData, expectedCheckout: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] font-mono"
                    placeholder="18:00"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#211B17] mb-1">
                    Requested Exit Time <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.requestedCheckout}
                    onChange={(e) => {
                      setFormData({ ...formData, requestedCheckout: e.target.value });
                      if (formErrors.requestedCheckout) setFormErrors({ ...formErrors, requestedCheckout: '' });
                    }}
                    className={`w-full px-3 py-2 bg-white border ${
                      formErrors.requestedCheckout ? 'border-rose-500' : 'border-[#EBE3DB]'
                    } rounded-lg text-xs text-[#211B17] font-mono font-bold`}
                    placeholder="e.g. 16:30"
                  />
                  {formErrors.requestedCheckout && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.requestedCheckout}</p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-[#211B17] mb-1">
                  Reason for Early Departure <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({ ...formData, reason: e.target.value });
                    if (formErrors.reason) setFormErrors({ ...formErrors, reason: '' });
                  }}
                  placeholder="e.g. Medical emergency appointment / Urgent official site visit to Client premises..."
                  className={`w-full px-3 py-2 bg-white border ${
                    formErrors.reason ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500' : 'border-[#EBE3DB]'
                  } rounded-lg text-xs text-[#211B17] focus:outline-none focus:ring-2 focus:ring-orange-500/30`}
                />
                {formErrors.reason ? (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.reason}
                  </p>
                ) : (
                  <p className="text-[10px] text-[#70665F] mt-1">
                    Approval required prior to security gate exit.
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#544B45] font-semibold rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs shadow-md transition"
                >
                  Submit Gate Pass Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT EARLY CHECKOUT ================= */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h2 className="text-lg font-black text-[#211B17] flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" /> Edit Early Checkout Request
                </h2>
                <p className="text-[11px] font-mono text-orange-600 font-bold">{editingRequest.requestNumber}</p>
              </div>
              <button
                onClick={() => setEditingRequest(null)}
                className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#211B17] mb-1">
                  Employee <span className="text-rose-600">*</span>
                </label>
                <select
                  value={editFormData.employeeId}
                  onChange={(e) => setEditFormData({ ...editFormData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17]"
                >
                  {employeeList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {getEmployeeDisplayName(e)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#211B17] mb-1">Date</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#211B17] mb-1">Requested Checkout Time</label>
                  <input
                    type="text"
                    value={editFormData.requestedCheckout}
                    onChange={(e) => setEditFormData({ ...editFormData, requestedCheckout: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#211B17] mb-1">
                  Reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editFormData.reason}
                  onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17]"
                />
                {editErrors.reason && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">{editErrors.reason}</p>
                )}
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#544B45] font-semibold rounded-lg text-xs transition"
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

      {/* ================= MODAL 3: VIEW DETAILS ================= */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h2 className="text-lg font-black text-[#211B17] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" /> Gate Pass Request Details
                </h2>
                <p className="text-xs font-mono font-bold text-orange-600">{viewingRequest.requestNumber}</p>
              </div>
              <button
                onClick={() => setViewingRequest(null)}
                className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs divide-y divide-[#EBE3DB]">
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#70665F] block">Employee:</span>
                  <span className="font-bold text-[#211B17]">{viewingRequest.employeeName}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Employee ID:</span>
                  <span className="font-mono font-semibold text-[#211B17]">{viewingRequest.employeeId}</span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#70665F] block">Date:</span>
                  <span className="font-semibold text-[#211B17]">{viewingRequest.date}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Shift:</span>
                  <span className="font-semibold text-[#211B17]">{viewingRequest.shiftName}</span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 bg-[#FAF7F2] p-3 rounded-lg">
                <div>
                  <span className="text-[#70665F] block">Standard End Time:</span>
                  <span className="font-mono font-bold text-[#211B17]">{viewingRequest.expectedCheckout}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Requested Exit:</span>
                  <span className="font-mono font-bold text-orange-600">{viewingRequest.requestedCheckout}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[#70665F] block font-semibold">Reason:</span>
                <p className="mt-1 text-[#211B17] italic bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EBE3DB]">
                  "{viewingRequest.reason}"
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#70665F] block">Status:</span>
                  <span className="font-bold text-[#211B17]">{viewingRequest.status}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EBE3DB] flex justify-end">
              <button
                onClick={() => setViewingRequest(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#544B45] font-semibold rounded-lg text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: REJECT CONFIRMATION ================= */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-black text-rose-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Reject Early Checkout Request
              </h2>
              <button
                onClick={() => setRejectingRequest(null)}
                className="text-[#70665F] hover:text-[#211B17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#544B45]">
              Are you sure you want to reject gate pass request <strong>{rejectingRequest.requestNumber}</strong> for{' '}
              <strong>{rejectingRequest.employeeName}</strong>?
            </p>

            <div>
              <label className="block font-bold text-[#211B17] text-xs mb-1">
                Reason for Rejection (Optional)
              </label>
              <textarea
                rows={2}
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="e.g. Critical shift delivery requires full presence today..."
                className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17]"
              />
            </div>

            <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
              <button
                onClick={() => setRejectingRequest(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#544B45] font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
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
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#211B17]">Delete Early Checkout Record?</h3>
            <p className="text-xs text-[#70665F]">
              This action cannot be undone and will permanently remove this gate pass record from the system and database.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#544B45] font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
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
