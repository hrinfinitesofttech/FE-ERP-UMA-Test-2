'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import {
  Palette,
  Compass,
  FileCheck,
  Box,
  Layers,
  FileSpreadsheet,
  GitBranch,
  RotateCcw,
  ShieldCheck,
  Zap,
  FolderOpen,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

export default function DesignerDashboardPage() {
  const {
    designJobs,
    boms,
    designRevisions,
    drawings2D,
    designs3D,
    customerRequirements,
  } = useERP();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [designerFilter, setDesignerFilter] = useState('all');
  const [machineFilter, setMachineFilter] = useState('all');

  // KPI Computations
  const totalJobs = designJobs.length;
  const newRequests = designJobs.filter((j) => j.status === 'pending' || j.status === 'assigned').length;
  const inProgress = designJobs.filter((j) => j.status === 'in_progress').length;
  const inReview = designJobs.filter((j) => j.status === 'review').length;
  const approvedDesigns = designJobs.filter((j) => j.status === 'approved' || j.status === 'bom_pending' || j.status === 'bom_approved' || j.status === 'released_to_production').length;
  const pendingBOM = designJobs.filter((j) => j.status === 'bom_pending' || j.status === 'approved').length;
  const bomApprovedCount = boms.filter((b) => b.approvalStatus === 'approved' || b.approvalStatus === 'released').length;
  const releasedToProd = designJobs.filter((j) => j.status === 'released_to_production').length;
  const totalRevisions = designRevisions.length;
  const overdueJobs = designJobs.filter((j) => {
    const isPast = new Date(j.requiredDate) < new Date();
    return isPast && j.status !== 'released_to_production';
  }).length;

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return designJobs.filter((j) => {
      const matchSearch =
        j.designJobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        j.projectId?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        j.jobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        j.customerName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        j.productName?.toLowerCase().includes(searchQuery?.toLowerCase());
      const matchStatus = statusFilter === 'all' || j.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || j.priority === priorityFilter;
      const matchDesigner = designerFilter === 'all' || j.assignedDesigner === designerFilter;
      const matchMachine = machineFilter === 'all' || j.machineType === machineFilter;
      return matchSearch && matchStatus && matchPriority && matchDesigner && matchMachine;
    });
  }, [designJobs, searchQuery, statusFilter, priorityFilter, designerFilter, machineFilter]);

  // Chart Data 1: Design Status Distribution
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    designJobs.forEach((j) => {
      const label = j.status?.replace(/_/g, ' ')?.toUpperCase();
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.keys(counts).map((name) => ({ name, value: counts[name] }));
  }, [designJobs]);

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#64748b'];

  // Chart Data 2: BOM Component Breakdown
  const bomItemTypeData = useMemo(() => {
    const counts: Record<string, number> = {
      'Raw Material': 28,
      'Bought-Out': 18,
      'Fabricated': 14,
      'Sub-Assembly': 10,
      'Electrical': 8,
      'Hardware': 12,
    };
    boms.forEach((b) => {
      b.items.forEach((item) => {
        counts[item.itemType] = (counts[item.itemType] || 0) + 1;
      });
    });
    return Object.keys(counts).map((name) => ({ name, count: counts[name] }));
  }, [boms]);

  // Chart Data 3: Machine Type Breakdown
  const machineTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    designJobs.forEach((j) => {
      const key = j.machineType || 'Custom Machine';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.keys(map).map((name) => ({ name, jobs: map[name] }));
  }, [designJobs]);

  // Chart Data 4: Revision Trends
  const revisionTrendData = [
    { month: 'Apr', revisions: 1 },
    { month: 'May', revisions: 2 },
    { month: 'Jun', revisions: 1 },
    { month: 'Jul', revisions: 3 },
    { month: 'Aug', revisions: 2 },
    { month: 'Sep', revisions: 4 },
  ];

  // Chart Data 5: CAD Vault Artifacts Growth
  const drawingVaultData = [
    { month: 'Apr', drawings2D: 12, models3D: 8 },
    { month: 'May', drawings2D: 24, models3D: 18 },
    { month: 'Jun', drawings2D: 45, models3D: 32 },
    { month: 'Jul', drawings2D: 68, models3D: 54 },
    { month: 'Aug', drawings2D: 92, models3D: 78 },
    { month: 'Sep', drawings2D: 120, models3D: 95 },
  ];

  // Chart Data 6: Cycle Time (Days)
  const cycleTimeData = [
    { stage: 'Req Analysis', avgDays: 2.5 },
    { stage: '3D CAD Modeling', avgDays: 6.0 },
    { stage: '2D Drafting', avgDays: 4.2 },
    { stage: 'BOM Preparation', avgDays: 3.0 },
    { stage: 'Review & Approval', avgDays: 2.0 },
  ];

  return (
    <div className="space-y-5 text-xs pb-12 text-[#211B17]">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30 text-xs font-mono font-bold">
              MODULE 3
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Palette className="w-7 h-7 text-crm-brand-500" />
              Designer & Engineering Management
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Machine CAD Drawings, Multi-Level BOM Hierarchy, Technical Specs, 4-Tier Approvals & Shop Floor Release
          </p>
        </div>

        {/* Quick Action Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/designer/jobs"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] text-xs font-bold shadow-lg shadow-crm-brand-700/30 transition"
          >
            <Plus className="w-4 h-4" />
            New Design Job
          </Link>
          <Link
            href="/designer/bom"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-amber-400 border border-[#EBE3DB] text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Master BOM
          </Link>
          <Link
            href="/designer/approval"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            Approval & Release
          </Link>
        </div>
      </div>

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {/* KPI 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Total Design Jobs</span>
            <Palette className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-2xl font-bold text-[#211B17] mt-1.5 font-mono">{totalJobs}</div>
          <div className="text-[10px] text-crm-brand-500/80 mt-1">Active Machine Designs</div>
          <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-crm-brand-600/10 rounded-full blur-lg group-hover:scale-150 transition" />
        </div>

        {/* KPI 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>New Requests</span>
            <Clock className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-2xl font-black text-crm-brand-500 mt-2 font-mono">{newRequests}</div>
          <div className="text-[10px] text-[#70665F] mt-1">Awaiting Assignment</div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>In Progress</span>
            <Compass className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2 font-mono">{inProgress}</div>
          <div className="text-[10px] text-[#70665F] mt-1">CAD & 2D Drafting</div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Engineering Review</span>
            <ShieldCheck className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-2xl font-black text-crm-brand-500 mt-2 font-mono">{inReview}</div>
          <div className="text-[10px] text-[#70665F] mt-1">Tech Checklists</div>
        </div>

        {/* KPI 5 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Approved Designs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">{approvedDesigns}</div>
          <div className="text-[10px] text-[#70665F] mt-1">Ready for Production</div>
        </div>

        {/* KPI 6 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Pending BOM</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">{pendingBOM}</div>
          <div className="text-[10px] text-[#70665F] mt-1">Item Structuring</div>
        </div>

        {/* KPI 7 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>BOM Approved</span>
            <FileCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400 mt-2 font-mono">{bomApprovedCount}</div>
          <div className="text-[10px] text-[#70665F] mt-1">Locked Master BOM</div>
        </div>

        {/* KPI 8 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Released to Prod</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">{releasedToProd}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Purchase & Shop Floor</div>
        </div>

        {/* KPI 9 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Design Revisions</span>
            <RotateCcw className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-pink-400 mt-2 font-mono">{totalRevisions}</div>
          <div className="text-[10px] text-[#70665F] mt-1">ECN / ECO Changes</div>
        </div>

        {/* KPI 10 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Delayed Designs</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-500 mt-2 font-mono">{overdueJobs}</div>
          <div className="text-[10px] text-rose-400/80 mt-1">Past Target Date</div>
        </div>
      </div>

      {/* Interactive Pipeline Stepper */}
      <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-crm-brand-500" />
            Engineering & Design End-to-End Workflow Pipeline
          </h3>
          <span className="text-xs text-[#70665F] font-mono">Reference: Project ID + Job Number</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {[
            { step: '1. Req Sheet', desc: 'Tech Spec', color: 'border-crm-brand-600/40 bg-crm-brand-600/10 text-crm-brand-' },
            { step: '2. Planning', desc: 'Timeline & Task', color: 'border-crm-brand-600/40 bg-crm-brand-600/10 text-indigo-300' },
            { step: '3. 3D & 2D CAD', desc: 'Solid Modeling', color: 'border-crm-brand-600/40 bg-crm-brand-600/10 text-crm-brand-' },
            { step: '4. Assembly/Part', desc: 'Manufacturing', color: 'border-pink-500/40 bg-pink-500/10 text-pink-300' },
            { step: '5. Multi-BOM', desc: 'Item Hierarchy', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
            { step: '6. Review', desc: 'ASME & Safety', color: 'border-teal-500/40 bg-teal-500/10 text-teal-300' },
            { step: '7. Shop Release', desc: 'Purchase/Prod', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold' },
          ].map((s, idx) => (
            <div key={idx} className={`p-3 rounded-xl border ${s.color} flex flex-col justify-between text-center relative`}>
              <div className="text-xs font-bold truncate">{s.step}</div>
              <div className="text-[10px] text-[#70665F] mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 6 Recharts Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Design Status Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-crm-brand-500" />
              Design Job Status Distribution
            </h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: BOM Component Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              Master BOM Component Types
            </h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bomItemTypeData} layout="vertical">
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Machine Type Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-indigo-400" />
              Machine & Equipment Portfolio
            </h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineTypeData}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="jobs" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Revision Trends */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-pink-400" />
              Monthly Design Revisions (ECN)
            </h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revisionTrendData}>
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="revisions" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Drawing Vault Artifacts Growth */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              CAD Drawing Vault Growth
            </h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={drawingVaultData}>
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="drawings2D" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Area type="monotone" dataKey="models3D" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Cycle Time (Days) */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-crm-brand-500" />
              Avg Engineering Lead Days by Stage
            </h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleTimeData}>
                <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="avgDays" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6 Filter Dropdowns & Design Jobs Control Bar */}
      <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-[#211B17] flex items-center gap-2">
            <Filter className="w-4 h-4 text-crm-brand-500" />
            Active Design Jobs Registry ({filteredJobs.length})
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
              <input
                type="text"
                placeholder="Search job, project, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-crm-brand-600 w-64"
              />
            </div>
          </div>
        </div>

        {/* 6 Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {/* Filter 1: Status */}
          <div>
            <label className="text-[10px] font-bold text-[#70665F] block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="bom_pending">BOM Pending</option>
              <option value="bom_approved">BOM Approved</option>
              <option value="released_to_production">Released to Production</option>
            </select>
          </div>

          {/* Filter 2: Priority */}
          <div>
            <label className="text-[10px] font-bold text-[#70665F] block mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Filter 3: Assigned Designer */}
          <div>
            <label className="text-[10px] font-bold text-[#70665F] block mb-1">Assigned Designer</label>
            <select
              value={designerFilter}
              onChange={(e) => setDesignerFilter(e.target.value)}
              className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
            >
              <option value="all">All Designers</option>
              <option value="Dharmesh Joshi">Dharmesh Joshi</option>
              <option value="Ketan Patel">Ketan Patel</option>
            </select>
          </div>

          {/* Filter 4: Machine Type */}
          <div>
            <label className="text-[10px] font-bold text-[#70665F] block mb-1">Machine Type</label>
            <select
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
            >
              <option value="all">All Machine Types</option>
              <option value="Reaction Vessel">Reaction Vessel</option>
              <option value="Fluid Bed Dryer">Fluid Bed Dryer</option>
              <option value="Ribbon Blender">Ribbon Blender</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setDesignerFilter('all');
                setMachineFilter('all');
              }}
              className="w-full px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#544B45] text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E7DED5]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[#70665F] border-b border-[#E7DED5]">
                <th className="p-3">Design Job ID</th>
                <th className="p-3">Project ID / Job No</th>
                <th className="p-3">Customer & Machine Product</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Designer</th>
                <th className="p-3">Revision</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Target Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DE] bg-white text-[#211B17]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-[#70665F]">
                    No design jobs match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-white/40 transition group">
                    <td className="p-3 font-mono font-bold text-crm-brand-500">{j.designJobNumber}</td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-[#211B17]">{j.projectId}</div>
                      <div className="font-mono text-[10px] text-amber-400">{j.jobNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#211B17]">{j.productName}</div>
                      <div className="text-[10px] text-[#70665F]">{j.customerName}</div>
                    </td>
                    <td className="p-3 font-mono text-[#544B45]">{j.quantity}</td>
                    <td className="p-3 text-[#544B45]">{j.assignedDesigner}</td>
                    <td className="p-3 font-mono text-crm-brand- font-bold">{j.activeRevision}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          j.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : j.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30'
                        }`}
                      >
                        {j.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[#70665F]">{j.requiredDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          j.status === 'released_to_production'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : j.status === 'bom_approved' || j.status === 'approved'
                            ? 'bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30'
                            : j.status === 'review'
                            ? 'bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {j.status?.replace(/_/g, ' ')?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/designer/jobs?id=${j.id}`}
                        className="px-2.5 py-1 rounded-lg bg-crm-brand-700/20 hover:bg-crm-brand-700 text-crm-brand- hover:text-[#211B17] text-[11px] font-semibold transition"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Named import wrapper for Recharts PieChart component to avoid collision
const RechartsPieChart = PieChart;
