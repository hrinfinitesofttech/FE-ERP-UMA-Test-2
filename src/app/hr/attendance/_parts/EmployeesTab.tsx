'use client';

import React, { useMemo, useState } from 'react';
import { Search, Check, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { DailyEmployeeRow, card, inputCls, btn, thCls, StatusBadge, SortTh, useSorted, usePaged, Pager, CsvButton, downloadCsv, Loading } from './shared';

interface Props {
  rows: DailyEmployeeRow[];
  loading: boolean;
  date: string;
  isAdmin: boolean;
  importing: boolean;
  onImport: () => void;
  openEmployee: (id: string) => void;
}

export default function EmployeesTab({ rows, loading, date, isAdmin, importing, onImport, openEmployee }: Props) {
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('ALL');
  const [mapping, setMapping] = useState('ALL');
  const [active, setActive] = useState('ALL');

  const depts = useMemo(() => Array.from(new Set(rows.map((r) => r.department).filter(Boolean))).sort(), [rows]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((e) =>
      (!s || [e.employeeName, e.employeeId, e.department, e.designation, e.machineEmpCode, e.mobile, e.email].some((x) => (x || '').toLowerCase().includes(s))) &&
      (dept === 'ALL' || e.department === dept) &&
      (mapping === 'ALL' || (mapping === 'MAPPED' ? !!e.machineEmpCode : !e.machineEmpCode)) &&
      (active === 'ALL' || (active === 'ACTIVE' ? e.isActive : !e.isActive)));
  }, [rows, q, dept, mapping, active]);

  const { sorted, sortKey, sortDir, toggle } = useSorted(filtered, {
    name: (r) => r.employeeName, dept: (r) => r.department, code: (r) => r.machineEmpCode || 'zzz', status: (r) => r.status,
  }, 'name');
  const paged = usePaged(sorted, `${q}|${dept}|${mapping}|${active}|${sortKey}|${sortDir}`);
  const unmappedTotal = rows.filter((r) => !r.machineEmpCode).length;

  const reset = () => { setQ(''); setDept('ALL'); setMapping('ALL'); setActive('ALL'); };
  const exportCsv = () => downloadCsv(`employees-${date}.csv`, [
    ['Employee ID', 'Name', 'Department', 'Designation', 'Email', 'Mobile', 'Machine code', 'Status today', 'Active'],
    ...sorted.map((e) => [e.employeeId, e.employeeName, e.department, e.designation, e.email, e.mobile, e.machineEmpCode, e.status, e.isActive ? 'Yes' : 'No']),
  ]);

  return (
    <div className="space-y-4">
      <div className={`${card} p-3 flex flex-wrap items-center gap-2`}>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, dept, machine code…" className={`${inputCls} w-full pl-9`} aria-label="Search employees" />
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className={inputCls} aria-label="Department"><option value="ALL">All departments</option>{depts.map((d) => <option key={d}>{d}</option>)}</select>
        <select value={mapping} onChange={(e) => setMapping(e.target.value)} className={inputCls} aria-label="Machine mapping">
          <option value="ALL">Mapped + unmapped</option><option value="MAPPED">Mapped only</option><option value="UNMAPPED">Unmapped only{unmappedTotal ? ` (${unmappedTotal})` : ''}</option>
        </select>
        <select value={active} onChange={(e) => setActive(e.target.value)} className={inputCls} aria-label="Active status"><option value="ALL">Active + inactive</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
        <button className={btn} onClick={reset}>Reset</button>
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && <button className={btn} onClick={onImport} disabled={importing}><RefreshCw className={`w-3.5 h-3.5 ${importing ? 'animate-spin' : ''}`} /> {importing ? 'Importing…' : 'Import machine staff'}</button>}
          <CsvButton onClick={exportCsv} disabled={!sorted.length} />
        </div>
      </div>

      <div className={`${card} overflow-hidden`}>
        {loading && rows.length === 0 ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-xs">
              <thead className="bg-slate-50 border-b border-[color:var(--crm-border-default)]">
                <tr>
                  <SortTh label="Employee" k="name" {...{ sortKey, sortDir, toggle }} />
                  <SortTh label="Department" k="dept" {...{ sortKey, sortDir, toggle }} />
                  <th className={thCls}>Contact</th>
                  <SortTh label="Machine code" k="code" {...{ sortKey, sortDir, toggle }} />
                  <SortTh label="Status on date" k="status" {...{ sortKey, sortDir, toggle }} />
                  <th className={`${thCls} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                {paged.slice.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400">No employees match these filters.</td></tr>
                ) : paged.slice.map((e) => (
                  <tr key={e.employeeId} onClick={() => openEmployee(e.employeeId)} className="hover:bg-amber-50/40 cursor-pointer transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs shrink-0">{(e.employeeName || '?').charAt(0)}</div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{e.employeeName}{!e.isActive && <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">Inactive</span>}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{e.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><div className="font-medium text-slate-800">{e.department || 'General'}</div><div className="text-[11px] text-slate-400">{e.designation || 'Staff'}</div></td>
                    <td className="py-3 px-4"><div className="text-slate-600 truncate max-w-[200px]">{e.email || '--'}</div><div className="text-[11px] text-slate-400">{e.mobile || '--'}</div></td>
                    <td className="py-3 px-4">
                      {e.machineEmpCode
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><Check className="w-3 h-3" /> {e.machineEmpCode}</span>
                        : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3 h-3" /> Unmapped</span>}
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={e.status} /></td>
                    <td className="py-3 px-4 text-right"><button className={btn} onClick={(ev) => { ev.stopPropagation(); openEmployee(e.employeeId); }}><Eye className="w-3.5 h-3.5 text-amber-700" /> View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager p={paged} />
      </div>
    </div>
  );
}
