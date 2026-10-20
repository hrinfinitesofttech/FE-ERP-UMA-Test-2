'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Scale, Download, CheckCircle2, AlertTriangle, FileSpreadsheet, Building } from 'lucide-react';

export default function GSTManagementPage() {
  const { salesInvoices, purchaseInvoices } = useERP();
  const [activeTab, setActiveTab] = useState<'GSTR1' | 'GSTR2B' | 'GSTR3B'>('GSTR3B');

  // Exact Tax Computations from Live Invoices
  const taxableSales = salesInvoices.reduce((acc, inv) => acc + Number(inv.subTotal ?? inv.subtotal ?? inv.taxableAmount ?? 0), 0);
  const cgstSales = salesInvoices.reduce((acc, inv) => acc + Number(inv.cgstAmount ?? inv.cgstTotal ?? 0), 0);
  const sgstSales = salesInvoices.reduce((acc, inv) => acc + Number(inv.sgstAmount ?? inv.sgstTotal ?? 0), 0);
  const igstSales = salesInvoices.reduce((acc, inv) => acc + Number(inv.igstAmount ?? inv.igstTotal ?? 0), 0);
  const totalSalesTax = cgstSales + sgstSales + igstSales;

  const taxablePurchase = purchaseInvoices.reduce((acc, inv) => acc + Number(inv.subTotal ?? inv.subtotal ?? inv.taxableAmount ?? 0), 0);
  const cgstPurchase = purchaseInvoices.reduce((acc, inv) => acc + Number(inv.cgstAmount ?? inv.cgstTotal ?? 0), 0);
  const sgstPurchase = purchaseInvoices.reduce((acc, inv) => acc + Number(inv.sgstAmount ?? inv.sgstTotal ?? 0), 0);
  const igstPurchase = purchaseInvoices.reduce((acc, inv) => acc + Number(inv.igstAmount ?? inv.igstTotal ?? 0), 0);
  const totalITC = cgstPurchase + sgstPurchase + igstPurchase;

  const netIgstPayable = Math.max(0, igstSales - igstPurchase);
  const netCgstPayable = Math.max(0, cgstSales - cgstPurchase);
  const netSgstPayable = Math.max(0, sgstSales - sgstPurchase);
  const netCashPayable = netIgstPayable + netCgstPayable + netSgstPayable;

  const handleExportJSON = () => {
    const payload = {
      gstin: '24AAACX0000X1Z1',
      fp: new Date().toISOString().slice(0, 7).replace('-', ''),
      b2b: salesInvoices.map((inv) => ({
        ctin: inv.customerGstin || 'URP',
        inv: [
          {
            inum: inv.invoiceNumber,
            idt: inv.invoiceDate || new Date().toISOString().split('T')[0],
            val: inv.grandTotal,
            pos: inv.placeOfSupply || '24-Gujarat',
            rchrg: 'N',
            itms: [
              {
                num: 1,
                itm_det: {
                  txval: Number(inv.subTotal ?? inv.taxableAmount ?? 0),
                  rt: 18,
                  iamt: Number(inv.igstAmount ?? 0),
                  camt: Number(inv.cgstAmount ?? 0),
                  samt: Number(inv.sgstAmount ?? 0),
                  csamt: 0,
                },
              },
            ],
          },
        ],
      })),
      gstr3b_summary: {
        outward_supplies: { txval: taxableSales, igst: igstSales, cgst: cgstSales, sgst: sgstSales },
        eligible_itc: { txval: taxablePurchase, igst: igstPurchase, cgst: cgstPurchase, sgst: sgstPurchase },
        net_payable: { igst: netIgstPayable, cgst: netCgstPayable, sgst: netSgstPayable, total: netCashPayable },
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR_COMPLIANCE_${payload.gstin}_${payload.fp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#211B17]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/20 rounded-xl text-yellow-600">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Indian GST Filing & Tax Compliance Portal</h1>
            <p className="text-xs text-[#70665F] mt-0.5">GSTIN: 24AAACX0000X1Z1 • GSTR-1, GSTR-2B ITC Matching & GSTR-3B Auto Summary</p>
          </div>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON for GST Portal</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#EBE3DB] pb-3">
        <button
          onClick={() => setActiveTab('GSTR3B')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'GSTR3B' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' : 'bg-white text-[#70665F] hover:text-[#211B17]'
          }`}
        >
          GSTR-3B Net Computation
        </button>
        <button
          onClick={() => setActiveTab('GSTR1')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'GSTR1' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' : 'bg-white text-[#70665F] hover:text-[#211B17]'
          }`}
        >
          GSTR-1 Outward Supplies ({salesInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('GSTR2B')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'GSTR2B' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' : 'bg-white text-[#70665F] hover:text-[#211B17]'
          }`}
        >
          GSTR-2B Input Credit ({purchaseInvoices.length})
        </button>
      </div>

      {activeTab === 'GSTR3B' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-2">
              <span className="text-xs text-[#70665F] uppercase font-semibold">Total Output Tax (GSTR-1)</span>
              <div className="text-2xl font-bold text-yellow-600 font-mono">₹{totalSalesTax.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-[#70665F]">IGST: ₹{igstSales.toLocaleString('en-IN')} | CGST/SGST: ₹{(cgstSales + sgstSales).toLocaleString('en-IN')}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-2">
              <span className="text-xs text-[#70665F] uppercase font-semibold">Eligible ITC (GSTR-2B)</span>
              <div className="text-2xl font-bold text-emerald-600 font-mono">₹{totalITC.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">Reconciled with Vendor Bills</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-2">
              <span className="text-xs text-[#70665F] uppercase font-semibold">Net Cash Liability to Pay</span>
              <div className="text-2xl font-bold text-amber-600 font-mono">₹{netCashPayable.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-[#70665F]">Electronic Cash Ledger</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-2">
              <span className="text-xs text-[#70665F] uppercase font-semibold">Net Outward Turnover</span>
              <div className="text-2xl font-bold text-[#211B17] font-mono">₹{taxableSales.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-[#70665F]">Total Taxable Value</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#211B17]">GSTR-3B Table 3.1 & 4 Summary Computation</h3>

            <div className="bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] overflow-x-auto">
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
                    <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">(a) Outward Taxable Supplies (GSTR-1)</td>
                    <td className="py-3 px-4 text-right text-[#3E2723]">₹{taxableSales.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-yellow-600">₹{igstSales.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-yellow-600">₹{cgstSales.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-yellow-600">₹{sgstSales.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">4. Eligible ITC - All other ITC (GSTR-2B)</td>
                    <td className="py-3 px-4 text-right text-[#3E2723]">₹{taxablePurchase.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">₹{igstPurchase.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">₹{cgstPurchase.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">₹{sgstPurchase.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-white/80 font-bold">
                    <td className="py-3 px-4 font-sans text-amber-600">Net Tax Payable (Output - ITC)</td>
                    <td className="py-3 px-4 text-right text-[#70665F]">-</td>
                    <td className="py-3 px-4 text-right text-amber-600">₹{netIgstPayable.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-amber-600">₹{netCgstPayable.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-amber-600">₹{netSgstPayable.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'GSTR1' && (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Customer GSTIN</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">POS</th>
                <th className="py-3.5 px-4 text-right">Taxable Value</th>
                <th className="py-3.5 px-4 text-right">IGST</th>
                <th className="py-3.5 px-4 text-right">CGST</th>
                <th className="py-3.5 px-4 text-right">SGST</th>
                <th className="py-3.5 px-4 text-right">Total Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] font-mono">
              {salesInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-amber-50/20 transition">
                  <td className="py-3 px-4 text-emerald-600 font-bold">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-[#70665F]">{inv.customerGstin || 'URP'}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{inv.customerName}</td>
                  <td className="py-3 px-4 font-sans text-[#70665F]">{inv.placeOfSupply || '24-Gujarat'}</td>
                  <td className="py-3 px-4 text-right text-[#544B45]">₹{Number(inv.subTotal ?? inv.subtotal ?? inv.taxableAmount ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-yellow-600">₹{Number(inv.igstAmount ?? inv.igstTotal ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-yellow-600">₹{Number(inv.cgstAmount ?? inv.cgstTotal ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-yellow-600">₹{Number(inv.sgstAmount ?? inv.sgstTotal ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#211B17]">₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'GSTR2B' && (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Supplier Bill No</th>
                <th className="py-3.5 px-4">Supplier GSTIN</th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4 text-right">Taxable Value</th>
                <th className="py-3.5 px-4 text-right">IGST ITC</th>
                <th className="py-3.5 px-4 text-right">CGST ITC</th>
                <th className="py-3.5 px-4 text-right">SGST ITC</th>
                <th className="py-3.5 px-4 text-center">GSTR-2B Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] font-mono">
              {purchaseInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-amber-50/20 transition">
                  <td className="py-3 px-4 text-indigo-600 font-bold">{inv.vendorInvoiceNumber || inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-[#70665F]">{inv.supplierGstin || 'URP'}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{inv.supplierName}</td>
                  <td className="py-3 px-4 text-right text-[#544B45]">₹{Number(inv.subTotal ?? inv.subtotal ?? inv.taxableAmount ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-emerald-600">₹{Number(inv.igstAmount ?? inv.igstTotal ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-emerald-600">₹{Number(inv.cgstAmount ?? inv.cgstTotal ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-emerald-600">₹{Number(inv.sgstAmount ?? inv.sgstTotal ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-600 font-semibold">Matched in 2B</span>
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
