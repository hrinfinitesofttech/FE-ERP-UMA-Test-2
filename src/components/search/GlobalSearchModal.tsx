'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import { Search, X, Briefcase, FileText, Building, ArrowRight, CornerDownLeft } from 'lucide-react';
import { StatusBadge } from '../workflow/StatusBadge';
import { formatCurrency } from '../../lib/utils';

export function GlobalSearchModal() {
  const { isSearchOpen, setIsSearchOpen, jobs, openJobModal, setActiveDepartment } = useERP();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredJobs = jobs.filter(
    (j) =>
      j.jobNumber?.toLowerCase().includes(query?.toLowerCase()) ||
      j.customerName?.toLowerCase().includes(query?.toLowerCase()) ||
      j.productName?.toLowerCase().includes(query?.toLowerCase()) ||
      j.quotationId?.toLowerCase().includes(query?.toLowerCase()) ||
      j.customerPoNumber?.toLowerCase().includes(query?.toLowerCase()) ||
      j.salesOrderId?.toLowerCase().includes(query?.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-[#211B17]/45 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-[#E7DED5] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Search Bar Input */}
        <div className="flex items-center px-5 py-4 border-b border-[#E7DED5] gap-3 bg-[#FAF7F2]">
          <Search className="w-5 h-5 text-[#75401F] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Job # (e.g. JOB-2026-001), Customer, Quotation, PO, Product..."
            className="w-full text-sm bg-transparent text-[#211B17] placeholder:text-[#8D827A] focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-lg text-[#8D827A] hover:text-[#211B17] hover:bg-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#EFE8DE] text-xs">
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-[#8D827A]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredJobs.map((job) => (
              <button
                key={job.jobNumber}
                onClick={() => {
                  setIsSearchOpen(false);
                  openJobModal(job.jobNumber);
                }}
                className="w-full text-left p-3.5 rounded-2xl hover:bg-[#FAF7F2] flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0E91B2] text-xs">
                      {job.jobNumber}
                    </span>
                    <StatusBadge status={job.currentStatus} />
                    <span className="text-[#8D827A] font-mono text-[11px]">{job.customerPoNumber}</span>
                  </div>
                  <div className="font-bold text-[#211B17]">{job.productName}</div>
                  <div className="flex items-center gap-2 text-[#70665F] text-[11px]">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-[#8D827A]" /> {job.customerName}
                    </span>
                    <span>•</span>
                    <span className="font-bold font-mono text-[#169B62]">{formatCurrency(job.orderValue)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#8D827A] group-hover:text-[#75401F] transition-colors">
                  <span className="text-[10px] hidden sm:inline font-semibold">View 360°</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Modal Footer Keybind Info */}
        <div className="px-5 py-2.5 bg-[#FAF7F2] border-t border-[#E7DED5] text-[11px] text-[#70665F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-2 py-0.5 rounded-md bg-white border border-[#E7DED5] font-mono text-[10px] font-bold shadow-xs">Esc</kbd> to close
            </span>
            <span>
              <kbd className="px-2 py-0.5 rounded-md bg-white border border-[#E7DED5] font-mono text-[10px] font-bold shadow-xs">Ctrl</kbd> +{' '}
              <kbd className="px-2 py-0.5 rounded-md bg-white border border-[#E7DED5] font-mono text-[10px] font-bold shadow-xs">K</kbd> to search anytime
            </span>
          </div>
          <span className="font-semibold text-[#70665F]">Uma Techno Fab Search Engine</span>
        </div>
      </div>
    </div>
  );
}
