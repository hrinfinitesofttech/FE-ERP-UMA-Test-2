'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency } from '../../../lib/utils';
import { DollarSign, Search, Plus, TrendingUp, Receipt, Building, Package, Clock, X } from 'lucide-react';

export default function MaintenanceCostsPage() {
  const { maintenanceCosts, addMaintenanceCost } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    costReference: 'SR-2026-004',
    referenceType: 'Service Request' as const,
    machineId: 'CM-2026-004',
    machineName: 'Heavy Port Material Handling Conveyor Drive System',
    serialNumber: 'UTF-CD-2026-1042',
    partsCost: 16400,
    labourCost: 4200,
    externalVendorCost: 0,
    travelTransportCost: 2500,
    totalCost: 23100,
    estimatedCost: 25000,
    variance: -1900,
    isChargeable: false,
    status: 'Recorded' as const,
  });

  const filteredCosts = maintenanceCosts.filter((c) =>

    !searchTerm?.trim() ||

    c.costReference?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    c.machineName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    c.serialNumber?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMaintenanceCost(formData);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
              MAINTENANCE COST CONTROL & BILLING LINK
            </span>
            <span className="text-xs text-[#70665F]">Parts, Labour, External Vendor & Logistics Costs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Maintenance & Service Costing
          </h1>
          <p className="text-xs text-[#70665F]">
            Track spare parts cost, technician labour hours, vendor outsourcing, travel expense &amp; links to Module 7 Accounting for chargeable invoicing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          Record Cost Transaction
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search reference no, machine or serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Costs Table */}
      <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-[#FAF7F2] text-slate-600 dark:text-[#70665F] uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-[#EBE3DB]">
                <th className="py-3.5 px-4">Cost Ref & Type</th>
                <th className="py-3.5 px-4">Machine & Serial</th>
                <th className="py-3.5 px-4 font-mono text-right">Parts Cost</th>
                <th className="py-3.5 px-4 font-mono text-right">Labour Cost</th>
                <th className="py-3.5 px-4 font-mono text-right">Travel & Misc</th>
                <th className="py-3.5 px-4 font-mono text-right">Total Cost</th>
                <th className="py-3.5 px-4 font-mono text-right">Est. vs Actual</th>
                <th className="py-3.5 px-4">Accounting Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#EBE3DB]">
              {filteredCosts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#FAF7F2]/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{c.costReference}</div>
                    <div className="text-[10px] text-[#70665F]">{c.referenceType}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-[#211B17]">{c.machineName}</div>
                    <div className="text-[10px] text-[#70665F] font-mono">SN: {c.serialNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right">{formatCurrency(c.partsCost)}</td>
                  <td className="py-3.5 px-4 font-mono text-right">{formatCurrency(c.labourCost)}</td>
                  <td className="py-3.5 px-4 font-mono text-right">{formatCurrency(c.travelTransportCost)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-900 dark:text-[#544B45]">
                    {formatCurrency(c.totalCost)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right">
                    <div className="font-bold text-slate-700 dark:text-[#544B45]">Est: {formatCurrency(c.estimatedCost)}</div>
                    <div className={`text-[10px] ${c.variance <= 0 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}`}>
                      Var: {formatCurrency(c.variance)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {c.isChargeable ? (
                      <span className="px-2.5 py-1 rounded bg-crm-brand-600/10 text-crm-brand-700 font-mono text-[10px] font-bold">
                        Billed: {c.billingInvoiceNumber || 'INV-SRV-089'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#FAF7F2] text-[#70665F] text-[10px]">
                        Internal Overhead
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-xl overflow-hidden text-xs">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" /> Record Maintenance Cost Entry
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block font-semibold mb-1">Cost Reference</label>
                <input
                  type="text"
                  required
                  value={formData.costReference}
                  onChange={(e) => setFormData({ ...formData, costReference: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Parts Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.partsCost}
                    onChange={(e) => setFormData({ ...formData, partsCost: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Labour Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.labourCost}
                    onChange={(e) => setFormData({ ...formData, labourCost: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Post Cost Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
