'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { BarChart3, Download, FileSpreadsheet, FileText, Search, Filter, Printer } from 'lucide-react';

export default function ProductionReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const reportsList = [
    { id: 'R-01', title: 'Work Order Master Register', cat: 'Work Orders', format: 'Excel / CSV / PDF', desc: 'Complete log of all shop floor Work Orders with statuses, design/BOM revs and priority.' },
    { id: 'R-02', title: 'Daily Production Log Register', cat: 'Production Entry', format: 'Excel / CSV / PDF', desc: 'Day-wise good qty, rejected qty, scrap and operator shift outputs.' },
    { id: 'R-03', title: 'Work Center Capacity & Utilization', cat: 'Work Centers', format: 'Excel / CSV / PDF', desc: 'Shop floor bay hours, daily capacity vs actual machine run hours.' },
    { id: 'R-04', title: 'Overall Equipment Effectiveness (OEE)', cat: 'Performance', format: 'Excel / CSV / PDF', desc: 'OEE % metrics breakdown across CNC, Laser, SAW Welding & Lathe machines.' },
    { id: 'R-05', title: 'Shop Floor Downtime Analysis Log', cat: 'Downtime', format: 'Excel / CSV / PDF', desc: 'Downtime reasons, lost machine minutes & maintenance impact.' },
    { id: 'R-06', title: 'Material Issue Summary for Production', cat: 'Store-Prod', format: 'Excel / CSV / PDF', desc: 'Job-wise raw material issue slips and store withdrawal costs.' },
    { id: 'R-07', title: 'WIP Stage & Aging Report', cat: 'WIP', format: 'Excel / CSV / PDF', desc: 'Active Work in Progress assemblies, delay days and current bay locations.' },
    { id: 'R-08', title: 'Production Scrap & Metal Skeleton Recovery', cat: 'Scrap', format: 'Excel / CSV / PDF', desc: 'Nested CNC offcut plate scrap, weight in Kg and recovery rupee valuation.' },
    { id: 'R-09', title: 'Rework Order Cost & Defect Log', cat: 'Rework', format: 'Excel / CSV / PDF', desc: 'Welding porosity, dimension errors, rework hours and corrective action logs.' },
    { id: 'R-10', title: 'Job Production Costing & Variance Report', cat: 'Costing', format: 'Excel / CSV / PDF', desc: 'Estimated vs Actual Material, Labour, Machine and Subcontracting costs.' },
    { id: 'R-11', title: 'Finished Goods Inventory Register', cat: 'Finished Goods', format: 'Excel / CSV / PDF', desc: 'Completed chemical reactor vessels, dryers & storage tanks stored in FG warehouse.' },
    { id: 'R-12', title: 'MRP Material Shortage & PR Summary', cat: 'MRP', format: 'Excel / CSV / PDF', desc: 'Calculated net material requirement shortages and auto-triggered PR status.' },
    { id: 'R-13', title: 'Machine Breakdown & Preventative Maintenance', cat: 'Maintenance', format: 'Excel / CSV / PDF', desc: 'Breakdown frequency, MTBF, MTTR and spare part replacements.' },
    { id: 'R-14', title: 'Operator Efficiency & Production Output', cat: 'Manpower', format: 'Excel / CSV / PDF', desc: 'Individual technician performance, shift good output vs scrap ratios.' },
    { id: 'R-15', title: 'NDT & QC Clearance Register', cat: 'Quality', format: 'Excel / CSV / PDF', desc: 'Radiography, Dye-Penetrant, Hydro Test and QC inspector sign-offs.' },
    { id: 'R-16', title: 'Shift Production Summary Report', cat: 'Shift Log', format: 'Excel / CSV / PDF', desc: 'Shift 1 & Shift 2 production output comparison and target achievement.' },
    { id: 'R-17', title: 'Work Center Bottleneck Analysis', cat: 'Planning', format: 'Excel / CSV / PDF', desc: 'Identifies shop floor constraint bays and queue times.' },
    { id: 'R-18', title: 'Monthly Production Executive Summary', cat: 'Executive', format: 'Excel / CSV / PDF', desc: 'High-level executive report on total machine tonnage produced and cost performance.' },
  ];

  const filteredReports = reportsList.filter((r) =>

    !searchTerm?.trim() ||

    r.title?.toLowerCase().includes(searchTerm?.toLowerCase()) || r.cat?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleExport = (title: string, format: string) => {
    alert(`Exporting "${title}" in ${format} format... Download started!`);
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Production Management Reports (18 Standard Reports)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                Analytics & Audit Logs
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Exportable Audit Registers, OEE Metrics, Job Cost Variances & Shop Floor Production Logs
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search report by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#544B45] focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-amber-500/50 transition space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono font-bold text-amber-400 text-xs">{r.id}</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#544B45] font-semibold text-[10px]">
                  {r.cat}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#211B17]">{r.title}</h3>
              <p className="text-xs text-[#70665F] leading-relaxed">{r.desc}</p>
            </div>

            <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#70665F]">{r.format}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleExport(r.title, 'Excel')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </button>
                <button
                  onClick={() => handleExport(r.title, 'PDF')}
                  className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 text-[11px] font-bold transition flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
