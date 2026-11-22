'use client';

import React, { useMemo, useState } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, Printer, Pencil } from 'lucide-react';
import { api } from '../../../../lib/apiClient';
import { toast } from '../../../../context/ToastContext';
import {
  DailyData, DailyEmployeeRow, card, inputCls, btn, btnPrimary, thCls, StatusBadge, SortTh, useSorted, usePaged, Pager, CsvButton,
  downloadCsv, Loading, Modal, Field, fmtDate, shiftDay, localISO, errText,
} from './shared';

interface Props {
  daily: DailyData;
  loading: boolean;
  date: string;
  setDate: (d: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  canApprove: boolean;
  onChanged: () => void;
  openEmployee: (id: string) => void;
}

const KPI: { key: string; label: string; tone: string; count: (d: DailyData) => number }[] = [
  { key: 'ALL', label: 'All', tone: 'text-slate-700', count: (d) => d.totalEmployees },
  { key: 'Present', label: 'Present', tone: 'text-emerald-700', count: (d) => d.presentCount },
  { key: 'Late', label: 'Late', tone: 'text-amber-700', count: (d) => d.lateCount },
  { key: 'Absent', label: 'Absent', tone: 'text-rose-700', count: (d) => d.absentCount },
  { key: 'Half Day', label: 'Half day', tone: 'text-orange-700', count: (d) => d.halfDayCount },
  { key: 'On Leave', label: 'On leave', tone: 'text-blue-700', count: (d) => d.leaveCount },
  { key: 'Missing', label: 'Missing OUT', tone: 'text-purple-700', count: (d) => d.missingPunchCount },
];

export default function DailyTab({ daily, loading, date, setDate, statusFilter, setStatusFilter, canApprove, onChanged, openEmployee }: Props) {
  const today = localISO();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('ALL');
  const [fix, setFix] = useState<DailyEmployeeRow | null>(null);

  const depts = useMemo(() => Array.from(new Set(daily.employees.map((e) => e.department).filter(Boolean))).sort(), [daily.employees]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return daily.employees.filter((e) => {
      if (s && ![e.employeeName, e.employeeId, e.department, e.machineEmpCode].some((x) => (x || '').toLowerCase().includes(s))) return false;
      if (dept !== 'ALL' && e.department !== dept) return false;
      switch (statusFilter) {
        case 'ALL': return true;
        case 'Present': return e.status === 'Present' || e.status === 'Late';
        case 'Late': return e.status === 'Late' || e.lateMinutes > 0;
        case 'Missing': return e.isMissingPunch;
        case 'On Leave': return e.status.includes('Leave');
        default: return e.status === statusFilter;
      }
    });
  }, [daily.employees, q, dept, statusFilter]);

  const { sorted, sortKey, sortDir, toggle } = useSorted(filtered, {
    name: (r) => r.employeeName, in: (r) => r.firstIn || 'zz', out: (r) => r.lastOut || 'zz', hours: (r) => r.totalHours, late: (r) => r.lateMinutes, status: (r) => r.status,
  }, 'name');
  const paged = usePaged(sorted, `${q}|${dept}|${statusFilter}|${sortKey}|${sortDir}|${date}`);

  const exportCsv = () => downloadCsv(`daily-attendance-${date}.csv`, [
    ['Employee ID', 'Name', 'Department', 'Machine code', 'First IN', 'Last OUT', 'Punches', 'Hours', 'Late (min)', 'Status', 'Missing OUT', 'Source', 'Remarks'],
    ...sorted.map((e) => [e.employeeId, e.employeeName, e.department, e.machineEmpCode, e.firstIn, e.lastOut, e.punchCount, e.totalHours, e.lateMinutes, e.status, e.isMissingPunch ? 'Yes' : '', e.source, e.remarks]),
  ]);

