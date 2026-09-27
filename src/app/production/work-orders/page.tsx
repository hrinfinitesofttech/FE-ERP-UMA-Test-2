'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  ClipboardList,
  Plus,
  PlayCircle,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Wrench,
  Search,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { WorkOrder } from '../../../types/production';

export default function WorkOrdersPage() {
  const { workOrders, manufacturingJobs, addWorkOrder, releaseWorkOrder, openJobModal } = useERP();

  const [selectedWoForPrint, setSelectedWoForPrint] = useState<WorkOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [jobNumber, setJobNumber] = useState(manufacturingJobs[0]?.jobNumber || '');
  const [productName, setProductName] = useState(manufacturingJobs[0]?.productName || '');
  const [qty, setQty] = useState(1);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const handleCreateWo = (e: React.FormEvent) => {
    e.preventDefault();
    const targetJob = manufacturingJobs.find((j) => j.jobNumber === jobNumber);

    addWorkOrder({
      jobId: targetJob?.projectId || targetJob?.id || '',
      jobNumber: jobNumber || targetJob?.jobNumber || '',
      projectId: targetJob?.projectId || targetJob?.id || '',
      customerId: targetJob?.customerId || '',
      customerName: targetJob?.customerName || '',
      salesOrderNumber: targetJob?.salesOrderNumber || '',
      designRevision: targetJob?.designRevision || 'REV-01',
      bomRevision: targetJob?.bomRevision || 'Rev-01',
      productName: productName || targetJob?.productName || '',
      productionQuantity: qty,
      uom: 'Unit',
      plannedStartDate: startDate,
      plannedEndDate: endDate || startDate,
      productionManager: targetJob?.projectManager || 'Production Manager',
      priority,
      status: 'Planned',
      remarks: 'Created via Work Order Manager',
    });

    setShowCreateModal(false);
    alert('Work Order created successfully!');
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Work Orders Manager
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                Shop Floor Authorization
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Official Production Cards Generated from Approved BOM & Design Revisions
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Generate New Work Order
        </button>
      </div>

      {/* Work Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workOrders.map((wo) => (
          <div
            key={wo.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400 text-base">{wo.workOrderNumber}</span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">
                    {wo.jobNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" /> {wo.customerName}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    wo.status === 'Released' || wo.status === 'In Progress'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : wo.status === 'Completed'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {wo.status}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-white">{wo.productName}</div>
              <div className="text-xs text-slate-400">
                Quantity: <span className="font-bold text-white">{wo.productionQuantity} {wo.uom}</span>
              </div>
            </div>

            {/* Revisions & Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Design Rev</span>
                <span className="font-mono font-bold text-amber-300">{wo.designRevision}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BOM Rev</span>
                <span className="font-mono font-bold text-emerald-300">{wo.bomRevision}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Planned End</span>
                <span className="text-slate-200">{wo.plannedEndDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Priority</span>
                <span className="font-bold text-rose-400">{wo.priority}</span>
              </div>
            </div>

            {wo.remarks && <div className="text-xs text-slate-400 italic bg-slate-900/50 p-2 rounded">"{wo.remarks}"</div>}

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                {wo.status !== 'Released' && wo.status !== 'Completed' && (
                  <button
                    onClick={() => releaseWorkOrder(wo.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 font-bold border border-emerald-500/30 hover:bg-emerald-600/30 transition text-xs flex items-center gap-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Release to Floor
                  </button>
                )}
                <button
                  onClick={() => setSelectedWoForPrint(wo)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition text-xs flex items-center gap-1 border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-400" /> Print WO Card
                </button>
              </div>

              <button
                onClick={() => openJobModal(wo.jobNumber)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 font-medium text-xs hover:bg-blue-600/30 transition border border-blue-500/30"
              >
                360° Trace
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Print Work Order Card Modal */}
      {selectedWoForPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Work Order Card Preview</h3>
              </div>
              <button onClick={() => setSelectedWoForPrint(null)} className="text-slate-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            {/* Official WO Printable Template */}
            <div className="p-6 rounded-xl bg-white text-slate-900 font-sans space-y-4 shadow-inner">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">UMA TECHNO FAB</h2>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Manufacturing ERP — Shop Floor Route Card</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-indigo-900">{selectedWoForPrint.workOrderNumber}</div>
                  <div className="text-xs text-slate-600 font-mono font-bold">Job: {selectedWoForPrint.jobNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold text-[10px] uppercase">Customer</span>
                  <span className="font-bold text-slate-900">{selectedWoForPrint.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[10px] uppercase">Sales Order</span>
                  <span className="font-bold font-mono">{selectedWoForPrint.salesOrderNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[10px] uppercase">Approved Design Revision</span>
                  <span className="font-bold font-mono text-amber-700">{selectedWoForPrint.designRevision}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[10px] uppercase">Approved BOM Revision</span>
                  <span className="font-bold font-mono text-emerald-700">{selectedWoForPrint.bomRevision}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Product Specification</span>
                <span className="font-bold text-slate-900 text-sm">{selectedWoForPrint.productName}</span>
                <div className="text-xs text-slate-700 mt-1">Quantity: {selectedWoForPrint.productionQuantity} {selectedWoForPrint.uom}</div>
              </div>

              {/* Operations Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">Shop Floor Route Operations Sequence</h4>
                <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                  <thead className="bg-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 border border-slate-300">Seq</th>
                      <th className="p-2 border border-slate-300">Operation Name</th>
                      <th className="p-2 border border-slate-300">Work Center</th>
                      <th className="p-2 border border-slate-300">QC Req</th>
                      <th className="p-2 border border-slate-300">Operator Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-300 font-mono">10</td>
                      <td className="p-2 border border-slate-300">Raw Material Cutting</td>
                      <td className="p-2 border border-slate-300 font-mono">WC-CUT</td>
                      <td className="p-2 border border-slate-300">Yes</td>
                      <td className="p-2 border border-slate-300"></td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-mono">20</td>
                      <td className="p-2 border border-slate-300">Laser Shell Cutting & CNC Bending</td>
                      <td className="p-2 border border-slate-300 font-mono">WC-CNC</td>
                      <td className="p-2 border border-slate-300">Yes</td>
                      <td className="p-2 border border-slate-300"></td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-mono">30</td>
                      <td className="p-2 border border-slate-300">Shell Welding (SAW / TIG)</td>
                      <td className="p-2 border border-slate-300 font-mono">WC-WELD</td>
                      <td className="p-2 border border-slate-300">Yes</td>
                      <td className="p-2 border border-slate-300"></td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-mono">40</td>
                      <td className="p-2 border border-slate-300">Final Fitment & Hydro Test</td>
                      <td className="p-2 border border-slate-300 font-mono">WC-ASSY</td>
                      <td className="p-2 border border-slate-300">Yes</td>
                      <td className="p-2 border border-slate-300"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedWoForPrint(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700">
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Generate Work Order Card</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Job</label>
                <select
                  value={jobNumber}
                  onChange={(e) => setJobNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {manufacturingJobs.map((j) => (
                    <option key={j.id} value={j.jobNumber}>
                      {j.jobNumber} — {j.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Product Description</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Planned Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Planned Completion</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-500 shadow-lg"
                >
                  Generate Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
