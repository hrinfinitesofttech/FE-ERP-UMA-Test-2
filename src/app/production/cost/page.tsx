'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DollarSign, TrendingUp, TrendingDown, Layers, Wrench, ShieldCheck, Search } from 'lucide-react';

export default function JobProductionCostingPage() {
  const { productionCosts, openJobModal } = useERP();

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Job Production Costing & Variance Analysis
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                Material + Labour + Machine Costing
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Formula: Cost Variance = Total Actual Cost - Total Estimated Cost (Live Cost Tracking)
            </p>
          </div>
        </div>
      </div>

      {/* Cost Summaries Cards */}
      <div className="space-y-6">
        {productionCosts.map((cost) => {
          const isUnderBudget = cost.costVariance <= 0;

          return (
            <div key={cost.jobNumber} className="p-6 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#EBE3DB] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sky-400 text-lg">{cost.jobNumber}</span>
                    <span className="text-sm font-bold text-[#211B17]">— {cost.productName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-[#70665F] block uppercase">Cost Variance</span>
                    <span
                      className={`text-base font-extrabold font-mono ${
                        isUnderBudget ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUnderBudget ? '' : '+'}₹{cost.costVariance?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => openJobModal(cost.jobNumber)}
                    className="px-3 py-1.5 rounded-xl bg-crm-brand-700/20 text-crm-brand- font-bold border border-crm-brand-600/30 text-xs hover:bg-crm-brand-700/30 transition flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" /> 360° Trace
                  </button>
                </div>
              </div>

              {/* Detailed Cost Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EBE3DB]">
                  <span className="text-[#70665F] block text-[10px] uppercase">BOM Estimated Cost</span>
                  <span className="font-mono font-bold text-[#544B45]">₹{cost.bomEstimatedCost?.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EBE3DB]">
                  <span className="text-[#70665F] block text-[10px] uppercase">Net Material Cost</span>
                  <span className="font-mono font-bold text-emerald-400">₹{cost.netMaterialCost?.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EBE3DB]">
                  <span className="text-[#70665F] block text-[10px] uppercase">Labour Cost ({cost.actualLabourHours} hrs)</span>
                  <span className="font-mono font-bold text-crm-brand-">₹{cost.labourCost?.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EBE3DB]">
                  <span className="text-[#70665F] block text-[10px] uppercase">Machine Cost ({cost.actualMachineHours} hrs)</span>
                  <span className="font-mono font-bold text-amber-300">₹{cost.machineCost?.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EBE3DB]">
                  <span className="text-[#70665F] block text-[10px] uppercase">Subcontracting</span>
                  <span className="font-mono font-bold text-sky-300">₹{cost.subcontractingCost?.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EBE3DB]">
                  <span className="text-[#70665F] block text-[10px] uppercase">Rework + Scrap</span>
                  <span className="font-mono font-bold text-rose-400">
                    ₹{(cost.reworkCost + cost.scrapCost)?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] bg-gradient-to-br from-slate-900 to-slate-800">
                  <span className="text-[#70665F] block text-[10px] uppercase font-bold">Total Actual Cost</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    ₹{cost.totalActualCost?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
