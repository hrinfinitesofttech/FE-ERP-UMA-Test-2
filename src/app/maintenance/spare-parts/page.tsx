'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  Package,
  PackageCheck,
  CornerUpLeft,
  Search,
  Filter,
  Plus,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  UserCheck,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Boxes,
  Truck,
} from 'lucide-react';

function SparePartsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'catalog' | 'issue' | 'return') || 'catalog';

  const {
    itemMasters,
    stockBalances,
    warehouses,
    servicePartIssues,
    addServicePartIssue,
    servicePartReturns,
    addServicePartReturn,
    serviceWorkOrders,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'catalog' | 'issue' | 'return'>(
    initialTab === 'issue' || initialTab === 'return' ? initialTab : 'catalog'
  );

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Form State: Issue
  const [issueForm, setIssueForm] = useState({
    workOrderNumber: '',
    serviceRequestId: '',
    customerName: '',
    machineName: '',
    technicianId: 'TECH-001',
    technicianName: '',
    itemCode: '',
    requiredQty: 1,
    issuedQty: 1,
    rate: 0,
    warehouse: 'Main Store - Maintenance Bay',
    location: 'Rack-M3',
    batchSerial: '',
    status: 'Issued' as const,
    remarks: '',
  });

  // Form State: Return
  const [returnForm, setReturnForm] = useState({
    workOrderNumber: serviceWorkOrders[0]?.workOrderNumber || 'WO-SVC-2026-001',
    originalIssueNumber: servicePartIssues[0]?.issueNumber || 'ISS-SVC-001',
    itemCode: itemMasters[0]?.itemCode || '',
    issuedQty: 2,
    usedQty: 1,
    returnQty: 1,
    condition: 'Good' as 'Good' | 'Damaged' | 'Scrap',
    warehouse: 'Main Store - Maintenance Bay',
    location: 'Bin-RET-01',
    returnedBy: '',
    receivedBy: 'Store Supervisor',
    returnDate: new Date().toISOString().split('T')[0],
    status: 'Accepted to Store' as const,
  });

  // 1. Spares Catalog Processing
  const spareItems = (itemMasters || []).map((item) => {
    const balance = (stockBalances || []).find((sb) => sb.itemCode === item.itemCode);
    const availableQty = balance ? balance.availableQty : (item.standardCost ? 18 : 8);
    const warehouseLocation = balance ? balance.warehouseName : 'Maintenance Spares Bay';
    return {
      ...item,
      currentStock: availableQty,
      warehouseLocation,
    };
  }).filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.itemCode?.toLowerCase().includes(q) ||
      item.itemName?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    let matchesStock = true;
    if (stockStatusFilter === 'in_stock') matchesStock = item.currentStock > 5;
    else if (stockStatusFilter === 'low_stock') matchesStock = item.currentStock > 0 && item.currentStock <= 5;
    else if (stockStatusFilter === 'out_of_stock') matchesStock = item.currentStock <= 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // 2. Filtered Issues
  const filteredIssues = (servicePartIssues || []).filter((spi) => {
    const q = searchTerm.trim().toLowerCase();
    return (
      !q ||
      spi.issueNumber?.toLowerCase().includes(q) ||
      spi.customerName?.toLowerCase().includes(q) ||
      spi.workOrderNumber?.toLowerCase().includes(q) ||
      spi.technicianName?.toLowerCase().includes(q) ||
      spi.machineName?.toLowerCase().includes(q)
    );
  });

  // 3. Filtered Returns
  const filteredReturns = (servicePartReturns || []).filter((r) => {
    const q = searchTerm.trim().toLowerCase();
    return (
      !q ||
      r.returnNumber?.toLowerCase().includes(q) ||
      r.workOrderNumber?.toLowerCase().includes(q) ||
      r.originalIssueNumber?.toLowerCase().includes(q) ||
      r.returnedBy?.toLowerCase().includes(q) ||
      r.receivedBy?.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const totalSparesCount = itemMasters?.length || 0;
  const lowStockCount = spareItems.filter((i) => i.currentStock <= 5).length;
  const totalIssuesCount = servicePartIssues?.length || 0;
  const totalReturnsCount = servicePartReturns?.length || 0;

  // Handler: Open Issue Modal with preselected item
  const handleOpenIssueForPart = (item: any) => {
    setIssueForm((prev) => ({
      ...prev,
      itemCode: item.itemCode,
      rate: item.standardCost || 500,
    }));
    setActiveTab('issue');
    setShowIssueModal(true);
  };

  // Submit Issue
  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = itemMasters.find((i) => i.itemCode === issueForm.itemCode) || itemMasters[0];

    addServicePartIssue({
      workOrderNumber: issueForm.workOrderNumber || `WO-SVC-${Date.now().toString().slice(-4)}`,
      serviceRequestId: issueForm.serviceRequestId || `SR-2026-${Date.now().toString().slice(-3)}`,
      customerName: issueForm.customerName || 'Standard Client',
      machineName: issueForm.machineName || 'Industrial Reactor / Machine',
      technicianId: issueForm.technicianId || 'TECH-001',
      technicianName: issueForm.technicianName || 'Field Technician',
      items: [
        {
          itemCode: issueForm.itemCode || selectedItem?.itemCode || 'PART-001',
          itemName: selectedItem?.itemName || 'Spare Component',
          requiredQty: Number(issueForm.requiredQty) || 1,
          issuedQty: Number(issueForm.issuedQty) || 1,
          rate: Number(issueForm.rate) || selectedItem?.standardCost || 500,
          warehouse: issueForm.warehouse,
          location: issueForm.location,
          batchSerial: issueForm.batchSerial || `BAT-${Date.now().toString().slice(-4)}`,
        },
      ],
      status: 'Issued',
      remarks: issueForm.remarks || 'Issued from Store for service trip',
    });

    setShowIssueModal(false);
    // Reset partial form
    setIssueForm((prev) => ({
      ...prev,
      workOrderNumber: '',
      customerName: '',
      technicianName: '',
      remarks: '',
    }));
  };

  // Submit Return
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = itemMasters.find((i) => i.itemCode === returnForm.itemCode) || itemMasters[0];

    addServicePartReturn({
      workOrderNumber: returnForm.workOrderNumber,
      originalIssueNumber: returnForm.originalIssueNumber,
      items: [
        {
          itemCode: returnForm.itemCode || selectedItem?.itemCode || 'PART-001',
          itemName: selectedItem?.itemName || 'Spare Component',
          issuedQty: Number(returnForm.issuedQty) || 2,
          usedQty: Number(returnForm.usedQty) || 1,
          returnQty: Number(returnForm.returnQty) || 1,
          condition: returnForm.condition,
          warehouse: returnForm.warehouse,
          location: returnForm.location,
        },
      ],
      returnedBy: returnForm.returnedBy || 'Field Technician',
      receivedBy: returnForm.receivedBy || 'Store Supervisor',
      returnDate: returnForm.returnDate,
      status: 'Accepted to Store',
    });

    setShowReturnModal(false);
    setReturnForm((prev) => ({
      ...prev,
      returnedBy: '',
    }));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#211B17]">
      {/* ========================================================================= */}
      {/* HEADER BANNER                                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 mt-0.5">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold font-mono border border-emerald-500/20">
                STORE INVENTORY INTERFACE
              </span>
              <span className="text-xs text-[#70665F]">Single Source of Truth from Store</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#211B17] tracking-tight mt-1">
              Spare Parts & Service Inventory Hub
            </h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Live Store Inventory Stock, Technician Field Issues, and Unused Parts Store Return Slips
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              if (itemMasters.length > 0 && !issueForm.itemCode) {
                setIssueForm((p) => ({ ...p, itemCode: itemMasters[0].itemCode, rate: itemMasters[0].standardCost || 500 }));
              }
              setShowIssueModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Parts Issue Request</span>
          </button>
          <button
            onClick={() => {
              if (itemMasters.length > 0 && !returnForm.itemCode) {
                setReturnForm((p) => ({ ...p, itemCode: itemMasters[0].itemCode }));
              }
              setShowReturnModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#211B17] font-semibold text-xs border border-[#EBE3DB] shadow-xs transition cursor-pointer"
          >
            <CornerUpLeft className="w-4 h-4 text-rose-600" />
            <span>Log Parts Return</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KPI METRIC CARDS                                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#70665F]">Total Spare SKUs</div>
            <div className="text-xl font-bold font-mono text-[#211B17]">{totalSparesCount}</div>
            <div className="text-[10px] text-blue-600">Active in Store Master</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#70665F]">Low Stock Alerts</div>
            <div className="text-xl font-bold font-mono text-amber-700">{lowStockCount}</div>
            <div className="text-[10px] text-amber-600">Stock ≤ 5 Available</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-700 border border-violet-100">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#70665F]">Active Issues</div>
            <div className="text-xl font-bold font-mono text-violet-700">{totalIssuesCount}</div>
            <div className="text-[10px] text-violet-600">Requisitions to Field</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
            <CornerUpLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#70665F]">Parts Returned</div>
            <div className="text-xl font-bold font-mono text-rose-700">{totalReturnsCount}</div>
            <div className="text-[10px] text-rose-600">Accepted back to store</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB NAVIGATION HEADER                                                     */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-crm-brand-700 text-white shadow-sm'
                : 'text-[#70665F] hover:bg-white hover:text-[#211B17]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Spare Parts Catalog & Store Stock</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'catalog' ? 'bg-white/20 text-white' : 'bg-[#EBE3DB] text-[#544B45]'
              }`}
            >
              {spareItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('issue')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'issue'
                ? 'bg-crm-brand-700 text-white shadow-sm'
                : 'text-[#70665F] hover:bg-white hover:text-[#211B17]'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Service Parts Issue Slips</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'issue' ? 'bg-white/20 text-white' : 'bg-[#EBE3DB] text-[#544B45]'
              }`}
            >
              {servicePartIssues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('return')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'return'
                ? 'bg-crm-brand-700 text-white shadow-sm'
                : 'text-[#70665F] hover:bg-white hover:text-[#211B17]'
            }`}
          >
            <CornerUpLeft className="w-4 h-4" />
            <span>Parts Return to Store</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'return' ? 'bg-white/20 text-white' : 'bg-[#EBE3DB] text-[#544B45]'
              }`}
            >
              {servicePartReturns.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH BAR                                                       */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8D7B70]" />
          <input
            type="text"
            placeholder={
              activeTab === 'catalog'
                ? 'Search part code, description, category...'
                : activeTab === 'issue'
                ? 'Search issue #, WO, customer, technician...'
                : 'Search return #, WO, returned by...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] placeholder-[#8D7B70] focus:outline-none focus:border-crm-brand-700 transition"
          />
        </div>

        {activeTab === 'catalog' && (
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-[#70665F]">
              <Filter className="w-3.5 h-3.5 text-[#8D7B70]" />
              <span>Category:</span>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-700"
            >
              <option value="all">All Categories</option>
              <option value="Bought Out Components">Bought Out Components</option>
              <option value="Consumables">Consumables & Lubricants</option>
              <option value="Raw Material">Raw Material</option>
              <option value="Fasteners">Fasteners & Gaskets</option>
            </select>

            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-700"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt; 5)</option>
              <option value="low_stock">Low Stock (1 - 5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SPARE PARTS CATALOG & STORE STOCK                                  */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EBE3DB] bg-[#FAF7F2]/60 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-[#211B17] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-crm-brand-700" />
                Live Store Spares Inventory
              </h2>
              <p className="text-[11px] text-[#70665F]">
                Direct live synchronization from Module 5 (Store & Item Master)
              </p>
            </div>
            <span className="text-xs text-[#70665F]">
              Showing <strong>{spareItems.length}</strong> items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#544B45]">
              <thead className="bg-[#FAF7F2] text-[#70665F] font-bold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
                <tr>
                  <th className="p-3.5">Part / SKU Code</th>
                  <th className="p-3.5">Description & Specification</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Store Location</th>
                  <th className="p-3.5 text-right">Available Qty</th>
                  <th className="p-3.5 text-right">Std Rate (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB]">
                {spareItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#8D7B70]">
                      No spare parts found matching current filters.
                    </td>
                  </tr>
                ) : (
                  spareItems.map((item) => {
                    const isLow = item.currentStock <= 5 && item.currentStock > 0;
                    const isOut = item.currentStock <= 0;
                    return (
                      <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="p-3.5 font-mono font-bold text-crm-brand-700">
                          {item.itemCode}
                        </td>
                        <td className="p-3.5 font-medium text-[#211B17]">
                          <div>{item.itemName}</div>
                          {item.specification && (
                            <div className="text-[11px] text-[#8D7B70]">{item.specification}</div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAF7F2] text-[#544B45] border border-[#EBE3DB]">
                            {item.category || 'Spares'}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] text-[#70665F]">
                          {item.warehouseLocation || 'Maintenance Spares Bay'}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-[#211B17]">
                          <span
                            className={
                              isOut
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }
                          >
                            {item.currentStock} {item.uom}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono text-[#544B45]">
                          {formatCurrency(item.standardCost || 500)}
                        </td>
                        <td className="p-3.5 text-center">
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleOpenIssueForPart(item)}
                            className="px-2.5 py-1 rounded-lg bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-[11px] font-bold transition cursor-pointer shadow-xs"
                          >
                            + Issue Spare
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SERVICE PARTS ISSUE SLIPS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'issue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#211B17] flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-crm-brand-700" />
              Service Parts Issue Requisitions Register
            </h2>
            <button
              onClick={() => setShowIssueModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-crm-brand-700 text-white font-semibold text-xs shadow-xs hover:bg-crm-brand-800 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Issue Slip</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIssues.length === 0 ? (
              <div className="col-span-full p-8 text-center text-[#8D7B70] bg-white rounded-2xl border border-[#EBE3DB]">
                No parts issue slips recorded. Click &quot;Create Issue Slip&quot; to issue spares for service jobs.
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const totalIssueVal = (issue.items || []).reduce(
                  (acc, it) => acc + (it.rate || 0) * (it.issuedQty || 1),
                  0
                );
                return (
                  <div
                    key={issue.id}
                    className="bg-white rounded-2xl border border-[#EBE3DB] p-5 shadow-xs space-y-3.5 hover:border-crm-brand-300 transition"
                  >
                    <div className="flex justify-between items-start border-b border-[#EBE3DB] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-crm-brand-700">
                            {issue.issueNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {issue.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#211B17] font-semibold mt-1">
                          {issue.customerName} • {issue.machineName}
                        </div>
                        <div className="text-[11px] text-[#70665F] font-mono">
                          Work Order: <strong>{issue.workOrderNumber}</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-[#8D7B70]">Total Value</div>
                        <div className="text-sm font-mono font-bold text-[#211B17]">
                          {formatCurrency(totalIssueVal || 1200)}
                        </div>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-[#70665F] tracking-wider block">
                        Issued Line Items ({issue.items?.length || 0})
                      </span>
                      <div className="space-y-1.5">
                        {issue.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-[#FAF7F2] rounded-xl flex items-center justify-between text-xs border border-[#EBE3DB]"
                          >
                            <div>
                              <div className="font-bold text-[#211B17]">{item.itemName}</div>
                              <div className="text-[10px] text-[#70665F] font-mono">
                                SKU: {item.itemCode} • Wh: {item.warehouse} ({item.location})
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded bg-white text-[#211B17] font-mono font-bold border border-[#EBE3DB]">
                                Qty: {item.issuedQty}
                              </span>
                              <div className="text-[10px] font-mono text-[#8D7B70] mt-0.5">
                                @ {formatCurrency(item.rate)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EBE3DB] text-[11px] text-[#70665F]">
                      <span>
                        Technician: <strong className="text-[#211B17]">{issue.technicianName}</strong>
                      </span>
                      <span className="font-mono text-[10px]">
                        Date: {formatDate(issue.createdAt || new Date().toISOString())}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SERVICE PARTS RETURN TO STORE                                      */}
      {/* ========================================================================= */}
      {activeTab === 'return' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#211B17] flex items-center gap-2">
              <CornerUpLeft className="w-4 h-4 text-rose-600" />
              Service Parts Return Slips (Store Intake)
            </h2>
            <button
              onClick={() => setShowReturnModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-xs hover:bg-rose-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Parts Return</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#544B45]">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-bold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
                  <tr>
                    <th className="p-3.5">Return Slip #</th>
                    <th className="p-3.5">Original Issue / WO #</th>
                    <th className="p-3.5">Returned Part Details</th>
                    <th className="p-3.5 text-center">Returned Qty</th>
                    <th className="p-3.5">Condition</th>
                    <th className="p-3.5">Returned By (Tech)</th>
                    <th className="p-3.5">Received By (Store)</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#8D7B70]">
                        No parts return records found. Click &quot;Log Parts Return&quot; to intake unconsumed parts.
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="p-3.5 font-mono font-bold text-rose-600">
                          {ret.returnNumber}
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-[#211B17]">
                            {ret.workOrderNumber}
                          </div>
                          <div className="text-[10px] font-mono text-[#8D7B70]">
                            Ref Issue: {ret.originalIssueNumber}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {ret.items && ret.items.length > 0 ? (
                            <div>
                              <div className="font-bold text-[#211B17]">{ret.items[0].itemName}</div>
                              <div className="text-[10px] font-mono text-[#8D7B70]">
                                SKU: {ret.items[0].itemCode}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#8D7B70]">Returned Items</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-[#211B17]">
                          {ret.items && ret.items[0] ? ret.items[0].returnQty : 1}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              ret.items?.[0]?.condition === 'Good'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : ret.items?.[0]?.condition === 'Damaged'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {ret.items?.[0]?.condition || 'Good'}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-[#211B17]">{ret.returnedBy}</td>
                        <td className="p-3.5 text-[#70665F]">{ret.receivedBy}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {ret.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE SPARE PART ISSUE REQUEST                                  */}
      {/* ========================================================================= */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EBE3DB] shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-crm-brand-700" />
                <h3 className="font-bold text-base text-[#211B17]">New Service Parts Issue Requisition</h3>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="p-1 rounded-lg text-[#8D7B70] hover:bg-[#FAF7F2] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Work Order Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WO-SVC-2026-001"
                    value={issueForm.workOrderNumber}
                    onChange={(e) => setIssueForm({ ...issueForm, workOrderNumber: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-semibold focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reliance Petrochemicals"
                    value={issueForm.customerName}
                    onChange={(e) => setIssueForm({ ...issueForm, customerName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Equipment / Machine Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5KL SS Reactor Vessel"
                    value={issueForm.machineName}
                    onChange={(e) => setIssueForm({ ...issueForm, machineName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Technician Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arvind Sharma"
                    value={issueForm.technicianName}
                    onChange={(e) => setIssueForm({ ...issueForm, technicianName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                  Select Spare Item from Store
                </label>
                <select
                  value={issueForm.itemCode}
                  onChange={(e) => {
                    const sel = itemMasters.find((i) => i.itemCode === e.target.value);
                    setIssueForm({
                      ...issueForm,
                      itemCode: e.target.value,
                      rate: sel?.standardCost || 500,
                    });
                  }}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-semibold focus:outline-none focus:border-crm-brand-700"
                >
                  {itemMasters.map((i) => (
                    <option key={i.id} value={i.itemCode}>
                      {i.itemCode} - {i.itemName} ({i.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Issued Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={issueForm.issuedQty}
                    onChange={(e) =>
                      setIssueForm({
                        ...issueForm,
                        issuedQty: Number(e.target.value),
                        requiredQty: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 font-mono font-bold text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={issueForm.rate}
                    onChange={(e) => setIssueForm({ ...issueForm, rate: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 font-mono text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Bin Location
                  </label>
                  <input
                    type="text"
                    value={issueForm.location}
                    onChange={(e) => setIssueForm({ ...issueForm, location: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 font-mono text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                  Purpose / Service Trip Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical seal replacement and impeller maintenance"
                  value={issueForm.remarks}
                  onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#EBE3DB] text-[#544B45] font-semibold hover:bg-[#FAF7F2] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold transition shadow-sm cursor-pointer"
                >
                  Confirm Store Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LOG UNUSED SPARE PARTS RETURN                                    */}
      {/* ========================================================================= */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EBE3DB] shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2">
                <CornerUpLeft className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-[#211B17]">Log Unconsumed Parts Return</h3>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="p-1 rounded-lg text-[#8D7B70] hover:bg-[#FAF7F2] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Related Work Order
                  </label>
                  <input
                    type="text"
                    required
                    value={returnForm.workOrderNumber}
                    onChange={(e) => setReturnForm({ ...returnForm, workOrderNumber: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-semibold focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Original Issue Slip #
                  </label>
                  <input
                    type="text"
                    required
                    value={returnForm.originalIssueNumber}
                    onChange={(e) => setReturnForm({ ...returnForm, originalIssueNumber: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                  Item Being Returned to Store
                </label>
                <select
                  value={returnForm.itemCode}
                  onChange={(e) => setReturnForm({ ...returnForm, itemCode: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-semibold focus:outline-none focus:border-crm-brand-700"
                >
                  {itemMasters.map((i) => (
                    <option key={i.id} value={i.itemCode}>
                      {i.itemCode} - {i.itemName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Return Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnForm.returnQty}
                    onChange={(e) => setReturnForm({ ...returnForm, returnQty: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 font-mono font-bold text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Part Condition
                  </label>
                  <select
                    value={returnForm.condition}
                    onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-semibold focus:outline-none focus:border-crm-brand-700"
                  >
                    <option value="Good">Good (Unused)</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Scrap">Old Replaced Scrap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Store Bin
                  </label>
                  <input
                    type="text"
                    value={returnForm.location}
                    onChange={(e) => setReturnForm({ ...returnForm, location: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 font-mono text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Returned By (Technician)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arvind Sharma"
                    value={returnForm.returnedBy}
                    onChange={(e) => setReturnForm({ ...returnForm, returnedBy: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">
                    Received By (Store Incharge)
                  </label>
                  <input
                    type="text"
                    required
                    value={returnForm.receivedBy}
                    onChange={(e) => setReturnForm({ ...returnForm, receivedBy: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#EBE3DB] text-[#544B45] font-semibold hover:bg-[#FAF7F2] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-sm cursor-pointer"
                >
                  Accept into Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SparePartsHubPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#8D7B70]">
          Loading Spare Parts & Service Inventory Hub...
        </div>
      }
    >
      <SparePartsContent />
    </Suspense>
  );
}
