'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency } from '../../../lib/utils';
import { WorkOrderStatus } from '../../../types/maintenance';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Package,
  UserCheck,
  X,
  FileText,
} from 'lucide-react';

export default function WorkOrdersPage() {
  const { serviceWorkOrders, addServiceWorkOrder, updateWorkOrderStatus } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    serviceRequestId: '',
    requestNumber: '',
    customerId: '',
    customerName: '',
    customerMachineId: '',
    machineName: '',
    technicianId: '',
    technicianName: '',
    problem: '',
    scopeOfWork: '',
    requiredParts: [] as { itemCode: string; itemName: string; requestedQty: number; rate: number }[],
    labourHours: 0,
    estimatedCost: 0,
    actualCost: 0,
    approvalRequired: false,
    status: 'Pending' as WorkOrderStatus,
  });

  const filteredOrders = serviceWorkOrders.filter((swo) =>

    !searchTerm?.trim() ||

    swo.workOrderNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    swo.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    swo.machineName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    swo.technicianName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceWorkOrder(formData);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-crm-brand- dark:bg-crm-brand-/40 text-crm-brand-800 dark:text-crm-brand- font-mono text-xs font-bold">
              SERVICE WORK ORDERS
            </span>
            <span className="text-xs text-[#70665F]">Formal Job Scope & Cost Estimate Approvals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-crm-brand-600" />
            Service Work Orders
          </h1>
          <p className="text-xs text-[#70665F]">
            Define scope of work, required store spare parts, estimated vs actual labour costs, and manager authorization.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-crm-brand-700/30"
        >
          <Plus className="w-4 h-4" />
          Create Service Work Order
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search work order no, customer, machine or technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Work Order Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((swo) => (
          <div
            key={swo.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-crm-brand- transition"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-[#EBE3DB] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-crm-brand-700 text-white font-mono font-bold text-xs">
                  {swo.workOrderNumber}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1.5">{swo.customerName}</h3>
                <p className="text-xs text-[#70665F]">{swo.machineName} • SR: {swo.requestNumber}</p>
              </div>

              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-crm-brand-600/10 text-crm-brand-700 border border-crm-brand-600/20">
                {swo.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider block">Scope of Work</span>
              <p className="text-xs text-slate-700 dark:text-[#544B45] font-medium">{swo.scopeOfWork}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-[#70665F] bg-slate-50 dark:bg-[#FAF7F2]/30 p-2.5 rounded-xl">
              <div>
                <span className="text-[10px] text-[#70665F] block">Est. Cost</span>
                <span className="font-mono font-bold text-slate-900 dark:text-[#544B45]">{formatCurrency(swo.estimatedCost)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Actual Cost</span>
                <span className="font-mono font-bold text-emerald-600">{formatCurrency(swo.actualCost)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Labour Hours</span>
                <span className="font-bold text-slate-900 dark:text-[#544B45]">{swo.labourHours} Hrs</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-[#544B45]">
                Technician: {swo.technicianName}
              </span>
              <select
                value={swo.status}
                onChange={(e) => updateWorkOrderStatus(swo.id, e.target.value as WorkOrderStatus)}
                className="px-2 py-1 text-xs bg-slate-100 dark:bg-[#FAF7F2] border rounded"
              >
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Parts">Waiting for Parts</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-crm-brand-600" />
                Create Service Work Order
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Machine Name</label>
                  <input
                    type="text"
                    required
                    value={formData.machineName}
                    onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Labour Hours</label>
                  <input
                    type="number"
                    value={formData.labourHours}
                    onChange={(e) => setFormData({ ...formData, labourHours: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Scope of Work</label>
                <textarea
                  rows={3}
                  required
                  value={formData.scopeOfWork}
                  onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-crm-brand-700 text-white font-semibold">
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
