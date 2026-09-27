'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { FileBarChart, Download, Search, FileText, CheckCircle2, Filter, Printer } from 'lucide-react';

export default function FinancialReportsPage() {
  const { salesInvoices, purchaseInvoices, bankAccounts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewReport, setPreviewReport] = useState<string | null>('Balance Sheet (As per Schedule III)');

  const reportsList = [
    // Statutory & Financial Statements (7)
    { id: 'R01', name: 'Balance Sheet (As per Schedule III)', category: 'Financial Statements', code: 'BS-01' },
    { id: 'R02', name: 'Profit & Loss Statement (P&L)', category: 'Financial Statements', code: 'PL-01' },
    { id: 'R03', name: 'Trial Balance (Group-wise & Ledger-wise)', category: 'Financial Statements', code: 'TB-01' },
    { id: 'R04', name: 'Cash Flow Statement (AS-3 Direct/Indirect)', category: 'Financial Statements', code: 'CF-01' },
    { id: 'R05', name: 'Statement of Changes in Equity', category: 'Financial Statements', code: 'EQ-01' },
    { id: 'R06', name: 'General Ledger Summary & Detail', category: 'Financial Statements', code: 'GL-01' },
    { id: 'R07', name: 'Day Book & Voucher Register', category: 'Financial Statements', code: 'DB-01' },

    // Indian GST Reports (7)
    { id: 'R08', name: 'GSTR-1 Outward Sales Tax Register', category: 'GST & Taxes', code: 'GST-01' },
    { id: 'R09', name: 'GSTR-2B Input Tax Credit Reconciliation', category: 'GST & Taxes', code: 'GST-02' },
    { id: 'R10', name: 'GSTR-3B Net Liability Computation', category: 'GST & Taxes', code: 'GST-03' },
    { id: 'R11', name: 'GSTR-9 Annual Return Summary', category: 'GST & Taxes', code: 'GST-04' },
    { id: 'R12', name: 'HSN-wise Summary of Outward Supplies', category: 'GST & Taxes', code: 'GST-05' },
    { id: 'R13', name: 'Electronic Cash & Credit Ledger Register', category: 'GST & Taxes', code: 'GST-06' },
    { id: 'R14', name: 'E-Way Bill & E-Invoice Register', category: 'GST & Taxes', code: 'GST-07' },

    // Indian TDS Reports (4)
    { id: 'R15', name: 'TDS Deduction Register (Sec 194C/194J/194Q)', category: 'GST & Taxes', code: 'TDS-01' },
    { id: 'R16', name: 'Form 26Q Quarterly E-TDS Return Summary', category: 'GST & Taxes', code: 'TDS-02' },
    { id: 'R17', name: 'TDS Payment Chalan Register', category: 'GST & Taxes', code: 'TDS-03' },
    { id: 'R18', name: 'Form 16A Vendor TDS Certificate Log', category: 'GST & Taxes', code: 'TDS-04' },

    // Receivables & Payables (6)
    { id: 'R19', name: 'Customer Outstanding AR Aging Analysis', category: 'Receivables & Payables', code: 'AR-01' },
    { id: 'R20', name: 'Supplier Outstanding AP Aging Analysis', category: 'Receivables & Payables', code: 'AP-01' },
    { id: 'R21', name: 'Customer Ledger Statement with Interest', category: 'Receivables & Payables', code: 'AR-02' },
    { id: 'R22', name: 'Supplier Ledger Statement', category: 'Receivables & Payables', code: 'AP-02' },
    { id: 'R23', name: 'Collection Efficiency & DSO Report', category: 'Receivables & Payables', code: 'AR-03' },
    { id: 'R24', name: 'Vendor DPO & Payment Performance Report', category: 'Receivables & Payables', code: 'AP-03' },

    // Job & Manufacturing Costing (5)
    { id: 'R25', name: 'Job-wise Financial Profitability Analysis', category: 'Job & Project Costing', code: 'JOB-01' },
    { id: 'R26', name: 'Project Cost Variance (Budget vs Actual)', category: 'Job & Project Costing', code: 'PROJ-01' },
    { id: 'R27', name: 'Direct Material & Subcontracting Cost Audit', category: 'Job & Project Costing', code: 'COST-01' },
    { id: 'R28', name: 'Factory Overhead Allocation Summary', category: 'Job & Project Costing', code: 'COST-02' },
    { id: 'R29', name: 'Work-in-Progress (WIP) Financial Valuation', category: 'Job & Project Costing', code: 'WIP-01' },

    // Banking & Assets (6)
    { id: 'R30', name: 'Bank Reconciliation Statement (BRS)', category: 'Banking & Assets', code: 'BNK-01' },
    { id: 'R31', name: 'Cash Flow Projection & Liquidity Forecast', category: 'Banking & Assets', code: 'BNK-02' },
    { id: 'R32', name: 'Fixed Asset Register (IT Act vs Co Act)', category: 'Banking & Assets', code: 'AST-01' },
    { id: 'R33', name: 'Depreciation Amortization Schedule', category: 'Banking & Assets', code: 'AST-02' },
    { id: 'R34', name: 'Physical Inventory Financial Valuation', category: 'Banking & Assets', code: 'INV-01' },
    { id: 'R35', name: 'Audit Trail & Compliance Log Report', category: 'Banking & Assets', code: 'AUD-01' },
  ];

  const filteredReports = reportsList.filter((r) => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm?.toLowerCase()) || r.code?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Financial Statements', 'GST & Taxes', 'Receivables & Payables', 'Job & Project Costing', 'Banking & Assets'];

  const handleExportCSV = (reportName: string) => {
    const csvContent = `Uma Techno Fab ERP - Financial Report: ${reportName}\nDate: ${new Date().toISOString()}\nCode,Field,Value\n01,Sample Record,100000\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportName?.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB] print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Financial & Statutory Reports Hub (35 Reports)</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Full Suite of Balance Sheet, P&L, GST, TDS, AR/AP, Job Costing & Asset Reports</p>
          </div>
        </div>

        <button
          onClick={() => handleExportCSV(previewReport || 'Financial_Report')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Selected Report CSV</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE3DB] print:hidden">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search 35 reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === c ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#FAF7F2] text-[#70665F] border border-[#EBE3DB]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Index */}
        <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] space-y-2 max-h-[70vh] overflow-y-auto print:hidden">
          <div className="text-xs font-bold text-[#211B17] uppercase tracking-wider px-2 py-1">Available Reports ({filteredReports.length})</div>
          {filteredReports.map((r) => (
            <div
              key={r.id}
              onClick={() => setPreviewReport(r.name)}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                previewReport === r.name ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-[#FAF7F2] border-[#EBE3DB] hover:border-[#EBE3DB] text-[#544B45]'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-mono">{r.code}: {r.name}</div>
                <div className="text-[10px] text-[#70665F] mt-0.5">{r.category}</div>
              </div>
              <Download className="w-3.5 h-3.5 text-[#70665F] hover:text-[#211B17]" onClick={(e) => { e.stopPropagation(); handleExportCSV(r.name); }} />
            </div>
          ))}
        </div>

        {/* Live Preview Screen */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EBE3DB] space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3 print:hidden">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400">REPORT PREVIEW</span>
              <h3 className="text-base font-bold text-[#211B17]">{previewReport}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV(previewReport || 'Report')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#3E2723] text-xs font-semibold transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#EBE3DB] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3 font-mono">
              <div>
                <div className="text-sm font-bold text-[#211B17]">UMA TECHNO FAB MANUFACTURING ERP</div>
                <div className="text-[#70665F]">Plot 124, GIDC Makarpura, Vadodara, Gujarat - 390010</div>
                <div className="text-[#70665F]">GSTIN: 24AAACX0000X1Z1 | PAN: AAACX0000X</div>
              </div>
              <div className="text-right">
                <div className="text-[#70665F]">Period: FY 2025-26 (01-Apr-2025 to 31-Mar-2026)</div>
                <div className="text-emerald-400 font-bold">Currency: INR (₹)</div>
              </div>
            </div>

            {/* Mock Report Table Data */}
            <table className="w-full text-left text-xs text-[#544B45]">
              <thead className="bg-white text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
                <tr>
                  <th className="py-2.5 px-3">Particulars / Account Head</th>
                  <th className="py-2.5 px-3 text-right">Debit (Dr) ₹</th>
                  <th className="py-2.5 px-3 text-right">Credit (Cr) ₹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB] font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#211B17]">I. EQUITY & LIABILITIES</td>
                  <td className="py-2.5 px-3 text-right text-[#70665F]">-</td>
                  <td className="py-2.5 px-3 text-right text-[#70665F]">-</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 pl-6 text-[#544B45]">1. Share Capital & Reserves</td>
                  <td className="py-2.5 px-3 text-right text-[#70665F]">-</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">₹25,000,000</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 pl-6 text-[#544B45]">2. Trade Payables (Sundry Creditors)</td>
                  <td className="py-2.5 px-3 text-right text-[#70665F]">-</td>
                  <td className="py-2.5 px-3 text-right text-indigo-400">₹17,900,000</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#211B17]">II. ASSETS</td>
                  <td className="py-2.5 px-3 text-right text-[#70665F]">-</td>
                  <td className="py-2.5 px-3 text-right text-[#70665F]">-</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 pl-6 text-[#544B45]">1. Property, Plant & Equipment (Fixed Assets)</td>
                  <td className="py-2.5 px-3 text-right text-teal-400">₹27,500,000</td>
                  <td className="py-2.5 px-3 text-right text-[#70665F]">-</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 pl-6 text-[#544B45]">2. Trade Receivables (Sundry Debtors)</td>
                  <td className="py-2.5 px-3 text-right text-amber-400">₹29,600,000</td>
                  <td className="py-2.5 px-3 text-right text-[#70665F]">-</td>
                </tr>
                <tr className="bg-white font-bold border-t border-[#EBE3DB]">
                  <td className="py-3 px-3 text-[#211B17]">TOTAL BALANCE</td>
                  <td className="py-3 px-3 text-right text-emerald-400">₹57,100,000</td>
                  <td className="py-3 px-3 text-right text-emerald-400">₹57,100,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
