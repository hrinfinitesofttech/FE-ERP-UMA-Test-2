'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { FileCheck, Plus, CheckCircle2, UserCheck, ArrowRight, Download, X } from 'lucide-react';
import Link from 'next/link';

export default function OfferManagementPage() {
  const { offerLetters, addOfferLetter, updateOfferLetterStatus, candidateProfiles } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    candidateId: candidateProfiles[0]?.id || 'CAND-2026-01',
    offeredDesignation: 'Senior CNC Machinist',
    offeredCTC: 480000,
    joiningDate: '2026-10-01',
    validUntil: '2026-09-28',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidateProfiles.find((c) => c.id === formData.candidateId);

    addOfferLetter({
      candidateId: formData.candidateId,
      candidateName: cand?.candidateName || 'Candidate',
      position: cand?.appliedPosition || 'Engineer',
      offeredDesignation: formData.offeredDesignation,
      offeredCTC: Number(formData.offeredCTC),
      joiningDate: formData.joiningDate,
      validUntil: formData.validUntil,
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-emerald-400" />
            Offer Letter Management & Candidate Onboarding Conversion
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Formal Employment Offer Rollout & 1-Click Transition into Employee Onboarding Workflow
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Issue Offer Letter
        </button>
      </div>

      {/* Offer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offerLetters.map((off) => (
          <div key={off.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4 shadow-lg hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between border-b border-[#EBE3DB]/60 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400">{off.offerNumber}</span>
                <h3 className="text-base font-bold text-[#211B17]">{off.candidateName}</h3>
                <div className="text-xs text-[#70665F]">Position: {off.position}</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                {off.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/60 p-3 rounded-lg border border-[#EBE3DB]/50 text-xs">
              <div>
                <span className="text-[#70665F] block">Offered Designation</span>
                <span className="font-bold text-[#211B17]">{off.offeredDesignation}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Offered Annual CTC</span>
                <span className="font-extrabold text-emerald-400 text-sm">₹{off.offeredCTC?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Proposed Joining Date</span>
                <span className="font-bold text-amber-400">{off.joiningDate}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Offer Valid Until</span>
                <span className="font-semibold text-[#3E2723]">{off.validUntil}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#EBE3DB]/50 text-xs">
              <span className="text-[#70665F]">Letterhead PDF generated</span>
              <Link
                href="/hr/onboarding"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-bold rounded-lg shadow transition flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" /> Convert to Onboarding
              </Link>
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
                <FileCheck className="w-5 h-5 text-emerald-400" /> Issue Employment Offer Letter
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Candidate</label>
                <select
                  value={formData.candidateId}
                  onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                >
                  {candidateProfiles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.candidateName} ({c.appliedPosition})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Offered Designation</label>
                <input
                  type="text"
                  value={formData.offeredDesignation}
                  onChange={(e) => setFormData({ ...formData, offeredDesignation: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Offered Annual CTC (₹)</label>
                  <input
                    type="number"
                    value={formData.offeredCTC}
                    onChange={(e) => setFormData({ ...formData, offeredCTC: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-semibold rounded-lg">
                  Generate Offer Letter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
