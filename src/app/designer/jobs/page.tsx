'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { DesignJob, DesignJobStatus } from '../../../types/designer';
import {
  Palette,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  FileSpreadsheet,
  Zap,
  X,
  FileText,
  ChevronRight,
  Layers,
  Box,
  RotateCcw,
  Upload,
  UploadCloud,
  Paperclip,
  File,
  Eye,
  Download,
  Trash2,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface UploadedDesignFile {
  name: string;
  sizeText: string;
  type: string;
  dataUrl?: string;
}

export default function DesignJobsPage() {
  const [mounted, setMounted] = useState(false);
  const {
    designJobs,
    addDesignJob,
    updateDesignJob,
    projectJobs,
    salesOrders,
    customers,
    addDrawing2D,
    drawings2D,
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal State for New Design Job
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assignedDesigner, setAssignedDesigner] = useState('Dharmesh Joshi');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [requiredDate, setRequiredDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Upload Design State inside Create Modal
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDesignFile[]>([]);
  const [drawingTitle, setDrawingTitle] = useState('');
  const [drawingCategory, setDrawingCategory] = useState<'GA' | 'Fabrication' | 'P&ID' | 'Electrical' | 'Layout' | '3D Model'>('GA');
  const [drawingRevision, setDrawingRevision] = useState('REV-00');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dedicated Upload Modal for Existing Design Job
  const [uploadingJob, setUploadingJob] = useState<DesignJob | null>(null);
  const [modalUploadFiles, setModalUploadFiles] = useState<UploadedDesignFile[]>([]);
  const [modalDrawingTitle, setModalDrawingTitle] = useState('');
  const [modalDrawingCategory, setModalDrawingCategory] = useState<'GA' | 'Fabrication' | 'P&ID' | 'Electrical' | 'Layout' | '3D Model'>('GA');
  const [modalDrawingRevision, setModalDrawingRevision] = useState('REV-01');
  const [modalIsDragging, setModalIsDragging] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Drawer / View Modal State
  const [selectedJob, setSelectedJob] = useState<DesignJob | null>(null);

  // Success Notification
  const [notificationMsg, setNotificationMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) closeCreateModal();
        if (uploadingJob) setUploadingJob(null);
        if (selectedJob) setSelectedJob(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, uploadingJob, selectedJob]);

  const isJobApproved = (job: DesignJob) => {
    if (!job) return false;
    const st = String(job.status || '').toLowerCase();
    const rm = String(job.remarks || '').toLowerCase();
    return (
      st === 'released_to_production' ||
      st === 'released' ||
      st === 'approved' ||
      st === 'bom_approved' ||
      rm.includes('released to production') ||
      rm.includes('bom approved')
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (files: FileList | File[], isModalUpload = false) => {
    Array.from(files).forEach((file) => {
      const sizeText = formatFileSize(file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFileItem: UploadedDesignFile = {
          name: file.name,
          sizeText,
          type: file.type || file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
          dataUrl: event.target?.result as string,
        };
        if (isModalUpload) {
          setModalUploadFiles((prev) => [...prev, newFileItem]);
          if (!modalDrawingTitle) {
            setModalDrawingTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
          }
        } else {
          setUploadedFiles((prev) => [...prev, newFileItem]);
          if (!drawingTitle) {
            setDrawingTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setSelectedProjectId('');
    setRemarks('');
    setRequiredDate('');
    setUploadedFiles([]);
    setDrawingTitle('');
    setDrawingCategory('GA');
    setDrawingRevision('REV-00');
  };

  const filteredJobs = designJobs.filter((j) => {
    const matchSearch =
      j.designJobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.projectId?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.jobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.customerName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.productName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.drawingFileName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.drawingTitle?.toLowerCase().includes(searchQuery?.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || j.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleCreateDesignJob = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projectJobs.find((p) => p.id === selectedProjectId);
    if (!proj) return;

    let maxNum = 0;
    designJobs.forEach((j) => {
      const match = (j.id || '').match(/(\d+)$/) || (j.designJobNumber || '').match(/(\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
    });
    const desJobNumber = `DES-${new Date().getFullYear()}-${String(maxNum + 1).padStart(4, '0')}`;

    const primaryFile = uploadedFiles[0];
    const drwCategory = drawingCategory || 'GA';
    const drwNum = `DWG-${proj.jobNumber || '2026'}-01`;
    const drwTitle = drawingTitle || (primaryFile ? primaryFile.name.replace(/\.[^/.]+$/, '') : `${proj.productName} Design Drawing`);
    const drwRev = drawingRevision || 'REV-00';

    addDesignJob({
      designJobNumber: desJobNumber,
      projectId: proj.id,
      projectNumber: proj.projectNumber,
      jobNumber: proj.jobNumber,
      customerId: proj.customerId,
      customerName: proj.customerName,
      customerPoNumber: proj.customerPoNumber,
      salesOrderNumber: proj.salesOrderNumber,
      productName: proj.productName,
      machineType: proj.productName.includes('Reactor') ? 'Reaction Vessel' : 'Process Equipment',
      quantity: proj.quantity,
      deliveryDate: proj.deliveryDate,
      designManager: 'Dharmesh Joshi',
      assignedDesigner,
      priority,
      requiredDate: requiredDate || proj.deliveryDate,
      status: 'assigned',
      remarks,
      activeRevision: drwRev,
      drawingFileName: primaryFile?.name,
      drawingTitle: drwTitle,
      drawingNumber: drwNum,
      drawingCategory: drwCategory,
      drawingFormat: primaryFile ? (primaryFile.name.split('.').pop()?.toUpperCase() || 'PDF') : undefined,
      fileSize: primaryFile?.sizeText,
      fileUrl: primaryFile?.dataUrl,
      attachments: uploadedFiles.map((f, idx) => ({
        id: `ATT-${Date.now()}-${idx}`,
        name: f.name,
        size: f.sizeText,
        type: f.type,
        category: drwCategory,
        url: f.dataUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
      })),
    });

    // Also register drawing record in Drawing2D
    if (primaryFile && addDrawing2D) {
      addDrawing2D({
        drawingNumber: drwNum,
        projectId: proj.id,
        jobNumber: proj.jobNumber,
        designJobId: desJobNumber,
        machineName: proj.productName,
        drawingTitle: drwTitle,
        category: drwCategory as any,
        revision: drwRev,
        designer: assignedDesigner,
        fileFormat: (primaryFile.name.split('.').pop()?.toUpperCase() as any) || 'PDF',
        fileUrl: primaryFile.dataUrl,
        fileSize: primaryFile.sizeText,
        status: 'draft',
      });
    }

    setNotificationMsg(
      `Design Job "${desJobNumber}" created successfully${primaryFile ? ` with uploaded design "${primaryFile.name}"` : ''}!`
    );
    setTimeout(() => setNotificationMsg(''), 7000);
    closeCreateModal();
  };

  const handleSaveUploadDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingJob || modalUploadFiles.length === 0) return;

    const primaryFile = modalUploadFiles[0];
    const drwCategory = modalDrawingCategory || 'GA';
    const drwNum = `DWG-${uploadingJob.jobNumber || '2026'}-${Date.now().toString().slice(-2)}`;
    const drwTitle = modalDrawingTitle || primaryFile.name.replace(/\.[^/.]+$/, '');
    const drwRev = modalDrawingRevision || 'REV-01';

    const existingAtts = uploadingJob.attachments || [];
    const newAtts = modalUploadFiles.map((f, idx) => ({
      id: `ATT-${Date.now()}-${idx}`,
      name: f.name,
      size: f.sizeText,
      type: f.type,
      category: drwCategory,
      url: f.dataUrl,
      uploadedAt: new Date().toISOString().split('T')[0],
    }));

    updateDesignJob(uploadingJob.id, {
      drawingFileName: primaryFile.name,
      drawingTitle: drwTitle,
      drawingNumber: drwNum,
      drawingCategory: drwCategory,
      drawingFormat: primaryFile.name.split('.').pop()?.toUpperCase() || 'PDF',
      fileSize: primaryFile.sizeText,
      fileUrl: primaryFile.dataUrl,
      activeRevision: drwRev,
      attachments: [...newAtts, ...existingAtts],
    });

    if (addDrawing2D) {
      addDrawing2D({
        drawingNumber: drwNum,
        projectId: uploadingJob.projectId,
        jobNumber: uploadingJob.jobNumber,
        designJobId: uploadingJob.designJobNumber || uploadingJob.id,
        machineName: uploadingJob.productName,
        drawingTitle: drwTitle,
        category: drwCategory as any,
        revision: drwRev,
        designer: uploadingJob.assignedDesigner || 'Dharmesh Joshi',
        fileFormat: (primaryFile.name.split('.').pop()?.toUpperCase() as any) || 'PDF',
        fileUrl: primaryFile.dataUrl,
        fileSize: primaryFile.sizeText,
        status: 'draft',
      });
    }

    setNotificationMsg(`Uploaded design "${primaryFile.name}" for Job ${uploadingJob.designJobNumber}!`);
    setTimeout(() => setNotificationMsg(''), 7000);
    setUploadingJob(null);
    setModalUploadFiles([]);
    setModalDrawingTitle('');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 text-[#211B17]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand-700 border border-crm-brand-600/30 text-xs font-mono font-bold">
              MODULE 3.1
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Palette className="w-7 h-7 text-crm-brand-600" />
              Design & Engineering Jobs Registry
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Linked to Confirmed Project & Job Number with integrated CAD/Drawings Upload Management.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold shadow-md shadow-crm-brand-700/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Design Job
        </button>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Design Job #, Project ID, Drawing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-crm-brand-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
          >
            <option value="all">All Statuses ({designJobs.length})</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="released_to_production">Released to Production</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Design Jobs Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((j) => {
          const hasDesign = Boolean(j.drawingFileName || (j.attachments && j.attachments.length > 0));
          const primaryFileName = j.drawingFileName || j.attachments?.[0]?.name;
          const primaryFileCategory = j.drawingCategory || j.attachments?.[0]?.category || 'GA';
          const primaryFormat = j.drawingFormat || primaryFileName?.split('.').pop()?.toUpperCase() || 'CAD';

          return (
            <div
              key={j.id}
              className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-crm-brand-600/50 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 relative group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-crm-brand-700">{j.designJobNumber}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      j.status === 'released_to_production'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : j.status === 'bom_approved' || j.status === 'approved'
                        ? 'bg-crm-brand-50 text-crm-brand-800 border border-crm-brand-200'
                        : j.status === 'review'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {j.status?.replace(/_/g, ' ')?.toUpperCase()}
                  </span>
                </div>

                {/* Primary Relational Reference */}
                <div className="mt-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#70665F] block font-medium">PROJECT & JOB REF</span>
                    <span className="font-mono font-bold text-xs text-[#211B17]">{j.projectId}</span>
                    <span className="font-mono text-xs text-amber-600 ml-2">[{j.jobNumber}]</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-crm-brand-100 text-crm-brand-800 font-mono text-[10px] font-bold">
                    {j.activeRevision || 'REV-00'}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-extrabold text-[#211B17] text-sm">{j.productName}</h3>
                  <p className="text-xs text-[#70665F] mt-0.5">{j.customerName}</p>
                </div>
              </div>

              {/* Uploaded Design / Drawing Attachment Badge */}
              {hasDesign ? (
                <div className="p-2.5 rounded-xl bg-crm-brand-50/80 border border-crm-brand-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <div className="w-8 h-8 rounded-lg bg-crm-brand-100 border border-crm-brand-200 flex items-center justify-center text-crm-brand-700 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-800 text-[11px] block truncate" title={primaryFileName}>
                        {j.drawingTitle || primaryFileName}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-crm-brand-800 font-mono">
                        <span className="font-semibold uppercase">{primaryFormat}</span>
                        <span>•</span>
                        <span>{primaryFileCategory}</span>
                        {j.fileSize && (
                          <>
                            <span>•</span>
                            <span>{j.fileSize}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedJob(j)}
                    title="View uploaded design drawing"
                    className="px-2 py-1 rounded-lg bg-white border border-crm-brand-300 text-crm-brand-800 hover:bg-crm-brand-100 text-[10px] font-bold flex items-center gap-1 shadow-2xs flex-shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-crm-brand-700" />
                    <span>View</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setUploadingJob(j);
                    setModalDrawingTitle(`${j.productName} GA Drawing`);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[#D5CBC1] hover:border-crm-brand-600 bg-[#FAF7F2] hover:bg-white text-crm-brand-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-crm-brand-600" />
                  <span>+ Upload Design Drawing</span>
                </button>
              )}

              {/* Machine Specs & Assigned Info */}
              <div className="space-y-1.5 pt-2 border-t border-[#EBE3DB] text-xs text-[#544B45]">
                <div className="flex items-center justify-between">
                  <span className="text-[#70665F]">Machine Type:</span>
                  <span className="font-medium text-[#211B17]">{j.machineType || 'Process Equipment'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#70665F]">Quantity:</span>
                  <span className="font-mono text-[#211B17]">{j.quantity} Units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#70665F]">Assigned Designer:</span>
                  <span className="font-bold text-[#211B17] flex items-center gap-1">
                    <User className="w-3 h-3 text-crm-brand-600" />
                    {j.assignedDesigner}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#70665F]">Target Release Date:</span>
                  <span className="font-mono text-amber-700 font-bold">{j.requiredDate}</span>
                </div>
              </div>

              {/* Quick Action Link Buttons */}
              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedJob(j)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#EBE3DB] text-[#211B17] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  View Details
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setUploadingJob(j);
                      setModalDrawingTitle(`${j.productName} Drawing`);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition cursor-pointer"
                    title="Upload / Update Design Drawing"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/designer/bom?job=${j.jobNumber}`}
                    className="p-1.5 rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] border border-[#FDE68A] text-xs font-semibold transition"
                    title="View / Create Master BOM"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </Link>

                  {isJobApproved(j) ? (
                    <Link
                      href={`/designer/approval?job=${j.jobNumber}`}
                      className="px-2.5 py-1.5 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] border border-[#BBF7D0] text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      title="Design Job is Released & Approved to Production"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#169B62]" />
                      <span>Approved</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/designer/approval?job=${j.jobNumber}`}
                      className="px-3 py-1.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <span>Approval</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: INITIALIZE NEW DESIGN JOB (WITH INTEGRATED DESIGN UPLOAD) */}
      {isModalOpen && (
        <div
          onClick={closeCreateModal}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl space-y-4 p-6"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                  <Palette className="w-5 h-5 text-crm-brand-600" />
                  Initialize New Design Job
                </h3>
                <p className="text-[#70665F] text-[11px] mt-0.5">
                  Link with Project Job and upload GA / CAD Design Drawings.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDesignJob} className="space-y-4 text-xs">
              {/* Project Selection */}
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Select Confirmed Project / Job *</label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    const selected = projectJobs.find((p) => p.id === e.target.value);
                    if (selected && !drawingTitle) {
                      setDrawingTitle(`${selected.productName} GA Drawing`);
                    }
                  }}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                >
                  <option value="">-- Choose Project --</option>
                  {projectJobs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.jobNumber || p.projectNumber || p.id} — {p.customerName ? `[${p.customerName}] ` : ''}{p.productName} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Designer & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Assigned Lead Designer *</label>
                  <select
                    value={assignedDesigner}
                    onChange={(e) => setAssignedDesigner(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    <option value="Dharmesh Joshi">Dharmesh Joshi (Sr. Design Engineer)</option>
                    <option value="Ketan Patel">Ketan Patel (Design Manager)</option>
                    <option value="Rajesh Patel">Rajesh Patel (Technical Director)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Priority Level *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Target Release Date */}
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Target Design Release Date</label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                />
              </div>

              {/* ========================================================================= */}
              {/* UPLOAD DESIGN OPTION SECTION */}
              {/* ========================================================================= */}
              <div className="border border-[#E7DED5] bg-[#FAF7F2] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[#3E2723] font-extrabold text-xs flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-crm-brand-700" />
                    <span>Upload Design / CAD Drawing Files</span>
                  </label>
                  <span className="text-[10px] text-crm-brand-800 bg-crm-brand-100 px-2 py-0.5 rounded-full border border-crm-brand-200 font-semibold">
                    DWG, DXF, PDF, STEP, 3D
                  </span>
                </div>

                {/* Drawing Title, Category & Revision */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="text-[#70665F] font-bold text-[11px] block mb-1">Drawing Title</label>
                    <input
                      type="text"
                      value={drawingTitle}
                      onChange={(e) => setDrawingTitle(e.target.value)}
                      placeholder="e.g. GA Drawing Rev 0"
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                    />
                  </div>

                  <div>
                    <label className="text-[#70665F] font-bold text-[11px] block mb-1">Drawing Category</label>
                    <select
                      value={drawingCategory}
                      onChange={(e) => setDrawingCategory(e.target.value as any)}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                    >
                      <option value="GA">GA Drawing (General Arrangement)</option>
                      <option value="Fabrication">Fabrication Details</option>
                      <option value="P&ID">P&ID (Piping & Instrumentation)</option>
                      <option value="3D Model">3D CAD Model (STEP/SLDPRT)</option>
                      <option value="Electrical">Electrical Schematic</option>
                      <option value="Layout">Shop Layout & Civil</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#70665F] font-bold text-[11px] block mb-1">Revision Code</label>
                    <select
                      value={drawingRevision}
                      onChange={(e) => setDrawingRevision(e.target.value)}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                    >
                      <option value="REV-00">REV-00 (Initial Issue)</option>
                      <option value="REV-01">REV-01 (Internal Review)</option>
                      <option value="REV-02">REV-02 (Client Review)</option>
                      <option value="REV-03">REV-03 (Final Construction)</option>
                    </select>
                  </div>
                </div>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      processFiles(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-crm-brand-600 bg-crm-brand-50'
                      : 'border-[#D5CBC1] hover:border-crm-brand-600 bg-white/70 hover:bg-white'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        processFiles(e.target.files);
                      }
                    }}
                    multiple
                    accept=".pdf,.dwg,.dxf,.step,.stp,.sldprt,.sldasm,.png,.jpg,.jpeg,.zip"
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-crm-brand-100 text-crm-brand-700 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#211B17]">
                      Click to Browse or Drag & Drop Design Drawings
                    </p>
                    <p className="text-[10px] text-[#70665F]">
                      Supported formats: AutoCAD (.dwg, .dxf), PDF (.pdf), 3D (.step, .sldprt), Images (.png, .jpg), Archives (.zip)
                    </p>
                  </div>
                </div>

                {/* Uploaded File List Cards */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-[#544B45] block">
                      Attached Files ({uploadedFiles.length}):
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {uploadedFiles.map((file, idx) => {
                        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                        return (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-white border border-[#EBE3DB] flex items-center justify-between text-xs shadow-2xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden mr-2">
                              <span className="px-1.5 py-0.5 rounded bg-crm-brand-100 text-crm-brand-800 text-[10px] font-mono font-bold uppercase flex-shrink-0">
                                {ext}
                              </span>
                              <span className="font-semibold text-slate-800 truncate text-[11px]" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-[10px] text-[#70665F] font-mono flex-shrink-0">
                                ({file.sizeText})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" /> Ready
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Design Scope & Engineering Notes */}
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Design Scope & Engineering Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Specific design requirements, ASME standards, customer motor preferences..."
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 rounded-xl bg-white border border-[#EBE3DB] text-[#544B45] font-bold hover:bg-[#FAF7F2] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold transition shadow-md shadow-crm-brand-700/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Design Job</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD DESIGN TO EXISTING JOB */}
      {uploadingJob && (
        <div
          onClick={() => setUploadingJob(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg my-8 overflow-hidden shadow-2xl space-y-4 p-6"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono font-bold text-crm-brand-700 text-xs">{uploadingJob.designJobNumber}</span>
                <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-crm-brand-700" />
                  Upload Design Drawing / Revision
                </h3>
                <p className="text-[#70665F] text-[11px] mt-0.5">{uploadingJob.productName} ({uploadingJob.customerName})</p>
              </div>
              <button
                type="button"
                onClick={() => setUploadingJob(null)}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUploadDesign} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Drawing Title</label>
                  <input
                    type="text"
                    required
                    value={modalDrawingTitle}
                    onChange={(e) => setModalDrawingTitle(e.target.value)}
                    placeholder="e.g. General Arrangement GA Drawing"
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Drawing Category</label>
                  <select
                    value={modalDrawingCategory}
                    onChange={(e) => setModalDrawingCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    <option value="GA">GA Drawing (General Arrangement)</option>
                    <option value="Fabrication">Fabrication Details</option>
                    <option value="P&ID">P&ID (Piping & Instrumentation)</option>
                    <option value="3D Model">3D CAD Model (STEP/SLDPRT)</option>
                    <option value="Electrical">Electrical Schematic</option>
                    <option value="Layout">Shop Layout & Civil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Drawing Revision Tag</label>
                <select
                  value={modalDrawingRevision}
                  onChange={(e) => setModalDrawingRevision(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                >
                  <option value="REV-00">REV-00 (Initial Issue)</option>
                  <option value="REV-01">REV-01 (Internal Review & Changes)</option>
                  <option value="REV-02">REV-02 (Client Review & Corrections)</option>
                  <option value="REV-03">REV-03 (Released for Production)</option>
                </select>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setModalIsDragging(true);
                }}
                onDragLeave={() => setModalIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setModalIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    processFiles(e.dataTransfer.files, true);
                  }
                }}
                onClick={() => modalFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  modalIsDragging
                    ? 'border-crm-brand-600 bg-crm-brand-50'
                    : 'border-[#D5CBC1] hover:border-crm-brand-600 bg-[#FAF7F2] hover:bg-white'
                }`}
              >
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processFiles(e.target.files, true);
                    }
                  }}
                  multiple
                  accept=".pdf,.dwg,.dxf,.step,.stp,.sldprt,.sldasm,.png,.jpg,.jpeg,.zip"
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-crm-brand-100 text-crm-brand-700 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#211B17]">
                    Click to Browse or Drag & Drop Design Drawings
                  </p>
                  <p className="text-[10px] text-[#70665F]">
                    Supports .dwg, .dxf, .pdf, .step, .sldprt, .png, .zip
                  </p>
                </div>
              </div>

              {/* Selected Files */}
              {modalUploadFiles.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#544B45] block">
                    Selected Files ({modalUploadFiles.length}):
                  </span>
                  {modalUploadFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#FAF7F2] border border-[#EBE3DB] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate mr-2">
                        <span className="px-1.5 py-0.5 rounded bg-crm-brand-100 text-crm-brand-800 text-[10px] font-mono font-bold uppercase">
                          {file.name.split('.').pop() || 'FILE'}
                        </span>
                        <span className="font-semibold text-slate-800 truncate text-[11px]">{file.name}</span>
                        <span className="text-[10px] text-[#70665F] font-mono">({file.sizeText})</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalUploadFiles((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setUploadingJob(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#EBE3DB] text-[#544B45] font-bold hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalUploadFiles.length === 0}
                  className="px-5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 disabled:opacity-50 text-white font-bold transition shadow-md shadow-crm-brand-700/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Design File</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedJob && (
        <div
          onClick={() => setSelectedJob(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl space-y-4 p-6 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono font-bold text-crm-brand-700 text-sm">{selectedJob.designJobNumber}</span>
                <h3 className="text-base font-extrabold text-[#211B17] mt-0.5">{selectedJob.productName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
              <div>
                <span className="text-[#70665F] block">Project ID:</span>
                <span className="font-mono font-bold text-[#211B17] text-sm">{selectedJob.projectId}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Job Number:</span>
                <span className="font-mono font-bold text-amber-700 text-sm">{selectedJob.jobNumber}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Customer Name:</span>
                <span className="font-bold text-[#211B17]">{selectedJob.customerName}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Customer PO Ref:</span>
                <span className="font-mono text-[#211B17]">{selectedJob.customerPoNumber}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Active Revision:</span>
                <span className="font-mono font-bold text-crm-brand-700">{selectedJob.activeRevision}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Current Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{selectedJob.status?.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* ATTACHED DESIGN DRAWINGS & CAD FILES SECTION */}
            <div className="border border-[#EBE3DB] rounded-xl p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[#211B17] font-extrabold text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-crm-brand-700" />
                  <span>Engineering Drawings & CAD Attachments</span>
                </span>
                <button
                  onClick={() => {
                    const current = selectedJob;
                    setSelectedJob(null);
                    setUploadingJob(current);
                    setModalDrawingTitle(`${current.productName} GA Drawing`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-crm-brand-50 hover:bg-crm-brand-100 text-crm-brand-800 border border-crm-brand-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-crm-brand-700" />
                  <span>Upload Additional Drawing</span>
                </button>
              </div>

              {selectedJob.drawingFileName || (selectedJob.attachments && selectedJob.attachments.length > 0) ? (
                <div className="space-y-2">
                  {selectedJob.drawingFileName && (
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden mr-2">
                        <div className="w-9 h-9 rounded-lg bg-crm-brand-100 border border-crm-brand-200 flex items-center justify-center text-crm-brand-700 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-[#211B17] text-xs block truncate">
                            {selectedJob.drawingTitle || selectedJob.drawingFileName}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-[#70665F] font-mono mt-0.5">
                            <span className="font-bold text-crm-brand-800 uppercase">{selectedJob.drawingFormat || 'CAD'}</span>
                            <span>•</span>
                            <span>{selectedJob.drawingCategory || 'GA Drawing'}</span>
                            <span>•</span>
                            <span className="text-amber-800 font-bold">{selectedJob.activeRevision}</span>
                            {selectedJob.fileSize && (
                              <>
                                <span>•</span>
                                <span>{selectedJob.fileSize}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {selectedJob.fileUrl ? (
                        <a
                          href={selectedJob.fileUrl}
                          download={selectedJob.drawingFileName}
                          className="px-3 py-1.5 rounded-lg bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer flex-shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Attached
                        </span>
                      )}
                    </div>
                  )}

                  {/* List extra attachments if present */}
                  {selectedJob.attachments &&
                    selectedJob.attachments
                      .filter((att) => att.name !== selectedJob.drawingFileName)
                      .map((att, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-white border border-[#EBE3DB] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate mr-2">
                            <Paperclip className="w-3.5 h-3.5 text-crm-brand-700 flex-shrink-0" />
                            <span className="font-semibold text-[#211B17] truncate">{att.name}</span>
                            {att.size && <span className="text-[10px] text-[#70665F] font-mono">({att.size})</span>}
                          </div>
                          {att.url && (
                            <a
                              href={att.url}
                              download={att.name}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Get</span>
                            </a>
                          )}
                        </div>
                      ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-dashed border-[#D5CBC1] text-center">
                  <p className="text-[#70665F] text-xs">No design drawing file uploaded yet for this job.</p>
                  <button
                    onClick={() => {
                      const current = selectedJob;
                      setSelectedJob(null);
                      setUploadingJob(current);
                      setModalDrawingTitle(`${current.productName} GA Drawing`);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Design Now</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 bg-white/40 rounded-xl space-y-1">
              <span className="text-[#70665F] font-bold block">Engineering Remarks / Notes:</span>
              <p className="text-[#544B45] leading-relaxed">
                {selectedJob.remarks || 'Standard ASME Sec VIII Div 1 design calculations applied.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
              <Link
                href={`/designer/approval?job=${selectedJob.jobNumber}`}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-amber-800 font-bold border border-[#EBE3DB]"
              >
                Approval & Release
              </Link>
              <Link
                href={`/designer/bom?job=${selectedJob.jobNumber}`}
                className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold"
              >
                Go to Master BOM
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
