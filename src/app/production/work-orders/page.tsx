'use client';

import React, { useState, useEffect } from 'react';
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
  X,
} from 'lucide-react';
import { WorkOrder } from '../../../types/production';

export default function WorkOrdersPage() {
  const { workOrders, manufacturingJobs, addWorkOrder, releaseWorkOrder, openJobModal } = useERP();

  const [selectedWoForPrint, setSelectedWoForPrint] = useState<WorkOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [jobNumber, setJobNumber] = useState(manufacturingJobs[0]?.jobNumber || '');
  const [productName, setProductName] = useState(manufacturingJobs[0]?.productName || '');
  const [qty, setQty] = useState(1);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedWoForPrint) setSelectedWoForPrint(null);
        if (showCreateModal) setShowCreateModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWoForPrint, showCreateModal]);

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

  const filteredWorkOrders = (workOrders || []).filter((wo) => {
    const q = searchTerm?.trim()?.toLowerCase() || '';
    return (
      !q ||
      wo.workOrderNumber?.toLowerCase().includes(q) ||
      wo.jobNumber?.toLowerCase().includes(q) ||
      wo.customerName?.toLowerCase().includes(q) ||
      wo.productName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Work Orders Manager
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-800 font-semibold border border-orange-500/30">
                Shop Floor Authorization
              </span>
            </h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Official Production Cards Generated from Approved BOM & Design Revisions
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 font-bold text-white text-xs shadow-lg hover:brightness-110 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Generate New Work Order
        </button>
      </div>

      {/* Control / Search Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs print:hidden">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search by WO #, Job #, Customer or Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Total Work Orders: <strong className="text-[#211B17] font-bold">{filteredWorkOrders.length}</strong>
        </div>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredWorkOrders.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-[#EBE3DB] text-[#70665F] space-y-3 shadow-xs">
            <ClipboardList className="w-10 h-10 text-[#A89F91] mx-auto" />
            <p className="font-semibold text-sm text-[#211B17]">No work orders found</p>
            <p className="text-xs text-[#70665F]">Click &quot;Generate New Work Order&quot; to authorize jobs for fabrication.</p>
          </div>
        ) : (
          filteredWorkOrders.map((wo) => (
            <div
              key={wo.id}
              className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-orange-500/50 transition space-y-4 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-orange-700 text-base">{wo.workOrderNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono text-[10px] font-bold">
                        {wo.jobNumber}
                      </span>
                    </div>
                    <div className="text-xs text-[#70665F] flex items-center gap-1 mt-1">
                      <Building className="w-3.5 h-3.5 text-[#70665F]" /> {wo.customerName}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      wo.status === 'Released' || wo.status === 'In Progress'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : wo.status === 'Completed'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}
                  >
                    {wo.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#211B17]">{wo.productName}</div>
                  <div className="text-xs text-[#70665F]">
                    Quantity: <span className="font-bold text-[#211B17]">{wo.productionQuantity} {wo.uom}</span>
                  </div>
                </div>

                {/* Revisions & Dates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-xs">
                  <div>
                    <span className="text-[#70665F] block text-[10px]">Design Rev</span>
                    <span className="font-mono font-bold text-amber-700">{wo.designRevision}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[10px]">BOM Rev</span>
                    <span className="font-mono font-bold text-emerald-700">{wo.bomRevision}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[10px]">Planned End</span>
                    <span className="text-[#211B17] font-mono text-[11px] font-medium">{wo.plannedEndDate}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[10px]">Priority</span>
                    <span className={`font-bold capitalize ${
                      wo.priority === 'High' || wo.priority === 'Urgent' ? 'text-rose-600' : 'text-amber-700'
                    }`}>
                      {wo.priority}
                    </span>
                  </div>
                </div>

                {wo.remarks && (
                  <div className="text-xs text-[#70665F] italic bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#EBE3DB]">
                    &quot;{wo.remarks}&quot;
                  </div>
                )}
              </div>

              {/* Action Buttons with High-Contrast Text and Spacious Layout */}
              <div className="pt-3 border-t border-[#EBE3DB] flex flex-wrap items-center justify-between gap-2.5 mt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {wo.status !== 'Released' && wo.status !== 'Completed' && (
                    <button
                      onClick={() => releaseWorkOrder(wo.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <PlayCircle className="w-4 h-4 text-emerald-100 shrink-0" />
                      <span>Release to Floor</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedWoForPrint(wo)}
                    className="px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-white text-[#211B17] font-semibold text-xs border border-[#EBE3DB] transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Print WO Card</span>
                  </button>
                </div>

                <button
                  onClick={() => openJobModal(wo.jobNumber)}
                  className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5 text-sky-600" />
                  <span>360° Trace</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Print Work Order Card Modal */}
      {selectedWoForPrint && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedWoForPrint(null)}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl text-[#544B45] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-[#211B17]">Work Order Card Preview</h3>
              </div>
              <button
                onClick={() => setSelectedWoForPrint(null)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official WO Printable Template */}
            <div className="p-6 rounded-xl bg-[#FAF7F2] text-slate-900 font-sans space-y-4 border border-[#EBE3DB]">
              <div className="flex justify-between items-start border-b-2 border-[#CBD5E1] pb-3">
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
                  <span className="text-[#70665F] block font-semibold text-[10px] uppercase">Customer</span>
                  <span className="font-bold text-slate-900">{selectedWoForPrint.customerName}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block font-semibold text-[10px] uppercase">Sales Order</span>
                  <span className="font-bold font-mono">{selectedWoForPrint.salesOrderNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block font-semibold text-[10px] uppercase">Approved Design Revision</span>
                  <span className="font-bold font-mono text-amber-700">{selectedWoForPrint.designRevision}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block font-semibold text-[10px] uppercase">Approved BOM Revision</span>
                  <span className="font-bold font-mono text-emerald-700">{selectedWoForPrint.bomRevision}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                <span className="text-[10px] uppercase font-bold text-[#70665F] block">Product Specification</span>
                <span className="font-bold text-slate-900 text-sm">{selectedWoForPrint.productName}</span>
                <div className="text-xs text-slate-700 mt-1">Quantity: {selectedWoForPrint.productionQuantity} {selectedWoForPrint.uom}</div>
              </div>

              {/* Operations Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">Shop Floor Route Operations Sequence</h4>
                <table className="w-full text-left text-[11px] border-collapse border border-slate-300 bg-white">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
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

            <div className="flex justify-end gap-3 pt-2 print:hidden">
              <button
                onClick={() => setSelectedWoForPrint(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] text-xs font-semibold hover:bg-white transition"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-orange-700 text-white font-bold text-xs hover:bg-orange-600 shadow-lg flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" /> Print Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Work Order Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-[#544B45] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17]">Generate Work Order Card</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Select Job</label>
                <select
                  value={jobNumber}
                  onChange={(e) => setJobNumber(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-orange-500 font-medium"
                >
                  {manufacturingJobs.map((j) => (
                    <option key={j.id} value={j.jobNumber}>
                      {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Product Description</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-orange-500"
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
                  <label className="block font-semibold text-[#544B45] mb-1">Planned Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Planned Completion</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] font-semibold hover:bg-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-700 font-bold text-white hover:bg-orange-600 shadow-lg transition"
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
