'use client';

import React, { useMemo } from 'react';
import { Users, CheckCircle2, UserX, Clock, AlertTriangle, CalendarDays, AlertCircle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { DailyData, DailyEmployeeRow, card, btn, inputCls, fmtDate, shiftDay, localISO, Loading, StatusBadge } from './shared';

interface Props {
  daily: DailyData;
  loading: boolean;
  date: string;
  setDate: (d: string) => void;
  machineStatus: any;
  mappingsSummary: any;
  unmappedCount: number;
  pendingRegs: number;
  openDaily: (status: string) => void;
  openTab: (t: 'unmapped' | 'regularizations') => void;
  openEmployee: (id: string) => void;
}

const OFF = ['Weekly Off', 'Holiday'];
const NOT_EXPECTED = ['Weekly Off', 'Holiday', 'On Leave', 'Half Day Leave', 'Upcoming'];

function AttentionList({ title, tone, rows, onOpen, onAll, empty }: { title: string; tone: string; rows: DailyEmployeeRow[]; onOpen: (id: string) => void; onAll: () => void; empty: string }) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${tone}`}>{title} <span className="font-mono">({rows.length})</span></h3>
        {rows.length > 0 && <button onClick={onAll} className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer inline-flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></button>}
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.slice(0, 6).map((r) => (
            <li key={r.employeeId}>
              <button onClick={() => onOpen(r.employeeId)} className="w-full flex items-center justify-between gap-2 py-2 text-left cursor-pointer hover:bg-slate-50 rounded-lg px-1">
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-slate-800 truncate">{r.employeeName}</span>
                  <span className="block text-[11px] text-slate-400 truncate">{r.department || 'General'}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-600 shrink-0">
                  {r.lateMinutes > 0 ? `+${r.lateMinutes} min` : r.firstIn ? `IN ${r.firstIn}` : '--'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OverviewTab({ daily, loading, date, setDate, machineStatus, mappingsSummary, unmappedCount, pendingRegs, openDaily, openTab, openEmployee }: Props) {
  const today = localISO();
  const isOffDay = daily.employees.length > 0 && daily.employees.every((e) => OFF.includes(e.status));
  const offLabel = daily.employees.find((e) => OFF.includes(e.status))?.status;
  const expected = daily.employees.filter((e) => !NOT_EXPECTED.includes(e.status)).length;
  const attended = daily.presentCount + daily.halfDayCount;
  const pct = expected > 0 ? Math.round((attended / expected) * 100) : 0;

  const deptStats = useMemo(() => {
    const m: Record<string, { expected: number; present: number }> = {};
    daily.employees.forEach((e) => {
      if (NOT_EXPECTED.includes(e.status)) return;
      const d = e.department || 'General';
      (m[d] = m[d] || { expected: 0, present: 0 }).expected += 1;
      if (['Present', 'Late', 'Half Day'].includes(e.status)) m[d].present += 1;
    });
    return Object.entries(m).sort((a, b) => b[1].expected - a[1].expected);
  }, [daily.employees]);

  const absent = daily.employees.filter((e) => e.status === 'Absent');
  const late = daily.employees.filter((e) => e.lateMinutes > 0 || e.status === 'Late').sort((a, b) => b.lateMinutes - a.lateMinutes);
  const missing = daily.employees.filter((e) => e.isMissingPunch);

  const kpis = [
    { label: 'Active staff', value: daily.totalEmployees, icon: Users, cls: 'border-slate-200 text-slate-800', sub: 'In employee master', filter: 'ALL' },
    { label: 'Present', value: daily.presentCount, icon: CheckCircle2, cls: 'border-emerald-200 bg-emerald-50/40 text-emerald-800', sub: isOffDay ? offLabel : expected ? `${pct}% of ${expected} expected` : '—', filter: 'Present' },
    { label: 'Absent', value: daily.absentCount, icon: UserX, cls: 'border-rose-200 bg-rose-50/40 text-rose-800', sub: 'No punch, no leave', filter: 'Absent' },
    { label: 'Late', value: daily.lateCount, icon: Clock, cls: 'border-amber-200 bg-amber-50/40 text-amber-800', sub: 'After shift grace', filter: 'Late' },
    { label: 'Half day', value: daily.halfDayCount, icon: AlertTriangle, cls: 'border-orange-200 bg-orange-50/40 text-orange-800', sub: 'Short working hours', filter: 'Half Day' },
    { label: 'On leave', value: daily.leaveCount, icon: CalendarDays, cls: 'border-blue-200 bg-blue-50/40 text-blue-800', sub: 'Approved leave', filter: 'On Leave' },
    { label: 'Missing OUT', value: daily.missingPunchCount, icon: AlertCircle, cls: 'border-purple-200 bg-purple-50/40 text-purple-800', sub: 'Single punch only', filter: 'Missing' },
  ];

  const lastSync = machineStatus?.last_sync_time ? new Date(machineStatus.last_sync_time).toLocaleString('en-IN') : null;
  const mapped = mappingsSummary?.mappedEmployees;
  const totalActive = mappingsSummary?.totalActiveEmployees;

  return (
    <div className="space-y-5">
      <div className={`${card} p-3 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <button className={btn} onClick={() => setDate(shiftDay(date, -1))} aria-label="Previous day"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} className={inputCls} aria-label="Date" />
          <button className={btn} onClick={() => setDate(shiftDay(date, 1))} disabled={date >= today} aria-label="Next day"><ChevronRight className="w-3.5 h-3.5" /></button>
          {date !== today && <button className={btn} onClick={() => setDate(today)}>Today</button>}
          <span className="text-xs font-bold text-slate-700 ml-1">{fmtDate(date)}</span>
          {isOffDay && <StatusBadge status={offLabel || 'Weekly Off'} />}
        </div>
        <div className="text-xs text-slate-500">
          Last biometric sync: <b className="text-slate-800">{lastSync || 'Not synced yet'}</b>
        </div>
      </div>

      {loading && daily.employees.length === 0 ? <Loading /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {kpis.map((k) => (
              <button key={k.label} onClick={() => openDaily(k.filter)} className={`text-left p-4 rounded-2xl border bg-white shadow-xs hover:shadow-md transition cursor-pointer ${k.cls}`}>
                <div className="flex items-center justify-between opacity-80 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{k.label}</span>
                  <k.icon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black">{k.value}</div>
                <div className="text-[11px] opacity-70 mt-0.5 truncate">{k.sub}</div>
              </button>
            ))}
          </div>

          {(pendingRegs > 0 || unmappedCount > 0) && (
            <div className="flex flex-wrap gap-3">
              {pendingRegs > 0 && (
                <button onClick={() => openTab('regularizations')} className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold cursor-pointer flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {pendingRegs} regularization request{pendingRegs > 1 ? 's' : ''} waiting for approval <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {unmappedCount > 0 && (
                <button onClick={() => openTab('unmapped')} className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold cursor-pointer flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {unmappedCount} punch log{unmappedCount > 1 ? 's' : ''} not mapped to an employee <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <AttentionList title="Absent" tone="text-rose-700" rows={absent} onOpen={openEmployee} onAll={() => openDaily('Absent')} empty={isOffDay ? `${offLabel} — nobody is expected` : 'Nobody is absent'} />
            <AttentionList title="Late arrivals" tone="text-amber-700" rows={late} onOpen={openEmployee} onAll={() => openDaily('Late')} empty="No late arrivals" />
            <AttentionList title="Missing OUT punch" tone="text-purple-700" rows={missing} onOpen={openEmployee} onAll={() => openDaily('Missing')} empty="No missing punches" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className={`${card} p-5 lg:col-span-2`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Department-wise attendance</h3>
                <span className="text-[11px] text-slate-400">Weekly off, holiday and leave are not counted as expected</span>
              </div>
              {deptStats.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">{isOffDay ? `${offLabel} — no attendance expected.` : 'No data for this date.'}</p>
              ) : (
                <div className="space-y-3.5">
                  {deptStats.map(([dept, s]) => {
                    const p = Math.round((s.present / s.expected) * 100);
                    return (
                      <div key={dept}>
                        <div className="flex justify-between text-xs mb-1"><span className="font-bold text-slate-800">{dept}</span><span className="text-slate-500">{s.present} / {s.expected} ({p}%)</span></div>
                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${p}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`${card} p-5`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Biometric machine</h3>
              <dl className="space-y-2 text-xs">
                {[
                  ['Connection', machineStatus ? (machineStatus.configured === false ? 'Not configured' : 'Configured') : 'Unknown', machineStatus?.configured === false ? 'text-rose-600' : 'text-emerald-700'],
                  ['Last sync', lastSync || 'Never', 'text-slate-800'],
                  ['Raw punch logs', machineStatus?.total_logs ?? '—', 'text-slate-800'],
                  ['Mapped staff', mapped !== undefined && totalActive !== undefined ? `${mapped} / ${totalActive}` : '—', 'text-slate-800'],
                  ['Unmapped punches', `${unmappedCount} pending`, unmappedCount ? 'text-rose-600' : 'text-emerald-700'],
                ].map(([k, v, c]) => (
                  <div key={String(k)} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <dt className="text-slate-500">{k}</dt><dd className={`font-bold ${c}`}>{String(v)}</dd>
                  </div>
                ))}
              </dl>
              <button onClick={() => openDaily('ALL')} className="mt-4 w-full py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-800 text-white cursor-pointer">Open full daily sheet</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
