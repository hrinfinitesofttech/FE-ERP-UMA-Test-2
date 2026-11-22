'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ChartOfAccount } from '../../../types/accounting';
import {
  GitBranch,
  Search,
  Plus,
  Filter,
  Folder,
  ChevronRight,
  ChevronDown,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
} from 'lucide-react';

export default function ChartOfAccountsPage() {
  const { chartOfAccounts, addChartOfAccount } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<ChartOfAccount['accountType']>('Asset');
  const [parentGroupId, setParentGroupId] = useState('AGRP-001');
  const [openingBalance, setOpeningBalance] = useState<string>('');

  const filteredAccounts = chartOfAccounts.filter((acc) => {
    const matchesSearch =

      !searchTerm?.trim() || (

      acc.accountCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      acc.accountName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (acc.parentGroupName || '')?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    const matchesType = selectedType === 'All' || acc.accountType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountCode || !accountName) return;

    addChartOfAccount({
      accountCode,
      accountName,
      accountType,
      parentGroupId,
      parentGroupName: parentGroupId === 'AGRP-001' ? 'Current Assets' : 'Direct Expenses',
      openingBalance: openingBalance === '' ? 0 : Number(openingBalance),
      normalBalance: accountType === 'Asset' || accountType === 'Expense' ? 'Debit' : 'Credit',
      isActive: true,
    });

    setIsAddModalOpen(false);
    setAccountCode('');
    setAccountName('');
    setOpeningBalance('');
  };

  const accountTypes: ChartOfAccount['accountType'][] = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-primary)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/20 rounded-xl text-teal-400">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Hierarchical Chart of Accounts (COA)</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">
              Standard Indian Accounting Structure • Assets, Liabilities, Income, Expenses & Equity Ledgers
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ledger Account</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
          <input
            type="text"
            placeholder="Search account code, name or group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl pl-9 pr-4 py-2 text-xs text-[color:var(--crm-text-primary)] placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['All', 'Asset', 'Liability', 'Equity', 'Income', 'Expense'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === type
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] border border-[color:var(--crm-border-default)] hover:text-[color:var(--crm-text-primary)]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-xs text-[color:var(--crm-text-secondary)]">
          <thead className="bg-[#F4F6FA]/80 text-[color:var(--crm-text-secondary)] uppercase font-semibold text-[10px] tracking-wider border-b border-[color:var(--crm-border-default)]">
            <tr>
              <th className="py-3.5 px-4">Account Code</th>
              <th className="py-3.5 px-4">Account Name</th>
              <th className="py-3.5 px-4">Account Type</th>
              <th className="py-3.5 px-4">Parent Group</th>
              <th className="py-3.5 px-4 text-right">Opening Balance</th>
              <th className="py-3.5 px-4 text-right">Current Balance</th>
              <th className="py-3.5 px-4">Normal Balance</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--crm-border-default)] font-mono">
            {filteredAccounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-white/40 transition">
                <td className="py-3 px-4 font-bold text-[color:var(--crm-text-primary)]">{acc.accountCode}</td>
                <td className="py-3 px-4 font-sans font-semibold text-[color:var(--crm-text-primary)]">{acc.accountName}</td>
                <td className="py-3 px-4 font-sans">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      acc.accountType === 'Asset'
                        ? 'bg-crm-brand-600/20 text-crm-brand-500'
                        : acc.accountType === 'Liability'
                        ? 'bg-crm-brand-600/20 text-crm-brand-500'
                        : acc.accountType === 'Income'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : acc.accountType === 'Expense'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {acc.accountType}
                  </span>
                </td>
                <td className="py-3 px-4 font-sans text-[color:var(--crm-text-secondary)]">{acc.parentGroupName}</td>
                <td className="py-3 px-4 text-right text-[color:var(--crm-text-secondary)]">₹{acc.openingBalance?.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">₹{acc.currentBalance?.toLocaleString()}</td>
                <td className="py-3 px-4 font-sans">
                  <span className={`text-[10px] ${acc.normalBalance === 'Debit' ? 'text-crm-brand-500' : 'text-amber-400'}`}>
                    {acc.normalBalance} (Dr/Cr)
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-sans">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
              <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">Create New Ledger Account</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] hover:bg-[color:var(--crm-bg-app)] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Account Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1005"
                    value={accountCode}
                    onChange={(e) => setAccountCode(e.target.value)}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)]"
                  >
                    {accountTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[color:var(--crm-text-secondary)] mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Machine Spares Inventory"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[color:var(--crm-text-secondary)] mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[color:var(--crm-border-default)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)]"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-[color:var(--crm-text-primary)] font-semibold hover:bg-emerald-500">
                  Save Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
