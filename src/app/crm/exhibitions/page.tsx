'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
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
  Briefcase
} from 'lucide-react';

export default function ExhibitionsPage() {
  const { exhibitions, addExhibition, updateExhibition, deleteExhibition, employees } = useERP();
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpo, setSelectedExpo] = useState<Exhibition | null>(null);

  // New Expo Form State
  const [expoName, setExpoName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [location, setLocation] = useState('Helipad Ground, Gandhinagar');
  const [startDate, setStartDate] = useState('2026-11-20');
  const [endDate, setEndDate] = useState('2026-11-24');
  const [stallNumber, setStallNumber] = useState('Hall 8 / D-24');
  const [contactPerson, setContactPerson] = useState('Pravin Patel');
  const [budget, setBudget] = useState(850000);
  const [assignedTeam, setAssignedTeam] = useState<string[]>(['Pravin Patel', 'Amit Sharma']);
  const [productsDisplayed, setProductsDisplayed] = useState('Chemical Reactors, Storage Tanks');
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
    setLocation('Helipad Ground, Gandhinagar');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setStallNumber('Hall 1 / Stand 10');
    setContactPerson('Pravin Patel');
    setBudget(500000);
    setAssignedTeam(['Pravin Patel']);
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

  const columns: Column<Exhibition>[] = [
    {
      header: 'Exhibition / Trade Show',
      cell: (expo) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-[#211B17] block hover:text-[#5C3A21] cursor-pointer" onClick={() => openViewModal(expo)}>
            {expo.expoName}
          </span>
          <span className="text-[11px] text-[#70665F] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[#5C3A21]" />
            {expo.location} • Stall: {expo.stallNumber || 'TBD'}
          </span>
        </div>
      ),
    },
    {
      header: 'Dates',
      cell: (expo) => (
        <span className="font-mono text-slate-700 dark:text-[#544B45]">
          {formatDate(expo.startDate)} - {formatDate(expo.endDate)}
        </span>
      ),
    },
    {
      header: 'Budget',
      cell: (expo) => (
        <span className="font-mono font-bold text-slate-800 dark:text-[#544B45]">
          {formatCurrency(expo.budget)}
        </span>
      ),
    },
    {
      header: 'Total Leads Captured',
      cell: (expo) => (
        <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-mono font-bold text-xs">
          {expo.totalContacts || 0} Contacts
        </span>
      ),
    },
    {
      header: 'Qualified Capex Deals',
      cell: (expo) => (
        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold text-xs">
          {expo.qualifiedLeads || 0} Qualified
        </span>
      ),
    },
    {
      header: 'Won Customers',
      cell: (expo) => (
        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-xs">
          {expo.convertedCustomers || 0} Orders Won
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (expo) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openViewModal(expo)}
            title="View Details"
            className="p-1.5 text-slate-500 hover:text-[#5C3A21] hover:bg-[#FAF7F2] rounded-lg transition"
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
    <div className="space-y-5 text-xs">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2.5">
            <div className="p-2 bg-[#FAF7F2] rounded-xl text-[#5C3A21] border border-[#EBE3DB]">
              <Calendar className="w-5 h-5" />
            </div>
            Exhibitions & Industrial Expo ROI Tracker
          </h1>
          <p className="text-[#70665F] mt-1 text-xs">
            Manage trade show budgets, stall visitor captures, booth staff assignments, and downstream quotation conversions.
          </p>
        </div>

        <button
          onClick={() => {
            resetCreateForm();
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition flex items-center gap-2 shadow-xs cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Expo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#70665F] font-medium uppercase tracking-wider">Total Expos</p>
            <h3 className="text-lg font-bold text-slate-900">{exhibitions.length} Events</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#70665F] font-medium uppercase tracking-wider">Total Budget</p>
            <h3 className="text-lg font-bold text-slate-900">{formatCurrency(totalBudget)}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#70665F] font-medium uppercase tracking-wider">Contacts / Qualified</p>
            <h3 className="text-lg font-bold text-slate-900">{totalContacts} / {totalQualified}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#70665F] font-medium uppercase tracking-wider">Orders Won</p>
            <h3 className="text-lg font-bold text-emerald-700">{totalWon} Customers</h3>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        title="Industrial Trade Shows & Expo History"
        columns={columns}
        data={exhibitions}
      />

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#5C3A21]" />
                Register New Industrial Expo / Exhibition
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Exhibition / Event Name *</label>
                <input
                  type="text"
                  required
                  value={expoName}
                  onChange={(e) => setExpoName(e.target.value)}
                  placeholder="e.g. ENGIMACH 2026 / PLASTINDIA / CHEMTECH Expo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Organizer / Body</label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. K and D Communication"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stall / Booth Number</label>
                  <input
                    type="text"
                    value={stallNumber}
                    onChange={(e) => setStallNumber(e.target.value)}
                    placeholder="e.g. Hall 8 / D-24"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Exhibition Venue & City *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Helipad Exhibition Centre, Gandhinagar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Allocated Budget (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lead Contact / Coordinator</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Pravin Patel"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Products / Equipment Displayed</label>
                <input
                  type="text"
                  value={productsDisplayed}
                  onChange={(e) => setProductsDisplayed(e.target.value)}
                  placeholder="e.g. Chemical Reactors, Pressure Vessels, Shell & Tube Exchangers"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Strategic Objective / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key targets, marketing collaterals, EPC contractor engagements..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-lg font-bold transition shadow-xs"
                >
                  Save Exhibition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
