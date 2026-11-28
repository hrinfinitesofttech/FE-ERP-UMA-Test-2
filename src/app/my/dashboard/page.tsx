'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CalendarCheck, CheckSquare, Clock, Fingerprint, ListChecks, Timer, TrendingUp } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { Clock as ClockIcon, FileCheck2, CalendarDays, Banknote } from 'lucide-react';
import {
  BarPanel, CHART_COLORS, DonutPanel, KpiGrid, KpiTile, ListPanel, ShortcutGrid, StatusPill, titleCase,
} from '@/components/dashboard/DashboardKit';

const num = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** HRMS dashboard of the logged-in employee: today's punch, month attendance, leave balance, tasks. */
export default function MyHrmsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.hr.employeeDashboard()
      .then(setData)
      .catch((e: any) => setError(e?.data?.error || e?.message || 'Could not load your HRMS dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-[color:var(--crm-text-secondary)]">Loading your dashboard...</div>;
  if (error || !data) return <div className="text-sm text-red-600">{error || 'No data'}</div>;

  const today = data.todayAttendance || {};
  const month = data.monthlySummary || {};
  const tasks = data.tasksSummary || {};
  const dayOfMonth = new Date().getDate();
  const onTime = Math.max(0, num(month.presentDays) - num(month.lateDays));
  const notPresent = Math.max(0, dayOfMonth - num(month.presentDays));

  const leave = (data.leaveBalances || []).map((b: any) => ({
    name: b.leaveCode || b.leaveName,
    available: num(b.availableBalance),
    used: num(b.used),
    pending: num(b.pendingApproval),
  }));

  const taskBars = [
    { name: 'Completed', value: num(tasks.completed) },
    { name: 'In progress', value: num(tasks.inProgress) },
    { name: 'Due today', value: num(tasks.dueToday) },
    { name: 'Overdue', value: num(tasks.overdue) },
  ];

  const punched = !!today.checkIn;

  return (
    <div className="space-y-5">
      {/* today */}
      <div className="rounded-2xl bg-white border border-[color:var(--crm-border-default)] shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${punched ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <Fingerprint className="w-5 h-5" />
          </span>
          <div>
            <div className="text-sm font-bold text-[color:var(--crm-text-primary)]">Today — {today.status || 'Not punched'}</div>
            <div className="text-xs text-[color:var(--crm-text-secondary)]">{today.shiftName}</div>
          </div>
        </div>
        <div className="flex gap-6 text-xs">
          <div><div className="font-black text-base">{today.checkIn || '--:--'}</div><span className="text-[color:var(--crm-text-secondary)]">Check in</span></div>
          <div><div className="font-black text-base">{today.checkOut || '--:--'}</div><span className="text-[color:var(--crm-text-secondary)]">Check out</span></div>
          <div><div className="font-black text-base">{num(today.totalHours).toFixed(1)} h</div><span className="text-[color:var(--crm-text-secondary)]">Hours today</span></div>
          <div><div className={`font-black text-base ${num(today.lateMinutes) > 0 ? 'text-red-600' : ''}`}>{num(today.lateMinutes)} min</div><span className="text-[color:var(--crm-text-secondary)]">Late</span></div>
        </div>
        <Link href="/my/attendance" className="px-3.5 py-2 rounded-lg bg-crm-brand-700 text-white text-xs font-semibold hover:bg-crm-brand-800">
          {today.canCheckIn ? 'Punch in' : today.canCheckOut ? 'Punch out' : 'View attendance'}
        </Link>
      </div>

      <KpiGrid cols={6}>
        <KpiTile label={`Present days (${month.month || 'this month'})`} value={num(month.presentDays)} icon={CalendarCheck} tone="green" href="/my/attendance" />
        <KpiTile label="Late days" value={num(month.lateDays)} icon={Clock} tone={num(month.lateDays) ? 'amber' : 'slate'} href="/my/attendance" />
        <KpiTile label="Hours worked" value={num(month.totalHours).toFixed(0)} icon={Timer} href="/my/attendance" />
        <KpiTile label="Attendance rate" value={`${num(month.attendanceRate)}%`} icon={TrendingUp} tone="violet" href="/my/attendance" />
        <KpiTile label="Tasks assigned" value={num(tasks.totalAssigned)} icon={ListChecks} href="/projects/tasks" />
        <KpiTile label="Overdue tasks" value={num(tasks.overdue)} icon={AlertTriangle} tone={num(tasks.overdue) ? 'red' : 'slate'} href="/projects/tasks" />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutPanel title="This month's attendance" subtitle={`Up to day ${dayOfMonth}`} centerLabel="days" data={[
          { name: 'On time', value: onTime, color: CHART_COLORS[1] },
          { name: 'Late', value: num(month.lateDays), color: CHART_COLORS[2] },
          { name: 'Absent / not punched', value: notPresent, color: CHART_COLORS[3] },
        ]} />
        <BarPanel title="Leave balance (days)" data={leave} xKey="name" stacked
          series={[
            { key: 'available', label: 'Available', color: CHART_COLORS[1] },
            { key: 'used', label: 'Used', color: CHART_COLORS[7] },
            { key: 'pending', label: 'Pending approval', color: CHART_COLORS[2] },
          ]} />
        <BarPanel title="My tasks" data={taskBars} xKey="name" series={[{ key: 'value', label: 'Tasks', color: CHART_COLORS[0] }]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ListPanel title="Pending leave requests" empty="No pending leave"
          rows={(data.pendingLeaves || []).map((l: any) => ({
            key: l.id, href: '/my/leaves', primary: `${l.leaveName || 'Leave'} · ${l.numberOfDays || ''} day(s)`,
            secondary: `${l.fromDate || ''} → ${l.toDate || ''}`, badge: <StatusPill text={titleCase(l.status || 'Pending')} tone="amber" />,
          }))} />
        <ListPanel title="My recent tasks" empty="No tasks assigned"
          rows={(tasks.recentTasks || []).map((t: any) => ({
            key: t.id, href: '/projects/tasks', primary: t.title || t.taskNumber,
            secondary: `${t.taskNumber || ''}${t.dueDate ? ` · due ${t.dueDate}` : ''}`,
            badge: <StatusPill text={t.isOverdue ? 'Overdue' : titleCase(t.status || '')} tone={t.isOverdue ? 'red' : 'slate'} />,
          }))} />
        <ListPanel title="Notifications" empty="You are all caught up"
          rows={(data.notifications || []).map((n: any) => ({
            key: n.id, href: n.linkUrl || '/notifications', primary: n.title, secondary: n.message,
          }))} />
      </div>

      <ShortcutGrid title="HRMS shortcuts" items={[
        { label: 'My Attendance', href: '/my/attendance', icon: ClockIcon },
        { label: 'Leave Management', href: '/my/leaves', icon: FileCheck2 },
        { label: 'Missed Punch', href: '/my/missed-punch', icon: Fingerprint },
        { label: 'Overtime', href: '/my/overtime', icon: Timer },
        { label: 'Holiday Calendar', href: '/my/holidays', icon: CalendarDays },
        { label: 'Salary Slips', href: '/my/payslips', icon: Banknote },
      ]} />

      {(data.moduleShortcuts || []).length > 0 && (
        <ShortcutGrid title="My department & modules" items={(data.moduleShortcuts as any[]).map((m) => ({
          label: m.label, href: m.href, icon: CheckSquare,
        }))} />
      )}
    </div>
  );
}
