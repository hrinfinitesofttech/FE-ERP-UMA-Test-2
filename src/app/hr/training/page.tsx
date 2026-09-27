'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Sparkles, Plus, Award, CheckCircle2, Clock, ShieldCheck, X } from 'lucide-react';

export default function TrainingDevelopmentPage() {
  const { trainingPrograms, addTrainingProgram, updateTrainingStatus, departments } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    trainingCode: '',
    title: '',
    department: 'Production',
    trainerName: 'External ISO Auditor & Fanuc Certified Expert',
    trainingDate: new Date().toISOString().split('T')[0],
    durationHours: 8,
    trainingType: 'Safety & ISO' as const,
    totalParticipants: 12,
    costPerParticipant: 1500,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addTrainingProgram({
      trainingCode: formData.trainingCode || `TRN-PROG-0${trainingPrograms.length + 1}`,
      title: formData.title,
      department: formData.department,
      trainerName: formData.trainerName,
      trainingDate: formData.trainingDate,
      durationHours: Number(formData.durationHours),
      trainingType: formData.trainingType,
      totalParticipants: Number(formData.totalParticipants),
      costPerParticipant: Number(formData.costPerParticipant),
      status: 'Scheduled',
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-crm-brand-500" />
            Training & Skill Development Portal
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Shop Floor ISO Safety, CNC Programming, Hydraulic Assembly & ERP Certification Workshops
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Schedule Training Program
        </button>
      </div>

      {/* Training Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingPrograms.map((tr) => (
          <div key={tr.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4 shadow-lg hover:border-crm-brand-600/40 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-crm-brand-500">{tr.trainingCode}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    tr.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {tr.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#211B17]">{tr.title}</h3>
                <div className="text-xs text-[#70665F] mt-1">Department: <strong className="text-[#3E2723]">{tr.department}</strong></div>
              </div>

              <div className="bg-white/60 p-3 rounded-lg border border-[#EBE3DB]/50 space-y-1.5 text-xs text-[#544B45]">
                <div><strong className="text-[#70665F]">Category:</strong> <span className="text-crm-brand-500 font-semibold">{tr.trainingType}</span></div>
                <div><strong className="text-[#70665F]">Trainer:</strong> {tr.trainerName}</div>
                <div><strong className="text-[#70665F]">Date & Duration:</strong> {tr.trainingDate} ({tr.durationHours} Hours)</div>
                <div><strong className="text-[#70665F]">Participants:</strong> {tr.totalParticipants} Employees</div>
                <div><strong className="text-[#70665F]">Total Program Cost:</strong> <span className="text-emerald-400 font-bold">₹{(tr.totalParticipants * tr.costPerParticipant)?.toLocaleString()}</span></div>
              </div>
            </div>

            {tr.status !== 'Completed' && (
              <div className="pt-2 border-t border-[#EBE3DB]/50 text-right">
                <button
                  onClick={() => updateTrainingStatus(tr.id, 'Completed')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-bold rounded shadow transition"
                >
                  Mark Completed & Issue Certificates
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
                <Sparkles className="w-5 h-5 text-crm-brand-500" /> Schedule Training Workshop
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Training Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO 9001:2015 Shop Floor Safety Audit"
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
                  <label className="block text-[#70665F] mb-1">Training Type</label>
                  <select
                    value={formData.trainingType}
                    onChange={(e) => setFormData({ ...formData, trainingType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    <option value="Safety & ISO">Safety & ISO</option>
                    <option value="CNC Machine Operation">CNC Machine Operation</option>
                    <option value="Hydraulic Assembly">Hydraulic Assembly</option>
                    <option value="Quality Audit">Quality Audit</option>
                    <option value="ERP Training">ERP Training</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Trainer / Certification Agency</label>
                <input
                  type="text"
                  value={formData.trainerName}
                  onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Training Date</label>
                  <input
                    type="date"
                    value={formData.trainingDate}
                    onChange={(e) => setFormData({ ...formData, trainingDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold rounded-lg">
                  Schedule Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
