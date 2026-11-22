'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useERP } from '@/context/ERPContext';
import api from '@/lib/apiClient';
import { Badge, Card, CardHeader, Empty, Notice, Stat, asList, errMsg, fmtDate, inputCls, recentMonths, statusTone } from '@/components/my/ui';

type Row = {
  date: string;
  day: string;
  status: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  punches: number;
  lateMin: number;
  otHours: number;
  note: string;
};

const FILTERS = ['All', 'Present', 'Late', 'Absent', 'Leave', 'Holiday / Off'] as const;

export default function MyAttendancePage() {
  const { currentUser } = useERP();
  const empId = currentUser?.id as string | undefined;
  const months = useMemo(() => recentMonths(12), []);
  const [monthKey, setMonthKey] = useState(months[0].key);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sel = months.find((m) => m.key === monthKey) || months[0];

  useEffect(() => {
    if (!empId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      api.get(`/attendance-records/monthly-summary/?employee_id=${encodeURIComponent(empId)}&month=${sel.month}&year=${sel.year}`),
      api.get(`/attendance-records/?employee_id=${encodeURIComponent(empId)}`),
    ])
      .then(([s, list]) => {
        if (cancelled) return;
        setSummary(s);
        setRecords(asList(list));
      })
      .catch((e) => !cancelled && setError(errMsg(e, 'Could not load attendance.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [empId, sel.month, sel.year]);

  const rows: Row[] = useMemo(() => {
    const byDate = new Map<string, any>();
    records.forEach((r) => byDate.set(String(r.date).slice(0, 10), r));
    return (summary?.calendar || []).map((d: any) => {
      const r = byDate.get(d.date);
      return {
        date: d.date,
        day: d.day,
        status: d.status,
        checkIn: r?.firstIn || r?.checkIn || d.checkIn || '',
        checkOut: r?.lastOut || r?.checkOut || d.checkOut || '',
        hours: Number(r?.totalHours ?? d.totalHours ?? 0),
        punches: Number(r?.punchCount ?? 0),
        lateMin: Number(r?.lateMinutes ?? 0),
        otHours: Number(r?.overtimeHours ?? 0),
        note: d.holidayName || r?.remarks || '',
      };
    });
  }, [summary, records]);

  const filtered = rows.filter((r) => {
    if (filter === 'All') return true;
    if (filter === 'Present') return r.status === 'Present' || r.status === 'Late';
    if (filter === 'Late') return r.status === 'Late' || r.lateMin > 0;
    if (filter === 'Absent') return r.status === 'Absent';
    if (filter === 'Leave') return r.status.includes('Leave');
    return r.status === 'Holiday' || r.status === 'Weekly Off';
  });

  const totalOt = rows.reduce((a, r) => a + r.otHours, 0);
  const missingOut = rows.filter((r) => r.checkIn && !r.checkOut && r.date < new Date().toISOString().slice(0, 10)).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div className="w-full sm:w-64">
          <label htmlFor="att-month" className="block text-xs font-semibold mb-1">Month</label>
          <select id="att-month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} className={inputCls}>
            {months.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter days">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`h-8 px-3 rounded-full text-xs font-semibold border transition cursor-pointer ${
                filter === f
                  ? 'bg-[color:var(--crm-brand-700)] text-white border-transparent'
                  : 'bg-white text-[#4B5876] border-[color:var(--crm-border-default)] hover:bg-[color:var(--crm-surface-subtle)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Stat label="Present" value={summary?.presentDays ?? '—'} tone="green" sub={`of ${summary?.workingDays ?? '—'} working days`} />
        <Stat label="Absent" value={summary?.absentDays ?? '—'} tone="red" />
        <Stat label="Late" value={summary?.lateDays ?? '—'} tone="amber" />
        <Stat label="Leave" value={summary?.leaveDays ?? '—'} tone="purple" />
        <Stat label="Holidays / Off" value={summary ? (summary.holidays ?? 0) + (summary.weeklyOffs ?? 0) : '—'} tone="blue" />
        <Stat label="Hours Worked" value={summary?.totalHours ?? '—'} tone="slate" />
        <Stat label="Overtime (hrs)" value={loading ? '—' : totalOt.toFixed(2)} tone="amber" />
      </div>

      {missingOut > 0 && (
        <Notice kind="info">
          {missingOut} day(s) this month have a check-in but no check-out. You can fix them from the <strong>Missed Punch</strong> tab.
        </Notice>
      )}

      <Card>
        <CardHeader title={`Daily Punch Details — ${sel.label}`} hint="First IN, last OUT and total hours for each day" />
        {loading ? (
          <Empty>Loading attendance…</Empty>
        ) : filtered.length === 0 ? (
          <Empty>No days match this filter.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-[color:var(--crm-text-tertiary)] bg-[color:var(--crm-surface-subtle)]">
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Day</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">In</th>
                  <th className="px-4 py-2.5">Out</th>
                  <th className="px-4 py-2.5 text-right">Hours</th>
                  <th className="px-4 py-2.5 text-right">Punches</th>
                  <th className="px-4 py-2.5 text-right">Late (min)</th>
                  <th className="px-4 py-2.5 text-right">OT (hrs)</th>
                  <th className="px-4 py-2.5">Note</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const off = r.status === 'Weekly Off' || r.status === 'Holiday' || r.status === 'Upcoming';
                  return (
                    <tr key={r.date} className={`border-t border-[color:var(--crm-border-default)] ${off ? 'bg-slate-50/60 text-[color:var(--crm-text-tertiary)]' : ''}`}>
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap">{fmtDate(r.date)}</td>
                      <td className="px-4 py-2.5">{r.day}</td>
                      <td className="px-4 py-2.5"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                      <td className="px-4 py-2.5 font-mono">{r.checkIn || '—'}</td>
                      <td className="px-4 py-2.5 font-mono">
                        {r.checkOut || (r.checkIn ? <span className="text-amber-600 font-semibold">Missing</span> : '—')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">{r.hours ? r.hours.toFixed(2) : '—'}</td>
                      <td className="px-4 py-2.5 text-right">{r.punches || '—'}</td>
                      <td className="px-4 py-2.5 text-right">{r.lateMin || '—'}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{r.otHours ? r.otHours.toFixed(2) : '—'}</td>
                      <td className="px-4 py-2.5 max-w-[220px] truncate" title={r.note}>{r.note || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
