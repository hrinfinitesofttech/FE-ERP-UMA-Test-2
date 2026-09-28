'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { ServiceVisitStatus } from '../../../types/maintenance';
import {
  MapPin,
  Plus,
  Search,
  Clock,
  UserCheck,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Package,
  FileCheck2,
  Smartphone,
  X,
  Camera,
} from 'lucide-react';

export default function ServiceVisitsPage() {
  const { serviceVisits, addServiceVisit, updateServiceVisitStatus } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileSimulator, setMobileSimulator] = useState(false);

  const filteredVisits = serviceVisits.filter((v) =>

    !searchTerm?.trim() ||

    v.visitNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    v.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    v.machineName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    v.technicianName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-mono text-xs font-bold">
              FIELD SERVICE VISITS
            </span>
            <span className="text-xs text-[#70665F]">On-Site Service Execution & Time Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-500" />
            Service Visits Management
          </h1>
          <p className="text-xs text-[#70665F]">
            Track live service visits on customer sites, start/stop timers, record diagnosis, parts used & customer signatures.
          </p>
        </div>

        <button
          onClick={() => setMobileSimulator(!mobileSimulator)}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-md ${
            mobileSimulator
              ? 'bg-amber-600 text-white shadow-amber-600/30'
              : 'bg-white text-[#211B17] hover:bg-[#FAF7F2] dark:bg-[#FAF7F2] dark:hover:bg-[#FAF7F2]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          {mobileSimulator ? 'Close Mobile View' : 'Open Mobile Technician Interface'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search visit no, customer, machine or technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {mobileSimulator ? (
        /* Mobile Simulator Interface for Field Technicians */
        <div className="max-w-sm mx-auto bg-white rounded-[3rem] p-4 border-[6px] border-[#EBE3DB] shadow-2xl space-y-4 text-[#211B17]">
          <div className="w-20 h-4 bg-[#FAF7F2] rounded-full mx-auto mb-2" />
          <div className="flex items-center justify-between px-2">
            <div className="font-extrabold text-sm flex items-center gap-1.5 text-amber-400">
              <Smartphone className="w-4 h-4" />
              UMA TECHNO SERVICE APP
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
              ONLINE
            </span>
          </div>

          <div className="space-y-3">
            {serviceVisits.map((v) => (
              <div key={v.id} className="bg-[#FAF7F2] p-4 rounded-2xl space-y-3 border border-[#EBE3DB]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- font-mono font-bold text-[10px]">
                      {v.visitNumber}
                    </span>
                    <h4 className="font-bold text-xs mt-1 text-[#211B17]">{v.customerName}</h4>
                    <p className="text-[10px] text-[#70665F]">{v.machineName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                    {v.status}
                  </span>
                </div>

                <div className="text-[11px] bg-[#FAF7F2] p-2.5 rounded-xl space-y-1">
                  <div className="text-[#544B45] font-medium">Problem: {v.problem}</div>
                  <div className="text-[#70665F]">Diagnosis: {v.diagnosis}</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => updateServiceVisitStatus(v.id, 'Started')}
                    className="px-3 py-1.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[11px] font-bold flex items-center gap-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Start Visit
                  </button>
                  <button
                    onClick={() => updateServiceVisitStatus(v.id, 'Completed')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Finish & Sign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Desktop View */
        <div className="space-y-4">
          {filteredVisits.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-orange-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#EBE3DB] pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-orange-600 text-[#211B17] font-mono font-bold text-xs">
                    {v.visitNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17]">{v.customerName}</h3>
                    <p className="text-xs text-[#70665F]">
                      {v.machineName} (SN: {v.serialNumber}) • SR Ref: {v.requestNumber}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold ${
                    v.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : v.status === 'Started'
                      ? 'bg-crm-brand-600/10 text-crm-brand-700 border border-crm-brand-600/20 animate-pulse'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[#70665F] font-medium">Diagnosis & Work Performed</span>
                  <div className="font-semibold text-slate-800 dark:text-[#544B45]">{v.diagnosis}</div>
                  <div className="text-slate-600 dark:text-[#70665F]">{v.workPerformed}</div>
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-[#FAF7F2]/40 p-2.5 rounded-xl border border-slate-100 dark:border-[#EBE3DB]">
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Technician:</span>
                    <span className="font-bold text-slate-800 dark:text-[#544B45]">{v.technicianName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Visit Date:</span>
                    <span className="font-medium text-slate-800 dark:text-[#544B45]">{formatDate(v.visitDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Timings:</span>
                    <span className="font-medium text-slate-800 dark:text-[#544B45]">{v.startTime} - {v.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Labour Hours:</span>
                    <span className="font-bold text-slate-900 dark:text-[#544B45]">{v.labourHours} Hours</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[#70665F] font-medium">Customer Sign-off & Remarks</span>
                  <div className="p-2.5 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl italic text-slate-700 dark:text-[#544B45]">
                    &quot;{v.customerRemarks}&quot;
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Customer Digital Signature Verified
                  </div>
                </div>
              </div>

              {v.partsUsed.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-[#EBE3DB]">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-[#70665F] uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Package className="w-3.5 h-3.5 text-emerald-500" />
                    Spare Parts Issued & Installed ({v.partsUsed.length})
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {v.partsUsed.map((p, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] font-mono text-xs">
                        {p.itemName} x{p.quantity} ({formatCurrency(p.unitCost * p.quantity)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
