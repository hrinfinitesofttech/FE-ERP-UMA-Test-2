'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency } from '../../../lib/utils';
import {
  Wrench,
  Cpu,
  Building,
  PhoneCall,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Users,
  MapPin,
  ClipboardList,
  Package,
  ShieldCheck,
  FileCheck,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Filter,
  Download,
  FileText,
  Activity,
  PlayCircle,
  ChevronRight,
} from 'lucide-react';

export default function MaintenanceDashboardPage() {
  const {
    internalAssets,
    customerMachines,
    serviceRequests,
    breakdowns,
    preventivePlans,
    serviceVisits,
    warranties,
    amcContracts,
    downtimeRecords,
    maintenanceCosts,
    technicians,
  } = useERP();

  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  // KPI Calculations
  const totalAssetsCount = internalAssets.length;
  const activeCustomerMachinesCount = customerMachines.filter(
    (m) => m.status === 'Installed & Operational' || m.status === 'In Warranty' || m.status === 'Under AMC'
  ).length;
  const openServiceRequestsCount = serviceRequests.filter((s) => s.status !== 'Closed' && s.status !== 'Cancelled').length;
  const criticalBreakdownsCount = breakdowns.filter((b) => b.severity === 'Critical' && b.status !== 'Closed').length;
  const pendingVisitsCount = serviceVisits.filter((v) => v.status === 'Scheduled' || v.status === 'Started').length;
  const todaysVisitsCount = serviceVisits.filter((v) => v.visitDate === new Date().toISOString().split('T')[0]).length;
  const pmDueCount = preventivePlans.filter((p) => p.status === 'Active' || p.status === 'Scheduled').length;
  const overdueCount = preventivePlans.filter((p) => p.status === 'Overdue').length;
  const underWarrantyCount = customerMachines.filter((m) => m.status === 'In Warranty' || new Date(m.warrantyEnd) >= new Date()).length;
  const activeAmcCount = amcContracts.filter((a) => a.status === 'Active').length;
  const sparePartsUsedCount = breakdowns.reduce((acc, b) => acc + b.sparePartsUsed.reduce((sum, item) => sum + item.quantity, 0), 0) +
    serviceVisits.reduce((acc, v) => acc + v.partsUsed.reduce((sum, item) => sum + item.quantity, 0), 0);
  const monthlyCostTotal = maintenanceCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const totalDowntimeHours = downtimeRecords.reduce((sum, d) => sum + d.durationHours, 0);
  const avgResolutionTimeHrs = breakdowns.length > 0
    ? (breakdowns.reduce((sum, b) => sum + b.resolutionTimeMinutes, 0) / breakdowns.length / 60).toFixed(1)
    : '2.5';

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono border border-amber-500/30">
              MODULE 8
            </span>
            <span className="text-xs text-slate-400">Internal Equipment & Customer After-Sales</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Wrench className="w-8 h-8 text-amber-400" />
            Maintenance & Service Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Real-time monitoring of Uma Techno Fab assets, active customer machines, emergency breakdowns, scheduled PM, technician workloads & AMC contracts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/maintenance/service-requests"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            Log Service Request
          </Link>
          <Link
            href="/maintenance/breakdowns"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-red-600/30"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Breakdown
          </Link>
        </div>
      </div>

      {/* Top 14 Key Performance Indicators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Assets</span>
            <Cpu className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{totalAssetsCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">Internal Machinery</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Customer Machines</span>
            <Building className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{activeCustomerMachinesCount}</div>
          <div className="text-[10px] text-emerald-500 font-medium">100% Operational</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Open Requests</span>
            <PhoneCall className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{openServiceRequestsCount}</div>
          <div className="text-[10px] text-amber-500 font-medium">Pending Action</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Critical Breakdowns</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">{criticalBreakdownsCount}</div>
          <div className="text-[10px] text-red-500 font-medium font-mono">Immediate SLA</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Visits</span>
            <MapPin className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{pendingVisitsCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">{todaysVisitsCount} scheduled today</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Preventive Due</span>
            <RotateCcw className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{pmDueCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">{overdueCount} Overdue Tasks</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Warranty / AMC</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{underWarrantyCount} / {activeAmcCount}</div>
          <div className="text-[10px] text-emerald-500 font-medium">Warranty / AMC Active</div>
        </div>
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Spare Parts Used</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">{sparePartsUsedCount} Units</div>
          </div>
          <Package className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Monthly Cost</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(monthlyCostTotal)}</div>
          </div>
          <DollarSign className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Avg Resolution (MTTR)</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">{avgResolutionTimeHrs} Hours</div>
          </div>
          <Clock className="w-5 h-5 text-blue-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Total Downtime</div>
            <div className="text-base font-bold text-red-600 dark:text-red-400">{totalDowntimeHours} Hours</div>
          </div>
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Field Technicians</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">{technicians.length} Active</div>
          </div>
          <Users className="w-5 h-5 text-amber-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Work Orders</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">4 Orders</div>
          </div>
          <ClipboardList className="w-5 h-5 text-purple-500" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500">Service Reports</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">100% Signed</div>
          </div>
          <FileCheck className="w-5 h-5 text-green-500" />
        </div>
      </div>

      {/* Interactive Charts & Analytics Grid (9 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Breakdown Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              Breakdown Frequency Trend
            </h3>
            <span className="text-xs text-slate-400">Last 6 Months</span>
          </div>
          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
            {[
              { month: 'Apr', internal: 3, customer: 1 },
              { month: 'May', internal: 2, customer: 2 },
              { month: 'Jun', internal: 4, customer: 0 },
              { month: 'Jul', internal: 1, customer: 3 },
              { month: 'Aug', internal: 2, customer: 1 },
              { month: 'Sep', internal: 1, customer: 1 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div
                    style={{ height: `${d.internal * 22}%` }}
                    className="w-3 bg-red-500 rounded-t-sm transition-all hover:bg-red-400"
                    title={`Internal: ${d.internal}`}
                  />
                  <div
                    style={{ height: `${d.customer * 22}%` }}
                    className="w-3 bg-amber-500 rounded-t-sm transition-all hover:bg-amber-400"
                    title={`Customer: ${d.customer}`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">Internal Assets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">Customer Machines</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Service Requests by Month */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-500" />
              Service Requests Volume
            </h3>
            <span className="text-xs text-slate-400">Monthly</span>
          </div>
          <div className="h-40 flex items-end justify-between gap-3 pt-4 px-2">
            {[
              { month: 'Apr', count: 12 },
              { month: 'May', count: 15 },
              { month: 'Jun', count: 18 },
              { month: 'Jul', count: 14 },
              { month: 'Aug', count: 22 },
              { month: 'Sep', count: 19 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{d.count}</span>
                <div
                  style={{ height: `${(d.count / 25) * 100}%` }}
                  className="w-6 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md transition-all hover:opacity-90"
                />
                <span className="text-[10px] text-slate-500 font-medium">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Average 16.6 service requests / month
          </div>
        </div>

        {/* Chart 3: Service Requests by Customer */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-500" />
              Service Requests by Customer
            </h3>
            <span className="text-xs text-slate-400">Distribution</span>
          </div>
          <div className="space-y-2.5 pt-1">
            {(() => {
              const counts: Record<string, number> = {};
              serviceRequests.forEach((sr) => {
                if (sr.customerName) counts[sr.customerName] = (counts[sr.customerName] || 0) + 1;
              });
              const entries = Object.entries(counts);
              const total = serviceRequests.length || 1;
              const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
              if (entries.length === 0) {
                return (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No service requests logged yet
                  </div>
                );
              }
              return entries.slice(0, 5).map(([name, count], i) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{name}</span>
                      <span className="text-slate-500 font-mono">{count} SRs ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Chart 4: Service Type Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              Service Type Breakdown
            </h3>
            <span className="text-xs text-slate-400">Category</span>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { type: 'Breakdown Repairs', pct: 45, count: 9, color: 'bg-red-500 text-red-500' },
              { type: 'Preventive Maintenance', pct: 30, count: 6, color: 'bg-teal-500 text-teal-500' },
              { type: 'Warranty Inspections', pct: 15, count: 3, color: 'bg-emerald-500 text-emerald-500' },
              { type: 'AMC Scheduled Visits', pct: 10, count: 2, color: 'bg-blue-500 text-blue-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{item.type}</span>
                  <span className="font-bold">{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full ${item.color.split(' ')[0]}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 5: Preventive vs Breakdown Maintenance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-teal-500" />
              Preventive vs Breakdown Ratio
            </h3>
            <span className="text-xs text-emerald-500 font-bold">Target 70/30</span>
          </div>
          <div className="flex items-center justify-center p-4">
            <div className="w-36 h-36 rounded-full border-8 border-teal-500 border-t-red-500 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">65%</span>
              <span className="text-[10px] text-teal-600 font-bold uppercase">Preventive</span>
            </div>
          </div>
          <div className="flex justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-teal-600 dark:text-teal-400 font-semibold">● 65% Planned PM</span>
            <span className="text-red-500 font-semibold">● 35% Unplanned Breakdown</span>
          </div>
        </div>

        {/* Chart 6: Technician Workload */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Technician Active Workload
            </h3>
            <span className="text-xs text-slate-400">Live Status</span>
          </div>
          <div className="space-y-3 pt-1">
            {technicians.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white">{t.employeeName}</div>
                  <div className="text-[10px] text-slate-400">{t.designation}</div>
                </div>
                <div className="text-right space-y-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.availability === 'Available' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {t.availability}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">{t.currentWorkloadCount} Active Jobs</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 7: Spare Parts Consumption */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" />
              Top Spare Parts Consumption
            </h3>
            <span className="text-xs text-slate-400">By Value</span>
          </div>
          <div className="space-y-2.5 pt-1">
            {[
              { name: 'SKF Spherical Roller Bearing 22218', val: 14500, qty: 1 },
              { name: 'Viton High Temp Hydraulic Seal Kit', val: 12500, qty: 1 },
              { name: 'Heavy Hydraulic Cylinder Seal Kit 80mm', val: 6800, qty: 1 },
              { name: 'Fanuc 3V Lithium Battery Pack', val: 3500, qty: 1 },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[190px]">{p.name}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(p.val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 8: Maintenance Cost Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Maintenance Cost Breakdown
            </h3>
            <span className="text-xs text-slate-400">Spend</span>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { type: 'Spare Parts & Consumables', cost: 31500, pct: 65, color: 'bg-emerald-500' },
              { type: 'Technician Labour Hours', cost: 11700, pct: 24, color: 'bg-blue-500' },
              { type: 'Travel & Miscellaneous', cost: 4300, pct: 11, color: 'bg-amber-500' },
            ].map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{c.type}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(c.cost)} ({c.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 9: Machine Downtime Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              Downtime Hours by Reason
            </h3>
            <span className="text-xs text-slate-400 font-mono">{totalDowntimeHours} Hrs Total</span>
          </div>
          <div className="space-y-2.5 pt-1">
            {[
              { reason: 'Machine Breakdown', hrs: 4.0, pct: 66, color: 'bg-red-500' },
              { reason: 'Preventive Maintenance', hrs: 2.5, pct: 34, color: 'bg-blue-500' },
            ].map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{d.reason}</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{d.hrs} Hours ({d.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Action Table: Critical Breakdowns & Immediate Service Tasks */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
              Active Maintenance & Customer Service Feed
            </h2>
            <p className="text-xs text-slate-500">Live status of unresolved requests, breakdowns & engineer assignments</p>
          </div>
          <Link
            href="/maintenance/service-requests"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1"
          >
            View All Service Requests <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Customer / Asset</th>
                <th className="py-3 px-4">Machine Name & Serial</th>
                <th className="py-3 px-4">Problem / Scope</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {serviceRequests.map((sr) => (
                <tr key={sr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{sr.requestNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{sr.customerName}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{sr.machineName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SN: {sr.serialNumber}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-300 truncate">{sr.complaintType} - {sr.description}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sr.priority === 'Critical'
                          ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                          : sr.priority === 'High'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      }`}
                    >
                      {sr.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {sr.assignedTechnicianName || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {sr.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <Link
                      href="/maintenance/service-visits"
                      className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium hover:underline text-[11px]"
                    >
                      Visit Details
                    </Link>
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
