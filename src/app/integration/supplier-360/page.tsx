'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Truck, Building, Phone, Mail, Package, Star, Receipt, CheckCircle2 } from 'lucide-react';

export default function Supplier360Page() {
  const { supplier360List } = useERP();
  const [selectedSuppId, setSelectedSuppId] = useState<string>('SUP-2026-001');

  const supplier = supplier360List.find((s) => s.supplierId === selectedSuppId) || supplier360List[0];

  if (!supplier) {
    return (
      <div className="p-8 text-center bg-slate-950 min-h-screen text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Supplier 360° Profile</h2>
        <p>No supplier records available or loading live data from API...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{supplier.supplierName}</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Consolidated Supplier 360° Profile • Category: {supplier.category}
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Select Supplier:</span>
            <select
              value={selectedSuppId}
              onChange={(e) => setSelectedSuppId(e.target.value)}
              className="bg-transparent text-purple-400 font-bold outline-none cursor-pointer"
            >
              {supplier360List.map((s) => (
                <option key={s.supplierId} value={s.supplierId} className="bg-slate-900 text-slate-200">
                  {s.supplierName} ({s.supplierCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Total Purchased Value</span>
          <div className="text-lg font-bold text-white">₹{supplier.totalPurchasedValue.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Total Payments Cleared</span>
          <div className="text-lg font-bold text-emerald-400">₹{supplier.totalPaid.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Outstanding Payable</span>
          <div className="text-lg font-bold text-blue-400">₹{supplier.outstandingPayable.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">On-Time Delivery Rating</span>
          <div className="text-lg font-bold text-amber-400 flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400" /> {supplier.rating} / 5.0 ({supplier.onTimeDeliveryPercent}%)
          </div>
        </div>
      </div>

      {/* Supplier Profile Info */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-purple-400" /> Key Account Contact Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
          <div>Contact Person: <strong className="text-white">{supplier.contactPerson}</strong></div>
          <div>Email: <span className="text-cyan-400">{supplier.email}</span></div>
          <div>Phone: <span className="text-slate-200">{supplier.phone}</span></div>
        </div>
      </div>
    </div>
  );
}
