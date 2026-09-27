'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { PauseCircle, Plus, PlayCircle, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import { ProductionHoldReason } from '../../../types/production';

export default function ProductionHoldPage() {
  const { productionHolds, workOrders, addProductionHold, resumeProductionHold } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [selectedWo, setSelectedWo] = useState('WO-2026-001-A');
  const [reason, setReason] = useState<ProductionHoldReason>('Material Shortage');
  const [desc, setDesc] = useState('Awaiting special alloy 90-degree elbows from supplier.');
  const [resumeDate, setResumeDate] = useState('2026-10-05');

  const handleHoldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wo = workOrders.find((w) => w.workOrderNumber === selectedWo);

    addProductionHold({
      jobId: wo?.jobId || 'PRJ-2026-0001',
      jobNumber: wo?.jobNumber || 'JOB-2026-001',
      workOrderNumber: selectedWo,
      operationName: 'Fitting & Assembly',
      reason,
      description: desc,
      startDate: new Date().toISOString().split('T')[0],
      expectedResumeDate: resumeDate,
      approvedBy: 'Bhavin Shah (Senior Production Manager)',
      status: 'Active Hold',
    });

    setShowModal(false);
    alert(`Production Hold HLD-2026 placed on ${selectedWo}!`);
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <PauseCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Production Hold Manager
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium border border-red-500/30">
                Stop / Resume Control
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Manage Authorized Work Order Halts Due to Material Shortages, Design Revisions or Quality Holds
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 font-bold text-[#211B17] text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Place Work Order On Hold
        </button>
      </div>

      {/* Production Holds Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Hold #</th>
                <th className="p-3">Job & WO #</th>
                <th className="p-3">Operation Step</th>
                <th className="p-3">Hold Reason</th>
                <th className="p-3">Description</th>
                <th className="p-3">Hold Start</th>
                <th className="p-3">Expected Resume</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {productionHolds.map((hld) => (
                <tr key={hld.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-red-400">{hld.holdNumber}</td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-sky-400">{hld.jobNumber}</div>
                    <div className="font-mono text-indigo-300 text-[11px]">{hld.workOrderNumber}</div>
                  </td>
                  <td className="p-3 font-semibold text-[#211B17]">{hld.operationName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                      {hld.reason}
                    </span>
                  </td>
                  <td className="p-3 text-[#544B45] max-w-xs truncate">{hld.description}</td>
                  <td className="p-3 text-[#70665F]">{hld.startDate}</td>
                  <td className="p-3 text-amber-300 font-medium">{hld.expectedResumeDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        hld.status === 'Active Hold'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {hld.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {hld.status === 'Active Hold' && (
                      <button
                        onClick={() => {
                          resumeProductionHold(hld.id, new Date().toISOString().split('T')[0]);
                          alert(`Production Hold ${hld.holdNumber} resumed! Work order unblocked.`);
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> Resume Production
                      </button>
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
              <h3 className="text-base font-bold text-[#211B17]">Place Work Order On Hold</h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleHoldSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Target Work Order</label>
                <select
                  value={selectedWo}
                  onChange={(e) => setSelectedWo(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-red-500"
                >
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.workOrderNumber}>
                      {w.workOrderNumber} — {w.jobNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Hold Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-red-500"
                >
                  <option value="Material Shortage">Material Shortage</option>
                  <option value="Design Change">Design Change</option>
                  <option value="Customer Change">Customer Change</option>
                  <option value="Machine Breakdown">Machine Breakdown</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Manpower Issue">Manpower Issue</option>
                  <option value="Supplier Delay">Supplier Delay</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Hold Description & Justification</label>
                <textarea
                  required
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Expected Resume Date</label>
                <input
                  type="date"
                  value={resumeDate}
                  onChange={(e) => setResumeDate(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-red-500"
                />
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
                  className="px-4 py-2 rounded-xl bg-red-600 font-bold text-white hover:bg-red-500 shadow-lg"
                >
                  Apply Production Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
