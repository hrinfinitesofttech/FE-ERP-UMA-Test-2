'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DesignRevisionLog } from '../../../types/designer';
import {
  RotateCcw,
  Plus,
  Search,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export default function DesignRevisionsPage() {
  const { designRevisions, addDesignRevision, designJobs, currentUser } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedDesignJobId, setSelectedDesignJobId] = useState('');
  const [reason, setReason] = useState<DesignRevisionLog['reason']>('Customer Change');
  const [description, setDescription] = useState('');
  const [materialImpact, setMaterialImpact] = useState('');
  const [costImpactAmount, setCostImpactAmount] = useState(120000);
  const [productionImpact, setProductionImpact] = useState('');
  const [timelineImpactDays, setTimelineImpactDays] = useState(3);
  const [purchaseImpact, setPurchaseImpact] = useState('');

  const filteredRevs = designRevisions.filter((r) => {
    return (
      r.revisionNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      r.jobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const desJob = designJobs.find((j) => j.id === selectedDesignJobId);
    if (!desJob) return;

    addDesignRevision({
      revisionNumber: `REV-0${designRevisions.length + 1}`,
      designJobId: desJob.id,
      projectId: desJob.projectId,
      jobNumber: desJob.jobNumber,
      reason,
      description,
      changedDrawingNumbers: [`GA-${desJob.jobNumber}-01 (Rev-01)`],
      changedBOMId: `BOM-${desJob.jobNumber}`,
      materialImpact,
      costImpactAmount: Number(costImpactAmount),
      productionImpact,
      timelineImpactDays: Number(timelineImpactDays),
      purchaseImpact,
      createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
      reviewedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      approvedBy: 'Rajesh Patel',
      approvedDate: new Date().toISOString().split('T')[0],
      isReleased: true,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6  text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-mono font-bold">
              MODULE 3.10
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <RotateCcw className="w-7 h-7 text-pink-400" />
              Engineering Change Notice (ECN / ECO) & Revision Impact
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Design Revisions Impact Analysis across Material, Cost Amount, Shop Floor Production & Purchase Orders
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-[#211B17] text-xs font-bold shadow-lg shadow-pink-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Record Design ECN Revision
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search ECN #, Revision, Job #, Description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Revisions List */}
      <div className="space-y-4">
        {filteredRevs.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-pink-500/40 transition space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-pink-500/20 text-pink-300 font-mono font-black text-xs">
                  {r.revisionNumber}
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">[{r.jobNumber}]</span>
                <span className="text-[#211B17] font-extrabold text-sm">{r.reason}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                APPROVED BY {r.approvedBy}
              </span>
            </div>

            <p className="text-xs text-[#544B45] leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB]">
              {r.description}
            </p>

            {/* 4-Column Impact Card Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <span className="text-[10px] text-[#70665F] block">COST IMPACT</span>
                <span className="text-emerald-400 font-bold">₹ {r.costImpactAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <span className="text-[10px] text-[#70665F] block">TIMELINE IMPACT</span>
                <span className="text-amber-400 font-bold">+{r.timelineImpactDays} Days</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <span className="text-[10px] text-[#70665F] block">MATERIAL IMPACT</span>
                <span className="text-[#3E2723] text-[11px] truncate block">{r.materialImpact}</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <span className="text-[10px] text-[#70665F] block">PURCHASE IMPACT</span>
                <span className="text-crm-brand- text-[11px] truncate block">{r.purchaseImpact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Revision ECN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-pink-400" />
                Record Engineering Change Notice (ECN)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Select Design Job *</label>
                <select
                  required
                  value={selectedDesignJobId}
                  onChange={(e) => setSelectedDesignJobId(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                >
                  <option value="">-- Select Job --</option>
                  {designJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName} ({j.designJobNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Revision Reason *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                >
                  <option value="Customer Change">Customer Change</option>
                  <option value="Technical Correction">Technical Correction</option>
                  <option value="Manufacturing Requirement">Manufacturing Requirement</option>
                  <option value="Material Availability">Material Availability</option>
                  <option value="Cost Optimization">Cost Optimization</option>
                </select>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Detailed Change Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why design is being revised..."
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Cost Impact Amount (₹)</label>
                  <input
                    type="number"
                    value={costImpactAmount}
                    onChange={(e) => setCostImpactAmount(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Timeline Delay (Days)</label>
                  <input
                    type="number"
                    value={timelineImpactDays}
                    onChange={(e) => setTimelineImpactDays(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Material Impact</label>
                <input
                  type="text"
                  placeholder="e.g. Upgraded motor stool & shaft dia to 75mm"
                  value={materialImpact}
                  onChange={(e) => setMaterialImpact(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Purchase / PO Impact</label>
                <input
                  type="text"
                  placeholder="e.g. Cancelled 12.5HP PO, reissued PO for 15HP motor"
                  value={purchaseImpact}
                  onChange={(e) => setPurchaseImpact(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-[#544B45] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-[#211B17] font-bold"
                >
                  Save Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
