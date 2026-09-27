'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Calculator, Plus, Search, FileText, Download, CheckCircle2 } from 'lucide-react';

export default function TDSCompliancePage() {
  const { tdsMasters, purchaseInvoices } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const totalTDSDeducted = purchaseInvoices.reduce((acc, inv) => acc + (inv.tdsAmount ?? inv.tdsDeducted ?? 0), 0);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/20 rounded-xl text-violet-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">TDS Compliance & Form 26Q Register</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Tax Deducted at Source • Section 194C (Subcontracting), 194J (Professional), 194Q (Goods)</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-[#70665F]">Total TDS Payable to Govt</div>
          <div className="text-lg font-bold text-violet-400 font-mono">₹{totalTDSDeducted?.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tdsMasters.map((t) => (
          <div key={t.id} className="bg-white p-5 rounded-2xl border border-[#EBE3DB] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-violet-400">Section {t.sectionCode}</span>
              <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold font-mono">{t.rate}% Rate</span>
            </div>
            <h3 className="text-sm font-bold text-[#211B17]">{t.description}</h3>
            <div className="text-xs text-[#70665F]">Exemption Limit: ₹{t.thresholdLimit?.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
        <div className="p-4 border-b border-[#EBE3DB] font-bold text-[#211B17] text-sm">TDS Deductions in Vendor Bills</div>
        <table className="w-full text-left text-xs text-[#544B45]">
          <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
            <tr>
              <th className="py-3.5 px-4">ERP Invoice No</th>
              <th className="py-3.5 px-4">Vendor Bill No</th>
              <th className="py-3.5 px-4">Supplier Name</th>
              <th className="py-3.5 px-4">TDS Section</th>
              <th className="py-3.5 px-4 text-right">Bill Taxable Base</th>
              <th className="py-3.5 px-4 text-right">TDS Rate</th>
              <th className="py-3.5 px-4 text-right">TDS Deducted ₹</th>
              <th className="py-3.5 px-4 text-center">Form 26Q Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {purchaseInvoices.map((inv) => (
              <tr key={inv.id}>
                <td className="py-3 px-4 font-bold text-crm-brand-500">{inv.invoiceNumber}</td>
                <td className="py-3 px-4 text-[#3E2723]">{inv.vendorInvoiceNumber}</td>
                <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{inv.supplierName}</td>
                <td className="py-3 px-4 text-violet-400 font-sans">Sec {inv.tdsSection || '194C'}</td>
                <td className="py-3 px-4 text-right text-[#544B45]">₹{(inv.subTotal ?? inv.subtotal ?? inv.taxableAmount ?? 0)?.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-[#70665F]">{inv.tdsRate ?? 2}%</td>
                <td className="py-3 px-4 text-right font-bold text-violet-400">₹{(inv.tdsAmount ?? inv.tdsDeducted ?? 0)?.toLocaleString()}</td>
                <td className="py-3 px-4 text-center font-sans">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">Included in 26Q</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
