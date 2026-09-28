'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Star,
  Wrench,
  Briefcase,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

export default function TechnicianAssignmentPage() {
  const { technicians, employees, serviceRequests } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');

  const filteredTechnicians = technicians.filter((t) => {
    const matchesSearch =

      !searchTerm?.trim() || (

      t.employeeName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      t.designation?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      t.location?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    const matchesSkill = skillFilter === 'all' || t.skills.includes(skillFilter);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold">
              HR / FIELD TECHNICIANS MATRIX
            </span>
            <span className="text-xs text-[#70665F]">Integrated Employee Master Profile</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Technician Assignment & Skills Roster
          </h1>
          <p className="text-xs text-[#70665F]">
            View field technician profiles directly from HR Employee Master, skills matrix, live workload, ratings and active service visits.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search technician name, designation or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          >
            <option value="all">All Technician Skills</option>
            <option value="Hydraulic System">Hydraulic System</option>
            <option value="CNC Calibration">CNC Calibration</option>
            <option value="Welding Jigs">Welding Jigs</option>
            <option value="Robotics (Fanuc/Kuka)">Robotics</option>
            <option value="Drive Systems">Drive Systems</option>
          </select>
        </div>
      </div>

      {/* Technician Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredTechnicians.map((tech) => (
          <div
            key={tech.employeeId}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-[#211B17] font-bold text-sm shadow">
                  {tech.employeeName.slice(0, 2)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17]">{tech.employeeName}</h3>
                  <div className="text-xs text-[#70665F] font-mono">{tech.employeeId} • {tech.designation}</div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  tech.availability === 'Available'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {tech.availability}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl border border-slate-100 dark:border-[#EBE3DB]">
              <div>
                <span className="text-[10px] text-[#70665F] block">Rating</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {tech.rating} / 5.0
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Total Service Visits</span>
                <span className="font-bold text-slate-900 dark:text-[#211B17]">{tech.totalCompletedVisits} Completed</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] text-[#70665F] font-semibold uppercase tracking-wider block">Skills & Specialties</span>
              <div className="flex flex-wrap gap-1">
                {tech.skills.map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-crm-brand- dark:bg-crm-brand-/40 text-crm-brand-700 dark:text-crm-brand-500 font-medium text-[10px]">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-[#70665F] border-t pt-3">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#70665F]" />
                <span>{tech.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#70665F]" />
                <span>{tech.location}</span>
              </div>
            </div>

            <button className="w-full py-2 rounded-xl bg-slate-100 dark:bg-[#FAF7F2] hover:bg-slate-200 dark:hover:bg-[#FAF7F2] text-xs font-semibold text-slate-800 dark:text-[#544B45] transition">
              Assign Job to {tech.employeeName.split(' ')[0]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
