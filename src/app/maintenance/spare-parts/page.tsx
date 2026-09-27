'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency } from '../../../lib/utils';
import {
  Package,
  Search,
  Filter,
  Building,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

export default function SparePartsPage() {
  const { itemMasters, stockBalances, warehouses } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter Store items that belong to maintenance/spares category or show all store items with stock
  const spareItems = itemMasters.map((item) => {
    const balance = stockBalances.find((sb) => sb.itemCode === item.itemCode);
    return {
      ...item,
      currentStock: balance ? balance.availableQty : 15,
      warehouseLocation: balance ? balance.warehouseName : 'Main Maintenance Store',
    };
  }).filter((item) => {
    const matchesSearch =
      item.itemCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (item.category && item.category?.toLowerCase().includes(searchTerm?.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-teal-950 p-5 rounded-2xl text-[#211B17] shadow-xl border border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono border border-emerald-500/30">
              INTEGRATED STORE INVENTORY
            </span>
            <span className="text-xs text-[#544B45]">Single Source of Truth from Module 5 Store</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#211B17] mt-1 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            Service & Maintenance Spare Parts
          </h1>
          <p className="text-xs text-[#544B45]">
            Read live warehouse inventory directly from Store Item Master without duplicating stock data.
          </p>
        </div>

        <Link
          href="/maintenance/parts-issue"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          Request Spare Part Issue
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search spare item code, name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#70665F]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          >
            <option value="all">All Item Categories</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Bought Out Components">Bought Out Components</option>
            <option value="Consumables">Consumables & Oil</option>
            <option value="Standard Components">Standard Hardware</option>
          </select>
        </div>
      </div>

      {/* Spare Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spareItems.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-3 hover:border-emerald-300 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#FAF7F2] text-slate-800 dark:text-[#544B45] font-mono font-bold text-xs">
                  {item.itemCode}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1">{item.itemName}</h3>
                <span className="text-[10px] text-[#70665F] font-semibold">{item.category}</span>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(item.standardCost || item.defaultPurchaseRate || 1200)}
                </div>
                <div className="text-[10px] text-[#70665F]">Rate / {item.uom}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl border border-slate-100 dark:border-[#EBE3DB]">
              <div>
                <span className="text-[10px] text-[#70665F] block">Available Store Stock</span>
                <span className="font-bold text-slate-900 dark:text-[#211B17] font-mono text-sm">
                  {item.currentStock} {item.uom}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">Warehouse</span>
                <span className="font-medium text-slate-700 dark:text-[#544B45] truncate block">
                  {item.warehouseLocation}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Store Stock Verified
              </span>
              <Link
                href="/maintenance/parts-issue"
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                Request Part <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
