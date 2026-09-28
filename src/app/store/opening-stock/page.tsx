'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Sparkles, Plus, Search, Calendar, FileText, CheckCircle, Database } from 'lucide-react';

export default function OpeningStockPage() {
  const { openingStocks, addOpeningStock, itemMasters, warehouses } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [itemId, setItemId] = useState(itemMasters[0]?.id || 'ITEM-001');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'WH-001');
  const [locationCode, setLocationCode] = useState('W1-ZA-R1-S1-B01');
  const [batchLot, setBatchLot] = useState('HEAT-98421');
  const [quantity, setQuantity] = useState<number | string>('');
  const [rate, setRate] = useState<number | string>('');
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');

  const selectedItem = itemMasters.find((i) => i.id === itemId) || itemMasters[0];
  const selectedWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];

  const filtered = openingStocks.filter(
    (op) =>

      !searchTerm?.trim() ||

      op.itemCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      op.itemName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      op.reference?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedWh) return;

    const numQty = Number(quantity) || 0;
    const numRate = Number(rate) || 0;

    addOpeningStock({
      entryDate: new Date().toISOString().split('T')[0],
      warehouseId: selectedWh.id,
      warehouseName: selectedWh.warehouseName,
      locationCode,
      itemId: selectedItem.id,
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.itemName,
      batchLot,
      quantity: numQty,
      uom: selectedItem.uom,
      rate: numRate,
      totalValue: numQty * numRate,
      reference,
      remarks,
      createdBy: 'Hitesh Rawal (Store Head)',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold">
              OPENING BALANCE AUDIT
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Opening Stock Entry</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Initialize financial year opening stock balances, batch Heat numbers, rates, and baseline stock ledgers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition"
        >
          <Plus className="w-4 h-4" />
          Add Opening Stock Entry
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search opening entries by item, batch, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Opening Audit Logs: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Opening Stock Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Entry Date</th>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Warehouse & Location</th>
                <th className="p-3.5">Heat / Batch Lot</th>
                <th className="p-3.5 text-right">Quantity</th>
                <th className="p-3.5 text-right">Unit Rate (₹)</th>
                <th className="p-3.5 text-right">Total Valuation (₹)</th>
                <th className="p-3.5">Reference Audit</th>
                <th className="p-3.5">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((op) => (
                <tr key={op.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3.5 font-mono text-[#70665F]">{op.entryDate}</td>
                  <td className="p-3.5 font-medium">
                    <div className="font-bold text-[#211B17] text-xs">{op.itemCode}</div>
                    <div className="text-[11px] text-[#70665F] mt-0.5">{op.itemName}</div>
                  </td>
                  <td className="p-3.5 text-[#544B45]">
                    <div className="font-semibold text-[#211B17]">{op.warehouseName}</div>
                    <div className="text-[10px] font-mono text-teal-400 mt-0.5">{op.locationCode}</div>
                  </td>
                  <td className="p-3.5 font-mono text-crm-brand-500 font-semibold">{op.batchLot || '-'}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                    {op.quantity?.toLocaleString('en-IN')} {op.uom}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[#544B45]">₹{op.rate?.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-[#211B17]">₹{op.totalValue?.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-[#544B45]">
                    <div>{op.reference}</div>
                    <div className="text-[10px] text-[#70665F] truncate max-w-[150px]">{op.remarks}</div>
                  </td>
                  <td className="p-3.5 font-medium text-[#544B45]">{op.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Add Opening Stock Entry
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
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                  >
                    {itemMasters.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.itemCode} - {i.itemName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Select Warehouse *</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-[#70665F] mb-1">Location Bin Code</label>
                  <input
                    type="text"
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Heat / Batch Lot</label>
                  <input
                    type="text"
                    value={batchLot}
                    onChange={(e) => setBatchLot(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Quantity ({selectedItem?.uom})</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Unit Purchase Rate (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={rate}
                    onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Audit Reference / Document</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Save Opening Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
