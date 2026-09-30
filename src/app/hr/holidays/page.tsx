'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  AlertTriangle,
  X,
  LayoutGrid,
  List,
  ChevronRight,
  Sun,
  Flame,
  Star,
  RefreshCw,
} from 'lucide-react';

const DEPARTMENT_OPTIONS = [
  'All Departments',
  'Production',
  'Engineering & Design',
  'Accounting',
  'HR & Admin',
  'Quality',
  'Store',
];

export default function HolidayCalendarPage() {
  const { holidays = [], addHoliday, updateHoliday, deleteHoliday, departments } = useERP();

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayItem | null>(null);
  const [deleteConfirmHoliday, setDeleteConfirmHoliday] = useState<HolidayItem | null>(null);

  // Filters & Views
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Form State
  const initialFormState = {
    holidayName: '',
    holidayDate: new Date().toISOString().split('T')[0],
    holidayType: 'Public Holiday',
    financialYear: 'FY 2026-27',
    applicableDepartments: ['All Departments'],
    isOptional: false,
    description: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Input refs for auto-focusing the first invalid field
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  // Check if form is dirty
  const isFormDirty = useMemo(() => {
    return (
      formData.holidayName.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.isOptional !== false
    );
  }, [formData]);

  const closeModalWithConfirm = () => {
    if (isFormDirty && !editingHoliday) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    setShowModal(false);
    setEditingHoliday(null);
    setFormData(initialFormState);
    setFormErrors({});
    setTouched({});
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) closeModalWithConfirm();
        if (deleteConfirmHoliday) setDeleteConfirmHoliday(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isFormDirty, deleteConfirmHoliday]);

  // Validation function
  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'holidayName': {
        const trimmed = (value || '').trim();
        if (!trimmed) return 'Please enter the holiday name.';
        return null;
      }
      case 'holidayDate': {
        if (!value || value.trim() === '') return 'Please select the holiday date.';
        // Check duplicate date across other holidays
        const isDuplicate = holidays.some((h) => {
          const hId = h.id;
          const hDate = h.holidayDate || h.date;
          if (editingHoliday && hId === editingHoliday.id) return false;
          return hDate === value;
        });
        if (isDuplicate) return 'A holiday already exists on this date.';
        return null;
      }
      default:
        return null;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    const nameErr = validateField('holidayName', formData.holidayName);
    if (nameErr) errors.holidayName = nameErr;

    const dateErr = validateField('holidayDate', formData.holidayDate);
    if (dateErr) errors.holidayDate = dateErr;

    setFormErrors(errors);

    // Auto-focus first invalid field
    if (errors.holidayName && nameInputRef.current) {
      nameInputRef.current.focus();
    } else if (errors.holidayDate && dateInputRef.current) {
      dateInputRef.current.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, (formData as any)[field]);
    setFormErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field] || formErrors[field]) {
      const error = validateField(field, value);
      setFormErrors((prev) => {
        const next = { ...prev };
        if (error) next[field] = error;
        else delete next[field];
        return next;
      });
    }
  };

  // Toggle department in selection
  const toggleDepartment = (dept: string) => {
    if (dept === 'All Departments') {
      setFormData((prev) => ({ ...prev, applicableDepartments: ['All Departments'] }));
      return;
    }

    setFormData((prev) => {
      const current = prev.applicableDepartments.filter((d) => d !== 'All Departments');
      const next = current.includes(dept)
        ? current.filter((d) => d !== dept)
        : [...current, dept];
      return {
        ...prev,
        applicableDepartments: next.length === 0 ? ['All Departments'] : next,
      };
    });
  };

  const handleOpenAddModal = () => {
    setEditingHoliday(null);
    setFormData(initialFormState);
    setFormErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleOpenEditModal = (hol: HolidayItem) => {
    setEditingHoliday(hol);
    setFormData({
      holidayName: hol.holidayName || (hol as any).name || '',
      holidayDate: hol.holidayDate || hol.date || new Date().toISOString().split('T')[0],
      holidayType: hol.holidayType || 'Public Holiday',
      financialYear: hol.financialYear || 'FY 2026-27',
      applicableDepartments:
        hol.applicableDepartments && Array.isArray(hol.applicableDepartments) && hol.applicableDepartments.length > 0
          ? hol.applicableDepartments
          : ['All Departments'],
      isOptional: Boolean(hol.isOptional),
      description: hol.description || '',
    });
    setFormErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      holidayName: true,
      holidayDate: true,
    });

    if (!validateForm()) return;

    try {
      if (editingHoliday) {
        updateHoliday(editingHoliday.id, {
          holidayName: formData.holidayName.trim(),
          holidayDate: formData.holidayDate,
          date: formData.holidayDate,
          holidayType: formData.holidayType,
          applicableDepartments:
            formData.applicableDepartments.length > 0 ? formData.applicableDepartments : ['All Departments'],
          isOptional: formData.isOptional,
          financialYear: formData.financialYear,
          description: formData.description.trim(),
        });
        setSuccessToast(`The holiday "${formData.holidayName}" has been updated successfully.`);
      } else {
        addHoliday({
          holidayName: formData.holidayName.trim(),
          holidayDate: formData.holidayDate,
          date: formData.holidayDate,
          holidayType: formData.holidayType,
          applicableDepartments:
            formData.applicableDepartments.length > 0 ? formData.applicableDepartments : ['All Departments'],
          isOptional: formData.isOptional,
          financialYear: formData.financialYear,
          description: formData.description.trim(),
          status: 'Active',
        });
        setSuccessToast('The holiday has been created successfully.');
      }

      setShowModal(false);
      setEditingHoliday(null);
      setFormData(initialFormState);
      setFormErrors({});
      setTouched({});
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to save holiday:', err);
      setLoadError('The holiday could not be saved. Please try again.');
    }
  };

  const executeDelete = () => {
    if (!deleteConfirmHoliday) return;
    deleteHoliday(deleteConfirmHoliday.id);
    setSuccessToast(`Holiday "${deleteConfirmHoliday.holidayName}" deleted successfully.`);
    setDeleteConfirmHoliday(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadError(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Filtered Holidays List
  const filteredHolidays = useMemo(() => {
    const list = holidays || [];
    return list.filter((hol) => {
      const hName = (hol.holidayName || (hol as any).name || '').toLowerCase();
      const hDesc = (hol.description || '').toLowerCase();
      const hDate = hol.holidayDate || hol.date || '';
      const q = (searchTerm || '').toLowerCase();

      const matchesSearch = !q || hName.includes(q) || hDesc.includes(q) || hDate.includes(q);
      const hType = hol.holidayType || 'Public Holiday';
      const matchesType = typeFilter === 'all' || hType === typeFilter;

      let holMonth = 0;
      if (hDate) {
        const parsed = new Date(hDate);
        if (!isNaN(parsed.getTime())) {
          holMonth = parsed.getMonth() + 1;
        }
      }
      const matchesMonth = monthFilter === 'all' || holMonth === Number(monthFilter);

      return matchesSearch && matchesType && matchesMonth;
    });
  }, [holidays, searchTerm, typeFilter, monthFilter]);

  // Statistics
  const totalHolidays = (holidays || []).length;
  const publicCount = (holidays || []).filter((h) => h.holidayType === 'Public Holiday' || h.holidayType === 'Festival').length;
  const optionalCount = (holidays || []).filter((h) => h.isOptional || h.holidayType === 'Optional Holiday').length;

  return (
    <div className="p-6 space-y-6 bg-[#FDFBF9] min-h-screen text-[#211B17]">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-700">
              <PartyPopper className="w-6 h-6" />
            </div>
            Company & Financial Year Holiday Calendar (FY 2026-27)
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Statutory Public Holidays, Plant Maintenance Shutdowns, Festive Observances & Departmental Schedules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EBE3DB] hover:bg-[#F5EFEB] text-[#544B45] font-semibold text-xs rounded-lg transition shadow-sm"
            title="Reload holiday records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Add Holiday Entry
          </button>
        </div>
      </div>

      {/* Load Error Banner */}
      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#211B17]">{totalHolidays}</div>
            <div className="text-xs font-semibold text-[#70665F]">Total Annual Holidays</div>
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#211B17]">{publicCount}</div>
            <div className="text-xs font-semibold text-[#70665F]">Public & Festival Holidays</div>
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#211B17]">{optionalCount}</div>
            <div className="text-xs font-semibold text-[#70665F]">Optional / Choice Offs</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search holiday name, date (YYYY-MM-DD), notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
          >
            <option value="all">All Holiday Types</option>
            <option value="Public Holiday">Public Holiday</option>
            <option value="Festival">Festival</option>
            <option value="Company Holiday">Company Holiday</option>
            <option value="Optional Holiday">Optional Holiday</option>
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
          >
            <option value="all">All Months</option>
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

          <div className="flex items-center border border-[#EBE3DB] rounded-lg p-0.5 bg-[#FAF7F2]">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition ${viewMode === 'cards' ? 'bg-white text-amber-700 shadow-xs' : 'text-[#70665F]'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white text-amber-700 shadow-xs' : 'text-[#70665F]'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Holiday Content Grid / Table */}
      {isLoading ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#544B45]">Loading holiday calendar...</p>
        </div>
      ) : filteredHolidays.length === 0 ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Calendar className="w-12 h-12 text-[#A89F91] mx-auto" />
          <h3 className="text-base font-bold text-[#211B17]">No holidays found</h3>
          <p className="text-xs text-[#70665F] max-w-md mx-auto">
            {searchTerm || typeFilter !== 'all' || monthFilter !== 'all'
              ? 'No holiday records match your search criteria.'
              : 'No holidays have been configured for this financial year. Click "+ Add Holiday Entry" to create one.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHolidays.map((hol) => {
            const hDate = hol.holidayDate || hol.date || '';
            const parsedDate = hDate ? new Date(hDate) : null;
            const dayNum = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getDate() : '--';
            const monthStr = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString('en-US', { month: 'short' }) : '';
            const dayName = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString('en-US', { weekday: 'long' }) : '';

            return (
              <div
                key={hol.id}
                className="bg-white border border-[#EBE3DB] rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md hover:border-amber-300 transition duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex flex-col items-center justify-center font-bold shadow-xs">
                        <span className="text-lg leading-none">{dayNum}</span>
                        <span className="text-[10px] uppercase tracking-wider">{monthStr}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#211B17] leading-snug">
                          {hol.holidayName || (hol as any).name}
                        </h3>
                        <div className="text-xs font-semibold text-amber-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{dayName}</span>
                          <span className="text-[#A89F91] font-mono font-normal">({hDate})</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        hol.holidayType === 'Festival'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : hol.holidayType === 'Company Holiday'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {hol.holidayType || 'Public Holiday'}
                    </span>
                  </div>

                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB] space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#544B45]">
                      <Building2 className="w-3.5 h-3.5 text-[#70665F] shrink-0" />
                      <span className="truncate">
                        {hol.applicableDepartments && Array.isArray(hol.applicableDepartments) && hol.applicableDepartments.length > 0
                          ? hol.applicableDepartments.join(', ')
                          : 'All Departments'}
                      </span>
                    </div>
                    {hol.description && (
                      <p className="text-[11px] text-[#70665F] line-clamp-2 italic">
                        &ldquo;{hol.description}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EBE3DB]/60 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-[#70665F] bg-[#FAF7F2] px-2 py-0.5 rounded">
                    {hol.financialYear || 'FY 2026-27'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(hol)}
                      className="p-1.5 text-[#70665F] hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                      title="Edit holiday"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmHoliday(hol)}
                      className="p-1.5 text-[#70665F] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete holiday"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#70665F] font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Holiday Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Applicable Departments</th>
                  <th className="py-3.5 px-4">Financial Year</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB]/60 text-[#211B17]">
                {filteredHolidays.map((hol) => (
                  <tr key={hol.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      {hol.holidayDate || hol.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#211B17]">
                      {hol.holidayName || (hol as any).name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          hol.holidayType === 'Festival'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : hol.holidayType === 'Company Holiday'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {hol.holidayType || 'Public Holiday'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#544B45]">
                      {hol.applicableDepartments && Array.isArray(hol.applicableDepartments) && hol.applicableDepartments.length > 0
                        ? hol.applicableDepartments.join(', ')
                        : 'All Departments'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#70665F]">
                      {hol.financialYear || 'FY 2026-27'}
                    </td>
                    <td className="py-3.5 px-4 text-[#70665F] max-w-xs truncate">
                      {hol.description || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(hol)}
                          className="p-1.5 text-[#70665F] hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                          title="Edit holiday"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmHoliday(hol)}
                          className="p-1.5 text-[#70665F] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete holiday"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Holiday Modal */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModalWithConfirm();
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                {editingHoliday ? 'Edit Holiday Entry' : 'Add Holiday Entry'}
              </h3>
              <button
                type="button"
                onClick={closeModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] p-1.5 rounded-lg hover:bg-[#F5EFEB] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form with noValidate to prevent native tooltip */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-xs">
              {/* 1. Holiday Name */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Holiday Name <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="e.g. Diwali (Laxmi Pujan)"
                  value={formData.holidayName}
                  onBlur={() => handleBlur('holidayName')}
                  onChange={(e) => handleChange('holidayName', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                    formErrors.holidayName
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-amber-600'
                  }`}
                />
                {formErrors.holidayName && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.holidayName}
                  </p>
                )}
              </div>

              {/* 2. Holiday Date & Holiday Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Holiday Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={formData.holidayDate}
                    onBlur={() => handleBlur('holidayDate')}
                    onChange={(e) => handleChange('holidayDate', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs font-mono text-[#211B17] focus:outline-none transition ${
                      formErrors.holidayDate
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-amber-600'
                    }`}
                  />
                  {formErrors.holidayDate && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.holidayDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Holiday Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.holidayType}
                    onChange={(e) => handleChange('holidayType', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600 transition"
                  >
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="Festival">Festival</option>
                    <option value="Company Holiday">Company Holiday</option>
                    <option value="Optional Holiday">Optional Holiday</option>
                  </select>
                </div>
              </div>

              {/* 3. Financial Year & Optional Choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Financial Year</label>
                  <input
                    type="text"
                    value={formData.financialYear}
                    onChange={(e) => handleChange('financialYear', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600 transition"
                  />
                </div>

                <div className="flex items-center sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-[#544B45] font-medium">
                    <input
                      type="checkbox"
                      checked={formData.isOptional}
                      onChange={(e) => handleChange('isOptional', e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-[#EBE3DB]"
                    />
                    <span>Is Optional / Choice Holiday</span>
                  </label>
                </div>
              </div>

              {/* 4. Applicable Departments */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Applicable Departments</label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                  {DEPARTMENT_OPTIONS.map((dept) => {
                    const isSelected = formData.applicableDepartments.includes(dept);
                    return (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white text-[#544B45] border border-[#EBE3DB] hover:bg-[#F5EFEB]'
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Description / Notes */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional details or instructions..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600 transition"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModalWithConfirm}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {editingHoliday ? 'Update Holiday' : 'Save Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmHoliday && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmHoliday(null);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#211B17]">Delete Holiday Entry</h3>
                <p className="text-xs text-[#70665F]">
                  {deleteConfirmHoliday.id} • {deleteConfirmHoliday.holidayName || (deleteConfirmHoliday as any).name}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#544B45] leading-relaxed">
              Are you sure you want to delete holiday <strong>{deleteConfirmHoliday.holidayName || (deleteConfirmHoliday as any).name}</strong> on {deleteConfirmHoliday.holidayDate || deleteConfirmHoliday.date}?
            </p>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmHoliday(null)}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow transition"
              >
                Yes, Delete Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
