'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { DesignJob, DesignJobStatus } from '../../../types/designer';
import {
  Palette,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  FileSpreadsheet,
  Zap,
  X,
  FileText,
  ChevronRight,
  Layers,
  Box,
  RotateCcw,
} from 'lucide-react';

export default function DesignJobsPage() {
  const {
    designJobs,
    addDesignJob,
    updateDesignJob,
    projectJobs,
    salesOrders,
    customers,
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assignedDesigner, setAssignedDesigner] = useState('Dharmesh Joshi');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [requiredDate, setRequiredDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Drawer / View Modal State
  const [selectedJob, setSelectedJob] = useState<DesignJob | null>(null);

  const filteredJobs = designJobs.filter((j) => {
    const matchSearch =
      j.designJobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.projectId?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.jobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.customerName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      j.productName?.toLowerCase().includes(searchQuery?.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || j.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleCreateDesignJob = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projectJobs.find((p) => p.id === selectedProjectId);
    if (!proj) return;

    addDesignJob({
      designJobNumber: `DES-${new Date().getFullYear()}-${String(designJobs.length + 1).padStart(4, '0')}`,
      projectId: proj.id,
      projectNumber: proj.projectNumber,
      jobNumber: proj.jobNumber,
      customerId: proj.customerId,
      customerName: proj.customerName,
      customerPoNumber: proj.customerPoNumber,
      salesOrderNumber: proj.salesOrderNumber,
      productName: proj.productName,
      machineType: proj.productName.includes('Reactor') ? 'Reaction Vessel' : 'Process Equipment',
      quantity: proj.quantity,
      deliveryDate: proj.deliveryDate,
      designManager: 'Dharmesh Joshi',
      assignedDesigner,
      priority,
      requiredDate: requiredDate || proj.deliveryDate,
      status: 'assigned',
      remarks,
      activeRevision: 'REV-00',
    });

    setIsModalOpen(false);
    setSelectedProjectId('');
    setRemarks('');
  };

  return (
    <div className="p-6 space-y-6  text-[#211B17] ">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30 text-xs font-mono font-bold">
              MODULE 3.1
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Palette className="w-7 h-7 text-crm-brand-500" />
              Design & Engineering Jobs Registry
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Linked to Confirmed Project & Job Number: <span className="font-mono text-crm-brand-">Project ID + Job Number</span>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] text-xs font-bold shadow-lg shadow-crm-brand-700/30 transition"
        >
          <Plus className="w-4 h-4" />
          Create Design Job
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Design Job #, Project ID, Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-crm-brand-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="bom_pending">BOM Pending</option>
            <option value="bom_approved">BOM Approved</option>
            <option value="released_to_production">Released to Production</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Design Jobs Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((j) => (
          <div
            key={j.id}
            className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-crm-brand-600/50 transition-all duration-200 shadow-xl flex flex-col justify-between space-y-4 relative group"
          >
            {/* Card Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-crm-brand-500">{j.designJobNumber}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    j.status === 'released_to_production'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : j.status === 'bom_approved' || j.status === 'approved'
                      ? 'bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30'
                      : j.status === 'review'
                      ? 'bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {j.status?.replace(/_/g, ' ')?.toUpperCase()}
                </span>
              </div>

              {/* Primary Relational Reference */}
              <div className="mt-2 p-2 rounded-xl bg-[#FAF7F2]/80 border border-[#EBE3DB] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#70665F] block font-medium">PROJECT & JOB REF</span>
                  <span className="font-mono font-bold text-xs text-[#211B17]">{j.projectId}</span>
                  <span className="font-mono text-xs text-amber-400 ml-2">[{j.jobNumber}]</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- font-mono text-[10px] font-bold">
                  {j.activeRevision}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-extrabold text-[#211B17] text-sm">{j.productName}</h3>
                <p className="text-xs text-[#70665F] mt-0.5">{j.customerName}</p>
              </div>
            </div>

            {/* Machine Specs & Assigned Info */}
            <div className="space-y-1.5 pt-2 border-t border-[#EBE3DB] text-xs text-[#544B45]">
              <div className="flex items-center justify-between">
                <span className="text-[#70665F]">Machine Type:</span>
                <span className="font-medium text-[#3E2723]">{j.machineType || 'Process Equipment'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#70665F]">Quantity:</span>
                <span className="font-mono text-[#3E2723]">{j.quantity} Units</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#70665F]">Assigned Designer:</span>
                <span className="font-bold text-crm-brand- flex items-center gap-1">
                  <User className="w-3 h-3 text-crm-brand-500" />
                  {j.assignedDesigner}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#70665F]">Target Release Date:</span>
                <span className="font-mono text-amber-400 font-bold">{j.requiredDate}</span>
              </div>
            </div>

            {/* Quick Action Link Buttons */}
            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedJob(j)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#3E2723] text-xs font-semibold flex items-center gap-1 transition"
              >
                View Details
              </button>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/designer/bom?job=${j.jobNumber}`}
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                  title="View / Create Master BOM"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </Link>
                <Link
                  href={`/designer/approval?job=${j.jobNumber}`}
                  className="px-3 py-1.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] text-xs font-bold transition flex items-center gap-1"
                >
                  Approval
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Design Job */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <Palette className="w-5 h-5 text-crm-brand-500" />
                Initialize New Design Job
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDesignJob} className="space-y-4 text-xs">
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Select Confirmed Project / Job *</label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                >
                  <option value="">-- Choose Project --</option>
                  {projectJobs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} ({p.jobNumber}) - {p.customerName} ({p.productName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Assigned Lead Designer *</label>
                  <select
                    value={assignedDesigner}
                    onChange={(e) => setAssignedDesigner(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    <option value="Dharmesh Joshi">Dharmesh Joshi (Sr. Design Engineer)</option>
                    <option value="Ketan Patel">Ketan Patel (Design Manager)</option>
                    <option value="Rajesh Patel">Rajesh Patel (Technical Director)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Priority Level *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Target Design Release Date</label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                />
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Design Scope & Engineering Notes</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Specific design requirements, ASME standards, customer motor preferences..."
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-[#544B45] font-bold hover:bg-[#FAF7F2] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-bold transition shadow-lg shadow-crm-brand-700/30"
                >
                  Create Design Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono font-bold text-crm-brand-500 text-sm">{selectedJob.designJobNumber}</span>
                <h3 className="text-base font-extrabold text-[#211B17] mt-0.5">{selectedJob.productName}</h3>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
              <div>
                <span className="text-[#70665F] block">Project ID:</span>
                <span className="font-mono font-bold text-[#211B17] text-sm">{selectedJob.projectId}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Job Number:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{selectedJob.jobNumber}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Customer Name:</span>
                <span className="font-bold text-[#3E2723]">{selectedJob.customerName}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Customer PO Ref:</span>
                <span className="font-mono text-[#3E2723]">{selectedJob.customerPoNumber}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Active Revision:</span>
                <span className="font-mono font-bold text-crm-brand-500">{selectedJob.activeRevision}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Current Status:</span>
                <span className="font-bold text-emerald-400 uppercase">{selectedJob.status?.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="p-3 bg-white/40 rounded-xl space-y-1">
              <span className="text-[#70665F] font-bold block">Engineering Remarks / Notes:</span>
              <p className="text-[#544B45] leading-relaxed">{selectedJob.remarks || 'Standard ASME Sec VIII Div 1 design calculations applied.'}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
              <Link
                href={`/designer/customer-requirements?job=${selectedJob.jobNumber}`}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-amber-400 font-bold"
              >
                Requirement Spec Sheet
              </Link>
              <Link
                href={`/designer/bom?job=${selectedJob.jobNumber}`}
                className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-bold"
              >
                Go to Master BOM
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
