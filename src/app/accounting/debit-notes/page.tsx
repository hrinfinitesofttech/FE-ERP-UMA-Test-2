'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { CreditCard, Plus, Search, FileText } from 'lucide-react';

export default function DebitNotesPage() {
  const { currentUser, debitNotes, addDebitNote, suppliers, purchaseInvoices } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(purchaseInvoices[0]?.invoiceNumber || 'PINV-2026-0001');
  const [reason, setReason] = useState('Material Rejection / Return');
  const [taxableAmount, setTaxableAmount] = useState<number | string>('');
  const [taxAmount, setTaxAmount] = useState<number | string>('');

  const filtered = debitNotes.filter(
    (d) =>

      !searchTerm?.trim() ||

      d.debitNoteNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      d.supplierName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      d.originalInvoiceNumber?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supp = suppliers.find((s) => s.id === supplierId) || suppliers[0];
    const numTaxable = Number(taxableAmount) || 0;
    const numTax = Number(taxAmount) || 0;

    addDebitNote({
      debitNoteDate: new Date().toISOString().split('T')[0],
      supplierId: supp.id,
      supplierName: supp.supplierName || (supp as any).name || 'Unknown Supplier',
      originalInvoiceNumber: invoiceNumber,
      reason,
      taxableAmount: numTaxable,
      taxAmount: numTax,
      totalAmount: numTaxable + numTax,
      status: 'Approved',
      createdBy: currentUser?.name || currentUser?.username || '',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-primary)]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Debit Notes (Supplier Rejections / Returns)</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">GST Input Adjustment Vouchers for Purchase Returns & QC Defect Debits</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Debit Note</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
          <input
            type="text"
            placeholder="Search DN no, supplier, invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl pl-9 pr-4 py-2 text-xs text-[color:var(--crm-text-primary)]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[#F4F6FA]/80 text-[color:var(--crm-text-secondary)] uppercase font-semibold text-[10px] tracking-wider border-b border-[color:var(--crm-border-default)]">
              <tr>
                <th className="py-3.5 px-4">DN Number</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Original Purchase Invoice</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4 text-right">Taxable Amount</th>
                <th className="py-3.5 px-4 text-right">ITC Reversal</th>
                <th className="py-3.5 px-4 text-right">Total Debit</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)] font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[color:var(--crm-text-secondary)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-[color:var(--crm-text-tertiary)] opacity-50" />
                      <p className="font-semibold text-[color:var(--crm-text-secondary)]">No debit notes recorded</p>
                      <p className="text-[11px] text-[color:var(--crm-text-tertiary)]">No debit note transactions match your search criteria or none have been issued yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((dn) => (
                  <tr key={dn.id} className="hover:bg-white/40 transition">
                    <td className="py-3 px-4 font-bold text-rose-400">{dn.debitNoteNumber}</td>
                    <td className="py-3 px-4 text-[color:var(--crm-text-secondary)] font-sans">{dn.debitNoteDate}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-[color:var(--crm-text-primary)]">{dn.supplierName}</td>
                    <td className="py-3 px-4 text-[color:var(--crm-text-secondary)]">{dn.originalInvoiceNumber}</td>
                    <td className="py-3 px-4 font-sans text-[color:var(--crm-text-secondary)]">{dn.reason}</td>
                    <td className="py-3 px-4 text-right text-[color:var(--crm-text-secondary)]">₹{(dn.taxableAmount || 0)?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-crm-brand-500">₹{(dn.taxAmount || 0)?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-[color:var(--crm-text-primary)]">₹{dn.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">{dn.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] border-b border-[color:var(--crm-border-default)] pb-3">Issue Debit Note</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[color:var(--crm-text-secondary)] mb-1">Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)]"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[color:var(--crm-text-secondary)] mb-1">Original Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block text-[color:var(--crm-text-secondary)] mb-1">Reason</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Taxable Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={taxableAmount}
                    onChange={(e) => setTaxableAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">GST Tax (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[color:var(--crm-border-default)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-white text-[color:var(--crm-text-secondary)]">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-[color:var(--crm-text-primary)] font-semibold">
                  Issue Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
