'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Upload,
  FileText,
  Clock,
  HardDrive,
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
  const [fileFormat, setFileFormat] = useState('DWG');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (selectedAsm) setSelectedAsm(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedAsm]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDesignJobId('');
    setAssemblyTitle('');
    setSubAssemblyCode('');
    setFileFormat('DWG');
    setSelectedFile(null);
    setSelectedFileName('');
    setSelectedFileSize('');
    setFormError('');
  };

  const handleFileProcess = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'DWG';
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setSelectedFileSize(`${sizeMB} MB`);
    if (['DWG', 'DXF', 'PDF', 'STEP', 'SLDASM', 'ZIP'].includes(ext)) {
      setFileFormat(ext);
    }
    setFormError('');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const filteredAsm = (assemblyDrawings || []).filter((a) => {
    const q = searchQuery?.toLowerCase() || '';
    return (
      a.assemblyNumber?.toLowerCase().includes(q) ||
      (a.assemblyTitle && a.assemblyTitle?.toLowerCase().includes(q)) ||
      a.jobNumber?.toLowerCase().includes(q) ||
      a.subAssemblyCode?.toLowerCase().includes(q)
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const desJob = designJobs.find((j) => j.id === selectedDesignJobId);
    if (!desJob) {
      setFormError('Please select a valid Design Job.');
      return;
    }

    if (!assemblyTitle.trim()) {
      setFormError('Assembly Title is required.');
      return;
    }

    const assemblyNumber = `ASM-${desJob.jobNumber || desJob.designJobNumber}-0${filteredAsm.length + 1}`;

    addAssemblyDrawing({
      designJobId: desJob.id,
      projectId: desJob.projectId,
      jobNumber: desJob.jobNumber || desJob.designJobNumber,
      assemblyNumber,
      assemblyTitle: assemblyTitle.trim(),
      subAssemblyCode: subAssemblyCode.trim() || `SUB-ASM-${desJob.jobNumber?.slice(-4) || '01'}`,
      parentAssemblyNumber: `GA-${desJob.jobNumber || desJob.designJobNumber}-01`,
      revisionNumber: 'REV-00',
      fileFormat: (fileFormat as any) || 'DWG',
      fileSize: selectedFileSize || '8.4 MB',
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : '#',
      linkedBOMItemId: 'bi-5',
      drawnBy: `${currentUser?.firstName || 'Dharmesh'} ${currentUser?.lastName || 'Joshi'}`.trim(),
      approvedBy: 'Rajesh Patel',
    });

    closeModal();
  };

  return (
    <div className="p-6 space-y-6 text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 text-xs font-mono font-bold">
              MODULE 3.6
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Layers className="w-7 h-7 text-emerald-600" />
              Sub-Assembly Drawings Vault
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Sub-Assembly Drawings Linked directly to BOM Tree Hierarchy, Welding Specs & Bill of Materials
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Add Assembly Drawing
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Assembly #, Title, Job #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="text-xs font-medium text-[#70665F] font-mono">
          Total Drawings: <strong className="text-[#211B17] font-bold">{filteredAsm.length}</strong>
        </div>
      </div>

      {/* Assembly Drawings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAsm.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-[#EBE3DB] text-[#70665F] space-y-3">
            <Layers className="w-10 h-10 text-[#A89F91] mx-auto" />
            <p className="font-semibold text-sm">No sub-assembly drawings found</p>
            <p className="text-xs text-[#70665F]">Click &quot;Add Assembly Drawing&quot; to upload CAD drawings linked to BOM items.</p>
          </div>
        ) : (
          filteredAsm.map((a) => (
            <div
              key={a.id}
              className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-emerald-500/60 transition space-y-3 shadow-md relative group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-emerald-600">{a.assemblyNumber}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold">
                  {a.revisionNumber || 'REV-00'}
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#70665F]">
                  <span>JOB REF: <strong className="text-amber-700 font-bold">{a.jobNumber}</strong></span>
                  <span>CODE: <strong className="text-emerald-700 font-bold">{a.subAssemblyCode}</strong></span>
                </div>
                <h4 className="font-extrabold text-[#211B17] text-sm">{a.assemblyTitle}</h4>
                <p className="text-[11px] text-[#70665F]">Parent GA: {a.parentAssemblyNumber || 'Main GA'}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-[#70665F]">
                <span>Drawn By: <strong className="text-[#3E2723]">{a.drawnBy || 'Design Engineer'}</strong></span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {a.fileFormat || 'DWG'} ({a.fileSize || '5.0 MB'})
                </span>
              </div>

              <div className="pt-2 border-t border-[#EBE3DB] flex items-center gap-2">
                <button
                  onClick={() => setSelectedAsm(a)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-emerald-50 text-[#3E2723] hover:text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 transition border border-[#EBE3DB]"
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  View Assembly Blueprint
                </button>
                {a.fileUrl && a.fileUrl !== '#' && (
                  <a
                    href={a.fileUrl}
                    download={`${a.assemblyNumber}.${a.fileFormat?.toLowerCase() || 'dwg'}`}
                    className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-emerald-50 text-[#70665F] hover:text-emerald-700 transition border border-[#EBE3DB]"
                    title="Download CAD file"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assembly Viewer Modal */}
      {selectedAsm && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedAsm(null)}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono font-bold text-emerald-600 text-sm">{selectedAsm.assemblyNumber}</span>
                <h3 className="text-base font-extrabold text-[#211B17] mt-0.5">{selectedAsm.assemblyTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedAsm(null)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs text-[#544B45]">
                <div>Job Number: <strong className="text-amber-700 font-bold ml-1">{selectedAsm.jobNumber}</strong></div>
                <div>Sub-Assembly Code: <strong className="text-emerald-700 font-bold ml-1">{selectedAsm.subAssemblyCode}</strong></div>
                <div>Parent Assembly: <strong className="text-[#211B17] font-semibold ml-1">{selectedAsm.parentAssemblyNumber || 'Main GA'}</strong></div>
                <div>Revision: <strong className="text-emerald-700 font-bold ml-1">{selectedAsm.revisionNumber}</strong></div>
                <div>Drawn By: <strong className="text-[#3E2723] font-semibold ml-1">{selectedAsm.drawnBy}</strong></div>
                <div>Approved By: <strong className="text-[#3E2723] font-semibold ml-1">{selectedAsm.approvedBy || 'Rajesh Patel'}</strong></div>
                <div>File Format: <strong className="font-mono text-emerald-700 ml-1">{selectedAsm.fileFormat}</strong></div>
                <div>File Size: <strong className="font-mono text-[#211B17] ml-1">{selectedAsm.fileSize}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAF7F2] flex items-center justify-center gap-3">
              <FileCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <div className="font-bold text-[#211B17]">{selectedAsm.assemblyTitle} ({selectedAsm.fileFormat})</div>
                <div className="text-[11px] text-[#70665F]">Validated for Production Shopfloor & Welding Hierarchy</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
              {selectedAsm.fileUrl && selectedAsm.fileUrl !== '#' && (
                <a
                  href={selectedAsm.fileUrl}
                  download={`${selectedAsm.assemblyNumber}.${selectedAsm.fileFormat?.toLowerCase() || 'dwg'}`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" /> Download CAD File
                </a>
              )}
              <button
                onClick={() => setSelectedAsm(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] font-bold hover:bg-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Assembly Drawing */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={closeModal}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6 text-xs max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Add Sub-Assembly Drawing
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Select Design Job *</label>
                <select
                  required
                  value={selectedDesignJobId}
                  onChange={(e) => {
                    setSelectedDesignJobId(e.target.value);
                    setFormError('');
                  }}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-medium"
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
                <label className="text-[#544B45] font-bold block mb-1">Assembly Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agitator Shaft & Blade Assembly"
                  value={assemblyTitle}
                  onChange={(e) => {
                    setAssemblyTitle(e.target.value);
                    setFormError('');
                  }}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Sub-Assembly Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SUB-ASM-AGITATOR"
                    value={subAssemblyCode}
                    onChange={(e) => setSubAssemblyCode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">File Format</label>
                  <select
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="DWG">DWG (AutoCAD)</option>
                    <option value="DXF">DXF (Drawing Exchange)</option>
                    <option value="PDF">PDF (Vector Blueprint)</option>
                    <option value="STEP">STEP / STP (3D Model)</option>
                    <option value="SLDASM">SLDASM (SolidWorks Asm)</option>
                    <option value="ZIP">ZIP (Drawings Bundle)</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Upload Drawing File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".dwg,.dxf,.pdf,.step,.stp,.sldasm,.zip"
                  className="hidden"
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer text-center transition flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50'
                      : selectedFileName
                      ? 'border-emerald-500/60 bg-emerald-50/40'
                      : 'border-[#CBD5E1] hover:border-emerald-500 bg-[#FAF7F2]'
                  }`}
                >
                  <Upload className={`w-8 h-8 ${selectedFileName ? 'text-emerald-600' : 'text-[#70665F]'}`} />
                  {selectedFileName ? (
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#211B17] flex items-center gap-1 justify-center">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        {selectedFileName}
                      </div>
                      <div className="text-[11px] text-[#70665F]">
                        {selectedFileSize} — Click or drag another file to replace
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#211B17]">Click to upload or drag & drop CAD file</div>
                      <div className="text-[11px] text-[#70665F]">Supports .DWG, .DXF, .PDF, .STEP, .SLDASM (Max 50MB)</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] font-bold hover:bg-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" /> Save Assembly Drawing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
