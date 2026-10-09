'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ItemMaster, ItemType, ItemCategory, UOMMaster } from '../../../types/store';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Tag,
  Layers,
  AlertTriangle,
  Building,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';

export default function ItemMasterPage() {
  const { itemMasters, addItemMaster, updateItemMaster, deleteItemMaster, itemCategories, uoms, warehouses, suppliers } = useERP();

  const availableCategories = itemCategories || [];
  const availableUOMs = uoms || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemMaster | null>(null);

  // New Item Form State
  const [formData, setFormData] = useState<Omit<ItemMaster, 'id' | 'createdAt'>>({
    itemCode: '',
    itemName: '',
    itemType: 'Plate',
    category: availableCategories[0]?.categoryName || '',
    description: '',
    specification: '',
    brandMake: '',
    hsnSac: '72193200',
    gstRate: 18,
    uom: availableUOMs[0]?.uomCode || 'Kg',
    status: 'Active',
    minimumStock: 1000,
    maximumStock: 10000,
    reorderLevel: 2500,
    safetyStock: 800,
    leadTimeDays: 10,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-ZA-R1-S1-B01',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 350,
    lastPurchaseRate: 350,
    standardCost: 350,
  });

  const filteredItems = itemMasters.filter((item) => {
    const matchesSearch =
      !searchTerm?.trim() ||
      item.itemCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      item.specification?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesType = selectedType === 'all' || item.itemType === selectedType;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemCode || !formData.itemName) return;
    addItemMaster({
      ...formData,
      minimumStock: Number(formData.minimumStock) || 0,
      reorderLevel: Number(formData.reorderLevel) || 0,
      standardCost: Number(formData.standardCost) || 0,
    });
    setIsModalOpen(false);
    setFormData({
      itemCode: '',
      itemName: '',
      itemType: 'Plate',
      category: 'Stainless Steel Plates & Sheets',
      description: '',
      specification: '',
      brandMake: '',
      hsnSac: '72193200',
      gstRate: 18,
      uom: 'Kg',
      status: 'Active',
      minimumStock: 1000,
      maximumStock: 10000,
      reorderLevel: 2500,
      safetyStock: 800,
      leadTimeDays: 10,
      defaultWarehouseId: 'WH-001',
      defaultLocationBin: 'W1-ZA-R1-S1-B01',
      batchTracking: true,
      serialTracking: false,
      lotTracking: true,
      defaultPurchaseRate: 350,
      lastPurchaseRate: 350,
      standardCost: 350,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateItemMaster(editingItem.id, {
      ...editingItem,
      minimumStock: Number(editingItem.minimumStock) || 0,
      reorderLevel: Number(editingItem.reorderLevel) || 0,
      standardCost: Number(editingItem.standardCost) || 0,
    });
    setEditingItem(null);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete item "${code}" from item master catalog?`)) {
      deleteItemMaster(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand- text-xs font-mono font-bold border border-crm-brand-600/30">
              STORE / INVENTORY
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Item Master Catalog</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Raw materials, bought-out items, pipes, plates, consumables, and hardware master registry.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-crm-brand-700/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Item Master
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[11px] font-mono text-[#70665F] uppercase">Total Catalog Items</span>
          <div className="text-2xl font-black text-[#211B17]">{itemMasters.length}</div>
          <span className="text-[10px] text-emerald-400 font-medium">All active SKUs</span>
        </div>
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[11px] font-mono text-[#70665F] uppercase">Raw Material (Plates/Pipes)</span>
          <div className="text-2xl font-black text-crm-brand-">
            {itemMasters.filter((i) => i.itemType === 'Plate' || i.itemType === 'Pipe').length}
          </div>
          <span className="text-[10px] text-[#70665F]">SS / MS Primary Stock</span>
        </div>
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[11px] font-mono text-[#70665F] uppercase">Bought-Out & Hardware</span>
          <div className="text-2xl font-black text-amber-400">
            {itemMasters.filter((i) => i.itemType === 'Bought-Out Item' || i.itemType === 'Hardware').length}
          </div>
          <span className="text-[10px] text-[#70665F]">Valves, Gaskets, Fasteners</span>
        </div>
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 space-y-1 shadow-lg">
          <span className="text-[11px] font-mono text-[#70665F] uppercase">Active Item Categories</span>
          <div className="text-2xl font-black text-indigo-400">{itemCategories.length}</div>
          <span className="text-[10px] text-[#70665F]">Organized hierarchy</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search Item Code, Name, Specification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600 w-64"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
          >
            <option value="all">All Item Types</option>
            <option value="Plate">Plate</option>
            <option value="Pipe">Pipe</option>
            <option value="Bought-Out Item">Bought-Out Item</option>
            <option value="Consumable">Consumable</option>
            <option value="Hardware">Hardware</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((c) => {
              const cName = c.categoryName || (c as any).name || c.categoryCode;
              return (
                <option key={c.id || c.categoryCode} value={cName}>
                  {cName}
                </option>
              );
            })}
          </select>
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Showing <span className="text-[#211B17] font-bold">{filteredItems.length}</span> of {itemMasters.length} items
        </div>
      </div>

      {/* Item Master Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Type & Category</th>
                <th className="p-3.5">Specification & HSN</th>
                <th className="p-3.5">UOM</th>
                <th className="p-3.5 text-right">Min / Max Stock</th>
                <th className="p-3.5 text-right">Reorder Level</th>
                <th className="p-3.5 text-right">Std Cost (₹)</th>
                <th className="p-3.5 text-center">Batch / Serial</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3.5 font-medium">
                    <div className="font-bold text-[#211B17] text-xs">{item.itemCode}</div>
                    <div className="text-[11px] text-[#70665F] mt-0.5">{item.itemName}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- text-[10px] font-semibold border border-crm-brand-600/30">
                      {item.itemType}
                    </span>
                    <div className="text-[10px] text-[#70665F] mt-1">{item.category}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-[#544B45] text-xs font-mono">{item.specification}</div>
                    <div className="text-[10px] text-[#70665F] mt-0.5">HSN: {item.hsnSac} | GST: {item.gstRate}%</div>
                  </td>
                  <td className="p-3.5 font-bold text-[#544B45]">{item.uom}</td>
                  <td className="p-3.5 text-right font-mono">
                    <div className="text-emerald-400 font-bold">{item.minimumStock}</div>
                    <div className="text-[10px] text-[#70665F]">Max: {item.maximumStock}</div>
                  </td>
                  <td className="p-3.5 text-right font-mono text-amber-400 font-bold">{item.reorderLevel}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-[#211B17]">₹{item.standardCost?.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono">
                      {item.batchTracking && <span className="px-1.5 py-0.2 rounded bg-crm-brand-600/20 text-crm-brand- border border-crm-brand-600/30">Batch</span>}
                      {item.serialTracking && <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Serial</span>}
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit Item Master"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.itemCode)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Item Master"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                Edit Item Master: {editingItem.itemCode}
              </h2>
              <button onClick={() => setEditingItem(null)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.itemCode}
                    onChange={(e) => setEditingItem({ ...editingItem, itemCode: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.itemName}
                    onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Item Type</label>
                  <select
                    value={editingItem.itemType}
                    onChange={(e) => setEditingItem({ ...editingItem, itemType: e.target.value as ItemType })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17]"
                  >
                    <option value="Plate">Plate</option>
                    <option value="Pipe">Pipe</option>
                    <option value="Bought-Out Item">Bought-Out Item</option>
                    <option value="Consumable">Consumable</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17]"
                  >
                    {availableCategories.map((c) => {
                      const cName = c.categoryName || (c as any).name || c.categoryCode;
                      return (
                        <option key={c.id || c.categoryCode} value={cName}>
                          {cName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">UOM</label>
                  <select
                    value={editingItem.uom}
                    onChange={(e) => setEditingItem({ ...editingItem, uom: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17]"
                  >
                    {availableUOMs.map((u) => {
                      const uCode = u.uomCode || (u as any).code || u.uomName;
                      const uName = u.uomName || (u as any).name || uCode;
                      return (
                        <option key={u.id || uCode} value={uCode}>
                          {uCode} - {uName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Technical Specification</label>
                <input
                  type="text"
                  value={editingItem.specification || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, specification: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17]"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Min Stock</label>
                  <input
                    type="number"
                    value={editingItem.minimumStock}
                    onChange={(e) => setEditingItem({ ...editingItem, minimumStock: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={editingItem.reorderLevel}
                    onChange={(e) => setEditingItem({ ...editingItem, reorderLevel: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Standard Cost (₹)</label>
                  <input
                    type="number"
                    value={editingItem.standardCost}
                    onChange={(e) => setEditingItem({ ...editingItem, standardCost: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={editingItem.hsnSac || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, hsnSac: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-semibold"
                >
                  Update Item Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Package className="w-5 h-5 text-crm-brand-500" />
                Add New Item to Master Catalog
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.itemCode}
                    onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                    placeholder="e.g. RM-SS316-12MM"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder="e.g. SS 316L Plate 12mm"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Item Type</label>
                  <select
                    value={formData.itemType}
                    onChange={(e) => setFormData({ ...formData, itemType: e.target.value as ItemType })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    <option value="Plate">Plate</option>
                    <option value="Pipe">Pipe</option>
                    <option value="Bought-Out Item">Bought-Out Item</option>
                    <option value="Consumable">Consumable</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    {availableCategories.map((c) => {
                      const cName = c.categoryName || (c as any).name || c.categoryCode;
                      return (
                        <option key={c.id || c.categoryCode} value={cName}>
                          {cName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">UOM</label>
                  <select
                    value={formData.uom}
                    onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    {availableUOMs.map((u) => {
                      const uCode = u.uomCode || (u as any).code || u.uomName;
                      const uName = u.uomName || (u as any).name || uCode;
                      return (
                        <option key={u.id || uCode} value={uCode}>
                          {uCode} - {uName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Technical Specification</label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  placeholder="e.g. ASME SA 240 SS 316L Prime Grade"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Min Stock</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Reorder Level</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Standard Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.standardCost}
                    onChange={(e) => setFormData({ ...formData, standardCost: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={formData.hsnSac}
                    onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
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
                  Save Item Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
