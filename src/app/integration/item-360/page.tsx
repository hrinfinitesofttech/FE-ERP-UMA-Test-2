'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { Box, Building, Plus, Search, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { EmptyState, LoadingState } from '../../../components/common/StateDisplay';

export default function Item360Page() {
  const { item360List = [], itemMasters = [], stockBalances = [], suppliers = [], isInitialLoading } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  // Combined Items Directory
  const allItems = useMemo(() => {
    const map = new Map<string, {
      id: string;
      code: string;
      name: string;
      category: string;
      uom: string;
      stock: number;
      reserved: number;
      available: number;
      unitCost: number;
      valuation: number;
      warehouse: string;
      supplier: string;
      reorderLevel: number;
    }>();

    // 1. From item360List
    item360List.forEach((it) => {
      const key = it.itemId || it.itemCode;
      if (key) {
        map.set(key, {
          id: it.itemId || key,
          code: it.itemCode,
          name: it.itemName,
          category: it.category,
          uom: it.uom,
          stock: it.currentStock,
          reserved: it.reservedStock,
          available: it.availableStock,
          unitCost: it.unitCost,
          valuation: it.totalValuation,
          warehouse: it.primaryWarehouse,
          supplier: it.primarySupplier,
          reorderLevel: it.reorderLevel,
        });
      }
    });

    // 2. Supplement from live itemMasters
    itemMasters.forEach((im) => {
      const key = im.id || im.itemCode;
      if (!map.has(key) && !map.has(im.itemCode)) {
        const matchingStock = stockBalances.find((s) => s.itemId === im.id || s.itemCode === im.itemCode);
        const currentStock = matchingStock ? Number(matchingStock.availableQuantity || matchingStock.currentStock || 0) : Number(im.currentStock || 0);
        const unitCost = Number(im.standardCost ?? (im as any).defaultPurchaseRate ?? 0);
        const matchingSupplier = suppliers.find((s) => s.id === (im as any).primarySupplierId);

        map.set(key, {
          id: im.id || key,
          code: im.itemCode,
          name: im.itemName,
          category: im.categoryName || im.category || 'Raw Material',
          uom: im.uomName || im.uom || 'Nos',
          stock: currentStock,
          reserved: matchingStock ? Number(matchingStock.allocatedQuantity || 0) : 0,
          available: currentStock,
          unitCost,
          valuation: currentStock * unitCost,
          warehouse: (im as any).defaultWarehouse || 'Main Warehouse',
          supplier: matchingSupplier?.supplierName || 'Approved Industrial Vendor',
          reorderLevel: Number(im.reorderLevel || 10),
        });
      }
    });

    return Array.from(map.values());
  }, [item360List, itemMasters, stockBalances, suppliers]);

  // Set default selected item once loaded
  const currentItem = useMemo(() => {
    if (!allItems || allItems.length === 0) return null;
    if (selectedItemId) {
      const match = allItems.find((i) => i.id === selectedItemId || i.code === selectedItemId);
      if (match) return match;
    }
    return allItems[0];
  }, [allItems, selectedItemId]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const q = searchQuery.toLowerCase();
    return allItems.filter(
      (i) => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }, [allItems, searchQuery]);

  if (isInitialLoading && allItems.length === 0) {
    return <LoadingState message="Loading Item 360° Records..." timeoutSeconds={15} />;
  }

  if (!currentItem) {
    return (
      <EmptyState
        title="No Items Available"
        message="No items found in inventory master. Create an item to view its 360° stock and procurement profile."
        actionLabel="Add Item"
        actionHref="/store/items"
        icon={Box}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-[#FAF7F2] text-[#544B45] font-sans pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center flex-shrink-0">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#211B17] tracking-tight">{currentItem.name}</h1>
            <p className="text-xs text-[#70665F] font-medium mt-0.5">
              Item Code: <span className="text-[#75401F] font-bold font-mono">{currentItem.code}</span> • Category: {currentItem.category}
            </p>
          </div>
        </div>

        {/* Item Selector Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <select
              value={currentItem.id}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-[#FAF7F2] hover:bg-white text-xs text-[#211B17] font-bold px-3 py-2.5 rounded-xl border border-[#D5CAC0] focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer min-h-[40px]"
            >
              {allItems.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.code} — {i.name}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/store/items"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D5CAC0] text-[#4A3B32] text-xs font-bold transition shadow-2xs min-h-[40px] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Items</span>
          </Link>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E7DED5] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-mono text-[#70665F] block font-semibold">Total Stock</span>
          <div className="text-xl font-bold font-mono text-[#211B17]">
            {currentItem.stock?.toLocaleString()} {currentItem.uom}
          </div>
          <span className="text-[10px] text-[#8C7A6F] block">On-hand in warehouse</span>
        </div>

        <div className="p-4 bg-white border border-[#E7DED5] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-mono text-[#70665F] block font-semibold">Allocated / Reserved</span>
          <div className="text-xl font-bold font-mono text-amber-700">
            {currentItem.reserved?.toLocaleString()} {currentItem.uom}
          </div>
          <span className="text-[10px] text-amber-700 block">Committed to active jobs</span>
        </div>

        <div className="p-4 bg-white border border-[#E7DED5] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-mono text-[#70665F] block font-semibold">Free Available</span>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {currentItem.available?.toLocaleString()} {currentItem.uom}
          </div>
          <span className="text-[10px] text-emerald-700 block">Available for issue</span>
        </div>

        <div className="p-4 bg-white border border-[#E7DED5] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-mono text-[#70665F] block font-semibold">Inventory Valuation</span>
          <div className="text-xl font-bold font-mono text-[#75401F]">
            ₹ {currentItem.valuation > 0 ? currentItem.valuation.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-[10px] text-[#8C7A6F] block">At standard valuation</span>
        </div>
      </div>

      {/* Storage & Supplier Profile */}
      <div className="p-5 sm:p-6 bg-white border border-[#E7DED5] rounded-2xl shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2 pb-3 border-b border-[#F2ECE4]">
          <Building className="w-4 h-4 text-[#75401F]" />
          <span>Storage Location &amp; Supplier Mapping</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB]">
            <span className="text-[10px] text-[#70665F] uppercase font-semibold block">Primary Warehouse</span>
            <strong className="text-xs text-[#211B17] mt-0.5 block">{currentItem.warehouse}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB]">
            <span className="text-[10px] text-[#70665F] uppercase font-semibold block">Default Supplier</span>
            <strong className="text-xs text-[#211B17] mt-0.5 block truncate" title={currentItem.supplier}>{currentItem.supplier}</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB]">
            <span className="text-[10px] text-[#70665F] uppercase font-semibold block">Standard Purchase Rate</span>
            <strong className="text-xs text-emerald-700 font-mono mt-0.5 block">
              {currentItem.unitCost > 0 ? `₹ ${currentItem.unitCost.toLocaleString('en-IN')} / ${currentItem.uom}` : '—'}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB]">
            <span className="text-[10px] text-[#70665F] uppercase font-semibold block">Reorder Threshold</span>
            <strong className="text-xs text-amber-800 font-mono mt-0.5 block">
              {currentItem.reorderLevel} {currentItem.uom}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
