'use client';

import React, { useState } from 'react';
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
  Box,
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
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const {
    currentUser,
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
    itemMasters,
    goodsReceipts,
    workOrders,
    productionOrders,
  } = useERP();

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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (pathname === href) return true;
    if (href === '/crm') return pathname === '/crm';
    return pathname.startsWith(href + '/');
  };

  const navItemClass = (href: string) =>
    cn(
      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative',
      isActive(href)
        ? 'bg-crm-brand-700 text-white shadow-xs font-semibold'
        : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
    );

  const subNavItemClass = (href: string) =>
    cn(
      'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all group relative',
      isActive(href)
        ? 'bg-crm-brand-700 text-white font-medium shadow-xs'
        : 'text-[#6E5D53] hover:text-[#211B17] hover:bg-[#F3ECE4]'
    );

  return (
    <aside
      className={cn(
        'bg-[#FAF7F2] text-[#3E2723] border-r border-[#EBE3DB] flex flex-col h-full transition-all duration-300 select-none z-30 shadow-xs relative',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#EBE3DB] bg-[#FAF7F2] flex-shrink-0">
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
              ? 'bg-crm-brand-700 text-white shadow-xs'
              : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
          )}
        >
          <LayoutDashboard className={cn('w-4 h-4 flex-shrink-0', isActive('/') ? 'text-white' : 'text-crm-brand-700')} />
          {!sidebarCollapsed && <span>Dashboard</span>}
        </Link>

        {/* 1. CRM MODULE (MODULE 1 BUSINESS CORE) */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setCrmOpen(!crmOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                crmOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
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
                    <span className="font-bold text-[#3E2723]">Leads</span>
                    <span suppressHydrationWarning className="px-1.5 py-0.2 rounded-full bg-crm-brand-100 text-crm-brand-800 font-mono text-[9px] font-bold border border-crm-brand-200">
                      {leads.length}
                    </span>
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
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {quotations.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/crm/customer-po" className={subNavItemClass('/crm/customer-po')}>
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Customer POs</span>}
              </Link>
              <Link href="/crm/sales-orders" className={subNavItemClass('/crm/sales-orders')}>
                <Layers className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Sales Orders</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {salesOrders.length}
                    </span>
                  </div>
                )}
              </Link>

            </div>
          )}
        </div>

        {/* 2. PROJECT MANAGEMENT & JOB MANAGEMENT (MODULE 2) */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setProjectOpen(!projectOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                projectOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
                <span>Project & Job Management</span>
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
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Projects</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {isProjectsLoading && projectJobs.length === 0 ? '...' : projectJobs.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/projects/jobs" className={subNavItemClass('/projects/jobs')}>
                <Cpu className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Jobs (360° View)</span>}
              </Link>
              <Link href="/projects/planning" className={subNavItemClass('/projects/planning')}>
                <Workflow className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Project Planning</span>}
              </Link>
              <Link href="/projects/tasks" className={subNavItemClass('/projects/tasks')}>
                <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Tasks & Dependencies</span>}
              </Link>

              <Link href="/projects/department-assignments" className={subNavItemClass('/projects/department-assignments')}>
                <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Dept Assignments</span>}
              </Link>
              <Link href="/projects/timeline" className={subNavItemClass('/projects/timeline')}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Project Timeline</span>}
              </Link>
              <Link href="/projects/documents" className={subNavItemClass('/projects/documents')}>
                <Folder className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Project Documents</span>}
              </Link>
              <Link href="/projects/cost" className={subNavItemClass('/projects/cost')}>
                <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Project Cost</span>}
              </Link>


            </div>
          )}
        </div>

        {/* 3. DESIGNER / ENGINEERING MANAGEMENT (MODULE 3) */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setDesignerOpen(!designerOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                designerOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
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
                <Palette className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Design Jobs</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {designJobs.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/designer/bom" className={subNavItemClass('/designer/bom')}>
                <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>BOM</span>}
              </Link>
              <Link href="/designer/approval" className={subNavItemClass('/designer/approval')}>
                <Zap className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Approval & Release</span>}
              </Link>
            </div>
          )}
        </div>

        {/* 4. PURCHASE MANAGEMENT (MODULE 4) */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setPurchaseOpen(!purchaseOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                purchaseOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
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
              <Link href="/purchase/mrp" className={subNavItemClass('/purchase/mrp')}>
                <Cpu className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Material Requirement / MRP</span>}
              </Link>
              <Link href="/purchase/requisition" className={subNavItemClass('/purchase/requisition')}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Purchase Requisition</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {purchaseRequisitions.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/purchase/suppliers" className={subNavItemClass('/purchase/suppliers')}>
                <Building className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Supplier Master</span>}
              </Link>
              <Link href="/purchase/supplier-contacts" className={subNavItemClass('/purchase/supplier-contacts')}>
                <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Supplier Contacts</span>}
              </Link>
              <Link href="/purchase/rfq" className={subNavItemClass('/purchase/rfq')}>
                <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>RFQ (Request for Quotation)</span>}
              </Link>
              <Link href="/purchase/quotations" className={subNavItemClass('/purchase/quotations')}>
                <FileCheck2 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Supplier Quotations</span>}
              </Link>
              <Link href="/purchase/quotation-comparison" className={subNavItemClass('/purchase/quotation-comparison')}>
                <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Quotation Comparison</span>}
              </Link>
              <Link href="/purchase/quotation-verify" className={subNavItemClass('/purchase/quotation-verify')}>
                <Award className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Quotation Verify</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold border border-emerald-300">
                      L1 Compare
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/purchase/po" className={subNavItemClass('/purchase/po')}>
                <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Purchase Orders</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {purchaseOrders.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/purchase/po-approval" className={subNavItemClass('/purchase/po-approval')}>
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>PO Approval</span>}
              </Link>
              <Link href="/purchase/followup" className={subNavItemClass('/purchase/followup')}>
                <Truck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Purchase Follow-up</span>}
              </Link>
              <Link href="/purchase/pending" className={subNavItemClass('/purchase/pending')}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Pending / Overdue</span>}
              </Link>
              <Link href="/purchase/returns" className={subNavItemClass('/purchase/returns')}>
                <CornerUpLeft className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Purchase Returns</span>}
              </Link>

            </div>
          )}
        </div>

        {/* 5. STORE & WAREHOUSE MANAGEMENT (MODULE 5) */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setStoreOpen(!storeOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                storeOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
                  : 'text-[#4A3B32] hover:text-[#211B17] hover:bg-[#F3ECE4]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Box className="w-4 h-4 text-crm-brand-700 flex-shrink-0" />
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
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {itemMasters.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/store/categories" className={subNavItemClass('/store/categories')}>
                <Layers className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Item Categories</span>}
              </Link>
              <Link href="/store/uom" className={subNavItemClass('/store/uom')}>
                <Compass className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Units of Measurement</span>}
              </Link>
              <Link href="/store/warehouses" className={subNavItemClass('/store/warehouses')}>
                <Building className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Warehouses Master</span>}
              </Link>
              <Link href="/store/locations" className={subNavItemClass('/store/locations')}>
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Store Locations / Bins</span>}
              </Link>
              <Link href="/store/opening-stock" className={subNavItemClass('/store/opening-stock')}>
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Opening Stock Entry</span>}
              </Link>
              <Link href="/store/grn" className={subNavItemClass('/store/grn')}>
                <PackageCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Goods Receipt / GRN</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {goodsReceipts.length}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/store/qc-inspection" className={subNavItemClass('/store/qc-inspection')}>
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Quality Inspection</span>}
              </Link>
              <Link href="/store/stock" className={subNavItemClass('/store/stock')}>
                <Box className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Stock Matrix (Usable)</span>}
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
              <Link href="/store/reservations" className={subNavItemClass('/store/reservations')}>
                <Lock className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Stock Reservation</span>}
              </Link>
              <Link href="/store/material-issue" className={subNavItemClass('/store/material-issue')}>
                <Truck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Material Issue</span>}
              </Link>
              <Link href="/store/material-return" className={subNavItemClass('/store/material-return')}>
                <CornerUpLeft className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Material Return</span>}
              </Link>
              <Link href="/store/transfers" className={subNavItemClass('/store/transfers')}>
                <Workflow className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Stock Transfer</span>}
              </Link>
              <Link href="/store/adjustments" className={subNavItemClass('/store/adjustments')}>
                <RotateCcw className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Stock Adjustment</span>}
              </Link>
              <Link href="/store/scrap" className={subNavItemClass('/store/scrap')}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Scrap & Rejection</span>}
              </Link>
              <Link href="/store/ledger" className={subNavItemClass('/store/ledger')}>
                <History className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Stock Ledger</span>}
              </Link>
              <Link href="/store/stock-count" className={subNavItemClass('/store/stock-count')}>
                <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Physical Stock Count</span>}
              </Link>
              <Link href="/store/reorder" className={subNavItemClass('/store/reorder')}>
                <Zap className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Low Stock / Reorder</span>}
              </Link>

            </div>
          )}
        </div>

        {/* MODULE 6: PRODUCTION / MANUFACTURING / MRP */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setProductionOpen(!productionOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                productionOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
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
                {!sidebarCollapsed && <span>Production Planning</span>}
              </Link>
              <Link href="/production/jobs" className={subNavItemClass('/production/jobs')}>
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Manufacturing Jobs</span>}
              </Link>
              <Link href="/production/work-orders" className={subNavItemClass('/production/work-orders')}>
                <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Work Orders</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {workOrders ? workOrders.length : 0}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/production/orders" className={subNavItemClass('/production/orders')}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Production Orders</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EFE8DF] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E5DCD3]">
                      {productionOrders ? productionOrders.length : 0}
                    </span>
                  </div>
                )}
              </Link>
              <Link href="/production/routing" className={subNavItemClass('/production/routing')}>
                <GitBranch className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Routing & Operations</span>}
              </Link>
              <Link href="/production/work-centers" className={subNavItemClass('/production/work-centers')}>
                <Wrench className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Work Centers & Machines</span>}
              </Link>
              <Link href="/production/schedule" className={subNavItemClass('/production/schedule')}>
                <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Production Schedule</span>}
              </Link>
              <Link href="/production/mrp" className={subNavItemClass('/production/mrp')}>
                <Cpu className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Material Requirement / MRP</span>}
              </Link>
              <Link href="/production/material-availability" className={subNavItemClass('/production/material-availability')}>
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Material Availability Check</span>}
              </Link>
              <Link href="/production/material-issue" className={subNavItemClass('/production/material-issue')}>
                <Truck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Material Issue Request</span>}
              </Link>
              <Link href="/production/wip" className={subNavItemClass('/production/wip')}>
                <Layers className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>WIP Tracking Matrix</span>}
              </Link>
              <Link href="/production/entry" className={subNavItemClass('/production/entry')}>
                <PlayCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Operator Production Entry</span>}
              </Link>
              <Link href="/production/operation-production" className={subNavItemClass('/production/operation-production')}>
                <Workflow className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Operation Progress</span>}
              </Link>
              <Link href="/production/rework" className={subNavItemClass('/production/rework')}>
                <RotateCcw className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Rework Order Manager</span>}
              </Link>
              <Link href="/production/scrap" className={subNavItemClass('/production/scrap')}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Production Scrap Tracker</span>}
              </Link>
              <Link href="/production/hold" className={subNavItemClass('/production/hold')}>
                <PauseCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Production Hold Manager</span>}
              </Link>
              <Link href="/production/completion" className={subNavItemClass('/production/completion')}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Completion & QC Clearance</span>}
              </Link>
              <Link href="/production/finished-goods" className={subNavItemClass('/production/finished-goods')}>
                <PackageCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Finished Goods Warehouse</span>}
              </Link>
              <Link href="/production/dispatch" className={subNavItemClass('/production/dispatch')}>
                <Truck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Dispatch & Delivery Challan</span>}
              </Link>
              <Link href="/production/cost" className={subNavItemClass('/production/cost')}>
                <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Job Production Costing</span>}
              </Link>

            </div>
          )}
        </div>

        {/* MODULE 7: ACCOUNTING & FINANCE */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setAccountingOpen(!accountingOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                accountingOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
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

        {/* MODULE 8: MAINTENANCE & SERVICES */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setMaintenanceOpen(!maintenanceOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                maintenanceOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
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
              <Link href="/maintenance/customer-machines" className={subNavItemClass('/maintenance/customer-machines')}>
                <Building className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Customer Machines</span>}
              </Link>
              <Link href="/maintenance/service-requests" className={subNavItemClass('/maintenance/service-requests')}>
                <PhoneCall className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Service Requests</span>}
              </Link>
              <Link href="/maintenance/breakdowns" className={subNavItemClass('/maintenance/breakdowns')}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Breakdown Management</span>}
              </Link>
              <Link href="/maintenance/preventive" className={subNavItemClass('/maintenance/preventive')}>
                <RotateCcw className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Preventive Maintenance</span>}
              </Link>
              <Link href="/maintenance/schedule" className={subNavItemClass('/maintenance/schedule')}>
                <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Maintenance Schedule</span>}
              </Link>
              <Link href="/maintenance/service-planning" className={subNavItemClass('/maintenance/service-planning')}>
                <Workflow className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Service Planning</span>}
              </Link>
              <Link href="/maintenance/technicians" className={subNavItemClass('/maintenance/technicians')}>
                <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Technician Assignment</span>}
              </Link>
              <Link href="/maintenance/service-visits" className={subNavItemClass('/maintenance/service-visits')}>
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Service Visits</span>}
              </Link>
              <Link href="/maintenance/work-orders" className={subNavItemClass('/maintenance/work-orders')}>
                <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Service Work Orders</span>}
              </Link>
              <Link href="/maintenance/spare-parts" className={subNavItemClass('/maintenance/spare-parts')}>
                <Package className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Spare Parts (Store)</span>}
              </Link>
              <Link href="/maintenance/parts-issue" className={subNavItemClass('/maintenance/parts-issue')}>
                <PackageCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Service Parts Issue</span>}
              </Link>
              <Link href="/maintenance/parts-return" className={subNavItemClass('/maintenance/parts-return')}>
                <CornerUpLeft className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Service Parts Return</span>}
              </Link>

              <Link href="/maintenance/warranty" className={subNavItemClass('/maintenance/warranty')}>
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Warranty Management</span>}
              </Link>
              <Link href="/maintenance/amc" className={subNavItemClass('/maintenance/amc')}>
                <FileCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>AMC Management</span>}
              </Link>
              <Link href="/maintenance/contracts" className={subNavItemClass('/maintenance/contracts')}>
                <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Service Contracts</span>}
              </Link>
              <Link href="/maintenance/customer-history" className={subNavItemClass('/maintenance/customer-history')}>
                <History className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Customer Service History</span>}
              </Link>
              <Link href="/maintenance/internal-maintenance" className={subNavItemClass('/maintenance/internal-maintenance')}>
                <Factory className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Internal Maintenance</span>}
              </Link>
              <Link href="/maintenance/downtime" className={subNavItemClass('/maintenance/downtime')}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Downtime Tracking</span>}
              </Link>
              <Link href="/maintenance/costs" className={subNavItemClass('/maintenance/costs')}>
                <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>Maintenance Costs</span>}
              </Link>

            </div>
          )}
        </div>

        {/* MODULE 9: HR & PAYROLL */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setHrOpen(!hrOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                hrOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
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


              {/* Performance & Development */}
              {!sidebarCollapsed && <div className="px-3 pt-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Performance</div>}
              <Link href="/hr/performance" className={subNavItemClass('/hr/performance')}>
                <ActivityIcon className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>31. Performance Management</span>}
              </Link>
              <Link href="/hr/kpis" className={subNavItemClass('/hr/kpis')}>
                <Flag className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>32. KPI Management</span>}
              </Link>
              <Link href="/hr/appraisals" className={subNavItemClass('/hr/appraisals')}>
                <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>33. Appraisal</span>}
              </Link>
              <Link href="/hr/training" className={subNavItemClass('/hr/training')}>
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>34. Training & Development</span>}
              </Link>

              {/* Recruitment */}
              {!sidebarCollapsed && <div className="px-3 pt-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Recruitment</div>}
              <Link href="/hr/recruitment" className={subNavItemClass('/hr/recruitment')}>
                <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>35. Recruitment Dashboard</span>}
              </Link>
              <Link href="/hr/job-positions" className={subNavItemClass('/hr/job-positions')}>
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>36. Job Positions</span>}
              </Link>
              <Link href="/hr/candidates" className={subNavItemClass('/hr/candidates')}>
                <UserPlus className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>37. Candidates</span>}
              </Link>
              <Link href="/hr/interviews" className={subNavItemClass('/hr/interviews')}>
                <PhoneCall className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>38. Interview Management</span>}
              </Link>
              <Link href="/hr/offers" className={subNavItemClass('/hr/offers')}>
                <FileCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#8D7B70] group-hover:text-[#3E2723] transition-colors" />
                {!sidebarCollapsed && <span>39. Offer Management</span>}
              </Link>
            </div>
          )}
        </div>

        {/* MODULE 10: INTEGRATION & MANAGEMENT 360° */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setIntegrationOpen(!integrationOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                integrationOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
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

        {/* MODULE 11: TESTING, SECURITY & PRODUCTION DEPLOYMENT */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setTestingOpen(!testingOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                testingOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
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

        {/* 2. COMMON ERP FOUNDATION & USER/ROLE MANAGEMENT */}
        <div className="py-0.5">
          {!sidebarCollapsed && (
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group',
                settingsOpen
                  ? 'text-[#3E2723] bg-[#EFE8DF]/60'
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
      </div>

      {/* Quality | Innovation | Partnership Card Footer */}
      <div className="p-3 border-t border-[#EBE3DB] bg-[#FAF7F2] flex-shrink-0">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#EBE3DB] text-[#3E2723] shadow-xs">
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
