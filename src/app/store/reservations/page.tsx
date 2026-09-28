'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Lock, Plus, Search, Unlock, Briefcase, Cpu, CheckCircle } from 'lucide-react';

export default function StockReservationsPage() {
  const { stockReservations, addStockReservation, releaseStockReservation, projectJobs, itemMasters, warehouses } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [jobId, setJobId] = useState('JOB-2026-001');
  const [itemId, setItemId] = useState(itemMasters[0]?.id || 'ITEM-001');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'WH-001');
  const [requiredQty, setRequiredQty] = useState(1500);
  const [requiredDate, setRequiredDate] = useState('2026-10-01');

  const selectedItem = itemMasters.find((i) => i.id === itemId) || itemMasters[0];
  const selectedWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];
  const selectedJob = projectJobs.find((j) => j.jobNumber === jobId) || projectJobs[0];

  const filtered = stockReservations.filter(
    (r) =>

      !searchTerm?.trim() ||

      r.reservationNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      r.jobId?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      r.itemName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedWh) return;

    addStockReservation({
      projectId: selectedJob?.id || 'PRJ-2026-0001',
      jobId,
      bomId: 'BOM-2026-001',
      itemId: selectedItem.id,
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.itemName,
      requiredQuantity: requiredQty,
      reservedQuantity: requiredQty,
      warehouseId: selectedWh.id,
      warehouseName: selectedWh.warehouseName,
      locationCode: 'W1-ZA-R1-S1-B01',
      requiredDate,
      reservedBy: 'Hitesh Rawal (Store Head)',
      status: 'Reserved',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold">
              JOB LOCKING
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Job-wise Stock Reservations</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Lock raw material quantities for specific Job Numbers (`Project ID + Job Number`) against approved BOMs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition"
        >
          <Lock className="w-4 h-4" />
          Reserve Stock for Job
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search reservation no, job no, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Active Locks: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Reservation No</th>
                <th className="p-3.5">Job Number & Project</th>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5 text-right">Required Qty</th>
                <th className="p-3.5 text-right text-rose-400">Reserved Qty</th>
                <th className="p-3.5">Warehouse & Bin</th>
                <th className="p-3.5">Required Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3.5 font-mono font-bold text-rose-400">{r.reservationNumber}</td>
                  <td className="p-3.5 font-mono">
                    <div className="font-bold text-amber-400 text-xs flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-amber-500" />
                      {r.jobId}
                    </div>
                    <div className="text-[10px] text-[#70665F] mt-0.5">{r.projectId}</div>
                  </td>
                  <td className="p-3.5 font-medium">
                    <div className="font-bold text-[#211B17] text-xs">{r.itemCode}</div>
                    <div className="text-[11px] text-[#70665F] mt-0.5">{r.itemName}</div>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-[#544B45]">
                    {r.requiredQuantity?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-rose-400 text-sm">
                    {r.reservedQuantity?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-[#544B45]">
                    <div>{r.warehouseName}</div>
                    <div className="text-[10px] font-mono text-teal-400 mt-0.5">{r.locationCode}</div>
                  </td>
                  <td className="p-3.5 font-mono text-[#70665F]">{r.requiredDate}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        r.status === 'Reserved'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {r.status === 'Reserved' && (
                      <button
                        onClick={() => releaseStockReservation(r.id)}
                        className="px-2.5 py-1 rounded bg-[#FAF7F2] text-[#544B45] hover:text-[#211B17] hover:bg-[#FAF7F2] text-xs flex items-center gap-1 font-semibold transition"
                      >
                        <Unlock className="w-3 h-3 text-emerald-400" />
                        Release
                      </button>
                    )}
                  </td>
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
                <Lock className="w-5 h-5 text-rose-400" />
                Reserve Stock for Job
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Target Job Number *</label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-rose-500 font-mono"
                >
                  {projectJobs.map((j) => (
                    <option key={j.id} value={j.jobNumber}>
                      {j.jobNumber} - {j.productName} ({j.customerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Select Item *</label>
                  <select
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-rose-500"
                  >
                    {itemMasters.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.itemCode} - {i.itemName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Warehouse Yard</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-rose-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Required Quantity ({selectedItem?.uom})</label>
                  <input
                    type="number"
                    value={requiredQty}
                    onChange={(e) => setRequiredQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Required By Date</label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 text-xs font-semibold shadow-lg shadow-rose-600/30"
                >
                  Lock Stock Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
