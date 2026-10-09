'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { AMCStatus } from '../../../types/maintenance';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  UserCheck,
  X,
} from 'lucide-react';

export default function AMCManagementPage() {
  const { amcContracts, addAMCContract, customers, customerMachines } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    customerId: customers?.[0]?.id || '',
    customerName: (customers?.[0] as any)?.companyName || (customers?.[0] as any)?.name || '',
    customerMachineId: '',
    machineName: '',
    serialNumber: '',
    contractStart: new Date().toISOString().split('T')[0],
    contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contractValue: 0,
    billingFrequency: 'Quarterly' as const,
    totalVisitsIncluded: 4,
    visitsCompleted: 0,
    preventiveVisits: 4,
    breakdownSupport: true,
    partsIncluded: true,
    labourIncluded: true,
    responseTimeHours: 24,
    termsAndConditions: 'Comprehensive AMC terms.',
    assignedTechnicianId: '',
    assignedTechnicianName: '',
    status: 'Active' as AMCStatus,
  });

  const filteredAmcs = amcContracts.filter((a) =>

    !searchTerm?.trim() ||

    a.amcNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    a.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    a.machineName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    a.serialNumber?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAMCContract(formData);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-crm-brand- dark:bg-crm-brand-/40 text-crm-brand-800 dark:text-crm-brand- font-mono text-xs font-bold">
              ANNUAL MAINTENANCE CONTRACTS
            </span>
            <span className="text-xs text-[#70665F]">Post-Warranty Service Monetization</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-crm-brand-600" />
            AMC Management
          </h1>
          <p className="text-xs text-[#70665F]">
            Manage comprehensive & non-comprehensive Annual Maintenance Contracts, billing terms, SLA response times & expiry alerts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-crm-brand-700/30"
        >
          <Plus className="w-4 h-4" />
          Create New AMC Contract
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search AMC no, customer, machine or serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* AMC Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAmcs.map((a) => (
          <div
            key={a.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-crm-brand- transition"
          >
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-[#EBE3DB] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-crm-brand-700 text-white font-mono font-bold text-xs">
                  {a.amcNumber}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1.5">{a.customerName}</h3>
                <p className="text-xs text-[#70665F]">{a.machineName} (SN: {a.serialNumber})</p>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {a.status}
                </span>
                <div className="font-mono font-bold text-slate-900 dark:text-[#544B45] text-sm mt-1">
                  {formatCurrency(a.contractValue)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl">
              <div>
                <span className="text-[10px] text-[#70665F] block">Contract Duration</span>
                <span className="font-medium text-slate-800 dark:text-[#544B45]">
                  {formatDate(a.contractStart)} to {formatDate(a.contractEnd)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Visits Completed</span>
                <span className="font-bold text-crm-brand-700 font-mono">
                  {a.visitsCompleted} / {a.totalVisitsIncluded} Included Visits
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-[#70665F]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Parts: {a.partsIncluded ? 'Included' : 'Excluded'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Labour: {a.labourIncluded ? 'Included' : 'Excluded'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> SLA Response: {a.responseTimeHours} hrs
              </span>
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
                <FileCheck className="w-5 h-5 text-crm-brand-600" /> Create Annual Maintenance Contract
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
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
              <div>
                <label className="block font-semibold mb-1">Contract Value (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.contractValue}
                  onChange={(e) => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-crm-brand-700 text-white font-semibold">Save AMC Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
