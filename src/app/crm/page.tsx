'use client';

import React from 'react';
import Link from 'next/link';
import { useERP } from '../../context/ERPContext';
import { formatCurrency } from '../../lib/utils';
import {
  Users,
  UserPlus,
  FileCheck2,
  Briefcase,
  TrendingUp,
  PhoneCall,
  Clock,
  ArrowRight,
  PlusCircle,
  DollarSign,
  Building,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

export default function CRMDashboardPage() {
  const { leads, quotations, customerPOs, salesOrders, followUps, opportunities } = useERP();

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const activeLeads = leads.filter((l) => l.status !== 'won' && l.status !== 'lost').length;
  const wonLeads = leads.filter((l) => l.status === 'won').length;
  const lostLeads = leads.filter((l) => l.status === 'lost').length;

  const todayFollowUps = followUps.filter((f) => f.date === '2026-09-23' && f.status === 'pending');
  const overdueFollowUps = followUps.filter((f) => f.date < '2026-09-23' && f.status === 'pending');

  const totalPipelineValue = opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
  const totalWonValue = salesOrders.reduce((sum, so) => sum + so.orderValue, 0);

  // Pipeline Data for Recharts
  const pipelineData = [
    { stage: 'Qualification', count: opportunities.filter((o) => o.stage === 'qualification').length, value: 38 },
    { stage: 'Requirement', count: opportunities.filter((o) => o.stage === 'requirement').length, value: 92 },
    { stage: 'Technical', count: opportunities.filter((o) => o.stage === 'technical_discussion').length, value: 65 },
    { stage: 'Quotation', count: opportunities.filter((o) => o.stage === 'quotation').length, value: 145 },
    { stage: 'Negotiation', count: opportunities.filter((o) => o.stage === 'negotiation').length, value: 138 },
    { stage: 'Won Orders', count: salesOrders.length, value: Math.round(totalWonValue / 100000) },
  ];

  // Lead Source Distribution
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => {
    sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  });
  const sourcePieData = Object.entries(sourceCounts).map(([key, value]) => ({
    name: key?.replace('_', ' ')?.toUpperCase(),
    value,
  }));
  const PIE_COLORS = ['#A96B34', '#0E91B2', '#169B62', '#75401F', '#A43D8F', '#D68A22'];

  return (
    <div className="space-y-4 md:space-y-5 text-xs pb-10">
      {/* Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] p-5 sm:p-6 rounded-2xl border border-[#E9DFD3] text-[#211B17] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F5E6D8] text-[#8C5229] border border-[#E7DED5] font-mono text-[10px] font-bold uppercase tracking-wider">
              Module 1: CRM & Sales Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
            Commercial & Sales Command Dashboard
          </h1>
          <p className="text-[#6F6156] text-xs mt-1 max-w-xl leading-relaxed">
            Real-time pipeline analytics, lead conversion rate, active quotations, and customer PO tracking for Uma Techno Fab.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/crm/leads/new"
            className="px-4 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Lead</span>
          </Link>
          <Link
            href="/crm/quotations/new"
            className="px-4 py-2 bg-white hover:bg-[#FAF7F2] border border-[#E7DED5] text-[#3E2723] rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#169B62]" />
            <span>New Quotation</span>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between min-h-[115px]">
          <div>
            <span className="text-[11px] font-semibold text-[#70665F] uppercase tracking-wider block">Total Leads</span>
            <span className="text-xl sm:text-2xl font-bold text-[#211B17] font-mono block mt-1">{totalLeads}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#F2ECE4] text-[10px] text-[#0E91B2] font-semibold flex items-center gap-1">
            <UserPlus className="w-3 h-3" /> {newLeads} New Uncontacted
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between min-h-[115px]">
          <div>
            <span className="text-[11px] font-semibold text-[#70665F] uppercase tracking-wider block">Follow-ups Today</span>
            <span className="text-xl sm:text-2xl font-bold text-[#D68A22] font-mono block mt-1">{todayFollowUps.length}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#F2ECE4] text-[10px] text-[#D94C64] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" /> {overdueFollowUps.length} Overdue
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between min-h-[115px]">
          <div>
            <span className="text-[11px] font-semibold text-[#70665F] uppercase tracking-wider block">Quotations Sent</span>
            <span className="text-xl sm:text-2xl font-bold text-[#A43D8F] font-mono block mt-1">{quotations.length}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#F2ECE4] text-[10px] text-[#70665F] font-medium block">
            Multi-Revision Supported
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between min-h-[115px]">
          <div>
            <span className="text-[11px] font-semibold text-[#70665F] uppercase tracking-wider block">Active Pipeline</span>
            <span className="text-xl sm:text-2xl font-bold text-[#211B17] font-mono block mt-1">
              {formatCurrency(totalPipelineValue)}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#F2ECE4] text-[10px] text-[#169B62] font-semibold block">
            {opportunities.length} Open Deals
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7DED5] shadow-xs flex flex-col justify-between min-h-[115px]">
          <div>
            <span className="text-[11px] font-semibold text-[#70665F] uppercase tracking-wider block">Confirmed Orders Won</span>
            <span className="text-xl sm:text-2xl font-bold text-[#169B62] font-mono block mt-1">
              {formatCurrency(totalWonValue)}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#F2ECE4] text-[10px] text-[#169B62] font-bold block">
            {salesOrders.length} Sales Orders (In Mfg)
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* Chart 1: Pipeline Breakdown */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#75401F]" />
              Sales Opportunity Pipeline by Value (₹ in Lakhs)
            </h3>
            <span className="text-[11px] text-[#8D827A] font-medium">Weighted Probability</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7DED5" opacity={0.5} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#70665F' }} />
                <YAxis tick={{ fontSize: 10, fill: '#70665F' }} />
                <Tooltip
                  formatter={(val: any) => [`₹ ${val} Lakhs`, 'Pipeline Value']}
                  contentStyle={{ backgroundColor: '#211B17', borderColor: '#3E2723', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                  itemStyle={{ color: '#F8EDE0' }}
                  cursor={{ fill: '#F6F0E7' }}
                />
                <Bar dataKey="value" fill="#75401F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Lead Sources */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#169B62]" />
            Lead Acquisition Channels
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourcePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} labelLine={false}>
                  {sourcePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#211B17', borderColor: '#3E2723', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ color: '#F8EDE0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
            {sourcePieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="text-[#70665F] truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links / Operations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Today's Action Items */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2 border-[#EFE8DE]">
            <span className="font-bold text-[#211B17] flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-[#D68A22]" /> Follow-ups Due Today
            </span>
            <Link href="/crm/follow-ups" className="text-[#75401F] hover:underline text-[11px] font-bold">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {todayFollowUps.slice(0, 3).map((f) => (
              <div key={f.id} className="p-2.5 bg-[#FAF7F2] rounded-xl flex items-center justify-between border border-[#E7DED5]">
                <div>
                  <span className="font-bold text-[#211B17] block truncate">{f.leadOrCustomerName}</span>
                  <span className="text-[10px] text-[#70665F] block truncate">{f.purpose}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-mono text-[9px] font-bold border border-[#FDE68A]">
                  {f.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Recent Quotations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2 border-[#EFE8DE]">
            <span className="font-bold text-[#211B17] flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#A43D8F]" /> Recent Quotations
            </span>
            <Link href="/crm/quotations" className="text-[#75401F] hover:underline text-[11px] font-bold">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {quotations.slice(0, 3).map((q) => (
              <div key={q.id} className="p-2.5 bg-[#FAF7F2] rounded-xl flex items-center justify-between border border-[#E7DED5]">
                <div>
                  <span className="font-mono font-bold text-[#75401F] block">{q.quotationNumber} ({q.currentRevision})</span>
                  <span className="text-[10px] text-[#70665F] block truncate">{q.customerName}</span>
                </div>
                <span className="font-bold text-[#169B62] text-[11px] font-mono">
                  {formatCurrency(q.latestSummary?.grandTotal || (q.revisions && q.revisions[q.revisions.length - 1]?.grandTotal) || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Ready for Shop Floor Transition */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2 border-[#EFE8DE]">
            <span className="font-bold text-[#211B17] flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#75401F]" /> CRM → Project Handover
            </span>
            <Link href="/crm/sales-orders" className="text-[#75401F] hover:underline text-[11px] font-bold">
              Sales Orders
            </Link>
          </div>
          <p className="text-[#70665F] text-[11px] leading-relaxed">
            Confirmed sales orders can immediately initiate an Engineering Project and Job Number (`JOB-2026-XXX`) with 1-click.
          </p>
          <Link
            href="/crm/sales-orders"
            className="w-full py-2 bg-[#FAF7F2] text-[#75401F] hover:bg-[#F3ECE4] border border-[#E7DED5] rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
          >
            <span>Open Sales Orders to Convert</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
