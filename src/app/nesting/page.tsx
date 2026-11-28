'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Layers, Scissors, Search, Share2, Truck } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { ShareToNestingModal } from '../../components/nesting/ShareToNestingModal';
import { Badge, JOB_STATUS, ProgressBar, btnPrimary, cardCls, fmtWhen, inputCls, thCls } from '../../components/nesting/common';

export default function NestingJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [j, s] = await Promise.all([api.get('/nesting/jobs/'), api.get('/nesting/jobs/stats/')]);
      setJobs(Array.isArray(j) ? j : []);
      setStats(s);
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
