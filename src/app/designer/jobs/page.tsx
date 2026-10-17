'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DesignJob, DesignJobStatus } from '../../../types/designer';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { formatDate } from '../../../lib/utils';
import {
  Palette,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  X,
  FileText,
  Upload,
  UploadCloud,
  File,
  Eye,
  Download,
  Trash2,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
  FolderArchive,
  Image as ImageIcon,
  AlertCircle,
  FileCheck,
  Building2,
  Tag,
  ArrowRight,
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
    updateDesignJob,
    completeDesignJob,
    addDesignJob,
    projectPlanningRecords,
    projectJobs,
    currentUser,
    availableEmployees,
    employees,
    addDrawing2D,
  } = useERP();

  const [notificationMsg, setNotificationMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Upload Modal State
  const [uploadingJob, setUploadingJob] = useState<DesignJob | null>(null);
  const [modalUploadFiles, setModalUploadFiles] = useState<UploadedDesignFile[]>([]);
  const [modalDrawingTitle, setModalDrawingTitle] = useState('');
  const [modalDrawingCategory, setModalDrawingCategory] = useState<'GA' | 'Fabrication' | 'P&ID' | 'Electrical' | 'Layout' | '3D Model'>('GA');
  const [modalDrawingRevision, setModalDrawingRevision] = useState('REV-01');
  const [modalIsDragging, setModalIsDragging] = useState(false);
  const [modalRemarks, setModalRemarks] = useState('');
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // View / Preview Modal State
  const [previewJob, setPreviewJob] = useState<DesignJob | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const sizeText = formatFileSize(file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        const newFileItem: UploadedDesignFile = {
          name: file.name,
          sizeText,
          type: file.type || ext,
          dataUrl: event.target?.result as string,
        };
        setModalUploadFiles((prev) => [...prev, newFileItem]);
        if (!modalDrawingTitle) {
          setModalDrawingTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Merge designJobs with any design tasks from projectPlanningRecords that aren't synced yet
  const allMergedJobs = useMemo(() => {
    const list: DesignJob[] = [...designJobs];

    // Check project planning records for any design tasks
    const isDesignRelated = (taskName: string, persons: string[] = []) => {
      const t = (taskName || '').toLowerCase();
      const p = persons.join(' ').toLowerCase();
      return (
        t.includes('design') ||
        t.includes('drawing') ||
        t.includes('draft') ||
        t.includes('cad') ||
        t.includes('model') ||
        t.includes('ga') ||
        t.includes('p&id') ||
        t.includes('bom') ||
        t.includes('layout') ||
        t.includes('schematic') ||
        p.includes('design')
      );
    };

    projectPlanningRecords.forEach((plan) => {
      if (!plan.tasks) return;
      const designTasks = plan.tasks.filter((t) => isDesignRelated(t.taskName, t.assignedPersons));
      designTasks.forEach((task, idx) => {
        const alreadyExists = list.some(
          (j) =>
            (j.planningTaskId && j.planningTaskId === task.id) ||
            (j.projectId === plan.projectId && (j.drawingTitle || '').toLowerCase() === task.taskName.toLowerCase())
        );

        if (!alreadyExists) {
          const desNum = `DES-${plan.projectNumber}-${idx + 1}`;
          list.push({
            id: desNum,
            designJobNumber: desNum,
            projectId: plan.projectId,
            projectNumber: plan.projectNumber,
            jobNumber: (plan as any).jobNumber || plan.projectNumber,
            customerId: (plan as any).customerId || '',
            customerName: plan.customerName || 'Customer',
            customerPoNumber: plan.customerPoNumber || '',
            salesOrderNumber: '',
            productName: plan.productName || 'Process Equipment',
            quantity: 1,
            deliveryDate: plan.deliveryDate || task.endDate || '',
            designManager: task.assignedPersons?.[0] || 'Design Dept',
            assignedDesigner: task.assignedPersons && task.assignedPersons.length > 0 ? task.assignedPersons.join(', ') : 'Design Team',
            priority: 'high',
            requiredDate: task.endDate || plan.deliveryDate || '',
            startDate: task.startDate || '',
            targetCompletionDate: task.endDate || '',
            durationDays: task.durationDays || 0,
            status: task.status === 'completed' ? 'approved' : 'assigned',
            remarks: task.remarks || `From Project Planning (${plan.projectNumber})`,
            activeRevision: 'REV-00',
            drawingTitle: task.taskName,
            createdDate: plan.createdAt ? plan.createdAt.split('T')[0] : '2026-10-18',
            planningTaskId: task.id,
            planningId: plan.id,
          });
        }
      });
    });

    return list;
  }, [designJobs, projectPlanningRecords]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = allMergedJobs.length;
    const completed = allMergedJobs.filter(
      (j) =>
        j.status === 'approved' ||
        j.status === 'released_to_production' ||
        j.status === 'bom_approved' ||
        Boolean(j.completedDate)
    ).length;
    const withDrawings = allMergedJobs.filter(
      (j) => Boolean(j.drawingFileName) || Boolean(j.attachments && j.attachments.length > 0)
    ).length;
    const pending = total - completed;
    return { total, completed, withDrawings, pending };
  }, [allMergedJobs]);

  // Filtered by status
  const displayData = useMemo(() => {
    return allMergedJobs.filter((j) => {
      const isCompleted =
        j.status === 'approved' ||
        j.status === 'released_to_production' ||
        j.status === 'bom_approved' ||
        Boolean(j.completedDate);
      if (statusFilter === 'completed') return isCompleted;
      if (statusFilter === 'in_progress') return !isCompleted;
      return true;
    });
  }, [allMergedJobs, statusFilter]);

  // Handle Complete Work
  const handleCompleteWork = (job: DesignJob) => {
    completeDesignJob(job.id, currentUser?.name || job.assignedDesigner || 'Designer', 'Design completed and approved');
    setNotificationMsg(`Design Job "${job.designJobNumber}" for ${job.productName} marked as Completed successfully!`);
    setTimeout(() => setNotificationMsg(''), 6000);
  };

  // Open Upload Modal
  const handleOpenUploadModal = (job: DesignJob) => {
    setUploadingJob(job);
    setModalDrawingTitle(job.drawingTitle || `${job.productName} Design Drawing`);
    setModalDrawingRevision(job.activeRevision || 'REV-01');
    setModalUploadFiles([]);
    setModalRemarks('');
  };

  // Save Uploaded Design
  const handleSaveUploadDesign = (andComplete = false) => {
    if (!uploadingJob) return;

    const primaryFile = modalUploadFiles[0];
    const drwCategory = modalDrawingCategory || 'GA';
    const drwNum = `DWG-${uploadingJob.jobNumber || uploadingJob.projectNumber || '2026'}-${Date.now().toString().slice(-3)}`;
    const drwTitle = modalDrawingTitle || (primaryFile ? primaryFile.name.replace(/\.[^/.]+$/, '') : `${uploadingJob.productName} Drawing`);
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

    const updates: Partial<DesignJob> = {
      drawingTitle: drwTitle,
      drawingCategory: drwCategory,
      activeRevision: drwRev,
      remarks: modalRemarks ? `${uploadingJob.remarks ? uploadingJob.remarks + ' | ' : ''}${modalRemarks}` : uploadingJob.remarks,
    };

    if (primaryFile) {
      updates.drawingFileName = primaryFile.name;
      updates.drawingNumber = drwNum;
      updates.drawingFormat = primaryFile.name.split('.').pop()?.toUpperCase() || 'FILE';
      updates.fileSize = primaryFile.sizeText;
      updates.fileUrl = primaryFile.dataUrl;
      updates.attachments = [...newAtts, ...existingAtts];
    }

    if (andComplete) {
      updates.status = 'approved';
      updates.completedDate = new Date().toISOString().split('T')[0];
      updates.completedBy = currentUser?.name || uploadingJob.assignedDesigner || 'Designer';
    } else {
      if (uploadingJob.status === 'assigned') {
        updates.status = 'in_progress';
      }
    }

    updateDesignJob(uploadingJob.id, updates);

    // If andComplete is requested, trigger completeDesignJob logic as well to sync project planning
    if (andComplete) {
      completeDesignJob(uploadingJob.id, currentUser?.name || uploadingJob.assignedDesigner, 'Completed with design file upload');
    }

    // Register drawing in 2D Drawing registry
    if (primaryFile && addDrawing2D) {
      addDrawing2D({
        drawingNumber: drwNum,
        projectId: uploadingJob.projectId,
        jobNumber: uploadingJob.jobNumber,
        designJobId: uploadingJob.designJobNumber || uploadingJob.id,
        machineName: uploadingJob.productName,
        drawingTitle: drwTitle,
        category: drwCategory as any,
        revision: drwRev,
        designer: uploadingJob.assignedDesigner || 'Design Team',
        fileFormat: (primaryFile.name.split('.').pop()?.toUpperCase() as any) || 'IMAGE',
        fileUrl: primaryFile.dataUrl,
        fileSize: primaryFile.sizeText,
        status: andComplete ? 'approved' : 'draft',
      });
    }

    setNotificationMsg(
      andComplete
        ? `Uploaded design "${primaryFile?.name || drwTitle}" and marked Job ${uploadingJob.designJobNumber} as COMPLETED!`
        : `Uploaded design file(s) for Job ${uploadingJob.designJobNumber} successfully!`
    );
    setTimeout(() => setNotificationMsg(''), 6000);
    setUploadingJob(null);
    setModalUploadFiles([]);
  };

  // Table Columns Definition
  const columns: ERPColumn<DesignJob>[] = [
    {
      key: 'designJobNumber',
      header: 'Design Job #',
      cell: (job) => {
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-xs text-crm-brand-700 tracking-tight">
                {job.designJobNumber}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {job.activeRevision || 'REV-00'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Created: {formatDate(job.createdDate)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'projectDetails',
      header: 'Project & Customer',
      cell: (job) => {
        return (
          <div className="space-y-1 max-w-[240px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono font-bold text-xs text-slate-900">
                {job.projectNumber || job.projectId}
              </span>
              {job.customerPoNumber && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  PO: {job.customerPoNumber}
                </span>
              )}
            </div>
            <div className="font-bold text-xs text-slate-800 truncate" title={job.productName}>
              {job.productName}
            </div>
            <div className="text-[11px] text-slate-500 truncate" title={job.customerName}>
              {job.customerName}
            </div>
          </div>
        );
      },
    },
    {
      key: 'drawingTitle',
      header: 'Design Task / Title',
      cell: (job) => {
        return (
          <div className="space-y-1 max-w-[220px]">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-crm-brand-600 flex-shrink-0" />
              <span className="truncate" title={job.drawingTitle || 'Design Preparation'}>
                {job.drawingTitle || 'Design Preparation'}
              </span>
            </div>
            {job.remarks && (
              <p className="text-[10px] text-slate-500 line-clamp-1 italic" title={job.remarks}>
                {job.remarks}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'assignedDesigner',
      header: 'Assigned Designer',
      cell: (job) => {
        const designer = job.assignedDesigner || 'Unassigned';
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-crm-brand-100 text-crm-brand-800 flex items-center justify-center text-xs font-bold border border-crm-brand-200 flex-shrink-0">
              {designer.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 block truncate max-w-[130px]" title={designer}>
                {designer}
              </span>
              <span className="text-[10px] text-slate-500 block">Engineering</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'timeline',
      header: 'Target Timeline',
      cell: (job) => {
        const target = job.targetCompletionDate || job.requiredDate || job.deliveryDate;
        return (
          <div className="space-y-0.5 text-xs font-mono">
            {job.startDate && (
              <div className="text-[10px] text-slate-500">
                Start: <span className="font-semibold text-slate-700">{formatDate(job.startDate)}</span>
              </div>
            )}
            <div className="text-xs font-bold text-amber-700">
              Due: {formatDate(target)}
            </div>
            {job.durationDays ? (
              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                {job.durationDays} Days Duration
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'uploadedDesign',
      header: 'Uploaded Design / Image',
      cell: (job) => {
        const hasFile = Boolean(job.drawingFileName || (job.attachments && job.attachments.length > 0));
        const primaryFile = job.attachments?.[0] || (job.drawingFileName ? {
          name: job.drawingFileName,
          type: job.drawingFormat || 'DOCUMENT',
          size: job.fileSize,
          url: job.fileUrl,
        } : null);

        const isImage = primaryFile?.type?.toLowerCase().includes('image') ||
          primaryFile?.name?.toLowerCase().endsWith('.jpg') ||
          primaryFile?.name?.toLowerCase().endsWith('.jpeg') ||
          primaryFile?.name?.toLowerCase().endsWith('.png') ||
          primaryFile?.name?.toLowerCase().endsWith('.webp');

        if (!hasFile || !primaryFile) {
          return (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 w-fit">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[11px] font-semibold">Pending Upload</span>
            </div>
          );
        }

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isImage && primaryFile.url ? (
                <button
                  type="button"
                  onClick={() => setPreviewJob(job)}
                  className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 hover:opacity-80 transition cursor-pointer"
                  title="Click to view image"
                >
                  <img src={primaryFile.url} alt={primaryFile.name} className="w-full h-full object-cover" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-crm-brand-50 border border-crm-brand-200 text-crm-brand-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
              )}
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]" title={primaryFile.name}>
                  {primaryFile.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {primaryFile.size || 'Design File'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPreviewJob(job)}
              className="text-[10px] font-bold text-crm-brand-700 hover:text-crm-brand-900 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>Preview Design</span>
            </button>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (job) => {
        const isCompleted =
          job.status === 'approved' ||
          job.status === 'released_to_production' ||
          job.status === 'bom_approved' ||
          Boolean(job.completedDate);

        if (isCompleted) {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Completed
              </span>
              {job.completedDate && (
                <span className="block text-[10px] text-slate-400 font-mono">
                  {formatDate(job.completedDate)}
                </span>
              )}
            </div>
          );
        }

        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            In Progress
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (job) => {
        const isCompleted =
          job.status === 'approved' ||
          job.status === 'released_to_production' ||
          job.status === 'bom_approved' ||
          Boolean(job.completedDate);

        return (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Upload Design Image / File */}
            <button
              type="button"
              onClick={() => handleOpenUploadModal(job)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-crm-brand-600 text-slate-700 hover:text-crm-brand-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="Upload JPG/PNG image, PDF or CAD folder"
            >
              <Upload className="w-3.5 h-3.5 text-crm-brand-600" />
              <span>{job.drawingFileName || (job.attachments && job.attachments.length > 0) ? 'Update Design' : 'Upload Design'}</span>
            </button>

            {/* Complete Work Button */}
            {!isCompleted ? (
              <button
                type="button"
                onClick={() => handleCompleteWork(job)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Mark design work as completed"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Complete Work</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPreviewJob(job)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="View completed details"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>View</span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-100 text-crm-brand-800 border border-crm-brand-200 text-[11px] font-mono font-bold">
              MODULE 3.1
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Palette className="w-7 h-7 text-crm-brand-600" />
              Design Jobs & Engineering
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Auto-linked from Project Planning. Designers upload drawing images/CAD files and mark tasks completed.
          </p>
        </div>

        {/* Filter Quick Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Jobs ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'in_progress' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'completed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({stats.completed})
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Design Jobs</span>
            <Palette className="w-4 h-4 text-crm-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-500">Planned from projects</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{stats.pending}</div>
          <div className="text-[11px] text-slate-500">Currently active on drafting</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Designs Uploaded</span>
            <ImageIcon className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">{stats.withDrawings}</div>
          <div className="text-[11px] text-slate-500">Drawings / images attached</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed Work</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.completed}</div>
          <div className="text-[11px] text-slate-500">Approved & released</div>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationMsg('')}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Standard ERP List View */}
      <ERPListPageLayout<DesignJob>
        breadcrumbs={['DASHBOARD', 'DESIGN & ENGINEERING', 'DESIGN JOBS']}
        columns={columns}
        data={displayData}
        searchPlaceholder="Search Design Job #, Project #, Customer, Scope, Designer..."
      />

      {/* ========================================================================= */}
      {/* MODAL 1: UPLOAD DESIGN / DRAWING IMAGE & COMPLETE WORK                     */}
      {/* ========================================================================= */}
      {uploadingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-crm-brand-700" />
                  <span>Upload Design Image / File</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Job <span className="font-mono font-bold text-slate-700">{uploadingJob.designJobNumber}</span> • {uploadingJob.productName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUploadingJob(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Project Context Summary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">PROJECT / PO</span>
                <span className="font-mono font-bold text-slate-800">{uploadingJob.projectNumber || uploadingJob.projectId}</span>
                {uploadingJob.customerPoNumber && (
                  <span className="text-[10px] text-blue-600 block">PO: {uploadingJob.customerPoNumber}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">CUSTOMER</span>
                <span className="font-bold text-slate-800 truncate block">{uploadingJob.customerName}</span>
              </div>
            </div>

            {/* Drawing Meta Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Drawing Title / Scope</label>
                <input
                  type="text"
                  value={modalDrawingTitle}
                  onChange={(e) => setModalDrawingTitle(e.target.value)}
                  placeholder="e.g. GA Drawing, 3D Equipment Layout"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-crm-brand-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Revision</label>
                <input
                  type="text"
                  value={modalDrawingRevision}
                  onChange={(e) => setModalDrawingRevision(e.target.value)}
                  placeholder="e.g. REV-01"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:border-crm-brand-700"
                />
              </div>
            </div>

            {/* Drag & Drop File Upload Area */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Select Design Image / CAD / ZIP Folder
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setModalIsDragging(true);
                }}
                onDragLeave={() => setModalIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setModalIsDragging(false);
                  if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
                }}
                onClick={() => modalFileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center ${
                  modalIsDragging
                    ? 'border-crm-brand-600 bg-crm-brand-50'
                    : 'border-slate-300 hover:border-crm-brand-600 bg-slate-50 hover:bg-white'
                }`}
              >
                <input
                  ref={modalFileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf,.dwg,.dxf,.step,.stp,.zip,.rar"
                  onChange={(e) => {
                    if (e.target.files) processFiles(e.target.files);
                  }}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-crm-brand-100 text-crm-brand-700 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Click to browse or drag & drop design files
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Supports JPG, PNG, PDF, CAD (DWG/DXF), ZIP / Drawing folders
                  </span>
                </div>
              </div>
            </div>

            {/* File Previews List */}
            {modalUploadFiles.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Selected Files ({modalUploadFiles.length})</span>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {modalUploadFiles.map((file, idx) => {
                    const isImg = file.type.toLowerCase().includes('image') || file.dataUrl?.startsWith('data:image');
                    return (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {isImg && file.dataUrl ? (
                            <img src={file.dataUrl} alt={file.name} className="w-8 h-8 rounded object-cover flex-shrink-0 border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-800 block truncate" title={file.name}>{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{file.sizeText}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setModalUploadFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-red-500 hover:bg-red-50 transition cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Designer Notes */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Notes / Remarks</label>
              <input
                type="text"
                value={modalRemarks}
                onChange={(e) => setModalRemarks(e.target.value)}
                placeholder="e.g. Design verified with client specifications, ready for manufacturing"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-crm-brand-700"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUploadingJob(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveUploadDesign(false)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Upload File Only
              </button>

              <button
                type="button"
                onClick={() => handleSaveUploadDesign(true)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Upload & Complete Work</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW / PREVIEW DESIGN DRAWINGS & SPECS                           */}
      {/* ========================================================================= */}
      {previewJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-crm-brand-700">{previewJob.designJobNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {previewJob.activeRevision || 'REV-00'}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {previewJob.productName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewJob(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">PROJECT NUMBER</span>
                <span className="font-mono font-bold text-slate-800">{previewJob.projectNumber || previewJob.projectId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">CUSTOMER</span>
                <span className="font-bold text-slate-800 truncate block">{previewJob.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">CUSTOMER PO</span>
                <span className="font-mono font-bold text-blue-700">{previewJob.customerPoNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">DESIGNER</span>
                <span className="font-bold text-slate-800">{previewJob.assignedDesigner}</span>
              </div>
            </div>

            {/* Design Images / Drawing Attachments Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Design Drawing / Uploaded Files</span>
              {previewJob.attachments && previewJob.attachments.length > 0 ? (
                <div className="space-y-3">
                  {previewJob.attachments.map((att, idx) => {
                    const isImg = att.type?.toLowerCase().includes('image') || att.url?.startsWith('data:image') ||
                      att.name.toLowerCase().endsWith('.jpg') || att.name.toLowerCase().endsWith('.jpeg') || att.name.toLowerCase().endsWith('.png');
                    return (
                      <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-crm-brand-700" />
                            <span className="text-xs font-bold text-slate-800">{att.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({att.size || 'File'})</span>
                          </div>
                          {att.url && (
                            <a
                              href={att.url}
                              download={att.name}
                              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-crm-brand-600 rounded-lg text-xs font-bold text-crm-brand-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </a>
                          )}
                        </div>
                        {isImg && att.url && (
                          <div className="max-h-96 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2">
                            <img src={att.url} alt={att.name} className="max-h-92 w-auto object-contain rounded" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : previewJob.fileUrl ? (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{previewJob.drawingFileName || 'Drawing File'}</span>
                    <a
                      href={previewJob.fileUrl}
                      download={previewJob.drawingFileName || 'design-drawing'}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-crm-brand-700 flex items-center gap-1 shadow-2xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                  {previewJob.fileUrl.startsWith('data:image') && (
                    <div className="max-h-96 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2">
                      <img src={previewJob.fileUrl} alt="Design drawing" className="max-h-92 w-auto object-contain rounded" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
                  <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                  No design image or CAD drawing has been uploaded for this job yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setPreviewJob(null);
                  handleOpenUploadModal(previewJob);
                }}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-crm-brand-600 text-crm-brand-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload / Update Files</span>
              </button>

              <div className="flex items-center gap-2">
                {previewJob.status !== 'approved' && previewJob.status !== 'released_to_production' && !previewJob.completedDate && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCompleteWork(previewJob);
                      setPreviewJob(null);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete Work</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewJob(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
