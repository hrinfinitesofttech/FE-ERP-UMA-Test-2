'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { ProjectJobMaster } from '../../../types/crm';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  CheckSquare,
  Users,
  Clock,
  X,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  RefreshCw,
} from 'lucide-react';

export default function ProjectListPage() {
  const router = useRouter();
  const {
    projectJobs,
    isProjectsLoading,
    syncProjects,
    customerPOs,
    quotations,
    createProjectFromCustomerPO,
    updateProject,
    deleteProject,
    projectPlanningRecords,
    can,
  } = useERP();

  // Customer POs that do not yet have a project created
  const availableCustomerPOs = useMemo(() => {
    return customerPOs.filter((po) => {
      const alreadyHasProject = projectJobs.some((prj) =>
        (prj.customerPoNumber && prj.customerPoNumber.trim().toLowerCase() === po.poNumber.trim().toLowerCase()) ||
        ((prj as any).customerPoId && (prj as any).customerPoId === po.id)
      ) || po.status === 'project_created';
      return !alreadyHasProject;
    });
  }, [customerPOs, projectJobs]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Create Project from Customer PO
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState('');
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State for Edit Project
  const [editingProject, setEditingProject] = useState<ProjectJobMaster | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ProjectJobMaster>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Delete Confirmation Modal
  const [deletingProject, setDeletingProject] = useState<ProjectJobMaster | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Manual Live Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncProjects(true);
      showToast('Projects refreshed live from cloud API!');
    } catch (_) {
      showToast('Failed to refresh projects.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projectJobs.filter((p) => {
      if (statusFilter !== 'all' && (p.status || 'planning') !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const custName = p.customerName || '';
        const prodName = p.productName || '';
        const poNumber = p.customerPoNumber || '';
        return (
          p.projectNumber?.toLowerCase().includes(q) ||
          custName.toLowerCase().includes(q) ||
          prodName.toLowerCase().includes(q) ||
          poNumber.toLowerCase().includes(q) ||
          p.specification?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projectJobs, statusFilter, searchQuery]);

  // Statistics
  const totalCount = projectJobs.length;
  const inProgressCount = projectJobs.filter(
    (p) => p.status === 'production' || p.status === 'design' || p.status === 'material_planning'
  ).length;
  const completedCount = projectJobs.filter((p) => p.status === 'completed').length;
  const planningCount = projectJobs.filter((p) => !p.status || p.status === 'planning').length;

  // Handle Create Project from Customer PO
  const handleCreateProject = () => {
    if (!selectedPOId) {
      setErrorMsg('Please select an unassigned Customer Purchase Order (Customer PO).');
      return;
    }
    try {
      setCreating(true);
      setErrorMsg('');
      const newPrj = createProjectFromCustomerPO(selectedPOId);
      setIsCreateModalOpen(false);
      setSelectedPOId('');
      showToast(`Project ${newPrj.projectNumber} created successfully from Customer PO! Ready for planning.`);
      router.push(`/projects/planning?projectId=${newPrj.id}&projectNumber=${newPrj.projectNumber}&mode=create`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  // Clean up any Detailed Specifications prefix
  const cleanSpecification = (spec?: string) => {
    if (!spec) return '';
    return spec.replace(/^Detailed Specifications:\s*/i, '').trim();
  };

  // Open Edit Modal
  const handleOpenEditModal = (e: React.MouseEvent, prj: ProjectJobMaster) => {
    e.stopPropagation();
    setEditingProject(prj);
    setEditFormData({
      productName: prj.productName,
      specification: cleanSpecification(prj.specification),
      status: prj.status || 'planning',
      progressPercent: prj.progressPercent || 0,
      deliveryDate: prj.deliveryDate,
      expectedDeliveryDate: prj.expectedDeliveryDate || prj.deliveryDate,
      currentStage: prj.currentStage || 'Planning & Scope Definition',
    });
    setEditErrors({});
  };

  // Submit Edit Project
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const errors: Record<string, string> = {};
    if (!editFormData.productName || editFormData.productName.trim() === '') {
      errors.productName = 'Product name is required.';
    }
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    updateProject(editingProject.id, {
      ...editFormData,
      progressPercent: Number(editFormData.progressPercent || 0),
    });

    setEditingProject(null);
    showToast(`Project ${editingProject.projectNumber} updated successfully!`);
  };

  // Delete Project Action
  const handleConfirmDelete = () => {
    if (!deletingProject) return;
    deleteProject(deletingProject.id);
    setDeletingProject(null);
    showToast(`Project ${deletingProject.projectNumber} deleted successfully.`);
  };

  // Table Columns
  const columns: ERPColumn<ProjectJobMaster>[] = [
    {
      key: 'projectNumber',
      header: 'Project No',
      isCodeLink: true,
      onCodeClick: (p) => router.push(`/projects/${p.id}`),
      cell: (p) => (
        <div className="space-y-1">
          <span className="font-mono font-bold text-[#7C3AED] hover:underline cursor-pointer">
            {p.projectNumber}
          </span>
          <span className="text-[10px] text-slate-500 block">Start: {formatDate(p.startDate)}</span>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer & References',
      cell: (p) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 block truncate max-w-[200px]">{p.customerName || 'Customer'}</span>
          <div className="text-[10px] text-slate-500 font-mono">
            <span>Customer PO: <strong>{p.customerPoNumber || 'N/A'}</strong></span>
          </div>
        </div>
      ),
    },
    {
      key: 'productName',
      header: 'Machine / Equipment Scope',
      cell: (p) => (
        <div className="max-w-[220px]">
          <span className="font-semibold text-slate-900 block truncate">{p.productName || 'Process Equipment'}</span>
          <span className="text-[11px] text-slate-500 block truncate">{cleanSpecification(p.specification) || 'As per approved Quotation & Customer PO specs'}</span>
        </div>
      ),
    },
    {
      key: 'deliveryDate',
      header: 'Delivery Target',
      cell: (p) => {
        const targetDate = p.deliveryDate || p.startDate;
        return (
          <div className="space-y-0.5">
            <span className="text-slate-900 font-mono text-[11px] font-semibold block">
              {formatDate(targetDate)}
            </span>
            {p.expectedDeliveryDate && new Date(p.expectedDeliveryDate) > new Date(targetDate) && (
              <span className="text-[10px] text-rose-600 font-semibold block">
                Rev: {formatDate(p.expectedDeliveryDate)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'progressPercent',
      header: 'Progress %',
      cell: (p) => {
        const pct = p.progressPercent || 0;
        return (
          <div className="w-24 space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-500 font-medium truncate max-w-[60px]">
                {p.currentStage || p.status || 'Planning'}
              </span>
              <span className="font-bold text-[#7C3AED]">{pct}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  pct >= 100
                    ? 'bg-emerald-500'
                    : pct >= 50
                    ? 'bg-gradient-to-r from-[#7C3AED] to-emerald-500'
                    : 'bg-[#7C3AED]'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (p) => <StatusBadge status={(p.status || 'planning') as any} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (p) => {
        const planRecord = projectPlanningRecords.find(
          (r) => r.projectId === p.id || r.projectNumber === p.projectNumber
        );
        const isPlanningSaved = Boolean(planRecord);

        return (
          <div
            className="flex items-center gap-1.5 whitespace-nowrap min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit Project Button */}
            <button
              onClick={(e) => handleOpenEditModal(e, p)}
              title="Edit Project Details"
              className="p-1.5 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* View 360 Detail */}
            <Link
              href={`/projects/${p.id}`}
              title="View Project Detail"
              className="p-1.5 text-crm-brand-700 hover:text-crm-brand-900 bg-crm-brand-50 hover:bg-crm-brand-100 border border-crm-brand-200 rounded-lg transition"
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>

            {/* Delete Button */}
            <button
              onClick={() => setDeletingProject(p)}
              title="Delete Project"
              className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Project Planning Button */}
            {isPlanningSaved ? (
              <Link
                href={`/projects/planning?id=${planRecord?.id}&mode=edit`}
                title="Edit Project Plan"
                className="px-2 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg inline-flex items-center gap-1 transition shadow-xs"
              >
                <Calendar className="w-3 h-3 text-emerald-600" />
                <span>Plan: {planRecord?.totalTasks} Tasks</span>
              </Link>
            ) : (
              <Link
                href={`/projects/planning?projectId=${p.id}&projectNumber=${p.projectNumber}&mode=create`}
                title="Create Project Planning"
                className="px-2 py-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg inline-flex items-center gap-1 transition shadow-xs"
              >
                <Plus className="w-3 h-3 text-amber-600" />
                <span>Plan Project</span>
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <Layers className="w-4 h-4 text-[#7C3AED]" />
          </div>
          {isProjectsLoading && projectJobs.length === 0 ? (
            <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          )}
          <div className="text-xs text-slate-500">All registered MTO jobs</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">In Planning</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          {isProjectsLoading && projectJobs.length === 0 ? (
            <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-amber-600">{planningCount}</div>
          )}
          <div className="text-xs text-slate-500">Pre-production & scope stages</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">In Execution</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          {isProjectsLoading && projectJobs.length === 0 ? (
            <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-blue-600">{inProgressCount}</div>
          )}
          <div className="text-xs text-slate-500">Design, purchase & shop floor</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          {isProjectsLoading && projectJobs.length === 0 ? (
            <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-emerald-600">{completedCount}</div>
          )}
          <div className="text-xs text-slate-500">Delivered / QC passed</div>
        </div>
      </div>

      {/* Filter Bar with Live Sync */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="all">All Statuses ({totalCount})</option>
            <option value="planning">Planning</option>
            <option value="design">Design</option>
            <option value="material_planning">Material Planning</option>
            <option value="purchase">Purchase</option>
            <option value="production">Production</option>
            <option value="qc">QC Inspection</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Refresh projects from live API"
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 border border-slate-200 transition cursor-pointer text-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#7C3AED] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
        </button>
      </div>

      {/* Main Shasvatm ERP Standard List View */}
      <ERPListPageLayout<ProjectJobMaster>
        breadcrumbs={['DASHBOARD', 'PROJECTS', 'PROJECT DIRECTORY']}
        columns={columns}
        data={filteredProjects}
        addNewLabel={can('project', 'projects', 'create') ? "+ Create Project" : undefined}
        onAddNew={can('project', 'projects', 'create') ? () => setIsCreateModalOpen(true) : undefined}
        onExport={() => {
          const csv = [
            ['Project Number', 'Customer', 'Product', 'Target Delivery', 'Progress %', 'Status'].join(','),
            ...filteredProjects.map(p => [
              `"${p.projectNumber}"`,
              `"${(p.customerName || '').replace(/"/g, '""')}"`,
              `"${(p.productName || '').replace(/"/g, '""')}"`,
              p.deliveryDate || '',
              p.progressPercent || 0,
              p.status || ''
            ].join(','))
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `projects_directory_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        }}
        searchPlaceholder="Search by Project #, Customer, Machine..."
      />

      {/* MODAL: EDIT PROJECT */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#EBE3DB] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-[#211B17] text-sm">
                  Edit Project Details ({editingProject.projectNumber})
                </h3>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-[#70665F] hover:bg-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs">
              {/* Reference Info (Readonly) */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#70665F] block">Customer:</span>
                  <span className="font-bold text-[#211B17]">{editingProject.customerName}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Customer PO:</span>
                  <span className="font-mono text-[#544B45] font-semibold">{editingProject.customerPoNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Equipment Name & Specification */}
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">
                  Machine / Scope Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.productName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-semibold"
                />
                {editErrors.productName && (
                  <p className="text-rose-500 text-[11px] mt-1">{editErrors.productName}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Scope & Technical Specifications</label>
                <textarea
                  rows={2}
                  value={editFormData.specification || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, specification: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              {/* Status & Progress % */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Status</label>
                  <select
                    value={editFormData.status || 'planning'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-medium"
                  >
                    <option value="planning">Planning</option>
                    <option value="design">Design Release</option>
                    <option value="material_planning">Material Planning</option>
                    <option value="purchase">Purchase & Store</option>
                    <option value="production">In Production</option>
                    <option value="qc">Quality Inspection</option>
                    <option value="completed">Completed / Dispatched</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">
                    Progress Percentage ({editFormData.progressPercent || 0}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editFormData.progressPercent || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, progressPercent: Number(e.target.value) })}
                    className="w-full accent-crm-brand-700 mt-2"
                  />
                </div>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Committed Delivery Target</label>
                <input
                  type="date"
                  value={editFormData.deliveryDate ? editFormData.deliveryDate.split('T')[0] : ''}
                  onChange={(e) => setEditFormData({ ...editFormData, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="p-4 border-t border-[#EBE3DB] bg-[#FAF7F2] -mx-5 -mb-5 rounded-b-2xl flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#544B45] font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
                >
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-[#211B17]">Delete Project Record?</h3>
            <p className="text-xs text-[#70665F]">
              Are you sure you want to delete project{' '}
              <strong className="text-[#211B17]">{deletingProject.projectNumber}</strong> ({deletingProject.productName})?
            </p>
            <div className="pt-3 border-t border-[#EBE3DB] flex justify-center gap-3">
              <button
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg shadow-md transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROJECT FROM CUSTOMER PO MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-4 border-b border-[#EBE3DB] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-crm-brand-700" />
                <h3 className="font-bold text-[#211B17] text-sm">Create New Project (From Customer PO)</h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedPOId('');
                  setErrorMsg('');
                }}
                className="p-1 rounded-lg text-[#70665F] hover:bg-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                Select an inward <strong>Customer Purchase Order (Customer PO)</strong> that has not yet been assigned to a project. All customer details, quotation scope, and target delivery dates will be automatically populated into the new Project.
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#544B45] mb-1.5 flex items-center justify-between">
                  <span>Select Customer Purchase Order (Customer PO) *</span>
                  <span className="text-[11px] font-mono text-[#7C3AED]">
                    {availableCustomerPOs.length} Unassigned POs Available
                  </span>
                </label>
                {availableCustomerPOs.length === 0 ? (
                  <div className="p-4 border border-dashed border-amber-300 rounded-xl bg-amber-50 text-amber-800 text-xs">
                    All received Customer POs already have active projects created. Please register a new Customer PO first in CRM.
                  </div>
                ) : (
                  <select
                    value={selectedPOId}
                    onChange={(e) => {
                      setSelectedPOId(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-crm-brand-700 text-[#211B17]"
                  >
                    <option value="">-- Choose Customer PO to Create Project --</option>
                    {availableCustomerPOs.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} • {po.customerName} • {formatCurrency(po.poAmount)} (PO Date: {formatDate(po.poDate)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedPOId && (
                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-3 text-xs">
                  {(() => {
                    const po = customerPOs.find((p) => p.id === selectedPOId || p.poNumber === selectedPOId);
                    if (!po) return null;
                    const qtn = quotations.find((q) =>
                      (po.quotationId && (q.id === po.quotationId || q.quotationNumber === po.quotationId)) ||
                      (po.quotationNumber && (q.quotationNumber === po.quotationNumber || q.id === po.quotationNumber))
                    );
                    const lastRev = qtn?.revisions?.[qtn.revisions.length - 1];
                    const machineName =
                      lastRev?.items?.[0]?.productName ||
                      qtn?.latestSummary?.machineProduct ||
                      (po as any).scopeOfWork ||
                      'Industrial Process Equipment';

                    return (
                      <>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Customer / Client:</span>
                          <span className="text-[#211B17] font-bold">{po.customerName}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Customer PO Number:</span>
                          <span className="font-mono text-crm-brand-700 font-bold">{po.poNumber}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Linked Quotation:</span>
                          <span className="font-mono text-purple-700 font-bold">{po.quotationNumber || qtn?.quotationNumber || 'Direct PO'}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Equipment / Machine:</span>
                          <span className="text-[#211B17] font-bold truncate max-w-xs">{machineName}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Confirmed Order Value:</span>
                          <span className="font-mono text-emerald-700 font-bold">{formatCurrency(po.poAmount)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Committed Delivery Date:</span>
                          <span className="font-mono text-[#544B45] font-bold">{formatDate(po.deliveryDate)}</span>
                        </div>

                        <div className="pt-2 border-t border-[#EBE3DB] flex justify-between text-[11px] font-mono font-bold text-crm-brand-700">
                          <span>Auto Project ID: PRJ-2026-xxx</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#EBE3DB] bg-[#FAF7F2] flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedPOId('');
                  setErrorMsg('');
                }}
                className="px-4 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-[#544B45] font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!selectedPOId || creating}
                className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                {creating ? 'Generating Project...' : 'Initialize Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
