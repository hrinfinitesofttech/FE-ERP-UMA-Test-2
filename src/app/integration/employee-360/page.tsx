'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { Users, Award, Plus, Calendar } from 'lucide-react';
import { EmptyState, LoadingState } from '../../../components/common/StateDisplay';

export default function Employee360Page() {
  const { employee360List = [], employees = [], projectTasks = [], attendanceRecords = [], leaveBalances = [], salaryStructures = [], employeeAppraisals = [], isInitialLoading } = useERP();
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  const allEmployees = useMemo(() => {
    const map = new Map<string, {
      employeeId: string;
      employeeCode: string;
      name: string;
      department: string;
      designation: string;
      attendancePercent: number;
      assignedJobsCount: number;
      currentSalaryCTC: number;
      joiningDate: string;
      leaveBalance: number;
      performanceScore: number;
    }>();

    // 1. From employee360List
    employee360List.forEach((e) => {
      const key = e.employeeId || e.employeeCode;
      if (key) map.set(key, e);
    });

    // 2. Supplement from live employees
    employees.forEach((e) => {
      const key = e.id;
      if (key && !map.has(key)) {
        const fullName = e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.username;
        const matchingTasks = projectTasks.filter(
          (t) => t.assignedTo === e.id || t.assignedToName?.toLowerCase() === fullName.toLowerCase()
        );

        const myAtt = attendanceRecords.filter((a: any) => a.employeeId === e.id);
        const presentDays = myAtt.filter((a: any) => ['present', 'half day', 'wfh', 'late'].includes(String(a.status).toLowerCase())).length;
        const myBal = leaveBalances.filter((b: any) => b.employeeId === e.id);
        const myStruct = salaryStructures.find((st: any) => st.employeeId === e.id);
        const myApp = employeeAppraisals.filter((ap: any) => ap.employeeId === e.id);
        map.set(key, {
          employeeId: e.id,
          employeeCode: e.id,
          name: fullName,
          department: e.departmentName || e.department || '—',
          designation: e.designation || e.roleName || '—',
          attendancePercent: myAtt.length > 0 ? Math.round((presentDays / myAtt.length) * 100) : 0,
          assignedJobsCount: matchingTasks.length,
          currentSalaryCTC: Number(myStruct?.totalCTC || 0),
          joiningDate: (e as any).joiningDate || '',
          leaveBalance: myBal.reduce((sum: number, b: any) => sum + Number(b.availableBalance || 0), 0),
          performanceScore: myApp.length > 0 ? Math.round((myApp.reduce((sum: number, ap: any) => sum + Number(ap.finalScore || 0), 0) / myApp.length) * 20) : 0,
        });
      }
    });

    return Array.from(map.values());
  }, [employee360List, employees, projectTasks, attendanceRecords, leaveBalances, salaryStructures, employeeAppraisals]);

  const currentEmp = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) return null;
    if (selectedEmpId) {
      const match = allEmployees.find((e) => e.employeeId === selectedEmpId || e.employeeCode === selectedEmpId);
      if (match) return match;
    }
    return allEmployees[0];
  }, [allEmployees, selectedEmpId]);

  if (isInitialLoading && allEmployees.length === 0) {
    return <LoadingState message="Loading Employee 360° Profile..." timeoutSeconds={15} />;
  }

  if (!currentEmp) {
    return (
      <EmptyState
        title="No Employees Found"
        message="No employee personnel records found in directory. Add employees in HR module to view 360° attendance, tasks and CTC profile."
        actionLabel="Add Employee"
        actionHref="/hr/employees"
        icon={Users}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] font-sans pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[color:var(--crm-brand-700)] flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">{currentEmp.name}</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] font-medium mt-0.5">
              Code: <span className="font-mono font-bold text-[color:var(--crm-brand-700)]">{currentEmp.employeeCode}</span> • Designation: {currentEmp.designation}
            </p>
          </div>
        </div>

        {/* Employee Select Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <select
              value={currentEmp.employeeId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full bg-[color:var(--crm-bg-app)] hover:bg-white text-xs text-[color:var(--crm-text-primary)] font-bold px-3 py-2.5 rounded-xl border border-[color:var(--crm-border-strong)] focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer min-h-[40px]"
            >
              {allEmployees.map((e) => (
                <option key={e.employeeId} value={e.employeeId}>
                  {e.name} ({e.department})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/hr/employees"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-strong)] text-[color:var(--crm-text-primary)] text-xs font-bold transition shadow-2xs min-h-[40px] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Staff</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[color:var(--crm-text-secondary)] block font-semibold">Assigned Department</span>
          <div className="text-base font-bold text-[color:var(--crm-text-primary)] truncate font-sans">{currentEmp.department}</div>
          <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block font-sans">Primary organizational unit</span>
        </div>

        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[color:var(--crm-text-secondary)] block font-semibold">Monthly Attendance</span>
          <div className="text-xl font-bold font-mono text-emerald-700">{currentEmp.attendancePercent}%</div>
          <span className="text-[10px] text-emerald-700 block font-sans">Present &amp; compliant</span>
        </div>

        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[color:var(--crm-text-secondary)] block font-semibold">Assigned Project Tasks</span>
          <div className="text-xl font-bold font-mono text-[color:var(--crm-brand-700)]">{currentEmp.assignedJobsCount} Tasks</div>
          <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block font-sans">Active WIP load</span>
        </div>

        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[color:var(--crm-text-secondary)] block font-semibold">Annual CTC Package</span>
          <div className="text-xl font-bold font-mono text-[color:var(--crm-text-primary)]">
            ₹ {currentEmp.currentSalaryCTC > 0 ? currentEmp.currentSalaryCTC.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block font-sans">Standard annual scale</span>
        </div>
      </div>

      {/* HR & Performance Profile */}
      <div className="p-5 sm:p-6 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-xs space-y-3 text-xs">
        <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2 pb-3 border-b border-[color:var(--crm-surface-subtle)]">
          <Award className="w-4 h-4 text-[color:var(--crm-brand-700)]" />
          <span>HR Records &amp; Performance Score</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[color:var(--crm-text-secondary)]">
          <div className="p-3 rounded-xl bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)]">
            <span className="text-[10px] text-[color:var(--crm-text-secondary)] uppercase font-semibold block">Date of Joining</span>
            <strong className="text-xs text-[color:var(--crm-text-primary)] mt-0.5 block">{currentEmp.joiningDate}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)]">
            <span className="text-[10px] text-[color:var(--crm-text-secondary)] uppercase font-semibold block">Available Leave Balance</span>
            <span className="text-xs text-emerald-700 font-mono font-bold mt-0.5 block">{currentEmp.leaveBalance} Days</span>
          </div>
          <div className="p-3 rounded-xl bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)]">
            <span className="text-[10px] text-[color:var(--crm-text-secondary)] uppercase font-semibold block">Appraisal Rating</span>
            <span className="text-xs text-amber-800 font-mono font-bold mt-0.5 block">{currentEmp.performanceScore} / 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
