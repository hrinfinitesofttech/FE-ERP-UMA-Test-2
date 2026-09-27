'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Layers, Clock, AlertTriangle, CheckCircle2, ChevronRight, Search } from 'lucide-react';

export default function WIPTrackingPage() {
  const { wipRecords, openJobModal } = useERP();

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-crm-brand-600/10 text-crm-brand-500 border border-crm-brand-600/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Work In Progress (WIP) Matrix
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand- font-medium border border-crm-brand-600/30">
                Real-Time Stage Matrix
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Trace Active Job Assemblies Across Shop Floor Bays & Operation Milestones
            </p>
          </div>
        </div>
      </div>

      {/* WIP Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wipRecords.map((wip) => {
          const progressPercent = Math.round((wip.completedOperationsCount / wip.totalOperationsCount) * 100);

          return (
            <div
              key={wip.id}
              className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-crm-brand-600/50 transition space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-sky-400 text-base">{wip.jobNumber}</span>
                  <div className="text-xs font-mono text-indigo-300">{wip.workOrderNumber}</div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    wip.status === 'In Progress'
                      ? 'bg-crm-brand-600/20 text-crm-brand- border-crm-brand-600/30'
                      : wip.status === 'Delayed'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {wip.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EBE3DB] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#70665F]">Current Operation:</span>
                  <span className="font-semibold text-amber-300">{wip.currentOperationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#70665F]">Responsible Bay / Dept:</span>
                  <span className="font-medium text-[#544B45]">{wip.responsibleDepartment} ({wip.location})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#70665F]">WIP Quantity:</span>
                  <span className="font-bold text-[#211B17]">{wip.wipQuantity} {wip.uom}</span>
                </div>
              </div>

              {/* Operations Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#70665F]">
                    Operations Progress ({wip.completedOperationsCount} / {wip.totalOperationsCount} Ops)
                  </span>
                  <span className="text-crm-brand-500 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#EBE3DB]">
                  <div
                    className="bg-gradient-to-r from-crm-brand-600 to-crm-brand-700 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[#EBE3DB] flex justify-between items-center text-xs">
                <span className="text-[#70665F]">Expected: {wip.expectedCompletionDate}</span>
                <button
                  onClick={() => openJobModal(wip.jobNumber)}
                  className="px-3 py-1 rounded bg-crm-brand-700/20 text-crm-brand- font-bold border border-crm-brand-600/30 hover:bg-crm-brand-700/30 transition text-[11px]"
                >
                  360° Job Trace
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
