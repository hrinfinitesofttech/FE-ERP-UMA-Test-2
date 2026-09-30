'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Building,
  Layers,
  Award,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { Designation } from '../../../types/hr';

export default function DesignationsPage() {
  const { designations, addDesignation, updateDesignation, departments } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [originalDesignation, setOriginalDesignation] = useState<Designation | null>(null);

  const initialAddForm = {
    designationCode: '',
    designationName: '',
    department: 'Production & Shop Floor',
    level: 4,
    reportingDesignation: 'General Manager',
    jobDescription: '',
    responsibilities: '',
  };

  const [formData, setFormData] = useState(initialAddForm);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredDesignations = designations.filter(
    (d) =>
      !searchTerm?.trim() ||
      d.designationName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      d.designationCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      d.department?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      d.reportingDesignation?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Check if Add Modal has user-entered changes
  const isAddFormDirty = useMemo(() => {
    return (
      formData.designationName.trim() !== '' ||
      formData.designationCode.trim() !== '' ||
      formData.jobDescription.trim() !== '' ||
      formData.responsibilities.trim() !== '' ||
      formData.reportingDesignation.trim() !== 'General Manager' ||
      formData.level !== 4
    );
  }, [formData]);

  // Check if Edit Modal has changes compared to original
  const isEditFormDirty = useMemo(() => {
    if (!editingDesignation || !originalDesignation) return false;
    const currentResp =
      (editingDesignation as any).responsibilitiesInput !== undefined
        ? (editingDesignation as any).responsibilitiesInput.trim()
        : (editingDesignation.responsibilities || []).join(', ').trim();
    const origResp = (originalDesignation.responsibilities || []).join(', ').trim();

    return (
      (editingDesignation.designationName || '').trim() !== (originalDesignation.designationName || '').trim() ||
      (editingDesignation.designationCode || '').trim().toUpperCase() !== (originalDesignation.designationCode || '').trim().toUpperCase() ||
      (editingDesignation.department || '').trim() !== (originalDesignation.department || '').trim() ||
      Number(editingDesignation.level) !== Number(originalDesignation.level) ||
      (editingDesignation.reportingDesignation || '').trim() !== (originalDesignation.reportingDesignation || '').trim() ||
      (editingDesignation.jobDescription || '').trim() !== (originalDesignation.jobDescription || '').trim() ||
      currentResp !== origResp ||
      (editingDesignation.status || 'Active') !== (originalDesignation.status || 'Active')
    );
  }, [editingDesignation, originalDesignation]);

  const openAddModal = () => {
    setFormData({
      designationCode: `DESG-0${designations.length + 1}`,
      designationName: '',
      department: departments[0]?.departmentName || departments[0]?.name || 'Production & Shop Floor',
      level: 4,
      reportingDesignation: 'General Manager',
      jobDescription: '',
      responsibilities: '',
    });
    setAddErrors({});
    setShowAddModal(true);
  };

  const closeAddModalWithConfirm = () => {
    if (isAddFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setShowAddModal(false);
        setAddErrors({});
        setFormData(initialAddForm);
      }
    } else {
      setShowAddModal(false);
      setAddErrors({});
      setFormData(initialAddForm);
    }
  };

  const openEditModal = (desg: Designation) => {
    const editCopy = {
      ...desg,
      responsibilitiesInput: (desg.responsibilities || []).join(', '),
    };
    setEditingDesignation(editCopy as any);
    setOriginalDesignation(JSON.parse(JSON.stringify(desg)));
    setEditErrors({});
  };

  const closeEditModalWithConfirm = () => {
    if (isEditFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setEditingDesignation(null);
        setOriginalDesignation(null);
        setEditErrors({});
      }
    } else {
      setEditingDesignation(null);
      setOriginalDesignation(null);
      setEditErrors({});
    }
  };

  const validateAddForm = () => {
    const errs: Record<string, string> = {};
    const trimmedTitle = formData.designationName.trim();
    if (!trimmedTitle) {
      errs.designationName = 'Please enter the designation title.';
    } else if (trimmedTitle.length < 2 || trimmedTitle.length > 60) {
      errs.designationName = 'Designation title must be between 2 and 60 characters.';
    } else if (
      designations.some(
        (d) =>
          d.department?.toLowerCase() === formData.department.toLowerCase() &&
          d.designationName?.toLowerCase() === trimmedTitle.toLowerCase()
      )
    ) {
      errs.designationName = 'A designation with this title already exists in the selected department.';
    }

    if (!formData.department.trim()) {
      errs.department = 'Please select a department.';
    }

    if (Number(formData.level) < 1 || Number(formData.level) > 7) {
      errs.level = 'Please enter a valid cadre level between 1 and 7.';
    }

    if (!formData.reportingDesignation.trim()) {
      errs.reportingDesignation = 'Please enter or select a reporting designation.';
    }

    if (!formData.jobDescription.trim()) {
      errs.jobDescription = 'Please enter the job description.';
    }

    if (!formData.responsibilities.trim()) {
      errs.responsibilities = 'Please enter at least one key responsibility.';
    }

    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEditForm = () => {
    if (!editingDesignation) return false;
    const errs: Record<string, string> = {};
    const trimmedTitle = (editingDesignation.designationName || '').trim();

    if (!trimmedTitle) {
      errs.designationName = 'Please enter the designation title.';
    } else if (trimmedTitle.length < 2 || trimmedTitle.length > 60) {
      errs.designationName = 'Designation title must be between 2 and 60 characters.';
    } else if (
      designations.some(
        (d) =>
          d.id !== editingDesignation.id &&
          d.department?.toLowerCase() === (editingDesignation.department || '').toLowerCase() &&
          d.designationName?.toLowerCase() === trimmedTitle.toLowerCase()
      )
    ) {
      errs.designationName = 'A designation with this title already exists in the selected department.';
    }

    if (!(editingDesignation.department || '').trim()) {
      errs.department = 'Please select a department.';
    }

    if (Number(editingDesignation.level) < 1 || Number(editingDesignation.level) > 7) {
      errs.level = 'Please enter a valid cadre level between 1 and 7.';
    }

    if (!(editingDesignation.reportingDesignation || '').trim()) {
      errs.reportingDesignation = 'Please enter or select a reporting designation.';
    }

    if (!(editingDesignation.jobDescription || '').trim()) {
      errs.jobDescription = 'Please enter the job description.';
    }

    const currentRespInput =
      (editingDesignation as any).responsibilitiesInput !== undefined
        ? (editingDesignation as any).responsibilitiesInput
        : (editingDesignation.responsibilities || []).join(', ');

    if (!currentRespInput.trim()) {
      errs.responsibilities = 'Please enter at least one key responsibility.';
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddForm()) {
      setFeedbackMessage({
        type: 'error',
        text: 'The form could not be validated. Please check the details and submit again.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    const trimmedTitle = formData.designationName.trim();
    const code = (formData.designationCode.trim() || `DESG-0${designations.length + 1}`).toUpperCase();

    try {
      addDesignation({
        designationCode: code,
        designationName: trimmedTitle,
        department: formData.department,
        level: Number(formData.level) || 4,
        reportingDesignation: formData.reportingDesignation.trim(),
        jobDescription: formData.jobDescription.trim(),
        responsibilities: formData.responsibilities
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
        status: 'Active',
      });

      setFeedbackMessage({
        type: 'success',
        text: `Designation "${trimmedTitle}" created and saved permanently.`,
      });
      setShowAddModal(false);
      setAddErrors({});
      setFormData(initialAddForm);
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: 'Something went wrong while creating the designation. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesignation) return;

    if (!isEditFormDirty) {
      setFeedbackMessage({
        type: 'error',
        text: 'No changes were made to update.',
      });
      return;
    }

    if (!validateEditForm()) {
      setFeedbackMessage({
        type: 'error',
        text: 'The form could not be validated. Please check the details and submit again.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const trimmedTitle = (editingDesignation.designationName || '').trim();
      const code = (editingDesignation.designationCode || '').trim().toUpperCase();

      let responsibilitiesArr = editingDesignation.responsibilities || [];
      if (typeof (editingDesignation as any).responsibilitiesInput === 'string') {
        responsibilitiesArr = (editingDesignation as any).responsibilitiesInput
          .split(',')
          .map((r: string) => r.trim())
          .filter(Boolean);
      }

      updateDesignation(editingDesignation.id, {
        ...editingDesignation,
        designationCode: code,
        designationName: trimmedTitle,
        department: editingDesignation.department,
        level: Number(editingDesignation.level) || 4,
        reportingDesignation: (editingDesignation.reportingDesignation || '').trim(),
        jobDescription: (editingDesignation.jobDescription || '').trim(),
        responsibilities: responsibilitiesArr,
        status: editingDesignation.status || 'Active',
      });

      setFeedbackMessage({
        type: 'success',
        text: `Designation "${trimmedTitle}" updated successfully.`,
      });
      setEditingDesignation(null);
      setOriginalDesignation(null);
      setEditErrors({});
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: 'Something went wrong while updating the designation. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-600" />
            Designation Master
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Manufacturing Role Cadres, Hierarchy Levels, Responsibilities & Job Descriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Designation
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search designations, code, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Total Designations Defined: <span className="text-indigo-600 font-bold">{designations.length}</span>
        </div>
      </div>

      {/* Designation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesignations.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-[#EBE3DB] shadow-xs">
            <div className="max-w-md mx-auto space-y-2">
              <Briefcase className="w-10 h-10 text-indigo-400 mx-auto" />
              <h4 className="text-base font-bold text-[#211B17]">No designations found</h4>
              <p className="text-xs text-[#70665F]">Try adjusting your search query or add a new role.</p>
            </div>
          </div>
        ) : (
          filteredDesignations.map((desg) => (
            <div
              key={desg.id}
              className="bg-white border border-[#EBE3DB] rounded-2xl p-5 space-y-4 shadow-md hover:border-indigo-400 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-200">
                    {desg.designationCode || desg.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                    Level {desg.level} Cadre
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#211B17]">{desg.designationName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#70665F] mt-1">
                    <Building className="w-3.5 h-3.5 text-[#70665F]" />
                    <span>Department: <strong className="text-[#211B17]">{desg.department}</strong></span>
                  </div>
                </div>

                <div className="text-xs text-[#544B45] bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB] space-y-1">
                  <div className="font-semibold text-[#70665F]">Reporting Head:</div>
                  <div className="text-[#211B17] font-medium">{desg.reportingDesignation || 'General Manager'}</div>
                  <div className="font-semibold text-[#70665F] pt-1">Role Summary:</div>
                  <div className="text-[#544B45] line-clamp-2">{desg.jobDescription || 'Standard manufacturing role duties'}</div>
                </div>

                {desg.responsibilities && desg.responsibilities.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-[#70665F]">Key Responsibilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {desg.responsibilities.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-[#EBE3DB] text-[#544B45] rounded-md text-[11px]">
                          • {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {desg.status || 'Active'} Status
                </span>
                <button
                  onClick={() => openEditModal(desg)}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Role
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Designation Modal (With backdrop close & unsaved changes confirmation) */}
      {showAddModal && (
        <div
          onClick={closeAddModalWithConfirm}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" /> Define New Designation
              </h2>
              <button
                type="button"
                onClick={closeAddModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Designation Code</label>
                <input
                  type="text"
                  placeholder="e.g. DESG-CNC-SUP"
                  value={formData.designationCode}
                  onChange={(e) => {
                    setFormData({ ...formData, designationCode: e.target.value.toUpperCase() });
                    if (addErrors.designationCode) setAddErrors((prev) => ({ ...prev, designationCode: '' }));
                  }}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC Machine Shop Supervisor"
                  value={formData.designationName}
                  onChange={(e) => {
                    setFormData({ ...formData, designationName: e.target.value });
                    if (addErrors.designationName) setAddErrors((prev) => ({ ...prev, designationName: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] font-semibold focus:outline-none ${
                    addErrors.designationName ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                />
                {addErrors.designationName && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.designationName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => {
                      setFormData({ ...formData, department: e.target.value });
                      if (addErrors.department) setAddErrors((prev) => ({ ...prev, department: '' }));
                    }}
                    className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] font-medium focus:outline-none ${
                      addErrors.department ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                    }`}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.departmentName || d.name}>
                        {d.departmentName || d.name}
                      </option>
                    ))}
                  </select>
                  {addErrors.department && (
                    <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {addErrors.department}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Cadre Level (1-7) *</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.level}
                    onChange={(e) => {
                      setFormData({ ...formData, level: Number(e.target.value) });
                      if (addErrors.level) setAddErrors((prev) => ({ ...prev, level: '' }));
                    }}
                    className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none ${
                      addErrors.level ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                    }`}
                  />
                  {addErrors.level && (
                    <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {addErrors.level}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Reporting Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Manager / MD"
                  value={formData.reportingDesignation}
                  onChange={(e) => {
                    setFormData({ ...formData, reportingDesignation: e.target.value });
                    if (addErrors.reportingDesignation) setAddErrors((prev) => ({ ...prev, reportingDesignation: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none ${
                    addErrors.reportingDesignation ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                />
                {addErrors.reportingDesignation && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.reportingDesignation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Job Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief role summary and shop floor expectations..."
                  value={formData.jobDescription}
                  onChange={(e) => {
                    setFormData({ ...formData, jobDescription: e.target.value });
                    if (addErrors.jobDescription) setAddErrors((prev) => ({ ...prev, jobDescription: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none ${
                    addErrors.jobDescription ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                />
                {addErrors.jobDescription && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.jobDescription}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Key Responsibilities (Comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC Program Loading, Safety Audit, Tooling Inspection"
                  value={formData.responsibilities}
                  onChange={(e) => {
                    setFormData({ ...formData, responsibilities: e.target.value });
                    if (addErrors.responsibilities) setAddErrors((prev) => ({ ...prev, responsibilities: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none ${
                    addErrors.responsibilities ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                />
                {addErrors.responsibilities && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.responsibilities}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAddModalWithConfirm}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-slate-200 text-[#544B45] font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Designation Modal (With backdrop close, unsaved changes confirmation, and disabled update button when no changes) */}
      {editingDesignation && (
        <div
          onClick={closeEditModalWithConfirm}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                Edit Designation: {editingDesignation.designationName}
              </h2>
              <button
                type="button"
                onClick={closeEditModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} noValidate className="space-y-4 text-xs">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Designation Code</label>
                <input
                  type="text"
                  value={editingDesignation.designationCode || ''}
                  onChange={(e) => {
                    setEditingDesignation({ ...editingDesignation, designationCode: e.target.value.toUpperCase() });
                    if (editErrors.designationCode) setEditErrors((prev) => ({ ...prev, designationCode: '' }));
                  }}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  value={editingDesignation.designationName || ''}
                  onChange={(e) => {
                    setEditingDesignation({ ...editingDesignation, designationName: e.target.value });
                    if (editErrors.designationName) setEditErrors((prev) => ({ ...prev, designationName: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] font-semibold focus:outline-none ${
                    editErrors.designationName ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                />
                {editErrors.designationName && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {editErrors.designationName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Department *</label>
                  <select
                    value={editingDesignation.department || ''}
                    onChange={(e) => {
                      setEditingDesignation({ ...editingDesignation, department: e.target.value });
                      if (editErrors.department) setEditErrors((prev) => ({ ...prev, department: '' }));
                    }}
                    className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] font-medium focus:outline-none ${
                      editErrors.department ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                    }`}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.departmentName || d.name}>
                        {d.departmentName || d.name}
                      </option>
                    ))}
                  </select>
                  {editErrors.department && (
                    <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.department}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Cadre Level (1-7) *</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={editingDesignation.level || 4}
                    onChange={(e) => {
                      setEditingDesignation({ ...editingDesignation, level: Number(e.target.value) });
                      if (editErrors.level) setEditErrors((prev) => ({ ...prev, level: '' }));
                    }}
                    className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none ${
                      editErrors.level ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                    }`}
                  />
                  {editErrors.level && (
                    <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.level}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Reporting Designation *</label>
                <input
                  type="text"
                  required
                  value={editingDesignation.reportingDesignation || ''}
                  onChange={(e) => {
                    setEditingDesignation({ ...editingDesignation, reportingDesignation: e.target.value });
                    if (editErrors.reportingDesignation) setEditErrors((prev) => ({ ...prev, reportingDesignation: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none ${
                    editErrors.reportingDesignation ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                />
                {editErrors.reportingDesignation && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {editErrors.reportingDesignation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Job Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editingDesignation.jobDescription || ''}
                  onChange={(e) => {
                    setEditingDesignation({ ...editingDesignation, jobDescription: e.target.value });
                    if (editErrors.jobDescription) setEditErrors((prev) => ({ ...prev, jobDescription: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none ${
                    editErrors.jobDescription ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                />
                {editErrors.jobDescription && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {editErrors.jobDescription}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Key Responsibilities (Comma separated) *</label>
                <input
                  type="text"
                  required
                  value={
                    (editingDesignation as any).responsibilitiesInput !== undefined
                      ? (editingDesignation as any).responsibilitiesInput
                      : (editingDesignation.responsibilities || []).join(', ')
                  }
                  onChange={(e) => {
                    setEditingDesignation({
                      ...editingDesignation,
                      responsibilitiesInput: e.target.value,
                    } as any);
                    if (editErrors.responsibilities) setEditErrors((prev) => ({ ...prev, responsibilities: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] focus:outline-none ${
                    editErrors.responsibilities ? 'border-rose-500' : 'border-[#EBE3DB] focus:border-indigo-600'
                  }`}
                />
                {editErrors.responsibilities && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {editErrors.responsibilities}
                  </p>
                )}
              </div>

              {!isEditFormDirty && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>No changes made yet. Change any field to enable update.</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModalWithConfirm}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-slate-200 text-[#544B45] font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditFormDirty || isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
