'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Drawing2D } from '../../../types/designer';
import CADBlueprintViewerModal from '@/components/designer/CADBlueprintViewerModal';
import {
  FileCheck,
  Plus,
  Search,
  Eye,
  Download,
  FileCode,
  CheckCircle2,
  Clock,
  User,
  X,
  Layers,
  Filter,
  Upload,
} from 'lucide-react';

export default function Drawings2DPage() {
  const [mounted, setMounted] = useState(false);
  const { drawings2D, addDrawing2D, designJobs, currentUser } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing2D | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Upload Form
  const [selectedDesignJobId, setSelectedDesignJobId] = useState('');
  const [drawingNumber, setDrawingNumber] = useState('');
  const [drawingTitle, setDrawingTitle] = useState('');
  const [category, setCategory] = useState<Drawing2D['category']>('GA');
  const [fileFormat, setFileFormat] = useState<Drawing2D['fileFormat']>('DWG');
  const [sheetSize, setSheetSize] = useState<Drawing2D['sheetSize']>('A1');
  const [scale, setScale] = useState('1:20');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Close modals on ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (selectedDrawing) setSelectedDrawing(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedDrawing]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDesignJobId('');
    setDrawingNumber('');
    setDrawingTitle('');
    setCategory('GA');
    setFileFormat('DWG');
    setSheetSize('A1');
    setScale('1:20');
    setSelectedFile(null);
    setSelectedFileName('');
    setSelectedFileSize('');
    setFileError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setSelectedFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setSelectedFileSize(`${sizeInMB} MB`);
    setFileError('');

    // Auto-detect format from extension
    const ext = file.name.split('.').pop()?.toUpperCase();
    if (ext === 'DWG' || ext === 'DXF' || ext === 'PDF') {
      setFileFormat(ext as any);
    }
  };

  const filteredDrawings = drawings2D.filter((d) => {
    const dTitle = d.drawingTitle || (d as any).title || '';
    const dNum = d.drawingNumber || d.id || '';
    const dJob = d.jobNumber || '';
    const matchSearch =
      dNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dJob.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const desJob = designJobs.find((j) => j.id === selectedDesignJobId);
    if (!desJob) return;

    const sizeStr = selectedFileSize || '4.5 MB';
    const num = drawingNumber.trim() || `DWG-${desJob.jobNumber.replace(/[^A-Za-z0-9]/g, '')}-${category}-${Date.now().toString().slice(-3)}`;

    addDrawing2D({
      designJobId: desJob.id,
      projectId: desJob.projectId,
      jobNumber: desJob.jobNumber,
      drawingNumber: num,
      drawingTitle: drawingTitle.trim(),
      category,
      revisionNumber: 'REV-00',
      revision: 'REV-00',
      fileFormat,
      fileSize: sizeStr,
      fileUrl: selectedFileName ? `/blueprints/${selectedFileName}` : '#',
      drawnBy: `${currentUser.firstName || 'Dharmesh'} ${currentUser.lastName || 'Joshi'}`.trim(),
      checkedBy: 'Ketan Patel',
      approvedBy: 'Rajesh Patel',
      approvalStatus: 'approved',
      status: 'approved',
      sheetSize,
      scale,
      isLatest: true,
    });

    closeModal();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30 text-xs font-mono font-bold">
              MODULE 3.4
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <FileCheck className="w-7 h-7 text-crm-brand-500" />
              2D CAD Drawings Vault (DWG / DXF / PDF)
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            General Arrangement (GA), Fabrication Layouts, Nozzle Orientation & Electrical Schematics
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] text-xs font-bold shadow-lg shadow-crm-brand-700/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload 2D Drawing
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Drawing #, Title, Job #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-crm-brand-600"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
        >
          <option value="all">All Drawing Types</option>
          <option value="GA">General Arrangement (GA)</option>
          <option value="Fabrication">Fabrication Drawing</option>
          <option value="P&ID">P&ID Diagram</option>
          <option value="Electrical">Electrical Schematic</option>
          <option value="Layout">Plant Layout</option>
        </select>
      </div>

      {/* Drawings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrawings.map((drw) => {
          const title = drw.drawingTitle || (drw as any).title || '2D Engineering Drawing';
          const num = drw.drawingNumber || drw.id;
          const rev = drw.revisionNumber || drw.revision || 'REV-00';
          const format = drw.fileFormat || 'DWG';
          const size = drw.fileSize || '4.8 MB';
          const author = drw.drawnBy || (drw as any).prepared_by || 'Dharmesh Joshi';
          const job = drw.jobNumber || (drw as any).job_number || 'JOB-REF';
          const cat = drw.category || 'GA';
          const drwScale = drw.scale || '1:10';

          return (
            <div
              key={drw.id}
              className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-crm-brand-600/40 transition space-y-3 shadow-xl relative group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-crm-brand-500">{num}</span>
                <span className="px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- font-mono text-[10px] font-bold">
                  {rev}
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#70665F]">
                  <span>JOB REF: <strong className="text-amber-400">{job}</strong></span>
                  <span>FMT: <strong className="text-crm-brand-">{format}</strong></span>
                </div>
                <h4 className="font-extrabold text-[#211B17] text-sm">{title}</h4>
                <p className="text-[11px] text-[#70665F]">Category: {cat} | Scale: {drwScale}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-[#70665F] pt-1">
                <span>Drawn By: <strong className="text-[#3E2723]">{author}</strong></span>
                <span className="font-mono text-emerald-600 font-bold">Size: {size}</span>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-[#EBE3DB] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDrawing(drw)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#3E2723] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-crm-brand-500" />
                  CAD Blueprint Viewer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Interactive CAD Blueprint Viewer Modal */}
      {selectedDrawing && (
        <CADBlueprintViewerModal
          drawing={selectedDrawing}
          onClose={() => setSelectedDrawing(null)}
        />
      )}

      {/* Modal: Upload 2D Drawing */}
      {isModalOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-crm-brand-500" />
                Upload 2D CAD Blueprint
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
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
                      {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName} ({j.designJobNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Drawing Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GA Drawing - 10,000L Reaction Vessel"
                  value={drawingTitle}
                  onChange={(e) => setDrawingTitle(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Drawing Number</label>
                  <input
                    type="text"
                    placeholder="e.g. UTF-CRV-10K-GA-003"
                    value={drawingNumber}
                    onChange={(e) => setDrawingNumber(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    <option value="GA">GA Drawing</option>
                    <option value="Fabrication">Fabrication</option>
                    <option value="P&ID">P&ID</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Layout">Plant Layout</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">File Format</label>
                  <select
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  >
                    <option value="DWG">DWG (AutoCAD)</option>
                    <option value="DXF">DXF Vector</option>
                    <option value="PDF">PDF Print</option>
                    <option value="PNG/JPG">PNG / Image</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Scale</label>
                  <input
                    type="text"
                    placeholder="e.g. 1:10"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
              </div>

              {/* File Upload Drop Area */}
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Upload CAD Drawing File *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#EBE3DB] hover:border-crm-brand-500 rounded-xl p-4 text-center cursor-pointer bg-[#FAF7F2] transition"
                >
                  <Upload className="w-6 h-6 text-crm-brand-700 mx-auto mb-1" />
                  {selectedFileName ? (
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#211B17] truncate">{selectedFileName}</p>
                      <p className="text-[10px] text-emerald-600 font-bold">{selectedFileSize}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-semibold text-[#211B17] block">Click to browse or Drag & Drop</span>
                      <span className="text-[10px] text-[#70665F]">DWG, DXF, PDF, PNG up to 25MB</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".dwg,.dxf,.pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {fileError && <p className="text-rose-600 text-[10px] mt-1">{fileError}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-white text-[#544B45] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-bold cursor-pointer shadow-md transition"
                >
                  Upload Drawing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
