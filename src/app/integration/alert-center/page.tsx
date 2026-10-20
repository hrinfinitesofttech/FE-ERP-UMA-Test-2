'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter,
  Briefcase,
  Layers,
  Wrench,
  Package,
  Building,
  Factory,
  Receipt,
  Users,
  ShieldCheck,
} from 'lucide-react';

export default function AlertCenterPage() {
  const { centralAlerts, dismissCentralAlert } = useERP();
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const modules = ['all', 'CRM', 'Project', 'Design', 'Purchase', 'Store', 'Production', 'Accounts', 'HR', 'Maintenance'];

  const filteredAlerts = centralAlerts.filter((alt) => selectedModule === 'all' || alt.module === selectedModule);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#544B45] font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Central ERP Action & Alert Center</h1>
              <p className="text-xs text-[#70665F] font-medium mt-0.5">
                Real-Time Exception Monitoring, Bottleneck Detection & Operational Notifications
              </p>
            </div>
          </div>
        </div>

        {/* Module Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin max-w-full">
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModule(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                selectedModule === m ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' : 'bg-[#FAF7F2] text-[#70665F] hover:text-white border border-[#EBE3DB]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Count Bar */}
      <div className="flex items-center justify-between p-4 bg-white border border-[#EBE3DB] rounded-xl text-xs">
        <span className="text-[#544B45] font-medium">
          Showing <strong className="text-amber-400">{filteredAlerts.length}</strong> active alerts across {selectedModule === 'all' ? 'all ERP departments' : `${selectedModule} module`}.
        </span>
        <span className="text-[10px] text-[#70665F] font-mono">Auto-refreshed live</span>
      </div>

      {/* Alert Items List */}
      <div className="space-y-3">
        {filteredAlerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${
              alt.severity === 'Critical'
                ? 'bg-rose-50/80 border-rose-200 hover:border-rose-300'
                : alt.severity === 'Warning'
                ? 'bg-amber-50/80 border-amber-200 hover:border-amber-300'
                : 'bg-white border-[#E7DED5] hover:border-[#D5C7B8]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl border flex-shrink-0 mt-0.5 ${
                  alt.severity === 'Critical'
                    ? 'bg-rose-100 border-rose-200 text-rose-600'
                    : alt.severity === 'Warning'
                    ? 'bg-amber-100 border-amber-200 text-amber-700'
                    : 'bg-crm-brand-50 border-crm-brand-200 text-crm-brand-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white text-crm-brand-700 border border-[#E7DED5]">
                    {alt.module}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alt.severity === 'Critical' 
                        ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {alt.severity} Priority
                  </span>
                  <span className="text-[10px] font-mono text-[#70665F]">{alt.timestamp}</span>
                </div>
                <h3 className="text-sm font-bold text-[#211B17]">{alt.title}</h3>
                <p className="text-xs text-[#544B45]">{alt.description}</p>
                <div className="text-[11px] text-amber-800 font-semibold pt-1">
                  Required Action: <span className="underline">{alt.actionRequired}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => dismissCentralAlert(alt.id)}
                className="px-3 py-1.5 text-xs text-[#70665F] hover:text-[#544B45] hover:bg-[#FAF7F2] rounded-lg transition"
              >
                Dismiss
              </button>
              <Link
                href={alt.targetUrl}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <span>Take Action</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
