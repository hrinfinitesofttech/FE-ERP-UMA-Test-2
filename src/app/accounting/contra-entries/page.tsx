'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { RotateCcw, Plus, Search, Landmark, Coins, ArrowRightLeft, Trash2, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const DEFAULT_ACCOUNTS = [
  { id: 'BANK-01', bankName: 'HDFC Bank Ltd. (Current Operations A/c)', accountType: 'Current', accountNumber: '50200088921045' },
  { id: 'BANK-02', bankName: 'State Bank of India (Working Capital CC A/c)', accountType: 'Cash_Credit', accountNumber: '334455667788' },
  { id: 'BANK-03', bankName: 'ICICI Bank Ltd. (Project Escrow A/c)', accountType: 'Current', accountNumber: '002405001234' },
  { id: 'BANK-04', bankName: 'Main Factory Cash Vault (Petty Cash)', accountType: 'Cash', accountNumber: 'CASH-VAULT-01' },
];

export default function ContraEntriesPage() {
  const { contraEntries, addContraEntry, deleteContraEntry, bankAccounts, chartOfAccounts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute available accounts from live bankAccounts, chartOfAccounts, or defaults
  const availableAccounts = useMemo(() => {
    if (bankAccounts && bankAccounts.length > 0) {
      return bankAccounts;
    }
    if (chartOfAccounts && chartOfAccounts.length > 0) {
      const coaFiltered = chartOfAccounts
        .filter((c) => c.category === 'Assets' || c.accountType === 'Bank' || c.accountType === 'Cash' || ['1010', '1020', '1030', '1000'].includes(c.accountCode))
        .map((c) => ({
          id: c.id,
          bankName: `${c.accountName} (${c.accountCode})`,
          accountType: c.accountType,
          accountNumber: c.accountCode,
        }));
      if (coaFiltered.length > 0) return coaFiltered;
    }
    return DEFAULT_ACCOUNTS;
  }, [bankAccounts, chartOfAccounts]);

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [contraType, setContraType] = useState<'Bank_to_Bank' | 'Bank_to_Cash' | 'Cash_to_Bank'>('Bank_to_Bank');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [narration, setNarration] = useState('Inter-bank liquidity transfer');

  // Set default account selections when modal opens or availableAccounts changes
  const handleOpenModal = () => {
    const defaultFrom = availableAccounts[0]?.id || 'BANK-01';
    const defaultTo = availableAccounts[1]?.id || availableAccounts[0]?.id || 'BANK-02';
    setFromAccountId(defaultFrom);
    setToAccountId(defaultTo);
    setAmount('');
    setContraType('Bank_to_Bank');
    setReferenceNumber(`TRF-${Math.floor(100000 + Math.random() * 900000)}`);
    setNarration('Inter-bank liquidity transfer');
    setIsModalOpen(true);
  };

  // Adjust selections when contraType changes
  const handleTypeChange = (type: 'Bank_to_Bank' | 'Bank_to_Cash' | 'Cash_to_Bank') => {
    setContraType(type);
    const bankAcc = availableAccounts.find((a) => (a as any).accountType !== 'Cash') || availableAccounts[0];
    const cashAcc = availableAccounts.find((a) => (a as any).accountType === 'Cash') || availableAccounts[availableAccounts.length - 1] || availableAccounts[0];
    const secondBankAcc = availableAccounts.find((a) => a.id !== bankAcc?.id && (a as any).accountType !== 'Cash') || bankAcc;

    if (type === 'Bank_to_Bank') {
      setFromAccountId(bankAcc?.id || '');
      setToAccountId(secondBankAcc?.id || '');
      setNarration('Inter-bank liquidity transfer');
    } else if (type === 'Bank_to_Cash') {
      setFromAccountId(bankAcc?.id || '');
      setToAccountId(cashAcc?.id || '');
      setNarration('Cash withdrawal for factory petty cash replenishment');
    } else if (type === 'Cash_to_Bank') {
      setFromAccountId(cashAcc?.id || '');
      setToAccountId(bankAcc?.id || '');
      setNarration('Cash deposit from factory vault into bank account');
    }
  };

  const filtered = contraEntries.filter(
    (c) =>
      !searchTerm?.trim() ||
      c.contraNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.fromAccountName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.toAccountName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.referenceNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.narration?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const totalTransferVolume = contraEntries.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const bankToBankCount = contraEntries.filter((c) => c.contraType === 'Bank_to_Bank' || c.contraType === 'Bank to Bank').length;
  const cashMovementCount = contraEntries.filter((c) => c.contraType?.includes('Cash') || c.contraType?.includes('cash')).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert('Source Account and Destination Account cannot be the same.');
      return;
    }

    const fromAcc = availableAccounts.find((b) => b.id === fromAccountId) || availableAccounts[0];
    const toAcc = availableAccounts.find((b) => b.id === toAccountId) || availableAccounts[1] || availableAccounts[0];

    addContraEntry({
      contraDate: new Date().toISOString().split('T')[0],
      contraType,
      fromAccountId: fromAcc.id,
      fromAccountName: fromAcc.bankName || (fromAcc as any).accountName || 'Source Account',
      fromAccountCode: (fromAcc as any).accountNumber || (fromAcc as any).glAccountCode || '1010',
      toAccountId: toAcc.id,
      toAccountName: toAcc.bankName || (toAcc as any).accountName || 'Destination Account',
      toAccountCode: (toAcc as any).accountNumber || (toAcc as any).glAccountCode || '1020',
      amount: Number(amount),
      referenceNumber: referenceNumber || `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
      narration: narration || 'Contra Bank/Cash Transfer',
      status: 'Posted',
      createdBy: 'Rajesh Patel (Accounts)',
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, no: string) => {
    if (confirm(`Are you sure you want to delete Contra Voucher ${no}?`)) {
      deleteContraEntry(id);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-crm-brand-50 rounded-2xl text-crm-brand-700 border border-crm-brand-100">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight">Contra Vouchers (Bank & Cash Transfers)</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Double-entry Contra Transfers: Bank-to-Bank, Cash Deposits & Cash Withdrawals</p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Contra Voucher</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3DB] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#70665F]">Total Contra Volume</div>
            <div className="text-xl font-extrabold text-[#211B17] mt-1">₹{totalTransferVolume.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{contraEntries.length} Recorded Vouchers</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3DB] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#70665F]">Bank-to-Bank Transfers</div>
            <div className="text-xl font-extrabold text-[#211B17] mt-1">{bankToBankCount} Entries</div>
            <div className="text-[10px] text-crm-brand-600 font-semibold mt-0.5">Inter-bank liquidity balancing</div>
          </div>
          <div className="p-3 bg-crm-brand-50 text-crm-brand-700 rounded-xl border border-crm-brand-100">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3DB] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#70665F]">Cash Withdrawals & Deposits</div>
            <div className="text-xl font-extrabold text-[#211B17] mt-1">{cashMovementCount} Entries</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Petty cash vault replenishment</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search contra no, source/destination bank, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#211B17] font-medium"
          />
        </div>
        <div className="text-xs text-[#70665F] font-semibold">
          Showing <span className="font-bold text-[#211B17]">{filtered.length}</span> of {contraEntries.length} vouchers
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] uppercase font-bold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Contra No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Transfer Type</th>
                <th className="py-3.5 px-4">Source Account (Outflow)</th>
                <th className="py-3.5 px-4">Destination Account (Inflow)</th>
                <th className="py-3.5 px-4">Ref / Cheque No</th>
                <th className="py-3.5 px-4 text-right">Transfer Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#70665F]">
                    No contra vouchers found. Click <span className="font-bold text-crm-brand-700">"Create Contra Voucher"</span> to record your first bank/cash transfer.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF7F2]/50 transition">
                    <td className="py-3 px-4 font-bold font-mono text-crm-brand-700">{c.contraNumber}</td>
                    <td className="py-3 px-4 text-[#70665F]">{c.contraDate || c.date || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] border border-[#EBE3DB] text-[#211B17]">
                        {c.contraType?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#211B17]">{c.fromAccountName}</td>
                    <td className="py-3 px-4 font-semibold text-[#211B17]">{c.toAccountName}</td>
                    <td className="py-3 px-4 font-mono text-[#70665F]">{c.referenceNumber || '—'}</td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600">₹{Number(c.amount)?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status || 'Posted'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(c.id, c.contraNumber)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CONTRA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-crm-brand-700" />
                Create Contra Voucher
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#70665F] hover:text-[#211B17] font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Transfer Type *</label>
                <select
                  value={contraType}
                  onChange={(e) => handleTypeChange(e.target.value as any)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-medium"
                >
                  <option value="Bank_to_Bank">Bank to Bank Transfer (Inter-Bank Fund Transfer)</option>
                  <option value="Bank_to_Cash">Bank Cash Withdrawal (Bank → Cash Vault)</option>
                  <option value="Cash_to_Bank">Cash Bank Deposit (Cash Vault → Bank)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">From Account (Source Outflow) *</label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-medium"
                  >
                    {availableAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName || (b as any).accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">To Account (Destination Inflow) *</label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-medium"
                  >
                    {availableAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName || (b as any).accountName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Transfer Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Ref / Cheque / UTR No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRF-994102 or CHQ-449102"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Narration / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Inter-bank liquidity transfer for supplier payments"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17]"
                />
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
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold"
                >
                  Post Contra Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

