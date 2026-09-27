'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { CheckCircle2, ShieldCheck, PackageCheck, AlertCircle, Plus, ChevronRight } from 'lucide-react';

export default function WorkOrderCompletionPage() {
  const { workOrders, completeWorkOrder, addFinishedGoods, openJobModal } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [selectedWo, setSelectedWo] = useState('WO-2026-001-A');
  const [completedQty, setCompletedQty] = useState(1);
  const [completedBy, setCompletedBy] = useState('Bhavin Shah (Production Manager)');

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wo = workOrders.find((w) => w.workOrderNumber === selectedWo);

    completeWorkOrder({
      completionDate: new Date().toISOString().split('T')[0],
      jobId: wo?.jobId || 'PRJ-2026-0001',
      jobNumber: wo?.jobNumber || 'JOB-2026-001',
      workOrderNumber: selectedWo,
      productName: wo?.productName || 'Heavy SS 316L Chemical Reactor Vessel (10 KL)',
      completedQuantity: completedQty,
      rejectedQuantity: 0,
      reworkQuantity: 0,
      scrapQuantity: 0,
      completedBy,
      qcStatus: 'Passed',
      remarks: 'Production completed & final hydrostatic pressure test cleared.',
    });

    // Automatically add to Finished Goods Warehouse
    addFinishedGoods({
      jobId: wo?.jobId || 'PRJ-2026-0001',
      jobNumber: wo?.jobNumber || 'JOB-2026-001',
      workOrderNumber: selectedWo,
      productionOrderNumber: 'PO-PROD-2026-001',
      productName: wo?.productName || 'Heavy SS 316L Chemical Reactor Vessel (10 KL)',
      specification: 'Completed Vessel Assembly with Limpet Jacket',
      quantity: completedQty,
      uom: wo?.uom || 'Unit',
      warehouseId: 'WH-FG-01',
      warehouseName: 'Finished Goods Bay 4 (Dispatch Gate)',
      locationBin: 'Bin-FG-01',
      completionDate: new Date().toISOString().split('T')[0],
      qcStatus: 'QC Passed',
      status: 'Ready for Dispatch',
    });

    setShowModal(false);
    alert(`Work Order ${selectedWo} completed & transferred to Finished Goods Warehouse!`);
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Work Order Completion & Clearance
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                QC & Finished Goods Handover
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Final Manufacturing Sign-Off, Quality Inspection Clearance & Finished Goods Warehouse Transfer
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-[#211B17] text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Sign-Off Work Order Completion
        </button>
      </div>

      {/* Work Orders Handover Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Work Order #</th>
                <th className="p-3">Job Number</th>
                <th className="p-3">Product Name</th>
                <th className="p-3 text-right">Production Qty</th>
                <th className="p-3">Planned Completion</th>
                <th className="p-3">Production Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-indigo-400">{wo.workOrderNumber}</td>
                  <td className="p-3 font-mono text-sky-300">{wo.jobNumber}</td>
                  <td className="p-3 font-semibold text-[#211B17] max-w-xs">{wo.productName}</td>
                  <td className="p-3 text-right font-bold text-[#544B45]">
                    {wo.productionQuantity} {wo.uom}
                  </td>
                  <td className="p-3 text-[#544B45]">{wo.plannedEndDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        wo.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-crm-brand-600/20 text-crm-brand- border-crm-brand-600/30'
                      }`}
                    >
                      {wo.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {wo.status !== 'Completed' ? (
                      <button
                        onClick={() => {
                          setSelectedWo(wo.workOrderNumber);
                          setShowModal(true);
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sign-Off & Transfer
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[11px] font-bold">Transferred to FG</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#544B45]">
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17]">Work Order Completion Clearance</h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Select Work Order</label>
                <select
                  value={selectedWo}
                  onChange={(e) => setSelectedWo(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                >
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.workOrderNumber}>
                      {w.workOrderNumber} — {w.jobNumber} ({w.productName.slice(0, 20)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Completed Quantity</label>
                <input
                  type="number"
                  value={completedQty}
                  onChange={(e) => setCompletedQty(Number(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Signed Off By (Production Manager)</label>
                <input
                  type="text"
                  required
                  value={completedBy}
                  onChange={(e) => setCompletedBy(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                ✓ Completing this Work Order will mark the Production Step in Job 360° Traceability as COMPLETED and automatically post this machine into the Finished Goods Warehouse.
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] font-medium hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500 shadow-lg"
                >
                  Authorize FG Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
