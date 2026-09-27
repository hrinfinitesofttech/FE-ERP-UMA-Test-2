'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  BookOpen,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Star,
  Sparkles,
  Layers,
  Award,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function ReleaseNotesPage() {
  const { goLiveChecklist, toggleGoLiveItem } = useERP();

  const [goLiveModalOpen, setGoLiveModalOpen] = useState<boolean>(false);
  const [goLiveSuccess, setGoLiveSuccess] = useState<boolean>(false);

  const passedCount = goLiveChecklist.filter((g) => g.status === 'Pass').length;
  const totalCount = goLiveChecklist.length;
  const isReadyForGoLive = passedCount === totalCount;

  const moduleReleases = [
    { module: 'Module 1: ERP Foundation & Access Control', version: 'v1.0.0', items: ['Company Master & Financial Year settings', '9 Core Manufacturing Departments', '12 RBAC Roles & 40+ Permission Scopes', 'Audit Trail Logging & Central Notifications'] },
    { module: 'Module 2: CRM & Sales Management', version: 'v1.0.0', items: ['Lead & Enquiry tracking with Duplicate GST validation', 'Quotation Builder with Discount Approval threshold', 'Customer PO to Sales Order conversion'] },
    { module: 'Module 3: Project & Job Master', version: 'v1.0.0', items: ['Auto Job Code generation (JOB-2026-XXX)', 'Project Planning Stages & Milestones', 'Gantt Chart & Cost Center allocation'] },
    { module: 'Module 4: Design & Engineering', version: 'v1.0.0', items: ['CAD Drawing revision control (2D/3D Assembly)', 'BOM Header & Part List release to MRP', 'Design review checklist & engineering approval workflow'] },
    { module: 'Module 5: Purchase Management', version: 'v1.0.0', items: ['Material Requirement Planning (MRP) integration', 'Supplier RFQ & Quotation Comparison Matrix', 'Purchase Order approval thresholds & Follow-up tracking'] },
    { module: 'Module 6: Store & Warehouse Management', version: 'v1.0.0', items: ['Multi-Warehouse & Rack/Bin location master', 'Goods Receipt Note (GRN) & QC Inspection approval', 'Material Reservation & Issue deduction against Work Orders'] },
    { module: 'Module 7: Production / MRP', version: 'v1.0.0', items: ['Work Order scheduling & Routing operations', 'Work Center Capacity & Progress logging (Plasma, CNC, Bending, Welding)', 'Scrap & Inspection entry'] },
    { module: 'Module 8: Accounting & Finance', version: 'v1.0.0', items: ['Chart of Accounts & General Journal Vouchers', 'Sales Invoicing & Customer Accounts Receivable (AR)', 'Vendor Payment Vouchers & Accounts Payable (AP)', 'GST Compliance (GSTR-1, GSTR-3B) & Profit & Loss Statement'] },
    { module: 'Module 9: HR & Payroll', version: 'v1.0.0', items: ['Employee Master, Onboarding & Exit Settlements', 'Shift Roster & Biometric Attendance with Regularization', 'Monthly Payroll Engine with PF/ESI/PT & Loss-of-Pay deduction'] },
    { module: 'Module 10: Maintenance & Services', version: 'v1.0.0', items: ['Internal Machine Asset & Preventive Maintenance Plans', 'Breakdown Service Work Orders & Part Issue', 'Customer Machine Warranty & AMC Contracts'] },
    { module: 'Module 11: ERP Integration & Go-Live', version: 'v1.0.0', items: ['Job 360° Traceability across 13 tabs', 'Role & Scope Matrix Audit Tool', 'One-Click Disaster Backup & Recovery Snapshots', 'Legacy Data Import Wizard'] },
  ];

  const handleDeclareGoLive = () => {
    setGoLiveSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-[#EBE3DB] p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-crm-brand-600/10 border border-crm-brand-600/20 rounded-xl text-crm-brand-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#211B17] tracking-wide">
                  Release Management & Production Go-Live
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  v1.0.0-GOLD-PROD
                </span>
              </div>
              <p className="text-xs text-[#70665F]">
                Uma Techno Fab Manufacturing ERP — Full System Release Verification & Acceptability Matrix
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setGoLiveModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-crm-brand-700 to-crm-brand-700 hover:from-crm-brand-600 hover:to-crm-brand-600 text-[#211B17] rounded-xl text-xs font-bold transition shadow-lg shadow-crm-brand-700/20"
        >
          <Rocket className="w-4 h-4" />
          Production Go-Live Gatekeeper Sign-Off ({passedCount}/{totalCount})
        </button>
      </div>

      {/* Go-Live Banner Status */}
      {goLiveSuccess ? (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 p-6 rounded-2xl shadow-2xl space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-emerald-400 tracking-wider">
            🎉 UMA TECHNO FAB MANUFACTURING ERP IS LIVE IN PRODUCTION! 🎉
          </h2>
          <p className="text-xs text-[#544B45] max-w-2xl mx-auto">
            All 11 Core Modules have been audited, validated, verified and approved. The system is 100% operational for daily business transactions, job tracking, and financial ledgers.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#EBE3DB] p-5 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#211B17]">Go-Live Acceptance Criteria Readiness</div>
              <div className="text-[11px] text-[#70665F]">
                {passedCount} of {totalCount} verification gates approved. {isReadyForGoLive ? 'System is 100% ready for Go-Live!' : 'Complete remaining checks below.'}
              </div>
            </div>
          </div>

          <div className="w-48 bg-[#FAF7F2] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 transition-all duration-300 rounded-full"
              style={{ width: `${(passedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Release Notes Documentation for all 11 Modules */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-[#211B17] border-b border-[#EBE3DB] pb-3">
          <Sparkles className="w-4 h-4 text-crm-brand-500" />
          Complete ERP Version Release Specifications (Modules 1 to 11)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moduleReleases.map((rel, idx) => (
            <div key={idx} className="bg-[#FAF7F2] border border-[#EBE3DB] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#211B17]">{rel.module}</span>
                <span className="text-[10px] font-mono text-crm-brand-500 bg-crm-brand-600/10 px-2 py-0.5 rounded border border-crm-brand-600/20">
                  {rel.version}
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-[#70665F]">
                {rel.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Go Live Gatekeeper Modal */}
      {goLiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="font-bold text-[#211B17] text-sm flex items-center gap-2">
                <Rocket className="w-4 h-4 text-crm-brand-500" />
                Production Go-Live Gatekeeper Sign-Off Checklist
              </div>
              <button onClick={() => setGoLiveModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {goLiveChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleGoLiveItem(item.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] hover:border-[#EBE3DB] cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className={cn(
                        'w-5 h-5 flex-shrink-0 transition',
                        item.status === 'Pass' ? 'text-emerald-400' : 'text-slate-600'
                      )}
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#211B17]">{item.criteria}</div>
                      <div className="text-[10px] text-[#70665F]">Module: {item.module} | Verified By: {item.verifiedBy}</div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded text-[10px] font-bold',
                      item.status === 'Pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-[#FAF7F2] text-[#70665F]'
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-[#EBE3DB] pt-4">
              <div className="text-xs text-[#70665F]">
                {passedCount} / {totalCount} Criteria Approved
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGoLiveModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#FAF7F2] text-[#544B45] rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDeclareGoLive();
                    setGoLiveModalOpen(false);
                  }}
                  disabled={!isReadyForGoLive}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  Declare Production Go-Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
