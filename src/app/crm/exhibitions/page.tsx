'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { Exhibition } from '../../../types/crm';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Calendar, Plus, Users, Award, TrendingUp } from 'lucide-react';

export default function ExhibitionsPage() {
  const { exhibitions, addExhibition } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [expoName, setExpoName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [location, setLocation] = useState('Helipad Ground, Gandhinagar');
  const [startDate, setStartDate] = useState('2026-11-20');
  const [endDate, setEndDate] = useState('2026-11-24');
  const [stallNumber, setStallNumber] = useState('Hall 8 / D-24');
  const [contactPerson, setContactPerson] = useState('Pravin Patel');
  const [budget, setBudget] = useState(850000);
  const [productsDisplayed, setProductsDisplayed] = useState('');
  const [notes, setNotes] = useState('');

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
      assignedTeam: ['Pravin Patel', 'Amit Sharma'],
      productsDisplayed,
      notes,
      totalContacts: 0,
      qualifiedLeads: 0,
      quotationsSent: 0,
      convertedCustomers: 0,
    });
    setShowModal(false);
  };

  const columns: Column<Exhibition>[] = [
    {
      header: 'Exhibition / Trade Show',
      cell: (expo) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-[#211B17] block">{expo.expoName}</span>
          <span className="text-[10px] text-[#70665F]">{expo.location} • Stall: {expo.stallNumber}</span>
        </div>
      ),
    },
    {
      header: 'Dates',
      cell: (expo) => (
        <span className="font-mono text-slate-700 dark:text-[#544B45]">
          {formatDate(expo.startDate)} to {formatDate(expo.endDate)}
        </span>
      ),
    },
    {
      header: 'Budget',
      cell: (expo) => <span className="font-mono font-bold text-slate-800 dark:text-[#544B45]">{formatCurrency(expo.budget)}</span>,
    },
    {
      header: 'Total Leads Captured',
      cell: (expo) => (
        <span className="px-2 py-0.5 rounded-full bg-crm-brand- text-crm-brand- font-mono font-bold">
          {expo.totalContacts} Contacts
        </span>
      ),
    },
    {
      header: 'Qualified Capex Deals',
      cell: (expo) => (
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">
          {expo.qualifiedLeads} Qualified
        </span>
      ),
    },
    {
      header: 'Won Customers',
      cell: (expo) => (
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
          {expo.convertedCustomers} Orders Won
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-crm-brand-700" />
            Exhibitions & Industrial Expo ROI Tracker
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Manage trade show budgets, stall visitor captures, and downstream quotation conversions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Expo</span>
        </button>
      </div>

      <DataTable
        title="Industrial Trade Shows & Expo History"
        columns={columns}
        data={exhibitions}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17]">Register Exhibition Event</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Expo Name *</label>
                <input
                  type="text"
                  required
                  value={expoName}
                  onChange={(e) => setExpoName(e.target.value)}
                  placeholder="e.g. ENGIMACH 2026 / PLASTINDIA"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Stall Number</label>
                  <input
                    type="text"
                    value={stallNumber}
                    onChange={(e) => setStallNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Allocated Budget (₹)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold"
                >
                  Save Expo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
