'use client';

import React from 'react';
import { useERP } from '../../context/ERPContext';
import { PAGE_REGISTRY, canViewPageHref, getPageGrants, isTrueSuperAdmin } from '../../lib/pageRegistry';
import { ShortcutGrid } from './DashboardKit';

/**
 * "Quick shortcuts" for a department: one link for every page of the module the user may open.
 * Shown on top of each department dashboard (via the dashboard route's layout).
 */
export function DepartmentShortcuts({ moduleId, bare = false }: { moduleId: string; bare?: boolean }) {
  const { currentUser } = useERP();
  const mod = PAGE_REGISTRY.find((m) => m.id === moduleId);
  if (!mod) return null;

  const strict = !!getPageGrants(currentUser) && !isTrueSuperAdmin(currentUser);
  const pages = mod.pages.filter((p) => !strict || canViewPageHref(currentUser, p.href));

  return (
    <div className={bare ? '' : 'px-6 pt-6'}>
      <ShortcutGrid title={`${mod.name} — quick shortcuts`} items={pages.map((p) => ({ label: p.label, href: p.href }))} />
    </div>
  );
}
