'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../../lib/apiClient';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { Job360Full } from '../../../types/integration';
import { EmptyState, LoadingState } from '../../../components/common/StateDisplay';
import {
  Compass,
  CheckCircle2,
  Clock,
  Building,
  TrendingUp,
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
  AlertCircle,
  Download,
  Plus,
  ArrowUpRight,
  User,
  Calendar,
  FileCheck,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function Job360Page() {
  const { projectJobs = [], isInitialLoading } = useERP();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentJob, setCurrentJob] = useState<Job360Full | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Job selector options come from the live project jobs (backend data only)
  const jobOptions = useMemo(() => {
    const seen = new Map<string, { jobNumber: string; customerName: string }>();
    projectJobs.forEach((pj: any) => {
      const key = pj.jobNumber || pj.projectNumber;
      if (key && !seen.has(key)) seen.set(key, { jobNumber: key, customerName: pj.customerName || '' });
    });
    return Array.from(seen.values());
  }, [projectJobs]);

  const activeJobNumber = selectedJobId || jobOptions[0]?.jobNumber || '';

  useEffect(() => {
    if (!activeJobNumber) {
      setCurrentJob(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    api.integration
      .job360(activeJobNumber)
      .then((data) => {
        if (!cancelled) setCurrentJob(data as Job360Full);
      })
      .catch((err: any) => {
        if (!cancelled) {
          setCurrentJob(null);
          setError(err?.message || 'Unable to load Job 360° data.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeJobNumber]);

  if ((isInitialLoading && jobOptions.length === 0) || loading) {
    return <LoadingState message="Loading Job 360° Life-Cycle Console..." timeoutSeconds={15} />;
  }

  if (jobOptions.length === 0 || !currentJob) {
    return (
      <EmptyState
        title={error ? 'Could not load Job 360°' : 'No Jobs Available'}
        message={error || 'No manufacturing project jobs found in the system. Create a job order to view its full 360° life-cycle dossier.'}
        actionLabel="Create Job Order"
        actionHref="/projects/planning"
        icon={Compass}
      />
    );
  }

  const { header, crm, project, design, purchase, store, production, quality, dispatch, accounts, service, documents, timeline } = currentJob;

  const tabs = [
    { id: 'overview', label: '1. Overview', icon: Compass },
    { id: 'crm', label: '2. CRM', icon: Briefcase },
    { id: 'project', label: '3. Project', icon: Layers },
    { id: 'design', label: '4. Design', icon: Wrench },
    { id: 'purchase', label: '5. Purchase', icon: Package },
    { id: 'store', label: '6. Store', icon: Building },
    { id: 'production', label: '7. Production', icon: Factory },
    { id: 'quality', label: '8. Quality', icon: ShieldCheck },
    { id: 'dispatch', label: '9. Dispatch', icon: Truck },
    { id: 'accounts', label: '10. Accounts', icon: Receipt },
    { id: 'service', label: '11. Service', icon: Wrench },
    { id: 'documents', label: '12. Documents', icon: FileText },
    { id: 'timeline', label: '13. Timeline', icon: History },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] font-sans pb-12">
      {/* Top Header & Job Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[color:var(--crm-brand-700)] flex items-center justify-center flex-shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">{header.jobNumber}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  {header.jobStatus?.replace(/_/g, ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] text-xs font-bold border border-[color:var(--crm-border-default)]">
                  {header.priority} Priority
                </span>
              </div>
              <p className="text-xs text-[color:var(--crm-text-secondary)] font-medium mt-0.5">{header.productName}</p>
            </div>
          </div>
        </div>

        {/* Job Selection Dropdown & Export */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <select
              value={activeJobNumber}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-[color:var(--crm-bg-app)] hover:bg-white text-xs text-[color:var(--crm-text-primary)] font-bold px-3 py-2.5 rounded-xl border border-[color:var(--crm-border-strong)] focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer min-h-[40px]"
            >
              {jobOptions.map((j) => (
                <option key={j.jobNumber} value={j.jobNumber}>
                  {j.jobNumber}{j.customerName ? ` — ${j.customerName}` : ""}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/integration/traceability"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold transition shadow-xs min-h-[40px] whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Traceability Dossier</span>
          </Link>
        </div>
      </div>

      {/* 360 Header Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">Customer</span>
          <div className="text-xs font-bold text-[color:var(--crm-text-primary)] truncate">{header.customerName}</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-mono">PO: {header.customerPoNumber}</div>
        </div>
        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">Project / Manager</span>
          <div className="text-xs font-bold text-crm-brand-500 truncate">{header.projectNumber}</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] truncate">{header.projectManager}</div>
        </div>
        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">Target Delivery</span>
          <div className="text-xs font-bold text-amber-400">{header.plannedDeliveryDate}</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-semibold">{project.daysRemaining > 0 ? `${project.daysRemaining} days remaining` : project.daysRemaining < 0 ? `${Math.abs(project.daysRemaining)} days overdue` : "—"}</div>
        </div>
        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">Total Value</span>
          <div className="text-xs font-bold text-emerald-400 font-mono">₹{header.totalJobValue?.toLocaleString()}</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-mono">SO: {header.salesOrderNumber}</div>
        </div>
        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">Actual Cost</span>
          <div className="text-xs font-bold text-rose-400 font-mono">₹{header.totalJobCost?.toLocaleString()}</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-mono">Material + Labour</div>
        </div>
        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">Margin Profit</span>
          <div className="text-xs font-bold text-teal-400 font-mono">₹{header.profitAmount?.toLocaleString()}</div>
          <div className="text-[10px] text-teal-400 font-bold font-mono">{header.marginPercent}% Gross Margin</div>
        </div>
        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-xl space-y-1 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">Overall Progress</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[color:var(--crm-bg-app)] rounded-full h-2 overflow-hidden">
              <div className="bg-crm-brand-600 h-2 rounded-full transition-all duration-500" style={{ width: `${header.overallProgressPercent}%` }} />
            </div>
            <span className="text-xs font-black text-crm-brand-500 font-mono">{header.overallProgressPercent}%</span>
          </div>
        </div>
      </div>

      {/* 13 Tab Navigation Header */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-[color:var(--crm-border-default)] overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isSelected ? 'bg-crm-brand-700 text-white shadow-md shadow-crm-brand-700/30' : 'text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-secondary)] hover:bg-[#F4F6FA]/60'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents View Area */}
      <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-6 shadow-xl space-y-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Compass className="w-5 h-5 text-crm-brand-500" /> Job 360° Complete Executive Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-3">
                <h4 className="text-xs font-bold text-crm-brand-500 uppercase tracking-wider">Current Stage & Status</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
                    <span className="text-[color:var(--crm-text-secondary)]">Current Phase:</span>
                    <span className="font-bold text-[color:var(--crm-text-primary)]">{header.jobStatus?.replace(/_/g, " ") || "—"}</span>
                  </div>
                  <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
                    <span className="text-[color:var(--crm-text-secondary)]">Design Status:</span>
                    <span className="font-bold text-[color:var(--crm-text-primary)]">{design.designStatus ? `${design.designStatus}${design.bomNumber ? ` (${design.bomNumber} ${design.bomRevision})` : ""}` : "—"}</span>
                  </div>
                  <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
                    <span className="text-[color:var(--crm-text-secondary)]">Material Availability:</span>
                    <span className="font-bold text-[color:var(--crm-text-primary)]">{store.requiredItemsCount > 0 ? `${store.materialIssuedCount} issue slips, ${store.stockShortageItemsCount} shortages` : "—"}</span>
                  </div>
                  <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
                    <span className="text-[color:var(--crm-text-secondary)]">Quality Inspection:</span>
                    <span className="font-bold text-[color:var(--crm-text-primary)]">{quality.incomingQcPassCount + quality.incomingQcFailCount > 0 ? `${quality.incomingQcPassCount} passed / ${quality.incomingQcFailCount} failed` : "—"}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Financial Snapshot</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
                    <span className="text-[color:var(--crm-text-secondary)] font-sans">Sales Value:</span>
                    <span className="font-bold text-[color:var(--crm-text-primary)]">₹{header.totalJobValue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
                    <span className="text-[color:var(--crm-text-secondary)] font-sans">Material Cost:</span>
                    <span className="text-rose-400">₹{(store.issuedValue ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
                    <span className="text-[color:var(--crm-text-secondary)] font-sans">Gross Profit:</span>
                    <span className="font-bold text-teal-400">₹{header.profitAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
                    <span className="text-[color:var(--crm-text-secondary)] font-sans">Margin:</span>
                    <span className="font-bold text-teal-400">{header.marginPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Next Actions</h4>
                <ul className="space-y-2 text-xs text-[color:var(--crm-text-secondary)] list-disc list-inside">
                  {production.operations.filter((o) => o.status !== "Completed").slice(0, 3).map((o, i) => (<li key={i}>{o.operationName} ({o.status})</li>))}
                  {production.operations.every((o) => o.status === "Completed") && <li className="list-none text-[color:var(--crm-text-secondary)]">No pending actions recorded</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. CRM TAB */}
        {activeTab === 'crm' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-crm-brand-500" /> Commercial & Sales Engine Lifecycle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2">
                <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase">1. Lead Enquiry</span>
                <div className="font-bold text-[color:var(--crm-text-primary)]">{crm.leadNumber}</div>
                <div className="text-[color:var(--crm-text-secondary)]">Source: {crm.leadSource}</div>
                <div className="text-[color:var(--crm-text-secondary)]">Date: {crm.enquiryDate}</div>
              </div>
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2">
                <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase">2. Sales Quotation</span>
                <div className="font-bold text-crm-brand-500">{crm.quotationNumber}</div>
                <div className="font-mono text-emerald-400 font-bold">₹{crm.quotationValue?.toLocaleString()}</div>
                <div className="text-[color:var(--crm-text-secondary)]">Status: {crm.quotationStatus}</div>
              </div>
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2">
                <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase">3. Customer PO</span>
                <div className="font-bold text-crm-brand-500">{crm.customerPoNumber}</div>
                <div className="text-[color:var(--crm-text-secondary)]">PO Date: {crm.customerPoDate}</div>
              </div>
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2">
                <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase">4. Confirmed Sales Order</span>
                <div className="font-bold text-emerald-400">{crm.salesOrderNumber}</div>
                <div className="font-mono text-[color:var(--crm-text-primary)] font-bold">₹{crm.salesOrderValue?.toLocaleString()}</div>
                <div className="text-[color:var(--crm-text-secondary)]">Date: {crm.salesOrderDate}</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. PROJECT TAB */}
        {activeTab === 'project' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" /> Project Milestones & Department Assignments
            </h3>
            <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[color:var(--crm-text-secondary)]">Project: {project.projectName} ({project.projectNumber})</span>
                <span className="text-[color:var(--crm-text-secondary)] font-mono">{project.completedTasks} / {project.totalTasks} Tasks Completed</span>
              </div>
              <div className="space-y-2">
                {project.departmentAssignments.map((dept, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border border-[color:var(--crm-border-default)] text-xs">
                    <div>
                      <span className="font-bold text-[color:var(--crm-text-primary)]">{dept.department}</span>
                      <span className="text-[color:var(--crm-text-secondary)] ml-2">({dept.head})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${dept.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {dept.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. DESIGN TAB */}
        {activeTab === 'design' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Wrench className="w-5 h-5 text-crm-brand-600" /> Engineering CAD Design & Approved BOM
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2">
                <span className="font-bold text-crm-brand-500">Design Document: {design.designJobNumber}</span>
                <p className="text-[color:var(--crm-text-secondary)]">{design.requirementsSummary}</p>
                <div className="text-[color:var(--crm-text-secondary)]">Revision: <span className="text-[color:var(--crm-text-primary)] font-bold">{design.designRevision}</span></div>
                <div className="text-[color:var(--crm-text-secondary)]">Approved By: {design.approvedBy} ({design.approvalDate})</div>
              </div>
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2">
                <span className="font-bold text-emerald-400">Bill of Materials: {design.bomNumber} ({design.bomRevision})</span>
                <div className="text-[color:var(--crm-text-secondary)]">Total Component Items: <span className="font-bold text-[color:var(--crm-text-primary)]">{design.bomItemsCount} Items</span></div>
                <div className="text-emerald-400 font-semibold">Status: Released to Production & Procurement</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. PURCHASE TAB */}
        {activeTab === 'purchase' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Package className="w-5 h-5 text-crm-brand-500" /> Material Procurement & Supplier PO Traceability
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[color:var(--crm-text-secondary)]">
                <thead className="bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] uppercase font-semibold text-[10px] border-b border-[color:var(--crm-border-default)]">
                  <tr>
                    <th className="p-3">Item Code</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Req / Rec Qty</th>
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--crm-border-default)] font-mono">
                  {purchase.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F4F6FA]/50">
                      <td className="p-3 font-bold text-crm-brand-500">{item.itemCode}</td>
                      <td className="p-3 font-sans text-[color:var(--crm-text-secondary)]">{item.description}</td>
                      <td className="p-3">{item.requiredQty} / {item.receivedQty}</td>
                      <td className="p-3 text-crm-brand-500 font-bold">{item.poNumber}</td>
                      <td className="p-3 font-sans text-[color:var(--crm-text-secondary)]">{item.supplierName}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-sans text-[10px] font-semibold">{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. STORE TAB */}
        {activeTab === 'store' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" /> Store Warehouse Stock & Material Issue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)]">
                <div className="text-[color:var(--crm-text-secondary)] font-sans">Reserved Stock Value</div>
                <div className="text-lg font-bold text-emerald-400">₹{store.reservedStockValue?.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)]">
                <div className="text-[color:var(--crm-text-secondary)] font-sans">Material Issued Count</div>
                <div className="text-lg font-bold text-crm-brand-500">{store.materialIssuedCount} Slips</div>
              </div>
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)]">
                <div className="text-[color:var(--crm-text-secondary)] font-sans">Stock Shortages</div>
                <div className="text-lg font-bold text-emerald-400">{store.stockShortageItemsCount} Items (Clear)</div>
              </div>
            </div>
          </div>
        )}

        {/* 7. PRODUCTION TAB */}
        {activeTab === 'production' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Factory className="w-5 h-5 text-crm-brand-600" /> Shopfloor Operations & Work Center Progress
            </h3>
            <div className="space-y-2">
              {production.operations.map((op, idx) => (
                <div key={idx} className="p-3 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[color:var(--crm-text-primary)]">{op.operationName}</div>
                    <div className="text-[color:var(--crm-text-secondary)] text-[10px]">Work Center: {op.workCenter}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-crm-brand-500 font-bold">{op.progress}%</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${op.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : op.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)]'}`}>
                      {op.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. QUALITY TAB */}
        {activeTab === 'quality' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" /> Quality Assurance & Hydro-Testing Log
            </h3>
            <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2">
              <div className="font-bold text-[color:var(--crm-text-primary)]">Quality Inspection Certificate: {quality.qcCertificateNumber}</div>
              <div className="text-[color:var(--crm-text-secondary)]">Inspector: {quality.inspectorName}</div>
              <div className="text-[color:var(--crm-text-secondary)]">Incoming Material QC: <span className="text-emerald-400 font-bold">{quality.incomingQcPassCount} Passed</span> / {quality.incomingQcFailCount} Failed</div>
              <div className="text-[color:var(--crm-text-secondary)]">In-Process Welding QC: <span className="text-emerald-400 font-bold">{quality.inProcessQcPassCount} Passed</span></div>
            </div>
          </div>
        )}

        {/* 9. DISPATCH TAB */}
        {activeTab === 'dispatch' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" /> Logistics, Dispatch & On-Site Installation
            </h3>
            <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2">
              <div className="font-bold text-[color:var(--crm-text-primary)]">Transporter: {dispatch.transporterName}</div>
              <div className="text-[color:var(--crm-text-secondary)]">Dispatch Date: {dispatch.dispatchDate || "—"}</div>
              <div className="text-[color:var(--crm-text-secondary)]">Installation Date: {dispatch.installationDate || "—"}</div>
              <div className="text-[color:var(--crm-text-secondary)]">Field Technician: {dispatch.installedByTech || "—"}</div>
            </div>
          </div>
        )}

        {/* 10. ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" /> Financial Ledgers, Revenue & Margins
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2 font-mono">
                <span className="font-sans font-bold text-crm-brand-500">Invoice Details</span>
                <div className="text-[color:var(--crm-text-primary)]">Invoice #: {accounts.salesInvoiceNumber}</div>
                <div className="text-emerald-400 font-bold">Total Grand Invoice: ₹{accounts.grandTotal?.toLocaleString()}</div>
                <div className="text-[color:var(--crm-text-secondary)]">Received Amount: ₹{accounts.receivedAmount?.toLocaleString()}</div>
                <div className="text-rose-400 font-bold">Outstanding Balance: ₹{accounts.outstandingBalance?.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2 font-mono">
                <span className="font-sans font-bold text-teal-400">Job Costing Summary</span>
                <div className="text-[color:var(--crm-text-secondary)]">Total Revenue: ₹{header.totalJobValue?.toLocaleString()}</div>
                <div className="text-rose-400">Total Actual Cost: ₹{accounts.totalActualCost?.toLocaleString()}</div>
                <div className="text-teal-400 font-bold text-sm">Gross Profit Margin: ₹{accounts.grossMarginAmount?.toLocaleString()} ({accounts.grossMarginPercent}%)</div>
              </div>
            </div>
          </div>
        )}

        {/* 11. SERVICE TAB */}
        {activeTab === 'service' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Wrench className="w-5 h-5 text-rose-400" /> Post-Dispatch Warranty & AMC Contract
            </h3>
            <div className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] space-y-2">
              <div className="font-bold text-emerald-400">Warranty Status: {service.warrantyStatus} (Valid till {service.warrantyEndDate})</div>
              <div className="text-[color:var(--crm-text-secondary)]">AMC Contract: {service.amcContractNumber || "—"}</div>
              <div className="text-[color:var(--crm-text-secondary)]">Logged Breakdown Events: {service.breakdownEventsCount}</div>
            </div>
          </div>
        )}

        {/* 12. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-crm-brand-600" /> Job Attachments & Technical Documents
            </h3>
            <div className="space-y-2 text-xs">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[color:var(--crm-text-primary)]">{doc.fileName}</div>
                    <div className="text-[color:var(--crm-text-secondary)] text-[10px]">{doc.documentType} • {doc.fileSize} • Uploaded by {doc.uploadedBy} on {doc.uploadDate}</div>
                  </div>
                  <button className="p-2 bg-[color:var(--crm-bg-app)] hover:bg-[color:var(--crm-bg-app)] text-crm-brand-500 rounded-lg transition">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 13. TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <History className="w-5 h-5 text-crm-brand-600" /> Chronological Event Activity Trail
            </h3>
            <div className="border-l-2 border-[color:var(--crm-border-default)] ml-3 space-y-4 pl-4 text-xs">
              {timeline.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-crm-brand-600 border-2 border-[color:var(--crm-border-default)]" />
                  <div className="font-bold text-[color:var(--crm-text-primary)]">{item.action} <span className="text-[color:var(--crm-text-secondary)] font-normal">({item.module})</span></div>
                  <div className="text-[color:var(--crm-text-secondary)]">{item.description}</div>
                  <div className="text-[10px] text-[color:var(--crm-text-secondary)]">{item.timestamp} • By {item.user}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
