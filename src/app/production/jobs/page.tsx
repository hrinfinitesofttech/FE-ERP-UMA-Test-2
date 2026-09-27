'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function ManufacturingJobsPage() {
  const { manufacturingJobs, openJobModal } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredJobs = manufacturingJobs.filter((job) => {
    const matchesSearch =
      job.jobNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      job.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      job.productName?.toLowerCase().includes(searchTerm?.toLowerCase());

    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Manufacturing Jobs Registry
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30">
                Core Traceability Anchor
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Customer Specific Machine Orders: Linked from CRM → Sales Order → Project → Job Number
            </p>
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search by Job #, Customer or Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#544B45] focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'In Production', 'Planning', 'Material Pending', 'QC Pending', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === status
                  ? 'bg-sky-600 text-[#211B17] shadow'
                  : 'bg-[#FAF7F2] text-[#544B45] hover:bg-[#FAF7F2] border border-[#EBE3DB]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-sky-500/50 transition space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-400 text-base">{job.jobNumber}</span>
                  <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#544B45] font-mono text-[10px]">
                    {job.projectNumber}
                  </span>
                </div>
                <div className="text-xs text-[#70665F] flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-[#70665F]" /> {job.customerName}
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  job.status === 'In Production'
                    ? 'bg-crm-brand-600/20 text-crm-brand- border-crm-brand-600/30'
                    : job.status === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : job.status === 'Material Pending'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {job.status}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-[#211B17]">{job.productName}</div>
              <div className="text-xs text-[#70665F] line-clamp-2">{job.specification}</div>
            </div>

            {/* Revisions & PO Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EBE3DB] text-xs">
              <div>
                <span className="text-[#70665F] block text-[10px]">Design Rev</span>
                <span className="font-mono font-bold text-amber-300">{job.designRevision}</span>
              </div>
              <div>
                <span className="text-[#70665F] block text-[10px]">BOM Rev</span>
                <span className="font-mono font-bold text-emerald-300">{job.bomRevision}</span>
              </div>
              <div>
                <span className="text-[#70665F] block text-[10px]">Customer PO</span>
                <span className="font-mono text-[#544B45]">{job.customerPoNumber}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#70665F]">Production Progress</span>
                <span className="text-sky-400 font-bold">{job.productionProgress}%</span>
              </div>
              <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#EBE3DB]">
                <div
                  className="bg-gradient-to-r from-sky-500 to-crm-brand-700 h-full rounded-full transition-all duration-500"
                  style={{ width: `${job.productionProgress}%` }}
                />
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-2 border-t border-[#EBE3DB] flex justify-between items-center text-xs text-[#70665F]">
              <div>Manager: {job.productionManager.split(' ')[0]}</div>
              <button
                onClick={() => openJobModal(job.jobNumber)}
                className="px-3 py-1.5 rounded-lg bg-sky-600/20 text-sky-300 font-bold border border-sky-500/30 hover:bg-sky-600/30 transition flex items-center gap-1.5"
              >
                Launch Job 360° View <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
