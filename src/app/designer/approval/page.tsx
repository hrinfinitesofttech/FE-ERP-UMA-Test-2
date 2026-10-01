'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Zap,
  CheckCircle2,
  Lock,
  UserCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
  Send,
  AlertCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Layers,
  Award,
  Sparkles,
  RotateCcw,
  Building2,
  Calendar,
  Hash,
  Briefcase,
  Check,
} from 'lucide-react';

export default function DesignApprovalPage() {
  const { designJobs, releaseDesignToManufacturing, revokeDesignRelease, currentUser, boms } = useERP();

  const [mounted, setMounted] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'released'>('all');
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isJobReleased = (job?: any) => {
    if (!job) return false;
    const st = String(job.status || '').toLowerCase();
    const rm = String(job.remarks || '').toLowerCase();
    return (
      st === 'released_to_production' ||
      st === 'released' ||
      st === 'approved' ||
      st === 'bom_approved' ||
      st === 'completed' ||
      rm.includes('released to shop floor')
    );
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return designJobs.filter((job) => {
      const matchesSearch =
        (job.designJobNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.jobNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const isReleased = isJobReleased(job);
      if (statusFilter === 'released') return matchesSearch && isReleased;
      if (statusFilter === 'pending') return matchesSearch && !isReleased;
      return matchesSearch;
    });
  }, [designJobs, searchQuery, statusFilter]);

  const activeJob = useMemo(() => {
    if (selectedJobId) {
      const found = designJobs.find((j) => j.id === selectedJobId || j.designJobNumber === selectedJobId);
      if (found) return found;
    }
    return filteredJobs[0] || designJobs[0] || null;
  }, [selectedJobId, designJobs, filteredJobs]);

  const activeBOM = useMemo(() => {
    if (!activeJob) return null;
    return boms.find((b) => b.designJobId === activeJob.id || b.jobNumber === activeJob.jobNumber || b.projectId === activeJob.projectId);
  }, [boms, activeJob]);

  const releaserName =
    currentUser?.name ||
    `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
    'Admin User';

  const handleRelease = async () => {
    if (!activeJob) return;
    setIsReleasing(true);
    try {
      releaseDesignToManufacturing(activeJob.id, releaserName);
    } finally {
      setTimeout(() => setIsReleasing(false), 500);
    }
  };

  const handleRevoke = () => {
    if (!activeJob) return;
    if (window.confirm(`Are you sure you want to revoke release for ${activeJob.designJobNumber}?`)) {
      revokeDesignRelease(activeJob.id, releaserName);
    }
  };

  const totalCount = designJobs.length;
  const releasedCount = designJobs.filter((j) => isJobReleased(j)).length;
  const pendingCount = totalCount - releasedCount;

  if (!mounted) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto space-y-6">
        <div className="h-32 bg-[#FAF7F2] animate-pulse rounded-3xl border border-[#EBE3DB]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 bg-[#FAF7F2] animate-pulse rounded-3xl border border-[#EBE3DB]" />
          <div className="lg:col-span-8 h-96 bg-[#FAF7F2] animate-pulse rounded-3xl border border-[#EBE3DB]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-[#211B17]">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/10 via-[#FAF7F2] to-emerald-900/10 p-6 rounded-3xl border border-[#EBE3DB] shadow-sm backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-mono font-bold tracking-wider uppercase shadow-sm">
                MODULE 3.12
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 text-[11px] font-bold">
                ISO 9001:2015 Engineering Gateway
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#211B17] tracking-tight flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-600">
                <Zap className="w-6 h-6 fill-current" />
              </span>
              4-Tier Design Approval & Shop Floor Release Gateway
            </h1>
            <p className="text-xs sm:text-sm text-[#70665F] font-medium max-w-3xl">
              Formal Multi-tier Engineering Handover: Locks design master, triggers auto BOM freeze, production routing, and manufacturing release.
            </p>
          </div>

          {/* Quick Metrics & Top Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xs">
              <div className="text-right">
                <div className="text-[10px] text-[#70665F] font-bold uppercase">Pending Gate</div>
                <div className="text-base font-black text-amber-600">{pendingCount}</div>
              </div>
              <div className="w-px h-8 bg-[#EBE3DB] mx-1" />
              <div className="text-right">
                <div className="text-[10px] text-[#70665F] font-bold uppercase">Released</div>
                <div className="text-base font-black text-emerald-600">{releasedCount}</div>
              </div>
            </div>

            {activeJob && !isJobReleased(activeJob) && (
              <button
                onClick={handleRelease}
                disabled={isReleasing}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                {isReleasing ? 'RELEASING...' : 'RELEASE DESIGN TO MANUFACTURING'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-[#EBE3DB] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#211B17] flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Select Design Job
              </h3>
              <span className="text-xs font-mono font-bold text-[#70665F]">
                {filteredJobs.length} of {totalCount}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search job #, product, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                  statusFilter === 'all'
                    ? 'bg-white text-[#211B17] shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                  statusFilter === 'pending'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('released')}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                  statusFilter === 'released'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                Released ({releasedCount})
              </button>
            </div>

            {/* Job List */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredJobs.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#EBE3DB] text-xs text-[#70665F]">
                  No design jobs match the selected filter.
                </div>
              ) : (
                filteredJobs.map((j) => {
                  const isSelected = (activeJob?.id === j.id) || (activeJob?.designJobNumber === j.designJobNumber);
                  const isReleased = isJobReleased(j);

                  return (
                    <button
                      key={j.id || j.designJobNumber}
                      onClick={() => setSelectedJobId(j.id || j.designJobNumber)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative group cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-50/80 to-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-[#FAF7F2]/80 hover:bg-white border-[#EBE3DB] hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              {j.designJobNumber}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-amber-600">
                              {j.jobNumber}
                            </span>
                          </div>
                          <div className="font-extrabold text-xs text-[#211B17] line-clamp-1 group-hover:text-emerald-800 transition">
                            {j.productName}
                          </div>
                          <div className="text-[11px] text-[#70665F] flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{j.customerName || 'Customer'}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shadow-2xs ${
                            isReleased
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isReleased ? 'RELEASED' : 'PENDING'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 4-Tier Approval Gateway & Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeJob ? (
            <>
              {/* Active Job Hero Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#EBE3DB] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#FAF7F2] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-emerald-700 text-sm bg-emerald-100 px-3 py-1 rounded-xl">
                        {activeJob.designJobNumber}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-500">
                        Rev: <span className="text-emerald-700 font-extrabold">{activeJob.activeRevision || 'REV-00'}</span>
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-[#211B17] tracking-tight">
                      {activeJob.productName}
                    </h2>
                    <p className="text-xs text-[#70665F] flex items-center gap-2 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      Customer: <strong className="text-[#211B17]">{activeJob.customerName}</strong>
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between gap-1 text-right bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE3DB]">
                    <div>
                      <span className="text-[10px] text-[#70665F] font-mono font-bold block uppercase">
                        PROJECT / JOB LINK
                      </span>
                      <span className="font-mono font-black text-amber-600 text-sm">
                        {activeJob.projectId || 'PRJ-2026'} / {activeJob.jobNumber}
                      </span>
                    </div>
                    {activeBOM && (
                      <div className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1 mt-1">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        BOM: {activeBOM.bomNumber}
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]/60">
                    <span className="text-[10px] text-[#70665F] font-bold block uppercase">Lead Designer</span>
                    <span className="font-extrabold text-[#211B17] truncate block mt-0.5">
                      {activeJob.assignedDesigner || 'Dharmesh Joshi'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]/60">
                    <span className="text-[10px] text-[#70665F] font-bold block uppercase">Design Manager</span>
                    <span className="font-extrabold text-[#211B17] truncate block mt-0.5">
                      {activeJob.designManager || 'Ketan Patel'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]/60">
                    <span className="text-[10px] text-[#70665F] font-bold block uppercase">Machine / Type</span>
                    <span className="font-extrabold text-[#211B17] truncate block mt-0.5">
                      {activeJob.machineType || 'Process Equipment'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]/60">
                    <span className="text-[10px] text-[#70665F] font-bold block uppercase">Delivery Target</span>
                    <span className="font-extrabold text-amber-700 truncate block mt-0.5">
                      {activeJob.deliveryDate || '2026-10-15'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4-Tier Approval Stepper Section */}
              <div className="p-6 rounded-3xl bg-white border border-[#EBE3DB] shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
                  <h4 className="text-xs font-black text-[#211B17] uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    4-Tier Authorization & Sign-Off Hierarchy
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    4 of 4 Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Tier 1 */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-white border border-emerald-500/30 space-y-2.5 shadow-2xs hover:border-emerald-500 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[11px] text-emerald-700 tracking-wide uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        TIER 1: LEAD DESIGNER
                      </span>
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                    <div className="font-black text-sm text-[#211B17]">
                      {activeJob.assignedDesigner || 'Dharmesh Joshi'}
                    </div>
                    <p className="text-[11px] text-[#70665F] font-medium leading-relaxed">
                      2D/3D CAD Drawing & Structural Calculation Completed and validated against specs.
                    </p>
                  </div>

                  {/* Tier 2 */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-white border border-emerald-500/30 space-y-2.5 shadow-2xs hover:border-emerald-500 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[11px] text-emerald-700 tracking-wide uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        TIER 2: DESIGN MANAGER
                      </span>
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                    <div className="font-black text-sm text-[#211B17]">
                      {activeJob.designManager || 'Ketan Patel (Design Manager)'}
                    </div>
                    <p className="text-[11px] text-[#70665F] font-medium leading-relaxed">
                      Master BOM Structuring, Item Part Quantities & Technical Specs Verified.
                    </p>
                  </div>

                  {/* Tier 3 */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-white border border-emerald-500/30 space-y-2.5 shadow-2xs hover:border-emerald-500 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[11px] text-emerald-700 tracking-wide uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        TIER 3: TECH REVIEWER
                      </span>
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                    <div className="font-black text-sm text-[#211B17]">
                      Rajesh Patel (Technical Director)
                    </div>
                    <p className="text-[11px] text-[#70665F] font-medium leading-relaxed">
                      ASME Sec VIII Compliance, Safety Factors & Design Failure Mode Review Passed.
                    </p>
                  </div>

                  {/* Tier 4 */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-white border border-emerald-500/30 space-y-2.5 shadow-2xs hover:border-emerald-500 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[11px] text-emerald-700 tracking-wide uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        TIER 4: SUPER ADMIN
                      </span>
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                    <div className="font-black text-sm text-[#211B17]">
                      {activeJob.approvedBy || releaserName}
                    </div>
                    <p className="text-[11px] text-[#70665F] font-medium leading-relaxed">
                      Final Gateway Authorization for Purchase, Store Requisition & Production.
                    </p>
                  </div>
                </div>

                {/* Status Release Banner */}
                {isJobReleased(activeJob) ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-600/15 border-2 border-emerald-500/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-black text-sm sm:text-base text-emerald-900 tracking-tight flex items-center gap-2">
                          DESIGN RELEASED TO SHOP FLOOR
                        </div>
                        <div className="text-xs text-emerald-800 font-medium">
                          {activeJob.remarks || `Released to shop floor by ${activeJob.approvedBy || releaserName}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleRevoke}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Revoke and put back in review"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Revoke Release
                      </button>
                      <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        STEP 3 COMPLETED
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-600/15 border-2 border-amber-500/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                        <Clock className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-black text-sm text-amber-950">
                          Awaiting Final Shop Floor Release Authorization
                        </div>
                        <p className="text-xs text-amber-800 font-medium">
                          All 4 tier technical verifications are in place. Authorize handover to trigger material requirements.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleRelease}
                      disabled={isReleasing}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      {isReleasing ? 'Authorizing...' : 'Release Now'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#EBE3DB] space-y-3">
              <Layers className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-[#211B17]">No Design Job Selected</h3>
              <p className="text-xs text-[#70665F]">Please select a design job from the list on the left.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
