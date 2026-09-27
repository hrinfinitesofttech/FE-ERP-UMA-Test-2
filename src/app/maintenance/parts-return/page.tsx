'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import {
  CornerUpLeft,
  Plus,
  Search,
  CheckCircle2,
  Package,
  X,
  Building,
} from 'lucide-react';

export default function ServicePartsReturnPage() {
  const { servicePartReturns, addServicePartReturn } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    workOrderNumber: 'SWO-2026-001',
    originalIssueNumber: 'SPI-2026-001',
    items: [
      {
        itemCode: 'OIL-HYD-46',
        itemName: 'Servo System 46 Hydraulic Oil (20L Can)',
        issuedQty: 2,
        usedQty: 1,
        returnQty: 1,
        condition: 'Good' as const,
        warehouse: 'Consumable Store',
        location: 'Drum Storage Area D-12',
      },
    ],
    returnedBy: 'Anil Desai',
    receivedBy: 'Ramesh Store Executive',
    returnDate: new Date().toISOString().split('T')[0],
    status: 'Accepted to Store' as const,
  });

  const filteredReturns = servicePartReturns.filter((r) =>
    r.returnNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    r.workOrderNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    r.returnedBy?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServicePartReturn(formData);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold">
              UNUSED SPARE PARTS RETURN
            </span>
            <span className="text-xs text-[#70665F]">Inventory Return to Store Master</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <CornerUpLeft className="w-6 h-6 text-rose-500" />
            Service Parts Return
          </h1>
          <p className="text-xs text-[#70665F]">
            Return unconsumed or replaced spare parts from service trip back into Store inventory.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-rose-600/30"
        >
          <Plus className="w-4 h-4" />
          Log Parts Return
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search return no, work order or returned by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filteredReturns.map((ret) => (
          <div
            key={ret.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-rose-300 transition"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-mono font-bold text-xs">
                  {ret.returnNumber}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17]">Ref WO: {ret.workOrderNumber}</h3>
                  <p className="text-xs text-[#70665F]">Original Issue Ref: {ret.originalIssueNumber}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {ret.status}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-[#70665F] uppercase tracking-wider block">Returned Items</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ret.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl space-y-1 text-xs border border-slate-100 dark:border-[#EBE3DB]">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900 dark:text-[#544B45]">{item.itemName}</span>
                      <span className="font-mono text-rose-600">{item.itemCode}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#70665F]">
                      <span>Issued: {item.issuedQty} • Used: {item.usedQty} • Returned: <strong>{item.returnQty}</strong></span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">{item.condition}</span>
                    </div>
                    <div className="text-[10px] text-[#70665F] font-mono">
                      Warehouse Stock Restored To: {item.warehouse} ({item.location})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#EBE3DB] text-xs">
              <span className="text-slate-600 dark:text-[#70665F]">Returned By: <strong>{ret.returnedBy}</strong> • Store Receiver: <strong>{ret.receivedBy}</strong></span>
              <span className="text-[10px] text-[#70665F] font-mono">Date: {formatDate(ret.returnDate)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-xl overflow-hidden text-xs">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CornerUpLeft className="w-5 h-5 text-rose-500" /> Log Unused Parts Return to Store
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block font-semibold mb-1">Work Order Number</label>
                <input
                  type="text"
                  required
                  value={formData.workOrderNumber}
                  onChange={(e) => setFormData({ ...formData, workOrderNumber: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold">Post Parts Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
