'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ScrapEntry, ScrapStatus } from '../../../types/store';
import { Trash2, Plus, Search, AlertTriangle, Cpu, DollarSign, CheckCircle } from 'lucide-react';

export default function ScrapPage() {
  const { scrapEntries, addScrapEntry, itemMasters, warehouses, projectJobs } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [itemId, setItemId] = useState(itemMasters[0]?.id || '');
  const [jobId, setJobId] = useState(projectJobs[0]?.id || projectJobs[0]?.jobNumber || '');
  const [qty, setQty] = useState(0);
  const [source, setSource] = useState<'Production Scrap' | 'Purchase Rejection' | 'Damaged Material' | 'Quality Rejection' | 'Expired Material' | 'Other'>('Production Scrap');
  const [reason, setReason] = useState('');
  const [val, setVal] = useState(0);

  const selectedItem = itemMasters.find((i) => i.id === itemId) || itemMasters[0];
  const selectedWh = warehouses[0] || null;

  const filtered = scrapEntries.filter(
    (s) =>

      !searchTerm?.trim() ||

      s.scrapNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      s.itemName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      s.reason?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedWh) return;

    addScrapEntry({
      entryDate: new Date().toISOString().split('T')[0],
      itemId: selectedItem.id,
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.itemName,
      quantity: qty,
      uom: selectedItem.uom,
      source,
      jobId,
      reason,
      warehouseId: selectedWh.id,
      warehouseName: selectedWh.warehouseName,
      scrapLocation: 'W5-ZS-B1-F1-S01',
      estimatedValue: val,
      disposalStatus: 'Moved to Scrap',
      remarks: 'Stored in SS scrap yard for quarterly auction sale',
      createdBy: 'Ramesh Bariya (Scrap Lead)',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-mono font-semibold">
              SCRAP RECOVERY & AUCTION
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Scrap & Rejection Yard Manager</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Track turning chips, plate offcut scrap, quality rejected components, and auction sale recovery ledgers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-yellow-600 text-[#211B17] text-xs font-bold shadow-lg shadow-yellow-600/30 hover:bg-yellow-500 transition"
        >
          <Plus className="w-4 h-4" />
          Add Scrap Entry
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search scrap entry no, item, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-yellow-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Total Scrap Records: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Scrap Entry No & Date</th>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Source & Job No</th>
                <th className="p-3.5 text-right">Scrap Qty</th>
                <th className="p-3.5 text-right font-mono">Est Scrap Value (₹)</th>
                <th className="p-3.5">Scrap Yard Location</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3.5 font-medium">
                    <div className="font-bold text-yellow-400 text-xs font-mono">{s.scrapNumber}</div>
                    <div className="text-[10px] text-[#70665F] mt-0.5">{s.entryDate}</div>
                  </td>
                  <td className="p-3.5 font-medium">
                    <div className="font-bold text-[#211B17] text-xs">{s.itemCode}</div>
                    <div className="text-[11px] text-[#70665F] mt-0.5">{s.itemName}</div>
                  </td>
                  <td className="p-3.5 font-mono">
                    <div className="font-semibold text-amber-400">{s.source}</div>
                    <div className="text-[10px] text-[#70665F] mt-0.5">{s.jobId || 'General Shop Floor'}</div>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-yellow-400">
                    {s.quantity?.toLocaleString('en-IN')} {s.uom}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                    ₹{s.estimatedValue?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-[#544B45]">
                    <div>{s.warehouseName}</div>
                    <div className="text-[10px] font-mono text-teal-400 mt-0.5">{s.scrapLocation}</div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      {s.disposalStatus}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-[#544B45]">{s.createdBy}</td>
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
                <Trash2 className="w-5 h-5 text-yellow-400" />
                Add Scrap & Rejection Record
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Select Item *</label>
                  <select
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-yellow-500"
                  >
                    {itemMasters.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.itemCode} - {i.itemName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Target Job Number</label>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-yellow-500 font-mono"
                  >
                    {projectJobs.map((j) => (
                      <option key={j.id} value={j.jobNumber}>
                        {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Scrap Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Production Scrap">Production Scrap</option>
                    <option value="Purchase Rejection">Purchase Rejection</option>
                    <option value="Damaged Material">Damaged Material</option>
                    <option value="Quality Rejection">Quality Rejection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Quantity ({selectedItem?.uom})</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-yellow-400 font-bold focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Est. Scrap Value (₹)</label>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => setVal(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Scrap Reason & Offcut Description</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-yellow-500"
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
                  className="px-4 py-2 rounded-xl bg-yellow-600 text-[#211B17] hover:bg-yellow-500 text-xs font-semibold shadow-lg shadow-yellow-600/30"
                >
                  Confirm Scrap Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
