'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { UserPlus, Plus, CheckCircle2, Download, Search, X } from 'lucide-react';

export default function CandidateProfilesPage() {
  const { candidateProfiles, addCandidateProfile, updateCandidateStatus, jobPositions } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    mobile: '',
    appliedPosition: jobPositions[0]?.title || 'CNC Machinist Operator',
    department: 'Production',
    experienceYears: 4,
    noticePeriodDays: 30,
    currentCTC: 360000,
    expectedCTC: 450000,
    resumeUrl: '/resumes/resume_candidate.pdf',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateName) return;

    addCandidateProfile({
      candidateName: formData.candidateName,
      email: formData.email,
      mobile: formData.mobile,
      appliedPosition: formData.appliedPosition,
      department: formData.department,
      experienceYears: Number(formData.experienceYears),
      noticePeriodDays: Number(formData.noticePeriodDays),
      currentCTC: Number(formData.currentCTC),
      expectedCTC: Number(formData.expectedCTC),
      resumeUrl: formData.resumeUrl,
      status: 'Applied',
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-pink-400" />
            Candidate Applications & Pool Management
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Applicant Resume Database, Screening & Seamless 1-Click Conversion to Active Employee
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Add Candidate Profile
        </button>
      </div>

      {/* Candidates Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Code</th>
                <th className="p-4">Candidate Name</th>
                <th className="p-4">Position & Dept</th>
                <th className="p-4">Experience & Notice</th>
                <th className="p-4">Current vs Expected CTC</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {candidateProfiles.map((cand) => (
                <tr key={cand.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-4 font-mono text-xs text-pink-400 font-bold">{cand.candidateCode}</td>
                  <td className="p-4">
                    <div className="font-bold text-[#211B17]">{cand.candidateName}</div>
                    <div className="text-xs text-[#70665F]">{cand.email} | {cand.mobile}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-[#3E2723]">
                    <div>{cand.appliedPosition}</div>
                    <div className="text-pink-400">{cand.department}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <div>{cand.experienceYears} Yrs Exp</div>
                    <div className="text-[#70665F]">Notice: {cand.noticePeriodDays} Days</div>
                  </td>
                  <td className="p-4 text-xs font-mono">
                    <div className="text-[#70665F]">Cur: ₹{cand.currentCTC?.toLocaleString()}</div>
                    <div className="text-emerald-400 font-bold">Exp: ₹{cand.expectedCTC?.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        cand.status === 'Offered' || cand.status === 'Joined'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : cand.status === 'Shortlisted'
                          ? 'bg-crm-brand-600/10 text-crm-brand-500 border border-crm-brand-600/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {cand.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {cand.status === 'Applied' && (
                      <button
                        onClick={() => updateCandidateStatus(cand.id, 'Shortlisted')}
                        className="px-3 py-1 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] text-xs font-semibold rounded shadow transition"
                      >
                        Shortlist Candidate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pink-400" /> Add Candidate Application
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pankaj Mehta"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Mobile</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Applied Position</label>
                  <input
                    type="text"
                    value={formData.appliedPosition}
                    onChange={(e) => setFormData({ ...formData, appliedPosition: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-[#211B17] font-semibold rounded-lg">
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
