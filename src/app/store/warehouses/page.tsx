'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Warehouse, WarehouseType } from '../../../types/store';
import { Building, Plus, Search, MapPin, Phone, Mail, UserCheck, ShieldCheck } from 'lucide-react';

export default function WarehousesPage() {
  const { warehouses, addWarehouse, updateWarehouse } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<WarehouseType>('Raw Material Store');
  const [address, setAddress] = useState('Plot 48/B, GIDC Makarpura, Vadodara');
  const [manager, setManager] = useState('Hitesh Rawal');
  const [phone, setPhone] = useState('+91 98250 88771');
  const [email, setEmail] = useState('hitesh.rmstore@umatechnofab.com');

  const filtered = warehouses.filter(
    (w) =>

      !searchTerm?.trim() ||

      w.warehouseCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      w.warehouseName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      w.managerName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    addWarehouse({
      warehouseCode: code,
      warehouseName: name,
      warehouseType: type,
      address,
      managerName: manager,
      contactPhone: phone,
      contactEmail: email,
      status: 'Active',
      totalBinsCount: 25,
    });
    setIsModalOpen(false);
    setCode('');
    setName('');
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-crm-brand-600/20 text-indigo-400 border border-crm-brand-600/30 text-xs font-mono font-semibold">
              STORAGE YARDS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Warehouses Master</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Physical factory warehouses, open yards, raw material stores, component racks, and scrap storage locations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-crm-brand-700 text-white text-xs font-bold shadow-lg shadow-crm-brand-700/30 hover:bg-crm-brand-600 transition"
        >
          <Plus className="w-4 h-4" />
          Add Warehouse
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search warehouse name, code, manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-crm-brand-600"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Total Warehouses: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((w) => (
          <div key={w.id} className="bg-white border border-[#EBE3DB] p-5 rounded-2xl shadow-xl relative group hover:border-crm-brand-600/50 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-crm-brand-600/20 text-indigo-400 flex items-center justify-center font-black text-sm border border-crm-brand-600/30">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-indigo-400">{w.warehouseCode}</div>
                  <h3 className="text-sm font-extrabold text-[#211B17] mt-0.5">{w.warehouseName}</h3>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {w.status}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EBE3DB] space-y-2 text-xs text-[#544B45]">
              <div className="flex items-center gap-2 text-[#70665F] text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{w.address}</span>
              </div>

              <div className="flex items-center justify-between text-[#544B45] pt-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">{w.managerName}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#544B45] text-[10px] font-mono">
                  {w.warehouseType}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#70665F] text-[11px] pt-1">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#70665F]" />
                  <span>{w.contactPhone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#70665F]" />
                  <span className="truncate max-w-[130px]">{w.contactEmail}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                Add Warehouse Facility
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Warehouse Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. WH-RM2"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Warehouse Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Heavy Plate Yard 2"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Warehouse Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as WarehouseType)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                >
                  <option value="Raw Material Store">Raw Material Store</option>
                  <option value="Component Store">Component Store</option>
                  <option value="Finished Goods Store">Finished Goods Store</option>
                  <option value="Consumable Store">Consumable Store</option>
                  <option value="Scrap Store">Scrap Store</option>
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Facility Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Store Manager Name</label>
                  <input
                    type="text"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-[#FAF7F2] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 text-white hover:bg-crm-brand-600 text-xs font-semibold shadow-lg shadow-crm-brand-700/30"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
