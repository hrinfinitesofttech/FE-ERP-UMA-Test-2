'use client';

import React, { useMemo, useState } from 'react';
import { BookOpen, Plus, Database, RefreshCw } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { accountsApi, inr, errMsg, downloadCSV } from '../../../lib/accountsApi';
import { PageHeader, CsvBtn, Loading, ErrorBox, useAsync, card, th, td, num, btnPrimary, btnGhost, inputCls, Modal, Field } from '../../../components/accounting/AccUI';

const empty = { id: 0, name: '', group: '', opening_balance: '0', opening_type: 'Dr', status: 'Active' };

export default function LedgerMasterPage() {
  const { data, loading, error, reload } = useAsync<{ groups: any[]; ledgers: any[] }>(
    async () => { const [groups, ledgers] = await Promise.all([accountsApi.groups(), accountsApi.ledgers()]); return { groups, ledgers }; }, []);
  const [q, setQ] = useState('');
  const [grp, setGrp] = useState('');
  const [form, setForm] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const groups = data?.groups || [];
  const rows = useMemo(() => (data?.ledgers || []).filter((l) =>
    (!grp || String(l.group) === grp) && (!q || l.name.toLowerCase().includes(q.toLowerCase()))), [data, q, grp]);

  const save = async () => {
    if (!form.name.trim()) return toast.error('Ledger name is required');
    if (!form.group) return toast.error('Select an account group');
    const body = { name: form.name.trim(), group: Number(form.group), opening_balance: form.opening_balance || '0', opening_type: form.opening_type, status: form.status };
    try {
      if (form.id) await accountsApi.updateLedger(form.id, body); else await accountsApi.createLedger(body);
      toast.success('Ledger saved'); setForm(null); reload();
    } catch (e) { toast.error(errMsg(e)); }
  };
  const seed = async () => {
    setBusy(true);
    try { const r: any = await accountsApi.seed(); toast.success(`Loaded: ${r.groups} groups, ${r.ledgers} ledgers, ${r.assets} depreciation assets, ${r.stock} stock items`); reload(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const rebuild = async () => {
    if (!confirm('Re-post all invoices, receipts, payments, expenses, journals and vouchers into the ledger? Existing ledger postings will be rebuilt from source documents.')) return;
    setBusy(true);
    try { const r: any = await accountsApi.rebuild(); const n = Object.values(r.posted as Record<string, number>).reduce((a, b) => a + b, 0); toast.success(`Ledger rebuilt from ${n} documents${r.errors.length ? ` (${r.errors.length} errors)` : ''}`); reload(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<BookOpen className="w-6 h-6" />} title="Ledger Master" subtitle="Accounts & groups (Capital, Loans, Assets, Sales, Purchase, Incomes, Expenses). Customers/Suppliers get their ledger automatically on first posting.">
        <button className={btnGhost} onClick={seed} disabled={busy}><Database className="w-3.5 h-3.5" /> Load UMA standard chart</button>
        <button className={btnGhost} onClick={rebuild} disabled={busy}><RefreshCw className="w-3.5 h-3.5" /> Rebuild ledger</button>
        <CsvBtn onClick={() => downloadCSV('ledgers.csv', [['Ledger', 'Group', 'Nature', 'Opening', 'Dr/Cr', 'Current balance', 'Type'], ...rows.map((l) => [l.name, l.group_name, l.nature, l.opening_balance, l.opening_type, l.balance.amount, l.balance.type])])} />
        <button className={btnPrimary} onClick={() => setForm({ ...empty, group: groups[0]?.id || '' })}><Plus className="w-3.5 h-3.5" /> New ledger</button>
      </PageHeader>
      <div className="flex gap-2">
        <input className={`${inputCls} max-w-xs`} placeholder="Search ledger…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={`${inputCls} !w-auto`} value={grp} onChange={(e) => setGrp(e.target.value)}>
          <option value="">All groups</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.parent_name ? `${g.parent_name} › ` : ''}{g.name}</option>)}
        </select>
      </div>
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : (
        <div className={card}>
          {data && data.ledgers.length === 0 && (
            <div className="p-6 text-xs text-center">No ledgers yet. Click <b>Load UMA standard chart</b> to create the accounts, depreciation chart and stock list from the client Excel.</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[color:var(--crm-surface-subtle)]"><tr><th className={th}>Ledger</th><th className={th}>Group</th><th className={th}>Nature</th><th className={`${th} text-right`}>Opening</th><th className={`${th} text-right`}>Current Balance</th><th className={th}>Status</th><th className={th}></th></tr></thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="border-t border-[color:var(--crm-border-default)]/50">
                    <td className={`${td} font-medium`}>{l.name}</td><td className={td}>{l.group_name}</td><td className={`${td} text-[color:var(--crm-text-secondary)]`}>{l.nature}</td>
                    <td className={`${td} ${num}`}>{inr(l.opening_balance)} {Number(l.opening_balance) ? l.opening_type : ''}</td>
                    <td className={`${td} ${num}`}>{inr(l.balance.amount)} {l.balance.amount ? l.balance.type : ''}</td>
                    <td className={td}>{l.status}</td>
                    <td className={td}><button className="text-blue-700 underline cursor-pointer" onClick={() => setForm({ ...l })}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {form && (
        <Modal title={form.id ? 'Edit ledger' : 'New ledger'} onClose={() => setForm(null)}>
          <div className="space-y-3">
            <Field label="Ledger name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Under group">
              <select className={inputCls} value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.parent_name ? `${g.parent_name} › ` : ''}{g.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening balance (₹)"><input type="number" min={0} step="0.01" className={inputCls} value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: e.target.value })} /></Field>
              <Field label="Dr / Cr"><select className={inputCls} value={form.opening_type} onChange={(e) => setForm({ ...form, opening_type: e.target.value })}><option>Dr</option><option>Cr</option></select></Field>
            </div>
            <Field label="Status"><select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></Field>
            <p className="text-[11px] text-[color:var(--crm-text-secondary)]">Opening balance applies to Balance Sheet accounts only (assets, liabilities, capital). Income/expense ledgers start from zero each year.</p>
            <button className={btnPrimary} onClick={save}>Save ledger</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
