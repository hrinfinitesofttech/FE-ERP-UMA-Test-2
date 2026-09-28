'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  TrendingUp,
  Plus,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  Search,
  Filter,
  AlertCircle,
  Award,
  Edit2,
  Trash2,
  Check,
  XCircle,
  Eye,
  Percent,
  UserCheck,
  Building,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { EmployeeAppraisal } from '../../../types/hr';

export default function AppraisalPage() {
  const {
    employeeAppraisals,
    addEmployeeAppraisal,
    updateEmployeeAppraisal,
    deleteEmployeeAppraisal,
    updateAppraisalStatus,
    availableEmployees: ctxAvailableEmployees,
    employees,
  } = useERP();

  // Combine and deduplicate employees for reliable dropdown selection
  const employeeList = useMemo(() => {
    const list =
      ctxAvailableEmployees && ctxAvailableEmployees.length > 0
        ? ctxAvailableEmployees
        : employees && employees.length > 0
        ? employees
        : [];
    return list;
  }, [ctxAvailableEmployees, employees]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Self Review Pending' | 'Manager Review Pending' | 'HR Approved' | 'Completed' | 'Approved' | 'Rejected'>('All');
  const [cycleFilter, setCycleFilter] = useState('All');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingAppraisal, setEditingAppraisal] = useState<EmployeeAppraisal | null>(null);
  const [viewingAppraisal, setViewingAppraisal] = useState<EmployeeAppraisal | null>(null);
  const [rejectingAppraisal, setRejectingAppraisal] = useState<EmployeeAppraisal | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Form State for Initiate Appraisal Review
  const [formData, setFormData] = useState({
    employeeId: '',
    cyclePeriod: 'FY 2025-26 Annual',
    selfRating: 4,
    managerRating: 4.5,
    managerComments: 'Exceptional performance in shop floor tooling Optimization and zero-accident safety record.',
    promotionRecommended: true,
    recommendedIncrementPct: 15,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form State for Editing Appraisal
  const [editFormData, setEditFormData] = useState<Partial<EmployeeAppraisal>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Helper to extract employee details safely
  const getEmployeeInfo = (empId: string) => {
    const emp = employeeList.find((e) => e.id === empId);
    if (!emp) return { name: 'Staff Member', department: 'Production', designation: 'Staff', id: empId };
    const name =
      emp.name ||
      (emp as any).employeeName ||
      `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
      emp.id;
    const department = emp.department || (emp as any).departmentName || 'Production';
    const designation = emp.designation || 'Staff';
    return { name, department, designation, id: emp.id };
  };

  const getEmployeeDisplayName = (emp: any) => {
    if (!emp) return 'Staff Member';
    const fullName =
      emp.name ||
      emp.employeeName ||
      `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
      emp.id;
    const dept = emp.department || emp.departmentName || 'General';
    const desg = emp.designation ? ` - ${emp.designation}` : '';
    return `${emp.id}: ${fullName} (${dept}${desg})`;
  };

  // Open Initiate Modal
  const handleOpenInitiateModal = () => {
    const firstEmp = employeeList[0];
    setFormData({
      employeeId: firstEmp ? firstEmp.id : '',
      cyclePeriod: 'FY 2025-26 Annual',
      selfRating: 4,
      managerRating: 4.5,
      managerComments: 'Exceptional performance in shop floor tooling Optimization and zero-accident safety record.',
      promotionRecommended: true,
      recommendedIncrementPct: 15,
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.employeeId || formData.employeeId.trim() === '') {
      errors.employeeId = 'Please select a valid employee.';
    }
    if (formData.selfRating < 1 || formData.selfRating > 5) {
      errors.selfRating = 'Self rating must be between 1 and 5.';
    }
    if (formData.managerRating < 1 || formData.managerRating > 5) {
      errors.managerRating = 'Manager rating must be between 1 and 5.';
    }
    if (!formData.managerComments || formData.managerComments.trim().length < 5) {
      errors.managerComments = 'Manager evaluation notes are required (min 5 characters).';
    }
    if (formData.recommendedIncrementPct < 0 || formData.recommendedIncrementPct > 100) {
      errors.recommendedIncrementPct = 'Increment % must be between 0% and 100%.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const empInfo = getEmployeeInfo(formData.employeeId);
    const selfScore = Number(formData.selfRating);
    const mgrScore = Number(formData.managerRating);
    const finalScore = Number(((selfScore * 0.4) + (mgrScore * 0.6)).toFixed(1));

    addEmployeeAppraisal({
      employeeId: formData.employeeId,
      employeeName: empInfo.name,
      department: empInfo.department,
      cyclePeriod: formData.cyclePeriod,
      kpiScore: mgrScore,
      selfRating: selfScore,
      managerRating: mgrScore,
      finalScore: finalScore,
      managerComments: formData.managerComments.trim(),
      promotionRecommended: Boolean(formData.promotionRecommended),
      recommendedIncrementPct: Number(formData.recommendedIncrementPct),
      status: 'Manager Review Pending',
    });

    setShowModal(false);
    showToast(`Appraisal review initiated successfully for ${empInfo.name}!`);
  };

  // Open Edit Modal
  const handleOpenEditModal = (apr: EmployeeAppraisal) => {
    setEditingAppraisal(apr);
    setEditFormData({ ...apr });
    setEditErrors({});
  };

  // Submit Edit Form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppraisal) return;

    const errors: Record<string, string> = {};
    if (!editFormData.employeeId || editFormData.employeeId.trim() === '') {
      errors.employeeId = 'Please select an employee.';
    }
    if (Number(editFormData.selfRating) < 1 || Number(editFormData.selfRating) > 5) {
      errors.selfRating = 'Self rating must be between 1 and 5.';
    }
    if (Number(editFormData.managerRating) < 1 || Number(editFormData.managerRating) > 5) {
      errors.managerRating = 'Manager rating must be between 1 and 5.';
    }
    if (!editFormData.managerComments || editFormData.managerComments.trim().length < 5) {
      errors.managerComments = 'Manager evaluation notes are required (min 5 characters).';
    }
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const empInfo = getEmployeeInfo(editFormData.employeeId || editingAppraisal.employeeId);
    const selfScore = Number(editFormData.selfRating || editingAppraisal.selfRating);
    const mgrScore = Number(editFormData.managerRating || editingAppraisal.managerRating);
    const finalScore = Number(((selfScore * 0.4) + (mgrScore * 0.6)).toFixed(1));

    updateEmployeeAppraisal(editingAppraisal.id, {
      ...editFormData,
      employeeName: empInfo.name,
      department: empInfo.department,
      finalScore: finalScore,
      managerComments: editFormData.managerComments?.trim(),
    });

    setEditingAppraisal(null);
    showToast(`Appraisal ${editingAppraisal.appraisalNumber} updated successfully!`);
  };

  // Approve Appraisal
  const handleApprove = (id: string, aprNo: string) => {
    updateAppraisalStatus(id, 'Approved');
    showToast(`Appraisal ${aprNo} has been HR Approved & Finalized!`);
  };

  // Final HR Sign-off
  const handleComplete = (id: string, aprNo: string) => {
    updateAppraisalStatus(id, 'Completed');
    showToast(`Appraisal ${aprNo} completed. Salary revision applied!`);
  };

  // Reject Modal & Action
  const handleOpenRejectModal = (apr: EmployeeAppraisal) => {
    setRejectingAppraisal(apr);
    setRejectRemarks('');
  };

  const handleConfirmReject = () => {
    if (!rejectingAppraisal) return;
    updateAppraisalStatus(rejectingAppraisal.id, 'Rejected', rejectRemarks.trim() || 'Declined during HR Review');
    setRejectingAppraisal(null);
    showToast(`Appraisal ${rejectingAppraisal.appraisalNumber} has been rejected.`);
  };

  // Delete Appraisal
  const handleConfirmDelete = () => {
    if (!deletingId) return;
    deleteEmployeeAppraisal(deletingId);
    setDeletingId(null);
    showToast('Appraisal record deleted successfully.');
  };

  // Filter & Search Logic
  const filteredAppraisals = useMemo(() => {
    return employeeAppraisals.filter((apr) => {
      const matchesStatus = statusFilter === 'All' || apr.status === statusFilter;
      const matchesCycle = cycleFilter === 'All' || apr.cyclePeriod === cycleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apr.appraisalNumber.toLowerCase().includes(q) ||
        apr.employeeName.toLowerCase().includes(q) ||
        apr.employeeId.toLowerCase().includes(q) ||
        apr.department.toLowerCase().includes(q) ||
        apr.cyclePeriod.toLowerCase().includes(q) ||
        apr.managerComments.toLowerCase().includes(q);
      return matchesStatus && matchesCycle && matchesSearch;
    });
  }, [employeeAppraisals, statusFilter, cycleFilter, searchQuery]);

  // KPI Statistics
  const totalCount = employeeAppraisals.length;
  const pendingCount = employeeAppraisals.filter((r) => r.status.includes('Pending')).length;
  const approvedCount = employeeAppraisals.filter((r) => r.status === 'Approved' || r.status === 'Completed' || r.status === 'HR Approved').length;
  const rejectedCount = employeeAppraisals.filter((r) => r.status === 'Rejected').length;
  const avgIncrement =
    totalCount > 0
      ? (employeeAppraisals.reduce((sum, a) => sum + Number(a.recommendedIncrementPct || 0), 0) / totalCount).toFixed(1)
      : '0';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
      case 'HR Approved':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
      case 'Rejected':
        return 'bg-rose-500/15 text-rose-700 border-rose-500/30';
      default:
        return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen text-[#211B17]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            Annual Appraisal & Performance Review
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            6-Step Appraisal Workflow: Self Review &rarr; Manager Rating &rarr; HR Review &rarr; Increment Approval &rarr; Salary Revision
          </p>
        </div>
        <button
          onClick={handleOpenInitiateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> Initiate Appraisal Review
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Appraisals</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#211B17]">{totalCount}</div>
          <div className="text-xs text-[#70665F]">Active performance evaluations</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Reviews</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="text-xs text-[#70665F]">Awaiting Manager / HR sign-off</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved / Final</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{approvedCount}</div>
          <div className="text-xs text-[#70665F]">Promotions & increments finalized</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg. Increment</span>
            <Percent className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-2xl font-black text-crm-brand-700">+{avgIncrement}%</div>
          <div className="text-xs text-[#70665F]">Recommended salary hike</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Employee, ID, Dept or Notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#EBE3DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[#211B17]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-[#70665F] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#EBE3DB] rounded-lg font-medium text-[#211B17]"
          >
            <option value="All">All Statuses ({totalCount})</option>
            <option value="Self Review Pending">Self Review Pending</option>
            <option value="Manager Review Pending">Manager Review Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Appraisals Grid */}
      {filteredAppraisals.length === 0 ? (
        <div className="bg-white border border-[#EBE3DB] rounded-xl p-12 text-center space-y-3 shadow-sm">
          <TrendingUp className="w-12 h-12 text-[#70665F]/40 mx-auto" />
          <div className="text-base font-bold text-[#211B17]">No Appraisal Reviews Found</div>
          <p className="text-xs text-[#70665F] max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'All'
              ? 'No evaluations match your search filter criteria. Try resetting filters.'
              : 'No performance appraisal cycles initiated yet. Click "Initiate Appraisal Review" to get started.'}
          </p>
          {(searchQuery || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-xs font-semibold text-[#211B17] rounded-lg transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppraisals.map((apr) => (
            <div
              key={apr.id}
              className="bg-white border border-[#EBE3DB] rounded-xl p-6 space-y-4 shadow-md hover:shadow-lg hover:border-emerald-500/40 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-[#EBE3DB] pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {apr.appraisalNumber}
                    </span>
                    <h3 className="text-base font-bold text-[#211B17] mt-1">{apr.employeeName}</h3>
                    <div className="text-xs text-[#70665F] mt-0.5 flex items-center gap-2">
                      <span>ID: <strong>{apr.employeeId}</strong></span>
                      <span>•</span>
                      <span>Dept: <strong>{apr.department}</strong></span>
                      <span>•</span>
                      <span>Cycle: <strong>{apr.cyclePeriod}</strong></span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                      apr.status
                    )}`}
                  >
                    {apr.status}
                  </span>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-3 gap-3 bg-[#FAF7F2] p-3 rounded-lg border border-[#EBE3DB] text-center text-xs">
                  <div>
                    <span className="text-[#70665F] block font-medium">Self Rating</span>
                    <span className="font-bold text-[#211B17] text-sm">{apr.selfRating} / 5</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block font-medium">Manager Rating</span>
                    <span className="font-bold text-amber-600 text-sm">{apr.managerRating} / 5</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block font-medium">Weighted Score</span>
                    <span className="font-extrabold text-emerald-700 text-sm">{apr.finalScore} / 5</span>
                  </div>
                </div>

                {/* Evaluation Notes */}
                <div className="text-xs text-[#544B45] space-y-2">
                  <div>
                    <span className="font-bold text-[#70665F]">Manager Evaluation Notes:</span>
                    <div className="italic text-[#544B45] mt-0.5 bg-white p-2 rounded border border-[#EBE3DB]/70 text-xs">
                      &quot;{apr.managerComments}&quot;
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-[#EBE3DB] text-xs">
                    <span>
                      Promotion Recommended:{' '}
                      <strong className={apr.promotionRecommended ? 'text-emerald-600' : 'text-[#70665F]'}>
                        {apr.promotionRecommended ? '✓ Yes' : '✗ No'}
                      </strong>
                    </span>
                    <span>
                      Recommended Increment:{' '}
                      <strong className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        +{apr.recommendedIncrementPct}%
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewingAppraisal(apr)}
                    className="p-1.5 text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2] rounded-lg transition"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(apr)}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                    title="Edit Appraisal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(apr.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {apr.status !== 'Approved' && apr.status !== 'Completed' && (
                    <>
                      <button
                        onClick={() => handleOpenRejectModal(apr)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(apr.id, apr.appraisalNumber)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    </>
                  )}
                  {apr.status === 'Approved' && (
                    <button
                      onClick={() => handleComplete(apr.id, apr.appraisalNumber)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow transition"
                    >
                      Final HR Sign-off & Apply Revision
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Initiate Appraisal Review */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Initiate Appraisal Review
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Employee Selection */}
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => {
                    setFormData({ ...formData, employeeId: e.target.value });
                    if (formErrors.employeeId) {
                      setFormErrors((prev) => ({ ...prev, employeeId: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 bg-white border ${
                    formErrors.employeeId ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17] font-medium`}
                >
                  <option value="">-- Choose Employee --</option>
                  {employeeList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {getEmployeeDisplayName(e)}
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.employeeId}
                  </p>
                )}
              </div>

              {/* Appraisal Cycle */}
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Appraisal Cycle Period</label>
                <input
                  type="text"
                  value={formData.cyclePeriod}
                  onChange={(e) => setFormData({ ...formData, cyclePeriod: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  placeholder="e.g. FY 2025-26 Annual Review"
                />
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">
                    Self Rating (1-5) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="5"
                    value={formData.selfRating}
                    onChange={(e) => setFormData({ ...formData, selfRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                  {formErrors.selfRating && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.selfRating}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">
                    Manager Rating (1-5) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="5"
                    value={formData.managerRating}
                    onChange={(e) => setFormData({ ...formData, managerRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                  {formErrors.managerRating && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.managerRating}</p>
                  )}
                </div>
              </div>

              {/* Manager Evaluation Notes */}
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">
                  Manager Evaluation Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.managerComments}
                  onChange={(e) => {
                    setFormData({ ...formData, managerComments: e.target.value });
                    if (formErrors.managerComments) {
                      setFormErrors((prev) => ({ ...prev, managerComments: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 bg-white border ${
                    formErrors.managerComments ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17]`}
                  placeholder="Summarize key performance achievements, shop floor tooling improvements and safety record..."
                ></textarea>
                {formErrors.managerComments && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.managerComments}
                  </p>
                )}
              </div>

              {/* Promotion & Increment */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">
                    Recommend Increment (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.recommendedIncrementPct}
                    onChange={(e) => setFormData({ ...formData, recommendedIncrementPct: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                  {formErrors.recommendedIncrementPct && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.recommendedIncrementPct}</p>
                  )}
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.promotionRecommended}
                      onChange={(e) => setFormData({ ...formData, promotionRecommended: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#211B17]">Recommend For Promotion</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] hover:bg-[#FAF7F2] text-[#544B45] font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition"
                >
                  Save Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Appraisal */}
      {editingAppraisal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" /> Edit Appraisal ({editingAppraisal.appraisalNumber})
              </h2>
              <button onClick={() => setEditingAppraisal(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Employee</label>
                <select
                  value={editFormData.employeeId || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
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
                  <label className="block text-[#70665F] font-semibold mb-1">Self Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="5"
                    value={editFormData.selfRating || 1}
                    onChange={(e) => setEditFormData({ ...editFormData, selfRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Manager Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="5"
                    value={editFormData.managerRating || 1}
                    onChange={(e) => setEditFormData({ ...editFormData, managerRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Manager Evaluation Notes</label>
                <textarea
                  rows={3}
                  value={editFormData.managerComments || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, managerComments: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
                {editErrors.managerComments && (
                  <p className="text-rose-500 text-[11px] mt-1">{editErrors.managerComments}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Recommend Increment (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editFormData.recommendedIncrementPct || 0}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, recommendedIncrementPct: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editFormData.promotionRecommended)}
                      onChange={(e) => setEditFormData({ ...editFormData, promotionRecommended: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-[#211B17]">Recommend Promotion</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAppraisal(null)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#544B45] font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition"
                >
                  Update Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Details */}
      {viewingAppraisal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {viewingAppraisal.appraisalNumber}
                </span>
                <h3 className="text-base font-bold text-[#211B17] mt-1">{viewingAppraisal.employeeName}</h3>
              </div>
              <button onClick={() => setViewingAppraisal(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#FAF7F2] p-3 rounded-lg border border-[#EBE3DB]">
                <div>
                  <span className="text-[#70665F] block">Employee ID</span>
                  <span className="font-bold text-[#211B17]">{viewingAppraisal.employeeId}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Department</span>
                  <span className="font-bold text-[#211B17]">{viewingAppraisal.department}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Review Cycle</span>
                  <span className="font-bold text-[#211B17]">{viewingAppraisal.cyclePeriod}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Status</span>
                  <span className={`px-2 py-0.5 rounded font-bold border text-[11px] ${getStatusBadge(viewingAppraisal.status)}`}>
                    {viewingAppraisal.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-lg border border-[#EBE3DB]">
                <div>
                  <span className="text-[#70665F] block">Self Score</span>
                  <span className="text-sm font-bold text-[#211B17]">{viewingAppraisal.selfRating} / 5</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Manager Score</span>
                  <span className="text-sm font-bold text-amber-600">{viewingAppraisal.managerRating} / 5</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Final Score</span>
                  <span className="text-sm font-black text-emerald-700">{viewingAppraisal.finalScore} / 5</span>
                </div>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EBE3DB] space-y-1">
                <span className="text-[#70665F] font-bold block">Manager Evaluation Notes:</span>
                <p className="italic text-[#544B45]">&quot;{viewingAppraisal.managerComments}&quot;</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#EBE3DB]">
                <div>
                  <span className="text-[#70665F] block">Promotion Recommended</span>
                  <span className={`font-bold ${viewingAppraisal.promotionRecommended ? 'text-emerald-700' : 'text-[#70665F]'}`}>
                    {viewingAppraisal.promotionRecommended ? 'Yes - Recommended' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Increment %</span>
                  <span className="text-base font-bold text-amber-700">+{viewingAppraisal.recommendedIncrementPct}%</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EBE3DB] flex justify-end">
              <button
                onClick={() => setViewingAppraisal(null)}
                className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Appraisal */}
      {rejectingAppraisal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-rose-700 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" /> Reject Appraisal Review
              </h2>
              <button onClick={() => setRejectingAppraisal(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#544B45]">
                You are about to reject the appraisal review for{' '}
                <strong className="text-[#211B17]">{rejectingAppraisal.employeeName}</strong> ({rejectingAppraisal.appraisalNumber}).
              </p>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Rejection Reason / HR Notes</label>
                <textarea
                  rows={3}
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  placeholder="Enter specific reasons for rejecting or requesting revision of this review..."
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectingAppraisal(null)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg shadow-md transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-[#211B17]">Delete Appraisal Record?</h3>
            <p className="text-xs text-[#70665F]">
              This action is permanent and will remove this evaluation from both local records and the server database.
            </p>
            <div className="pt-3 border-t border-[#EBE3DB] flex justify-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg shadow-md transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
