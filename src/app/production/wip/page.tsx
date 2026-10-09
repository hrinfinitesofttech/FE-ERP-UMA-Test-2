'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { 
  Layers, Clock, AlertTriangle, CheckCircle2, ChevronRight, 
  Search, Plus, ArrowRight, CornerUpLeft, ShieldCheck, 
  Cpu, Building, User, PlayCircle, Eye, Sparkles, Filter
} from 'lucide-react';
import { WIPRecord, WorkOrder } from '../../../types/production';

const STANDARD_STAGES = [
  'Cutting & Edge Prep',
  'Shell Rolling & Forming',
  'Long & Circ Seam Welding',
  'Dish End & Flange Fit-up',
  'Nozzle & Limpet Welding',
  'Final Assembly & QC Handover'
];

function WIPTrackingContent() {
  const router = useRouter();
  const { wipRecords, workOrders, productionEntries, projectJobs, openJobModal, isInitialLoading } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Compute live unified WIP list combining recorded wipRecords with active workOrders
  const combinedWipList = useMemo(() => {
    // 1. Map existing wipRecords by workOrderNumber
    const wipMap = new Map<string, WIPRecord>();
    wipRecords.forEach((w) => {
      if (w.workOrderNumber) wipMap.set(w.workOrderNumber, w);
    });

    // 2. Synthesize or enrich with active work orders
    const result: (WIPRecord & { customerName?: string; productName?: string; priority?: string })[] = [];

    workOrders.forEach((wo) => {
      // Find matching job
      const matchedJob = projectJobs?.find((j) => j.jobNumber === wo.jobNumber || j.id === wo.jobId);
      const existing = wipMap.get(wo.workOrderNumber);

      // Find entries for this work order to determine actual progress
      const entriesForWo = productionEntries.filter((e) => e.workOrderNumber === wo.workOrderNumber);
      const completedOps = entriesForWo.length > 0 ? entriesForWo.length : (existing?.completedOperationsCount || (wo.status === 'Completed' ? 6 : 1));
      const totalOps = 6;
      const stageIdx = Math.min(totalOps - 1, Math.max(0, completedOps - 1));
      const currentOp = entriesForWo.length > 0 
        ? entriesForWo[entriesForWo.length - 1].operationName 
        : (existing?.currentOperationName || STANDARD_STAGES[stageIdx]);

      const isCompleted = wo.status === 'Completed' || (existing?.status as string) === 'Completed';

      result.push({
        id: existing?.id || `WIP-${wo.workOrderNumber}`,
        jobId: wo.jobId || matchedJob?.id || 'PRJ-2026-0001',
        jobNumber: wo.jobNumber,
        workOrderNumber: wo.workOrderNumber,
        productionOrderNumber: existing?.productionOrderNumber || 'PO-PROD-2026-001',
        currentOperationName: isCompleted ? 'Completed & QC Cleared' : currentOp,
        completedOperationsCount: isCompleted ? totalOps : Math.min(totalOps, completedOps),
        totalOperationsCount: totalOps,
        wipQuantity: wo.productionQuantity || 1,
        uom: wo.uom || 'Unit',
        location: entriesForWo[0]?.workCenterName || existing?.location || 'Fabrication Bay 01',
        responsibleDepartment: existing?.responsibleDepartment || 'Heavy Fabrication Division',
        startDate: wo.plannedStartDate || new Date().toISOString().split('T')[0],
        expectedCompletionDate: wo.plannedEndDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        delayDays: existing?.delayDays || 0,
        status: isCompleted ? 'QC Pending' : (existing?.status || (completedOps >= totalOps ? 'QC Pending' : 'In Progress')),
        customerName: wo.customerName || matchedJob?.customerName || 'Standard Client',
        productName: wo.productName || matchedJob?.productName || 'Industrial Process Equipment',
        priority: wo.priority || 'High',
      });
    });

    // If there are standalone wipRecords not in workOrders, append them
    wipRecords.forEach((w) => {
      if (!result.some((r) => r.workOrderNumber === w.workOrderNumber)) {
        result.push(w);
      }
    });

    return result;
  }, [wipRecords, workOrders, productionEntries, projectJobs]);

  // Filtered WIP items
  const filtered = useMemo(() => {
    return combinedWipList.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q ||
        item.jobNumber?.toLowerCase().includes(q) ||
        item.workOrderNumber?.toLowerCase().includes(q) ||
        item.customerName?.toLowerCase().includes(q) ||
        item.productName?.toLowerCase().includes(q) ||
        item.currentOperationName?.toLowerCase().includes(q);

      const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [combinedWipList, searchTerm, filterStatus]);

  // KPIs
  const totalActiveWip = combinedWipList.filter((w) => (w.status as string) !== 'Completed').length;
  const inProgressCount = combinedWipList.filter((w) => w.status === 'In Progress').length;
  const qcPendingCount = combinedWipList.filter((w) => w.status === 'QC Pending' || w.completedOperationsCount >= w.totalOperationsCount).length;
  const avgCompletion = combinedWipList.length > 0
    ? Math.round(combinedWipList.reduce((sum, w) => sum + (w.completedOperationsCount / w.totalOperationsCount) * 100, 0) / combinedWipList.length)
    : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#544B45]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700 border border-indigo-100">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight">
                Work In Progress (WIP) Tracking Matrix
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                Live Shop Floor Stage Tracker
              </span>
            </div>
            <p className="text-xs text-[#70665F] mt-1">
              Real-time Fabrication Milestones • Stage-by-Stage Completion % • Seamless QC Handover
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/store/material-return')}
            className="flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#544B45] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[#E5DCD3] transition cursor-pointer"
          >
            <CornerUpLeft className="w-4 h-4 text-amber-600" />
            <span>Return Excess Offcuts</span>
          </button>
          <button
            onClick={() => router.push('/production/entry')}
            className="flex items-center gap-2 bg-[#8B2500] hover:bg-[#701E00] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Production Shift</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Active WIP Assemblies</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#211B17] mt-2 font-mono">
            {totalActiveWip} Jobs
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">Currently undergoing fabrication</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">In Active Production</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {inProgressCount} Assemblies
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">Welding, rolling & assembly ongoing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Ready for Final QC</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {qcPendingCount} Units
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">Awaiting Hydro, DP & FAT sign-off</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Average Progress</span>
            <div className="p-2 bg-sky-50 rounded-lg text-sky-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-700 mt-2 font-mono">
            {avgCompletion}%
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">Weighted shop floor completion</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C827A]" />
          <input
            type="text"
            placeholder="Search Job #, Work Order #, Customer, Equipment name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl pl-9 pr-4 py-2 text-xs text-[#211B17] focus:outline-hidden focus:border-[#8B2500]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'In Progress', 'QC Pending', 'Delayed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#8B2500] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70665F] hover:bg-[#EFE8DF]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* WIP Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-[#8C827A] bg-white rounded-2xl border border-[#EBE3DB]">
            <Layers className="w-10 h-10 mx-auto mb-2 text-[#C8B8A6] opacity-50" />
            <p className="font-bold text-base text-[#211B17]">No WIP records match your filter</p>
            <p className="text-xs text-[#70665F] mt-1">
              Click &quot;+ Log Production Shift&quot; to begin tracking shop floor assembly milestones.
            </p>
          </div>
        ) : (
          filtered.map((wip) => {
            const progressPercent = Math.round((wip.completedOperationsCount / wip.totalOperationsCount) * 100);
            const isNearCompletion = progressPercent >= 80;

            return (
              <div
                key={wip.id || wip.workOrderNumber}
                className="bg-white p-5 rounded-2xl border border-[#EBE3DB] hover:border-[#C8B8A6] transition space-y-4 shadow-xs"
              >
                {/* Top Row: Job Code, Customer & Status */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-[#8B2500] text-base">
                        {wip.jobNumber}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DCD3] text-[#544B45]">
                        {wip.workOrderNumber}
                      </span>
                      {wip.priority && (
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          wip.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {wip.priority}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-[#211B17] text-sm mt-1">
                      {wip.productName || 'Custom Fabricated Process Vessel'}
                    </div>
                    <div className="text-xs text-[#70665F] flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-[#8C827A]" />
                      <span>Customer: <strong>{wip.customerName || 'Standard Client'}</strong></span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      isNearCompletion || wip.status === 'QC Pending'
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : wip.status === 'In Progress'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}
                  >
                    {isNearCompletion ? 'Ready for Final QC' : wip.status}
                  </span>
                </div>

                {/* Operations Milestone Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#70665F]">
                      Milestone Progress ({wip.completedOperationsCount} / {wip.totalOperationsCount} Stages)
                    </span>
                    <span className="text-[#8B2500] font-mono text-sm">{progressPercent}% Completed</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#E5DCD3]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNearCompletion 
                          ? 'bg-gradient-to-r from-amber-500 to-emerald-600' 
                          : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Step indicators */}
                  <div className="grid grid-cols-6 gap-1 pt-1">
                    {STANDARD_STAGES.map((stg, sIdx) => {
                      const isDone = sIdx < wip.completedOperationsCount;
                      const isCurrent = sIdx === wip.completedOperationsCount - 1;
                      return (
                        <div
                          key={stg}
                          className={`h-1.5 rounded-full transition ${
                            isDone ? 'bg-emerald-600' : isCurrent ? 'bg-amber-500' : 'bg-[#E5DCD3]'
                          }`}
                          title={`Stage ${sIdx + 1}: ${stg}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Location & Details Info Box */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DCD3] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#70665F]">Current Stage:</span>
                    <span className="font-bold text-[#8B2500] bg-white px-2 py-0.5 rounded border border-[#E5DCD3]">
                      {wip.currentOperationName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Bay Location:</span>
                    <span className="font-semibold text-[#211B17]">{wip.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Target Completion:</span>
                    <span className="font-mono font-bold text-[#211B17]">{wip.expectedCompletionDate}</span>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-2 border-t border-[#EBE3DB] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => openJobModal(wip.jobNumber)}
                    className="text-[#70665F] hover:text-[#211B17] font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5 text-[#8B2500]" />
                    <span>360° Job Trace</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/production/entry?woNumber=${wip.workOrderNumber}`)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#544B45] font-bold border border-[#E5DCD3] transition flex items-center gap-1 cursor-pointer"
                      title="Record another production shift for this job"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#8B2500]" />
                      <span>Log Shift</span>
                    </button>

                    <button
                      onClick={() => router.push(`/production/completion?woNumber=${wip.workOrderNumber}`)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                        isNearCompletion
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                          : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                      }`}
                      title="Clear Hydro testing, DP test, dimensions and sign-off completion"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>QC Clearance</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function WIPTrackingPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-stone-500 font-semibold bg-[#FAF7F2] min-h-screen flex items-center justify-center">
        Loading WIP Matrix...
      </div>
    }>
      <WIPTrackingContent />
    </Suspense>
  );
}
