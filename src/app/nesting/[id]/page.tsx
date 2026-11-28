'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Download, FileText, Play, Plus, RotateCcw, Scissors, Send } from 'lucide-react';
import { api } from '../../../lib/apiClient';
import { toast } from '../../../context/ToastContext';
import { ERPModal } from '../../../components/ui/ERPModal';
import { ShareToNestingModal } from '../../../components/nesting/ShareToNestingModal';
import {
  Badge, HANDOVER_STATUS, JOB_STATUS, ProgressBar, btnGhost, btnPrimary, cardCls, downloadFile, errText,
  fmtKg, fmtMoney, fmtWhen, inputCls, labelCls, thCls,
} from '../../../components/nesting/common';

type Dialog =
  | { kind: 'start' }
  | { kind: 'task' }
  | { kind: 'cut'; task: any }
  | { kind: 'handover'; task: any }
  | { kind: 'resubmit'; handover: any }
  | { kind: 'sheet' }
  | null;

export default function NestingJobDetailPage() {
  const params = useParams();
  const id = decodeURIComponent(String(params?.id || ''));
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [form, setForm] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setJob(await api.get(`/nesting/jobs/${encodeURIComponent(id)}/`));
    } catch (e: any) {
      toast.error(errText(e, 'Could not load nesting job'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (d: Dialog, initial: any = {}) => {
    setForm(initial);
    setDialog(d);
  };
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  /** Run an API call, refresh, close the dialog. */
  const run = async (fn: () => Promise<any>, okMsg: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(okMsg);
      setDialog(null);
      await load();
    } catch (e: any) {
      toast.error(errText(e));
    } finally {
      setBusy(false);
    }
  };

  const download = async (f: any) => {
    if (!downloadFile(f)) return toast.error('This file has no downloadable content. Ask Design to share it again.');
    api.post(`/nesting/jobs/${encodeURIComponent(id)}/mark-downloaded/`, { fileId: f.id }).then(load).catch(() => {});
  };

  if (loading) return <div className="p-8 text-sm">Loading...</div>;
  if (!job) return <div className="p-8 text-sm">Nesting job not found. <Link href="/nesting" className="text-crm-brand-700">Back</Link></div>;

  const s = job.summary || {};
  const tasks: any[] = job.tasks || [];
  const handovers: any[] = job.handovers || [];
  const sheets: any[] = job.sheetUsages || [];
  const attention = handovers.filter((h) => h.needsAttention);

  return (
    <div className="p-6 space-y-5">
      <Link href="/nesting" className="inline-flex items-center gap-1 text-xs text-[color:var(--crm-text-secondary)] hover:text-crm-brand-700">
        <ArrowLeft className="w-3.5 h-3.5" /> All nesting jobs
      </Link>

      {/* header */}
      <div className={`${cardCls} p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-crm-brand-700/10 text-crm-brand-700 text-xs font-mono font-bold">{job.nestingNumber}</span>
            <Badge map={JOB_STATUS} value={job.status} />
          </div>
          <h1 className="text-xl font-black text-[color:var(--crm-text-primary)]">{job.productName || 'Nesting job'}</h1>
          <p className="text-xs text-[color:var(--crm-text-secondary)]">
            {job.customerName} · Project {job.projectNumber || '-'} · Job {job.jobNumber || '-'} · Design {job.designJobNumber || '-'}
          </p>
          <p className="text-xs text-[color:var(--crm-text-secondary)]">
            Engineer: <b>{job.assignedTo || 'not assigned'}</b> · Machine: <b>{job.cuttingMachine || '-'}</b> · Program: <b>{job.programReference || '-'}</b>
          </p>
          {job.remarks && <p className="text-xs italic text-[color:var(--crm-text-secondary)] whitespace-pre-line">“{job.remarks}”</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className={btnGhost} onClick={() => setShareOpen(true)}><FileText className="w-3.5 h-3.5" /> Add more design files</button>
          <button className={btnPrimary} onClick={() => open({ kind: 'start' }, {
            assignedTo: job.assignedTo, cuttingMachine: job.cuttingMachine, programReference: job.programReference })}>
            <Play className="w-3.5 h-3.5" /> {job.status === 'received' ? 'Start nesting' : 'Machine / program'}
          </button>
        </div>
      </div>

      {/* numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          ['Parts required', s.requiredQty], ['Parts cut', `${s.cutQty} (${s.progressPercent}%)`],
          ['Awaiting Production', s.awaitingReviewQty], ['Accepted', s.acceptedQty],
          ['Rework / rejected', s.reworkQty], ['Sheets used', `${s.sheetsUsed}${s.sheetsLeftover ? ` · ${s.sheetsLeftover} left` : ''}`],
        ].map(([label, value]) => (
          <div key={String(label)} className={`${cardCls} p-3 ${label === 'Rework / rejected' && Number(value) > 0 ? 'border-red-300 bg-red-50' : ''}`}>
            <div className="text-lg font-black text-[color:var(--crm-text-primary)]">{value ?? 0}</div>
            <div className="text-[11px] text-[color:var(--crm-text-secondary)]">{label}</div>
          </div>
        ))}
      </div>

      {/* rework banner */}
      {attention.length > 0 && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" /> Production sent {attention.reduce((a, h) => a + h.qty, 0)} part(s) back — redo and hand over again
          </div>
          {attention.map((h) => (
            <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-lg border border-red-200 p-3 text-xs">
              <div>
                <b>{h.qty} × {h.partName}</b> <Badge map={HANDOVER_STATUS} value={h.status} />
                <div className="text-red-700 mt-1">Reason: {h.reviewReason || '-'} <span className="text-[color:var(--crm-text-secondary)]">({h.reviewedBy}, {fmtWhen(h.reviewedAt)})</span></div>
              </div>
              <button className={btnPrimary} onClick={() => open({ kind: 'resubmit', handover: h }, { qty: h.qty, remarks: '' })}>
                <RotateCcw className="w-3.5 h-3.5" /> Reworked — hand over again
              </button>
            </div>
          ))}
        </div>
      )}

      {/* files */}
      <div className={`${cardCls} p-5`}>
        <h2 className="text-sm font-bold text-[color:var(--crm-text-primary)] mb-3">Design files (download and load into the cutting software)</h2>
        {(job.files || []).length === 0 && <p className="text-xs text-[color:var(--crm-text-secondary)]">No files shared yet.</p>}
        <div className="divide-y divide-[color:var(--crm-border-default)]">
          {(job.files || []).map((f: any) => (
            <div key={f.id} className="flex flex-wrap items-center gap-3 py-2.5 text-xs">
              <FileText className="w-4 h-4 text-[color:var(--crm-text-tertiary)]" />
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold text-[color:var(--crm-text-primary)]">{f.fileName}</div>
                <div className="text-[color:var(--crm-text-secondary)]">
                  {f.source}{f.revision ? ` · ${f.revision}` : ''} · shared by {f.sharedBy} {fmtWhen(f.sharedAt)}
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">{f.fileType}</span>
              {f.downloadedBy
                ? <span className="text-emerald-700">Downloaded by {f.downloadedBy} · {fmtWhen(f.downloadedAt)}</span>
                : <span className="text-amber-700">Not downloaded yet</span>}
              <button className={btnGhost} onClick={() => download(f)}><Download className="w-3.5 h-3.5" /> Download</button>
            </div>
          ))}
        </div>
      </div>

      {/* tasks */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-sm font-bold text-[color:var(--crm-text-primary)]">Cutting tasks (parts and quantities)</h2>
          <button className={btnPrimary} onClick={() => open({ kind: 'task' }, { materialGrade: 'MS', requiredQty: 1, machine: job.cuttingMachine })}>
            <Plus className="w-3.5 h-3.5" /> Add task
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[#F4F6FA]/90 border-y border-[color:var(--crm-border-default)]">
              <tr>
                <th className={thCls}>Part</th><th className={thCls}>Material</th><th className={`${thCls} w-44`}>Cut / required</th>
                <th className={thCls}>With Production</th><th className={thCls}>Accepted</th><th className={thCls}>Rework</th><th className={thCls}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)]">
              {tasks.length === 0 && <tr><td colSpan={7} className="p-6 text-center">No tasks yet. Add the parts to cut and the quantity of each.</td></tr>}
              {tasks.map((t) => {
                const q = t.quantities || {};
                return (
                  <tr key={t.id} className={q.reworkQty > 0 ? 'bg-red-50/60' : ''}>
                    <td className="p-3">
                      <div className="font-semibold text-[color:var(--crm-text-primary)]">{t.partName}</div>
                      <div className="font-mono">{t.partNumber}{t.drawingNumber ? ` · ${t.drawingNumber}` : ''}{t.programNo ? ` · NC ${t.programNo}` : ''}</div>
                    </td>
                    <td className="p-3">{t.materialGrade} {t.thicknessMm ? `${t.thicknessMm} mm` : ''}</td>
                    <td className="p-3">
                      <div className="flex justify-between font-mono mb-1"><span>{t.cutQty} / {t.requiredQty}</span><span>{t.progressPercent}%</span></div>
                      <ProgressBar value={t.progressPercent} tone={t.progressPercent >= 100 ? 'green' : 'brand'} />
                    </td>
                    <td className="p-3 font-mono">{q.awaitingReviewQty}</td>
                    <td className="p-3 font-mono text-emerald-700 font-bold">{q.acceptedQty}</td>
                    <td className="p-3 font-mono">{q.reworkQty > 0 ? <b className="text-red-700">{q.reworkQty}</b> : 0}</td>
                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <button className={btnGhost} disabled={q.remainingToCutQty <= 0} onClick={() => open({ kind: 'cut', task: t }, { qty: q.remainingToCutQty, note: '' })}>
                          <Scissors className="w-3.5 h-3.5" /> Log cutting
                        </button>
                        <button className={btnGhost} disabled={q.availableToHandOverQty <= 0} onClick={() => open({ kind: 'handover', task: t }, { qty: q.availableToHandOverQty, remarks: '' })}>
                          <Send className="w-3.5 h-3.5" /> Hand over ({q.availableToHandOverQty})
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* hand-over history */}
      <div className={`${cardCls} overflow-hidden`}>
        <h2 className="text-sm font-bold text-[color:var(--crm-text-primary)] p-5 pb-3">Hand-over history</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[#F4F6FA]/90 border-y border-[color:var(--crm-border-default)]">
              <tr><th className={thCls}>Ref</th><th className={thCls}>Part</th><th className={thCls}>Qty</th><th className={thCls}>Status</th><th className={thCls}>Handed over</th><th className={thCls}>Production review</th></tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)]">
              {handovers.length === 0 && <tr><td colSpan={6} className="p-6 text-center">Nothing handed over yet.</td></tr>}
              {handovers.map((h) => (
                <tr key={h.id} className={h.needsAttention ? 'bg-red-50/70' : ''}>
                  <td className="p-3 font-mono">{h.id}{h.kind === 'rework' && <span className="ml-1 px-1 rounded bg-orange-100 text-orange-700">REWORKED</span>}</td>
                  <td className="p-3">{h.partName}</td>
                  <td className="p-3 font-mono font-bold">{h.qty}</td>
                  <td className="p-3"><Badge map={HANDOVER_STATUS} value={h.status} />{h.resolved && h.status !== 'accepted' && <span className="ml-1 text-[10px]">(redone)</span>}</td>
                  <td className="p-3">{h.handedBy}<div className="text-[10px]">{fmtWhen(h.handedAt)}</div></td>
                  <td className="p-3">{h.reviewedBy ? <>{h.reviewedBy}<div className="text-[10px]">{fmtWhen(h.reviewedAt)}</div>{h.reviewReason && <div className="text-red-700">{h.reviewReason}</div>}</> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* sheets */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-sm font-bold text-[color:var(--crm-text-primary)]">MS sheets used and left over</h2>
          <button className={btnPrimary} onClick={() => open({ kind: 'sheet' }, {
            materialGrade: 'MS', sheetLengthMm: 2500, sheetWidthMm: 1250, sheetsIssued: 0, sheetsUsed: 0, leftoverWeightKg: 0, ratePerKg: 0 })}>
            <Plus className="w-3.5 h-3.5" /> Add sheet usage
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[#F4F6FA]/90 border-y border-[color:var(--crm-border-default)]">
              <tr>
                <th className={thCls}>Sheet</th><th className={thCls}>Issued</th><th className={thCls}>Used</th><th className={thCls}>Left over (sheets)</th>
                <th className={thCls}>Offcut kg</th><th className={thCls}>Weight used</th><th className={thCls}>Net weight</th><th className={thCls}>Cost</th><th className={thCls}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)]">
              {sheets.length === 0 && <tr><td colSpan={9} className="p-6 text-center">No sheet usage recorded yet.</td></tr>}
              {sheets.map((u) => (
                <tr key={u.id}>
                  <td className="p-3">{u.materialGrade} {u.thicknessMm} mm<div className="font-mono">{u.sheetLengthMm}×{u.sheetWidthMm}</div></td>
                  <td className="p-3 font-mono">{u.sheetsIssued}</td>
                  <td className="p-3 font-mono font-bold">{u.sheetsUsed}</td>
                  <td className="p-3 font-mono">{u.sheetsLeftover}</td>
                  <td className="p-3 font-mono">{u.leftoverWeightKg}</td>
                  <td className="p-3 font-mono">{fmtKg(u.grossWeightKg)}</td>
                  <td className="p-3 font-mono font-bold">{fmtKg(u.netWeightKg)}</td>
                  <td className="p-3 font-mono">{fmtMoney(u.netCost)}</td>
                  <td className="p-3">
                    <button className="text-red-600 text-[11px]" onClick={() => toast.confirm({
                      title: 'Delete sheet usage?', message: 'This removes the entry from the material estimate.',
                      onConfirm: async () => { await api.delete(`/nesting/sheet-usage/${u.id}/`); load(); } } as any)}>delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
            {sheets.length > 0 && (
              <tfoot className="bg-[#F4F6FA]/70 font-bold text-[color:var(--crm-text-primary)]">
                <tr>
                  <td className="p-3">Total</td><td className="p-3 font-mono">{s.sheetsIssued}</td><td className="p-3 font-mono">{s.sheetsUsed}</td>
                  <td className="p-3 font-mono">{s.sheetsLeftover}</td><td className="p-3 font-mono">{s.leftoverWeightKg}</td>
                  <td className="p-3 font-mono">{fmtKg(s.grossWeightKg)}</td><td className="p-3 font-mono">{fmtKg(s.netWeightKg)}</td>
                  <td className="p-3 font-mono">{fmtMoney(s.netCost)}</td><td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ---------------- dialogs ---------------- */}
      <ERPModal isOpen={dialog?.kind === 'start'} onClose={() => setDialog(null)} size="md" title="Nesting engineer, machine and program"
        footer={<div className="flex justify-end gap-2"><button className={btnGhost} onClick={() => setDialog(null)}>Cancel</button>
          <button className={btnPrimary} disabled={busy} onClick={() => run(() => api.post(`/nesting/jobs/${encodeURIComponent(id)}/start/`, form), 'Saved')}>Save</button></div>}>
        <div className="space-y-3">
          <div><label className={labelCls}>Nesting engineer</label><input className={inputCls} value={form.assignedTo || ''} onChange={(e) => set('assignedTo', e.target.value)} /></div>
          <div><label className={labelCls}>Cutting machine (Plasma / Laser)</label><input className={inputCls} value={form.cuttingMachine || ''} onChange={(e) => set('cuttingMachine', e.target.value)} /></div>
          <div><label className={labelCls}>Program / layout reference</label><input className={inputCls} value={form.programReference || ''} onChange={(e) => set('programReference', e.target.value)} /></div>
        </div>
      </ERPModal>

      <ERPModal isOpen={dialog?.kind === 'task'} onClose={() => setDialog(null)} size="lg" title="Add cutting task"
        footer={<div className="flex justify-end gap-2"><button className={btnGhost} onClick={() => setDialog(null)}>Cancel</button>
          <button className={btnPrimary} disabled={busy || !form.partName} onClick={() => run(() => api.post('/nesting/tasks/', {
            jobId: job.id, partName: form.partName, partNumber: form.partNumber || '', drawingNumber: form.drawingNumber || '',
            materialGrade: form.materialGrade || 'MS', thicknessMm: Number(form.thicknessMm) || 0, requiredQty: Number(form.requiredQty) || 1,
            machine: form.machine || '', programNo: form.programNo || '' }), 'Task added')}>Add task</button></div>}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={labelCls}>Part name *</label><input className={inputCls} value={form.partName || ''} onChange={(e) => set('partName', e.target.value)} /></div>
          <div><label className={labelCls}>Part number</label><input className={inputCls} value={form.partNumber || ''} onChange={(e) => set('partNumber', e.target.value)} /></div>
          <div><label className={labelCls}>Drawing number</label><input className={inputCls} value={form.drawingNumber || ''} onChange={(e) => set('drawingNumber', e.target.value)} /></div>
          <div><label className={labelCls}>Material</label><input className={inputCls} value={form.materialGrade || ''} onChange={(e) => set('materialGrade', e.target.value)} /></div>
          <div><label className={labelCls}>Thickness (mm)</label><input type="number" className={inputCls} value={form.thicknessMm ?? ''} onChange={(e) => set('thicknessMm', e.target.value)} /></div>
          <div><label className={labelCls}>Quantity to cut *</label><input type="number" min={1} className={inputCls} value={form.requiredQty ?? ''} onChange={(e) => set('requiredQty', e.target.value)} /></div>
          <div><label className={labelCls}>NC program no.</label><input className={inputCls} value={form.programNo || ''} onChange={(e) => set('programNo', e.target.value)} /></div>
        </div>
      </ERPModal>

      <ERPModal isOpen={dialog?.kind === 'cut'} onClose={() => setDialog(null)} size="sm" title={`Log cutting — ${(dialog as any)?.task?.partName || ''}`}
        footer={<div className="flex justify-end gap-2"><button className={btnGhost} onClick={() => setDialog(null)}>Cancel</button>
          <button className={btnPrimary} disabled={busy} onClick={() => run(() => api.post(`/nesting/tasks/${(dialog as any).task.id}/log-cutting/`, { qty: Number(form.qty), note: form.note }), 'Cutting logged')}>Save</button></div>}>
        <div className="space-y-3">
          <p className="text-xs text-[color:var(--crm-text-secondary)]">
            Already cut {(dialog as any)?.task?.cutQty} of {(dialog as any)?.task?.requiredQty}. Enter how many were cut now.
          </p>
          <div><label className={labelCls}>Quantity cut now</label><input type="number" min={1} className={inputCls} value={form.qty ?? ''} onChange={(e) => set('qty', e.target.value)} /></div>
          <div><label className={labelCls}>Note</label><input className={inputCls} value={form.note || ''} onChange={(e) => set('note', e.target.value)} /></div>
        </div>
      </ERPModal>

      <ERPModal isOpen={dialog?.kind === 'handover'} onClose={() => setDialog(null)} size="sm" title={`Hand over to Production — ${(dialog as any)?.task?.partName || ''}`}
        footer={<div className="flex justify-end gap-2"><button className={btnGhost} onClick={() => setDialog(null)}>Cancel</button>
          <button className={btnPrimary} disabled={busy} onClick={() => run(() => api.post(`/nesting/tasks/${(dialog as any).task.id}/hand-over/`, { qty: Number(form.qty), remarks: form.remarks }), 'Handed over to Production')}>Hand over</button></div>}>
        <div className="space-y-3">
          <div><label className={labelCls}>Quantity</label><input type="number" min={1} className={inputCls} value={form.qty ?? ''} onChange={(e) => set('qty', e.target.value)} /></div>
          <div><label className={labelCls}>Remarks</label><input className={inputCls} value={form.remarks || ''} onChange={(e) => set('remarks', e.target.value)} /></div>
        </div>
      </ERPModal>

      <ERPModal isOpen={dialog?.kind === 'resubmit'} onClose={() => setDialog(null)} size="sm" title="Hand over reworked parts again"
        footer={<div className="flex justify-end gap-2"><button className={btnGhost} onClick={() => setDialog(null)}>Cancel</button>
          <button className={btnPrimary} disabled={busy} onClick={() => run(() => api.post(`/nesting/handovers/${(dialog as any).handover.id}/resubmit/`, { qty: Number(form.qty), remarks: form.remarks }), 'Handed over to Production again')}>Hand over</button></div>}>
        <div className="space-y-3">
          <p className="text-xs text-red-700">Reason from Production: {(dialog as any)?.handover?.reviewReason}</p>
          <div><label className={labelCls}>Quantity reworked (max {(dialog as any)?.handover?.qty})</label><input type="number" min={1} className={inputCls} value={form.qty ?? ''} onChange={(e) => set('qty', e.target.value)} /></div>
          <div><label className={labelCls}>What was corrected</label><input className={inputCls} value={form.remarks || ''} onChange={(e) => set('remarks', e.target.value)} /></div>
        </div>
      </ERPModal>

      <ERPModal isOpen={dialog?.kind === 'sheet'} onClose={() => setDialog(null)} size="lg" title="MS sheet usage"
        footer={<div className="flex justify-end gap-2"><button className={btnGhost} onClick={() => setDialog(null)}>Cancel</button>
          <button className={btnPrimary} disabled={busy} onClick={() => run(() => api.post('/nesting/sheet-usage/', {
            jobId: job.id, materialGrade: form.materialGrade || 'MS', thicknessMm: Number(form.thicknessMm) || 0,
            sheetLengthMm: Number(form.sheetLengthMm) || 2500, sheetWidthMm: Number(form.sheetWidthMm) || 1250,
            sheetsIssued: Number(form.sheetsIssued) || 0, sheetsUsed: Number(form.sheetsUsed) || 0,
            ...(form.sheetsLeftover !== undefined && form.sheetsLeftover !== '' ? { sheetsLeftover: Number(form.sheetsLeftover) } : {}),
            leftoverWeightKg: Number(form.leftoverWeightKg) || 0, ratePerKg: Number(form.ratePerKg) || 0,
            weightPerSheetKg: Number(form.weightPerSheetKg) || 0, remarks: form.remarks || '' }), 'Sheet usage saved')}>Save</button></div>}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Material</label><input className={inputCls} value={form.materialGrade || ''} onChange={(e) => set('materialGrade', e.target.value)} /></div>
          <div><label className={labelCls}>Thickness (mm) *</label><input type="number" className={inputCls} value={form.thicknessMm ?? ''} onChange={(e) => set('thicknessMm', e.target.value)} /></div>
          <div><label className={labelCls}>Sheet length (mm)</label><input type="number" className={inputCls} value={form.sheetLengthMm ?? ''} onChange={(e) => set('sheetLengthMm', e.target.value)} /></div>
          <div><label className={labelCls}>Sheet width (mm)</label><input type="number" className={inputCls} value={form.sheetWidthMm ?? ''} onChange={(e) => set('sheetWidthMm', e.target.value)} /></div>
          <div><label className={labelCls}>Sheets issued from store</label><input type="number" className={inputCls} value={form.sheetsIssued ?? ''} onChange={(e) => set('sheetsIssued', e.target.value)} /></div>
          <div><label className={labelCls}>Sheets used (cut) *</label><input type="number" className={inputCls} value={form.sheetsUsed ?? ''} onChange={(e) => set('sheetsUsed', e.target.value)} /></div>
          <div><label className={labelCls}>Sheets left over (blank = issued − used)</label><input type="number" className={inputCls} value={form.sheetsLeftover ?? ''} onChange={(e) => set('sheetsLeftover', e.target.value)} /></div>
          <div><label className={labelCls}>Reusable offcut weight (kg)</label><input type="number" className={inputCls} value={form.leftoverWeightKg ?? ''} onChange={(e) => set('leftoverWeightKg', e.target.value)} /></div>
          <div><label className={labelCls}>Rate per kg (₹)</label><input type="number" className={inputCls} value={form.ratePerKg ?? ''} onChange={(e) => set('ratePerKg', e.target.value)} /></div>
          <div><label className={labelCls}>Weight per sheet kg (blank = calculate)</label><input type="number" className={inputCls} value={form.weightPerSheetKg ?? ''} onChange={(e) => set('weightPerSheetKg', e.target.value)} /></div>
          <div className="col-span-2"><label className={labelCls}>Remarks</label><input className={inputCls} value={form.remarks || ''} onChange={(e) => set('remarks', e.target.value)} /></div>
        </div>
      </ERPModal>

      <ShareToNestingModal isOpen={shareOpen} onClose={() => setShareOpen(false)} designJobId={job.designJobId} onShared={() => load()} />
    </div>
  );
}
