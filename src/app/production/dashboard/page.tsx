'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import {
  Factory,
  Briefcase,
  ClipboardList,
  FileText,
  Wrench,
  Activity,
  CheckCircle2,
  Layers,
  Truck,
  AlertTriangle,
  PauseCircle,
  RotateCcw,
  DollarSign,
  TrendingUp,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
} from 'recharts';

export default function ProductionDashboardPage() {
  const {
    manufacturingJobs,
    workOrders,
    productionOrders,
    workCenters,
    productionEntries,
    wipRecords,
    productionHolds,
    reworkOrders,
    productionScraps,
    finishedGoods,
    productionCosts,
    openJobModal,
  } = useERP();

  const [dateFilter, setDateFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [wcFilter, setWcFilter] = useState('All');

  // KPI Calculations
  const totalJobs = manufacturingJobs.length;
  const activeWorkOrders = workOrders.filter((w) => w.status === 'Released' || w.status === 'In Progress').length;
  const inProgressProductionOrders = productionOrders.filter((p) => p.status === 'In Progress').length;
  const activeWorkCenters = workCenters.filter((w) => w.status === 'Running').length;

  const totalCapacity = workCenters.reduce((sum, w) => sum + w.capacityPerDayHours, 0);
  const availableHours = workCenters.reduce((sum, w) => sum + w.availableHours, 0);
  const avgOee = Math.round(workCenters.reduce((sum, w) => sum + w.efficiencyPercent, 0) / (workCenters.length || 1));

  const totalGoodQty = productionEntries.reduce((sum, e) => sum + e.goodQuantity, 0);
  const totalRejectedQty = productionEntries.reduce((sum, e) => sum + e.rejectedQuantity, 0);
  const totalScrapValue = productionScraps.reduce((sum, s) => sum + s.estimatedValue, 0);
  const activeHolds = productionHolds.filter((h) => h.status === 'Active Hold').length;
  const openReworks = reworkOrders.filter((r) => r.status !== 'Closed').length;

  // Chart Data Preparation
  const jobStatusData = [
    { name: 'In Production', value: manufacturingJobs.filter((j) => j.status === 'In Production').length, color: '#3B82F6' },
    { name: 'Planning', value: manufacturingJobs.filter((j) => j.status === 'Planning').length, color: '#F59E0B' },
    { name: 'Material Pending', value: manufacturingJobs.filter((j) => j.status === 'Material Pending').length, color: '#EF4444' },
    { name: 'QC Pending', value: manufacturingJobs.filter((j) => j.status === 'QC Pending').length, color: '#8B5CF6' },
    { name: 'Completed', value: manufacturingJobs.filter((j) => j.status === 'Completed').length, color: '#10B981' },
  ];

  const workCenterCapData = workCenters.map((wc) => ({
    name: wc.workCenterCode,
    Capacity: wc.capacityPerDayHours,
    Available: wc.availableHours,
    Efficiency: wc.efficiencyPercent,
  }));

  const dailyOutputData = [
    { day: 'Mon', GoodQty: 42, Rejected: 2, Scrap: 1 },
    { day: 'Tue', GoodQty: 58, Rejected: 1, Scrap: 2 },
    { day: 'Wed', GoodQty: 65, Rejected: 3, Scrap: 1 },
    { day: 'Thu', GoodQty: 70, Rejected: 0, Scrap: 2 },
    { day: 'Fri', GoodQty: 85, Rejected: 4, Scrap: 3 },
    { day: 'Sat', GoodQty: 60, Rejected: 1, Scrap: 1 },
  ];

  const wipDistributionData = wipRecords.map((wip) => ({
    job: wip.jobNumber,
    OperationsDone: wip.completedOperationsCount,
    RemainingOps: wip.totalOperationsCount - wip.completedOperationsCount,
  }));

  const costComparisonData = productionCosts.map((c) => ({
    job: c.jobNumber,
    Estimated: Math.round(c.totalEstimatedCost / 100000),
    Actual: Math.round(c.totalActualCost / 100000),
  }));

  const downtimeReasonsData = [
    { name: 'Machine Breakdown', value: 35, color: '#EF4444' },
    { name: 'Material Shortage', value: 25, color: '#F59E0B' },
    { name: 'Setup / Changeover', value: 20, color: '#3B82F6' },
    { name: 'Quality Issue', value: 12, color: '#8B5CF6' },
    { name: 'Manpower / Operator', value: 8, color: '#6B7280' },
  ];

  return (
    <div className="space-y-5 text-xs pb-12 text-[#211B17]">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
                Production Management Dashboard
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30">
                  Shop Floor Control
                </span>
              </h1>
              <p className="text-xs text-[#70665F]">
                Uma Techno Fab Manufacturing ERP — Make-to-Order (MTO) Real-time Shop Floor Monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/production/work-orders"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-[#211B17] font-medium text-xs hover:brightness-110 shadow-lg shadow-orange-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Create Work Order
          </Link>
          <Link
            href="/production/entry"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#544B45] font-medium text-xs border border-[#EBE3DB] transition"
          >
            <Activity className="w-4 h-4 text-emerald-400" /> Operator Entry
          </Link>
          <button
            onClick={() => openJobModal('JOB-2026-001')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-crm-brand-700/20 text-crm-brand- font-medium text-xs border border-crm-brand-600/30 hover:bg-crm-brand-700/30 transition"
          >
            <Search className="w-4 h-4 text-crm-brand-500" /> Job 360° Traceability
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DED5] text-xs">
        <div className="flex items-center gap-2 text-[#70665F] font-medium">
          <Filter className="w-4 h-4 text-orange-400" /> Dashboard Filters:
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-lg px-3 py-1.5 text-[#544B45] focus:outline-none focus:border-orange-500"
          >
            <option value="All">Date Range: All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-lg px-3 py-1.5 text-[#544B45] focus:outline-none focus:border-orange-500"
          >
            <option value="All">Filter Job: All Jobs</option>
            {manufacturingJobs.map((j) => (
              <option key={j.id} value={j.jobNumber}>
                {j.jobNumber} - {j.productName.slice(0, 20)}...
              </option>
            ))}
          </select>
          <select
            value={wcFilter}
            onChange={(e) => setWcFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-lg px-3 py-1.5 text-[#544B45] focus:outline-none focus:border-orange-500"
          >
            <option value="All">Work Center: All Bays</option>
            {workCenters.map((wc) => (
              <option key={wc.id} value={wc.workCenterCode}>
                {wc.workCenterCode} - {wc.workCenterName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 13 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Total Jobs</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-[#211B17] mt-1">{totalJobs}</div>
          <div className="text-[10px] text-sky-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> 100% Active MTO
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Active Work Orders</span>
            <ClipboardList className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-[#211B17] mt-1">{activeWorkOrders}</div>
          <div className="text-[10px] text-indigo-400 mt-1">Shop Floor Released</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Prod Orders Running</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-[#211B17] mt-1">{inProgressProductionOrders}</div>
          <div className="text-[10px] text-emerald-400 mt-1">In Production</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Active Work Centers</span>
            <Wrench className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-xl font-bold text-[#211B17] mt-1">
            {activeWorkCenters} / {workCenters.length}
          </div>
          <div className="text-[10px] text-crm-brand-500 mt-1">Bays Operational</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Overall OEE %</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">{avgOee}%</div>
          <div className="text-[10px] text-[#70665F] mt-1">Efficiency Metric</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>On-Time Rate</span>
            <Clock className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-xl font-bold text-crm-brand-500 mt-1">94%</div>
          <div className="text-[10px] text-crm-brand-500 mt-1">Schedule Compliance</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>WIP Jobs</span>
            <Layers className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-xl font-bold text-[#211B17] mt-1">{wipRecords.length}</div>
          <div className="text-[10px] text-crm-brand-500 mt-1">Under Manufacturing</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Good Qty Produced</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{totalGoodQty}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Passed QC</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Rejected Qty</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 mt-1">{totalRejectedQty}</div>
          <div className="text-[10px] text-rose-400 mt-1">Defect Qty</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Active Holds</span>
            <PauseCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold text-red-400 mt-1">{activeHolds}</div>
          <div className="text-[10px] text-red-400 mt-1">Production Stopped</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Rework Orders</span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">{openReworks}</div>
          <div className="text-[10px] text-amber-400 mt-1">Action Required</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Total Scrap Value</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-400 mt-1">₹{totalScrapValue?.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-rose-400 mt-1">Material Scrap</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Finished Goods</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 mt-1">{finishedGoods.length}</div>
          <div className="text-[10px] text-sky-400 mt-1">Ready for Dispatch</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-md">
          <div className="flex justify-between items-center text-[#70665F] text-[11px]">
            <span>Cost Variance</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1">-₹2.5 Lacs</div>
          <div className="text-[10px] text-emerald-400 mt-1">Under Estimated Cost</div>
        </div>
      </div>

      {/* 8 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Job Status Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-400" /> 1. Manufacturing Job Status Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={jobStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }} />
                <Legend formatter={(value) => <span className="text-xs text-[#544B45]">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Work Center Utilization */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <Wrench className="w-4 h-4 text-crm-brand-500" /> 2. Work Center Capacity & Hours Available
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workCenterCapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }} />
                <Legend formatter={(value) => <span className="text-xs text-[#544B45]">{value}</span>} />
                <Bar dataKey="Capacity" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Daily Output Trend */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> 3. Daily Production Output (Good Qty vs Scrap)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyOutputData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }} />
                <Area type="monotone" dataKey="GoodQty" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="Rejected" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: WIP Stage-wise Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <Layers className="w-4 h-4 text-crm-brand-500" /> 4. Work in Progress (WIP) Operations Tracking
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wipDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="job" type="category" stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }} />
                <Bar dataKey="OperationsDone" fill="#3B82F6" stackId="a" />
                <Bar dataKey="RemainingOps" fill="#334155" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Job-wise Actual vs Estimated Cost */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> 5. Job Production Costing (Estimated vs Actual in ₹ Lacs)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="job" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }} />
                <Legend formatter={(value) => <span className="text-xs text-[#544B45]">{value}</span>} />
                <Bar dataKey="Estimated" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Downtime Reason Analytics */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <PauseCircle className="w-4 h-4 text-rose-400" /> 6. Shop Floor Downtime Reason Distribution (%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={downtimeReasonsData} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {downtimeReasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Work Orders Overview Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-400" /> Active Work Orders & Progress Status
          </h3>
          <Link href="/production/work-orders" className="text-xs text-orange-400 hover:underline flex items-center gap-1">
            View All Work Orders <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Work Order #</th>
                <th className="p-3">Job Number</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Design / BOM Rev</th>
                <th className="p-3">Planned Completion</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-white/40 transition">
                  <td className="p-3 font-mono font-bold text-orange-400">{wo.workOrderNumber}</td>
                  <td className="p-3 font-mono text-sky-300">{wo.jobNumber}</td>
                  <td className="p-3 font-medium text-[#211B17] max-w-xs truncate">{wo.productName}</td>
                  <td className="p-3 text-[#70665F]">
                    {wo.designRevision} / {wo.bomRevision}
                  </td>
                  <td className="p-3 text-[#544B45]">{wo.plannedEndDate}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        wo.priority === 'High' || wo.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-[#FAF7F2] text-[#544B45]'
                      }`}
                    >
                      {wo.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {wo.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openJobModal(wo.jobNumber)}
                      className="px-2.5 py-1 rounded bg-crm-brand-700/20 text-crm-brand- hover:bg-crm-brand-700/30 border border-crm-brand-600/30 transition text-[11px]"
                    >
                      360° Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
