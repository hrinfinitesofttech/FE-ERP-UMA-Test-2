'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { PackageCheck, ShieldCheck, Truck, Building, Search, ChevronRight } from 'lucide-react';

export default function FinishedGoodsPage() {
  const { finishedGoods, openJobModal, isInitialLoading } = useERP();

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Finished Goods Warehouse Master
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30">
                Ready for Dispatch
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Completed Customer Machine Assembly Units Stored in Dispatch Warehouse Bays
            </p>
          </div>
        </div>
      </div>

      {/* Finished Goods Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">FG Number</th>
                <th className="p-3">Job & WO #</th>
                <th className="p-3">Machine / Product Name</th>
                <th className="p-3">Warehouse & Bin Location</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3">Completion Date</th>
                <th className="p-3">QC Clearance</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {isInitialLoading && finishedGoods.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`shimmer-fg-${i}`} className="border-b border-[#EBE3DB]">
                    <td className="p-3"><div className="h-4 w-28 rounded animate-shimmer" /></td>
                    <td className="p-3 space-y-1">
                      <div className="h-3.5 w-20 rounded animate-shimmer" />
                      <div className="h-3 w-16 rounded animate-shimmer" />
                    </td>
                    <td className="p-3"><div className="h-4 w-48 rounded animate-shimmer" /></td>
                    <td className="p-3 space-y-1">
                      <div className="h-3.5 w-32 rounded animate-shimmer" />
                      <div className="h-3 w-16 rounded animate-shimmer" />
                    </td>
                    <td className="p-3 text-right"><div className="h-4 w-12 ml-auto rounded animate-shimmer" /></td>
                    <td className="p-3"><div className="h-4 w-24 rounded animate-shimmer" /></td>
                    <td className="p-3"><div className="h-5 w-24 rounded-full animate-shimmer" /></td>
                    <td className="p-3 text-right"><div className="h-6 w-16 ml-auto rounded-lg animate-shimmer" /></td>
                  </tr>
                ))
              ) : finishedGoods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#70665F]">
                    No finished goods in warehouse yet.
                  </td>
                </tr>
              ) : (
                finishedGoods.map((fg) => (
                  <tr key={fg.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="p-3 font-mono font-bold text-sky-400">{fg.finishedGoodsNumber}</td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-emerald-400">{fg.jobNumber}</div>
                      <div className="font-mono text-indigo-300 text-[11px]">{fg.workOrderNumber}</div>
                    </td>
                    <td className="p-3 font-semibold text-[#211B17] max-w-xs">{fg.productName}</td>
                    <td className="p-3 text-[#544B45]">
                      <div className="font-bold text-[#544B45]">{fg.warehouseName}</div>
                      <div className="text-[11px] font-mono text-crm-brand-">{fg.locationBin}</div>
                    </td>
                    <td className="p-3 text-right font-bold text-[#211B17]">
                      {fg.quantity} {fg.uom}
                    </td>
                    <td className="p-3 text-[#70665F]">{fg.completionDate}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" /> {fg.qcStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openJobModal(fg.jobNumber)}
                        className="px-2.5 py-1 rounded bg-crm-brand-700/20 text-crm-brand- hover:bg-crm-brand-700/30 border border-crm-brand-600/30 text-[11px] font-bold transition"
                      >
                        360° Trace
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
