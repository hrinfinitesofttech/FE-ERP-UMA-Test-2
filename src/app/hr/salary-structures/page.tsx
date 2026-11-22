'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Search, Save, Upload, Download, Wand2, AlertTriangle, Settings2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { payrollApi, money, errorText } from '../../../lib/payrollApi';
import {
  card, inputCls, btn, btnPrimary, thCls, Loading, ErrorBanner, Modal, Field, usePaged, Pager, downloadCsv, localISO,
} from '../attendance/_parts/shared';

type Row = {
  employeeId: string; employeeName: string; department: string; designation: string; joiningDate: string;
  basicSalary: string; hra: string; conveyanceAllowance: string; medicalAllowance: string; specialAllowance: string; tdsMonthly: string;
  pfApplicable: boolean; esiApplicable: boolean; ptApplicable: boolean; overtimeEligible: boolean;
  uanNumber: string; esiNumber: string; panNumber: string; effectiveFrom: string;
  hasStructure: boolean; netSalary: number; grossSaved: number; bankOk: boolean;
};

const NUM = ['basicSalary', 'hra', 'conveyanceAllowance', 'medicalAllowance', 'specialAllowance', 'tdsMonthly'] as const;
const s = (v: any) => (v === null || v === undefined ? '' : String(Number(v) === 0 ? '0' : v));

const toRow = (e: any): Row => {
  const st = e.structure;
  return {
    employeeId: e.employeeId, employeeName: e.employeeName, department: e.department || '', designation: e.designation || '', joiningDate: e.joiningDate || '',
    basicSalary: s(st?.basicSalary ?? 0), hra: s(st?.hra ?? 0), conveyanceAllowance: s(st?.conveyanceAllowance ?? 0), medicalAllowance: s(st?.medicalAllowance ?? 0),
    specialAllowance: s(st?.specialAllowance ?? 0), tdsMonthly: s(st?.tdsMonthly ?? 0),
    pfApplicable: st?.pfApplicable ?? true, esiApplicable: st?.esiApplicable ?? true, ptApplicable: st?.ptApplicable ?? true, overtimeEligible: st?.overtimeEligible ?? true,
    uanNumber: st?.uanNumber || '', esiNumber: st?.esiNumber || '', panNumber: st?.panNumber || '',
    effectiveFrom: st?.effectiveFrom || `${new Date().getFullYear()}-04-01`,
    hasStructure: !!st, netSalary: Number(st?.netSalary || 0), grossSaved: Number(st?.grossSalary || 0), bankOk: !!e.bankAccountNo,
  };
};
const gross = (r: Row) => NUM.slice(0, 5).reduce((a, k) => a + (Number(r[k]) || 0), 0);

