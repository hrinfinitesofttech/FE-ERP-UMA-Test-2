'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { HolidayItem } from '../../../types/hr';
import {
  Sparkles,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Trash2,
  Edit2,
  Building2,
  PartyPopper,
  Tag,
  AlertCircle,
  X,
  LayoutGrid,
  List,
  ChevronRight,
  Sun,
  Flame,
  Star
} from 'lucide-react';

export default function HolidayCalendarPage() {
  const { holidays, addHoliday, updateHoliday, deleteHoliday, departments } = useERP();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filters & Views
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Form State
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split('T')[0]);
  const [holidayType, setHolidayType] = useState<HolidayItem['holidayType']>('Public Holiday');
  const [financialYear, setFinancialYear] = useState('FY 2026-27');
  const [applicableDepartments, setApplicableDepartments] = useState<string[]>(['All Departments']);
  const [isOptional, setIsOptional] = useState(false);
  const [description, setDescription] = useState('');

  // Open Add Modal with fresh defaults
  const handleOpenAddModal = () => {
    setHolidayName('');
    setHolidayDate(new Date().toISOString().split('T')[0]);
    setHolidayType('Public Holiday');
    setFinancialYear('FY 2026-27');
    setApplicableDepartments(['All Departments']);
    setIsOptional(false);
    setDescription('');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (hol: HolidayItem) => {
    setEditingHoliday(hol);
    setHolidayName(hol.holidayName);
    setHolidayDate(hol.holidayDate);
    setHolidayType(hol.holidayType);
    setFinancialYear(hol.financialYear || 'FY 2026-27');
    setApplicableDepartments(hol.applicableDepartments && hol.applicableDepartments.length > 0 ? hol.applicableDepartments : ['All Departments']);
    setIsOptional(Boolean(hol.isOptional));
    setDescription(hol.description || '');
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim() || !holidayDate) return;

    addHoliday({
      holidayName: holidayName.trim(),
      holidayDate,
      holidayType,
      applicableDepartments: applicableDepartments.length > 0 ? applicableDepartments : ['All Departments'],
      isOptional,
      financialYear,
      description: description.trim(),
    });

    setShowAddModal(false);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday || !holidayName.trim() || !holidayDate) return;

    updateHoliday(editingHoliday.id, {
      holidayName: holidayName.trim(),
      holidayDate,
      holidayType,
      applicableDepartments: applicableDepartments.length > 0 ? applicableDepartments : ['All Departments'],
      isOptional,
      financialYear,
      description: description.trim(),
    });

    setEditingHoliday(null);
  };

  // Toggle department in selection
  const toggleDepartment = (dept: string) => {
    if (dept === 'All Departments') {
      setApplicableDepartments(['All Departments']);
      return;
    }

    setApplicableDepartments((prev) => {
      const filtered = prev.filter((d) => d !== 'All Departments');
      if (filtered.includes(dept)) {
        const next = filtered.filter((d) => d !== dept);
        return next.length === 0 ? ['All Departments'] : next;
      } else {
        return [...filtered, dept];
      }
    });
  };

  // Filtered Holidays List
  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((hol) => {
        const matchesSearch =
          hol.holidayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (hol.description && hol.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          hol.holidayDate.includes(searchTerm);

        const matchesType = typeFilter === 'all' || hol.holidayType === typeFilter;

        const holMonth = hol.holidayDate ? new Date(hol.holidayDate).getMonth() + 1 : 0;
        const matchesMonth = monthFilter === 'all' || holMonth === Number(monthFilter);

        return matchesSearch && matchesType && matchesMonth;
      })
      .sort((a, b) => (a.holidayDate > b.holidayDate ? 1 : -1));
  }, [holidays, searchTerm, typeFilter, monthFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = holidays.length;
    const publicHols = holidays.filter((h) => h.holidayType === 'Public Holiday').length;
    const festivals = holidays.filter((h) => h.holidayType === 'Festival').length;
    const optionalHols = holidays.filter((h) => h.isOptional || h.holidayType === 'Optional Holiday').length;

    return { total, publicHols, festivals, optionalHols };
  }, [holidays]);

  // Format Helper for Holiday Date Display
  const formatHolidayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: '01', month: 'JAN', year: '2026', weekday: 'Monday' };
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = d.getFullYear();
      const weekday = d.toLocaleString('en-US', { weekday: 'long' });
      return { day, month, year, weekday };
    } catch {
      return { day: '01', month: 'JAN', year: '2026', weekday: 'Monday' };
    }
  };

  // Get countdown string
  const getCountdownString = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today', isUpcoming: true, isToday: true };
    if (diffDays > 0 && diffDays <= 30) return { text: `In ${diffDays} days`, isUpcoming: true, isToday: false };
    if (diffDays > 30) return { text: `In ${diffDays} days`, isUpcoming: true, isToday: false };
    return { text: 'Past Holiday', isUpcoming: false, isToday: false };
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 border border-amber-100">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">
              Company &amp; Financial Year Holiday Calendar (FY 2026-27)
            </h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Official Public Holidays, Plant Maintenance Shutdowns, Festival Breaks &amp; Optional Holiday Roster
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Holiday Entry
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Total Annual Holidays</p>
            <p className="text-2xl font-black text-gray-900 mt-1 font-mono">{metrics.total}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">FY 2026-27 Approved</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Public &amp; Gazetted Holidays</p>
            <p className="text-2xl font-black text-blue-600 mt-1 font-mono">{metrics.publicHols}</p>
            <p className="text-[11px] text-blue-700 font-medium mt-0.5">Mandatory Statutory Offs</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Sun className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Festivals &amp; Cultural Breaks</p>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{metrics.festivals}</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Plant &amp; Office Celebrations</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <PartyPopper className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Optional / Choice Offs</p>
            <p className="text-2xl font-black text-purple-600 mt-1 font-mono">{metrics.optionalHols}</p>
            <p className="text-[11px] text-purple-700 font-medium mt-0.5">Employee Discretionary</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Star className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search holiday name, festival, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium focus:outline-none"
          >
            <option value="all">All Months (Jan - Dec)</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium focus:outline-none"
          >
            <option value="all">All Holiday Types</option>
            <option value="Public Holiday">Public Holiday</option>
            <option value="Festival">Festival</option>
            <option value="Company Holiday">Company Holiday</option>
            <option value="Optional Holiday">Optional Holiday</option>
          </select>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'cards' ? 'bg-white shadow text-amber-700' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'table' ? 'bg-white shadow text-amber-700' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Holidays List / Cards */}
      {filteredHolidays.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No Holidays Found</p>
          <p className="text-xs text-gray-500 mt-1">
            Click &quot;Add Holiday Entry&quot; to add a new holiday to the FY 2026-27 calendar.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHolidays.map((hol) => {
            const dateObj = formatHolidayDate(hol.holidayDate);
            const countdown = getCountdownString(hol.holidayDate);

            return (
              <div
                key={hol.id}
                className="bg-white border border-[#EBE3DB] rounded-2xl p-5 space-y-4 hover:border-amber-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar with Badge & Actions */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        hol.holidayType === 'Festival'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : hol.holidayType === 'Company Holiday'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : hol.holidayType === 'Optional Holiday' || hol.isOptional
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {hol.holidayType}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          countdown.isToday
                            ? 'bg-rose-100 text-rose-700 font-bold'
                            : countdown.isUpcoming
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {countdown.text}
                      </span>
                      <button
                        onClick={() => handleOpenEditModal(hol)}
                        className="p-1 text-gray-400 hover:text-amber-600 rounded"
                        title="Edit Holiday"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(hol.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                        title="Delete Holiday"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Date & Holiday Info */}
                  <div className="flex items-start gap-4">
                    {/* Calendar Tear-off Icon */}
                    <div className="flex-shrink-0 w-14 rounded-xl overflow-hidden border border-gray-200 shadow-sm text-center">
                      <div className="bg-amber-600 text-white font-bold text-[10px] py-0.5 uppercase tracking-wider">
                        {dateObj.month}
                      </div>
                      <div className="bg-amber-50 py-1 font-mono font-black text-lg text-amber-900">
                        {dateObj.day}
                      </div>
                      <div className="bg-white text-[9px] text-gray-500 py-0.5 font-medium border-t border-gray-100">
                        {dateObj.year}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 leading-snug">{hol.holidayName}</h3>
                      <div className="text-xs font-semibold text-amber-700 mt-1">
                        {dateObj.weekday}
                      </div>
                      {hol.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{hol.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Applicable:</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[200px]">
                      {hol.applicableDepartments && hol.applicableDepartments.length > 0
                        ? hol.applicableDepartments.join(', ')
                        : 'All Departments'}
                    </span>
                  </div>
                  {hol.isOptional && (
                    <div className="text-purple-700 font-bold text-[11px] flex items-center gap-1">
                      <Star className="w-3 h-3 text-purple-600" /> Optional Choice Off
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead>
                <tr className="bg-slate-50 text-gray-600 font-bold uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Holiday Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Applicable Departments</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHolidays.map((hol) => {
                  const dateObj = formatHolidayDate(hol.holidayDate);
                  return (
                    <tr key={hol.id} className="hover:bg-amber-50/20">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{hol.holidayDate}</td>
                      <td className="py-3 px-4 text-gray-600">{dateObj.weekday}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{hol.holidayName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            hol.holidayType === 'Festival'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : hol.holidayType === 'Company Holiday'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {hol.holidayType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {hol.applicableDepartments && hol.applicableDepartments.length > 0
                          ? hol.applicableDepartments.join(', ')
                          : 'All Departments'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{hol.description || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(hol)}
                            className="p-1 text-gray-400 hover:text-amber-600 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(hol.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" /> Add Holiday Entry
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Holiday Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali (Laxmi Pujan)"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Holiday Date *</label>
                  <input
                    type="date"
                    required
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Holiday Type *</label>
                  <select
                    value={holidayType}
                    onChange={(e) => setHolidayType(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                  >
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="Festival">Festival</option>
                    <option value="Company Holiday">Company Holiday</option>
                    <option value="Optional Holiday">Optional Holiday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Financial Year</label>
                  <input
                    type="text"
                    value={financialYear}
                    onChange={(e) => setFinancialYear(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-medium">
                    <input
                      type="checkbox"
                      checked={isOptional}
                      onChange={(e) => setIsOptional(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Is Optional / Choice Holiday</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Applicable Departments</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-gray-200">
                  {['All Departments', 'Production', 'Engineering & Design', 'Accounting', 'HR & Admin', 'Quality', 'Store'].map((dept) => {
                    const isSelected = applicableDepartments.includes(dept);
                    return (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional details or instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {editingHoliday && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" /> Edit Holiday ({editingHoliday.id})
              </h3>
              <button onClick={() => setEditingHoliday(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Holiday Name *</label>
                <input
                  type="text"
                  required
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Holiday Date *</label>
                  <input
                    type="date"
                    required
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Holiday Type *</label>
                  <select
                    value={holidayType}
                    onChange={(e) => setHolidayType(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                  >
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="Festival">Festival</option>
                    <option value="Company Holiday">Company Holiday</option>
                    <option value="Optional Holiday">Optional Holiday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Financial Year</label>
                  <input
                    type="text"
                    value={financialYear}
                    onChange={(e) => setFinancialYear(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-medium">
                    <input
                      type="checkbox"
                      checked={isOptional}
                      onChange={(e) => setIsOptional(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Is Optional / Choice Holiday</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Applicable Departments</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-gray-200">
                  {['All Departments', 'Production', 'Engineering & Design', 'Accounting', 'HR & Admin', 'Quality', 'Store'].map((dept) => {
                    const isSelected = applicableDepartments.includes(dept);
                    return (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingHoliday(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Update Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to delete holiday record <strong className="text-gray-900">{deleteConfirmId}</strong>? This action will remove it from the company calendar.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteHoliday(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm"
              >
                Delete Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
