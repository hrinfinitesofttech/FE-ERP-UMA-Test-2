'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Workflow, CheckCircle2, Clock, ShieldCheck, AlertTriangle, Search } from 'lucide-react';

export default function OperationProductionPage() {
  const { routingOperations, openJobModal } = useERP();
  const [selectedJob, setSelectedJob] = useState('JOB-2026-001');

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Operation-wise Progress Tracking
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium border border-violet-500/30">
                Shop Floor Milestone Control
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Granular Step-by-Step Quantity & QC Progress Across Fabrication & Machining Stations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#544B45] focus:outline-none focus:border-violet-500"
          >
            <option value="JOB-2026-001">JOB-2026-001 - Heavy SS Reactor</option>
            <option value="JOB-2026-002">JOB-2026-002 - Fluid Bed Dryer</option>
          </select>
        </div>
      </div>

      {/* Progress Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Seq #</th>
                <th className="p-3">Operation Name</th>
                <th className="p-3">Work Center Bay</th>
                <th className="p-3 text-right">Planned Setup</th>
                <th className="p-3 text-right">Planned Run</th>
                <th className="p-3">Operator</th>
                <th className="p-3">QC Status</th>
                <th className="p-3">Operation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {routingOperations.map((op) => (
                <tr key={op.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-violet-400">{op.operationNumber}</td>
                  <td className="p-3 font-semibold text-[#211B17] max-w-xs">{op.operationName}</td>
                  <td className="p-3 font-mono text-crm-brand-">{op.workCenterCode} - {op.workCenterName.slice(0, 20)}</td>
                  <td className="p-3 text-right font-mono text-[#544B45]">{op.plannedSetupMinutes}m</td>
                  <td className="p-3 text-right font-mono text-[#544B45]">{op.plannedProcessingMinutes}m</td>
                  <td className="p-3 font-medium text-[#544B45]">{op.assignedOperator}</td>
                  <td className="p-3">
                    {op.qcRequired ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        QC Required
                      </span>
                    ) : (
                      <span className="text-[#70665F] text-[10px]">Standard</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        op.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : op.status === 'In Progress'
                          ? 'bg-crm-brand-600/20 text-crm-brand- border-crm-brand-600/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {op.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
