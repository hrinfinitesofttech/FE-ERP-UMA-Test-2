'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
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
  const { job360List } = useERP();
  const [selectedJobId, setSelectedJobId] = useState<string>('JOB-2026-001');
  const [activeTab, setActiveTab] = useState<string>('overview');

  const currentJob = job360List.find((j) => j.header.jobNumber === selectedJobId) || job360List[0];

  if (!currentJob) {
    return (
      <div className="p-8 text-center bg-slate-950 min-h-screen text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Job 360° Life-Cycle Console</h2>
        <p>No job records available or loading live data from API...</p>
      </div>
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
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Top Header & Job Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{header.jobNumber}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30">
                  {header.jobStatus.replace(/_/g, ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
                  {header.priority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{header.productName}</p>
            </div>
          </div>
        </div>

        {/* Job Selection Dropdown & Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Select Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-transparent text-cyan-400 font-bold outline-none cursor-pointer"
            >
              {job360List.map((j) => (
                <option key={j.header.jobNumber} value={j.header.jobNumber} className="bg-slate-900 text-slate-200">
                  {j.header.jobNumber} - {j.header.customerName}
                </option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-md transition">
            <Download className="w-4 h-4" /> Export Job Dossier PDF
          </button>
        </div>
      </div>

      {/* 360 Header Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</span>
          <div className="text-xs font-bold text-white truncate">{header.customerName}</div>
          <div className="text-[10px] text-slate-400 font-mono">PO: {header.customerPoNumber}</div>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project / Manager</span>
          <div className="text-xs font-bold text-cyan-400 truncate">{header.projectNumber}</div>
          <div className="text-[10px] text-slate-400 truncate">{header.projectManager}</div>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Delivery</span>
          <div className="text-xs font-bold text-amber-400">{header.plannedDeliveryDate}</div>
          <div className="text-[10px] text-emerald-400 font-semibold">On Schedule</div>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Value</span>
          <div className="text-xs font-bold text-emerald-400 font-mono">₹{header.totalJobValue.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 font-mono">SO: {header.salesOrderNumber}</div>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actual Cost</span>
          <div className="text-xs font-bold text-rose-400 font-mono">₹{header.totalJobCost.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 font-mono">Material + Labour</div>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margin Profit</span>
          <div className="text-xs font-bold text-teal-400 font-mono">₹{header.profitAmount.toLocaleString()}</div>
          <div className="text-[10px] text-teal-400 font-bold font-mono">{header.marginPercent}% Gross Margin</div>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Progress</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${header.overallProgressPercent}%` }} />
            </div>
            <span className="text-xs font-black text-cyan-400 font-mono">{header.overallProgressPercent}%</span>
          </div>
        </div>
      </div>

      {/* 13 Tab Navigation Header */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isSelected ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents View Area */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" /> Job 360° Complete Executive Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Current Stage & Status</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Current Phase:</span>
                    <span className="font-bold text-white">Production Shopfloor</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Design Status:</span>
                    <span className="font-bold text-emerald-400">Approved (BOM REV-02)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Material Availability:</span>
                    <span className="font-bold text-emerald-400">100% In Stock & Issued</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Quality Inspection:</span>
                    <span className="font-bold text-amber-400">In-Process QC Passed</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Financial Snapshot</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">Sales Value:</span>
                    <span className="font-bold text-white">₹{header.totalJobValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">Material Cost:</span>
                    <span className="text-rose-400">₹{store.reservedStockValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">Gross Profit:</span>
                    <span className="font-bold text-teal-400">₹{header.profitAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">Margin:</span>
                    <span className="font-bold text-teal-400">{header.marginPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Next Actions</h4>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  <li>Complete Jacket Heating Coil Assembly & Welding (WC-WELD-02)</li>
                  <li>Perform Hydrostatic Pressure Test with QA Inspector</li>
                  <li>Generate Final Packing List & Logistics Booking</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. CRM TAB */}
        {activeTab === 'crm' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" /> Commercial & Sales Engine Lifecycle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">1. Lead Enquiry</span>
                <div className="font-bold text-white">{crm.leadNumber}</div>
                <div className="text-slate-400">Source: {crm.leadSource}</div>
                <div className="text-slate-400">Date: {crm.enquiryDate}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">2. Sales Quotation</span>
                <div className="font-bold text-cyan-400">{crm.quotationNumber}</div>
                <div className="font-mono text-emerald-400 font-bold">₹{crm.quotationValue.toLocaleString()}</div>
                <div className="text-slate-400">Status: {crm.quotationStatus}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">3. Customer PO</span>
                <div className="font-bold text-purple-400">{crm.customerPoNumber}</div>
                <div className="text-slate-400">PO Date: {crm.customerPoDate}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">4. Confirmed Sales Order</span>
                <div className="font-bold text-emerald-400">{crm.salesOrderNumber}</div>
                <div className="font-mono text-white font-bold">₹{crm.salesOrderValue.toLocaleString()}</div>
                <div className="text-slate-400">Date: {crm.salesOrderDate}</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. PROJECT TAB */}
        {activeTab === 'project' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" /> Project Milestones & Department Assignments
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Project: {project.projectName} ({project.projectNumber})</span>
                <span className="text-slate-400 font-mono">{project.completedTasks} / {project.totalTasks} Tasks Completed</span>
              </div>
              <div className="space-y-2">
                {project.departmentAssignments.map((dept, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-white">{dept.department}</span>
                      <span className="text-slate-400 ml-2">({dept.head})</span>
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" /> Engineering CAD Design & Approved BOM
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400">Design Document: {design.designJobNumber}</span>
                <p className="text-slate-300">{design.requirementsSummary}</p>
                <div className="text-slate-400">Revision: <span className="text-white font-bold">{design.designRevision}</span></div>
                <div className="text-slate-400">Approved By: {design.approvedBy} ({design.approvalDate})</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400">Bill of Materials: {design.bomNumber} ({design.bomRevision})</span>
                <div className="text-slate-300">Total Component Items: <span className="font-bold text-white">{design.bomItemsCount} Items</span></div>
                <div className="text-emerald-400 font-semibold">Status: Released to Production & Procurement</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. PURCHASE TAB */}
        {activeTab === 'purchase' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" /> Material Procurement & Supplier PO Traceability
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Item Code</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Req / Rec Qty</th>
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {purchase.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-cyan-400">{item.itemCode}</td>
                      <td className="p-3 font-sans text-slate-200">{item.description}</td>
                      <td className="p-3">{item.requiredQty} / {item.receivedQty}</td>
                      <td className="p-3 text-purple-400 font-bold">{item.poNumber}</td>
                      <td className="p-3 font-sans text-slate-300">{item.supplierName}</td>
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" /> Store Warehouse Stock & Material Issue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-sans">Reserved Stock Value</div>
                <div className="text-lg font-bold text-emerald-400">₹{store.reservedStockValue.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-sans">Material Issued Count</div>
                <div className="text-lg font-bold text-blue-400">{store.materialIssuedCount} Slips</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-sans">Stock Shortages</div>
                <div className="text-lg font-bold text-emerald-400">{store.stockShortageItemsCount} Items (Clear)</div>
              </div>
            </div>
          </div>
        )}

        {/* 7. PRODUCTION TAB */}
        {activeTab === 'production' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-orange-400" /> Shopfloor Operations & Work Center Progress
            </h3>
            <div className="space-y-2">
              {production.operations.map((op, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{op.operationName}</div>
                    <div className="text-slate-400 text-[10px]">Work Center: {op.workCenter}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400 font-bold">{op.progress}%</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${op.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : op.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" /> Quality Assurance & Hydro-Testing Log
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white">Quality Inspection Certificate: {quality.qcCertificateNumber}</div>
              <div className="text-slate-400">Inspector: {quality.inspectorName}</div>
              <div className="text-slate-400">Incoming Material QC: <span className="text-emerald-400 font-bold">{quality.incomingQcPassCount} Passed</span> / 0 Failed</div>
              <div className="text-slate-400">In-Process Welding QC: <span className="text-emerald-400 font-bold">{quality.inProcessQcPassCount} Passed</span></div>
            </div>
          </div>
        )}

        {/* 9. DISPATCH TAB */}
        {activeTab === 'dispatch' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" /> Logistics, Dispatch & On-Site Installation
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white">Transporter: {dispatch.transporterName}</div>
              <div className="text-slate-400">Scheduled Dispatch Date: {dispatch.dispatchDate}</div>
              <div className="text-slate-400">Installation Date: {dispatch.installationDate}</div>
              <div className="text-slate-400">Field Technician: {dispatch.installedByTech}</div>
            </div>
          </div>
        )}

        {/* 10. ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" /> Financial Ledgers, Revenue & Margins
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono">
                <span className="font-sans font-bold text-cyan-400">Invoice Details</span>
                <div className="text-white">Invoice #: {accounts.salesInvoiceNumber}</div>
                <div className="text-emerald-400 font-bold">Total Grand Invoice: ₹{accounts.grandTotal.toLocaleString()}</div>
                <div className="text-slate-400">Received Amount: ₹{accounts.receivedAmount.toLocaleString()}</div>
                <div className="text-rose-400 font-bold">Outstanding Balance: ₹{accounts.outstandingBalance.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono">
                <span className="font-sans font-bold text-teal-400">Job Costing Summary</span>
                <div className="text-slate-300">Total Revenue: ₹{header.totalJobValue.toLocaleString()}</div>
                <div className="text-rose-400">Total Actual Cost: ₹{accounts.totalActualCost.toLocaleString()}</div>
                <div className="text-teal-400 font-bold text-sm">Gross Profit Margin: ₹{accounts.grossMarginAmount.toLocaleString()} ({accounts.grossMarginPercent}%)</div>
              </div>
            </div>
          </div>
        )}

        {/* 11. SERVICE TAB */}
        {activeTab === 'service' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-rose-400" /> Post-Dispatch Warranty & AMC Contract
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400">Warranty Status: {service.warrantyStatus} (Valid till {service.warrantyEndDate})</div>
              <div className="text-slate-300">AMC Proposal: {service.amcContractNumber}</div>
              <div className="text-slate-400">Logged Breakdown Events: {service.breakdownEventsCount}</div>
            </div>
          </div>
        )}

        {/* 12. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> Job Attachments & Technical Documents
            </h3>
            <div className="space-y-2 text-xs">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{doc.fileName}</div>
                    <div className="text-slate-400 text-[10px]">{doc.documentType} • {doc.fileSize} • Uploaded by {doc.uploadedBy} on {doc.uploadDate}</div>
                  </div>
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition">
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-yellow-400" /> Chronological Event Activity Trail
            </h3>
            <div className="border-l-2 border-slate-800 ml-3 space-y-4 pl-4 text-xs">
              {timeline.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-slate-900" />
                  <div className="font-bold text-white">{item.action} <span className="text-slate-400 font-normal">({item.module})</span></div>
                  <div className="text-slate-300">{item.description}</div>
                  <div className="text-[10px] text-slate-500">{item.timestamp} • By {item.user}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
