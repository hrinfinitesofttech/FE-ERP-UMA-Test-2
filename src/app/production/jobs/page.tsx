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
  RotateCcw,
} from 'lucide-react';

export default function ManufacturingJobsPage() {
  const { manufacturingJobs, openJobModal } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const normalizeStatus = (s: string) => {
    if (!s) return '';
    return s.toLowerCase().replace(/[\s_-]+/g, '');
  };

  const filterTabs = [
    'All',
    'In Production',
    'Planning',
    'Material Pending',
    'QC Pending',
    'Completed',
  ];

  const getStatusCount = (filterName: string) => {
    if (filterName === 'All') return (manufacturingJobs || []).length;
    const targetNorm = normalizeStatus(filterName);
    return (manufacturingJobs || []).filter((j) => normalizeStatus(j.status) === targetNorm).length;
  };

  const filteredJobs = (manufacturingJobs || []).filter((job) => {
    const q = searchTerm?.trim()?.toLowerCase() || '';
    const matchesSearch =
      !q ||
      job.jobNumber?.toLowerCase().includes(q) ||
      job.customerName?.toLowerCase().includes(q) ||
      job.productName?.toLowerCase().includes(q) ||
      job.projectNumber?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'All' ||
      normalizeStatus(job.status) === normalizeStatus(statusFilter);

    return matchesSearch && matchesStatus;
  });

  const getBadgeStyle = (status: string) => {
    const norm = normalizeStatus(status);
    if (norm === 'inproduction') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (norm === 'completed') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (norm === 'materialpending') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (norm === 'qcpending') {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="p-6 space-y-6 text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Manufacturing Jobs Registry
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-800 font-semibold border border-sky-500/30">
                Core Traceability Anchor
              </span>
            </h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Customer Specific Machine Orders: Linked from CRM → Sales Order → Project → Job Number
            </p>
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#EBE3DB] shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search by Job #, Customer or Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {filterTabs.map((status) => {
            const count = getStatusCount(status);
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-[#FAF7F2] text-[#544B45] hover:bg-[#F2ECE4] border border-[#EBE3DB]'
                }`}
              >
                <span>{status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-[#70665F] border border-[#EBE3DB]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-[#EBE3DB] text-[#70665F] space-y-3 shadow-xs">
            <Briefcase className="w-10 h-10 text-[#A89F91] mx-auto" />
            <p className="font-semibold text-sm text-[#211B17]">
              No manufacturing jobs found for filter &quot;{statusFilter}&quot;
            </p>
            <p className="text-xs text-[#70665F]">
              Try choosing a different status filter or clearing your search term.
            </p>
            <button
              onClick={() => {
                setStatusFilter('All');
                setSearchTerm('');
              }}
              className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-xs font-bold text-[#211B17] hover:bg-sky-50 hover:text-sky-700 transition inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const badgeClass = getBadgeStyle(job.status);
            return (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-sky-500/60 transition space-y-4 shadow-md"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-700 text-base">{job.jobNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#544B45] font-mono text-[10px] border border-[#EBE3DB]">
                        {job.projectNumber || 'PRJ-2026-001'}
                      </span>
                    </div>
                    <div className="text-xs text-[#70665F] flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#70665F]" /> {job.customerName}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                    {job.status || 'Planning'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#211B17]">{job.productName}</div>
                  <div className="text-xs text-[#70665F] line-clamp-2">{job.specification || 'Custom Fabrication & Machining'}</div>
                </div>

                {/* Revisions & PO Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-xs">
                  <div>
                    <span className="text-[#70665F] block text-[10px]">Design Rev</span>
                    <span className="font-mono font-bold text-amber-700">{job.designRevision || 'REV-00'}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[10px]">BOM Rev</span>
                    <span className="font-mono font-bold text-emerald-700">{job.bomRevision || 'REV-00'}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[10px]">Customer PO</span>
                    <span className="font-mono text-[#211B17] font-semibold">{job.customerPoNumber || 'PO-2026-001'}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#70665F]">Production Progress</span>
                    <span className="text-sky-700 font-bold">{job.productionProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#EBE3DB]">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${job.productionProgress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-[#EBE3DB] flex justify-between items-center text-xs text-[#70665F]">
                  <div>Manager: <strong className="text-[#211B17]">{job.productionManager?.split(' ')[0] || 'Bhavin'}</strong></div>
                  <button
                    onClick={() => openJobModal(job.jobNumber)}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 font-bold border border-sky-200 hover:bg-sky-100 transition flex items-center gap-1.5"
                  >
                    Launch Job 360° View <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
