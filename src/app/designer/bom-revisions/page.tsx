'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { BOMRevision } from '../../../types/designer';
import {
  GitBranch,
  Search,
  CheckCircle2,
  Clock,
  User,
  X,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

export default function BOMRevisionsPage() {
  const { bomRevisions, boms } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRev, setSelectedRev] = useState<BOMRevision | null>(null);

  const filteredRevs = bomRevisions.filter((r) => {
    return (
      r.revisionNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      r.jobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      r.changedBy?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
  });

  return (
    <div className="p-6 space-y-6  text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold">
              MODULE 3.9
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-sky-400" />
              Immutable BOM Revisions Audit Log
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Historical Snapshots & Diff Summary of Released BOM Versions (REV-00 to REV-01+)
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Revision #, Job #, Reason, Changed By..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Revision List */}
      <div className="space-y-4">
        {filteredRevs.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-sky-500/40 transition space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 font-mono font-black text-xs">
                  {rev.revisionNumber}
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">[{rev.jobNumber}]</span>
                <span className="text-[#211B17] font-extrabold text-sm">- {rev.reason}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#70665F] font-mono">
                <span>By: <strong className="text-[#3E2723]">{rev.changedBy}</strong></span>
                <span>Date: <strong className="text-[#3E2723]">{rev.changedDate}</strong></span>
              </div>
            </div>

            {/* Changed Items Summary */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-2 font-mono text-xs">
              <span className="text-[#70665F] font-bold block">Delta Component Changes:</span>
              <div className="space-y-1.5">
                {rev.changedItemsSummary.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-white border border-[#EBE3DB]">
                    <span className="text-crm-brand- font-bold">Item #{item.itemNo} ({item.partNumber})</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#70665F]">Qty: {item.oldQty} → <strong className="text-emerald-400">{item.newQty}</strong></span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.changeType === 'added'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.changeType === 'modified'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {item.changeType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
