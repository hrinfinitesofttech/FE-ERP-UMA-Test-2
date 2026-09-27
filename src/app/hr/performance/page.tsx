'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { Activity as ActivityIcon, Flag, TrendingUp, Award, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PerformanceManagementPage() {
  const { kpiMasters, employeeAppraisals, availableEmployees, currentUser } = useERP();

  const canViewPerformance = currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Manager' || currentUser?.role === 'Department Manager' || currentUser?.role === 'Admin';

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <ActivityIcon className="w-7 h-7 text-yellow-400" />
            Performance & Development Management
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Manufacturing Shop Floor KPIs, Annual Appraisal Reviews, Goal Achievements & Skill Matrix
          </p>
        </div>
      </div>

      {!canViewPerformance ? (
        <div className="p-12 bg-white/60 border border-[#EBE3DB]/60 rounded-xl text-center space-y-3">
          <Lock className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-[#211B17]">Performance Confidentiality Enforced</h2>
          <p className="text-sm text-[#70665F] max-w-md mx-auto">
            Employee KPI ratings, appraisal reviews and increment recommendations are confidential and restricted to HR and Department Managers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview Cards */}
          <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-400" /> Key Performance Indicators (KPIs)
            </h3>
            <p className="text-xs text-[#70665F]">Total Department KPIs Defined: <strong className="text-[#211B17]">{kpiMasters.length}</strong></p>
            <Link
              href="/hr/kpis"
              className="inline-block w-full py-2 bg-[#FAF7F2] hover:bg-slate-600 text-[#3E2723] text-xs font-semibold rounded-lg text-center transition"
            >
              Manage Department KPIs & Weightages
            </Link>
          </div>

          <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Annual Appraisals
            </h3>
            <p className="text-xs text-[#70665F]">Active Cycle: <strong className="text-emerald-400">FY 2025-26 Annual Review</strong></p>
            <Link
              href="/hr/appraisals"
              className="inline-block w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold rounded-lg text-center transition"
            >
              Open Appraisal Reviews
            </Link>
          </div>

          <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
              <Award className="w-5 h-5 text-crm-brand-500" /> Skill & Training Matrix
            </h3>
            <p className="text-xs text-[#70665F]">ISO Safety & CNC Training Sessions Active</p>
            <Link
              href="/hr/training"
              className="inline-block w-full py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] text-xs font-semibold rounded-lg text-center transition"
            >
              View Training Programs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
