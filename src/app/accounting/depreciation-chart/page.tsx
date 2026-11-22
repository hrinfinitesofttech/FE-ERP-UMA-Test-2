'use client';

import React, { useState } from 'react';
import { Percent, Save, CheckCircle2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { accountsApi, currentFY, inr, errMsg, downloadCSV } from '../../../lib/accountsApi';
import { PageHeader, FYSelect, PrintBtn, CsvBtn, Loading, ErrorBox, useAsync, card, th, td, num, btnPrimary, btnGhost, CompanyHeader } from '../../../components/accounting/AccUI';

const FIELDS = ['opening', 'addition1', 'addition2', 'sales'] as const;

export default function DepreciationChartPage() {
  const [fy, setFy] = useState(currentFY());
  const { data, loading, error, reload } = useAsync<any>(() => accountsApi.depreciationChart(fy), [fy]);
  const [edits, setEdits] = useState<Record<number, Record<string, string>>>({});
  const [busy, setBusy] = useState(false);

  const dirty = Object.keys(edits).length;
  const val = (r: any, f: string) => (edits[r.id]?.[f] !== undefined ? edits[r.id][f] : String(Number(r[f])));
  const setVal = (id: number, f: string, v: string) => setEdits((e) => ({ ...e, [id]: { ...e[id], [f]: v } }));

  const saveAll = async () => {
    setBusy(true);
    try {
      for (const [id, d] of Object.entries(edits)) {
        const body: any = {};
        Object.entries(d).forEach(([k, v]) => (body[k] = v === '' ? '0' : v));
        await accountsApi.updateDepAsset(Number(id), body);
      }
      setEdits({});
      toast.success('Depreciation chart saved');
      reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const post = async () => {
    if (dirty && !confirm('You have unsaved changes. Post using the SAVED values only?')) return;
    if (!confirm(`Post depreciation journal for F.Y. ${fy}? It will be re-posted (replaced) if already posted.`)) return;
    setBusy(true);
    try {
      const r: any = await accountsApi.postDepreciation(fy);
      toast.success(`Depreciation ₹${inr(r.amount, false)} posted to ledgers`);
      reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const carry = async () => {
    if (!confirm(`Create next year's chart with Opening = this year's W.D.V.?`)) return;
    setBusy(true);
    try {
      const r: any = await accountsApi.carryForward(fy);
      toast.success(`F.Y. ${r.next_year}: ${r.created} rows created`);
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const exportCsv = () => data && downloadCSV(`depreciation-chart-${fy}.csv`, [
    ['SNo', 'Group Name', 'Particulars', 'Dep Rate', 'Opening Balance', 'Addition 1', 'Addition 2', 'Sales/Transfer', 'Total', 'Depreciation', 'W.D.V'],
    ...data.rows.map((r: any, i: number) => [i + 1, r.group_name, r.particulars, r.rate, r.opening, r.addition1, r.addition2, r.sales, r.total, r.depreciation, r.wdv]),
  ]);

  let lastGroup = '';
  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<Percent className="w-6 h-6" />} title="Depreciation Chart" subtitle="Income-tax WDV depreciation by asset & block. Addition 1 = used ≥180 days (full rate), Addition 2 = used <180 days (half rate)">
        <FYSelect value={fy} onChange={setFy} />
        <button className={btnPrimary} onClick={saveAll} disabled={!dirty || busy}><Save className="w-3.5 h-3.5" /> Save{dirty ? ` (${dirty})` : ''}</button>
        <button className={btnGhost} onClick={post} disabled={busy}><CheckCircle2 className="w-3.5 h-3.5" /> Post Depreciation JV</button>
        <button className={btnGhost} onClick={carry} disabled={busy}>Carry forward to next year</button>
        <CsvBtn onClick={exportCsv} /><PrintBtn />
      </PageHeader>
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : data && (
        <>
          <div className={card}>
            <CompanyHeader title="DEPRECIATION CHART" sub={`F.Y. ${data.financial_year}${data.depreciation_posted ? ' — depreciation posted to books' : ' — not yet posted to books'}`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-[color:var(--crm-surface-subtle)]">
                  <tr>
                    <th className={th}>SNo.</th><th className={th}>Group Name</th><th className={th}>Particulars</th><th className={`${th} text-right`}>Dep Rate</th>
                    <th className={`${th} text-right`}>Opening Balance</th><th className={`${th} text-right`}>Addition 1</th><th className={`${th} text-right`}>Addition 2</th>
                    <th className={`${th} text-right`}>Sales/Transfer</th><th className={`${th} text-right`}>Total</th><th className={`${th} text-right`}>Depreciation</th><th className={`${th} text-right`}>W.D.V</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r: any, i: number) => {
                    const showGroup = r.group_name !== lastGroup; lastGroup = r.group_name;
                    return (
                      <tr key={r.id} className="border-t border-[color:var(--crm-border-default)]/50">
                        <td className={td}>{i + 1}</td>
                        <td className={`${td} text-[color:var(--crm-text-secondary)]`}>{showGroup ? r.group_name : ''}</td>
                        <td className={td}>{r.particulars}</td>
                        <td className={`${td} ${num}`}>{Number(r.rate)}%</td>
                        {FIELDS.map((f) => (
                          <td key={f} className="px-1 py-1">
                            <input type="number" min={0} step="0.01" value={val(r, f)} onChange={(e) => setVal(r.id, f, e.target.value)}
                              className="w-full text-right font-mono text-xs bg-transparent border border-transparent hover:border-[color:var(--crm-border-default)] focus:border-blue-500 rounded-lg px-2 py-1 focus:outline-none" aria-label={`${r.particulars} ${f}`} />
                          </td>
                        ))}
                        <td className={`${td} ${num}`}>{inr(r.total)}</td><td className={`${td} ${num}`}>{inr(r.depreciation)}</td><td className={`${td} ${num} font-semibold`}>{inr(r.wdv)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[color:var(--crm-text-primary)] bg-[color:var(--crm-surface-subtle)] font-extrabold">
                    <td className={td} colSpan={4}>TOTAL</td>
                    {(['opening', 'addition1', 'addition2', 'sales', 'total', 'depreciation', 'wdv'] as const).map((k) => <td key={k} className={`${td} ${num}`}>{inr(data.totals[k], false)}</td>)}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div className={card}>
            <div className="px-4 py-3 border-b border-[color:var(--crm-border-default)] text-xs font-bold">Block-wise summary (posted to Fixed Asset block ledgers)</div>
            <table className="w-full">
              <thead className="bg-[color:var(--crm-surface-subtle)]"><tr><th className={th}>Block</th><th className={`${th} text-right`}>Total</th><th className={`${th} text-right`}>Depreciation</th><th className={`${th} text-right`}>W.D.V</th></tr></thead>
              <tbody>{data.blocks.map((b: any) => (
                <tr key={b.group} className="border-t border-[color:var(--crm-border-default)]/50"><td className={td}>{b.group}</td><td className={`${td} ${num}`}>{inr(b.total)}</td><td className={`${td} ${num}`}>{inr(b.depreciation)}</td><td className={`${td} ${num}`}>{inr(b.wdv)}</td></tr>
              ))}</tbody>
            </table>
            <p className="p-3 text-[11px] text-[color:var(--crm-text-secondary)]">Tip: the Fixed Asset block ledgers (Ledger Master) should carry the same opening W.D.V. as this chart; posting depreciation reduces them and charges “DEPRECIATION” to the Profit &amp; Loss A/c.</p>
          </div>
        </>
      )}
    </div>
  );
}
