'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useERP } from '../../context/ERPContext';
import {
  Users,
  Briefcase,
  UserCheck,
  Award,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building,
  Hash,
  History,
  Bell,
  FileText,
  UserPlus,
  PhoneCall,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  FileCheck2,
  Lock,
  Sparkles,
  Zap,
  CheckSquare,
  Flag,
  Clock,
  Folder,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Activity as ActivityIcon,
  BarChart3,
  Cpu,
  Workflow,
  Palette,
  Compass,
  DraftingCompass,
  Box,
  Warehouse,
  Boxes,
  ShoppingBag,
  FolderKanban,
  Trash2,
  FileSpreadsheet,
  GitBranch,
  FolderOpen,
  FileCheck,
  ShoppingCart,
  Truck,
  ClipboardList,
  Package,
  PackageCheck,
  CornerUpLeft,
  Factory,
  Wrench,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  Landmark,
  Receipt,
  CreditCard,
  Coins,
  Scale,
  FileBarChart,
  Calculator,
  Wallet,
  Banknote,
  Database,
  UploadCloud,
  Bug,
  ShieldAlert,
  BookOpen,
  Send,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const {
    currentUser,
    hasDepartmentAccess,
    sidebarCollapsed,
    setSidebarCollapsed,
    leads,
    enquiries,
    customers,
    quotations,
    salesOrders,
    projectJobs,
    isProjectsLoading,
    designJobs,
    purchaseOrders,
    purchaseRequisitions,
    rfqs,
    supplierQuotations,
    itemMasters,
    goodsReceipts,
    workOrders,
    productionOrders,
    masterTasks = [],
  } = useERP();

  const roleStr = String(
    currentUser?.roleName ||
    currentUser?.role ||
    currentUser?.roleType ||
    currentUser?.role_type ||
    ''
  ).toLowerCase();

  const isSuperAdmin =
    roleStr.includes('super admin') ||
    roleStr.includes('super_admin') ||
    roleStr.includes('managing director') ||
    roleStr.includes('director') ||
    roleStr.includes('admin') ||
    currentUser?.roleType === 'super_admin' ||
    (currentUser as any)?.role_type === 'super_admin' ||
    currentUser?.dataScope === 'all' ||
    (currentUser as any)?.data_scope === 'all' ||
    currentUser?.assignedModules?.includes('all') ||
    (currentUser as any)?.assigned_modules?.includes('all') ||
    currentUser?.username === 'admin' ||
    currentUser?.username === 'durgesh.jadav' ||
    currentUser?.username === 'hardik.daki' ||
    currentUser?.username === 'rajesh.admin';

  const hasModule = (moduleKey: string) => {
    const cleanK = moduleKey.toLowerCase().trim();

    // 1. Check explicit restrictions first (overrides all grants)
    const restrictions = currentUser?.explicitRestrictions || currentUser?.explicit_restrictions;
    if (Array.isArray(restrictions)) {
      const isRestricted = restrictions.some((r: string) => {
        const cleanR = String(r).toLowerCase().trim();
        return cleanR === `${cleanK}:*` || cleanR === `${cleanK}:view` || cleanR === '*:*' || cleanR === '*:view';
      });
      if (isRestricted) return false;
    }

    // 2. Only Super Admin has unrestricted access to all modules
    if (isSuperAdmin) return true;

    // 3. Check computed effective permissions from backend if available
    const effMods = currentUser?.effectivePermissions?.allowed_modules || (currentUser as any)?.effective_permissions?.allowed_modules;
    if (Array.isArray(effMods) && effMods.length > 0) {
      return effMods.some((m: string) => {
        const cleanM = (m || '').toLowerCase().trim();
        return cleanM === cleanK || cleanM.includes(cleanK) || cleanK.includes(cleanM);
      });
    }

    // 4. Check assignedModules strictly (controls employee & Tier 2 admin module visibility)
    if (currentUser?.assignedModules && Array.isArray(currentUser.assignedModules)) {
      if (currentUser.assignedModules.length > 0) {
        return currentUser.assignedModules.some((m: string) => {
          const cleanM = (m || '').toLowerCase().trim();
          if (cleanK === 'accounting' && (cleanM === 'accounts' || cleanM === 'accounting' || cleanM === 'finance' || cleanM === 'accounts & finance')) return true;
          if (cleanK === 'design' && (cleanM === 'designer' || cleanM === 'design' || cleanM === 'bom')) return true;
          if (cleanK === 'projects' && (cleanM === 'project' || cleanM === 'projects' || cleanM === 'planning')) return true;
          if (cleanK === 'quality' && (cleanM === 'qc' || cleanM === 'quality')) return true;
          if (cleanK === 'store' && (cleanM === 'store' || cleanM === 'warehouse' || cleanM === 'inventory')) return true;
          if (cleanK === 'purchase' && (cleanM === 'purchase' || cleanM === 'rfq')) return true;
          return cleanM === cleanK || cleanM.includes(cleanK) || cleanK.includes(cleanM);
        });
      }
      // If assignedModules is empty array, user has no operational modules granted
      return false;
    }

    // 5. Department fallback only when assignedModules is undefined
    return hasDepartmentAccess ? hasDepartmentAccess(moduleKey) : false;
  };

  const pathname = usePathname();
  const [crmOpen, setCrmOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [designerOpen, setDesignerOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [productionOpen, setProductionOpen] = useState(false);
  const [accountingOpen, setAccountingOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [hrOpen, setHrOpen] = useState(false);
  const [integrationOpen, setIntegrationOpen] = useState(false);
  const [testingOpen, setTestingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    if (pathname === '/crm' || pathname.startsWith('/crm/')) setCrmOpen(true);
    if (pathname === '/projects' || pathname.startsWith('/projects/')) setProjectOpen(true);
    if (pathname === '/designer' || pathname.startsWith('/designer/')) setDesignerOpen(true);
    if (pathname === '/purchase' || pathname.startsWith('/purchase/')) setPurchaseOpen(true);
    if (pathname === '/store' || pathname.startsWith('/store/')) setStoreOpen(true);
    if (pathname === '/production' || pathname.startsWith('/production/')) setProductionOpen(true);
    if (pathname === '/accounting' || pathname.startsWith('/accounting/')) setAccountingOpen(true);
    if (pathname === '/maintenance' || pathname.startsWith('/maintenance/')) setMaintenanceOpen(true);
    if (pathname === '/hr' || pathname.startsWith('/hr/')) setHrOpen(true);
    if (pathname === '/qc' || pathname.startsWith('/qc/') || pathname.startsWith('/quality')) setTestingOpen(true);
    if (pathname === '/integration' || pathname.startsWith('/integration/')) setIntegrationOpen(true);
    if (pathname === '/testing' || pathname.startsWith('/testing/')) setTestingOpen(true);
    if (
      pathname.startsWith('/settings') ||
      pathname.startsWith('/users') ||
      pathname.startsWith('/roles') ||
      pathname.startsWith('/departments') ||
      pathname.startsWith('/permissions') ||
      pathname.startsWith('/notifications')
    ) {
      setSettingsOpen(true);
    }
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (pathname === href) return true;
    if (href === '/crm') return pathname === '/crm';
    return pathname.startsWith(href + '/');
  };

  const navItemClass = (href: string) => {
    const active = isActive(href);
    return cn(
      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative',
      active
        ? 'bg-crm-brand-700 text-white shadow-xs font-semibold hover:bg-crm-brand-800 hover:text-white [&_svg]:!text-white [&_span]:!text-white'
        : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
    );
  };

  const subNavItemClass = (href: string) => {
    const active = isActive(href);
    return cn(
      'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all group relative',
      active
        ? 'bg-crm-brand-700 text-white font-medium shadow-xs hover:bg-crm-brand-800 hover:text-white [&_svg]:!text-white [&_span:not(.font-mono)]:!text-white [&_span.font-mono]:!bg-white/20 [&_span.font-mono]:!text-white [&_span.font-mono]:!border-white/30'
        : 'text-[#6E5D53] hover:text-[#211B17] hover:bg-[#F3ECE4]'
    );
  };

  return (
    <aside
      className={cn(
        'bg-[var(--crm-bg-sidebar,#FAF7F2)] text-[var(--crm-text-primary,#3E2723)] border-r border-[var(--crm-border-default,#EBE3DB)] flex flex-col h-full transition-all duration-300 select-none z-30 shadow-xs relative',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-[var(--crm-border-default,#EBE3DB)] bg-[var(--crm-bg-sidebar,#FAF7F2)] flex-shrink-0">
        {!sidebarCollapsed ? (
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-crm-brand-700 flex items-center justify-center text-white font-black text-sm shadow-xs flex-shrink-0">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="leading-tight truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#3E2723] tracking-wide text-xs">UMA TECHNO FAB</span>
              </div>
              <span className="text-[10px] text-[#8D7B70] font-medium tracking-tight block">
                Manufacturing ERP
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto w-8 h-8 rounded-xl bg-crm-brand-700 flex items-center justify-center text-white font-black text-sm shadow-xs">
            <Settings className="w-4 h-4" />
          </Link>
        )}

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg text-[#8D7B70] hover:text-[#3E2723] hover:bg-[#F3ECE4] hidden sm:flex transition"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links Scrollable */}
      <div className="flex-1 overflow-y-auto py-2 px-2.5 space-y-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Executive Dashboard */}
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative',
            isActive('/')
              ? 'bg-crm-brand-700 text-white shadow-xs hover:bg-crm-brand-800 hover:text-white [&_svg]:!text-white'
              : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
          )}
        >
          <LayoutDashboard className={cn('w-4 h-4 flex-shrink-0', isActive('/') ? 'text-white' : 'text-crm-brand-700')} />
          {!sidebarCollapsed && <span>Dashboard</span>}
        </Link>

        {/* Employee Self-Service Quick Section (Attendance, Leaves, Assigned Tasks) */}
        {!isSuperAdmin && (
          <div className="py-1 px-1 mb-2 bg-[#F5EFE6] rounded-xl border border-[#E8DFD3] space-y-0.5">
            {!sidebarCollapsed && (
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-crm-brand-800 flex items-center justify-between">
                <span>My Workspace</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-crm-brand-100 text-crm-brand-700">
                  {currentUser?.roleType === 'department_manager' ? 'Manager' : 'Staff'}
                </span>
              </div>
            )}
            <Link href="/hr/attendance" className={subNavItemClass('/hr/attendance')}>
              <Clock className="w-3.5 h-3.5 flex-shrink-0 text-crm-brand-700" />
              {!sidebarCollapsed && <span>My Attendance</span>}
            </Link>
            <Link href="/hr/leaves" className={subNavItemClass('/hr/leaves')}>
              <FileCheck2 className="w-3.5 h-3.5 flex-shrink-0 text-crm-brand-700" />
              {!sidebarCollapsed && <span>My Leave Requests</span>}
            </Link>
          </div>
        )}

        {/* 1. CRM MODULE (MODULE 1 BUSINESS CORE) */}
        {hasModule('crm') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setCrmOpen(!crmOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                crmOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>CRM & Sales</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  crmOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(crmOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/crm" className={subNavItemClass('/crm')}>
                <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>CRM Dashboard</span>}
              </Link>
              <Link href="/crm/leads" className={subNavItemClass('/crm/leads')}>
                <Layers className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Leads</span>
                    <span suppressHydrationWarning className="px-1.5 py-0.2 rounded-full bg-crm-brand-100 text-crm-brand-800 font-mono text-[9px] font-bold border border-crm-brand-200">
                      {leads.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/crm/enquiries" className={subNavItemClass('/crm/enquiries')}>
                <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Inquiries</span>
                    {enquiries.length > 0 && (
                      <span suppressHydrationWarning className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                        {enquiries.length}
                      </span>
                    )}
                  </div>
                )}
              </Link>
              <Link href="/crm/customers" className={subNavItemClass('/crm/customers')}>
                <Building className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Customers</span>
                    {customers && customers.length > 0 && (
                      <span suppressHydrationWarning className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                        {customers.length}
                      </span>
                    )}
                  </div>
                )}
              </Link>
              <Link href="/crm/follow-ups" className={subNavItemClass('/crm/follow-ups')}>
                <PhoneCall className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Follow-ups (Today)</span>}
              </Link>
              <Link href="/crm/visits" className={subNavItemClass('/crm/visits')}>
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Site Visits</span>}
              </Link>
              <Link href="/crm/exhibitions" className={subNavItemClass('/crm/exhibitions')}>
                <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Exhibitions / Expo</span>}
              </Link>
              <Link href="/crm/quotations" className={subNavItemClass('/crm/quotations')}>
                <FileCheck2 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Quotations & Rev</span>
                    {quotations.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {quotations.length}
                    </span>
                  )}
                  </div>
                )}
              </Link>
              <Link href="/crm/customer-po" className={subNavItemClass('/crm/customer-po')}>
                <FileCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Customer POs</span>}
              </Link>
            </div>
          )}
        </div>
        )}

        {/* 2. PROJECT MANAGEMENT & JOB MANAGEMENT (MODULE 2) */}
        {hasModule('projects') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setProjectOpen(!projectOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                projectOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Project Management</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  projectOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(projectOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/projects/dashboard" className={subNavItemClass('/projects/dashboard')}>
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </Link>
              <Link href="/projects/list" className={subNavItemClass('/projects/list')}>
                <FolderKanban className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Projects</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {isProjectsLoading && projectJobs.length === 0 ? '...' : projectJobs.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/projects/planning" className={subNavItemClass('/projects/planning')}>
                <Workflow className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Project Planning</span>}
              </Link>
              <Link href="/projects/tasks" className={subNavItemClass('/projects/tasks')}>
                <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Task Management</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {masterTasks.length}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          )}
        </div>
        )}

        {/* 3. DESIGNER / ENGINEERING MANAGEMENT (MODULE 3) */}
        {hasModule('design') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setDesignerOpen(!designerOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                designerOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <DraftingCompass className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Designer & Engineering</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  designerOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(designerOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/designer/jobs" className={subNavItemClass('/designer/jobs')}>
                <Compass className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Design Jobs</span>
                    {designJobs.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {designJobs.length}
                    </span>
                  )}
                  </div>
                )}
              </Link>
              <Link href="/designer/bom" className={subNavItemClass('/designer/bom')}>
                <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>BOM</span>}
              </Link>
            </div>
          )}
        </div>
        )}

        {/* 4. PURCHASE MANAGEMENT (MODULE 4) */}
        {hasModule('purchase') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setPurchaseOpen(!purchaseOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                purchaseOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Purchase Management</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  purchaseOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(purchaseOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/purchase/dashboard" className={subNavItemClass('/purchase/dashboard')}>
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Purchase Dashboard</span>}
              </Link>
              <Link href="/purchase/requisition" className={subNavItemClass('/purchase/requisition')}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Material Requisition</span>
                    {purchaseRequisitions.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {purchaseRequisitions.length}
                    </span>
                  )}
                  </div>
                )}
              </Link>
              <Link href="/purchase/requests" className={subNavItemClass('/purchase/requests')}>
                <Send className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Purchase Requests (REQUIRE)</span>
                    {rfqs && rfqs.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {rfqs.length}
                    </span>
                  )}
                  </div>
                )}
              </Link>
              <Link href="/purchase/quotations" className={subNavItemClass('/purchase/quotations')}>
                <FileCheck2 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Supplier Quotations</span>
                    {supplierQuotations && supplierQuotations.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {supplierQuotations.length}
                    </span>
                  )}
                  </div>
                )}
              </Link>
              <Link href="/purchase/po" className={subNavItemClass('/purchase/po')}>
                <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Purchase Orders & Approvals</span>
                    {purchaseOrders.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {purchaseOrders.length}
                    </span>
                  )}
                  </div>
                )}
              </Link>
              <Link href="/purchase/suppliers" className={subNavItemClass('/purchase/suppliers')}>
                <Building className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Supplier Master</span>}
              </Link>
              <Link href="/purchase/returns" className={subNavItemClass('/purchase/returns')}>
                <CornerUpLeft className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Purchase Returns</span>}
              </Link>

            </div>
          )}
        </div>
        )}

        {/* 5. STORE & WAREHOUSE MANAGEMENT (MODULE 5) */}
        {hasModule('store') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setStoreOpen(!storeOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                storeOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Warehouse className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Store & Warehouse</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  storeOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(storeOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/store/dashboard" className={subNavItemClass('/store/dashboard')}>
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Store Dashboard</span>}
              </Link>
              <Link href="/store/items" className={subNavItemClass('/store/items')}>
                <Package className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Item / Material Master</span>
                    {itemMasters.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {itemMasters.length}
                    </span>
                  )}
                  </div>
                )}
              </Link>
              <Link href="/store/categories" className={subNavItemClass('/store/categories')}>
                <Layers className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Item Categories</span>}
              </Link>
              <Link href="/store/uom" className={subNavItemClass('/store/uom')}>
                <Scale className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Units of Measurement</span>}
              </Link>
              <Link href="/store/grn" className={subNavItemClass('/store/grn')}>
                <PackageCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Goods Receipt / GRN</span>
                    {goodsReceipts.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {goodsReceipts.length}
                    </span>
                  )}
                  </div>
                )}
              </Link>
              <Link href="/store/bom-verification" className={subNavItemClass('/store/bom-verification')}>
                <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>BOM Material Verify</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold border border-emerald-300">
                      Stock Check
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/store/material-issue" className={subNavItemClass('/store/material-issue')}>
                <Truck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Material Issue</span>}
              </Link>
              <Link href="/store/material-return" className={subNavItemClass('/store/material-return')}>
                <CornerUpLeft className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Material Return</span>}
              </Link>
              <Link href="/store/scrap" className={subNavItemClass('/store/scrap')}>
                <Trash2 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Scrap & Rejection</span>}
              </Link>
              <Link href="/store/reorder" className={subNavItemClass('/store/reorder')}>
                <Boxes className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Low Stock / Reorder</span>}
              </Link>

            </div>
          )}
        </div>
        )}

        {/* MODULE 6: PRODUCTION / MANUFACTURING / MRP */}
        {hasModule('production') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setProductionOpen(!productionOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                productionOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Factory className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Production & Shop Floor</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  productionOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(productionOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/production/dashboard" className={subNavItemClass('/production/dashboard')}>
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Production Dashboard</span>}
              </Link>
              <Link href="/production/planning" className={subNavItemClass('/production/planning')}>
                <Compass className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Production Planning</span>
                  </div>
                )}
              </Link>
              <Link href="/production/worker-daily-routine" className={subNavItemClass('/production/worker-daily-routine')}>
                <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-purple-600 group-hover:text-purple-800 transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Worker Daily Routine</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-mono text-[9px] font-bold border border-purple-300">
                      Daily
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/production/mrp" className={subNavItemClass('/production/mrp')}>
                <Cpu className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Material Planning & Issue (MRP)</span>}
              </Link>
              <Link href="/production/completion" className={subNavItemClass('/production/completion')}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Completion & QC Clearance</span>}
              </Link>
              <Link href="/production/dispatch" className={subNavItemClass('/production/dispatch')}>
                <Truck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Dispatch & Delivery Challan</span>}
              </Link>

            </div>
          )}
        </div>
        )}

        {/* MODULE 7: ACCOUNTING & FINANCE */}
        {hasModule('accounting') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setAccountingOpen(!accountingOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                accountingOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Accounting & Finance</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  accountingOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(accountingOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/accounting/dashboard" className={subNavItemClass('/accounting/dashboard')}>
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Accounting Dashboard</span>}
              </Link>
              <Link href="/accounting/chart-of-accounts" className={subNavItemClass('/accounting/chart-of-accounts')}>
                <GitBranch className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Chart of Accounts</span>}
              </Link>
              <Link href="/accounting/account-groups" className={subNavItemClass('/accounting/account-groups')}>
                <Folder className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Account Groups</span>}
              </Link>
              <Link href="/accounting/customers" className={subNavItemClass('/accounting/customers')}>
                <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Customer Ledgers</span>}
              </Link>
              <Link href="/accounting/suppliers" className={subNavItemClass('/accounting/suppliers')}>
                <Building className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Supplier Ledgers</span>}
              </Link>
              <Link href="/accounting/sales-invoices" className={subNavItemClass('/accounting/sales-invoices')}>
                <Receipt className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Sales Invoices</span>}
              </Link>
              <Link href="/accounting/purchase-invoices" className={subNavItemClass('/accounting/purchase-invoices')}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Purchase Invoices</span>}
              </Link>
              <Link href="/accounting/credit-notes" className={subNavItemClass('/accounting/credit-notes')}>
                <CreditCard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Credit Notes</span>}
              </Link>
              <Link href="/accounting/debit-notes" className={subNavItemClass('/accounting/debit-notes')}>
                <CreditCard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Debit Notes</span>}
              </Link>
              <Link href="/accounting/receipts" className={subNavItemClass('/accounting/receipts')}>
                <Coins className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Customer Receipts</span>}
              </Link>
              <Link href="/accounting/payments" className={subNavItemClass('/accounting/payments')}>
                <Banknote className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Supplier Payments</span>}
              </Link>
              <Link href="/accounting/journal-entries" className={subNavItemClass('/accounting/journal-entries')}>
                <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Journal Entries (JV)</span>}
              </Link>
              <Link href="/accounting/contra-entries" className={subNavItemClass('/accounting/contra-entries')}>
                <RotateCcw className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Contra Entries</span>}
              </Link>
              <Link href="/accounting/expenses" className={subNavItemClass('/accounting/expenses')}>
                <Wallet className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Expense Management</span>}
              </Link>
              <Link href="/accounting/cash-bank" className={subNavItemClass('/accounting/cash-bank')}>
                <Landmark className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Cash & Bank Accounts</span>}
              </Link>
              <Link href="/accounting/bank-reconciliation" className={subNavItemClass('/accounting/bank-reconciliation')}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Bank Reconciliation</span>}
              </Link>
              <Link href="/accounting/gst" className={subNavItemClass('/accounting/gst')}>
                <Scale className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>GST Management</span>}
              </Link>
              <Link href="/accounting/tds" className={subNavItemClass('/accounting/tds')}>
                <Calculator className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>TDS Compliance</span>}
              </Link>
              <Link href="/accounting/accounts-receivable" className={subNavItemClass('/accounting/accounts-receivable')}>
                <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Accounts Receivable (AR)</span>}
              </Link>
              <Link href="/accounting/accounts-payable" className={subNavItemClass('/accounting/accounts-payable')}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Accounts Payable (AP)</span>}
              </Link>
              <Link href="/accounting/outstanding" className={subNavItemClass('/accounting/outstanding')}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Outstanding & Reminders</span>}
              </Link>
              <Link href="/accounting/job-costing" className={subNavItemClass('/accounting/job-costing')}>
                <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Job-wise Costing</span>}
              </Link>
              <Link href="/accounting/project-costing" className={subNavItemClass('/accounting/project-costing')}>
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Project Financial Costing</span>}
              </Link>
              <Link href="/accounting/inventory-valuation" className={subNavItemClass('/accounting/inventory-valuation')}>
                <Box className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Inventory Financial Valuation</span>}
              </Link>
              <Link href="/accounting/fixed-assets" className={subNavItemClass('/accounting/fixed-assets')}>
                <Building className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Fixed Assets Master</span>}
              </Link>
              <Link href="/accounting/depreciation" className={subNavItemClass('/accounting/depreciation')}>
                <History className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Depreciation Schedule</span>}
              </Link>

              <Link href="/accounting/settings" className={subNavItemClass('/accounting/settings')}>
                <Settings className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Accounting Settings</span>}
              </Link>
            </div>
          )}
        </div>
        )}

        {/* MODULE 8: MAINTENANCE & SERVICES */}
        {hasModule('maintenance') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setMaintenanceOpen(!maintenanceOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                maintenanceOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Maintenance & Services</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  maintenanceOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(maintenanceOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/maintenance/dashboard" className={subNavItemClass('/maintenance/dashboard')}>
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Maintenance Dashboard</span>}
              </Link>
              <Link href="/maintenance/assets" className={subNavItemClass('/maintenance/assets')}>
                <Cpu className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Asset / Machine Master</span>}
              </Link>
              <Link href="/maintenance/service-requests" className={subNavItemClass('/maintenance/service-requests')}>
                <PhoneCall className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Service Requests</span>}
              </Link>
              <Link href="/maintenance/breakdowns" className={subNavItemClass('/maintenance/breakdowns')}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Breakdown Management</span>}
              </Link>
            </div>
          )}
        </div>
        )}

        {/* MODULE 9: HR & PAYROLL */}
        {hasModule('hr') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setHrOpen(!hrOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                hrOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>HR & Payroll</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  hrOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(hrOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              {/* HR */}
              {!sidebarCollapsed && <div className="px-3 pt-1 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">HR</div>}
              <Link href="/hr/dashboard" className={subNavItemClass('/hr/dashboard')}>
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>1. HR Dashboard</span>}
              </Link>
              <Link href="/hr/employees" className={subNavItemClass('/hr/employees')}>
                <UserCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>2. Employee Master</span>}
              </Link>
              <Link href="/hr/departments" className={subNavItemClass('/hr/departments')}>
                <Building className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>3. Departments</span>}
              </Link>
              <Link href="/hr/designations" className={subNavItemClass('/hr/designations')}>
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>4. Designations</span>}
              </Link>
              <Link href="/hr/documents" className={subNavItemClass('/hr/documents')}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>5. Employee Documents</span>}
              </Link>
              <Link href="/hr/onboarding" className={subNavItemClass('/hr/onboarding')}>
                <UserPlus className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>6. Employee Onboarding</span>}
              </Link>
              <Link href="/hr/transfers" className={subNavItemClass('/hr/transfers')}>
                <Workflow className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>7. Employee Transfers</span>}
              </Link>
              <Link href="/hr/promotions" className={subNavItemClass('/hr/promotions')}>
                <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>8. Promotion & Increment</span>}
              </Link>
              <Link href="/hr/exits" className={subNavItemClass('/hr/exits')}>
                <History className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>9. Resignation / Exit</span>}
              </Link>
              <Link href="/hr/settlement" className={subNavItemClass('/hr/settlement')}>
                <Calculator className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>10. Full & Final Settlement</span>}
              </Link>

              {/* Attendance */}
              {!sidebarCollapsed && <div className="px-3 pt-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Attendance</div>}
              <Link href="/hr/attendance" className={subNavItemClass('/hr/attendance')}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>11. Attendance</span>}
              </Link>
              <Link href="/hr/shifts" className={subNavItemClass('/hr/shifts')}>
                <Layers className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>12. Shift Management</span>}
              </Link>
              <Link href="/hr/roster" className={subNavItemClass('/hr/roster')}>
                <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>13. Shift Roster</span>}
              </Link>
              <Link href="/hr/holidays" className={subNavItemClass('/hr/holidays')}>
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>14. Holiday Calendar</span>}
              </Link>
              <Link href="/hr/leaves" className={subNavItemClass('/hr/leaves')}>
                <FileCheck2 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>15. Leave Management</span>}
              </Link>
              <Link href="/hr/leave-approvals" className={subNavItemClass('/hr/leave-approvals')}>
                <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>16. Leave Approvals</span>}
              </Link>
              <Link href="/hr/wfh" className={subNavItemClass('/hr/wfh')}>
                <Compass className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>17. WFH / Remote Work</span>}
              </Link>
              <Link href="/hr/missed-punch" className={subNavItemClass('/hr/missed-punch')}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>18. Missed Punch</span>}
              </Link>
              <Link href="/hr/regularization" className={subNavItemClass('/hr/regularization')}>
                <RotateCcw className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>19. Attendance Regularization</span>}
              </Link>
              <Link href="/hr/overtime" className={subNavItemClass('/hr/overtime')}>
                <Zap className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>20. Overtime</span>}
              </Link>
              <Link href="/hr/early-checkout" className={subNavItemClass('/hr/early-checkout')}>
                <History className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>21. Early Checkout</span>}
              </Link>

              {/* Payroll */}
              {!sidebarCollapsed && <div className="px-3 pt-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Payroll</div>}
              <Link href="/hr/payroll-dashboard" className={subNavItemClass('/hr/payroll-dashboard')}>
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>22. Payroll Dashboard</span>}
              </Link>
              <Link href="/hr/salary-structures" className={subNavItemClass('/hr/salary-structures')}>
                <Layers className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>23. Salary Structure</span>}
              </Link>
              <Link href="/hr/salary-components" className={subNavItemClass('/hr/salary-components')}>
                <Calculator className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>24. Salary Components</span>}
              </Link>
              <Link href="/hr/monthly-payroll" className={subNavItemClass('/hr/monthly-payroll')}>
                <Banknote className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>25. Monthly Payroll</span>}
              </Link>
              <Link href="/hr/payroll-approvals" className={subNavItemClass('/hr/payroll-approvals')}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>26. Payroll Approval</span>}
              </Link>
              <Link href="/hr/advances" className={subNavItemClass('/hr/advances')}>
                <Wallet className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>27. Employee Advances / Loans</span>}
              </Link>
              <Link href="/hr/reimbursements" className={subNavItemClass('/hr/reimbursements')}>
                <Receipt className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>28. Reimbursements / Expenses</span>}
              </Link>
              <Link href="/hr/payslips" className={subNavItemClass('/hr/payslips')}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>29. Payslips</span>}
              </Link>


            </div>
          )}
        </div>
        )}

        {/* MODULE 10: INTEGRATION & MANAGEMENT 360° */}
        {hasModule('integration') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setIntegrationOpen(!integrationOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                integrationOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Workflow className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Integration & 360°</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  integrationOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(integrationOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/integration/job-360" className={subNavItemClass('/integration/job-360')}>
                <Compass className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>1. Job 360° Overview</span>}
              </Link>
              <Link href="/integration/management-dashboard" className={subNavItemClass('/integration/management-dashboard')}>
                <BarChart3 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>2. Executive Dashboard</span>}
              </Link>
              <Link href="/integration/alert-center" className={subNavItemClass('/integration/alert-center')}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>3. Action & Alert Center</span>}
              </Link>
              <Link href="/integration/approval-center" className={subNavItemClass('/integration/approval-center')}>
                <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>4. Approval Center</span>}
              </Link>
              <Link href="/integration/customer-360" className={subNavItemClass('/integration/customer-360')}>
                <UserCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>5. Customer 360°</span>}
              </Link>
              <Link href="/integration/supplier-360" className={subNavItemClass('/integration/supplier-360')}>
                <Truck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>6. Supplier 360°</span>}
              </Link>
              <Link href="/integration/item-360" className={subNavItemClass('/integration/item-360')}>
                <Box className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>7. Item / Material 360°</span>}
              </Link>
              <Link href="/integration/employee-360" className={subNavItemClass('/integration/employee-360')}>
                <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>8. Employee 360°</span>}
              </Link>
              <Link href="/integration/activity-log" className={subNavItemClass('/integration/activity-log')}>
                <ActivityIcon className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>9. Global Activity Trail</span>}
              </Link>

            </div>
          )}
        </div>
        )}

        {/* MODULE 11: TESTING, SECURITY & PRODUCTION DEPLOYMENT */}
        {hasModule('testing') && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setTestingOpen(!testingOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                testingOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Testing & Security</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  testingOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(testingOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/testing/uat-hub" className={subNavItemClass('/testing/uat-hub')}>
                <FileCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>1. ERP UAT & Test Matrix</span>}
              </Link>
              <Link href="/testing/role-matrix" className={subNavItemClass('/testing/role-matrix')}>
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>2. Role & Scope Tester</span>}
              </Link>
              <Link href="/testing/bug-tracker" className={subNavItemClass('/testing/bug-tracker')}>
                <Bug className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>3. Internal Bug Tracker</span>}
              </Link>
              <Link href="/settings/backup-restore" className={subNavItemClass('/settings/backup-restore')}>
                <Database className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>4. Backup & Recovery</span>}
              </Link>
              <Link href="/settings/data-import" className={subNavItemClass('/settings/data-import')}>
                <UploadCloud className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>5. Data Import Wizard</span>}
              </Link>
              <Link href="/settings/security-hub" className={subNavItemClass('/settings/security-hub')}>
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>6. Security & Audit Hub</span>}
              </Link>
              <Link href="/settings/release-notes" className={subNavItemClass('/settings/release-notes')}>
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>7. Go-Live & Release Notes</span>}
              </Link>
            </div>
          )}
        </div>
        )}

        {/* 2. COMMON ERP FOUNDATION & USER/ROLE MANAGEMENT */}
        {(isSuperAdmin || hasModule('settings') || hasModule('foundation')) && (
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                settingsOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60 hover:bg-[#EFE8DF]'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Foundation & Admin</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[#9E8E82] transition-transform duration-200',
                  settingsOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          )}

          {(settingsOpen || sidebarCollapsed) && (
            <div className="ml-3.5 pl-2.5 my-1 border-l-2 border-[#E5DCD3] space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              <Link href="/users" className={subNavItemClass('/users')}>
                <UserCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Users & Employees</span>}
              </Link>
              <Link href="/departments" className={subNavItemClass('/departments')}>
                <Building className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Departments (9 Core)</span>}
              </Link>
              <Link href="/roles" className={subNavItemClass('/roles')}>
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Role Management</span>}
              </Link>
              <Link href="/permissions" className={subNavItemClass('/permissions')}>
                <Lock className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Permission Matrix</span>}
              </Link>
              <Link href="/settings/company" className={subNavItemClass('/settings/company')}>
                <Settings className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Company Profile</span>}
              </Link>
              <Link href="/settings/numbering" className={subNavItemClass('/settings/numbering')}>
                <Hash className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Numbering Series</span>}
              </Link>
              <Link href="/settings/audit-logs" className={subNavItemClass('/settings/audit-logs')}>
                <History className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Audit Trail Logs</span>}
              </Link>
              <Link href="/notifications" className={subNavItemClass('/notifications')}>
                <Bell className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Notifications</span>}
              </Link>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Quality | Innovation | Partnership Card Footer */}
      <div className="p-3 border-t border-[var(--crm-border-default,#EBE3DB)] bg-[var(--crm-bg-sidebar,#FAF7F2)] flex-shrink-0">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--crm-surface-card,#FFFFFF)] border border-[var(--crm-border-default,#EBE3DB)] text-[var(--crm-text-primary,#3E2723)] shadow-xs">
            <div className="w-7 h-7 rounded-full bg-[#211B17] text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
              N
            </div>
            <div className="text-[10px] text-[#6E5D53] font-semibold truncate tracking-tight">
              Quality | Innovation | Partnership
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-[#211B17] flex items-center justify-center text-white shadow-xs font-bold text-xs">
            N
          </div>
        )}
      </div>
    </aside>
  );
}
