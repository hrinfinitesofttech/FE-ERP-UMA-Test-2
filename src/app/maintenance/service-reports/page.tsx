'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate, formatCurrency } from '../../../lib/utils';
import { ServiceReport } from '../../../types/maintenance';
import {
  FileCheck2,
  Printer,
  Download,
  Share2,
  Search,
  CheckCircle2,
  Building,
  User,
  ShieldCheck,
  Package,
  Clock,
  Eye,
  X,
} from 'lucide-react';

export default function ServiceReportsPage() {
  const { serviceReports } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportModal, setSelectedReportModal] = useState<ServiceReport | null>(null);

  const filteredReports = serviceReports.filter((rep) =>
    rep.reportNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    rep.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    rep.machineName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    rep.serialNumber?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-mono text-xs font-bold">
              PROFESSIONAL SERVICE REPORTS
            </span>
            <span className="text-xs text-[#70665F]">Printable Customer Copy & Customer Sign-Off</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-green-500" />
            Service Reports Master
          </h1>
          <p className="text-xs text-[#70665F]">
            Generate, print, and export official signed Service Reports detailing complaints, work done, spare parts, labour charges & customer sign-off.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm print:hidden">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search report no, customer, machine or serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-[#FAF7F2] text-slate-600 dark:text-[#70665F] uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-[#EBE3DB]">
                <th className="py-3.5 px-4">Report Number</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Machine & Serial</th>
                <th className="py-3.5 px-4">Visit Date</th>
                <th className="py-3.5 px-4">Technician</th>
                <th className="py-3.5 px-4">Machine Status</th>
                <th className="py-3.5 px-4">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#EBE3DB]">
              {filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50 dark:hover:bg-[#FAF7F2]/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-green-600 dark:text-green-400">
                    {rep.reportNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-[#211B17]">{rep.customerName}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-[#544B45]">{rep.machineName}</div>
                    <div className="text-[10px] text-[#70665F] font-mono">SN: {rep.serialNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{formatDate(rep.visitDate)}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-[#544B45]">{rep.technicianName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      {rep.machineStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-[#544B45]">
                    {formatCurrency(rep.grandTotal)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => setSelectedReportModal(rep)}
                      className="px-2.5 py-1 rounded bg-crm-brand- dark:bg-crm-brand-/40 text-crm-brand-700 dark:text-crm-brand-500 font-semibold text-[11px] hover:underline"
                    >
                      Preview & Print PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report PDF View Modal */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="p-4 border-b bg-slate-50 dark:bg-[#FAF7F2] flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-green-500" />
                <span className="font-bold text-sm text-slate-900 dark:text-[#211B17]">
                  Official Service Report #{selectedReportModal.reportNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-crm-brand-700 text-white font-semibold text-xs flex items-center gap-1 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button onClick={() => setSelectedReportModal(null)} className="p-1.5 text-[#70665F] hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Document Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 dark:text-[#544B45] font-sans print:p-0">
              {/* Document Letterhead Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <div className="text-xl font-black text-crm-brand- dark:text-crm-brand-500 tracking-wide">
                    UMA TECHNO FAB
                  </div>
                  <div className="text-[10px] text-[#70665F]">
                    Heavy Industrial Machine Manufacturing & After-Sales Service Division
                  </div>
                  <div className="text-[10px] text-[#70665F] mt-1">
                    GIDC Industrial Estate, Plot 44-A, Hazira Road, Surat, Gujarat • GSTIN: 24AAACU1234F1ZM
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="px-3 py-1 rounded bg-green-600 text-[#211B17] font-mono font-bold text-xs">
                    SERVICE REPORT
                  </div>
                  <div className="text-[11px] font-mono">Report No: <strong>{selectedReportModal.reportNumber}</strong></div>
                  <div className="text-[11px] text-[#70665F]">Date: {formatDate(selectedReportModal.visitDate)}</div>
                </div>
              </div>

              {/* Customer & Machine Details Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl border">
                <div className="space-y-1">
                  <span className="text-[#70665F] font-bold uppercase text-[10px] tracking-wider block">Customer Details</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-[#211B17]">{selectedReportModal.customerName}</div>
                  <div>Signatory: {selectedReportModal.customerNameSignatory}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[#70665F] font-bold uppercase text-[10px] tracking-wider block">Machine Information</span>
                  <div className="font-bold text-slate-900 dark:text-[#211B17]">{selectedReportModal.machineName}</div>
                  <div className="font-mono">Serial Number: {selectedReportModal.serialNumber}</div>
                </div>
              </div>

              {/* Work Summary */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-[#544B45]">Complaint & Diagnosis</div>
                <div className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/30 rounded-lg">
                  <strong>Complaint:</strong> {selectedReportModal.complaint}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/30 rounded-lg">
                  <strong>Diagnosis & Work Performed:</strong> {selectedReportModal.workPerformed}
                </div>
              </div>

              {/* Spare Parts Table */}
              {selectedReportModal.partsUsed.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-[#544B45]">Spare Parts Issued & Charges</div>
                  <table className="w-full text-left border">
                    <thead className="bg-slate-100 dark:bg-[#FAF7F2]">
                      <tr>
                        <th className="p-2 border">Item Code & Description</th>
                        <th className="p-2 border text-center">Qty</th>
                        <th className="p-2 border text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReportModal.partsUsed.map((p, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 border font-medium">{p.itemName} ({p.itemCode})</td>
                          <td className="p-2 border text-center font-mono">{p.qty}</td>
                          <td className="p-2 border text-right font-mono font-bold">{formatCurrency(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Charges Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 bg-slate-50 dark:bg-[#FAF7F2] p-3 rounded-xl border text-right">
                  <div className="flex justify-between">
                    <span>Parts Total:</span>
                    <span className="font-mono">{formatCurrency(selectedReportModal.partsTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labour Charges ({selectedReportModal.labourHours} hrs):</span>
                    <span className="font-mono">{formatCurrency(selectedReportModal.labourCharge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travel / Logistics:</span>
                    <span className="font-mono">{formatCurrency(selectedReportModal.travelCharge)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t pt-1 text-slate-900 dark:text-[#211B17]">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(selectedReportModal.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures Row */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t">
                <div className="border-t border-dashed pt-2 text-center">
                  <div className="font-bold text-slate-800 dark:text-[#544B45]">{selectedReportModal.technicianName}</div>
                  <div className="text-[10px] text-[#70665F]">Service Engineer Signature</div>
                </div>
                <div className="border-t border-dashed pt-2 text-center">
                  <div className="font-bold text-slate-800 dark:text-[#544B45]">{selectedReportModal.customerNameSignatory}</div>
                  <div className="text-[10px] text-[#70665F]">Customer Representative Digital Verification</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
