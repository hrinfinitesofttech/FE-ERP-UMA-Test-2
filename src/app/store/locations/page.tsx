'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { MapPin, Plus, Search, Building, Box, CheckCircle } from 'lucide-react';

export default function StoreLocationsPage() {
  const { warehouseLocations, addWarehouseLocation, warehouses } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [whId, setWhId] = useState(warehouses[0]?.id || 'WH-001');
  const [zone, setZone] = useState('Zone A (Plates)');
  const [rack, setRack] = useState('Rack 01');
  const [shelf, setShelf] = useState('Shelf A1');
  const [bin, setBin] = useState('Bin A1-05');
  const [locCode, setLocCode] = useState('W1-ZA-R1-S1-B05');

  const filtered = warehouseLocations.filter(
    (loc) =>

      !searchTerm?.trim() ||

      loc.locationCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      loc.zone?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      loc.bin?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedWh = warehouses.find((w) => w.id === whId);
    addWarehouseLocation({
      warehouseId: whId,
      warehouseName: selectedWh?.warehouseName || 'Raw Material Store',
      zone,
      rack,
      shelf,
      bin,
      locationCode: locCode,
      capacityQty: 10000,
      status: 'Available',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-mono font-semibold">
              RACK & BIN MAPPING
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Store Locations & Bin Master</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Pinpoint exact bin coordinates (`Warehouse Code - Zone - Rack - Shelf - Bin`) for precise item putaway & picking.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 text-[#211B17] text-xs font-bold shadow-lg shadow-teal-600/30 hover:bg-teal-500 transition"
        >
          <Plus className="w-4 h-4" />
          Add Location Bin
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search location code, zone, bin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Total Bins: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Location Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Location Code</th>
                <th className="p-3.5">Warehouse</th>
                <th className="p-3.5">Zone & Rack</th>
                <th className="p-3.5">Shelf & Bin</th>
                <th className="p-3.5 text-right">Capacity Qty</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((loc) => (
                <tr key={loc.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3.5 font-mono font-bold text-teal-400 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-500" />
                    {loc.locationCode}
                  </td>
                  <td className="p-3.5 font-semibold text-[#211B17]">{loc.warehouseName}</td>
                  <td className="p-3.5 text-[#544B45]">
                    <div>{loc.zone}</div>
                    <div className="text-[10px] text-[#70665F]">{loc.rack}</div>
                  </td>
                  <td className="p-3.5 text-[#544B45]">
                    <div className="font-mono text-xs">{loc.shelf}</div>
                    <div className="text-[10px] text-[#70665F]">{loc.bin}</div>
                  </td>
                  <td className="p-3.5 text-right font-mono text-emerald-400 font-bold">
                    {loc.capacityQty?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      loc.status === 'Occupied'
                        ? 'bg-crm-brand-600/20 text-crm-brand- border-crm-brand-600/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {loc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-400" />
                Add Location Bin
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Warehouse</label>
                <select
                  value={whId}
                  onChange={(e) => setWhId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.warehouseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Zone Name</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Rack No.</label>
                  <input
                    type="text"
                    value={rack}
                    onChange={(e) => setRack(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Shelf No.</label>
                  <input
                    type="text"
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Bin No.</label>
                  <input
                    type="text"
                    value={bin}
                    onChange={(e) => setBin(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Location Code *</label>
                <input
                  type="text"
                  required
                  value={locCode}
                  onChange={(e) => setLocCode(e.target.value)}
                  placeholder="e.g. W1-ZA-R1-S1-B05"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500 font-mono"
                />
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
                  className="px-4 py-2 rounded-xl bg-teal-600 text-[#211B17] hover:bg-teal-500 text-xs font-semibold shadow-lg shadow-teal-600/30"
                >
                  Save Bin Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
