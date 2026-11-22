'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { api } from '../../../../lib/apiClient';
import { toast } from '../../../../context/ToastContext';
import { card, btn, btnPrimary, inputCls, thCls, Modal, Field, usePaged, Pager, Loading, errText, DailyEmployeeRow } from './shared';

interface Props {
  logs: any[];
  loading: boolean;
  employees: DailyEmployeeRow[];
  isAdmin: boolean;
  mappedBy: string;
  onChanged: () => void;
}

export default function UnmappedTab({ logs, loading, employees, isAdmin, mappedBy, onChanged }: Props) {
  const [code, setCode] = useState<string | null>(null);
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);

  // one row per machine code (many punches share a code)
  const grouped = useMemo(() => {
    const m = new Map<string, { code: string; name: string; count: number; last: string; error: string }>();
    logs.forEach((l) => {
      const c = String(l.empCode ?? l.emp_code ?? '');
      const t = l.punchDatetime || l.punch_datetime || '';
      const cur = m.get(c) || { code: c, name: l.empName || l.emp_name || '', count: 0, last: '', error: l.syncError || l.sync_error || '' };
      cur.count += 1;
      if (t > cur.last) cur.last = t;
      m.set(c, cur);
    });
    return Array.from(m.values()).sort((a, b) => b.count - a.count);
  }, [logs]);
  const paged = usePaged(grouped, 'u');

  // only employees without a machine code are sensible targets
  const candidates = useMemo(() => employees.filter((e) => !e.machineEmpCode), [employees]);

  const reprocess = async () => {
    setBusy(true);
    try { const r: any = await api.hr.biometricMappings.reprocess(); toast.success(r?.message || 'Reprocess completed'); onChanged(); }
    catch (e) { toast.error(errText(e, 'Reprocessing failed')); } finally { setBusy(false); }
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !target) return;
    setBusy(true);
    try {
      await api.hr.biometricMappings.create({ machineEmpCode: code, employeeId: target, mappedBy });
      await api.hr.biometricMappings.reprocess();
      toast.success(`Machine code ${code} mapped to ${target}`);
      setCode(null); setTarget(''); onChanged();
    } catch (err) { toast.error(errText(err, 'Failed to save mapping')); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900">Punches from machine codes not linked to any employee</div>
            <div className="text-amber-700 mt-0.5">Link each code to the right employee yourself — never guess by name. After linking, past punches are reprocessed automatically.</div>
          </div>
        </div>
        {isAdmin && <button onClick={reprocess} disabled={busy} className={btnPrimary}><RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} /> Reprocess all</button>}
      </div>

      <div className={`${card} overflow-hidden`}>
        {loading && logs.length === 0 ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead className="bg-slate-50 border-b border-[color:var(--crm-border-default)]">
                <tr>{['Machine code', 'Name on machine', 'Punches', 'Last punch', 'Issue', ''].map((h, i) => <th key={i} className={`${thCls} ${i === 5 ? 'text-right' : ''}`}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                {paged.slice.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400"><CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" /><b className="block text-slate-600">All punches are mapped</b>Every machine code matches an employee.</td></tr>
                ) : paged.slice.map((g) => (
                  <tr key={g.code} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4"><span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">{g.code}</span></td>
                    <td className="py-3 px-4 font-medium text-slate-800">{g.name || '--'}</td>
                    <td className="py-3 px-4 font-bold">{g.count}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{g.last ? new Date(g.last).toLocaleString('en-IN') : '--'}</td>
                    <td className="py-3 px-4 text-rose-600">{g.error || 'Unmapped machine code'}</td>
                    <td className="py-3 px-4 text-right">{isAdmin ? <button className={btn} onClick={() => { setCode(g.code); setTarget(''); }}><LinkIcon className="w-3.5 h-3.5" /> Map to employee</button> : <span className="text-slate-300">Admin only</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager p={paged} />
      </div>

      {code && (
        <Modal title="Map machine code to employee" onClose={() => setCode(null)}>
          <form onSubmit={save} className="space-y-4">
            <p className="text-xs text-slate-500">Which employee uses machine code <b className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">{code}</b>? Only employees without a machine code are listed.</p>
            <Field label="Employee">
              <select required value={target} onChange={(e) => setTarget(e.target.value)} className={`${inputCls} w-full`}>
                <option value="">— Choose employee —</option>
                {candidates.map((e) => <option key={e.employeeId} value={e.employeeId}>{e.employeeId} — {e.employeeName} ({e.department || 'General'})</option>)}
              </select>
            </Field>
            {candidates.length === 0 && <p className="text-[11px] text-rose-600">Every employee already has a machine code.</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className={btn} onClick={() => setCode(null)}>Cancel</button>
              <button type="submit" className={btnPrimary} disabled={busy || !target}>{busy ? 'Saving…' : 'Save & reprocess'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
