'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { MasterTask } from '../../../types/crm';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Building,
  Clock,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  FolderKanban,
  Check,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// Pre-defined quick templates by common departments
const QUICK_TASK_TEMPLATES: Record<string, Array<{ code: string; name: string; days: number; hours: number; desc: string }>> = {
  production: [
    { code: 'PROD-CUT', name: 'Laser & CNC Plasma Cutting', days: 3, hours: 24, desc: 'Cutting of shell, dish ends and structural members' },
    { code: 'PROD-BND', name: 'CNC Bending & Plate Rolling', days: 3, hours: 24, desc: 'Bending of baffle plates and hydraulic shell rolling' },
    { code: 'PROD-FIT', name: 'Fit-up & Tack Welding', days: 2, hours: 16, desc: 'Joint alignment and tack welding of shell components' },
    { code: 'PROD-WLD', name: 'MIG / TIG / SAW Seam Welding', days: 5, hours: 40, desc: 'Full penetration structural and pressure vessel welding' },
    { code: 'PROD-GRN', name: 'Grinding, Deburring & Seam Dressing', days: 2, hours: 16, desc: 'Weld seam leveling and surface dressing' },
    { code: 'PROD-MCH', name: 'Machining, Turning & Flange Facing', days: 4, hours: 32, desc: 'VMC/lathe machining for nozzles and companion flanges' },
    { code: 'PROD-ASY', name: 'Mechanical Assembly & Internals Fitment', days: 4, hours: 32, desc: 'Agitator shaft, limpet coil and mechanical seal mounting' },
  ],
  design: [
    { code: 'DSGN-01', name: '3D CAD Modeling & General Arrangement (GA)', days: 5, hours: 40, desc: 'Equipment modeling according to ASME/DIN standards' },
    { code: 'DSGN-02', name: 'BOM Explode & Buyout Specifications', days: 3, hours: 24, desc: 'Final raw materials and bought-out item schedules' },
    { code: 'DSGN-03', name: 'Client Engineering Review & Revision Signoff', days: 3, hours: 24, desc: 'Customer approval drawing and revision lock' },
  ],
  store: [
    { code: 'STR-01', name: 'Material Requisition & Stock Reservation', days: 2, hours: 16, desc: 'Warehouse inventory check and reservation' },
    { code: 'STR-02', name: 'Goods Receipt Note (GRN) & Inward Inspection', days: 2, hours: 16, desc: 'Verification of Mill Test Certificates and heat numbers' },
    { code: 'STR-03', name: 'Shopfloor Material Issue against Job Card', days: 1, hours: 8, desc: 'Physical release of plates and fittings to fabrication bay' },
  ],
  purchase: [
    { code: 'PUR-01', name: 'Supplier RFQ & Quotation Comparison', days: 3, hours: 24, desc: 'Vendor inquiry, price comparison and commercial terms' },
    { code: 'PUR-02', name: 'Purchase Order Release to Steel Mill', days: 2, hours: 16, desc: 'Authorized PO release with delivery milestones' },
    { code: 'PUR-03', name: 'Vendor Expediting & Dispatch Tracking', days: 5, hours: 40, desc: 'Follow-up for plate rolling and forging dispatch' },
  ],
  quality: [
    { code: 'QC-01', name: 'Raw Material Chemical & Physical Testing', days: 2, hours: 16, desc: 'MTC review, PMI test and ultrasonic check on plates' },
    { code: 'QC-02', name: 'Radiography (RT) & Dye Penetrant (DP) Testing', days: 2, hours: 16, desc: 'Non-destructive testing on welded seams' },
    { code: 'QC-03', name: 'Hydrostatic Pressure FAT Test', days: 2, hours: 16, desc: '1.5x design pressure test with client / TPI witness' },
  ],
  accounting: [
    { code: 'ACT-01', name: 'Mobilization Advance & Milestone Invoicing', days: 1, hours: 8, desc: 'Commercial invoice generation per contract schedule' },
    { code: 'ACT-02', name: 'Final Tax Invoice & E-Way Bill Generation', days: 1, hours: 8, desc: 'GST invoice, dispatch clearance and transit paperwork' },
  ],
};

