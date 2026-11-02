'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { Truck, Building, Star, Plus } from 'lucide-react';
import { EmptyState, LoadingState } from '../../../components/common/StateDisplay';

export default function Supplier360Page() {
  const { supplier360List = [], suppliers = [], purchaseOrders = [], isInitialLoading } = useERP();
  const [selectedSuppId, setSelectedSuppId] = useState<string>('');

  const allSuppliers = useMemo(() => {
    const map = new Map<string, {
      supplierId: string;
      supplierCode: string;
      supplierName: string;
      category: string;
      totalPurchasedValue: number;
      totalPaid: number;
      outstandingPayable: number;
      rating: number;
      onTimeDeliveryPercent: number;
      contactPerson: string;
      email: string;
      phone: string;
    }>();

    // 1. From supplier360List
    supplier360List.forEach((s) => {
      const key = s.supplierId || s.supplierCode;
      if (key) map.set(key, s);
    });

    // 2. Supplement from live suppliers
    suppliers.forEach((s) => {
      const key = s.id;
      if (key && !map.has(key)) {
        const relatedPOs = purchaseOrders.filter(
          (po) => po.supplierId === s.id || po.supplierName === (s.supplierName || s.name)
        );
        const totalPurchased = relatedPOs.reduce((sum, po) => sum + (Number(po.grandTotal) || 0), 0);

        map.set(key, {
          supplierId: s.id,
          supplierCode: s.supplierCode || s.vendorCode || '',
          supplierName: s.supplierName || s.name || '',
          category: s.category || '—',
          totalPurchasedValue: totalPurchased,
          totalPaid: 0,
          outstandingPayable: 0,
          rating: Number((s as any).performanceRating || (s as any).rating || 0),
          onTimeDeliveryPercent: 0,
          contactPerson: s.contactPerson || '—',
          email: s.email || '—',
          phone: s.mobile || '—',
        });
      }
    });

    return Array.from(map.values());
  }, [supplier360List, suppliers, purchaseOrders]);

  const currentSupplier = useMemo(() => {
    if (!allSuppliers || allSuppliers.length === 0) return null;
    if (selectedSuppId) {
      const match = allSuppliers.find((s) => s.supplierId === selectedSuppId || s.supplierCode === selectedSuppId);
      if (match) return match;
    }
    return allSuppliers[0];
  }, [allSuppliers, selectedSuppId]);

  if (isInitialLoading && allSuppliers.length === 0) {
    return <LoadingState message="Loading Supplier 360° Profile..." timeoutSeconds={15} />;
  }

  if (!currentSupplier) {
    return (
      <EmptyState
        title="No Suppliers Available"
        message="No supplier records found in database. Add a supplier to view their 360° procurement rating and order history."
        actionLabel="Add Supplier"
        actionHref="/purchase/suppliers"
        icon={Truck}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] font-sans pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[color:var(--crm-brand-700)] flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">{currentSupplier.supplierName}</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] font-medium mt-0.5">
              Code: <span className="font-mono font-bold text-[color:var(--crm-brand-700)]">{currentSupplier.supplierCode}</span> • Category: {currentSupplier.category}
            </p>
          </div>
        </div>

        {/* Supplier Select Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <select
              value={currentSupplier.supplierId}
              onChange={(e) => setSelectedSuppId(e.target.value)}
              className="w-full bg-[color:var(--crm-bg-app)] hover:bg-white text-xs text-[color:var(--crm-text-primary)] font-bold px-3 py-2.5 rounded-xl border border-[color:var(--crm-border-strong)] focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer min-h-[40px]"
            >
              {allSuppliers.map((s) => (
                <option key={s.supplierId} value={s.supplierId}>
                  {s.supplierName} ({s.supplierCode})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/purchase/suppliers"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-strong)] text-[color:var(--crm-text-primary)] text-xs font-bold transition shadow-2xs min-h-[40px] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Suppliers</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[color:var(--crm-text-secondary)] block font-semibold">Total Purchased Value</span>
          <div className="text-xl font-bold font-mono text-[color:var(--crm-text-primary)]">
            ₹ {currentSupplier.totalPurchasedValue > 0 ? currentSupplier.totalPurchasedValue.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block">All approved purchase orders</span>
        </div>

        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[color:var(--crm-text-secondary)] block font-semibold">Total Payments Cleared</span>
          <div className="text-xl font-bold font-mono text-emerald-700">
            ₹ {currentSupplier.totalPaid > 0 ? currentSupplier.totalPaid.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-[10px] text-emerald-700 block">Settled vouchers</span>
        </div>

        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[color:var(--crm-text-secondary)] block font-semibold">Outstanding Payable</span>
          <div className="text-xl font-bold font-mono text-[color:var(--crm-brand-700)]">
            ₹ {currentSupplier.outstandingPayable > 0 ? currentSupplier.outstandingPayable.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block">Pending bills</span>
        </div>

        <div className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[color:var(--crm-text-secondary)] block font-semibold">Performance Rating</span>
          <div className="text-xl font-bold font-mono text-amber-700 flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-500 text-crm-brand-600" />
            <span>{currentSupplier.rating} / 5.0</span>
          </div>
          <span className="text-[10px] text-amber-700 block font-sans">{currentSupplier.onTimeDeliveryPercent}% On-Time Delivery</span>
        </div>
      </div>

      {/* Supplier Profile Info */}
      <div className="p-5 sm:p-6 bg-white border border-[color:var(--crm-border-default)] rounded-2xl shadow-xs space-y-3 text-xs">
        <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2 pb-3 border-b border-[color:var(--crm-surface-subtle)]">
          <Building className="w-4 h-4 text-[color:var(--crm-brand-700)]" />
          <span>Vendor Contact &amp; Accounts Representative</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[color:var(--crm-text-secondary)]">
          <div className="p-3 rounded-xl bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)]">
            <span className="text-[10px] text-[color:var(--crm-text-secondary)] uppercase font-semibold block">Contact Person</span>
            <strong className="text-xs text-[color:var(--crm-text-primary)] mt-0.5 block">{currentSupplier.contactPerson}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)]">
            <span className="text-[10px] text-[color:var(--crm-text-secondary)] uppercase font-semibold block">Official Email</span>
            <span className="text-xs text-[color:var(--crm-brand-700)] font-mono font-medium mt-0.5 block truncate">{currentSupplier.email}</span>
          </div>
          <div className="p-3 rounded-xl bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)]">
            <span className="text-[10px] text-[color:var(--crm-text-secondary)] uppercase font-semibold block">Mobile Number</span>
            <span className="text-xs text-[color:var(--crm-text-primary)] font-mono mt-0.5 block">{currentSupplier.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
