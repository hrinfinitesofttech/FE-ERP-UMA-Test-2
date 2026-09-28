'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { StockAdjustment } from '../../../types/store';
import { RotateCcw, Plus, Search, AlertTriangle, CheckCircle } from 'lucide-react';

export default function StockAdjustmentsPage() {
  const { stockAdjustments, addStockAdjustment, warehouses, itemMasters } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [warehouseId, setWarehouseId] = useState(warehouses[2]?.id || 'WH-003');
  const [itemId, setItemId] = useState(itemMasters[4]?.id || 'ITEM-005');
  const [locationCode, setLocationCode] = useState('W3-ZE-R5-S1-B01');
  const [sysQty, setSysQty] = useState(360);
  const [phyQty, setPhyQty] = useState(350);
  const [reason, setReason] = useState<'Physical Count Difference' | 'Damaged Stock' | 'Missing Stock' | 'Data Correction' | 'Opening Balance Correction' | 'Other'>('Damaged Stock');
  const [remarks, setRemarks] = useState('10 Kg TIG wire packets damaged due to rain leakage');

  const selectedWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];
  const selectedItem = itemMasters.find((i) => i.id === itemId) || itemMasters[0];

  const filtered = stockAdjustments.filter(
    (a) =>

      !searchTerm?.trim() ||

      a.adjustmentNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      a.itemName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      a.reason?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWh || !selectedItem) return;

    const diff = phyQty - sysQty;
    const value = diff * selectedItem.standardCost;

    addStockAdjustment({
      adjustmentDate: new Date().toISOString().split('T')[0],
      warehouseId: selectedWh.id,
      warehouseName: selectedWh.warehouseName,
      locationCode,
      itemId: selectedItem.id,
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.itemName,
      systemQuantity: sysQty,
      physicalQuantity: phyQty,
      differenceQuantity: diff,
      unitPrice: selectedItem.standardCost,
      adjustmentValue: value,
      reason,
      remarks,
      approvedBy: 'Hitesh Rawal (Store Head)',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-mono font-semibold">
              AUDIT ADJUSTMENTS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Stock Adjustment Entry</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Reconcile physical stock variances, missing/damaged goods, and inventory write-offs with audit approvals.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-600 text-[#211B17] text-xs font-bold shadow-lg shadow-pink-600/30 hover:bg-pink-500 transition"
        >
          <Plus className="w-4 h-4" />
          Create Stock Adjustment
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search adjustment no, item, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-pink-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Adjustments Log: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Adjustment No & Date</th>
                <th className="p-3.5">Warehouse & Location</th>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5 text-right">System Qty</th>
                <th className="p-3.5 text-right">Physical Qty</th>
                <th className="p-3.5 text-right text-pink-400">Difference Qty</th>
                <th className="p-3.5 text-right">Adjustment Value (₹)</th>
                <th className="p-3.5">Reason & Remarks</th>
                <th className="p-3.5">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3.5 font-medium">
                    <div className="font-bold text-pink-400 text-xs font-mono">{a.adjustmentNumber}</div>
                    <div className="text-[10px] text-[#70665F] mt-0.5">{a.adjustmentDate}</div>
                  </td>
                  <td className="p-3.5 text-[#544B45]">
                    <div className="font-semibold text-[#211B17]">{a.warehouseName}</div>
                    <div className="text-[10px] font-mono text-teal-400 mt-0.5">{a.locationCode}</div>
                  </td>
                  <td className="p-3.5 font-medium">
                    <div className="font-bold text-[#211B17] text-xs">{a.itemCode}</div>
                    <div className="text-[11px] text-[#70665F] mt-0.5">{a.itemName}</div>
                  </td>
                  <td className="p-3.5 text-right font-mono text-[#544B45]">{a.systemQuantity}</td>
                  <td className="p-3.5 text-right font-mono text-[#544B45]">{a.physicalQuantity}</td>
                  <td className="p-3.5 text-right font-mono font-black text-pink-400">
                    {a.differenceQuantity > 0 ? `+${a.differenceQuantity}` : a.differenceQuantity}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                    ₹{a.adjustmentValue?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-[#544B45]">
                    <div className="font-semibold text-amber-400">{a.reason}</div>
                    <div className="text-[10px] text-[#70665F] truncate max-w-[150px]">{a.remarks}</div>
                  </td>
                  <td className="p-3.5 font-medium text-[#544B45]">{a.approvedBy}</td>
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
                <RotateCcw className="w-5 h-5 text-pink-400" />
                Record Stock Adjustment
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Select Warehouse</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Item to Adjust *</label>
                  <select
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                  >
                    {itemMasters.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.itemCode} - {i.itemName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">System Quantity</label>
                  <input
                    type="number"
                    value={sysQty}
                    onChange={(e) => setSysQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Physical Quantity Found</label>
                  <input
                    type="number"
                    value={phyQty}
                    onChange={(e) => setPhyQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-pink-400 font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Adjustment Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                >
                  <option value="Damaged Stock">Damaged Stock</option>
                  <option value="Physical Count Difference">Physical Count Difference</option>
                  <option value="Missing Stock">Missing Stock</option>
                  <option value="Data Correction">Data Correction</option>
                  <option value="Opening Balance Correction">Opening Balance Correction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Audit Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
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
                  className="px-4 py-2 rounded-xl bg-pink-600 text-[#211B17] hover:bg-pink-500 text-xs font-semibold shadow-lg shadow-pink-600/30"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
