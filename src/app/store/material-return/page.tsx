'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { MaterialReturn, ReturnCondition } from '../../../types/store';
import { CornerUpLeft, Plus, Search, Cpu, CheckCircle } from 'lucide-react';

export default function MaterialReturnPage() {
  const { materialReturns, addMaterialReturn, projectJobs, itemMasters, warehouses } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [jobId, setJobId] = useState('JOB-2026-001');
  const [woNo, setWoNo] = useState('WO-2026-001-A');
  const [issueNo, setIssueNo] = useState('ISS-2026-0041');
  const [itemId, setItemId] = useState(itemMasters[0]?.id || 'ITEM-001');
  const [returnQty, setReturnQty] = useState(200);
  const [condition, setCondition] = useState<ReturnCondition>('Usable');
  const [returnedBy, setReturnedBy] = useState('Ketan Parmar (Shop Supervisor)');

  const selectedItem = itemMasters.find((i) => i.id === itemId) || itemMasters[0];
  const selectedWh = warehouses[0];
  const selectedJob = projectJobs.find((j) => j.jobNumber === jobId) || projectJobs[0];

  const filtered = materialReturns.filter(
    (r) =>
      r.returnNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      r.jobId?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      r.returnedBy?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedWh) return;

    addMaterialReturn({
      returnDate: new Date().toISOString().split('T')[0],
      projectId: selectedJob?.id || 'PRJ-2026-0001',
      jobId,
      workOrderNumber: woNo,
      materialIssueNumber: issueNo,
      warehouseId: selectedWh.id,
      warehouseName: selectedWh.warehouseName,
      returnedBy,
      receivedBy: 'Hitesh Rawal (Store Head)',
      totalReturnValue: returnQty * selectedItem.standardCost,
      remarks: `Returned ${returnQty} ${selectedItem.uom} offcut piece back to store`,
      items: [
        {
          id: `ret-item-${Date.now().toString().slice(-4)}`,
          returnId: '',
          itemId: selectedItem.id,
          itemCode: selectedItem.itemCode,
          itemName: selectedItem.itemName,
          issuedQuantity: 3200,
          usedQuantity: 3000,
          returnQuantity: returnQty,
          uom: selectedItem.uom,
          condition,
          unitPrice: selectedItem.standardCost,
          totalReturnValue: returnQty * selectedItem.standardCost,
          locationCode: 'W1-ZA-R1-S1-B01',
          remarks: 'Plate offcut marked for nozzle flanges',
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
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold">
              UNUSED MATERIAL RETURN
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Material Return to Store</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Return unconsumed raw materials, offcuts, and reusable bought-outs back into store usable stock matrix.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-600/30 hover:bg-amber-500 transition"
        >
          <Plus className="w-4 h-4" />
          Create Return Slip
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search return no, job no, returned by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Return Slips: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Return Slip No</th>
                <th className="p-3.5">Job No & Issue Slip</th>
                <th className="p-3.5">Returned By</th>
                <th className="p-3.5">Warehouse</th>
                <th className="p-3.5 text-right">Returned Value (₹)</th>
                <th className="p-3.5">Store Receiver</th>
                <th className="p-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3.5 font-medium">
                    <div className="font-bold text-amber-400 text-xs font-mono">{r.returnNumber}</div>
                    <div className="text-[10px] text-[#70665F] mt-0.5">{r.returnDate}</div>
                  </td>
                  <td className="p-3.5 font-mono">
                    <div className="font-bold text-sky-400 text-xs flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-sky-500" />
                      {r.jobId}
                    </div>
                    <div className="text-[10px] text-[#70665F] mt-0.5">Issue: {r.materialIssueNumber}</div>
                  </td>
                  <td className="p-3.5 font-semibold text-[#211B17]">{r.returnedBy}</td>
                  <td className="p-3.5 text-[#544B45]">{r.warehouseName}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                    ₹{r.totalReturnValue?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-[#544B45]">{r.receivedBy}</td>
                  <td className="p-3.5 text-[#70665F] text-xs truncate max-w-[200px]">{r.remarks}</td>
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
                <CornerUpLeft className="w-5 h-5 text-amber-400" />
                Return Material to Store
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Job Number *</label>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {projectJobs.map((j) => (
                      <option key={j.id} value={j.jobNumber}>
                        {j.jobNumber} - {j.productName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Material Issue Slip</label>
                  <input
                    type="text"
                    value={issueNo}
                    onChange={(e) => setIssueNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Select Item</label>
                  <select
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  >
                    {itemMasters.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.itemCode} - {i.itemName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Return Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ReturnCondition)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  >
                    <option value="Usable">Usable (Stock Inward)</option>
                    <option value="Reusable">Reusable Offcut</option>
                    <option value="Damaged">Damaged (Adjust)</option>
                    <option value="Scrap">Scrap Yard Move</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Return Quantity ({selectedItem?.uom})</label>
                  <input
                    type="number"
                    value={returnQty}
                    onChange={(e) => setReturnQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Returned By</label>
                  <input
                    type="text"
                    value={returnedBy}
                    onChange={(e) => setReturnedBy(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
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
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-500 text-xs font-semibold shadow-lg shadow-amber-600/30"
                >
                  Confirm Material Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
