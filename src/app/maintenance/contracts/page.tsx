'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { FileSpreadsheet, Search, Plus, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

export default function ServiceContractsPage() {
  const { serviceContracts } = useERP();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredContracts = serviceContracts.filter((c) =>
    c.contractNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    c.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    c.contractType?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-crm-brand- dark:bg-crm-brand-/40 text-crm-brand-800 dark:text-crm-brand- font-mono text-xs font-bold">
              SERVICE CONTRACTS MASTER
            </span>
            <span className="text-xs text-[#70665F]">Warranty, AMC, Paid & Custom SLA Contracts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-crm-brand-600" />
            Service Contracts Master
          </h1>
          <p className="text-xs text-[#70665F]">
            Configure terms, SLAs, included/excluded services for Comprehensive, Non-Comprehensive, Paid, and Labour Service Contracts.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search contract no, type or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContracts.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-crm-brand-700 text-white font-mono font-bold text-xs">
                  {c.contractNumber}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1.5">{c.customerName}</h3>
                <p className="text-xs text-[#70665F]">{c.machineName} (SN: {c.serialNumber})</p>
              </div>

              <span className="px-2.5 py-1 rounded bg-crm-brand-600/10 text-crm-brand-700 font-bold text-xs">
                {c.contractType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl">
              <div>
                <span className="text-[10px] text-[#70665F] block">Contract Value</span>
                <span className="font-bold text-slate-900 dark:text-[#544B45] font-mono">{formatCurrency(c.contractValue)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">SLA Response Limit</span>
                <span className="font-bold text-crm-brand-700 font-mono">{c.slaHours} Hours</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[#70665F] block text-[10px]">Included Services</span>
              <div className="flex flex-wrap gap-1">
                {c.includedServices.map((inc, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px]">
                    ✓ {inc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
