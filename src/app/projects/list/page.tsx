'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
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
  Cpu,
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
} from 'lucide-react';

export default function ProjectListPage() {
  const router = useRouter();
  const {
    projectJobs,
    salesOrders,
    createProjectFromSalesOrder,
    updateProject,
    deleteProject,
    openJobModal,
    availableEmployees,
    employees,
    can,
    currentUser,
  } = useERP();

  // Unified Employees List for Project Manager selection
  const employeeList = useMemo(() => {
    const list =
      availableEmployees && availableEmployees.length > 0
        ? availableEmployees
        : employees && employees.length > 0
        ? employees
        : [];
    return list;
  }, [availableEmployees, employees]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');

  // Modal State for Create Project from Sales Order
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSOId, setSelectedSOId] = useState('');
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

  // Confirmed Sales Orders available for Project creation
  const confirmedSalesOrders = salesOrders.filter((s) => s.status === 'confirmed');

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projectJobs.filter((p) => {
      if (statusFilter !== 'all' && (p.status || 'planning') !== statusFilter) return false;
      if (priorityFilter !== 'all' && (p.priority || 'medium') !== priorityFilter) return false;
      if (managerFilter !== 'all' && p.projectManager !== managerFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.projectNumber?.toLowerCase().includes(q) ||
          p.jobNumber?.toLowerCase().includes(q) ||
          p.customerName?.toLowerCase().includes(q) ||
          p.productName?.toLowerCase().includes(q) ||
          p.salesOrderNumber?.toLowerCase().includes(q) ||
          p.specification?.toLowerCase().includes(q) ||
          p.projectManager?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projectJobs, statusFilter, priorityFilter, managerFilter, searchQuery]);

  // Statistics
  const totalCount = projectJobs.length;
  const inProgressCount = projectJobs.filter(
    (p) => p.status === 'production' || p.status === 'design' || p.status === 'material_planning'
  ).length;
  const completedCount = projectJobs.filter((p) => p.status === 'completed').length;
  const planningCount = projectJobs.filter((p) => !p.status || p.status === 'planning').length;

  // Handle Create Project
  const handleCreateProject = () => {
    if (!selectedSOId) {
      setErrorMsg('Please select a confirmed Sales Order.');
      return;
    }
    try {
      setCreating(true);
      setErrorMsg('');
      const newPrj = createProjectFromSalesOrder(selectedSOId);
      setIsCreateModalOpen(false);
      setSelectedSOId('');
      showToast(`Project ${newPrj.projectNumber} created successfully!`);
      router.push(`/projects/${newPrj.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (e: React.MouseEvent, prj: ProjectJobMaster) => {
    e.stopPropagation();
    setEditingProject(prj);
    setEditFormData({
      productName: prj.productName,
      specification: prj.specification,
      projectManager: prj.projectManager || 'Bhavin Shah',
      priority: prj.priority || 'high',
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
    if (!editFormData.projectManager || editFormData.projectManager.trim() === '') {
      errors.projectManager = 'Project manager is required.';
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
  const columns: Column<ProjectJobMaster>[] = [
    {
      header: 'Project & Job No',
      accessorKey: 'projectNumber',
      cell: (p) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${p.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-mono font-bold text-crm-brand-700 hover:text-crm-brand-800 hover:underline"
            >
              {p.projectNumber}
            </Link>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
              {p.jobNumber}
            </span>
          </div>
          <span className="text-[10px] text-[#70665F] block">Start: {formatDate(p.startDate)}</span>
        </div>
      ),
    },
    {
      header: 'Customer & References',
      cell: (p) => (
        <div className="space-y-0.5">
          <span className="font-bold text-[#211B17] block truncate max-w-[200px]">{p.customerName}</span>
          <div className="text-[10px] text-[#70665F] font-mono flex items-center gap-1.5">
            <span>SO: <strong>{p.salesOrderNumber || 'N/A'}</strong></span>
            <span>•</span>
            <span>PO: <strong>{p.customerPoNumber || 'N/A'}</strong></span>
          </div>
        </div>
      ),
    },
    {
      header: 'Machine / Equipment Scope',
      cell: (p) => (
        <div className="max-w-[220px]">
          <span className="font-semibold text-[#211B17] block truncate">{p.productName}</span>
          <span className="text-[11px] text-[#70665F] block truncate">{p.specification || 'As per Sales Order'}</span>
        </div>
      ),
    },
    {
      header: 'Project Manager',
      accessorKey: 'projectManager',
      cell: (p) => (
        <span className="font-semibold text-[#544B45] text-xs">
          {p.projectManager || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Delivery Target',
      cell: (p) => (
        <div className="space-y-0.5">
          <span className="text-[#211B17] font-mono text-[11px] font-semibold block">
            {formatDate(p.deliveryDate)}
          </span>
          {p.expectedDeliveryDate && new Date(p.expectedDeliveryDate) > new Date(p.deliveryDate) && (
            <span className="text-[10px] text-rose-600 font-semibold block">
              Rev: {formatDate(p.expectedDeliveryDate)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Progress %',
      cell: (p) => {
        const pct = p.progressPercent || 0;
        return (
          <div className="w-24 space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[#70665F] font-medium truncate max-w-[60px]">
                {p.currentStage || p.status || 'Planning'}
              </span>
              <span className="font-bold text-crm-brand-700">{pct}%</span>
            </div>
            <div className="w-full bg-[#EBE3DB]/60 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  pct >= 100
                    ? 'bg-emerald-500'
                    : pct >= 50
                    ? 'bg-gradient-to-r from-crm-brand-700 to-emerald-500'
                    : 'bg-crm-brand-700'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Priority',
      cell: (p) => {
        const priority = p.priority || 'medium';
        const colors: Record<string, string> = {
          urgent: 'bg-rose-50 text-rose-700 border-rose-200',
          high: 'bg-amber-50 text-amber-700 border-amber-200',
          medium: 'bg-blue-50 text-blue-700 border-blue-200',
          low: 'bg-slate-50 text-slate-700 border-slate-200',
        };
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
              colors[priority] || colors.medium
            }`}
          >
            {priority}
          </span>
        );
      },
    },
    {
      header: 'Status',
      cell: (p) => <StatusBadge status={(p.status || 'planning') as any} />,
    },
    {
      header: 'Actions',
      cell: (p) => (
        <div
          className="flex items-center gap-1.5 whitespace-nowrap min-w-[190px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Edit Project Button */}
          <button
            onClick={(e) => handleOpenEditModal(e, p)}
            title="Edit Project Details"
            className="p-1.5 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* View 360 Detail */}
          <Link
            href={`/projects/${p.id}`}
            title="View Project 360° Detail"
            className="p-1.5 text-crm-brand-700 hover:text-crm-brand-900 bg-crm-brand-50 hover:bg-crm-brand-100 border border-crm-brand-200 rounded-lg transition"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {/* 360 Traceability Modal */}
          <button
            onClick={() => openJobModal(p.jobNumber)}
            title="Launch 360° Traceability Modal"
            className="p-1.5 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>

          {/* Manage Tasks */}
          <Link
            href={`/projects/tasks?projectId=${p.id}`}
            title="Manage Tasks"
            className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </Link>

          {/* Assign Department */}
          <Link
            href={`/projects/department-assignments?projectId=${p.id}`}
            title="Assign Department"
            className="p-1.5 text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
          >
            <Users className="w-3.5 h-3.5" />
          </Link>

          {/* Delete Button */}
          <button
            onClick={() => setDeletingProject(p)}
            title="Delete Project"
            className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-xs pb-10 bg-white min-h-screen text-[#211B17] p-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-50 text-crm-brand-700 font-mono text-[10px] font-bold uppercase tracking-wider border border-crm-brand-200">
              Project Master Directory
            </span>
          </div>
          <h1 className="text-xl font-black text-[#211B17] flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-crm-brand-700" />
            Active Make-to-Order Projects & Jobs
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Every project listed here originates from a Confirmed Sales Order and maintains complete shop floor traceability.
          </p>
        </div>

        {can('project', 'projects', 'create') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition transform active:scale-95 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project (From SO)</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <Layers className="w-4 h-4 text-crm-brand-700" />
          </div>
          <div className="text-2xl font-black text-[#211B17]">{totalCount}</div>
          <div className="text-xs text-[#70665F]">All registered MTO jobs</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="text-xs font-semibold uppercase tracking-wider">In Planning</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{planningCount}</div>
          <div className="text-xs text-[#70665F]">Pre-production & scope stages</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="text-xs font-semibold uppercase tracking-wider">In Execution</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{inProgressCount}</div>
          <div className="text-xs text-[#70665F]">Design, purchase & shop floor</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{completedCount}</div>
          <div className="text-xs text-[#70665F]">Delivered / QC passed</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Project #, Job #, Customer, Machine, Manager..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700 text-[#211B17]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#211B17] focus:outline-none"
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

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#211B17] focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-[#EBE3DB] overflow-hidden shadow-sm">
        <DataTable
          title="Project & Job Repository"
          subtitle={`Total ${filteredProjects.length} Projects found`}
          columns={columns}
          data={filteredProjects}
          onRowClick={(p) => router.push(`/projects/${p.id}`)}
        />
      </div>

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
                  <span className="text-[#70665F] block">Job Number:</span>
                  <span className="font-mono font-bold text-amber-700">{editingProject.jobNumber}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Sales Order:</span>
                  <span className="font-mono text-crm-brand-700">{editingProject.salesOrderNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block">Customer PO:</span>
                  <span className="font-mono text-[#544B45]">{editingProject.customerPoNumber || 'N/A'}</span>
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

              {/* Project Manager & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">
                    Project Manager <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editFormData.projectManager || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, projectManager: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-medium"
                  >
                    <option value="">-- Select Manager --</option>
                    {employeeList.map((emp) => {
                      const name =
                        emp.name || (emp as any).employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id;
                      return (
                        <option key={emp.id} value={name}>
                          {name} ({emp.department || 'Management'})
                        </option>
                      );
                    })}
                  </select>
                  {editErrors.projectManager && (
                    <p className="text-rose-500 text-[11px] mt-1">{editErrors.projectManager}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Priority</label>
                  <select
                    value={editFormData.priority || 'medium'}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-medium"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
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

              {/* Delivery Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Committed Delivery Target</label>
                  <input
                    type="date"
                    value={editFormData.deliveryDate ? editFormData.deliveryDate.split('T')[0] : ''}
                    onChange={(e) => setEditFormData({ ...editFormData, deliveryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Revised Estimated Delivery</label>
                  <input
                    type="date"
                    value={
                      editFormData.expectedDeliveryDate
                        ? editFormData.expectedDeliveryDate.split('T')[0]
                        : ''
                    }
                    onChange={(e) => setEditFormData({ ...editFormData, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
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

      {/* CREATE PROJECT FROM SALES ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-4 border-b border-[#EBE3DB] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-crm-brand-700" />
                <h3 className="font-bold text-[#211B17] text-sm">Create New Project & Job</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#70665F] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                A Project can only be created from a <strong>Confirmed Sales Order</strong>. All customer, PO, equipment specs, and delivery dates will be automatically fetched.
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#544B45] mb-1.5">
                  Select Confirmed Sales Order *
                </label>
                {confirmedSalesOrders.length === 0 ? (
                  <div className="p-4 border border-dashed border-amber-300 rounded-xl bg-amber-50 text-amber-800 text-xs">
                    No pending confirmed Sales Orders available. Please confirm a Sales Order in CRM first.
                  </div>
                ) : (
                  <select
                    value={selectedSOId}
                    onChange={(e) => setSelectedSOId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-crm-brand-700 text-[#211B17]"
                  >
                    <option value="">-- Choose Sales Order --</option>
                    {confirmedSalesOrders.map((so) => (
                      <option key={so.id} value={so.id}>
                        {so.salesOrderNumber} • {so.customerName} • {so.items[0]?.productName || 'Equipment'} ({formatCurrency(so.orderValue)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedSOId && (
                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-2 text-xs">
                  {(() => {
                    const so = salesOrders.find((s) => s.id === selectedSOId);
                    if (!so) return null;
                    return (
                      <>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Customer:</span>
                          <span className="text-[#211B17] font-bold">{so.customerName}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Customer PO:</span>
                          <span className="font-mono text-crm-brand-700">{so.customerPoNumber}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Equipment Scope:</span>
                          <span className="text-[#211B17] font-bold truncate max-w-xs">{so.items[0]?.productName}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Order Value:</span>
                          <span className="font-mono text-emerald-700 font-bold">{formatCurrency(so.orderValue)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#70665F]">Delivery Date:</span>
                          <span className="font-mono text-[#544B45]">{formatDate(so.deliveryDate)}</span>
                        </div>
                        <div className="pt-2 border-t border-[#EBE3DB] flex justify-between text-[11px] font-mono font-bold text-amber-700">
                          <span>Auto Project Number: PRJ-2026-xxx</span>
                          <span>Auto Job Number: JOB-2026-xxx</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#EBE3DB] bg-[#FAF7F2] flex justify-end gap-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-[#544B45] font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!selectedSOId || creating}
                className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-md"
              >
                {creating ? 'Generating Project...' : 'Initialize Project & Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
