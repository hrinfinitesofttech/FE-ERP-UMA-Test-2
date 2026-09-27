'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Compass,
  Plus,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function ProductionPlanningPage() {
  const { productionPlans, manufacturingJobs, workCenters, addProductionPlan, openJobModal } = useERP();

  const [selectedJobId, setSelectedJobId] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [plannedCompletionDate, setPlannedCompletionDate] = useState('');
  const [selectedWcs, setSelectedWcs] = useState<string[]>(['WC-CUT', 'WC-CNC', 'WC-WELD', 'WC-ASSY']);
  const [manpowerCount, setManpowerCount] = useState(12);

  const selectedJob = manufacturingJobs.find((j) => j.id === selectedJobId || j.jobNumber === selectedJobId);

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    addProductionPlan({
      planNumber: `PLAN-${new Date().getFullYear()}-00${productionPlans.length + 1}`,
      jobId: selectedJob.projectId,
      jobNumber: selectedJob.jobNumber,
      projectId: selectedJob.projectId,
      productName: selectedJob.productName,
      requiredQuantity: selectedJob.quantity,
      bomId: selectedJob.bomId || 'BOM-2026-001',
      bomRevision: selectedJob.bomRevision,
      materialAvailabilityStatus: 'Fully Available',
      plannedStartDate,
      plannedCompletionDate: plannedCompletionDate || '2026-10-30',
      assignedWorkCenters: selectedWcs,
      plannedManpowerCount: manpowerCount,
      productionManager: selectedJob.productionManager,
      status: 'Approved',
    });

    alert(`Production Plan generated successfully for ${selectedJob.jobNumber}!`);
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Production Planning
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                MTO Pre-Production Scheduling
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Convert Approved BOM & Design Revisions into Master Production Schedules & Resource Allocations
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: New Plan Form + Active Plans Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Plan Form */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
          <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2 border-b border-[#EBE3DB] pb-3">
            <Plus className="w-4 h-4 text-amber-400" /> Create Production Plan
          </h2>

          <form onSubmit={handleSubmitPlan} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#544B45] mb-1">Select Manufacturing Job</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                required
                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose Job Number --</option>
                {manufacturingJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.jobNumber} — {j.customerName.slice(0, 15)}... ({j.productName.slice(0, 20)})
                  </option>
                ))}
              </select>
            </div>

            {selectedJob && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-[#544B45] text-[11px]">
                <div>
                  <span className="text-[#70665F]">Approved Design Rev:</span>{' '}
                  <span className="font-mono font-bold text-amber-300">{selectedJob.designRevision}</span>
                </div>
                <div>
                  <span className="text-[#70665F]">Approved BOM Rev:</span>{' '}
                  <span className="font-mono font-bold text-emerald-300">{selectedJob.bomRevision}</span>
                </div>
                <div>
                  <span className="text-[#70665F]">Quantity:</span> {selectedJob.quantity} {selectedJob.unit}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Planned Start</label>
                <input
                  type="date"
                  value={plannedStartDate}
                  onChange={(e) => setPlannedStartDate(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Target Completion</label>
                <input
                  type="date"
                  value={plannedCompletionDate}
                  onChange={(e) => setPlannedCompletionDate(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#544B45] mb-1">Planned Manpower (Operators/Welders)</label>
              <input
                type="number"
                value={manpowerCount}
                onChange={(e) => setManpowerCount(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#544B45] mb-1">Assigned Work Center Bays</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {workCenters.map((wc) => (
                  <label key={wc.id} className="flex items-center gap-2 p-1.5 rounded bg-[#FAF7F2]/60 text-[#544B45] hover:bg-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={selectedWcs.includes(wc.workCenterCode)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedWcs([...selectedWcs, wc.workCenterCode]);
                        else setSelectedWcs(selectedWcs.filter((c) => c !== wc.workCenterCode));
                      }}
                      className="rounded border-[#EBE3DB] text-amber-500"
                    />
                    <span className="font-mono text-[11px] font-bold text-crm-brand-">{wc.workCenterCode}</span> - {wc.workCenterName.slice(0, 25)}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 font-bold text-[#211B17] shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" /> Save & Release Production Plan
            </button>
          </form>
        </div>

        {/* Production Plans Registry */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
          <h2 className="text-base font-bold text-[#211B17] flex items-center justify-between border-b border-[#EBE3DB] pb-3">
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" /> Active Master Production Plans
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#FAF7F2] text-[#544B45] font-mono">
              Total Plans: {productionPlans.length}
            </span>
          </h2>

          <div className="space-y-3">
            {productionPlans.map((plan) => (
              <div key={plan.id} className="p-4 rounded-xl bg-[#FAF7F2]/50 border border-[#EBE3DB]/80 hover:border-amber-500/50 transition space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">{plan.planNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                      {plan.jobNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {plan.materialAvailabilityStatus}
                    </span>
                  </div>
                  <button
                    onClick={() => openJobModal(plan.jobNumber)}
                    className="px-2.5 py-1 rounded bg-crm-brand-700/20 text-crm-brand- border border-crm-brand-600/30 text-[10px] font-bold hover:bg-crm-brand-700/30 transition flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" /> Job 360°
                  </button>
                </div>

                <div className="text-sm font-semibold text-[#211B17]">{plan.productName}</div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EBE3DB]">
                  <div>
                    <span className="text-[#70665F] block text-[10px]">Planned Dates</span>
                    <span className="font-medium text-[#544B45]">
                      {plan.plannedStartDate} to {plan.plannedCompletionDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[10px]">BOM / Design Rev</span>
                    <span className="font-mono text-emerald-300">{plan.bomRevision}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[10px]">Manpower Assigned</span>
                    <span className="font-medium text-amber-300">{plan.plannedManpowerCount} Technicians</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[10px]">Plan Status</span>
                    <span className="font-bold text-emerald-400">{plan.status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#70665F] mr-1">Work Centers:</span>
                  {plan.assignedWorkCenters.map((wc) => (
                    <span key={wc} className="px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- text-[10px] font-mono border border-crm-brand-600/30">
                      {wc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
