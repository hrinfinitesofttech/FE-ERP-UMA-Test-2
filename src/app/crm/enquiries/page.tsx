'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
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
} from 'lucide-react';

export default function EnquiriesRegisterPage() {
  const router = useRouter();
  const {
    enquiries,
    addEnquiry,
    updateEnquiry,
    deleteEnquiry,
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

  // Form states
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [machineProduct, setMachineProduct] = useState('');
  const [machineType, setMachineType] = useState('');
  const [application, setApplication] = useState('');
  const [capacity, setCapacity] = useState('');
  const [materialGrade, setMaterialGrade] = useState('');
  const [budget, setBudget] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [specification, setSpecification] = useState('');
  const [requirement, setRequirement] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [assignedPersonId, setAssignedPersonId] = useState('');
  const [assignedPersonName, setAssignedPersonName] = useState('');
  const [status, setStatus] = useState<Enquiry['status']>('new');
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Handle lead selection for autofill
  const handleLeadSelect = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId || l.leadNo === leadId);
    if (lead) {
      setCustomerName(lead.companyName || '');
      setCustomerEmail(lead.email || '');
      setContactPerson(lead.contactPerson || '');
      setContactMobile(lead.mobile || '');
      setMachineProduct(lead.productName || '');
      setMachineType(lead.machineType || '');
      setApplication(lead.application || '');
      setCapacity(lead.capacity || '');
      setBudget(lead.budget ? Number(lead.budget) : 0);
      setQuantity(lead.quantity || 1);
      setSpecification(lead.capacity ? `Capacity: ${lead.capacity} (${lead.machineType || 'Industrial Equipment'})` : (lead.machineType || ''));
      setRequirement(lead.requirementDescription || `Customer requirement for ${lead.productName}`);
      setExpectedDelivery(lead.expectedDelivery || '');
      if (lead.assignedSalesPersonId) {
        setAssignedPersonId(lead.assignedSalesPersonId);
        setAssignedPersonName(lead.assignedSalesPersonName || '');
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
    setMachineType('');
    setApplication('');
    setCapacity('');
    setMaterialGrade('');
    setBudget(0);
    setQuantity(1);
    setSpecification('');
    setRequirement('');
    setExpectedDelivery('');
    setAssignedPersonId(currentUser?.id || '');
    setAssignedPersonName(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Pravin Patel');
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
    setMachineType(enq.machineType || '');
    setApplication(enq.application || '');
    setCapacity(enq.capacity || '');
    setMaterialGrade(enq.materialGrade || '');
    setBudget(enq.budget ? Number(enq.budget) : 0);
    setQuantity(enq.quantity || 1);
    setSpecification(enq.specification || '');
    setRequirement(enq.requirement || '');
    setExpectedDelivery(enq.expectedDelivery || '');
    setAssignedPersonId(enq.assignedPersonId || '');
    setAssignedPersonName(enq.assignedPersonName || '');
    setStatus(enq.status || 'new');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Customer / Company Name is required.');
      return;
    }
    if (!machineProduct.trim()) {
      setFormError('Machine / Equipment Name is required.');
      return;
    }

    try {
      if (editingEnquiry) {
        updateEnquiry(editingEnquiry.id, {
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          contactPerson: contactPerson.trim(),
          contactMobile: contactMobile.trim(),
          machineProduct: machineProduct.trim(),
          machineType: machineType.trim() || undefined,
          application: application.trim() || undefined,
          capacity: capacity.trim() || undefined,
          materialGrade: materialGrade.trim() || undefined,
          budget: Number(budget) || undefined,
          quantity: Number(quantity) || 1,
          specification: specification.trim(),
          requirement: requirement.trim() || `Enquiry for ${machineProduct.trim()}`,
          expectedDelivery,
          assignedPersonId,
          assignedPersonName,
          status,
        });
        setSuccessToast(`Enquiry ${editingEnquiry.enquiryNo || editingEnquiry.id} updated successfully!`);
      } else {
        const created = addEnquiry({
          leadId: selectedLeadId || undefined,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          contactPerson: contactPerson.trim(),
          contactMobile: contactMobile.trim(),
          machineProduct: machineProduct.trim(),
          machineType: machineType.trim() || undefined,
          application: application.trim() || undefined,
          capacity: capacity.trim() || undefined,
          materialGrade: materialGrade.trim() || undefined,
          budget: Number(budget) || undefined,
          quantity: Number(quantity) || 1,
          specification: specification.trim(),
          requirement: requirement.trim() || `Enquiry for ${machineProduct.trim()}`,
          expectedDelivery,
          assignedPersonId,
          assignedPersonName,
          status,
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

  // Columns definition
  const columns: Column<Enquiry>[] = [
    {
      header: 'ENQUIRY NO',
      exportValue: (e) => e.enquiryNo || e.id,
      cell: (e) => (
        <div className="space-y-0.5">
          <span className="font-mono font-black text-crm-brand-800 text-xs tracking-tight">
            {e.enquiryNo || e.id}
          </span>
          {e.leadId ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold">
                Lead: {e.leadId}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-[#A09891] block">Direct Enquiry</span>
          )}
        </div>
      ),
    },
    {
      header: 'CUSTOMER & CONTACT',
      exportValue: (e) => `${e.customerName} (${e.contactPerson || ''})`,
      cell: (e) => (
        <div className="space-y-0.5 max-w-[220px]">
          <div className="font-bold text-slate-900 truncate" title={e.customerName}>
            {e.customerName}
          </div>
          <div className="text-[11px] text-[#70665F] truncate flex items-center gap-1">
            <User className="w-3 h-3 text-[#A09891] shrink-0" />
            <span>{e.contactPerson || 'N/A'}</span>
          </div>
          {e.customerEmail && (
            <div className="text-[10px] text-[#70665F] truncate flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#A09891] shrink-0" />
              <span className="font-mono text-[#544B45]">{e.customerEmail}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'EQUIPMENT / PRODUCT',
      exportValue: (e) => `${e.machineProduct} (Qty: ${e.quantity || 1})`,
      cell: (e) => (
        <div className="space-y-0.5 max-w-[260px]">
          <div className="font-bold text-[#211B17] flex items-center gap-1.5 flex-wrap">
            <span className="truncate" title={e.machineProduct}>{e.machineProduct}</span>
            <span className="px-1.5 py-0.2 bg-[#FAF7F2] text-[#75401F] border border-[#E7DED5] rounded text-[10px] font-bold shrink-0">
              Qty: {e.quantity || 1}
            </span>
            {e.capacity && (
              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-mono font-bold shrink-0">
                {e.capacity}
              </span>
            )}
            {e.materialGrade && (
              <span className="px-1.5 py-0.2 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[9px] font-mono font-bold shrink-0">
                {e.materialGrade}
              </span>
            )}
          </div>
          {e.specification && (
            <div className="text-[10px] text-[#70665F] line-clamp-1" title={e.specification}>
              {e.specification}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'DATE & TARGET',
      exportValue: (e) => `${e.enquiryDate} / ${e.expectedDelivery || 'N/A'}`,
      cell: (e) => (
        <div className="space-y-0.5 whitespace-nowrap text-[11px]">
          <div className="flex items-center gap-1 text-[#544B45]">
            <Calendar className="w-3 h-3 text-[#A09891]" />
            <span>{e.enquiryDate ? formatDate(e.enquiryDate) : 'N/A'}</span>
          </div>
          {e.expectedDelivery && (
            <div className="text-[10px] text-amber-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Target: {formatDate(e.expectedDelivery)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'ASSIGNED ENGINEER',
      exportValue: (e) => e.assignedPersonName || 'Unassigned',
      cell: (e) => (
        <span className="text-xs text-[#544B45] font-medium whitespace-nowrap">
          {e.assignedPersonName || 'Pravin Patel'}
        </span>
      ),
    },
    {
      header: 'STATUS',
      exportValue: (e) => e.status?.toUpperCase(),
      cell: (e) => (
        <div className="whitespace-nowrap">
          <StatusBadge status={e.status as any} />
        </div>
      ),
    },
    {
      header: 'ACTIONS',
      exportValue: () => '',
      cell: (e) => {
        const hasQuotation = !!e.quotationId;
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap" onClick={(ev) => ev.stopPropagation()}>
            {hasQuotation ? (
              <Link
                href={`/crm/quotations/${e.quotationId}`}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition shadow-2xs"
                title="View linked Quotation proposal"
              >
                <span>View Quotation</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href={`/crm/quotations/new?enquiryId=${e.id || e.enquiryNo}&customerId=${e.customerId || ''}`}
                className="px-2.5 py-1 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 transition shadow-xs cursor-pointer active:scale-95"
                title="Generate formal commercial Quotation"
              >
                <Send className="w-3 h-3" />
                <span>Send Quotation</span>
              </Link>
            )}
            <button
              onClick={() => openEditModal(e)}
              title="Edit Enquiry"
              className="p-1 text-[#70665F] hover:text-slate-900 hover:bg-[#FAF7F2] rounded border border-transparent hover:border-[#EBE3DB]"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeletingEnletingEnquiry(e)}
              title="Delete Enquiry"
              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
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

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] p-5 sm:p-6 rounded-2xl border border-[#E9DFD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-lg font-black text-[#211B17] flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#75401F] flex items-center justify-center border border-[#E7DED5] shadow-xs">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
            Customer Enquiries & Technical Requirements Register
          </h1>
          <p className="text-[#70665F] mt-1 text-xs">
            Manage incoming equipment enquiries, link converted leads, log customer technical specifications, and trigger commercial quotations.
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#3E2723] hover:bg-[#2C1810] active:scale-95 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Enquiry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Enquiries</span>
            <ClipboardList className="w-4 h-4 text-[#75401F]" />
          </div>
          <div className="text-2xl font-black text-[#211B17]">{totalEnquiries}</div>
          <div className="text-[10px] text-[#A09891]">All registered RFQs</div>
        </div>

        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active / Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{activeEnquiries}</div>
          <div className="text-[10px] text-amber-700/80">Under technical evaluation</div>
        </div>

        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quotations Sent</span>
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">{quotationsDispatched}</div>
          <div className="text-[10px] text-blue-700/80">Proposals submitted to client</div>
        </div>

        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Converted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{convertedEnquiries}</div>
          <div className="text-[10px] text-emerald-700/80">Converted to Sales Orders</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#EBE3DB] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#A09891] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enquiries by number, company, email, equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-800 placeholder-[#A09891] focus:outline-none focus:border-[#75401F]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-[#70665F]">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#75401F]"
          >
            <option value="all">All Enquiries ({enquiries.length})</option>
            <option value="new">New / Fresh</option>
            <option value="under_review">Under Review</option>
            <option value="technical_review">Technical Review</option>
            <option value="quotation_ready">Quotation Ready</option>
            <option value="quotation_sent">Quotation Sent</option>
            <option value="converted">Converted to Order</option>
            <option value="closed">Closed / Dropped</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xs overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredEnquiries}
          searchPlaceholder="Search enquiries by number, customer, product..."
        />
      </div>

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
              {/* Lead Pre-fill Selector (Only in Create Mode) */}
              {!editingEnquiry && leads.length > 0 && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1.5">
                  <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Auto-Fill from Existing Lead (Optional)</span>
                  </label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => handleLeadSelect(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                  >
                    <option value="">-- Manual Entry / Select a Lead to Auto-Fill --</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.leadNo} — {l.companyName} ({l.productName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                    Customer / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gujarat Alkalies & Chemicals Ltd."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                    Customer Email ID
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. procurement@gacl.co.in"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Harish Trivedi (General Manager)"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                    Contact Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98251 99881"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                    Machine / Equipment Required <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stainless Steel SS316 Reaction Vessel"
                    value={machineProduct}
                    onChange={(e) => setMachineProduct(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                    Quantity Required
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                    Assigned Sales Engineer
                  </label>
                  <select
                    value={assignedPersonId}
                    onChange={(e) => {
                      setAssignedPersonId(e.target.value);
                      const emp = (availableEmployees || employees).find((em) => em.id === e.target.value);
                      if (emp) setAssignedPersonName(emp.name || `${emp.firstName} ${emp.lastName}`);
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                  >
                    <option value="">-- Select Sales Engineer --</option>
                    {(availableEmployees || employees).map((em) => (
                      <option key={em.id} value={em.id}>
                        {em.name || `${em.firstName} ${em.lastName}`} ({em.departmentName || 'Sales'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Manufacturing & Equipment Technical Specs */}
              <div className="p-3 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl space-y-2.5">
                <h4 className="font-bold text-[#75401F] text-xs">Manufacturing & Metallurgy Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#70665F] mb-1">Machine / Vessel Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Reaction Vessel / Heat Exchanger"
                      value={machineType}
                      onChange={(e) => setMachineType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#70665F] mb-1">Capacity / Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 10 KL / 2000 mm Dia"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#70665F] mb-1">Material Grade (MOC)</label>
                    <input
                      type="text"
                      placeholder="e.g. SS316L / Hastelloy C-276"
                      value={materialGrade}
                      onChange={(e) => setMaterialGrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#70665F] mb-1">Application / Industry</label>
                    <input
                      type="text"
                      placeholder="e.g. Pharma API / Agrochemical"
                      value={application}
                      onChange={(e) => setApplication(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#70665F] mb-1">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={budget || ''}
                      onChange={(e) => setBudget(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                  Technical Specifications & Operating Parameters
                </label>
                <textarea
                  rows={2}
                  placeholder="Design pressure, operating temperature, material grade (SS316L), capacity, MOC, motor power..."
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                  Scope of Requirement / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Customer scope, site inspection notes, special testing (Hydro 1.5x, DP test), delivery terms..."
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
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
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#75401F]"
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
                  className="px-4 py-2 border border-[#E7DED5] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition text-xs shadow-xs"
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
    </div>
  );
}
