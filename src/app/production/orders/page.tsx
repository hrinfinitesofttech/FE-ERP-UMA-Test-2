'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { FileText, Plus, CheckCircle2, Clock, PlayCircle, Layers, Search, ChevronRight } from 'lucide-react';

export default function ProductionOrdersPage() {
  const { productionOrders, workOrders, addProductionOrder, openJobModal } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [workOrderNumber, setWorkOrderNumber] = useState('WO-2026-001-A');
  const [qty, setQty] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-10-15');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const wo = workOrders.find((w) => w.workOrderNumber === workOrderNumber);

    addProductionOrder({
      workOrderId: wo?.id || 'WO-2026-001-A',
      workOrderNumber,
      jobId: wo?.jobId || 'PRJ-2026-0001',
      jobNumber: wo?.jobNumber || 'JOB-2026-001',
      productName: wo?.productName || 'Heavy SS 316L Chemical Reactor Vessel (10 KL)',
      quantity: qty,
      bomRevision: wo?.bomRevision || 'Rev-01',
      designRevision: wo?.designRevision || 'REV-01',
      plannedStartDate: startDate,
      plannedEndDate: endDate,
      productionManager: 'Bhavin Shah (Senior Production Manager)',
      status: 'In Progress',
    });

    setShowModal(false);
    alert('Production Order created successfully!');
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Production Orders Manager
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                Shop Floor Execution Units
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Detailed Manufacturing Dispatch Directives derived from Work Orders
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-[#211B17] text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Issue Production Order
        </button>
      </div>

      {/* Production Orders Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Production Order #</th>
                <th className="p-3">Work Order #</th>
                <th className="p-3">Job Number</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Design / BOM Rev</th>
                <th className="p-3">Planned Dates</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {productionOrders.map((po) => (
                <tr key={po.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-emerald-400">{po.productionOrderNumber}</td>
                  <td className="p-3 font-mono text-indigo-300">{po.workOrderNumber}</td>
                  <td className="p-3 font-mono text-sky-300">{po.jobNumber}</td>
                  <td className="p-3 font-medium text-[#211B17] max-w-xs truncate">{po.productName}</td>
                  <td className="p-3 font-bold text-[#544B45]">{po.quantity}</td>
                  <td className="p-3 text-[#70665F]">
                    <span className="font-mono text-amber-300">{po.designRevision}</span> /{' '}
                    <span className="font-mono text-emerald-300">{po.bomRevision}</span>
                  </td>
                  <td className="p-3 text-[#544B45]">
                    {po.plannedStartDate} → {po.plannedEndDate}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        po.status === 'In Progress'
                          ? 'bg-crm-brand-600/20 text-crm-brand- border-crm-brand-600/30'
                          : po.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openJobModal(po.jobNumber)}
                      className="px-2.5 py-1 rounded bg-crm-brand-700/20 text-crm-brand- hover:bg-crm-brand-700/30 border border-crm-brand-600/30 text-[11px] font-bold transition"
                    >
                      360° Trace
                    </button>
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
              <h3 className="text-base font-bold text-[#211B17]">Issue Production Order</h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Select Work Order</label>
                <select
                  value={workOrderNumber}
                  onChange={(e) => setWorkOrderNumber(e.target.value)}
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
                <label className="block font-semibold text-[#544B45] mb-1">Quantity</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Completion Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
                  Issue Production Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
