'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Users, Clock, CalendarDays, FileText, Link as LinkIcon, RefreshCw, Settings2 } from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { api } from '../../../lib/apiClient';
import { toast } from '../../../context/ToastContext';
import {
  DailyData, MonthlyData, ErrorBanner, localISO, localMonth, btnPrimary, btn, errText,
} from './_parts/shared';
import OverviewTab from './_parts/OverviewTab';
import EmployeesTab from './_parts/EmployeesTab';
import DailyTab from './_parts/DailyTab';
import MonthlyTab from './_parts/MonthlyTab';
import RegularizationsTab from './_parts/RegularizationsTab';
import UnmappedTab from './_parts/UnmappedTab';
import SyncModal from './_parts/SyncModal';

type Tab = 'overview' | 'employees' | 'daily' | 'monthly' | 'regularizations' | 'unmapped';

const emptyDaily = (date: string): DailyData => ({
  date, totalEmployees: 0, presentCount: 0, lateCount: 0, absentCount: 0, halfDayCount: 0, leaveCount: 0, missingPunchCount: 0, employees: [],
});
const emptyMonthly = (month: string): MonthlyData => {
  const [y, m] = month.split('-').map(Number);
  return { monthYear: month, month: m, year: y, totalDays: new Date(y, m, 0).getDate(), totalEmployees: 0, summary: { totalPresent: 0, totalAbsent: 0, totalLate: 0, totalHalfDay: 0 }, employees: [] };
};
const asList = (res: any): any[] => (Array.isArray(res) ? res : res?.results || []);

