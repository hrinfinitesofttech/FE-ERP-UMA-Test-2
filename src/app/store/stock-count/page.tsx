'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { PhysicalStockCount } from '../../../types/store';
import { CheckSquare, Plus, Search, Building, UserCheck, CheckCircle } from 'lucide-react';

export default function PhysicalStockCountPage() {
  const { physicalStockCounts, addPhysicalStockCount, warehouses, itemMasters } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [whId, setWhId] = useState(warehouses[0]?.id || 'WH-001');
  const [counterName, setCounterName] = useState('Deepak Solanki (Internal Auditor)');
  const [remarks, setRemarks] = useState('Monthly physical stock audit for raw material plates');

  const selectedWh = warehouses.find((w) => w.id === whId) || warehouses[0];

  const filtered = physicalStockCounts.filter(
    (c) =>
      c.countNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.warehouseName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.counterName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWh) return;

    addPhysicalStockCount({
      countDate: new Date().toISOString().split('T')[0],
      warehouseId: selectedWh.id,
      warehouseName: selectedWh.warehouseName,
      counterName,
      status: 'Approved',
      totalVarianceValue: 0,
      remarks,
      items: [
        {
          id: `cnt-item-${Date.now().toString().slice(-4)}`,
          countId: '',
          itemId: 'ITEM-001',
          itemCode: 'RM-SS316-10MM',
          itemName: 'SS 316L Hot Rolled Plate (10mm Thick)',
          systemQuantity: 8000,
          physicalQuantity: 8000,
          differenceQuantity: 0,
          varianceValue: 0,
          reason: 'Physical count matched ledger balance 100%',
        },
      ],
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-mono font-semibold">
              INVENTORY AUDIT
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Physical Stock Count Audit</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Conduct monthly physical stock-taking counts, record system vs physical variances, and reconcile ledgers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 text-[#211B17] text-xs font-bold shadow-lg shadow-teal-600/30 hover:bg-teal-500 transition"
        >
          <Plus className="w-4 h-4" />
          Create Physical Count Session
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search audit no, warehouse, auditor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Audit Sessions: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Count Audit No & Date</th>
                <th className="p-3.5">Warehouse Yard</th>
                <th className="p-3.5">Auditor Name</th>
                <th className="p-3.5 text-right">Total Variance Value (₹)</th>
                <th className="p-3.5 text-center">Audit Status</th>
                <th className="p-3.5">Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3.5 font-medium">
                    <div className="font-bold text-teal-400 text-xs font-mono">{c.countNumber}</div>
                    <div className="text-[10px] text-[#70665F] mt-0.5">{c.countDate}</div>
                  </td>
                  <td className="p-3.5 font-bold text-[#211B17]">{c.warehouseName}</td>
                  <td className="p-3.5 font-semibold text-[#544B45]">{c.counterName}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                    ₹{c.totalVarianceValue?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#70665F] text-xs">{c.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-400" />
                Initiate Physical Stock Count Audit
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Warehouse Yard *</label>
                <select
                  value={whId}
                  onChange={(e) => setWhId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.warehouseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Stock Auditor Lead Name</label>
                <input
                  type="text"
                  value={counterName}
                  onChange={(e) => setCounterName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Audit Scope & Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-[#FAF7F2] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-[#211B17] hover:bg-teal-500 text-xs font-semibold shadow-lg shadow-teal-600/30"
                >
                  Confirm Physical Count Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
