'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { PhoneCall, Plus, CheckCircle2, Star, Clock, X } from 'lucide-react';

export default function InterviewManagementPage() {
  const { interviewRecords, addInterviewRecord, candidateProfiles } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    candidateId: candidateProfiles[0]?.id || 'CAND-2026-01',
    interviewRound: 'Round 1 Technical' as const,
    interviewerName: 'Sanjay Shah (Production HOD)',
    interviewDate: new Date().toISOString().split('T')[0],
    technicalScore: 8,
    communicationScore: 7,
    result: 'Pass' as const,
    remarks: 'Strong understanding of Fanuc G-code programming & jig design.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidateProfiles.find((c) => c.id === formData.candidateId);

    addInterviewRecord({
      candidateId: formData.candidateId,
      candidateName: cand?.candidateName || 'Candidate',
      position: cand?.appliedPosition || 'Engineer',
      interviewRound: formData.interviewRound,
      interviewerName: formData.interviewerName,
      interviewDate: formData.interviewDate,
      technicalScore: Number(formData.technicalScore),
      communicationScore: Number(formData.communicationScore),
      result: formData.result,
      remarks: formData.remarks,
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <PhoneCall className="w-7 h-7 text-amber-400" />
            Interview Evaluation & Scoring Portal
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Technical Assessments, Managerial Round Reviews, Scorecard & Result Log
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Log Interview Scorecard
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interviewRecords.map((int) => (
          <div key={int.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-3 shadow-lg hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400">{int.id}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  int.result === 'Pass'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : int.result === 'Hold'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                Result: {int.result}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#211B17]">{int.candidateName}</h3>
              <div className="text-xs text-[#70665F]">Position: {int.position} | Round: <strong className="text-amber-400">{int.interviewRound}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/60 p-3 rounded-lg border border-[#EBE3DB]/50 text-xs">
              <div>
                <span className="text-[#70665F] block">Technical Score</span>
                <span className="font-bold text-emerald-400 text-sm">{int.technicalScore} / 10</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Communication Score</span>
                <span className="font-bold text-sky-400 text-sm">{int.communicationScore} / 10</span>
              </div>
            </div>

            <div className="text-xs text-[#544B45] italic">
              Interviewer: <strong>{int.interviewerName}</strong> ({int.interviewDate})
              <div className="mt-1 text-[#70665F]">&quot;{int.remarks}&quot;</div>
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
                <PhoneCall className="w-5 h-5 text-amber-400" /> Log Candidate Interview Result
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
                <label className="block text-[#70665F] mb-1">Interview Round</label>
                <select
                  value={formData.interviewRound}
                  onChange={(e) => setFormData({ ...formData, interviewRound: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                >
                  <option value="Round 1 Technical">Round 1 Technical</option>
                  <option value="Round 2 Managerial">Round 2 Managerial</option>
                  <option value="Round 3 HR & Commercial">Round 3 HR & Commercial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Technical Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.technicalScore}
                    onChange={(e) => setFormData({ ...formData, technicalScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Round Result</label>
                  <select
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    <option value="Pass">Pass</option>
                    <option value="Hold">Hold</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Remarks & Evaluation</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-[#211B17] font-semibold rounded-lg">
                  Save Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
