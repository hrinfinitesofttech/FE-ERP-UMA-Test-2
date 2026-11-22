'use client';

import React, { useMemo, useState } from 'react';
import { Search, Check, X as XIcon } from 'lucide-react';
import { api } from '../../../../lib/apiClient';
import { toast } from '../../../../context/ToastContext';
import { card, inputCls, btn, thCls, usePaged, Pager, Loading, errText, StatusBadge } from './shared';

interface Props {
  rows: any[];
  loading: boolean;
  canApprove: boolean;
  onChanged: () => void;
}

const g = (r: any, camel: string, snake: string) => r[camel] ?? r[snake] ?? '';
const TONE: Record<string, string> = { Approved: 'bg-emerald-100 text-emerald-800', Rejected: 'bg-rose-100 text-rose-800', Pending: 'bg-amber-100 text-amber-800' };

export default function RegularizationsTab({ rows, loading, canApprove, onChanged }: Props) {
  const [status, setStatus] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState('');

  const counts = useMemo(() => ({
    ALL: rows.length,
    Pending: rows.filter((r) => (r.status || 'Pending') === 'Pending').length,
    Approved: rows.filter((r) => r.status === 'Approved').length,
    Rejected: rows.filter((r) => r.status === 'Rejected').length,
  }), [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) =>
      (status === 'ALL' || (r.status || 'Pending') === status) &&
      (!s || [g(r, 'employeeName', 'employee_name'), g(r, 'regularizationNo', 'regularization_no'), r.reason].some((x) => String(x || '').toLowerCase().includes(s))));
  }, [rows, status, q]);
  const paged = usePaged(filtered, `${status}|${q}`);

  const act = async (r: any, kind: 'approve' | 'reject') => {
    setBusyId(r.id);
    try {
      await (kind === 'approve' ? api.hr.regularization.approve(r.id) : api.hr.regularization.reject(r.id));
      toast.success(`Request ${kind === 'approve' ? 'approved' : 'rejected'}`);
      onChanged();
    } catch (e) { toast.error(errText(e)); } finally { setBusyId(''); }
  };
  const confirmReject = (r: any) => toast.confirm({
    title: 'Reject this request?', message: `${g(r, 'employeeName', 'employee_name')} — ${r.date}`, confirmText: 'Reject', variant: 'danger',
    onConfirm: () => act(r, 'reject'),
  });

  return (
    <div className="space-y-4">
      <div className={`${card} p-3 flex flex-wrap items-center gap-2`}>
        {(['Pending', 'Approved', 'Rejected', 'ALL'] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            {s === 'ALL' ? 'All' : s} <span className="font-mono">{counts[s]}</span>
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search employee, request no, reason…" className={`${inputCls} pl-8 w-64`} aria-label="Search requests" />
        </div>
      </div>

      <div className={`${card} overflow-hidden`}>
        {loading && rows.length === 0 ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-xs">
              <thead className="bg-slate-50 border-b border-[color:var(--crm-border-default)]">
                <tr>{['Request #', 'Employee', 'Date', 'Change requested', 'Corrected times', 'Reason', 'Status', ''].map((h, i) => <th key={i} className={`${thCls} ${i === 7 ? 'text-right' : ''}`}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                {paged.slice.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-slate-400">{status === 'Pending' ? 'No requests are waiting for approval.' : 'No requests found.'}</td></tr>
                ) : paged.slice.map((r) => {
                  const st = r.status || 'Pending';
                  const cin = g(r, 'correctedCheckIn', 'corrected_check_in');
                  const cout = g(r, 'correctedCheckOut', 'corrected_check_out');
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{g(r, 'regularizationNo', 'regularization_no') || r.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{g(r, 'employeeName', 'employee_name')}<div className="text-[11px] text-slate-400 font-mono font-normal">{g(r, 'employeeId', 'employee_id')}</div></td>
                      <td className="py-3 px-4 font-mono">{r.date}</td>
                      <td className="py-3 px-4"><span className="inline-flex items-center gap-1.5"><StatusBadge status={g(r, 'originalStatus', 'original_status') || '—'} /> → <StatusBadge status={g(r, 'requestedStatus', 'requested_status') || '—'} /></span></td>
                      <td className="py-3 px-4 font-mono text-slate-600">{cin || cout ? `${cin || '--:--'} → ${cout || '--:--'}` : '—'}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-[240px]"><span className="line-clamp-2" title={r.reason}>{r.reason || '--'}</span></td>
                      <td className="py-3 px-4"><span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${TONE[st] || TONE.Pending}`}>{st}</span></td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {st === 'Pending' && canApprove ? (
                          <>
                            <button disabled={busyId === r.id} onClick={() => act(r, 'approve')} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"><Check className="w-3.5 h-3.5" /> Approve</button>{' '}
                            <button disabled={busyId === r.id} onClick={() => confirmReject(r)} className="px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"><XIcon className="w-3.5 h-3.5" /> Reject</button>
                          </>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager p={paged} />
      </div>
      <p className="text-[11px] text-slate-400">New requests are raised from the Daily Attendance tab (Correct / Request button next to an employee).</p>
    </div>
  );
}
