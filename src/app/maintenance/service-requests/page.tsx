'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ServiceRequestStatus, CriticalityLevel, ServiceRequestOrigin } from '../../../types/maintenance';
import {
  PhoneCall,
  Plus,
  Search,
  Filter,
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  X,
  FileText,
  Building,
} from 'lucide-react';

export default function ServiceRequestsPage() {
  const { serviceRequests, addServiceRequest, updateServiceRequestStatus, customerMachines, technicians, isInitialLoading } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Request Form State
  const [formData, setFormData] = useState({
    origin: 'Customer' as ServiceRequestOrigin,
    customerId: '',
    customerName: '',
    customerMachineId: '',
    machineName: '',
    serialNumber: '',
    jobNumber: '',
    contactPerson: '',
    mobile: '',
    email: '',
    complaintType: '',
    description: '',
    priority: 'Medium' as CriticalityLevel,
    warrantyStatus: 'Under Warranty' as const,
    amcStatus: 'Active AMC' as const,
    preferredVisitDate: new Date().toISOString().split('T')[0],
    location: '',
    attachments: [],
    assignedDepartment: 'Service & After-Sales',
    assignedTechnicianId: '',
    assignedTechnicianName: '',
    status: 'New' as ServiceRequestStatus,
  });

  const filteredRequests = serviceRequests.filter((sr) => {
    const matchesSearch =

      !searchTerm?.trim() || (

      sr.requestNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      sr.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      sr.machineName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      sr.serialNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      sr.complaintType?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    const matchesStatus = statusFilter === 'all' || sr.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || sr.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceRequest(formData);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
              SERVICE DESK
            </span>
            <span className="text-xs text-[#70665F]">Omnichannel Customer Complaint Logging</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-emerald-500" />
            Service Requests Management
          </h1>
          <p className="text-xs text-[#70665F]">
            Log, track, and assign customer service calls originated from Customer, CRM, Phone, Email, WhatsApp, PM or Breakdown Alerts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          Log New Service Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search SR no, customer, machine, serial or complaint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-[#70665F]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting for Parts">Waiting for Parts</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Service Request Cards */}
      {isInitialLoading && filteredRequests.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, rIdx) => (
            <div key={`sr-skel-${rIdx}`} className="bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 animate-pulse space-y-3">
              <div className="h-4 bg-[#EBE3DB]/70 rounded w-1/3"></div>
              <div className="h-5 bg-[#EBE3DB]/50 rounded w-2/3"></div>
              <div className="h-16 bg-[#FAF7F2] rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-12 text-center text-[#70665F]">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Building className="w-8 h-8 text-[#8D827A] opacity-50" />
            <p className="font-semibold text-xs text-[#544B45]">No service requests found</p>
            <p className="text-[11px] text-[#8D827A]">Click &quot;Log New Service Request&quot; to register a customer complaint or breakdown call.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((sr) => (
          <div
            key={sr.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-crm-brand- dark:bg-crm-brand- text-crm-brand-800 dark:text-crm-brand- font-mono font-bold text-xs">
                    {sr.requestNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#FAF7F2] text-slate-600 dark:text-[#544B45] text-[10px] font-semibold">
                    Origin: {sr.origin}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sr.priority === 'Critical'
                        ? 'bg-red-500/10 text-red-600'
                        : sr.priority === 'High'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-crm-brand-600/10 text-crm-brand-700'
                    }`}
                  >
                    {sr.priority} Priority
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-2">{sr.customerName}</h3>
                <p className="text-xs text-[#70665F]">{sr.machineName} (SN: {sr.serialNumber})</p>
              </div>

              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-[#FAF7F2] text-slate-800 dark:text-[#544B45] border border-slate-200 dark:border-[#EBE3DB]">
                {sr.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl space-y-1">
              <div className="font-semibold text-slate-800 dark:text-[#544B45] text-xs">{sr.complaintType}</div>
              <p className="text-xs text-slate-600 dark:text-[#70665F]">{sr.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[#70665F]">
              <div>
                <span className="text-[10px] text-[#70665F] block">Contact Person</span>
                <span className="font-medium text-slate-800 dark:text-[#544B45]">{sr.contactPerson} ({sr.mobile})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Assigned Engineer</span>
                <span className="font-semibold text-crm-brand-700 dark:text-crm-brand-500">
                  {sr.assignedTechnicianName || 'Not Assigned'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Warranty / AMC</span>
                <span className="font-medium text-slate-800 dark:text-[#544B45]">{sr.warrantyStatus} • {sr.amcStatus}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Preferred Visit Date</span>
                <span className="font-medium text-slate-800 dark:text-[#544B45]">{formatDate(sr.preferredVisitDate)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#EBE3DB]">
              <span className="text-[10px] text-[#70665F] font-mono">Logged: {formatDate(sr.createdAt)}</span>
              <div className="flex items-center gap-2">
                <select
                  value={sr.status}
                  onChange={(e) => updateServiceRequestStatus(sr.id, e.target.value as ServiceRequestStatus)}
                  className="px-2 py-1 text-xs bg-slate-100 dark:bg-[#FAF7F2] border rounded"
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Parts">Waiting for Parts</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-500" />
                Log New Customer Service Request
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Request Origin</label>
                  <select
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value as ServiceRequestOrigin })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  >
                    <option value="Customer">Customer Direct</option>
                    <option value="CRM">CRM Lead / Support</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Website">Website Form</option>
                    <option value="Preventive Maintenance">Preventive Maintenance</option>
                    <option value="Breakdown Alert">Breakdown Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as CriticalityLevel })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Immediate SLA)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Machine Serial Number</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Complaint Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pressure Drop / Vibration"
                    value={formData.complaintType}
                    onChange={(e) => setFormData({ ...formData, complaintType: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Preferred Visit Date</label>
                  <input
                    type="date"
                    value={formData.preferredVisitDate}
                    onChange={(e) => setFormData({ ...formData, preferredVisitDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold">
                  Submit Service Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
