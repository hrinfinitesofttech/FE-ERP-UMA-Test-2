'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { Enquiry, Lead } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import {
  HelpCircle,
  Plus,
  ArrowUpRight,
  Search,
  Sparkles,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  FileText,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Layers,
  ArrowRight,
  ClipboardList,
  Clock,
  Send,
  PhoneCall,
  AlertCircle,
} from 'lucide-react';

export default function EnquiriesRegisterPage() {
  const router = useRouter();
  const {
    enquiries,
    addEnquiry,
    updateEnquiry,
    deleteEnquiry,
    addFollowUp,
    leads,
    customers,
    currentUser,
    employees,
    availableEmployees,
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [deletingEnquiry, setDeletingEnletingEnquiry] = useState<Enquiry | null>(null);

  // Follow-up modal states
  const [followUpEnquiry, setFollowUpEnquiry] = useState<Enquiry | null>(null);
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().split('T')[0]);
  const [followUpTime, setFollowUpTime] = useState('11:00');
  const [followUpPurpose, setFollowUpPurpose] = useState('');
  const [followUpInterest, setFollowUpInterest] = useState<'interested' | 'not_interested' | 'in_discussion'>('interested');
  const [followUpAssignedToId, setFollowUpAssignedToId] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpNextDate, setFollowUpNextDate] = useState('');
  const [followUpError, setFollowUpError] = useState('');

  // Form states: Select customer (Lead), Product name, quantity, description
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [machineProduct, setMachineProduct] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [requirement, setRequirement] = useState('');
  const [status, setStatus] = useState<Enquiry['status']>('new');
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Handle lead or customer selection for the enquiry
  const handleLeadSelect = (val: string) => {
    if (!val) {
      setSelectedLeadId('');
      setCustomerName('');
      setCustomerEmail('');
      setContactPerson('');
      setContactMobile('');
      return;
    }

    if (val.startsWith('lead:')) {
      const id = val.replace('lead:', '');
      setSelectedLeadId(id);
      const lead = leads.find((l) => l.id === id || l.leadNo === id);
      if (lead) {
        setCustomerName(lead.companyName || '');
        setCustomerEmail(lead.email || '');
        setContactPerson(lead.contactPerson || '');
        setContactMobile(lead.mobile || '');
        // Do not auto-fill machineProduct, quantity, or requirement so fields remain clean with placeholders
      }
    } else if (val.startsWith('cust:')) {
      const id = val.replace('cust:', '');
      setSelectedLeadId('');
      const cust = customers.find((c) => c.id === id || c.customerCode === id);
      if (cust) {
        setCustomerName(cust.companyName || '');
        setCustomerEmail(cust.email || '');
        setContactPerson(cust.contactPerson || '');
        setContactMobile(cust.mobile || '');
      }
    } else {
      setSelectedLeadId(val);
      const lead = leads.find((l) => l.id === val || l.leadNo === val);
      if (lead) {
        setCustomerName(lead.companyName || '');
        setCustomerEmail(lead.email || '');
        setContactPerson(lead.contactPerson || '');
        setContactMobile(lead.mobile || '');
      }
    }
  };

  const openCreateModal = () => {
    setEditingEnquiry(null);
    setSelectedLeadId('');
    setCustomerName('');
    setCustomerEmail('');
    setContactPerson('');
    setContactMobile('');
    setMachineProduct('');
    setQuantity('');
    setRequirement('');
    setStatus('new');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (enq: Enquiry) => {
    setEditingEnquiry(enq);
    setSelectedLeadId(enq.leadId || '');
    setCustomerName(enq.customerName || '');
    setCustomerEmail(enq.customerEmail || '');
    setContactPerson(enq.contactPerson || '');
    setContactMobile(enq.contactMobile || '');
    setMachineProduct(enq.machineProduct || '');
    setQuantity(enq.quantity || 1);
    setRequirement(enq.requirement || enq.specification || '');
    setStatus(enq.status || 'new');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Please select a Customer (Lead).');
      return;
    }
    if (!machineProduct.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    const numQty = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10);
    if (!quantity || isNaN(numQty) || numQty < 1) {
      setFormError('Quantity must be at least 1.');
      return;
    }

    try {
      if (editingEnquiry) {
        updateEnquiry(editingEnquiry.id, {
          leadId: selectedLeadId || editingEnquiry.leadId || undefined,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || editingEnquiry.customerEmail,
          contactPerson: contactPerson.trim() || editingEnquiry.contactPerson,
          contactMobile: contactMobile.trim() || editingEnquiry.contactMobile,
          machineProduct: machineProduct.trim(),
          quantity: numQty,
          requirement: requirement.trim() || `Enquiry for ${machineProduct.trim()}`,
          specification: requirement.trim(),
          status,
        });
        setSuccessToast(`Enquiry ${editingEnquiry.enquiryNo || editingEnquiry.id} updated successfully!`);
      } else {
        const created = addEnquiry({
          leadId: selectedLeadId || undefined,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || '',
          contactPerson: contactPerson.trim() || '',
          contactMobile: contactMobile.trim() || '',
          machineProduct: machineProduct.trim(),
          quantity: numQty,
          requirement: requirement.trim() || `Enquiry for ${machineProduct.trim()}`,
          specification: requirement.trim(),
          expectedDelivery: '',
          assignedPersonId: currentUser?.id || '',
          assignedPersonName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Pravin Patel',
          status: 'new',
        });
        setSuccessToast(`New Enquiry ${created.enquiryNo} created successfully!`);
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save enquiry.');
    }
  };

  const handleDelete = () => {
    if (deletingEnquiry) {
      deleteEnquiry(deletingEnquiry.id);
      setSuccessToast(`Enquiry ${deletingEnquiry.enquiryNo || deletingEnquiry.id} deleted.`);
      setDeletingEnletingEnquiry(null);
      setTimeout(() => setSuccessToast(''), 4000);
    }
  };

  const openFollowUpModal = (enq: Enquiry) => {
    setFollowUpEnquiry(enq);
    setFollowUpDate(new Date().toISOString().split('T')[0]);
    setFollowUpTime('11:00');
    setFollowUpPurpose(`Inquiry follow-up for ${enq.machineProduct}`);
    setFollowUpInterest('interested');
    const allStaff = availableEmployees && availableEmployees.length > 0 ? availableEmployees : employees || [];
    const defaultStaffId = enq.assignedPersonId || (allStaff[0]?.id || 'EMP-001');
    setFollowUpAssignedToId(defaultStaffId);
    setFollowUpNotes('');
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setFollowUpNextDate(d.toISOString().split('T')[0]);
    setFollowUpError('');
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpEnquiry) return;
    if (!followUpDate) {
      setFollowUpError('Please select a Follow-up Date.');
      return;
    }

    const allStaff = availableEmployees && availableEmployees.length > 0 ? availableEmployees : employees || [];
    const assigned = allStaff.find((s) => s.id === followUpAssignedToId);
    const assignedName = assigned
      ? assigned.name || `${assigned.firstName || ''} ${assigned.lastName || ''}`.trim()
      : followUpEnquiry.assignedPersonName || 'Sales Team';

    let timeDisplay = followUpTime || '11:00 AM';
    if (followUpTime && followUpTime.includes(':')) {
      const [h, m] = followUpTime.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      timeDisplay = `${hour12}:${m} ${ampm}`;
    }

    addFollowUp({
      leadOrCustomerId: followUpEnquiry.leadId || followUpEnquiry.customerId || followUpEnquiry.id,
      leadOrCustomerName: followUpEnquiry.customerName,
      entityType: 'enquiry',
      enquiryId: followUpEnquiry.enquiryNo || followUpEnquiry.id,
      type: 'call',
      assignedToId: followUpAssignedToId || followUpEnquiry.assignedPersonId || 'EMP-001',
      assignedToName: assignedName,
      date: followUpDate,
      time: timeDisplay,
      priority: 'medium',
      purpose: followUpPurpose.trim() || `Follow-up for ${followUpEnquiry.machineProduct}`,
      notes: followUpNotes.trim(),
      interestStatus: followUpInterest,
      productItem: followUpEnquiry.machineProduct,
      nextFollowUpDate: followUpNextDate || undefined,
      status: 'pending',
    });

    setSuccessToast(`Follow-up scheduled for ${followUpEnquiry.customerName} (${followUpEnquiry.enquiryNo || followUpEnquiry.id})! Added to Follow-ups register.`);
    setFollowUpEnquiry(null);
    setTimeout(() => setSuccessToast(''), 5000);
  };

  // KPIs
  const totalEnquiries = enquiries.length;
  const activeEnquiries = enquiries.filter(
    (e) => e.status === 'new' || e.status === 'under_review' || e.status === 'requirement_pending' || e.status === 'technical_review'
  ).length;
  const quotationsDispatched = enquiries.filter(
    (e) => e.status === 'quotation_sent' || !!e.quotationId
  ).length;
  const convertedEnquiries = enquiries.filter(
    (e) => e.status === 'converted'
  ).length;

  // Filtered List
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNo = (e.enquiryNo || e.id || '').toLowerCase().includes(q);
        const matchesCust = (e.customerName || '').toLowerCase().includes(q);
        const matchesEmail = (e.customerEmail || '').toLowerCase().includes(q);
        const matchesPerson = (e.contactPerson || '').toLowerCase().includes(q);
        const matchesProd = (e.machineProduct || '').toLowerCase().includes(q);
        if (!matchesNo && !matchesCust && !matchesEmail && !matchesPerson && !matchesProd) {
          return false;
        }
      }
      return true;
    });
  }, [enquiries, statusFilter, searchQuery]);

  const handleExportCSV = () => {
    const csv = [
      'Enquiry No,Customer,Contact Person,Email,Equipment,Qty,Date,Target Date,Assigned Engineer,Status',
      ...filteredEnquiries.map((e) => {
        return `"${e.enquiryNo || e.id}","${e.customerName || ''}","${e.contactPerson || ''}","${e.customerEmail || ''}","${e.machineProduct || ''}","${e.quantity || 1}","${e.enquiryDate || ''}","${e.expectedDelivery || ''}","${e.assignedPersonName || ''}","${e.status || ''}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Enquiries_Register_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Columns definition
  const columns: ERPColumn<Enquiry>[] = [
    {
      key: 'enquiryNo',
      header: 'ENQUIRY NO',
      isCodeLink: true,
      onCodeClick: (e) => openEditModal(e),
      cell: (e) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs inline-block">
            {e.enquiryNo || e.id}
          </span>
          {e.leadId ? (
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Lead: <strong className="text-slate-700">{e.leadId}</strong>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 block">Direct</span>
          )}
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'CUSTOMER & CONTACT',
      cell: (e) => (
        <div className="space-y-0.5 min-w-[180px]">
          <div className="font-bold text-slate-800 text-xs truncate" title={e.customerName}>
            {e.customerName}
          </div>
          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{e.contactPerson || 'N/A'}</span>
          </div>
          {e.customerEmail && (
            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-mono">{e.customerEmail}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'machineProduct',
      header: 'EQUIPMENT / PRODUCT',
      cell: (e) => (
        <div className="space-y-0.5 min-w-[200px]">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap text-xs">
            <span className="truncate max-w-xs" title={e.machineProduct}>{e.machineProduct}</span>
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold shrink-0">
              Qty: {e.quantity || 1}
            </span>
          </div>
          {e.specification && (
            <div className="text-[10px] text-slate-500 line-clamp-1" title={e.specification}>
              {e.specification}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'enquiryDate',
      header: 'DATE & TARGET',
      cell: (e) => (
        <div className="space-y-0.5 whitespace-nowrap text-[11px]">
          <div className="flex items-center gap-1 text-slate-600 font-mono">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{e.enquiryDate ? formatDate(e.enquiryDate) : 'N/A'}</span>
          </div>
          {e.expectedDelivery && (
            <div className="text-[10px] text-amber-700 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Target: {formatDate(e.expectedDelivery)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'assignedPersonName',
      header: 'ASSIGNED ENGINEER',
      cell: (e) => (
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
          {e.assignedPersonName || 'Pravin Patel'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (e) => (
        <div className="whitespace-nowrap">
          <StatusBadge status={e.status as any} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (e) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap" onClick={(ev) => ev.stopPropagation()}>
          <button
            onClick={() => openFollowUpModal(e)}
            className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
            title="Schedule Follow-up for this Enquiry"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Follow-up</span>
          </button>
            <button
              onClick={() => openEditModal(e)}
              title="Edit Enquiry"
              className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeletingEnletingEnquiry(e)}
              title="Delete Enquiry"
              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-5 text-xs pb-10">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Enquiries</span>
            <ClipboardList className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">{totalEnquiries}</div>
          <div className="text-[10px] text-slate-400">All registered RFQs</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active / Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-800 font-mono">{activeEnquiries}</div>
          <div className="text-[10px] text-amber-700/80">Under technical evaluation</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Quotations Sent</span>
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-800 font-mono">{quotationsDispatched}</div>
          <div className="text-[10px] text-blue-700/80">Proposals submitted to client</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Converted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-800 font-mono">{convertedEnquiries}</div>
          <div className="text-[10px] text-emerald-700/80">Converted to Sales Orders</div>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">Status:</span>
          {[
            { id: 'all', label: `All (${enquiries.length})` },
            { id: 'new', label: 'New / Fresh' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'technical_review', label: 'Technical Review' },
            { id: 'quotation_ready', label: 'Quotation Ready' },
            { id: 'quotation_sent', label: 'Quotation Sent' },
            { id: 'converted', label: 'Converted' },
            { id: 'closed', label: 'Closed' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredEnquiries.length}</span> enquiries
        </div>
      </div>

      {/* Main ERP List Page Layout */}
      <ERPListPageLayout<Enquiry>
        breadcrumbs={['DASHBOARD', 'CRM & SALES', 'ENQUIRIES']}
        title="Customer Enquiries & Technical Requirements Register"
        columns={columns}
        data={filteredEnquiries}
        searchPlaceholder="Search enquiries by number, customer, product..."
        addNewLabel="New Enquiry"
        onAddNew={openCreateModal}
        onExport={handleExportCSV}
      />

      {/* Add / Edit Enquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E7DED5] shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-black text-[#211B17] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#75401F]" />
                <span>{editingEnquiry ? `Edit Enquiry (${editingEnquiry.enquiryNo})` : 'Register New Technical Enquiry'}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A09891] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Select Customer (Lead) */}
              <div>
                <label className="block text-[11px] font-bold text-[#70665F] mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#8C5229]" />
                  <span>Select customer (Lead)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={
                    selectedLeadId
                      ? `lead:${selectedLeadId}`
                      : customerName
                      ? `name:${customerName}`
                      : ''
                  }
                  onChange={(e) => handleLeadSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#75401F] font-semibold"
                >
                  <option value="">-- Select Customer / Lead --</option>
                  {leads.length > 0 && (
                    <optgroup label="Prospective Leads">
                      {leads.map((l) => (
                        <option key={`lead-${l.id}`} value={`lead:${l.id}`}>
                          {l.leadNo} — {l.companyName} {l.contactPerson ? `(${l.contactPerson})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {customers.length > 0 && (
                    <optgroup label="Registered Customers">
                      {customers.map((c) => (
                        <option key={`cust-${c.id}`} value={`cust:${c.id}`}>
                          {c.customerCode} — {c.companyName}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {customerName && !leads.some((l) => l.companyName === customerName) && !customers.some((c) => c.companyName === customerName) && (
                    <option value={`name:${customerName}`}>{customerName} (Selected)</option>
                  )}
                </select>
                {customerName && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Selected: {customerName} {contactPerson ? `• Contact: ${contactPerson}` : ''}
                  </p>
                )}
              </div>

              {/* 2. Product Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#70665F] mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8C5229]" />
                  <span>Product Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stainless Steel SS316 Reaction Vessel"
                  value={machineProduct}
                  onChange={(e) => setMachineProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#75401F] font-semibold"
                />
              </div>

              {/* 3. Quantity */}
              <div>
                <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 1"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setQuantity('');
                    } else {
                      const num = parseInt(val, 10);
                      setQuantity(isNaN(num) ? '' : num);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#75401F] font-mono font-bold"
                />
              </div>

              {/* 4. Description */}
              <div>
                <label className="block text-[11px] font-bold text-[#70665F] mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#8C5229]" />
                  <span>Description</span>
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter equipment technical specifications, customer requirements, design parameters..."
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#75401F] leading-relaxed"
                />
              </div>

              {editingEnquiry && (
                <div>
                  <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                    Enquiry Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                  >
                    <option value="new">New / Fresh</option>
                    <option value="under_review">Under Review</option>
                    <option value="requirement_pending">Requirement Pending</option>
                    <option value="technical_review">Technical Review</option>
                    <option value="quotation_ready">Quotation Ready</option>
                    <option value="quotation_sent">Quotation Sent</option>
                    <option value="converted">Converted to Order</option>
                    <option value="closed">Closed / Dropped</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E7DED5] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition text-xs shadow-xs cursor-pointer"
                >
                  {editingEnquiry ? 'Save Changes' : 'Create Technical Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#E7DED5] shadow-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#211B17]">Delete Enquiry?</h3>
            <p className="text-xs text-[#70665F]">
              Are you sure you want to delete enquiry <span className="font-mono font-bold">{deletingEnquiry.enquiryNo || deletingEnquiry.id}</span> for <strong className="text-slate-800">{deletingEnquiry.customerName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingEnletingEnquiry(null)}
                className="px-3.5 py-1.5 border border-[#E7DED5] text-[#70665F] rounded-lg font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Schedule Modal */}
      {followUpEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Schedule Follow-up</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Enquiry: {followUpEnquiry.enquiryNo || followUpEnquiry.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFollowUpEnquiry(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary of Enquiry */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="truncate">{followUpEnquiry.customerName}</span>
                <span className="font-mono text-purple-700 text-[11px]">{followUpEnquiry.enquiryNo}</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                Product / Item: <strong className="text-slate-900">{followUpEnquiry.machineProduct}</strong>
                {followUpEnquiry.quantity ? ` (Qty: ${followUpEnquiry.quantity})` : ''}
              </div>
              {followUpEnquiry.contactPerson && (
                <div className="text-[10px] text-slate-500">
                  Contact: {followUpEnquiry.contactPerson} {followUpEnquiry.contactMobile ? `• ${followUpEnquiry.contactMobile}` : ''}
                </div>
              )}
            </div>

            {followUpError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{followUpError}</span>
              </div>
            )}

            <form onSubmit={handleFollowUpSubmit} className="space-y-3.5">
              {/* Date & Time with Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Follow-up Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Time (Clock) *</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Discussion Purpose & Item */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Discussion Purpose / Item <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={followUpPurpose}
                  onChange={(e) => setFollowUpPurpose(e.target.value)}
                  placeholder="e.g. Follow-up on inquiry for Reactor Vessel"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>

              {/* Assigned Sales Engineer & Interest Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assigned Sales Engineer
                  </label>
                  <select
                    value={followUpAssignedToId}
                    onChange={(e) => setFollowUpAssignedToId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    {(availableEmployees && availableEmployees.length > 0 ? availableEmployees : employees || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim()} ({s.department || s.departmentName || 'CRM'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Client Interest Status
                  </label>
                  <select
                    value={followUpInterest}
                    onChange={(e) => setFollowUpInterest(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    <option value="interested">Interested (ઇન્ટરેસ્ટેડ)</option>
                    <option value="in_discussion">In Discussion / Follow-up Needed</option>
                    <option value="not_interested">Not Interested (નોટ ઇન્ટરેસ્ટેડ)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="Points discussed, customer feedback, special instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600 leading-relaxed"
                />
              </div>

              {/* Next Follow-up */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-purple-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-700" />
                    <span>Next Follow-up Date (નેક્સ્ટ ફોલોઅપ)</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 2);
                        setFollowUpNextDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-1.5 py-0.5 text-[9px] font-bold bg-white text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition"
                    >
                      +2D
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        setFollowUpNextDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-1.5 py-0.5 text-[9px] font-bold bg-white text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition"
                    >
                      +7D
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={followUpNextDate}
                  onChange={(e) => setFollowUpNextDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFollowUpEnquiry(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition text-xs shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Save Follow-up</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
