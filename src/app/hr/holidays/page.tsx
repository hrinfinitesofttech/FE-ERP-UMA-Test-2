'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Sparkles, Plus, Calendar, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function HolidayCalendarPage() {
  const { holidays, addHoliday, departments } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    holidayName: '',
    date: new Date().toISOString().split('T')[0],
    holidayType: 'Public Holiday' as const,
    location: 'All Plants (Ahmedabad GIDC)',
    isOptional: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.holidayName) return;

    addHoliday({
      holidayName: formData.holidayName,
      date: formData.date,
      holidayType: formData.holidayType,
      location: formData.location,
      applicableDepartments: ['All Departments'],
      isOptional: formData.isOptional,
      status: 'Active',
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-400" />
            Company & Financial Year Holiday Calendar (FY 2026-27)
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Official Public Holidays, Plant Maintenance Shutdowns, Festival Breaks & Optional Holiday Roster
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Add Holiday Entry
        </button>
      </div>

      {/* Holiday List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {holidays.map((hol) => (
          <div key={hol.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-3 shadow-lg hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400">{hol.id}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                {hol.holidayType}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#211B17]">{hol.holidayName}</h3>
              <div className="text-sm font-extrabold text-amber-400 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#70665F]" /> {hol.date}
              </div>
            </div>

            <div className="bg-white/60 p-3 rounded-lg border border-[#EBE3DB]/50 space-y-1 text-xs text-[#544B45]">
              <div><strong className="text-[#70665F]">Location:</strong> {hol.location}</div>
              <div><strong className="text-[#70665F]">Applicable:</strong> {hol.applicableDepartments.join(', ')}</div>
              {hol.isOptional && <div className="text-crm-brand-500 font-bold">* Optional Holiday Choice</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Add Holiday Entry
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Holiday Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Plant Holiday"
                  value={formData.holidayName}
                  onChange={(e) => setFormData({ ...formData, holidayName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Holiday Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Holiday Type</label>
                  <select
                    value={formData.holidayType}
                    onChange={(e) => setFormData({ ...formData, holidayType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="Company Holiday">Company Holiday</option>
                    <option value="Festival">Festival</option>
                    <option value="Optional Holiday">Optional Holiday</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-[#211B17] font-semibold rounded-lg">
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
