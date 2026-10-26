'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { Exhibition } from '../../../types/crm';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { toast } from '@/context/ToastContext';
import {
  Calendar,
  Plus,
  Users,
  Award,
  TrendingUp,
  Eye,
  Edit2,
  Trash2,
  Building2,
  DollarSign,
  Layers,
  MapPin,
  CheckCircle,
  FileText,
  Briefcase,
  ExternalLink,
  UserPlus,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function ExhibitionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewId = searchParams.get('view');

  const { exhibitions, addExhibition, updateExhibition, deleteExhibition, employees, leads, addLead } = useERP();
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpo, setSelectedExpo] = useState<Exhibition | null>(null);

  useEffect(() => {
    if (viewId && exhibitions && exhibitions.length > 0) {
      const match = exhibitions.find((e) => e.id === viewId);
      if (match) {
        setSelectedExpo(match);
        setShowViewModal(true);
      }
    }
  }, [viewId, exhibitions]);

  // New Expo Form State
  const [expoName, setExpoName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stallNumber, setStallNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [budget, setBudget] = useState(0);
  const [assignedTeam, setAssignedTeam] = useState<string[]>([]);
  const [productsDisplayed, setProductsDisplayed] = useState('');
  const [notes, setNotes] = useState('');

  // Edit Expo Form State
  const [editExpoName, setEditExpoName] = useState('');
  const [editOrganizer, setEditOrganizer] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editStallNumber, setEditStallNumber] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editBudget, setEditBudget] = useState(0);
  const [editAssignedTeam, setEditAssignedTeam] = useState<string[]>([]);
  const [editProductsDisplayed, setEditProductsDisplayed] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTotalContacts, setEditTotalContacts] = useState(0);
  const [editQualifiedLeads, setEditQualifiedLeads] = useState(0);
  const [editQuotationsSent, setEditQuotationsSent] = useState(0);
  const [editConvertedCustomers, setEditConvertedCustomers] = useState(0);

  const resetCreateForm = () => {
    setExpoName('');
    setOrganizer('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setStallNumber('');
    setContactPerson('');
    setBudget(0);
    setAssignedTeam([]);
    setProductsDisplayed('');
    setNotes('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addExhibition({
      expoName,
      organizer,
      location,
      startDate,
      endDate,
      stallNumber,
      contactPerson,
      budget,
      assignedTeam,
      productsDisplayed,
      notes,
      totalContacts: 0,
      qualifiedLeads: 0,
      quotationsSent: 0,
      convertedCustomers: 0,
    });
    setShowModal(false);
    resetCreateForm();
  };

  // Quick Lead Entry State inside Expo Details Modal
  interface QuickExpoLeadRow {
    tempId: string;
    companyName: string;
    contactPerson: string;
    mobile: string;
    productName: string;
  }

  const [quickLeadRows, setQuickLeadRows] = useState<QuickExpoLeadRow[]>([]);
  const [isSavingQuickLeads, setIsSavingQuickLeads] = useState(false);
  const [quickLeadError, setQuickLeadError] = useState('');
  const [quickLeadSuccess, setQuickLeadSuccess] = useState('');

  const handleAddQuickLeadRow = () => {
    setQuickLeadRows((prev) => [
      ...prev,
      {
        tempId: `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyName: '',
        contactPerson: '',
        mobile: '',
        productName: '',
      },
    ]);
    setQuickLeadError('');
    setQuickLeadSuccess('');
  };

  const updateQuickLeadRow = (tempId: string, field: keyof QuickExpoLeadRow, value: string) => {
    setQuickLeadRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
    if (quickLeadError) setQuickLeadError('');
  };

  const removeQuickLeadRow = (tempId: string) => {
    setQuickLeadRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleSaveQuickLeads = async () => {
    if (!selectedExpo || quickLeadRows.length === 0) return;
    setQuickLeadError('');
    setQuickLeadSuccess('');

    for (let i = 0; i < quickLeadRows.length; i++) {
      const row = quickLeadRows[i];
      if (!row.companyName.trim()) {
        setQuickLeadError(`Row #${i + 1}: Company Name is required.`);
        return;
      }
      if (!row.contactPerson.trim()) {
        setQuickLeadError(`Row #${i + 1}: Contact Person is required.`);
        return;
      }
      if (!row.mobile.trim()) {
        setQuickLeadError(`Row #${i + 1}: Mobile Number is required.`);
        return;
      }
    }

    setIsSavingQuickLeads(true);

    try {
      const defaultEmp = employees[0];
      const defaultSalesId = defaultEmp?.id || 'EMP-001';
      const defaultSalesName = defaultEmp
        ? (defaultEmp.name || `${defaultEmp.firstName || ''} ${defaultEmp.lastName || ''}`.trim())
        : 'Sales Executive';

      let savedCount = 0;
      for (const row of quickLeadRows) {
        await addLead({
          companyName: row.companyName.trim(),
          contactPerson: row.contactPerson.trim(),
          mobile: row.mobile.trim(),
          whatsapp: row.mobile.trim(),
          productName: row.productName.trim(),
          source: 'exhibition',
          exhibitionId: selectedExpo.id,
          exhibitionName: selectedExpo.expoName,
          priority: 'medium',
          assignedSalesPersonId: defaultSalesId,
          assignedSalesPersonName: defaultSalesName,
          status: 'new',
          email: '',
          address: '',
          city: '',
          state: '',
          country: '',
          pincode: '',
          altMobile: '',
          industry: '',
          designation: '',
          machineType: '',
          quantity: 0,
          capacity: '',
          application: '',
          requirementDescription: `Lead captured at ${selectedExpo.expoName}. Product: ${row.productName.trim()}`,
          expectedDelivery: '',
          budget: 0,
        });
        savedCount++;
      }

      const updatedTotal = (selectedExpo.totalContacts || 0) + savedCount;
      updateExhibition(selectedExpo.id, {
        totalContacts: updatedTotal,
      });

      setSelectedExpo((prev) => (prev ? { ...prev, totalContacts: updatedTotal } : prev));
      setQuickLeadRows([]);
      setQuickLeadSuccess(`Successfully added ${savedCount} lead${savedCount > 1 ? 's' : ''} to ${selectedExpo.expoName}!`);
    } catch (err: any) {
      setQuickLeadError(err.message || 'Failed to save leads.');
    } finally {
      setIsSavingQuickLeads(false);
    }
  };

  const openViewModal = (expo: Exhibition) => {
    setSelectedExpo(expo);
    setQuickLeadRows([]);
    setQuickLeadError('');
    setQuickLeadSuccess('');
    setShowViewModal(true);
  };

  const openEditModal = (expo: Exhibition) => {
    setSelectedExpo(expo);
    setEditExpoName(expo.expoName || '');
    setEditOrganizer(expo.organizer || '');
    setEditLocation(expo.location || '');
    setEditStartDate(expo.startDate || '');
    setEditEndDate(expo.endDate || '');
    setEditStallNumber(expo.stallNumber || '');
    setEditContactPerson(expo.contactPerson || '');
    setEditBudget(expo.budget || 0);
    setEditAssignedTeam(Array.isArray(expo.assignedTeam) ? expo.assignedTeam : []);
    setEditProductsDisplayed(expo.productsDisplayed || '');
    setEditNotes(expo.notes || '');
    setEditTotalContacts(expo.totalContacts || 0);
    setEditQualifiedLeads(expo.qualifiedLeads || 0);
    setEditQuotationsSent(expo.quotationsSent || 0);
    setEditConvertedCustomers(expo.convertedCustomers || 0);
    setShowEditModal(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpo) return;

    updateExhibition(selectedExpo.id, {
      expoName: editExpoName,
      organizer: editOrganizer,
      location: editLocation,
      startDate: editStartDate,
      endDate: editEndDate,
      stallNumber: editStallNumber,
      contactPerson: editContactPerson,
      budget: Number(editBudget),
      assignedTeam: editAssignedTeam,
      productsDisplayed: editProductsDisplayed,
      notes: editNotes,
      totalContacts: Number(editTotalContacts),
      qualifiedLeads: Number(editQualifiedLeads),
      quotationsSent: Number(editQuotationsSent),
      convertedCustomers: Number(editConvertedCustomers),
    });
    setShowEditModal(false);
  };

  const handleDelete = (expo: Exhibition) => {
    toast.confirm({
      title: 'Delete Exhibition',
      message: `Are you sure you want to delete exhibition "${expo.expoName}"?`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        deleteExhibition(expo.id);
        toast.success(`Exhibition "${expo.expoName}" deleted`);
      },
    });



  };

  // Metrics summary
  const totalBudget = exhibitions.reduce((acc, curr) => acc + (curr.budget || 0), 0);
  const totalContacts = exhibitions.reduce((acc, curr) => acc + (curr.totalContacts || 0), 0);
  const totalQualified = exhibitions.reduce((acc, curr) => acc + (curr.qualifiedLeads || 0), 0);
  const totalWon = exhibitions.reduce((acc, curr) => acc + (curr.convertedCustomers || 0), 0);

  const columns: ERPColumn<Exhibition>[] = [
    {
      key: 'expoName',
      header: 'Exhibition / Trade Show',
      isCodeLink: true,
      onCodeClick: (expo) => openViewModal(expo),
      cell: (expo) => (
        <div>
          <span className="font-bold text-slate-900 block hover:text-[#7C3AED] cursor-pointer" onClick={() => openViewModal(expo)}>
            {expo.expoName}
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[#7C3AED]" />
            {expo.location} • Stall: {expo.stallNumber || 'TBD'}
          </span>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Dates',
      cell: (expo) => (
        <span className="font-mono text-slate-700">
          {formatDate(expo.startDate)} - {formatDate(expo.endDate)}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      cell: (expo) => (
        <span className="font-mono font-bold text-slate-800">
          {formatCurrency(expo.budget)}
        </span>
      ),
    },
    {
      key: 'totalContacts',
      header: 'Total Leads Captured',
      cell: (expo) => {
        const liveCount = leads.filter((l) => l.exhibitionId === expo.id || l.exhibitionName === expo.expoName).length;
        const count = liveCount > 0 ? liveCount : (expo.totalContacts || 0);
        return (
          <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-mono font-bold text-xs">
            {count} Leads
          </span>
        );
      },
    },
    {
      key: 'qualifiedLeads',
      header: 'Qualified Capex Deals',
      cell: (expo) => (
        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold text-xs">
          {expo.qualifiedLeads || 0} Qualified
        </span>
      ),
    },
    {
      key: 'convertedCustomers',
      header: 'Won Customers',
      cell: (expo) => (
        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-xs">
          {expo.convertedCustomers || 0} Orders Won
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (expo) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/crm/leads/new?source=exhibition&expoId=${expo.id}&expoName=${encodeURIComponent(expo.expoName)}`}
            title="+ Add Lead from this Expo"
            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition"
          >
            <UserPlus className="w-4 h-4" />
          </Link>
          <button
            onClick={() => openViewModal(expo)}
            title="View Details & Linked Leads"
            className="p-1.5 text-slate-500 hover:text-[#7C3AED] hover:bg-slate-100 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(expo)}
            title="Edit / Update ROI"
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(expo)}
            title="Delete Expo"
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-[#7C3AED] border border-purple-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Total Expos</p>
            <h3 className="text-lg font-bold text-slate-900">{exhibitions.length} Events</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Total Budget</p>
            <h3 className="text-lg font-bold text-slate-900">{formatCurrency(totalBudget)}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Contacts / Qualified</p>
            <h3 className="text-lg font-bold text-slate-900">{totalContacts} / {totalQualified}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Orders Won</p>
            <h3 className="text-lg font-bold text-emerald-700">{totalWon} Customers</h3>
          </div>
        </div>
      </div>

      {/* Main Shasvatm ERP Standard List View */}
      <ERPListPageLayout<Exhibition>
        breadcrumbs={['DASHBOARD', 'CRM & SALES', 'EXHIBITIONS & TRADE SHOWS']}
        columns={columns}
        data={exhibitions}
        addNewLabel="+ Register New Expo"
        onAddNew={() => router.push('/crm/exhibitions/new')}
        onExport={() => {
          const csv = [
            ['Exhibition Name', 'Organizer', 'Location', 'Start Date', 'End Date', 'Stall No', 'Budget', 'Leads Captured', 'Qualified', 'Orders Won'].join(','),
            ...exhibitions.map(e => [
              `"${(e.expoName || '').replace(/"/g, '""')}"`,
              `"${(e.organizer || '').replace(/"/g, '""')}"`,
              `"${(e.location || '').replace(/"/g, '""')}"`,
              e.startDate || '',
              e.endDate || '',
              `"${e.stallNumber || ''}"`,
              e.budget || 0,
              e.totalContacts || 0,
              e.qualifiedLeads || 0,
              e.convertedCustomers || 0
            ].join(','))
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `crm_exhibitions_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        }}
        searchPlaceholder="Search exhibitions, location, organizer, stall..."
      />

      {/* Edit / ROI Update Modal */}
      {showEditModal && selectedExpo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-600" />
                  Edit Expo & Update ROI Metrics
                </h3>
                <p className="text-[11px] text-[#70665F]">ID: {selectedExpo.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Basic Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Exhibition Name</label>
                  <input
                    type="text"
                    required
                    value={editExpoName}
                    onChange={(e) => setEditExpoName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Venue / Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Stall Number</label>
                    <input
                      type="text"
                      value={editStallNumber}
                      onChange={(e) => setEditStallNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Budget (₹)</label>
                    <input
                      type="number"
                      value={editBudget}
                      onChange={(e) => setEditBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* ROI & Conversion Metrics Section */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-4 h-4 text-[#5C3A21]" />
                  Trade Show ROI & Funnel Conversions
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1 text-[11px]">Total Contacts</label>
                    <input
                      type="number"
                      min={0}
                      value={editTotalContacts}
                      onChange={(e) => setEditTotalContacts(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-800 font-medium mb-1 text-[11px]">Qualified Leads</label>
                    <input
                      type="number"
                      min={0}
                      value={editQualifiedLeads}
                      onChange={(e) => setEditQualifiedLeads(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg font-mono font-bold text-xs text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-800 font-medium mb-1 text-[11px]">Quotations Sent</label>
                    <input
                      type="number"
                      min={0}
                      value={editQuotationsSent}
                      onChange={(e) => setEditQuotationsSent(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg font-mono font-bold text-xs text-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-800 font-medium mb-1 text-[11px]">Won Orders</label>
                    <input
                      type="number"
                      min={0}
                      value={editConvertedCustomers}
                      onChange={(e) => setEditConvertedCustomers(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-xs text-emerald-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Products Displayed</label>
                <input
                  type="text"
                  value={editProductsDisplayed}
                  onChange={(e) => setEditProductsDisplayed(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-xs"
                >
                  Update Exhibition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedExpo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-3xl sm:max-w-4xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="px-2 py-0.5 bg-[#FAF7F2] text-[#5C3A21] border border-[#EBE3DB] rounded-md font-mono text-[10px] font-bold uppercase">
                  {selectedExpo.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedExpo.expoName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[#70665F] block text-[11px]">Venue & Location</span>
                  <span className="font-semibold text-slate-900">{selectedExpo.location}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block text-[11px]">Stall / Booth</span>
                  <span className="font-mono font-bold text-slate-900">{selectedExpo.stallNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block text-[11px]">Dates</span>
                  <span className="font-mono text-slate-900">
                    {formatDate(selectedExpo.startDate)} to {formatDate(selectedExpo.endDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[#70665F] block text-[11px]">Budget</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedExpo.budget)}</span>
                </div>
              </div>

              {/* ROI Summary Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-xl">
                  <span className="text-[10px] text-sky-800 block">Contacts</span>
                  <span className="font-bold text-base text-sky-900">{selectedExpo.totalContacts || 0}</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl">
                  <span className="text-[10px] text-amber-800 block">Qualified</span>
                  <span className="font-bold text-base text-amber-900">{selectedExpo.qualifiedLeads || 0}</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl">
                  <span className="text-[10px] text-blue-800 block">Quotes</span>
                  <span className="font-bold text-base text-blue-900">{selectedExpo.quotationsSent || 0}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                  <span className="text-[10px] text-emerald-800 block">Won</span>
                  <span className="font-bold text-base text-emerald-900">{selectedExpo.convertedCustomers || 0}</span>
                </div>
              </div>

              {selectedExpo.productsDisplayed && (
                <div>
                  <span className="text-[#70665F] block text-[11px]">Products Displayed</span>
                  <span className="text-slate-800 font-medium">{selectedExpo.productsDisplayed}</span>
                </div>
              )}

              {selectedExpo.contactPerson && (
                <div>
                  <span className="text-[#70665F] block text-[11px]">Key Contact</span>
                  <span className="text-slate-800 font-medium">{selectedExpo.contactPerson}</span>
                </div>
              )}

              {selectedExpo.notes && (
                <div>
                  <span className="text-[#70665F] block text-[11px]">Notes</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg">{selectedExpo.notes}</p>
                </div>
              )}

              {/* Linked Leads Section */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-crm-brand-700" />
                    Linked Leads from this Trade Show ({leads.filter((l) => l.exhibitionId === selectedExpo.id || l.exhibitionName === selectedExpo.expoName).length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddQuickLeadRow}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Lead from Expo</span>
                    </button>
                    <Link
                      href={`/crm/leads/new?source=exhibition&expoId=${selectedExpo.id}&expoName=${encodeURIComponent(selectedExpo.expoName)}`}
                      className="text-[11px] text-[#70665F] hover:text-[#211B17] font-semibold underline ml-1"
                    >
                      Full Form ↗
                    </Link>
                  </div>
                </div>

                {/* Inline Quick Multi-Lead Rows */}
                {quickLeadRows.length > 0 && (
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-950">
                          Booth Lead Entry ({quickLeadRows.length} Line{quickLeadRows.length > 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddQuickLeadRow}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Add Another Line</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickLeadRows([])}
                          className="text-[11px] text-slate-500 hover:text-rose-600 font-semibold cursor-pointer px-1"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {quickLeadError && (
                      <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>{quickLeadError}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="hidden sm:grid grid-cols-12 gap-2 text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider px-1">
                        <span className="col-span-1 text-center">#</span>
                        <span className="col-span-3">Company Name *</span>
                        <span className="col-span-3">Contact Person *</span>
                        <span className="col-span-2">Mobile / Phone *</span>
                        <span className="col-span-2">Product / Requirement</span>
                        <span className="col-span-1 text-center">Action</span>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {quickLeadRows.map((row, idx) => (
                          <div
                            key={row.tempId}
                            className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 bg-white border border-emerald-200 rounded-lg items-center shadow-2xs"
                          >
                            <div className="sm:col-span-1 flex items-center justify-center">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                            </div>

                            <div className="sm:col-span-3">
                              <input
                                type="text"
                                required
                                value={row.companyName}
                                onChange={(e) => updateQuickLeadRow(row.tempId, 'companyName', e.target.value)}
                                placeholder="Company / Firm Name *"
                                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-md text-xs font-semibold text-[#211B17] focus:outline-none focus:border-emerald-600"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <input
                                type="text"
                                required
                                value={row.contactPerson}
                                onChange={(e) => updateQuickLeadRow(row.tempId, 'contactPerson', e.target.value)}
                                placeholder="Visitor / Contact Person *"
                                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-md text-xs text-[#211B17] focus:outline-none focus:border-emerald-600"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                required
                                value={row.mobile}
                                onChange={(e) => updateQuickLeadRow(row.tempId, 'mobile', e.target.value)}
                                placeholder="Mobile / Phone *"
                                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-md text-xs font-mono text-[#211B17] focus:outline-none focus:border-emerald-600"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                value={row.productName}
                                onChange={(e) => updateQuickLeadRow(row.tempId, 'productName', e.target.value)}
                                placeholder="Product Requirement..."
                                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-md text-xs text-[#211B17] focus:outline-none focus:border-emerald-600"
                              />
                            </div>

                            <div className="sm:col-span-1 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeQuickLeadRow(row.tempId)}
                                title="Remove this line"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-200 flex-wrap gap-2">
                      <span className="text-[11px] text-emerald-800 font-medium">
                        All rows will be linked to <strong>{selectedExpo.expoName}</strong>.
                      </span>
                      <button
                        type="button"
                        disabled={isSavingQuickLeads}
                        onClick={handleSaveQuickLeads}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingQuickLeads ? 'Saving Leads...' : `Save ${quickLeadRows.length} Lead${quickLeadRows.length > 1 ? 's' : ''}`}</span>
                      </button>
                    </div>
                  </div>
                )}

                {quickLeadSuccess && (
                  <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>{quickLeadSuccess}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickLeadSuccess('')}
                      className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {(() => {
                  const linkedLeads = leads.filter(
                    (l) =>
                      l.exhibitionId === selectedExpo.id ||
                      (Boolean(selectedExpo.expoName) &&
                        Boolean(l.exhibitionName) &&
                        l.exhibitionName?.trim().toLowerCase() === selectedExpo.expoName?.trim().toLowerCase())
                  );
                  if (linkedLeads.length === 0) {
                    return (
                      <p className="text-[#70665F] text-[11px] bg-slate-50 p-3 rounded-lg text-center">
                        No leads recorded for this exhibition yet. Click &ldquo;+ Add Lead from Expo&rdquo; to register visitor cards.
                      </p>
                    );
                  }
                  return (
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/50">
                      {linkedLeads.map((l) => (
                        <div key={l.id} className="p-2.5 flex items-center justify-between gap-2 text-xs hover:bg-slate-50">
                          <div>
                            <Link href={`/crm/leads/${l.id}`} className="font-bold text-slate-900 hover:text-crm-brand-700 flex items-center gap-1">
                              <span>{l.companyName}</span>
                              <ExternalLink className="w-3 h-3 text-[#70665F]" />
                            </Link>
                            <span className="text-[10px] text-[#70665F]">
                              {[l.contactPerson, l.mobile, l.productName].filter(Boolean).join(' • ')}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase bg-amber-100 text-amber-800">
                            {l.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedExpo);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Edit Event
              </button>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExhibitionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500 font-semibold">Loading Exhibitions...</div>}>
      <ExhibitionsContent />
    </Suspense>
  );
}
