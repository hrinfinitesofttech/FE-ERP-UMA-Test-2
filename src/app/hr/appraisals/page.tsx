'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { TrendingUp, Plus, Star, CheckCircle2, Clock, ShieldCheck, X } from 'lucide-react';

export default function AppraisalPage() {
  const { employeeAppraisals, addEmployeeAppraisal, updateAppraisalStatus, availableEmployees } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    cyclePeriod: 'FY 2025-26 Annual',
    selfRating: 4,
    managerRating: 4.5,
    managerComments: 'Exceptional performance in shop floor tooling Optimization and zero-accident safety record.',
    promotionRecommended: true,
    recommendedIncrementPct: 15,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);

    addEmployeeAppraisal({
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Member',
      department: emp?.department || 'Production',
      cyclePeriod: formData.cyclePeriod,
      kpiScore: 4.5,
      selfRating: Number(formData.selfRating),
      managerRating: Number(formData.managerRating),
      finalScore: Number(formData.managerRating),
      managerComments: formData.managerComments,
      promotionRecommended: formData.promotionRecommended,
      recommendedIncrementPct: Number(formData.recommendedIncrementPct),
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
            Annual Appraisal & Performance Review
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            6-Step Appraisal Workflow: Self Review -&gt; Manager Rating -&gt; HR Review -&gt; Increment Approval -&gt; Salary Revision
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Initiate Appraisal Review
        </button>
      </div>

      {/* Appraisals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employeeAppraisals.map((apr) => (
          <div key={apr.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-6 space-y-4 shadow-xl hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between border-b border-[#EBE3DB]/60 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400">{apr.appraisalNumber}</span>
                <h3 className="text-base font-bold text-[#211B17]">{apr.employeeName}</h3>
                <div className="text-xs text-[#70665F]">Dept: {apr.department} | Cycle: {apr.cyclePeriod}</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                {apr.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-white/60 p-3 rounded-lg border border-[#EBE3DB]/50 text-center text-xs">
              <div>
                <span className="text-[#70665F] block">Self Score</span>
                <span className="font-bold text-[#211B17] text-sm">{apr.selfRating} / 5</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Manager Score</span>
                <span className="font-bold text-amber-400 text-sm">{apr.managerRating} / 5</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Final Score</span>
                <span className="font-extrabold text-emerald-400 text-sm">{apr.finalScore} / 5</span>
              </div>
            </div>

            <div className="text-xs text-[#544B45] space-y-1">
              <div className="font-bold text-[#70665F]">Manager Evaluation:</div>
              <div className="italic text-[#544B45]">&quot;{apr.managerComments}&quot;</div>
              <div className="pt-2 flex items-center justify-between border-t border-[#EBE3DB]/50 text-xs">
                <span>Promotion Recommended: <strong className={apr.promotionRecommended ? 'text-emerald-400' : 'text-[#70665F]'}>{apr.promotionRecommended ? 'Yes' : 'No'}</strong></span>
                <span>Rec. Increment: <strong className="text-amber-400 font-bold">+{apr.recommendedIncrementPct}%</strong></span>
              </div>
            </div>

            {apr.status !== 'Completed' && (
              <div className="pt-2 border-t border-[#EBE3DB]/50 text-right">
                <button
                  onClick={() => updateAppraisalStatus(apr.id, 'Completed')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-bold rounded shadow transition"
                >
                  Final HR Sign-off & Apply Revision
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
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Initiate Appraisal Review
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                >
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Self Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="5"
                    value={formData.selfRating}
                    onChange={(e) => setFormData({ ...formData, selfRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Manager Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="5"
                    value={formData.managerRating}
                    onChange={(e) => setFormData({ ...formData, managerRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Manager Evaluation Notes</label>
                <textarea
                  rows={2}
                  value={formData.managerComments}
                  onChange={(e) => setFormData({ ...formData, managerComments: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Recommend Increment (%)</label>
                  <input
                    type="number"
                    value={formData.recommendedIncrementPct}
                    onChange={(e) => setFormData({ ...formData, recommendedIncrementPct: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-semibold rounded-lg">
                  Save Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
