'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ShieldCheck, Search, Filter, CheckCircle2, AlertCircle, Building, FileText } from 'lucide-react';

export default function WarrantyManagementPage() {
  const { warranties } = useERP();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredWarranties = warranties.filter((w) =>

    !searchTerm?.trim() ||

    w.serialNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    w.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    w.machineName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold">
              WARRANTY TRACKER
            </span>
            <span className="text-xs text-[#70665F]">Automated Guarantee Eligibility Validation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            Warranty Management
          </h1>
          <p className="text-xs text-[#70665F]">
            Automatically calculate machine warranty status from dispatch dates, covered components, exclusions & terms.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search serial number, machine or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWarranties.map((w) => (
          <div
            key={w.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-amber-300 transition"
          >
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                  SN: {w.serialNumber}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1">{w.machineName}</h3>
                <p className="text-xs text-[#70665F]">{w.customerName}</p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                  w.status === 'Under Warranty'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {w.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl">
              <div>
                <span className="text-[10px] text-[#70665F] block">Warranty Start</span>
                <span className="font-medium text-slate-800 dark:text-[#544B45]">{formatDate(w.warrantyStart)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Warranty End</span>
                <span className="font-bold text-slate-900 dark:text-[#544B45] font-mono">{formatDate(w.warrantyEnd)}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[#70665F] font-medium block">Covered Components</span>
              <div className="flex flex-wrap gap-1">
                {w.coveredItems.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px]">
                    ✓ {item}
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
