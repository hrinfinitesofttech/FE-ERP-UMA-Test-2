'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import {
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Building,
  Plus,
  ArrowRightLeft,
  DollarSign,
  Box,
} from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

interface StockRow {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  allocatedStock: number;
  availableStock: number;
  uom: string;
  reorderLevel: number;
  standardCost: number;
  totalValuation: number;
  warehouseLocation: string;
  binLocation: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export default function StockMatrixPage() {
  const { stockBalances = [], itemMasters = [], isInitialLoading } = useERP();

  const stockRows: StockRow[] = useMemo(() => {
    // If stockBalances array exists, use it
    if (stockBalances.length > 0) {
      return stockBalances.map((s: any, idx: number) => {
        const itemMaster = itemMasters.find(
          (it) => it.id === s.itemId || it.itemCode === s.itemCode
        );
        const current = Number(s.currentStock ?? s.quantity ?? s.availableStock ?? 0);
        const allocated = Number(s.allocatedStock ?? s.reservedStock ?? 0);
        const available = Math.max(0, current - allocated);
        const reorder = Number(s.reorderLevel ?? itemMaster?.reorderLevel ?? 10);
        const cost = Number(s.standardCost ?? itemMaster?.standardCost ?? itemMaster?.defaultPurchaseRate ?? 0);
        const valuation = Number(s.totalValuation ?? (current * cost));

        let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
        if (available <= 0) status = 'Out of Stock';
        else if (available <= reorder) status = 'Low Stock';

        return {
          id: String(s.id || s.itemId || s.itemCode || idx + 1),
          itemCode: s.itemCode || itemMaster?.itemCode || `ITEM-${idx + 1}`,
          itemName: s.itemName || itemMaster?.itemName || 'Material Item',
          category: s.category || itemMaster?.category || 'Raw Material',
          currentStock: current,
          allocatedStock: allocated,
          availableStock: available,
          uom: s.uom || itemMaster?.uom || 'Nos',
          reorderLevel: reorder,
          standardCost: cost,
          totalValuation: valuation,
          warehouseLocation: s.warehouseLocation || (itemMaster as any)?.warehouseLocation || itemMaster?.defaultWarehouseId || 'Main Plant Store',
          binLocation: s.binLocation || (itemMaster as any)?.binLocation || itemMaster?.defaultLocationBin || 'BIN-A1',
          status,
        };
      });
    }

    // Otherwise derive stock rows from itemMasters
    return (itemMasters || []).map((it, idx) => {
      const current = Number(it.currentStock ?? 0);
      const allocated = Number((it as any).allocatedStock ?? (it as any).reservedStock ?? 0);
      const available = Math.max(0, current - allocated);
      const reorder = Number(it.reorderLevel ?? 10);
      const cost = Number(it.standardCost ?? it.defaultPurchaseRate ?? 0);
      const valuation = current * cost;

      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (available <= 0) status = 'Out of Stock';
      else if (available <= reorder) status = 'Low Stock';

      return {
        id: String(it.id || idx + 1),
        itemCode: it.itemCode || `ITEM-${idx + 1}`,
        itemName: it.itemName || 'Material Item',
        category: it.category || 'Raw Material',
        currentStock: current,
        allocatedStock: allocated,
        availableStock: available,
        uom: it.uom || 'Nos',
        reorderLevel: reorder,
        standardCost: cost,
        totalValuation: valuation,
        warehouseLocation: (it as any).warehouseLocation || it.defaultWarehouseId || 'Main Plant Store',
        binLocation: (it as any).binLocation || it.defaultLocationBin || 'BIN-A1',
        status,
      };
    });
  }, [stockBalances, itemMasters]);

  const columns: ERPColumn<StockRow>[] = useMemo(
    () => [
      {
        key: 'itemCode',
        header: 'Item Code',
        isCodeLink: true,
        cell: (row) => (
          <Link
            href={`/store/items/${row.id}`}
            className="font-mono font-bold text-xs text-[#18417D] hover:underline"
          >
            {row.itemCode}
          </Link>
        ),
      },
      {
        key: 'itemName',
        header: 'Material / Description',
        cell: (row) => (
          <div className="space-y-0.5">
            <div className="font-bold text-xs text-[#211B17]">{row.itemName}</div>
            <span className="text-[10px] text-slate-500 uppercase font-mono px-1.5 py-0.5 bg-slate-100 rounded">
              {row.category}
            </span>
          </div>
        ),
      },
      {
        key: 'availableStock',
        header: 'Available Stock',
        cell: (row) => (
          <div className="font-mono text-xs">
            <span className="font-bold text-slate-900">{row.availableStock.toLocaleString()}</span>{' '}
            <span className="text-slate-500 text-[10px]">{row.uom}</span>
          </div>
        ),
      },
      {
        key: 'currentStock',
        header: 'Total / Allocated',
        cell: (row) => (
          <div className="text-xs space-y-0.5 font-mono">
            <div className="text-slate-700">Total: {row.currentStock} {row.uom}</div>
            {row.allocatedStock > 0 && (
              <div className="text-[10px] text-amber-700">Allocated: {row.allocatedStock} {row.uom}</div>
            )}
          </div>
        ),
      },
      {
        key: 'reorderLevel',
        header: 'Safety Stock',
        cell: (row) => (
          <div className="font-mono text-xs text-slate-600">
            {row.reorderLevel} {row.uom}
          </div>
        ),
      },
      {
        key: 'warehouseLocation',
        header: 'Warehouse & BIN',
        cell: (row) => (
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{row.warehouseLocation}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">BIN: {row.binLocation}</div>
          </div>
        ),
      },
      {
        key: 'totalValuation',
        header: 'Inventory Value',
        cell: (row) => (
          <div className="font-mono text-xs space-y-0.5">
            <div className="font-bold text-[#211B17]">{formatCurrency(row.totalValuation)}</div>
            <div className="text-[10px] text-slate-400">@ {formatCurrency(row.standardCost)}/{row.uom}</div>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Stock Status',
        cell: (row) => {
          let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          let IconComp = CheckCircle2;
          if (row.status === 'Out of Stock') {
            badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
            IconComp = AlertTriangle;
          } else if (row.status === 'Low Stock') {
            badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
            IconComp = AlertTriangle;
          }
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
              <IconComp className="w-3 h-3" />
              <span>{row.status}</span>
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <ERPListPageLayout<StockRow>
        breadcrumbs={['STORE', 'INVENTORY', 'STOCK MATRIX']}
        title="Live Inventory Stock Matrix"
        data={stockRows}
        columns={columns}
        isLoading={isInitialLoading}
        searchPlaceholder="Search inventory by Item Code, Description, Category, BIN..."
        addNewHref="/store/items/new"
        addNewLabel="Add Item"
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <Link
              href="/store/material-issue"
              className="px-3.5 py-2 min-h-[40px] bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Material Issue</span>
            </Link>
            <Link
              href="/store/grn"
              className="px-3.5 py-2 min-h-[40px] bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Box className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Inward GRN</span>
            </Link>
          </div>
        }
      />
    </div>
  );
}
