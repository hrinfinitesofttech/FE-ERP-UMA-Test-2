'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../workflow/StatusBadge';
import { WorkflowStepper } from '../workflow/WorkflowStepper';
import { formatCurrency, formatDate } from '../../lib/utils';
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

  if (!selectedJobForModal) return null;

  const job = selectedJobForModal;

  const handlePrintJobCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#211B17]/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7DED5] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E7DED5] bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#3E2723] text-white font-mono font-bold text-xs shadow-xs">
                {job.jobNumber}
              </span>
              <StatusBadge status={job.currentStatus} />
              <span className="text-xs text-[#70665F] flex items-center gap-1 font-medium">
                <Building className="w-3.5 h-3.5 text-[#8D827A]" />
                {job.customerName}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#211B17] mt-1 tracking-tight">
              {job.productName}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 print:hidden">
            <button
              onClick={handlePrintJobCard}
              title="Print Job Traveler"
              className="p-2 text-[#70665F] hover:text-[#211B17] hover:bg-white rounded-xl border border-[#E7DED5] transition shadow-xs text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Print Job Card</span>
            </button>
            <button
              onClick={closeJobModal}
              className="p-2 text-[#8D827A] hover:text-[#211B17] hover:bg-white rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow Stepper Banner */}
        <div className="px-4 sm:px-6 py-3 bg-[#FAF7F2] border-b border-[#E7DED5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider">
              Live MTO Workflow Lifecycle ({job.progressPercent}% Completed)
            </span>
            <span className="text-xs text-[#75401F] font-bold">
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
        <div className="flex border-b border-[#E7DED5] bg-white px-4 sm:px-6 overflow-x-auto scrollbar-none text-xs font-medium print:hidden">
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
                    ? 'border-[#75401F] text-[#75401F] font-bold'
                    : 'border-transparent text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#75401F]' : 'text-[#8D827A]'}`} />
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
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-slate-50/50 dark:bg-[#FAF7F2]/30 space-y-2.5">
                <h4 className="font-semibold text-slate-800 dark:text-[#544B45] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-crm-brand-600" /> Commercial Reference
                </h4>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Sales Order ID:</span>
                    <span className="font-semibold text-slate-800 dark:text-[#544B45]">{job.salesOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Quotation ID:</span>
                    <span className="font-semibold text-slate-800 dark:text-[#544B45]">{job.quotationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Customer PO #:</span>
                    <span className="font-semibold text-slate-800 dark:text-[#544B45]">{job.customerPoNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Total Order Value:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(job.orderValue)}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Technical Specifications */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-slate-50/50 dark:bg-[#FAF7F2]/30 space-y-2.5">
                <h4 className="font-semibold text-slate-800 dark:text-[#544B45] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-amber-500" /> Technical Specification
                </h4>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Product Code:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-[#544B45]">{job.productCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Batch / Quantity:</span>
                    <span className="font-semibold text-slate-800 dark:text-[#544B45]">{job.quantity} {job.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70665F]">Project Lead:</span>
                    <span className="font-semibold text-slate-800 dark:text-[#544B45]">{job.projectManager}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600 dark:text-[#70665F] bg-white dark:bg-white p-2 rounded border border-slate-200 dark:border-[#EBE3DB]">
                    {job.specification}
                  </div>
                </div>
              </div>

              {/* Card 3: Traceable Linked Records */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-slate-50/50 dark:bg-[#FAF7F2]/30 space-y-2.5">
                <h4 className="font-semibold text-slate-800 dark:text-[#544B45] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-crm-brand-600" /> Connected Cross-Module Chain
                </h4>
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-[#EBE3DB]">
                    <span className="text-[#70665F]">Design Revision:</span>
                    <span className="font-mono font-semibold text-crm-brand-700 dark:text-crm-brand-500">{job.linkedRecords.designRev || 'REV-00'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-[#EBE3DB]">
                    <span className="text-[#70665F]">Approved BOM ID:</span>
                    <span className="font-mono font-semibold">{job.linkedRecords.bomId || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-[#EBE3DB]">
                    <span className="text-[#70665F]">Supplier POs:</span>
                    <span className="font-mono font-semibold">{job.linkedRecords.purchaseOrders?.join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-[#EBE3DB]">
                    <span className="text-[#70665F]">Shop Work Orders:</span>
                    <span className="font-mono font-semibold">{job.linkedRecords.workOrderIds?.join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#70665F]">Tax Invoices:</span>
                    <span className="font-mono font-semibold">{job.linkedRecords.invoiceNumbers?.join(', ') || 'None'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-white dark:bg-white space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Customer Contract & Quotation Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#70665F] block">Customer Name</span>
                    <span className="font-semibold text-slate-800 dark:text-[#544B45]">{job.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block">Quotation No.</span>
                    <span className="font-mono font-semibold text-crm-brand-700">{job.quotationId}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block">PO Date</span>
                    <span className="font-semibold">{formatDate(job.startDate)}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block">Payment Terms</span>
                    <span className="font-semibold">30% Adv, 60% ag. Proforma, 10% ag. Handover</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-white dark:bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Approved Drawings & Engineering BOM</h4>
                  <span className="px-2 py-0.5 rounded bg-crm-brand- text-crm-brand- font-mono font-bold text-xs">
                    {job.linkedRecords.designRev || 'REV-01'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-[#EBE3DB] bg-slate-50/60 dark:bg-[#FAF7F2]/40">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-crm-brand-700" />
                      <div>
                        <span className="font-medium text-slate-900 dark:text-[#544B45]">Fabrication General Assembly (GA) Drawing.dwg</span>
                        <span className="block text-[10px] text-[#70665F]">Approved by Dharmesh Joshi on 2026-08-18</span>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-slate-200 dark:bg-[#FAF7F2] text-xs hover:bg-slate-300 font-medium">
                      Download PDF
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-[#EBE3DB] bg-slate-50/60 dark:bg-[#FAF7F2]/40">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-crm-brand-700" />
                      <div>
                        <span className="font-medium text-slate-900 dark:text-[#544B45]">Bill of Materials (BOM-CRV-10K-R2) - 48 Line Items</span>
                        <span className="block text-[10px] text-[#70665F]">Plates, Dish Ends, Nozzles, Baffles, Agitator Shaft</span>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-slate-200 dark:bg-[#FAF7F2] text-xs hover:bg-slate-300 font-medium">
                      View BOM Items
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchase' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-white dark:bg-white">
                <h4 className="font-bold text-sm text-slate-800 dark:text-[#544B45] mb-2">Material Procurement & GRN Inward</h4>
                <div className="space-y-2">
                  {job.linkedRecords.purchaseOrders && job.linkedRecords.purchaseOrders.length > 0 ? (
                    job.linkedRecords.purchaseOrders.map((po, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-[#EBE3DB] bg-slate-50/50">
                        <div>
                          <span className="font-mono font-bold text-crm-brand-700">{po}</span>
                          <span className="block text-[#70665F] text-[11px]">Jindal Stainless Steel Ltd. • Material: SS 316L Plates (8mm & 12mm)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium text-[10px]">
                          GRN Received ({job.linkedRecords.grnNumbers?.[idx] || 'GRN-2026-088'})
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#70665F] text-center py-4">No Purchase Orders raised yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-white dark:bg-white space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-[#544B45] flex items-center justify-between">
                  <span>Job-wise Stock Reservations & Material Slips</span>
                  <span className="text-xs text-sky-600 font-mono font-bold">{job.jobNumber}</span>
                </h4>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-[#544B45]">Reserved Raw Materials & Bought-Outs:</div>
                  {stockReservations.filter((r) => r.jobId === job.jobNumber).length > 0 ? (
                    stockReservations
                      .filter((r) => r.jobId === job.jobNumber)
                      .map((res) => (
                        <div key={res.id} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-[#EBE3DB] bg-slate-50 dark:bg-[#FAF7F2]/40">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-[#211B17]">{res.itemCode} - {res.itemName}</span>
                            <span className="block text-[10px] text-[#70665F]">Warehouse: {res.warehouseName} ({res.locationCode})</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-rose-500 block text-xs">{res.reservedQuantity} Locked</span>
                            <span className="text-[10px] text-emerald-600 font-bold">{res.status}</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-2.5 rounded-lg border border-slate-100 dark:border-[#EBE3DB] bg-slate-50 dark:bg-[#FAF7F2]/40 text-[#70665F]">
                      Material reserved: 3200 Kg SS 316L 10mm Plate (Heat # HEAT-98421)
                    </div>
                  )}

                  <div className="text-xs font-bold text-slate-700 dark:text-[#544B45] pt-2">Material Issue Slips Issued to Shop Floor:</div>
                  {materialIssues.filter((i) => i.jobId === job.jobNumber).length > 0 ? (
                    materialIssues
                      .filter((i) => i.jobId === job.jobNumber)
                      .map((iss) => (
                        <div key={iss.id} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-[#EBE3DB] bg-emerald-50/50 dark:bg-emerald-950/20">
                          <div>
                            <span className="font-mono font-bold text-emerald-600">{iss.issueNumber}</span>
                            <span className="block text-[10px] text-[#70665F]">Stage: {iss.productionStage} • Requested By: {iss.requestedBy}</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-bold text-emerald-600 block text-xs">₹{iss.totalIssueValue?.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-[#70665F]">{iss.status}</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-2.5 rounded-lg border border-slate-100 dark:border-[#EBE3DB] bg-slate-50 dark:bg-[#FAF7F2]/40 text-[#70665F]">
                      Issue Slip ISS-2026-0041: 3200 Kg SS 316L Plates issued to Cutting Bay
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-white dark:bg-white">
                <h4 className="font-bold text-sm text-slate-800 dark:text-[#544B45] mb-2">Shop Floor Work Orders & Routing</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-crm-brand- dark:border-crm-brand- bg-crm-brand-/30">
                    <span className="font-bold text-crm-brand-800 dark:text-crm-brand-">Bay 1: Shell Rolling & Longitudinal Welding</span>
                    <p className="text-[#70665F] mt-1">Operator: Jayesh Parmar • Machine: 4-Roll Hydraulic Plate Bending M/C</p>
                    <div className="mt-2 flex justify-between items-center text-[10px] font-semibold">
                      <span className="text-emerald-600">Status: Completed 100%</span>
                      <span className="text-[#70665F]">WO-2026-064</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/30">
                    <span className="font-bold text-amber-700 dark:text-amber-300">Bay 3: Nozzle Fitment & Agitator Assembly</span>
                    <p className="text-[#70665F] mt-1">Operator: Ramesh V. • Machine: Radial Drilling & TIG Welding Unit</p>
                    <div className="mt-2 flex justify-between items-center text-[10px] font-semibold">
                      <span className="text-crm-brand-700">Status: In Progress (65%)</span>
                      <span className="text-[#70665F]">WO-2026-065</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qc' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-white dark:bg-white space-y-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Quality Inspection & Pressure Tests</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-[#EBE3DB] bg-slate-50">
                  <span className="font-medium">100% Radiography (RT) / DP Test on Weld Joints</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">PASSED</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-[#EBE3DB] bg-slate-50">
                  <span className="font-medium">Hydrostatic Pressure Test @ 12.5 Bar (Held for 4 Hours)</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">SCHEDULED FOR TOMORROW</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-white dark:bg-white space-y-2">
              <h4 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Dispatch, Transport & Site Commissioning</h4>
              <p className="text-[#70665F]">Destination: Dahej Plant 2, Gujarat. Heavy trailer transport with wooden crating.</p>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-white dark:bg-white space-y-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-[#544B45] flex items-center justify-between">
                <span>Job 360° Financial Control & Billing Summary</span>
                <span className="font-mono text-xs text-emerald-600 font-bold">{job.jobNumber}</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#EBE3DB] bg-slate-50/50 dark:bg-[#FAF7F2]/40 font-mono">
                  <span className="text-[#70665F] font-sans block text-[10px]">Sales Contract Value</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-[#211B17]">{formatCurrency(job.orderValue)}</span>
                </div>
                <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 font-mono">
                  <span className="text-emerald-700 dark:text-emerald-400 font-sans block text-[10px]">Total Receipts Collected</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(job.orderValue * 0.35)}</span>
                </div>
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 font-mono">
                  <span className="text-amber-700 dark:text-amber-400 font-sans block text-[10px]">Actual Cost Incurred</span>
                  <span className="text-sm font-bold text-amber-600">{formatCurrency(job.orderValue * 0.65)}</span>
                </div>
                <div className="p-3 rounded-lg border border-crm-brand- dark:border-crm-brand- bg-crm-brand-/40 dark:bg-crm-brand-/20 font-mono">
                  <span className="text-crm-brand-800 dark:text-crm-brand-500 font-sans block text-[10px]">Project Net Margin</span>
                  <span className="text-sm font-bold text-crm-brand-700">{formatCurrency(job.orderValue * 0.35)} (35%)</span>
                </div>
              </div>

              {/* Linked Invoices & Receipts */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#EBE3DB] text-xs">
                <div className="font-bold text-slate-800 dark:text-[#544B45]">Linked Sales & Purchase Invoices</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-[#FAF7F2]/40">
                    <span className="font-mono font-bold text-emerald-600">SINV-2026-0001</span>
                    <span className="block text-[#70665F] text-[10px]">Sales GST Invoice • Grand Total: {formatCurrency(job.orderValue)}</span>
                    <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 inline-block">Approved & Posted</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-[#FAF7F2]/40">
                    <span className="font-mono font-bold text-crm-brand-700">PINV-2026-0001</span>
                    <span className="block text-[#70665F] text-[10px]">Jindal Steel Plate Purchase • Grand Total: ₹1,711,000</span>
                    <span className="text-[10px] text-crm-brand-700 font-bold font-mono mt-0.5 inline-block">Posted to General Ledger</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'service' && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-white dark:bg-white space-y-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-[#544B45] flex items-center justify-between">
                <span>Job 360° Maintenance & Service History</span>
                <span className="font-mono text-xs text-amber-600 font-bold">{job.jobNumber}</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#EBE3DB] bg-slate-50/50 dark:bg-[#FAF7F2]/40 font-mono">
                  <span className="text-[#70665F] font-sans block text-[10px]">Registered Machine Serial</span>
                  <span className="text-sm font-bold text-crm-brand-700">UTF-CR-2026-0019</span>
                </div>
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 font-mono">
                  <span className="text-amber-700 dark:text-amber-400 font-sans block text-[10px]">Warranty Status</span>
                  <span className="text-sm font-bold text-amber-600">Active (In Warranty)</span>
                </div>
                <div className="p-3 rounded-lg border border-crm-brand- dark:border-crm-brand- bg-crm-brand-/40 dark:bg-crm-brand-/20 font-mono">
                  <span className="text-crm-brand-800 dark:text-crm-brand-500 font-sans block text-[10px]">AMC Status</span>
                  <span className="text-sm font-bold text-crm-brand-700">Active AMC Contract</span>
                </div>
                <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 font-mono">
                  <span className="text-emerald-700 dark:text-emerald-400 font-sans block text-[10px]">Service Requests / Visits</span>
                  <span className="text-sm font-bold text-emerald-600">2 Requests / 1 Completed</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#EBE3DB] text-xs">
                <div className="font-bold text-slate-800 dark:text-[#544B45]">Connected Field Service Records</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-[#FAF7F2]/40">
                    <span className="font-mono font-bold text-crm-brand-700">SR-2026-001</span>
                    <span className="block text-[#70665F] text-[10px]">Hydraulic Agitation Pressure Checkup • Reliance Hazira</span>
                    <span className="text-[10px] text-crm-brand-700 font-bold font-mono mt-0.5 inline-block">Scheduled Visit</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-[#FAF7F2]/40">
                    <span className="font-mono font-bold text-green-600">SREP-2026-001</span>
                    <span className="block text-[#70665F] text-[10px]">Signed Service Report • Viton Seal Kit Issued</span>
                    <span className="text-[10px] text-green-600 font-bold font-mono mt-0.5 inline-block">Customer Signed & Approved</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-[#FAF7F2] flex items-center justify-between text-xs print:hidden">
          <span className="text-[#70665F]">
            Tip: Click on any step in the MTO workflow banner above to toggle completion.
          </span>
          <button
            onClick={closeJobModal}
            className="px-4 py-2 bg-[#FAF7F2] dark:bg-[#FAF7F2] text-[#211B17] rounded-lg hover:bg-white transition font-medium"
          >
            Close 360° View
          </button>
        </div>
      </div>
    </div>
  );
}
