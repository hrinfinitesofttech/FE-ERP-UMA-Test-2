'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Design3DModel } from '../../../types/designer';
import {
  Box,
  Plus,
  Search,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  User,
  X,
  Layers,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export default function Designs3DPage() {
  const { designs3D, addDesign3D, designJobs, currentUser } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<Design3DModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload Form
  const [selectedDesignJobId, setSelectedDesignJobId] = useState('');
  const [modelTitle, setModelTitle] = useState('');
  const [software, setSoftware] = useState<Design3DModel['software']>('SolidWorks');
  const [fileFormat, setFileFormat] = useState<Design3DModel['fileFormat']>('STEP');
  const [totalWeightKg, setTotalWeightKg] = useState(4850);
  const [material, setMaterial] = useState('SS 316L Contact Parts');

  const filteredModels = designs3D.filter((m) => {
    return (
      (m.modelNumber && m.modelNumber?.toLowerCase().includes(searchQuery?.toLowerCase())) ||
      (m.modelTitle && m.modelTitle?.toLowerCase().includes(searchQuery?.toLowerCase())) ||
      m.jobNumber?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const desJob = designJobs.find((j) => j.id === selectedDesignJobId);
    if (!desJob) return;

    addDesign3D({
      designJobId: desJob.id,
      projectId: desJob.projectId,
      jobNumber: desJob.jobNumber,
      modelNumber: `MOD3D-${desJob.jobNumber}-01`,
      modelTitle,
      software,
      fileFormat,
      fileSize: '48.2 MB',
      fileUrl: '#',
      totalWeightKg: Number(totalWeightKg),
      centerOfGravity: 'X: 0, Y: 1450mm, Z: 0',
      interferenceCheckPassed: true,
      modeledBy: `${currentUser.firstName} ${currentUser.lastName}`,
      approvalStatus: 'approved',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6  text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30 text-xs font-mono font-bold">
              MODULE 3.5
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Box className="w-7 h-7 text-crm-brand-500" />
              3D CAD Models Repository (SolidWorks / STEP / IGES)
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Solid CAD Assemblies, Mass Properties, Weight Calculation & Clearance Interference Verification
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] text-xs font-bold shadow-lg shadow-crm-brand-700/30 transition"
        >
          <Plus className="w-4 h-4" />
          Upload 3D CAD Model
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search 3D Model #, Title, Job #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-crm-brand-600"
          />
        </div>
      </div>

      {/* 3D Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModels.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-crm-brand-600/40 transition space-y-4 shadow-xl relative group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-sm text-crm-brand-500">{m.modelNumber}</span>
              <span className="px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- font-mono text-[10px] font-bold">
                {m.software} ({m.fileFormat})
              </span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#70665F]">
                <span>JOB REF: <strong className="text-amber-400">{m.jobNumber}</strong></span>
                <span>WEIGHT: <strong className="text-emerald-400">{m.totalWeightKg} Kg</strong></span>
              </div>
              <h4 className="font-extrabold text-[#211B17] text-sm">{m.modelTitle}</h4>
              <div className="text-[11px] text-[#70665F] flex items-center justify-between mt-1">
                <span>CG: {m.centerOfGravity || 'Centered'}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  No Interference
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#70665F]">
              <span>Modeled By: <strong className="text-[#3E2723]">{m.modeledBy}</strong></span>
              <span className="font-mono text-crm-brand-500 font-bold">{m.fileSize}</span>
            </div>

            <div className="pt-2 border-t border-[#EBE3DB]">
              <button
                onClick={() => setSelectedModel(m)}
                className="w-full px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#3E2723] text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Eye className="w-4 h-4 text-crm-brand-500" />
                3D CAD Interactive View & Mass Props
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3D Model Viewer Simulation Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-4 p-6 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono font-bold text-crm-brand-500 text-sm">{selectedModel.modelNumber}</span>
                <h3 className="text-base font-extrabold text-[#211B17] mt-0.5">{selectedModel.modelTitle}</h3>
              </div>
              <button onClick={() => setSelectedModel(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated 3D CAD WebGL Viewport */}
            <div className="w-full h-80 bg-[#0A0614] border-2 border-crm-brand-600/30 rounded-xl relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-crm-brand-700/30 to-crm-brand-700/20 border border-crm-brand-500/30 flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                <Box className="w-16 h-16 text-crm-brand-500 animate-pulse" />
              </div>

              <div className="mt-4 space-y-1 relative z-10">
                <h4 className="font-mono font-bold text-[#211B17] text-sm">3D SOLID ASSEMBLY CAD MODEL VIEWPORT</h4>
                <p className="text-[#70665F] text-xs font-mono">Job: {selectedModel.jobNumber} | Total Mass: {selectedModel.totalWeightKg} Kg</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>3D Assembly Clearance & Interference Check 100% PASSED</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="font-mono text-[#70665F]">
                <span>Center of Gravity: <strong className="text-[#211B17]">{selectedModel.centerOfGravity}</strong></span>
              </div>
              <button
                onClick={() => alert(`Downloading 3D STEP Assembly file for ${selectedModel.modelNumber}...`)}
                className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download {selectedModel.fileFormat} File ({selectedModel.fileSize})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload 3D Model */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <Box className="w-5 h-5 text-crm-brand-500" />
                Upload 3D CAD Model
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
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
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
                <label className="text-[#544B45] font-bold block mb-1">Model Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3D Full Assembly - 10,000L Reaction Vessel"
                  value={modelTitle}
                  onChange={(e) => setModelTitle(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Software</label>
                  <select
                    value={software}
                    onChange={(e) => setSoftware(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    <option value="SolidWorks">SolidWorks</option>
                    <option value="AutoCAD 3D">AutoCAD 3D</option>
                    <option value="Inventor">Inventor</option>
                    <option value="Creo">Creo Parametric</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Total Mass (Kg)</label>
                  <input
                    type="number"
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-bold"
                >
                  Upload 3D Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
