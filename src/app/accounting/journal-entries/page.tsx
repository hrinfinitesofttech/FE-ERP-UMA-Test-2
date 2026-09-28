'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { FileSpreadsheet, Plus, Search, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function JournalEntriesPage() {
  const { journalEntries, addJournalEntry, chartOfAccounts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [narration, setNarration] = useState('');
  const [lines, setLines] = useState<{ accountId: string; debitAmount: number | string; creditAmount: number | string }[]>([
    { accountId: chartOfAccounts[0]?.id || 'ACC-001', debitAmount: '', creditAmount: '' },
    { accountId: chartOfAccounts[1]?.id || 'ACC-002', debitAmount: '', creditAmount: '' },
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

  const handleAddLine = () => {
    setLines((prev) => [...prev, { accountId: chartOfAccounts[0]?.id || 'ACC-001', debitAmount: '', creditAmount: '' }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    const formattedLines = lines.map((l, idx) => {
      const acc = chartOfAccounts.find((a) => a.id === l.accountId) || chartOfAccounts[0];
      return {
        id: `JLINE-${idx + 1}`,
        accountId: acc.id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        debitAmount: Number(l.debitAmount) || 0,
        creditAmount: Number(l.creditAmount) || 0,
      };
    });

    addJournalEntry({
      journalDate: new Date().toISOString().split('T')[0],
      vouchertype: 'Journal',
      narration,
      lines: formattedLines,
      totalDebit,
      totalCredit,
      isBalanced: true,
      status: 'Posted',
      createdBy: 'Rajesh Patel',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">General Journal Voucher (JV) Register</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Double Entry General Ledger • Strict Debit == Credit Validation</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Voucher</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search JV no, narration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((jv) => (
          <div key={jv.id} className="bg-white p-5 rounded-2xl border border-[#EBE3DB] space-y-3">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-amber-400">{jv.journalNumber}</span>
                <span className="text-xs text-[#70665F] font-sans">{jv.journalDate}</span>
                <span className="px-2 py-0.5 rounded bg-white text-[#544B45] text-[10px] font-semibold">{jv.vouchertype}</span>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                Balanced (Total: ₹{jv.totalDebit?.toLocaleString()})
              </div>
            </div>

            <p className="text-xs text-[#544B45] font-sans italic">"{jv.narration}"</p>

            <div className="bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] overflow-hidden">
              <table className="w-full text-left text-xs text-[#544B45]">
                <thead className="bg-white/60 text-[#70665F] uppercase font-semibold text-[9px] tracking-wider border-b border-[#EBE3DB]">
                  <tr>
                    <th className="py-2.5 px-4">Account Code & Name</th>
                    <th className="py-2.5 px-4 text-right">Debit (Dr) ₹</th>
                    <th className="py-2.5 px-4 text-right">Credit (Cr) ₹</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB] font-mono">
                  {jv.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2 px-4 text-[#3E2723] font-sans font-medium">
                        [{l.accountCode}] {l.accountName}
                      </td>
                      <td className="py-2 px-4 text-right text-crm-brand-500">{l.debitAmount > 0 ? `₹${l.debitAmount?.toLocaleString()}` : '-'}</td>
                      <td className="py-2 px-4 text-right text-amber-400">{l.creditAmount > 0 ? `₹${l.creditAmount?.toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#211B17] border-b border-[#EBE3DB] pb-3">Create Journal Voucher (JV)</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Narration / Description</label>
                <input
                  type="text"
                  required
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EBE3DB]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#211B17]">JV Line Items</span>
                  <button type="button" onClick={handleAddLine} className="text-emerald-400 hover:underline text-[11px]">
                    + Add Account Line
                  </button>
                </div>

                {lines.map((l, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                    <div className="col-span-2">
                      <label className="block text-[#70665F] text-[9px]">Ledger Account</label>
                      <select
                        value={l.accountId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLines((prev) => prev.map((line, i) => (i === idx ? { ...line, accountId: val } : line)));
                        }}
                        className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-[#3E2723] text-xs"
                      >
                        {chartOfAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            [{a.accountCode}] {a.accountName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#70665F] text-[9px]">Debit (Dr) ₹</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={l.debitAmount}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          const numVal = Number(val) || 0;
                          setLines((prev) => prev.map((line, i) => (i === idx ? { ...line, debitAmount: val, creditAmount: numVal > 0 ? '' : line.creditAmount } : line)));
                        }}
                        className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-[#3E2723] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[#70665F] text-[9px]">Credit (Cr) ₹</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={l.creditAmount}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          const numVal = Number(val) || 0;
                          setLines((prev) => prev.map((line, i) => (i === idx ? { ...line, creditAmount: val, debitAmount: numVal > 0 ? '' : line.debitAmount } : line)));
                        }}
                        className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-[#3E2723] text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Balance Status */}
              <div className={`p-3 rounded-xl border flex items-center justify-between font-mono ${isBalanced ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span className="font-sans font-semibold text-xs">{isBalanced ? 'Journal Voucher Balanced' : 'Unbalanced Journal Voucher'}</span>
                </div>
                <div>
                  Dr: ₹{totalDebit?.toLocaleString()} | Cr: ₹{totalCredit?.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-white text-[#544B45]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className={`px-4 py-2 rounded-xl font-semibold ${isBalanced ? 'bg-emerald-600 text-[#211B17] hover:bg-emerald-500' : 'bg-white text-[#70665F] cursor-not-allowed'}`}
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
