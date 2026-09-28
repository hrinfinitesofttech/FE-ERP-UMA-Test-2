'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  MinusCircle,
} from 'lucide-react';

export default function JournalEntriesPage() {
  const { journalEntries, addJournalEntry, deleteJournalEntry, chartOfAccounts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [narration, setNarration] = useState('');
  const [lines, setLines] = useState<{ accountId: string; debitAmount: number | string; creditAmount: number | string }[]>([
    { accountId: chartOfAccounts[0]?.id || 'ACC-1010', debitAmount: '', creditAmount: '' },
    { accountId: chartOfAccounts[1]?.id || 'ACC-2010', debitAmount: '', creditAmount: '' },
  ]);

  const totalDebit = lines.reduce((acc, l) => acc + (Number(l.debitAmount) || 0), 0);
  const totalCredit = lines.reduce((acc, l) => acc + (Number(l.creditAmount) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const filtered = journalEntries.filter(
    (j) =>
      !searchTerm?.trim() ||
      j.journalNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      j.narration?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (j.voucherType || j.vouchertype || '')?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleOpenModal = () => {
    setNarration('');
    const defaultAcc1 = chartOfAccounts[0]?.id || 'ACC-1010';
    const defaultAcc2 = chartOfAccounts[1]?.id || chartOfAccounts[0]?.id || 'ACC-2010';
    setLines([
      { accountId: defaultAcc1, debitAmount: '', creditAmount: '' },
      { accountId: defaultAcc2, debitAmount: '', creditAmount: '' },
    ]);
    setIsModalOpen(true);
  };

  const handleAddLine = () => {
    const defaultAcc = chartOfAccounts[0]?.id || 'ACC-1010';
    setLines((prev) => [...prev, { accountId: defaultAcc, debitAmount: '', creditAmount: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      alert('Cannot post Journal Voucher! Total Debits must equal Total Credits.');
      return;
    }

    const formattedLines = lines.map((l, idx) => {
      const acc =
        chartOfAccounts.find((a) => a.id === l.accountId) ||
        chartOfAccounts[0] || {
          id: l.accountId || `ACC-${idx + 1}`,
          accountCode: `ACC-${idx + 1}`,
          accountName: 'General Ledger Account',
        };
      return {
        id: `JLINE-${idx + 1}`,
        accountId: acc.id,
        accountCode: acc.accountCode || acc.id,
        accountName: acc.accountName || 'Ledger Account',
        debitAmount: Number(l.debitAmount) || 0,
        creditAmount: Number(l.creditAmount) || 0,
      };
    });

    addJournalEntry({
      journalDate: new Date().toISOString().split('T')[0],
      voucherType: 'Journal',
      vouchertype: 'Journal',
      narration: narration || 'General Journal Adjustment Entry',
      lines: formattedLines,
      totalDebit,
      totalCredit,
      isBalanced: true,
      status: 'Posted',
      createdBy: 'Accounts Team',
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, jvNumber: string) => {
    if (confirm(`Are you sure you want to delete Journal Voucher "${jvNumber}"?`)) {
      deleteJournalEntry(id);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 border border-amber-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">General Journal Voucher (JV) Register</h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Double Entry General Ledger • Strict Debit == Credit Validation with DB Persistence
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-700/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Voucher</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search JV no, narration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723] focus:outline-none focus:border-crm-brand-600"
          />
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Showing <span className="font-bold text-[#211B17]">{filtered.length}</span> of {journalEntries.length} Journal Entries
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE3DB] p-12 text-center text-[#70665F] text-xs">
            No Journal Vouchers found. Click <strong>+ New Journal Voucher</strong> to post a new double-entry record.
          </div>
        ) : (
          filtered.map((jv) => (
            <div key={jv.id} className="bg-white p-5 rounded-2xl border border-[#EBE3DB] space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-amber-600">{jv.journalNumber}</span>
                  <span className="text-xs text-[#70665F] font-sans">{jv.journalDate || '2026-04-01'}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[#544B45] text-[10px] font-semibold border border-slate-200">
                    {jv.voucherType || jv.vouchertype || 'Journal'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Balanced Total: ₹{Number(jv.totalDebit || 0)?.toLocaleString('en-IN')}
                  </div>
                  <button
                    onClick={() => handleDelete(jv.id, jv.journalNumber)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Journal Voucher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#544B45] font-sans italic">"{jv.narration}"</p>

              <div className="bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] overflow-hidden">
                <table className="w-full text-left text-xs text-[#544B45]">
                  <thead className="bg-[#FAF7F2] text-[#70665F] uppercase font-mono text-[9px] tracking-wider border-b border-[#EBE3DB]">
                    <tr>
                      <th className="py-2.5 px-4">Account Code & Name</th>
                      <th className="py-2.5 px-4 text-right">Debit (Dr) ₹</th>
                      <th className="py-2.5 px-4 text-right">Credit (Cr) ₹</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3DB] font-mono">
                    {jv.lines?.map((l) => (
                      <tr key={l.id} className="hover:bg-white/60">
                        <td className="py-2 px-4 text-[#3E2723] font-sans font-medium">
                          <span className="font-mono text-indigo-600 font-bold mr-1.5">[{l.accountCode}]</span>{' '}
                          {l.accountName}
                        </td>
                        <td className="py-2 px-4 text-right text-emerald-700 font-bold">
                          {Number(l.debitAmount) > 0 ? `₹${Number(l.debitAmount)?.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="py-2 px-4 text-right text-amber-700 font-bold">
                          {Number(l.creditAmount) > 0 ? `₹${Number(l.creditAmount)?.toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE JOURNAL VOUCHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Create New Journal Voucher (JV)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Narration / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Provision for factory electricity bill / monthly machine maintenance"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EBE3DB]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#211B17]">JV Double-Entry Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-emerald-700 font-bold hover:underline text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Account Line
                  </button>
                </div>

                {lines.map((l, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] items-center">
                    <div className="col-span-6">
                      <label className="block text-[#70665F] text-[9px] mb-0.5">Ledger Account</label>
                      <select
                        value={l.accountId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLines((prev) => prev.map((line, i) => (i === idx ? { ...line, accountId: val } : line)));
                        }}
                        className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#3E2723] text-xs"
                      >
                        {chartOfAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            [{a.accountCode}] {a.accountName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[#70665F] text-[9px] mb-0.5">Debit (Dr) ₹</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={l.debitAmount}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          const numVal = Number(val) || 0;
                          setLines((prev) =>
                            prev.map((line, i) =>
                              i === idx
                                ? { ...line, debitAmount: val, creditAmount: numVal > 0 ? '' : line.creditAmount }
                                : line
                            )
                          );
                        }}
                        className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#3E2723] text-xs font-mono font-bold text-right"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[#70665F] text-[9px] mb-0.5">Credit (Cr) ₹</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={l.creditAmount}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          const numVal = Number(val) || 0;
                          setLines((prev) =>
                            prev.map((line, i) =>
                              i === idx
                                ? { ...line, creditAmount: val, debitAmount: numVal > 0 ? '' : line.debitAmount }
                                : line
                            )
                          );
                        }}
                        className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#3E2723] text-xs font-mono font-bold text-right"
                      />
                    </div>

                    <div className="col-span-1 text-center pt-3">
                      {lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-rose-500 hover:text-rose-700"
                          title="Remove Line"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Balance Status */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
                  isBalanced
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span className="font-sans font-bold">
                    {isBalanced ? 'Journal Voucher Balanced (Dr == Cr)' : 'Unbalanced (Dr != Cr)'}
                  </span>
                </div>
                <div className="font-bold">
                  Dr: ₹{totalDebit?.toLocaleString('en-IN')} | Cr: ₹{totalCredit?.toLocaleString('en-IN')}
                </div>
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
                  disabled={!isBalanced}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                >
                  Post Journal Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
