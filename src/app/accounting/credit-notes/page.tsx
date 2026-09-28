'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { CreditCard, Plus, Search, FileText, Edit2, Trash2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CreditNote } from '../../../types/accounting';

export default function CreditNotesPage() {
  const { creditNotes, addCreditNote, updateCreditNote, deleteCreditNote, customers, salesInvoices } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCreditNote, setEditingCreditNote] = useState<CreditNote | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [reason, setReason] = useState('Price Difference / Return');
  const [taxableAmount, setTaxableAmount] = useState<number | string>('');
  const [taxAmount, setTaxAmount] = useState<number | string>('');

  // Selected customer invoices
  const customerInvoices = salesInvoices.filter(
    (inv) => inv.customerId === customerId || inv.customerName === customers.find((c) => c.id === customerId)?.companyName
  );

  // Selected invoice details
  const selectedInvoice = salesInvoices.find((inv) => inv.invoiceNumber === invoiceNumber);

  // Calculate previously credited amount on this invoice
  const existingCreditedTotal = creditNotes
    .filter((cn) => cn.originalInvoiceNumber === invoiceNumber && cn.id !== editingCreditNote?.id)
    .reduce((sum, cn) => sum + Number(cn.totalAmount || 0), 0);

  const invoiceGrandTotal = Number(selectedInvoice?.grandTotal || 0);
  const maxAllowableCredit = selectedInvoice ? Math.max(0, invoiceGrandTotal - existingCreditedTotal) : Infinity;

  const currentTotalCredit = (Number(taxableAmount) || 0) + (Number(taxAmount) || 0);
  const isAmountExceeded = selectedInvoice ? currentTotalCredit > maxAllowableCredit : false;

  const handleCustomerChange = (newCustId: string) => {
    setCustomerId(newCustId);
    const newCust = customers.find((c) => c.id === newCustId);
    const firstMatchingInv = salesInvoices.find(
      (inv) => inv.customerId === newCustId || inv.customerName === newCust?.companyName
    );
    if (firstMatchingInv) {
      setInvoiceNumber(firstMatchingInv.invoiceNumber);
      const taxBase = Number(firstMatchingInv.taxableAmount || (Number(firstMatchingInv.grandTotal || 0) / 1.18));
      const taxVal = Number(firstMatchingInv.grandTotal || 0) - taxBase;
      setTaxableAmount(Math.round(taxBase));
      setTaxAmount(Math.round(taxVal));
    } else {
      setInvoiceNumber('');
      setTaxableAmount('');
      setTaxAmount('');
    }
  };

  const handleInvoiceChange = (newInvNo: string) => {
    setInvoiceNumber(newInvNo);
    const inv = salesInvoices.find((i) => i.invoiceNumber === newInvNo);
    if (inv) {
      const alreadyCredited = creditNotes
        .filter((cn) => cn.originalInvoiceNumber === newInvNo)
        .reduce((sum, cn) => sum + Number(cn.totalAmount || 0), 0);
      const remainingBalance = Math.max(0, Number(inv.grandTotal || 0) - alreadyCredited);
      const estTaxable = Math.round(remainingBalance / 1.18);
      const estTax = remainingBalance - estTaxable;
      setTaxableAmount(estTaxable);
      setTaxAmount(estTax);
    }
  };

  const handleTaxableChange = (val: number | string) => {
    setTaxableAmount(val);
    if (val === '' || isNaN(Number(val))) {
      setTaxAmount('');
    } else {
      // Default 18% GST auto-calculation
      const num = Number(val);
      setTaxAmount(Math.round(num * 0.18));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId) || customers[0];
    const numTaxable = Number(taxableAmount) || 0;
    const numTax = Number(taxAmount) || 0;
    const total = numTaxable + numTax;

    if (total <= 0) {
      alert('Please enter a valid credit amount greater than 0.');
      return;
    }

    if (selectedInvoice && total > maxAllowableCredit) {
      alert(
        `Cannot issue Credit Note! Total amount (₹${total.toLocaleString()}) exceeds the maximum allowable credit balance of ₹${maxAllowableCredit.toLocaleString()} on Invoice ${invoiceNumber}.`
      );
      return;
    }

    addCreditNote({
      creditNoteDate: new Date().toISOString().split('T')[0],
      customerId: cust.id,
      customerName: cust.companyName,
      originalInvoiceNumber: invoiceNumber || 'MANUAL-ADJUSTMENT',
      reason,
      taxableAmount: numTaxable,
      taxAmount: numTax,
      totalAmount: total,
      status: 'Approved',
      createdBy: 'Accounts Team',
    });

    setIsModalOpen(false);
    setTaxableAmount('');
    setTaxAmount('');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCreditNote) return;
    const numTaxable = Number(editingCreditNote.taxableAmount) || 0;
    const numTax = Number(editingCreditNote.taxAmount) || 0;
    const total = numTaxable + numTax;

    updateCreditNote(editingCreditNote.id, {
      ...editingCreditNote,
      taxableAmount: numTaxable,
      taxAmount: numTax,
      totalAmount: total,
    });
    setEditingCreditNote(null);
  };

  const handleDelete = (id: string, cnNumber: string) => {
    if (confirm(`Are you sure you want to delete Credit Note "${cnNumber}"?`)) {
      deleteCreditNote(id);
    }
  };

  const filtered = creditNotes.filter(
    (c) =>
      !searchTerm?.trim() ||
      c.creditNoteNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.originalInvoiceNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.reason?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#211B17]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 border border-amber-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Credit Notes (Customer Adjustments / Returns)</h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              GST Adjustment Vouchers with strict Invoice validation & DB persistence.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (customers.length > 0) {
              handleCustomerChange(customers[0].id);
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-700/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Credit Note</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search CN no, customer, invoice, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723] focus:outline-none focus:border-crm-brand-600"
          />
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Showing <span className="font-bold text-[#211B17]">{filtered.length}</span> of {creditNotes.length} Credit Notes
        </div>
      </div>

      {/* Credit Notes Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] uppercase font-mono text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">CN Number</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Original Sales Invoice</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4 text-right">Taxable Amount</th>
                <th className="py-3.5 px-4 text-right">GST Adjustment</th>
                <th className="py-3.5 px-4 text-right">Total Credit</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] font-mono">
              {filtered.map((cn) => (
                <tr key={cn.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="py-3 px-4 font-bold text-amber-600">{cn.creditNoteNumber}</td>
                  <td className="py-3 px-4 text-[#70665F] font-sans">{cn.creditNoteDate || cn.date || '2026-09-28'}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{cn.customerName}</td>
                  <td className="py-3 px-4 text-[#544B45]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                      {cn.originalInvoiceNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-[#70665F]">{cn.reason}</td>
                  <td className="py-3 px-4 text-right text-[#544B45]">
                    ₹{Number(cn.taxableAmount || 0)?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-yellow-600">
                    ₹{Number(cn.taxAmount || cn.gstAmount || 0)?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#211B17]">
                    ₹{Number(cn.totalAmount || 0)?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
                      {cn.status || 'Approved'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setEditingCreditNote(cn)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit Credit Note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cn.id, cn.creditNoteNumber)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Credit Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ISSUE CREDIT NOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Issue New Credit Note Voucher
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Customer *</label>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.customerCode || c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Original Sales Invoice *</label>
                {customerInvoices.length > 0 ? (
                  <select
                    value={invoiceNumber}
                    onChange={(e) => handleInvoiceChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono font-semibold"
                  >
                    {customerInvoices.map((inv) => (
                      <option key={inv.id} value={inv.invoiceNumber}>
                        {inv.invoiceNumber} — Total: ₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')} (Dated: {inv.invoiceDate})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter Invoice No. (e.g. SINV-2026-0001)"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                )}
              </div>

              {/* Invoice Validation Card */}
              {selectedInvoice && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#70665F]">Invoice Grand Total:</span>
                    <span className="font-mono text-[#211B17]">₹{invoiceGrandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {existingCreditedTotal > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Already Credited:</span>
                      <span className="font-mono">₹{existingCreditedTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-amber-500/20 pt-1">
                    <span className="text-emerald-700">Max Allowable Credit Balance:</span>
                    <span className="font-mono text-emerald-800">₹{maxAllowableCredit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Reason for Credit Adjustment</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                >
                  <option value="Price Difference / Return">Price Difference / Return</option>
                  <option value="Material Rejection / Return">Material Rejection / Return</option>
                  <option value="Commercial Discount & Rebate">Commercial Discount & Rebate</option>
                  <option value="Shortage / Transit Damage">Shortage / Transit Damage</option>
                  <option value="Billing Correction">Billing Correction</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Taxable Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={taxableAmount}
                    onChange={(e) => handleTaxableChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">GST Tax 18% (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Total Summary & Validation Alert */}
              <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#70665F] block">Total Credit Voucher Value</span>
                  <span className="text-sm font-mono font-black text-[#211B17]">
                    ₹{currentTotalCredit.toLocaleString('en-IN')}
                  </span>
                </div>
                {isAmountExceeded && (
                  <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Exceeds Invoice Limit!</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-slate-200 text-[#544B45] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAmountExceeded || currentTotalCredit <= 0}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition shadow-md"
                >
                  Issue Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CREDIT NOTE MODAL */}
      {editingCreditNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" />
                Edit Credit Note: {editingCreditNote.creditNoteNumber}
              </h3>
              <button onClick={() => setEditingCreditNote(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Customer Name</label>
                <input
                  type="text"
                  readOnly
                  value={editingCreditNote.customerName}
                  className="w-full bg-slate-100 border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Original Invoice Number</label>
                <input
                  type="text"
                  value={editingCreditNote.originalInvoiceNumber}
                  onChange={(e) => setEditingCreditNote({ ...editingCreditNote, originalInvoiceNumber: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Reason</label>
                <input
                  type="text"
                  value={editingCreditNote.reason}
                  onChange={(e) => setEditingCreditNote({ ...editingCreditNote, reason: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Taxable Amount (₹)</label>
                  <input
                    type="number"
                    value={editingCreditNote.taxableAmount}
                    onChange={(e) =>
                      setEditingCreditNote({
                        ...editingCreditNote,
                        taxableAmount: Number(e.target.value),
                        taxAmount: Math.round(Number(e.target.value) * 0.18),
                      })
                    }
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">GST Tax (₹)</label>
                  <input
                    type="number"
                    value={editingCreditNote.taxAmount || editingCreditNote.gstAmount || 0}
                    onChange={(e) =>
                      setEditingCreditNote({
                        ...editingCreditNote,
                        taxAmount: Number(e.target.value),
                        gstAmount: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingCreditNote(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Update Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
