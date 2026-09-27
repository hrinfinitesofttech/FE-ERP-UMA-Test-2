'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Compass, Plus, Search, Calculator, CheckCircle } from 'lucide-react';

export default function UOMPage() {
  const { uoms, addUOM } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Conversion Calculator State
  const [calcQty, setCalcQty] = useState(1);
  const [calcUomId, setCalcUomId] = useState(uoms[0]?.id || '');
  const selectedCalcUom = uoms.find((u) => u.id === calcUomId) || uoms[0];

  // New UOM Form
  const [uomCode, setUomCode] = useState('');
  const [uomName, setUomName] = useState('');
  const [baseUom, setBaseUom] = useState('Kg');
  const [conversionFactor, setConversionFactor] = useState(1);
  const [description, setDescription] = useState('');

  const filtered = uoms.filter(
    (u) =>
      u.uomCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      u.uomName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uomCode || !uomName) return;
    addUOM({
      uomCode,
      uomName,
      baseUom,
      conversionFactor,
      description,
    });
    setIsModalOpen(false);
    setUomCode('');
    setUomName('');
    setDescription('');
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold">
              UNITS & CONVERSION
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Units of Measurement (UOM)</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Configure primary units, alternate units, and automated conversion factor calculations (e.g. 1 MT = 1000 Kg, 1 Box = 10 Nos).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-600/30 hover:bg-amber-500 transition"
        >
          <Plus className="w-4 h-4" />
          Add UOM Master
        </button>
      </div>

      {/* Interactive UOM Conversion Calculator Skid */}
      <div className="bg-white border border-[#EBE3DB] p-5 rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
          <Calculator className="w-4 h-4" />
          Live UOM Conversion Calculator Engine
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
          <div>
            <label className="block text-[#70665F] text-[11px] mb-1">Enter Quantity</label>
            <input
              type="number"
              value={calcQty}
              onChange={(e) => setCalcQty(Number(e.target.value))}
              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[#70665F] text-[11px] mb-1">Select Alternate Unit</label>
            <select
              value={calcUomId}
              onChange={(e) => setCalcUomId(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-amber-500"
            >
              {uoms.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.uomCode} - {u.uomName}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#70665F] font-mono uppercase">Converted Base Quantity</div>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {(calcQty * (selectedCalcUom?.conversionFactor || 1))?.toLocaleString('en-IN')}{' '}
                <span className="text-xs text-[#544B45] font-normal">{selectedCalcUom?.baseUom}</span>
              </div>
            </div>
            <div className="text-[10px] text-[#70665F] font-mono text-right">
              Factor: {selectedCalcUom?.conversionFactor}
            </div>
          </div>
        </div>
      </div>

      {/* UOM Master List Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search unit code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-xs text-[#70665F] font-mono">
            Defined Units: <span className="text-[#211B17] font-bold">{filtered.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Unit Code</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Base Unit</th>
                <th className="p-3.5 text-right">Conversion Factor</th>
                <th className="p-3.5">Formula Equivalent</th>
                <th className="p-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3.5 font-mono font-bold text-amber-400">{u.uomCode}</td>
                  <td className="p-3.5 font-bold text-[#211B17]">{u.uomName}</td>
                  <td className="p-3.5 font-mono text-[#544B45]">{u.baseUom}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{u.conversionFactor}</td>
                  <td className="p-3.5 font-mono text-xs text-[#544B45]">
                    1 {u.uomCode} = {u.conversionFactor} {u.baseUom}
                  </td>
                  <td className="p-3.5 text-[#70665F] text-xs">{u.description || '-'}</td>
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
                <Compass className="w-5 h-5 text-amber-400" />
                Add Unit of Measurement
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Unit Code *</label>
                  <input
                    type="text"
                    required
                    value={uomCode}
                    onChange={(e) => setUomCode(e.target.value)}
                    placeholder="e.g. MT"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Full Unit Name *</label>
                  <input
                    type="text"
                    required
                    value={uomName}
                    onChange={(e) => setUomName(e.target.value)}
                    placeholder="e.g. Metric Tonnes"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Base Unit</label>
                  <input
                    type="text"
                    value={baseUom}
                    onChange={(e) => setBaseUom(e.target.value)}
                    placeholder="e.g. Kg"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Conversion Factor</label>
                  <input
                    type="number"
                    value={conversionFactor}
                    onChange={(e) => setConversionFactor(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Usage rules & standards..."
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
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
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-500 text-xs font-semibold shadow-lg shadow-amber-600/30"
                >
                  Save UOM Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
