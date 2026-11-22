'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/** Normalise list responses (plain array or DRF-paginated). */
export function asList<T = any>(r: any): T[] {
  if (Array.isArray(r)) return r;
  if (r && Array.isArray(r.results)) return r.results;
  return [];
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Last `count` months (including current), newest first. */
export function recentMonths(count = 12) {
  const out: { month: number; year: number; label: string; key: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
  }
  return out;
}

export function fmtDate(iso?: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return y && m && d ? `${d}-${m}-${y}` : iso;
}

export function errMsg(e: any, fallback = 'Something went wrong. Please try again.') {
  if (e?.data && typeof e.data === 'object') {
    const t = e.data.error || e.data.detail;
    if (t) return String(t);
    const parts = Object.entries(e.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
    if (parts.length) return parts.join(' | ');
  }
  return e?.message || fallback;
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl bg-white border border-[color:var(--crm-border-default)] shadow-crmSubtle', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, hint, right }: { title: string; hint?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[color:var(--crm-border-default)]">
      <div>
        <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)]">{title}</h3>
        {hint && <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

const TONES: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
};

export function Badge({ tone = 'slate', children }: { tone?: keyof typeof TONES | string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap', TONES[tone] || TONES.slate)}>
      {children}
    </span>
  );
}

export function statusTone(status: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('approved') || s === 'present' || s === 'paid' || s === 'processed') return 'green';
  if (s.includes('reject') || s === 'absent') return 'red';
  if (s.includes('pending') || s === 'late' || s === 'half day') return 'amber';
  if (s.includes('leave')) return 'purple';
  if (s === 'holiday' || s === 'weekly off') return 'blue';
  return 'slate';
}

export function Stat({ label, value, sub, tone = 'blue' }: { label: string; value: React.ReactNode; sub?: string; tone?: string }) {
  const accent: Record<string, string> = {
    blue: 'text-[color:var(--crm-brand-700)]',
    green: 'text-emerald-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
    purple: 'text-violet-600',
    slate: 'text-slate-700',
  };
  return (
    <Card className="px-4 py-3.5">
      <div className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--crm-text-tertiary)]">{label}</div>
      <div className={cn('mt-1 text-2xl font-extrabold', accent[tone] || accent.blue)}>{value}</div>
      {sub && <div className="text-[11px] text-[color:var(--crm-text-secondary)] mt-0.5">{sub}</div>}
    </Card>
  );
}

export function Notice({ kind, children }: { kind: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={cn('rounded-xl border px-3.5 py-2.5 text-xs font-medium', styles[kind])}>
      {children}
    </div>
  );
}

export const inputCls =
  'w-full h-10 px-3 rounded-xl border border-[color:var(--crm-border-strong)] bg-white text-sm text-[color:var(--crm-text-primary)] outline-none transition focus:border-[color:var(--crm-brand-600)] focus:ring-4 focus:ring-[color:var(--crm-brand-600)]/15 disabled:opacity-60';

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[color:var(--crm-brand-700)] hover:bg-[color:var(--crm-brand-800)] text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 h-9 px-3 rounded-xl border border-[color:var(--crm-border-strong)] bg-white hover:bg-[color:var(--crm-surface-subtle)] text-xs font-semibold text-[color:var(--crm-text-primary)] transition cursor-pointer';

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[color:var(--crm-text-primary)] mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-[color:var(--crm-text-tertiary)] mt-1">{hint}</span>}
    </label>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-10 text-center text-sm text-[color:var(--crm-text-tertiary)]">{children}</div>;
}
