'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Layers, Scissors, Search, Share2, Truck } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { ShareToNestingModal } from '../../components/nesting/ShareToNestingModal';
import { BarPanel, CHART_COLORS, DonutPanel, KpiGrid, KpiTile, ShortcutGrid, titleCase } from '../../components/dashboard/DashboardKit';
import { Badge, JOB_STATUS, ProgressBar, btnPrimary, cardCls, fmtWhen, inputCls, thCls } from '../../components/nesting/common';

export default function NestingJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [material, setMaterial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [j, s, m] = await Promise.all([
        api.get('/nesting/jobs/'),
        api.get('/nesting/jobs/stats/'),
        api.get('/nesting/jobs/project-summary/').catch(() => []),
      ]);
      setJobs(Array.isArray(j) ? j : []);
      setStats(s);
      setMaterial(Array.isArray(m) ? m : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (status !== 'all' && j.status !== status) return false;
      if (!q) return true;
      return [j.nestingNumber, j.customerName, j.productName, j.jobNumber, j.projectNumber]
        .some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [jobs, status, search]);

  const totals = useMemo(() => {
    const t = { required: 0, cut: 0, accepted: 0, sheetsUsed: 0, sheetsLeft: 0, netKg: 0, netCost: 0 };
    jobs.forEach((j) => {
      const s = j.summary || {};
      t.required += s.requiredQty || 0; t.cut += s.cutQty || 0; t.accepted += s.acceptedQty || 0;
      t.sheetsUsed += s.sheetsUsed || 0; t.sheetsLeft += s.sheetsLeftover || 0;
      t.netKg += s.netWeightKg || 0; t.netCost += s.netCost || 0;
    });
    return t;
  }, [jobs]);

  const statusSlices = useMemo(
    () => Object.entries(stats?.byStatus || {}).map(([k, v]) => ({ name: JOB_STATUS[k]?.label || titleCase(k), value: Number(v) })),
    [stats],
  );

  const partsPerJob = useMemo(
    () => jobs.filter((j) => j.status !== 'closed').slice(0, 8).map((j) => ({
      name: j.nestingNumber, required: j.summary?.requiredQty || 0, cut: j.summary?.cutQty || 0, accepted: j.summary?.acceptedQty || 0,
    })),
    [jobs],
  );

  const thicknessRows = useMemo(() => {
    const m: Record<string, { name: string; used: number; left: number; mm: number }> = {};
    material.forEach((g) => (g.byThickness || []).forEach((t: any) => {
      const k = String(t.thicknessMm);
      m[k] = m[k] || { name: `${t.thicknessMm} mm`, used: 0, left: 0, mm: Number(t.thicknessMm) };
      m[k].used += t.sheetsUsed || 0; m[k].left += t.sheetsLeftover || 0;
    }));
    return Object.values(m).sort((a, b) => a.mm - b.mm);
  }, [material]);

  const cards = [
    { label: 'Open jobs', value: jobs.filter((j) => j.status !== 'closed').length, icon: Layers, tone: 'text-crm-brand-700' },
    { label: 'Cutting in progress', value: stats?.byStatus?.cutting || 0, icon: Scissors, tone: 'text-amber-600' },
    { label: 'With Production for review', value: stats?.awaitingProductionReview || 0, icon: Truck, tone: 'text-violet-600' },
    { label: 'Rework / rejected (open)', value: stats?.openReworkQty || 0, icon: AlertTriangle, tone: 'text-red-600' },
    { label: 'Accepted jobs', value: stats?.byStatus?.closed || 0, icon: CheckCircle2, tone: 'text-emerald-600' },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className={`${cardCls} p-5 flex flex-col md:flex-row md:items-center justify-between gap-3`}>
        <div>
          <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">Nesting & Plate Cutting</h1>
          <p className="text-xs text-[color:var(--crm-text-secondary)] mt-1">
            Design files → Nesting → Cutting → Production. Track parts cut, rework and MS sheet usage per project.
          </p>
        </div>
        <button className={btnPrimary} onClick={() => setShareOpen(true)}>
          <Share2 className="w-3.5 h-3.5" /> Share files from Design
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`${cardCls} p-4`}>
            <c.icon className={`w-4 h-4 ${c.tone}`} />
            <div className="text-2xl font-black text-[color:var(--crm-text-primary)] mt-2">{c.value}</div>
            <div className="text-[11px] text-[color:var(--crm-text-secondary)]">{c.label}</div>
          </div>
        ))}
      </div>

      {/* ---------- dashboard charts ---------- */}
      <KpiGrid cols={4}>
        <KpiTile label="Parts to cut" value={totals.required} sub={`${totals.cut} cut so far`} icon={Scissors} href="/nesting" />
        <KpiTile label="Accepted by Production" value={totals.accepted} icon={CheckCircle2} tone="green" href="/nesting/production-review" />
        <KpiTile label="MS sheets used" value={totals.sheetsUsed} sub={`${totals.sheetsLeft} left over`} icon={Layers} tone="violet" href="/nesting/material-estimate" />
        <KpiTile label="Net steel consumed" value={`${Math.round(totals.netKg).toLocaleString('en-IN')} kg`} sub={`₹${Math.round(totals.netCost).toLocaleString('en-IN')}`} icon={Truck} tone="amber" href="/nesting/material-estimate" />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutPanel title="Jobs by status" data={statusSlices} centerLabel="jobs" />
        <BarPanel title="Parts per job" subtitle="Required vs cut vs accepted (open jobs)" data={partsPerJob} xKey="name"
          series={[
            { key: 'required', label: 'Required', color: CHART_COLORS[7] },
            { key: 'cut', label: 'Cut', color: CHART_COLORS[0] },
            { key: 'accepted', label: 'Accepted', color: CHART_COLORS[1] },
          ]} />
        <BarPanel title="MS sheets by thickness" subtitle="Used vs left over" data={thicknessRows} xKey="name"
          series={[{ key: 'used', label: 'Used', color: CHART_COLORS[2] }, { key: 'left', label: 'Left over', color: CHART_COLORS[1] }]} />
      </div>

      <ShortcutGrid items={[
        { label: 'Production Review', href: '/nesting/production-review', icon: CheckCircle2, hint: `${stats?.awaitingProductionReview || 0} waiting` },
        { label: 'Sheet & Material Estimate', href: '/nesting/material-estimate', icon: Layers },
        { label: 'Design Jobs (share files)', href: '/designer/jobs', icon: Share2 },
        { label: 'Rework / rejected', href: '/nesting/production-review', icon: AlertTriangle, hint: `${stats?.openReworkQty || 0} parts` },
      ]} />

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
          <input className={`${inputCls} pl-9`} placeholder="Search job, customer, product..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={`${inputCls} w-56`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {Object.entries(JOB_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[#F4F6FA]/90 border-b border-[color:var(--crm-border-default)]">
              <tr>
                <th className={thCls}>Nesting No.</th>
                <th className={thCls}>Customer / Product</th>
                <th className={thCls}>Project / Job</th>
                <th className={thCls}>Status</th>
                <th className={`${thCls} w-44`}>Parts cut</th>
                <th className={thCls}>Rework</th>
                <th className={thCls}>Sheets used</th>
                <th className={thCls}>Shared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)]">
              {loading && (
                <tr><td colSpan={8} className="p-6 text-center">Loading...</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center">No nesting jobs yet. Design shares files with “Share files from Design”.</td></tr>
              )}
              {rows.map((j) => {
                const s = j.summary || {};
                const hasRework = (s.reworkQty || 0) > 0;
                return (
                  <tr
                    key={j.id}
                    onClick={() => router.push(`/nesting/${encodeURIComponent(j.id)}`)}
                    className={`cursor-pointer hover:bg-[#F4F6FA]/50 ${hasRework ? 'bg-red-50/60' : ''}`}
                  >
                    <td className="p-3 font-mono font-bold text-crm-brand-700">
                      <Link href={`/nesting/${encodeURIComponent(j.id)}`} onClick={(e) => e.stopPropagation()}>{j.nestingNumber}</Link>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-[color:var(--crm-text-primary)]">{j.productName || '-'}</div>
                      <div>{j.customerName}</div>
                    </td>
                    <td className="p-3 font-mono">{j.projectNumber || '-'}<br />{j.jobNumber || ''}</td>
                    <td className="p-3"><Badge map={JOB_STATUS} value={j.status} /></td>
                    <td className="p-3">
                      <div className="flex justify-between mb-1 font-mono"><span>{s.cutQty || 0} / {s.requiredQty || 0}</span><span>{s.progressPercent || 0}%</span></div>
                      <ProgressBar value={s.progressPercent || 0} tone={s.progressPercent >= 100 ? 'green' : 'brand'} />
                    </td>
                    <td className="p-3">
                      {hasRework ? (
                        <span className="inline-flex items-center gap-1 text-red-700 font-bold"><AlertTriangle className="w-3.5 h-3.5" />{s.reworkQty} pcs</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="p-3 font-mono">{s.sheetsUsed || 0}{s.sheetsLeftover ? ` (+${s.sheetsLeftover} left)` : ''}</td>
                    <td className="p-3">{j.sharedBy}<div className="text-[10px]">{fmtWhen(j.sharedAt)}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ShareToNestingModal isOpen={shareOpen} onClose={() => setShareOpen(false)} onShared={(job) => { load(); if (job?.id) router.push(`/nesting/${encodeURIComponent(job.id)}`); }} />
    </div>
  );
}
