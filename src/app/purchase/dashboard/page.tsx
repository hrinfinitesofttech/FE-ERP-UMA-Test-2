'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import Link from 'next/link';
import {
  ShoppingCart,
  FileText,
  Building,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  Filter,
  Plus,
  FileCheck2,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';

export default function PurchaseDashboardPage() {
  const {
    suppliers,
    materialRequirements,
    purchaseRequisitions,
    rfqs,
    supplierQuotations,
    purchaseOrders,
    purchaseFollowUps,
    purchaseReturns,
    projectJobs,
  } = useERP();

  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');

  // Filtered data based on Project filter
  const filteredPRs = selectedProjectFilter === 'ALL'
    ? purchaseRequisitions
    : purchaseRequisitions.filter(pr => pr.projectId === selectedProjectFilter);

  const filteredPOs = selectedProjectFilter === 'ALL'
    ? purchaseOrders
    : purchaseOrders.filter(po => po.projectId === selectedProjectFilter);

  // Calculated Metrics for 10 KPI Cards
  const totalPRCount = filteredPRs.length;
  const pendingPRCount = filteredPRs.filter(pr => pr.status === 'Draft' || pr.status === 'Submitted' || pr.status === 'Pending Approval').length;
  const pendingRFQCount = rfqs.filter(r => r.status === 'Sent to Suppliers' || r.status === 'Draft').length;
  const supplierQuotesReceived = supplierQuotations.length;
  const pendingPOApprovalCount = filteredPOs.filter(po => po.status === 'Submitted' || po.status === 'Pending Approval').length;
  const openPOCount = filteredPOs.filter(po => po.status === 'Approved' || po.status === 'Partially Received' || po.status === 'Ordered').length;
  const partiallyReceivedPOCount = filteredPOs.filter(po => po.status === 'Partially Received').length;
  const overdueDeliveriesCount = filteredPOs.filter(po => {
    const isPast = new Date(po.expectedDeliveryDate) < new Date();
    return isPast && (po.status === 'Approved' || po.status === 'Ordered' || po.status === 'Partially Received');
  }).length;
  
  const currentMonthValue = filteredPOs
    .filter(po => po.status !== 'Cancelled')
    .reduce((sum, po) => sum + po.grandTotal, 0);

  const totalMRPShortages = materialRequirements.filter(mr => mr.shortageQuantity > 0).length;

  // Chart 1: Monthly Purchase Spending Trend
  const spendTrendData = [
    { month: 'Apr', spend: 420000 },
    { month: 'May', spend: 580000 },
    { month: 'Jun', spend: 750000 },
    { month: 'Jul', spend: 620000 },
    { month: 'Aug', spend: 890000 },
    { month: 'Sep', spend: currentMonthValue > 0 ? currentMonthValue : 1250000 },
  ];

  // Chart 2: PO Status Distribution
  const poStatusCounts = filteredPOs.reduce((acc: any, po) => {
    acc[po.status] = (acc[po.status] || 0) + 1;
    return acc;
  }, {});

  const pieColors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#06B6D4'];
  const poStatusPieData = Object.keys(poStatusCounts).map(status => ({
    name: status,
    value: poStatusCounts[status],
  }));

  // Chart 3: Supplier Rating Breakdown
  const supplierRatingData = [
    { category: 'Class A (90-100%)', count: suppliers.filter(s => s.performanceRating >= 90).length },
    { category: 'Class B (75-89%)', count: suppliers.filter(s => s.performanceRating >= 75 && s.performanceRating < 90).length },
    { category: 'Class C (60-74%)', count: suppliers.filter(s => s.performanceRating >= 60 && s.performanceRating < 75).length },
    { category: 'Under Evaluation', count: suppliers.filter(s => s.performanceRating < 60).length },
  ];

  // Chart 4: Job-wise Purchase Spend
  const jobSpendData = projectJobs.map(job => {
    const jobPOs = purchaseOrders.filter(po => po.jobId === job.id);
    const totalCost = jobPOs.reduce((sum, po) => sum + po.grandTotal, 0);
    return {
      jobNo: job.jobNumber,
      cost: totalCost > 0 ? totalCost / 100000 : Math.floor(Math.random() * 5) + 1, // in Lakhs
    };
  });

  // Chart 5: Material Shortage Category Split
  const shortageCategoryData = [
    { category: 'Raw Plates / Beams', count: 14 },
    { category: 'Motors & Gearboxes', count: 8 },
    { category: 'Fasteners & Hardware', count: 22 },
    { category: 'Electrical Panels', count: 5 },
    { category: 'Hydraulic Seals', count: 11 },
  ];

  // Chart 6: Delivery On-Time Performance Trend (%)
  const deliveryPerfData = [
    { month: 'Apr', rate: 92 },
    { month: 'May', rate: 88 },
    { month: 'Jun', rate: 95 },
    { month: 'Jul', rate: 91 },
    { month: 'Aug', rate: 96 },
    { month: 'Sep', rate: 94 },
  ];

  return (
    <div className="space-y-5 text-xs pb-12 text-[#211B17]">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DED5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
              MODULE 4
            </span>
            <h1 className="text-2xl font-bold font-mono text-[#211B17] tracking-tight">Purchase Management Dashboard</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Real-time material procurement, supplier matrix, MRP shortages, PO workflow & delivery tracking for Uma Techno Fab.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Selector Filter */}
          <div className="flex items-center gap-2 bg-white border border-[#E7DED5] rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#70665F]" />
            <span className="text-[#70665F]">Filter Project:</span>
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="bg-transparent text-[#211B17] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white">All Projects & Jobs</option>
              {projectJobs.map(job => (
                <option key={job.id} value={job.id} className="bg-white">
                  {job.jobNumber} ({job.productName})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/purchase/mrp"
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Run MRP Calculation
          </Link>
          <Link
            href="/purchase/requisition"
            className="flex items-center gap-2 px-3.5 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-crm-brand-700/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New PR
          </Link>
          <Link
            href="/purchase/po"
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Create PO
          </Link>
        </div>
      </div>

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total PRs</span>
            <FileText className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#211B17]">{totalPRCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1 flex items-center gap-1">
            <span>Requisitions generated</span>
          </div>
        </div>

        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Pending PR</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{pendingPRCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Awaiting approval / RFQ</div>
        </div>

        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Pending RFQs</span>
            <FileCheck2 className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-2xl font-extrabold text-crm-brand-500">{pendingRFQCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Awaiting vendor quotes</div>
        </div>

        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Quotes Recv</span>
            <DollarSign className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-2xl font-extrabold text-crm-brand-500">{supplierQuotesReceived}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Ready for comparison</div>
        </div>

        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Pending PO Approval</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400">{pendingPOApprovalCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Tier-2/3 Management review</div>
        </div>

        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Open POs</span>
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{openPOCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Active vendor orders</div>
        </div>

        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Partial GRN</span>
            <Truck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-sky-400">{partiallyReceivedPOCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Store balance pending</div>
        </div>

        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Overdue Delivery</span>
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-red-400">{overdueDeliveriesCount}</div>
          <div className="text-[10px] text-red-300/80 mt-1 font-semibold">Immediate expediting</div>
        </div>

        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Month Purchase</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-extrabold text-teal-300">
            ₹{(currentMonthValue / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-[#8D827A] mt-1">Total approved committed</div>
        </div>

        <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5CAC0] transition-colors relative overflow-hidden group hover:border-[#EBE3DB] transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">MRP Shortages</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{totalMRPShortages}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Items requiring PR</div>
        </div>
      </div>

      {/* Recharts Row 1: Purchase Value Trend & PO Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Spending Trend */}
        <div className="lg:col-span-2 bg-white border border-[#E7DED5] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Monthly Purchase Spend Trend (₹)
              </h3>
              <p className="text-xs text-[#70665F]">Total Purchase Order commitment over past 6 months</p>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              FY 2026-27
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrendData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val)?.toLocaleString('en-IN')}`, 'Purchase Value']}
                />
                <Area type="monotone" dataKey="spend" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: PO Status Pie */}
        <div className="bg-white border border-[#E7DED5] rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-crm-brand-500" />
              PO Status Distribution
            </h3>
            <p className="text-xs text-[#70665F]">Active vs Pending vs Completed POs</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {poStatusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={poStatusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {poStatusPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[#8D827A]">No PO status data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Recharts Row 2: Supplier Performance Ratings & Job-wise Purchase Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Supplier Rating Breakdown */}
        <div className="bg-white border border-[#E7DED5] rounded-2xl p-5">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400" />
                Supplier Rating & Categorization
              </h3>
              <p className="text-xs text-[#70665F]">Class A / B / C supplier quality matrix</p>
            </div>
            <Link href="/purchase/suppliers" className="text-xs text-indigo-400 hover:underline">
              View Master →
            </Link>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierRatingData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis dataKey="category" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Job-wise Purchase Spend */}
        <div className="bg-white border border-[#E7DED5] rounded-2xl p-5">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Job-wise Committed Purchase Value (Lakhs)
              </h3>
              <p className="text-xs text-[#70665F]">Primary Identifier: Project ID + Job Number</p>
            </div>
            <Link href="/purchase/mrp" className="text-xs text-amber-400 hover:underline">
              View MRP →
            </Link>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobSpendData}>
                <XAxis dataKey="jobNo" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${val} Lakhs`, 'Purchase Cost']}
                />
                <Bar dataKey="cost" fill="#F59E0B" radius={[8, 8, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Recent Purchase Requisitions */}
        <div className="bg-white border border-[#E7DED5] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <FileText className="w-4 h-4 text-crm-brand-500" />
              Recent Purchase Requisitions (PR)
            </h3>
            <Link href="/purchase/requisition" className="text-xs text-crm-brand-500 hover:underline flex items-center gap-1">
              View All PRs <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-[#544B45]">
              <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#E7DED5]">
                <tr>
                  <th className="p-2.5">PR Number</th>
                  <th className="p-2.5">Project / Job</th>
                  <th className="p-2.5">Priority</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Total Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB]">
                {purchaseRequisitions.slice(0, 5).map(pr => (
                  <tr key={pr.id} className="hover:bg-white/40 transition">
                    <td className="p-2.5 font-mono font-bold text-crm-brand-500">{pr.prNumber}</td>
                    <td className="p-2.5">
                      <div className="font-semibold text-[#211B17]">{pr.jobId}</div>
                      <div className="text-[10px] text-[#70665F]">{pr.projectId}</div>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pr.priority === 'Urgent' ? 'bg-red-500/20 text-red-300' :
                        pr.priority === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-white text-[#544B45]'
                      }`}>
                        {pr.priority}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        pr.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        pr.status === 'Pending Approval' ? 'bg-amber-500/20 text-amber-400' : 'bg-white text-[#70665F]'
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[#211B17]">₹{pr.estimatedCost?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Active Purchase Orders */}
        <div className="bg-white border border-[#E7DED5] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              Active Purchase Orders (PO)
            </h3>
            <Link href="/purchase/po" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              View All POs <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-[#544B45]">
              <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#E7DED5]">
                <tr>
                  <th className="p-2.5">PO Number</th>
                  <th className="p-2.5">Supplier Name</th>
                  <th className="p-2.5">Expected Delivery</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB]">
                {purchaseOrders.slice(0, 5).map(po => (
                  <tr key={po.id} className="hover:bg-white/40 transition">
                    <td className="p-2.5 font-mono font-bold text-emerald-400">
                      {po.poNumber} <span className="text-[10px] text-[#8D827A]">R{po.revisionNumber}</span>
                    </td>
                    <td className="p-2.5 font-semibold text-[#211B17] truncate max-w-[140px]">{po.supplierName}</td>
                    <td className="p-2.5 text-[#70665F]">{po.expectedDeliveryDate}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        po.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        po.status === 'Partially Received' ? 'bg-sky-500/20 text-sky-400' :
                        po.status === 'Pending Approval' ? 'bg-amber-500/20 text-amber-400' : 'bg-white text-[#70665F]'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[#211B17]">₹{po.grandTotal?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
