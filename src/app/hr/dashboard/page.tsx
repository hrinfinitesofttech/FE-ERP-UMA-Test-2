'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  DollarSign,
  Gift,
  Award,
  LogOut,
  TrendingUp,
  BarChart3,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function HRDashboardPage() {
  const {
    availableEmployees,
    attendanceRecords,
    leaveRequests,
    wfhRequests,
    attendanceRegularizations,
    payrollRecords,
    employeeExits,
    departments,
    salaryStructures,
    overtimeRecords = [],
    leaveBalances = [],
  } = useERP();

  const totalEmployees = availableEmployees.length;
  const activeEmployees = availableEmployees.filter((e) => e.status === 'Active').length;
  // Real figures computed from live HR records
  const attendanceRate = attendanceRecords.length > 0
    ? Math.round((attendanceRecords.filter((a: any) => ['Present', 'Late', 'Half Day', 'WFH'].includes(a.status)).length / attendanceRecords.length) * 1000) / 10
    : null;
  const overtimeMonth = (overtimeRecords as any[]).filter((o) => (o.date || '').slice(0, 7) === new Date().toISOString().slice(0, 7) && o.status !== 'Rejected');
  const overtimeHours = overtimeMonth.reduce((sum, o) => sum + (Number(o.overtimeHours) || 0), 0);
  const overtimeCost = overtimeMonth.reduce((sum, o) => sum + (Number(o.overtimeAmount) || 0), 0);
  const upcomingBirthdays = (availableEmployees as any[]).filter((e) => {
    if (!e.dob) return false;
    const d = new Date(e.dob);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
    return (next.getTime() - now.getTime()) / 86400000 <= 7;
  }).length;
  const presentToday = attendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const absentToday = attendanceRecords.filter((a) => a.status === 'Absent').length;
  const wfhToday = wfhRequests.filter((w) => w.status === 'Approved').length;
  const lateToday = attendanceRecords.filter((a) => a.lateMinutes > 0).length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;
  const pendingCorrections = attendanceRegularizations.filter((r) => r.status === 'Pending').length;
  const pendingPayroll = payrollRecords.filter((p) => p.status === 'Pending Approval' || p.status === 'Draft').length;
  const noticePeriodEmployees = employeeExits.filter((e) => e.status === 'Notice Period').length;

  const totalMonthlyPayrollCost = salaryStructures.reduce((acc, curr) => acc + curr.totalCTC, 0);

  return (
    <div className="p-6 space-y-6 bg-white text-[color:var(--crm-text-primary)] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[color:var(--crm-border-default)] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--crm-text-primary)] tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-pink-500" />
            HR & Payroll Dashboard
          </h1>
          <p className="text-sm text-[color:var(--crm-text-secondary)] mt-1">
            Uma Techno Fab Manufacturing ERP — Workforce Analytics, Attendance, Payroll & Recruitment Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/hr/employees?add=true"
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm rounded-lg shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </Link>
          <Link
            href="/hr/monthly-payroll"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg shadow-md transition cursor-pointer"
          >
            <DollarSign className="w-4 h-4" /> Run Monthly Payroll
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] text-xs font-semibold">
            <span>Total Headcount</span>
            <Users className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-[color:var(--crm-text-primary)]">{totalEmployees}</div>
          <span className="text-[11px] text-crm-brand-500 mt-1">All Roles & Plants</span>
        </div>

        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] text-xs font-semibold">
            <span>Active Staff</span>
            <UserCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{activeEmployees}</div>
          <span className="text-[11px] text-[color:var(--crm-text-secondary)] mt-1">On Active Payroll</span>
        </div>

        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] text-xs font-semibold">
            <span>Present Today</span>
            <CheckCircle2 className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-crm-brand-500">{presentToday}</div>
          <span className="text-[11px] text-[color:var(--crm-text-secondary)] mt-1">Punch In Verified</span>
        </div>

        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] text-xs font-semibold">
            <span>Absent Today</span>
            <AlertTriangle className="w-4 h-4 text-red-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-red-700">{absentToday}</div>
          <span className="text-[11px] text-red-700 mt-1">Requires Regularization</span>
        </div>

        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] text-xs font-semibold">
            <span>WFH / Remote</span>
            <Clock className="w-4 h-4 text-violet-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-violet-700">{wfhToday}</div>
          <span className="text-[11px] text-[color:var(--crm-text-secondary)] mt-1">Approved Remote</span>
        </div>

        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] text-xs font-semibold">
            <span>Late Check-in</span>
            <Clock className="w-4 h-4 text-crm-brand-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{lateToday}</div>
          <span className="text-[11px] text-amber-700 mt-1">Grace Exceeded</span>
        </div>

        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] text-xs font-semibold">
            <span>Pending Leaves</span>
            <FileCheck2 className="w-4 h-4 text-pink-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-pink-700">{pendingLeaves}</div>
          <span className="text-[11px] text-pink-700 mt-1">Awaiting Approval</span>
        </div>
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 border border-[#E2E7EF]/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[color:var(--crm-text-secondary)] font-medium">Pending Attendance Corrections</div>
            <div className="text-xl font-bold text-amber-700 mt-1">{pendingCorrections} Requests</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-crm-brand-600" />
          </div>
        </div>

        <div className="bg-white/60 border border-[#E2E7EF]/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[color:var(--crm-text-secondary)] font-medium">Monthly Payroll Budget CTC</div>
            <div className="text-xl font-bold text-emerald-700 mt-1">₹{(totalMonthlyPayrollCost / 100000).toFixed(2)} Lakhs</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-700" />
          </div>
        </div>

        <div className="bg-white/60 border border-[#E2E7EF]/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[color:var(--crm-text-secondary)] font-medium">Employees on Notice Period</div>
            <div className="text-xl font-bold text-rose-700 mt-1">{noticePeriodEmployees} Active Resignations</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-rose-700" />
          </div>
        </div>

        <div className="bg-white/60 border border-[#E2E7EF]/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[color:var(--crm-text-secondary)] font-medium">Upcoming Birthdays / Work Anniversaries</div>
            <div className="text-xl font-bold text-crm-brand-500 mt-1">{upcomingBirthdays} This Week</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-crm-brand-600/10 border border-crm-brand-600/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-crm-brand-500" />
          </div>
        </div>
      </div>

      {/* Main Grid Section: Analytics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakup */}
        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-700" />
            Department-wise Employee Headcount
          </h3>
          <div className="space-y-3">
            {departments.slice(0, 6).map((dept, i) => {
              const count = (availableEmployees as any[]).filter((e) => e.departmentId === dept.id || e.departmentName === dept.departmentName).length;
              const pct = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
              return (
                <div key={dept.id || i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[color:var(--crm-text-secondary)]">{dept.departmentName}</span>
                    <span className="text-pink-700">{count} Employees</span>
                  </div>
                  <div className="w-full h-2 bg-[color:var(--crm-bg-app)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-crm-brand-600 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance & Leave Analytics */}
        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            Attendance & Overtime Trend (Current Month)
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-white/60 border border-[#E2E7EF]/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-[color:var(--crm-text-secondary)]">Average Plant Attendance</span>
                <div className="text-lg font-bold text-emerald-700">{attendanceRate !== null ? `${attendanceRate}%` : '—'}</div>
              </div>
            </div>

            <div className="p-3 bg-white/60 border border-[#E2E7EF]/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-[color:var(--crm-text-secondary)]">Shop Floor Overtime Hours</span>
                <div className="text-lg font-bold text-amber-700">{overtimeHours} Hrs</div>
              </div>
              <div className="text-xs text-[color:var(--crm-text-secondary)] text-right">
                <div>Cost: ₹{overtimeCost.toLocaleString('en-IN')}</div>
                <div className="text-[color:var(--crm-text-secondary)]">This month, excl. rejected</div>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
            <Award className="w-5 h-5 text-crm-brand-600" />
            Quick HR Actions & Navigation
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            <Link
              href="/hr/employees"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#F4F6FA]/60 border border-[#E2E7EF]/60 rounded-lg text-sm text-[color:var(--crm-text-primary)] transition"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-crm-brand-500" />
                <span>Employee Master & Profiles</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[color:var(--crm-text-secondary)]" />
            </Link>

            <Link
              href="/hr/attendance"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#F4F6FA]/60 border border-[#E2E7EF]/60 rounded-lg text-sm text-[color:var(--crm-text-primary)] transition"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-crm-brand-500" />
                <span>Daily Shop Floor Attendance Log</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[color:var(--crm-text-secondary)]" />
            </Link>

            <Link
              href="/hr/leave-approvals"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#F4F6FA]/60 border border-[#E2E7EF]/60 rounded-lg text-sm text-[color:var(--crm-text-primary)] transition"
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4 text-pink-700" />
                <span>Approve Leave & WFH Requests ({pendingLeaves})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[color:var(--crm-text-secondary)]" />
            </Link>

            <Link
              href="/hr/monthly-payroll"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#F4F6FA]/60 border border-[#E2E7EF]/60 rounded-lg text-sm text-[color:var(--crm-text-primary)] transition"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>Monthly Payroll Calculation Engine</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[color:var(--crm-text-secondary)]" />
            </Link>

            <Link
              href="/hr/advances"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#F4F6FA]/60 border border-[#E2E7EF]/60 rounded-lg text-sm text-[color:var(--crm-text-primary)] transition"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-crm-brand-600" />
                <span>Employee Advances & Loan EMI</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[color:var(--crm-text-secondary)]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
