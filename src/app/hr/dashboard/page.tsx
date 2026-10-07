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
  } = useERP();

  const totalEmployees = availableEmployees.length;
  const activeEmployees = availableEmployees.filter((e) => e.status === 'Active').length;
  const newJoiningsThisMonth = 3;
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
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-pink-500" />
            HR & Payroll Dashboard
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
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
        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Total Headcount</span>
            <Users className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#211B17]">{totalEmployees}</div>
          <span className="text-[11px] text-crm-brand-500 mt-1">All Roles & Plants</span>
        </div>

        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Active Staff</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{activeEmployees}</div>
          <span className="text-[11px] text-[#70665F] mt-1">On Active Payroll</span>
        </div>

        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Present Today</span>
            <CheckCircle2 className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-crm-brand-500">{presentToday}</div>
          <span className="text-[11px] text-[#70665F] mt-1">Punch In Verified</span>
        </div>

        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Absent Today</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-red-400">{absentToday}</div>
          <span className="text-[11px] text-red-400 mt-1">Requires Regularization</span>
        </div>

        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>WFH / Remote</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-violet-400">{wfhToday}</div>
          <span className="text-[11px] text-[#70665F] mt-1">Approved Remote</span>
        </div>

        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Late Check-in</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400">{lateToday}</div>
          <span className="text-[11px] text-amber-400 mt-1">Grace Exceeded</span>
        </div>

        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#70665F] text-xs font-semibold">
            <span>Pending Leaves</span>
            <FileCheck2 className="w-4 h-4 text-pink-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-pink-400">{pendingLeaves}</div>
          <span className="text-[11px] text-pink-400 mt-1">Awaiting Approval</span>
        </div>
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 border border-[#EBE3DB]/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#70665F] font-medium">Pending Attendance Corrections</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{pendingCorrections} Requests</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="bg-white/60 border border-[#EBE3DB]/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#70665F] font-medium">Monthly Payroll Budget CTC</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">₹{(totalMonthlyPayrollCost / 100000).toFixed(2)} Lakhs</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white/60 border border-[#EBE3DB]/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#70665F] font-medium">Employees on Notice Period</div>
            <div className="text-xl font-bold text-rose-400 mt-1">{noticePeriodEmployees} Active Resignations</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        <div className="bg-white/60 border border-[#EBE3DB]/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#70665F] font-medium">Upcoming Birthdays / Work Anniversaries</div>
            <div className="text-xl font-bold text-crm-brand-500 mt-1">2 This Week</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-crm-brand-600/10 border border-crm-brand-600/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-crm-brand-500" />
          </div>
        </div>
      </div>

      {/* Main Grid Section: Analytics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakup */}
        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-400" />
            Department-wise Employee Headcount
          </h3>
          <div className="space-y-3">
            {departments.slice(0, 6).map((dept, i) => {
              const count = Math.floor(Math.random() * 8) + 3;
              const pct = Math.min(100, count * 10);
              return (
                <div key={dept.id || i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#544B45]">{dept.departmentName}</span>
                    <span className="text-pink-400">{count} Employees</span>
                  </div>
                  <div className="w-full h-2 bg-[#FAF7F2] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-crm-brand-600 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance & Leave Analytics */}
        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Attendance & Overtime Trend (Current Month)
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-white/60 border border-[#EBE3DB]/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-[#70665F]">Average Plant Attendance</span>
                <div className="text-lg font-bold text-emerald-400">96.4%</div>
              </div>
              <div className="text-xs text-[#70665F] text-right">
                <div>Shift Target: 95.0%</div>
                <div className="text-emerald-400 font-semibold">+1.4% Surplus</div>
              </div>
            </div>

            <div className="p-3 bg-white/60 border border-[#EBE3DB]/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-[#70665F]">Shop Floor Overtime Hours</span>
                <div className="text-lg font-bold text-amber-400">142.5 Hrs</div>
              </div>
              <div className="text-xs text-[#70665F] text-right">
                <div>Estimated Cost: ₹42,750</div>
                <div className="text-amber-400 font-semibold">Approved by Supervisors</div>
              </div>
            </div>

            <div className="p-3 bg-white/60 border border-[#EBE3DB]/40 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-[#70665F]">Leave Utilization Rate</span>
                <div className="text-lg font-bold text-pink-400">8.2%</div>
              </div>
              <div className="text-xs text-[#70665F] text-right">
                <div>Casual / Sick Quota</div>
                <div className="text-[#544B45] font-semibold">Normal Range</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Quick HR Actions & Navigation
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            <Link
              href="/hr/employees"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#FAF7F2]/60 border border-[#EBE3DB]/60 rounded-lg text-sm text-[#3E2723] transition"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-crm-brand-500" />
                <span>Employee Master & Profiles</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#70665F]" />
            </Link>

            <Link
              href="/hr/attendance"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#FAF7F2]/60 border border-[#EBE3DB]/60 rounded-lg text-sm text-[#3E2723] transition"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-crm-brand-500" />
                <span>Daily Shop Floor Attendance Log</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#70665F]" />
            </Link>

            <Link
              href="/hr/leave-approvals"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#FAF7F2]/60 border border-[#EBE3DB]/60 rounded-lg text-sm text-[#3E2723] transition"
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4 text-pink-400" />
                <span>Approve Leave & WFH Requests ({pendingLeaves})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#70665F]" />
            </Link>

            <Link
              href="/hr/monthly-payroll"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#FAF7F2]/60 border border-[#EBE3DB]/60 rounded-lg text-sm text-[#3E2723] transition"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Monthly Payroll Calculation Engine</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#70665F]" />
            </Link>

            <Link
              href="/hr/advances"
              className="flex items-center justify-between p-3 bg-white/80 hover:bg-[#FAF7F2]/60 border border-[#EBE3DB]/60 rounded-lg text-sm text-[#3E2723] transition"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Employee Advances & Loan EMI</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#70665F]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
