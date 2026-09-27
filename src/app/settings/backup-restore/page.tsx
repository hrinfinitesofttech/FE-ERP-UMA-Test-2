'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  Clock,
  Plus,
  RefreshCw,
  FileCheck,
  Server,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { BackupRecord } from '../../../types/testing';

export default function BackupRestorePage() {
  const { backupRecords, createBackupRecord, restoreBackupRecord } = useERP();

  const [selectedType, setSelectedType] = useState<BackupRecord['type']>('Full_System');
  const [isBackupInProgress, setIsBackupInProgress] = useState<boolean>(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreateSnapshot = () => {
    setIsBackupInProgress(true);
    setTimeout(() => {
      createBackupRecord(selectedType);
      setIsBackupInProgress(false);
      showToast('Encrypted system backup snapshot created successfully!');
    }, 1200);
  };

  const handleRestore = (id: string, backupNo: string) => {
    if (confirm(`Are you sure you want to restore ERP database to snapshot ${backupNo}? All current states will be aligned.`)) {
      setRestoringId(id);
      setTimeout(() => {
        restoreBackupRecord(id);
        setRestoringId(null);
        showToast(`ERP System successfully restored to snapshot ${backupNo}!`);
      }, 1500);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-xs border border-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-[#EBE3DB] p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-crm-brand-600/10 border border-crm-brand-600/20 rounded-xl text-crm-brand-500">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#211B17] tracking-wide">
                Disaster Recovery & Backup Management
              </h1>
              <p className="text-xs text-[#70665F]">
                Uma Techno Fab Manufacturing ERP — High Availability Offsite Cloud Backups & Instant Restore Snapshots
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-[#FAF7F2] text-xs text-[#211B17] px-3 py-2.5 rounded-xl border border-[#EBE3DB] focus:outline-none cursor-pointer"
          >
            <option value="Full_System">Full ERP System & Files</option>
            <option value="Database_Only">Database Only (SQL Dump)</option>
            <option value="Documents_Only">Uploaded Documents & CAD Files</option>
          </select>

          <button
            onClick={handleCreateSnapshot}
            disabled={isBackupInProgress}
            className="flex items-center gap-2 px-4 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-600 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-crm-brand-700/20 disabled:opacity-50"
          >
            <Plus className={cn('w-4 h-4', isBackupInProgress && 'animate-spin')} />
            {isBackupInProgress ? 'Creating Backup...' : 'Create Instant Snapshot'}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-crm-brand-500 font-bold text-xs">
            <Server className="w-4 h-4" />
            Active Cloud Storage Target
          </div>
          <div className="text-sm font-semibold text-[#211B17]">AWS S3 Encrypted Volume</div>
          <div className="text-[11px] text-[#70665F]">Region: ap-south-1 (Mumbai, India) | AES-256 Encryption</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Clock className="w-4 h-4" />
            Automated Cron Schedule
          </div>
          <div className="text-sm font-semibold text-[#211B17]">Daily Midnight (00:00 IST)</div>
          <div className="text-[11px] text-[#70665F]">Retention Policy: 30 Daily / 12 Monthly Point-in-time Snapshots</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            Recovery Point Objective (RPO)
          </div>
          <div className="text-sm font-semibold text-[#211B17] font-mono">&lt; 5 Minutes RPO</div>
          <div className="text-[11px] text-[#70665F]">Continuous Write-Ahead Log (WAL) Database Replication</div>
        </div>
      </div>

      {/* Backup Log Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#211B17]">
            <HardDrive className="w-4 h-4 text-crm-brand-500" />
            System Backup Snapshots Registry ({backupRecords.length} Snapshots)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[10px] font-semibold text-[#70665F] uppercase tracking-wider border-b border-[#EBE3DB]">
                <th className="py-3 px-4">Backup ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">File Name & Location</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Total Records</th>
                <th className="py-3 px-4">Created Date & By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#544B45]">
              {backupRecords.map((bk) => (
                <tr key={bk.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-crm-brand-500">{bk.backupNo}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF7F2] text-[#544B45] border border-[#EBE3DB]">
                      {bk.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 space-y-0.5">
                    <div className="font-mono text-[#211B17] text-[11px]">{bk.fileName}</div>
                    <div className="text-[10px] text-[#70665F]">{bk.location}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#544B45]">{bk.fileSize}</td>
                  <td className="py-3 px-4 font-mono text-[#544B45]">{bk.recordCount?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[#70665F]">
                    <div>{bk.createdDate}</div>
                    <div className="text-[10px] text-[#70665F]">{bk.createdBy}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      {bk.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => alert(`Downloading snapshot ${bk.fileName} to local system...`)}
                      className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#FAF7F2] text-[#544B45] rounded-lg text-[11px] font-semibold transition border border-[#EBE3DB] inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                    <button
                      onClick={() => handleRestore(bk.id, bk.backupNo)}
                      disabled={restoringId === bk.id}
                      className="px-2.5 py-1 bg-crm-brand-700/20 hover:bg-crm-brand-700/30 text-crm-brand- rounded-lg text-[11px] font-semibold transition border border-crm-brand-600/30 inline-flex items-center gap-1"
                    >
                      <RotateCcw className={cn('w-3 h-3', restoringId === bk.id && 'animate-spin')} />
                      {restoringId === bk.id ? 'Restoring...' : 'Restore'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
