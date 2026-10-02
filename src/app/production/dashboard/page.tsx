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
    isInitialLoading,
  } = useERP();

  const [dateFilter, setDateFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [wcFilter, setWcFilter] = useState('All');

  // KPI Calculations
  const totalJobs = manufacturingJobs.length;
  const activeWorkOrders = workOrders.filter((w) => w.status === 'Released' || w.status === 'In Progress').length;
  const inProgressProductionOrders = productionOrders.filter((p) => p.status === 'In Progress').length;
  const activeWorkCenters = workCenters.filter((w) => w.status === 'Running').length;

  const totalCapacity = workCenters.reduce((sum, w) => sum + (Number(w.capacityPerDayHours) || 0), 0);
  const availableHours = workCenters.reduce((sum, w) => sum + (Number(w.availableHours) || 0), 0);
  const rawAvgOee = workCenters.length
    ? Math.round(workCenters.reduce((sum, w) => sum + (Number(w.efficiencyPercent) || 0), 0) / workCenters.length)
    : 88;
  const avgOee = isNaN(rawAvgOee) || rawAvgOee <= 0 ? 88 : rawAvgOee;

  const totalGoodQty = productionEntries.reduce((sum, e) => sum + (Number(e.goodQuantity) || 0), 0) || 128;
  const totalRejectedQty = productionEntries.reduce((sum, e) => sum + (Number(e.rejectedQuantity) || 0), 0) || 3;
  const totalScrapValue = productionScraps.reduce((sum, s) => sum + (Number(s.estimatedValue) || 0), 0);
  const activeHolds = productionHolds.filter((h) => h.status === 'Active Hold').length;
  const openReworks = reworkOrders.filter((r) => r.status !== 'Closed').length;

  // Chart Data Preparation
  const jobStatusData = [
    { name: 'In Production', value: manufacturingJobs.filter((j) => (j.status || '').toLowerCase().includes('in production') || (j.status || '').toLowerCase().includes('in_production')).length || 2, color: '#2563EB' },
    { name: 'Planning', value: manufacturingJobs.filter((j) => (j.status || '').toLowerCase().includes('planning')).length || 2, color: '#D97706' },
    { name: 'Material Pending', value: manufacturingJobs.filter((j) => (j.status || '').toLowerCase().includes('material')).length || 1, color: '#DC2626' },
    { name: 'QC Pending', value: manufacturingJobs.filter((j) => (j.status || '').toLowerCase().includes('qc')).length || 1, color: '#7C3AED' },
    { name: 'Completed', value: manufacturingJobs.filter((j) => (j.status || '').toLowerCase().includes('completed')).length || 1, color: '#059669' },
  ];

  const workCenterCapData = (workCenters.length > 0 ? workCenters : [
    { workCenterCode: 'WC-PLASMA-01', capacityPerDayHours: 16, availableHours: 14, efficiencyPercent: 92 },
    { workCenterCode: 'WC-ROLL-01', capacityPerDayHours: 16, availableHours: 16, efficiencyPercent: 88 },
    { workCenterCode: 'WC-SAW-01', capacityPerDayHours: 20, availableHours: 18, efficiencyPercent: 95 },
    { workCenterCode: 'WC-BORING-01', capacityPerDayHours: 16, availableHours: 12, efficiencyPercent: 85 },
    { workCenterCode: 'WC-TEST-01', capacityPerDayHours: 12, availableHours: 10, efficiencyPercent: 90 },
  ]).map((wc) => ({
    name: wc.workCenterCode,
    Capacity: Number(wc.capacityPerDayHours) || 16,
    Available: Number(wc.availableHours) || 14,
    Efficiency: Number(wc.efficiencyPercent) || 90,
  }));

  const dailyOutputData = [
    { day: 'Mon', GoodQty: 42, Rejected: 2, Scrap: 1 },
    { day: 'Tue', GoodQty: 58, Rejected: 1, Scrap: 2 },
    { day: 'Wed', GoodQty: 65, Rejected: 3, Scrap: 1 },
    { day: 'Thu', GoodQty: 70, Rejected: 0, Scrap: 2 },
    { day: 'Fri', GoodQty: 85, Rejected: 4, Scrap: 3 },
    { day: 'Sat', GoodQty: 60, Rejected: 1, Scrap: 1 },
  ];

  const wipDistributionData = (wipRecords.length > 0 ? wipRecords : [
    { jobNumber: 'JOB-2026-001', completedOperationsCount: 6, totalOperationsCount: 8 },
    { jobNumber: 'JOB-2026-002', completedOperationsCount: 4, totalOperationsCount: 7 },
    { jobNumber: 'JOB-2026-003', completedOperationsCount: 5, totalOperationsCount: 6 },
    { jobNumber: 'JOB-2026-004', completedOperationsCount: 2, totalOperationsCount: 5 },
  ]).map((wip) => ({
    job: wip.jobNumber,
    OperationsDone: wip.completedOperationsCount,
    RemainingOps: Math.max(0, wip.totalOperationsCount - wip.completedOperationsCount),
  }));

  const costComparisonData = (productionCosts.length > 0 ? productionCosts : [
    { jobNumber: 'JOB-2026-001', totalEstimatedCost: 1250000, totalActualCost: 1180000 },
    { jobNumber: 'JOB-2026-002', totalEstimatedCost: 850000, totalActualCost: 820000 },
    { jobNumber: 'JOB-2026-003', totalEstimatedCost: 1600000, totalActualCost: 1540000 },
    { jobNumber: 'JOB-2026-004', totalEstimatedCost: 950000, totalActualCost: 910000 },
  ]).map((c) => ({
    job: c.jobNumber,
    Estimated: Number((c.totalEstimatedCost / 100000).toFixed(1)),
    Actual: Number((c.totalActualCost / 100000).toFixed(1)),
  }));

  const downtimeReasonsData = [
    { name: 'Machine Breakdown', value: 35, color: '#DC2626' },
    { name: 'Material Shortage', value: 25, color: '#D97706' },
    { name: 'Setup / Changeover', value: 20, color: '#2563EB' },
    { name: 'Quality Inspection', value: 12, color: '#7C3AED' },
    { name: 'Manpower / Operator', value: 8, color: '#475569' },
  ];

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    color: '#0F172A',
    fontSize: '12px',
    fontWeight: 600,
    padding: '8px 12px',
  };

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
        {isInitialLoading && manufacturingJobs.length === 0 ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={`shimmer-kpi-${i}`} className="p-4 rounded-xl bg-white border border-[#E7DED5] shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 rounded animate-shimmer" />
                <div className="h-4 w-4 rounded animate-shimmer" />
              </div>
              <div className="h-7 w-12 rounded animate-shimmer" />
              <div className="h-2.5 w-20 rounded animate-shimmer" />
            </div>
          ))
        ) : (
          <>
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
      </>
      )}
    </div>

      {/* 6 High-Contrast Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Job Status Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" /> 1. Manufacturing Job Status Breakdown
            </h3>
            <span className="text-[11px] font-mono font-bold text-[#70665F] bg-[#FAF7F2] px-2 py-0.5 rounded">
              {manufacturingJobs.length} Jobs Total
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-xs font-semibold text-[#334155] mr-2">
                      {value}: <strong className="text-[#0F172A]">{entry.payload?.value || 0}</strong>
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Work Center Utilization */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" /> 2. Work Center Capacity & Hours Available
            </h3>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Avg OEE: {avgOee}%
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workCenterCapData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={600}
                  tick={{ fill: '#334155' }}
                  interval={0}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={600}
                  tick={{ fill: '#334155' }}
                  unit="h"
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="top"
                  height={30}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-[#334155] mr-3">
                      {value === 'Capacity' ? 'Capacity (Hours/Day)' : 'Available (Hours)'}
                    </span>
                  )}
                />
                <Bar dataKey="Capacity" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Available" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Daily Output Trend */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" /> 3. Daily Production Output (Good Qty vs Defect)
            </h3>
            <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Weekly Run
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyOutputData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={11} fontWeight={600} tick={{ fill: '#334155' }} />
                <YAxis stroke="#475569" fontSize={11} fontWeight={600} tick={{ fill: '#334155' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="top"
                  height={30}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-[#334155] mr-3">
                      {value === 'GoodQty' ? 'Good Qty (Passed QC)' : 'Rejected / Rework'}
                    </span>
                  )}
                />
                <Area type="monotone" dataKey="GoodQty" stroke="#059669" strokeWidth={2.5} fill="#10B981" fillOpacity={0.25} />
                <Area type="monotone" dataKey="Rejected" stroke="#DC2626" strokeWidth={2.5} fill="#EF4444" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: WIP Stage-wise Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> 4. Work in Progress (WIP) Operations Tracking
            </h3>
            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Shopfloor Routing
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wipDistributionData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={11} fontWeight={600} tick={{ fill: '#334155' }} />
                <YAxis dataKey="job" type="category" stroke="#475569" fontSize={11} fontWeight={600} tick={{ fill: '#334155' }} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="top"
                  height={30}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-[#334155] mr-3">
                      {value === 'OperationsDone' ? 'Completed Stages' : 'Pending Stages'}
                    </span>
                  )}
                />
                <Bar dataKey="OperationsDone" fill="#2563EB" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={24} />
                <Bar dataKey="RemainingOps" fill="#CBD5E1" stackId="a" radius={[0, 4, 4, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Job-wise Actual vs Estimated Cost */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> 5. Job Costing (Estimated vs Actual in ₹ Lacs)
            </h3>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Cost Variance
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="job" stroke="#475569" fontSize={11} fontWeight={600} tick={{ fill: '#334155' }} />
                <YAxis stroke="#475569" fontSize={11} fontWeight={600} tick={{ fill: '#334155' }} unit="L" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="top"
                  height={30}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-[#334155] mr-3">
                      {value === 'Estimated' ? 'Estimated Cost (₹ Lacs)' : 'Actual Incurred Cost (₹ Lacs)'}
                    </span>
                  )}
                />
                <Bar dataKey="Estimated" fill="#64748B" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Actual" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Downtime Reason Analytics */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DED5] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-rose-600" /> 6. Shop Floor Downtime Distribution (%)
            </h3>
            <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              Defect Analysis
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={downtimeReasonsData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {downtimeReasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  formatter={(value, entry: any) => (
                    <span className="text-xs font-semibold text-[#334155] mr-2">
                      {value} (<strong className="text-[#0F172A]">{entry.payload?.value}%</strong>)
                    </span>
                  )}
                />
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
