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
  X,
} from 'lucide-react';
import { Designation } from '../../../types/hr';

export default function DesignationsPage() {
  const { designations, addDesignation, updateDesignation, departments } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    designationCode: '',
    designationName: '',
    department: 'Production',
    level: 4,
    reportingDesignation: 'General Manager',
    jobDescription: '',
    responsibilities: '',
  });

  const filteredDesignations = designations.filter(
    (d) =>
      d.designationName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      d.designationCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      d.department?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.designationName) return;

    addDesignation({
      designationCode: formData.designationCode || `DESG-0${designations.length + 1}`,
      designationName: formData.designationName,
      department: formData.department,
      level: Number(formData.level),
      reportingDesignation: formData.reportingDesignation,
      jobDescription: formData.jobDescription || 'Standard manufacturing role responsibilities.',
      responsibilities: formData.responsibilities.split(',').map((r) => r.trim()),
      status: 'Active',
    });

    setShowAddModal(false);
    setFormData({
      designationCode: '',
      designationName: '',
      department: 'Production',
      level: 4,
      reportingDesignation: 'General Manager',
      jobDescription: '',
      responsibilities: '',
    });
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-400" />
            Designation Master
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Manufacturing Role Cadres, Hierarchy Levels, Responsibilities & Job Descriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
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
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBE3DB] rounded-lg text-sm text-[#3E2723] focus:outline-none focus:border-crm-brand-600"
          />
        </div>
        <div className="text-xs text-[#70665F] font-medium">
          Total Designations Defined: <span className="text-indigo-400 font-bold">{designations.length}</span>
        </div>
      </div>

      {/* Designation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesignations.map((desg) => (
          <div key={desg.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4 shadow-lg hover:border-crm-brand-600/50 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-crm-brand-600/10 text-indigo-400 text-xs font-mono font-bold border border-crm-brand-600/20">
                  {desg.designationCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
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

              <div className="text-xs text-[#544B45] bg-white/60 p-3 rounded-lg border border-[#EBE3DB]/50 space-y-1">
                <div className="font-semibold text-[#70665F]">Reporting Head:</div>
                <div className="text-[#3E2723]">{desg.reportingDesignation || 'Direct to MD'}</div>
                <div className="font-semibold text-[#70665F] pt-2">Role Summary:</div>
                <div className="text-[#544B45] line-clamp-2">{desg.jobDescription}</div>
              </div>

              {desg.responsibilities && desg.responsibilities.length > 0 && (
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-[#70665F]">Key Responsibilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {desg.responsibilities.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#FAF7F2] text-[#544B45] rounded text-[11px]">
                        • {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#EBE3DB]/60 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Status
              </span>
              <button
                onClick={() => alert(`Editing designation ${desg.designationName}`)}
                className="text-[#70665F] hover:text-[#211B17] flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Role
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Designation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" /> Define New Designation
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Designation Code</label>
                <input
                  type="text"
                  placeholder="e.g. DESG-CNC-SUP"
                  value={formData.designationCode}
                  onChange={(e) => setFormData({ ...formData, designationCode: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC Machine Shop Supervisor"
                  value={formData.designationName}
                  onChange={(e) => setFormData({ ...formData, designationName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.departmentName}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Cadre Level (1-7)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Reporting Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Production Manager"
                  value={formData.reportingDesignation}
                  onChange={(e) => setFormData({ ...formData, reportingDesignation: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Job Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief role summary and shop floor expectations..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Key Responsibilities (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. CNC Program Loading, Safety Audit, Tooling Inspection"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#544B45] font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold rounded-lg">
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
