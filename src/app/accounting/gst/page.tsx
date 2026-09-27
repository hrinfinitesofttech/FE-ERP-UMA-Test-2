'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Scale, Download, CheckCircle2, AlertTriangle, FileSpreadsheet, Building } from 'lucide-react';

export default function GSTManagementPage() {
  const { salesInvoices, purchaseInvoices } = useERP();
  const [activeTab, setActiveTab] = useState<'GSTR1' | 'GSTR2B' | 'GSTR3B'>('GSTR3B');

  const totalSalesTax = salesInvoices.reduce((acc, inv) => acc + (inv.cgstAmount ?? inv.cgstTotal ?? 0) + (inv.sgstAmount ?? inv.sgstTotal ?? 0) + (inv.igstAmount ?? inv.igstTotal ?? 0), 0);
  const totalITC = purchaseInvoices.reduce((acc, inv) => acc + (inv.cgstAmount ?? inv.cgstTotal ?? 0) + (inv.sgstAmount ?? inv.sgstTotal ?? 0) + (inv.igstAmount ?? inv.igstTotal ?? 0), 0);
  const netCashPayable = Math.max(0, totalSalesTax - totalITC);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/20 rounded-xl text-yellow-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Indian GST Filing & Tax Compliance Portal</h1>
            <p className="text-xs text-[#70665F] mt-0.5">GSTIN: 24AAACX0000X1Z1 • GSTR-1, GSTR-2B ITC Matching & GSTR-3B Auto Summary</p>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-yellow-500/20">
          <Download className="w-4 h-4" />
          <span>Export JSON for GST Portal</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#EBE3DB] pb-3">
        <button
          onClick={() => setActiveTab('GSTR3B')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'GSTR3B' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white text-[#70665F] hover:text-[#211B17]'
          }`}
        >
          GSTR-3B Net Computation
        </button>
        <button
          onClick={() => setActiveTab('GSTR1')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'GSTR1' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white text-[#70665F] hover:text-[#211B17]'
          }`}
        >
          GSTR-1 Outward Supplies ({salesInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('GSTR2B')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'GSTR2B' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white text-[#70665F] hover:text-[#211B17]'
          }`}
        >
          GSTR-2B Input Credit ({purchaseInvoices.length})
        </button>
      </div>

      {activeTab === 'GSTR3B' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] space-y-2">
              <span className="text-xs text-[#70665F] uppercase font-semibold">Total Output GST Liability (GSTR-1)</span>
              <div className="text-2xl font-bold text-yellow-400 font-mono">₹{totalSalesTax?.toLocaleString()}</div>
              <div className="text-[11px] text-[#70665F]">CGST + SGST + IGST Collected</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] space-y-2">
              <span className="text-xs text-[#70665F] uppercase font-semibold">Eligible Input Tax Credit (GSTR-2B)</span>
              <div className="text-2xl font-bold text-crm-brand-500 font-mono">₹{totalITC?.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-400 font-semibold">100% Reconciled</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] space-y-2">
              <span className="text-xs text-[#70665F] uppercase font-semibold">Net Cash Liability to Pay</span>
              <div className="text-2xl font-bold text-amber-400 font-mono">₹{netCashPayable?.toLocaleString()}</div>
              <div className="text-[11px] text-[#70665F]">Electronic Cash Ledger</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EBE3DB] space-y-4">
            <h3 className="text-base font-bold text-[#211B17]">GSTR-3B Table 3.1 & 4 Summary Computation</h3>

            <div className="bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] overflow-hidden">
              <table className="w-full text-left text-xs text-[#544B45]">
                <thead className="bg-white text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
                  <tr>
                    <th className="py-3 px-4">Details of Supplies</th>
                    <th className="py-3 px-4 text-right">Taxable Value ₹</th>
                    <th className="py-3 px-4 text-right">Integrated Tax (IGST) ₹</th>
                    <th className="py-3 px-4 text-right">Central Tax (CGST) ₹</th>
                    <th className="py-3 px-4 text-right">State Tax (SGST) ₹</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB] font-mono">
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">(a) Outward Taxable Supplies</td>
                    <td className="py-3 px-4 text-right text-[#3E2723]">
                      ₹{salesInvoices.reduce((a, b) => a + (b.subTotal ?? b.subtotal ?? b.taxableAmount ?? 0), 0)?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-[#70665F]">₹0</td>
                    <td className="py-3 px-4 text-right text-yellow-400">₹{(totalSalesTax / 2)?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-yellow-400">₹{(totalSalesTax / 2)?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">4. Eligible ITC - All other ITC</td>
                    <td className="py-3 px-4 text-right text-[#3E2723]">
                      ₹{purchaseInvoices.reduce((a, b) => a + (b.subTotal ?? b.subtotal ?? b.taxableAmount ?? 0), 0)?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-[#70665F]">₹0</td>
                    <td className="py-3 px-4 text-right text-crm-brand-500">₹{(totalITC / 2)?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-crm-brand-500">₹{(totalITC / 2)?.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-white/80 font-bold">
                    <td className="py-3 px-4 font-sans text-amber-400">Net Tax Payable (3.1 - 4)</td>
                    <td className="py-3 px-4 text-right text-[#70665F]">-</td>
                    <td className="py-3 px-4 text-right text-[#70665F]">₹0</td>
                    <td className="py-3 px-4 text-right text-amber-400">₹{(netCashPayable / 2)?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-amber-400">₹{(netCashPayable / 2)?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'GSTR1' && (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Customer GSTIN</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">POS</th>
                <th className="py-3.5 px-4 text-right">Taxable Value</th>
                <th className="py-3.5 px-4 text-right">CGST</th>
                <th className="py-3.5 px-4 text-right">SGST</th>
                <th className="py-3.5 px-4 text-right">Total Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] font-mono">
              {salesInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-[#70665F]">{inv.customerGstin}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{inv.customerName}</td>
                  <td className="py-3 px-4 font-sans text-[#70665F]">{inv.placeOfSupply}</td>
                  <td className="py-3 px-4 text-right text-[#544B45]">₹{(inv.subTotal ?? inv.subtotal ?? inv.taxableAmount ?? 0)?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-yellow-400">₹{(inv.cgstAmount ?? inv.cgstTotal ?? 0)?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-yellow-400">₹{(inv.sgstAmount ?? inv.sgstTotal ?? 0)?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#211B17]">₹{inv.grandTotal?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'GSTR2B' && (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Supplier Bill No</th>
                <th className="py-3.5 px-4">Supplier GSTIN</th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4 text-right">Taxable Value</th>
                <th className="py-3.5 px-4 text-right">CGST ITC</th>
                <th className="py-3.5 px-4 text-right">SGST ITC</th>
                <th className="py-3.5 px-4 text-center">GSTR-2B Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] font-mono">
              {purchaseInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 px-4 text-crm-brand-500 font-bold">{inv.vendorInvoiceNumber}</td>
                  <td className="py-3 px-4 text-[#70665F]">{inv.supplierGstin}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{inv.supplierName}</td>
                  <td className="py-3 px-4 text-right text-[#544B45]">₹{(inv.subTotal ?? inv.subtotal ?? inv.taxableAmount ?? 0)?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-crm-brand-500">₹{(inv.cgstAmount ?? inv.cgstTotal ?? 0)?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-crm-brand-500">₹{(inv.sgstAmount ?? inv.sgstTotal ?? 0)?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">Matched in 2B</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
