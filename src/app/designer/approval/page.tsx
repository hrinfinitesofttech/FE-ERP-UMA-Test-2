'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function DesignApprovalPage() {
  const { designJobs, releaseDesignToManufacturing, currentUser, boms } = useERP();

  const [selectedJobId, setSelectedJobId] = useState(designJobs[0]?.id || '');
  const activeJob = designJobs.find((j) => j.id === selectedJobId) || designJobs[0];
  const activeBOM = boms.find((b) => b.designJobId === activeJob?.id || b.jobNumber === activeJob?.jobNumber);

  const releaserName = (currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()) || 'Admin User';

  const handleRelease = () => {
    if (!activeJob) return;
    releaseDesignToManufacturing(activeJob.id, releaserName);
  };

  return (
    <div className="p-6 space-y-6  text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              MODULE 3.12
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Zap className="w-7 h-7 text-emerald-400" />
              4-Tier Design Approval & Shop Floor Release Gateway
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Formal Engineering Handover: Triggers Material Planning, Purchase Orders & Production Readiness
          </p>
        </div>

        {activeJob && activeJob.status !== 'released_to_production' && (
          <button
            onClick={handleRelease}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-black shadow-xl shadow-emerald-600/40 transition animate-bounce"
          >
            <Zap className="w-5 h-5 fill-current" />
            RELEASE DESIGN TO MANUFACTURING
          </button>
        )}
      </div>

      {/* Select Job & Active Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Selector */}
        <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] space-y-4">
          <h3 className="text-sm font-extrabold text-[#211B17]">Select Design Job for Approval</h3>
          <div className="space-y-2">
            {designJobs.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedJobId(j.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                  selectedJobId === j.id
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-[#211B17]'
                    : 'bg-[#FAF7F2] border-[#EBE3DB] text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                <div>
                  <div className="font-mono font-bold text-xs text-crm-brand-500">{j.designJobNumber}</div>
                  <div className="font-mono text-[10px] text-amber-400">{j.jobNumber}</div>
                  <div className="font-extrabold text-xs text-[#3E2723] mt-1">{j.productName}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    j.status === 'released_to_production'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {j.status?.replace(/_/g, ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: 4-Tier Approval Stepper & Release Details */}
        {activeJob && (
          <div className="lg:col-span-2 space-y-5">
            {/* Active Job Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-crm-brand-500 text-sm">{activeJob.designJobNumber}</span>
                  <h3 className="text-lg font-black text-[#211B17]">{activeJob.productName}</h3>
                  <span className="text-xs text-[#70665F]">Customer: {activeJob.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#70665F] block font-mono">PROJECT & JOB</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{activeJob.projectId} / {activeJob.jobNumber}</span>
                  <div className="mt-1 font-mono text-crm-brand- text-xs font-bold">Revision: {activeJob.activeRevision}</div>
                </div>
              </div>
            </div>

            {/* 4-Tier Approval Stepper */}
            <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] space-y-4">
              <h4 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                4-Tier Authorization & Sign-off Hierarchy
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Tier 1 */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">TIER 1: LEAD DESIGNER</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-[#211B17]">{activeJob.assignedDesigner}</div>
                  <p className="text-[10px] text-[#70665F]">2D/3D CAD Drawing & Structural Calculation Completed</p>
                </div>

                {/* Tier 2 */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">TIER 2: DESIGN MANAGER</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-[#211B17]">Ketan Patel (Design Manager)</div>
                  <p className="text-[10px] text-[#70665F]">Master BOM Structuring & Item Quantities Verified</p>
                </div>

                {/* Tier 3 */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">TIER 3: TECH REVIEWER</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-[#211B17]">Rajesh Patel (Technical Director)</div>
                  <p className="text-[10px] text-[#70665F]">ASME Sec VIII Compliance & Safety Audit Checklist Passed</p>
                </div>

                {/* Tier 4 */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">TIER 4: SUPER ADMIN</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-[#211B17]">{releaserName}</div>
                  <p className="text-[10px] text-[#70665F]">Final Release Authorization to Purchase & Production</p>
                </div>
              </div>

              {/* Status Release Banner */}
              {activeJob.status === 'released_to_production' ? (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-bold">DESIGN RELEASED TO SHOP FLOOR</div>
                      <div className="text-[10px] text-emerald-400">{activeJob.remarks}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded bg-emerald-600 text-[#211B17] font-bold text-xs">
                    STEP 3 COMPLETED
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>Awaiting Final Shop Floor Release Authorization</span>
                  </div>
                  <button
                    onClick={handleRelease}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-extrabold text-xs transition"
                  >
                    Release Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
