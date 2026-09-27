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
      <div className="p-8 text-center bg-[#FAF7F2]  text-[#70665F]">
        <h2 className="text-xl font-bold text-[#211B17] mb-2">Supplier 360° Profile</h2>
        <p>No supplier records available or loading live data from API...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#544B45] font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-crm-brand-600/10 border border-crm-brand-600/20 rounded-xl text-crm-brand-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight">{supplier.supplierName}</h1>
              <p className="text-xs text-[#70665F] font-medium mt-0.5">
                Consolidated Supplier 360° Profile • Category: {supplier.category}
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-2 rounded-xl border border-[#EBE3DB] text-xs">
            <span className="text-[#70665F] font-semibold">Select Supplier:</span>
            <select
              value={selectedSuppId}
              onChange={(e) => setSelectedSuppId(e.target.value)}
              className="bg-transparent text-crm-brand-500 font-bold outline-none cursor-pointer"
            >
              {supplier360List.map((s) => (
                <option key={s.supplierId} value={s.supplierId} className="bg-white text-[#544B45]">
                  {s.supplierName} ({s.supplierCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Total Purchased Value</span>
          <div className="text-lg font-bold text-[#211B17]">₹{supplier.totalPurchasedValue?.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Total Payments Cleared</span>
          <div className="text-lg font-bold text-emerald-400">₹{supplier.totalPaid?.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Outstanding Payable</span>
          <div className="text-lg font-bold text-crm-brand-500">₹{supplier.outstandingPayable?.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">On-Time Delivery Rating</span>
          <div className="text-lg font-bold text-amber-400 flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400" /> {supplier.rating} / 5.0 ({supplier.onTimeDeliveryPercent}%)
          </div>
        </div>
      </div>

      {/* Supplier Profile Info */}
      <div className="p-6 bg-white border border-[#EBE3DB] rounded-2xl space-y-3 text-xs">
        <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
          <Building className="w-4 h-4 text-crm-brand-500" /> Key Account Contact Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[#544B45]">
          <div>Contact Person: <strong className="text-[#211B17]">{supplier.contactPerson}</strong></div>
          <div>Email: <span className="text-crm-brand-500">{supplier.email}</span></div>
          <div>Phone: <span className="text-[#544B45]">{supplier.phone}</span></div>
        </div>
      </div>
    </div>
  );
}