  return (
    <div className="space-y-4">
      <div className={`${card} p-3 flex flex-wrap items-center gap-2 print:hidden`}>
        <button className={btn} onClick={() => setDate(shiftDay(date, -1))} aria-label="Previous day"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} className={inputCls} aria-label="Date" />
        <button className={btn} onClick={() => setDate(shiftDay(date, 1))} disabled={date >= today} aria-label="Next day"><ChevronRight className="w-3.5 h-3.5" /></button>
        {date !== today && <button className={btn} onClick={() => setDate(today)}>Today</button>}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search staff…" className={`${inputCls} pl-8 w-48`} aria-label="Search staff" />
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className={inputCls} aria-label="Department"><option value="ALL">All departments</option>{depts.map((d) => <option key={d}>{d}</option>)}</select>
        <div className="ml-auto flex items-center gap-2">
          <CsvButton onClick={exportCsv} disabled={!sorted.length} />
          <button className={btn} onClick={() => window.print()}><Printer className="w-3.5 h-3.5" /> Print</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden" role="tablist" aria-label="Filter by status">
        {KPI.map((k) => {
          const on = statusFilter === k.key;
          return (
            <button key={k.key} role="tab" aria-selected={on} onClick={() => setStatusFilter(k.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition ${on ? 'bg-slate-900 text-white border-slate-900' : `bg-white border-slate-200 hover:bg-slate-50 ${k.tone}`}`}>
              {k.label} <span className="font-mono">{k.count(daily)}</span>
            </button>
          );
        })}
        <span className="ml-auto text-xs font-bold text-slate-600 self-center">{fmtDate(date)}</span>
      </div>

      <div className={`${card} overflow-hidden`}>
        {loading && daily.employees.length === 0 ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-xs">
              <thead className="bg-slate-50 border-b border-[color:var(--crm-border-default)]">
                <tr>
                  <SortTh label="Employee" k="name" {...{ sortKey, sortDir, toggle }} />
                  <th className={thCls}>Machine</th>
                  <SortTh label="First IN" k="in" {...{ sortKey, sortDir, toggle }} />
                  <SortTh label="Last OUT" k="out" {...{ sortKey, sortDir, toggle }} />
                  <th className={thCls}>Punches</th>
                  <SortTh label="Hours" k="hours" {...{ sortKey, sortDir, toggle }} />
                  <SortTh label="Late" k="late" {...{ sortKey, sortDir, toggle }} />
                  <SortTh label="Status" k="status" {...{ sortKey, sortDir, toggle }} />
                  <th className={thCls}>Flags</th>
                  <th className={`${thCls} text-right print:hidden`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                {paged.slice.length === 0 ? (
                  <tr><td colSpan={10} className="py-12 text-center text-slate-400">No employees match for {fmtDate(date)}.</td></tr>
                ) : paged.slice.map((e) => (
                  <tr key={e.employeeId} onClick={() => openEmployee(e.employeeId)} className="hover:bg-amber-50/40 cursor-pointer transition">
                    <td className="py-3 px-4"><div className="font-bold text-slate-900">{e.employeeName}</div><div className="text-[11px] text-slate-400 font-mono">{e.employeeId} • {e.department || 'General'}</div></td>
                    <td className="py-3 px-4"><span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{e.machineEmpCode || 'Unmapped'}</span></td>
                    <td className={`py-3 px-4 font-mono font-bold ${e.firstIn ? 'text-slate-800' : 'text-slate-300'}`}>{e.firstIn || '--:--'}</td>
                    <td className={`py-3 px-4 font-mono font-bold ${e.lastOut ? 'text-slate-800' : 'text-slate-300'}`}>{e.lastOut || '--:--'}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{e.punchCount}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{e.totalHours > 0 ? `${e.totalHours} h` : '--'}</td>
                    <td className="py-3 px-4">{e.lateMinutes > 0 ? <span className="text-amber-700 font-bold">{e.lateMinutes} min</span> : <span className="text-slate-300">--</span>}</td>
                    <td className="py-3 px-4"><StatusBadge status={e.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {e.isMissingPunch && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Missing OUT</span>}
                        {e.isManuallyApproved && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Corrected</span>}
                        {!e.isMissingPunch && !e.isManuallyApproved && <span className="text-slate-300">--</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap print:hidden">
                      <button className={btn} title="Correct this day's attendance" onClick={(ev) => { ev.stopPropagation(); setFix(e); }}><Pencil className="w-3.5 h-3.5" /> {canApprove ? 'Correct' : 'Request'}</button>{' '}
                      <button className={btn} onClick={(ev) => { ev.stopPropagation(); openEmployee(e.employeeId); }}><Eye className="w-3.5 h-3.5" /> Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="print:hidden"><Pager p={paged} /></div>
      </div>

      {fix && <CorrectionModal row={fix} date={date} canApprove={canApprove} onClose={() => setFix(null)} onDone={() => { setFix(null); onChanged(); }} />}
    </div>
  );
}

function CorrectionModal({ row, date, canApprove, onClose, onDone }: { row: DailyEmployeeRow; date: string; canApprove: boolean; onClose: () => void; onDone: () => void }) {
  const [status, setStatus] = useState(row.status === 'Absent' ? 'Present' : row.status);
  const [cin, setCin] = useState(row.firstIn || '');
  const [cout, setCout] = useState(row.lastOut || '');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) return toast.error('Please enter a reason (at least 5 characters)');
    if (cin && cout && cout <= cin) return toast.error('OUT time must be after IN time');
    setBusy(true);
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const id = `REG-${stamp}-${Math.floor(Math.random() * 900 + 100)}`;
    try {
      await api.hr.regularization.create({
        id, regularization_no: id, employee_id: row.employeeId, employee_name: row.employeeName, date,
        original_status: row.status, requested_status: status, original_check_in: row.firstIn || '', original_check_out: row.lastOut || '',
        corrected_check_in: cin, corrected_check_out: cout, reason: reason.trim(), status: 'Pending',
      });
      if (canApprove) {
        try { await api.hr.regularization.approve(id); toast.success(`Attendance corrected for ${row.employeeName}`); }
        catch (err) { toast.warning(`Request saved as Pending — approval failed: ${errText(err)}`); }
      } else toast.success('Correction request submitted for approval');
      onDone();
    } catch (err) { toast.error(errText(err, 'Could not save the correction')); } finally { setBusy(false); }
  };

  return (
    <Modal title={`${canApprove ? 'Correct' : 'Request correction for'} attendance — ${row.employeeName}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-slate-500">{fmtDate(date)} · currently <b>{row.status}</b>{row.firstIn ? ` (IN ${row.firstIn}${row.lastOut ? `, OUT ${row.lastOut}` : ''})` : ''}</p>
        <Field label="Correct status">
          <select className={`${inputCls} w-full`} value={status} onChange={(e) => setStatus(e.target.value)}>
            {['Present', 'Late', 'Half Day', 'Absent', 'On Leave'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="IN time"><input type="time" className={`${inputCls} w-full`} value={cin} onChange={(e) => setCin(e.target.value)} /></Field>
          <Field label="OUT time"><input type="time" className={`${inputCls} w-full`} value={cout} onChange={(e) => setCout(e.target.value)} /></Field>
        </div>
        <Field label="Reason *"><textarea rows={2} className={`${inputCls} w-full`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Forgot to punch OUT, machine offline" /></Field>
        <p className="text-[11px] text-slate-400">{canApprove ? 'Saved as an approved regularization, so the change is on record.' : 'This goes to HR/your manager for approval.'}</p>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btn} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Saving…' : canApprove ? 'Save & approve' : 'Submit request'}</button>
        </div>
      </form>
    </Modal>
  );
}
