'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Wrench, Plus, Activity, Clock, ShieldCheck, AlertTriangle, CheckCircle2, UserCheck, Edit3 } from 'lucide-react';
import { WorkCenter, WorkCenterMachineStatus } from '../../../types/production';

export default function WorkCentersPage() {
  const { workCenters, addWorkCenter, updateWorkCenter } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [editingWc, setEditingWc] = useState<WorkCenter | null>(null);

  const [wcCode, setWcCode] = useState('');
  const [wcName, setWcName] = useState('');
  const [dept, setDept] = useState('Production');
  const [machineName, setMachineName] = useState('');
  const [capacityHours, setCapacityHours] = useState(16);
  const [availableHours, setAvailableHours] = useState(14);
  const [efficiency, setEfficiency] = useState(90);
  const [supervisor, setSupervisor] = useState('Jayesh Parmar');
  const [status, setStatus] = useState<WorkCenterMachineStatus>('Running');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWc) {
      updateWorkCenter(editingWc.id, {
        workCenterCode: wcCode,
        workCenterName: wcName,
        machineName,
        capacityPerDayHours: capacityHours,
        availableHours,
        efficiencyPercent: efficiency,
        supervisorName: supervisor,
        status,
      });
      alert('Work Center updated successfully!');
    } else {
      addWorkCenter({
        workCenterCode: wcCode || `WC-00${workCenters.length + 1}`,
        workCenterName: wcName,
        department: dept,
        machineName,
        machineNumber: `M/C-${Date.now().toString().slice(-4)}`,
        location: 'Bay Area',
        capacityPerDayHours: capacityHours,
        availableHours,
        efficiencyPercent: efficiency,
        supervisorName: supervisor,
        status,
      });
      alert('Work Center created successfully!');
    }

    setShowModal(false);
    setEditingWc(null);
  };

  const openEdit = (wc: WorkCenter) => {
    setEditingWc(wc);
    setWcCode(wc.workCenterCode);
    setWcName(wc.workCenterName);
    setMachineName(wc.machineName);
    setCapacityHours(wc.capacityPerDayHours);
    setAvailableHours(wc.availableHours);
    setEfficiency(wc.efficiencyPercent);
    setSupervisor(wc.supervisorName);
    setStatus(wc.status);
    setShowModal(true);
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-crm-brand-600/10 text-crm-brand-500 border border-crm-brand-600/20">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Work Centers & Machines Master
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand- font-medium border border-crm-brand-600/30">
                Shop Floor Bays
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Machinery Capacity, Daily Hours Available & OEE Efficiency Metrics
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingWc(null);
            setWcCode('');
            setWcName('');
            setMachineName('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-crm-brand-700 to-crm-brand-700 font-bold text-[#211B17] text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Add Work Center Bay
        </button>
      </div>

      {/* Work Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workCenters.map((wc) => (
          <div
            key={wc.id}
            className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-crm-brand-600/50 transition space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono font-bold text-crm-brand-500 text-sm">{wc.workCenterCode}</span>
                <h3 className="text-sm font-bold text-[#211B17] mt-0.5">{wc.workCenterName}</h3>
                <div className="text-[11px] text-[#70665F] font-mono mt-0.5">{wc.machineName}</div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  wc.status === 'Running'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : wc.status === 'Maintenance'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {wc.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EBE3DB] text-xs text-center">
              <div>
                <span className="text-[#70665F] block text-[10px]">Daily Capacity</span>
                <span className="font-bold text-[#544B45]">{wc.capacityPerDayHours} hrs</span>
              </div>
              <div>
                <span className="text-[#70665F] block text-[10px]">Available</span>
                <span className="font-bold text-emerald-400">{wc.availableHours} hrs</span>
              </div>
              <div>
                <span className="text-[#70665F] block text-[10px]">Efficiency</span>
                <span className="font-bold text-amber-400">{wc.efficiencyPercent}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EBE3DB] flex justify-between items-center text-xs text-[#70665F]">
              <div className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-crm-brand-500" />
                <span>Sup: {wc.supervisorName}</span>
              </div>
              <button
                onClick={() => openEdit(wc)}
                className="px-2.5 py-1 rounded bg-[#FAF7F2] text-[#544B45] hover:bg-[#FAF7F2] transition border border-[#EBE3DB] text-[11px] flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3 text-crm-brand-500" /> Edit Bay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#544B45]">
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17]">{editingWc ? 'Edit Work Center' : 'Add Work Center Bay'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Work Center Code</label>
                  <input
                    type="text"
                    required
                    placeholder="WC-WELD"
                    value={wcCode}
                    onChange={(e) => setWcCode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Supervisor</label>
                  <input
                    type="text"
                    required
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Work Center Name</label>
                <input
                  type="text"
                  required
                  placeholder="Heavy SAW Welding & Fabrication Bay"
                  value={wcName}
                  onChange={(e) => setWcName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Machine Name & Specs</label>
                <input
                  type="text"
                  required
                  placeholder="SAW Column & Boom Welding Manipulator"
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Capacity (Hrs/Day)</label>
                  <input
                    type="number"
                    value={capacityHours}
                    onChange={(e) => setCapacityHours(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Available Hrs</label>
                  <input
                    type="number"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Efficiency %</label>
                  <input
                    type="number"
                    value={efficiency}
                    onChange={(e) => setEfficiency(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                >
                  <option value="Running">Running</option>
                  <option value="Idle">Idle</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Breakdown">Breakdown</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] font-medium hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 font-bold text-white hover:bg-crm-brand-600 shadow-lg"
                >
                  {editingWc ? 'Update Work Center' : 'Save Work Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
