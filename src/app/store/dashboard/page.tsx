'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import {
  Package,
  Building,
  MapPin,
  Clock,
  Truck,
  Lock,
  Box,
  AlertTriangle,
  RotateCcw,
  Trash2,
  TrendingUp,
  CheckCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';

export default function StoreDashboardPage() {
  const {
    itemMasters,
    warehouses,
    warehouseLocations,
    goodsReceipts,
    materialIssues,
    stockBalances,
    stockReservations,
    stockAdjustments,
    scrapEntries,
  } = useERP();

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');

  // Calculations for KPIs
  const totalItems = itemMasters?.length || 0;
  const totalStockValue = (stockBalances || []).reduce((acc, s) => acc + (s.stockValue || 0), 0);
  const totalWarehousesCount = warehouses?.length || 0;
  const totalBinsCount = warehouseLocations?.length || 0;
  const pendingQCGRNCount = (goodsReceipts || []).filter((g) => g.status === 'Inspection Pending' || g.status === 'Received').length;
  const todayIssuesCount = materialIssues?.length || 0;

  const reservedStockValue = (stockReservations || []).reduce((acc, r) => {
    const item = itemMasters.find((i) => i.id === r.itemId);
    return acc + (r.reservedQuantity || 0) * (item?.standardCost || 0);
  }, 0);

  const usableStockValue = Math.max(0, totalStockValue - reservedStockValue);
  const lowStockItemsCount = (itemMasters || []).filter((i) => {
    const bal = (stockBalances || []).find((s) => s.itemId === i.id);
    return (bal?.usableQty || 0) <= (i.reorderLevel || 0);
  }).length;

  const monthAdjustmentsValue = (stockAdjustments || []).reduce((acc, a) => acc + Math.abs(a.adjustmentValue || 0), 0);
  const scrapValueTotal = (scrapEntries || []).reduce((acc, s) => acc + (s.estimatedValue || 0), 0);
  const stockAccuracyRate = totalItems > 0 ? 100 : 0;

  // Recharts Chart Data
  const warehouseValuationData = (warehouses || []).map((w) => {
    const whBalances = (stockBalances || []).filter((s) => s.warehouseId === w.id);
    const value = whBalances.reduce((acc, s) => acc + (s.stockValue || 0), 0);
    return { name: w.warehouseCode || w.id, fullName: w.warehouseName || w.id, valuation: value / 100000 };
  });

  const categoryDistributionData: { name: string; value: number; color: string }[] = [];
  const dailyMovementData: { day: string; grnInward: number; materialIssued: number }[] = [];
  const fastMovingData: { name: string; turns: number; stockQty: number }[] = [];
  const jobReservationData: { job: string; reservedVal: number; consumedVal: number }[] = [];
  const scrapBreakdownData: { name: string; value: number; color: string }[] = [];
  const valuationTrendData: { month: string; totalValue: number }[] = [];

  return (
    <div className="space-y-5 text-xs pb-12 text-[#211B17]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-semibold">
              MODULE 5
            </span>
            <h1 className="text-2xl font-bold font-mono text-[#211B17] tracking-tight">Store & Warehouse Dashboard</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Real-time physical inventory source of truth, GRN inward, usable stock matrix, job reservations, and store ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-white text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Warehouses (5 Yards)</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.warehouseName}
              </option>
            ))}
          </select>

          <Link
            href="/store/grn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-bold shadow-lg shadow-sky-600/30 hover:brightness-110 transition"
          >
            <Plus className="w-4 h-4" />
            New GRN
          </Link>

          <Link
            href="/store/material-issue"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 hover:brightness-110 transition"
          >
            <Truck className="w-4 h-4" />
            Issue Material
          </Link>
        </div>
      </div>

      {/* 12 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Card 1 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Total Items</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5">{totalItems}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Master catalog items</div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Total Stock Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 mt-1.5">
            ₹{(totalStockValue / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-[#8D827A] mt-1">Physical stock valuation</div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Warehouses</span>
            <Building className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5">{totalWarehousesCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Active storage yards</div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Active Bins</span>
            <MapPin className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5">{totalBinsCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Rack & shelf locations</div>
        </div>

        {/* Card 5 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Pending QC GRNs</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400 mt-1.5">{pendingQCGRNCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Awaiting inspection</div>
        </div>

        {/* Card 6 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Issues Today</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5">{todayIssuesCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Material issue slips</div>
        </div>

        {/* Card 7 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Reserved Stock</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400 mt-1.5">
            ₹{(reservedStockValue / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-[#8D827A] mt-1">Locked for active jobs</div>
        </div>

        {/* Card 8 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Usable Stock</span>
            <Box className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-black text-sky-400 mt-1.5">
            ₹{(usableStockValue / 100000).toFixed(2)} L
          </div>
          <div className="text-[10px] text-[#8D827A] mt-1">Unreserved & ready</div>
        </div>

        {/* Card 9 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-black text-red-400 mt-1.5">{lowStockItemsCount}</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Below reorder level</div>
        </div>

        {/* Card 10 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Adjustments</span>
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5">
            ₹{(monthAdjustmentsValue / 1000).toFixed(1)} K
          </div>
          <div className="text-[10px] text-[#8D827A] mt-1">Month variance value</div>
        </div>

        {/* Card 11 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Scrap Value</span>
            <Trash2 className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-xl font-black text-yellow-400 mt-1.5">
            ₹{(scrapValueTotal / 1000).toFixed(1)} K
          </div>
          <div className="text-[10px] text-[#8D827A] mt-1">Offcuts & rejections</div>
        </div>

        {/* Card 12 */}
        <div className="bg-slate-900/90 border border-[#E7DED5] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#70665F] text-xs">
            <span>Stock Accuracy</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 mt-1.5">{stockAccuracyRate}%</div>
          <div className="text-[10px] text-[#8D827A] mt-1">Audit reconciliation</div>
        </div>
      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Warehouse Stock Valuation */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-[#E7DED5] shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Warehouse Stock Valuation (₹ Lakhs)
            </h3>
            <span className="text-[10px] text-[#70665F]">Yard Distribution</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseValuationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="valuation" fill="#6366f1" radius={[6, 6, 0, 0]} name="Stock Value (₹ Lakhs)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-[#E7DED5] shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Box className="w-4 h-4 text-sky-400" />
              Category Inventory Distribution (₹ Lakhs)
            </h3>
            <span className="text-[10px] text-[#70665F]">By Value Share</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Daily Inward vs Issue Movement */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-[#E7DED5] shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              Daily GRN Inward vs Production Material Issue (₹ Lakhs)
            </h3>
            <span className="text-[10px] text-[#70665F]">7-Day Trend</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyMovementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="grnInward" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="GRN Inward" />
                <Area type="monotone" dataKey="materialIssued" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Material Issued" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Fast-Moving Materials */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-[#E7DED5] shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Fast-Moving Materials Velocity (Turnover Ratio)
            </h3>
            <span className="text-[10px] text-[#70665F]">Annual Turnover Rate</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fastMovingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="turns" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Inventory Turnover Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Job-wise Reservation vs Consumption */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-[#E7DED5] shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              Job-wise Stock Reservation vs Actual Consumption (₹ Lakhs)
            </h3>
            <span className="text-[10px] text-[#70665F]">Job Locking</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobReservationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="job" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="reservedVal" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Reserved Stock Value" />
                <Bar dataKey="consumedVal" fill="#10b981" radius={[6, 6, 0, 0]} name="Issued Consumption" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Valuation Trend */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-[#E7DED5] shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-400" />
              Monthly Total Stock Valuation Trend (₹ Lakhs)
            </h3>
            <span className="text-[10px] text-[#70665F]">5-Month Trend</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={valuationTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="totalValue" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} name="Total Stock Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Access Matrix Links */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-[#E7DED5] shadow-md">
        <h3 className="text-sm font-bold text-[#211B17] mb-3">Store Quick Operations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link
            href="/store/items"
            className="p-3 bg-white/60 rounded-xl border border-slate-700/50 hover:bg-white hover:border-sky-500/50 transition flex flex-col items-center text-center group"
          >
            <Package className="w-5 h-5 text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Item Master</span>
            <span className="text-[10px] text-[#70665F] mt-0.5">Catalog & Rates</span>
          </Link>

          <Link
            href="/store/stock"
            className="p-3 bg-white/60 rounded-xl border border-slate-700/50 hover:bg-white hover:border-sky-500/50 transition flex flex-col items-center text-center group"
          >
            <Box className="w-5 h-5 text-sky-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Stock Matrix</span>
            <span className="text-[10px] text-[#70665F] mt-0.5">Usable Quantities</span>
          </Link>

          <Link
            href="/store/reservations"
            className="p-3 bg-white/60 rounded-xl border border-slate-700/50 hover:bg-white hover:border-sky-500/50 transition flex flex-col items-center text-center group"
          >
            <Lock className="w-5 h-5 text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Stock Reservation</span>
            <span className="text-[10px] text-[#70665F] mt-0.5">Job-wise Locking</span>
          </Link>

          <Link
            href="/store/ledger"
            className="p-3 bg-white/60 rounded-xl border border-slate-700/50 hover:bg-white hover:border-sky-500/50 transition flex flex-col items-center text-center group"
          >
            <RotateCcw className="w-5 h-5 text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Stock Ledger</span>
            <span className="text-[10px] text-[#70665F] mt-0.5">Audit History</span>
          </Link>

          <Link
            href="/store/reorder"
            className="p-3 bg-white/60 rounded-xl border border-slate-700/50 hover:bg-white hover:border-sky-500/50 transition flex flex-col items-center text-center group"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Low Stock Reorder</span>
            <span className="text-[10px] text-[#70665F] mt-0.5">1-Click PR</span>
          </Link>

          <Link
            href="/store/reports"
            className="p-3 bg-white/60 rounded-xl border border-slate-700/50 hover:bg-white hover:border-sky-500/50 transition flex flex-col items-center text-center group"
          >
            <FileSpreadsheet className="w-5 h-5 text-teal-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Store Reports</span>
            <span className="text-[10px] text-[#70665F] mt-0.5">21 Export Formats</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
