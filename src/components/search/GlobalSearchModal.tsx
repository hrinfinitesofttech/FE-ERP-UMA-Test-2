'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '../../context/ERPContext';
import {
  Search,
  X,
  Briefcase,
  FileText,
  Building,
  ArrowRight,
  Sparkles,
  Users,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Package,
  Factory,
  Landmark,
  Wrench,
  UserCheck,
  ShieldCheck,
  Compass,
  Layers,
  Database,
  Calendar,
  PhoneCall,
  MapPin,
  TrendingUp,
  FileCheck2,
  Lock,
  Plus,
  ArrowUpRight,
  CornerDownLeft,
  BookOpen,
  ClipboardList,
  FolderOpen,
  Clock,
  UserPlus,
  Receipt,
  FileSpreadsheet,
  Cpu,
  Workflow,
  Truck,
  RotateCcw,
  Scale,
  CheckCircle2,
  DollarSign,
  Boxes,
  Flag,
  CheckSquare,
  AlertTriangle,
  Box,
  PackageCheck,
  CornerUpLeft,
} from 'lucide-react';
import { StatusBadge } from '../workflow/StatusBadge';
import { formatCurrency, formatDate } from '../../lib/utils';

interface PageItem {
  id: string;
  title: string;
  category: string;
  path: string;
  icon: any;
  description: string;
  keywords: string[];
}

