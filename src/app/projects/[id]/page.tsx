'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { WorkflowStepper } from '../../../components/workflow/WorkflowStepper';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  Briefcase,
  Building,
  Calendar,
  Clock,
  Cpu,
  FileText,
  ShoppingCart,
  Wrench,
  ShieldCheck,
  Truck,
  DollarSign,
  CheckCircle2,
  Folder,
  Activity as ActivityIcon,
  ChevronLeft,
  ArrowRight,
  User,
  AlertTriangle,
  Send,
  Plus,
  Printer,
  Edit,
  Tag,
  Share2,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const {
    projectJobs,
    salesOrders,
    quotations,
    customerPOs,
    customers,
    leads,
    projectTasks,
    projectPlanningStages,
    projectMilestones,
    projectIssues,
    projectDelays,
    changeRequests,
    projectDocuments,
    projectCosts,
    projectComments,
    projectActivities,
    addProjectComment,
    openJobModal,
    jobs,
  } = useERP();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'crm'
    | 'design'
    | 'purchase'
    | 'store'
    | 'production'
    | 'qc'
    | 'dispatch'
    | 'accounts'
    | 'installation'
    | 'service'
    | 'documents'
    | 'timeline'
  >('overview');

  const [newCommentText, setNewCommentText] = useState('');

  // Find Project by ID or Project Number
  const project = projectJobs.find(
    (p) => p.id === id || p.projectNumber?.toLowerCase() === (id as string)?.toLowerCase() || p.jobNumber?.toLowerCase() === (id as string)?.toLowerCase()
  );

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-[#211B17]">Project / Job Not Found</h2>
        <p className="text-[#70665F] text-xs">No matching project found for ID "{id}".</p>
        <Link href="/projects/list" className="inline-flex items-center gap-2 px-4 py-2 bg-crm-brand-700 text-white font-bold rounded-xl text-xs">
          <ChevronLeft className="w-4 h-4" /> Back to Project List
        </Link>
      </div>
    );
  }

  // Related CRM & Job Traceability records
  const salesOrder = salesOrders.find((s) => s.id === project.salesOrderId || s.salesOrderNumber === project.salesOrderNumber);
  const customerPO = customerPOs.find((p) => p.poNumber === project.customerPoNumber || p.id === project.customerPoNumber);
  const quotation = quotations.find((q) => q.quotationNumber === project.quotationNumber || q.id === project.quotationNumber || q.id === salesOrder?.quotationId || q.quotationNumber === salesOrder?.quotationNumber);
  const linkedCustomer = customers.find((c) => c.id === project.customerId || c.companyName?.toLowerCase() === project.customerName?.toLowerCase());
  const linkedLead = leads.find((l) => l.companyName?.toLowerCase() === project.customerName?.toLowerCase() || l.id === project.customerId);
  const traceableJob = jobs.find((j) => j.jobNumber === project.jobNumber);

  // Dynamic Contact Information Resolution (Priority: Quotation entered data -> SO -> PO -> Customer -> Lead)
  const displayContactPerson =
    (project.customerContact && project.customerContact !== 'Harish Trivedi' ? project.customerContact : null) ||
    quotation?.contactPerson ||
    (salesOrder as any)?.contactPerson ||
    (customerPO as any)?.contactPerson ||
    linkedCustomer?.contactPerson ||
    linkedLead?.contactPerson ||
    project.customerContact ||
    '-';

  const displayContactEmail =
    (project.contactEmail && project.contactEmail !== 'harish.trivedi@gacl.co.in' ? project.contactEmail : null) ||
    quotation?.contactEmail ||
    (salesOrder as any)?.contactEmail ||
    (customerPO as any)?.contactEmail ||
    linkedCustomer?.email ||
    linkedLead?.email ||
    project.contactEmail ||
    '-';

  const displayContactMobile =
    (project.contactMobile && project.contactMobile !== '+91 98251 99881' ? project.contactMobile : null) ||
    quotation?.contactMobile ||
    (quotation as any)?.contactPhone ||
    (salesOrder as any)?.contactMobile ||
    (salesOrder as any)?.contactPhone ||
    (customerPO as any)?.contactMobile ||
    linkedCustomer?.mobile ||
    (linkedCustomer as any)?.phone ||
    linkedLead?.mobile ||
    (linkedLead as any)?.phone ||
    project.contactMobile ||
    '-';

  // Filtered sub-records for this project
  const tasks = projectTasks.filter((t) => t.projectId === project.id || t.jobNumber === project.jobNumber);
  const stages = projectPlanningStages.filter((s) => s.projectId === project.id || s.jobNumber === project.jobNumber);
  const milestones = projectMilestones.filter((m) => m.projectId === project.id || m.jobNumber === project.jobNumber);
  const issues = projectIssues.filter((i) => i.projectId === project.id || i.jobNumber === project.jobNumber);
  const delays = projectDelays.filter((d) => d.projectId === project.id || d.jobNumber === project.jobNumber);
  const cRequests = changeRequests.filter((cr) => cr.projectId === project.id || cr.jobNumber === project.jobNumber);
  const documents = projectDocuments.filter((d) => d.projectId === project.id || d.jobNumber === project.jobNumber);
  const costs = projectCosts.filter((c) => c.projectId === project.id || c.jobNumber === project.jobNumber);
  const comments = projectComments.filter((c) => c.projectId === project.id || c.jobNumber === project.jobNumber);
  const activities = projectActivities.filter((a) => a.projectId === project.id || a.jobNumber === project.jobNumber);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addProjectComment({
      projectId: project.id,
      jobNumber: project.jobNumber,
      authorName: 'Bhavin Shah',
      authorRole: 'Project Manager',
      text: newCommentText,
    });
    setNewCommentText('');
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#70665F] hover:text-slate-900 dark:hover:text-[#211B17] font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Projects
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 dark:bg-[#FAF7F2] hover:bg-slate-200 text-slate-700 dark:text-[#544B45] rounded-xl font-bold flex items-center gap-1.5 border border-slate-200 dark:border-[#EBE3DB]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Job Traveler</span>
          </button>
          <button
            onClick={() => openJobModal(project.jobNumber)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>360° Traceability</span>
          </button>
        </div>
      </div>

      {/* Main 360° Header Banner */}
      <div className="bg-gradient-to-r from-[#0B1120] via-[#1E293B] to-[#0B1120] text-[#211B17] p-6 rounded-2xl border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-crm-brand-700 font-mono font-black text-sm text-white shadow-md">
                {project.jobNumber}
              </span>
              <span className="font-mono text-[#544B45] font-bold bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EBE3DB]">
                PRJ: {project.projectNumber}
              </span>
              <StatusBadge status={project.status as any} />
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase border border-amber-500/30">
                Priority: {project.priority}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#211B17] mt-2">
              {project.customerName}
            </h1>
            <p className="text-[#544B45] font-semibold text-xs flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>{project.productName}</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] min-w-[240px] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#70665F]">Overall Progress:</span>
              <span className="font-bold text-crm-brand-500 text-sm font-mono">{project.progressPercent}%</span>
            </div>
            <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-crm-brand-600 via-crm-brand-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#70665F] pt-1">
              <span>Target Delivery:</span>
              <span className="font-mono text-[#211B17] font-bold">{formatDate(project.deliveryDate)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Workflow Stepper */}
        {traceableJob && (
          <div className="pt-3 border-t border-[#EBE3DB]">
            <div className="text-[11px] text-[#70665F] font-bold uppercase tracking-wider mb-2">Live Shop Floor Lifecycle Stepper</div>
            <WorkflowStepper steps={traceableJob.steps} />
          </div>
        )}
      </div>

      {/* 13 Tab Navigation */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-md p-1.5 overflow-x-auto scrollbar-thin print:hidden">
        <div className="flex items-center gap-1 min-w-max text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'crm', label: 'CRM', icon: FileText },
            { id: 'design', label: 'Design', icon: Cpu },
            { id: 'purchase', label: 'Purchase', icon: ShoppingCart },
            { id: 'store', label: 'Store', icon: Folder },
            { id: 'production', label: 'Production', icon: Wrench },
            { id: 'qc', label: 'QC', icon: ShieldCheck },
            { id: 'dispatch', label: 'Dispatch', icon: Truck },
            { id: 'accounts', label: 'Accounts', icon: DollarSign },
            { id: 'installation', label: 'Installation', icon: Building },
            { id: 'service', label: 'Service', icon: CheckCircle2 },
            { id: 'documents', label: 'Documents', icon: Folder },
            { id: 'timeline', label: 'Timeline', icon: ActivityIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-crm-brand-700 text-white shadow-md shadow-crm-brand-700/30'
                    : 'text-slate-600 dark:text-[#70665F] hover:bg-slate-100 dark:hover:bg-[#FAF7F2] hover:text-slate-900 dark:hover:text-[#211B17]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Containers */}
      <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-md">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-50 dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-[#211B17] border-b border-slate-200 dark:border-[#EBE3DB] pb-2 text-xs flex items-center gap-2">
                  <Building className="w-4 h-4 text-crm-brand-600" /> Customer Information
                </h3>
                <div className="space-y-1.5 text-slate-700 dark:text-[#544B45]">
                  <div><span className="text-[#70665F]">Company:</span> <strong className="text-slate-900 dark:text-[#211B17]">{project.customerName}</strong></div>
                  <div><span className="text-[#70665F]">Contact Person:</span> <strong className="text-slate-900 dark:text-[#211B17]">{displayContactPerson}</strong></div>
                  <div><span className="text-[#70665F]">Email:</span> {displayContactEmail}</div>
                  <div><span className="text-[#70665F]">Mobile:</span> {displayContactMobile}</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-[#211B17] border-b border-slate-200 dark:border-[#EBE3DB] pb-2 text-xs flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" /> Machine Specifications
                </h3>
                <div className="space-y-1.5 text-slate-700 dark:text-[#544B45]">
                  <div><span className="text-[#70665F]">Equipment:</span> <strong className="text-slate-900 dark:text-[#211B17]">{project.productName}</strong></div>
                  <div><span className="text-[#70665F]">Specification:</span> {project.specification}</div>
                  <div><span className="text-[#70665F]">Quantity:</span> {project.quantity} {project.unit}</div>
                  <div><span className="text-[#70665F]">Capacity / Scope:</span> {project.capacity || '10,000 L / 8 Bar Pressure'}</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-[#211B17] border-b border-slate-200 dark:border-[#EBE3DB] pb-2 text-xs flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" /> Project Governance
                </h3>
                <div className="space-y-1.5 text-slate-700 dark:text-[#544B45]">
                  <div><span className="text-[#70665F]">Project Manager:</span> <strong className="text-crm-brand-700 dark:text-crm-brand-500">{project.projectManager}</strong></div>
                  <div><span className="text-[#70665F]">Start Date:</span> {formatDate(project.startDate)}</div>
                  <div><span className="text-[#70665F]">Target Delivery:</span> {formatDate(project.deliveryDate)}</div>
                  <div><span className="text-[#70665F]">Order Value:</span> <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(project.orderValue)}</span></div>
                </div>
              </div>
            </div>

            {/* Stage Progress Summary */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Department Progress Bar Matrix</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { name: 'Design CAD', val: 100, color: 'bg-crm-brand-600' },
                  { name: 'Material & PO', val: 100, color: 'bg-crm-brand-600' },
                  { name: 'Store Inward', val: 100, color: 'bg-teal-500' },
                  { name: 'Production', val: 72, color: 'bg-emerald-500' },
                  { name: 'QC & Testing', val: 0, color: 'bg-slate-300' },
                ].map((stg) => (
                  <div key={stg.name} className="p-3 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span>{stg.name}</span>
                      <span className="font-mono font-bold text-crm-brand-600">{stg.val}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#FAF7F2] h-2 rounded-full overflow-hidden">
                      <div className={`${stg.color} h-full rounded-full`} style={{ width: `${stg.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">CRM Handover & Commercial References</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-crm-brand-/40 dark:bg-crm-brand-/20 border border-crm-brand- dark:border-crm-brand-/50 rounded-xl space-y-2">
                <div className="font-bold text-crm-brand-800 dark:text-crm-brand- flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Quotation Reference
                </div>
                <div className="text-xs space-y-1">
                  <div>Quotation #: <strong>{project.quotationNumber}</strong></div>
                  <div>Quotation Value: {formatCurrency(quotation?.latestSummary?.grandTotal || (quotation?.revisions && quotation.revisions[quotation.revisions.length - 1]?.grandTotal) || project.orderValue)}</div>
                  <div>Status: <span className="text-emerald-600 font-bold">Accepted</span></div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-2">
                <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Customer Purchase Order
                </div>
                <div className="text-xs space-y-1">
                  <div>PO #: <strong>{project.customerPoNumber}</strong></div>
                  <div>PO Date: {customerPO?.poDate || '2026-08-08'}</div>
                  <div>Payment Terms: {customerPO?.paymentTerms || project.paymentTerms || '30% Advance, 60% ag. Proforma, 10% Handover'}</div>
                </div>
              </div>

              <div className="p-4 bg-crm-brand-/40 dark:bg-crm-brand-/20 border border-crm-brand- dark:border-crm-brand-/50 rounded-xl space-y-2">
                <div className="font-bold text-crm-brand-800 dark:text-crm-brand- flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Confirmed Sales Order
                </div>
                <div className="text-xs space-y-1">
                  <div>Sales Order #: <strong>{project.salesOrderNumber}</strong></div>
                  <div>Order Date: {salesOrder?.orderDate || project.startDate}</div>
                  <div>Assigned PM: {project.projectManager}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DESIGN */}
        {activeTab === 'design' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Engineering Design & BOM Release</h3>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold rounded">Design Approved</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-[#544B45]">Drawings & CAD Specs</h4>
                <p className="text-[#70665F]">General Arrangement Drawing: GA_SS316L_Reactor_10K_Rev1.dwg (Approved)</p>
                <div className="text-[11px] text-[#70665F]">Design Code: ASME Sec VIII Div 1 | Shell Thickness: 8mm | Dish End: 10mm</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-[#544B45]">Bill of Materials (BOM)</h4>
                <p className="text-[#70665F]">Master BOM: {(project as any)?.bomNumber || (project?.jobNumber ? `BOM-${project.jobNumber}` : 'Pending')}</p>
                <div className="text-[11px] text-[#70665F]">Design Code: Standard Engineering Specs</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PURCHASE */}
        {activeTab === 'purchase' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Material Procurement & Purchase Orders</h3>
            <div className="border border-slate-200 dark:border-[#EBE3DB] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white text-[#70665F] font-semibold border-b border-slate-200 dark:border-[#EBE3DB]">
                  <tr>
                    <th className="p-3">PO #</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Material / Component</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#EBE3DB]">
                  <tr>
                    <td className="p-3 font-mono font-bold text-crm-brand-600">PO-2026-154</td>
                    <td className="p-3 font-bold">Jindal Stainless Ltd</td>
                    <td className="p-3">SS 316L Plates (8mm & 10mm) SA 240</td>
                    <td className="p-3 font-mono">₹14,20,000</td>
                    <td className="p-3"><span className="text-emerald-500 font-bold">Delivered (GRN-2026-095)</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-crm-brand-600">PO-2026-158</td>
                    <td className="p-3 font-bold">Flowserve Sanmar Pvt Ltd</td>
                    <td className="p-3">Dual Mechanical Seal + Thermosiphon Pot</td>
                    <td className="p-3 font-mono">₹4,85,000</td>
                    <td className="p-3"><span className="text-emerald-500 font-bold">Delivered (GRN-2026-102)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: STORE */}
        {activeTab === 'store' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Store GRN & Material Issue</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-[#544B45]">Goods Receipt Note (GRN)</h4>
                <div className="text-xs text-slate-600 dark:text-[#70665F] space-y-1">
                  <div>GRN #: <strong className="font-mono text-crm-brand-600">GRN-2026-095</strong></div>
                  <div>Received: 4.2 MT SS 316L Plates with 3.1 MTC</div>
                  <div>Inspection: Approved by Store QC</div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-[#544B45]">Material Issued to Production</h4>
                <div className="text-xs text-slate-600 dark:text-[#70665F] space-y-1">
                  <div>MIS #: <strong className="font-mono text-emerald-500">MIS-2026-210</strong></div>
                  <div>Issued To: Bay-2 Shop Floor (Fitting & Rolling Team)</div>
                  <div>Issue Date: 2026-09-11</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PRODUCTION */}
        {activeTab === 'production' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Shop Floor Production Work Orders</h3>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold rounded">Production 72% Complete</span>
            </div>
            <div className="border border-slate-200 dark:border-[#EBE3DB] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white text-[#70665F] font-semibold border-b border-slate-200 dark:border-[#EBE3DB]">
                  <tr>
                    <th className="p-3">Operation / Work Order</th>
                    <th className="p-3">Bay / Station</th>
                    <th className="p-3">Assigned Team</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#EBE3DB]">
                  <tr>
                    <td className="p-3 font-bold">Plasma Plate Cutting & Beveling</td>
                    <td className="p-3">Bay 1 CNC Plasma</td>
                    <td className="p-3">Ramesh (Plasma Operator)</td>
                    <td className="p-3 text-emerald-500 font-bold">Completed</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Shell Rolling & Long Seam Welding</td>
                    <td className="p-3">Bay 2 Heavy Fabrication</td>
                    <td className="p-3">Suresh & Team (TIG Welders)</td>
                    <td className="p-3 text-emerald-500 font-bold">Completed</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Jacket Dimple Fitting & Welding</td>
                    <td className="p-3">Bay 2 Heavy Fabrication</td>
                    <td className="p-3">Mahesh Fitter</td>
                    <td className="p-3 text-crm-brand-600 font-bold">In Progress (85%)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Agitator Mounting & Alignment</td>
                    <td className="p-3">Bay 3 Assembly Station</td>
                    <td className="p-3">Assembly Team A</td>
                    <td className="p-3 text-[#70665F] font-bold">Pending</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: QC */}
        {activeTab === 'qc' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Quality Control & Non-Destructive Testing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-1">
                <div className="text-[#70665F] font-bold">1. Radiography Test (RT)</div>
                <div className="text-emerald-500 font-bold text-xs">100% Pass (RT Report # RT-901)</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-1">
                <div className="text-[#70665F] font-bold">2. Dye Penetrant (DP) Test</div>
                <div className="text-emerald-500 font-bold text-xs">Approved (DP Report # DP-442)</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-1">
                <div className="text-[#70665F] font-bold">3. Hydrostatic Test (12.5 Bar)</div>
                <div className="text-amber-500 font-bold text-xs">Scheduled for 6th Oct</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: DISPATCH */}
        {activeTab === 'dispatch' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Logistics & Dispatch Planning</h3>
            <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-2 text-xs">
              <div>Target Dispatch Date: <strong>{project.deliveryDate || 'TBD'}</strong></div>
              <div>Transport Type: Standard Heavy Industrial Freight</div>
              <div>Destination: {project.customerName || 'Client Site'}</div>
              <div className="text-[#70665F]">Delivery Challan & E-Way Bill will be generated upon final QC approval.</div>
            </div>
          </div>
        )}

        {/* TAB 9: ACCOUNTS */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Financial Invoicing & Payment Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
                <div className="text-[#70665F] font-bold">Total Order Value</div>
                <div className="text-lg font-black text-slate-900 dark:text-[#211B17] font-mono">{formatCurrency(project.orderValue)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
                <div className="text-[#70665F] font-bold">Advance Received (30%)</div>
                <div className="text-lg font-black text-emerald-500 font-mono">₹14,55,000</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
                <div className="text-[#70665F] font-bold">Balance Due</div>
                <div className="text-lg font-black text-crm-brand-600 font-mono">₹33,95,000</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: INSTALLATION */}
        {activeTab === 'installation' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Site Erection & Commissioning</h3>
            <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-2 text-xs">
              <div>Assigned Site Engineer: <strong>Site Team A (Lead: Dipak Joshi)</strong></div>
              <div>Planned Installation Period: 13 Oct 2026 to 15 Oct 2026</div>
              <div>Scope: Foundation Alignment, Agitator Nozzle Connection, Dry Run & Water Run.</div>
            </div>
          </div>
        )}

        {/* TAB 11: SERVICE */}
        {activeTab === 'service' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Warranty & After-Sales Service</h3>
            <div className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-2 text-xs">
              <div>Warranty Coverage: 18 Months from Dispatch date or 12 Months from commissioning.</div>
              <div>Service Desk Ref: {project?.jobNumber ? `SERV-${project.jobNumber}` : 'N/A'}</div>
            </div>
          </div>
        )}

        {/* TAB 12: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Project Document Vault</h3>
            <div className="border border-slate-200 dark:border-[#EBE3DB] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white text-[#70665F] font-semibold border-b border-slate-200 dark:border-[#EBE3DB]">
                  <tr>
                    <th className="p-3">Document Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Uploaded By</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#EBE3DB]">
                  {documents.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-[#70665F]">No documents uploaded yet.</td></tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td className="p-3 font-bold text-crm-brand-600 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-crm-brand-600" />
                          <span>{doc.documentName}</span>
                        </td>
                        <td className="p-3">{doc.type}</td>
                        <td className="p-3 font-mono text-crm-brand-600 font-bold">{doc.version}</td>
                        <td className="p-3">{doc.uploadedBy}</td>
                        <td className="p-3 font-mono">{formatDate(doc.uploadDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 13: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Project Activity Timeline & Internal Notes</h3>

            {/* Audit Log Chronology */}
            <div className="space-y-3 relative pl-6 border-l-2 border-slate-200 dark:border-[#EBE3DB]">
              {activities.length === 0 ? (
                <div className="text-[#70665F]">No activity logs recorded yet.</div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="relative group">
                    <div className="w-3 h-3 bg-crm-brand-600 rounded-full absolute -left-[31px] top-1.5 border-2 border-white dark:border-[#EBE3DB]" />
                    <div className="p-3 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-[#211B17]">{act.action}</span>
                        <span className="text-[10px] text-[#70665F] font-mono">{act.date} {act.time}</span>
                      </div>
                      <p className="text-slate-600 dark:text-[#70665F] text-[11px]">{act.details}</p>
                      <div className="text-[10px] text-[#70665F] font-semibold">By: {act.userName} ({act.userRole})</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Communication & Comments Box */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#EBE3DB] space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Internal Team Comments</h4>
              
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-50 dark:bg-[#FAF7F2] rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-[#211B17]">{c.authorName} <span className="text-[#70665F] text-[10px]">({c.authorRole})</span></span>
                      <span className="text-[10px] text-[#70665F] font-mono">{c.date} {c.time}</span>
                    </div>
                    <p className="text-slate-700 dark:text-[#544B45] text-xs">{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add internal project comment / note..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
