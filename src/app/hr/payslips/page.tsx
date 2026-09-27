'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { FileText, Printer, Download, Building, DollarSign, UserCheck, ShieldCheck } from 'lucide-react';

export default function PayslipsPage() {
  const { payrollRecords, company } = useERP();
  const [selectedRecord, setSelectedRecord] = useState(payrollRecords[0]);

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-crm-brand-500" />
            Official PDF Payslip Generator & Self-Service
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Printable Employee Salary Slip with Statutory PF/ESI/PT Breakdown & Company Letterhead
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF Payslip
          </button>
        </div>
      </div>

      {/* Select Record Bar */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex items-center gap-4 print:hidden">
        <label className="text-xs font-bold text-[#70665F] uppercase tracking-wider">Select Employee Payslip:</label>
        <select
          value={selectedRecord?.id}
          onChange={(e) => {
            const found = payrollRecords.find((p) => p.id === e.target.value);
            if (found) setSelectedRecord(found);
          }}
          className="bg-white border border-[#EBE3DB] rounded-lg px-3 py-2 text-sm text-[#211B17] focus:outline-none focus:border-crm-brand-600"
        >
          {payrollRecords.map((p) => (
            <option key={p.id} value={p.id}>
              {p.employeeName} — {p.monthYear} ({p.payrollNumber})
            </option>
          ))}
        </select>
      </div>

      {/* Printable Payslip Card Container */}
      {selectedRecord && (
        <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl space-y-6 print:p-0 print:shadow-none">
          {/* Company Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-[#EBE3DB] pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{company.companyName || 'UMA TECHNO FAB MFG ERP'}</h2>
              <p className="text-xs text-slate-600 font-medium">GIDC Vatva Industrial Estate, Phase 3, Ahmedabad, Gujarat - 382445</p>
              <p className="text-xs text-slate-600 font-medium">GSTIN: 24AAACU1234F1Z9 | Corporate CIN: U28910GJ2020PTC112233</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-crm-brand-800 bg-crm-brand- px-3 py-1 rounded-full">
                SALARY SLIP
              </span>
              <div className="text-xs font-mono text-slate-600 mt-2">Month: <strong className="text-slate-900">{selectedRecord.monthYear}</strong></div>
              <div className="text-xs font-mono text-slate-600">Voucher Ref: {selectedRecord.payrollNumber}</div>
            </div>
          </div>

          {/* Employee & Statutory Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-100 p-4 rounded-xl text-xs border border-slate-300">
            <div><span className="text-[#70665F] block font-semibold">Employee ID:</span><span className="font-bold text-slate-900">{selectedRecord.employeeId}</span></div>
            <div><span className="text-[#70665F] block font-semibold">Employee Name:</span><span className="font-bold text-slate-900">{selectedRecord.employeeName}</span></div>
            <div><span className="text-[#70665F] block font-semibold">Department:</span><span className="font-bold text-slate-900">{selectedRecord.department}</span></div>
            <div><span className="text-[#70665F] block font-semibold">Designation:</span><span className="font-bold text-slate-900">{selectedRecord.designation}</span></div>
            <div><span className="text-[#70665F] block font-semibold">Working Days:</span><span className="font-bold text-slate-900">{selectedRecord.workingDays} Days</span></div>
            <div><span className="text-[#70665F] block font-semibold">Paid Present Days:</span><span className="font-bold text-slate-900">{selectedRecord.presentDays} Days</span></div>
            <div><span className="text-[#70665F] block font-semibold">PF UAN No:</span><span className="font-bold text-slate-900 font-mono">100998877665</span></div>
            <div><span className="text-[#70665F] block font-semibold">Bank A/C No:</span><span className="font-bold text-slate-900 font-mono">XXXX-XXXX-9901</span></div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Earnings */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-200 px-4 py-2 font-extrabold text-slate-900 border-b border-slate-300 uppercase tracking-wider flex justify-between">
                <span>Gross Earnings</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2 text-slate-800 font-medium">
                <div className="flex justify-between"><span>Basic Salary</span><span>₹{selectedRecord.basicSalary?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>House Rent Allowance (HRA)</span><span>₹{selectedRecord.hra?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Special & Other Allowances</span><span>₹{selectedRecord.allowances?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Overtime Amount</span><span>₹{selectedRecord.overtimeAmount?.toLocaleString()}</span></div>
                <div className="flex justify-between font-extrabold text-slate-900 border-t border-slate-300 pt-2 text-sm">
                  <span>Total Gross Earnings</span>
                  <span>₹{selectedRecord.grossEarnings?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-200 px-4 py-2 font-extrabold text-slate-900 border-b border-slate-300 uppercase tracking-wider flex justify-between">
                <span>Deductions & Tax</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2 text-slate-800 font-medium">
                <div className="flex justify-between"><span>Provident Fund (EPF 12%)</span><span>₹{selectedRecord.pfDeduction?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>ESIC (Employee 0.75%)</span><span>₹{selectedRecord.esiDeduction?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Professional Tax (PT)</span><span>₹{selectedRecord.ptDeduction?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Income Tax (TDS)</span><span>₹{selectedRecord.tdsDeduction?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Advance / Loan EMI Recovery</span><span>₹{selectedRecord.loanAdvanceRecovery?.toLocaleString()}</span></div>
                <div className="flex justify-between font-extrabold text-rose-700 border-t border-slate-300 pt-2 text-sm">
                  <span>Total Deductions</span>
                  <span>-₹{selectedRecord.totalDeductions?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Footer */}
          <div className="bg-crm-brand- border-2 border-crm-brand- rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-crm-brand-">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-crm-brand-800 block">NET TAKE-HOME SALARY PAYABLE</span>
              <div className="text-3xl font-black text-crm-brand- mt-1">₹{selectedRecord.netSalary?.toLocaleString()}</div>
            </div>
            <div className="text-xs text-right font-medium text-slate-600">
              <div>Mode of Payment: Direct NEFT / RTGS Bank Transfer</div>
              <div className="text-crm-brand-800 font-bold">Status: Processed & Disbursed</div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-semibold text-slate-600">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <span>Employee Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <span>Authorized HR Signatory (Uma Techno Fab)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
