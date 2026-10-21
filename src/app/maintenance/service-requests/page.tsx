'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ServiceRequest, ServiceRequestStatus } from '../../../types/maintenance';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Printer,
  Calendar,
  User,
  Phone,
  Mail,
  Home,
  CheckSquare,
  Shield,
  Sparkles,
  Trash2,
  Edit3,
} from 'lucide-react';

export default function ServiceRequestsPage() {
  const {
    serviceRequests,
    addServiceRequest,
    updateServiceRequestStatus,
    updateServiceRequest,
    deleteServiceRequest,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewingForm, setViewingForm] = useState<ServiceRequest | null>(null);
  const [editingForm, setEditingForm] = useState<ServiceRequest | null>(null);

  // Form State matching the Reference Image
  const initialFormData = {
    // 1. Customer Information
    customerName: '',
    contactNumber: '',
    homeAddress: '',
    email: '',

    // 2. Service Request Details
    requestType: 'Repair' as 'Repair' | 'Maintenance' | 'Installation' | 'Other',
    description: '',
    requestedDateTime: new Date().toISOString().slice(0, 16),
    urgencyLevel: 'Medium' as 'Low' | 'Medium' | 'High' | 'Emergency',

    // 3. Approval
    applicantName: '',
    requestSubmissionDate: new Date().toISOString().split('T')[0],

    // 4. Service Personnel
    completedBy: '',
    completedDate: '',
    approvedBy: '',
    approvedDate: '',

    // Additional tracking fields
    status: 'New' as ServiceRequestStatus,
  };

  const [formData, setFormData] = useState(initialFormData);

  // Handle Create New Form
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceRequest({
      customerName: formData.customerName,
      contactNumber: formData.contactNumber,
      homeAddress: formData.homeAddress,
      email: formData.email,
      requestType: formData.requestType,
      description: formData.description,
      requestedDateTime: formData.requestedDateTime,
      preferredVisitDate: formData.requestedDateTime?.split('T')[0] || new Date().toISOString().split('T')[0],
      urgencyLevel: formData.urgencyLevel,
      priority: formData.urgencyLevel === 'Emergency' ? 'Critical' : formData.urgencyLevel,
      applicantName: formData.applicantName,
      requestSubmissionDate: formData.requestSubmissionDate,
      completedBy: formData.completedBy,
      completedDate: formData.completedDate,
      approvedBy: formData.approvedBy,
      approvedDate: formData.approvedDate,
      status: formData.status,
      // Compatibility fields
      customerMachineId: 'N/A',
      machineName: formData.requestType + ' Service',
      serialNumber: 'N/A',
      contactPerson: formData.applicantName || formData.customerName,
      mobile: formData.contactNumber,
      complaintType: formData.requestType,
      warrantyStatus: 'N/A',
      amcStatus: 'No AMC',
      location: formData.homeAddress,
      attachments: [],
      assignedDepartment: 'Maintenance & Service',
    });

    setFormData(initialFormData);
    setShowFormModal(false);
  };

  // Handle Edit / Personnel Update
  const handleUpdatePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm || !updateServiceRequest) return;

    updateServiceRequest(editingForm.id, {
      completedBy: editingForm.completedBy,
      completedDate: editingForm.completedDate,
      approvedBy: editingForm.approvedBy,
      approvedDate: editingForm.approvedDate,
      status: editingForm.status,
    });

    setEditingForm(null);
  };

  // Filter requests
  const filteredRequests = (serviceRequests || []).filter((sr) => {
    const matchesSearch =
      !searchTerm?.trim() ||
      sr.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.homeAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.completedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.approvedBy?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = requestTypeFilter === 'all' || sr.requestType === requestTypeFilter || sr.complaintType === requestTypeFilter;
    const matchesUrgency = urgencyFilter === 'all' || sr.urgencyLevel === urgencyFilter || sr.priority === urgencyFilter;
    const matchesStatus = statusFilter === 'all' || sr.status === statusFilter;

    return matchesSearch && matchesType && matchesUrgency && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[11px] font-bold">
              MAINTENANCE &amp; SERVICES
            </span>
            <span className="text-xs text-slate-500">Service Request Form Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Service Requests</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log, process, and track official Service Request Forms with customer details, urgency level, approval, and service personnel sign-off.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialFormData);
            setShowFormModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm shadow-blue-700/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Request Form</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Forms</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{(serviceRequests || []).length}</div>
          <div className="text-[11px] text-slate-500">Logged Service Requests</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {(serviceRequests || []).filter((r) => r.status === 'In Progress' || r.status === 'Assigned' || r.status === 'Scheduled').length}
          </div>
          <div className="text-[11px] text-slate-500">Active Service Jobs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-semibold uppercase tracking-wider">High / Emergency</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {(serviceRequests || []).filter((r) => r.urgencyLevel === 'Emergency' || r.urgencyLevel === 'High' || r.priority === 'Critical' || r.priority === 'High').length}
          </div>
          <div className="text-[11px] text-slate-500">Critical Priority Forms</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed / Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {(serviceRequests || []).filter((r) => r.status === 'Resolved' || r.status === 'Closed' || (r.completedBy && r.approvedBy)).length}
          </div>
          <div className="text-[11px] text-slate-500">Signed Off by Personnel</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, contact, applicant, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Requested Filter */}
          <select
            value={requestTypeFilter}
            onChange={(e) => setRequestTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-700"
          >
            <option value="all">All Requested Types</option>
            <option value="Repair">Repair</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Installation">Installation</option>
            <option value="Other">Other</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-700"
          >
            <option value="all">All Urgency Levels</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Service Request Forms Grid / List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Service Request Forms Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? 'No requests matched your search query. Try clearing filters.'
              : 'Click "New Service Request Form" to log an official customer request with the reference form format.'}
          </p>
          <button
            onClick={() => {
              setFormData(initialFormData);
              setShowFormModal(true);
            }}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create First Service Request Form</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.map((sr) => {
            const urgency = sr.urgencyLevel || (sr.priority === 'Critical' ? 'Emergency' : sr.priority) || 'Medium';
            const reqType = sr.requestType || sr.complaintType || 'Repair';

            return (
              <div
                key={sr.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all p-5 shadow-xs hover:shadow-md space-y-4 relative flex flex-col justify-between"
              >
                {/* Header Bar */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {sr.requestNumber || sr.id}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          reqType === 'Repair'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : reqType === 'Maintenance'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : reqType === 'Installation'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {reqType}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          urgency === 'Emergency'
                            ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                            : urgency === 'High'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : urgency === 'Medium'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        Urgency: {urgency}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mt-2 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{sr.customerName}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingForm(sr)}
                      className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg transition border border-blue-200 flex items-center gap-1 cursor-pointer"
                      title="View / Print Official Service Request Form"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View Form</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingForm(sr)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Update Personnel / Status"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {deleteServiceRequest && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete service request ${sr.requestNumber || sr.id}?`)) {
                            deleteServiceRequest(sr.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 1: Customer Contact & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-500">Contact:</span>
                    <span className="font-mono font-medium">{sr.contactNumber || sr.mobile || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-500">Email:</span>
                    <span className="truncate">{sr.email || 'N/A'}</span>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-2 text-slate-700 pt-1">
                    <Home className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-500">Address:</span>
                    <span className="text-slate-700 line-clamp-1">{sr.homeAddress || sr.location || 'N/A'}</span>
                  </div>
                </div>

                {/* Section 2: Description & Date Requested */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                    <span>Description of Service Requested:</span>
                    <span className="font-mono text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Req: {sr.requestedDateTime ? formatDate(sr.requestedDateTime) : formatDate(sr.requestDate)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium text-xs leading-relaxed">
                    {sr.description || 'No description provided.'}
                  </div>
                </div>

                {/* Section 3 & 4: Approval & Service Personnel Footer */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Applicant</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {sr.applicantName || sr.contactPerson || 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sr.requestSubmissionDate ? formatDate(sr.requestSubmissionDate) : formatDate(sr.requestDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold">Completed By</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {sr.completedBy || 'Pending'}
                    </span>
                    {sr.completedDate && (
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(sr.completedDate)}</span>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block font-semibold">Approved By</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {sr.approvedBy || 'Pending'}
                    </span>
                    {sr.approvedDate && (
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(sr.approvedDate)}</span>
                    )}
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <span className="text-slate-400 font-semibold">Status:</span>
                  <select
                    value={sr.status}
                    onChange={(e) => updateServiceRequestStatus(sr.id, e.target.value as ServiceRequestStatus)}
                    className="px-2.5 py-1 text-xs bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: NEW SERVICE REQUEST FORM (EXACT REPLICA OF REFERENCE IMAGE)     */}
      {/* ========================================================================= */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-blue-900 w-full max-w-2xl overflow-hidden my-6 relative">
            {/* Dark Blue Curved Corner Accents matching the image */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-blue-900 rounded-br-[40px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-900 rounded-bl-[40px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-900 rounded-tr-[40px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-blue-900 rounded-tl-[40px] pointer-events-none" />

            {/* Header / Brand matching the image */}
            <div className="pt-7 px-8 pb-4 text-center border-b border-slate-100 relative">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="absolute top-4 right-4 z-10 p-2 text-white bg-blue-950/40 hover:bg-blue-950 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  ★
                </div>
                <span className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">
                  ABC Solutions
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide uppercase">
                SERVICE REQUEST FORM
              </h2>
            </div>

            {/* Form Fields matching the image exactly */}
            <form onSubmit={handleCreateRequest} className="p-6 sm:p-8 space-y-6 text-xs text-slate-800">
              {/* SECTION 1: Customer Information */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-blue-900 tracking-tight flex items-center gap-1.5">
                  <span>Customer Information:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Customer Name:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter customer or company name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Contact Number:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Home Address */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Home Address:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter address or site location"
                      value={formData.homeAddress}
                      onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Email Address:
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Service Request Details */}
              <div className="space-y-3.5 pt-2 border-t border-slate-200">
                <h3 className="font-bold text-sm text-blue-900 tracking-tight">
                  Service Request Details:
                </h3>

                {/* Requested Radio Buttons: Repair / Maintenance / Installation / Other */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Requested:
                  </label>
                  <div className="flex flex-wrap items-center gap-6 pt-0.5">
                    {(['Repair', 'Maintenance', 'Installation', 'Other'] as const).map((type) => (
                      <label key={type} className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-800 text-xs">
                        <input
                          type="radio"
                          name="requestType"
                          value={type}
                          checked={formData.requestType === type}
                          onChange={() => setFormData({ ...formData, requestType: type })}
                          className="w-4 h-4 text-blue-700 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description of Service Requested */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    Description of Service Requested:
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter detailed description of service or repair needed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Date and Time Requested */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    Date and Time Requested:
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.requestedDateTime}
                    onChange={(e) => setFormData({ ...formData, requestedDateTime: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Urgency Level: Low / Medium / High / Emergency */}
                <div className="space-y-1.5 pt-1">
                  <label className="block font-bold text-slate-800">
                    Urgency Level:
                  </label>
                  <div className="flex flex-wrap items-center gap-6 pt-0.5">
                    {(['Low', 'Medium', 'High', 'Emergency'] as const).map((level) => (
                      <label key={level} className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-800 text-xs">
                        <input
                          type="radio"
                          name="urgencyLevel"
                          value={level}
                          checked={formData.urgencyLevel === level}
                          onChange={() => setFormData({ ...formData, urgencyLevel: level })}
                          className="w-4 h-4 text-blue-700 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Approval */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h3 className="font-bold text-sm text-blue-900 tracking-tight">
                  Approval:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Applicant Name:
                    </label>
                    <input
                      type="text"
                      placeholder="Name of person applying"
                      value={formData.applicantName}
                      onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Request Submission Date:
                    </label>
                    <input
                      type="date"
                      value={formData.requestSubmissionDate}
                      onChange={(e) => setFormData({ ...formData, requestSubmissionDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Service Personnel */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h3 className="font-bold text-sm text-blue-900 tracking-tight">
                  Service Personnel:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Completed By + Date */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Completed By:
                    </label>
                    <input
                      type="text"
                      placeholder="Technician or engineer name"
                      value={formData.completedBy}
                      onChange={(e) => setFormData({ ...formData, completedBy: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Date:
                    </label>
                    <input
                      type="date"
                      value={formData.completedDate}
                      onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Approved By + Date */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Approved By:
                    </label>
                    <input
                      type="text"
                      placeholder="Supervisor / manager name"
                      value={formData.approvedBy}
                      onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Date:
                    </label>
                    <input
                      type="date"
                      value={formData.approvedDate}
                      onChange={(e) => setFormData({ ...formData, approvedDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Service Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRINTABLE VIEW / OFFICIAL FORM VIEWER                           */}
      {/* ========================================================================= */}
      {viewingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-blue-900 w-full max-w-2xl overflow-hidden my-6 relative print:shadow-none print:border-none">
            {/* Dark Blue Curved Corner Accents matching the image */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-blue-900 rounded-br-[40px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-900 rounded-bl-[40px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-900 rounded-tr-[40px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-blue-900 rounded-tl-[40px] pointer-events-none" />

            {/* Header / Brand matching the image */}
            <div className="pt-7 px-8 pb-4 text-center border-b border-slate-100 relative">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 text-white bg-blue-950/40 hover:bg-blue-950 rounded-full transition cursor-pointer"
                  title="Print this form"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewingForm(null)}
                  className="p-2 text-white bg-blue-950/40 hover:bg-blue-950 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  ★
                </div>
                <span className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">
                  ABC Solutions
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide uppercase">
                SERVICE REQUEST FORM
              </h2>
              <div className="font-mono text-xs text-blue-700 mt-0.5">
                Form No: {viewingForm.requestNumber || viewingForm.id}
              </div>
            </div>

            {/* Printable Form Content */}
            <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-800">
              {/* Customer Information */}
              <div className="space-y-2.5">
                <h3 className="font-bold text-sm text-blue-900 tracking-tight">
                  Customer Information:
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[100px]">Customer Name:</span>
                    <span className="border-b border-slate-400 pb-0.5 font-semibold text-slate-900 flex-1">
                      {viewingForm.customerName || '—'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[100px]">Contact Number:</span>
                    <span className="border-b border-slate-400 pb-0.5 font-mono text-slate-900 flex-1">
                      {viewingForm.contactNumber || viewingForm.mobile || '—'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[100px]">Home Address:</span>
                    <span className="border-b border-slate-400 pb-0.5 text-slate-900 flex-1">
                      {viewingForm.homeAddress || viewingForm.location || '—'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[100px]">Email Address:</span>
                    <span className="border-b border-slate-400 pb-0.5 text-slate-900 flex-1">
                      {viewingForm.email || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Request Details */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200">
                <h3 className="font-bold text-sm text-blue-900 tracking-tight">
                  Service Request Details:
                </h3>

                {/* Requested */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Requested:</span>
                  <div className="flex flex-wrap items-center gap-6 pt-0.5">
                    {(['Repair', 'Maintenance', 'Installation', 'Other'] as const).map((type) => (
                      <span key={type} className="inline-flex items-center gap-1.5 font-medium text-xs">
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          (viewingForm.requestType || viewingForm.complaintType) === type
                            ? 'border-blue-900 bg-blue-900 text-white'
                            : 'border-slate-400'
                        }`}>
                          {(viewingForm.requestType || viewingForm.complaintType) === type && '•'}
                        </span>
                        <span>{type}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description of Service Requested */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Description of Service Requested:</span>
                  <div className="border border-slate-300 rounded-lg p-2.5 min-h-[50px] bg-slate-50/50">
                    {viewingForm.description || '—'}
                  </div>
                </div>

                {/* Date and Time Requested */}
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-700 min-w-[160px]">Date and Time Requested:</span>
                  <span className="border-b border-slate-400 pb-0.5 font-mono text-slate-900 flex-1">
                    {viewingForm.requestedDateTime ? formatDate(viewingForm.requestedDateTime) : formatDate(viewingForm.requestDate)}
                  </span>
                </div>

                {/* Urgency Level */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Urgency Level:</span>
                  <div className="flex flex-wrap items-center gap-6 pt-0.5">
                    {(['Low', 'Medium', 'High', 'Emergency'] as const).map((level) => (
                      <span key={level} className="inline-flex items-center gap-1.5 font-medium text-xs">
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          (viewingForm.urgencyLevel || viewingForm.priority) === level
                            ? 'border-blue-900 bg-blue-900 text-white'
                            : 'border-slate-400'
                        }`}>
                          {(viewingForm.urgencyLevel || viewingForm.priority) === level && '•'}
                        </span>
                        <span>{level}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Approval */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200">
                <h3 className="font-bold text-sm text-blue-900 tracking-tight">
                  Approval:
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[120px]">Applicant Name:</span>
                    <span className="border-b border-slate-400 pb-0.5 font-semibold text-slate-900 flex-1">
                      {viewingForm.applicantName || viewingForm.contactPerson || '—'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[140px]">Request Submission Date:</span>
                    <span className="border-b border-slate-400 pb-0.5 font-mono text-slate-900 flex-1">
                      {viewingForm.requestSubmissionDate ? formatDate(viewingForm.requestSubmissionDate) : formatDate(viewingForm.requestDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Personnel */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200">
                <h3 className="font-bold text-sm text-blue-900 tracking-tight">
                  Service Personnel:
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[100px]">Completed By:</span>
                    <span className="border-b border-slate-400 pb-0.5 font-semibold text-slate-900 flex-1">
                      {viewingForm.completedBy || '—'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[50px]">Date:</span>
                    <span className="border-b border-slate-400 pb-0.5 font-mono text-slate-900 flex-1">
                      {viewingForm.completedDate ? formatDate(viewingForm.completedDate) : '—'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[100px]">Approved By:</span>
                    <span className="border-b border-slate-400 pb-0.5 font-semibold text-slate-900 flex-1">
                      {viewingForm.approvedBy || '—'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-700 min-w-[50px]">Date:</span>
                    <span className="border-b border-slate-400 pb-0.5 font-mono text-slate-900 flex-1">
                      {viewingForm.approvedDate ? formatDate(viewingForm.approvedDate) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200 print:hidden">
                <button
                  type="button"
                  onClick={() => setViewingForm(null)}
                  className="px-5 py-2 bg-blue-900 text-white font-bold rounded-xl text-xs hover:bg-blue-800 transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK EDIT / UPDATE SERVICE PERSONNEL & STATUS                   */}
      {/* ========================================================================= */}
      {editingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                <span>Update Service Personnel &amp; Status</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingForm(null)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePersonnel} className="p-5 space-y-4 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                Form No: <strong className="font-mono text-blue-700">{editingForm.requestNumber || editingForm.id}</strong> • Customer: <strong>{editingForm.customerName}</strong>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Status:</label>
                <select
                  value={editingForm.status}
                  onChange={(e) => setEditingForm({ ...editingForm, status: e.target.value as ServiceRequestStatus })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Completed By:</label>
                  <input
                    type="text"
                    value={editingForm.completedBy || ''}
                    onChange={(e) => setEditingForm({ ...editingForm, completedBy: e.target.value })}
                    placeholder="Technician name"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Completed Date:</label>
                  <input
                    type="date"
                    value={editingForm.completedDate || ''}
                    onChange={(e) => setEditingForm({ ...editingForm, completedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Approved By:</label>
                  <input
                    type="text"
                    value={editingForm.approvedBy || ''}
                    onChange={(e) => setEditingForm({ ...editingForm, approvedBy: e.target.value })}
                    placeholder="Supervisor name"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Approved Date:</label>
                  <input
                    type="date"
                    value={editingForm.approvedDate || ''}
                    onChange={(e) => setEditingForm({ ...editingForm, approvedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingForm(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
