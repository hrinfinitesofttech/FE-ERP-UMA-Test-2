'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate, formatCurrency } from '../../../lib/utils';
import {
  PackageCheck,
  Plus,
  Search,
  Building,
  CheckCircle2,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function ServicePartsIssuePage() {
  const { servicePartIssues, addServicePartIssue } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    workOrderNumber: '',
    serviceRequestId: '',
    customerName: '',
    machineName: '',
    technicianId: '',
    technicianName: '',
    items: [] as {
      itemCode: string;
      itemName: string;
      requiredQty: number;
      issuedQty: number;
      rate: number;
      warehouse: string;
      location: string;
      batchSerial: string;
    }[],
    status: 'Issued' as const,
    remarks: '',
  });

  const filteredIssues = servicePartIssues.filter((spi) =>

    !searchTerm?.trim() ||

    spi.issueNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    spi.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    spi.workOrderNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    spi.technicianName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServicePartIssue(formData);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-mono text-xs font-bold">
              STORE ISSUE REQUISITIONS
            </span>
            <span className="text-xs text-[#70665F]">Inventory Handover to Field Technicians</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-violet-500" />
            Service Parts Issue
          </h1>
          <p className="text-xs text-[#70665F]">
            Work Order -&gt; Store Requisition -&gt; Verification -&gt; Issue. Store remains the ultimate source of truth for stock balance.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-[#211B17] font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-violet-600/30"
        >
          <Plus className="w-4 h-4" />
          New Parts Issue Request
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search issue no, work order, customer or technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-violet-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-violet-600 text-[#211B17] font-mono font-bold text-xs">
                  {issue.issueNumber}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17]">{issue.customerName}</h3>
                  <p className="text-xs text-[#70665F]">{issue.machineName} • WO Ref: {issue.workOrderNumber}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {issue.status}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-[#70665F] uppercase tracking-wider block">Issued Items</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {issue.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl space-y-1 text-xs border border-slate-100 dark:border-[#EBE3DB]">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900 dark:text-[#544B45]">{item.itemName}</span>
                      <span className="font-mono text-violet-600">{item.itemCode}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#70665F]">
                      <span>Issued Qty: {item.issuedQty} (Req: {item.requiredQty})</span>
                      <span className="font-mono font-bold">{formatCurrency(item.rate * item.issuedQty)}</span>
                    </div>
                    <div className="text-[10px] text-[#70665F] font-mono">
                      Wh: {item.warehouse} ({item.location}) {item.batchSerial ? `• Batch: ${item.batchSerial}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#EBE3DB] text-xs">
              <span className="text-slate-600 dark:text-[#70665F]">Issued to Technician: <strong>{issue.technicianName}</strong></span>
              <span className="text-[10px] text-[#70665F] font-mono">Issued Date: {formatDate(issue.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-xl overflow-hidden text-xs">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-violet-500" /> Create Spare Part Issue Request
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block font-semibold mb-1">Work Order Number</label>
                <input
                  type="text"
                  required
                  value={formData.workOrderNumber}
                  onChange={(e) => setFormData({ ...formData, workOrderNumber: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-violet-600 text-[#211B17] font-semibold">Post Issue Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
