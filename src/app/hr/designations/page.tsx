'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Designation } from '../../../types/hr';

export default function DesignationsPage() {
  const { designations, addDesignation, updateDesignation, departments } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);

  const [formData, setFormData] = useState({
    designationCode: '',
    designationName: '',
    department: 'Production & Shop Floor',
    level: 4,
    reportingDesignation: 'General Manager',
    jobDescription: '',
    responsibilities: '',
  });

  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const filteredDesignations = designations.filter(
    (d) =>
      !searchTerm?.trim() ||
      d.designationName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      d.designationCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      d.department?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const validateAddForm = () => {
    const errs: Record<string, string> = {};
    const trimmedTitle = formData.designationName.trim();
    if (!trimmedTitle) {
      errs.designationName = 'Designation title is required.';
    } else if (trimmedTitle.length < 2) {
      errs.designationName = 'Designation title must be at least 2 characters.';
    }

    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEditForm = () => {
    if (!editingDesignation) return false;
    const errs: Record<string, string> = {};
    const trimmedTitle = (editingDesignation.designationName || '').trim();
    if (!trimmedTitle) {
      errs.designationName = 'Designation title is required.';
    } else if (trimmedTitle.length < 2) {
      errs.designationName = 'Designation title must be at least 2 characters.';
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    const trimmedTitle = formData.designationName.trim();
    const code = (formData.designationCode.trim() || `DESG-0${designations.length + 1}`).toUpperCase();

    addDesignation({
      designationCode: code,
      designationName: trimmedTitle,
      department: formData.department,
      level: Number(formData.level) || 4,
      reportingDesignation: formData.reportingDesignation.trim() || 'General Manager',
      jobDescription: formData.jobDescription.trim() || 'Standard manufacturing role responsibilities.',
      responsibilities: formData.responsibilities
        ? formData.responsibilities.split(',').map((r) => r.trim()).filter(Boolean)
        : ['Shop Floor Execution', 'Quality Adherence', 'ERP Record Updates'],
      status: 'Active',
    });

    setShowAddModal(false);
    setAddErrors({});
    setFormData({
      designationCode: '',
      designationName: '',
      department: 'Production & Shop Floor',
      level: 4,
      reportingDesignation: 'General Manager',
      jobDescription: '',
      responsibilities: '',
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEditForm() || !editingDesignation) return;

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

    setEditingDesignation(null);
    setEditErrors({});
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-500" />
            Designation Master
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Manufacturing Role Cadres, Hierarchy Levels, Responsibilities & Job Descriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Designation
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search designations, code, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBE3DB] rounded-lg text-sm text-[#3E2723] focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-medium">
          Total Designations Defined: <span className="text-indigo-600 font-bold">{designations.length}</span>
        </div>
      </div>

      {/* Designation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesignations.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-[#EBE3DB]">
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
              className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4 shadow-lg hover:border-indigo-400 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-200">
                    {desg.designationCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                    Level {desg.level} Cadre
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#211B17]">{desg.designationName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#70665F] mt-1">
                    <Building className="w-3.5 h-3.5 text-[#70665F]" />
                    <span>Department: {desg.department}</span>
                  </div>
                </div>

                <div className="text-xs text-[#544B45] bg-[#FAF7F2] p-3 rounded-lg border border-[#EBE3DB] space-y-1">
                  <div className="font-semibold text-[#70665F]">Reporting Head:</div>
                  <div className="text-[#3E2723] font-medium">{desg.reportingDesignation || 'Direct to MD'}</div>
                  <div className="font-semibold text-[#70665F] pt-2">Role Summary:</div>
                  <div className="text-[#544B45] line-clamp-2">{desg.jobDescription || 'Standard manufacturing duties'}</div>
                </div>

                {desg.responsibilities && desg.responsibilities.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-[#70665F]">Key Responsibilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {desg.responsibilities.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-[#EBE3DB] text-[#544B45] rounded text-[11px]">
                          • {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#EBE3DB]/60 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {desg.status || 'Active'} Status
                </span>
                <button
                  onClick={() => {
                    setEditingDesignation({
                      ...desg,
                      responsibilitiesInput: (desg.responsibilities || []).join(', '),
                    } as any);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Role
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Designation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" /> Define New Designation
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-[#211B17] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Designation Code</label>
                <input
                  type="text"
                  placeholder="e.g. DESG-CNC-SUP"
                  value={formData.designationCode}
                  onChange={(e) => setFormData({ ...formData, designationCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC Machine Shop Supervisor"
                  value={formData.designationName}
                  onChange={(e) => {
                    setFormData({ ...formData, designationName: e.target.value });
                    if (addErrors.designationName) setAddErrors((prev) => ({ ...prev, designationName: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-lg text-[#211B17] font-semibold ${
                    addErrors.designationName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
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
                  <label className="block text-[#70665F] font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.departmentName || d.name}>
                        {d.departmentName || d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Cadre Level (1-7)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Reporting Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Production Manager"
                  value={formData.reportingDesignation}
                  onChange={(e) => setFormData({ ...formData, reportingDesignation: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Job Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief role summary and shop floor expectations..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Key Responsibilities (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. CNC Program Loading, Safety Audit, Tooling Inspection"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-slate-200 text-[#544B45] font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Designation Modal */}
      {editingDesignation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                Edit Designation: {editingDesignation.designationName}
              </h2>
              <button onClick={() => setEditingDesignation(null)} className="text-[#70665F] hover:text-[#211B17] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} noValidate className="space-y-4 text-xs">
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Designation Code</label>
                <input
                  type="text"
                  value={editingDesignation.designationCode || ''}
                  onChange={(e) => setEditingDesignation({ ...editingDesignation, designationCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  value={editingDesignation.designationName || ''}
                  onChange={(e) => {
                    setEditingDesignation({ ...editingDesignation, designationName: e.target.value });
                    if (editErrors.designationName) setEditErrors((prev) => ({ ...prev, designationName: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-lg text-[#211B17] font-semibold ${
                    editErrors.designationName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
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
                  <label className="block text-[#70665F] font-semibold mb-1">Department</label>
                  <select
                    value={editingDesignation.department || ''}
                    onChange={(e) => setEditingDesignation({ ...editingDesignation, department: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.departmentName || d.name}>
                        {d.departmentName || d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Cadre Level (1-7)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={editingDesignation.level || 4}
                    onChange={(e) => setEditingDesignation({ ...editingDesignation, level: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Reporting Designation</label>
                <input
                  type="text"
                  value={editingDesignation.reportingDesignation || ''}
                  onChange={(e) => setEditingDesignation({ ...editingDesignation, reportingDesignation: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Job Description</label>
                <textarea
                  rows={2}
                  value={editingDesignation.jobDescription || ''}
                  onChange={(e) => setEditingDesignation({ ...editingDesignation, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Key Responsibilities (Comma separated)</label>
                <input
                  type="text"
                  value={
                    (editingDesignation as any).responsibilitiesInput !== undefined
                      ? (editingDesignation as any).responsibilitiesInput
                      : (editingDesignation.responsibilities || []).join(', ')
                  }
                  onChange={(e) =>
                    setEditingDesignation({
                      ...editingDesignation,
                      responsibilitiesInput: e.target.value,
                    } as any)
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDesignation(null)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-slate-200 text-[#544B45] font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg cursor-pointer"
                >
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
