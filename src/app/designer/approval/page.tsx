'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import {
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Search,
  Layers,
  Building2,
  Calendar,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
  Check,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Send,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { DesignJob, DesignJobStatus } from '../../../types/designer';

export default function DesignApprovalPage() {
  const {
    designJobs,
    approveDesignJob,
    disapproveDesignJob,
    releaseDesignToManufacturing,
    revokeDesignRelease,
    currentUser,
    boms,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'released' | 'rejected'>('all');

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDisapproveModal, setShowDisapproveModal] = useState(false);
  const [approverName, setApproverName] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('Drawings and calculations verified against specs. Approved for production.');
  const [disapproverName, setDisapproverName] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const releaserName = useMemo(() => {
    return (
      currentUser?.name ||
      `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
      'Super Admin'
    );
  }, [currentUser]);

  useEffect(() => {
    if (releaserName) {
      setApproverName(releaserName);
      setDisapproverName(releaserName);
    }
  }, [releaserName]);

  const getJobStatusCategory = (job?: DesignJob): 'pending' | 'approved' | 'released' | 'rejected' => {
    if (!job) return 'pending';
    const st = String(job.status || '').toLowerCase();
    const rm = String(job.remarks || '').toLowerCase();

    if (st === 'released_to_production' || st === 'released' || rm.includes('released to shop floor')) {
      return 'released';
    }
    if (st === 'approved' || st === 'bom_approved' || Boolean(job.approvedBy && !job.disapprovedBy)) {
      return 'approved';
    }
    if (st === 'disapproved' || st === 'rejected' || Boolean(job.disapprovedBy && !job.approvedBy)) {
      return 'rejected';
    }
    return 'pending';
  };

  // Filtered design jobs
  const filteredJobs = useMemo(() => {
    return designJobs.filter((job) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (job.designJobNumber || '').toLowerCase().includes(q) ||
        (job.jobNumber || '').toLowerCase().includes(q) ||
        (job.productName || '').toLowerCase().includes(q) ||
        (job.customerName || '').toLowerCase().includes(q) ||
        (job.projectId || '').toLowerCase().includes(q);

      const category = getJobStatusCategory(job);
      if (statusFilter === 'all') return matchesSearch;
      return matchesSearch && category === statusFilter;
    });
  }, [designJobs, searchQuery, statusFilter]);

  // Active selected job
  const activeJob = useMemo(() => {
    if (selectedJobId) {
      const found = designJobs.find(
        (j) => j.id === selectedJobId || j.designJobNumber === selectedJobId
      );
      if (found) return found;
    }
    return filteredJobs[0] || designJobs[0] || null;
  }, [selectedJobId, designJobs, filteredJobs]);

  // Linked BOM
  const activeBOM = useMemo(() => {
    if (!activeJob) return null;
    return boms.find(
      (b) =>
        b.designJobId === activeJob.id ||
        b.designJobId === activeJob.designJobNumber ||
        b.jobNumber === activeJob.jobNumber ||
        (activeJob.projectId && b.projectId === activeJob.projectId)
    );
  }, [boms, activeJob]);

  // Quick Metrics
  const totalCount = designJobs.length;
  const pendingCount = designJobs.filter((j) => getJobStatusCategory(j) === 'pending').length;
  const approvedCount = designJobs.filter((j) => getJobStatusCategory(j) === 'approved').length;
  const releasedCount = designJobs.filter((j) => getJobStatusCategory(j) === 'released').length;
  const rejectedCount = designJobs.filter((j) => getJobStatusCategory(j) === 'rejected').length;

  const activeCategory = getJobStatusCategory(activeJob || undefined);

  // Actions
  const handleConfirmApprove = () => {
    if (!activeJob) return;
    const by = approverName.trim() || releaserName;
    const notes = approvalNotes.trim() || 'Approved after technical review.';

    approveDesignJob(activeJob.id, by, notes);
    setShowApproveModal(false);
    setActionSuccessMessage(`✅ Design Job ${activeJob.designJobNumber} approved by ${by}. Ready for Shop Floor Release!`);
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleConfirmDisapprove = () => {
    if (!activeJob) return;
    const by = disapproverName.trim() || releaserName;
    const reason = rejectionReason.trim() || 'Design requires adjustments and technical revision.';

    disapproveDesignJob(activeJob.id, by, reason);
    setShowDisapproveModal(false);
    setRejectionReason('');
    setActionSuccessMessage(`❌ Design Job ${activeJob.designJobNumber} marked for revision. Reason recorded.`);
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleRelease = () => {
    if (!activeJob) return;
    releaseDesignToManufacturing(activeJob.id, releaserName);
    setActionSuccessMessage(`🚀 Design Job ${activeJob.designJobNumber} successfully released to Shop Floor & Manufacturing!`);
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleRevoke = () => {
    if (!activeJob) return;
    if (window.confirm(`Are you sure you want to revoke release for ${activeJob.designJobNumber}? Status will return to Review.`)) {
      revokeDesignRelease(activeJob.id, releaserName);
      setActionSuccessMessage(`⚠️ Release revoked for ${activeJob.designJobNumber}. Status reset to Review.`);
      setTimeout(() => setActionSuccessMessage(null), 5000);
    }
  };

  if (!mounted) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto space-y-6">
        <div className="h-28 bg-[#FAF7F2] animate-pulse rounded-3xl border border-[#EBE3DB]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 bg-[#FAF7F2] animate-pulse rounded-3xl border border-[#EBE3DB]" />
          <div className="lg:col-span-8 h-96 bg-[#FAF7F2] animate-pulse rounded-3xl border border-[#EBE3DB]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-[#211B17]">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#FAF0E6] via-white to-[#F0FDF4] p-6 rounded-3xl border border-[#EBE3DB] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-emerald-700 text-white text-[11px] font-mono font-bold tracking-wider uppercase">
                MODULE 3.12
              </span>
              <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                Design & Engineering Gateway
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#211B17] tracking-tight flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </span>
              Design Approval & Shop Floor Release Gateway
            </h1>
            <p className="text-xs sm:text-sm text-[#70665F] font-medium max-w-3xl">
              Authorize engineering designs, verify BOM structures, request revisions, and release validated equipment to the manufacturing floor.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-2 rounded-2xl border text-center transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white border-[#211B17] shadow-sm ring-1 ring-[#211B17]'
                  : 'bg-white/80 border-[#EBE3DB] hover:bg-white'
              }`}
            >
              <div className="text-[10px] text-[#70665F] font-bold uppercase">All Jobs</div>
              <div className="text-sm font-black text-[#211B17]">{totalCount}</div>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-2 rounded-2xl border text-center transition cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-white/80 border-[#EBE3DB] hover:bg-white'
              }`}
            >
              <div className="text-[10px] text-amber-700 font-bold uppercase">Pending</div>
              <div className="text-sm font-black text-amber-600">{pendingCount}</div>
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3.5 py-2 rounded-2xl border text-center transition cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white/80 border-[#EBE3DB] hover:bg-white'
              }`}
            >
              <div className="text-[10px] text-blue-700 font-bold uppercase">Approved</div>
              <div className="text-sm font-black text-blue-600">{approvedCount}</div>
            </button>
            <button
              onClick={() => setStatusFilter('released')}
              className={`px-3.5 py-2 rounded-2xl border text-center transition cursor-pointer ${
                statusFilter === 'released'
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                  : 'bg-white/80 border-[#EBE3DB] hover:bg-white'
              }`}
            >
              <div className="text-[10px] text-emerald-700 font-bold uppercase">Released</div>
              <div className="text-sm font-black text-emerald-600">{releasedCount}</div>
            </button>
            {rejectedCount > 0 && (
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3.5 py-2 rounded-2xl border text-center transition cursor-pointer ${
                  statusFilter === 'rejected'
                    ? 'bg-rose-50 border-rose-500 shadow-sm ring-1 ring-rose-500'
                    : 'bg-white/80 border-[#EBE3DB] hover:bg-white'
                }`}
              >
                <div className="text-[10px] text-rose-700 font-bold uppercase">Revision Req.</div>
                <div className="text-sm font-black text-rose-600">{rejectedCount}</div>
              </button>
            )}
          </div>
        </div>

        {/* Live Notification Banner */}
        {actionSuccessMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span>{actionSuccessMessage}</span>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-[#EBE3DB] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#211B17] flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Select Design Job
              </h2>
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
            <div className="flex flex-wrap gap-1 p-1 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] text-[11px] font-bold">
              {(['all', 'pending', 'approved', 'released', 'rejected'] as const).map((tab) => {
                if (tab === 'rejected' && rejectedCount === 0) return null;
                const labels: Record<string, string> = {
                  all: `All (${totalCount})`,
                  pending: `Pending (${pendingCount})`,
                  approved: `Approved (${approvedCount})`,
                  released: `Released (${releasedCount})`,
                  rejected: `Revision (${rejectedCount})`,
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`flex-1 py-1 px-2 rounded-lg transition text-center whitespace-nowrap cursor-pointer ${
                      statusFilter === tab
                        ? 'bg-white text-[#211B17] shadow-xs'
                        : 'text-[#70665F] hover:text-[#211B17]'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Job List */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredJobs.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#EBE3DB] text-xs text-[#70665F]">
                  No design jobs match the selected filter.
                </div>
              ) : (
                filteredJobs.map((j) => {
                  const isSelected = activeJob?.id === j.id || activeJob?.designJobNumber === j.designJobNumber;
                  const cat = getJobStatusCategory(j);

                  const badgeStyles: Record<string, string> = {
                    pending: 'bg-amber-100 text-amber-800 border-amber-300',
                    approved: 'bg-blue-100 text-blue-800 border-blue-300',
                    released: 'bg-emerald-600 text-white border-emerald-600',
                    rejected: 'bg-rose-100 text-rose-800 border-rose-300',
                  };

                  const badgeLabels: Record<string, string> = {
                    pending: 'PENDING',
                    approved: 'APPROVED',
                    released: 'RELEASED',
                    rejected: 'REVISION',
                  };

                  return (
                    <button
                      key={j.id || j.designJobNumber}
                      onClick={() => setSelectedJobId(j.id || j.designJobNumber)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative group cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-50/70 to-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-[#FAF7F2]/80 hover:bg-white border-[#EBE3DB] hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                              {j.designJobNumber}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {j.jobNumber}
                            </span>
                          </div>
                          <div className="font-extrabold text-xs text-[#211B17] truncate group-hover:text-emerald-800 transition">
                            {j.productName}
                          </div>
                          <div className="text-[11px] text-[#70665F] flex items-center gap-1.5 truncate">
                            <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{j.customerName || 'Customer'}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap border shrink-0 ${badgeStyles[cat]}`}
                        >
                          {badgeLabels[cat]}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Review & Easy Approval Center (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeJob ? (
            <>
              {/* Card 1: Job Header & Direct Action Bar */}
              <div className="p-6 rounded-3xl bg-white border border-[#EBE3DB] shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#FAF7F2] pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-emerald-800 text-sm bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200">
                        {activeJob.designJobNumber}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-lg">
                        Rev: <strong className="text-emerald-800">{activeJob.activeRevision || 'REV-00'}</strong>
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#211B17] tracking-tight">
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
                      <span className="font-mono font-black text-amber-700 text-sm">
                        {activeJob.projectId || 'PRJ-2026'} / {activeJob.jobNumber}
                      </span>
                    </div>
                    {activeBOM && (
                      <div className="text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1 mt-1">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        BOM: {activeBOM.bomNumber}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Hero Banner */}
                {activeCategory === 'released' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-emerald-950">
                          RELEASED TO SHOP FLOOR (MANUFACTURING ACTIVE)
                        </div>
                        <div className="text-xs text-emerald-800 font-medium">
                          {activeJob.remarks || `Released to production by ${activeJob.approvedBy || releaserName}`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRevoke}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Revoke Release
                    </button>
                  </div>
                )}

                {activeCategory === 'approved' && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-300 text-blue-900 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-blue-950">
                          DESIGN APPROVED & VERIFIED
                        </div>
                        <div className="text-xs text-blue-800 font-medium">
                          Approved by {activeJob.approvedBy || releaserName} {activeJob.approvedDate ? `on ${activeJob.approvedDate}` : ''}. Ready to be released to shop floor!
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRelease}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30 shrink-0"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      RELEASE TO MANUFACTURING
                    </button>
                  </div>
                )}

                {activeCategory === 'rejected' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-600 text-white shadow-sm">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-rose-950">
                          REVISION REQUESTED / DISAPPROVED
                        </div>
                        <div className="text-xs text-rose-800 font-medium">
                          Reason: <strong>{activeJob.disapprovalReason || activeJob.rejectionReason || activeJob.remarks || 'Engineering adjustment needed.'}</strong>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowApproveModal(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-xs shrink-0"
                    >
                      Re-Approve Design
                    </button>
                  </div>
                )}

                {activeCategory === 'pending' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-amber-950">
                          Awaiting Technical & Managerial Authorization
                        </div>
                        <div className="text-xs text-amber-800 font-medium">
                          Review specifications and BOM below. Click Approve to authorize handover.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setShowDisapproveModal(true)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <XCircle className="w-4 h-4" />
                        Request Revision
                      </button>
                      <button
                        onClick={() => setShowApproveModal(true)}
                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Design
                      </button>
                    </div>
                  </div>
                )}

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
                      {activeJob.machineType || 'Process Equipment Unit'}
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

              {/* Card 2: Linked Master BOM Summary */}
              <div className="p-6 rounded-3xl bg-white border border-[#EBE3DB] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
                  <h3 className="text-xs font-black text-[#211B17] uppercase tracking-wider flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Linked Master Bill of Materials (BOM)
                  </h3>
                  <Link
                    href={`/designer/bom?job=${activeJob.jobNumber || ''}`}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                  >
                    Open BOM Editor <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {activeBOM ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DB]">
                    <div>
                      <span className="text-[10px] text-[#70665F] font-bold uppercase block">BOM Number</span>
                      <span className="font-mono font-bold text-xs text-[#211B17] block mt-0.5">
                        {activeBOM.bomNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#70665F] font-bold uppercase block">Total Line Items</span>
                      <span className="font-black text-xs text-[#211B17] block mt-0.5">
                        {activeBOM.totalItemsCount || (activeBOM.items || []).length} Items
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#70665F] font-bold uppercase block">Estimated Cost</span>
                      <span className="font-mono font-black text-xs text-emerald-700 block mt-0.5">
                        ₹{Number(activeBOM.totalEstimatedCost || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#70665F] font-bold uppercase block">BOM Status</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white border border-gray-300 inline-block mt-0.5">
                        {activeBOM.status || 'draft'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-dashed border-[#EBE3DB] text-xs text-[#70665F] flex items-center justify-between">
                    <span>No BOM currently linked to this design job.</span>
                    <Link
                      href={`/designer/bom?job=${activeJob.jobNumber || ''}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition"
                    >
                      Create BOM
                    </Link>
                  </div>
                )}
              </div>

              {/* Card 3: 4-Tier Verification Hierarchy */}
              <div className="p-6 rounded-3xl bg-white border border-[#EBE3DB] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
                  <h3 className="text-xs font-black text-[#211B17] uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    4-Tier Authorization & Sign-Off Matrix
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {activeCategory === 'released' ? '4 of 4 Verified' : activeCategory === 'approved' ? '3 of 4 Verified' : '2 of 4 Verified'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Tier 1 */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[11px] text-emerald-800 uppercase flex items-center gap-1.5">
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
                    <p className="text-[11px] text-[#70665F] leading-relaxed">
                      2D/3D CAD Drawing & Structural Calculation validated against technical parameters.
                    </p>
                  </div>

                  {/* Tier 2 */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[11px] text-emerald-800 uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        TIER 2: DESIGN MANAGER
                      </span>
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                    <div className="font-black text-sm text-[#211B17]">
                      {activeJob.designManager || 'Ketan Patel'}
                    </div>
                    <p className="text-[11px] text-[#70665F] leading-relaxed">
                      Master BOM Structuring, Item Part Quantities & Technical Specifications Verified.
                    </p>
                  </div>

                  {/* Tier 3 */}
                  <div className={`p-4 rounded-2xl border space-y-2 transition ${
                    activeCategory === 'approved' || activeCategory === 'released'
                      ? 'bg-[#FAF7F2] border-emerald-300'
                      : 'bg-white border-amber-300 ring-1 ring-amber-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[11px] text-[#211B17] uppercase flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${activeCategory === 'approved' || activeCategory === 'released' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        TIER 3: TECHNICAL DIRECTOR
                      </span>
                      {activeCategory === 'approved' || activeCategory === 'released' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                          ⏳
                        </div>
                      )}
                    </div>
                    <div className="font-black text-sm text-[#211B17]">
                      {activeJob.approvedBy || 'Rajesh Patel (Technical Director)'}
                    </div>
                    <p className="text-[11px] text-[#70665F] leading-relaxed">
                      ASME Compliance, Design Safety Factors & Engineering Failure Mode Review.
                    </p>
                  </div>

                  {/* Tier 4 */}
                  <div className={`p-4 rounded-2xl border space-y-2 transition ${
                    activeCategory === 'released'
                      ? 'bg-[#FAF7F2] border-emerald-300'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[11px] text-[#211B17] uppercase flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${activeCategory === 'released' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        TIER 4: SUPER ADMIN RELEASE
                      </span>
                      {activeCategory === 'released' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold">
                          —
                        </div>
                      )}
                    </div>
                    <div className="font-black text-sm text-[#211B17]">
                      {activeJob.approvedBy || releaserName}
                    </div>
                    <p className="text-[11px] text-[#70665F] leading-relaxed">
                      Final Gateway Authorization for Purchase, Store Requisition & Production.
                    </p>
                  </div>
                </div>
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

      {/* APPROVE DESIGN MODAL */}
      {showApproveModal && activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#EBE3DB] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#211B17]">Approve Design Job</h3>
                  <p className="text-xs text-[#70665F] font-mono">{activeJob.designJobNumber} ({activeJob.jobNumber})</p>
                </div>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#70665F] uppercase mb-1">
                  Approver Name / Role
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] font-bold text-[#211B17] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="e.g. Rajesh Patel (Technical Director)"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#70665F] uppercase mb-1">
                  Approval Notes & Remarks
                </label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#211B17] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Notes on drawings, structural calculations, and compliance verification..."
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                Approving this job validates the 3D/2D CAD models and marks the linked Master BOM as Approved. You can then release it to the shop floor.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                Confirm & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISAPPROVE / REVISION REQUEST MODAL */}
      {showDisapproveModal && activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#EBE3DB] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#211B17]">Request Design Revision</h3>
                  <p className="text-xs text-[#70665F] font-mono">{activeJob.designJobNumber} ({activeJob.jobNumber})</p>
                </div>
              </div>
              <button
                onClick={() => setShowDisapproveModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#70665F] uppercase mb-1">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={disapproverName}
                  onChange={(e) => setDisapproverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] font-bold text-[#211B17] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  placeholder="e.g. Ketan Patel (Design Manager)"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#70665F] uppercase mb-1">
                  Reason for Revision / Rejection <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#211B17] font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  placeholder="Specify drawing discrepancies, BOM mismatches, or calculation errors..."
                />
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-[11px] leading-relaxed">
                The design status will be updated to Revision Required and the design team will be notified with your feedback.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDisapproveModal(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisapprove}
                disabled={!rejectionReason.trim()}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs transition shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Submit Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
