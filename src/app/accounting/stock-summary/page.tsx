'use client';

import React, { useMemo, useState } from 'react';
import { Boxes, Save, RefreshCw, Plus } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { accountsApi, inr, errMsg, downloadCSV } from '../../../lib/accountsApi';
import { PageHeader, PrintBtn, CsvBtn, Loading, ErrorBox, useAsync, card, th, td, num, btnPrimary, btnGhost, inputCls, Stat, Modal, Field } from '../../../components/accounting/AccUI';

export default function StockSummaryPage() {
  const { data, loading, error, reload } = useAsync<any>(() => accountsApi.stockSummary(), []);
  const [edits, setEdits] = useState<Record<number, Record<string, string>>>({});
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Raw Material', uom: 'Nos' });

  const dirty = Object.keys(edits).length;
  const val = (r: any, f: string) => (edits[r.id]?.[f] !== undefined ? edits[r.id][f] : String(Number(r[f])));
  const setVal = (id: number, f: string, v: string) => setEdits((e) => ({ ...e, [id]: { ...e[id], [f]: v } }));
  const liveValue = (r: any) => (edits[r.id] ? Number(val(r, 'closing_qty') || 0) * Number(val(r, 'rate') || 0) : Number(r.closing_value));

  const items = useMemo(() => (data?.items || []).filter((r: any) =>
    (cat === 'All' || r.category === cat) && (!q || r.name.toLowerCase().includes(q.toLowerCase()))), [data, q, cat]);
  const total = (data?.items || []).reduce((a: number, r: any) => a + liveValue(r), 0);

  const save = async () => {
    setBusy(true);
    try {
      for (const [id, d] of Object.entries(edits)) {
        const body: any = {};
        Object.entries(d).forEach(([k, v]) => (body[k] = v === '' ? '0' : v));
        await accountsApi.updateStock(Number(id), body);
      }
      setEdits({}); toast.success('Stock saved'); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const sync = async () => {
    setBusy(true);
    try {
      const r: any = await accountsApi.syncStock();
      toast.success(`Synced from Store: ${r.updated} updated, ${r.created} new (of ${r.store_items} store items)`); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const add = async () => {
    if (!form.name.trim()) return toast.error('Item name is required');
    try { await accountsApi.createStock({ ...form, name: form.name.trim() }); setAdding(false); setForm({ name: '', category: 'Raw Material', uom: 'Nos' }); toast.success('Item added'); reload(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  const sections = ['Finished Goods', 'Raw Material'].filter((c) => cat === 'All' || cat === c);
  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<Boxes className="w-6 h-6" />} title="Stock Summary" subtitle="Closing stock (Finished Goods & Raw Material) — feeds Trading A/c and Balance Sheet">
        <button className={btnGhost} onClick={sync} disabled={busy}><RefreshCw className="w-3.5 h-3.5" /> Sync from Store</button>
        <button className={btnGhost} onClick={() => setAdding(true)}><Plus className="w-3.5 h-3.5" /> Add item</button>
        <button className={btnPrimary} onClick={save} disabled={!dirty || busy}><Save className="w-3.5 h-3.5" /> Save{dirty ? ` (${dirty})` : ''}</button>
        <CsvBtn onClick={() => data && downloadCSV('stock-summary.csv', [['Category', 'Group', 'Item', 'UOM', 'Closing Qty', 'Rate', 'Value'], ...data.items.map((r: any) => [r.category, r.sub_group, r.name, r.uom, r.closing_qty, r.rate, r.closing_value])])} />
        <PrintBtn />
      </PageHeader>
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total Closing Stock" value={`₹ ${inr(total, false)}`} />
            {data.categories.map((c: any) => <Stat key={c.category} label={`${c.category} (${c.count} items)`} value={`₹ ${inr(c.value, false)}`} />)}
            <Stat label="Items with stock" value={(data.items as any[]).filter((r) => Number(r.closing_qty) > 0).length} />
          </div>
          <div className="flex gap-2 print:hidden">
            <input className={`${inputCls} max-w-xs`} placeholder="Search item…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={`${inputCls} !w-auto`} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option>All</option><option>Finished Goods</option><option>Raw Material</option>
            </select>
          </div>
          {sections.map((c) => {
            const rows = items.filter((r: any) => r.category === c);
            if (!rows.length) return null;
            let last = '';
            return (
              <div key={c} className={card}>
                <div className="px-4 py-3 border-b border-[color:var(--crm-border-default)] text-xs font-bold">{c} — {rows.length} items</div>
                <table className="w-full">
                  <thead className="bg-[color:var(--crm-surface-subtle)]"><tr><th className={th}>#</th><th className={th}>Item</th><th className={th}>UOM</th><th className={`${th} text-right`}>Closing Qty</th><th className={`${th} text-right`}>Rate (₹)</th><th className={`${th} text-right`}>Value (₹)</th></tr></thead>
                  <tbody>
                    {rows.map((r: any, i: number) => {
                      const hdr = r.sub_group && r.sub_group !== last; last = r.sub_group;
                      return (
                        <React.Fragment key={r.id}>
                          {hdr && <tr className="bg-blue-50/50"><td colSpan={6} className={`${td} font-semibold`}>{r.sub_group}</td></tr>}
                          <tr className="border-t border-[color:var(--crm-border-default)]/50">
                            <td className={td}>{i + 1}</td><td className={td}>{r.name}{r.store_item_code && <span className="ml-2 text-[10px] text-emerald-700">● Store linked</span>}</td><td className={td}>{r.uom}</td>
                            {(['closing_qty', 'rate'] as const).map((f) => (
                              <td key={f} className="px-1 py-1"><input type="number" min={0} step="0.01" value={val(r, f)} onChange={(e) => setVal(r.id, f, e.target.value)}
                                className="w-28 ml-auto block text-right font-mono text-xs bg-transparent border border-transparent hover:border-[color:var(--crm-border-default)] focus:border-blue-500 rounded-lg px-2 py-1 focus:outline-none" aria-label={`${r.name} ${f}`} /></td>
                            ))}
                            <td className={`${td} ${num}`}>{inr(liveValue(r))}</td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </>
      )}
      {adding && (
        <Modal title="Add stock item" onClose={() => setAdding(false)}>
          <div className="space-y-3">
            <Field label="Item name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Category"><select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Raw Material</option><option>Finished Goods</option></select></Field>
            <Field label="UOM"><input className={inputCls} value={form.uom} onChange={(e) => setForm({ ...form, uom: e.target.value })} /></Field>
            <button className={btnPrimary} onClick={add}>Add</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
