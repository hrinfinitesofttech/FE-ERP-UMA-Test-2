'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Box, Layers, Building, Package, DollarSign, ShieldAlert, ArrowDownUp } from 'lucide-react';

export default function Item360Page() {
  const { item360List } = useERP();
  const [selectedItemId, setSelectedItemId] = useState<string>('ITEM-RAW-001');

  const item = item360List.find((i) => i.itemId === selectedItemId) || item360List[0];

  if (!item) {
    return (
      <div className="p-8 text-center bg-slate-950 min-h-screen text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Item 360° Profile</h2>
        <p>No item records available or loading live data from API...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{item.itemName}</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Item Code: <span className="text-cyan-400 font-bold font-mono">{item.itemCode}</span> • Category: {item.category}
              </p>
            </div>
          </div>
        </div>

        {/* Item Select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Select Item:</span>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer"
            >
              {item360List.map((i) => (
                <option key={i.itemId} value={i.itemId} className="bg-slate-900 text-slate-200">
                  {i.itemCode} - {i.itemName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Current Total Stock</span>
          <div className="text-lg font-bold text-white">{item.currentStock} {item.uom}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Reserved for Active Jobs</span>
          <div className="text-lg font-bold text-amber-400">{item.reservedStock} {item.uom}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Free Available Stock</span>
          <div className="text-lg font-bold text-emerald-400">{item.availableStock} {item.uom}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Total Inventory Valuation</span>
          <div className="text-lg font-bold text-cyan-400">₹{item.totalValuation.toLocaleString()}</div>
        </div>
      </div>

      {/* Warehouse & Supplier Info */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-400" /> Storage Location & Supplier Mapping
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
          <div>Primary Warehouse: <strong className="text-white">{item.primaryWarehouse}</strong></div>
          <div>Default Preferred Supplier: <strong className="text-white">{item.primarySupplier}</strong></div>
          <div>Standard Unit Purchase Rate: <span className="font-mono text-emerald-400 font-bold">₹{item.unitCost} / {item.uom}</span></div>
          <div>Reorder Threshold Level: <span className="font-mono text-amber-400 font-bold">{item.reorderLevel} {item.uom}</span></div>
        </div>
      </div>
    </div>
  );
}