export const ERP_PAGES_MASTER: PageItem[] = [
  // Core & Executive
  {
    id: 'page-dash',
    title: 'Executive Dashboard',
    category: 'Core',
    path: '/',
    icon: LayoutDashboard,
    description: 'Executive overview, real-time manufacturing KPIs, active jobs, and revenue metrics.',
    keywords: ['dashboard', 'home', 'main', 'kpi', 'revenue', 'overview', 'stats', 'analytics'],
  },
  {
    id: 'page-notifications',
    title: 'System Notifications Hub',
    category: 'Core',
    path: '/notifications',
    icon: Sparkles,
    description: 'Alerts, approval requests, system notices, and department updates.',
    keywords: ['notifications', 'alerts', 'messages', 'system', 'reminders'],
  },
  {
    id: 'page-profile',
    title: 'My Profile & Account',
    category: 'Core',
    path: '/profile',
    icon: Users,
    description: 'User details, role access, and account settings.',
    keywords: ['profile', 'account', 'user', 'settings', 'password'],
  },


  // 1. CRM & Sales
  {
    id: 'page-crm-dash',
    title: 'CRM & Sales Dashboard',
    category: 'CRM',
    path: '/crm',
    icon: TrendingUp,
    description: 'Commercial enquiry pipeline, deals winning rate, and monthly sales targets.',
    keywords: ['crm', 'sales', 'pipeline', 'funnel', 'revenue', 'commercial'],
  },
  {
    id: 'page-crm-leads',
    title: 'Active CRM Leads Register',
    category: 'CRM',
    path: '/crm/leads',
    icon: UserPlus,
    description: 'Browse, update, delete, and convert commercial inquiries with 360° view.',
    keywords: ['leads', 'crm', 'inquiries', 'prospective', 'clients', 'register'],
  },
  {
    id: 'page-crm-leads-new',
    title: '+ Register New Lead',
    category: 'CRM',
    path: '/crm/leads/new',
    icon: Plus,
    description: 'Create new customer lead, machine specifications, budget, and sales engineer assignment.',
    keywords: ['new lead', 'create lead', 'add lead', 'register lead', 'enquiry creation'],
  },
  {
    id: 'page-crm-enquiries',
    title: 'Commercial Enquiries Master',
    category: 'CRM',
    path: '/crm/enquiries',
    icon: FileText,
    description: 'Technical feasibility check, tender requirements, and customer RFP tracking.',
    keywords: ['enquiries', 'inquiries', 'rfp', 'tender', 'customer requests'],
  },
  {
    id: 'page-crm-customers',
    title: 'Corporate Customers Master',
    category: 'CRM',
    path: '/crm/customers',
    icon: Building,
    description: 'Client corporate directory, credit terms, GSTIN numbers, and contact points.',
    keywords: ['customers', 'clients', 'companies', 'customer master', 'directory', 'gst'],
  },
  {
    id: 'page-crm-followups',
    title: 'Client Follow-ups & Reminders',
    category: 'CRM',
    path: '/crm/follow-ups',
    icon: PhoneCall,
    description: 'Scheduled phone calls, WhatsApp discussions, meetings, and follow-up calendar.',
    keywords: ['followups', 'calls', 'meetings', 'reminders', 'schedule'],
  },
  {
    id: 'page-crm-visits',
    title: 'Site Visits & Factory Audits',
    category: 'CRM',
    path: '/crm/visits',
    icon: MapPin,
    description: 'Client plant audits, customer factory visits, and field survey reports.',
    keywords: ['visits', 'site audit', 'plant visit', 'field report'],
  },
  {
    id: 'page-crm-exhibitions',
    title: 'Exhibitions & Trade Expos',
    category: 'CRM',
    path: '/crm/exhibitions',
    icon: Calendar,
    description: 'Trade fair stalls, expo acquisitions, visitor scans, and event leads.',
    keywords: ['exhibitions', 'expo', 'trade fairs', 'events', 'chemtech', 'engiexpo'],
  },
  {
    id: 'page-crm-quotations',
    title: 'Sales Quotations & Proposals',
    category: 'CRM',
    path: '/crm/quotations',
    icon: FileCheck2,
    description: 'Commercial quotes, revision tracking, price breakdowns, and proposal PDFs.',
    keywords: ['quotations', 'proposals', 'quotes', 'estimates', 'commercial offer'],
  },
  {
    id: 'page-crm-sales-orders',
    title: 'Confirmed Sales Orders (SO)',
    category: 'CRM',
    path: '/crm/sales-orders',
    icon: CheckCircle2,
    description: 'Customer purchase orders accepted, SO numbering, and project handovers.',
    keywords: ['sales orders', 'so', 'confirmed orders', 'customer po', 'po acceptance'],
  },
  {
    id: 'page-crm-customer-feedback',
    title: 'Customer Feedback & CSAT',
    category: 'CRM',
    path: '/crm/customer-feedback',
    icon: Sparkles,
    description: 'Post-delivery satisfaction surveys, ratings, and customer testimonials.',
    keywords: ['feedback', 'csat', 'reviews', 'satisfaction', 'ratings'],
  },
  {
    id: 'page-crm-lost-analysis',
    title: 'Lost Deal & Competitor Analysis',
    category: 'CRM',
    path: '/crm/lost-analysis',
    icon: RotateCcw,
    description: 'Pricing gaps, lost reasons, competitor insights, and win-loss ratios.',
    keywords: ['lost analysis', 'lost deals', 'competitors', 'reasons'],
  },

  {
    id: 'page-crm-pricing',
    title: 'Machine Pricing Matrix',
    category: 'CRM',
    path: '/crm/pricing',
    icon: DollarSign,
    description: 'Standard tonnage rates, SS316L/SS304 fabrication pricing tables.',
    keywords: ['pricing', 'rates', 'fabrication cost', 'matrix', 'price list'],
  },
  {
    id: 'page-crm-commission',
    title: 'Sales Commission & Incentives',
    category: 'CRM',
    path: '/crm/commission',
    icon: DollarSign,
    description: 'Sales incentive calculations, booking bonuses, and targets.',
    keywords: ['commission', 'incentives', 'sales bonus', 'rewards'],
  },

  // 2. Project & Job Management
  {
    id: 'page-projects-list',
    title: 'Projects & Master Jobs Register',
    category: 'Projects',
    path: '/projects',
    icon: Briefcase,
    description: 'Active Make-to-Order reactor and pressure vessel manufacturing projects.',
    keywords: ['projects', 'jobs', 'mto', 'manufacturing projects', 'work packages'],
  },
  {
    id: 'page-projects-planning',
    title: 'Project Planning & WBS',
    category: 'Projects',
    path: '/projects/planning',
    icon: Compass,
    description: 'Stage planning, work breakdown structure, and milestone scheduling.',
    keywords: ['planning', 'wbs', 'project plan', 'milestones', 'stages'],
  },
  {
    id: 'page-projects-timeline',
    title: 'Project Timeline & Delivery Tracking',
    category: 'Projects',
    path: '/projects/timeline',
    icon: Clock,
    description: 'Gantt execution, timeline progress, and committed dispatch dates.',
    keywords: ['timeline', 'gantt', 'schedule', 'delivery dates', 'dispatch'],
  },

  {
    id: 'page-projects-tasks',
    title: 'Project Tasks & Action Items',
    category: 'Projects',
    path: '/projects/tasks',
    icon: CheckSquare,
    description: 'Engineer task assignments, completion status, and priority Kanban board.',
    keywords: ['tasks', 'action items', 'todo', 'kanban', 'assignments'],
  },

  {
    id: 'page-projects-cost',
    title: 'Project Budget & Cost Control',
    category: 'Projects',
    path: '/projects/cost',
    icon: DollarSign,
    description: 'Budget vs actual expenses, material consumption, and job margin tracking.',
    keywords: ['project cost', 'budget', 'actual cost', 'expenses', 'variance'],
  },
  {
    id: 'page-projects-documents',
    title: 'Project Technical Documents Locker',
    category: 'Projects',
    path: '/projects/documents',
    icon: FolderOpen,
    description: 'Fabrication drawings, approved QAP, test certificates, and client approvals.',
    keywords: ['project documents', 'drawings', 'qap', 'datasheets', 'certificates'],
  },

  {
    id: 'page-projects-assignments',
    title: 'Department Project Assignments',
    category: 'Projects',
    path: '/projects/department-assignments',
    icon: Users,
    description: 'Design, Purchase, Production, Quality, and Dispatch engineer assignments.',
    keywords: ['department assignments', 'team allocation', 'engineers', 'roles'],
  },


  // 3. Designer & Engineering
  {
    id: 'page-designer-jobs',
    title: 'Design Engineering Jobs Master',
    category: 'Design',
    path: '/designer/jobs',
    icon: Briefcase,
    description: 'Assigned CAD designer jobs, GA drawing creation, and revision status.',
    keywords: ['design jobs', 'cad jobs', 'ga drawings', 'fabrication drawings'],
  },
  {
    id: 'page-designer-bom',
    title: 'Engineering Bill of Materials (BOM)',
    category: 'Design',
    path: '/designer/bom',
    icon: Layers,
    description: 'Itemized raw material plates, dished ends, nozzles, and bought-out components.',
    keywords: ['bom', 'bill of materials', 'ebom', 'parts list', 'raw material specs'],
  },
  {
    id: 'page-designer-approval',
    title: 'Design Approvals & Sign-Offs',
    category: 'Design',
    path: '/designer/approval',
    icon: ShieldCheck,
    description: 'Client sign-off, internal QA approval, and drawing release to shop floor.',
    keywords: ['design approval', 'sign off', 'client drawing approval', 'qa approval'],
  },


  // 4. Purchase Management
  {
    id: 'page-purchase-dash',
    title: 'Purchase & Procurement Dashboard',
    category: 'Purchase',
    path: '/purchase/dashboard',
    icon: ShoppingCart,
    description: 'Procurement spend, pending requisitions, and vendor delivery performance.',
    keywords: ['purchase', 'procurement', 'purchase dashboard', 'spend', 'buyer'],
  },
  {
    id: 'page-purchase-pr',
    title: 'Purchase Requisitions (PR)',
    category: 'Purchase',
    path: '/purchase/requisition',
    icon: ClipboardList,
    description: 'Material indents from Design/Store, required dates, and procurement approval.',
    keywords: ['requisition', 'pr', 'purchase indent', 'material request', 'indent'],
  },
  {
    id: 'page-purchase-rfq',
    title: 'Request for Quotation (RFQ)',
    category: 'Purchase',
    path: '/purchase/rfq',
    icon: SendIcon,
    description: 'Send RFQ to multiple suppliers for steel plates, pipes, valves, and components.',
    keywords: ['rfq', 'request for quotation', 'vendor inquiry', 'bids request'],
  },
  {
    id: 'page-purchase-quotes',
    title: 'Supplier Quotations Register',
    category: 'Purchase',
    path: '/purchase/quotations',
    icon: FileCheck2,
    description: 'Received vendor bids, rates, freight terms, and delivery commitments.',
    keywords: ['supplier quotes', 'vendor bids', 'purchase rates', 'quotation register'],
  },
  {
    id: 'page-purchase-cs',
    title: 'Quotation Comparison Statement (CS)',
    category: 'Purchase',
    path: '/purchase/quotation-comparison',
    icon: Scale,
    description: 'Side-by-side L1/L2 vendor price comparison and technical evaluation.',
    keywords: ['quotation comparison', 'cs', 'l1 comparison', 'vendor selection', 'evaluation'],
  },
  {
    id: 'page-purchase-po',
    title: 'Purchase Orders (PO) Master',
    category: 'Purchase',
    path: '/purchase/po',
    icon: FileCheck2,
    description: 'Issue official purchase orders to suppliers, track delivery dates, and tax terms.',
    keywords: ['purchase orders', 'po', 'issued po', 'orders to vendors', 'po master'],
  },
  {
    id: 'page-purchase-po-approval',
    title: 'PO Approval & Authorization Matrix',
    category: 'Purchase',
    path: '/purchase/po-approval',
    icon: ShieldCheck,
    description: 'Management authorization for high-value purchase orders prior to release.',
    keywords: ['po approval', 'management approval', 'authorization', 'sign off po'],
  },
  {
    id: 'page-purchase-followup',
    title: 'Supplier Delivery Follow-ups',
    category: 'Purchase',
    path: '/purchase/followup',
    icon: PhoneCall,
    description: 'Vendor expediting, dispatched consignment tracking, and delay alerts.',
    keywords: ['purchase followup', 'expediting', 'supplier delivery', 'tracking'],
  },
  {
    id: 'page-purchase-suppliers',
    title: 'Suppliers & Approved Vendors Master',
    category: 'Purchase',
    path: '/purchase/suppliers',
    icon: Building,
    description: 'Approved vendor list (AVL), ISO certifications, GST numbers, and payment terms.',
    keywords: ['suppliers', 'vendors', 'vendor master', 'avl', 'approved suppliers', 'gst'],
  },
  {
    id: 'page-purchase-supplier-contacts',
    title: 'Supplier Contacts Directory',
    category: 'Purchase',
    path: '/purchase/supplier-contacts',
    icon: Users,
    description: 'Vendor sales heads, logistics contacts, phone numbers, and emails.',
    keywords: ['supplier contacts', 'vendor phone numbers', 'reps directory'],
  },
  {
    id: 'page-purchase-pending',
    title: 'Pending Purchase Indents',
    category: 'Purchase',
    path: '/purchase/pending',
    icon: Clock,
    description: 'Indents waiting for PO generation or vendor finalization.',
    keywords: ['pending indents', 'unissued po', 'pending purchase'],
  },
  {
    id: 'page-purchase-returns',
    title: 'Purchase Returns (Debit Notes)',
    category: 'Purchase',
    path: '/purchase/returns',
    icon: RotateCcw,
    description: 'Rejected material returns, debit note issuance, and supplier replacements.',
    keywords: ['purchase returns', 'debit notes', 'rejections', 'return to vendor'],
  },
  {
    id: 'page-purchase-mrp',
    title: 'Material Requirement Planning (MRP)',
    category: 'Purchase',
    path: '/purchase/mrp',
    icon: Cpu,
    description: 'Automated procurement forecasting based on active job BOMs and stock.',
    keywords: ['mrp', 'material planning', 'shortage calculator', 'procurement planning'],
  },


  // 5. Store & Inventory Warehouse
  {
    id: 'page-store-dash',
    title: 'Store & Warehouse Dashboard',
    category: 'Store',
    path: '/store/dashboard',
    icon: Package,
    description: 'Total inventory valuation, stock turnover, and reorder threshold alerts.',
    keywords: ['store', 'inventory', 'warehouse', 'stock dashboard', 'valuation'],
  },
  {
    id: 'page-store-items',
    title: 'Item Master Register (Raw & Consumables)',
    category: 'Store',
    path: '/store/items',
    icon: Boxes,
    description: 'Complete catalog of steel plates, pipes, fittings, gaskets, and consumables.',
    keywords: ['items', 'item master', 'materials', 'catalog', 'skus', 'raw material'],
  },
  {
    id: 'page-store-stock',
    title: 'Live Stock Inventory',
    category: 'Store',
    path: '/store/stock',
    icon: Package,
    description: 'Current physical quantity on hand, allocated quantity, and free stock.',
    keywords: ['stock', 'inventory', 'quantity on hand', 'live stock', 'balance'],
  },
  {
    id: 'page-store-opening',
    title: 'Opening Stock Initialization',
    category: 'Store',
    path: '/store/opening-stock',
    icon: Database,
    description: 'Financial year opening stock entry and initial valuation balances.',
    keywords: ['opening stock', 'initial balance', 'inventory opening'],
  },
  {
    id: 'page-store-grn',
    title: 'Goods Receipt Note (GRN)',
    category: 'Store',
    path: '/store/grn',
    icon: PackageCheck,
    description: 'Gate inward receipts against PO, Challan verification, and delivery logging.',
    keywords: ['grn', 'goods receipt note', 'inward receipt', 'gate entry', 'material inward'],
  },
  {
    id: 'page-store-qc',
    title: 'QC Inspection & Material Test Certificates (MTC)',
    category: 'Store',
    path: '/store/qc-inspection',
    icon: ShieldCheck,
    description: 'Chemical composition, ultrasonic testing, physical checks, and QC clearance.',
    keywords: ['qc inspection', 'mtc', 'heat number verification', 'quality check', 'inward qc'],
  },
  {
    id: 'page-store-issue',
    title: 'Material Issue to Shop Floor',
    category: 'Store',
    path: '/store/material-issue',
    icon: Truck,
    description: 'Issue raw materials against Job # and Work Orders with heat number tagging.',
    keywords: ['material issue', 'dispatch to shop', 'job issue', 'store issue voucher'],
  },
  {
    id: 'page-store-return',
    title: 'Material Return from Shop Floor',
    category: 'Store',
    path: '/store/material-return',
    icon: CornerUpLeft,
    description: 'Return unused steel plates, pipe cut pieces, and excess consumables.',
    keywords: ['material return', 'shop return', 'surplus return', 'scrap return'],
  },
  {
    id: 'page-store-count',
    title: 'Physical Stock Audit & Count',
    category: 'Store',
    path: '/store/stock-count',
    icon: CheckSquare,
    description: 'Periodic physical inventory verification, variance logging, and reconciliation.',
    keywords: ['stock count', 'physical audit', 'inventory count', 'stock reconciliation'],
  },
  {
    id: 'page-store-reorder',
    title: 'Auto Reorder & Min-Max Levels',
    category: 'Store',
    path: '/store/reorder',
    icon: AlertTriangle,
    description: 'Items below safety stock threshold and automatic PR generation.',
    keywords: ['reorder', 'min max levels', 'safety stock', 'low stock alerts'],
  },
  {
    id: 'page-store-transfers',
    title: 'Inter-Warehouse Stock Transfers',
    category: 'Store',
    path: '/store/transfers',
    icon: Truck,
    description: 'Stock movement between Main Store, Plant 1, Plant 2, and Sub-Stores.',
    keywords: ['transfers', 'warehouse transfer', 'inter-plant transfer', 'location transfer'],
  },
  {
    id: 'page-store-adjustments',
    title: 'Stock Adjustments & Write-offs',
    category: 'Store',
    path: '/store/adjustments',
    icon: Scale,
    description: 'Manual quantity adjustments, weight corrections, and damaged write-offs.',
    keywords: ['adjustments', 'write off', 'variance adjustment', 'stock correction'],
  },
  {
    id: 'page-store-scrap',
    title: 'Metal Scrap & Waste Ledger',
    category: 'Store',
    path: '/store/scrap',
    icon: Trash2Icon,
    description: 'SS304/SS316 plate cutting scrap, turnings, and disposal registers.',
    keywords: ['scrap', 'metal waste', 'scrap ledger', 'disposal', 'offcuts'],
  },
  {
    id: 'page-store-reservations',
    title: 'Job Material Reservations',
    category: 'Store',
    path: '/store/reservations',
    icon: Lock,
    description: 'Earmark in-stock materials specifically for confirmed job orders.',
    keywords: ['reservations', 'allocated stock', 'earmarked inventory', 'job lock'],
  },
  {
    id: 'page-store-warehouses',
    title: 'Warehouses & Plant Stores',
    category: 'Store',
    path: '/store/warehouses',
    icon: Building,
    description: 'Master list of warehouses, plant yards, and consignment storage.',
    keywords: ['warehouses', 'godown', 'plant yards', 'stores master'],
  },
  {
    id: 'page-store-locations',
    title: 'Racks, Bins & Location Grid',
    category: 'Store',
    path: '/store/locations',
    icon: MapPin,
    description: 'Aisle, rack, shelf, and bin coordinate tracking for fast picking.',
    keywords: ['locations', 'bins', 'racks', 'aisles', 'shelf locations'],
  },
  {
    id: 'page-store-categories',
    title: 'Item Categories & Sub-types',
    category: 'Store',
    path: '/store/categories',
    icon: Layers,
    description: 'Raw Plates, Pipes, Fasteners, Valves, Paints, and Welding Consumables categories.',
    keywords: ['categories', 'item groups', 'material types', 'classification'],
  },
  {
    id: 'page-store-uom',
    title: 'Units of Measurement (UOM)',
    category: 'Store',
    path: '/store/uom',
    icon: Scale,
    description: 'Kg, Metric Ton, Meter, Nos, Litres, Sets, and conversion factors.',
    keywords: ['uom', 'units', 'kg', 'ton', 'meters', 'measurement'],
  },
  {
    id: 'page-store-ledger',
    title: 'Item Stock Movement Ledger',
    category: 'Store',
    path: '/store/ledger',
    icon: BookOpen,
    description: 'Complete chronological inward/outward card ledger with weighted average cost.',
    keywords: ['stock ledger', 'bin card', 'movement history', 'inward outward'],
  },


  // 6. Production & Shop Floor
  {
    id: 'page-prod-dash',
    title: 'Production Control Dashboard',
    category: 'Production',
    path: '/production/dashboard',
    icon: Factory,
    description: 'Active shop jobs, machine capacity utilization, and daily output rates.',
    keywords: ['production', 'shop floor', 'manufacturing', 'oee', 'machine utilization'],
  },
  {
    id: 'page-prod-orders',
    title: 'Production Orders Master',
    category: 'Production',
    path: '/production/orders',
    icon: ClipboardList,
    description: 'Manufacturing work packages released from sales orders and projects.',
    keywords: ['production orders', 'manufacturing orders', 'job cards', 'mo'],
  },
  {
    id: 'page-prod-planning',
    title: 'Production Capacity Planning',
    category: 'Production',
    path: '/production/planning',
    icon: Compass,
    description: 'Workstation load balancing, bottleneck prevention, and target dates.',
    keywords: ['production planning', 'capacity planning', 'shop schedule', 'loading'],
  },
  {
    id: 'page-prod-schedule',
    title: 'Daily Machine Shop Schedule',
    category: 'Production',
    path: '/production/schedule',
    icon: Clock,
    description: 'Shift schedules for CNC cutting, rolling machines, and welding bays.',
    keywords: ['schedule', 'shop schedule', 'machine schedule', 'shift plan'],
  },
  {
    id: 'page-prod-workcenters',
    title: 'Work Centers & Machinery Master',
    category: 'Production',
    path: '/production/work-centers',
    icon: Cpu,
    description: 'Plate bending rolls, plasma cutters, SAW welding rigs, lathe machines.',
    keywords: ['work centers', 'machines', 'bays', 'cnc plasma', 'rolling machine'],
  },
  {
    id: 'page-prod-routing',
    title: 'Shop Operation Routing Master',
    category: 'Production',
    path: '/production/routing',
    icon: Workflow,
    description: 'Standard operational flow: Cutting → Rolling → Fit-up → Welding → NDT → Hydro Test.',
    keywords: ['routing', 'operations', 'process sequence', 'manufacturing steps'],
  },
  {
    id: 'page-prod-work-orders',
    title: 'Shop Floor Work Orders',
    category: 'Production',
    path: '/production/work-orders',
    icon: FileText,
    description: 'Operation-level work travelers and shift supervisor assignments.',
    keywords: ['work orders', 'job travelers', 'operation orders', 'routing cards'],
  },
  {
    id: 'page-prod-entry',
    title: 'Daily Production Entry (DPR)',
    category: 'Production',
    path: '/production/entry',
    icon: CheckCircle2,
    description: 'Shift log of completed welding, machining hours, and welder ID entry.',
    keywords: ['dpr', 'daily production report', 'production entry', 'shift log'],
  },
  {
    id: 'page-prod-wip',
    title: 'Work In Progress (WIP) Tracking',
    category: 'Production',
    path: '/production/wip',
    icon: Layers,
    description: 'Current stage of vessel shells, dished ends, limpet coils, and nozzles.',
    keywords: ['wip', 'work in progress', 'stage tracking', 'vessel fabrication'],
  },
  {
    id: 'page-prod-mat-issue',
    title: 'Production Material Request & Issue',
    category: 'Production',
    path: '/production/material-issue',
    icon: Package,
    description: 'Material draw slips for plates, pipes, flanges, and consumables.',
    keywords: ['production material issue', 'draw slip', 'raw material draw'],
  },
  {
    id: 'page-prod-mat-avail',
    title: 'Material Readiness & Availability Check',
    category: 'Production',
    path: '/production/material-availability',
    icon: CheckSquare,
    description: 'Pre-production checklist to ensure all BOM parts are physically in store.',
    keywords: ['material availability', 'readiness check', 'shortage check'],
  },
  {
    id: 'page-prod-completion',
    title: 'Final Job Clearance & Hydro Test',
    category: 'Production',
    path: '/production/completion',
    icon: CheckCircle2,
    description: 'Hydrostatic pressure test clearance, radiography sign-off, and painting approval.',
    keywords: ['job completion', 'hydro test', 'final clearance', 'ndt clearance', 'qa signoff'],
  },
  {
    id: 'page-prod-hold',
    title: 'On-Hold Jobs & Stoppages',
    category: 'Production',
    path: '/production/hold',
    icon: AlertTriangle,
    description: 'Jobs paused due to design change, client inspection, or material wait.',
    keywords: ['on hold', 'stoppages', 'paused jobs', 'inspection hold'],
  },
  {
    id: 'page-prod-rework',
    title: 'Weld Rework & Rectification Log',
    category: 'Production',
    path: '/production/rework',
    icon: RotateCcw,
    description: 'Radiography test (RT) defect repairs, weld gouging, and re-inspection.',
    keywords: ['rework', 'rectification', 'weld defects', 'radiography repair'],
  },
  {
    id: 'page-prod-scrap',
    title: 'Production Trimming & Scrap',
    category: 'Production',
    path: '/production/scrap',
    icon: Trash2Icon,
    description: 'Plate end cuts, pipe stubs, and process manufacturing waste logging.',
    keywords: ['production scrap', 'trimmings', 'manufacturing loss', 'offcuts'],
  },
  {
    id: 'page-prod-finished-goods',
    title: 'Finished Goods & Dispatch Yard',
    category: 'Production',
    path: '/production/finished-goods',
    icon: PackageCheck,
    description: 'Completed reactors ready for dispatch, packing, and client handover.',
    keywords: ['finished goods', 'dispatch yard', 'ready for dispatch', 'completed vessels'],
  },
  {
    id: 'page-prod-mrp',
    title: 'Production MRP Simulation',
    category: 'Production',
    path: '/production/mrp',
    icon: Cpu,
    description: 'Explode multi-level subassemblies to calculate part requirements.',
    keywords: ['production mrp', 'assembly explosion', 'capacity simulation'],
  },
  {
    id: 'page-prod-cost',
    title: 'Production Costing & Labor Hours',
    category: 'Production',
    path: '/production/cost',
    icon: DollarSign,
    description: 'Man-hours booked, welding consumable costs, and electricity overheads.',
    keywords: ['production cost', 'man hours', 'machine cost', 'welding cost'],
  },
  {
    id: 'page-prod-op',
    title: 'Operation-wise Production Tracking',
    category: 'Production',
    path: '/production/operation-production',
    icon: Workflow,
    description: 'Cutting, Rolling, Tack Welding, Final Welding, Machining, and Pickling.',
    keywords: ['operations tracking', 'cutting', 'rolling', 'welding', 'pickling'],
  },
  {
    id: 'page-prod-jobs',
    title: 'Production Job Cards Register',
    category: 'Production',
    path: '/production/jobs',
    icon: Briefcase,
    description: 'Browse all active manufacturing job orders on the shop floor.',
    keywords: ['production jobs', 'shop jobs', 'active manufacturing'],
  },


  // 7. Accounting & Finance
  {
    id: 'page-acc-dash',
    title: 'Finance & Accounts Dashboard',
    category: 'Accounts',
    path: '/accounting',
    icon: Landmark,
    description: 'Receivables, Payables, Bank balances, GST liabilities, and P&L.',
    keywords: ['accounting', 'finance', 'accounts dashboard', 'receivables', 'payables'],
  },
  {
    id: 'page-acc-invoices',
    title: 'Sales Tax Invoices (GST)',
    category: 'Accounts',
    path: '/accounting/invoices',
    icon: Receipt,
    description: 'Generate commercial tax invoices, proforma invoices, and payment status.',
    keywords: ['invoices', 'sales invoices', 'gst invoices', 'proforma', 'tax invoices', 'billing'],
  },
  {
    id: 'page-acc-payments',
    title: 'Customer Payment Receipts',
    category: 'Accounts',
    path: '/accounting/payments',
    icon: DollarSign,
    description: 'Record bank inward RTGS/NEFT receipts, advance payments, and invoice reconciliation.',
    keywords: ['payments', 'receipts', 'customer payment', 'bank inward', 'rtgs', 'collection'],
  },
  {
    id: 'page-acc-purchase-bills',
    title: 'Supplier Purchase Bills',
    category: 'Accounts',
    path: '/accounting/purchase-bills',
    icon: FileCheck2,
    description: 'Record vendor tax bills, verify GRN 3-way matching, and payment schedules.',
    keywords: ['purchase bills', 'vendor bills', '3-way matching', 'supplier invoice'],
  },
  {
    id: 'page-acc-expenses',
    title: 'Vouchers & Factory Expenses',
    category: 'Accounts',
    path: '/accounting/expenses',
    icon: DollarSign,
    description: 'Petty cash, factory power bills, transport freight, and administrative expenses.',
    keywords: ['expenses', 'vouchers', 'petty cash', 'freight expenses', 'factory expense'],
  },
  {
    id: 'page-acc-ledger',
    title: 'General Ledger & Chart of Accounts',
    category: 'Accounts',
    path: '/accounting/ledger',
    icon: BookOpen,
    description: 'Account statements, journal entries, trial balance, and debit/credit ledger.',
    keywords: ['general ledger', 'chart of accounts', 'journal entries', 'account statement'],
  },
  {
    id: 'page-acc-gst',
    title: 'GST Filing & Monthly Summary (GSTR-1 / 3B)',
    category: 'Accounts',
    path: '/accounting/gst',
    icon: Scale,
    description: 'Input tax credit (ITC), outward supply summary, and monthly GST calculation.',
    keywords: ['gst', 'gstr1', 'gstr3b', 'tax filing', 'itc', 'input tax credit'],
  },
  {
    id: 'page-acc-ewaybill',
    title: 'E-Way Bill & E-Invoicing Portal',
    category: 'Accounts',
    path: '/accounting/e-waybill',
    icon: Truck,
    description: 'NIC Portal E-Way bill generation, transporter ID, and vehicle numbers.',
    keywords: ['e-waybill', 'eway bill', 'e-invoice', 'irn', 'transport bill'],
  },
  {
    id: 'page-acc-banking',
    title: 'Banking & Bank Reconciliation',
    category: 'Accounts',
    path: '/accounting/banking',
    icon: Landmark,
    description: 'HDFC / SBI bank accounts, cheque registers, and reconciliation statements.',
    keywords: ['banking', 'bank reconciliation', 'cheque register', 'bank balance'],
  },
  {
    id: 'page-acc-aging',
    title: 'Debtors & Creditors Aging Analysis',
    category: 'Accounts',
    path: '/accounting/aging',
    icon: Clock,
    description: '30 / 60 / 90 / 180+ days payment overdue reports and recovery follow-up.',
    keywords: ['aging', 'debtors aging', 'creditors aging', 'overdue payments', 'outstanding'],
  },



  // 8. Maintenance & Services
  {
    id: 'page-maint-dash',
    title: 'Plant Maintenance Hub Dashboard',
    category: 'Maintenance',
    path: '/maintenance/dashboard',
    icon: Wrench,
    description: 'MTBF, MTTR, asset health, and breakdown downtime analytics.',
    keywords: ['maintenance', 'plant maintenance', 'asset health', 'mtbf', 'mttr'],
  },
  {
    id: 'page-maint-breakdowns',
    title: 'Breakdown Maintenance Tickets',
    category: 'Maintenance',
    path: '/maintenance/breakdowns',
    icon: AlertTriangle,
    description: 'Emergency breakdown logs, machine repair status, and root cause analysis.',
    keywords: ['breakdown', 'emergency repairs', 'machine breakdown', 'downtime ticket'],
  },
  {
    id: 'page-maint-pm',
    title: 'Preventive Maintenance (PM)',
    category: 'Maintenance',
    path: '/maintenance/preventive',
    icon: CheckCircle2,
    description: 'Periodic machine lubrication, hydraulic oil changes, and crane inspections.',
    keywords: ['preventive maintenance', 'pm', 'periodic maintenance', 'servicing'],
  },
  {
    id: 'page-maint-schedule',
    title: 'Maintenance Timetable Schedule',
    category: 'Maintenance',
    path: '/maintenance/schedule',
    icon: Calendar,
    description: 'Weekly and monthly maintenance calendar for all plant equipment.',
    keywords: ['maintenance schedule', 'service calendar', 'pm schedule'],
  },
  {
    id: 'page-maint-work-orders',
    title: 'Maintenance Work Orders',
    category: 'Maintenance',
    path: '/maintenance/work-orders',
    icon: FileText,
    description: 'Assigned maintenance tasks to electrical and mechanical technicians.',
    keywords: ['maintenance work orders', 'service work orders', 'repair tasks'],
  },
  {
    id: 'page-maint-assets',
    title: 'Plant Machinery & Assets Master',
    category: 'Maintenance',
    path: '/maintenance/assets',
    icon: Cpu,
    description: 'EOT Cranes, Plate Bending Machines, CNC Plasma, Lathes, and Compressors.',
    keywords: ['assets', 'machinery', 'plant equipment', 'cranes', 'bending machines'],
  },
  {
    id: 'page-maint-spares',
    title: 'Maintenance Spare Parts Store',
    category: 'Maintenance',
    path: '/maintenance/spare-parts',
    icon: Package,
    description: 'Bearings, hydraulic valves, seals, welding torches, and electrical spares.',
    keywords: ['spare parts', 'maintenance spares', 'bearings', 'hydraulic spares'],
  },
  {
    id: 'page-maint-customer-machines',
    title: 'Customer Installed Machines Registry',
    category: 'Maintenance',
    path: '/maintenance/customer-machines',
    icon: Building,
    description: 'Reactors, autoclaves, and vessels installed at client manufacturing plants.',
    keywords: ['customer machines', 'installed base', 'client equipment'],
  },
  {
    id: 'page-maint-amc',
    title: 'Customer Equipment AMC & CMC',
    category: 'Maintenance',
    path: '/maintenance/amc',
    icon: ShieldCheck,
    description: 'Annual Maintenance Contracts and comprehensive servicing agreements.',
    keywords: ['amc', 'cmc', 'annual maintenance', 'service contracts'],
  },

  // 9. HR & Payroll
  {
    id: 'page-hr-dash',
    title: 'HR & People Management Dashboard',
    category: 'HR',
    path: '/hr',
    icon: UserCheck,
    description: 'Active staff headcount, daily attendance, payroll cost, and open vacancies.',
    keywords: ['hr', 'human resources', 'payroll', 'headcount', 'staff'],
  },
  {
    id: 'page-hr-employees',
    title: 'Employees Master Directory',
    category: 'HR',
    path: '/hr/employees',
    icon: Users,
    description: 'Complete staff roster, KYC, biometric ID, emergency contacts, and blood group.',
    keywords: ['employees', 'staff', 'employee master', 'directory', 'personnel'],
  },
  {
    id: 'page-hr-onboarding',
    title: 'Employee Onboarding & Offer Letters',
    category: 'HR',
    path: '/hr/onboarding',
    icon: UserPlus,
    description: 'New hire candidate verification, offered CTC, reporting managers, and DOJ.',
    keywords: ['onboarding', 'new hire', 'joining', 'offer letter', 'induction'],
  },
  {
    id: 'page-hr-departments',
    title: 'Departments Master & HODs',
    category: 'HR',
    path: '/hr/departments',
    icon: Building,
    description: 'CRM, Design, Production, QA, Store, Purchase, Accounts, and Maintenance departments.',
    keywords: ['departments', 'hod', 'head of department', 'department master'],
  },
  {
    id: 'page-hr-designations',
    title: 'Designations & Role Levels',
    category: 'HR',
    path: '/hr/designations',
    icon: Layers,
    description: 'Staff designation hierarchy, experience bands, and salary grade levels.',
    keywords: ['designations', 'job titles', 'roles', 'grades'],
  },
  {
    id: 'page-hr-roster',
    title: 'Duty Roster & Shift Planning',
    category: 'HR',
    path: '/hr/roster',
    icon: Calendar,
    description: 'Morning, Evening, Night shifts and weekly off planning for factory workers.',
    keywords: ['duty roster', 'shift plan', 'worker roster', 'shift timing'],
  },
  {
    id: 'page-hr-attendance',
    title: 'Biometric Daily Attendance',
    category: 'HR',
    path: '/hr/attendance',
    icon: CheckCircle2,
    description: 'Daily in/out punch logs, late marks, half-days, and overtime hours.',
    keywords: ['attendance', 'biometric', 'punch log', 'present', 'overtime'],
  },
  {
    id: 'page-hr-leaves',
    title: 'Leave Applications & Leave Balances',
    category: 'HR',
    path: '/hr/leaves',
    icon: Calendar,
    description: 'Casual leave, sick leave, paid leave balance, and manager approval workflow.',
    keywords: ['leaves', 'leave application', 'vacation', 'sick leave', 'leave approval'],
  },
  {
    id: 'page-hr-advances',
    title: 'Salary Advances Management',
    category: 'HR',
    path: '/hr/advances',
    icon: DollarSign,
    description: 'Staff emergency advance requests, approvals, and monthly salary deductions.',
    keywords: ['advances', 'salary advance', 'advance deduction'],
  },
  {
    id: 'page-hr-loans',
    title: 'Employee Loans & EMI Ledger',
    category: 'HR',
    path: '/hr/loans',
    icon: Landmark,
    description: 'Company loans, installment schedules, and payroll recovery.',
    keywords: ['loans', 'employee loans', 'emi', 'installments'],
  },
  {
    id: 'page-hr-claims',
    title: 'Expense Claims & Reimbursements',
    category: 'HR',
    path: '/hr/claims',
    icon: Receipt,
    description: 'Site travel allowance (TA), daily allowance (DA), fuel, and hotel bills.',
    keywords: ['claims', 'reimbursements', 'ta da', 'travel expense', 'claims approval'],
  },
  {
    id: 'page-hr-payroll',
    title: 'Monthly Payroll Processing',
    category: 'HR',
    path: '/hr/payroll',
    icon: Landmark,
    description: 'Automated salary register, PF calculation, ESIC, Professional Tax, and net pay.',
    keywords: ['payroll', 'salary calculation', 'pf', 'esic', 'pt', 'monthly salary', 'wage register'],
  },
  {
    id: 'page-hr-salary-slips',
    title: 'Salary Slips & Payslips Generator',
    category: 'HR',
    path: '/hr/salary-slips',
    icon: FileText,
    description: 'Downloadable staff payslips with earnings, deductions, and bank details.',
    keywords: ['salary slips', 'payslips', 'pay slip download', 'salary receipts'],
  },
  {
    id: 'page-hr-transfers',
    title: 'Employee Transfers & Mobility',
    category: 'HR',
    path: '/hr/transfers',
    icon: Truck,
    description: 'Internal department transfers, promotions, and designation updates.',
    keywords: ['transfers', 'employee transfers', 'promotions', 'internal mobility'],
  },
  {
    id: 'page-hr-documents',
    title: 'Staff Document Locker & KYC',
    category: 'HR',
    path: '/hr/documents',
    icon: FolderOpen,
    description: 'Aadhaar Card, PAN Card, Certificates, Appointment Letters, and KYC.',
    keywords: ['documents', 'aadhaar', 'pan card', 'kyc', 'certificates', 'hr documents'],
  },
  {
    id: 'page-hr-holidays',
    title: 'Company Holiday Calendar',
    category: 'HR',
    path: '/hr/holidays',
    icon: Calendar,
    description: 'Declared factory holidays, national festivals, and annual calendar.',
    keywords: ['holidays', 'calendar', 'festival holidays', 'company holidays'],
  },


  // 10. Integration & 360° Traceability
  {
    id: 'page-integration-dash',
    title: '360° Integration Hub',
    category: 'Integration',
    path: '/integration',
    icon: Compass,
    description: 'Complete cross-module connectivity between CRM, Projects, Design, Shop, and Finance.',
    keywords: ['integration', '360', 'traceability', 'connected erp', 'flows'],
  },
  {
    id: 'page-integration-master360',
    title: 'Master 360° Live Cockpit',
    category: 'Integration',
    path: '/integration/master360',
    icon: Sparkles,
    description: 'Order-to-Cash live stream, milestone heatmaps, and single-pane-of-glass tracking.',
    keywords: ['master 360', 'cockpit', 'live tracking', 'order to cash'],
  },
  {
    id: 'page-integration-traceability',
    title: 'Heat Number & Raw Material Traceability',
    category: 'Integration',
    path: '/integration/traceability',
    icon: ShieldCheck,
    description: 'Trace raw steel plate heat numbers from mill test certificate to finished vessel.',
    keywords: ['traceability', 'heat number', 'mill certificate', 'material genealogy'],
  },

  // 11. Testing, Security & Foundation Admin
  {
    id: 'page-testing-uat',
    title: 'Role-Based UAT Testing Hub',
    category: 'Admin',
    path: '/testing/uat-hub',
    icon: ShieldCheck,
    description: 'Live role switcher to test ERP features from Admin, Sales, Production, or Store view.',
    keywords: ['uat hub', 'testing', 'role switch', 'uat portal'],
  },
  {
    id: 'page-testing-role-matrix',
    title: 'Security & Permission Matrix',
    category: 'Admin',
    path: '/testing/role-matrix',
    icon: Lock,
    description: 'Access rights, view/create/edit/delete matrix by role and department.',
    keywords: ['role matrix', 'permissions matrix', 'security matrix', 'access rights'],
  },
  {
    id: 'page-testing-bug-tracker',
    title: 'ERP Bug & Issue Tracker',
    category: 'Admin',
    path: '/testing/bug-tracker',
    icon: BugIcon,
    description: 'Internal software bugs, feedback tickets, and resolution updates.',
    keywords: ['bug tracker', 'bugs', 'defects', 'issues', 'ticket'],
  },
  {
    id: 'page-users-list',
    title: 'System Users Master',
    category: 'Admin',
    path: '/users',
    icon: Users,
    description: 'User login credentials, active status, department mapping, and password reset.',
    keywords: ['users', 'user accounts', 'login credentials', 'system users'],
  },
  {
    id: 'page-users-new',
    title: '+ Create New User Account',
    category: 'Admin',
    path: '/users/new',
    icon: Plus,
    description: 'Register a new employee user account and assign system roles.',
    keywords: ['new user', 'create user', 'add user account'],
  },
  {
    id: 'page-roles-list',
    title: 'User Roles & Authority Levels',
    category: 'Admin',
    path: '/roles',
    icon: ShieldCheck,
    description: 'Super Admin, Project Manager, Production Head, Purchase Officer roles.',
    keywords: ['roles', 'user roles', 'authority levels', 'rbac'],
  },
  {
    id: 'page-permissions',
    title: 'Granular System Permissions',
    category: 'Admin',
    path: '/permissions',
    icon: Lock,
    description: 'Module-wise capability toggles and operational restrictions.',
    keywords: ['permissions', 'granular permissions', 'access control'],
  },
  {
    id: 'page-settings-company',
    title: 'Company Profile & Letterhead',
    category: 'Admin',
    path: '/settings/company',
    icon: Building,
    description: 'Company logo, registered address, GSTIN, CIN, bank accounts, and invoice headers.',
    keywords: ['company settings', 'company profile', 'letterhead', 'logo', 'gstin'],
  },
  {
    id: 'page-settings-numbering',
    title: 'Document Auto-Numbering Schemes',
    category: 'Admin',
    path: '/settings/numbering',
    icon: HashIcon,
    description: 'Series prefix/suffix configurations for LEAD, JOB, PO, SO, GRN, and INVOICE.',
    keywords: ['numbering', 'document series', 'auto numbering', 'prefix', 'series'],
  },
  {
    id: 'page-settings-data-import',
    title: 'Data Import & Excel Upload Hub',
    category: 'Admin',
    path: '/settings/data-import',
    icon: UploadCloudIcon,
    description: 'Bulk upload Excel/CSV for Items, Suppliers, Customers, and BOMs.',
    keywords: ['data import', 'excel upload', 'bulk import', 'csv upload', 'migration'],
  },
  {
    id: 'page-settings-backup',
    title: 'Database Backup & Cloud Restore',
    category: 'Admin',
    path: '/settings/backup-restore',
    icon: Database,
    description: 'Automated database snapshots, manual JSON export, and restore points.',
    keywords: ['backup', 'restore', 'database backup', 'export data'],
  },
  {
    id: 'page-settings-audit-logs',
    title: 'System Audit Logs & User Activity',
    category: 'Admin',
    path: '/settings/audit-logs',
    icon: Clock,
    description: 'Immutable record of every user login, IP address, and database modification.',
    keywords: ['audit logs', 'user activity', 'access logs', 'security audit'],
  },
  {
    id: 'page-settings-security',
    title: 'Security Hub & 2FA Policies',
    category: 'Admin',
    path: '/settings/security-hub',
    icon: ShieldCheck,
    description: 'Password complexity rules, session timeout, and IP whitelisting.',
    keywords: ['security hub', '2fa', 'password policy', 'session timeout'],
  },
  {
    id: 'page-settings-release-notes',
    title: 'ERP Release Notes & Build History',
    category: 'Admin',
    path: '/settings/release-notes',
    icon: BookOpen,
    description: 'Version changelog, feature enhancements, and system update history.',
    keywords: ['release notes', 'changelog', 'updates', 'version history'],
  },
];

