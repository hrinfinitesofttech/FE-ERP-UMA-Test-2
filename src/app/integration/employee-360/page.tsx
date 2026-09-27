'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Users, UserCheck, Briefcase, Calendar, Award, Clock, DollarSign, Layers } from 'lucide-react';

export default function Employee360Page() {
  const { employee360List } = useERP();
  const [selectedEmpId, setSelectedEmpId] = useState<string>('EMP-2026-001');

  const emp = employee360List.find((e) => e.employeeId === selectedEmpId) || employee360List[0];

  if (!emp) {
    return (
      <div className="p-8 text-center bg-slate-950 min-h-screen text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Employee 360° Profile</h2>
        <p>No employee records available or loading live data from API...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{emp.name}</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Code: <span className="text-pink-400 font-bold font-mono">{emp.employeeCode}</span> • Designation: {emp.designation}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Select Employee:</span>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="bg-transparent text-pink-400 font-bold outline-none cursor-pointer"
            >
              {employee360List.map((e) => (
                <option key={e.employeeId} value={e.employeeId} className="bg-slate-900 text-slate-200">
                  {e.name} ({e.department})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Department</span>
          <div className="text-sm font-bold text-white truncate">{emp.department}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Attendance %</span>
          <div className="text-lg font-bold text-emerald-400">{emp.attendancePercent}%</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Assigned Active Jobs</span>
          <div className="text-lg font-bold text-cyan-400">{emp.assignedJobsCount} Jobs</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Annual CTC (Salary)</span>
          <div className="text-lg font-bold text-purple-400">₹{emp.currentSalaryCTC.toLocaleString()}</div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-pink-400" /> HR & Performance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
          <div>Date of Joining: <strong className="text-white">{emp.joiningDate}</strong></div>
          <div>Leave Balance: <span className="font-mono text-emerald-400 font-bold">{emp.leaveBalance} Days</span></div>
          <div>Performance Rating: <span className="font-mono text-amber-400 font-bold">{emp.performanceScore} / 100</span></div>
        </div>
      </div>
    </div>
  );
}
