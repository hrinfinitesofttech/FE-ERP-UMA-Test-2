'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Briefcase, Plus, CheckCircle2, Building, DollarSign, X } from 'lucide-react';

export default function JobPositionsPage() {
  const { jobPositions, addJobPosition, updateJobPositionStatus, departments } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    positionCode: '',
    title: '',
    department: 'Production',
    designation: 'CNC Machinist Operator',
    vacancies: 2,
    experienceRequired: '3-5 Years Shop Floor',
    salaryMin: 25000,
    salaryMax: 35000,
    jobDescription: 'Fanuc & Siemens CNC Turning lathe setup, tool offset calibration and production target execution.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addJobPosition({
      positionCode: formData.positionCode || `JOB-POS-0${jobPositions.length + 1}`,
      title: formData.title,
      department: formData.department,
      designation: formData.designation,
      vacancies: Number(formData.vacancies),
      experienceRequired: formData.experienceRequired,
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
      jobDescription: formData.jobDescription,
      status: 'Open',
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-crm-brand-500" />
            Job Positions & Open Vacancies Master
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Plant Requisitions, Experience Criteria, Job Descriptions & Budgeted Salary Ranges
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Create Job Opening
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobPositions.map((pos) => (
          <div key={pos.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4 shadow-lg hover:border-crm-brand-600/40 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-crm-brand-500">{pos.positionCode}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    pos.status === 'Open'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {pos.status} ({pos.vacancies} Vacancies)
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#211B17]">{pos.title}</h3>
                <div className="text-xs text-[#70665F] mt-0.5">Dept: <strong className="text-[#3E2723]">{pos.department}</strong></div>
              </div>

              <div className="bg-white/60 p-3 rounded-lg border border-[#EBE3DB]/50 space-y-1.5 text-xs text-[#544B45]">
                <div><strong className="text-[#70665F]">Experience:</strong> {pos.experienceRequired}</div>
                <div><strong className="text-[#70665F]">Budgeted Salary:</strong> <span className="text-emerald-400 font-bold">₹{pos.salaryMin?.toLocaleString()} - ₹{pos.salaryMax?.toLocaleString()} / mo</span></div>
                <div className="text-[#544B45] pt-1 italic line-clamp-2">&quot;{pos.jobDescription}&quot;</div>
              </div>
            </div>

            {pos.status === 'Open' && (
              <div className="pt-2 border-t border-[#EBE3DB]/50 text-right">
                <button
                  onClick={() => updateJobPositionStatus(pos.id, 'Closed')}
                  className="px-3 py-1 bg-[#FAF7F2] hover:bg-slate-600 text-[#211B17] text-xs font-semibold rounded transition"
                >
                  Close Position
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-crm-brand-500" /> Create Job Opening Requisition
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Hydraulic Assembly Technician"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  <label className="block text-[#70665F] mb-1">No. of Vacancies</label>
                  <input
                    type="number"
                    value={formData.vacancies}
                    onChange={(e) => setFormData({ ...formData, vacancies: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Min Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Max Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Job Description</label>
                <textarea
                  rows={2}
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold rounded-lg">
                  Publish Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
