'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { History, Play, CheckCircle2, Calendar } from 'lucide-react';

export default function DepreciationSchedulePage() {
  const { fixedAssets, depreciationEntries, runDepreciation } = useERP();
  const [selectedAssetId, setSelectedAssetId] = useState(fixedAssets[0]?.id || '');
  const [period, setPeriod] = useState('FY 2025-26 Q2');
  const [depAmount, setDepAmount] = useState<number | string>('');

  const handleRunDepreciation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    runDepreciation(selectedAssetId, period, Number(depAmount) || 0);
  };

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-primary)]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-500/20 rounded-xl text-[color:var(--crm-text-secondary)]">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Depreciation Calculation Engine & History</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Automated Asset Amortization • WDV & SLM Periodical Depreciation Journal Vouchers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Depreciation Form */}
        <div className="bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)] space-y-4">
          <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2 border-b border-[color:var(--crm-border-default)] pb-3">
            <Play className="w-4 h-4 text-emerald-700" />
            Post Periodical Depreciation
          </h3>

          <form onSubmit={handleRunDepreciation} className="space-y-3 text-xs">
            <div>
              <label className="block text-[color:var(--crm-text-secondary)] mb-1">Select Asset</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)]"
              >
                {fixedAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetCode}] {a.assetName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[color:var(--crm-text-secondary)] mb-1">Financial Period</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-[color:var(--crm-text-secondary)] mb-1">Depreciation Amount (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={depAmount}
                onChange={(e) => setDepAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-mono"
              />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition cursor-pointer">
              Run Depreciation &amp; Post JV
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[color:var(--crm-border-default)] font-bold text-[color:var(--crm-text-primary)] text-sm">Depreciation Audit Logs</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[color:var(--crm-text-secondary)]">
              <thead className="bg-[#F4F6FA]/80 text-[color:var(--crm-text-secondary)] uppercase font-semibold text-[10px] tracking-wider border-b border-[color:var(--crm-border-default)]">
                <tr>
                  <th className="py-3.5 px-4">Dep Date</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Depreciation JV</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-4 text-right">Book Value After (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--crm-border-default)] font-mono">
                {depreciationEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[color:var(--crm-text-secondary)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="w-8 h-8 text-[color:var(--crm-text-tertiary)] opacity-50" />
                        <p className="font-semibold text-[color:var(--crm-text-secondary)]">No depreciation logs recorded</p>
                        <p className="text-[11px] text-[color:var(--crm-text-tertiary)]">Run depreciation on fixed assets using the schedule calculator on the left.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  depreciationEntries.map((d) => (
                    <tr key={d.id}>
                      <td className="py-3 px-4 font-sans text-[color:var(--crm-text-secondary)]">{d.depreciationDate}</td>
                      <td className="py-3 px-4 font-sans text-[color:var(--crm-text-primary)] font-semibold">{d.period}</td>
                      <td className="py-3 px-4 text-amber-600 font-bold">{d.journalEntryNumber}</td>
                      <td className="py-3 px-4 text-right text-rose-500 font-bold">₹{d.amount?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-bold">₹{d.bookValueAfter?.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