export default function SalaryStructuresPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [orig, setOrig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('ALL');
  const [show, setShow] = useState<'ALL' | 'MISSING' | 'DONE'>('ALL');
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [split, setSplit] = useState({ basicPct: '50', hraPct: '20', conv: '0', med: '0' });
  const [grossIn, setGrossIn] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true); setError('');
    try {
      const list = (await payrollApi.employeesWithStructure()).map(toRow);
      setRows(list);
      setOrig(Object.fromEntries(list.map((r) => [r.employeeId, JSON.stringify(r)])));
    } catch (e) { setError(errorText(e, 'Could not load employees')); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const dirtyIds = useMemo(() => (rows || []).filter((r) => orig[r.employeeId] !== JSON.stringify(r)).map((r) => r.employeeId), [rows, orig]);
  const depts = useMemo(() => Array.from(new Set((rows || []).map((r) => r.department).filter(Boolean))).sort(), [rows]);
  const missing = (rows || []).filter((r) => !r.hasStructure).length;

  const filtered = useMemo(() => (rows || []).filter((r) => {
    const t = q.trim().toLowerCase();
    return (!t || [r.employeeName, r.employeeId, r.department, r.designation].some((x) => x.toLowerCase().includes(t))) &&
      (dept === 'ALL' || r.department === dept) && (show === 'ALL' || (show === 'MISSING' ? !r.hasStructure : r.hasStructure));
  }), [rows, q, dept, show]);
  const paged = usePaged(filtered, `${q}|${dept}|${show}`, 25);

  const patch = (id: string, p: Partial<Row>) => setRows((rs) => (rs || []).map((r) => (r.employeeId === id ? { ...r, ...p } : r)));

  const applySplit = (r: Row) => {
    const g = Number(grossIn[r.employeeId]);
    if (!(g > 0)) return toast.error('Enter the monthly gross amount first');
    const basic = Math.round(g * Number(split.basicPct) / 100), hra = Math.round(g * Number(split.hraPct) / 100);
    const conv = Number(split.conv) || 0, med = Number(split.med) || 0;
    const spec = g - basic - hra - conv - med;
    if (spec < 0) return toast.error('Basic % + HRA % + fixed allowances exceed the gross — adjust the split settings');
    patch(r.employeeId, { basicSalary: String(basic), hra: String(hra), conveyanceAllowance: String(conv), medicalAllowance: String(med), specialAllowance: String(spec) });
  };

  const payloadOf = (r: Row) => ({
    employeeId: r.employeeId, employeeName: r.employeeName, structureName: 'Monthly Salary', effectiveFrom: r.effectiveFrom, status: 'Active',
    basicSalary: Number(r.basicSalary) || 0, hra: Number(r.hra) || 0, conveyanceAllowance: Number(r.conveyanceAllowance) || 0,
    medicalAllowance: Number(r.medicalAllowance) || 0, specialAllowance: Number(r.specialAllowance) || 0, tdsMonthly: Number(r.tdsMonthly) || 0,
    pfApplicable: r.pfApplicable, esiApplicable: r.esiApplicable, ptApplicable: r.ptApplicable, overtimeEligible: r.overtimeEligible,
    uanNumber: r.uanNumber.trim(), esiNumber: r.esiNumber.trim(), panNumber: r.panNumber.trim().toUpperCase(),
  });

  const save = async () => {
    const changed = (rows || []).filter((r) => dirtyIds.includes(r.employeeId));
    const bad = changed.find((r) => NUM.some((k) => !isFinite(Number(r[k])) || Number(r[k]) < 0) || !(Number(r.basicSalary) > 0));
    if (bad) return toast.error(`${bad.employeeName}: Basic must be greater than 0 and no amount can be negative`);
    const badPan = changed.find((r) => r.panNumber && !/^[A-Za-z]{5}\d{4}[A-Za-z]$/.test(r.panNumber.trim()));
    if (badPan) return toast.error(`${badPan.employeeName}: PAN must look like ABCDE1234F`);
    setBusy(true);
    try {
      const res = await payrollApi.bulkSaveStructures(changed.map(payloadOf));
      if (res.errors.length) toast.error(`${res.saved} saved, ${res.errors.length} failed: ${res.errors[0].employeeId || 'row ' + res.errors[0].row} — ${res.errors[0].error}`);
      else toast.success(`${res.saved} salary structure${res.saved > 1 ? 's' : ''} saved`);
      await load();
    } catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };

  const HEAD = ['Employee ID', 'Employee Name', 'Department', 'Basic', 'HRA', 'Conveyance', 'Medical', 'Special', 'TDS (monthly)', 'PF', 'ESI', 'PT', 'OT eligible', 'UAN', 'ESI No', 'PAN', 'Effective from'];
  const yn = (b: boolean) => (b ? 'Yes' : 'No');
  const exportCsv = () => downloadCsv('salary-structures.csv', [HEAD, ...(rows || []).map((r) => [r.employeeId, r.employeeName, r.department, r.basicSalary, r.hra, r.conveyanceAllowance, r.medicalAllowance, r.specialAllowance, r.tdsMonthly, yn(r.pfApplicable), yn(r.esiApplicable), yn(r.ptApplicable), yn(r.overtimeEligible), r.uanNumber, r.esiNumber, r.panNumber, r.effectiveFrom])]);

  const importCsv = async (f: File) => {
    const text = (await f.text()).replace(/^﻿/, '');
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const parse = (l: string) => { const out: string[] = []; let cur = '', q2 = false; for (const ch of l) { if (ch === '"') q2 = !q2; else if (ch === ',' && !q2) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map((x) => x.trim()); };
    const head = parse(lines[0]).map((h) => h.toLowerCase());
    const col = (n: string) => head.findIndex((h) => h === n.toLowerCase());
    if (col('Employee ID') < 0 || col('Basic') < 0) return toast.error('CSV must have "Employee ID" and "Basic" columns — use Export CSV as the template');
    const byId = new Map((rows || []).map((r) => [r.employeeId, r]));
    let applied = 0; const unknown: string[] = [];
    const next = new Map<string, Partial<Row>>();
    lines.slice(1).forEach((l) => {
      const c = parse(l); const id = c[col('Employee ID')];
      if (!byId.has(id)) { if (id) unknown.push(id); return; }
      const g = (n: string) => (col(n) >= 0 ? c[col(n)] : undefined);
      const flag = (n: string, cur: boolean) => { const v = (g(n) || '').toLowerCase(); return v === '' ? cur : ['yes', 'y', 'true', '1'].includes(v); };
      const cur = byId.get(id)!;
      next.set(id, {
        basicSalary: g('Basic') ?? cur.basicSalary, hra: g('HRA') ?? cur.hra, conveyanceAllowance: g('Conveyance') ?? cur.conveyanceAllowance,
        medicalAllowance: g('Medical') ?? cur.medicalAllowance, specialAllowance: g('Special') ?? cur.specialAllowance, tdsMonthly: g('TDS (monthly)') ?? cur.tdsMonthly,
        pfApplicable: flag('PF', cur.pfApplicable), esiApplicable: flag('ESI', cur.esiApplicable), ptApplicable: flag('PT', cur.ptApplicable), overtimeEligible: flag('OT eligible', cur.overtimeEligible),
        uanNumber: g('UAN') ?? cur.uanNumber, esiNumber: g('ESI No') ?? cur.esiNumber, panNumber: g('PAN') ?? cur.panNumber, effectiveFrom: g('Effective from') || cur.effectiveFrom,
      });
      applied++;
    });
    setRows((rs) => (rs || []).map((r) => (next.has(r.employeeId) ? { ...r, ...next.get(r.employeeId)! } : r)));
    toast.success(`${applied} rows loaded from CSV — review and press Save`);
    if (unknown.length) toast.warning(`Unknown employee IDs skipped: ${unknown.slice(0, 5).join(', ')}${unknown.length > 5 ? '…' : ''}`);
    if (fileRef.current) fileRef.current.value = '';
  };

  const cur = rows?.find((r) => r.employeeId === detail) || null;
  const numCell = (r: Row, k: (typeof NUM)[number]) => (
    <td key={k} className="px-1 py-1.5">
      <input type="number" min={0} step="1" value={r[k]} onChange={(e) => patch(r.employeeId, { [k]: e.target.value } as any)} aria-label={`${r.employeeName} ${k}`}
        className="w-24 text-right font-mono text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-amber-500 rounded-lg px-2 py-1 focus:outline-none" />
    </td>
  );
  const chk = (r: Row, k: 'pfApplicable' | 'esiApplicable' | 'ptApplicable' | 'overtimeEligible') => (
    <td className="px-2 text-center"><input type="checkbox" checked={r[k]} onChange={(e) => patch(r.employeeId, { [k]: e.target.checked } as any)} aria-label={`${r.employeeName} ${k}`} /></td>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 text-[color:var(--crm-text-primary)]">
      <div className={`${card} p-5 flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <h1 className="text-xl font-extrabold">Salary Structures</h1>
          <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Monthly salary of every employee. PF, ESI, Professional Tax, Net and CTC are calculated on save.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={exportCsv} disabled={!rows}><Download className="w-3.5 h-3.5" /> Export / template</button>
          <button className={btn} onClick={() => fileRef.current?.click()}><Upload className="w-3.5 h-3.5" /> Import CSV</button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
          <button className={btnPrimary} onClick={save} disabled={!dirtyIds.length || busy}><Save className="w-3.5 h-3.5" /> {busy ? 'Saving…' : `Save changes${dirtyIds.length ? ` (${dirtyIds.length})` : ''}`}</button>
        </div>
      </div>

      {missing > 0 && !loading && (
        <button onClick={() => setShow('MISSING')} className="w-full text-left p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 cursor-pointer">
          <AlertTriangle className="w-4 h-4" /> {missing} employee{missing > 1 ? 's have' : ' has'} no salary structure — they will be skipped in payroll. Click to show only them.
        </button>
      )}

      <div className={`${card} p-3 flex flex-wrap items-center gap-2`}>
        <div className="relative"><Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search employee…" className={`${inputCls} pl-8 w-56`} aria-label="Search employees" /></div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className={inputCls} aria-label="Department"><option value="ALL">All departments</option>{depts.map((d) => <option key={d}>{d}</option>)}</select>
        <select value={show} onChange={(e) => setShow(e.target.value as any)} className={inputCls} aria-label="Show"><option value="ALL">All employees</option><option value="MISSING">Without structure ({missing})</option><option value="DONE">With structure</option></select>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500"><Wand2 className="w-3.5 h-3.5" /> Auto-split:
          Basic <input className={`${inputCls} w-14 !px-2`} value={split.basicPct} onChange={(e) => setSplit({ ...split, basicPct: e.target.value })} aria-label="Basic percent" />% ·
          HRA <input className={`${inputCls} w-14 !px-2`} value={split.hraPct} onChange={(e) => setSplit({ ...split, hraPct: e.target.value })} aria-label="HRA percent" />% ·
          Conv ₹<input className={`${inputCls} w-16 !px-2`} value={split.conv} onChange={(e) => setSplit({ ...split, conv: e.target.value })} aria-label="Conveyance" /> ·
          Med ₹<input className={`${inputCls} w-16 !px-2`} value={split.med} onChange={(e) => setSplit({ ...split, med: e.target.value })} aria-label="Medical" /> · rest = Special
        </div>
      </div>

      {loading ? <Loading /> : error ? <ErrorBanner msg={error} retry={load} /> : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-xs">
              <thead className="bg-slate-50 border-b border-[color:var(--crm-border-default)]">
                <tr>
                  <th className={`${thCls} sticky left-0 bg-slate-50 z-10 min-w-[200px]`}>Employee</th>
                  <th className={thCls}>Gross → split</th>
                  {['Basic', 'HRA', 'Conveyance', 'Medical', 'Special'].map((h) => <th key={h} className={`${thCls} text-right`}>{h}</th>)}
                  <th className={`${thCls} text-right`}>Gross</th>
                  <th className={`${thCls} text-right`}>TDS</th>
                  {['PF', 'ESI', 'PT', 'OT'].map((h) => <th key={h} className={`${thCls} text-center`}>{h}</th>)}
                  <th className={`${thCls} text-right`}>Net (saved)</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                {paged.slice.length === 0 ? <tr><td colSpan={16} className="py-12 text-center text-slate-400">No employees match.</td></tr> : paged.slice.map((r) => {
                  const dirty = dirtyIds.includes(r.employeeId);
                  return (
                    <tr key={r.employeeId} className={dirty ? 'bg-amber-50/50' : !r.hasStructure ? 'bg-rose-50/30' : ''}>
                      <td className={`px-4 py-2 sticky left-0 z-10 ${dirty ? 'bg-amber-50' : !r.hasStructure ? 'bg-rose-50' : 'bg-white'}`}>
                        <div className="font-bold text-slate-900 truncate max-w-[180px]">{r.employeeName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{r.employeeId} · {r.department || 'General'}</div>
                        {!r.bankOk && <div className="text-[10px] text-rose-600">No bank account on profile</div>}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <input type="number" min={0} placeholder="Gross" value={grossIn[r.employeeId] || ''} onChange={(e) => setGrossIn({ ...grossIn, [r.employeeId]: e.target.value })} aria-label={`${r.employeeName} gross to split`}
                          className="w-20 text-right font-mono text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500" />
                        <button onClick={() => applySplit(r)} className="ml-1 p-1 rounded-lg hover:bg-slate-100 cursor-pointer" title="Split gross into components" aria-label="Split"><Wand2 className="w-3.5 h-3.5 text-amber-700" /></button>
                      </td>
                      {NUM.slice(0, 5).map((k) => numCell(r, k))}
                      <td className="px-3 text-right font-mono font-bold">{money(gross(r))}</td>
                      {numCell(r, 'tdsMonthly')}
                      {chk(r, 'pfApplicable')}{chk(r, 'esiApplicable')}{chk(r, 'ptApplicable')}{chk(r, 'overtimeEligible')}
                      <td className="px-3 text-right font-mono text-emerald-700 font-bold">{r.hasStructure && !dirty ? money(r.netSalary) : <span className="text-slate-300">{dirty ? 'unsaved' : '—'}</span>}</td>
                      <td className="px-2"><button className={btn} onClick={() => setDetail(r.employeeId)} title="UAN, ESI no, PAN, effective date"><Settings2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager p={paged} />
        </div>
      )}

      {cur && (
        <Modal title={`Statutory details — ${cur.employeeName}`} onClose={() => setDetail(null)}>
          <div className="space-y-3">
            <Field label="Effective from"><input type="date" className={`${inputCls} w-full`} value={cur.effectiveFrom} onChange={(e) => patch(cur.employeeId, { effectiveFrom: e.target.value })} /></Field>
            <p className="text-[11px] text-slate-500">Changing the date of an existing structure creates a new revision (the old one is kept for history). Leave it unchanged to correct the current one.</p>
            <Field label="UAN (PF)"><input className={`${inputCls} w-full`} value={cur.uanNumber} onChange={(e) => patch(cur.employeeId, { uanNumber: e.target.value })} /></Field>
            <Field label="ESI number"><input className={`${inputCls} w-full`} value={cur.esiNumber} onChange={(e) => patch(cur.employeeId, { esiNumber: e.target.value })} /></Field>
            <Field label="PAN"><input className={`${inputCls} w-full uppercase`} value={cur.panNumber} maxLength={10} onChange={(e) => patch(cur.employeeId, { panNumber: e.target.value })} placeholder="ABCDE1234F" /></Field>
            <div className="flex justify-end"><button className={btnPrimary} onClick={() => setDetail(null)}>Done</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
