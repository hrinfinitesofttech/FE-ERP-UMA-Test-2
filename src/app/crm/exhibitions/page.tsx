'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { Exhibition } from '../../../types/crm';
import { formatCurrency, formatDate } from '../../../lib/utils';
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
  UserPlus
} from 'lucide-react';

function ExhibitionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewId = searchParams.get('view');

  const { exhibitions, addExhibition, updateExhibition, deleteExhibition, employees, leads } = useERP();
  
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
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
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
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
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

  const openViewModal = (expo: Exhibition) => {
    setSelectedExpo(expo);
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
    if (confirm(`Are you sure you want to delete exhibition "${expo.expoName}"?`)) {
      deleteExhibition(expo.id);
    }
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
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
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
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
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
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
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
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-crm-brand-700" />
                    Linked Leads from this Trade Show ({leads.filter((l) => l.exhibitionId === selectedExpo.id || l.exhibitionName === selectedExpo.expoName).length})
                  </h4>
                  <Link
                    href={`/crm/leads/new?source=exhibition&expoId=${selectedExpo.id}&expoName=${encodeURIComponent(selectedExpo.expoName)}`}
                    className="px-2.5 py-1 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Lead from Expo</span>
                  </Link>
                </div>

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
