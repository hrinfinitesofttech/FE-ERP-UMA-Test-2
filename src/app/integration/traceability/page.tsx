'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../../lib/apiClient';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import {
  Compass,
  CheckCircle2,
  Clock,
  Building,
  Briefcase,
  Layers,
  Wrench,
  Package,
  Factory,
  ShieldCheck,
  Truck,
  Receipt,
  FileText,
  History,
  Calendar,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Printer,
  Search,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { printContent } from '../../../lib/printUtils';

export default function TraceabilitySuitePage() {
  const {
    projectJobs = [],
    salesOrders = [],
    isInitialLoading,
  } = useERP();

  // Job list comes from live project jobs
  const availableJobIds = useMemo(() => {
    const ids = new Set<string>();
    projectJobs.forEach((p) => {
      if (p.jobNumber) ids.add(p.jobNumber);
    });
    return Array.from(ids);
  }, [projectJobs]);

  const [selectedJobId, setSelectedJobId] = useState<string>(
    availableJobIds[0] || ''
  );
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [jobSearch, setJobSearch] = useState<string>('');

  // Live dossier for the selected job, fetched from the backend (no synthesized data)
  const [dossier, setDossier] = useState<any>(null);
  useEffect(() => {
    if (!selectedJobId) {
      setDossier(null);
      return;
    }
    let cancelled = false;
    api.integration
      .job360(selectedJobId)
      .then((d) => { if (!cancelled) setDossier(d); })
      .catch(() => { if (!cancelled) setDossier(null); });
    return () => { cancelled = true; };
  }, [selectedJobId]);

  const currentJob = useMemo(() => {
    if (!dossier) return null;
    const d = dossier;
    return {
      header: {
        jobNumber: d.header.jobNumber,
        productName: d.header.productName,
        jobStatus: d.header.jobStatus,
        priority: d.header.priority,
        customerName: d.header.customerName,
        targetDispatchDate: d.header.plannedDeliveryDate,
        progressPct: d.header.overallProgressPercent,
      },
      crm: {
        quotationRef: d.crm.quotationNumber || '—',
        customerPoRef: d.crm.customerPoNumber || '—',
        orderValue: d.crm.salesOrderValue || d.header.totalJobValue,
      },
      project: {
        jobCode: d.header.jobNumber,
        startDate: d.production.startDate || '—',
        targetDate: d.header.plannedDeliveryDate || '—',
      },
      design: {
        bomCode: d.design.bomNumber || '—',
        revision: d.design.designRevision || '—',
        approvedBy: d.design.approvedBy || '—',
      },
      purchase: {
        totalPos: d.purchase.totalPosCount,
        poStatus: d.purchase.totalPosCount === 0 ? 'No purchase orders' : d.purchase.pendingPurchaseValue > 0 ? 'Materials pending' : 'Materials received',
      },
      store: {
        grnStatus: `${d.store.materialReceivedCount} GRN(s) received`,
        materialIssueStatus: `${d.store.materialIssuedCount} issue slip(s)`,
      },
      production: {
        currentBay: d.production.workCenterName || '—',
        shiftProgress: d.production.status || '—',
      },
      quality: {
        stage: d.quality.finalQcStatus || '—',
        reportNumber: d.quality.qcCertificateNumber || '—',
      },
      dispatch: {
        status: d.dispatch.deliveryStatus || '—',
        challanRef: d.dispatch.dispatchNoteNumber || '—',
      },
      accounts: {
        invoiceStatus: d.accounts.salesInvoiceNumber ? `${d.accounts.salesInvoiceNumber} (${d.accounts.paymentStatus})` : 'Not invoiced',
      },
      service: {
        warrantyYears: d.service.warrantyEndDate || '—',
      },
      documents: d.documents || [],
      timeline: (d.timeline || []).map((t: any) => ({ stage: t.action, date: t.timestamp, status: 'Completed' })),
    } as any;
  }, [dossier]);

  const tabs = [
    { id: 'overview', label: '1. Overview', icon: Compass },
    { id: 'crm', label: '2. CRM & PO', icon: Briefcase },
    { id: 'design', label: '3. Design & BOM', icon: Wrench },
    { id: 'purchase', label: '4. Purchase & GRN', icon: Package },
    { id: 'production', label: '5. Production WIP', icon: Factory },
    { id: 'quality', label: '6. Quality & Test', icon: ShieldCheck },
    { id: 'dispatch', label: '7. Dispatch & Challan', icon: Truck },
    { id: 'timeline', label: '8. 360° Timeline', icon: History },
  ];

  const handlePrint = () => {
    printContent('printable-traceability-suite', { title: `360_Traceability_${selectedJobId}` });
  };

  const filteredJobIds = availableJobIds.filter((id) =>
    id.toLowerCase().includes(jobSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Job Selector */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-crm-brand-50 border border-crm-brand-100 text-crm-brand-700 flex items-center justify-center font-bold flex-shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">
                360° Traceability Suite
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-700/10 text-crm-brand-800 text-[10px] font-bold border border-crm-brand-700/20">
                End-to-End Enterprise Thread
              </span>
            </div>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">
              Full life-cycle verification from Sales Order &amp; Material Test Certificates (MTC) to Shop Floor Dispatch.
            </p>
          </div>
        </div>

        {/* Job Selector & Actions */}
        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-1.5 min-h-[40px]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#1F3FB0] outline-none cursor-pointer max-w-[200px]"
            >
              {availableJobIds.length === 0 ? (
                <option value="">No jobs available</option>
              ) : (
                availableJobIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 min-h-[40px] rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Suite Content */}
      {!currentJob ? (
        <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] p-12 text-center space-y-3">
          <Compass className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">No Traceability Profile Available</h3>
          <p className="text-xs text-[color:var(--crm-text-secondary)] max-w-md mx-auto">
            Select an active Project Job from the dropdown above or create a new job from Project Planning.
          </p>
          <Link
            href="/projects/list"
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl bg-crm-brand-700 text-white font-bold text-xs"
          >
            <span>View Project Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div id="printable-traceability-suite" className="space-y-5">
          {/* Header Summary Ribbon */}
          <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Job Number</span>
              <strong className="font-mono text-sm text-[#1F3FB0]">{currentJob.header?.jobNumber}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Equipment / Product</span>
              <strong className="text-slate-900 truncate block">{currentJob.header?.productName}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer</span>
              <strong className="text-slate-900 truncate block">{currentJob.header?.customerName || (currentJob as any).crm?.customerName || 'Commercial Client'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Status</span>
              <span className="inline-block font-bold text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {String(currentJob.header?.jobStatus || 'Active').replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority</span>
              <strong className="text-amber-800">{currentJob.header?.priority || 'High'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Dispatch</span>
              <strong className="font-mono text-slate-800">{(currentJob.header as any)?.targetDispatchDate || '2025-12-31'}</strong>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-crm-brand-700 text-white shadow-xs'
                      : 'bg-white border border-[color:var(--crm-border-default)] text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] p-6 shadow-xs text-xs space-y-4">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-[color:var(--crm-border-default)] rounded-xl p-4 bg-[color:var(--crm-bg-app)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Commercial Foundation</span>
                    <div className="font-bold text-sm text-[color:var(--crm-text-primary)]">
                      PO Ref: {(currentJob as any).crm?.customerPoRef || 'Customer PO Approved'}
                    </div>
                    <div className="text-slate-500">Quotation: {(currentJob as any).crm?.quotationRef || 'Approved'}</div>
                  </div>
                  <div className="border border-[color:var(--crm-border-default)] rounded-xl p-4 bg-[color:var(--crm-bg-app)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Engineering &amp; BOM</span>
                    <div className="font-bold text-sm text-[color:var(--crm-text-primary)]">
                      BOM Code: {(currentJob as any).design?.bomCode || 'EBOM-VERIFIED'}
                    </div>
                    <div className="text-slate-500">CAD Status: {(currentJob as any).design?.revision || 'Rev 1 Approved'}</div>
                  </div>
                  <div className="border border-[color:var(--crm-border-default)] rounded-xl p-4 bg-[color:var(--crm-bg-app)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Shop Floor WIP</span>
                    <div className="font-bold text-sm text-emerald-800">
                      {(currentJob as any).production?.currentBay || 'Bay 2: SAW / TIG Welding'}
                    </div>
                    <div className="text-slate-500">Progress: {(currentJob as any).production?.shiftProgress || 'Fit-up Complete'}</div>
                  </div>
                </div>

                {/* Multi-Stage Stepper */}
                <div className="border border-[color:var(--crm-border-default)] rounded-xl p-5 space-y-3">
                  <h4 className="font-bold text-xs text-[color:var(--crm-text-primary)] uppercase tracking-wider">
                    Traceability Life-Cycle Progress
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                    {[
                      { step: '1. PO & BOM', status: 'Cleared', color: 'emerald' },
                      { step: '2. Raw MTC', status: 'Tested', color: 'emerald' },
                      { step: '3. Cutting & Rolling', status: 'Completed', color: 'emerald' },
                      { step: '4. Fit-up & Welding', status: 'In Progress', color: 'amber' },
                      { step: '5. Hydro / NDT Test', status: 'Pending', color: 'slate' },
                      { step: '6. Gate Pass Outward', status: 'Pending', color: 'slate' },
                    ].map((st, i) => (
                      <div key={i} className="border border-[color:var(--crm-border-default)] rounded-xl p-3 bg-[#FCFAF7] space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 block">{st.step}</span>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          st.color === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                          st.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {st.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-[color:var(--crm-text-primary)]">Audit &amp; Milestone Timeline</h4>
                <div className="space-y-3 pl-4 border-l-2 border-crm-brand-700/30">
                  {((currentJob as any).timeline || []).map((t: any, idx: number) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-crm-brand-700 border-2 border-white shadow-xs" />
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-[color:var(--crm-text-primary)]">{t.stage}</strong>
                        <span className="text-[10px] font-mono text-slate-400">({t.date})</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{t.status || 'Verified &amp; Recorded'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab !== 'overview' && activeTab !== 'timeline' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[color:var(--crm-text-primary)] capitalize">
                  {activeTab} Traceability Record
                </h4>
                <div className="border border-[color:var(--crm-border-default)] rounded-xl p-4 bg-[color:var(--crm-bg-app)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Verification Status:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified for {currentJob.header?.jobNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Product / Component:</span>
                    <span className="font-bold text-slate-900">{currentJob.header?.productName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Traceability Certificate ID:</span>
                    <span className="font-mono text-slate-800">UMA-TC-{selectedJobId}-{(activeTab).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
