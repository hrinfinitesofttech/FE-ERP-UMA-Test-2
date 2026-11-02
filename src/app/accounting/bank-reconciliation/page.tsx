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
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-primary)]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Bank Statement Auto-Reconciliation Portal</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Automated Matcher • Bank Feed Statement vs ERP Customer Receipts & Supplier Payments</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className="bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-xs text-[color:var(--crm-text-primary)]"
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
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] flex items-center justify-between">
          <div>
            <div className="text-[color:var(--crm-text-secondary)] text-xs font-semibold uppercase">Total Bank Transactions</div>
            <div className="text-xl font-bold text-[color:var(--crm-text-primary)] font-mono mt-1">{bankTransactions.length}</div>
          </div>
          <Landmark className="w-6 h-6 text-crm-brand-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] flex items-center justify-between">
          <div>
            <div className="text-[color:var(--crm-text-secondary)] text-xs font-semibold uppercase">Reconciled</div>
            <div className="text-xl font-bold text-emerald-700 font-mono mt-1">{matchedCount} Matched</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-700" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] flex items-center justify-between">
          <div>
            <div className="text-[color:var(--crm-text-secondary)] text-xs font-semibold uppercase">Pending Match</div>
            <div className="text-xl font-bold text-amber-700 font-mono mt-1">{pendingCount} Unmatched</div>
          </div>
          <Scale className="w-6 h-6 text-crm-brand-600" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
          <input
            type="text"
            placeholder="Search ref no, description..."
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
            <tbody className="divide-y divide-[color:var(--crm-border-default)] font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[color:var(--crm-text-secondary)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Landmark className="w-8 h-8 text-[color:var(--crm-text-tertiary)] opacity-50" />
                      <p className="font-semibold text-[color:var(--crm-text-secondary)]">No bank transactions found</p>
                      <p className="text-[11px] text-[color:var(--crm-text-tertiary)]">No ledger transactions match your query or bank statement is fully cleared.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const amt = tx.amount ?? (tx.depositAmount ? tx.depositAmount : tx.withdrawalAmount ? -tx.withdrawalAmount : 0);
                  const refNo = tx.transactionRef || tx.referenceNumber || '';
                  const isMatched = tx.isReconciled || tx.reconciliationStatus === 'Matched' || tx.reconciliationStatus === 'Reconciled';

                  return (
                    <tr key={tx.id} className="hover:bg-white/40 transition">
                      <td className="py-3 px-4 text-[color:var(--crm-text-secondary)] font-sans">{tx.transactionDate}</td>
                      <td className="py-3 px-4 font-bold text-[color:var(--crm-text-primary)]">{refNo}</td>
                      <td className="py-3 px-4 font-sans text-[color:var(--crm-text-secondary)]">{tx.description}</td>
                      <td className="py-3 px-4 text-right text-emerald-700">{amt > 0 ? `₹${amt?.toLocaleString()}` : '-'}</td>
                      <td className="py-3 px-4 text-right text-rose-700">{amt < 0 ? `₹${Math.abs(amt)?.toLocaleString()}` : '-'}</td>
                      <td className="py-3 px-4 font-sans text-crm-brand-500">{tx.matchedErpDocNumber || 'Not Matched'}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isMatched ? 'bg-emerald-500/20 text-emerald-700' : 'bg-amber-500/20 text-amber-700'}`}>
                          {tx.reconciliationStatus || (isMatched ? 'Reconciled' : 'Unmatched')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        {!isMatched ? (
                            <button
                              onClick={() => reconcileBankTransaction(tx.id, amt > 0 ? 'RCT-2026-0001' : 'PAY-2026-0001')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold rounded-lg transition shadow-xs cursor-pointer min-h-[36px]"
                            >
                              Match Voucher
                            </button>
                        ) : (
                          <span className="text-[color:var(--crm-text-secondary)] text-[10px]">Reconciled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
