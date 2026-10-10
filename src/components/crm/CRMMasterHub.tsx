'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../context/ERPContext';
import { DataTable, Column } from '../data/DataTable';
import { StatusBadge } from '../workflow/StatusBadge';
import { Lead, Customer, LeadStatus, LeadSource, PriorityLevel, Employee } from '../../types/crm';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  UserPlus,
  FileText,
  Building,
  Plus,
  ArrowUpRight,
  Filter,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  Briefcase,
  Layers,
  ChevronRight,
  FileCheck2,
  DollarSign,
  ArrowRight,
  Search,
} from 'lucide-react';

export type CRMTab = 'leads' | 'customers' | 'lifecycle';

interface CRMMasterHubProps {
  defaultTab?: CRMTab;
}

export function CRMMasterHub({ defaultTab = 'leads' }: CRMMasterHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    leads,
    updateLead,
    deleteLead,
    convertLeadToCustomer,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    quotations,
    opportunities,
    employees,
    availableEmployees,
  } = useERP();

  const allEmployees: Employee[] =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  // Active Tab State with URL query sync
  const queryTab = searchParams?.get('tab') as CRMTab | null;
  const [activeTab, setActiveTab] = useState<CRMTab>(
    queryTab && ['leads', 'customers', 'lifecycle'].includes(queryTab) ? queryTab : defaultTab
  );

  useEffect(() => {
    if (queryTab && ['leads', 'customers', 'lifecycle'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const switchTab = (tab: CRMTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  // Notification Banner
  const [successMsg, setSuccessMsg] = useState('');
  useEffect(() => {
    const createdLead = searchParams?.get('created');
    if (createdLead) {
      setSuccessMsg(`Lead "${decodeURIComponent(createdLead)}" registered successfully!`);
      const timer = setTimeout(() => setSuccessMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Mounted state for SSR hydration safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Today Date
  const todayStr = new Date().toISOString().split('T')[0];

  // --------------------------------------------------------------------------
  // LEADS STATE & ACTIONS
  // --------------------------------------------------------------------------
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>('all');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editLeadData, setEditLeadData] = useState<Partial<Lead>>({});
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const filteredLeads = leads.filter((lead) => {
    if (leadStatusFilter !== 'all' && lead.status !== leadStatusFilter) return false;
    if (leadSourceFilter !== 'all' && lead.source !== leadSourceFilter) return false;
    return true;
  });

  const handleConvertLead = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = convertLeadToCustomer(leadId);
      setSuccessMsg(
        `Lead "${res.customer.companyName}" successfully converted to Customer "${res.customer.customerCode}"! Click [Send Quotation] to generate a formal quotation.`
      );
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      console.error('Error converting lead:', err);
    }
  };

  const handleSaveEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    updateLead(editingLead.id, editLeadData);
    setEditingLead(null);
    setSuccessMsg(`Lead "${editLeadData.companyName || editingLead.companyName}" updated successfully.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // --------------------------------------------------------------------------
  // CUSTOMERS STATE & ACTIONS
  // --------------------------------------------------------------------------
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const [custCompanyName, setCustCompanyName] = useState('');
  const [custIndustry, setCustIndustry] = useState('Speciality Chemicals');
  const [custContactPerson, setCustContactPerson] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [custCity, setCustCity] = useState('Vadodara');
  const [custState, setCustState] = useState('Gujarat');
  const [custAddress, setCustAddress] = useState('');
  const [custCreditLimit, setCustCreditLimit] = useState(10000000);
  const [custFormErrors, setCustFormErrors] = useState<Record<string, string>>({});

  const validateCustomerForm = () => {
    const errs: Record<string, string> = {};
    if (!custCompanyName.trim()) errs.companyName = 'Company name is required';
    if (!custContactPerson.trim()) errs.contactPerson = 'Contact person is required';
    const cleanMobile = custMobile.replace(/\D/g, '');
    if (!cleanMobile) errs.mobile = 'Mobile number is required';
    else if (cleanMobile.length !== 10) errs.mobile = 'Mobile number must be 10 digits';
    if (!custEmail.trim()) errs.email = 'Email address is required';
    setCustFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCustomerForm()) return;

    addCustomer({
      customerType: 'company',
      companyName: custCompanyName,
      industry: custIndustry,
      gstin: custGstin?.toUpperCase(),
      pan: custGstin.slice(2, 12) || 'AAACX0000X',
      contactPerson: custContactPerson,
      designation: 'General Manager',
      mobile: custMobile.replace(/\D/g, '').slice(0, 10),
      email: custEmail.trim(),
      billingAddress: custAddress,
      shippingAddress: custAddress,
      city: custCity,
      state: custState,
      country: 'India',
      pincode: '390010',
      paymentTerms: '30% Advance, 70% against Dispatch',
      creditLimit: custCreditLimit,
      currency: 'INR (₹)',
      category: 'gold',
      assignedSalesPerson: 'Pravin Patel',
    });

    setCustCompanyName('');
    setCustContactPerson('');
    setCustMobile('');
    setCustEmail('');
    setCustGstin('');
    setShowAddCustomerModal(false);
    setSuccessMsg('Customer master profile registered successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    updateCustomer(editingCustomer.id, editingCustomer);
    setEditingCustomer(null);
    setSuccessMsg(`Customer "${editingCustomer.companyName}" updated successfully.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // --------------------------------------------------------------------------
  // KPI CALCULATIONS
  // --------------------------------------------------------------------------
  const totalLeads = leads.length;
  const activeLeads = leads.filter((l) => l.status !== 'won' && l.status !== 'lost').length;
  const wonLeads = leads.filter((l) => l.status === 'won').length;
  const totalCustomers = customers.length;
  const totalPipelineBudget = leads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0);
  const totalQuotations = quotations.length;
  const activeQuotations = quotations.filter((q) => q.latestSummary?.status !== 'rejected').length;

  // --------------------------------------------------------------------------
  // TABLE COLUMNS CONFIGURATIONS
  // --------------------------------------------------------------------------

  // 1. LEADS COLUMNS
  const leadColumns: Column<Lead>[] = [
    {
      header: 'Lead Ref / Date',
      accessorKey: 'leadNo',
      cell: (lead) => (
        <div>
          <span className="font-mono font-bold text-crm-brand-700 bg-crm-brand-50 px-2 py-0.5 rounded border border-crm-brand-200 block w-fit">
            {lead.leadNo || lead.id}
          </span>
          <span className="text-[10px] text-[#70665F] mt-0.5 block flex items-center gap-1 font-mono">
            <Calendar className="w-3 h-3 text-[#A89F91]" />
            {formatDate(lead.createdDate)}
          </span>
        </div>
      ),
    },
    {
      header: 'Company & Contact',
      cell: (lead) => (
        <div className="space-y-0.5">
          <Link
            href={`/crm/leads/${lead.id}`}
            className="font-bold text-slate-900 hover:text-crm-brand-700 transition flex items-center gap-1"
          >
            <span>{lead.companyName}</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-[#70665F]">
            <span className="font-medium">{lead.contactPerson}</span>
            {lead.mobile && (
              <span className="flex items-center gap-0.5 font-mono text-[10px] text-[#544B45]">
                <Phone className="w-2.5 h-2.5 text-[#A89F91]" /> {lead.mobile}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#70665F] block">{lead.city || 'Vadodara, Gujarat'}</span>
        </div>
      ),
    },
    {
      header: 'Machine Requirement',
      cell: (lead) => (
        <div className="max-w-xs">
          <span className="font-semibold text-slate-800 block truncate">{lead.productName}</span>
          <div className="flex items-center gap-2 text-[10px] text-[#70665F] mt-0.5 font-mono">
            <span>Qty: <strong className="text-slate-800">{lead.quantity || 1}</strong></span>
            {lead.capacity && <span>Cap: {lead.capacity}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Budget (₹)',
      accessorKey: 'budget',
      cell: (lead) => (
        <span className="font-mono font-bold text-emerald-700">
          {lead.budget ? formatCurrency(lead.budget) : '₹0'}
        </span>
      ),
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (lead) => {
        const p = lead.priority || 'medium';
        const colors: Record<string, string> = {
          urgent: 'bg-rose-100 text-rose-800 border-rose-200',
          high: 'bg-amber-100 text-amber-800 border-amber-200',
          medium: 'bg-blue-100 text-blue-800 border-blue-200',
          low: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colors[p]}`}>
            {p}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (lead) => <StatusBadge status={lead.status as any} />,
    },
    {
      header: 'Sales Engineer',
      accessorKey: 'assignedSalesPersonName',
      cell: (lead) => (
        <span className="text-xs text-[#544B45] font-medium">{lead.assignedSalesPersonName || 'Pravin Patel'}</span>
      ),
    },
    {
      header: 'Actions',
      cell: (lead) => {
        const isConverted = lead.status === 'won' || !!lead.convertedCustomerId;
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {!isConverted ? (
              <button
                onClick={(e) => handleConvertLead(lead.id, e)}
                title="Convert Lead to Customer Account"
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded text-[10px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3" /> Convert
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Converted
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/crm/quotations/new?leadId=${lead.id}&customerId=${lead.convertedCustomerId || ''}`);
                  }}
                  title="Send formal Quotation for this converted lead"
                  className="px-2.5 py-1 bg-crm-brand-700 hover:bg-crm-brand-800 active:scale-95 text-white rounded text-[10px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <FileText className="w-3 h-3" /> Send Quotation
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setEditingLead(lead);
                setEditLeadData({ ...lead });
              }}
              title="Edit Lead"
              className="p-1 text-[#70665F] hover:text-slate-900 hover:bg-[#FAF7F2] rounded border border-transparent hover:border-[#EBE3DB]"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeletingLead(lead)}
              title="Delete Lead"
              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  // 2. CUSTOMERS COLUMNS
  const customerColumns: Column<Customer>[] = [
    {
      header: 'Customer Code',
      accessorKey: 'customerCode',
      cell: (cust) => (
        <span className="font-mono font-bold text-crm-brand-700 bg-crm-brand-50 px-2 py-0.5 rounded border border-crm-brand-200">
          {cust.customerCode || cust.id}
        </span>
      ),
    },
    {
      header: 'Company & Location',
      cell: (cust) => (
        <div>
          <Link
            href={`/crm/customers/${cust.id}`}
            className="font-bold text-slate-900 hover:text-crm-brand-700 transition flex items-center gap-1"
          >
            <span>{cust.companyName}</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </Link>
          <div className="flex items-center gap-2 text-[10px] text-[#70665F] mt-0.5">
            <span>{cust.city || 'Vadodara'}, {cust.state || 'Gujarat'}</span>
            <span className="font-mono uppercase font-bold text-slate-700">GST: {cust.gstin || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Primary Contact',
      cell: (cust) => (
        <div>
          <span className="font-semibold text-slate-800 block">{cust.contactPerson}</span>
          <div className="flex items-center gap-2 text-[10px] text-[#70665F] mt-0.5 font-mono">
            {cust.mobile && <span>Ph: {cust.mobile}</span>}
            {cust.email && <span className="truncate max-w-[130px]">{cust.email}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (cust) => {
        const cat = cust.category || 'gold';
        const styles: Record<string, string> = {
          platinum: 'bg-purple-100 text-purple-800 border-purple-200',
          gold: 'bg-amber-100 text-amber-800 border-amber-200',
          silver: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[cat] || styles.gold}`}>
            {cat}
          </span>
        );
      },
    },
    {
      header: 'Credit Limit',
      accessorKey: 'creditLimit',
      cell: (cust) => (
        <span className="font-mono font-bold text-emerald-700">
          {cust.creditLimit ? formatCurrency(cust.creditLimit) : '₹1.00 Cr'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (cust) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditingCustomer(cust)}
            title="Edit Customer"
            className="p-1 text-[#70665F] hover:text-slate-900 hover:bg-[#FAF7F2] rounded border border-transparent hover:border-[#EBE3DB]"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingCustomer(cust)}
            title="Delete Customer"
            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4 md:space-y-5 text-xs pb-12">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] p-5 sm:p-6 rounded-2xl border border-[#E9DFD3] text-[#211B17] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F5E6D8] text-[#8C5229] border border-[#E7DED5] font-mono text-[10px] font-bold uppercase tracking-wider">
              Unified CRM Engine
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              Live Synced
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
            Commercial Master Hub
          </h1>
          <p className="text-[#6F6156] text-xs mt-1 max-w-2xl leading-relaxed">
            Manage prospective Leads, Customer Accounts, and Commercial Quotations seamlessly in one integrated workspace.
          </p>
        </div>

        {/* Global Quick Actions Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/crm/leads/new"
            className="px-3.5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Lead</span>
          </Link>
          <Link
            href="/crm/quotations/new"
            className="px-3.5 py-2 bg-white hover:bg-[#FAF7F2] border border-[#E7DED5] text-slate-800 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>+ New Quotation</span>
          </Link>
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF7F2] border border-[#E7DED5] text-slate-800 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. OVERVIEW KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div
          onClick={() => switchTab('leads')}
          className={`cursor-pointer bg-white p-4 rounded-xl border transition-all ${
            activeTab === 'leads' ? 'border-crm-brand-700 ring-2 ring-crm-brand-700/20 shadow-sm' : 'border-[#EBE3DB] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Prospective Leads</span>
            <UserPlus className="w-4 h-4 text-crm-brand-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-2xl font-extrabold text-[#211B17] font-mono">{totalLeads}</span>
            <span suppressHydrationWarning className="text-[10px] text-emerald-600 font-bold">({activeLeads} active)</span>
          </div>
          <p suppressHydrationWarning className="text-[10px] text-[#70665F] mt-1 font-mono">
            Pipeline: {formatCurrency(totalPipelineBudget)}
          </p>
        </div>

        <Link
          href="/crm/quotations"
          className="bg-white p-4 rounded-xl border border-[#EBE3DB] hover:border-slate-300 transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Commercial Quotations</span>
            <FileCheck2 className="w-4 h-4 text-crm-brand-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-2xl font-extrabold text-[#211B17] font-mono">{totalQuotations}</span>
            <span suppressHydrationWarning className="text-[10px] text-crm-brand-700 font-bold">({activeQuotations} active)</span>
          </div>
          <p className="text-[10px] text-[#70665F] mt-1">Estimations & customer proposals</p>
        </Link>

        <div
          onClick={() => switchTab('customers')}
          className={`cursor-pointer bg-white p-4 rounded-xl border transition-all ${
            activeTab === 'customers' ? 'border-amber-600 ring-2 ring-amber-600/20 shadow-sm' : 'border-[#EBE3DB] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Customers Master</span>
            <Building className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-2xl font-extrabold text-[#211B17] font-mono">{totalCustomers}</span>
            <span className="text-[10px] text-amber-700 font-bold">Registered</span>
          </div>
          <p className="text-[10px] text-[#70665F] mt-1">Enterprise client ledger & GSTIN</p>
        </div>

        <div
          onClick={() => switchTab('lifecycle')}
          className={`cursor-pointer bg-white p-4 rounded-xl border transition-all ${
            activeTab === 'lifecycle' ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm' : 'border-[#EBE3DB] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Lead-to-Order Conversion</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-2xl font-extrabold text-emerald-700 font-mono">
              {totalLeads > 0 ? `${Math.round((wonLeads / totalLeads) * 100)}%` : '0%'}
            </span>
            <span suppressHydrationWarning className="text-[10px] text-[#70665F] font-bold">({wonLeads} won deals)</span>
          </div>
          <p className="text-[10px] text-[#70665F] mt-1">Direct Lead ➔ Quotation ➔ Order</p>
        </div>
      </div>

      {/* 3. WORKSPACE SEGMENTED TAB SWITCHER */}
      <div className="flex items-center border-b border-[#EBE3DB] gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => switchTab('leads')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'leads'
              ? 'border-crm-brand-700 text-crm-brand-700 bg-crm-brand-50/50'
              : 'border-transparent text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Leads Management</span>
          <span suppressHydrationWarning className="px-1.5 py-0.2 rounded-full bg-crm-brand-100 text-crm-brand-800 text-[10px] font-mono font-bold">
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => switchTab('customers')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'customers'
              ? 'border-amber-600 text-amber-800 bg-amber-50/50'
              : 'border-transparent text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Customers Master</span>
          <span suppressHydrationWarning className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
            {customers.length}
          </span>
        </button>

        <button
          onClick={() => switchTab('lifecycle')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'lifecycle'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Lead-to-Quotation Lifecycle</span>
        </button>
      </div>

      {/* 4. ACTIVE TAB CONTENT */}

      {/* TAB 1: LEADS MANAGEMENT */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <DataTable
            columns={leadColumns}
            data={filteredLeads}
            searchPlaceholder="Search leads by company, machine, contact..."
            onRowClick={(lead) => router.push(`/crm/leads/${lead.id}`)}
            filterComponent={
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#544B45]"
                >
                  <option value="all">All Statuses ({leads.length})</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won / Converted</option>
                  <option value="lost">Lost</option>
                </select>

                <select
                  value={leadSourceFilter}
                  onChange={(e) => setLeadSourceFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#544B45]"
                >
                  <option value="all">All Sources</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="website">Website</option>
                  <option value="phone">Direct Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
            }
            actions={
              <Link
                href="/crm/leads/new"
                className="px-3 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> New Lead
              </Link>
            }
          />
        </div>
      )}

      {/* TAB 2: CUSTOMERS MASTER */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <DataTable
            columns={customerColumns}
            data={customers}
            searchPlaceholder="Search customers by company, GSTIN, contact..."
            onRowClick={(cust) => router.push(`/crm/customers/${cust.id}`)}
            actions={
              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Register Customer
              </button>
            }
          />
        </div>
      )}

      {/* TAB 3: LEAD-TO-QUOTATION LIFECYCLE */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 shadow-xs">
            <div className="border-b border-[#EBE3DB] pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#211B17] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Direct Lead ➔ Customer ➔ Quotation Pipeline
                </h3>
                <p className="text-[11px] text-[#70665F] mt-0.5">
                  Visual relationship tracking between prospective Leads, registered Customers, and Commercial Quotations.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {customers.map((cust) => {
                const linkedLead = leads.find(
                  (l) =>
                    l.convertedCustomerId === cust.id ||
                    (l.companyName && l.companyName.toLowerCase() === cust.companyName.toLowerCase())
                );
                const linkedQuotations = quotations.filter(
                  (q) =>
                    q.customerId === cust.id ||
                    (linkedLead && (q.leadId === linkedLead.id || q.leadId === linkedLead.leadNo))
                );

                return (
                  <div
                    key={cust.id}
                    className="p-4 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl hover:border-crm-brand-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EBE3DB]/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                          🏢
                        </span>
                        <div>
                          <Link
                            href={`/crm/customers/${cust.id}`}
                            className="font-bold text-slate-900 hover:text-crm-brand-700 transition"
                          >
                            {cust.companyName}
                          </Link>
                          <span className="text-[10px] text-[#70665F] ml-2 font-mono">
                            {cust.customerCode || cust.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          GST: {cust.gstin || '24AAACX0000X1Z1'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                          {linkedQuotations.length} Quotations
                        </span>
                      </div>
                    </div>

                    {/* Flow Nodes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {/* Left: Origin Lead */}
                      <div className="p-2.5 bg-white rounded-lg border border-[#EBE3DB] text-[11px]">
                        <span className="text-[10px] font-bold text-[#70665F] uppercase block mb-1">
                          Source Lead Record:
                        </span>
                        {linkedLead ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 block">
                              {linkedLead.leadNo}: {linkedLead.productName}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-[#70665F]">
                              <span>Contact: {linkedLead.contactPerson}</span>
                              <span className="text-emerald-600 font-bold">
                                Budget: {formatCurrency(linkedLead.budget || 0)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#70665F] italic">Direct customer registration (No prior lead)</span>
                        )}
                      </div>

                      {/* Right: Commercial Quotations */}
                      <div className="p-2.5 bg-white rounded-lg border border-[#EBE3DB] text-[11px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-[#70665F] uppercase">
                            Commercial Quotations ({linkedQuotations.length}):
                          </span>
                          <Link
                            href={`/crm/quotations/new?customerId=${cust.id}&leadId=${linkedLead?.id || ''}`}
                            className="text-[10px] text-crm-brand-700 hover:underline font-bold flex items-center gap-0.5"
                          >
                            + New Quote
                          </Link>
                        </div>
                        {linkedQuotations.length > 0 ? (
                          <div className="space-y-1">
                            {linkedQuotations.slice(0, 2).map((quo) => (
                              <Link
                                key={quo.id}
                                href={`/crm/quotations/${quo.id}`}
                                className="flex items-center justify-between text-[10px] hover:bg-slate-50 p-1 rounded"
                              >
                                <span className="font-mono font-bold text-crm-brand-700">{quo.quotationNumber}</span>
                                <span className="truncate max-w-[150px] font-medium">{quo.latestSummary?.machineProduct}</span>
                                <span className="text-emerald-700 font-mono font-bold">
                                  {formatCurrency(quo.latestSummary?.grandTotal || 0)}
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#70665F] italic">No quotations generated yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 2: ADD CUSTOMER MASTER                                           */}
      {/* ---------------------------------------------------------------------- */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-xl w-full p-6 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#211B17] flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600" />
                Register New Customer Enterprise
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[#544B45] font-semibold mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reliance Industries Limited"
                    value={custCompanyName}
                    onChange={(e) => setCustCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-bold"
                  />
                  {custFormErrors.companyName && (
                    <p className="text-rose-500 text-[10px] mt-0.5">{custFormErrors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={custIndustry}
                    onChange={(e) => setCustIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">GSTIN Number (15 chars)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="24AAACX0000X1Z1"
                    value={custGstin}
                    onChange={(e) => setCustGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={custContactPerson}
                    onChange={(e) => setCustContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Mobile (10 digits) *</label>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    placeholder="9825012345"
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#544B45] font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={custCreditLimit}
                    onChange={(e) => setCustCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border border-[#EBE3DB] rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs transition"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 3: EDIT LEAD MODAL                                               */}
      {/* ---------------------------------------------------------------------- */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#211B17] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-crm-brand-700" />
                Edit Lead: {editingLead.leadNo || editingLead.id}
              </h3>
              <button onClick={() => setEditingLead(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={editLeadData.companyName || ''}
                  onChange={(e) => setEditLeadData((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editLeadData.contactPerson || ''}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editLeadData.mobile || ''}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Machine / Product</label>
                <input
                  type="text"
                  value={editLeadData.productName || ''}
                  onChange={(e) => setEditLeadData((prev) => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={editLeadData.quantity || 1}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={editLeadData.budget || 0}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Status</label>
                  <select
                    value={editLeadData.status || 'new'}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-semibold"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won / Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 border border-[#EBE3DB] rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold shadow-xs transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 4: DELETE CONFIRMATION MODALS                                    */}
      {/* ---------------------------------------------------------------------- */}
      {deletingLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-sm w-full p-5 shadow-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#211B17]">Delete Lead Record?</h4>
            <p className="text-[11px] text-[#70665F]">
              Are you sure you want to delete lead for <strong>{deletingLead.companyName}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingLead(null)}
                className="px-4 py-1.5 border border-[#EBE3DB] rounded-lg font-semibold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteLead(deletingLead.id);
                  setDeletingLead(null);
                  setSuccessMsg('Lead record deleted successfully.');
                  setTimeout(() => setSuccessMsg(''), 4000);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-sm w-full p-5 shadow-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#211B17]">Delete Customer Master?</h4>
            <p className="text-[11px] text-[#70665F]">
              Are you sure you want to delete <strong>{deletingCustomer.companyName}</strong> from Customer Master?
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-1.5 border border-[#EBE3DB] rounded-lg font-semibold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCustomer(deletingCustomer.id);
                  setDeletingCustomer(null);
                  setSuccessMsg('Customer record deleted successfully.');
                  setTimeout(() => setSuccessMsg(''), 4000);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
