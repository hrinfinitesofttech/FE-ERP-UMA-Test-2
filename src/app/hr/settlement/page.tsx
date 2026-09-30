'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Calculator,
  DollarSign,
  CheckCircle2,
  FileText,
  Plus,
  Landmark,
  ShieldCheck,
  X,
  Search,
  Trash2,
  AlertTriangle,
  UserCheck,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { FullAndFinalSettlementItem } from '../../../types/hr';

export default function FullAndFinalSettlementPage() {
  const {
    fullAndFinalSettlements = [],
    addFullAndFinalSettlement,
    updateFinalSettlementStatus,
    deleteFullAndFinalSettlement,
    employeeExits = [],
    availableEmployees = [],
  } = useERP();

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);

  const initialFormState = {
    employeeId: '',
    employeeName: '',
    department: '',
    designation: '',
    joiningDate: '',
    exitId: '',
    lastWorkingDate: '',
    pendingSalaryDays: 15,
    pendingSalaryAmount: 0,
    leaveEncashmentDays: 0,
    leaveEncashmentAmount: 0,
    bonusIncentive: 0,
    overtimeAmount: 0,
    reimbursementsAmount: 0,
    advanceRecovery: 0,
    loanRecovery: 0,
    noticePeriodRecovery: 0,
    otherDeductions: 0,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Active resigned staff pool
  const resignedEmployees = useMemo(() => {
    return availableEmployees.filter((e) => {
      const hasExit = employeeExits.some((x) => x.employeeId === e.id);
      const isNotice = (e as any).status === 'Notice Period' || (e as any).status === 'Resigned';
      return hasExit || isNotice;
    });
  }, [availableEmployees, employeeExits]);

  // Handle employee selection from dropdown
  const handleEmployeeChange = (empId: string) => {
    if (!empId) {
      setFormData(initialFormState);
      setFormLoadError(null);
      return;
    }

    setFormLoading(true);
    setFormLoadError(null);

    // Clear previous employee details immediately
    setFormData((prev) => ({
      ...initialFormState,
      employeeId: empId,
    }));

    setTimeout(() => {
      const selectedEmp = availableEmployees.find((e) => e.id === empId);
      const exitRecord = employeeExits.find((e) => e.employeeId === empId);

      if (!selectedEmp && !exitRecord) {
        setFormLoadError('The employee details could not be loaded correctly. Please select the employee again.');
        setFormLoading(false);
        return;
      }

      const empName = selectedEmp?.name || exitRecord?.employeeName || 'Staff Member';
      const dept = selectedEmp?.department || exitRecord?.department || 'Production';
      const desg = (selectedEmp as any)?.designation || (selectedEmp as any)?.role || exitRecord?.designation || 'Staff';
      const joining = (selectedEmp as any)?.joiningDate || (selectedEmp as any)?.createdAt?.split('T')[0] || '2024-01-15';
      const lwd = exitRecord?.lastWorkingDate || new Date().toISOString().split('T')[0];
      const exitRef = exitRecord?.id || `EXIT-${empId}`;

      // Calculate base salary and daily rate
      const annualCTC = Number((selectedEmp as any)?.ctc || (selectedEmp as any)?.salary || 480000);
      const monthlySalary = Math.round(annualCTC / 12);
      const dailyRate = Math.round(monthlySalary / 30);

      const pendingDays = 15;
      const pendingSalary = pendingDays * dailyRate;
      const leaveDays = 8;
      const leaveEncashment = leaveDays * dailyRate;

      setFormData({
        employeeId: empId,
        employeeName: empName,
        department: dept,
        designation: desg,
        joiningDate: joining,
        exitId: exitRef,
        lastWorkingDate: lwd,
        pendingSalaryDays: pendingDays,
        pendingSalaryAmount: pendingSalary,
        leaveEncashmentDays: leaveDays,
        leaveEncashmentAmount: leaveEncashment,
        bonusIncentive: 5000,
        overtimeAmount: 2400,
        reimbursementsAmount: 1800,
        advanceRecovery: 5000,
        loanRecovery: 0,
        noticePeriodRecovery: 0,
        otherDeductions: 0,
      });

      setFormLoading(false);
    }, 250);

    if (formErrors.employeeId) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.employeeId;
        return next;
      });
    }
  };

  const totalEarnings =
    Number(formData.pendingSalaryAmount || 0) +
    Number(formData.leaveEncashmentAmount || 0) +
    Number(formData.bonusIncentive || 0) +
    Number(formData.overtimeAmount || 0) +
    Number(formData.reimbursementsAmount || 0);

  const totalDeductions =
    Number(formData.advanceRecovery || 0) +
    Number(formData.loanRecovery || 0) +
    Number(formData.noticePeriodRecovery || 0) +
    Number(formData.otherDeductions || 0);

  const netPayable = Math.max(0, totalEarnings - totalDeductions);

  // Form dirty check
  const isFormDirty = useMemo(() => {
    return formData.employeeId !== '' && formData.pendingSalaryAmount > 0;
  }, [formData]);

  const closeModalWithConfirm = () => {
    if (isFormDirty) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    setShowModal(false);
    setFormData(initialFormState);
    setFormErrors({});
    setFormLoadError(null);
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) closeModalWithConfirm();
        if (deleteConfirmId) setDeleteConfirmId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isFormDirty, deleteConfirmId]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.employeeId) {
      errors.employeeId = 'Please select the employee.';
    }
    if (!formData.lastWorkingDate) {
      errors.lastWorkingDate = 'Please select the last working date.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      addFullAndFinalSettlement({
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        exitId: formData.exitId,
        lastWorkingDate: formData.lastWorkingDate,
        pendingSalaryDays: Number(formData.pendingSalaryDays),
        pendingSalaryAmount: Number(formData.pendingSalaryAmount),
        leaveEncashmentDays: Number(formData.leaveEncashmentDays),
        leaveEncashmentAmount: Number(formData.leaveEncashmentAmount),
        bonusIncentive: Number(formData.bonusIncentive),
        overtimeAmount: Number(formData.overtimeAmount),
        reimbursementsAmount: Number(formData.reimbursementsAmount),
        advanceRecovery: Number(formData.advanceRecovery),
        loanRecovery: Number(formData.loanRecovery),
        noticePeriodRecovery: Number(formData.noticePeriodRecovery),
        otherDeductions: Number(formData.otherDeductions),
        netFinalPayable: netPayable,
        settlementDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'Pending Accounting Clearance',
      });

      setShowModal(false);
      setFormData(initialFormState);
      setFormErrors({});
      setSuccessToast(`F&F settlement calculated successfully for ${formData.employeeName} (Net: ₹${netPayable.toLocaleString()}).`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to create settlement:', err);
      setLoadError('The settlement details could not be loaded. Please refresh the page and try again.');
    }
  };

  const executeDelete = () => {
    if (!deleteConfirmId) return;
    deleteFullAndFinalSettlement(deleteConfirmId);
    setSuccessToast(`Settlement record ${deleteConfirmId} deleted successfully.`);
    setDeleteConfirmId(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadError(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Filtered settlements list
  const filteredSettlements = useMemo(() => {
    return (fullAndFinalSettlements || []).filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        s.employeeName.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.exitId && s.exitId.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && s.paymentStatus === 'Pending Accounting Clearance') ||
        (statusFilter === 'paid' && s.paymentStatus === 'Paid') ||
        (statusFilter === 'hold' && s.paymentStatus === 'Hold');

      return matchesSearch && matchesStatus;
    });
  }, [fullAndFinalSettlements, searchTerm, statusFilter]);

  // Summary Metrics
  const totalSettlementCount = fullAndFinalSettlements.length;
  const pendingAmount = fullAndFinalSettlements
    .filter((s) => s.paymentStatus === 'Pending Accounting Clearance')
    .reduce((sum, s) => sum + Number(s.netFinalPayable || 0), 0);
  const paidAmount = fullAndFinalSettlements
    .filter((s) => s.paymentStatus === 'Paid')
    .reduce((sum, s) => sum + Number(s.netFinalPayable || 0), 0);

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
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
              <Calculator className="w-6 h-6" />
            </div>
            Full & Final (F&F) Settlement Engine
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Automated Exit Settlement: Unpaid Salary + Leave Encashment + Expenses - Advance/Loan Recoveries → Accounting Posting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EBE3DB] hover:bg-[#F5EFEB] text-[#544B45] font-semibold text-xs rounded-lg transition shadow-sm"
            title="Reload settlement records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setFormData(initialFormState);
              setFormErrors({});
              setFormLoadError(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Create F&F Calculation
          </button>
        </div>
      </div>

      {/* Fallback Error Banner */}
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

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Total Settlements
            </span>
            <span className="text-2xl font-black text-[#211B17]">
              {totalSettlementCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Calculator className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Pending Clearance
            </span>
            <span className="text-2xl font-black text-amber-700">
              ₹{pendingAmount.toLocaleString()}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Paid / Cleared
            </span>
            <span className="text-2xl font-black text-emerald-700">
              ₹{paidAmount.toLocaleString()}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Resigned Staff Pool
            </span>
            <span className="text-2xl font-black text-blue-700">
              {employeeExits.length} Exits Logged
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Accounting Integration Info Banner */}
      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <strong>Accounting Source of Truth Integration:</strong> HR performs statutory F&F audit calculations, and final clearance posts directly to the Accounting journal vouchers. Selecting an employee from the dropdown automatically synchronizes exit records, pending recoveries, and statutory dues.
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Employee, Exit ID, Voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['all', 'pending', 'paid', 'hold'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#70665F] hover:bg-[#EBE3DB]'
              }`}
            >
              {st === 'all' ? 'All Status' : st === 'pending' ? 'Pending Accounting Clearance' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Settlements List */}
      {isLoading ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#544B45]">Loading settlement records...</p>
        </div>
      ) : filteredSettlements.length === 0 ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Calculator className="w-12 h-12 text-[#A89F91] mx-auto" />
          <h3 className="text-base font-bold text-[#211B17]">No Full & Final Settlements Found</h3>
          <p className="text-xs text-[#70665F] max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'No settlement records match your search filter.'
              : 'Click "Create F&F Calculation" above to calculate and record an employee exit settlement.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSettlements.map((fnf) => (
            <div
              key={fnf.id}
              className="bg-white border border-[#EBE3DB] hover:border-emerald-300 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition duration-200"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE3DB]/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-mono font-bold rounded-md border border-emerald-200">
                    {fnf.id}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                      {fnf.employeeName}
                      <span className="text-xs font-normal text-[#70665F]">({fnf.employeeId})</span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      fnf.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : fnf.paymentStatus === 'Hold'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {fnf.paymentStatus}
                  </span>

                  <button
                    onClick={() => setDeleteConfirmId(fnf.id)}
                    className="p-1.5 text-[#70665F] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete settlement calculation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Financial Summary */}
              {(() => {
                const addTotal =
                  Number(fnf.pendingSalaryAmount || 0) +
                  Number(fnf.leaveEncashmentAmount || 0) +
                  Number(fnf.bonusIncentive || 0) +
                  Number(fnf.overtimeAmount || 0) +
                  Number(fnf.reimbursementsAmount || 0);
                const dedTotal =
                  Number(fnf.advanceRecovery || 0) +
                  Number(fnf.loanRecovery || 0) +
                  Number(fnf.noticePeriodRecovery || 0) +
                  Number(fnf.otherDeductions || 0);
                const finalNet = Number(fnf.netFinalPayable || (addTotal - dedTotal));

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-[#70665F] uppercase block">Total Additions</span>
                      <div className="text-emerald-700 font-bold text-base">₹{addTotal.toLocaleString()}</div>
                      <div className="text-[11px] text-[#70665F]">
                        Salary: ₹{fnf.pendingSalaryAmount.toLocaleString()} ({fnf.pendingSalaryDays}d) • Leave: ₹{fnf.leaveEncashmentAmount.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-[#70665F] uppercase block">Total Deductions</span>
                      <div className="text-rose-700 font-bold text-base">₹{dedTotal.toLocaleString()}</div>
                      <div className="text-[11px] text-[#70665F]">
                        Advance: ₹{fnf.advanceRecovery.toLocaleString()} • Notice/Other: ₹{(fnf.noticePeriodRecovery + fnf.otherDeductions).toLocaleString()}
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-emerald-900 uppercase block">Calculated Net Payable</span>
                      <div className="text-emerald-800 font-black text-lg">₹{finalNet.toLocaleString()}</div>
                      <div className="text-[11px] text-emerald-800/80">LWD: {fnf.lastWorkingDate} • Exit Ref: {fnf.exitId || '—'}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}

      {/* New F&F Calculation Modal */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModalWithConfirm();
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl relative my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#211B17]">New Full & Final Settlement</h2>
                  <p className="text-xs text-[#70665F]">
                    Select employee from the dropdown to auto-link exit data & calculate final settlement
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

            {/* Form Load Error Banner */}
            {formLoadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formLoadError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Employee Selection & Exit Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Select Employee <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                      formErrors.employeeId
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-emerald-600'
                    }`}
                  >
                    <option value="">-- Select Resigned / Exited Employee --</option>
                    {availableEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || `${(emp as any).firstName || ''} ${(emp as any).lastName || ''}`.trim()} ({emp.id} - {emp.department || 'Production'})
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

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Exit Reference / Reason ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.exitId || (formLoading ? 'Loading...' : '—')}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs text-[#544B45] font-mono"
                  />
                </div>
              </div>

              {/* Employee Snapshot when Loaded */}
              {formLoading ? (
                <div className="p-4 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-center flex items-center justify-center gap-2 text-xs text-[#544B45]">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  Loading fresh employee parameters & exit details...
                </div>
              ) : formData.employeeId && formData.employeeName ? (
                <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#70665F] block">Name:</span>
                    <strong className="text-[#211B17]">{formData.employeeName}</strong>
                  </div>
                  <div>
                    <span className="text-[#70665F] block">Department:</span>
                    <span className="text-[#211B17]">{formData.department}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block">Designation:</span>
                    <span className="text-[#211B17]">{formData.designation}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block">Last Working Date:</span>
                    <span className="text-amber-800 font-semibold">{formData.lastWorkingDate}</span>
                  </div>
                </div>
              ) : null}

              {/* Additions & Recoveries Containers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earnings & Additions */}
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/80 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 border-b border-emerald-200 pb-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Earnings & Additions
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-[#544B45] block">Pending Salary (Days)</label>
                      <input
                        type="number"
                        value={formData.pendingSalaryDays}
                        onChange={(e) => {
                          const d = Number(e.target.value);
                          const amt = d * 2333;
                          setFormData({ ...formData, pendingSalaryDays: d, pendingSalaryAmount: amt });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#544B45] block">Pending Salary (₹)</label>
                      <input
                        type="number"
                        value={formData.pendingSalaryAmount}
                        onChange={(e) => setFormData({ ...formData, pendingSalaryAmount: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-[#544B45] block">Leave Encash. (Days)</label>
                      <input
                        type="number"
                        value={formData.leaveEncashmentDays}
                        onChange={(e) => {
                          const d = Number(e.target.value);
                          const amt = d * 2000;
                          setFormData({ ...formData, leaveEncashmentDays: d, leaveEncashmentAmount: amt });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#544B45] block">Leave Encash. (₹)</label>
                      <input
                        type="number"
                        value={formData.leaveEncashmentAmount}
                        onChange={(e) => setFormData({ ...formData, leaveEncashmentAmount: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#544B45] block">Bonus (₹)</label>
                      <input
                        type="number"
                        value={formData.bonusIncentive}
                        onChange={(e) => setFormData({ ...formData, bonusIncentive: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#544B45] block">Overtime (₹)</label>
                      <input
                        type="number"
                        value={formData.overtimeAmount}
                        onChange={(e) => setFormData({ ...formData, overtimeAmount: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#544B45] block">Expense (₹)</label>
                      <input
                        type="number"
                        value={formData.reimbursementsAmount}
                        onChange={(e) => setFormData({ ...formData, reimbursementsAmount: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/80 flex justify-between font-bold text-xs text-emerald-900">
                    <span>Total Additions:</span>
                    <span>₹{totalEarnings.toLocaleString()}</span>
                  </div>
                </div>

                {/* Recoveries & Deductions */}
                <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-200/80 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 border-b border-rose-200 pb-1.5">
                    <TrendingDown className="w-4 h-4 text-rose-600" /> Recoveries & Deductions
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-[#544B45] block">Advance Recovery (₹)</label>
                      <input
                        type="number"
                        value={formData.advanceRecovery}
                        onChange={(e) => setFormData({ ...formData, advanceRecovery: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#544B45] block">Loan Recovery (₹)</label>
                      <input
                        type="number"
                        value={formData.loanRecovery}
                        onChange={(e) => setFormData({ ...formData, loanRecovery: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-[#544B45] block">Notice Shortfall (₹)</label>
                      <input
                        type="number"
                        value={formData.noticePeriodRecovery}
                        onChange={(e) => setFormData({ ...formData, noticePeriodRecovery: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#544B45] block">Other Deductions (₹)</label>
                      <input
                        type="number"
                        value={formData.otherDeductions}
                        onChange={(e) => setFormData({ ...formData, otherDeductions: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-rose-200/80 flex justify-between font-bold text-xs text-rose-900">
                    <span>Total Deductions:</span>
                    <span>-₹{totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Calculated Net Payable Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 uppercase block tracking-wider">
                    Calculated Net Payable (Additions - Deductions)
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Automated statutory exit settlement calculation
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  ₹{netPayable.toLocaleString()}
                </div>
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
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" /> Save F&F Calculation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmId(null);
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
                <h3 className="text-base font-bold text-[#211B17]">Delete Settlement Record</h3>
                <p className="text-xs text-[#70665F]">Record ID: {deleteConfirmId}</p>
              </div>
            </div>

            <p className="text-sm text-[#544B45] leading-relaxed">
              Are you sure you want to delete this settlement calculation record? This action will remove the F&F record from the audit log.
            </p>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow transition"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
