'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  TrendingUp,
  Plus,
  Award,
  ArrowUpRight,
  DollarSign,
  Calendar,
  X,
  AlertCircle,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  UserCheck,
  ShieldAlert,
  Sparkles,
  History,
  ArrowRight,
} from 'lucide-react';
import { EmployeePromotionItem } from '../../../types/hr';

const CADRE_GRADES = [
  'Level 1 - Trainee / Junior Associate',
  'Level 2 - Associate / Junior Engineer',
  'Level 3 - Engineer / Executive',
  'Level 4 - Senior Engineer / Senior Executive',
  'Level 5 - Lead / Assistant Manager',
  'Level 6 - Deputy Manager / Manager',
  'Level 7 - Senior Manager / HOD / VP',
];

export default function PromotionsPage() {
  const {
    employeePromotions = [],
    addEmployeePromotion,
    updateEmployeePromotion,
    deleteEmployeePromotion,
    availableEmployees = [],
    designations = [],
    updateEmployee,
    currentUser,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<EmployeePromotionItem | null>(null);

  const initialFormState = {
    employeeId: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    oldDesignation: '',
    newDesignation: '',
    oldGrade: CADRE_GRADES[1],
    newGrade: CADRE_GRADES[2],
    oldCTC: 0,
    newCTC: 0,
    reason: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Lookup selected employee
  const selectedEmp = useMemo(() => {
    if (!formData.employeeId) return null;
    return (availableEmployees || []).find((e) => e.id === formData.employeeId) || null;
  }, [availableEmployees, formData.employeeId]);

  // Handle employee selection
  const handleEmployeeChange = (empId: string) => {
    const emp = (availableEmployees || []).find((e) => e.id === empId);
    if (emp) {
      const currentDesg = emp.designation || 'Engineer';
      const currentCTC = (emp as any).ctc || (emp as any).salary || 480000;

      setFormData((prev) => ({
        ...prev,
        employeeId: empId,
        oldDesignation: currentDesg,
        oldCTC: Number(currentCTC),
        newCTC: prev.newCTC > 0 ? prev.newCTC : Math.round(Number(currentCTC) * 1.15),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        employeeId: '',
        oldDesignation: '',
        oldCTC: 0,
        newCTC: 0,
      }));
    }

    if (formErrors.employeeId) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.employeeId;
        return next;
      });
    }
  };

  // Live increment calculation
  const calculatedIncrement = useMemo(() => {
    const oldVal = Number(formData.oldCTC) || 0;
    const newVal = Number(formData.newCTC) || 0;
    const diff = newVal - oldVal;
    const pct = oldVal > 0 ? Math.round((diff / oldVal) * 100) : 0;
    return { diff, pct };
  }, [formData.oldCTC, formData.newCTC]);

  // Form dirty check
  const isFormDirty = useMemo(() => {
    return (
      formData.employeeId !== '' ||
      formData.newDesignation !== '' ||
      formData.newCTC > 0 ||
      formData.reason.trim() !== ''
    );
  }, [formData]);

  const closeModalWithConfirm = () => {
    if (isFormDirty && !editingId) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    setShowModal(false);
    setEditingId(null);
    setFormErrors({});
    setFormData(initialFormState);
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        closeModalWithConfirm();
      }
      if (e.key === 'Escape' && deleteConfirmItem) {
        setDeleteConfirmItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isFormDirty, deleteConfirmItem]);

  // Form Validations
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // 1. Employee
    if (!formData.employeeId) {
      errors.employeeId = 'Please select the employee.';
    }

    // 2. New Designation
    if (!formData.newDesignation || formData.newDesignation.trim() === '') {
      errors.newDesignation = 'Please select the new designation.';
    }

    // 3. New Annual CTC / Increment Amount
    if (!formData.newCTC || Number(formData.newCTC) <= 0) {
      errors.newCTC = 'Please enter the increment amount. New CTC must be greater than zero.';
    } else if (Number(formData.newCTC) <= Number(formData.oldCTC)) {
      errors.newCTC = 'New Annual CTC must be greater than current CTC (₹' + Number(formData.oldCTC).toLocaleString() + ').';
    }

    // 4. Effective Date
    if (!formData.effectiveDate || formData.effectiveDate.trim() === '') {
      errors.effectiveDate = 'Please select the effective date.';
    } else {
      // Cannot be more than 180 days in past
      const selectedDate = new Date(formData.effectiveDate);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
      if (selectedDate < sixMonthsAgo) {
        errors.effectiveDate = 'The effective date cannot be too far in the past (maximum 180 days retrospective).';
      }
    }

    // 5. Reason / Justification
    if (!formData.reason || formData.reason.trim() === '') {
      errors.reason = 'Please enter the increment justification or performance appraisal reference.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (prm: EmployeePromotionItem) => {
    setEditingId(prm.id);
    setFormData({
      employeeId: prm.employeeId,
      effectiveDate: prm.effectiveDate,
      oldDesignation: prm.oldDesignation,
      newDesignation: prm.newDesignation,
      oldGrade: prm.oldGrade || CADRE_GRADES[1],
      newGrade: prm.newGrade || CADRE_GRADES[2],
      oldCTC: Number(prm.oldCTC),
      newCTC: Number(prm.newCTC),
      reason: (prm as any).reason || 'Annual appraisal & milestone promotion order.',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteRecord = (prm: EmployeePromotionItem) => {
    setDeleteConfirmItem(prm);
  };

  const executeDelete = () => {
    if (!deleteConfirmItem) return;
    deleteEmployeePromotion(deleteConfirmItem.id);
    setSuccessToast(`Promotion order ${deleteConfirmItem.id} has been successfully deleted.`);
    setDeleteConfirmItem(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const emp = (availableEmployees || []).find((e) => e.id === formData.employeeId);
    const empName = emp?.name || (emp ? `${(emp as any).firstName || ''} ${(emp as any).lastName || ''}`.trim() : 'Staff Member');
    const pct = calculatedIncrement.pct;

    if (editingId) {
      // Update existing
      updateEmployeePromotion(editingId, {
        employeeId: formData.employeeId,
        employeeName: empName,
        effectiveDate: formData.effectiveDate,
        oldDesignation: formData.oldDesignation,
        newDesignation: formData.newDesignation,
        oldGrade: formData.oldGrade,
        newGrade: formData.newGrade,
        oldCTC: Number(formData.oldCTC),
        newCTC: Number(formData.newCTC),
        incrementPercentage: pct,
        reason: formData.reason.trim(),
        approvedBy: currentUser ? `${currentUser.name} (${currentUser.role || 'HR Admin'})` : 'General Manager & HR Head',
        status: 'Approved',
      } as any);

      if (updateEmployee && formData.employeeId) {
        updateEmployee(formData.employeeId, {
          designation: formData.newDesignation,
          ctc: Number(formData.newCTC),
        } as any);
      }

      setSuccessToast(`Promotion record ${editingId} updated successfully.`);
    } else {
      // Create new
      addEmployeePromotion({
        employeeId: formData.employeeId,
        employeeName: empName,
        effectiveDate: formData.effectiveDate,
        oldDesignation: formData.oldDesignation,
        newDesignation: formData.newDesignation,
        oldGrade: formData.oldGrade,
        newGrade: formData.newGrade,
        oldCTC: Number(formData.oldCTC),
        newCTC: Number(formData.newCTC),
        incrementPercentage: pct,
        reason: formData.reason.trim(),
        approvedBy: currentUser ? `${currentUser.name} (${currentUser.role || 'HR Admin'})` : 'General Manager & HR Head',
        status: 'Approved',
      } as any);

      if (updateEmployee && formData.employeeId) {
        updateEmployee(formData.employeeId, {
          designation: formData.newDesignation,
          ctc: Number(formData.newCTC),
        } as any);
      }

      setSuccessToast(`Promotion & increment order recorded successfully for ${empName}!`);
    }

    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
    setFormErrors({});
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Filtered promotions
  const filteredPromotions = useMemo(() => {
    return (employeePromotions || []).filter((prm) => {
      const q = searchTerm.toLowerCase();
      return (
        prm.employeeName.toLowerCase().includes(q) ||
        prm.employeeId.toLowerCase().includes(q) ||
        prm.id.toLowerCase().includes(q) ||
        prm.newDesignation.toLowerCase().includes(q) ||
        (prm.oldDesignation || '').toLowerCase().includes(q)
      );
    });
  }, [employeePromotions, searchTerm]);

  return (
    <div className="p-6 space-y-6 bg-[#FDFBF9] min-h-screen text-[#211B17]">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            Promotion & Salary Increment Records
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Designation Upgrades, Cadre Level Reclassifications & CTC Increment Audit History
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Record Promotion Order
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Total Promotions Logged
            </span>
            <span className="text-2xl font-black text-[#211B17]">
              {employeePromotions.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Active Staff Mastered
            </span>
            <span className="text-2xl font-black text-[#211B17]">
              {availableEmployees.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider block">
              Audit Compliance Status
            </span>
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4" /> Fully Traceable Log
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-3.5 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Employee name, ID, or Designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-rose-600 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Promotions List */}
      {filteredPromotions.length === 0 ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <TrendingUp className="w-12 h-12 text-[#A89F91] mx-auto" />
          <h3 className="text-base font-bold text-[#211B17]">No promotion records found</h3>
          <p className="text-xs text-[#70665F] max-w-md mx-auto">
            {searchTerm
              ? 'No promotion orders match your search criteria. Try a different query.'
              : 'No promotion orders recorded yet. Click "+ Record Promotion Order" to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPromotions.map((prm) => {
            const masterEmp = (availableEmployees || []).find((e) => e.id === prm.employeeId);
            const displayName = masterEmp?.name || prm.employeeName;

            return (
              <div
                key={prm.id}
                className="bg-white border border-[#EBE3DB] hover:border-rose-300 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Top Row: ID, Name, Status, Action Buttons */}
                <div className="flex items-center justify-between border-b border-[#EBE3DB]/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                      {prm.id}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                        {displayName}
                        <span className="text-xs font-normal text-[#70665F]">({prm.employeeId})</span>
                      </h3>
                    </div>
                  </div>

                  {/* Actions Column: Edit & Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(prm)}
                      className="p-1.5 text-[#544B45] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Edit promotion record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(prm)}
                      className="p-1.5 text-[#544B45] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete promotion record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="text-[#70665F]">
                    Effective Date: <strong className="text-[#211B17]">{prm.effectiveDate}</strong>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    {prm.status || 'Approved'}
                  </span>
                </div>

                {/* Details Container */}
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#70665F] font-medium">Designation Upgrade:</span>
                    <span className="font-medium text-[#211B17] flex items-center gap-1.5">
                      <span className="text-[#70665F]">{prm.oldDesignation || '—'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                      <strong className="text-rose-700">{prm.newDesignation}</strong>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#70665F] font-medium">Cadre Grade Level:</span>
                    <span className="text-[#544B45]">
                      {prm.oldGrade || 'Level 3'} → <strong className="text-amber-800">{prm.newGrade || 'Level 4'}</strong>
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#EBE3DB] pt-2">
                    <span className="text-[#70665F] font-medium">CTC Revision:</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      ₹{Number(prm.oldCTC || 0).toLocaleString()} → ₹{Number(prm.newCTC || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right text-xs font-black text-rose-600 flex items-center justify-end gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{prm.incrementPercentage}% Overall Increment (+₹{(Number(prm.newCTC || 0) - Number(prm.oldCTC || 0)).toLocaleString()})
                  </div>
                </div>

                {/* Footer: Audit & Approver */}
                <div className="text-[11px] text-[#70665F] flex items-center justify-between border-t border-[#EBE3DB]/60 pt-2.5">
                  <span className="italic truncate max-w-[200px]">
                    &quot;{(prm as any).reason || 'Approved in annual revision'}&quot;
                  </span>
                  <span>
                    Approved By: <strong className="text-[#211B17]">{prm.approvedBy || 'HR Head'}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record / Edit Promotion Modal */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModalWithConfirm();
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#211B17]">
                    {editingId ? 'Edit Promotion / Increment Order' : 'Record Promotion / Increment Order'}
                  </h2>
                  <p className="text-xs text-[#70665F]">
                    {editingId ? 'Modify saved promotion parameters and audit trail' : 'Upgrade employee designation, grade, or salary package'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] p-1.5 rounded-lg hover:bg-[#F5EFEB] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Select Employee */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  disabled={editingId !== null}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition disabled:bg-gray-100 ${
                    formErrors.employeeId
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-rose-600'
                  }`}
                >
                  <option value="">-- Choose Employee from Master --</option>
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name || `${(e as any).firstName || ''} ${(e as any).lastName || ''}`.trim()} ({e.department || 'General'} • {e.designation || 'Staff'})
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.employeeId}
                  </p>
                )}
              </div>

              {/* 2. Designation Upgrade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Current Designation</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.oldDesignation || 'Select employee first'}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs text-[#70665F] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    New Designation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.newDesignation}
                    onChange={(e) => {
                      setFormData({ ...formData, newDesignation: e.target.value });
                      if (formErrors.newDesignation) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.newDesignation;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                      formErrors.newDesignation
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-rose-600'
                    }`}
                  >
                    <option value="">-- Select New Designation --</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.designationName}>
                        {d.designationName} ({d.department})
                      </option>
                    ))}
                  </select>
                  {formErrors.newDesignation && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.newDesignation}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Grade Change */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Current Grade Level</label>
                  <select
                    value={formData.oldGrade}
                    onChange={(e) => setFormData({ ...formData, oldGrade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17]"
                  >
                    {CADRE_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">New Grade Level</label>
                  <select
                    value={formData.newGrade}
                    onChange={(e) => setFormData({ ...formData, newGrade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17]"
                  >
                    {CADRE_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. CTC Revisions & Increment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Current Annual CTC (₹)</label>
                  <input
                    type="number"
                    value={formData.oldCTC}
                    onChange={(e) => setFormData({ ...formData, oldCTC: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    New Annual CTC (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 600000"
                    value={formData.newCTC || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, newCTC: Number(e.target.value) });
                      if (formErrors.newCTC) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.newCTC;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] font-bold focus:outline-none transition ${
                      formErrors.newCTC
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-rose-600'
                    }`}
                  />
                  {formErrors.newCTC && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.newCTC}
                    </p>
                  )}
                </div>
              </div>

              {/* Live Increment Preview Badge */}
              {formData.newCTC > 0 && (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#544B45]">Calculated Increment:</span>
                  <div className="text-right">
                    <span className="font-bold text-rose-700">
                      +{calculatedIncrement.pct}% (+₹{calculatedIncrement.diff.toLocaleString()}/annum)
                    </span>
                  </div>
                </div>
              )}

              {/* 5. Effective Date */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Effective Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => {
                    setFormData({ ...formData, effectiveDate: e.target.value });
                    if (formErrors.effectiveDate) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.effectiveDate;
                        return next;
                      });
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                    formErrors.effectiveDate
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-rose-600'
                  }`}
                />
                {formErrors.effectiveDate && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.effectiveDate}
                  </p>
                )}
              </div>

              {/* 6. Reason / Justification */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Justification / Appraisal Reference <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain the appraisal rating, skill acquisition, or performance justification..."
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({ ...formData, reason: e.target.value });
                    if (formErrors.reason) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.reason;
                        return next;
                      });
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                    formErrors.reason
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-rose-600'
                  }`}
                />
                {formErrors.reason && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.reason}
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-[#EBE3DB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModalWithConfirm}
                  className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  {editingId ? 'Update Promotion Record' : 'Save Promotion Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmItem(null);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#211B17]">Delete Promotion Record</h3>
                <p className="text-xs text-[#70665F]">Order ID: {deleteConfirmItem.id}</p>
              </div>
            </div>

            <p className="text-sm text-[#544B45] leading-relaxed">
              Are you sure you want to delete this record? This will remove the promotion order for <strong>{deleteConfirmItem.employeeName}</strong> and revert the CTC audit record.
            </p>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow transition"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
