'use client';

import React, { useState, useMemo } from 'react';
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
  Filter
} from 'lucide-react';

export default function FullAndFinalSettlementPage() {
  const {
    fullAndFinalSettlements,
    addFullAndFinalSettlement,
    updateFinalSettlementStatus,
    deleteFullAndFinalSettlement,
    employeeExits,
    availableEmployees,
  } = useERP();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Initial form state
  const initialEmployeeId = availableEmployees[0]?.id || 'EMP-2026-001';
  const initialEmployee = availableEmployees[0];
  const matchingExit = employeeExits.find((e) => e.employeeId === initialEmployeeId);

  const [formData, setFormData] = useState({
    employeeId: initialEmployeeId,
    employeeName: initialEmployee?.name || 'Staff Member',
    exitId: matchingExit?.id || `EXIT-${initialEmployeeId}`,
    lastWorkingDate: matchingExit?.lastWorkingDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    pendingSalaryDays: 15,
    pendingSalaryAmount: 32500,
    leaveEncashmentDays: 8,
    leaveEncashmentAmount: 16000,
    bonusIncentive: 5000,
    overtimeAmount: 2400,
    reimbursementsAmount: 1800,
    advanceRecovery: 5000,
    loanRecovery: 0,
    noticePeriodRecovery: 0,
    otherDeductions: 0,
  });

  // Handle employee selection from dropdown
  const handleEmployeeChange = (empId: string) => {
    const selectedEmp = availableEmployees.find((e) => e.id === empId);
    const exitRecord = employeeExits.find((e) => e.employeeId === empId);

    setFormData((prev) => ({
      ...prev,
      employeeId: empId,
      employeeName: selectedEmp?.name || (exitRecord ? exitRecord.employeeName : 'Staff Member'),
      exitId: exitRecord ? exitRecord.id : `EXIT-${empId}`,
      lastWorkingDate: exitRecord ? exitRecord.lastWorkingDate : prev.lastWorkingDate,
      // Default reasonable starting figures
      pendingSalaryAmount: exitRecord ? 35000 : prev.pendingSalaryAmount,
    }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addFullAndFinalSettlement({
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      exitId: formData.exitId,
      lastWorkingDate: formData.lastWorkingDate,
      pendingSalaryDays: Number(formData.pendingSalaryDays || 0),
      pendingSalaryAmount: Number(formData.pendingSalaryAmount || 0),
      leaveEncashmentDays: Number(formData.leaveEncashmentDays || 0),
      leaveEncashmentAmount: Number(formData.leaveEncashmentAmount || 0),
      bonusIncentive: Number(formData.bonusIncentive || 0),
      overtimeAmount: Number(formData.overtimeAmount || 0),
      reimbursementsAmount: Number(formData.reimbursementsAmount || 0),
      advanceRecovery: Number(formData.advanceRecovery || 0),
      loanRecovery: Number(formData.loanRecovery || 0),
      noticePeriodRecovery: Number(formData.noticePeriodRecovery || 0),
      otherDeductions: Number(formData.otherDeductions || 0),
      netFinalPayable: netPayable,
      settlementDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'Pending Accounting Clearance',
    });

    setShowModal(false);
  };

  // Filtered settlement records
  const filteredSettlements = useMemo(() => {
    const list = fullAndFinalSettlements || [];
    const q = (searchTerm || '').toLowerCase();
    return list.filter((item) => {
      const empName = (item.employeeName || '').toLowerCase();
      const empId = (item.employeeId || '').toLowerCase();
      const exitId = (item.exitId || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      const vNo = (item.accountingVoucherNo || '').toLowerCase();

      const matchesSearch =
        !q ||
        empName.includes(q) ||
        empId.includes(q) ||
        exitId.includes(q) ||
        id.includes(q) ||
        vNo.includes(q);

      const matchesStatus =
        statusFilter === 'all' || item.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [fullAndFinalSettlements, searchTerm, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const list = fullAndFinalSettlements || [];
    const total = list.length;
    const pending = list.filter((s) => s.paymentStatus === 'Pending Accounting Clearance');
    const paid = list.filter((s) => s.paymentStatus === 'Paid');
    const pendingAmount = pending.reduce((sum, s) => sum + (Number(s.netFinalPayable) || 0), 0);
    const paidAmount = paid.reduce((sum, s) => sum + (Number(s.netFinalPayable) || 0), 0);

    return { total, pendingCount: pending.length, paidCount: paid.length, pendingAmount, paidAmount };
  }, [fullAndFinalSettlements]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Calculator className="w-7 h-7 text-teal-600" />
            Full & Final (F&F) Settlement Engine
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Automated Exit Settlement: Unpaid Salary + Leave Encashment + Expenses - Advance/Loan Recoveries -&gt; Accounting Posting
          </p>
        </div>
        <button
          onClick={() => {
            const firstEmp = availableEmployees[0];
            const exit = employeeExits.find((e) => e.employeeId === firstEmp?.id);
            if (firstEmp) {
              setFormData({
                employeeId: firstEmp.id,
                employeeName: firstEmp.name || 'Staff Member',
                exitId: exit?.id || `EXIT-${firstEmp.id}`,
                lastWorkingDate: exit?.lastWorkingDate || new Date().toISOString().split('T')[0],
                pendingSalaryDays: 15,
                pendingSalaryAmount: 32500,
                leaveEncashmentDays: 8,
                leaveEncashmentAmount: 16000,
                bonusIncentive: 5000,
                overtimeAmount: 2400,
                reimbursementsAmount: 1800,
                advanceRecovery: 5000,
                loanRecovery: 0,
                noticePeriodRecovery: 0,
                otherDeductions: 0,
              });
            }
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" /> Create F&F Calculation
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center gap-3">
          <div className="p-3 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Total Settlements</p>
            <p className="text-xl font-bold text-[#211B17]">{metrics.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Pending Clearance</p>
            <p className="text-xl font-bold text-amber-600">{metrics.pendingCount} (₹{metrics.pendingAmount.toLocaleString()})</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Paid / Cleared</p>
            <p className="text-xl font-bold text-emerald-600">{metrics.paidCount} (₹{metrics.paidAmount.toLocaleString()})</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Resigned Staff Pool</p>
            <p className="text-xl font-bold text-[#211B17]">{employeeExits.length} Exits Logged</p>
          </div>
        </div>
      </div>

      {/* Accounting Notice */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3 text-xs text-teal-900 shadow-sm">
        <Landmark className="w-5 h-5 text-teal-600 flex-shrink-0" />
        <div>
          <span className="font-bold">Accounting Source of Truth Integration:</span> HR performs statutory F&F audit calculations, and final clearance posts directly to the Accounting journal vouchers. Selecting an employee from the dropdown automatically synchronizes exit records, pending recoveries, and statutory dues.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Employee, Exit ID, Voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-[#211B17] focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'Pending Accounting Clearance', 'Paid', 'Hold'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === status
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-[#70665F] hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Status' : status}
            </button>
          ))}
        </div>
      </div>

      {/* F&F Settlement List */}
      <div className="grid grid-cols-1 gap-5">
        {filteredSettlements.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EBE3DB] p-12 text-center shadow-sm">
            <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-700">No Full & Final Settlements Found</p>
            <p className="text-xs text-gray-500 mt-1">
              Click &quot;Create F&F Calculation&quot; above to calculate and record an employee exit settlement.
            </p>
          </div>
        ) : (
          filteredSettlements.map((fnf) => (
            <div key={fnf.id} className="bg-white border border-[#EBE3DB] rounded-xl p-5 space-y-4 shadow-sm hover:shadow transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
                      {fnf.id}
                    </span>
                    <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-600" />
                      {fnf.employeeName}
                      {fnf.employeeId && (
                        <span className="text-xs font-normal text-[#70665F]">({fnf.employeeId})</span>
                      )}
                    </h3>
                  </div>
                  <div className="text-xs text-[#70665F] mt-1 flex flex-wrap items-center gap-3">
                    <span>Exit Ref: <strong className="text-gray-800">{fnf.exitId || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Last Working Date: <strong className="text-amber-700">{fnf.lastWorkingDate}</strong></span>
                    <span>•</span>
                    <span>Settled On: <strong className="text-gray-800">{fnf.settlementDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      fnf.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : fnf.paymentStatus === 'Hold'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {fnf.paymentStatus}
                  </span>

                  {fnf.paymentStatus === 'Pending Accounting Clearance' && (
                    <button
                      onClick={() =>
                        updateFinalSettlementStatus(
                          fnf.id,
                          'Paid',
                          `JV-2026-FNF-${Math.floor(1000 + Math.random() * 9000)}`
                        )
                      }
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                    >
                      Post to Accounting & Mark Paid
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteConfirmId(fnf.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Settlement Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detailed Component Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Gross Additions */}
                <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 space-y-2">
                  <h4 className="font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between border-b border-emerald-200 pb-1">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Gross Payable Additions
                    </span>
                    <span className="text-emerald-700 font-bold">
                      ₹{(
                        (Number(fnf.pendingSalaryAmount) || 0) +
                        (Number(fnf.leaveEncashmentAmount) || 0) +
                        (Number(fnf.bonusIncentive) || 0) +
                        (Number(fnf.overtimeAmount) || 0) +
                        (Number(fnf.reimbursementsAmount) || 0)
                      ).toLocaleString()}
                    </span>
                  </h4>
                  <div className="flex justify-between text-[#544B45]">
                    <span>Pending Salary ({fnf.pendingSalaryDays || 0} Days):</span>
                    <span className="font-semibold text-[#211B17]">₹{fnf.pendingSalaryAmount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-[#544B45]">
                    <span>Leave Encashment ({fnf.leaveEncashmentDays || 0} Days):</span>
                    <span className="font-semibold text-[#211B17]">₹{fnf.leaveEncashmentAmount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-[#544B45]">
                    <span>Bonus & Incentives:</span>
                    <span className="font-semibold text-[#211B17]">₹{fnf.bonusIncentive?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-[#544B45]">
                    <span>Overtime & Reimbursements:</span>
                    <span className="font-semibold text-[#211B17]">₹{((fnf.overtimeAmount || 0) + (fnf.reimbursementsAmount || 0)).toLocaleString()}</span>
                  </div>
                </div>

                {/* Recoveries & Deductions */}
                <div className="bg-rose-50/40 p-3.5 rounded-xl border border-rose-100 space-y-2">
                  <h4 className="font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between border-b border-rose-200 pb-1">
                    <span className="flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> Recoveries & Deductions
                    </span>
                    <span className="text-rose-700 font-bold">
                      -₹{(
                        (Number(fnf.advanceRecovery) || 0) +
                        (Number(fnf.loanRecovery) || 0) +
                        (Number(fnf.noticePeriodRecovery) || 0) +
                        (Number(fnf.otherDeductions) || 0)
                      ).toLocaleString()}
                    </span>
                  </h4>
                  <div className="flex justify-between text-[#544B45]">
                    <span>Advance Outstanding Recovery:</span>
                    <span className="font-semibold text-[#211B17]">₹{fnf.advanceRecovery?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-[#544B45]">
                    <span>Loan Recovery:</span>
                    <span className="font-semibold text-[#211B17]">₹{fnf.loanRecovery?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-[#544B45]">
                    <span>Notice Period Recovery:</span>
                    <span className="font-semibold text-[#211B17]">₹{fnf.noticePeriodRecovery?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-[#544B45]">
                    <span>Other Statutory Deductions:</span>
                    <span className="font-semibold text-[#211B17]">₹{fnf.otherDeductions?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {/* Net Summary */}
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-teal-800 uppercase tracking-wider border-b border-teal-200 pb-1">
                      Net Final Payable Amount
                    </h4>
                    <div className="text-3xl font-black text-teal-700 mt-3">₹{fnf.netFinalPayable?.toLocaleString()}</div>
                    <span className="text-[11px] text-teal-800 block mt-1 font-medium">Calculated as per statutory Labour Laws</span>
                  </div>
                  {fnf.accountingVoucherNo && (
                    <div className="text-[11px] text-[#70665F] border-t border-teal-200 pt-2">
                      Accounting Voucher Ref: <span className="font-mono text-[#211B17] font-bold">{fnf.accountingVoucherNo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to delete settlement record <strong className="text-gray-900">{deleteConfirmId}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteFullAndFinalSettlement(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Calculate F&F Settlement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-600" /> New Full & Final Settlement
                </h2>
                <p className="text-xs text-[#70665F] mt-0.5">
                  Select employee from the dropdown to auto-link exit data &amp; calculate final settlement
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Employee Selection Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      Select Employee <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) => handleEmployeeChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                      required
                    >
                      <option value="" disabled>-- Select Employee from List --</option>
                      {/* Priority to Exiting / Resigned employees */}
                      {employeeExits.length > 0 && (
                        <optgroup label="⚠️ Resigned / Exiting Employees (Pending Settlement)">
                          {employeeExits.map((exit) => (
                            <option key={`exit-${exit.employeeId}`} value={exit.employeeId}>
                              {exit.employeeName} ({exit.employeeId} - {exit.department || 'HR'}) • [Exit ID: {exit.id}]
                            </option>
                          ))}
                        </optgroup>
                      )}

                      <optgroup label="All Staff & Employees">
                        {availableEmployees.map((emp) => {
                          const isExit = employeeExits.some((e) => e.employeeId === emp.id);
                          return (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.id} - {emp.department || 'Staff'}) {isExit ? '• [Resigned]' : ''}
                            </option>
                          );
                        })}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Exit Reference / Reason ID</label>
                    <input
                      type="text"
                      value={formData.exitId}
                      onChange={(e) => setFormData({ ...formData, exitId: e.target.value })}
                      placeholder="e.g. EXIT-2026-01"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Last Working Date</label>
                  <input
                    type="date"
                    value={formData.lastWorkingDate}
                    onChange={(e) => setFormData({ ...formData, lastWorkingDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Earnings & Deductions 2-Column Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gross Earnings Additions */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
                  <h3 className="font-bold text-emerald-800 text-xs uppercase flex items-center gap-1.5 border-b border-emerald-200 pb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Earnings &amp; Additions
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Pending Salary (Days)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.pendingSalaryDays}
                        onChange={(e) => setFormData({ ...formData, pendingSalaryDays: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Pending Salary (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.pendingSalaryAmount}
                        onChange={(e) => setFormData({ ...formData, pendingSalaryAmount: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Leave Encash. (Days)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.leaveEncashmentDays}
                        onChange={(e) => setFormData({ ...formData, leaveEncashmentDays: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Leave Encash. (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.leaveEncashmentAmount}
                        onChange={(e) => setFormData({ ...formData, leaveEncashmentAmount: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Bonus (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.bonusIncentive}
                        onChange={(e) => setFormData({ ...formData, bonusIncentive: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Overtime (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.overtimeAmount}
                        onChange={(e) => setFormData({ ...formData, overtimeAmount: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Expense (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reimbursementsAmount}
                        onChange={(e) => setFormData({ ...formData, reimbursementsAmount: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 flex justify-between font-bold text-emerald-800">
                    <span>Total Additions:</span>
                    <span>₹{totalEarnings.toLocaleString()}</span>
                  </div>
                </div>

                {/* Recoveries & Deductions */}
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-3">
                  <h3 className="font-bold text-rose-800 text-xs uppercase flex items-center gap-1.5 border-b border-rose-200 pb-1">
                    <TrendingDown className="w-4 h-4 text-rose-600" /> Recoveries &amp; Deductions
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Advance Recovery (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.advanceRecovery}
                        onChange={(e) => setFormData({ ...formData, advanceRecovery: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-rose-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Loan Recovery (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.loanRecovery}
                        onChange={(e) => setFormData({ ...formData, loanRecovery: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-rose-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Notice Shortfall (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.noticePeriodRecovery}
                        onChange={(e) => setFormData({ ...formData, noticePeriodRecovery: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-rose-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Other Deductions (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.otherDeductions}
                        onChange={(e) => setFormData({ ...formData, otherDeductions: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-rose-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200 flex justify-between font-bold text-rose-800">
                    <span>Total Deductions:</span>
                    <span>-₹{totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Calculated Summary Badge */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider block">
                    Calculated Net Payable (Additions - Deductions)
                  </span>
                  <span className="text-[11px] text-teal-700">
                    Automated statutory exit settlement calculation
                  </span>
                </div>
                <div className="text-2xl font-black text-teal-700">
                  ₹{netPayable.toLocaleString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition hover:shadow-lg"
                >
                  Save F&amp;F Calculation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
