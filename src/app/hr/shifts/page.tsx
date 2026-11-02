'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Layers,
  Plus,
  Clock,
  CheckCircle2,
  ShieldCheck,
  X,
  AlertCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Coffee,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { ShiftMaster } from '../../../types/hr';

const WEEKLY_OFF_DAYS: ('Sunday' | 'Saturday & Sunday' | 'Rotating')[] = [
  'Sunday',
  'Saturday & Sunday',
  'Rotating',
];

export default function ShiftManagementPage() {
  const {
    shiftMasters = [],
    addShiftMaster,
    updateShiftMaster,
    deleteShiftMaster,
  } = useERP();

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmShift, setDeleteConfirmShift] = useState<ShiftMaster | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    shiftName: '',
    startTime: '',
    endTime: '',
    gracePeriodMinutes: 15,
    breakDurationMinutes: 60,
    lateRule: 'Half-day deduction after 3 late marks in a month',
    earlyCheckoutRule: 'Gate pass approval required from Department Head',
    overtimeRule: '1.5x hourly rate after 8.5 working hours',
    weeklyOff: 'Sunday' as ShiftMaster['weeklyOff'],
    status: 'Active' as ShiftMaster['status'],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Check if form is dirty
  const isFormDirty = useMemo(() => {
    return (
      formData.shiftName.trim() !== '' ||
      formData.startTime !== '' ||
      formData.endTime !== ''
    );
  }, [formData]);

  const closeModalWithConfirm = () => {
    if (isFormDirty && !editingId) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setTouched({});
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) closeModalWithConfirm();
        if (deleteConfirmShift) setDeleteConfirmShift(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isFormDirty, deleteConfirmShift]);

  // Validation function
  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'shiftName': {
        const trimmed = (value || '').trim();
        if (!trimmed) return 'Please enter the shift name.';
        // Check duplicate name
        const isDuplicate = shiftMasters.some(
          (s) =>
            s.id !== editingId &&
            s.shiftName.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (isDuplicate) return 'A shift with this name already exists.';
        return null;
      }
      case 'startTime': {
        if (!value || value.trim() === '') return 'Please select the start time.';
        return null;
      }
      case 'endTime': {
        if (!value || value.trim() === '') return 'Please select the end time.';
        return null;
      }
      case 'gracePeriodMinutes': {
        if (value === '' || Number(value) < 0) return 'Grace period must be 0 or more minutes.';
        return null;
      }
      case 'breakDurationMinutes': {
        if (value === '' || Number(value) < 0) return 'Break duration must be 0 or more minutes.';
        return null;
      }
      default:
        return null;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    const nameErr = validateField('shiftName', formData.shiftName);
    if (nameErr) errors.shiftName = nameErr;

    const startErr = validateField('startTime', formData.startTime);
    if (startErr) errors.startTime = startErr;

    const endErr = validateField('endTime', formData.endTime);
    if (endErr) errors.endTime = endErr;

    const graceErr = validateField('gracePeriodMinutes', formData.gracePeriodMinutes);
    if (graceErr) errors.gracePeriodMinutes = graceErr;

    const breakErr = validateField('breakDurationMinutes', formData.breakDurationMinutes);
    if (breakErr) errors.breakDurationMinutes = breakErr;

    setFormErrors(errors);
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

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleOpenEditModal = (shift: ShiftMaster) => {
    setEditingId(shift.id);
    setFormData({
      shiftName: shift.shiftName,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriodMinutes: shift.gracePeriodMinutes,
      breakDurationMinutes: shift.breakDurationMinutes,
      lateRule: shift.lateRule || initialFormState.lateRule,
      earlyCheckoutRule: shift.earlyCheckoutRule || initialFormState.earlyCheckoutRule,
      overtimeRule: shift.overtimeRule || initialFormState.overtimeRule,
      weeklyOff: (shift.weeklyOff as ShiftMaster['weeklyOff']) || 'Sunday',
      status: (shift.status as ShiftMaster['status']) || 'Active',
    });
    setFormErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleDeleteRecord = (shift: ShiftMaster) => {
    setDeleteConfirmShift(shift);
  };

  const executeDelete = () => {
    if (!deleteConfirmShift) return;
    deleteShiftMaster(deleteConfirmShift.id);
    setSuccessToast(`Shift "${deleteConfirmShift.shiftName}" deleted successfully.`);
    setDeleteConfirmShift(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      shiftName: true,
      startTime: true,
      endTime: true,
      gracePeriodMinutes: true,
      breakDurationMinutes: true,
    });

    if (!validateForm()) return;

    try {
      if (editingId) {
        updateShiftMaster(editingId, {
          shiftName: formData.shiftName.trim(),
          startTime: formData.startTime,
          endTime: formData.endTime,
          gracePeriodMinutes: Number(formData.gracePeriodMinutes),
          breakDurationMinutes: Number(formData.breakDurationMinutes),
          lateRule: formData.lateRule,
          earlyCheckoutRule: formData.earlyCheckoutRule,
          overtimeRule: formData.overtimeRule,
          weeklyOff: formData.weeklyOff as ShiftMaster['weeklyOff'],
          status: formData.status as ShiftMaster['status'],
        });
        setSuccessToast(`Shift "${formData.shiftName}" updated successfully.`);
      } else {
        addShiftMaster({
          shiftName: formData.shiftName.trim(),
          startTime: formData.startTime,
          endTime: formData.endTime,
          gracePeriodMinutes: Number(formData.gracePeriodMinutes),
          breakDurationMinutes: Number(formData.breakDurationMinutes),
          lateRule: formData.lateRule,
          earlyCheckoutRule: formData.earlyCheckoutRule,
          overtimeRule: formData.overtimeRule,
          weeklyOff: formData.weeklyOff as ShiftMaster['weeklyOff'],
          status: 'Active',
        });
        setSuccessToast('The shift has been created successfully.');
      }

      // Reset form and close modal
      setShowModal(false);
      setEditingId(null);
      setFormData(initialFormState);
      setFormErrors({});
      setTouched({});
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to save shift master:', err);
      setLoadError('The shift could not be saved. Please try again.');
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadError(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Filter shifts by search
  const filteredShifts = useMemo(() => {
    return (shiftMasters || []).filter((s) => {
      const q = searchTerm.toLowerCase();
      return (
        s.shiftName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.weeklyOff || '').toLowerCase().includes(q)
      );
    });
  }, [shiftMasters, searchTerm]);

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)] min-h-screen text-[color:var(--crm-text-primary)]">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[color:var(--crm-border-default)] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--crm-text-primary)] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-700">
              <Layers className="w-6 h-6" />
            </div>
            Shift Master Management
          </h1>
          <p className="text-sm text-[color:var(--crm-text-secondary)] mt-1">
            Manufacturing Plant Shift Timings, Grace Period Rules, Overtime Multipliers & Weekly Off Configuration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[color:var(--crm-border-default)] hover:bg-[#F5EFEB] text-[color:var(--crm-text-secondary)] font-semibold text-xs rounded-lg transition shadow-sm"
            title="Reload shift records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Define New Shift
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

      {/* Search Bar */}
      <div className="bg-white border border-[color:var(--crm-border-default)] rounded-xl p-3.5 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-[color:var(--crm-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shifts by name, timing, or weekly off..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:border-sky-600 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Shift Cards Grid */}
      {isLoading ? (
        <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[color:var(--crm-text-secondary)]">Loading shift records...</p>
        </div>
      ) : filteredShifts.length === 0 ? (
        <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Layers className="w-12 h-12 text-[color:var(--crm-text-tertiary)] mx-auto" />
          <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">No shift masters found</h3>
          <p className="text-xs text-[color:var(--crm-text-secondary)] max-w-md mx-auto">
            {searchTerm
              ? 'No shifts match your search criteria. Try a different query.'
              : 'No manufacturing shifts have been configured yet. Click "+ Define New Shift" to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md hover:border-sky-300 transition duration-200"
            >
              <div className="flex items-center justify-between border-b border-[#E2E7EF]/60 pb-3">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {shift.id}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    {shift.status || 'Active'}
                  </span>
                  <button
                    onClick={() => handleOpenEditModal(shift)}
                    className="p-1.5 text-[color:var(--crm-text-secondary)] hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                    title="Edit shift"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(shift)}
                    className="p-1.5 text-[color:var(--crm-text-secondary)] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete shift"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">{shift.shiftName}</h3>
                <div className="text-base font-extrabold text-sky-700 mt-1 flex items-center gap-2 font-mono">
                  <Clock className="w-4 h-4 text-[color:var(--crm-text-secondary)]" /> {shift.startTime} — {shift.endTime}
                </div>
              </div>

              <div className="bg-[color:var(--crm-bg-app)] p-3.5 rounded-xl border border-[color:var(--crm-border-default)] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[color:var(--crm-text-secondary)]">Grace Period:</span>
                  <span className="font-bold text-amber-700">{shift.gracePeriodMinutes} Mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--crm-text-secondary)]">Lunch / Tea Break:</span>
                  <span className="font-bold text-[color:var(--crm-text-primary)]">{shift.breakDurationMinutes} Mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--crm-text-secondary)]">Weekly Off:</span>
                  <span className="font-bold text-sky-700">{shift.weeklyOff || 'Sunday'}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-[color:var(--crm-text-secondary)]">
                <div><strong className="text-[color:var(--crm-text-secondary)]">Late Rule:</strong> {shift.lateRule}</div>
                <div><strong className="text-[color:var(--crm-text-secondary)]">Overtime:</strong> {shift.overtimeRule}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configure Shift Master Modal */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModalWithConfirm();
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/10 rounded-lg text-sky-700">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[color:var(--crm-text-primary)]">
                    {editingId ? 'Edit Shift Master' : 'Configure Shift Master'}
                  </h2>
                  <p className="text-xs text-[color:var(--crm-text-secondary)]">
                    Define plant shift operational hours, grace margins and overtime logic
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModalWithConfirm}
                className="text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] p-1.5 rounded-lg hover:bg-[#F5EFEB] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Shift Name */}
              <div>
                <label className="block text-[color:var(--crm-text-secondary)] font-semibold mb-1">
                  Shift Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CNC Night Shift (Shift C)"
                  value={formData.shiftName}
                  onBlur={() => handleBlur('shiftName')}
                  onChange={(e) => handleChange('shiftName', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none transition ${
                    formErrors.shiftName
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[color:var(--crm-border-default)] focus:border-sky-600'
                  }`}
                />
                {formErrors.shiftName && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.shiftName}
                  </p>
                )}
              </div>

              {/* 2. Start Time & End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] font-semibold mb-1">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onBlur={() => handleBlur('startTime')}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs font-mono text-[color:var(--crm-text-primary)] focus:outline-none transition ${
                      formErrors.startTime
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[color:var(--crm-border-default)] focus:border-sky-600'
                    }`}
                  />
                  {formErrors.startTime && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.startTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] font-semibold mb-1">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onBlur={() => handleBlur('endTime')}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs font-mono text-[color:var(--crm-text-primary)] focus:outline-none transition ${
                      formErrors.endTime
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[color:var(--crm-border-default)] focus:border-sky-600'
                    }`}
                  />
                  {formErrors.endTime && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.endTime}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Grace Period & Break Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] font-semibold mb-1">
                    Grace Period (Mins) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.gracePeriodMinutes}
                    onBlur={() => handleBlur('gracePeriodMinutes')}
                    onChange={(e) => handleChange('gracePeriodMinutes', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none transition ${
                      formErrors.gracePeriodMinutes
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[color:var(--crm-border-default)] focus:border-sky-600'
                    }`}
                  />
                  {formErrors.gracePeriodMinutes && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.gracePeriodMinutes}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] font-semibold mb-1">
                    Break Duration (Mins) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.breakDurationMinutes}
                    onBlur={() => handleBlur('breakDurationMinutes')}
                    onChange={(e) => handleChange('breakDurationMinutes', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none transition ${
                      formErrors.breakDurationMinutes
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[color:var(--crm-border-default)] focus:border-sky-600'
                    }`}
                  />
                  {formErrors.breakDurationMinutes && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.breakDurationMinutes}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Weekly Off */}
              <div>
                <label className="block text-[color:var(--crm-text-secondary)] font-semibold mb-1">Weekly Off</label>
                <select
                  value={formData.weeklyOff}
                  onChange={(e) => handleChange('weeklyOff', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:border-sky-600 transition"
                >
                  {WEEKLY_OFF_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-[color:var(--crm-border-default)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModalWithConfirm}
                  className="px-4 py-2.5 bg-[color:var(--crm-bg-app)] hover:bg-[color:var(--crm-border-default)] text-[color:var(--crm-text-secondary)] font-semibold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-700 hover:bg-sky-600 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  {editingId ? 'Update Shift Master' : 'Save Shift Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmShift && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmShift(null);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">Delete Shift Master</h3>
                <p className="text-xs text-[color:var(--crm-text-secondary)]">{deleteConfirmShift.id} - {deleteConfirmShift.shiftName}</p>
              </div>
            </div>

            <p className="text-sm text-[color:var(--crm-text-secondary)] leading-relaxed">
              Are you sure you want to delete shift <strong>{deleteConfirmShift.shiftName}</strong>? This action will remove the shift definition from the master database.
            </p>

            <div className="pt-3 border-t border-[color:var(--crm-border-default)] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmShift(null)}
                className="px-4 py-2 bg-[color:var(--crm-bg-app)] hover:bg-[color:var(--crm-border-default)] text-[color:var(--crm-text-secondary)] font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow transition"
              >
                Yes, Delete Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
