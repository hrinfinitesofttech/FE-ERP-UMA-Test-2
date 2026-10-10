'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ItemCategory } from '../../../types/store';
import { Layers, Plus, Search, Tag, CheckCircle } from 'lucide-react';

export default function ItemCategoriesPage() {
  const { itemCategories, addItemCategory } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availableCategories = itemCategories || [];

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [parent, setParent] = useState('Raw Materials');
  const [desc, setDesc] = useState('');

  const filtered = availableCategories.filter((c) => {
    const cCode = c.categoryCode || (c as any).code || '';
    const cName = c.categoryName || (c as any).name || '';
    const cDesc = c.description || '';
    return (
      !searchTerm?.trim() ||
      cCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cDesc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    addItemCategory({
      categoryCode: code.trim().toUpperCase(),
      categoryName: name.trim(),
      parentCategory: parent,
      description: desc.trim(),
      status: 'Active',
    });
    setIsModalOpen(false);
    setCode('');
    setName('');
    setDesc('');
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30 text-xs font-mono font-semibold">
              CLASSIFICATION
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Item Categories & Hierarchy</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Manage material category taxonomies, parent groupings, and accounting classification rules.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-crm-brand-700 text-white text-xs font-bold shadow-lg shadow-crm-brand-700/30 hover:bg-crm-brand-600 transition"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search category code, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-crm-brand-600"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Total Categories: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => {
          const cCode = cat.categoryCode || (cat as any).code || (cat as any).category_code || cat.id || 'CAT';
          const cName = cat.categoryName || (cat as any).name || (cat as any).category_name || (cat.description ? cat.description.split(',')[0] : 'Item Category');
          const pGroup = cat.parentCategory || (cat as any).parent_category || (cat as any).parentGroup || 'Top Level';
          return (
            <div key={cat.id || cCode} className="bg-white border border-[#EBE3DB] p-5 rounded-2xl shadow-md hover:border-[#D4C3B3] transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-crm-brand-600/20 text-crm-brand-700 border border-crm-brand-600/30">
                    <Tag className="w-4 h-4 text-crm-brand-700" />
                  </span>
                  <div>
                    <div className="text-xs font-mono text-crm-brand-700 font-bold">{cCode}</div>
                    <h3 className="text-sm font-bold text-[#211B17] mt-0.5">{cName}</h3>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                  {cat.status || 'Active'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-[#EBE3DB] text-xs space-y-1 text-[#544B45]">
                <div className="flex items-center justify-between">
                  <span className="text-[#70665F] text-[11px]">Parent Group:</span>
                  <span className="font-semibold text-[#544B45]">{pGroup}</span>
                </div>
                <div className="text-[#70665F] text-[11px] leading-relaxed pt-1">{cat.description || 'Standard item classification'}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Layers className="w-5 h-5 text-crm-brand-500" />
                Add Item Category
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Category Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. RAW-ALLOY"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Special Nickel Alloy Plates"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Parent Group</label>
                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                >
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Bought-Out Items">Bought-Out Items</option>
                  <option value="Consumables">Consumables</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Finished Goods">Finished Goods</option>
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Details regarding category specifications and scope..."
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
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
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 text-white hover:bg-crm-brand-600 text-xs font-semibold shadow-lg shadow-crm-brand-700/30"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
