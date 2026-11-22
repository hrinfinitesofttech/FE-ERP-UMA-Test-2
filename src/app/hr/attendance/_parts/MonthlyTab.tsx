'use client';

import React, { useMemo, useState } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, LayoutGrid, Table2, Printer } from 'lucide-react';
import {
  MonthlyData, card, inputCls, btn, thCls, MONTH_CODE_STYLE, SortTh, useSorted, usePaged, Pager, CsvButton, downloadCsv, Loading,
  fmtMonth, shiftMonth, localMonth,
} from './shared';

interface Props {
  data: MonthlyData;
  loading: boolean;
  month: string;
  setMonth: (m: string) => void;
  openEmployee: (id: string) => void;
}

const LEGEND: [string, string][] = [['P', 'Present'], ['L', 'Late'], ['HD', 'Half day'], ['LV', 'Leave'], ['A', 'Absent'], ['H', 'Holiday'], ['WO', 'Weekly off']];

export default function MonthlyTab({ data, loading, month, setMonth, openEmployee }: Props) {
  const nowMonth = localMonth();
  const [view, setView] = useState<'summary' | 'grid'>('summary');
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('ALL');

  const depts = useMemo(() => Array.from(new Set(data.employees.map((e) => e.department).filter(Boolean))).sort(), [data.employees]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.employees.filter((e) =>
      (!s || [e.employeeName, e.employeeId, e.department, e.machineEmpCode].some((x) => (x || '').toLowerCase().includes(s))) &&
      (dept === 'ALL' || e.department === dept));
  }, [data.employees, q, dept]);

  // totals shown in the KPI strip follow the current filter
  const totals = useMemo(() => filtered.reduce((a, e) => ({
    present: a.present + e.presentDays, late: a.late + e.lateDays, absent: a.absent + e.absentDays, half: a.half + e.halfDays, leave: a.leave + e.leaveDays,
  }), { present: 0, late: 0, absent: 0, half: 0, leave: 0 }), [filtered]);

  const { sorted, sortKey, sortDir, toggle } = useSorted(filtered, {
    name: (r) => r.employeeName, present: (r) => r.presentDays, late: (r) => r.lateDays, absent: (r) => r.absentDays, half: (r) => r.halfDays,
    leave: (r) => r.leaveDays, hours: (r) => r.totalHours, missing: (r) => r.missingPunches,
  }, 'name');
  const paged = usePaged(sorted, `${q}|${dept}|${month}|${view}|${sortKey}|${sortDir}`, view === 'grid' ? 25 : 25);

  const dates = useMemo(() => {
    const first = data.employees[0];
    if (first) return Object.keys(first.daysMap).sort();
    const [y, m] = month.split('-').map(Number);
    return Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
  }, [data.employees, month]);

  const exportCsv = () => {
    if (view === 'grid') {
      downloadCsv(`monthly-grid-${month}.csv`, [
        ['Employee ID', 'Name', 'Department', ...dates.map((d) => d.slice(8)), 'Present', 'Late', 'Absent', 'Half', 'Leave'],
        ...sorted.map((e) => [e.employeeId, e.employeeName, e.department, ...dates.map((d) => e.daysMap[d] || ''), e.presentDays, e.lateDays, e.absentDays, e.halfDays, e.leaveDays]),
      ]);
    } else {
      downloadCsv(`monthly-attendance-${month}.csv`, [
        ['Employee ID', 'Name', 'Department', 'Machine code', 'Present', 'Late', 'Absent', 'Half day', 'Leave', 'Weekly off', 'Holidays', 'Total hours', 'Missing OUT'],
        ...sorted.map((e) => [e.employeeId, e.employeeName, e.department, e.machineEmpCode, e.presentDays, e.lateDays, e.absentDays, e.halfDays, e.leaveDays, e.weeklyOffs, e.holidays, e.totalHours, e.missingPunches]),
      ]);
    }
  };

  const strip = [
    ['Present days', totals.present, 'bg-emerald-50/60 border-emerald-200 text-emerald-900'],
    ['Late marks', totals.late, 'bg-amber-50/60 border-amber-200 text-amber-900'],
    ['Absent days', totals.absent, 'bg-rose-50/60 border-rose-200 text-rose-900'],
    ['Half days', totals.half, 'bg-orange-50/60 border-orange-200 text-orange-900'],
    ['Leave days', totals.leave, 'bg-blue-50/60 border-blue-200 text-blue-900'],
  ] as const;

  return (
    <div className="space-y-4">
      <div className={`${card} p-3 flex flex-wrap items-center gap-2 print:hidden`}>
        <button className={btn} onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <input type="month" value={month} max={nowMonth} onChange={(e) => e.target.value && setMonth(e.target.value)} className={inputCls} aria-label="Month" />
        <button className={btn} onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= nowMonth} aria-label="Next month"><ChevronRight className="w-3.5 h-3.5" /></button>
        {month !== nowMonth && <button className={btn} onClick={() => setMonth(nowMonth)}>This month</button>}
        <span className="text-xs font-bold text-slate-700">{fmtMonth(month)}</span>
        <div className="relative ml-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search staff…" className={`${inputCls} pl-8 w-48`} aria-label="Search staff" />
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className={inputCls} aria-label="Department"><option value="ALL">All departments</option>{depts.map((d) => <option key={d}>{d}</option>)}</select>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-xl overflow-hidden border border-slate-200" role="group" aria-label="View">
            <button onClick={() => setView('summary')} className={`px-3 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${view === 'summary' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}><Table2 className="w-3.5 h-3.5" /> Summary</button>
            <button onClick={() => setView('grid')} className={`px-3 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${view === 'grid' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}><LayoutGrid className="w-3.5 h-3.5" /> Day grid</button>
          </div>
          <CsvButton onClick={exportCsv} disabled={!sorted.length} />
          <button className={btn} onClick={() => window.print()}><Printer className="w-3.5 h-3.5" /> Print</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {strip.map(([label, v, cls]) => (
          <div key={label} className={`p-3.5 rounded-xl border ${cls}`}>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">{label}</div>
            <div className="text-2xl font-black mt-0.5">{v}</div>
          </div>
        ))}
      </div>

      {view === 'grid' && (
        <div className="flex flex-wrap gap-2 text-[11px]">
          {LEGEND.map(([c, l]) => <span key={c} className="inline-flex items-center gap-1.5"><span className={`inline-block w-6 text-center rounded font-bold ${MONTH_CODE_STYLE[c]}`}>{c}</span>{l}</span>)}
        </div>
      )}

      <div className={`${card} overflow-hidden`}>
        {loading && data.employees.length === 0 ? <Loading /> : view === 'summary' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-xs">
              <thead className="bg-slate-50 border-b border-[color:var(--crm-border-default)]">
                <tr>
                  <SortTh label="Employee" k="name" {...{ sortKey, sortDir, toggle }} />
                  <th className={thCls}>Machine</th>
                  <SortTh label="Present" k="present" {...{ sortKey, sortDir, toggle }} className="text-emerald-700" />
                  <SortTh label="Late" k="late" {...{ sortKey, sortDir, toggle }} className="text-amber-700" />
                  <SortTh label="Absent" k="absent" {...{ sortKey, sortDir, toggle }} className="text-rose-700" />
                  <SortTh label="Half" k="half" {...{ sortKey, sortDir, toggle }} className="text-orange-700" />
                  <SortTh label="Leave" k="leave" {...{ sortKey, sortDir, toggle }} className="text-blue-700" />
                  <th className={thCls}>Off / Hol</th>
                  <SortTh label="Hours" k="hours" {...{ sortKey, sortDir, toggle }} />
                  <SortTh label="Missing OUT" k="missing" {...{ sortKey, sortDir, toggle }} className="text-purple-700" />
                  <th className={`${thCls} text-right print:hidden`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                {paged.slice.length === 0 ? (
                  <tr><td colSpan={11} className="py-12 text-center text-slate-400">No records for {fmtMonth(month)}.</td></tr>
                ) : paged.slice.map((e) => (
                  <tr key={e.employeeId} onClick={() => openEmployee(e.employeeId)} className="hover:bg-amber-50/40 cursor-pointer transition">
                    <td className="py-3 px-4"><div className="font-bold text-slate-900">{e.employeeName}</div><div className="text-[11px] text-slate-400 font-mono">{e.employeeId} • {e.department}</div></td>
                    <td className="py-3 px-4"><span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{e.machineEmpCode || '--'}</span></td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{e.presentDays}</td>
                    <td className="py-3 px-4 font-bold text-amber-700">{e.lateDays}</td>
                    <td className="py-3 px-4 font-bold text-rose-700">{e.absentDays}</td>
                    <td className="py-3 px-4 font-bold text-orange-700">{e.halfDays}</td>
                    <td className="py-3 px-4 font-bold text-blue-700">{e.leaveDays}</td>
                    <td className="py-3 px-4 text-slate-500">{e.weeklyOffs} / {e.holidays}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{e.totalHours > 0 ? `${e.totalHours} h` : '--'}</td>
                    <td className="py-3 px-4 font-bold text-purple-700">{e.missingPunches > 0 ? e.missingPunches : '--'}</td>
                    <td className="py-3 px-4 text-right print:hidden"><button className={btn} onClick={(ev) => { ev.stopPropagation(); openEmployee(e.employeeId); }}><Eye className="w-3.5 h-3.5" /> View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-[11px] border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 py-2 px-3 text-left font-bold uppercase text-slate-500 min-w-[190px] border-b border-r border-slate-200">Employee</th>
                  {dates.map((d) => {
                    const dt = new Date(`${d}T00:00:00`);
                    return <th key={d} className={`px-0.5 py-1 text-center font-bold border-b border-slate-200 min-w-[28px] ${dt.getDay() === 0 ? 'text-rose-500' : 'text-slate-500'}`}><div>{d.slice(8)}</div><div className="text-[9px] font-normal">{dt.toLocaleDateString('en-IN', { weekday: 'narrow' })}</div></th>;
                  })}
                  <th className="px-2 py-2 text-emerald-700 border-b border-l border-slate-200">P</th>
                  <th className="px-2 py-2 text-amber-700 border-b border-slate-200">L</th>
                  <th className="px-2 py-2 text-rose-700 border-b border-slate-200">A</th>
                </tr>
              </thead>
              <tbody>
                {paged.slice.length === 0 ? (
                  <tr><td colSpan={dates.length + 4} className="py-12 text-center text-slate-400">No records for {fmtMonth(month)}.</td></tr>
                ) : paged.slice.map((e) => (
                  <tr key={e.employeeId} className="hover:bg-amber-50/30">
                    <td className="sticky left-0 z-10 bg-white py-1.5 px-3 border-r border-b border-slate-100">
                      <button onClick={() => openEmployee(e.employeeId)} className="text-left cursor-pointer hover:underline"><div className="font-bold text-slate-900 text-xs truncate max-w-[170px]">{e.employeeName}</div><div className="text-[10px] text-slate-400">{e.department}</div></button>
                    </td>
                    {dates.map((d) => {
                      const c = e.daysMap[d] || '-';
                      return <td key={d} className="p-0.5 border-b border-slate-100 text-center"><span className={`block rounded py-1 font-bold ${MONTH_CODE_STYLE[c] || ''}`} title={`${d}: ${c}`}>{c === '-' ? '' : c}</span></td>;
                    })}
                    <td className="px-2 font-bold text-emerald-700 border-l border-b border-slate-100 text-center">{e.presentDays}</td>
                    <td className="px-2 font-bold text-amber-700 border-b border-slate-100 text-center">{e.lateDays}</td>
                    <td className="px-2 font-bold text-rose-700 border-b border-slate-100 text-center">{e.absentDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="print:hidden"><Pager p={paged} /></div>
      </div>
    </div>
  );
}
