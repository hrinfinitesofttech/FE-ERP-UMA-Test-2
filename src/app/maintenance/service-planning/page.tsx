'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ServicePlanningItem } from '../../../types/maintenance';
import {
  Workflow,
  Search,
  UserCheck,
  MapPin,
  Clock,
  Package,
  Car,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function ServicePlanningPage() {
  const { servicePlanningItems, serviceRequests, technicians } = useERP();

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-mono text-xs font-bold">
              SERVICE PLANNING & DISPATCH
            </span>
            <span className="text-xs text-[#70665F]">Resource, Skill & Travel Logistics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-sky-500" />
            Service Planning & Dispatch Desk
          </h1>
          <p className="text-xs text-[#70665F]">
            Match technician skills, spare parts availability, travel vehicles, and expected visit duration for every service request.
          </p>
        </div>
      </div>

      {/* Planning Kanban Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servicePlanningItems.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-sky-300 transition"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-[#EBE3DB] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs">
                  {item.requestNumber}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1">{item.customerName}</h3>
                <p className="text-xs text-[#70665F]">{item.machineName}</p>
              </div>

              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600">
                {item.serviceType}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl">
                <span className="text-[#70665F] text-[10px] block">Problem Reported:</span>
                <span className="font-semibold text-slate-800 dark:text-[#544B45]">{item.problem}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#70665F] text-[10px] block">Required Skills</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {item.requiredSkills.map((sk, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#FAF7F2] text-[10px] font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#70665F] text-[10px] block">Required Spare Parts</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {item.requiredParts.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-[10px]">
                        {p.itemName} (x{p.qty})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t text-[11px] text-slate-600 dark:text-[#70665F]">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#70665F]" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#70665F]" />
                  <span>Est: {item.expectedDurationHours} Hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-[#70665F]" />
                  <span>Vehicle: {item.vehicleRequired ? 'Required' : 'Not Needed'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#EBE3DB]">
              <span className="text-xs font-semibold text-crm-brand-700 dark:text-crm-brand-500 flex items-center gap-1">
                <UserCheck className="w-4 h-4" />
                Assigned: {item.assignedTechnicianName}
              </span>
              <button className="px-3 py-1.5 rounded-lg bg-sky-600 text-[#211B17] text-xs font-semibold hover:bg-sky-500">
                Update Dispatch Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
