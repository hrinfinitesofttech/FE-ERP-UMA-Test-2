'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PAGE_ACTIONS,
  PAGE_REGISTRY,
  actionsFor,
  normalizeActions,
  type ModuleDef,
  type PageGrants,
} from '@/lib/pageRegistry';

interface Props {
  selectedModules: string[];
  grants: PageGrants;
  onChange: (next: { selectedModules: string[]; grants: PageGrants }) => void;
}

const EXTRA_ACTIONS = PAGE_ACTIONS.filter((a) => a.id !== 'view');

export function AccessPicker({ selectedModules, grants, onChange }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');

  const countFor = (m: ModuleDef) => m.pages.filter((p) => (grants[p.key] || []).includes('view')).length;
  const totalPages = useMemo(
    () => selectedModules.reduce((n, id) => n + (PAGE_REGISTRY.find((m) => m.id === id)?.pages.length || 0), 0),
    [selectedModules]
  );
  const totalGranted = PAGE_REGISTRY.reduce((n, m) => n + (selectedModules.includes(m.id) ? countFor(m) : 0), 0);

  const toggleModule = (id: string, on: boolean) => {
    if (on) {
      onChange({ selectedModules: [...selectedModules, id], grants });
    } else {
      const mod = PAGE_REGISTRY.find((m) => m.id === id)!;
      const nextGrants = { ...grants };
      mod.pages.forEach((p) => delete nextGrants[p.key]);
      onChange({ selectedModules: selectedModules.filter((m) => m !== id), grants: nextGrants });
    }
  };

  const setPage = (pageKey: string, page: ModuleDef['pages'][number], actions: string[]) => {
    const next = { ...grants };
    const norm = normalizeActions(actions, page);
    if (norm.length) next[pageKey] = norm;
    else delete next[pageKey];
    onChange({ selectedModules, grants: next });
  };

  const bulk = (mod: ModuleDef, mode: 'none' | 'view' | 'full') => {
    const next = { ...grants };
    mod.pages.forEach((p) => {
      if (mode === 'none') delete next[p.key];
      else if (mode === 'view') next[p.key] = ['view'];
      else next[p.key] = actionsFor(p);
    });
    onChange({ selectedModules, grants: next });
  };

  const q = query.trim().toLowerCase();

  return (
    <div className="space-y-4">
      {/* STEP 1 — modules */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-stone-800">1. Select modules (you can pick several)</label>
          <span className="text-[11px] text-stone-500">
            {selectedModules.length} module(s) · {totalGranted}/{totalPages} pages
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PAGE_REGISTRY.map((m) => {
            const checked = selectedModules.includes(m.id);
            return (
              <label
                key={m.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors',
                  checked ? 'bg-crm-brand-50/60 border-crm-brand-300 text-stone-900' : 'bg-white border-stone-200 text-stone-600'
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggleModule(m.id, e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300"
                />
                <span className="truncate">{m.name}</span>
                {checked && (
                  <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded font-semibold">
                    {countFor(m)}/{m.pages.length}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* STEP 2 — pages & actions */}
      {selectedModules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-5 text-center text-xs text-stone-500">
          Select a module above to choose which of its pages this employee can open.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-xs font-semibold text-stone-800">2. Choose pages and what the employee can do on each</label>
            <div className="relative w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages…"
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-crm-brand-700"
              />
            </div>
          </div>

          {PAGE_REGISTRY.filter((m) => selectedModules.includes(m.id)).map((mod) => {
            const pages = q ? mod.pages.filter((p) => p.label.toLowerCase().includes(q) || p.href.includes(q)) : mod.pages;
            if (q && pages.length === 0) return null;
            const isCollapsed = collapsed[mod.id] && !q;
            return (
              <div key={mod.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-stone-50 border-b border-stone-200">
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => ({ ...c, [mod.id]: !c[mod.id] }))}
                    className="flex items-center gap-1.5 text-xs font-bold text-stone-900 cursor-pointer"
                    aria-expanded={!isCollapsed}
                  >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {mod.name}
                    <span className="font-medium text-stone-500">({countFor(mod)}/{mod.pages.length} pages)</span>
                  </button>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button type="button" onClick={() => bulk(mod, 'view')} className="px-2 py-1 rounded-md border border-stone-300 bg-white hover:bg-stone-100 cursor-pointer">All · View</button>
                    <button type="button" onClick={() => bulk(mod, 'full')} className="px-2 py-1 rounded-md border border-stone-300 bg-white hover:bg-stone-100 cursor-pointer">All · Full</button>
                    <button type="button" onClick={() => bulk(mod, 'none')} className="px-2 py-1 rounded-md border border-stone-300 bg-white hover:bg-stone-100 cursor-pointer">Clear</button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wide text-stone-500">
                          <th className="text-left font-semibold px-3 py-1.5">Page</th>
                          <th className="px-1.5 py-1.5 font-semibold">View</th>
                          {EXTRA_ACTIONS.map((a) => (
                            <th key={a.id} className="px-1.5 py-1.5 font-semibold">{a.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pages.map((p) => {
                          const cur = grants[p.key] || [];
                          const hasView = cur.includes('view');
                          const allowed = actionsFor(p);
                          return (
                            <tr key={p.key} className={cn('border-t border-stone-100', hasView && 'bg-crm-brand-50/30')}>
                              <td className="px-3 py-1.5 font-medium text-stone-800">{p.label}</td>
                              <td className="text-center px-1.5">
                                <input
                                  type="checkbox"
                                  aria-label={`${p.label}: view`}
                                  checked={hasView}
                                  onChange={(e) => setPage(p.key, p, e.target.checked ? ['view'] : [])}
                                  className="w-3.5 h-3.5 rounded border-stone-300"
                                />
                              </td>
                              {EXTRA_ACTIONS.map((a) => {
                                const applicable = allowed.includes(a.id);
                                return (
                                  <td key={a.id} className="text-center px-1.5">
                                    {applicable ? (
                                      <input
                                        type="checkbox"
                                        aria-label={`${p.label}: ${a.label}`}
                                        disabled={!hasView}
                                        checked={cur.includes(a.id)}
                                        onChange={(e) =>
                                          setPage(p.key, p, e.target.checked ? [...cur, a.id] : cur.filter((x) => x !== a.id))
                                        }
                                        className="w-3.5 h-3.5 rounded border-stone-300 disabled:opacity-30"
                                      />
                                    ) : (
                                      <span className="text-stone-300">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-stone-500 leading-relaxed">
        The employee will see <strong>only</strong> the pages ticked here (sidebar and direct links). Create / Edit / Delete /
        Approve / Export / Print apply per page. Everything else stays hidden.
      </p>
    </div>
  );
}
