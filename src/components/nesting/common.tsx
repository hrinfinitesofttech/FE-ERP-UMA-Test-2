'use client';

import React from 'react';
import { API_BASE_URL } from '../../lib/apiClient';

/** Nesting job / hand-over status -> label + colour. */
export const JOB_STATUS: Record<string, { label: string; cls: string }> = {
  received: { label: 'Received from Design', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_nesting: { label: 'Nesting In Progress', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  cutting: { label: 'Cutting In Progress', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Cutting Completed', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  handed_over: { label: 'With Production', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  rework: { label: 'Rework / Rejected', cls: 'bg-red-50 text-red-700 border-red-300' },
  closed: { label: 'Accepted by Production', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export const HANDOVER_STATUS: Record<string, { label: string; cls: string }> = {
  handed_over: { label: 'Awaiting Production', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-300' },
  rework_required: { label: 'Rework Required', cls: 'bg-orange-50 text-orange-700 border-orange-300' },
};

export function Badge({ map, value }: { map: Record<string, { label: string; cls: string }>; value: string }) {
  const m = map[value] || { label: value || '-', cls: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-semibold whitespace-nowrap ${m.cls}`}>
      {m.label}
    </span>
  );
}

export function ProgressBar({ value, tone = 'brand' }: { value: number; tone?: 'brand' | 'green' | 'red' }) {
  const color = tone === 'green' ? 'bg-emerald-500' : tone === 'red' ? 'bg-red-500' : 'bg-crm-brand-700';
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} />
    </div>
  );
}

export const fmtKg = (n: any) => `${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg`;
export const fmtMoney = (n: any) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
export const fmtWhen = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

export const errText = (e: any, fallback = 'Something went wrong') =>
  e?.data?.error || e?.data?.detail ||
  (e?.data && typeof e.data === 'object' ? Object.entries(e.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ') : '') ||
  e?.message || fallback;

/** Resolve a file URL stored on a shared design file (data URL, absolute URL or server-relative path). */
export function resolveFileUrl(url: string): string {
  if (!url) return '';
  if (/^(data:|https?:|blob:)/i.test(url)) return url;
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function downloadFile(file: { fileName: string; fileUrl: string }) {
  const url = resolveFileUrl(file.fileUrl);
  if (!url) return false;
  const a = document.createElement('a');
  a.href = url;
  a.download = file.fileName || 'file';
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}

export const inputCls =
  'w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-crm-brand-700/30';
export const labelCls = 'block text-[11px] font-semibold text-[color:var(--crm-text-secondary)] mb-1';
export const btnPrimary =
  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-crm-brand-700 text-white text-xs font-semibold hover:bg-crm-brand-800 disabled:opacity-50 transition';
export const btnGhost =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[color:var(--crm-border-default)] bg-white text-[color:var(--crm-text-primary)] text-xs font-semibold hover:bg-[color:var(--crm-surface-subtle)] disabled:opacity-50 transition';
export const cardCls = 'bg-white rounded-2xl border border-[color:var(--crm-border-default)] shadow-sm';
export const thCls = 'p-3 text-left font-mono text-[11px] uppercase tracking-wider text-[color:var(--crm-text-secondary)]';
