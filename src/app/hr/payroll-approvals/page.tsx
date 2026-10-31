'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { CheckCircle2, Lock, ShieldCheck, AlertTriangle, FileCheck2 } from 'lucide-react';

export default function PayrollApprovalPage() {
  const { payrollRecords, updatePayrollStatus, currentUser } = useERP();

  const handleLockPayroll = (id: string) => {
    updatePayrollStatus(id, 'Locked', currentUser?.name);
  };

  const handlePostToAccounting = (id: string) => {
    updatePayrollStatus(id, 'Posted to Accounting', currentUser?.name);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] min-h-screen text-[#211B17]">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-bold font-mono border border-emerald-500/20">
              MODULE 26
            </span>
            <span className="text-xs text-[#70665F] font-medium">3-Tier HR Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span>Payroll Approval &amp; Freeze/Lock Governance</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#70665F] max-w-2xl leading-relaxed mt-1">
            Payroll Executive &rarr; HR Manager &rarr; Super Admin Approval &amp; Freeze Lock
          </p>
        </div>
      </div>

      {/* Audit & Locking Strict Rule Notice */}
      <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3.5 text-xs text-rose-900 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200/80 flex items-center justify-center flex-shrink-0 text-rose-700">
          <Lock className="w-4 h-4" />
        </div>
        <div className="leading-relaxed">
          <span className="font-bold text-rose-950">Immutability Rule:</span> Once payroll is Approved and Locked by Super Admin, direct editing is strictly prohibited. All adjustments must occur via formal payroll reversal/adjustment vouchers with mandatory audit trail.
        </div>
      </div>

      {/* Approval List */}
      <div className="grid grid-cols-1 gap-6">
        {payrollRecords.length === 0 ? (
          <div className="bg-white border border-[#E7DED5] rounded-2xl p-12 text-center shadow-xs">
            <FileCheck2 className="w-10 h-10 text-[#A8988C] opacity-50 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#211B17]">No Payroll Runs Pending Approval</h3>
            <p className="text-xs text-[#70665F] mt-1">
              All processed monthly payroll batches have been approved and locked, or no runs exist.
            </p>
          </div>
        ) : (
          payrollRecords.map((pay) => (
          <div key={pay.id} className="bg-white border border-[#E7DED5] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE3DB] pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {pay.payrollNumber}
                  </span>
                  <h3 className="text-base font-bold text-[#211B17]">{pay.employeeName}</h3>
                </div>
                <div className="text-xs text-[#70665F] mt-1.5">
                  Period: <span className="text-[#211B17] font-semibold">{pay.monthYear}</span> ({pay.financialYear})
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    pay.status === 'Locked' || pay.status === 'Posted to Accounting'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : pay.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {pay.status}
                </span>

                {pay.status !== 'Locked' && pay.status !== 'Posted to Accounting' && (
                  <button
                    onClick={() => handleLockPayroll(pay.id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5" /> Approve &amp; Lock Payroll
                  </button>
                )}

                {pay.status === 'Locked' && (
                  <button
                    onClick={() => handlePostToAccounting(pay.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" /> Post Voucher to Accounting
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] text-xs">
              <div>
                <span className="text-[#70665F] block font-medium">Gross Earnings</span>
                <span className="text-[#211B17] font-bold text-sm">₹{pay.grossEarnings?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#70665F] block font-medium">Total Deductions</span>
                <span className="text-rose-600 font-bold text-sm">₹{pay.totalDeductions?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#70665F] block font-medium">Net Take-Home Pay</span>
                <span className="text-emerald-700 font-extrabold text-sm">₹{pay.netSalary?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#70665F] block font-medium">Employer PF &amp; ESI</span>
                <span className="text-crm-brand-700 font-bold text-sm">₹{(pay.employerPF + pay.employerESI)?.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
