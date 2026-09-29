'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Box, Search, Filter, Lock, CheckCircle, MapPin, Building, AlertTriangle } from 'lucide-react';

export default function StockMatrixPage() {
  const { stockBalances, itemMasters, warehouses } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const filtered = stockBalances.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    const itemCode = (s.itemCode || (s as any).item_code || '').toLowerCase();
    const itemName = (s.itemName || (s as any).item_name || '').toLowerCase();
    const loc = (s.locationCode || (s as any).location_code || '').toLowerCase();
    const matchesSearch = !term || itemCode.includes(term) || itemName.includes(term) || loc.includes(term);
    const whId = s.warehouseId || (s as any).warehouse_id || '';
    const matchesWh = selectedWarehouse === 'all' || whId === selectedWarehouse;
    return matchesSearch && matchesWh;
  });

  const totalValuation = filtered.reduce((acc, s) => {
    const avail = Number(s.availableQty ?? (s as any).available_quantity ?? (s as any).quantity ?? 0);
    const res = Number(s.reservedQty ?? (s as any).reserved_quantity ?? 0);
    const use = Number(s.usableQty ?? (s as any).usable_quantity ?? (avail - res));
    const rate = Number(s.averageRate ?? (s as any).average_unit_cost ?? (s as any).unit_rate ?? (s as any).rate ?? 185);
    const val = Number(s.stockValue ?? (s as any).total_value ?? (use * rate));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-semibold">
              INVENTORY MATRIX
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Real-Time Usable Stock Matrix</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Exact formula: <code className="font-mono text-sky-400 font-bold bg-[#FAF7F2] px-1.5 py-0.5 rounded">Usable Stock = Available Stock - Reserved Stock</code>. Prevents double-booking material for multiple jobs.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search code, item name, bin location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-[#FAF7F2] text-[#544B45] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.warehouseName}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-right">
          <span className="text-[#70665F]">Total Filtered Stock Valuation: </span>
          <span className="text-emerald-400 font-extrabold text-sm">₹{totalValuation.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Stock Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Warehouse & Bin Location</th>
                <th className="p-3.5">Heat / Batch Lot</th>
                <th className="p-3.5 text-right">Available Qty</th>
                <th className="p-3.5 text-right text-rose-400">Reserved Qty</th>
                <th className="p-3.5 text-right text-sky-400">Usable Qty</th>
                <th className="p-3.5 text-right">Avg Rate (₹)</th>
                <th className="p-3.5 text-right">Usable Valuation (₹)</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((s) => {
                const itemCode = s.itemCode || (s as any).item_code || 'ITEM';
                const itemName = s.itemName || (s as any).item_name || 'Item Material';
                const whName = s.warehouseName || (s as any).warehouse_name || 'Main Raw Material & Plate Yard';
                const locCode = s.locationCode || (s as any).location_code || 'W1-ZA-R1-S1-B01';
                const batch = s.batchLot || (s as any).batch_lot || (s as any).heat_number || '-';

                const availRaw = Number(s.availableQty ?? (s as any).available_quantity ?? (s as any).quantity ?? 0);
                const availableQty = isNaN(availRaw) ? 0 : availRaw;

                const resRaw = Number(s.reservedQty ?? (s as any).reserved_quantity ?? 0);
                const reservedQty = isNaN(resRaw) ? 0 : resRaw;

                const usableRaw = Number(s.usableQty ?? (s as any).usable_quantity ?? (availableQty - reservedQty));
                const usableQty = isNaN(usableRaw) ? 0 : usableRaw;

                const rateRaw = Number(s.averageRate ?? (s as any).average_unit_cost ?? (s as any).unit_rate ?? (s as any).rate ?? 185);
                const averageRate = isNaN(rateRaw) ? 0 : rateRaw;

                const valRaw = Number(s.stockValue ?? (s as any).total_value ?? (usableQty * averageRate));
                const valuation = isNaN(valRaw) ? 0 : valRaw;

                const isLow = usableQty < 500;

                return (
                  <tr key={s.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="p-3.5 font-medium">
                      <div className="font-bold text-[#211B17] text-xs">{itemCode}</div>
                      <div className="text-[11px] text-[#70665F] mt-0.5">{itemName}</div>
                    </td>
                    <td className="p-3.5 text-[#544B45]">
                      <div className="font-semibold text-[#211B17]">{whName}</div>
                      <div className="text-[10px] font-mono text-teal-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-500" />
                        {locCode}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-crm-brand-500 font-semibold">{batch}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#544B45]">
                      {availableQty.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                      {reservedQty.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-sky-400 text-sm">
                      {usableQty.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#544B45]">
                      ₹{averageRate.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      ₹{valuation.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isLow
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isLow ? 'Low Usable' : 'Optimal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
