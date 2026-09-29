'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { NumberingSetting } from '../../../types/crm';
import { INITIAL_NUMBERING } from '../../../data/dbStore';
import {
  Hash,
  Edit,
  Save,
  CheckCircle2,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
  X,
  Info,
} from 'lucide-react';

export default function NumberingSettingsPage() {
  const { numbering, updateNumbering, addNumbering, resetNumbering } = useERP();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrefix, setEditPrefix] = useState('');
  const [editDigits, setEditDigits] = useState(4);
  const [editCurrentNum, setEditCurrentNum] = useState(0);
  const [savedMsg, setSavedMsg] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  // Add Custom Series Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModule, setNewModule] = useState('CRM & Sales');
  const [newDocType, setNewDocType] = useState<NumberingSetting['docType']>('lead');
  const [newPrefix, setNewPrefix] = useState('LEAD-2026-');
  const [newStartNum, setNewStartNum] = useState(1);
  const [newDigits, setNewDigits] = useState(4);

  // If numbering state is empty, use initial default series
  const activeNumbering = numbering && numbering.length > 0 ? numbering : INITIAL_NUMBERING;

  const filteredNumbering = activeNumbering.filter((n) => {
    if (moduleFilter === 'ALL') return true;
    return n.module?.toLowerCase() === moduleFilter.toLowerCase();
  });

  const startEdit = (item: NumberingSetting) => {
    setEditingId(item.id);
    setEditPrefix(item.prefix);
    setEditDigits(item.digitCount || 4);
    setEditCurrentNum(item.currentNumber || 0);
  };

  const saveEdit = (item: NumberingSetting) => {
    const nextPreview = `${editPrefix}${String(editCurrentNum + 1).padStart(editDigits, '0')}`;
    updateNumbering(item.id, {
      prefix: editPrefix,
      digitCount: editDigits,
      currentNumber: editCurrentNum,
      samplePreview: nextPreview,
    });
    setEditingId(null);
    setSavedMsg(`Updated numbering series for ${item.module} - ${item.docType?.toUpperCase()}`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleCreateSeries = (e: React.FormEvent) => {
    e.preventDefault();
    addNumbering({
      module: newModule,
      docType: newDocType,
      prefix: newPrefix.trim(),
      currentNumber: Math.max(0, newStartNum - 1),
      digitCount: newDigits,
      samplePreview: `${newPrefix.trim()}${String(newStartNum).padStart(newDigits, '0')}`,
    });
    setShowAddModal(false);
    setSavedMsg(`Successfully added new numbering rule for ${newDocType.toUpperCase()}`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const columns: Column<NumberingSetting>[] = [
    {
      header: 'Module',
      accessorKey: 'module',
      cell: (n) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
          <Layers className="w-3 h-3 text-pink-500" />
          {n.module}
        </span>
      ),
    },
    {
      header: 'Document Type',
      cell: (n) => (
        <div className="flex items-center gap-1.5 font-mono">
          <FileText className="w-3.5 h-3.5 text-[#70665F]" />
          <span className="uppercase font-bold text-[#211B17]">{n.docType?.replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      header: 'Prefix Pattern',
      cell: (n) =>
        editingId === n.id ? (
          <input
            type="text"
            value={editPrefix}
            onChange={(e) => setEditPrefix(e.target.value)}
            className="px-2.5 py-1 bg-white border border-pink-400 rounded-lg font-mono font-bold text-xs text-[#211B17] focus:outline-none ring-1 ring-pink-500/20"
            placeholder="e.g. QT-2026-"
          />
        ) : (
          <span className="font-mono font-bold text-[#211B17] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EBE3DB]">
            {n.prefix}
          </span>
        ),
    },
    {
      header: 'Current Counter',
      cell: (n) =>
        editingId === n.id ? (
          <input
            type="number"
            min={0}
            value={editCurrentNum}
            onChange={(e) => setEditCurrentNum(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 px-2.5 py-1 bg-white border border-pink-400 rounded-lg font-mono text-xs text-[#211B17] focus:outline-none"
          />
        ) : (
          <span className="font-mono text-slate-700 font-semibold">{n.currentNumber}</span>
        ),
    },
    {
      header: 'Digit Padding',
      cell: (n) =>
        editingId === n.id ? (
          <select
            value={editDigits}
            onChange={(e) => setEditDigits(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-pink-400 rounded-lg font-mono text-xs text-[#211B17] focus:outline-none"
          >
            <option value={3}>3 digits (001)</option>
            <option value={4}>4 digits (0001)</option>
            <option value={5}>5 digits (00001)</option>
            <option value={6}>6 digits (000001)</option>
          </select>
        ) : (
          <span className="font-mono text-xs text-[#70665F]">{n.digitCount || 4} digits</span>
        ),
    },
    {
      header: 'Next Auto Number Preview',
      cell: (n) => {
        const preview =
          editingId === n.id
            ? `${editPrefix}${String(editCurrentNum + 1).padStart(editDigits, '0')}`
            : n.samplePreview || `${n.prefix}${String(n.currentNumber + 1).padStart(n.digitCount || 4, '0')}`;
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            {preview}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: (n) =>
        editingId === n.id ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => saveEdit(n)}
              className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-md font-bold text-xs flex items-center gap-1 transition shadow-xs"
            >
              <Save className="w-3 h-3" /> Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="p-1 rounded text-slate-500 hover:bg-slate-100"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => startEdit(n)}
            className="p-1.5 rounded-md text-slate-600 hover:text-pink-600 hover:bg-[#FAF7F2] transition border border-transparent hover:border-[#EBE3DB]"
            title="Edit Pattern & Counter"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        ),
    },
  ];

  const modules = ['ALL', 'CRM & Sales', 'Project Management', 'Production & Shopfloor', 'Accounting & Finance'];

  return (
    <div className="space-y-4 text-xs">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#211B17] flex items-center gap-2 tracking-tight">
            <Hash className="w-6 h-6 text-pink-600" />
            Configurable Document Numbering Series
          </h1>
          <p className="text-xs text-[#70665F] mt-1">
            Define automatic prefixes, fiscal year codes, starting counters, and zero-padding for all ERP generated documents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to restore all standard ERP document numbering series to default?')) {
                resetNumbering();
                setSavedMsg('Restored all document numbering rules to default ERP standard series.');
                setTimeout(() => setSavedMsg(''), 3000);
              }
            }}
            className="px-3 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg border border-[#EBE3DB] transition flex items-center gap-1.5"
            title="Reset series to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Series Rule</span>
          </button>
        </div>
      </div>

      {/* Info Card Explaining the Feature */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">What is this section?</span> Every document created in the ERP (such as <strong>Leads</strong>, <strong>Quotations</strong>, <strong>Sales Orders</strong>, <strong>Invoices</strong>, <strong>Job Cards</strong>) is assigned a sequential unique number automatically. Here you can customize the Prefix (e.g. <code className="bg-amber-200/50 px-1 py-0.5 rounded font-mono font-bold">QT-2026-</code>), starting counter, and zero padding.
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedMsg}
        </div>
      )}

      {/* Module Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {modules.map((m) => (
          <button
            key={m}
            onClick={() => setModuleFilter(m)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition ${
              moduleFilter === m
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white text-[#70665F] hover:bg-[#FAF7F2] border border-[#EBE3DB]'
            }`}
          >
            {m === 'ALL' ? 'All Document Series' : m}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        title={`Numbering Rules (${filteredNumbering.length} Series Configured)`}
        columns={columns}
        data={filteredNumbering}
      />

      {/* Add Custom Series Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Hash className="w-5 h-5 text-pink-600" />
                Add New Document Numbering Series
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSeries} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">ERP Module *</label>
                  <select
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500"
                  >
                    <option value="CRM & Sales">CRM & Sales</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Production & Shopfloor">Production & Shopfloor</option>
                    <option value="Store & Purchase">Store & Purchase</option>
                    <option value="Accounting & Finance">Accounting & Finance</option>
                    <option value="Quality & Maintenance">Quality & Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Document Identifier *</label>
                  <input
                    type="text"
                    required
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    placeholder="e.g. delivery_challan"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Prefix Pattern *</label>
                  <input
                    type="text"
                    required
                    value={newPrefix}
                    onChange={(e) => setNewPrefix(e.target.value)}
                    placeholder="e.g. DC-2026-"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Starting Number *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newStartNum}
                    onChange={(e) => setNewStartNum(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Digit Padding *</label>
                  <select
                    value={newDigits}
                    onChange={(e) => setNewDigits(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-pink-500"
                  >
                    <option value={3}>3 (001)</option>
                    <option value={4}>4 (0001)</option>
                    <option value={5}>5 (00001)</option>
                    <option value={6}>6 (000001)</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Pill */}
              <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl flex items-center justify-between">
                <span className="text-[#70665F] font-medium">Sample Next Auto Number:</span>
                <span className="font-mono font-bold text-sm text-pink-700 bg-pink-100/60 px-3 py-1 rounded-md border border-pink-200">
                  {newPrefix.trim()}{String(newStartNum).padStart(newDigits, '0')}
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] font-semibold hover:bg-[#EBE3DB] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold transition shadow-sm"
                >
                  Save Numbering Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
