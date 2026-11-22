'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useERP } from '@/context/ERPContext';
import api from '@/lib/apiClient';
import { Badge, Card, CardHeader, Empty, Field, Notice, asList, btnPrimary, errMsg, fmtDate, inputCls, statusTone } from '@/components/my/ui';

const today = () => new Date().toISOString().slice(0, 10);

export default function MyLeavesPage() {
  const { currentUser } = useERP();
  const empId = currentUser?.id as string | undefined;

  const [types, setTypes] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());
  const [duration, setDuration] = useState<'Full Day' | 'First Half' | 'Second Half'>('Full Day');
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    if (!empId) return;
    setLoading(true);
    try {
      const [t, b, r] = await Promise.all([
        api.hr.leaveTypes.list(),
        api.hr.leaveBalances.list({ employeeId: empId }),
        api.hr.leaves.list({ employeeId: empId }),
      ]);
      const tl = asList(t).filter((x: any) => (x.status || 'Active') === 'Active');
      setTypes(tl);
      setBalances(asList(b).filter((x: any) => (x.employeeId || x.employee_id) === empId));
      setRequests(asList(r).filter((x: any) => (x.employeeId || x.employee_id) === empId));
      setLeaveTypeId((cur) => cur || tl[0]?.id || '');
    } catch (e) {
      setError(errMsg(e, 'Could not load leave data.'));
    } finally {
      setLoading(false);
    }
  }, [empId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!leaveTypeId) return setError('Please choose a leave type.');
    if (!fromDate || !toDate) return setError('Please choose from and to dates.');
    if (toDate < fromDate) return setError('To date cannot be before from date.');
    if (reason.trim().length < 3) return setError('Please enter a reason.');
    const half = duration !== 'Full Day';
    if (half && fromDate !== toDate) return setError('Half-day leave must be for a single date.');

    setSaving(true);
    try {
      await api.hr.leaves.create({
        employee_id: empId,
        leave_type_id: leaveTypeId,
        from_date: fromDate,
        to_date: toDate,
        is_half_day: half,
        half_day_type: duration,
        reason: reason.trim(),
      });
      setSuccess('Leave request submitted. Your manager will review it.');
      setReason('');
      await load();
    } catch (err) {
      setError(errMsg(err, 'Could not submit leave request.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Balances */}
      <div>
        <h2 className="text-sm font-bold mb-2">My Leave Balance</h2>
        {loading ? (
          <Card><Empty>Loading…</Empty></Card>
        ) : balances.length === 0 ? (
          <Card><Empty>No leave balance has been credited to you yet. Please contact HR.</Empty></Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {balances.map((b) => (
              <Card key={b.id} className="p-4">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--crm-text-tertiary)]">
                  {b.leaveName || b.leave_name} <span className="font-mono">({b.leaveCode || b.leave_code})</span>
                </div>
                <div className="mt-1 text-3xl font-extrabold text-[color:var(--crm-brand-700)]">
                  {Number(b.availableBalance ?? b.available_balance ?? 0)}
                  <span className="text-xs font-semibold text-[color:var(--crm-text-secondary)]"> available</span>
                </div>
                <div className="mt-1 text-[11px] text-[color:var(--crm-text-secondary)]">
                  Total {Number(b.totalCredited ?? b.total_credited ?? 0)} · Used {Number(b.used ?? 0)} · Pending {Number(b.pendingApproval ?? b.pending_approval ?? 0)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
        {/* Apply */}
        <Card>
          <CardHeader title="Apply for Leave" hint="Sundays and holidays are excluded automatically" />
          <form onSubmit={submit} className="p-5 space-y-3.5">
            {error && <Notice kind="error">{error}</Notice>}
            {success && <Notice kind="success">{success}</Notice>}
            <Field label="Leave type">
              <select className={inputCls} value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.leaveName || t.leave_name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From">
                <input type="date" className={inputCls} value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (toDate < e.target.value) setToDate(e.target.value); }} />
              </Field>
              <Field label="To">
                <input type="date" className={inputCls} value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} />
              </Field>
            </div>
            <Field label="Duration">
              <select className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value as any)}>
                <option>Full Day</option>
                <option>First Half</option>
                <option>Second Half</option>
              </select>
            </Field>
            <Field label="Reason">
              <textarea rows={3} className={`${inputCls} h-auto py-2`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for leave" />
            </Field>
            <button type="submit" disabled={saving} className={`${btnPrimary} w-full`}>
              {saving ? 'Submitting…' : 'Submit Leave Request'}
            </button>
          </form>
        </Card>

        {/* History */}
        <Card>
          <CardHeader title="My Leave Requests" />
          {loading ? (
            <Empty>Loading…</Empty>
          ) : requests.length === 0 ? (
            <Empty>You have not applied for any leave yet.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-[color:var(--crm-text-tertiary)] bg-[color:var(--crm-surface-subtle)]">
                    <th className="px-4 py-2.5">No.</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Dates</th>
                    <th className="px-4 py-2.5 text-right">Days</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-t border-[color:var(--crm-border-default)] align-top">
                      <td className="px-4 py-2.5 font-mono">{r.leaveNumber || r.leave_number}</td>
                      <td className="px-4 py-2.5">{r.leaveName || r.leave_name}{(r.isHalfDay ?? r.is_half_day) ? ' (Half)' : ''}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{fmtDate(r.fromDate || r.from_date)} → {fmtDate(r.toDate || r.to_date)}</td>
                      <td className="px-4 py-2.5 text-right">{Number(r.numberOfDays ?? r.number_of_days ?? 0)}</td>
                      <td className="px-4 py-2.5"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                      <td className="px-4 py-2.5 max-w-[200px]">{r.managerRemarks || r.manager_remarks || r.adminRemarks || r.admin_remarks || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
