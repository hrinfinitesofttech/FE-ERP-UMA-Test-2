'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate, formatCurrency } from '../../../lib/utils';
import {
  History,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Building,
  Truck,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  FileCheck2,
  Receipt,
  FileCheck,
  RotateCcw,
} from 'lucide-react';

export default function CustomerServiceHistoryPage() {
  const { customerMachines, openJobModal } = useERP();

  const [selectedSerial, setSelectedSerial] = useState<string>(customerMachines[0]?.serialNumber || '');

  const selectedMachine = customerMachines.find((m) => m.serialNumber === selectedSerial) || customerMachines[0];

  // Full permanent traceability timeline steps for selected serial number
  const timelineSteps = [
    { stage: 'Manufacturing Job Order', date: selectedMachine?.manufacturingDate || '', detail: `Job Order #${selectedMachine?.jobNumber || '—'} completed`, icon: Layers, color: 'text-crm-brand-600 bg-crm-brand- border-crm-brand-' },
    { stage: 'Dispatch & Transport', date: selectedMachine?.installationDate || '', detail: `Dispatched under Challan #${selectedMachine?.dispatchNumber || '—'}`, icon: Truck, color: 'text-crm-brand-600 bg-indigo-50 border-indigo-200' },
    { stage: 'Installation & Commissioning', date: selectedMachine?.commissioningDate || '', detail: `Commissioned on site. Certificate #${selectedMachine?.installationNumber || '—'} signed`, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { stage: 'Warranty Commencement', date: selectedMachine?.warrantyStart || '', detail: `Standard Warranty active until ${selectedMachine?.warrantyEnd ? formatDate(selectedMachine.warrantyEnd) : '—'}`, icon: ShieldCheck, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { stage: 'Annual Maintenance Contract (AMC)', date: selectedMachine?.amcStart || '', detail: `AMC Contract coverage for machine`, icon: FileCheck, color: 'text-teal-500 bg-teal-50 border-teal-200' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold">
              360° LIFECYCLE TRACEABILITY
            </span>
            <span className="text-xs text-[#70665F]">Permanent Traceability by Machine Serial Number</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <History className="w-6 h-6 text-teal-500" />
            Customer Machine Service History Timeline
          </h1>
          <p className="text-xs text-[#70665F]">
            Complete lifecycle audit trail: Job -&gt; Dispatch -&gt; Installation -&gt; Warranty -&gt; Service -&gt; Parts -&gt; AMC -&gt; PM.
          </p>
        </div>
      </div>

      {/* Select Machine Dropdown */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-600 dark:text-[#70665F]">Select Customer Machine Serial Number:</span>
          <select
            value={selectedSerial}
            onChange={(e) => setSelectedSerial(e.target.value)}
            className="px-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-xl font-mono font-bold text-crm-brand-700 focus:outline-none"
          >
            {customerMachines.map((m) => (
              <option key={m.id} value={m.serialNumber}>
                {m.serialNumber} - {m.machineName} ({m.customerName})
              </option>
            ))}
          </select>
        </div>

        {selectedMachine && selectedMachine.jobNumber && (
          <button
            onClick={() => openJobModal(selectedMachine.jobNumber!)}
            className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow"
          >
            <Layers className="w-4 h-4" /> View Full Job 360° Modal
          </button>
        )}
      </div>

      {/* Selected Machine Header Box */}
      {selectedMachine && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-[#211B17] p-6 rounded-2xl border border-[#EBE3DB] shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#70665F] font-mono text-[10px] block">Machine Serial Number</span>
            <div className="text-lg font-black text-amber-400 font-mono">{selectedMachine.serialNumber}</div>
            <div className="font-bold text-[#544B45] mt-1">{selectedMachine.machineName}</div>
          </div>
          <div>
            <span className="text-[#70665F] text-[10px] block">Customer & Site Location</span>
            <div className="font-bold text-[#211B17] text-sm">{selectedMachine.customerName}</div>
            <div className="text-[#544B45]">{selectedMachine.machineLocation}</div>
          </div>
          <div>
            <span className="text-[#70665F] text-[10px] block">Manufacturing Job & PO</span>
            <div className="font-mono text-crm-brand- font-bold">Job: {selectedMachine.jobNumber || 'N/A'}</div>
            <div className="text-[#544B45] font-mono">PO: {selectedMachine.customerPo || 'N/A'}</div>
          </div>
          <div>
            <span className="text-[#70665F] text-[10px] block">Current Status</span>
            <span className="inline-block mt-1 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {selectedMachine.status}
            </span>
          </div>
        </div>
      )}

      {/* Permanent Timeline Stepper */}
      <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-teal-500" />
          Permanent Lifecycle Timeline Trail
        </h3>

        <div className="relative border-l-2 border-slate-200 dark:border-[#EBE3DB] ml-4 space-y-8 pl-6">
          {timelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative group">
                <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border flex items-center justify-center ${step.color} shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-[#211B17]">{step.stage}</h4>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#FAF7F2] text-[10px] font-mono text-[#70665F] font-bold">
                      {formatDate(step.date)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#70665F]">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
