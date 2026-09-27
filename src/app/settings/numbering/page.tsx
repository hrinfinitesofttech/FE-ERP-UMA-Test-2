'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { NumberingSetting } from '../../../types/crm';
import { Hash, Edit, Save, CheckCircle2 } from 'lucide-react';

export default function NumberingSettingsPage() {
  const { numbering, updateNumbering } = useERP();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrefix, setEditPrefix] = useState('');
  const [editDigits, setEditDigits] = useState(4);
  const [savedMsg, setSavedMsg] = useState('');

  const startEdit = (item: NumberingSetting) => {
    setEditingId(item.id);
    setEditPrefix(item.prefix);
    setEditDigits(item.digitCount);
  };

  const saveEdit = (item: NumberingSetting) => {
    const nextPreview = `${editPrefix}${String(item.currentNumber + 1).padStart(editDigits, '0')}`;
    updateNumbering(item.id, {
      prefix: editPrefix,
      digitCount: editDigits,
      samplePreview: nextPreview,
    });
    setEditingId(null);
    setSavedMsg(`Updated numbering series for ${item.module} - ${item.docType?.toUpperCase()}`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const columns: Column<NumberingSetting>[] = [
    {
      header: 'Module',
      accessorKey: 'module',
      cell: (n) => <span className="font-bold text-slate-800 dark:text-[#544B45]">{n.module}</span>,
    },
    {
      header: 'Document Type',
      cell: (n) => <span className="font-mono uppercase font-bold text-crm-brand-700">{n.docType}</span>,
    },
    {
      header: 'Prefix Pattern',
      cell: (n) =>
        editingId === n.id ? (
          <input
            type="text"
            value={editPrefix}
            onChange={(e) => setEditPrefix(e.target.value)}
            className="px-2 py-1 bg-white dark:bg-[#FAF7F2] border rounded font-mono font-bold text-xs"
          />
        ) : (
          <span className="font-mono font-bold text-slate-800 dark:text-[#544B45]">{n.prefix}</span>
        ),
    },
    {
      header: 'Current Counter',
      accessorKey: 'currentNumber',
      cell: (n) => <span className="font-mono">{n.currentNumber}</span>,
    },
    {
      header: 'Digit Padding',
      cell: (n) =>
        editingId === n.id ? (
          <input
            type="number"
            min={3}
            max={6}
            value={editDigits}
            onChange={(e) => setEditDigits(Number(e.target.value))}
            className="w-16 px-2 py-1 bg-white dark:bg-[#FAF7F2] border rounded font-mono text-xs"
          />
        ) : (
          <span className="font-mono">{n.digitCount} digits</span>
        ),
    },
    {
      header: 'Next Auto Number Preview',
      cell: (n) => (
        <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800">
          {n.samplePreview}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (n) =>
        editingId === n.id ? (
          <button
            onClick={() => saveEdit(n)}
            className="px-2.5 py-1 bg-crm-brand-700 text-white rounded font-bold text-xs flex items-center gap-1"
          >
            <Save className="w-3 h-3" /> Save
          </button>
        ) : (
          <button
            onClick={() => startEdit(n)}
            className="p-1 rounded text-[#70665F] hover:text-crm-brand-700 hover:bg-slate-100 dark:hover:bg-[#FAF7F2]"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
          <Hash className="w-5 h-5 text-crm-brand-700" />
          Configurable Document Numbering Series
        </h1>
        <p className="text-[#70665F] mt-0.5">
          Define automatic prefixes and counter padding for Leads, Quotations, Sales Orders, Projects, and Jobs.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold">
          ✓ {savedMsg}
        </div>
      )}

      <DataTable
        title="Numbering Rules Table"
        columns={columns}
        data={numbering}
      />
    </div>
  );
}
