'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { QCInspection, QCResult } from '../../../types/store';
import { ShieldCheck, Plus, Search, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';

export default function QualityInspectionPage() {
  const { qcInspections, approveQCInspection, goodsReceipts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInspection, setSelectedInspection] = useState<QCInspection | null>(null);

  // Approval Modal Form
  const [inspectorName, setInspectorName] = useState('Suresh Patel (Sr. QC Lead)');
  const [result, setResult] = useState<QCResult>('Pass');
  const [acceptedQty, setAcceptedQty] = useState(3500);
  const [rejectedQty, setRejectedQty] = useState(0);

  const filtered = (qcInspections || []).filter(
    (q) =>
      (q.inspectionNumber || (q as any).inspection_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.itemName || (q as any).item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.supplierName || (q as any).supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInspection) return;
    approveQCInspection(selectedInspection.id, inspectorName, result, acceptedQty, rejectedQty);
    setSelectedInspection(null);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-semibold">
              QUALITY ASSURANCE
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Quality Inspection Manager</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Spectro PMI chemical analysis, ultrasonic flaw detection, thickness verification, and pass/fail store quarantine rules.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search QC no, item, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total Inspections: <span className="text-white font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* QC List Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3.5">Inspection No & Date</th>
                <th className="p-3.5">GRN & Job No</th>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5 text-right">Accepted Qty</th>
                <th className="p-3.5 text-right">Rejected Qty</th>
                <th className="p-3.5 text-center">QC Result</th>
                <th className="p-3.5">Inspector Lead</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No Quality Inspections found.
                  </td>
                </tr>
              ) : (
                filtered.map((q) => {
                  const inspNo = q.inspectionNumber || (q as any).inspection_number || q.id || 'QC';
                  const dateStr = q.inspectionDate || (q as any).inspection_date || '';
                  const grnNo = q.grnNumber || (q as any).grn_number || '-';
                  const job = q.jobId || 'General Stock';
                  const itmCode = q.itemCode || (q as any).item_code || '-';
                  const itmName = q.itemName || (q as any).item_name || '-';
                  const suppName = q.supplierName || (q as any).supplier_name || '-';
                  const accQty = Number(q.acceptedQuantity ?? 0);
                  const rejQty = Number(q.rejectedQuantity ?? 0);
                  const qcRes = q.qcResult || (q as any).overall_result || 'Pass';
                  const inspLead = q.inspectorName || (q as any).inspector || '-';

                  return (
                    <tr key={q.id || inspNo} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-orange-400 text-xs font-mono">{inspNo}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{dateStr}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        <div className="text-cyan-400 font-semibold">{grnNo}</div>
                        <div className="text-[10px] text-amber-400 mt-0.5">{job}</div>
                      </td>
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-white text-xs">{itmCode}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{itmName}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-200">{suppName}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        {accQty.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                        {rejQty.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            qcRes === 'Pass'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : qcRes === 'Fail'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {qcRes}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 text-xs">{inspLead}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedInspection(q);
                            setAcceptedQty(accQty || 0);
                            setRejectedQty(rejQty || 0);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white text-xs font-semibold transition"
                        >
                          Update QC
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QC Approval Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                Update Quality Inspection Result
              </h2>
              <button onClick={() => setSelectedInspection(null)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleApprove} className="space-y-3.5 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1">
                <div className="font-bold text-white text-xs">{selectedInspection.itemCode} - {selectedInspection.itemName}</div>
                <div className="text-[11px] text-slate-400">GRN: {selectedInspection.grnNumber} | Supplier: {selectedInspection.supplierName}</div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Inspector Lead Name</label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">QC Decision Result</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value as QCResult)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Pass">Pass (100% Usable Stock)</option>
                  <option value="Fail">Fail (Rejected to Scrap Yard)</option>
                  <option value="Conditional Approval">Conditional Approval (Derated Use)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Accepted Quantity</label>
                  <input
                    type="number"
                    value={acceptedQty}
                    onChange={(e) => setAcceptedQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Rejected Quantity</label>
                  <input
                    type="number"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-rose-400 font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInspection(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-500 text-xs font-semibold shadow-lg shadow-orange-600/30"
                >
                  Submit Inspection Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
