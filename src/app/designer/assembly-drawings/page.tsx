'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { AssemblyDrawing } from '../../../types/designer';
import {
  Layers,
  Plus,
  Search,
  Eye,
  Download,
  FileCheck,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export default function AssemblyDrawingsPage() {
  const { assemblyDrawings, addAssemblyDrawing, designJobs, currentUser } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsm, setSelectedAsm] = useState<AssemblyDrawing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedDesignJobId, setSelectedDesignJobId] = useState('');
  const [assemblyTitle, setAssemblyTitle] = useState('');
  const [subAssemblyCode, setSubAssemblyCode] = useState('');

  const filteredAsm = assemblyDrawings.filter((a) => {
    return (
      a.assemblyNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      (a.assemblyTitle && a.assemblyTitle?.toLowerCase().includes(searchQuery?.toLowerCase())) ||
      a.jobNumber?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const desJob = designJobs.find((j) => j.id === selectedDesignJobId);
    if (!desJob) return;

    addAssemblyDrawing({
      designJobId: desJob.id,
      projectId: desJob.projectId,
      jobNumber: desJob.jobNumber,
      assemblyNumber: `ASM-${desJob.jobNumber}-01`,
      assemblyTitle,
      subAssemblyCode: subAssemblyCode || 'SUB-ASM-AGITATOR',
      parentAssemblyNumber: `GA-${desJob.jobNumber}-01`,
      revisionNumber: 'REV-00',
      fileFormat: 'DWG',
      fileSize: '8.4 MB',
      fileUrl: '#',
      linkedBOMItemId: 'bi-5',
      drawnBy: `${currentUser.firstName} ${currentUser.lastName}`,
      approvedBy: 'Rajesh Patel',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6  text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              MODULE 3.6
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Layers className="w-7 h-7 text-emerald-400" />
              Sub-Assembly Drawings Vault
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Sub-Assembly Drawings Linked directly to BOM Tree Hierarchy, Welding Specs & Bill of Materials
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Add Assembly Drawing
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Assembly #, Title, Job #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Assembly Drawings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAsm.map((a) => (
          <div
            key={a.id}
            className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-emerald-500/40 transition space-y-3 shadow-xl relative"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-sm text-emerald-400">{a.assemblyNumber}</span>
              <span className="px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- font-mono text-[10px] font-bold">
                {a.revisionNumber}
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#70665F]">
                <span>JOB REF: <strong className="text-amber-400">{a.jobNumber}</strong></span>
                <span>SUB-CODE: <strong className="text-emerald-300">{a.subAssemblyCode}</strong></span>
              </div>
              <h4 className="font-extrabold text-[#211B17] text-sm">{a.assemblyTitle}</h4>
              <p className="text-[11px] text-[#70665F]">Parent GA: {a.parentAssemblyNumber || 'Main GA'}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#70665F]">
              <span>Drawn By: <strong className="text-[#3E2723]">{a.drawnBy}</strong></span>
              <span className="font-mono text-crm-brand-500 font-bold">{a.fileFormat} ({a.fileSize})</span>
            </div>

            <div className="pt-2 border-t border-[#EBE3DB]">
              <button
                onClick={() => setSelectedAsm(a)}
                className="w-full px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#3E2723] text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                View Assembly Blueprint
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assembly Viewer Modal */}
      {selectedAsm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 p-6 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono font-bold text-emerald-400 text-sm">{selectedAsm.assemblyNumber}</span>
                <h3 className="text-base font-extrabold text-[#211B17] mt-0.5">{selectedAsm.assemblyTitle}</h3>
              </div>
              <button onClick={() => setSelectedAsm(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] font-mono space-y-2">
              <div className="grid grid-cols-2 gap-3 text-[#544B45]">
                <div>Job Number: <strong className="text-amber-400">{selectedAsm.jobNumber}</strong></div>
                <div>Sub-Assembly Code: <strong className="text-emerald-300">{selectedAsm.subAssemblyCode}</strong></div>
                <div>Revision: <strong className="text-crm-brand-500">{selectedAsm.revisionNumber}</strong></div>
                <div>Approved By: <strong className="text-[#3E2723]">{selectedAsm.approvedBy}</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
              <button
                onClick={() => setSelectedAsm(null)}
                className="px-4 py-2 rounded-xl bg-white text-[#544B45] font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Assembly */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Add Sub-Assembly Drawing
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
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Select Job --</option>
                  {designJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.designJobNumber} ({j.jobNumber}) - {j.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Assembly Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agitator Shaft & Blade Assembly"
                  value={assemblyTitle}
                  onChange={(e) => setAssemblyTitle(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Sub-Assembly Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUB-ASM-AGITATOR"
                  value={subAssemblyCode}
                  onChange={(e) => setSubAssemblyCode(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-bold"
                >
                  Save Assembly Drawing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
