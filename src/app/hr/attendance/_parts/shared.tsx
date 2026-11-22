'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Loader2, AlertCircle, Download } from 'lucide-react';

/* ----------------------------- types ----------------------------- */
export interface DailyEmployeeRow {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  username: string;
  department: string;
  designation: string;
  email: string;
  mobile: string;
  isActive: boolean;
  machineEmpCode: string;
  date: string;
  status: string;
  firstIn: string;
  lastOut: string;
  punchCount: number;
  totalHours: number;
  lateMinutes: number;
  isMissingPunch: boolean;
  isManuallyApproved: boolean;
  source: string;
  remarks: string;
  attendanceRecordId?: string | null;
}
export interface DailyData {
  date: string;
  totalEmployees: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  halfDayCount: number;
  leaveCount: number;
  missingPunchCount: number;
  employees: DailyEmployeeRow[];
}
export interface MonthlyEmployeeRow {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  machineEmpCode: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  weeklyOffs: number;
  holidays: number;
  totalHours: number;
  missingPunches: number;
  daysMap: Record<string, string>;
}
export interface MonthlyData {
  monthYear: string;
  month: number;
  year: number;
  totalDays: number;
  totalEmployees: number;
  summary: { totalPresent: number; totalAbsent: number; totalLate: number; totalHalfDay: number };
  employees: MonthlyEmployeeRow[];
}

/* ----------------------------- dates ----------------------------- */
const pad = (n: number) => String(n).padStart(2, '0');
/** Local calendar date (NOT toISOString, which is UTC and shows yesterday early morning in India). */
export const localISO = (d: Date = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const localMonth = (d: Date = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const shiftDay = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return localISO(new Date(y, m - 1, d + n));
};
export const shiftMonth = (ym: string, n: number) => {
  const [y, m] = ym.split('-').map(Number);
  return localMonth(new Date(y, m - 1 + n, 1));
};
export const fmtDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};
export const fmtMonth = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

/* ----------------------------- styling ----------------------------- */
export const STATUS_STYLE: Record<string, string> = {
  Present: 'bg-emerald-100 text-emerald-800',
  Late: 'bg-amber-100 text-amber-800',
  'Half Day': 'bg-orange-100 text-orange-800',
  'On Leave': 'bg-blue-100 text-blue-800',
  'Half Day Leave': 'bg-blue-100 text-blue-800',
  Upcoming: 'bg-slate-50 text-slate-400',
  Holiday: 'bg-indigo-100 text-indigo-800',
  'Weekly Off': 'bg-slate-100 text-slate-600',
  Absent: 'bg-rose-100 text-rose-800',
};
export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${STATUS_STYLE[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>
);

export const MONTH_CODE_STYLE: Record<string, string> = {
  P: 'bg-emerald-100 text-emerald-800',
  L: 'bg-amber-100 text-amber-800',
  HD: 'bg-orange-100 text-orange-800',
  LV: 'bg-blue-100 text-blue-800',
  A: 'bg-rose-100 text-rose-800',
  H: 'bg-indigo-100 text-indigo-800',
  WO: 'bg-slate-100 text-slate-500',
  '-': 'bg-white text-slate-300',
};

export const card = 'bg-white rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs';
export const inputCls =
  'px-3 py-2 text-xs font-medium rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/20';
export const btn = 'px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50';
export const btnPrimary = 'px-4 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-800 text-white transition cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50';
export const thCls = 'py-3 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap';

/* ----------------------------- table helpers ----------------------------- */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="py-14 flex items-center justify-center gap-2 text-xs text-slate-500">
      <Loader2 className="w-4 h-4 animate-spin" /> {label}
    </div>
  );
}
export function ErrorBanner({ msg, retry }: { msg: string; retry?: () => void }) {
  return (
    <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
      <AlertCircle className="w-4 h-4 shrink-0" /> <span className="flex-1">{msg}</span>
      {retry && <button onClick={retry} className="underline font-bold cursor-pointer">Retry</button>}
    </div>
  );
}

export type SortDir = 'asc' | 'desc';
export function useSorted<T>(items: T[], getters: Record<string, (r: T) => string | number>, initialKey = '', initialDir: SortDir = 'asc') {
  const [key, setKey] = useState(initialKey);
  const [dir, setDir] = useState<SortDir>(initialDir);
  const sorted = useMemo(() => {
    const g = getters[key];
    if (!g) return items;
    const out = [...items].sort((a, b) => {
      const x = g(a), y = g(b);
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' });
      return dir === 'asc' ? c : -c;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, key, dir]);
  const toggle = (k: string) => {
    if (k === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setKey(k); setDir('asc'); }
  };
  return { sorted, sortKey: key, sortDir: dir, toggle };
}

export function SortTh({ label, k, sortKey, sortDir, toggle, className = '' }: { label: string; k: string; sortKey: string; sortDir: SortDir; toggle: (k: string) => void; className?: string }) {
  const active = sortKey === k;
  return (
    <th className={`${thCls} ${className}`} aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button onClick={() => toggle(k)} className="inline-flex items-center gap-1 uppercase font-bold tracking-wider cursor-pointer hover:text-slate-800">
        {label}
        {active ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <span className="w-3" />}
      </button>
    </th>
  );
}

export function usePaged<T>(items: T[], resetKey: string, initialSize = 25) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(initialSize);
  const lastKey = React.useRef(resetKey);
  if (lastKey.current !== resetKey) { lastKey.current = resetKey; if (page !== 1) setPage(1); }
  const pages = Math.max(1, Math.ceil(items.length / size));
  const cur = Math.min(page, pages);
  const slice = useMemo(() => items.slice((cur - 1) * size, cur * size), [items, cur, size]);
  return { slice, page: cur, pages, size, setPage, setSize, total: items.length };
}

export function Pager({ p }: { p: { page: number; pages: number; size: number; total: number; setPage: (n: number) => void; setSize: (n: number) => void } }) {
  if (p.total === 0) return null;
  const from = (p.page - 1) * p.size + 1;
  const to = Math.min(p.total, p.page * p.size);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-[color:var(--crm-border-default)] text-xs text-slate-600">
      <span>Showing <b>{from}–{to}</b> of <b>{p.total}</b></span>
      <div className="flex items-center gap-2">
        <select value={p.size} onChange={(e) => { p.setSize(Number(e.target.value)); p.setPage(1); }} className={inputCls} aria-label="Rows per page">
          {[25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button className={btn} disabled={p.page <= 1} onClick={() => p.setPage(p.page - 1)} aria-label="Previous page"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <span>Page {p.page} / {p.pages}</span>
        <button className={btn} disabled={p.page >= p.pages} onClick={() => p.setPage(p.page + 1)} aria-label="Next page"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const esc = (v: any) => { const s = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
export const CsvButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
  <button className={btn} onClick={onClick} disabled={disabled}><Download className="w-3.5 h-3.5" /> Export CSV</button>
);

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto p-5`} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block text-xs"><span className="block mb-1 font-bold text-slate-600">{label}</span>{children}</label>
);

export const errText = (e: any, fallback = 'Something went wrong') =>
  e?.data?.error || e?.data?.detail || (typeof e?.data === 'string' ? e.data : '') || e?.message || fallback;
