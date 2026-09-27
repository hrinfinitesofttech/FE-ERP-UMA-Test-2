'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { CheckCircle2, RefreshCw, Landmark, Search, ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';

export default function BankReconciliationPage() {
  const { bankTransactions, reconcileBankTransaction, bankAccounts } = useERP();
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = bankTransactions.filter((tx) => {
    const ref = tx.transactionRef || tx.referenceNumber || '';
    const desc = tx.description || '';
    return ref?.toLowerCase().includes(searchTerm?.toLowerCase()) || desc?.toLowerCase().includes(searchTerm?.toLowerCase());
  });

  const matchedCount = bankTransactions.filter((tx) => tx.isReconciled || tx.reconciliationStatus === 'Matched' || tx.reconciliationStatus === 'Reconciled').length;
  const pendingCount = bankTransactions.length - matchedCount;

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Bank Statement Auto-Reconciliation Portal</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Automated Matcher • Bank Feed Statement vs ERP Customer Receipts & Supplier Payments</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#3E2723]"
          >
            {bankAccounts.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bankName} (Balance: ₹{(b.currentBalance || 0)?.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] flex items-center justify-between">
          <div>
            <div className="text-[#70665F] text-xs font-semibold uppercase">Total Bank Transactions</div>
            <div className="text-xl font-bold text-[#211B17] font-mono mt-1">{bankTransactions.length}</div>
          </div>
          <Landmark className="w-6 h-6 text-crm-brand-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] flex items-center justify-between">
          <div>
            <div className="text-[#70665F] text-xs font-semibold uppercase">Reconciled</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{matchedCount} Matched</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] flex items-center justify-between">
          <div>
            <div className="text-[#70665F] text-xs font-semibold uppercase">Pending Match</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">{pendingCount} Unmatched</div>
          </div>
          <Scale className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search ref no, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
        <table className="w-full text-left text-xs text-[#544B45]">
          <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
            <tr>
              <th className="py-3.5 px-4">Statement Date</th>
              <th className="py-3.5 px-4">Bank Ref / UTR</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-right">Deposit (Dr)</th>
              <th className="py-3.5 px-4 text-right">Withdrawal (Cr)</th>
              <th className="py-3.5 px-4">ERP Matched Document</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {filtered.map((tx) => {
              const amt = tx.amount ?? (tx.depositAmount ? tx.depositAmount : tx.withdrawalAmount ? -tx.withdrawalAmount : 0);
              const refNo = tx.transactionRef || tx.referenceNumber || '';
              const isMatched = tx.isReconciled || tx.reconciliationStatus === 'Matched' || tx.reconciliationStatus === 'Reconciled';

              return (
                <tr key={tx.id} className="hover:bg-white/40 transition">
                  <td className="py-3 px-4 text-[#70665F] font-sans">{tx.transactionDate}</td>
                  <td className="py-3 px-4 font-bold text-[#211B17]">{refNo}</td>
                  <td className="py-3 px-4 font-sans text-[#544B45]">{tx.description}</td>
                  <td className="py-3 px-4 text-right text-emerald-400">{amt > 0 ? `₹${amt?.toLocaleString()}` : '-'}</td>
                  <td className="py-3 px-4 text-right text-rose-400">{amt < 0 ? `₹${Math.abs(amt)?.toLocaleString()}` : '-'}</td>
                  <td className="py-3 px-4 font-sans text-crm-brand-500">{tx.matchedErpDocNumber || 'Not Matched'}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isMatched ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {tx.reconciliationStatus || (isMatched ? 'Reconciled' : 'Unmatched')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    {!isMatched ? (
                      <button
                        onClick={() => reconcileBankTransaction(tx.id, amt > 0 ? 'RCT-2026-0001' : 'PAY-2026-0001')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-[10px] font-semibold rounded-lg transition"
                      >
                        Match Voucher
                      </button>
                    ) : (
                      <span className="text-[#70665F] text-[10px]">Reconciled</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
