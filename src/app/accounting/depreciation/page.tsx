'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { History, Play, CheckCircle2, Calendar } from 'lucide-react';

export default function DepreciationSchedulePage() {
  const { fixedAssets, depreciationEntries, runDepreciation } = useERP();
  const [selectedAssetId, setSelectedAssetId] = useState(fixedAssets[0]?.id || '');
  const [period, setPeriod] = useState('FY 2025-26 Q2');
  const [depAmount, setDepAmount] = useState(162500);

  const handleRunDepreciation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    runDepreciation(selectedAssetId, period, depAmount);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-500/20 rounded-xl text-[#544B45]">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Depreciation Calculation Engine & History</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Automated Asset Amortization • WDV & SLM Periodical Depreciation Journal Vouchers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Depreciation Form */}
        <div className="bg-white p-6 rounded-2xl border border-[#EBE3DB] space-y-4">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2 border-b border-[#EBE3DB] pb-3">
            <Play className="w-4 h-4 text-emerald-400" />
            Post Periodical Depreciation
          </h3>

          <form onSubmit={handleRunDepreciation} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#70665F] mb-1">Select Asset</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
              >
                {fixedAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetCode}] {a.assetName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#70665F] mb-1">Financial Period</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
              />
            </div>

            <div>
              <label className="block text-[#70665F] mb-1">Depreciation Amount (₹)</label>
              <input
                type="number"
                value={depAmount}
                onChange={(e) => setDepAmount(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
              />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-semibold transition">
              Run Depreciation & Post JV
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
          <div className="p-4 border-b border-[#EBE3DB] font-bold text-[#211B17] text-sm">Depreciation Audit Logs</div>
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Dep Date</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Depreciation JV</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-right">Book Value After (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] font-mono">
              {depreciationEntries.map((d) => (
                <tr key={d.id}>
                  <td className="py-3 px-4 font-sans text-[#70665F]">{d.depreciationDate}</td>
                  <td className="py-3 px-4 font-sans text-[#3E2723] font-semibold">{d.period}</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">{d.journalEntryNumber}</td>
                  <td className="py-3 px-4 text-right text-rose-400 font-bold">₹{d.amount?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold">₹{d.bookValueAfter?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
