'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Flag, Plus, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function KPIManagementPage() {
  const { kpiMasters, addKPIMaster, departments } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    kpiCode: '',
    kpiName: '',
    department: 'Production',
    measurementUnit: 'OEE Percentage (%)',
    targetValue: 85,
    weightagePercent: 25,
    description: 'Overall Equipment Effectiveness (OEE) target for CNC machining cells.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kpiName) return;

    addKPIMaster({
      kpiCode: formData.kpiCode || `KPI-0${kpiMasters.length + 1}`,
      kpiName: formData.kpiName,
      department: formData.department,
      measurementUnit: formData.measurementUnit,
      targetValue: Number(formData.targetValue),
      weightagePercent: Number(formData.weightagePercent),
      description: formData.description,
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Flag className="w-7 h-7 text-red-400" />
            Key Performance Indicator (KPI) Master
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Department & Position Specific Quantitative Targets, Measurement Units & Weightage Calculations
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Define New KPI
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiMasters.map((kpi) => (
          <div key={kpi.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-3 shadow-lg hover:border-red-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-red-400">{kpi.kpiCode}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                Weightage: {kpi.weightagePercent}%
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#211B17]">{kpi.kpiName}</h3>
              <div className="text-xs text-[#70665F] mt-1">Department: <strong className="text-[#3E2723]">{kpi.department}</strong></div>
            </div>

            <div className="bg-white/60 p-3 rounded-lg border border-[#EBE3DB]/50 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#70665F]">Target Value:</span>
                <span className="font-extrabold text-emerald-400">{kpi.targetValue} {kpi.measurementUnit}</span>
              </div>
              <div className="text-[#544B45] pt-1 line-clamp-2">&quot;{kpi.description}&quot;</div>
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
                <Flag className="w-5 h-5 text-red-400" /> Define New KPI Target
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">KPI Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. On-Time Assembly Delivery Rate"
                  value={formData.kpiName}
                  onChange={(e) => setFormData({ ...formData, kpiName: e.target.value })}
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
                  <label className="block text-[#70665F] mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    value={formData.weightagePercent}
                    onChange={(e) => setFormData({ ...formData, weightagePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Percentage (%)"
                    value={formData.measurementUnit}
                    onChange={(e) => setFormData({ ...formData, measurementUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Target Value</label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-[#211B17] font-semibold rounded-lg">
                  Save KPI Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
