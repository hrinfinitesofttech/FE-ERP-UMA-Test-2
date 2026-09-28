'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Banknote, Plus, Search, Landmark, CheckCircle2 } from 'lucide-react';

export default function SupplierPaymentsPage() {
  const { supplierPayments, addSupplierPayment, suppliers, purchaseInvoices, bankAccounts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(purchaseInvoices[0]?.invoiceNumber || 'PINV-2026-0001');
  const [paymentMode, setPaymentMode] = useState<any>('RTGS');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [referenceNo, setReferenceNo] = useState('');

  const filtered = supplierPayments.filter((p) => {
    const pNo = p.paymentNumber || '';
    const suppName = p.supplierName || '';
    const refNo = p.referenceNumber || '';
    return (
      pNo?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      suppName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      refNo?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supp = suppliers.find((s) => s.id === supplierId) || suppliers[0];
    const bank = bankAccounts.find((b) => b.id === bankAccountId) || bankAccounts[0];

    addSupplierPayment({
      paymentDate: new Date().toISOString().split('T')[0],
      supplierId: supp.id,
      supplierName: supp.supplierName || (supp as any).name || 'Unknown Supplier',
      purchaseInvoiceNumber: invoiceNumber,
      paymentMode,
      bankAccountId: bank.id,
      bankName: bank.bankName,
      amountPaid: Number(amountPaid) || 0,
      referenceNumber: referenceNo,
      status: 'Paid',
      remarks: 'Vendor bill payment via RTGS',
      createdBy: 'Rajesh Patel',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/20 rounded-xl text-sky-400">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Supplier Payments Voucher Register</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Real-time AP Payments • Bank Outflow & Vendor Ledger Settlement</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          <span>Pay Supplier</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search payment no, supplier, UTR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
        <table className="w-full text-left text-xs text-[#544B45]">
          <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
            <tr>
              <th className="py-3.5 px-4">Payment No</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4">Purchase Invoice Ref</th>
              <th className="py-3.5 px-4">Mode & Bank Account</th>
              <th className="py-3.5 px-4">UTR / Ref No</th>
              <th className="py-3.5 px-4 text-right">Amount Paid</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {filtered.map((p) => {
              const payDate = p.paymentDate || p.date || '-';
              const bank = p.bankName || p.bankCashAccountName || 'HDFC Bank';
              const amt = p.amountPaid ?? p.amount ?? 0;

              return (
                <tr key={p.id} className="hover:bg-white/40 transition">
                  <td className="py-3 px-4 font-bold text-sky-400">{p.paymentNumber}</td>
                  <td className="py-3 px-4 text-[#70665F] font-sans">{payDate}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{p.supplierName}</td>
                  <td className="py-3 px-4 text-[#544B45]">{p.purchaseInvoiceNumber || 'Advance'}</td>
                  <td className="py-3 px-4 font-sans text-[#544B45]">
                    {p.paymentMode} ({bank})
                  </td>
                  <td className="py-3 px-4 text-[#70665F]">{p.referenceNumber || 'N/A'}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-400">₹{amt?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">{p.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-[#211B17] border-b border-[#EBE3DB] pb-3">Make Supplier Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Purchase Invoice Ref</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                  >
                    <option value="RTGS">RTGS / NEFT</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1">Source Bank</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">UTR / Bank Ref No</label>
                  <input
                    type="text"
                    required
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-white text-[#544B45]">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-[#211B17] font-semibold">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
