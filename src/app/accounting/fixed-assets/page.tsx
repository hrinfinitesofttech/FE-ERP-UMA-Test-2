'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Building, Plus, Search, Calendar, History } from 'lucide-react';

export default function FixedAssetsPage() {
  const { fixedAssets, addFixedAsset } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [assetCode, setAssetCode] = useState('');
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState('Plant & Machinery');
  const [purchaseCost, setPurchaseCost] = useState<number | string>('');
  const [depreciationMethod, setDepreciationMethod] = useState<'SLM' | 'WDV'>('WDV');
  const [depreciationRate, setDepreciationRate] = useState<number | string>(15);
  const [usefulLifeYears, setUsefulLifeYears] = useState<number | string>(10);
  const [location, setLocation] = useState('Bay-3 Heavy Machine Shop');

  const filtered = fixedAssets.filter(
    (a) =>

      !searchTerm?.trim() ||

      a.assetCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      a.assetName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Number(purchaseCost) || 0;
    const rate = Number(depreciationRate) || 0;
    const life = Number(usefulLifeYears) || 0;
    addFixedAsset({
      assetCode,
      assetName,
      category,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: cost,
      depreciationMethod,
      depreciationRate: rate,
      usefulLifeYears: life,
      accumulatedDepreciation: 0,
      currentBookValue: cost,
      location,
      status: 'Active',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/20 rounded-xl text-teal-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Fixed Assets Register & Capital Expenditure</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Plant, Machinery, Buildings & Vehicles • Income Tax Act & Companies Act Depreciation</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register Fixed Asset</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search asset code, name..."
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
              <th className="py-3.5 px-4">Asset Code</th>
              <th className="py-3.5 px-4">Asset Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4 text-right">Purchase Cost (₹)</th>
              <th className="py-3.5 px-4 text-right">Accumulated Dep. (₹)</th>
              <th className="py-3.5 px-4 text-right">Book Value (₹)</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-white/40 transition">
                <td className="py-3 px-4 font-bold text-teal-400">{a.assetCode}</td>
                <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{a.assetName}</td>
                <td className="py-3 px-4 font-sans text-[#70665F]">{a.category}</td>
                <td className="py-3 px-4 font-sans text-[#70665F]">{a.location}</td>
                <td className="py-3 px-4 text-right text-[#544B45]">₹{(a.purchaseCost || a.purchaseValue || 0)?.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-rose-400">₹{a.accumulatedDepreciation?.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">₹{a.currentBookValue?.toLocaleString()}</td>
                <td className="py-3 px-4 text-center font-sans">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-[#211B17] border-b border-[#EBE3DB] pb-3">Register Fixed Asset</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Asset Code</label>
                <input
                  type="text"
                  required
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                  >
                    <option value="Plant & Machinery">Plant & Machinery</option>
                    <option value="Factory Building">Factory Building</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Computers & IT">Computers & IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Depreciation Method</label>
                  <select
                    value={depreciationMethod}
                    onChange={(e) => setDepreciationMethod(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                  >
                    <option value="WDV">Written Down Value (WDV)</option>
                    <option value="SLM">Straight Line Method (SLM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1">Depreciation Rate (%)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={depreciationRate}
                    onChange={(e) => setDepreciationRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-white text-[#544B45]">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-[#211B17] font-semibold">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
