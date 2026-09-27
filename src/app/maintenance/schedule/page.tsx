'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Wrench,
  AlertTriangle,
  RotateCcw,
  PhoneCall,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

export default function MaintenanceSchedulePage() {
  const { serviceRequests, breakdowns, preventivePlans, serviceVisits, technicians } = useERP();

  const [activeView, setActiveView] = useState<'calendar' | 'weekly' | 'daily' | 'technician'>('calendar');
  const [preventDoubleBooking, setPreventDoubleBooking] = useState(true);

  // Combine all scheduled items into a unified calendar dataset
  const scheduledItems = [
    ...serviceRequests.map((sr) => ({
      id: sr.id,
      title: `${sr.customerName} - ${sr.complaintType}`,
      type: 'Service Request',
      date: sr.preferredVisitDate,
      technician: sr.assignedTechnicianName || 'Unassigned',
      priority: sr.priority,
      status: sr.status,
      icon: PhoneCall,
      color: 'bg-crm-brand-600/10 text-crm-brand-700 border-crm-brand-600/30',
    })),
    ...breakdowns.map((bd) => ({
      id: bd.id,
      title: `Emergency Breakdown: ${bd.assetName}`,
      type: 'Breakdown',
      date: bd.breakdownDate,
      technician: bd.assignedTechnicianName || 'Unassigned',
      priority: bd.severity,
      status: bd.status,
      icon: AlertTriangle,
      color: 'bg-red-500/10 text-red-600 border-red-500/30',
    })),
    ...preventivePlans.map((pm) => ({
      id: pm.id,
      title: `PM Plan: ${pm.assetName}`,
      type: 'Preventive Maintenance',
      date: pm.nextDueDate,
      technician: pm.responsibleTechnicianName,
      priority: 'Medium' as const,
      status: pm.status,
      icon: RotateCcw,
      color: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
    })),
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-crm-brand- dark:bg-crm-brand-/40 text-crm-brand-800 dark:text-crm-brand- font-mono text-xs font-bold">
              SCHEDULE & CALENDAR
            </span>
            <span className="text-xs text-[#70665F] font-semibold">Technician Allocation & Conflict Resolution</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-crm-brand-600" />
            Maintenance & Service Schedule
          </h1>
          <p className="text-xs text-[#70665F]">
            Calendar-based schedule for Service Requests, PM tasks, and Breakdown dispatching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-[#544B45] cursor-pointer bg-slate-100 dark:bg-[#FAF7F2] px-3 py-2 rounded-xl">
            <input
              type="checkbox"
              checked={preventDoubleBooking}
              onChange={(e) => setPreventDoubleBooking(e.target.checked)}
              className="rounded text-crm-brand-700 focus:ring-crm-brand-600"
            />
            <Shield className="w-4 h-4 text-crm-brand-600" />
            <span>Prevent Double-Booking Technicians</span>
          </label>
        </div>
      </div>

      {/* View Selector Tabs */}
      <div className="flex items-center justify-between bg-white dark:bg-white p-2 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-1">
          {[
            { id: 'calendar', label: 'Monthly Calendar' },
            { id: 'weekly', label: 'Weekly View' },
            { id: 'daily', label: 'Daily Timeline' },
            { id: 'technician', label: 'Technician Workload' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeView === tab.id
                  ? 'bg-crm-brand-700 text-white shadow-md shadow-crm-brand-700/30'
                  : 'text-slate-600 dark:text-[#70665F] hover:bg-slate-100 dark:hover:bg-[#FAF7F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#70665F] font-mono font-bold">
          <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-[#FAF7F2]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>September 2026</span>
          <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-[#FAF7F2]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid View */}
      {activeView === 'calendar' && (
        <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#70665F] uppercase border-b pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }).map((_, dayIdx) => {
              const dateStr = `2026-09-${String(dayIdx + 1).padStart(2, '0')}`;
              const itemsOnDate = scheduledItems.filter((item) => item.date === dateStr);

              return (
                <div
                  key={dayIdx}
                  className={`min-h-[110px] p-2 rounded-xl border ${
                    dayIdx + 1 === 24
                      ? 'bg-crm-brand-/50 dark:bg-crm-brand-/20 border-crm-brand- dark:border-crm-brand-'
                      : 'bg-slate-50/50 dark:bg-[#FAF7F2]/30 border-slate-200/70 dark:border-[#EBE3DB]'
                  } space-y-1.5`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-[#544B45]">{dayIdx + 1}</span>
                    {itemsOnDate.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-crm-brand-600 animate-pulse" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {itemsOnDate.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={i}
                          className={`p-1.5 rounded border text-[10px] ${item.color} leading-tight truncate`}
                          title={`${item.type}: ${item.title} (${item.technician})`}
                        >
                          <div className="font-bold truncate flex items-center gap-1">
                            <Icon className="w-3 h-3 flex-shrink-0" />
                            {item.title}
                          </div>
                          <div className="text-[9px] opacity-80 truncate">Tech: {item.technician}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technician Workload View */}
      {activeView === 'technician' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {technicians.map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17]">{t.employeeName}</h3>
                  <div className="text-xs text-[#70665F]">{t.designation}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                  {t.availability}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-700 dark:text-[#544B45]">Assigned Jobs & Visits:</div>
                {scheduledItems
                  .filter((item) => item.technician.includes(t.employeeName))
                  .map((item, i) => (
                    <div key={i} className={`p-2 rounded.lg border text-xs ${item.color} flex items-center justify-between`}>
                      <span className="font-medium truncate max-w-[200px]">{item.title}</span>
                      <span className="font-mono text-[10px] font-bold">{formatDate(item.date)}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
