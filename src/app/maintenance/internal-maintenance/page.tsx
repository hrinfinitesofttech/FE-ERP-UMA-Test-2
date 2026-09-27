'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { Factory, Search, Wrench, AlertTriangle, RotateCcw, Clock, DollarSign } from 'lucide-react';

export default function InternalMaintenancePage() {
  const { internalAssets, breakdowns, preventivePlans, maintenanceCosts } = useERP();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = internalAssets.filter((a) =>
    a.assetName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    a.assetCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    a.department?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
              PLANT & MACHINERY MAINTENANCE
            </span>
            <span className="text-xs text-[#70665F]">Uma Techno Fab Internal Shopfloor Equipment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <Factory className="w-6 h-6 text-crm-brand-600" />
            Internal Plant Maintenance
          </h1>
          <p className="text-xs text-[#70665F]">
            Internal flow: Asset -&gt; PM Plan -&gt; Request -&gt; Technician -&gt; Parts Issue -&gt; Repair -&gt; Downtime &amp; Cost Logging.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search asset code, machine or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Internal Machines List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-indigo-300 transition"
          >
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-crm-brand-700 text-white font-mono font-bold text-xs">
                  {asset.assetCode}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1.5">{asset.assetName}</h3>
                <p className="text-xs text-[#70665F]">Dept: {asset.department} • Location: {asset.location}</p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                  asset.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {asset.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl">
              <div>
                <span className="text-[10px] text-[#70665F] block">Responsible Lead</span>
                <span className="font-medium text-slate-800 dark:text-[#544B45]">{asset.responsiblePerson}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">PM Frequency</span>
                <span className="font-medium text-slate-800 dark:text-[#544B45]">{asset.maintenanceFrequency}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#70665F] text-[10px]">Criticality: <strong>{asset.criticality}</strong></span>
              <button className="px-3 py-1 rounded bg-indigo-50 text-crm-brand-700 font-semibold text-xs hover:bg-indigo-100">
                Log Maintenance Request
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
