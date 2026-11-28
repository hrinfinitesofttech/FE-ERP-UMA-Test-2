'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { api } from '../../../lib/apiClient';
import { cardCls, fmtKg, fmtMoney, inputCls, thCls } from '../../../components/nesting/common';

/** Project-wise MS sheet estimate: sheets used / left over, weight and cost, taken from Nesting. */
export default function MaterialEstimatePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/nesting/jobs/project-summary/')
      .then((r: any) => setRows(Array.isArray(r) ? r : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((g) => !q || [g.projectNumber, g.jobNumber, g.customerName, g.productName]
      .some((v) => String(v || '').toLowerCase().includes(q)));
  }, [rows, search]);

  const grand = useMemo(() => list.reduce((a, g) => ({
    used: a.used + (g.totals.sheetsUsed || 0), left: a.left + (g.totals.sheetsLeftover || 0),
    kg: a.kg + (g.totals.netWeightKg || 0), cost: a.cost + (g.totals.netCost || 0),
  }), { used: 0, left: 0, kg: 0, cost: 0 }), [list]);

  return (
    <div className="p-6 space-y-5">
      <div className={`${cardCls} p-5`}>
        <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">Sheet & Material Estimate</h1>
        <p className="text-xs text-[color:var(--crm-text-secondary)] mt-1">
          MS sheets used and left over per project, with net steel weight and cost. Net = sheets used − reusable offcuts returned to store.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['Sheets used', grand.used], ['Sheets left over', grand.left], ['Net steel consumed', fmtKg(grand.kg)], ['Net material cost', fmtMoney(grand.cost)]].map(([l, v]) => (
          <div key={String(l)} className={`${cardCls} p-4`}>
            <div className="text-xl font-black text-[color:var(--crm-text-primary)]">{v}</div>
            <div className="text-[11px] text-[color:var(--crm-text-secondary)]">{l}</div>
          </div>
        ))}
      </div>

      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
        <input className={`${inputCls} pl-9`} placeholder="Search project, job, customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <div className="text-sm">Loading...</div>}
      {!loading && list.length === 0 && <div className={`${cardCls} p-8 text-center text-xs`}>No nesting data yet.</div>}

      {list.map((g) => (
        <div key={g.projectId || g.jobNumber} className={`${cardCls} overflow-hidden`}>
          <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--crm-border-default)]">
            <div>
              <div className="font-bold text-[color:var(--crm-text-primary)]">{g.productName || 'Project'} <span className="font-mono text-xs text-crm-brand-700">{g.projectNumber}</span></div>
              <div className="text-xs text-[color:var(--crm-text-secondary)]">{g.customerName} · Job {g.jobNumber || '-'}</div>
            </div>
            <div className="flex gap-5 text-xs">
              <div><div className="font-black text-sm">{g.totals.sheetsUsed || 0}</div>sheets used</div>
              <div><div className="font-black text-sm">{g.totals.sheetsLeftover || 0}</div>left over</div>
              <div><div className="font-black text-sm">{fmtKg(g.totals.netWeightKg)}</div>net weight</div>
              <div><div className="font-black text-sm">{fmtMoney(g.totals.netCost)}</div>net cost</div>
              <div><div className="font-black text-sm">{g.totals.acceptedQty || 0}/{g.totals.requiredQty || 0}</div>parts accepted</div>
            </div>
          </div>
          <table className="w-full text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[#F4F6FA]/90 border-b border-[color:var(--crm-border-default)]">
              <tr><th className={thCls}>Thickness</th><th className={thCls}>Sheets used</th><th className={thCls}>Sheets left over</th><th className={thCls}>Net weight</th><th className={thCls}>Net cost</th></tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)]">
              {g.byThickness.length === 0 && <tr><td colSpan={5} className="p-4 text-center">No sheet usage recorded.</td></tr>}
              {g.byThickness.map((t: any) => (
                <tr key={t.thicknessMm}>
                  <td className="p-3 font-mono">{t.thicknessMm} mm</td><td className="p-3 font-mono">{t.sheetsUsed}</td>
                  <td className="p-3 font-mono">{t.sheetsLeftover}</td><td className="p-3 font-mono">{fmtKg(t.netWeightKg)}</td>
                  <td className="p-3 font-mono">{fmtMoney(t.netCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 text-[11px] flex gap-3 flex-wrap bg-[#F4F6FA]/50">
            {g.jobs.map((j: any) => (
              <Link key={j.id} href={`/nesting/${encodeURIComponent(j.id)}`} className="font-mono text-crm-brand-700 hover:underline">{j.nestingNumber}</Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
