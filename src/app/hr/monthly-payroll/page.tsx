'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Banknote, Play, CheckCircle2, Clock, ShieldCheck, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MonthlyPayrollPage() {
  const { payrollRecords, generateMonthlyPayroll, updatePayrollStatus } = useERP();
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [financialYear, setFinancialYear] = useState('2026-2027');

  const handleRunPayroll = () => {
    generateMonthlyPayroll(selectedMonth, financialYear);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Banknote className="w-7 h-7 text-green-400" />
            Monthly Payroll Processing Engine
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Automated Calculation: Attendance Days + LOP + OT + Salary Structure - Loan EMI - TDS = Net Pay
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunPayroll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Play className="w-4 h-4" /> Run Payroll for {selectedMonth}
          </button>
        </div>
      </div>

      {/* Payroll Workflow Execution Steps Banner */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">Automated 9-Step Integrated Payroll Flow</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 text-center text-xs">
          {['1. Attendance', '2. Leave LOP', '3. Overtime', '4. Salary Struct', '5. Advances', '6. Expenses', '7. Tax Deduct', '8. Calculation', '9. Accounting'].map((step, idx) => (
            <div key={idx} className="p-2 bg-white/80 rounded border border-[#EBE3DB] text-[#544B45] font-semibold text-[11px]">
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Payroll Records List */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <h3 className="font-bold text-[#211B17] text-base">Generated Monthly Payroll Statements</h3>
          <span className="text-xs text-[#70665F] font-mono">Period: {selectedMonth} ({financialYear})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Payroll Ref</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Days (Present / LOP)</th>
                <th className="p-4">Gross Earnings</th>
                <th className="p-4">Statutory Deductions</th>
                <th className="p-4">Net Salary</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {payrollRecords.map((pay) => (
                <tr key={pay.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-4 font-mono text-xs text-green-400 font-bold">{pay.payrollNumber}</td>
                  <td className="p-4">
                    <div className="font-bold text-[#211B17]">{pay.employeeName}</div>
                    <div className="text-xs text-[#70665F]">{pay.department} | {pay.designation}</div>
                  </td>
                  <td className="p-4 text-xs font-mono">
                    <div className="text-emerald-400 font-semibold">Present: {pay.presentDays}/{pay.workingDays}</div>
                    {pay.lossOfPayDays > 0 && <div className="text-rose-400">LOP: {pay.lossOfPayDays} Days</div>}
                    {pay.overtimeHours > 0 && <div className="text-amber-400">OT: +{pay.overtimeHours} Hrs</div>}
                  </td>
                  <td className="p-4 font-mono text-xs text-[#3E2723]">
                    <div className="font-bold text-[#211B17]">₹{pay.grossEarnings?.toLocaleString()}</div>
                    <div className="text-[11px] text-[#70665F]">Basic: ₹{pay.basicSalary?.toLocaleString()}</div>
                  </td>
                  <td className="p-4 font-mono text-xs text-rose-400">
                    <div className="font-bold">-₹{pay.totalDeductions?.toLocaleString()}</div>
                    <div className="text-[11px] text-[#70665F]">PF: ₹{pay.pfDeduction} | PT: ₹{pay.ptDeduction}</div>
                  </td>
                  <td className="p-4 font-mono text-sm font-extrabold text-emerald-400">
                    ₹{pay.netSalary?.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        pay.status === 'Approved' || pay.status === 'Posted to Accounting'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {pay.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href="/hr/payslips"
                      className="px-3 py-1 bg-[#FAF7F2] hover:bg-slate-600 text-[#211B17] text-xs font-semibold rounded border border-[#EBE3DB] transition inline-block"
                    >
                      Payslip PDF
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
