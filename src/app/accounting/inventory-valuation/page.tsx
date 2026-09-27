'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Box, Search, DollarSign, Layers, CheckCircle2 } from 'lucide-react';

export default function InventoryValuationPage() {
  const { stockBalances } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [valuationMethod, setValuationMethod] = useState<'FIFO' | 'Weighted_Average'>('Weighted_Average');

  const filtered = stockBalances.filter(
    (s) =>
      s.itemCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      s.itemName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (s.categoryName || (s as any).category || '')?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const totalInventoryValue = stockBalances.reduce((acc, s) => acc + (s.totalValue || (s as any).value || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-crm-brand-600/20 rounded-xl text-indigo-400">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Physical Inventory Financial Valuation</h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Source of Truth: Store Physical Quantity • Financial Costing (Weighted Average & FIFO)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-[#70665F]">Total Stock Financial Valuation</div>
            <div className="text-lg font-bold text-indigo-400 font-mono">₹{totalInventoryValue?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search item code, name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#70665F] font-medium">Valuation Method:</span>
          {(['Weighted_Average', 'FIFO'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setValuationMethod(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                valuationMethod === m ? 'bg-crm-brand-600/20 text-indigo-400 border border-crm-brand-600/30' : 'bg-[#FAF7F2] text-[#70665F] border border-[#EBE3DB]'
              }`}
            >
              {m?.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
        <table className="w-full text-left text-xs text-[#544B45]">
          <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
            <tr>
              <th className="py-3.5 px-4">Item Code</th>
              <th className="py-3.5 px-4">Item Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-right">Physical On Hand Qty</th>
              <th className="py-3.5 px-4 text-right">Weighted Avg Unit Cost (₹)</th>
              <th className="py-3.5 px-4 text-right">Total Financial Valuation (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-white/40 transition">
                <td className="py-3 px-4 font-bold text-indigo-400">{s.itemCode}</td>
                <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{s.itemName}</td>
                <td className="py-3 px-4 font-sans text-[#70665F]">{s.categoryName || (s as any).category || 'General'}</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                  {s.currentQuantity ?? s.availableQty ?? 0} {s.uom || 'Nos'}
                </td>
                <td className="py-3 px-4 text-right text-[#544B45]">₹{(s.averageUnitCost ?? s.averageRate ?? 0)?.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-[#211B17]">₹{(s.totalValue ?? s.stockValue ?? 0)?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
