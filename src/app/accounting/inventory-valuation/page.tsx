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

      !searchTerm?.trim() ||

      s.itemCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      s.itemName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (s.categoryName || (s as any).category || '')?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const totalInventoryValue = stockBalances.reduce((acc, s) => acc + (s.totalValue || (s as any).value || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-primary)]">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-crm-brand-600/20 rounded-xl text-indigo-700">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Physical Inventory Financial Valuation</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">
              Source of Truth: Store Physical Quantity • Financial Costing (Weighted Average & FIFO)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-[color:var(--crm-text-secondary)]">Total Stock Financial Valuation</div>
            <div className="text-lg font-bold text-indigo-700 font-mono">₹{totalInventoryValue?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
          <input
            type="text"
            placeholder="Search item code, name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl pl-9 pr-4 py-2 text-xs text-[color:var(--crm-text-primary)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[color:var(--crm-text-secondary)] font-medium">Valuation Method:</span>
          {(['Weighted_Average', 'FIFO'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setValuationMethod(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                valuationMethod === m ? 'bg-crm-brand-600/20 text-indigo-700 border border-crm-brand-600/30' : 'bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] border border-[color:var(--crm-border-default)]'
              }`}
            >
              {m?.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-xs text-[color:var(--crm-text-secondary)]">
          <thead className="bg-[#F4F6FA]/80 text-[color:var(--crm-text-secondary)] uppercase font-semibold text-[10px] tracking-wider border-b border-[color:var(--crm-border-default)]">
            <tr>
              <th className="py-3.5 px-4">Item Code</th>
              <th className="py-3.5 px-4">Item Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-right">Physical On Hand Qty</th>
              <th className="py-3.5 px-4 text-right">Weighted Avg Unit Cost (₹)</th>
              <th className="py-3.5 px-4 text-right">Total Financial Valuation (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--crm-border-default)] font-mono">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-white/40 transition">
                <td className="py-3 px-4 font-bold text-indigo-700">{s.itemCode}</td>
                <td className="py-3 px-4 font-sans font-semibold text-[color:var(--crm-text-primary)]">{s.itemName}</td>
                <td className="py-3 px-4 font-sans text-[color:var(--crm-text-secondary)]">{s.categoryName || (s as any).category || 'General'}</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  {s.currentQuantity ?? s.availableQty ?? 0} {s.uom || 'Nos'}
                </td>
                <td className="py-3 px-4 text-right text-[color:var(--crm-text-secondary)]">₹{(s.averageUnitCost ?? s.averageRate ?? 0)?.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-[color:var(--crm-text-primary)]">₹{(s.totalValue ?? s.stockValue ?? 0)?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
