'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Coins, Plus, Search, Landmark, CheckCircle2 } from 'lucide-react';
import { BankAccount } from '../../../types/accounting';
import { INITIAL_BANK_ACCOUNTS } from '../../../data/mockAccountingData';

export default function CustomerReceiptsPage() {
  const { customerReceipts, addCustomerReceipt, customers, salesInvoices, bankAccounts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeBankAccounts: BankAccount[] =
    bankAccounts && bankAccounts.length > 0 ? bankAccounts : INITIAL_BANK_ACCOUNTS;

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(salesInvoices[0]?.invoiceNumber || 'SINV-2026-0001');
  const [paymentMode, setPaymentMode] = useState<any>('UPI');
  const [bankAccountId, setBankAccountId] = useState(activeBankAccounts[0]?.id || 'BANK-01');
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [referenceNo, setReferenceNo] = useState('');

  const filtered = customerReceipts.filter((r) => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return true;
    const rNo = r.receiptNumber || '';
    const custName = r.customerName || '';
    const refNo = r.referenceNumber || '';
    return (
      rNo?.toLowerCase().includes(q) ||
      custName?.toLowerCase().includes(q) ||
      refNo?.toLowerCase().includes(q)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust =
      customers.find((c) => c.id === customerId) ||
      customers[0] || {
        id: 'CUST-001',
        companyName: 'Test Alpha Corp',
      };

    const bank =
      activeBankAccounts.find((b) => b.id === bankAccountId) ||
      activeBankAccounts[0] || {
        id: 'BANK-01',
        bankName: 'HDFC Bank',
        accountNumber: '50200098765432',
      };

    try {
      addCustomerReceipt({
        receiptDate: new Date().toISOString().split('T')[0],
        customerId: cust.id,
        customerName: cust.companyName || (cust as any).customerName || (cust as any).name || 'Customer',
        salesInvoiceNumber: invoiceNumber || 'Direct Payment',
        paymentMode,
        bankAccountId: bank.id,
        bankName: bank.bankName,
        amountPaid: Number(amountPaid) || 0,
        referenceNumber: referenceNo || `UTR-${Date.now().toString().slice(-8)}`,
        status: 'Received',
        remarks: 'Customer payment receipt recorded',
        createdBy: 'Admin',
      });

      setIsModalOpen(false);
      setAmountPaid('');
      setReferenceNo('');
    } catch (err) {
      console.error('Error recording receipt:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Customer Payment Receipts</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Real-time AR Receipt Entry • Auto Banking & Customer Ledger Settlement</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Customer Receipt</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search receipt no, customer, UTR..."
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
              <th className="py-3.5 px-4">Receipt No</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Invoice / SO Ref</th>
              <th className="py-3.5 px-4">Mode & Bank Account</th>
              <th className="py-3.5 px-4">UTR / Cheque Ref</th>
              <th className="py-3.5 px-4 text-right">Amount Received</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {filtered.map((r) => {
              const recDate = r.receiptDate || r.date || '-';
              const bank = r.bankName || r.bankCashAccountName || 'HDFC Bank';
              const amt = r.amountPaid ?? r.amount ?? 0;

              return (
                <tr key={r.id} className="hover:bg-white/40 transition">
                  <td className="py-3 px-4 font-bold text-emerald-400">{r.receiptNumber}</td>
                  <td className="py-3 px-4 text-[#70665F] font-sans">{recDate}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{r.customerName}</td>
                  <td className="py-3 px-4 text-[#544B45]">{r.salesInvoiceNumber || 'Advance'}</td>
                  <td className="py-3 px-4 font-sans text-[#544B45]">
                    {r.paymentMode} ({bank})
                  </td>
                  <td className="py-3 px-4 text-[#70665F]">{r.referenceNumber || 'N/A'}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">₹{amt?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">{r.status}</span>
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
            <h3 className="text-base font-bold text-[#211B17] border-b border-[#EBE3DB] pb-3">Record Customer Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Sales Invoice Ref</label>
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
                    <option value="NEFT">NEFT / RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1">Bank Account</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                  >
                    {activeBankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumber ? b.accountNumber.slice(-4) : 'Main'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Amount Received (₹)</label>
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
                  <label className="block text-[#70665F] mb-1">UTR / Ref No</label>
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
                  Record Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
