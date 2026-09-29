'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Workflow, Plus, Search, Building, ArrowRight, CheckCircle } from 'lucide-react';

const DEFAULT_WAREHOUSES = [
  { id: 'wh-main', warehouseCode: 'WH-001', warehouseName: 'Main Raw Material & Plate Yard' },
  { id: 'wh-pipe', warehouseCode: 'WH-002', warehouseName: 'Pipe & Tube Yard' },
  { id: 'wh-comp', warehouseCode: 'WH-003', warehouseName: 'Bought-Out & Hardware Store' },
  { id: 'wh-fg', warehouseCode: 'WH-004', warehouseName: 'Finished Equipment Storage Yard' },
  { id: 'wh-scrap', warehouseCode: 'WH-005', warehouseName: 'Scrap & Offcut Yard' },
];

const DEFAULT_ITEMS = [
  { id: 'ITEM-001', itemCode: 'RM-SS316L-PL-8MM', itemName: 'SS 316L Plates (8mm thk, SA 240)', uom: 'Kg', standardCost: 260 },
  { id: 'ITEM-002', itemCode: 'RM-SS304-PIPE-4IN', itemName: 'SS 304 Seamless Pipe 4" Sch 40', uom: 'Mtr', standardCost: 1450 },
  { id: 'ITEM-003', itemCode: 'BO-FLG-150-ANSI', itemName: 'WNRF Flange 4" 150# A182-F316L', uom: 'Nos', standardCost: 1850 },
  { id: 'ITEM-004', itemCode: 'BO-GSK-SPWD-4IN', itemName: 'Spiral Wound Gasket 4" 150# SS316', uom: 'Nos', standardCost: 320 },
  { id: 'ITEM-005', itemCode: 'CON-WELD-E316L-16', itemName: 'Welding Electrode E316L-16 (3.15mm)', uom: 'Kg', standardCost: 480 },
];

