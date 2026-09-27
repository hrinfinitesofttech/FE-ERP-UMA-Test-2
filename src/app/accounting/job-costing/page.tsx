'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DollarSign, Search, Briefcase, TrendingUp, CheckCircle2, FileSpreadsheet } from 'lucide-react';

export default function JobCostingPage() {
  const { jobCostings } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = jobCostings.filter((j) => {
    const jobNum = j.jobNumber || '';
    const custName = j.customerName || '';
    const model = j.machineModel || j.productName || '';
    return (
      jobNum?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      custName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      model?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  });

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Job-wise Financial Profitability Costing (MTO)</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Job 360° Cost Center • Material, Subcontracting, Direct Labour & Net Margin</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-[#70665F]">Average Net Margin</div>
          <div className="text-lg font-bold text-emerald-400 font-mono">25.8%</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search job number, customer, machine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((job) => {
          const salesVal = job.salesValue ?? job.salesOrderValue ?? 0;
          const actCost = job.actualCost ?? job.totalActualCost ?? 0;
          const netProf = job.profit ?? job.netProfit ?? 0;
          const marginPct = job.marginPercent ?? job.profitMarginPercent ?? 0;
          const matCost = job.materialCost ?? job.materialIssuedCost ?? 0;
          const labCost = job.labourCost ?? 0;
          const subCost = job.subcontractCost ?? job.transportInstallationCost ?? 0;
          const ovhCost = job.overheadCost ?? job.productionOverheads ?? 0;

          return (
            <div key={job.jobNumber} className="bg-white p-5 rounded-2xl border border-[#EBE3DB] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EBE3DB] pb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-mono font-bold text-emerald-400">{job.jobNumber}</span>
                    <span className="text-sm font-bold text-[#211B17]">{job.customerName || 'Direct Customer'}</span>
                  </div>
                  <div className="text-xs text-[#70665F] mt-0.5">{job.machineModel || job.productName}</div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#70665F] font-sans">Contract Price:</span>
                    <span className="text-[#211B17] font-bold ml-1">₹{salesVal?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] font-sans">Actual Cost:</span>
                    <span className="text-amber-400 font-bold ml-1">₹{actCost?.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span>
                      Net Profit: ₹{netProf?.toLocaleString()} ({marginPct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Component Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                  <div className="text-[#70665F] text-[10px] uppercase font-sans font-semibold">Material Cost (BOM + Store)</div>
                  <div className="text-sm font-bold text-crm-brand-500 mt-1">₹{matCost?.toLocaleString()}</div>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                  <div className="text-[#70665F] text-[10px] uppercase font-sans font-semibold">Direct Labour Cost</div>
                  <div className="text-sm font-bold text-crm-brand-500 mt-1">₹{labCost?.toLocaleString()}</div>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                  <div className="text-[#70665F] text-[10px] uppercase font-sans font-semibold">Subcontracting Charges</div>
                  <div className="text-sm font-bold text-amber-400 mt-1">₹{subCost?.toLocaleString()}</div>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                  <div className="text-[#70665F] text-[10px] uppercase font-sans font-semibold">Power & Machine Overhead</div>
                  <div className="text-sm font-bold text-crm-brand-500 mt-1">₹{ovhCost?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
