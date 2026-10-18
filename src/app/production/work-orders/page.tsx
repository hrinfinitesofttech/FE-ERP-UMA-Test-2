'use client';

import React, { useState, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
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

  const columns: ERPColumn<WorkOrder>[] = [
    {
      key: 'workOrderNumber',
      header: 'WO NUMBER',
      isCodeLink: true,
      onCodeClick: (wo) => setSelectedWoForPrint(wo),
    },
    {
      key: 'jobNumber',
      header: 'PROJECT # & CUSTOMER',
      cell: (wo) => (
        <div>
          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono text-[11px] font-bold">
            {wo.projectId || wo.jobNumber}
          </span>
          <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[150px]">{wo.customerName || 'Standard Client'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'productName',
      header: 'PRODUCT & QUANTITY',
      cell: (wo) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{wo.productName}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Qty: <span className="font-bold text-slate-800">{wo.productionQuantity}</span> {wo.uom}
          </div>
        </div>
      ),
    },
    {
      key: 'revisions',
      header: 'REVISIONS',
      cell: (wo) => (
        <div className="text-[11px] font-mono space-y-0.5">
          <div className="text-amber-700 font-semibold">Design: {wo.designRevision || 'REV-01'}</div>
          <div className="text-emerald-700 font-semibold">BOM: {wo.bomRevision || 'Rev-01'}</div>
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'SCHEDULE DATES',
      cell: (wo) => (
        <div className="text-[11px] font-mono text-slate-600 space-y-0.5">
          <div>Start: {wo.plannedStartDate || '-'}</div>
          <div>End: <span className="font-bold text-slate-800">{wo.plannedEndDate || '-'}</span></div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'PRIORITY',
      cell: (wo) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            wo.priority === 'High' || wo.priority === 'Urgent'
              ? 'bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}
        >
          {wo.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (wo) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            wo.status === 'Released' || wo.status === 'In Progress'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : wo.status === 'Completed'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {wo.status}
        </span>
      ),
    },
    {
      key: 'operations',
      header: 'ACTIONS',
      cell: (wo) => (
        <div className="flex items-center gap-1.5">
          {wo.status !== 'Released' && wo.status !== 'Completed' && (
            <button
              onClick={() => releaseWorkOrder(wo.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
              title="Release to Shop Floor"
            >
              <PlayCircle className="w-3.5 h-3.5" /> Release
            </button>
          )}
          <button
            onClick={() => setSelectedWoForPrint(wo)}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] border border-slate-200 transition flex items-center gap-1 cursor-pointer"
            title="Print WO Card"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" /> Print
          </button>
          <button
            onClick={() => openJobModal(wo.jobNumber)}
            className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] border border-sky-200 transition flex items-center gap-1 cursor-pointer"
            title="360° Trace"
          >
            <Search className="w-3 h-3 text-sky-600" /> Trace
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ERPListPageLayout<WorkOrder>
        breadcrumbs={['DASHBOARD', 'PRODUCTION & SHOP FLOOR', 'WORK ORDERS']}
        title="Work Orders Manager"
        columns={columns}
        data={filteredWorkOrders}
        searchPlaceholder="Search by WO #, Project #, Customer or Product..."
        addNewLabel="Generate New Work Order"
        onAddNew={() => setShowCreateModal(true)}
        onExport={() => {
          const csv = [
            'WO Number,Job Number,Customer,Product,Quantity,UOM,Design Rev,BOM Rev,Planned Start,Planned End,Priority,Status',
            ...filteredWorkOrders.map(
              wo => `"${wo.workOrderNumber}","${wo.jobNumber}","${wo.customerName || ''}","${wo.productName}","${wo.productionQuantity}","${wo.uom}","${wo.designRevision || ''}","${wo.bomRevision || ''}","${wo.plannedStartDate}","${wo.plannedEndDate}","${wo.priority}","${wo.status}"`
            )
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `work_orders_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        }}
      />

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
