/**
 * Page & permission registry — single source of truth for per-employee access.
 *
 * Access model (saved on the employee, no database migration needed):
 *   customPermissions.pages = { "<module>.<page>": ["view","create","edit",...] }
 *
 * - If `pages` exists the employee is in STRICT mode: only listed pages are visible
 *   (sidebar + routes) and only listed actions are allowed.
 * - If `pages` is absent the employee keeps the legacy module-level behaviour.
 * - A true Super Admin always has full access.
 */

export type ActionId = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print';

export const PAGE_ACTIONS: { id: ActionId; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'approve', label: 'Approve' },
  { id: 'export', label: 'Export' },
  { id: 'print', label: 'Print' },
];

export interface PageDef {
  key: string;
  label: string;
  href: string;
  /** Pages that only display data (dashboards, logs): only the View action applies. */
  readOnly?: boolean;
}
export interface ModuleDef {
  id: string;
  name: string;
  pages: PageDef[];
}
export type PageGrants = Record<string, string[]>;

export const PAGE_REGISTRY: ModuleDef[] = [
  {
    id: 'crm',
    name: 'CRM & Sales',
    pages: [
      { key: 'crm.dashboard', label: 'CRM Dashboard', href: '/crm', readOnly: true },
      { key: 'crm.leads', label: 'Leads', href: '/crm/leads' },
      { key: 'crm.enquiries', label: 'Inquiries', href: '/crm/enquiries' },
      { key: 'crm.customers', label: 'Customers', href: '/crm/customers' },
      { key: 'crm.follow-ups', label: 'Follow-ups (Today)', href: '/crm/follow-ups' },
      { key: 'crm.visits', label: 'Site Visits', href: '/crm/visits' },
      { key: 'crm.exhibitions', label: 'Exhibitions / Expo', href: '/crm/exhibitions' },
      { key: 'crm.quotations', label: 'Quotations & Rev', href: '/crm/quotations' },
      { key: 'crm.customer-po', label: 'Customer POs', href: '/crm/customer-po' },
    ],
  },
  {
    id: 'projects',
    name: 'Project Management',
    pages: [
      { key: 'projects.dashboard', label: 'Dashboard', href: '/projects/dashboard', readOnly: true },
      { key: 'projects.list', label: 'Projects', href: '/projects/list' },
      { key: 'projects.planning', label: 'Project Planning', href: '/projects/planning' },
      { key: 'projects.tasks', label: 'Task Management', href: '/projects/tasks' },
    ],
  },
  {
    id: 'designer',
    name: 'Design & Engineering',
    pages: [
      { key: 'designer.jobs', label: 'Design Jobs', href: '/designer/jobs' },
      { key: 'designer.bom', label: 'BOM', href: '/designer/bom' },
    ],
  },
  {
    id: 'nesting',
    name: 'Nesting & Plate Cutting',
    pages: [
      { key: 'nesting.jobs', label: 'Nesting Jobs', href: '/nesting' },
      { key: 'nesting.production-review', label: 'Production Review (Accept / Rework)', href: '/nesting/production-review' },
      { key: 'nesting.material-estimate', label: 'Sheet & Material Estimate', href: '/nesting/material-estimate', readOnly: true },
    ],
  },
  {
    id: 'purchase',
    name: 'Purchase & RFQ',
    pages: [
      { key: 'purchase.dashboard', label: 'Purchase Dashboard', href: '/purchase/dashboard', readOnly: true },
      { key: 'purchase.requisition', label: 'Material Requisition', href: '/purchase/requisition' },
      { key: 'purchase.requests', label: 'Purchase Requests (REQUIRE)', href: '/purchase/requests' },
      { key: 'purchase.quotations', label: 'Supplier Quotations', href: '/purchase/quotations' },
      { key: 'purchase.po', label: 'Purchase Orders & Approvals', href: '/purchase/po' },
      { key: 'purchase.suppliers', label: 'Supplier Master', href: '/purchase/suppliers' },
      { key: 'purchase.returns', label: 'Purchase Returns', href: '/purchase/returns' },
      { key: 'purchase.payment-status', label: 'Supplier Payment Status', href: '/purchase/payment-status', readOnly: true },
    ],
  },
  {
    id: 'store',
    name: 'Store & Inventory',
    pages: [
      { key: 'store.dashboard', label: 'Store Dashboard', href: '/store/dashboard', readOnly: true },
      { key: 'store.items', label: 'Item / Material Master', href: '/store/items' },
      { key: 'store.categories', label: 'Item Categories', href: '/store/categories' },
      { key: 'store.uom', label: 'Units of Measurement', href: '/store/uom' },
      { key: 'store.grn', label: 'Goods Receipt / GRN', href: '/store/grn' },
      { key: 'store.bom-verification', label: 'BOM Material Verify', href: '/store/bom-verification' },
      { key: 'store.material-issue', label: 'Material Issue', href: '/store/material-issue' },
      { key: 'store.material-return', label: 'Material Return', href: '/store/material-return' },
      { key: 'store.scrap', label: 'Scrap & Rejection', href: '/store/scrap' },
      { key: 'store.reorder', label: 'Low Stock / Reorder', href: '/store/reorder' },
    ],
  },
  {
    id: 'production',
    name: 'Production & Shopfloor',
    pages: [
      { key: 'production.dashboard', label: 'Production Dashboard', href: '/production/dashboard', readOnly: true },
      { key: 'production.planning', label: 'Production Planning', href: '/production/planning' },
      { key: 'production.worker-daily-routine', label: 'Worker Daily Routine', href: '/production/worker-daily-routine' },
      { key: 'production.mrp', label: 'Material Planning & Issue (MRP)', href: '/production/mrp' },
      { key: 'production.completion', label: 'Completion & QC Clearance', href: '/production/completion' },
      { key: 'production.packaging', label: 'Dispatch & Packaging', href: '/production/packaging' },
      { key: 'production.dispatch', label: 'Delivery Challan', href: '/production/dispatch' },
      { key: 'production.e-waybill', label: 'GST E-Way Bill (Logistics)', href: '/accounting/e-waybill' },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounts & Finance',
    pages: [
      { key: 'accounting.dashboard', label: 'Accounting Dashboard', href: '/accounting/dashboard', readOnly: true },
      { key: 'accounting.chart-of-accounts', label: 'Chart of Accounts', href: '/accounting/chart-of-accounts' },
      { key: 'accounting.account-groups', label: 'Account Groups', href: '/accounting/account-groups' },
      { key: 'accounting.customers', label: 'Customer Ledgers', href: '/accounting/customers' },
      { key: 'accounting.suppliers', label: 'Supplier Ledgers', href: '/accounting/suppliers' },
      { key: 'accounting.sales-invoices', label: 'Sales Invoices', href: '/accounting/sales-invoices' },
      { key: 'accounting.purchase-invoices', label: 'Purchase Invoices', href: '/accounting/purchase-invoices' },
      { key: 'accounting.credit-notes', label: 'Credit Notes', href: '/accounting/credit-notes' },
      { key: 'accounting.debit-notes', label: 'Debit Notes', href: '/accounting/debit-notes' },
      { key: 'accounting.receipts', label: 'Customer Receipts', href: '/accounting/receipts' },
      { key: 'accounting.payments', label: 'Supplier Payments', href: '/accounting/payments' },
      { key: 'accounting.journal-entries', label: 'Journal Entries (JV)', href: '/accounting/journal-entries' },
      { key: 'accounting.contra-entries', label: 'Contra Entries', href: '/accounting/contra-entries' },
      { key: 'accounting.expenses', label: 'Expense Management', href: '/accounting/expenses' },
      { key: 'accounting.cash-bank', label: 'Cash & Bank Accounts', href: '/accounting/cash-bank' },
      { key: 'accounting.bank-reconciliation', label: 'Bank Reconciliation', href: '/accounting/bank-reconciliation' },
      { key: 'accounting.gst', label: 'GST Management', href: '/accounting/gst' },
      { key: 'accounting.tds', label: 'TDS Compliance', href: '/accounting/tds' },
      { key: 'accounting.accounts-receivable', label: 'Accounts Receivable (AR)', href: '/accounting/accounts-receivable' },
      { key: 'accounting.accounts-payable', label: 'Accounts Payable (AP)', href: '/accounting/accounts-payable' },
      { key: 'accounting.outstanding', label: 'Outstanding & Reminders', href: '/accounting/outstanding' },
      { key: 'accounting.job-costing', label: 'Job-wise Costing', href: '/accounting/job-costing' },
      { key: 'accounting.project-costing', label: 'Project Financial Costing', href: '/accounting/project-costing' },
      { key: 'accounting.inventory-valuation', label: 'Inventory Financial Valuation', href: '/accounting/inventory-valuation' },
      { key: 'accounting.fixed-assets', label: 'Fixed Assets Master', href: '/accounting/fixed-assets' },
      { key: 'accounting.depreciation', label: 'Depreciation Schedule', href: '/accounting/depreciation' },
      { key: 'accounting.books', label: 'Books of Accounts (Hub)', href: '/accounting/books', readOnly: true },
      { key: 'accounting.ledgers', label: 'Ledger Master', href: '/accounting/ledgers' },
      { key: 'accounting.vouchers', label: 'Voucher Entry', href: '/accounting/vouchers' },
      { key: 'accounting.day-book', label: 'Day Book & Ledger Statement', href: '/accounting/day-book', readOnly: true },
      { key: 'accounting.payment-requests', label: 'Payment Requests', href: '/accounting/payment-requests' },
      { key: 'accounting.trial-balance', label: 'Trial Balance', href: '/accounting/reports/trial-balance', readOnly: true },
      { key: 'accounting.profit-loss', label: 'Profit & Loss A/c', href: '/accounting/reports/profit-loss', readOnly: true },
      { key: 'accounting.balance-sheet', label: 'Balance Sheet', href: '/accounting/reports/balance-sheet', readOnly: true },
      { key: 'accounting.ratio-analysis', label: 'Ratio Analysis', href: '/accounting/reports/ratio-analysis', readOnly: true },
      { key: 'accounting.depreciation-chart', label: 'Depreciation Chart', href: '/accounting/depreciation-chart' },
      { key: 'accounting.stock-summary', label: 'Stock Summary', href: '/accounting/stock-summary' },
      { key: 'accounting.settings', label: 'Accounting Settings', href: '/accounting/settings' },
    ],
  },
  {
    id: 'maintenance',
    name: 'Plant Maintenance',
    pages: [
      { key: 'maintenance.dashboard', label: 'Maintenance Dashboard', href: '/maintenance/dashboard', readOnly: true },
      { key: 'maintenance.assets', label: 'Asset / Machine Master', href: '/maintenance/assets' },
      { key: 'maintenance.service-requests', label: 'Service Requests', href: '/maintenance/service-requests' },
      { key: 'maintenance.breakdowns', label: 'Breakdown Management', href: '/maintenance/breakdowns' },
    ],
  },
  {
    id: 'hr',
    name: 'HR & Payroll',
    pages: [
      { key: 'hr.dashboard', label: 'HR Dashboard', href: '/hr/dashboard', readOnly: true },
      { key: 'hr.employees', label: 'Employee Master', href: '/hr/employees' },
      { key: 'hr.departments', label: 'Departments', href: '/hr/departments' },
      { key: 'hr.designations', label: 'Designations', href: '/hr/designations' },
      { key: 'hr.documents', label: 'Employee Documents', href: '/hr/documents' },
      { key: 'hr.onboarding', label: 'Employee Onboarding', href: '/hr/onboarding' },
      { key: 'hr.transfers', label: 'Employee Transfers', href: '/hr/transfers' },
      { key: 'hr.promotions', label: 'Promotion & Increment', href: '/hr/promotions' },
      { key: 'hr.exits', label: 'Resignation / Exit', href: '/hr/exits' },
      { key: 'hr.settlement', label: 'Full & Final Settlement', href: '/hr/settlement' },
      { key: 'hr.attendance', label: 'Attendance', href: '/hr/attendance' },
      { key: 'hr.shifts', label: 'Shift Management', href: '/hr/shifts' },
      { key: 'hr.roster', label: 'Shift Roster', href: '/hr/roster' },
      { key: 'hr.holidays', label: 'Holiday Calendar', href: '/hr/holidays' },
      { key: 'hr.leaves', label: 'Leave Management', href: '/hr/leaves' },
      { key: 'hr.leave-approvals', label: 'Leave Approvals', href: '/hr/leave-approvals' },
      { key: 'hr.wfh', label: 'WFH / Remote Work', href: '/hr/wfh' },
      { key: 'hr.missed-punch', label: 'Missed Punch', href: '/hr/missed-punch' },
      { key: 'hr.regularization', label: 'Attendance Regularization', href: '/hr/regularization' },
      { key: 'hr.overtime', label: 'Overtime', href: '/hr/overtime' },
      { key: 'hr.early-checkout', label: 'Early Checkout', href: '/hr/early-checkout' },
      { key: 'hr.payroll-dashboard', label: 'Payroll Dashboard', href: '/hr/payroll-dashboard', readOnly: true },
      { key: 'hr.salary-structures', label: 'Salary Structure', href: '/hr/salary-structures' },
      { key: 'hr.salary-components', label: 'Salary Components', href: '/hr/salary-components' },
      { key: 'hr.monthly-payroll', label: 'Monthly Payroll', href: '/hr/monthly-payroll' },
      { key: 'hr.payroll-approvals', label: 'Payroll Approval', href: '/hr/payroll-approvals' },
      { key: 'hr.advances', label: 'Employee Advances / Loans', href: '/hr/advances' },
      { key: 'hr.reimbursements', label: 'Reimbursements / Expenses', href: '/hr/reimbursements' },
      { key: 'hr.payslips', label: 'Payslips', href: '/hr/payslips' },
    ],
  },
  {
    id: 'integration',
    name: 'Integration & Approvals',
    pages: [
      { key: 'integration.job-360', label: 'Job 360° Overview', href: '/integration/job-360', readOnly: true },
      { key: 'integration.management-dashboard', label: 'Executive Dashboard', href: '/integration/management-dashboard', readOnly: true },
      { key: 'integration.alert-center', label: 'Action & Alert Center', href: '/integration/alert-center', readOnly: true },
      { key: 'integration.approval-center', label: 'Approval Center', href: '/integration/approval-center' },
      { key: 'integration.customer-360', label: 'Customer 360°', href: '/integration/customer-360', readOnly: true },
      { key: 'integration.supplier-360', label: 'Supplier 360°', href: '/integration/supplier-360', readOnly: true },
      { key: 'integration.item-360', label: 'Item / Material 360°', href: '/integration/item-360', readOnly: true },
      { key: 'integration.employee-360', label: 'Employee 360°', href: '/integration/employee-360', readOnly: true },
      { key: 'integration.activity-log', label: 'Global Activity Trail', href: '/integration/activity-log', readOnly: true },
    ],
  },
  {
    id: 'testing',
    name: 'Testing & Security',
    pages: [
      { key: 'testing.uat-hub', label: 'ERP UAT & Test Matrix', href: '/testing/uat-hub' },
      { key: 'testing.role-matrix', label: 'Role & Scope Tester', href: '/testing/role-matrix' },
      { key: 'testing.bug-tracker', label: 'Internal Bug Tracker', href: '/testing/bug-tracker' },
      { key: 'testing.backup-restore', label: 'Backup & Recovery', href: '/settings/backup-restore' },
      { key: 'testing.data-import', label: 'Data Import Wizard', href: '/settings/data-import' },
      { key: 'testing.security-hub', label: 'Security & Audit Hub', href: '/settings/security-hub' },
      { key: 'testing.release-notes', label: 'Go-Live & Release Notes', href: '/settings/release-notes', readOnly: true },
    ],
  },
  {
    id: 'settings',
    name: 'Foundation & Admin',
    pages: [
      { key: 'settings.users', label: 'Users & Employees', href: '/users' },
      { key: 'settings.departments', label: 'Departments (9 Core)', href: '/departments' },
      { key: 'settings.company', label: 'Company Profile', href: '/settings/company' },
      { key: 'settings.numbering', label: 'Numbering Series', href: '/settings/numbering' },
      { key: 'settings.audit-logs', label: 'Audit Trail Logs', href: '/settings/audit-logs', readOnly: true },
    ],
  },
];

// ───────────────────────── lookups ─────────────────────────
const ALL_PAGES: (PageDef & { moduleId: string })[] = PAGE_REGISTRY.flatMap((m) =>
  m.pages.map((p) => ({ ...p, moduleId: m.id }))
);
const BY_KEY = new Map(ALL_PAGES.map((p) => [p.key, p]));
// longest href first so "/crm/leads" wins over "/crm"
const BY_HREF_DESC = [...ALL_PAGES].sort((a, b) => b.href.length - a.href.length);

/** Sidebar uses a few module aliases. */
const MODULE_ALIASES: Record<string, string> = { design: 'designer', foundation: 'settings' };
export const normalizeModuleId = (m: string) => {
  const k = (m || '').toLowerCase().trim();
  return MODULE_ALIASES[k] || k;
};

export const getPage = (key: string) => BY_KEY.get(key);
export const getModule = (id: string) => PAGE_REGISTRY.find((m) => m.id === normalizeModuleId(id));
export const actionsFor = (p: PageDef): ActionId[] =>
  p.readOnly ? ['view'] : PAGE_ACTIONS.map((a) => a.id);

export function findPageByPath(pathname: string) {
  if (!pathname) return undefined;
  return BY_HREF_DESC.find((p) => pathname === p.href || pathname.startsWith(p.href + '/'));
}

/** Pages every signed-in user can open regardless of grants. */
export function isUniversalPath(pathname: string) {
  return (
    pathname === '/' ||
    pathname === '/profile' ||
    pathname === '/notifications' ||
    pathname === '/my' ||
    pathname.startsWith('/my/')
  );
}

// ───────────────────────── user helpers ─────────────────────────
export function isTrueSuperAdmin(user: any): boolean {
  if (!user) return false;
  return (
    user.roleType === 'super_admin' ||
    user.role_type === 'super_admin' ||
    user.isSuperuser === true ||
    user.username === 'admin'
  );
}

/** Returns the page grants, or null when the employee is still on legacy (module-level) access. */
export function getPageGrants(user: any): PageGrants | null {
  const cp = user?.customPermissions ?? user?.custom_permissions;
  const p = cp && typeof cp === 'object' ? cp.pages : null;
  return p && typeof p === 'object' && !Array.isArray(p) ? (p as PageGrants) : null;
}

export function canDoOnPage(user: any, pageKey: string, action: string): boolean {
  if (isTrueSuperAdmin(user)) return true;
  const g = getPageGrants(user);
  if (!g) return true; // legacy mode — not decided here
  const list = g[pageKey];
  return Array.isArray(list) && list.includes(action);
}

export function canViewPageHref(user: any, href: string): boolean {
  if (isTrueSuperAdmin(user)) return true;
  const g = getPageGrants(user);
  if (!g) return true;
  const page = findPageByPath(href);
  if (!page) return false;
  return canDoOnPage(user, page.key, 'view');
}

/** Does the employee (in strict mode) have at least one viewable page in this module? */
export function moduleHasAnyPage(user: any, moduleId: string): boolean {
  const g = getPageGrants(user);
  if (!g) return true;
  const mod = getModule(moduleId);
  if (!mod) return false;
  return mod.pages.some((p) => Array.isArray(g[p.key]) && g[p.key].includes('view'));
}

/** Resolve the page an ad-hoc `can(module, pageTitle, …)` call refers to. */
export function matchPageByLabel(moduleId: string, label: string) {
  const mod = getModule(moduleId);
  const l = (label || '').toLowerCase().trim();
  if (!mod || !l) return undefined;
  return mod.pages.find((p) => p.label.toLowerCase() === l || p.key.toLowerCase() === l || p.key.split('.')[1] === l);
}

// ───────────────────────── editing helpers ─────────────────────────
/** Any granted action implies View. Removes unknown actions. */
export function normalizeActions(list: string[], page?: PageDef): string[] {
  const allowed = new Set<string>(page ? actionsFor(page) : PAGE_ACTIONS.map((a) => a.id));
  const set = new Set((list || []).filter((a) => allowed.has(a)));
  if (set.size > 0) set.add('view');
  return PAGE_ACTIONS.map((a) => a.id).filter((a) => set.has(a));
}

export function modulesFromGrants(grants: PageGrants): string[] {
  return PAGE_REGISTRY.filter((m) => m.pages.some((p) => (grants[p.key] || []).includes('view'))).map((m) => m.id);
}

/**
 * Build the object stored in `customPermissions`:
 *  - `pages` (authoritative, page level)
 *  - legacy module → actions lists (union of its pages) so server-side module checks stay consistent
 */
export function buildCustomPermissions(grants: PageGrants, existing?: Record<string, any>) {
  const out: Record<string, any> = {};
  // keep unrelated legacy keys, drop old module keys we are about to regenerate
  const moduleIds = new Set(PAGE_REGISTRY.map((m) => m.id));
  Object.entries(existing || {}).forEach(([k, v]) => {
    if (k !== 'pages' && !moduleIds.has(k)) out[k] = v;
  });
  const clean: PageGrants = {};
  PAGE_REGISTRY.forEach((m) => {
    const union = new Set<string>();
    m.pages.forEach((p) => {
      const acts = normalizeActions(grants[p.key] || [], p);
      if (acts.length) {
        clean[p.key] = acts;
        acts.forEach((a) => union.add(a));
      }
    });
    if (union.size) out[m.id] = Array.from(union);
  });
  out.pages = clean;
  return out;
}
