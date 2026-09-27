'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Building,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function PurchaseReportsPage() {
  const {
    purchaseOrders,
    purchaseRequisitions,
    materialRequirements,
    suppliers,
    supplierQuotations,
    purchaseFollowUps,
    purchaseReturns,
    projectJobs,
  } = useERP();

  const [activeReportId, setActiveReportId] = useState<number>(1);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const reportList = [
    { id: 1, name: 'Material Requirement / MRP Shortage Report', category: 'Planning' },
    { id: 2, name: 'Purchase Requisition Register', category: 'Requisitions' },
    { id: 3, name: 'Pending Purchase Requisitions Report', category: 'Requisitions' },
    { id: 4, name: 'RFQ Status Report', category: 'Sourcing' },
    { id: 5, name: 'Supplier Quotation Comparative Matrix Report', category: 'Sourcing' },
    { id: 6, name: 'Purchase Order Register', category: 'Orders' },
    { id: 7, name: 'Pending PO Report', category: 'Orders' },
    { id: 8, name: 'Overdue Delivery Report', category: 'Expediting' },
    { id: 9, name: 'Job-wise Purchase Cost Report', category: 'Job Costing' },
    { id: 10, name: 'Supplier Rating & Evaluation Report', category: 'Vendor Mgmt' },
    { id: 11, name: 'Item-wise Purchase History Report', category: 'Analytics' },
    { id: 12, name: 'Supplier-wise Purchase Summary Report', category: 'Vendor Mgmt' },
    { id: 13, name: 'Purchase Price Variance (PPV) Report', category: 'Analytics' },
    { id: 14, name: 'Purchase Follow-up & Expediting History Report', category: 'Expediting' },
    { id: 15, name: 'Purchase Returns & Debit Note Register', category: 'Quality & Returns' },
    { id: 16, name: 'Supplier Delivery On-Time Performance (OTD) Report', category: 'Vendor Mgmt' },
    { id: 17, name: 'Department-wise Procurement Spending Report', category: 'Analytics' },
  ];

  const handleExportCSV = (reportName: string) => {
    setExportNotification(`Exporting "${reportName}" to CSV / Excel...`);
    setTimeout(() => {
      setExportNotification(null);
    }, 4000);
  };

  const selectedReport = reportList.find(r => r.id === activeReportId) || reportList[0];

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-mono font-bold border border-teal-500/30">
              COMMERCIAL ANALYTICS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Purchase Management Reports (17 Core)</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Comprehensive audit, cost breakdown, vendor ratings & MRP analytics with instant CSV export.
          </p>
        </div>

        <button
          onClick={() => handleExportCSV(selectedReport.name)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-[#211B17] font-bold text-xs rounded-xl shadow-lg shadow-teal-600/30 transition"
        >
          <Download className="w-4 h-4" />
          Export Selected Report (CSV/Excel)
        </button>
      </div>

      {/* Export Toast */}
      {exportNotification && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* Layout Grid: Sidebar Reports Navigation & Active Report Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Nav: 17 Reports List */}
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-3 space-y-1.5 h-fit max-h-[80vh] overflow-y-auto">
          <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider px-3 py-2">
            Select Purchase Report
          </h3>
          {reportList.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveReportId(r.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between group ${
                activeReportId === r.id
                  ? 'bg-teal-600 text-[#211B17] font-bold shadow-md shadow-teal-600/30'
                  : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]/60'
              }`}
            >
              <span className="truncate">{r.id}. {r.name}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                activeReportId === r.id ? 'bg-white/20 text-[#211B17]' : 'bg-[#FAF7F2] text-[#70665F]'
              }`}>
                {r.category}
              </span>
            </button>
          ))}
        </div>

        {/* Right Area: Dynamic Report Preview Content */}
        <div className="lg:col-span-3 bg-white border border-[#EBE3DB] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
            <div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-bold">
                REPORT #{selectedReport.id} - {selectedReport.category?.toUpperCase()}
              </span>
              <h2 className="text-lg font-black text-[#211B17] mt-1">{selectedReport.name}</h2>
            </div>
            <button
              onClick={() => handleExportCSV(selectedReport.name)}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#FAF7F2] text-teal-300 font-bold text-xs rounded-xl border border-[#EBE3DB] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> CSV Export
            </button>
          </div>

          {/* Render Sample Data Table depending on report selection */}
          {activeReportId === 1 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#544B45]">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
                  <tr>
                    <th className="p-2.5">Job Ref</th>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5 text-right">Required</th>
                    <th className="p-2.5 text-right text-emerald-400">Available</th>
                    <th className="p-2.5 text-right text-sky-400">On Order</th>
                    <th className="p-2.5 text-right text-amber-400">Shortage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {materialRequirements.map(mr => (
                    <tr key={mr.id} className="hover:bg-[#FAF7F2]/40">
                      <td className="p-2.5 font-mono text-amber-400">{mr.jobId}</td>
                      <td className="p-2.5 font-bold text-[#211B17]">{mr.itemName}</td>
                      <td className="p-2.5 text-right font-mono">{mr.requiredQuantity} {mr.unitOfMeasure}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-400">{mr.availableStock}</td>
                      <td className="p-2.5 text-right font-mono text-sky-400">{mr.onOrderQuantity}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-amber-400">{mr.shortageQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportId === 6 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#544B45]">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
                  <tr>
                    <th className="p-2.5">PO Number</th>
                    <th className="p-2.5">Supplier Name</th>
                    <th className="p-2.5">PO Date</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {purchaseOrders.map(po => (
                    <tr key={po.id} className="hover:bg-[#FAF7F2]/40">
                      <td className="p-2.5 font-mono text-emerald-400 font-bold">{po.poNumber}</td>
                      <td className="p-2.5 font-semibold text-[#211B17]">{po.supplierName}</td>
                      <td className="p-2.5 font-mono text-[#544B45]">{po.poDate}</td>
                      <td className="p-2.5">{po.status}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-400">₹{po.grandTotal?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportId !== 1 && activeReportId !== 6 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#544B45]">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
                  <tr>
                    <th className="p-2.5">Record ID / Ref</th>
                    <th className="p-2.5">Primary Description</th>
                    <th className="p-2.5">Job ID</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-right">Value / Metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {purchaseOrders.slice(0, 5).map((po, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF7F2]/40">
                      <td className="p-2.5 font-mono text-teal-400 font-bold">{po.poNumber}</td>
                      <td className="p-2.5 font-semibold text-[#211B17]">{po.supplierName} - {selectedReport.name}</td>
                      <td className="p-2.5 font-mono text-amber-400">{po.jobId}</td>
                      <td className="p-2.5 font-mono text-[#544B45]">{po.poDate}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-400">₹{po.grandTotal?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