function SendIcon(props: any) {
  return <ArrowRight {...props} />;
}
function Trash2Icon(props: any) {
  return <RotateCcw {...props} />;
}
function BugIcon(props: any) {
  return <ShieldCheck {...props} />;
}
function HashIcon(props: any) {
  return <LayoutDashboard {...props} />;
}
function UploadCloudIcon(props: any) {
  return <Database {...props} />;
}

export function GlobalSearchModal() {
  const router = useRouter();
  const {
    isSearchOpen,
    setIsSearchOpen,
    jobs,
    openJobModal,
    leads,
    customers,
    quotations,
    salesOrders,
    purchaseOrders,
    itemMasters,
    employees,
  } = useERP();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K to toggle modal anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // Focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedCategory('All');
    }
  }, [isSearchOpen]);

  const cleanQuery = query.trim().toLowerCase();

  // 1. Filter Pages
  const matchedPages = useMemo(() => {
    return ERP_PAGES_MASTER.filter((page) => {
      if (selectedCategory !== 'All' && selectedCategory !== 'Pages' && page.category !== selectedCategory) {
        return false;
      }
      if (!cleanQuery) return true;
      return (
        page.title.toLowerCase().includes(cleanQuery) ||
        page.path.toLowerCase().includes(cleanQuery) ||
        page.description.toLowerCase().includes(cleanQuery) ||
        page.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery))
      );
    });
  }, [cleanQuery, selectedCategory]);

  // 2. Filter Live Records
  const matchedRecords = useMemo(() => {
    if (!cleanQuery) return [];
    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      tag: string;
      badge?: string;
      type: 'job' | 'lead' | 'customer' | 'quotation' | 'so' | 'po' | 'item' | 'employee';
      action: () => void;
    }> = [];

    // Filter Jobs
    jobs.forEach((j) => {
      if (
        j.jobNumber?.toLowerCase().includes(cleanQuery) ||
        j.customerName?.toLowerCase().includes(cleanQuery) ||
        j.productName?.toLowerCase().includes(cleanQuery) ||
        j.customerPoNumber?.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          id: `job-${j.jobNumber}`,
          title: `${j.jobNumber}: ${j.productName || 'Manufacturing Job'}`,
          subtitle: `Customer: ${j.customerName} • PO: ${j.customerPoNumber || '-'} • ${formatCurrency(j.orderValue || 0)}`,
          tag: 'Job Master',
          badge: j.currentStatus,
          type: 'job',
          action: () => {
            setIsSearchOpen(false);
            openJobModal(j.jobNumber);
          },
        });
      }
    });

    // Filter Leads
    leads.forEach((l) => {
      if (
        l.leadNo?.toLowerCase().includes(cleanQuery) ||
        l.companyName?.toLowerCase().includes(cleanQuery) ||
        l.productName?.toLowerCase().includes(cleanQuery) ||
        l.contactPerson?.toLowerCase().includes(cleanQuery) ||
        l.mobile?.includes(cleanQuery)
      ) {
        results.push({
          id: `lead-${l.id}`,
          title: `${l.leadNo}: ${l.companyName}`,
          subtitle: `Req: ${l.productName} • Contact: ${l.contactPerson} (${l.mobile})`,
          tag: 'CRM Lead',
          badge: l.status,
          type: 'lead',
          action: () => {
            setIsSearchOpen(false);
            router.push(`/crm/leads/${l.id}`);
          },
        });
      }
    });

    // Filter Customers
    customers.forEach((c) => {
      if (
        c.customerCode?.toLowerCase().includes(cleanQuery) ||
        c.companyName?.toLowerCase().includes(cleanQuery) ||
        c.city?.toLowerCase().includes(cleanQuery) ||
        c.gstin?.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          id: `cust-${c.id}`,
          title: `${c.customerCode}: ${c.companyName}`,
          subtitle: `City: ${c.city || 'Vadodara'} • GST: ${c.gstin || '-'}`,
          tag: 'Customer',
          type: 'customer',
          action: () => {
            setIsSearchOpen(false);
            router.push('/crm/customers');
          },
        });
      }
    });

    // Filter Items
    itemMasters?.forEach((it) => {
      if (
        it.itemCode?.toLowerCase().includes(cleanQuery) ||
        it.itemName?.toLowerCase().includes(cleanQuery) ||
        it.category?.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          id: `item-${it.id}`,
          title: `${it.itemCode}: ${it.itemName}`,
          subtitle: `Category: ${it.category || 'Raw Material'} • UOM: ${it.uom || 'Nos'}`,
          tag: 'Store Item',
          type: 'item',
          action: () => {
            setIsSearchOpen(false);
            router.push('/store/items');
          },
        });
      }
    });

    // Filter Employees
    employees?.forEach((emp) => {
      const name = emp.name || (emp as any).employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
      const code = (emp as any).employeeCode || (emp as any).employeeId || emp.id;
      if (
        code?.toLowerCase().includes(cleanQuery) ||
        name?.toLowerCase().includes(cleanQuery) ||
        emp.department?.toLowerCase().includes(cleanQuery) ||
        emp.designation?.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          id: `emp-${emp.id}`,
          title: `${code}: ${name}`,
          subtitle: `Dept: ${emp.department} • Designation: ${emp.designation}`,
          tag: 'Employee',
          type: 'employee',
          action: () => {
            setIsSearchOpen(false);
            router.push('/hr/employees');
          },
        });
      }
    });

    return results;
  }, [cleanQuery, jobs, leads, customers, itemMasters, employees, openJobModal, router, setIsSearchOpen]);

  // Combined flat list for keyboard arrow navigation
  const allNavigableItems = useMemo(() => {
    const list: Array<{ type: 'page' | 'record'; item: any }> = [];
    matchedPages.slice(0, 40).forEach((p) => list.push({ type: 'page', item: p }));
    matchedRecords.slice(0, 20).forEach((r) => list.push({ type: 'record', item: r }));
    return list;
  }, [matchedPages, matchedRecords]);

  // Keyboard navigation inside list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allNavigableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allNavigableItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allNavigableItems[selectedIndex]) {
        const sel = allNavigableItems[selectedIndex];
        if (sel.type === 'page') {
          setIsSearchOpen(false);
          router.push(sel.item.path);
        } else {
          sel.item.action();
        }
      }
    }
  };

  if (!isSearchOpen) return null;

  const categoriesList = ['All', 'Pages', 'CRM', 'Projects', 'Design', 'Purchase', 'Store', 'Production', 'Accounts', 'HR', 'Maintenance', 'Admin'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSearchOpen(false);
      }}
    >
      <div className="bg-white border border-[#E7DED5] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-auto max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Search Bar Input Header */}
        <div className="p-4 sm:p-5 border-b border-[#E7DED5] bg-gradient-to-r from-[#FAF7F2] via-[#FAF3EA] to-[#F8EDE0] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5DDD0] text-[#75401F] flex items-center justify-center shadow-xs flex-shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Search any page, module, job #, lead, customer, stock, PO..."
              className="w-full text-base sm:text-lg font-bold bg-transparent text-[#211B17] placeholder:text-[#9E8E82] focus:outline-none"
            />
            <div className="text-[11px] text-[#70665F] truncate">
              {cleanQuery
                ? `Found ${matchedPages.length} Pages • ${matchedRecords.length} Live Records`
                : 'Type anything to instantly find and jump to any page in the entire ERP'}
            </div>
          </div>

          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 rounded-xl text-[#70665F] hover:text-[#211B17] hover:bg-white border border-[#E5DDD0] transition cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2 bg-[#FCFAF7] border-b border-[#EFE8DE] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-crm-brand-700 text-white shadow-xs'
                  : 'bg-white text-[#70665F] hover:bg-[#F3EDE4] border border-[#E5DDD0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-4 text-xs divide-y divide-[#EFE8DE]">
          {/* 1. MATCHED ERP PAGES */}
          {matchedPages.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-2 text-[11px] font-bold text-[#75401F] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  ERP Pages & Modules ({matchedPages.length})
                </span>
                <span className="text-[#9E8E82] font-mono lowercase text-[10px]">Jump to page</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedPages.slice(0, 30).map((page, idx) => {
                  const Icon = page.icon || FileText;
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={page.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        router.push(page.path);
                      }}
                      className={`text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer group ${
                        isSelected
                          ? 'bg-[#FAF3EA] border-crm-brand-700 shadow-sm ring-1 ring-crm-brand-700'
                          : 'bg-white hover:bg-[#FAF7F2] border-[#EAE2D8]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-crm-brand-700 border border-[#E7DED5] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#211B17] text-xs truncate group-hover:text-crm-brand-700 transition-colors">
                            {page.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-[#FAF0E6] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E7DED5] flex-shrink-0">
                            {page.category}
                          </span>
                        </div>
                        <p className="text-[#70665F] text-[11px] leading-tight line-clamp-1 mt-0.5">
                          {page.description}
                        </p>
                        <span className="font-mono text-[10px] text-[#9E8E82] truncate block mt-0.5">
                          {page.path}
                        </span>
                      </div>

                      <ArrowUpRight className="w-3.5 h-3.5 text-[#9E8E82] group-hover:text-crm-brand-700 transition-colors flex-shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. MATCHED LIVE RECORDS */}
          {matchedRecords.length > 0 && (
            <div className="space-y-2 pt-3">
              <div className="flex items-center justify-between px-2 text-[11px] font-bold text-[#0E91B2] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  Live Records Found ({matchedRecords.length})
                </span>
                <span className="text-[#9E8E82] font-mono lowercase text-[10px]">Open Record</span>
              </div>

              <div className="space-y-1.5">
                {matchedRecords.slice(0, 15).map((rec, rIdx) => {
                  const overallIdx = matchedPages.slice(0, 30).length + rIdx;
                  const isSelected = selectedIndex === overallIdx;
                  return (
                    <button
                      key={rec.id}
                      onClick={rec.action}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                        isSelected
                          ? 'bg-[#E0F2FE] border-[#0E91B2] shadow-sm ring-1 ring-[#0E91B2]'
                          : 'bg-white hover:bg-[#FAF7F2] border-[#EAE2D8]'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#211B17] text-xs truncate">
                            {rec.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF0E6] text-crm-brand-700 font-mono text-[9px] font-bold border border-[#E7DED5]">
                            {rec.tag}
                          </span>
                          {rec.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0E91B2] font-mono text-[9px] font-bold border border-[#BAE6FD]">
                              {rec.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[#70665F] text-[11px] truncate">
                          {rec.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-[#0E91B2] font-bold text-[11px] flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {matchedPages.length === 0 && matchedRecords.length === 0 && (
            <div className="py-16 text-center text-[#8D827A] space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF0E6] text-crm-brand-700 flex items-center justify-center mx-auto border border-[#E7DED5]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#211B17]">No Matching Pages or Records</h3>
              <p className="text-xs text-[#70665F] max-w-sm mx-auto">
                We couldn&apos;t find any page or record matching &ldquo;{query}&rdquo;. Try searching by keyword like &ldquo;leads&rdquo;, &ldquo;store&rdquo;, &ldquo;po&rdquo;, &ldquo;payroll&rdquo;, or &ldquo;production&rdquo;.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Keybind Info */}
        <div className="px-5 py-3 bg-[#FAF7F2] border-t border-[#E7DED5] text-[11px] text-[#70665F] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E7DED5] font-mono text-[10px] font-bold shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E7DED5] font-mono text-[10px] font-bold shadow-2xs">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E7DED5] font-mono text-[10px] font-bold shadow-2xs">Enter</kbd> to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E7DED5] font-mono text-[10px] font-bold shadow-2xs">Esc</kbd> to close
            </span>
          </div>

          <div className="flex items-center gap-2 font-bold text-[#75401F]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Uma Techno Fab Spotlight Search (Ctrl+K)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
