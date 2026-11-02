'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { RotateCcw, Plus, AlertTriangle, CheckCircle2, Clock, Wrench, X } from 'lucide-react';
import { toast } from '../../../context/ToastContext';

export default function ReworkOrderPage() {
  const { reworkOrders, workOrders, availableEmployees, addReworkOrder, isInitialLoading } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [selectedWo, setSelectedWo] = useState(workOrders[0]?.workOrderNumber || '');
  const [componentName, setComponentName] = useState('Heavy Shell Course Assembly');
  const [reason, setReason] = useState<'Welding Defect' | 'Dimension Error' | 'Assembly Error' | 'Quality Failure'>('Welding Defect');
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('Gouge out root defect and re-weld using E-7018 low hydrogen electrode under NDT supervision.');
  const [operator, setOperator] = useState(availableEmployees[0]?.name || '');

  const handleAddRework = (e: React.FormEvent) => {
    e.preventDefault();
    const wo = workOrders.find((w) => w.workOrderNumber === selectedWo);

    addReworkOrder({
      jobId: wo?.jobId || 'PRJ-2026-0001',
      jobNumber: wo?.jobNumber || '',
      workOrderNumber: selectedWo,
      productionEntryNumber: `PENTRY-${Date.now().toString().slice(-4)}`,
      operationName: 'Main Shell SAW Welding',
      itemCode: 'COMP-SHELL-01',
      itemName: componentName,
      quantity: Number(qty) || 1,
      uom: 'Set',
      reason,
      responsibleDepartment: 'Welding & NDT Section',
      reworkInstructions: instructions,
      assignedOperator: operator,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Open',
    });

    setShowModal(false);
    toast.success('Rework Order created and saved to Database successfully!');
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A] text-[color:var(--crm-text-secondary)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--crm-text-primary)] tracking-tight flex items-center gap-2">
              Rework Order Manager
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                Quality Defect Correction
              </span>
            </h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)]">
              Track Rework Instructions, Assigned Technicians & Corrective Actions for NDT/QC Failures
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (workOrders.length > 0 && !selectedWo) setSelectedWo(workOrders[0].workOrderNumber);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-crm-brand-700 to-crm-brand-700 font-bold text-white text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Issue Rework Order
        </button>
      </div>

      {/* Rework Orders Table */}
      <div className="p-5 rounded-2xl bg-white border border-[color:var(--crm-border-default)] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] font-semibold uppercase text-[10px] tracking-wider border-b border-[color:var(--crm-border-default)]">
              <tr>
                <th className="p-3">Rework #</th>
                <th className="p-3">Job & WO #</th>
                <th className="p-3">Component / Item</th>
                <th className="p-3">Defect Reason</th>
                <th className="p-3">Instructions</th>
                <th className="p-3">Assigned Technician</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)]">
              {isInitialLoading && reworkOrders.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`shimmer-rework-${i}`} className="border-b border-[color:var(--crm-border-default)]">
                    <td className="p-3"><div className="h-4 w-24 rounded animate-shimmer" /></td>
                    <td className="p-3 space-y-1">
                      <div className="h-3.5 w-20 rounded animate-shimmer" />
                      <div className="h-3 w-16 rounded animate-shimmer" />
                    </td>
                    <td className="p-3"><div className="h-4 w-36 rounded animate-shimmer" /></td>
                    <td className="p-3"><div className="h-5 w-24 rounded-full animate-shimmer" /></td>
                    <td className="p-3"><div className="h-3.5 w-48 rounded animate-shimmer" /></td>
                    <td className="p-3"><div className="h-4 w-28 rounded animate-shimmer" /></td>
                    <td className="p-3"><div className="h-5 w-16 rounded-full animate-shimmer" /></td>
                  </tr>
                ))
              ) : reworkOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[color:var(--crm-text-secondary)]">
                    No rework orders found in database. Click &quot;Issue Rework Order&quot; to log defect corrections.
                  </td>
                </tr>
              ) : (
                reworkOrders.map((rwk) => (
                  <tr key={rwk.id} className="hover:bg-[#F4F6FA]/40 transition">
                    <td className="p-3 font-mono font-bold text-amber-600">{rwk.reworkNumber}</td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-sky-600">{rwk.jobNumber}</div>
                      <div className="font-mono text-indigo-600 text-[11px]">{rwk.workOrderNumber}</div>
                    </td>
                    <td className="p-3 font-semibold text-[color:var(--crm-text-primary)] max-w-xs">{rwk.itemName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-700 text-[10px] font-bold border border-rose-500/30">
                        {rwk.reason}
                      </span>
                    </td>
                    <td className="p-3 text-[color:var(--crm-text-secondary)] max-w-xs truncate">{rwk.reworkInstructions}</td>
                    <td className="p-3 font-medium text-[color:var(--crm-text-secondary)]">{rwk.assignedOperator}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          rwk.status === 'Completed' || rwk.status === 'Closed'
                            ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-700 border-amber-500/30'
                        }`}
                      >
                        {rwk.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[color:var(--crm-text-secondary)]">
            <div className="flex justify-between items-center border-b border-[color:var(--crm-border-default)] pb-3">
              <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">Issue Rework Order</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] hover:bg-[color:var(--crm-bg-app)] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRework} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[color:var(--crm-text-secondary)] mb-1">Target Work Order</label>
                <select
                  value={selectedWo}
                  onChange={(e) => setSelectedWo(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-secondary)] focus:outline-none focus:border-amber-500"
                >
                  {workOrders.map((w) => (
                    <option key={w.id || w.workOrderNumber} value={w.workOrderNumber}>
                      {w.workOrderNumber} — {w.jobNumber}
                    </option>
                  ))}
                  {workOrders.length === 0 && (
                    <option value="">Select Work Order</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[color:var(--crm-text-secondary)] mb-1">Component / Assembly Name</label>
                <input
                  type="text"
                  required
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-secondary)] focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[color:var(--crm-text-secondary)] mb-1">Defect Category</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as any)}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-secondary)] focus:outline-none focus:border-amber-500"
                  >
                    <option value="Welding Defect">Welding Defect</option>
                    <option value="Dimension Error">Dimension Error</option>
                    <option value="Assembly Error">Assembly Error</option>
                    <option value="Quality Failure">Quality Failure</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[color:var(--crm-text-secondary)] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-secondary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[color:var(--crm-text-secondary)] mb-1">Rework Instructions</label>
                <textarea
                  required
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-secondary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[color:var(--crm-text-secondary)] mb-1">Assigned Technician</label>
                <input
                  type="text"
                  required
                  list="reworkTechSuggestions"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-secondary)] focus:outline-none focus:border-amber-500"
                />
                <datalist id="reworkTechSuggestions">
                  {(availableEmployees || []).map((emp) => (
                    <option key={emp.id} value={emp.name} />
                  ))}
                  <option value="Suresh Patel" />
                  <option value="Mahesh Bariya" />
                </datalist>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 font-bold text-white hover:bg-amber-500 shadow-lg"
                >
                  Issue Rework Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
