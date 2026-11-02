'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Scale, Plus, Search, Calculator, CheckCircle, X } from 'lucide-react';

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

      !searchTerm?.trim() ||

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
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold">
              UNITS & CONVERSION
            </span>
            <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">Units of Measurement (UOM)</h1>
          </div>
          <p className="text-[color:var(--crm-text-secondary)] text-xs mt-1">
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
      <div className="bg-white border border-[color:var(--crm-border-default)] p-5 rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
          <Calculator className="w-4 h-4" />
          Live UOM Conversion Calculator Engine
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 bg-[color:var(--crm-bg-app)] p-4 rounded-xl border border-[color:var(--crm-border-default)]">
          <div>
            <label className="block text-[color:var(--crm-text-secondary)] text-[11px] mb-1">Enter Quantity</label>
            <input
              type="number"
              value={calcQty}
              onChange={(e) => setCalcQty(Number(e.target.value))}
              className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-xs text-[color:var(--crm-text-primary)] font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[color:var(--crm-text-secondary)] text-[11px] mb-1">Select Alternate Unit</label>
            <select
              value={calcUomId}
              onChange={(e) => setCalcUomId(e.target.value)}
              className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:border-amber-500"
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
              <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-mono uppercase">Converted Base Quantity</div>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {(calcQty * (selectedCalcUom?.conversionFactor || 1))?.toLocaleString('en-IN')}{' '}
                <span className="text-xs text-[color:var(--crm-text-secondary)] font-normal">{selectedCalcUom?.baseUom}</span>
              </div>
            </div>
            <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-mono text-right">
              Factor: {selectedCalcUom?.conversionFactor}
            </div>
          </div>
        </div>
      </div>

      {/* UOM Master List Table */}
      <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[color:var(--crm-border-default)] flex items-center justify-between">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
            <input
              type="text"
              placeholder="Search unit code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl text-xs text-[color:var(--crm-text-primary)] placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-xs text-[color:var(--crm-text-secondary)] font-mono">
            Defined Units: <span className="text-[color:var(--crm-text-primary)] font-bold">{filtered.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[#F4F6FA]/90 text-[color:var(--crm-text-secondary)] font-mono text-[11px] uppercase tracking-wider border-b border-[color:var(--crm-border-default)]">
              <tr>
                <th className="p-3.5">Unit Code</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Base Unit</th>
                <th className="p-3.5 text-right">Conversion Factor</th>
                <th className="p-3.5">Formula Equivalent</th>
                <th className="p-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#F4F6FA]/40 transition">
                  <td className="p-3.5 font-mono font-bold text-amber-400">{u.uomCode}</td>
                  <td className="p-3.5 font-bold text-[color:var(--crm-text-primary)]">{u.uomName}</td>
                  <td className="p-3.5 font-mono text-[color:var(--crm-text-secondary)]">{u.baseUom}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{u.conversionFactor}</td>
                  <td className="p-3.5 font-mono text-xs text-[color:var(--crm-text-secondary)]">
                    1 {u.uomCode} = {u.conversionFactor} {u.baseUom}
                  </td>
                  <td className="p-3.5 text-[color:var(--crm-text-secondary)] text-xs">{u.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
              <h2 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
                <Scale className="w-5 h-5 text-crm-brand-600" />
                Add Unit of Measurement
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] hover:bg-[color:var(--crm-bg-app)] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Unit Code *</label>
                  <input
                    type="text"
                    required
                    value={uomCode}
                    onChange={(e) => setUomCode(e.target.value)}
                    placeholder="e.g. MT"
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Full Unit Name *</label>
                  <input
                    type="text"
                    required
                    value={uomName}
                    onChange={(e) => setUomName(e.target.value)}
                    placeholder="e.g. Metric Tonnes"
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Base Unit</label>
                  <input
                    type="text"
                    value={baseUom}
                    onChange={(e) => setBaseUom(e.target.value)}
                    placeholder="e.g. Kg"
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Conversion Factor</label>
                  <input
                    type="number"
                    value={conversionFactor}
                    onChange={(e) => setConversionFactor(Number(e.target.value))}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[color:var(--crm-text-secondary)] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Usage rules & standards..."
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[color:var(--crm-border-default)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)] text-xs font-semibold"
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
