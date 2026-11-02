'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiClient';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../workflow/StatusBadge';
import { WorkflowStepper } from '../workflow/WorkflowStepper';
import { formatCurrency, formatDate } from '../../lib/utils';
import { printContent } from '../../lib/printUtils';
import {
  X,
  Printer,
  Share2,
  FileText,
  Layers,
  Wrench,
  ShoppingCart,
  ShieldCheck,
  Truck,
  IndianRupee,
  CheckCircle,
  Clock,
  Building,
  Calendar,
  Tag,
  AlertCircle,
} from 'lucide-react';

export function JobTraceabilityModal() {
  const { selectedJobForModal, closeJobModal, updateJobStatus, stockReservations, materialIssues, goodsReceipts, salesInvoices, customerReceipts, purchaseInvoices, jobCostings } = useERP();
  const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'design' | 'purchase' | 'store' | 'production' | 'qc' | 'dispatch' | 'accounts' | 'service'>('overview');

  const [dossier, setDossier] = useState<any>(null);
  const modalJobNumber = selectedJobForModal?.jobNumber;
  useEffect(() => {
    if (!modalJobNumber) {
      setDossier(null);
      return;
    }
    let cancelled = false;
    api.integration
      .job360(modalJobNumber)
      .then((d) => { if (!cancelled) setDossier(d); })
      .catch(() => { if (!cancelled) setDossier(null); });
    return () => { cancelled = true; };
  }, [modalJobNumber]);

  if (!selectedJobForModal) return null;

  const job = selectedJobForModal;

  const handlePrintJobCard = () => {
    printContent('printable-job-traceability-card', { title: `JobCard_${job.jobNumber}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F172A]/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div id="printable-job-traceability-card" className="bg-white border border-[color:var(--crm-border-default)] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[color:var(--crm-border-default)] bg-gradient-to-r from-[color:var(--crm-brand-50)] via-[#EDF1FA] to-[#E3EAF8] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[color:var(--crm-text-primary)] text-white font-mono font-bold text-xs shadow-xs">
                {job.jobNumber}
              </span>
              <StatusBadge status={job.currentStatus} />
              <span className="text-xs text-[color:var(--crm-text-secondary)] flex items-center gap-1 font-medium">
                <Building className="w-3.5 h-3.5 text-[color:var(--crm-text-tertiary)]" />
                {job.customerName}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[color:var(--crm-text-primary)] mt-1 tracking-tight">
              {job.productName}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 print:hidden">
            <button
              onClick={handlePrintJobCard}
              title="Print Job Traveler"
              className="p-2 text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] hover:bg-white rounded-xl border border-[color:var(--crm-border-default)] transition shadow-xs text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Print Job Card</span>
            </button>
            <button
              onClick={closeJobModal}
              className="p-2 text-[color:var(--crm-text-tertiary)] hover:text-[color:var(--crm-text-primary)] hover:bg-white rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow Stepper Banner */}
        <div className="px-4 sm:px-6 py-3 bg-[color:var(--crm-bg-app)] border-b border-[color:var(--crm-border-default)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">
              Live MTO Workflow Lifecycle ({job.progressPercent}% Completed)
            </span>
            <span className="text-xs text-[color:var(--crm-brand-700)] font-bold">
              Target Delivery: {formatDate(job.targetDeliveryDate)}
            </span>
          </div>
          <WorkflowStepper
            steps={job.steps}
            interactive={true}
            onStepClick={(step) => {
              const nextStatus = step.status === 'completed' ? 'pending' : step.status === 'in_progress' ? 'completed' : 'in_progress';
              updateJobStatus(job.jobNumber, step.id, nextStatus);
            }}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[color:var(--crm-border-default)] bg-white px-4 sm:px-6 overflow-x-auto scrollbar-none text-xs font-medium print:hidden">
          {[
            { id: 'overview', label: '360° Summary', icon: Layers },
            { id: 'crm', label: 'CRM & Order', icon: FileText },
            { id: 'design', label: 'Design & BOM', icon: Tag },
            { id: 'purchase', label: 'Procurement & GRN', icon: ShoppingCart },
            { id: 'store', label: 'Store & Inventory', icon: Building },
            { id: 'production', label: 'Shop Floor & WIP', icon: Wrench },
            { id: 'qc', label: 'QC & Testing', icon: ShieldCheck },
            { id: 'dispatch', label: 'Dispatch & Site', icon: Truck },
            { id: 'accounts', label: 'Commercial & Invoicing', icon: IndianRupee },
            { id: 'service', label: 'Service & Maintenance 360°', icon: Wrench },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[color:var(--crm-brand-700)] text-[color:var(--crm-brand-700)] font-bold'
                    : 'border-transparent text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[color:var(--crm-brand-700)]' : 'text-[color:var(--crm-text-tertiary)]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Key Metadata */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[color:var(--crm-border-default)] bg-slate-50/50 dark:bg-[#F4F6FA]/30 space-y-2.5">
                <h4 className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-crm-brand-600" /> Commercial Reference
                </h4>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-[color:var(--crm-text-secondary)]">Sales Order ID:</span>
                    <span className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)]">{job.salesOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--crm-text-secondary)]">Quotation ID:</span>
                    <span className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)]">{job.quotationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--crm-text-secondary)]">Customer PO #:</span>
                    <span className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)]">{job.customerPoNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--crm-text-secondary)]">Total Order Value:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(job.orderValue)}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Technical Specifications */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[color:var(--crm-border-default)] bg-slate-50/50 dark:bg-[#F4F6FA]/30 space-y-2.5">
                <h4 className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-crm-brand-600" /> Technical Specification
                </h4>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-[color:var(--crm-text-secondary)]">Product Code:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)]">{job.productCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--crm-text-secondary)]">Batch / Quantity:</span>
                    <span className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)]">{job.quantity} {job.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[color:var(--crm-text-secondary)]">Project Lead:</span>
                    <span className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)]">{job.projectManager}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600 dark:text-[color:var(--crm-text-secondary)] bg-white dark:bg-white p-2 rounded border border-slate-200 dark:border-[color:var(--crm-border-default)]">
                    {job.specification}
                  </div>
                </div>
              </div>

              {/* Card 3: Traceable Linked Records */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[color:var(--crm-border-default)] bg-slate-50/50 dark:bg-[#F4F6FA]/30 space-y-2.5">
                <h4 className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-crm-brand-600" /> Connected Cross-Module Chain
                </h4>
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-[color:var(--crm-border-default)]">
                    <span className="text-[color:var(--crm-text-secondary)]">Design Revision:</span>
                    <span className="font-mono font-semibold text-crm-brand-700 dark:text-crm-brand-500">{job.linkedRecords.designRev || 'REV-00'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-[color:var(--crm-border-default)]">
                    <span className="text-[color:var(--crm-text-secondary)]">Approved BOM ID:</span>
                    <span className="font-mono font-semibold">{job.linkedRecords.bomId || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-[color:var(--crm-border-default)]">
                    <span className="text-[color:var(--crm-text-secondary)]">Supplier POs:</span>
                    <span className="font-mono font-semibold">{job.linkedRecords.purchaseOrders?.join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-[color:var(--crm-border-default)]">
                    <span className="text-[color:var(--crm-text-secondary)]">Shop Work Orders:</span>
                    <span className="font-mono font-semibold">{job.linkedRecords.workOrderIds?.join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[color:var(--crm-text-secondary)]">Tax Invoices:</span>
                    <span className="font-mono font-semibold">{job.linkedRecords.invoiceNumbers?.join(', ') || 'None'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[color:var(--crm-border-default)] bg-white dark:bg-white space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-[color:var(--crm-text-secondary)]">Customer Contract & Quotation Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[color:var(--crm-text-secondary)] block">Customer Name</span>
                    <span className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)]">{job.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[color:var(--crm-text-secondary)] block">Quotation No.</span>
                    <span className="font-mono font-semibold text-crm-brand-700">{job.quotationId}</span>
                  </div>
                  <div>
                    <span className="text-[color:var(--crm-text-secondary)] block">PO Date</span>
                    <span className="font-semibold">{formatDate(job.startDate)}</span>
                  </div>
                  <div>
                    <span className="text-[color:var(--crm-text-secondary)] block">Payment Terms</span>
                    <span className="font-semibold">{(job as any).paymentTerms || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[color:var(--crm-border-default)] bg-white dark:bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-[color:var(--crm-text-secondary)]">Approved Drawings & Engineering BOM</h4>
                  <span className="px-2 py-0.5 rounded bg-crm-brand- text-crm-brand- font-mono font-bold text-xs">
                    {job.linkedRecords.designRev || 'REV-01'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-[color:var(--crm-border-default)] bg-slate-50/60 dark:bg-[#F4F6FA]/40">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-crm-brand-700" />
                      <div>
                        <span className="font-medium text-slate-900 dark:text-[color:var(--crm-text-secondary)]">Fabrication General Assembly (GA) Drawing.dwg</span>
                        <span className="block text-[10px] text-[color:var(--crm-text-secondary)]">Approved by Dharmesh Joshi on 2026-08-18</span>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-slate-200 dark:bg-[color:var(--crm-bg-app)] text-xs hover:bg-slate-300 font-medium">
                      Download PDF
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-[color:var(--crm-border-default)] bg-slate-50/60 dark:bg-[#F4F6FA]/40">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-crm-brand-700" />
                      <div>
                        <span className="font-medium text-slate-900 dark:text-[color:var(--crm-text-secondary)]">Bill of Materials (BOM-CRV-10K-R2) - 48 Line Items</span>
                        <span className="block text-[10px] text-[color:var(--crm-text-secondary)]">Plates, Dish Ends, Nozzles, Baffles, Agitator Shaft</span>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-slate-200 dark:bg-[color:var(--crm-bg-app)] text-xs hover:bg-slate-300 font-medium">
                      View BOM Items
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchase' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[color:var(--crm-border-default)] bg-white dark:bg-white">
                <h4 className="font-bold text-sm text-slate-800 dark:text-[color:var(--crm-text-secondary)] mb-2">Material Procurement & GRN Inward</h4>
                <div className="space-y-2">
                  {job.linkedRecords.purchaseOrders && job.linkedRecords.purchaseOrders.length > 0 ? (
                    job.linkedRecords.purchaseOrders.map((po, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-[color:var(--crm-border-default)] bg-slate-50/50">
                        <div>
                          <span className="font-mono font-bold text-crm-brand-700">{po}</span>
                          
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium text-[10px]">
                          {job.linkedRecords.grnNumbers?.[idx] ? `GRN Received (${job.linkedRecords.grnNumbers[idx]})` : 'GRN pending'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[color:var(--crm-text-secondary)] text-center py-4">No Purchase Orders raised yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[color:var(--crm-border-default)] bg-white dark:bg-white space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-[color:var(--crm-text-secondary)] flex items-center justify-between">
                  <span>Job-wise Stock Reservations & Material Slips</span>
                  <span className="text-xs text-sky-600 font-mono font-bold">{job.jobNumber}</span>
                </h4>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-[color:var(--crm-text-secondary)]">Reserved Raw Materials & Bought-Outs:</div>
                  {stockReservations.filter((r) => r.jobId === job.jobNumber).length > 0 ? (
                    stockReservations
                      .filter((r) => r.jobId === job.jobNumber)
                      .map((res) => (
                        <div key={res.id} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-[color:var(--crm-border-default)] bg-slate-50 dark:bg-[#F4F6FA]/40">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-[color:var(--crm-text-primary)]">{res.itemCode} - {res.itemName}</span>
                            <span className="block text-[10px] text-[color:var(--crm-text-secondary)]">Warehouse: {res.warehouseName} ({res.locationCode})</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-rose-500 block text-xs">{res.reservedQuantity} Locked</span>
                            <span className="text-[10px] text-emerald-600 font-bold">{res.status}</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-2.5 rounded-lg border border-slate-100 dark:border-[color:var(--crm-border-default)] bg-slate-50 dark:bg-[#F4F6FA]/40 text-[color:var(--crm-text-secondary)]">
                      No material reserved for this job yet.
                    </div>
                  )}

                  <div className="text-xs font-bold text-slate-700 dark:text-[color:var(--crm-text-secondary)] pt-2">Material Issue Slips Issued to Shop Floor:</div>
                  {materialIssues.filter((i) => i.jobId === job.jobNumber).length > 0 ? (
                    materialIssues
                      .filter((i) => i.jobId === job.jobNumber)
                      .map((iss) => (
                        <div key={iss.id} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-[color:var(--crm-border-default)] bg-emerald-50/50 dark:bg-emerald-950/20">
                          <div>
                            <span className="font-mono font-bold text-emerald-600">{iss.issueNumber}</span>
                            <span className="block text-[10px] text-[color:var(--crm-text-secondary)]">Stage: {iss.productionStage} • Requested By: {iss.requestedBy}</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-bold text-emerald-600 block text-xs">₹{iss.totalIssueValue?.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-[color:var(--crm-text-secondary)]">{iss.status}</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-2.5 rounded-lg border border-slate-100 dark:border-[color:var(--crm-border-default)] bg-slate-50 dark:bg-[#F4F6FA]/40 text-[color:var(--crm-text-secondary)]">
                      No material issued to the shop floor for this job yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-800">Shop Floor Work Orders &amp; Routing</h4>
              {!dossier ? (
                <p className="text-[color:var(--crm-text-secondary)]">No production data available for this job yet.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Work order</span><span className="font-bold">{dossier.production.workOrderNumber || '—'}</span></div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Status</span><span className="font-bold">{dossier.production.status || '—'}</span></div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Completed / target</span><span className="font-bold">{dossier.production.completedQuantity} / {dossier.production.targetQuantity}</span></div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Rework / scrap</span><span className="font-bold">{dossier.production.reworkQuantity} / {dossier.production.scrapQuantity}</span></div>
                  </div>
                  {dossier.production.operations.length > 0 && (
                    <div className="space-y-2">
                      {dossier.production.operations.map((op: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                          <div>
                            <span className="font-semibold">{op.operationName}</span>
                            <span className="block text-[color:var(--crm-text-secondary)] text-[10px]">{op.workCenter}</span>
                          </div>
                          <span className="font-semibold">{op.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'qc' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-800">Quality Inspection</h4>
              {!dossier ? (
                <p className="text-[color:var(--crm-text-secondary)]">No quality data available for this job yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Incoming QC passed</span><span className="font-bold">{dossier.quality.incomingQcPassCount}</span></div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Incoming QC failed</span><span className="font-bold">{dossier.quality.incomingQcFailCount}</span></div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Inspector</span><span className="font-bold">{dossier.quality.inspectorName || '—'}</span></div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Last inspection</span><span className="font-bold">{dossier.quality.inspectionDate || '—'}</span></div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-800">Dispatch, Transport &amp; Site Commissioning</h4>
              {!dossier ? (
                <p className="text-[color:var(--crm-text-secondary)]">No dispatch data available for this job yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Dispatch note</span><span className="font-bold">{dossier.dispatch.dispatchNoteNumber || '—'}</span></div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Dispatch date</span><span className="font-bold">{dossier.dispatch.dispatchDate || '—'}</span></div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Delivery status</span><span className="font-bold">{dossier.dispatch.deliveryStatus}</span></div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Transporter</span><span className="font-bold">{dossier.dispatch.transporterName || '—'}</span></div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Vehicle</span><span className="font-bold">{dossier.dispatch.vehicleNumber || '—'}</span></div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50"><span className="text-[color:var(--crm-text-secondary)] block text-[10px]">LR number</span><span className="font-bold">{dossier.dispatch.lrNumber || '—'}</span></div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[color:var(--crm-border-default)] bg-white dark:bg-white space-y-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-[color:var(--crm-text-secondary)] flex items-center justify-between">
                <span>Job 360° Financial Control & Billing Summary</span>
                <span className="font-mono text-xs text-emerald-600 font-bold">{job.jobNumber}</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[color:var(--crm-border-default)] bg-slate-50/50 dark:bg-[#F4F6FA]/40 font-mono">
                  <span className="text-[color:var(--crm-text-secondary)] font-sans block text-[10px]">Sales Contract Value</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-[color:var(--crm-text-primary)]">{formatCurrency(job.orderValue)}</span>
                </div>
                <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 font-mono">
                  <span className="text-emerald-700 dark:text-emerald-400 font-sans block text-[10px]">Total Receipts Collected</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(dossier?.accounts?.receivedAmount ?? 0)}</span>
                </div>
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 font-mono">
                  <span className="text-amber-700 dark:text-amber-400 font-sans block text-[10px]">Actual Cost Incurred</span>
                  <span className="text-sm font-bold text-amber-600">{formatCurrency(dossier?.accounts?.totalActualCost ?? 0)}</span>
                </div>
                <div className="p-3 rounded-lg border border-crm-brand- dark:border-crm-brand- bg-crm-brand-/40 dark:bg-crm-brand-/20 font-mono">
                  <span className="text-crm-brand-800 dark:text-crm-brand-500 font-sans block text-[10px]">Project Net Margin</span>
                  <span className="text-sm font-bold text-crm-brand-700">{dossier?.accounts ? `${formatCurrency(dossier.accounts.grossMarginAmount)} (${dossier.accounts.grossMarginPercent}%)` : '—'}</span>
                </div>
              </div>

              {/* Linked invoices (live accounts data) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[color:var(--crm-border-default)] text-xs">
                <div className="font-bold text-slate-800 dark:text-[color:var(--crm-text-secondary)]">Sales Invoice & Collections</div>
                {dossier?.accounts?.salesInvoiceNumber ? (
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="font-mono font-bold text-emerald-700">{dossier.accounts.salesInvoiceNumber}</span>
                    <span className="block text-[color:var(--crm-text-secondary)] text-[10px]">
                      Grand total {formatCurrency(dossier.accounts.grandTotal)} • Received {formatCurrency(dossier.accounts.receivedAmount)} • Outstanding {formatCurrency(dossier.accounts.outstandingBalance)}
                    </span>
                    <span className="text-[10px] font-bold mt-0.5 inline-block">{dossier.accounts.paymentStatus}</span>
                  </div>
                ) : (
                  <p className="text-[color:var(--crm-text-secondary)]">No sales invoice raised for this job yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'service' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-800 flex items-center justify-between">
                <span>Maintenance &amp; Service History</span>
                <span className="font-mono text-xs text-amber-700 font-bold">{job.jobNumber}</span>
              </h4>
              {!dossier ? (
                <p className="text-[color:var(--crm-text-secondary)]">No service data available for this job yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Warranty</span>
                    <span className="text-sm font-bold">{dossier.service.warrantyStatus || '—'}</span>
                    <span className="block text-[10px] text-[color:var(--crm-text-secondary)]">{dossier.service.warrantyEndDate ? `until ${dossier.service.warrantyEndDate}` : ''}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-[color:var(--crm-text-secondary)] block text-[10px]">AMC contract</span>
                    <span className="text-sm font-bold">{dossier.service.amcContractNumber || '—'}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Service requests</span>
                    <span className="text-sm font-bold">{dossier.service.serviceRequestsCount}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-[color:var(--crm-text-secondary)] block text-[10px]">Service visits</span>
                    <span className="text-sm font-bold">{dossier.service.serviceVisitsCount}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[color:var(--crm-border-default)] bg-slate-50 dark:bg-[color:var(--crm-bg-app)] flex items-center justify-between text-xs print:hidden">
          <span className="text-[color:var(--crm-text-secondary)]">
            Tip: Click on any step in the MTO workflow banner above to toggle completion.
          </span>
          <button
            onClick={closeJobModal}
            className="px-4 py-2 bg-[color:var(--crm-bg-app)] dark:bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] rounded-lg hover:bg-white transition font-medium"
          >
            Close 360° View
          </button>
        </div>
      </div>
    </div>
  );
}
