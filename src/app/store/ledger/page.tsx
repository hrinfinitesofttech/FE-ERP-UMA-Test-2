'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { History, Search, Filter, Lock, ArrowUpRight, ArrowDownRight, Database, Download } from 'lucide-react';

export default function StockLedgerPage() {
  const { stockLedgers } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filtered = stockLedgers.filter((l) => {
    const matchesSearch =

      !searchTerm?.trim() || (

      l.transactionNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      l.itemCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      l.itemName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (l.jobId && l.jobId?.toLowerCase().includes(searchTerm?.toLowerCase()))

    );
    const matchesType = selectedType === 'all' || l.transactionType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#FAF7F2] text-[#544B45] border border-[#EBE3DB] text-xs font-mono font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              IMMUTABLE AUDIT LEDGER
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Stock Movement Ledger</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Read-only chronological audit log of all stock movements (GRN, Material Issue, Return, Transfer, Adjustment).
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] border border-[#EBE3DB] text-xs font-bold hover:bg-[#FAF7F2] transition">
          <Download className="w-4 h-4" />
          Export Ledger (CSV / Excel)
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search transaction no, item code, job no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#FAF7F2] text-[#544B45] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-500"
          >
            <option value="all">All Transaction Types</option>
            <option value="Opening Stock">Opening Stock</option>
            <option value="GRN">GRN Inward</option>
            <option value="Material Issue">Material Issue</option>
            <option value="Material Return">Material Return</option>
            <option value="Stock Transfer">Stock Transfer</option>
            <option value="Stock Adjustment">Stock Adjustment</option>
          </select>
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Ledger Records: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Timestamp & Type</th>
                <th className="p-3.5">Transaction Ref</th>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Warehouse & Bin</th>
                <th className="p-3.5 text-right font-mono">Opening Qty</th>
                <th className="p-3.5 text-right text-emerald-400 font-mono">In Qty</th>
                <th className="p-3.5 text-right text-rose-400 font-mono">Out Qty</th>
                <th className="p-3.5 text-right text-sky-400 font-mono">Closing Qty</th>
                <th className="p-3.5 text-right">Transaction Value (₹)</th>
                <th className="p-3.5">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[#FAF7F2]/40 transition font-mono">
                  <td className="p-3.5 text-[#544B45]">
                    <div className="font-semibold text-[#211B17]">{l.entryDate}</div>
                    <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[10px] text-[#70665F] font-sans mt-0.5 inline-block">
                      {l.transactionType}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-sky-400">
                    <div>{l.transactionNumber}</div>
                    {l.jobId && <div className="text-[10px] text-amber-400 font-sans mt-0.5">Job: {l.jobId}</div>}
                  </td>
                  <td className="p-3.5 text-[#544B45] font-sans">
                    <div className="font-bold text-[#211B17] text-xs">{l.itemCode}</div>
                    <div className="text-[11px] text-[#70665F] mt-0.5">{l.itemName}</div>
                  </td>
                  <td className="p-3.5 text-[#544B45] font-sans">
                    <div>{l.warehouseName}</div>
                    <div className="text-[10px] font-mono text-teal-400 mt-0.5">{l.locationCode}</div>
                  </td>
                  <td className="p-3.5 text-right text-[#70665F]">{l.openingQty?.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-right text-emerald-400 font-bold">
                    {l.inQty > 0 ? `+${l.inQty?.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="p-3.5 text-right text-rose-400 font-bold">
                    {l.outQty > 0 ? `-${l.outQty?.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="p-3.5 text-right text-sky-400 font-black text-sm">
                    {l.closingQty?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right text-[#211B17] font-bold">
                    ₹{l.transactionValue?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 font-sans text-[#544B45]">{l.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
