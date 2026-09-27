'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { SiteVisit } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import { MapPin, Plus, CheckCircle2 } from 'lucide-react';

export default function VisitsPage() {
  const { siteVisits, addSiteVisit, customers, employees } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [visitDate, setVisitDate] = useState('2026-09-24');
  const [location, setLocation] = useState('Dahej Complex, Gujarat');
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [purpose, setPurpose] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [requirementDetails, setRequirementDetails] = useState('');
  const [outcome, setOutcome] = useState<SiteVisit['outcome']>('positive');
  const [nextAction, setNextAction] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    const emp = employees.find((e) => e.id === employeeId);

    addSiteVisit({
      customerId,
      customerName: cust?.companyName || 'Valued Customer',
      contactPerson,
      contactMobile,
      visitDate,
      location,
      employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Sales Engineer',
      purpose,
      discussionNotes,
      requirementDetails,
      outcome,
      nextAction,
    });

    setShowModal(false);
  };

  const columns: Column<SiteVisit>[] = [
    {
      header: 'Visit #',
      accessorKey: 'visitNo',
      cell: (v) => <span className="font-mono font-bold text-crm-brand-700">{v.visitNo}</span>,
    },
    {
      header: 'Customer & Contact',
      cell: (v) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-[#211B17] block">{v.customerName}</span>
          <span className="text-[11px] text-[#70665F]">{v.contactPerson} • {v.contactMobile}</span>
        </div>
      ),
    },
    {
      header: 'Visit Date & Location',
      cell: (v) => (
        <div>
          <span className="font-mono font-bold text-slate-800 dark:text-[#544B45] block">{formatDate(v.visitDate)}</span>
          <span className="text-[10px] text-[#70665F]">{v.location}</span>
        </div>
      ),
    },
    {
      header: 'Purpose & Discussion',
      cell: (v) => (
        <div className="max-w-xs">
          <span className="font-semibold text-slate-800 dark:text-[#544B45] block truncate">{v.purpose}</span>
          <span className="text-[10px] text-[#70665F] block truncate">{v.discussionNotes}</span>
        </div>
      ),
    },
    {
      header: 'Engineer',
      accessorKey: 'employeeName',
    },
    {
      header: 'Business Outcome',
      cell: (v) => (
        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          {v.outcome?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Next Action',
      accessorKey: 'nextAction',
      cell: (v) => <span className="text-[11px] text-slate-600 dark:text-[#70665F]">{v.nextAction}</span>,
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-crm-brand-700" />
            Client Site Visits & Field Engineering Reports
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Record plant measurement inspections, civil foundation checks, and technical discussions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Site Visit</span>
        </button>
      </div>

      <DataTable
        title="Client Plant & Site Visits Log"
        columns={columns}
        data={siteVisits}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white border rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17]">Log Site Visit Report</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Customer *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-semibold"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Visiting Engineer *</label>
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Harish Trivedi"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Contact Mobile</label>
                  <input
                    type="tel"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    placeholder="+91 98250 XXXXX"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Location / Plant Address</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Dahej Plant 2"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Visit Purpose *</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Dimension check and nozzle orientation inspection"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Discussion Details & Observations</label>
                <textarea
                  rows={2}
                  value={discussionNotes}
                  onChange={(e) => setDiscussionNotes(e.target.value)}
                  placeholder="Technical findings at site..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Business Outcome</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-bold"
                  >
                    <option value="positive">Positive Progress</option>
                    <option value="quotation_required">Quotation Required</option>
                    <option value="follow_up_required">Follow-up Required</option>
                    <option value="order_expected">Order Expected</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Next Action Required</label>
                  <input
                    type="text"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    placeholder="e.g. Incorporate nozzle revisions into GA drawing"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
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
                  Save Visit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
