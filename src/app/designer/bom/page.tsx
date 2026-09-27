'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { BOMHeader, BOMItem, BOMItemType, ProcurementType } from '../../../types/designer';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  DollarSign,
  Download,
  Layers,
  X,
  PlusCircle,
  FileCode,
  ShieldCheck,
} from 'lucide-react';

export default function MasterBOMPage() {
  const { boms, addBOM, updateBOM, designJobs, currentUser } = useERP();

  const [selectedJobNumber, setSelectedJobNumber] = useState(boms[0]?.jobNumber || 'JOB-2026-001');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Active BOM
  const activeBOM = boms.find((b) => b.jobNumber === selectedJobNumber) || boms[0];

  // Add Item Form State
  const [partNumber, setPartNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<BOMItemType>('Raw Material');
  const [material, setMaterial] = useState('SS 316L');
  const [specification, setSpecification] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('Nos');
  const [makeBrand, setMakeBrand] = useState('');
  const [procurementType, setProcurementType] = useState<ProcurementType>('Purchase');
  const [estimatedRate, setEstimatedRate] = useState(5000);

  const filteredItems = activeBOM?.items.filter((item) => {
    const matchSearch =
      item.partNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      item.material?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      (item.makeBrand && item.makeBrand?.toLowerCase().includes(searchQuery?.toLowerCase()));
    const matchType = itemTypeFilter === 'all' || item.itemType === itemTypeFilter;
    return matchSearch && matchType;
  }) || [];

  const totalBOMCost = activeBOM?.items.reduce((sum, item) => sum + item.totalEstimatedAmount, 0) || 0;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBOM || activeBOM.isLocked) return;

    const newNo = activeBOM.items.length + 1;
    const rate = Number(estimatedRate);
    const qty = Number(quantity);
    const newItem: BOMItem = {
      id: `bi-${Date.now()}`,
      itemNo: newNo,
      partNumber: partNumber || `PRT-PART-${newNo}`,
      itemName,
      description,
      itemType,
      material,
      specification,
      quantity: qty,
      unit,
      makeBrand: makeBrand || 'Tata Steel / Local',
      procurementType,
      estimatedRate: rate,
      totalEstimatedAmount: rate * qty,
    };

    const updatedItems = [...activeBOM.items, newItem];
    const newTotal = updatedItems.reduce((s, i) => s + i.totalEstimatedAmount, 0);

    updateBOM(activeBOM.id, {
      items: updatedItems,
      totalItemsCount: updatedItems.length,
      estimatedTotalCost: newTotal,
    });

    setIsAddItemModalOpen(false);
  };

  const handleLockBOM = () => {
    if (!activeBOM) return;
    updateBOM(activeBOM.id, {
      approvalStatus: 'approved',
      isLocked: true,
      approvedBy: `${currentUser.firstName} ${currentUser.lastName}`,
    });
  };

  return (
    <div className="p-6 space-y-6  text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
              MODULE 3.8
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-amber-400" />
              Multi-Level Master Bill of Materials (BOM)
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Component Hierarchy Structure for <span className="font-mono text-crm-brand-">Project ID + Job Number</span> (Raw Material, Bought-Out, Fabricated & Sub-Assemblies)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeBOM && (
            <button
              onClick={() => alert(`Exporting Master BOM ${activeBOM.bomNumber} (REV: ${activeBOM.revisionNumber}) to CSV/Excel...`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-amber-300 border border-amber-500/30 text-xs font-bold transition"
            >
              <Download className="w-4 h-4" />
              Export BOM Excel
            </button>
          )}

          {activeBOM && !activeBOM.isLocked ? (
            <button
              onClick={handleLockBOM}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Approve & Lock BOM
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              <Lock className="w-4 h-4" />
              BOM Locked ({activeBOM?.revisionNumber})
            </span>
          )}
        </div>
      </div>

      {/* BOM Job Selector & Summary Header */}
      {activeBOM && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl">
          <div>
            <label className="text-[10px] font-bold text-[#70665F] block mb-1">Select Active Job BOM</label>
            <select
              value={selectedJobNumber}
              onChange={(e) => setSelectedJobNumber(e.target.value)}
              className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-amber-500"
            >
              {boms.map((b) => (
                <option key={b.id} value={b.jobNumber}>
                  {b.jobNumber} ({b.bomNumber} - {b.revisionNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB]">
            <span className="text-[10px] text-[#70665F] block">TOTAL BOM COMPONENTS</span>
            <span className="font-mono text-xl font-black text-[#211B17]">{activeBOM.items.length} Items</span>
            <span className="text-[10px] text-crm-brand-500 block font-mono">Rev: {activeBOM.revisionNumber}</span>
          </div>

          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB]">
            <span className="text-[10px] text-[#70665F] block">ESTIMATED TOTAL BOM COST</span>
            <span className="font-mono text-xl font-black text-emerald-400">
              ₹ {totalBOMCost?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#70665F] block">Rollup Calculated</span>
          </div>

          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#70665F] block">APPROVAL STATUS</span>
              <span className="font-bold text-xs uppercase text-amber-400">{activeBOM.approvalStatus}</span>
              <span className="text-[10px] text-[#70665F] block">By: {activeBOM.approvedBy || 'Engineering Lead'}</span>
            </div>
            {activeBOM.isLocked ? <Lock className="w-5 h-5 text-emerald-400" /> : <Unlock className="w-5 h-5 text-amber-400" />}
          </div>
        </div>
      )}

      {/* Control & Item Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Part #, Item Name, Material, Brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-amber-500"
          >
            <option value="all">All 8 Item Types</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Bought-Out">Bought-Out</option>
            <option value="Fabricated">Fabricated</option>
            <option value="Sub-Assembly">Sub-Assembly</option>
            <option value="Electrical">Electrical</option>
            <option value="Hardware">Hardware</option>
            <option value="Consumable">Consumable</option>
            <option value="Standard Component">Standard Component</option>
          </select>

          {activeBOM && !activeBOM.isLocked && (
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-[#211B17] text-xs font-bold transition shadow-lg shadow-amber-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              Add BOM Item
            </button>
          )}
        </div>
      </div>

      {/* BOM Multi-Level Hierarchy Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#EBE3DB] bg-white shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] text-[#70665F] border-b border-[#EBE3DB]">
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3">Part Number</th>
              <th className="p-3">Item Name & Specification</th>
              <th className="p-3">Item Type</th>
              <th className="p-3">Material Grade</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Make / Brand</th>
              <th className="p-3">Procurement</th>
              <th className="p-3 text-right">Est. Rate</th>
              <th className="p-3 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB]">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-white/40 transition">
                <td className="p-3 text-center font-mono font-bold text-[#70665F]">{item.itemNo}</td>
                <td className="p-3 font-mono font-bold text-amber-400">{item.partNumber}</td>
                <td className="p-3">
                  <div className="font-bold text-[#211B17]">{item.itemName}</div>
                  <div className="text-[10px] text-[#70665F]">{item.specification}</div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.itemType === 'Raw Material'
                        ? 'bg-crm-brand-600/20 text-crm-brand- border border-crm-brand-600/30'
                        : item.itemType === 'Bought-Out'
                        ? 'bg-crm-brand-600/20 text-crm-brand- border border-crm-brand-600/30'
                        : item.itemType === 'Sub-Assembly'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.itemType}
                  </span>
                </td>
                <td className="p-3 font-mono text-[#544B45]">{item.material}</td>
                <td className="p-3 font-mono font-bold text-[#211B17]">
                  {item.quantity} {item.unit}
                </td>
                <td className="p-3 text-crm-brand- font-bold">{item.makeBrand || '-'}</td>
                <td className="p-3 font-mono text-[11px] text-[#70665F]">{item.procurementType}</td>
                <td className="p-3 text-right font-mono text-[#544B45]">₹ {item.estimatedRate?.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-400">
                  ₹ {item.totalEstimatedAmount?.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Item to BOM */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                Add Item to Master BOM ({activeBOM?.jobNumber})
              </h3>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Part Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRT-SHL-10K"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Item Type *</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Bought-Out">Bought-Out</option>
                    <option value="Fabricated">Fabricated</option>
                    <option value="Sub-Assembly">Sub-Assembly</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Consumable">Consumable</option>
                    <option value="Standard Component">Standard Component</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SS 316L Shell Plate 12mm Thick"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Material Grade</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Make / Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Steel / ABB / Flowserve"
                    value={makeBrand}
                    onChange={(e) => setMakeBrand(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Est. Rate (₹)</label>
                  <input
                    type="number"
                    value={estimatedRate}
                    onChange={(e) => setEstimatedRate(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-[#544B45] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-[#211B17] font-bold"
                >
                  Add to BOM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
