'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { FileBarChart, Download, Printer, Filter, Search, FileSpreadsheet, Building, Users, Clock, DollarSign } from 'lucide-react';

export default function PayrollReportsPage() {
  const { availableEmployees, payrollRecords, attendanceRecords, leaveRequests, employeeAdvanceLoans, departments } = useERP();

  const [selectedReport, setSelectedReport] = useState('Salary Register');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const reportList = [
    'Employee Master Report',
    'Department-wise Employees',
    'Attendance Log Report',
    'Late Coming Exception Report',
    'Absenteeism Report',
    'Leave Utilization & Quotas',
    'Leave Balance Statement',
    'Overtime Cost Report',
    'WFH Remote Log Report',
    'Monthly Payroll Summary',
    'Salary Register',
    'Department Salary Cost Breakdown',
    'PF Statutory Monthly Statement',
    'ESI Statutory Statement',
    'Professional Tax (PT) Report',
    'TDS Tax Deduction Statement',
    'Advance & Loan Outstanding Statement',
    'Reimbursements Claim Log',
    'Performance & KPI Scorecard',
    'Employee Joining & Exit Report',
  ];

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <FileBarChart className="w-7 h-7 text-indigo-400" />
            Statutory & HR Analytics Reports (20 Standard Statements)
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Download Excel Statements, Statutory PF/ESI Challans & Department Cost Analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert(`Exporting ${selectedReport} to Excel workbook...`)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Filter & Selection Bar */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-[#70665F] uppercase">Select Report:</label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-lg px-3 py-2 text-sm text-[#211B17] focus:outline-none focus:border-crm-brand-600"
          >
            {reportList.map((r, i) => (
              <option key={i} value={r}>
                {i + 1}. {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#70665F]" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-lg px-3 py-2 text-sm text-[#211B17] focus:outline-none focus:border-crm-brand-600"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.departmentName}>
                {d.departmentName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
        <h3 className="text-base font-bold text-[#211B17] flex items-center justify-between">
          <span>{selectedReport} Preview</span>
          <span className="text-xs text-indigo-400 font-mono">Generated Live from HR Database</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-3">Ref ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Gross Earnings</th>
                <th className="p-3">Statutory Deductions (PF/ESI/PT)</th>
                <th className="p-3">Net Disbursement</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723] text-xs">
              {payrollRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-indigo-400">{rec.payrollNumber}</td>
                  <td className="p-3 font-bold text-[#211B17]">{rec.employeeName}</td>
                  <td className="p-3 font-semibold text-[#544B45]">{rec.department}</td>
                  <td className="p-3 font-mono">₹{rec.grossEarnings?.toLocaleString()}</td>
                  <td className="p-3 font-mono text-rose-400">₹{rec.totalDeductions?.toLocaleString()}</td>
                  <td className="p-3 font-mono font-extrabold text-emerald-400">₹{rec.netSalary?.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      {rec.status}
                    </span>
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
