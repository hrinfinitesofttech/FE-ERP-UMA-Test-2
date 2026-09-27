'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  Briefcase,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  ShoppingCart,
  Wrench,
  ShieldCheck,
  Truck,
  Building,
  User,
  Filter,
  TrendingUp,
  RefreshCw,
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export default function ProjectDashboardPage() {
  const { projectJobs, projectDelays, projectTasks } = useERP();

  // Filters State
  const [managerFilter, setManagerFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filtered Projects
  const filteredProjects = projectJobs.filter((p) => {
    if (managerFilter !== 'all' && p.projectManager !== managerFilter) return false;
    if (customerFilter !== 'all' && p.customerName !== customerFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
    return true;
  });

  // KPI Calculations
  const totalProjects = filteredProjects.length;
  const activeProjects = filteredProjects.filter((p) => p.status !== 'completed' && p.status !== 'cancelled').length;
  const planningCount = filteredProjects.filter((p) => p.status === 'planning').length;
  const designPendingCount = filteredProjects.filter((p) => p.status === 'design').length;
  const materialPendingCount = filteredProjects.filter((p) => p.status === 'material_planning').length;
  const purchasePendingCount = filteredProjects.filter((p) => p.status === 'purchase').length;
  const productionRunningCount = filteredProjects.filter((p) => p.status === 'production').length;
  const qcPendingCount = filteredProjects.filter((p) => p.status === 'qc').length;
  const dispatchPendingCount = filteredProjects.filter((p) => p.status === 'ready_for_dispatch').length;
  const installationPendingCount = filteredProjects.filter((p) => p.status === 'installation').length;
  const completedCount = filteredProjects.filter((p) => p.status === 'completed').length;
  const delayedProjectsCount = filteredProjects.filter((p) => p.expectedDeliveryDate && new Date(p.expectedDeliveryDate) > new Date(p.deliveryDate)).length || projectDelays.length;

  // Chart 1 Data: Projects by Status
  const statusChartData = [
    { name: 'Planning', value: planningCount, color: '#8B5CF6' },
    { name: 'Design', value: designPendingCount, color: '#EC4899' },
    { name: 'Material', value: materialPendingCount, color: '#F59E0B' },
    { name: 'Purchase', value: purchasePendingCount, color: '#3B82F6' },
    { name: 'Production', value: productionRunningCount, color: '#10B981' },
    { name: 'QC', value: qcPendingCount, color: '#06B6D4' },
    { name: 'Dispatch', value: dispatchPendingCount, color: '#F97316' },
    { name: 'Completed', value: completedCount, color: '#64748B' },
  ].filter((d) => d.value > 0);

  // Chart 2 Data: Projects by Department (Task distribution)
  const departmentChartData = [
    { name: 'CRM', count: 4, hours: 25 },
    { name: 'Design', count: 8, hours: 140 },
    { name: 'Purchase', count: 6, hours: 90 },
    { name: 'Store', count: 5, hours: 45 },
    { name: 'Production', count: 12, hours: 320 },
    { name: 'QC', count: 4, hours: 60 },
    { name: 'Maintenance', count: 3, hours: 50 },
  ];

  // Chart 3 Data: Projects by Priority
  const priorityChartData = [
    { name: 'Low', count: filteredProjects.filter((p) => p.priority === 'low').length, fill: '#94A3B8' },
    { name: 'Medium', count: filteredProjects.filter((p) => p.priority === 'medium').length, fill: '#3B82F6' },
    { name: 'High', count: filteredProjects.filter((p) => p.priority === 'high').length, fill: '#F59E0B' },
    { name: 'Urgent', count: filteredProjects.filter((p) => p.priority === 'urgent').length, fill: '#EF4444' },
  ];

  // Chart 4 Data: Monthly Project Creation
  const monthlyCreationData = [
    { month: 'Apr 2026', count: 2, value: 85 },
    { month: 'May 2026', count: 3, value: 120 },
    { month: 'Jun 2026', count: 4, value: 160 },
    { month: 'Jul 2026', count: 5, value: 210 },
    { month: 'Aug 2026', count: 6, value: 280 },
    { month: 'Sep 2026', count: 4, value: 190 },
  ];

  // Chart 5 Data: Project Completion Rate
  const completionTrendData = [
    { month: 'May', planned: 2, actual: 2 },
    { month: 'Jun', planned: 3, actual: 3 },
    { month: 'Jul', planned: 4, actual: 4 },
    { month: 'Aug', planned: 5, actual: 4 },
    { month: 'Sep', planned: 3, actual: 2 },
  ];

  // Chart 6 Data: Delayed Projects Breakdown
  const delayBreakdownData = [
    { reason: 'Customer Approval', days: 3 },
    { reason: 'Supplier Material', days: 5 },
    { reason: 'Design Revisions', days: 2 },
    { reason: 'Machine Maintenance', days: 1 },
  ];

  // Unique lists for filters
  const managers = Array.from(new Set(projectJobs.map((p) => p.projectManager)));
  const customers = Array.from(new Set(projectJobs.map((p) => p.customerName)));

  return (
    <div className="space-y-5 text-xs pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] text-[#211B17] p-5 sm:p-6 rounded-2xl border border-[#E9DFD3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-[#F5E6D8] text-[#8C5229] font-mono text-[10px] font-bold border border-[#E7DED5] uppercase tracking-wider">
              Module 2 • Manufacturing Project Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2.5 text-[#211B17]">
            <Briefcase className="w-5 h-5 text-[#75401F]" />
            Project Management Dashboard
          </h1>
          <p className="text-[#6F6156] text-xs mt-1 leading-relaxed">
            Real-time status tracking, department coordination, timeline health, and delivery performance for Uma Techno Fab.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-center gap-2 bg-[#FAF7F2] p-2.5 rounded-2xl border border-[#E7DED5] shadow-xs">
          <div className="flex items-center gap-1 text-[#70665F] font-bold mr-1">
            <Filter className="w-3.5 h-3.5 text-[#75401F]" />
            <span>Filters:</span>
          </div>

          <select
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E7DED5] rounded-full text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F] shadow-xs cursor-pointer"
          >
            <option value="all">All Managers</option>
            {managers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E7DED5] rounded-full text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F] shadow-xs cursor-pointer"
          >
            <option value="all">All Customers</option>
            {customers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E7DED5] rounded-full text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F] shadow-xs cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="design">Design</option>
            <option value="material_planning">Material Planning</option>
            <option value="purchase">Purchase</option>
            <option value="production">Production</option>
            <option value="qc">QC</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E7DED5] rounded-full text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F] shadow-xs cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {(managerFilter !== 'all' || customerFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setManagerFilter('all');
                setCustomerFilter('all');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] text-[#70665F] border border-[#E7DED5] rounded-full flex items-center gap-1 transition shadow-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 12 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Total Projects</span>
            <Briefcase className="w-4 h-4 text-[#75401F]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#211B17]">{totalProjects}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">Make-To-Order Master</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Active Projects</span>
            <TrendingUp className="w-4 h-4 text-[#169B62]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#169B62]">{activeProjects}</div>
          <span className="text-[10px] text-[#169B62] font-semibold">In Pipeline</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Planning</span>
            <Layers className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#8B5CF6]">{planningCount}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">Stage 1 & 2</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Design Pending</span>
            <Cpu className="w-4 h-4 text-[#A43D8F]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#A43D8F]">{designPendingCount}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">CAD & GA Drawing</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Material Pending</span>
            <Wrench className="w-4 h-4 text-[#D68A22]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#D68A22]">{materialPendingCount}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">BOM Release</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Purchase Pending</span>
            <ShoppingCart className="w-4 h-4 text-[#0E91B2]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0E91B2]">{purchasePendingCount}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">PR & PO Issuance</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Production Running</span>
            <Wrench className="w-4 h-4 text-[#169B62]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#169B62]">{productionRunningCount}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">Shop Floor Fab</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>QC Pending</span>
            <ShieldCheck className="w-4 h-4 text-[#0E91B2]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0E91B2]">{qcPendingCount}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">Hydro & DP Testing</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Dispatch Pending</span>
            <Truck className="w-4 h-4 text-[#D68A22]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#D68A22]">{dispatchPendingCount}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">Packing & Challan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Installation Pending</span>
            <Building className="w-4 h-4 text-[#75401F]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#75401F]">{installationPendingCount}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">Site Erection</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between hover:border-[#D5CAC0] transition-colors">
          <div className="flex items-center justify-between text-[#70665F] font-bold mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#169B62]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#70665F]">{completedCount}</div>
          <span className="text-[10px] text-[#8D827A] mt-1">Handed Over</span>
        </div>

        <div className="bg-[#FFF8F8] p-4 rounded-2xl border border-[#FED7D7] shadow-xs flex flex-col justify-between hover:border-[#FEB2B2] transition-colors">
          <div className="flex items-center justify-between text-[#D9383A] font-bold mb-1">
            <span>Delayed Projects</span>
            <AlertTriangle className="w-4 h-4 text-[#D9383A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#D9383A]">{delayedProjectsCount}</div>
          <span className="text-[10px] text-[#D9383A] font-semibold">Requires PM Action</span>
        </div>
      </div>

      {/* 7 Recharts Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Projects by Status */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#211B17] mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-crm-brand-600" />
            Projects Breakdown by Status
          </h2>
          <p className="text-[11px] text-[#70665F] mb-4">Distribution of active MTO orders across manufacturing stages</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={4} label>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Workload */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#211B17] mb-1 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-emerald-500" />
            Department Workload & Active Tasks
          </h2>
          <p className="text-[11px] text-[#70665F] mb-4">Task volume and estimated engineering hours per department</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Active Tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hours" name="Est. Hours" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Projects by Priority */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#211B17] mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Projects by Priority Level
          </h2>
          <p className="text-[11px] text-[#70665F] mb-4">Urgency levels assigned to active manufacturing jobs</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" name="Project Count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Monthly Project Creation */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#211B17] mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-crm-brand-600" />
            Monthly MTO Project Inflow Trend
          </h2>
          <p className="text-[11px] text-[#70665F] mb-4">Project creation volume & order value in Lakhs (₹)</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCreationData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="value" name="Order Value (₹ Lakhs)" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Project Delivery Performance */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#211B17] mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Project Delivery Performance (Planned vs Actual)
          </h2>
          <p className="text-[11px] text-[#70665F] mb-4">On-time delivery comparison rate</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="planned" name="Target Completions" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="actual" name="Actual Delivered" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Delayed Projects Analysis */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#211B17] mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            Delay Impact Analysis by Reason
          </h2>
          <p className="text-[11px] text-[#70665F] mb-4">Average impact days lost across delay categories</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayBreakdownData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" stroke="#888888" fontSize={11} />
                <YAxis dataKey="reason" type="category" stroke="#888888" fontSize={10} width={120} />
                <Tooltip />
                <Bar dataKey="days" name="Delay Days" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
