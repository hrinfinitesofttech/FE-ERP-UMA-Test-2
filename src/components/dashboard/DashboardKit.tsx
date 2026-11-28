'use client';

/**
 * Small building blocks shared by every department dashboard:
 * KPI tiles (click to open the page), chart panels (bar / donut / line) and shortcut grids.
 */
import React from 'react';
import Link from 'next/link';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';

export const CHART_COLORS = ['#1F3FB0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#64748B'];

export const panelCls = 'bg-white rounded-2xl border border-[color:var(--crm-border-default)] shadow-sm';

export function SectionTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)]">{title}</h3>
        {subtitle && <p className="text-[11px] text-[color:var(--crm-text-secondary)] mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export type Tone = 'brand' | 'green' | 'amber' | 'red' | 'violet' | 'slate';
const TONES: Record<Tone, string> = {
  brand: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  violet: 'bg-violet-50 text-violet-700',
  slate: 'bg-slate-100 text-slate-600',
};

/** One number. With `href` the whole tile is a shortcut to the page that holds the data. */
export function KpiTile({
  label, value, sub, icon: Icon, href, tone = 'brand',
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  tone?: Tone;
}) {
  const body = (
    <div className={`${panelCls} p-4 h-full ${href ? 'hover:border-crm-brand-700/60 hover:shadow-md transition cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        {Icon ? (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${TONES[tone]}`}><Icon className="w-4 h-4" /></span>
        ) : <span />}
        {href && <ArrowUpRight className="w-3.5 h-3.5 text-[color:var(--crm-text-tertiary)]" />}
      </div>
      <div className="text-2xl font-black text-[color:var(--crm-text-primary)] mt-3 leading-none">{value}</div>
      <div className="text-[11px] font-semibold text-[color:var(--crm-text-secondary)] mt-1.5">{label}</div>
      {sub && <div className="text-[10px] text-[color:var(--crm-text-tertiary)] mt-0.5">{sub}</div>}
    </div>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}

export function KpiGrid({ children, cols = 4 }: { children: React.ReactNode; cols?: 3 | 4 | 5 | 6 }) {
  const c = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' }[cols];
  return <div className={`grid grid-cols-2 ${c} gap-3`}>{children}</div>;
}

function Empty({ text = 'No data yet' }: { text?: string }) {
  return <div className="h-full min-h-[140px] flex items-center justify-center text-xs text-[color:var(--crm-text-tertiary)]">{text}</div>;
}

export function ChartPanel({
  title, subtitle, height = 240, children, empty, right,
}: {
  title: string; subtitle?: string; height?: number; children: React.ReactNode; empty?: boolean; right?: React.ReactNode;
}) {
  return (
    <div className={`${panelCls} p-4`}>
      <SectionTitle title={title} subtitle={subtitle} right={right} />
      <div style={{ height }}>{empty ? <Empty /> : children}</div>
    </div>
  );
}

export interface Slice { name: string; value: number; color?: string }

export function DonutPanel({ title, subtitle, data, height = 240, centerLabel }: {
  title: string; subtitle?: string; data: Slice[]; height?: number; centerLabel?: string;
}) {
  const rows = data.filter((d) => d.value > 0);
  const total = rows.reduce((a, d) => a + d.value, 0);
  return (
    <ChartPanel title={title} subtitle={subtitle} height={height} empty={rows.length === 0}>
      <div className="relative h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
              {rows.map((d, i) => <Cell key={d.name} fill={d.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={32} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-xl font-black text-[color:var(--crm-text-primary)]">{total}</span>
          {centerLabel && <span className="text-[10px] text-[color:var(--crm-text-secondary)]">{centerLabel}</span>}
        </div>
      </div>
    </ChartPanel>
  );
}

export interface Series { key: string; label: string; color?: string }

export function BarPanel({ title, subtitle, data, xKey, series, height = 240, stacked = false }: {
  title: string; subtitle?: string; data: Record<string, any>[]; xKey: string; series: Series[]; height?: number; stacked?: boolean;
}) {
  return (
    <ChartPanel title={title} subtitle={subtitle} height={height} empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E7EF" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10 }} interval={0} />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip />
          {series.length > 1 && <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />}
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} stackId={stacked ? 'a' : undefined}
              fill={s.color || CHART_COLORS[i % CHART_COLORS.length]} radius={stacked ? 0 : [4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

export function LinePanel({ title, subtitle, data, xKey, series, height = 240 }: {
  title: string; subtitle?: string; data: Record<string, any>[]; xKey: string; series: Series[]; height?: number;
}) {
  return (
    <ChartPanel title={title} subtitle={subtitle} height={height} empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E7EF" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          {series.length > 1 && <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />}
          {series.map((s, i) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label}
              stroke={s.color || CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

/** Row of quick links. */
export function ShortcutGrid({ title = 'Quick shortcuts', items }: {
  title?: string;
  items: { label: string; href: string; icon?: React.ComponentType<{ className?: string }>; hint?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className={`${panelCls} p-4`}>
      <SectionTitle title={title} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {items.map((it) => (
          <Link key={it.href + it.label} href={it.href}
            className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] hover:bg-white hover:border-crm-brand-700/60 hover:shadow-sm transition">
            {it.icon && <it.icon className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />}
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-[color:var(--crm-text-primary)] truncate">{it.label}</span>
              {it.hint && <span className="block text-[10px] text-[color:var(--crm-text-secondary)] truncate">{it.hint}</span>}
            </span>
            <ArrowUpRight className="w-3 h-3 ml-auto text-[color:var(--crm-text-tertiary)] opacity-0 group-hover:opacity-100 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Simple list panel (recent records, due items...). */
export function ListPanel({ title, subtitle, rows, empty = 'Nothing to show', right }: {
  title: string; subtitle?: string; right?: React.ReactNode;
  rows: { key: string; primary: React.ReactNode; secondary?: React.ReactNode; badge?: React.ReactNode; href?: string }[];
  empty?: string;
}) {
  return (
    <div className={`${panelCls} p-4`}>
      <SectionTitle title={title} subtitle={subtitle} right={right} />
      {rows.length === 0 ? <Empty text={empty} /> : (
        <div className="divide-y divide-[color:var(--crm-border-default)]">
          {rows.map((r) => {
            const inner = (
              <div className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[color:var(--crm-text-primary)] truncate">{r.primary}</div>
                  {r.secondary && <div className="text-[11px] text-[color:var(--crm-text-secondary)] truncate">{r.secondary}</div>}
                </div>
                {r.badge}
              </div>
            );
            return r.href ? <Link key={r.key} href={r.href} className="block hover:bg-[color:var(--crm-surface-subtle)] -mx-2 px-2 rounded-lg">{inner}</Link> : <div key={r.key}>{inner}</div>;
          })}
        </div>
      )}
    </div>
  );
}

export function StatusPill({ text, tone = 'slate' }: { text: string; tone?: Tone }) {
  return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${TONES[tone]}`}>{text}</span>;
}

export const count = <T,>(rows: T[], pick: (r: T) => string) => {
  const m: Record<string, number> = {};
  rows.forEach((r) => { const k = pick(r) || 'Unknown'; m[k] = (m[k] || 0) + 1; });
  return m;
};

export const titleCase = (s: string) => String(s || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
