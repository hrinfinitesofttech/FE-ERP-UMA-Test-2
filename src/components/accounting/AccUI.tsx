'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Printer, Download, Loader2, AlertTriangle } from 'lucide-react';
import { fyOptions } from '../../lib/accountsApi';

export const card = 'bg-white rounded-2xl border border-[color:var(--crm-border-default)]';
export const inputCls =
  'w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30';
export const btnPrimary =
  'px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5';
export const btnGhost =
  'px-3 py-2 rounded-xl border border-[color:var(--crm-border-default)] bg-white hover:bg-[color:var(--crm-surface-subtle)] text-xs font-semibold text-[color:var(--crm-text-primary)] transition cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50';
export const th = 'px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-[color:var(--crm-text-secondary)]';
export const td = 'px-3 py-2 text-xs text-[color:var(--crm-text-primary)]';
export const num = 'text-right font-mono tabular-nums';

export function PageHeader({
  icon, title, subtitle, children,
}: { icon: React.ReactNode; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className={`${card} p-5 flex flex-wrap items-center justify-between gap-3 print:border-0`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-700 print:hidden">{icon}</div>
        <div>
          <h1 className="text-lg font-bold text-[color:var(--crm-text-primary)]">{title}</h1>
          {subtitle && <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 print:hidden">{children}</div>
    </div>
  );
}

export function FYSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} !w-auto`} aria-label="Financial year">
      {fyOptions().map((f) => (
        <option key={f} value={f}>F.Y. {f}</option>
      ))}
    </select>
  );
}

export function PrintBtn() {
  return (
    <button className={btnGhost} onClick={() => window.print()}>
      <Printer className="w-3.5 h-3.5" /> Print
    </button>
  );
}
export function CsvBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className={btnGhost} onClick={onClick}>
      <Download className="w-3.5 h-3.5" /> Export CSV
    </button>
  );
}

export function Loading() {
  return (
    <div className="p-10 flex items-center justify-center text-xs text-[color:var(--crm-text-secondary)] gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
    </div>
  );
}
export function ErrorBox({ msg, retry }: { msg: string; retry?: () => void }) {
  return (
    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
      <AlertTriangle className="w-4 h-4" /> {msg}
      {retry && <button onClick={retry} className="ml-auto underline cursor-pointer">Retry</button>}
    </div>
  );
}

/** Fetch helper with loading/error/reload. */
export function useAsync<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const run = useCallback(() => {
    setLoading(true);
    setError('');
    fn()
      .then((d) => setData(d))
      .catch((e: any) => setError(e?.data?.error || e?.data?.detail || e?.message || 'Failed to load'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { run(); }, [run]);
  return { data, loading, error, reload: run, setData };
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] overflow-auto p-5`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)]">{title}</h3>
          <button onClick={onClose} className="text-xs text-[color:var(--crm-text-secondary)] cursor-pointer" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <span className="block mb-1 text-[color:var(--crm-text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

export function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'good' | 'bad' | 'neutral' }) {
  const c = tone === 'good' ? 'text-emerald-700' : tone === 'bad' ? 'text-red-600' : 'text-[color:var(--crm-text-primary)]';
  return (
    <div className={`${card} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--crm-text-secondary)]">{label}</div>
      <div className={`text-lg font-bold mt-1 font-mono ${c}`}>{value}</div>
    </div>
  );
}

export const CompanyHeader = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="text-center py-3 border-b border-[color:var(--crm-border-default)]">
    <div className="text-sm font-extrabold tracking-wide">UMA TECHNO FAB</div>
    <div className="text-[10px] text-[color:var(--crm-text-secondary)]">
      S.No. 1040/3, Near Sandvik Tube, Kalol-Mehsana Highway, Rajpur, Ta. Kadi, Dist. Mehsana, Gujarat - 382715
    </div>
    <div className="text-xs font-bold mt-1">{title}</div>
    {sub && <div className="text-[10px] text-[color:var(--crm-text-secondary)]">{sub}</div>}
  </div>
);

const TONE: Record<string, string> = { Pending: 'bg-amber-100 text-amber-800', Approved: 'bg-blue-100 text-blue-800', Paid: 'bg-emerald-100 text-emerald-800', Rejected: 'bg-red-100 text-red-700' };
export const StatusPill = ({ s }: { s: string }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TONE[s] || 'bg-slate-100'}`}>{s}</span>
);
