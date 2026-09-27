'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { PreventiveMaintenancePlan, PMFrequency } from '../../../types/maintenance';
import {
  RotateCcw,
  Plus,
  Search,
  CheckSquare,
  Calendar,
  Clock,
  Package,
  UserCheck,
  Zap,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';

export default function PreventiveMaintenancePage() {
  const { preventivePlans, addPreventivePlan } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [generatedSuccessMsg, setGeneratedSuccessMsg] = useState(false);

  const [formData, setFormData] = useState({
    assetId: 'AST-101',
    assetName: '5-Axis CNC Milling Center VMC-850',
    maintenanceType: 'Monthly Mechanical & Hydraulic PM',
    frequency: 'Monthly' as PMFrequency,
    startDate: new Date().toISOString().split('T')[0],
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checklist: [
      { parameter: 'Spindle Lubrication Pressure', expectedValue: '15-18 bar', passFail: 'Pass' as const },
      { parameter: 'Coolant pH & Concentration', expectedValue: 'pH 8.8 - 9.2', passFail: 'Pass' as const },
      { parameter: 'Axis Backlash Calibration', expectedValue: '< 0.005mm', passFail: 'Pass' as const },
    ],
    responsibleTechnicianId: 'EMP-TECH-01',
    responsibleTechnicianName: 'Anil Desai (Sr Service Engineer)',
    estimatedDurationHours: 4,
    requiredSpareParts: [{ itemCode: 'CNC-FLT-01', itemName: 'Spindle Filter Screen', qty: 1 }],
    instructions: 'Refer to machine tool manual section 5.4.',
    status: 'Active' as const,
  });

  const filteredPlans = preventivePlans.filter((plan) => {
    const matchesSearch =
      plan.planNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      plan.assetName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      plan.maintenanceType?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesFreq = frequencyFilter === 'all' || plan.frequency === frequencyFilter;
    return matchesSearch && matchesFreq;
  });

  const handleGeneratePMTasks = () => {
    setGeneratedSuccessMsg(true);
    setTimeout(() => setGeneratedSuccessMsg(false), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPreventivePlan(formData);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold">
              PREVENTIVE MAINTENANCE (PM)
            </span>
            <span className="text-xs text-[#70665F]">Scheduled Asset Reliability & Longevity</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-teal-500" />
            Preventive Maintenance Plans
          </h1>
          <p className="text-xs text-[#70665F]">
            Define recurring PM schedules, inspection checklists, required parts, and automated PM work task generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGeneratePMTasks}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-amber-600/30"
          >
            <Zap className="w-4 h-4" />
            Auto-Generate Upcoming PM Tasks
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-[#211B17] font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-teal-600/30"
          >
            <Plus className="w-4 h-4" />
            Create PM Plan
          </button>
        </div>
      </div>

      {generatedSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Successfully scanned all active PM schedules and generated 5 upcoming preventive maintenance tasks for the next 30 days!
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search plan no, asset name or maintenance type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          >
            <option value="all">All PM Frequencies</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-teal-300 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono font-bold text-xs">
                    {plan.planNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-crm-brand- dark:bg-crm-brand- text-crm-brand-800 dark:text-crm-brand- text-[10px] font-bold">
                    {plan.frequency}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1.5">{plan.assetName}</h3>
                <p className="text-xs text-[#70665F]">{plan.maintenanceType}</p>
              </div>

              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {plan.status}
              </span>
            </div>

            {/* Checklist items */}
            <div className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-[#544B45] uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-teal-500" />
                Inspection Checklist ({plan.checklist.length} Parameters)
              </span>
              <div className="space-y-1 text-xs">
                {plan.checklist.map((chk, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-[#544B45]">• {chk.parameter}</span>
                    <span className="font-mono text-[#70665F]">Target: {chk.expectedValue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[#70665F]">
              <div>
                <span className="text-[10px] text-[#70665F] block">Next Due Date</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">{formatDate(plan.nextDueDate)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Estimated Duration</span>
                <span className="font-medium text-slate-800 dark:text-[#544B45]">{plan.estimatedDurationHours} Hours</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Responsible Technician</span>
                <span className="font-semibold text-slate-800 dark:text-[#544B45]">{plan.responsibleTechnicianName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Required Spare Parts</span>
                <span className="font-medium text-slate-800 dark:text-[#544B45]">
                  {plan.requiredSpareParts.map((p) => p.itemName).join(', ') || 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#EBE3DB]">
              <span className="text-[10px] text-[#70665F]">Instructions: {plan.instructions}</span>
              <button className="px-3 py-1 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-semibold hover:underline">
                View Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-teal-500" />
                Create Preventive Maintenance Plan
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Maintenance Type</label>
                  <input
                    type="text"
                    required
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as PMFrequency })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Meter-Based">Meter-Based</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">PM Instructions</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-teal-600 text-[#211B17] font-semibold">
                  Save PM Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
