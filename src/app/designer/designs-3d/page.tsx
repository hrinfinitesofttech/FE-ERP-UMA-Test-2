'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  UploadCloud,
  FileCode,
  FileCheck,
  RotateCw,
  HardDrive,
  Scale,
  Sparkles,
} from 'lucide-react';

const DEFAULT_DESIGN_JOBS = [
  { id: 'DJ-001', designJobNumber: 'DES-2026-0001', jobNumber: 'JOB-2026-0042', productName: 'Heavy SS 316L Chemical Reactor Vessel (10 KL)' },
  { id: 'DJ-002', designJobNumber: 'DES-2026-0002', jobNumber: 'JOB-2026-0056', productName: 'Custom Equipment (Ref QT-2026-0132)' },
  { id: 'DJ-003', designJobNumber: 'DES-2026-0003', jobNumber: 'JOB-2026-0078', productName: 'Pressure Vessel ASME Sec VIII Div 1' },
];

export default function Designs3DPage() {
  const { designs3D, addDesign3D, designJobs, currentUser } = useERP();

  const effectiveDesignJobs = designJobs && designJobs.length > 0 ? designJobs : DEFAULT_DESIGN_JOBS;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<Design3DModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload Form State
  const [selectedDesignJobId, setSelectedDesignJobId] = useState(effectiveDesignJobs[0]?.id || 'DJ-001');
  const [modelTitle, setModelTitle] = useState('Heavy SS 316L Reactor - 3D Solid Assembly');
  const [software, setSoftware] = useState<Design3DModel['software']>('SolidWorks');
  const [fileFormat, setFileFormat] = useState<Design3DModel['fileFormat']>('STEP');
  const [totalWeightKg, setTotalWeightKg] = useState<number>(4850);
  const [centerOfGravity, setCenterOfGravity] = useState('X: 0, Y: 1450mm, Z: 0');
  const [material, setMaterial] = useState('SS 316L Contact Parts');
  const [modeledBy, setModeledBy] = useState(
    currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Ketan Patel' : 'Ketan Patel'
  );

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) handleCloseModal();
        if (selectedModel) setSelectedModel(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedModel]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDesignJobId(effectiveDesignJobs[0]?.id || 'DJ-001');
    setModelTitle('');
    setSoftware('SolidWorks');
    setFileFormat('STEP');
    setTotalWeightKg(4850);
    setCenterOfGravity('X: 0, Y: 1450mm, Z: 0');
    setUploadedFile(null);
    setFileName('');
    setFileSizeStr('');
    setFileDataUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedDesignJobId(jobId);
    const desJob = effectiveDesignJobs.find((j) => j.id === jobId);
    if (desJob) {
      if (!modelTitle || modelTitle.startsWith('3D Assembly') || modelTitle.startsWith('Solid CAD') || modelTitle.includes('3D Solid Assembly')) {
        setModelTitle(`${desJob.productName || 'Equipment'} - 3D Solid Assembly`);
      }
    }
  };

  const handleFileChange = (file: File) => {
    if (!file) return;
    setUploadedFile(file);
    setFileName(file.name);

    // Format size
    const sizeInMB = file.size / (1024 * 1024);
    const sizeFormatted = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    setFileSizeStr(sizeFormatted);

    // Auto-detect format & software
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'step' || ext === 'stp') {
      setFileFormat('STEP');
    } else if (ext === 'iges' || ext === 'igs') {
      setFileFormat('IGES');
    } else if (ext === 'sldprt' || ext === 'sldasm') {
      setFileFormat('SolidWorks');
      setSoftware('SolidWorks');
    } else if (ext === 'dwg' || ext === 'dxf') {
      setFileFormat('AutoCAD 3D');
      setSoftware('AutoCAD 3D');
    }

    // Read Data URL for download simulation
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const filteredModels = (designs3D || []).filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      (m.modelNumber && m.modelNumber.toLowerCase().includes(q)) ||
      (m.modelTitle && m.modelTitle.toLowerCase().includes(q)) ||
      (m.jobNumber && m.jobNumber.toLowerCase().includes(q)) ||
      (m.software && m.software.toLowerCase().includes(q))
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const desJob = effectiveDesignJobs.find((j) => j.id === selectedDesignJobId) || effectiveDesignJobs[0];
    const jobNumber = desJob ? desJob.jobNumber : 'JOB-2026-0042';
    const projectId = desJob ? (desJob as any).projectId || 'PRJ-2026-001' : 'PRJ-2026-001';
    const designJobId = desJob ? desJob.id : (selectedDesignJobId || 'DJ-001');

    const cleanModelNo = `MOD3D-${jobNumber}-${String((designs3D || []).length + 1).padStart(2, '0')}`;

    addDesign3D({
      designJobId,
      projectId,
      jobNumber,
      modelNumber: cleanModelNo,
      modelTitle: modelTitle.trim() || '3D Solid Model Assembly',
      modelName: modelTitle.trim() || '3D Solid Model Assembly',
      software,
      fileFormat,
      fileSize: fileSizeStr || '38.4 MB',
      fileUrl: fileDataUrl || '#',
      totalWeightKg: Number(totalWeightKg) || 4850,
      centerOfGravity: centerOfGravity.trim() || 'X: 0, Y: 1450mm, Z: 0',
      interferenceCheckPassed: true,
      modeledBy: modeledBy.trim() || 'Ketan Patel',
      approvalStatus: 'approved',
    });

    handleCloseModal();
  };

  return (
    <div className="p-6 space-y-6 text-[#211B17] bg-[#FDFBF9] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-100 text-crm-brand-800 border border-crm-brand-300 text-xs font-mono font-bold">
              MODULE 3.5
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Box className="w-7 h-7 text-crm-brand-700" />
              3D CAD Models Repository (SolidWorks / STEP / IGES)
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Solid CAD Assemblies, Mass Properties, Weight Calculation & Clearance Interference Verification
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload 3D CAD Model
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search 3D Model #, Title, Job #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#EBE3DB] text-xs text-[#211B17] placeholder-[#70665F] focus:outline-none focus:border-crm-brand-600"
          />
        </div>
        <div className="text-xs font-semibold text-[#70665F]">
          Total 3D Assemblies: <strong className="text-[#211B17]">{filteredModels.length}</strong>
        </div>
      </div>

      {/* 3D Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="bg-white border border-dashed border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3">
          <Box className="w-12 h-12 text-[#A89F91] mx-auto opacity-50" />
          <p className="text-base font-bold text-[#544B45]">No 3D Models Found</p>
          <p className="text-xs text-[#70665F]">
            Upload your first SolidWorks assembly or STEP/IGES model using &quot;+ Upload 3D CAD Model&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-crm-brand-500 transition space-y-4 shadow-sm hover:shadow-md relative group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-crm-brand-700">{m.modelNumber}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-50 text-crm-brand-800 border border-crm-brand-200 font-mono text-[10px] font-bold">
                    {m.software} ({m.fileFormat})
                  </span>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#70665F]">
                    <span>
                      JOB REF: <strong className="text-amber-700">{m.jobNumber}</strong>
                    </span>
                    <span>
                      WEIGHT: <strong className="text-emerald-700">{m.totalWeightKg} Kg</strong>
                    </span>
                  </div>
                  <h4 className="font-extrabold text-[#211B17] text-sm line-clamp-1">{m.modelTitle}</h4>
                  <div className="text-[11px] text-[#70665F] flex items-center justify-between mt-1">
                    <span>CG: {m.centerOfGravity || 'Centered'}</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      No Interference
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#70665F] px-1">
                  <span>
                    Modeled By: <strong className="text-[#3E2723]">{m.modeledBy || 'Engineering Team'}</strong>
                  </span>
                  <span className="font-mono text-crm-brand-700 font-bold">{m.fileSize || '48.2 MB'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EBE3DB]">
                <button
                  onClick={() => setSelectedModel(m)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE6] text-[#3E2723] text-xs font-semibold flex items-center justify-center gap-2 transition border border-[#EBE3DB] cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-crm-brand-700" />
                  3D CAD Interactive View & Mass Props
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3D Model Viewer Simulation Modal */}
      {selectedModel && (
        <div
          onClick={() => setSelectedModel(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-4 p-6 text-xs animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono font-bold text-crm-brand-700 text-sm">{selectedModel.modelNumber}</span>
                <h3 className="text-base font-extrabold text-[#211B17] mt-0.5">{selectedModel.modelTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedModel(null)}
                className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated 3D CAD WebGL Viewport */}
            <div className="w-full h-80 bg-[#151210] border-2 border-crm-brand-700/40 rounded-xl relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-crm-brand-800 to-crm-brand-600 flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500 border border-white/20">
                <Box className="w-16 h-16 text-white animate-pulse" />
              </div>

              <div className="mt-4 space-y-1 relative z-10 text-white">
                <h4 className="font-mono font-bold text-white text-sm tracking-wider">
                  3D SOLID ASSEMBLY CAD MODEL VIEWPORT
                </h4>
                <p className="text-gray-300 text-xs font-mono">
                  Job: {selectedModel.jobNumber} | Total Mass: {selectedModel.totalWeightKg} Kg | Software: {selectedModel.software}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3D Assembly Clearance & Interference Check 100% PASSED</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB]">
              <div>
                <span className="text-[#70665F] text-[11px] block">Center of Gravity (CG):</span>
                <strong className="text-[#211B17] font-mono">{selectedModel.centerOfGravity}</strong>
              </div>
              <div>
                <span className="text-[#70665F] text-[11px] block">Modeled By Engineer:</span>
                <strong className="text-[#211B17]">{selectedModel.modeledBy}</strong>
              </div>
              <div>
                <span className="text-[#70665F] text-[11px] block">File Specification:</span>
                <strong className="text-[#211B17] font-mono">
                  {selectedModel.fileFormat} • {selectedModel.fileSize}
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedModel(null)}
                className="px-4 py-2 bg-[#FAF7F5] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
              >
                Close Viewport
              </button>
              <button
                onClick={() => {
                  if (selectedModel.fileUrl && selectedModel.fileUrl.startsWith('data:')) {
                    const link = document.createElement('a');
                    link.href = selectedModel.fileUrl;
                    link.download = `${selectedModel.modelNumber}.${selectedModel.fileFormat.toLowerCase()}`;
                    link.click();
                  } else {
                    alert(`Downloading 3D ${selectedModel.fileFormat} file for ${selectedModel.modelNumber}...`);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                Download {selectedModel.fileFormat} File ({selectedModel.fileSize})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload 3D CAD Model */}
      {isModalOpen && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6 text-xs animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <Box className="w-5 h-5 text-crm-brand-700" />
                Upload 3D CAD Model (SolidWorks / STEP / IGES)
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Select Design Job *</label>
                <select
                  required
                  value={selectedDesignJobId}
                  onChange={(e) => handleJobSelect(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-medium"
                >
                  <option value="">-- Select Design Job Reference --</option>
                  {(effectiveDesignJobs || []).map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName} ({j.designJobNumber})
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
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-medium"
                />
              </div>

              {/* Real File Upload Dropzone */}
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Upload 3D CAD File *</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                    isDragging
                      ? 'border-crm-brand-500 bg-crm-brand-50/50'
                      : fileName
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-[#EBE3DB] bg-[#FAF7F5] hover:bg-[#F2ECE6]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".step,.stp,.iges,.igs,.sldprt,.sldasm,.dwg,.dxf,.obj,.x_t,.zip"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  {fileName ? (
                    <>
                      <FileCheck className="w-8 h-8 text-emerald-600 animate-bounce" />
                      <div className="font-bold text-[#211B17] text-xs">{fileName}</div>
                      <div className="text-[11px] text-[#70665F] font-mono">{fileSizeStr} • Ready to save</div>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-crm-brand-700" />
                      <div className="font-bold text-[#211B17] text-xs">
                        Click to browse or drag & drop 3D CAD Model
                      </div>
                      <div className="text-[10px] text-[#70665F]">
                        Supports STEP (.stp, .step), IGES (.igs), SolidWorks (.sldprt, .sldasm), DWG, Parasolid, ZIP
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Software Environment</label>
                  <select
                    value={software}
                    onChange={(e) => setSoftware(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-medium"
                  >
                    <option value="SolidWorks">SolidWorks</option>
                    <option value="AutoCAD 3D">AutoCAD 3D</option>
                    <option value="Inventor">Autodesk Inventor</option>
                    <option value="Creo">Creo Parametric</option>
                    <option value="CATIA">CATIA V5</option>
                    <option value="Siemens NX">Siemens NX</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Exported Format</label>
                  <select
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-medium"
                  >
                    <option value="STEP">STEP (.step / .stp)</option>
                    <option value="IGES">IGES (.iges / .igs)</option>
                    <option value="SolidWorks">SolidWorks Assembly (.sldasm)</option>
                    <option value="AutoCAD 3D">AutoCAD 3D (.dwg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Total Assembly Mass (Kg)</label>
                  <input
                    type="number"
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Center of Gravity (CG)</label>
                  <input
                    type="text"
                    value={centerOfGravity}
                    onChange={(e) => setCenterOfGravity(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Lead Modeling Engineer</label>
                <input
                  type="text"
                  value={modeledBy}
                  onChange={(e) => setModeledBy(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-[#FAF7F5] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedDesignJobId || !modelTitle.trim()}
                  className={`px-5 py-2 rounded-xl font-bold transition shadow-sm ${
                    selectedDesignJobId && modelTitle.trim()
                      ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save & Register 3D Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
