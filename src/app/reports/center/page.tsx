'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileBarChart,
  Download,
  Printer,
  Search,
  Briefcase,
  Layers,
  Wrench,
  Package,
  Building,
  Factory,
  Receipt,
  Users,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export default function ReportsCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const reportCategories = [
    { id: 'all', label: 'All Modules (35+ Reports)' },
    { id: 'CRM', label: 'CRM & Sales' },
    { id: 'Project', label: 'Project & Job' },
    { id: 'Design', label: 'Design & Engineering' },
    { id: 'Purchase', label: 'Purchase & Procurement' },
    { id: 'Store', label: 'Store & Warehouse' },
    { id: 'Production', label: 'Production & Shopfloor' },
    { id: 'Accounts', label: 'Accounts & Finance' },
    { id: 'HR', label: 'HR & Payroll' },
    { id: 'Maintenance', label: 'Maintenance & Service' },
  ];

  const reportsList = [
    { id: 'REP-01', title: 'Job Profitability & Cost Variance Report', category: 'Accounts', link: '/reports/job-profitability', desc: 'Consolidated job-by-job revenue, material cost, labour, machine cost & gross profit margins.' },
    { id: 'REP-02', title: 'Sales Funnel & Quotation Win/Loss Analysis', category: 'CRM', link: '/crm/reports', desc: 'Lead conversions, quotation win rates, and sales performance by representative.' },
    { id: 'REP-03', title: 'Project Schedule Delay & Milestone Progress Report', category: 'Project', link: '/projects/reports', desc: 'Gantt schedule variances, milestone completions, and department bottleneck logs.' },
    { id: 'REP-04', title: 'Purchase Requisition to PO Cycle Time Report', category: 'Purchase', link: '/purchase/reports', desc: 'Procurement lead time, supplier pricing comparisons, and open PO status.' },
    { id: 'REP-05', title: 'Store Stock Valuation & Fast/Slow Moving Analysis', category: 'Store', link: '/store/reports', desc: 'Category-wise inventory valuation, dead stock identification, and ABC analysis.' },
    { id: 'REP-06', title: 'Production OEE & Machine Utilization Report', category: 'Production', link: '/production/reports', desc: 'Work center efficiency, downtime hours, scrap generation, and operator productivity.' },
    { id: 'REP-07', title: 'Accounts Receivable (AR) Customer Aging Analysis', category: 'Accounts', link: '/accounting/accounts-receivable', desc: '0-30, 31-60, 61-90, 90+ days payment overdue breakdown by customer.' },
    { id: 'REP-08', title: 'Monthly Payroll Register & Statutory PF/ESI/PT Summary', category: 'HR', link: '/hr/payroll-reports', desc: 'Employee gross earnings, statutory deductions, net payouts, and ECR file summaries.' },
    { id: 'REP-09', title: 'Equipment Breakdown & Preventive Maintenance Costs', category: 'Maintenance', link: '/maintenance/reports', desc: 'Machine breakdown frequency, MTBF/MTTR metrics, spare parts consumption, and AMC costs.' },
  ];

  const filteredReports = reportsList.filter((r) => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =

      !searchTerm?.trim() || (

      r.title?.toLowerCase().includes(searchTerm?.toLowerCase()) || r.desc?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#544B45] font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <FileBarChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Central ERP Reports Center</h1>
              <p className="text-xs text-[#70665F] font-medium mt-0.5">
                Consolidated Enterprise Analytics, Statutory Audit Registers & Export Center
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#544B45] outline-none focus:border-rose-500 w-64"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin p-1.5 bg-white rounded-xl border border-[#EBE3DB]">
        {reportCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === cat.id ? 'bg-rose-600 text-white shadow-md' : 'text-[#70665F] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 bg-white border border-[#EBE3DB] hover:border-rose-500/50 rounded-2xl space-y-4 shadow-lg transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                  {rep.category}
                </span>
                <span className="text-[10px] font-mono text-[#70665F]">{rep.id}</span>
              </div>
              <h3 className="text-sm font-bold text-[#211B17] leading-snug">{rep.title}</h3>
              <p className="text-xs text-[#70665F]">{rep.desc}</p>
            </div>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between">
              <div className="flex gap-2">
                <button title="Export Excel" className="p-1.5 bg-[#FAF7F2] hover:bg-[#FAF7F2] text-emerald-400 rounded-lg text-xs transition flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Excel
                </button>
                <button title="Export PDF" className="p-1.5 bg-[#FAF7F2] hover:bg-[#FAF7F2] text-rose-400 rounded-lg text-xs transition flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
              <Link
                href={rep.link}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1"
              >
                <span>View</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
