'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { BreakdownRecord, CriticalityLevel } from '../../../types/maintenance';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Clock,
  Wrench,
  CheckCircle2,
  Package,
  UserCheck,
  X,
  Activity,
  ChevronRight,
} from 'lucide-react';

export default function BreakdownManagementPage() {
  const { breakdowns, addBreakdown, updateBreakdownStatus } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    assetType: 'Internal Asset' as const,
    assetId: 'AST-105',
    assetName: 'Robotic MIG Welding Cell (6-Axis Fanuc)',
    serialNumber: 'FAN-WM-9901-2023',
    breakdownDate: new Date().toISOString().split('T')[0],
    breakdownTime: '10:00 AM',
    reportedBy: 'Plant Supervisor',
    problem: 'Main Axis Motor Alarm Overheat',
    severity: 'Critical' as CriticalityLevel,
    initialDiagnosis: 'Cooling fan failure causing amplifier thermistor trip.',
    assignedTechnicianId: 'EMP-TECH-03',
    assignedTechnicianName: 'Vikram Solanki',
    responseTimeMinutes: 15,
    resolutionTimeMinutes: 120,
    rootCause: 'Dust clogging fan intake filter screen.',
    correctiveAction: 'Cleaned intake filter, replaced cooling fan module.',
    sparePartsUsed: [{ itemCode: 'FAN-MOD-01', itemName: 'Fanuc Cooling Fan 24V', quantity: 1, unitCost: 4500 }],
    downtimeHours: 2.0,
    status: 'Reported' as const,
    remarks: 'Preventive clean scheduled weekly.',
  });

  const filteredBreakdowns = breakdowns.filter((bd) => {
    const matchesSearch =

      !searchTerm?.trim() || (

      bd.breakdownNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      bd.assetName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      bd.serialNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      bd.problem?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    const matchesSeverity = severityFilter === 'all' || bd.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBreakdown(formData);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-mono text-xs font-bold">
              BREAKDOWN RESPONSE DESK
            </span>
            <span className="text-xs text-[#70665F]">MTTR & MTBF Downtime Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Emergency Breakdown Management
          </h1>
          <p className="text-xs text-[#70665F]">
            Track emergency breakdown reports from notification -&gt; technician dispatch -&gt; diagnosis -&gt; spare part replacement -&gt; testing -&gt; closure.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-red-600/30"
        >
          <Plus className="w-4 h-4" />
          Report Emergency Breakdown
        </button>
      </div>

      {/* Stepper Workflow Header */}
      <div className="p-4 bg-white dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] text-xs font-medium">
          {['1. Breakdown Reported', '2. Technician Assigned', '3. Diagnosis', '4. In Repair', '5. Testing', '6. Closed'].map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-[#544B45]">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 font-bold flex items-center justify-center text-[10px]">
                {idx + 1}
              </span>
              <span>{step}</span>
              {idx < 5 && <ChevronRight className="w-4 h-4 text-[#544B45]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search breakdown no, machine, serial or problem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#70665F]" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="space-y-4">
        {filteredBreakdowns.map((bd) => (
          <div
            key={bd.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-red-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-red-600 text-white font-mono font-bold text-xs">
                  {bd.breakdownNumber}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17]">{bd.assetName}</h3>
                  <span className="text-xs text-[#70665F] font-mono">
                    SN: {bd.serialNumber} • {bd.assetType} {bd.customerName ? `(${bd.customerName})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    bd.severity === 'Critical' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {bd.severity} Severity
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-[#FAF7F2] text-slate-800 dark:text-[#544B45] border border-slate-200 dark:border-[#EBE3DB]">
                  {bd.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[#70665F] font-medium">Problem & Initial Diagnosis</span>
                <div className="font-semibold text-slate-800 dark:text-[#544B45]">{bd.problem}</div>
                <div className="text-slate-600 dark:text-[#70665F] italic">{bd.initialDiagnosis}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#70665F] font-medium">Root Cause & Action Taken</span>
                <div className="text-slate-800 dark:text-[#544B45] font-medium">{bd.rootCause || 'Under investigation'}</div>
                <div className="text-slate-600 dark:text-[#70665F]">{bd.correctiveAction}</div>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-[#FAF7F2]/40 p-2.5 rounded-xl border border-slate-100 dark:border-[#EBE3DB]">
                <div className="flex justify-between">
                  <span className="text-[#70665F]">Response Time:</span>
                  <span className="font-bold text-slate-800 dark:text-[#544B45]">{bd.responseTimeMinutes} Mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#70665F]">Resolution Time:</span>
                  <span className="font-bold text-slate-800 dark:text-[#544B45]">{(bd.resolutionTimeMinutes / 60).toFixed(1)} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#70665F]">Machine Downtime:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{bd.downtimeHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#70665F]">Technician:</span>
                  <span className="font-bold text-crm-brand-700 dark:text-crm-brand-500">{bd.assignedTechnicianName}</span>
                </div>
              </div>
            </div>

            {bd.sparePartsUsed.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-[#EBE3DB]">
                <span className="text-[11px] font-bold text-slate-600 dark:text-[#70665F] uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Package className="w-3.5 h-3.5 text-emerald-500" />
                  Spare Parts Consumed ({bd.sparePartsUsed.length})
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  {bd.sparePartsUsed.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] font-mono text-xs">
                      {item.itemName} x{item.quantity} ({formatCurrency(item.unitCost * item.quantity)})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[#70665F] text-[11px] font-mono">Reported Date: {formatDate(bd.breakdownDate)} ({bd.breakdownTime})</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateBreakdownStatus(bd.id, 'In Repair')}
                  className="px-3 py-1 rounded bg-crm-brand- text-crm-brand-700 font-medium text-xs hover:bg-crm-brand-"
                >
                  Mark In Repair
                </button>
                <button
                  onClick={() => updateBreakdownStatus(bd.id, 'Testing')}
                  className="px-3 py-1 rounded bg-crm-brand- text-crm-brand-700 font-medium text-xs hover:bg-crm-brand-"
                >
                  Start Testing
                </button>
                <button
                  onClick={() => updateBreakdownStatus(bd.id, 'Closed')}
                  className="px-3 py-1 rounded bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500"
                >
                  Close Breakdown
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Report Machine Breakdown
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Asset Name / Machine</label>
                  <input
                    type="text"
                    required
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as CriticalityLevel })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  >
                    <option value="Critical">Critical (Immediate SLA)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={formData.assignedTechnicianName}
                    onChange={(e) => setFormData({ ...formData, assignedTechnicianName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Problem Description</label>
                <textarea
                  rows={2}
                  required
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Initial Diagnosis</label>
                <textarea
                  rows={2}
                  value={formData.initialDiagnosis}
                  onChange={(e) => setFormData({ ...formData, initialDiagnosis: e.target.value })}
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
                <button type="submit" className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold">
                  Post Breakdown Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
