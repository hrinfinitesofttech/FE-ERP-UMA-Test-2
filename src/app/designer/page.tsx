'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Layers, Palette, PencilRuler, Rocket } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { PAGE_REGISTRY, canViewPageHref, getPageGrants, isTrueSuperAdmin } from '../../lib/pageRegistry';
import {
  BarPanel, CHART_COLORS, DonutPanel, KpiGrid, KpiTile, ListPanel, ShortcutGrid, StatusPill, count, titleCase,
} from '../../components/dashboard/DashboardKit';

const OPEN_STATUSES = ['pending', 'assigned', 'in_progress', 'review', 'revision_required', 'bom_pending', 'on_hold'];
const DONE_STATUSES = ['approved', 'bom_approved', 'released_to_production'];

const todayStr = () => new Date().toISOString().slice(0, 10);

/** Design & Engineering department dashboard. */
export default function DesignerDashboardPage() {
  const { designJobs, boms, drawings2D, designTasks, currentUser } = useERP();

  const jobs = designJobs || [];
  const today = todayStr();

  const d = useMemo(() => {
    const open = jobs.filter((j) => OPEN_STATUSES.includes(j.status));
    const done = jobs.filter((j) => DONE_STATUSES.includes(j.status));
    const overdue = open.filter((j) => j.deliveryDate && String(j.deliveryDate).slice(0, 10) < today);
    const dueSoon = open
      .filter((j) => j.deliveryDate && String(j.deliveryDate).slice(0, 10) >= today)
      .sort((a, b) => String(a.deliveryDate).localeCompare(String(b.deliveryDate)))
      .slice(0, 6);
    const attention = jobs.filter((j) => ['revision_required', 'disapproved', 'rejected'].includes(j.status));

    const byStatus = Object.entries(count(jobs, (j) => j.status)).map(([k, v]) => ({ name: titleCase(k), value: v }));
    const bomByStatus = Object.entries(count(boms || [], (b: any) => b.status)).map(([k, v]) => ({ name: titleCase(k), value: v }));
    const drawingByCat = Object.entries(count(drawings2D || [], (x: any) => x.category || 'Other')).map(([k, v]) => ({ name: k, drawings: v }));

    const designers: Record<string, { name: string; open: number; done: number }> = {};
    jobs.forEach((j) => {
      const n = j.assignedDesigner || 'Unassigned';
      designers[n] = designers[n] || { name: n, open: 0, done: 0 };
      if (DONE_STATUSES.includes(j.status)) designers[n].done += 1; else designers[n].open += 1;
    });

    const tasksByStatus = Object.entries(count(designTasks || [], (t: any) => t.status)).map(([k, v]) => ({ name: titleCase(k), value: v }));

    return {
      open, done, overdue, dueSoon, attention, byStatus, bomByStatus, drawingByCat, tasksByStatus,
      perDesigner: Object.values(designers).sort((a, b) => b.open + b.done - (a.open + a.done)).slice(0, 8),
      bomReleased: (boms || []).filter((b: any) => b.status === 'released' || b.status === 'released_to_production').length,
    };
  }, [jobs, boms, drawings2D, designTasks, today]);

  const strict = !!getPageGrants(currentUser) && !isTrueSuperAdmin(currentUser);
  const registry = PAGE_REGISTRY.find((m) => m.id === 'designer')?.pages || [];
  const shortcuts = [
    ...registry.filter((p) => !strict || canViewPageHref(currentUser, p.href)).map((p) => ({ label: p.label, href: p.href })),
    { label: 'Design Approvals', href: '/designer/approval' },
    { label: 'Nesting Jobs (shared files)', href: '/nesting' },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] shadow-sm p-5 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center"><Palette className="w-5 h-5" /></span>
        <div>
          <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">Design & Engineering Dashboard</h1>
          <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Design jobs, drawings and BOMs at a glance.</p>
        </div>
      </div>

      <KpiGrid cols={6}>
        <KpiTile label="Design jobs" value={jobs.length} icon={Layers} href="/designer/jobs" />
        <KpiTile label="In progress" value={d.open.length} icon={Clock} tone="amber" href="/designer/jobs" />
        <KpiTile label="Overdue" value={d.overdue.length} icon={AlertTriangle} tone={d.overdue.length ? 'red' : 'slate'} href="/designer/jobs" />
        <KpiTile label="Approved / released" value={d.done.length} icon={CheckCircle2} tone="green" href="/designer/jobs" />
        <KpiTile label="BOMs" value={(boms || []).length} sub={`${d.bomReleased} released`} icon={PencilRuler} tone="violet" href="/designer/bom" />
        <KpiTile label="Released to production" value={jobs.filter((j) => j.status === 'released_to_production').length} icon={Rocket} tone="green" href="/designer/jobs" />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutPanel title="Design jobs by status" data={d.byStatus} centerLabel="jobs" />
        <BarPanel title="Workload per designer" subtitle="Open vs completed jobs" data={d.perDesigner} xKey="name"
          series={[{ key: 'open', label: 'Open', color: CHART_COLORS[2] }, { key: 'done', label: 'Done', color: CHART_COLORS[1] }]} stacked />
        <DonutPanel title="BOM status" data={d.bomByStatus} centerLabel="BOMs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BarPanel title="Drawings by category" data={d.drawingByCat} xKey="name" series={[{ key: 'drawings', label: 'Drawings' }]} height={220} />
        <DonutPanel title="Design tasks" data={d.tasksByStatus} height={220} centerLabel="tasks" />
        <ListPanel title="Needs attention" subtitle="Revision required / disapproved"
          empty="No design job needs attention"
          rows={d.attention.slice(0, 6).map((j) => ({
            key: j.id, href: '/designer/jobs', primary: `${j.designJobNumber} · ${j.productName}`,
            secondary: j.customerName, badge: <StatusPill text={titleCase(j.status)} tone="red" />,
          }))} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListPanel title="Overdue design jobs" empty="Nothing overdue"
          rows={d.overdue.slice(0, 6).map((j) => ({
            key: j.id, href: '/designer/jobs', primary: `${j.designJobNumber} · ${j.productName}`,
            secondary: `${j.customerName} · designer: ${j.assignedDesigner || 'unassigned'}`,
            badge: <StatusPill text={`Due ${String(j.deliveryDate).slice(0, 10)}`} tone="red" />,
          }))} />
        <ListPanel title="Due soon" empty="No upcoming deadlines"
          rows={d.dueSoon.map((j) => ({
            key: j.id, href: '/designer/jobs', primary: `${j.designJobNumber} · ${j.productName}`,
            secondary: `${j.customerName} · ${j.assignedDesigner || 'unassigned'}`,
            badge: <StatusPill text={`Due ${String(j.deliveryDate).slice(0, 10)}`} tone="amber" />,
          }))} />
      </div>

      <ShortcutGrid items={shortcuts} />
    </div>
  );
}
