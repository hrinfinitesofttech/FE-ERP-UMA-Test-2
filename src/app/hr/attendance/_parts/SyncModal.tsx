'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/apiClient';
import { toast } from '../../../../context/ToastContext';
import { btn, btnPrimary, inputCls, Modal, Field, errText, localISO } from './shared';

interface Props {
  machineStatus: any;
  onClose: () => void;
  onDone: () => void;
}

type Mode = 'incremental' | 'date_range' | 'historical_raw';

/** Admin-only: run a biometric sync and manage machine credentials. */
export default function SyncModal({ machineStatus, onClose, onDone }: Props) {
  const today = localISO();
  const [tab, setTab] = useState<'sync' | 'creds'>('sync');
  const [mode, setMode] = useState<Mode>('incremental');
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [dry, setDry] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [corp, setCorp] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [base, setBase] = useState('https://api.etimeoffice.com/api');

  useEffect(() => {
    if (!machineStatus) return;
    if (machineStatus.corporate_id) setCorp(machineStatus.corporate_id);
    if (machineStatus.username) setUser(machineStatus.username);
    if (machineStatus.base_url) setBase(machineStatus.base_url);
  }, [machineStatus]);

  const runSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'incremental' && from > to) return toast.error('From date must not be after To date');
    setBusy(true); setResult(null);
    try {
      const payload: any = { sync_mode: mode, dry_run: dry };
      if (mode !== 'incremental') { payload.from_date = from; payload.to_date = to; }
      const r: any = await api.hr.punchMachine.sync(payload);
      setResult(r);
      if (r.success) {
        toast.success(dry ? `Preview: ${r.records_fetched || 0} records found` : `Sync complete: ${r.new_logs_saved || 0} new logs, ${r.attendance_processed || 0} attendance records updated`);
        if (!dry) onDone();
      } else toast.error(r.error || 'Machine returned an error');
    } catch (err) { toast.error(errText(err, 'Biometric sync failed')); } finally { setBusy(false); }
  };

  const saveCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r: any = await api.hr.punchMachine.saveCredentials({ corporate_id: corp, username: user, password: pass, base_url: base });
      toast.success(r?.message || 'Credentials saved');
      setPass(''); onDone();
    } catch (err) { toast.error(errText(err, 'Failed to save credentials')); } finally { setBusy(false); }
  };

  return (
    <Modal title="Biometric sync & machine settings" onClose={onClose} wide>
      <div className="flex gap-1 mb-4 border-b border-slate-200 text-xs font-bold">
        {([['sync', 'Run sync'], ['creds', 'Machine credentials']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-3 pb-2 border-b-2 cursor-pointer ${tab === k ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {tab === 'sync' ? (
        <form onSubmit={runSync} className="space-y-3">
          <Field label="Sync mode">
            <select className={`${inputCls} w-full`} value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              <option value="incremental">Incremental — only new punches since last sync (normal use)</option>
              <option value="date_range">Date range — re-fetch a period</option>
              <option value="historical_raw">Historical raw — import old raw logs</option>
            </select>
          </Field>
          {mode !== 'incremental' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="From"><input type="date" max={today} className={`${inputCls} w-full`} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
              <Field label="To"><input type="date" max={today} className={`${inputCls} w-full`} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
            </div>
          )}
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={dry} onChange={(e) => setDry(e.target.checked)} /> Dry run — preview only, nothing is saved</label>
          {result && (
            <div className={`p-3 rounded-xl text-xs border ${result.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {result.success
                ? <>Fetched <b>{result.records_fetched ?? 0}</b> · new logs <b>{result.new_logs_saved ?? 0}</b> · attendance updated <b>{result.attendance_processed ?? 0}</b></>
                : result.error || 'Sync failed'}
            </div>
          )}
          <div className="flex justify-end gap-2"><button type="button" className={btn} onClick={onClose}>Close</button><button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Working…' : dry ? 'Preview' : 'Start sync'}</button></div>
        </form>
      ) : (
        <form onSubmit={saveCreds} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Corporate ID"><input className={`${inputCls} w-full`} value={corp} onChange={(e) => setCorp(e.target.value)} /></Field>
            <Field label="Username"><input className={`${inputCls} w-full`} value={user} onChange={(e) => setUser(e.target.value)} autoComplete="off" /></Field>
          </div>
          <Field label="Password"><input type="password" className={`${inputCls} w-full`} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Leave blank to keep the saved password" autoComplete="new-password" /></Field>
          <Field label="API base URL"><input className={`${inputCls} w-full`} value={base} onChange={(e) => setBase(e.target.value)} /></Field>
          <div className="flex justify-end gap-2"><button type="button" className={btn} onClick={onClose}>Close</button><button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Saving…' : 'Save credentials'}</button></div>
        </form>
      )}
    </Modal>
  );
}
