'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { FileText, Search, Plus, Filter, CheckCircle2, Clock, Eye, Download, Building, ShieldCheck, Scale } from 'lucide-react';

export default function PurchaseInvoicesPage() {
  const { purchaseInvoices, addPurchaseInvoice, postPurchaseInvoice, suppliers, goodsReceipts, purchaseOrders } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState('');
  const [poNumber, setPoNumber] = useState(purchaseOrders[0]?.poNumber || '');
  const [grnNumber, setGrnNumber] = useState(goodsReceipts[0]?.grnNumber || '');
  const [subTotal, setSubTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(18);
  const [tdsSection, setTdsSection] = useState('194C');
  const [tdsRate, setTdsRate] = useState(2);

  const filteredInvoices = (purchaseInvoices || []).filter((inv) => {
    const matchesSearch =
      (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.vendorInvoiceNumber || inv.supplierInvoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePurchaseInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const supp = suppliers.find((s) => s.id === supplierId) || suppliers[0];

    const taxAmount = (subTotal * taxRate) / 100;
    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;
    const igstAmount = 0;

    const tdsAmount = (subTotal * tdsRate) / 100;
    const grandTotal = subTotal + taxAmount - tdsAmount;

    addPurchaseInvoice({
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-10-30',
      supplierId: supp.id,
      supplierName: supp.supplierName || (supp as any).name || 'Unknown Supplier',
      supplierGstin: supp.gstin || '24AAACX8888Y1Z5',
      vendorInvoiceNumber,
      poNumber,
      grnNumber,
      jobNumber: 'JOB-2026-001',
      projectId: 'PROJ-2026-001',
      items: [
        {
          id: 'PITEM-1',
          description: 'Special Alloy Structural Steel Beams & Plates',
          hsnSac: '7208',
          quantity: 25,
          unitPrice: 58000,
          taxRate,
          taxAmount,
          totalAmount: subTotal + taxAmount,
        },
      ],
      subTotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      taxTotal: taxAmount,
      tdsSection,
      tdsRate,
      tdsAmount,
      grandTotal,
      status: 'Pending_Posting',
      paymentStatus: 'Unpaid',
      createdBy: 'Rajesh Patel',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Purchase Invoices & Input Tax Credit (ITC)</h1>
            <p className="text-xs text-slate-400 mt-0.5">Automated 3-Way Match (PO + GRN + Invoice) • Section 194C/194J TDS Deduction</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Invoice</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search invoice no, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Pending_Posting', 'Posted'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedStatus === st ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">ERP PINV No</th>
              <th className="py-3.5 px-4">Vendor Bill No</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4">PO / GRN</th>
              <th className="py-3.5 px-4 text-right">Taxable SubTotal</th>
              <th className="py-3.5 px-4 text-right">ITC Tax</th>
              <th className="py-3.5 px-4 text-right">TDS (194C)</th>
              <th className="py-3.5 px-4 text-right">Net Payable</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-4 font-bold text-purple-400">{inv.invoiceNumber}</td>
                <td className="py-3 px-4 text-slate-200">{inv.vendorInvoiceNumber || inv.supplierInvoiceNumber}</td>
                <td className="py-3 px-4 font-sans font-semibold text-slate-200">{inv.supplierName}</td>
                <td className="py-3 px-4 font-sans text-slate-400">
                  {inv.poNumber} / {inv.grnNumber}
                </td>
                <td className="py-3 px-4 text-right text-slate-300">₹{(inv.subTotal ?? inv.subtotal ?? 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-cyan-400">₹{(inv.taxTotal ?? 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-violet-400">₹{(inv.tdsAmount ?? inv.tdsDeducted ?? 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-white">₹{(inv.grandTotal ?? 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-center font-sans">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      inv.status === 'Posted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-sans">
                  {inv.status !== 'Posted' ? (
                    <button
                      onClick={() => postPurchaseInvoice(inv.id)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-semibold rounded-lg transition"
                    >
                      Post to Ledger
                    </button>
                  ) : (
                    <span className="text-slate-500 text-[10px]">Posted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Book Purchase Invoice</h3>
            <form onSubmit={handleCreatePurchaseInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplierName} ({s.gstin})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Vendor Invoice / Bill No</label>
                  <input
                    type="text"
                    required
                    value={vendorInvoiceNumber}
                    onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">PO Number</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Taxable Amount (₹)</label>
                  <input
                    type="number"
                    value={subTotal}
                    onChange={(e) => setSubTotal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">TDS Section</label>
                  <select
                    value={tdsSection}
                    onChange={(e) => setTdsSection(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="194C">194C - Subcontracting (2%)</option>
                    <option value="194J">194J - Professional Fee (10%)</option>
                    <option value="194Q">194Q - Purchase of Goods (0.1%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">TDS Rate (%)</label>
                  <input
                    type="number"
                    value={tdsRate}
                    onChange={(e) => setTdsRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold">
                  Save Purchase Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