export default function AttendancePage() {
  const router = useRouter();
  const { currentUser } = useERP() as any;
  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.roleName === 'Super Admin' || currentUser?.roleName === 'Admin';
  const canApprove = isAdmin || !!(currentUser?.canManageAttendance || currentUser?.can_manage_attendance);

  const [tab, setTab] = useState<Tab>('overview');
  const [date, setDate] = useState(() => localISO());
  const [month, setMonth] = useState(() => localMonth());
  const [dailyStatus, setDailyStatus] = useState('ALL');

  const [daily, setDaily] = useState<DailyData>(() => emptyDaily(localISO()));
  const [monthly, setMonthly] = useState<MonthlyData>(() => emptyMonthly(localMonth()));
  const [regs, setRegs] = useState<any[]>([]);
  const [unmapped, setUnmapped] = useState<any[]>([]);
  const [machineStatus, setMachineStatus] = useState<any>(null);
  const [mappingsSummary, setMappingsSummary] = useState<any>(null);

  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [loadingBio, setLoadingBio] = useState(true);
  const [errDaily, setErrDaily] = useState('');
  const [errMonthly, setErrMonthly] = useState('');
  const [showSync, setShowSync] = useState(false);
  const [importing, setImporting] = useState(false);

  // guards against out-of-order responses when the user flips dates quickly
  const dailySeq = useRef(0);
  const monthlySeq = useRef(0);

  const loadDaily = useCallback(async (d: string) => {
    const seq = ++dailySeq.current;
    setLoadingDaily(true); setErrDaily('');
    try {
      const res: any = await api.hr.attendance.dailySheet({ date: d });
      if (seq !== dailySeq.current) return;
      if (res && res.employees) setDaily(res); else setErrDaily('The server returned an unexpected response.');
    } catch (e) { if (seq === dailySeq.current) setErrDaily(errText(e, 'Could not load daily attendance')); }
    finally { if (seq === dailySeq.current) setLoadingDaily(false); }
  }, []);

  const loadMonthly = useCallback(async (m: string) => {
    const seq = ++monthlySeq.current;
    setLoadingMonthly(true); setErrMonthly('');
    try {
      const res: any = await api.hr.attendance.monthlySheet({ month_year: m });
      if (seq !== monthlySeq.current) return;
      if (res && res.employees) setMonthly(res); else setErrMonthly('The server returned an unexpected response.');
    } catch (e) { if (seq === monthlySeq.current) setErrMonthly(errText(e, 'Could not load monthly attendance')); }
    finally { if (seq === monthlySeq.current) setLoadingMonthly(false); }
  }, []);

  const loadRegs = useCallback(async () => {
    setLoadingRegs(true);
    try { setRegs(asList(await api.hr.regularization.list())); } catch { /* shown as empty; tab has own empty state */ }
    finally { setLoadingRegs(false); }
  }, []);

  const loadBio = useCallback(async () => {
    setLoadingBio(true);
    try {
      const [status, summary, logs] = await Promise.allSettled([
        api.hr.punchMachine.status(), api.hr.biometricMappings.summary(), api.hr.punchMachine.logs({ unmapped: true }),
      ]);
      if (status.status === 'fulfilled') setMachineStatus(status.value);
      if (summary.status === 'fulfilled') setMappingsSummary(summary.value);
      if (logs.status === 'fulfilled') setUnmapped(asList(logs.value));
    } finally { setLoadingBio(false); }
  }, []);

  useEffect(() => { loadDaily(date); }, [date, loadDaily]);
  useEffect(() => { if (tab === 'monthly') loadMonthly(month); }, [tab, month, loadMonthly]);
  useEffect(() => { loadRegs(); loadBio(); }, [loadRegs, loadBio]);

  const openEmployee = useCallback((id: string) => { if (id) router.push(`/hr/attendance/employee/${encodeURIComponent(id)}`); }, [router]);
  const refreshAll = useCallback(() => { loadDaily(date); loadBio(); loadRegs(); if (tab === 'monthly') loadMonthly(month); }, [date, month, tab, loadDaily, loadBio, loadRegs, loadMonthly]);

  const importMachineStaff = async () => {
    setImporting(true);
    try {
      const r: any = await api.hr.punchMachine.importMachineEmployees();
      if (r.success) { toast.success(r.message || 'Machine staff imported'); refreshAll(); } else toast.error(r.error || 'Import failed');
    } catch (e) { toast.error(errText(e, 'Error importing machine staff')); } finally { setImporting(false); }
  };

  const pendingRegs = useMemo(() => regs.filter((r) => (r.status || 'Pending') === 'Pending').length, [regs]);
  const mappedBy = currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Admin';

  const tabs: { id: Tab; label: string; icon: any; badge?: number; tone?: string }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'employees', label: 'All Employees', icon: Users, badge: daily.totalEmployees },
    { id: 'daily', label: 'Daily Attendance', icon: Clock },
    { id: 'monthly', label: 'Monthly Attendance', icon: CalendarDays },
    { id: 'regularizations', label: 'Regularizations', icon: FileText, badge: pendingRegs, tone: pendingRegs ? 'bg-amber-500 text-white' : '' },
    { id: 'unmapped', label: 'Unmapped Punches', icon: LinkIcon, badge: unmapped.length, tone: unmapped.length ? 'bg-rose-500 text-white' : '' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs print:hidden">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[color:var(--crm-text-primary)]">Employee Attendance</h1>
          <p className="text-sm text-[color:var(--crm-text-secondary)] mt-1">Daily punches, monthly sheets, corrections and biometric mapping — in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className={btn} onClick={refreshAll} aria-label="Refresh data"><RefreshCw className={`w-3.5 h-3.5 ${loadingDaily ? 'animate-spin' : ''}`} /> Refresh</button>
          {isAdmin && <button className={btnPrimary} onClick={() => setShowSync(true)}><Settings2 className="w-3.5 h-3.5" /> Sync &amp; machine</button>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-b border-[color:var(--crm-border-default)] pb-1 overflow-x-auto print:hidden" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${tab === t.id ? 'bg-amber-700 text-white shadow-xs' : 'text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)]'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${tab === t.id ? 'bg-white/25 text-white' : t.tone || 'bg-slate-200 text-slate-700'}`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {errDaily && tab !== 'monthly' && tab !== 'regularizations' && tab !== 'unmapped' && <ErrorBanner msg={errDaily} retry={() => loadDaily(date)} />}

      {tab === 'overview' && (
        <OverviewTab daily={daily} loading={loadingDaily} date={date} setDate={setDate} machineStatus={machineStatus} mappingsSummary={mappingsSummary}
          unmappedCount={unmapped.length} pendingRegs={pendingRegs}
          openDaily={(s) => { setDailyStatus(s); setTab('daily'); }} openTab={setTab} openEmployee={openEmployee} />
      )}
      {tab === 'employees' && (
        <EmployeesTab rows={daily.employees} loading={loadingDaily} date={date} isAdmin={isAdmin} importing={importing} onImport={importMachineStaff} openEmployee={openEmployee} />
      )}
      {tab === 'daily' && (
        <DailyTab daily={daily} loading={loadingDaily} date={date} setDate={setDate} statusFilter={dailyStatus} setStatusFilter={setDailyStatus}
          canApprove={canApprove} onChanged={() => { loadDaily(date); loadRegs(); }} openEmployee={openEmployee} />
      )}
      {tab === 'monthly' && (
        <>
          {errMonthly && <ErrorBanner msg={errMonthly} retry={() => loadMonthly(month)} />}
          <MonthlyTab data={monthly} loading={loadingMonthly} month={month} setMonth={setMonth} openEmployee={openEmployee} />
        </>
      )}
      {tab === 'regularizations' && (
        <RegularizationsTab rows={regs} loading={loadingRegs} canApprove={canApprove} onChanged={() => { loadRegs(); loadDaily(date); }} />
      )}
      {tab === 'unmapped' && (
        <UnmappedTab logs={unmapped} loading={loadingBio} employees={daily.employees} isAdmin={isAdmin} mappedBy={mappedBy} onChanged={() => { loadBio(); loadDaily(date); }} />
      )}

      {showSync && <SyncModal machineStatus={machineStatus} onClose={() => setShowSync(false)} onDone={refreshAll} />}
    </div>
  );
}
