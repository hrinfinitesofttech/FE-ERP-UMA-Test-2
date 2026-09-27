'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function MaintenanceReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const reportsList = [
    { id: 'RPT-MNT-01', title: 'Service Request Report', category: 'Customer Service', description: 'Comprehensive log of service requests by origin, status & customer', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-02', title: 'Breakdown Report', category: 'Internal & Field', description: 'MTTR, MTBF, breakdown frequency and root cause analysis', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-03', title: 'Preventive Maintenance Report', category: 'Internal & Field', description: 'PM execution rates, overdue checkups & checklist compliance', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-04', title: 'Technician Performance Report', category: 'HR & Service', description: 'Technician visit counts, MTTR resolution efficiency & customer ratings', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-05', title: 'Customer Service Report', category: 'Customer Service', description: 'Customer-wise service history, open tickets and CSAT metrics', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-06', title: 'Machine Service History', category: 'Traceability', description: 'Machine serial number permanent timeline audit trail', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-07', title: 'Spare Parts Consumption', category: 'Inventory & Store', description: 'Service parts issued from store, return rates & value spent', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-08', title: 'Warranty Report', category: 'Contracts & Legal', description: 'Active machine warranties, expiration dates & warranty claim costs', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-09', title: 'AMC Report', category: 'Contracts & Commercial', description: 'Active AMC contract performance, completed visits vs SLA terms', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-10', title: 'AMC Expiry Alert Report', category: 'Contracts & Commercial', description: 'Contracts expiring within 30-90 days for renewal follow-up', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-11', title: 'Service Revenue Report', category: 'Commercial & Invoicing', description: 'Billed service charges, parts revenue & labour invoicing ledger', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-12', title: 'Service Cost Report', category: 'Commercial & Costing', description: 'Estimated vs actual service costs across parts, labour & travel', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-13', title: 'Downtime Report', category: 'Production Impact', description: 'Machine stoppage hours categorized by breakdown, maintenance & shopfloor reasons', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-14', title: 'Machine-wise Maintenance Cost', category: 'Asset Costing', description: 'Total cumulative maintenance expenditure per machine asset code', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-15', title: 'Customer-wise Service Report', category: 'Customer Service', description: 'Consolidated service visits and contracts for each customer account', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-16', title: 'Open Service Ticket Report', category: 'Operations', description: 'Live unresolved service requests requiring supervisor escalation', format: 'Excel / PDF / CSV' },
    { id: 'RPT-MNT-17', title: 'Overdue Maintenance Report', category: 'Operations', description: 'Preventive maintenance checkups delayed past scheduled due date', format: 'Excel / PDF / CSV' },
  ];

  const filteredReports = reportsList.filter((r) => {
    const matchesSearch =
      r.title?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDownload = (reportTitle: string, format: string) => {
    setDownloadMsg(`Generating and exporting ${reportTitle} in ${format} format...`);
    setTimeout(() => setDownloadMsg(null), 3500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 font-mono text-xs font-bold">
              17 EXPORTABLE REPORTS
            </span>
            <span className="text-xs text-[#70665F]">PDF, Excel & CSV Export Engines</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-yellow-500" />
            Maintenance & Service Reports Suite
          </h1>
          <p className="text-xs text-[#70665F]">
            Generate and download 17 standardized analytical reports for maintenance costs, downtime, technician performance, warranty &amp; AMC.
          </p>
        </div>
      </div>

      {downloadMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {downloadMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search report title, ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#70665F]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          >
            <option value="all">All Report Categories</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Internal & Field">Internal & Field</option>
            <option value="HR & Service">HR & Service</option>
            <option value="Traceability">Traceability</option>
            <option value="Inventory & Store">Inventory & Store</option>
            <option value="Contracts & Commercial">Contracts & Commercial</option>
            <option value="Production Impact">Production Impact</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-3 hover:border-yellow-300 transition"
          >
            <div className="flex items-start justify-between gap-2 border-b pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#FAF7F2] text-slate-800 dark:text-[#544B45] font-mono font-bold text-[10px]">
                  {r.id}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1">{r.title}</h3>
                <span className="text-[10px] text-amber-500 font-semibold">{r.category}</span>
              </div>
            </div>

            <p className="text-xs text-[#70665F] min-h-[36px]">{r.description}</p>

            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <span className="text-[10px] text-[#70665F] font-mono">{r.format}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownload(r.title, 'Excel')}
                  className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold hover:underline"
                >
                  Excel
                </button>
                <button
                  onClick={() => handleDownload(r.title, 'PDF')}
                  className="px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[11px] font-bold hover:underline"
                >
                  PDF
                </button>
                <button
                  onClick={() => handleDownload(r.title, 'CSV')}
                  className="px-2.5 py-1 rounded bg-crm-brand- dark:bg-crm-brand-/40 text-crm-brand-700 dark:text-crm-brand-500 text-[11px] font-bold hover:underline"
                >
                  CSV
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
