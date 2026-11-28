'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { api } from '../../../lib/apiClient';
import { toast } from '../../../context/ToastContext';
import { ERPModal } from '../../../components/ui/ERPModal';
import {
  Badge, HANDOVER_STATUS, btnGhost, btnPrimary, cardCls, errText, fmtWhen, inputCls, labelCls, thCls,
} from '../../../components/nesting/common';

type Action = 'accept' | 'rework' | 'reject';
const ACTION_META: Record<Action, { title: string; button: string; ok: string; needReason: boolean; cls: string }> = {
  accept: { title: 'Accept parts', button: 'Accept', ok: 'Accepted', needReason: false, cls: 'bg-emerald-600 hover:bg-emerald-700' },
  rework: { title: 'Send back for rework', button: 'Send for rework', ok: 'Sent back for rework', needReason: true, cls: 'bg-orange-600 hover:bg-orange-700' },
  reject: { title: 'Reject parts', button: 'Reject', ok: 'Rejected', needReason: true, cls: 'bg-red-600 hover:bg-red-700' },
};

export default function ProductionReviewPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'review' | 'back' | 'done'>('review');
  const [dialog, setDialog] = useState<{ action: Action; h: any } | null>(null);
  const [qty, setQty] = useState<any>('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api.get('/nesting/handovers/');
      setRows(Array.isArray(r) ? r : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => ({
    review: rows.filter((h) => h.status === 'handed_over'),
    back: rows.filter((h) => h.needsAttention),
    done: rows.filter((h) => h.status === 'accepted'),
  }), [rows]);

  const list = groups[tab];

  const openDialog = (action: Action, h: any) => {
    setDialog({ action, h });
    setQty(h.qty);
    setReason('');
  };

  const submit = async () => {
    if (!dialog) return;
    const meta = ACTION_META[dialog.action];
    if (meta.needReason && !reason.trim()) return toast.error('Please write what is wrong with the part.');
    setBusy(true);
    try {
      await api.post(`/nesting/handovers/${dialog.h.id}/${dialog.action}/`, { qty: Number(qty), reason });
      toast.success(meta.ok);
      setDialog(null);
      await load();
    } catch (e: any) {
      toast.error(errText(e));
    } finally {
      setBusy(false);
    }
  };

  const tabs: [typeof tab, string, number][] = [
    ['review', 'Waiting for my review', groups.review.length],
    ['back', 'Sent back to Nesting', groups.back.length],
    ['done', 'Accepted', groups.done.length],
  ];

  return (
    <div className="p-6 space-y-5">
      <div className={`${cardCls} p-5`}>
        <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">Production review of cut parts</h1>
        <p className="text-xs text-[color:var(--crm-text-secondary)] mt-1">
          Parts handed over by Nesting. Accept them, or send back for rework / reject with a reason — Nesting is told and redoes the parts.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(([k, label, n]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${tab === k
              ? 'bg-crm-brand-700 text-white border-crm-brand-700'
              : 'bg-white text-[color:var(--crm-text-primary)] border-[color:var(--crm-border-default)] hover:bg-[color:var(--crm-surface-subtle)]'}`}>
            {label} <span className={`ml-1 px-1.5 rounded-full text-[10px] ${k === 'back' && n > 0 ? 'bg-red-600 text-white' : 'bg-black/10'}`}>{n}</span>
          </button>
        ))}
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[#F4F6FA]/90 border-b border-[color:var(--crm-border-default)]">
              <tr>
                <th className={thCls}>Part</th><th className={thCls}>Job / Customer</th><th className={thCls}>Qty</th>
                <th className={thCls}>Status</th><th className={thCls}>Handed over</th>
                <th className={thCls}>{tab === 'review' ? 'Decision' : 'Review'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)]">
              {loading && <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>}
              {!loading && list.length === 0 && <tr><td colSpan={6} className="p-8 text-center">Nothing here.</td></tr>}
              {list.map((h) => (
                <tr key={h.id} className={h.needsAttention ? 'bg-red-50/70' : ''}>
                  <td className="p-3">
                    <div className="font-semibold text-[color:var(--crm-text-primary)]">{h.partName}</div>
                    <div className="font-mono">{h.partNumber} {h.thicknessMm ? `· ${h.thicknessMm} mm` : ''}</div>
                    {h.kind === 'rework' && <span className="px-1 rounded bg-orange-100 text-orange-700 text-[10px] font-bold">REWORKED PARTS</span>}
                  </td>
                  <td className="p-3">
                    <Link href={`/nesting/${encodeURIComponent(h.jobId)}`} className="font-mono text-crm-brand-700 font-bold">{h.nestingNumber}</Link>
                    <div>{h.jobNumber} · {h.customerName}</div>
                  </td>
                  <td className="p-3 font-mono font-bold text-sm">{h.qty}</td>
                  <td className="p-3"><Badge map={HANDOVER_STATUS} value={h.status} /></td>
                  <td className="p-3">{h.handedBy}<div className="text-[10px]">{fmtWhen(h.handedAt)}</div>{h.handoverRemarks && <div className="italic">{h.handoverRemarks}</div>}</td>
                  <td className="p-3">
                    {tab === 'review' ? (
                      <div className="flex gap-1.5 flex-wrap">
                        <button className={`${btnPrimary} !bg-emerald-600 hover:!bg-emerald-700`} onClick={() => openDialog('accept', h)}><CheckCircle2 className="w-3.5 h-3.5" /> Accept</button>
                        <button className={btnGhost} onClick={() => openDialog('rework', h)}><RotateCcw className="w-3.5 h-3.5" /> Rework</button>
                        <button className={`${btnGhost} !text-red-700 !border-red-300`} onClick={() => openDialog('reject', h)}><XCircle className="w-3.5 h-3.5" /> Reject</button>
                      </div>
                    ) : (
                      <div>
                        {h.reviewedBy}<div className="text-[10px]">{fmtWhen(h.reviewedAt)}</div>
                        {h.reviewReason && (
                          <div className="text-red-700 flex items-start gap-1 mt-0.5"><AlertTriangle className="w-3 h-3 mt-0.5" />{h.reviewReason}</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ERPModal isOpen={!!dialog} onClose={() => setDialog(null)} size="sm"
        title={dialog ? `${ACTION_META[dialog.action].title} — ${dialog.h.partName}` : ''}
        footer={dialog && (
          <div className="flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setDialog(null)}>Cancel</button>
            <button className={`inline-flex items-center px-3.5 py-2 rounded-lg text-white text-xs font-semibold disabled:opacity-50 ${ACTION_META[dialog.action].cls}`}
              disabled={busy} onClick={submit}>{ACTION_META[dialog.action].button}</button>
          </div>
        )}>
        {dialog && (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Quantity (of {dialog.h.qty} handed over)</label>
              <input type="number" min={1} max={dialog.h.qty} className={inputCls} value={qty} onChange={(e) => setQty(e.target.value)} />
              <p className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">Use a smaller number to decide only part of the lot now.</p>
            </div>
            <div>
              <label className={labelCls}>{ACTION_META[dialog.action].needReason ? 'What is wrong? *' : 'Remarks'}</label>
              <textarea className={inputCls} rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder={dialog.action === 'accept' ? 'Optional' : 'Wrong size, dross on edge, hole position, ...'} />
            </div>
          </div>
        )}
      </ERPModal>
    </div>
  );
}
