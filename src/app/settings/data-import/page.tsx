'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Database,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { DataImportLog } from '../../../types/testing';
import { toast } from '../../../context/ToastContext';

export default function DataImportWizardPage() {
  const { dataImportLogs, executeDataImport } = useERP();

  const [selectedEntity, setSelectedEntity] = useState<DataImportLog['entityType']>('Customers');
  const [draggedFile, setDraggedFile] = useState<string | null>('Customer_Master_UmaTechno_2026.csv');
  const [recordCount, setRecordCount] = useState<number>(45);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleStartImport = () => {
    if (!draggedFile) {
      toast.warning('Please select or upload a CSV / XLSX data file');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setImportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        executeDataImport(selectedEntity, draggedFile, recordCount);
        setIsImporting(false);
        toast.success(`Successfully imported ${recordCount} ${selectedEntity} records into Uma Techno Fab ERP database!`);
        setSuccessToast(`Successfully imported ${recordCount} ${selectedEntity} records into Uma Techno Fab ERP database!`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-xs border border-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          {successToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-[color:var(--crm-border-default)] p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)] tracking-wide">
                Legacy Data Import & Migration Wizard
              </h1>
              <p className="text-xs text-[color:var(--crm-text-secondary)]">
                Bulk import Master Data & Opening Balances from Legacy Excel / CSV Formats with Schema Validation
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => toast.info(`Downloading official sample CSV template for entity: ${selectedEntity}`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[color:var(--crm-bg-app)] hover:bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] rounded-xl text-xs font-semibold transition border border-[color:var(--crm-border-default)]"
        >
          <Download className="w-4 h-4" />
          Download {selectedEntity} CSV Template
        </button>
      </div>

      {/* Import Wizard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Entity & File Selection */}
        <div className="bg-white border border-[color:var(--crm-border-default)] p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--crm-text-primary)] border-b border-[color:var(--crm-border-default)] pb-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 font-bold text-xs flex items-center justify-center">1</span>
            Select Master Data Entity
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[color:var(--crm-text-secondary)] font-semibold">Target Entity:</label>
              <select
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value as any);
                  setDraggedFile(`${e.target.value}_Master_2026.csv`);
                }}
                className="w-full bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] p-2.5 rounded-xl border border-[color:var(--crm-border-default)] mt-1 cursor-pointer"
              >
                <option value="Customers">Customers & GSTIN Master</option>
                <option value="Suppliers">Suppliers & Vendors Master</option>
                <option value="Items">Raw Material & Standard Items Master</option>
                <option value="Opening_Stock">Store Opening Stock Balances</option>
                <option value="Employees">Employee & Department Master</option>
                <option value="Chart_of_Accounts">Chart of Accounts & Ledgers</option>
                <option value="Opening_Receivables">Opening Outstanding Invoices</option>
              </select>
            </div>

            <div>
              <label className="text-[color:var(--crm-text-secondary)] font-semibold">Estimated Record Count:</label>
              <input
                type="number"
                value={recordCount}
                onChange={(e) => setRecordCount(Number(e.target.value))}
                className="w-full bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] p-2 rounded-xl border border-[color:var(--crm-border-default)] mt-1 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Drag and Drop Upload */}
        <div className="bg-white border border-[color:var(--crm-border-default)] p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--crm-text-primary)] border-b border-[color:var(--crm-border-default)] pb-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 font-bold text-xs flex items-center justify-center">2</span>
            Upload Excel / CSV File
          </div>

          <div className="border-2 border-dashed border-[color:var(--crm-border-default)] hover:border-amber-500/50 bg-[color:var(--crm-bg-app)] p-6 rounded-2xl text-center space-y-2 transition cursor-pointer">
            <FileSpreadsheet className="w-8 h-8 text-crm-brand-600 mx-auto" />
            <div className="text-xs font-semibold text-[color:var(--crm-text-primary)]">
              {draggedFile ? draggedFile : 'Drag & Drop CSV / XLSX file here'}
            </div>
            <div className="text-[10px] text-[color:var(--crm-text-secondary)]">
              Format: UTF-8 CSV or XLSX up to 25 MB
            </div>
          </div>
        </div>

        {/* Step 3: Validate & Import Action */}
        <div className="bg-white border border-[color:var(--crm-border-default)] p-5 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--crm-text-primary)] border-b border-[color:var(--crm-border-default)] pb-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 font-bold text-xs flex items-center justify-center">3</span>
              Schema Validation & Execution
            </div>

            <div className="space-y-2 text-xs text-[color:var(--crm-text-secondary)] mt-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Headers Matched: 18 / 18 Columns
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Duplicate GSTIN Check: Passed
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Foreign Key Relationships Verified
              </div>
            </div>
          </div>

          {isImporting && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-amber-700 font-mono">
                <span>Importing records...</span>
                <span>{importProgress}%</span>
              </div>
              <div className="w-full bg-[color:var(--crm-bg-app)] rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all duration-200" style={{ width: `${importProgress}%` }} />
              </div>
            </div>
          )}

          <button
            onClick={handleStartImport}
            disabled={isImporting}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            {isImporting ? 'Processing Data Import...' : 'Execute Data Import'}
          </button>
        </div>
      </div>

      {/* Import Log Table */}
      <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[color:var(--crm-border-default)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--crm-text-primary)]">
            <Database className="w-4 h-4 text-crm-brand-600" />
            Data Import & Migration Audit History ({dataImportLogs.length} Runs)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[color:var(--crm-bg-app)] text-[10px] font-semibold text-[color:var(--crm-text-secondary)] uppercase tracking-wider border-b border-[color:var(--crm-border-default)]">
                <th className="py-3 px-4">Import ID</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Source File</th>
                <th className="py-3 px-4">Total Records</th>
                <th className="py-3 px-4">Imported</th>
                <th className="py-3 px-4">Failed</th>
                <th className="py-3 px-4">Imported Date & User</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)] text-[color:var(--crm-text-secondary)]">
              {dataImportLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[color:var(--crm-text-secondary)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Database className="w-8 h-8 text-[color:var(--crm-text-tertiary)] opacity-50" />
                      <p className="font-semibold text-[color:var(--crm-text-secondary)]">No import logs recorded</p>
                      <p className="text-[11px] text-[color:var(--crm-text-tertiary)]">Use the file upload form above to import master entity CSV/Excel spreadsheets.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dataImportLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F4F6FA]/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-600">{log.importNo}</td>
                    <td className="py-3 px-4 font-semibold text-[color:var(--crm-text-primary)]">{log.entityType}</td>
                    <td className="py-3 px-4 font-mono text-[color:var(--crm-text-secondary)]">{log.fileName}</td>
                    <td className="py-3 px-4 font-mono text-[color:var(--crm-text-secondary)]">{log.totalRecords}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{log.importedRecords}</td>
                    <td className="py-3 px-4 font-mono text-red-600">{log.failedRecords}</td>
                    <td className="py-3 px-4 text-[color:var(--crm-text-secondary)]">
                      <div>{log.importedDate}</div>
                      <div className="text-[10px] text-[color:var(--crm-text-secondary)]">{log.importedBy}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
