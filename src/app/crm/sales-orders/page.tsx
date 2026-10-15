'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '@/context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '@/components/ui/ERPListPageLayout';
import { SalesOrder, SalesOrderItem } from '@/types/crm';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Layers,
  CheckCircle2,
  ArrowRight,
  Zap,
  ExternalLink,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Database,
  Building,
  Calendar,
  FileText,
  DollarSign,
  User,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function SalesOrdersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {
    salesOrders,
    customers,
    quotations,
    projectJobs,
    openJobModal,
    addSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    refreshSalesOrders,
    createProjectFromSalesOrderAsync,
    availableEmployees,
    employees,
  } = useERP();

  const allStaff = (availableEmployees && availableEmployees.length > 0 ? availableEmployees : employees) || [];

  const [successInfo, setSuccessInfo] = useState<{ prj: string; job: string } | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newPoNum, setNewPoNum] = useState('');
  const [newQtnNum, setNewQtnNum] = useState('');
  const [newOrderDate, setNewOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDeliveryDate, setNewDeliveryDate] = useState('');
  const [newPaymentTerms, setNewPaymentTerms] = useState('');
  const [newProjectManager, setNewProjectManager] = useState('');
  const [newBillingAddress, setNewBillingAddress] = useState('');
  const [newShippingAddress, setNewShippingAddress] = useState('');
  const [newItems, setNewItems] = useState<SalesOrderItem[]>([
    {
      id: 'item-1',
      productName: '',
      specification: '',
      quantity: 1,
      unit: 'Set',
      rate: 0,
      amount: 0,
    },
  ]);
  const [customOrderValue, setCustomOrderValue] = useState<string>('');

  // Edit Modal State
  const [editingSO, setEditingSO] = useState<SalesOrder | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editDeliveryDate, setEditDeliveryDate] = useState('');
  const [editOrderValue, setEditOrderValue] = useState<number>(0);
  const [editPaymentTerms, setEditPaymentTerms] = useState('');
  const [editStatus, setEditStatus] = useState<any>('confirmed');
  const [editCustomerPo, setEditCustomerPo] = useState('');

  // Delete Confirm State
  const [deletingSOId, setDeletingSOId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showBanner = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerNotice({ text, type });
    setTimeout(() => {
      setBannerNotice(null);
    }, 4500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSalesOrders();
      showBanner('Database synchronized successfully! All records up to date.', 'success');
    } catch (err: any) {
      showBanner('Failed to refresh from database: ' + (err?.message || err), 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateProject = async (soId: string) => {
    try {
      setIsCreatingProject(soId);
      const newPrj = await createProjectFromSalesOrderAsync(soId);
      setSuccessInfo({ prj: newPrj.projectNumber, job: newPrj.jobNumber });
      showBanner(`Project ${newPrj.projectNumber} & Master Job ${newPrj.jobNumber} created and saved in Database!`, 'success');
      setTimeout(() => {
        router.push('/projects');
      }, 1500);
    } catch (err: any) {
      console.error('Project creation failed:', err);
      alert('Project creation failed: ' + (err?.message || err));
    } finally {
      setIsCreatingProject(null);
    }
  };

  const getLinkedProject = (so: SalesOrder) => {
    return (projectJobs || []).find(
      (pj) =>
        (so.projectId && (pj.id === so.projectId || pj.projectNumber === so.projectId)) ||
        (pj.salesOrderId && (pj.salesOrderId === so.id || pj.salesOrderId === so.salesOrderNumber)) ||
        (pj.salesOrderNumber && (pj.salesOrderNumber === so.salesOrderNumber || pj.salesOrderNumber === so.id)) ||
        (so.customerPoNumber && pj.customerPoNumber && pj.customerPoNumber === so.customerPoNumber && (pj.customerName === so.customerName || pj.salesOrderNumber === so.salesOrderNumber)) ||
        (so.jobNumber && pj.jobNumber === so.jobNumber && (pj.customerName === so.customerName || pj.salesOrderId === so.id))
    );
  };

  // Calculate items sum
  const calculatedItemsTotal = newItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const totalNewOrderValue = customOrderValue !== '' ? Number(customOrderValue) : calculatedItemsTotal;

  const handleItemChange = (index: number, field: keyof SalesOrderItem, value: any) => {
    setNewItems((prev) => {
      const updated = [...prev];
      const cur = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'rate') {
        const q = field === 'quantity' ? Number(value) || 0 : Number(cur.quantity) || 0;
        const r = field === 'rate' ? Number(value) || 0 : Number(cur.rate) || 0;
        cur.amount = q * r;
      }
      updated[index] = cur;
      return updated;
    });
  };

  const addItemRow = () => {
    setNewItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        productName: '',
        specification: '',
        quantity: 1,
        unit: 'Set',
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (newItems.length === 1) return;
    setNewItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSalesOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      alert('Please enter or select a Customer Name.');
      return;
    }
    if (!newPoNum.trim()) {
      alert('Please provide Customer PO Reference Number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const matchedCust = customers.find(
        (c) => c.companyName.toLowerCase() === newCustName.trim().toLowerCase()
      );

      const createdSO = addSalesOrder({
        customerId: matchedCust?.id || `CUST-GEN-${Date.now().toString().slice(-4)}`,
        customerName: newCustName.trim(),
        customerPoId: newPoNum.trim(),
        customerPoNumber: newPoNum.trim(),
        quotationId: newQtnNum.trim(),
        quotationNumber: newQtnNum.trim(),
        orderDate: newOrderDate,
        deliveryDate: newDeliveryDate || new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
        items: newItems.map((item) => ({
          ...item,
          productName: item.productName || 'Custom Equipment',
          amount: Number(item.amount) || Number(item.quantity) * Number(item.rate) || 0,
        })),
        orderValue: totalNewOrderValue,
        paymentTerms: newPaymentTerms,
        assignedProjectManager: newProjectManager,
        status: 'confirmed',
      });

      setIsCreateModalOpen(false);
      showBanner(`Sales Order ${createdSO.salesOrderNumber} created and saved to Database successfully!`, 'success');

      // Reset form
      setNewCustName('');
      setNewPoNum('');
      setNewQtnNum('');
      setNewDeliveryDate('');
      setCustomOrderValue('');
      setNewItems([
        {
          id: 'item-1',
          productName: '',
          specification: '',
          quantity: 1,
          unit: 'Set',
          rate: 0,
          amount: 0,
        },
      ]);
    } catch (err: any) {
      console.error('Failed to create sales order:', err);
      alert('Failed to save sales order: ' + (err?.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (so: SalesOrder) => {
    setEditingSO(so);
    setEditDeliveryDate(so.deliveryDate || (so as any).target_delivery_date || '');
    setEditOrderValue(Number(so.orderValue) || Number((so as any).grand_total) || 0);
    setEditPaymentTerms(so.paymentTerms || '');
    setEditStatus(so.status || 'confirmed');
    setEditCustomerPo(so.customerPoNumber || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSO) return;
    try {
      setIsEditSubmitting(true);
      await updateSalesOrder(editingSO.id, {
        deliveryDate: editDeliveryDate,
        orderValue: Number(editOrderValue) || 0,
        paymentTerms: editPaymentTerms,
        status: editStatus,
        customerPoNumber: editCustomerPo,
      });
      setEditingSO(null);
      showBanner(`Sales Order ${editingSO.salesOrderNumber} updated in Database!`, 'success');
    } catch (err: any) {
      alert('Failed to update sales order: ' + (err?.message || err));
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSalesOrder(id);
      setDeletingSOId(null);
      showBanner(`Sales Order deleted from Database!`, 'success');
    } catch (err: any) {
      alert('Failed to delete sales order: ' + (err?.message || err));
    }
  };

  // Metrics
  const totalOrders = (salesOrders || []).length;
  const totalValue = (salesOrders || []).reduce(
    (acc, so) => acc + (Number(so.orderValue) || Number((so as any).grand_total) || Number((so as any).total_amount) || 0),
    0
  );
  const projectsCreatedCount = (salesOrders || []).filter((so) => {
    const prj = getLinkedProject(so);
    return Boolean(so.jobNumber || so.projectId || so.status === 'project_created' || (so as any).isProjectCreated || prj);
  }).length;
  const awaitingCount = Math.max(0, totalOrders - projectsCreatedCount);

  const handleExportCSV = () => {
    const csv = [
      'Sales Order #,Customer,Customer PO,Equipment Scope,Total Order Value,Delivery Target,Job #,Status',
      ...salesOrders.map((so) => {
        const linkedPrj = getLinkedProject(so);
        const displayJob = so.jobNumber || linkedPrj?.jobNumber || '';
        const equip = so.items?.[0]?.productName || (so as any).machineProduct || 'Custom Manufacturing Machine';
        const val = Number(so.orderValue) || Number((so as any).grand_total) || 0;
        return `"${so.salesOrderNumber}","${so.customerName}","${so.customerPoNumber || ''}","${equip}","${val}","${so.deliveryDate || ''}","${displayJob}","${so.status || ''}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sales_Orders_Register_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const columns: ERPColumn<SalesOrder>[] = [
    {
      key: 'salesOrderNumber',
      header: 'SALES ORDER #',
      isCodeLink: true,
      onCodeClick: (so) => {
        const linkedPrj = getLinkedProject(so);
        const displayJob = so.jobNumber || linkedPrj?.jobNumber;
        if (displayJob) {
          openJobModal(displayJob);
        } else if (so.projectId) {
          router.push(`/projects/${so.projectId}`);
        }
      },
      cell: (so) => (
        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs whitespace-nowrap inline-block">
          {so.salesOrderNumber}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'CUSTOMER & PO REFERENCE',
      cell: (so) => (
        <div className="min-w-[180px]">
          <span className="font-bold text-slate-800 block text-xs">{so.customerName}</span>
          <span className="text-[11px] text-slate-500 font-mono">PO: {so.customerPoNumber || 'Direct Booking'}</span>
        </div>
      ),
    },
    {
      key: 'equipmentScope',
      header: 'EQUIPMENT SCOPE',
      cell: (so) => (
        <span className="font-medium text-slate-700 block max-w-sm truncate text-xs" title={so.items?.[0]?.productName || (so as any).machineProduct || 'Custom Manufacturing Machine'}>
          {so.items?.[0]?.productName || (so as any).machineProduct || (so as any).machine_product || 'Custom Manufacturing Machine'}
        </span>
      ),
    },
    {
      key: 'orderValue',
      header: 'TOTAL ORDER VALUE',
      cell: (so) => (
        <span className="font-mono font-bold text-emerald-700 text-xs whitespace-nowrap inline-block">
          {formatCurrency(Number(so.orderValue) || Number((so as any).grand_total) || Number((so as any).total_amount) || 0)}
        </span>
      ),
    },
    {
      key: 'deliveryDate',
      header: 'DELIVERY TARGET',
      cell: (so) => (
        <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap inline-block">
          {formatDate(so.deliveryDate || (so as any).target_delivery_date || (so as any).delivery_date)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'MTO INTEGRATION STATUS',
      cell: (so) => {
        const linkedPrj = getLinkedProject(so);
        const isCreated = Boolean(
          so.jobNumber ||
          so.projectId ||
          so.status === 'project_created' ||
          (so as any).isProjectCreated ||
          linkedPrj
        );
        const displayJob = so.jobNumber || linkedPrj?.jobNumber;

        return (
          <div className="whitespace-nowrap">
            {isCreated ? (
              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Already Created {displayJob ? `(${displayJob})` : ''}</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Awaiting Job Creation
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'ACTIONS (CRM → PROJECT)',
      cell: (so) => {
        const linkedPrj = getLinkedProject(so);
        const isCreated = Boolean(
          so.jobNumber ||
          so.projectId ||
          so.status === 'project_created' ||
          (so as any).isProjectCreated ||
          linkedPrj
        );
        const displayJob = so.jobNumber || linkedPrj?.jobNumber;
        const displayPrj = so.projectId || linkedPrj?.projectNumber || linkedPrj?.id;
        const isThisCreating = isCreatingProject === so.id;

        return (
          <div className="whitespace-nowrap flex items-center gap-1.5">
            {isCreated ? (
              <button
                type="button"
                onClick={() => {
                  if (displayJob) {
                    openJobModal(displayJob);
                  } else if (displayPrj) {
                    router.push(`/projects/${displayPrj}`);
                  } else {
                    router.push('/projects');
                  }
                }}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="View Linked Project / Job Modal"
              >
                <ExternalLink className="w-3.5 h-3.5 text-purple-700" />
                <span>{displayPrj || displayJob || 'View Project'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={Boolean(isCreatingProject)}
                onClick={() => handleCreateProject(so.id)}
                className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isThisCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            )}

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => handleOpenEdit(so)}
              className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition cursor-pointer border border-transparent hover:border-purple-200"
              title="Edit Sales Order in Database"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setDeletingSOId(so.id)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-200"
              title="Delete from Database"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  if (!mounted) {
    return null;
  }  return (
    <div className="space-y-4">
      {/* Banner Notifications */}
      {bannerNotice && (
        <div
          className={`p-3 rounded-xl font-bold flex items-center justify-between shadow-xs transition-all animate-in fade-in ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-xs">{bannerNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar with DB status & Refresh */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-700" />
            <span>Database Synced</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Make-to-Order contracts ready for Shop Floor Engineering & Production
          </span>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          title="Reload latest records from Database"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh DB'}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Sales Orders</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{totalOrders}</span>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              In Database
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Booking Value</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-black text-emerald-700 font-mono">{formatCurrency(totalValue)}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              INR
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Handover</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-700 font-mono">{projectsCreatedCount}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active Jobs
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Awaiting Job Creation</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-700 font-mono">{awaitingCount}</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Ready for MTO
            </span>
          </div>
        </div>
      </div>

      {successInfo && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-slate-900 text-xs">CRM → Project Handover Saved to Database!</span>
              <p className="text-[11px] font-normal text-emerald-800 mt-0.5">
                Created Project: <strong>{successInfo.prj}</strong> | Master Job Number: <strong>{successInfo.job}</strong>. Redirecting to Shop Floor Projects...
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-600 animate-pulse" />
        </div>
      )}

      {/* Main ERP List Page Layout */}
      <ERPListPageLayout<SalesOrder>
        breadcrumbs={['DASHBOARD', 'CRM & SALES', 'SALES ORDERS']}
        title="Confirmed Sales Orders Master"
        columns={columns}
        data={salesOrders}
        searchPlaceholder="Search sales order #, customer, PO reference, or equipment..."
        addNewLabel="New Sales Order"
        onAddNew={() => setIsCreateModalOpen(true)}
        onExport={handleExportCSV}
      />

      {/* CREATE NEW SALES ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E7DED5] shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#FAF3EA] to-[#F1DFC9] border-b border-[#E9DFD3] flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#75401F] font-mono text-[9px] font-bold uppercase tracking-wider border border-[#E7DED5]">
                  Database Direct Create
                </span>
                <h2 className="text-base font-black text-[#211B17] flex items-center gap-2 mt-1">
                  <Plus className="w-4 h-4 text-[#75401F]" />
                  Create Confirmed Sales Order
                </h2>
                <p className="text-[11px] text-[#70665F]">
                  Enter contract details to create a Sales Order and save directly into the database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-white/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSalesOrder} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Customer & PO Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#211B17] mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="customer-suggestions"
                    placeholder="e.g. Gujarat Chemical Corp Ltd"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7DED5] rounded-xl text-xs focus:outline-none focus:border-[#75401F] bg-[#FAF8F5]"
                  />
                  <datalist id="customer-suggestions">
                    {customers.map((c) => (
                      <option key={c.id} value={c.companyName} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#211B17] mb-1">
                    Customer PO Reference Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO/GCC/2026/089"
                    value={newPoNum}
                    onChange={(e) => setNewPoNum(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7DED5] rounded-xl text-xs focus:outline-none focus:border-[#75401F] bg-[#FAF8F5] font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Quotation Ref, Order Date & Delivery Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#211B17] mb-1">
                    Reference Quotation # (Optional)
                  </label>
                  <input
                    type="text"
                    list="quotation-suggestions"
                    placeholder="e.g. QT-2026-0174 (Rev-00)"
                    value={newQtnNum}
                    onChange={(e) => setNewQtnNum(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7DED5] rounded-xl text-xs focus:outline-none focus:border-[#75401F] bg-[#FAF8F5] font-mono"
                  />
                  <datalist id="quotation-suggestions">
                    {quotations.map((q) => (
                      <option key={q.id} value={q.quotationNumber} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#211B17] mb-1">
                    Order Confirmation Date
                  </label>
                  <input
                    type="date"
                    value={newOrderDate}
                    onChange={(e) => setNewOrderDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7DED5] rounded-xl text-xs focus:outline-none focus:border-[#75401F] bg-[#FAF8F5] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#211B17] mb-1">
                    Target Delivery Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7DED5] rounded-xl text-xs focus:outline-none focus:border-[#75401F] bg-[#FAF8F5] font-mono"
                  />
                </div>
              </div>

              {/* Equipment Items Table */}
              <div className="border border-[#E7DED5] rounded-xl p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#75401F]" />
                    Equipment / Line Items Scope
                  </label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="px-2.5 py-1 bg-[#FAF0E6] hover:bg-[#F3E5D8] text-[#75401F] border border-[#E7DED5] rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newItems.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EFE8E0]">
                      <div className="col-span-12 sm:col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Product Name (e.g. Distillation Column)"
                          value={item.productName}
                          onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Specification (e.g. 5000L SS316)"
                          value={item.specification}
                          onChange={(e) => handleItemChange(idx, 'specification', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-1">
                        <input
                          type="text"
                          placeholder="Unit"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Rate (₹)"
                          value={item.rate || ''}
                          onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
                        <span className="font-mono text-[11px] font-bold text-emerald-700">
                          {formatCurrency(item.amount)}
                        </span>
                        {newItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Total Order Value & PM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#211B17] mb-1">
                    Total Order Value (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="Calculated or override amount"
                      value={customOrderValue !== '' ? customOrderValue : (calculatedItemsTotal || '')}
                      onChange={(e) => setCustomOrderValue(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7DED5] rounded-xl text-xs focus:outline-none focus:border-[#75401F] bg-[#FAF8F5] font-mono font-bold text-[#169B62]"
                    />
                  </div>
                  <span className="text-[10px] text-[#70665F]">
                    Items Subtotal: <strong>{formatCurrency(calculatedItemsTotal)}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#211B17] mb-1">
                    Assigned Project Manager
                  </label>
                  <select
                    value={newProjectManager}
                    onChange={(e) => setNewProjectManager(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7DED5] rounded-xl text-xs focus:outline-none focus:border-[#75401F] bg-[#FAF8F5]"
                  >
                    <option value="">-- Select Project Manager --</option>
                    {allStaff && allStaff.length > 0 ? (
                      allStaff.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name} {emp.role ? `(${emp.role})` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="Project Manager">Project Manager</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-[11px] font-bold text-[#211B17] mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30% Advance, 60% ag. Proforma Invoice, 10% after Commissioning"
                  value={newPaymentTerms}
                  onChange={(e) => setNewPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7DED5] rounded-xl text-xs focus:outline-none focus:border-[#75401F] bg-[#FAF8F5]"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#E7DED5] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#75401F] hover:bg-[#5C3218] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>Confirm & Save to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SALES ORDER MODAL */}
      {editingSO && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E7DED5] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-gradient-to-r from-[#FAF3EA] to-[#F1DFC9] border-b border-[#E9DFD3] flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#75401F]">
                  {editingSO.salesOrderNumber}
                </span>
                <h3 className="text-sm font-black text-[#211B17]">Edit Sales Order Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSO(null)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-white/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#211B17] mb-1">Customer</label>
                <input
                  type="text"
                  disabled
                  value={editingSO.customerName}
                  className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#211B17] mb-1">Customer PO Number</label>
                <input
                  type="text"
                  value={editCustomerPo}
                  onChange={(e) => setEditCustomerPo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E7DED5] rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#211B17] mb-1">Total Order Value (₹)</label>
                  <input
                    type="number"
                    value={editOrderValue}
                    onChange={(e) => setEditOrderValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E7DED5] rounded-xl text-xs font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#211B17] mb-1">Target Delivery Date</label>
                  <input
                    type="date"
                    value={editDeliveryDate}
                    onChange={(e) => setEditDeliveryDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E7DED5] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#211B17] mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E7DED5] rounded-xl text-xs"
                >
                  <option value="confirmed">Confirmed (Awaiting Project)</option>
                  <option value="project_created">Project Created</option>
                  <option value="in_production">In Production</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#211B17] mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={editPaymentTerms}
                  onChange={(e) => setEditPaymentTerms(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E7DED5] rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 border-t border-[#E7DED5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSO(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-4 py-1.5 bg-[#75401F] hover:bg-[#5C3218] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isEditSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Update in DB</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSOId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl p-5 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h4 className="font-black text-sm">Delete Sales Order?</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete this sales order ({deletingSOId})? This will permanently delete the record from the database.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingSOId(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingSOId)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Delete from DB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
