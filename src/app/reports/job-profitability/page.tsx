'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Calculator, Download, Printer, Search, TrendingUp, DollarSign, Filter, CheckCircle2 } from 'lucide-react';

export default function JobProfitabilityReportPage() {
  const { jobProfitabilityList } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = jobProfitabilityList.filter(
    (j) =>
      j.jobNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      j.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      j.machineModel?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const totalSales = filtered.reduce((sum, j) => sum + j.salesValue, 0);
  const totalCost = filtered.reduce((sum, j) => sum + j.totalCost, 0);
  const totalProfit = filtered.reduce((sum, j) => sum + j.grossProfit, 0);
  const avgMargin = (totalProfit / totalSales) * 100;

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#544B45] font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Job Costing & Profitability Analysis Report</h1>
              <p className="text-xs text-[#70665F] font-medium mt-0.5">
                Consolidated Job-by-Job Costing Matrix • Revenue vs Material, Labour, Machine & Subcontract Costs
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FAF7F2] hover:bg-[#FAF7F2] text-[#211B17] font-semibold text-xs rounded-xl border border-[#EBE3DB] transition">
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Total Billed Revenue</span>
          <div className="text-xl font-bold text-emerald-400">₹{totalSales?.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Total Absorbed Actual Cost</span>
          <div className="text-xl font-bold text-rose-400">₹{totalCost?.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Total Gross Profit</span>
          <div className="text-xl font-bold text-teal-400">₹{totalProfit?.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Average Gross Margin %</span>
          <div className="text-xl font-bold text-crm-brand-500">{avgMargin.toFixed(1)}%</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between p-4 bg-white border border-[#EBE3DB] rounded-xl">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Job #, Customer, Machine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#544B45] outline-none focus:border-teal-500"
          />
        </div>
        <span className="text-xs text-[#70665F] font-mono">
          Showing <strong className="text-[#211B17]">{filtered.length}</strong> Jobs
        </span>
      </div>

      {/* Job Profitability Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Job Number</th>
                <th className="py-3.5 px-4">Customer & Product</th>
                <th className="py-3.5 px-4 text-right">Sales Value</th>
                <th className="py-3.5 px-4 text-right">Material Cost</th>
                <th className="py-3.5 px-4 text-right">Labour & Machine</th>
                <th className="py-3.5 px-4 text-right">Total Cost</th>
                <th className="py-3.5 px-4 text-right text-teal-400">Gross Profit</th>
                <th className="py-3.5 px-4 text-right text-crm-brand-500">Margin %</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] font-mono">
              {filtered.map((j) => (
                <tr key={j.jobNumber} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="py-3.5 px-4 font-bold text-crm-brand-500">{j.jobNumber}</td>
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-[#211B17]">{j.customerName}</div>
                    <div className="text-[10px] text-[#70665F]">{j.machineModel}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-400">₹{j.salesValue?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right text-[#544B45]">₹{j.materialCost?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right text-[#544B45]">₹{(j.labourCost + j.machineCost)?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right text-rose-400 font-bold">₹{j.totalCost?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-teal-400">₹{j.grossProfit?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-crm-brand-500">{j.marginPercent}%</td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#FAF7F2] text-[#544B45] font-semibold border border-[#EBE3DB]">
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