export default function StockTransfersPage() {
  const { stockTransfers, addStockTransfer, warehouses, itemMasters } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const effectiveWarehouses = warehouses && warehouses.length > 0 ? warehouses : DEFAULT_WAREHOUSES;
  const effectiveItems = itemMasters && itemMasters.length > 0 ? itemMasters : DEFAULT_ITEMS;

  // Form State
  const [fromWhId, setFromWhId] = useState(effectiveWarehouses[0]?.id || 'wh-main');
  const [toWhId, setToWhId] = useState(effectiveWarehouses[4]?.id || effectiveWarehouses[1]?.id || 'wh-scrap');
  const [fromLoc, setFromLoc] = useState('W1-ZA-R1-S1-B01');
  const [toLoc, setToLoc] = useState('W5-ZS-B1-F1-S01');
  const [itemId, setItemId] = useState(effectiveItems[0]?.id || 'ITEM-001');
  const [qty, setQty] = useState(80);
  const [reason, setReason] = useState('Move non-usable SS 316 turning scrap offcuts to scrap yard');

  const selectedFromWh = effectiveWarehouses.find((w) => w.id === fromWhId) || effectiveWarehouses[0];
  const selectedToWh = effectiveWarehouses.find((w) => w.id === toWhId) || effectiveWarehouses[4] || effectiveWarehouses[1] || effectiveWarehouses[0];
  const selectedItem = effectiveItems.find((i) => i.id === itemId) || effectiveItems[0];

  const filtered = stockTransfers.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const tNo = (t.transferNumber || (t as any).transfer_number || '').toLowerCase();
    const fromW = (t.fromWarehouseName || (t as any).from_warehouse_name || '').toLowerCase();
    const toW = (t.toWarehouseName || (t as any).to_warehouse_name || '').toLowerCase();
    const rsn = (t.reason || '').toLowerCase();
    return tNo.includes(term) || fromW.includes(term) || toW.includes(term) || rsn.includes(term);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFromWh || !selectedToWh || !selectedItem) return;

    addStockTransfer({
      transferDate: new Date().toISOString().split('T')[0],
      fromWarehouseId: selectedFromWh.id,
      fromWarehouseName: selectedFromWh.warehouseName,
      fromLocationCode: fromLoc,
      toWarehouseId: selectedToWh.id,
      toWarehouseName: selectedToWh.warehouseName,
      toLocationCode: toLoc,
      reason,
      requestedBy: 'Bhavin Shah (Production Manager)',
      approvedBy: 'Hitesh Rawal (Store Head)',
      status: 'Completed',
      items: [
        {
          id: `trn-item-${Date.now().toString().slice(-4)}`,
          transferId: '',
          itemId: selectedItem.id,
          itemCode: selectedItem.itemCode,
          itemName: selectedItem.itemName,
          quantity: qty,
          uom: selectedItem.uom,
          batchLot: 'HEAT-98421',
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
            <span className="px-2.5 py-0.5 rounded-md bg-crm-brand-600/20 text-indigo-400 border border-crm-brand-600/30 text-xs font-mono font-semibold">
              LOCATION MOVEMENT
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Stock Transfer Manager</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Inter-warehouse & bin-to-bin stock transfer orders with double-entry stock ledger journal updates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-crm-brand-700 text-white text-xs font-bold shadow-lg shadow-crm-brand-700/30 hover:bg-crm-brand-600 transition"
        >
          <Plus className="w-4 h-4" />
          Create Stock Transfer
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search transfer no, warehouse, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-crm-brand-600"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Total Transfers: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Transfer No & Date</th>
                <th className="p-3.5">From Warehouse / Bin</th>
                <th className="p-3.5 text-center">Movement</th>
                <th className="p-3.5">To Warehouse / Bin</th>
                <th className="p-3.5">Reason & Purpose</th>
                <th className="p-3.5">Requested By</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((t) => {
                const trnNo = t.transferNumber || (t as any).transfer_number || t.id;
                const trnDate = t.transferDate || (t as any).transfer_date || new Date().toISOString().split('T')[0];
                const fromW = t.fromWarehouseName || (t as any).from_warehouse_name || 'Main Raw Material & Plate Yard';
                const fromL = t.fromLocationCode || (t as any).from_location_code || 'W1-ZA-R1-S1-B01';
                const toW = t.toWarehouseName || (t as any).to_warehouse_name || 'Scrap & Offcut Yard';
                const toL = t.toLocationCode || (t as any).to_location_code || 'W5-ZS-B1-F1-S01';
                const rsn = t.reason || 'Location Movement';
                const reqBy = t.requestedBy || (t as any).requested_by || 'Bhavin Shah (Production Manager)';
                const st = t.status || 'Completed';

                return (
                  <tr key={t.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="p-3.5 font-medium">
                      <div className="font-bold text-indigo-400 text-xs font-mono">{trnNo}</div>
                      <div className="text-[10px] text-[#70665F] mt-0.5">{trnDate}</div>
                    </td>
                    <td className="p-3.5 text-[#544B45]">
                      <div className="font-bold text-[#211B17]">{fromW}</div>
                      <div className="text-[10px] font-mono text-teal-400 mt-0.5">{fromL}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <ArrowRight className="w-4 h-4 text-indigo-400 mx-auto" />
                    </td>
                    <td className="p-3.5 text-[#544B45]">
                      <div className="font-bold text-[#211B17]">{toW}</div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-0.5">{toL}</div>
                    </td>
                    <td className="p-3.5 text-[#544B45] text-xs max-w-[200px] truncate">{rsn}</td>
                    <td className="p-3.5 font-semibold text-[#544B45]">{reqBy}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {st}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
                <Workflow className="w-5 h-5 text-indigo-400" />
                Inter-Warehouse Stock Transfer
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">From Warehouse *</label>
                  <select
                    value={fromWhId}
                    onChange={(e) => setFromWhId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    {effectiveWarehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">To Warehouse *</label>
                  <select
                    value={toWhId}
                    onChange={(e) => setToWhId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    {effectiveWarehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Source Bin Code</label>
                  <input
                    type="text"
                    value={fromLoc}
                    onChange={(e) => setFromLoc(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Destination Bin Code</label>
                  <input
                    type="text"
                    value={toLoc}
                    onChange={(e) => setToLoc(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Item to Transfer *</label>
                  <select
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    {effectiveItems.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.itemCode} - {i.itemName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Quantity ({selectedItem?.uom || 'Kg'})</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-indigo-400 font-bold focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Transfer Reason</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
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
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 text-white hover:bg-crm-brand-600 text-xs font-semibold shadow-lg shadow-crm-brand-700/30"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