interface MultiTaskRow {
  tempId: string;
  taskCode: string;
  taskName: string;
  estimatedDays: number;
  estimatedHours: number;
  description: string;
}

export default function TaskManagementPage() {
  const {
    masterTasks,
    departments,
    addMasterTask,
    addMasterTasksBatch,
    updateMasterTask,
    deleteMasterTask,
  } = useERP();

  // Filters & Search
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Multi-Line Add Modal
  const [showMultiModal, setShowMultiModal] = useState<boolean>(false);
  const [batchDept, setBatchDept] = useState<string>('');
  const [batchDeptId, setBatchDeptId] = useState<string>('');
  const [taskRows, setTaskRows] = useState<MultiTaskRow[]>([
    { tempId: 'row-1', taskCode: '', taskName: '', estimatedDays: 2, estimatedHours: 16, description: '' },
  ]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState<boolean>(false);

  // Single Edit Modal
  const [editTask, setEditTask] = useState<MasterTask | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');
  const [editDept, setEditDept] = useState<string>('');
  const [editDays, setEditDays] = useState<number>(1);
  const [editHours, setEditHours] = useState<number>(8);
  const [editDesc, setEditDesc] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  // Feedback notifications
  const [bannerSuccess, setBannerSuccess] = useState<string>('');
  const [bannerError, setBannerError] = useState<string>('');

  // Delete Confirmation
  const [taskToDelete, setTaskToDelete] = useState<MasterTask | null>(null);

  // Default Department list from Foundation & Admin (fallback to defaults if empty)
  const availableDepartments = useMemo(() => {
    if (departments && departments.length > 0) {
      return departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code || d.name.slice(0, 4).toUpperCase(),
      }));
    }
    return [
      { id: 'dept-prod', name: 'Production', code: 'PROD' },
      { id: 'dept-design', name: 'Design', code: 'DSGN' },
      { id: 'dept-store', name: 'Store', code: 'STR' },
      { id: 'dept-purch', name: 'Purchase', code: 'PUR' },
      { id: 'dept-qc', name: 'Quality', code: 'QC' },
      { id: 'dept-acc', name: 'Accounts', code: 'ACT' },
    ];
  }, [departments]);

  // Open multi-modal with safe default department
  const handleOpenMultiModal = (prefillDept?: string) => {
    const targetDept = prefillDept || availableDepartments[0]?.name || 'Production';
    const deptObj = availableDepartments.find((d) => d.name.toLowerCase() === targetDept.toLowerCase()) || availableDepartments[0];
    setBatchDept(deptObj?.name || 'Production');
    setBatchDeptId(deptObj?.id || '');

    // Initialize with 2 blank rows
    setTaskRows([
      { tempId: `row-${Date.now()}-1`, taskCode: '', taskName: '', estimatedDays: 3, estimatedHours: 24, description: '' },
      { tempId: `row-${Date.now()}-2`, taskCode: '', taskName: '', estimatedDays: 2, estimatedHours: 16, description: '' },
    ]);
    setShowMultiModal(true);
  };

  // Add Row in Multi-Task Line Builder
  const handleAddLine = () => {
    const nextIdx = taskRows.length + 1;
    setTaskRows((prev) => [
      ...prev,
      {
        tempId: `row-${Date.now()}-${nextIdx}`,
        taskCode: '',
        taskName: '',
        estimatedDays: 2,
        estimatedHours: 16,
        description: '',
      },
    ]);
  };

  // Remove Row in Multi-Task Line Builder
  const handleRemoveLine = (tempId: string) => {
    if (taskRows.length <= 1) {
      setBannerError('At least one task row is required.');
      setTimeout(() => setBannerError(''), 3000);
      return;
    }
    setTaskRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  // Update field in multi-line row
  const handleUpdateLine = (tempId: string, field: keyof MultiTaskRow, value: any) => {
    setTaskRows((prev) =>
      prev.map((r) => {
        if (r.tempId !== tempId) return r;
        const updated = { ...r, [field]: value };
        // If days change, auto-suggest 8 hours/day if hours wasn't manually tailored
        if (field === 'estimatedDays') {
          const daysNum = Math.max(1, Number(value) || 1);
          updated.estimatedDays = daysNum;
          updated.estimatedHours = daysNum * 8;
        }
        return updated;
      })
    );
  };

  // Quick load template tasks for selected department
  const handleLoadQuickTemplates = () => {
    const key = batchDept.toLowerCase();
    const matchedKey = Object.keys(QUICK_TASK_TEMPLATES).find((k) => key.includes(k));
    if (matchedKey && QUICK_TASK_TEMPLATES[matchedKey]) {
      const templates = QUICK_TASK_TEMPLATES[matchedKey];
      setTaskRows(
        templates.map((tpl, idx) => ({
          tempId: `tpl-${Date.now()}-${idx}`,
          taskCode: tpl.code,
          taskName: tpl.name,
          estimatedDays: tpl.days,
          estimatedHours: tpl.hours,
          description: tpl.desc,
        }))
      );
      setBannerSuccess(`Loaded standard ${batchDept} task templates. You can customize before saving.`);
      setTimeout(() => setBannerSuccess(''), 4000);
    } else {
      setBannerError(`No quick templates found for "${batchDept}". Please enter tasks manually.`);
      setTimeout(() => setBannerError(''), 3000);
    }
  };

  // Submit Batch Multi-line Tasks
  const handleSaveBatchTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError('');
    setBannerSuccess('');

    // Validation
    const validRows = taskRows.filter((r) => r.taskName.trim().length > 0);
    if (validRows.length === 0) {
      setBannerError('Please enter at least one task name.');
      return;
    }

    if (!batchDept) {
      setBannerError('Please select a department.');
      return;
    }

    setIsSubmittingBatch(true);
    try {
      const payload = validRows.map((r, idx) => ({
        taskCode: r.taskCode.trim() || `${batchDept.slice(0, 4).toUpperCase()}-${String(masterTasks.length + idx + 1).padStart(2, '0')}`,
        taskName: r.taskName.trim(),
        department: batchDept,
        departmentId: batchDeptId,
        description: r.description.trim(),
        estimatedDays: Number(r.estimatedDays) || 1,
        estimatedHours: Number(r.estimatedHours) || 8,
        status: 'active' as const,
      }));

      await addMasterTasksBatch(payload);

      setBannerSuccess(`Successfully added ${validRows.length} tasks for department "${batchDept}". These are now ready in Project Planning!`);
      setShowMultiModal(false);
      setTimeout(() => setBannerSuccess(''), 5000);
    } catch (err: any) {
      setBannerError(err?.message || 'Failed to save tasks to database.');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  // Open Edit Single Task Modal
  const handleOpenEdit = (task: MasterTask) => {
    setEditTask(task);
    setEditName(task.taskName);
    setEditCode(task.taskCode || '');
    setEditDept(task.department);
    setEditDays(task.estimatedDays || 1);
    setEditHours((task as any).estimatedHours || (task.estimatedDays || 1) * 8);
    setEditDesc(task.description || '');
    setEditStatus(task.status || 'active');
  };

  // Save Single Task Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    if (!editName.trim()) {
      setBannerError('Task name cannot be empty.');
      return;
    }

    updateMasterTask(editTask.id, {
      taskName: editName.trim(),
      taskCode: editCode.trim(),
      department: editDept,
      estimatedDays: Number(editDays) || 1,
      estimatedHours: Number(editHours) || 8,
      description: editDesc.trim(),
      status: editStatus,
    } as any);

    setBannerSuccess(`Task "${editName}" updated successfully in database.`);
    setEditTask(null);
    setTimeout(() => setBannerSuccess(''), 4000);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    deleteMasterTask(taskToDelete.id);
    setBannerSuccess(`Task "${taskToDelete.taskName}" deleted successfully.`);
    setTaskToDelete(null);
    setTimeout(() => setBannerSuccess(''), 4000);
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return masterTasks.filter((task) => {
      // Department Filter
      if (selectedDeptFilter !== 'all') {
        if (task.department.toLowerCase() !== selectedDeptFilter.toLowerCase()) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'all') {
        if (task.status !== statusFilter) return false;
      }

      // Search Term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = task.taskName.toLowerCase().includes(q);
        const matchCode = (task.taskCode || '').toLowerCase().includes(q);
        const matchDept = task.department.toLowerCase().includes(q);
        const matchDesc = (task.description || '').toLowerCase().includes(q);
        return matchName || matchCode || matchDept || matchDesc;
      }

      return true;
    }).sort((a, b) => (a.taskCode || '').localeCompare(b.taskCode || '', undefined, { numeric: true }));
  }, [masterTasks, selectedDeptFilter, statusFilter, searchTerm]);

  // Department Stats
  const deptStats = useMemo(() => {
    const map: Record<string, number> = {};
    masterTasks.forEach((t) => {
      const d = t.department || 'General';
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [masterTasks]);

  // Helper badge color per department
  const getDeptColor = (deptName: string) => {
    const d = deptName.toLowerCase();
    if (d.includes('prod') || d.includes('fab') || d.includes('mach')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (d.includes('design') || d.includes('eng')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (d.includes('store') || d.includes('ware')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (d.includes('purch') || d.includes('proc')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    if (d.includes('qual') || d.includes('qc') || d.includes('test')) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (d.includes('acc') || d.includes('fin')) {
      return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    }
    return 'bg-stone-50 text-stone-800 border-stone-200';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* Top Banner Notifications */}
      {bannerSuccess && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 sticky top-0 z-40 transition-all flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 text-emerald-800 text-xs font-semibold max-w-5xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{bannerSuccess}</span>
          </div>
          <button onClick={() => setBannerSuccess('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {bannerError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 sticky top-0 z-40 transition-all flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 text-rose-800 text-xs font-semibold max-w-5xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{bannerError}</span>
          </div>
          <button onClick={() => setBannerError('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#EBE3DB]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#70665F] mb-1 font-medium">
              <Link href="/projects/dashboard" className="hover:text-crm-brand-700">Project Management</Link>
              <span>/</span>
              <span className="text-[#211B17] font-semibold">Task Management (ડિપાર્ટમેન્ટ વાઇસ)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2.5">
              <CheckSquare className="w-6 h-6 text-crm-brand-700" />
              Department Task Master
            </h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Create, organize and maintain department-wise operational tasks (Cutting, Bending, Welding, Design, Store, Accounts) for auto-populating in Project Planning.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/projects/planning"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4A3B32] bg-white border border-[#EBE3DB] rounded-lg hover:bg-[#F3ECE4] transition-all shadow-sm"
              title="Open Project Planning to test created tasks"
            >
              <FolderKanban className="w-3.5 h-3.5 text-crm-brand-700" />
              <span>Go to Project Planning</span>
              <ArrowRight className="w-3 h-3 text-[#8D7B70]" />
            </Link>

            <button
              onClick={() => handleOpenMultiModal()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-crm-brand-700 hover:bg-crm-brand-800 rounded-lg shadow-sm transition-all hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Department Tasks (Multi-Line)</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 rounded-xl border border-[#EBE3DB] shadow-xs">
            <div className="flex items-center justify-between text-[#70665F] text-[11px] font-medium mb-1">
              <span>Total Master Tasks</span>
              <Layers className="w-4 h-4 text-crm-brand-700" />
            </div>
            <div className="text-2xl font-bold text-[#211B17]">{masterTasks.length}</div>
            <div className="text-[10px] text-emerald-700 mt-1 font-medium">✓ Stored in Central DB</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#EBE3DB] shadow-xs">
            <div className="flex items-center justify-between text-[#70665F] text-[11px] font-medium mb-1">
              <span>Departments Active</span>
              <Building className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-[#211B17]">{Object.keys(deptStats).length}</div>
            <div className="text-[10px] text-[#70665F] mt-1">From Foundation Master</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#EBE3DB] shadow-xs">
            <div className="flex items-center justify-between text-[#70665F] text-[11px] font-medium mb-1">
              <span>Production Tasks</span>
              <CheckSquare className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-[#211B17]">{deptStats['Production'] || deptStats['Fabrication'] || 0}</div>
            <div className="text-[10px] text-amber-700 mt-1 font-medium">Cutting, Bending, Welding, etc.</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#EBE3DB] shadow-xs">
            <div className="flex items-center justify-between text-[#70665F] text-[11px] font-medium mb-1">
              <span>Avg Task Duration</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-[#211B17]">
              {masterTasks.length > 0
                ? (masterTasks.reduce((acc, t) => acc + (t.estimatedDays || 1), 0) / masterTasks.length).toFixed(1)
                : 0}{' '}
              <span className="text-xs font-normal text-[#70665F]">Days</span>
            </div>
            <div className="text-[10px] text-[#70665F] mt-1">Per operation cycle</div>
          </div>
        </div>

        {/* Search, Filter Bar and Department Tabs */}
        <div className="bg-white rounded-xl border border-[#EBE3DB] p-4 shadow-xs space-y-3.5">
          {/* Top row: search + status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8D7B70]" />
              <input
                type="text"
                placeholder="Search by task name, code (PROD-CUT), description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#EBE3DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-crm-brand-700 text-[#211B17] placeholder:text-[#8D7B70]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D7B70] hover:text-[#211B17]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#70665F] font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#EBE3DB] rounded-lg text-[#211B17] font-medium focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Department Quick Filter Tabs */}
          <div className="border-t border-[#EBE3DB] pt-3">
            <div className="text-[11px] font-bold text-[#70665F] mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-crm-brand-700" />
              <span>Select Department Filter:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedDeptFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                  selectedDeptFilter === 'all'
                    ? 'bg-crm-brand-700 text-white border-crm-brand-700 shadow-xs'
                    : 'bg-[#FAF8F5] text-[#4A3B32] border-[#EBE3DB] hover:bg-[#F3ECE4]'
                )}
              >
                All Departments ({masterTasks.length})
              </button>

              {availableDepartments.map((dept) => {
                const count = masterTasks.filter((t) => t.department.toLowerCase() === dept.name.toLowerCase()).length;
                const isSelected = selectedDeptFilter.toLowerCase() === dept.name.toLowerCase();
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDeptFilter(dept.name)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5',
                      isSelected
                        ? 'bg-crm-brand-700 text-white border-crm-brand-700 shadow-xs'
                        : 'bg-[#FAF8F5] text-[#4A3B32] border-[#EBE3DB] hover:bg-[#F3ECE4]'
                    )}
                  >
                    <span>{dept.name}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#EFE8DF] text-crm-brand-700 font-bold'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tasks List Table */}
        <div className="bg-white rounded-xl border border-[#EBE3DB] shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#EBE3DB] flex items-center justify-between">
            <div className="text-xs font-bold text-[#211B17] flex items-center gap-2">
              <span>Configured Master Tasks</span>
              <span className="px-2 py-0.5 rounded-full bg-crm-brand-100/60 text-crm-brand-800 text-[10px] font-bold">
                {filteredTasks.length} of {masterTasks.length} tasks
              </span>
            </div>

            {selectedDeptFilter !== 'all' && (
              <button
                onClick={() => handleOpenMultiModal(selectedDeptFilter)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-crm-brand-700 hover:text-crm-brand-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add more tasks to {selectedDeptFilter}</span>
              </button>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckSquare className="w-10 h-10 text-[#8D7B70] mx-auto opacity-50" />
              <div className="text-sm font-bold text-[#211B17]">No tasks found</div>
              <p className="text-xs text-[#70665F] max-w-sm mx-auto">
                No tasks match your current filter or department. Click below to add tasks for this department using the multi-line builder.
              </p>
              <button
                onClick={() => handleOpenMultiModal(selectedDeptFilter === 'all' ? 'Production' : selectedDeptFilter)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-crm-brand-700 hover:bg-crm-brand-800 rounded-lg shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Tasks to {selectedDeptFilter === 'all' ? 'Department' : selectedDeptFilter}</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#211B17]">
                <thead className="bg-[#FAF8F5]/80 text-[#70665F] text-[11px] font-bold uppercase tracking-wider border-b border-[#EBE3DB]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Task Code</th>
                    <th className="py-2.5 px-4">Task Name & Scope</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Est. Duration</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {filteredTasks.map((task, idx) => (
                    <tr key={task.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-2.5 px-3 text-[#8D7B70] font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] font-bold text-[#211B17] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EBE3DB]">
                          {task.taskCode || `TSK-${task.id.slice(-4)}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-[#211B17] text-xs">{task.taskName}</div>
                        {task.description && (
                          <div className="text-[11px] text-[#70665F] line-clamp-1 mt-0.5">{task.description}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border',
                            getDeptColor(task.department)
                          )}
                        >
                          <Building className="w-3 h-3 opacity-70" />
                          <span>{task.department}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#211B17]">
                          <Clock className="w-3.5 h-3.5 text-[#8D7B70]" />
                          <span>{task.estimatedDays || 1} Days</span>
                          <span className="text-[10px] text-[#8D7B70] font-normal">
                            ({(task as any).estimatedHours || (task.estimatedDays || 1) * 8}h)
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold',
                            task.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          )}
                        >
                          {task.status === 'active' ? '✓ Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-1 text-[#8D7B70] hover:text-crm-brand-700 hover:bg-[#FAF8F5] rounded transition-colors"
                            title="Edit Task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="p-1 text-[#8D7B70] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MULTI-TASK LINE BUILDER MODAL */}
      {showMultiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#EBE3DB] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-crm-brand-700" />
                  <h2 className="text-base font-bold text-[#211B17]">Add Department Tasks (Multi-Line Builder)</h2>
                </div>
                <p className="text-xs text-[#70665F] mt-0.5">
                  Select department, then add multiple tasks using &quot;+ Add Line&quot;. All tasks will be saved together in the database.
                </p>
              </div>
              <button
                onClick={() => setShowMultiModal(false)}
                className="p-1.5 text-[#8D7B70] hover:text-[#211B17] hover:bg-[#EFE8DF] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveBatchTasks} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Step 1: Department Selection (from Foundation & Admin) */}
              <div className="bg-[#FAF8F5] border border-[#EBE3DB] p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-[#211B17] mb-1">
                      1. Select Department * <span className="font-normal text-[#70665F]">(From Foundation & Admin)</span>
                    </label>
                    <select
                      value={batchDept}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBatchDept(val);
                        const matched = availableDepartments.find((d) => d.name === val);
                        setBatchDeptId(matched?.id || '');
                      }}
                      className="w-full sm:max-w-md px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs font-bold text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700 shadow-2xs"
                      required
                    >
                      <option value="">-- Choose Department --</option>
                      {availableDepartments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Template Auto-Fill Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleLoadQuickTemplates}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-crm-brand-700 bg-white border border-crm-brand-300 hover:bg-crm-brand-50 rounded-lg shadow-2xs transition-colors"
                      title="Load standard manufacturing template tasks for this department"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load Standard Templates</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#70665F]">
                  Selected Department: <strong className="text-[#211B17]">{batchDept || 'None'}</strong>. When you add lines below, all tasks will automatically belong to this department.
                </p>
              </div>

              {/* Step 2: Multi-line Tasks Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#211B17]">
                    2. Add Tasks for {batchDept || 'Department'} ({taskRows.length} Lines)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-crm-brand-700 hover:bg-crm-brand-800 rounded-lg shadow-2xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Line</span>
                  </button>
                </div>

                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-[350px]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] text-[#70665F] text-[10.5px] font-bold uppercase tracking-wider sticky top-0 border-b border-[#EBE3DB] z-10">
                        <tr>
                          <th className="py-2 px-2.5 w-10 text-center">#</th>
                          <th className="py-2 px-2.5 w-32">Task Code</th>
                          <th className="py-2 px-3">Task Name *</th>
                          <th className="py-2 px-2.5 w-24">Est. Days</th>
                          <th className="py-2 px-2.5 w-24">Est. Hours</th>
                          <th className="py-2 px-3">Description / Remarks</th>
                          <th className="py-2 px-2 w-10 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBE3DB] bg-white">
                        {taskRows.map((row, idx) => (
                          <tr key={row.tempId} className="hover:bg-[#FAF8F5]/50">
                            <td className="py-2 px-2.5 text-center text-[#8D7B70] font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-2.5">
                              <input
                                type="text"
                                placeholder={`e.g. ${batchDept.slice(0, 3).toUpperCase()}-${String(idx + 1).padStart(2, '0')}`}
                                value={row.taskCode}
                                onChange={(e) => handleUpdateLine(row.tempId, 'taskCode', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-[#EBE3DB] rounded text-xs font-mono text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="e.g. Laser Cutting / CNC Bending / Welding / Assembly"
                                value={row.taskName}
                                onChange={(e) => handleUpdateLine(row.tempId, 'taskName', e.target.value)}
                                className="w-full px-2.5 py-1 bg-white border border-[#EBE3DB] rounded text-xs font-semibold text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                                required
                              />
                            </td>
                            <td className="py-2 px-2.5">
                              <input
                                type="number"
                                min={1}
                                max={365}
                                value={row.estimatedDays}
                                onChange={(e) => handleUpdateLine(row.tempId, 'estimatedDays', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-[#EBE3DB] rounded text-xs text-center font-medium text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                              />
                            </td>
                            <td className="py-2 px-2.5">
                              <input
                                type="number"
                                min={1}
                                step={0.5}
                                value={row.estimatedHours}
                                onChange={(e) => handleUpdateLine(row.tempId, 'estimatedHours', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-[#EBE3DB] rounded text-xs text-center font-medium text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Specification, equipment or work instructions..."
                                value={row.description}
                                onChange={(e) => handleUpdateLine(row.tempId, 'description', e.target.value)}
                                className="w-full px-2.5 py-1 bg-white border border-[#EBE3DB] rounded text-xs text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(row.tempId)}
                                className="p-1 text-[#8D7B70] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Remove line"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom line action */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-crm-brand-700 hover:text-crm-brand-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Another Task Line</span>
                  </button>
                  <span className="text-[11px] text-[#70665F]">
                    Total lines to save: <strong>{taskRows.filter((r) => r.taskName.trim().length > 0).length}</strong>
                  </span>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#EBE3DB] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowMultiModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF8F5] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBatch}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-crm-brand-700 hover:bg-crm-brand-800 rounded-lg shadow transition-all disabled:opacity-50"
                >
                  {isSubmittingBatch ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save All Tasks to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE TASK EDIT MODAL */}
      {editTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EBE3DB] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-crm-brand-700" />
                <h2 className="text-sm font-bold text-[#211B17]">Edit Master Task</h2>
              </div>
              <button
                onClick={() => setEditTask(null)}
                className="p-1 text-[#8D7B70] hover:text-[#211B17] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#211B17] mb-1">Task Code</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211B17] mb-1">Task Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211B17] mb-1">Department *</label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                  required
                >
                  {availableDepartments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211B17] mb-1">Estimated Days</label>
                  <input
                    type="number"
                    min={1}
                    value={editDays}
                    onChange={(e) => setEditDays(Number(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-medium text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211B17] mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={editHours}
                    onChange={(e) => setEditHours(Number(e.target.value) || 8)}
                    className="w-full px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-medium text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211B17] mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211B17] mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-medium text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditTask(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#70665F] hover:text-[#211B17]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-crm-brand-700 hover:bg-crm-brand-800 rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#211B17]">Delete Task Confirmation</h3>
            </div>
            <p className="text-xs text-[#70665F] leading-relaxed">
              Are you sure you want to delete task <strong>&quot;{taskToDelete.taskName}&quot;</strong> ({taskToDelete.department})? This action will remove it from the central database.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-[#70665F] hover:text-[#211B17] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
