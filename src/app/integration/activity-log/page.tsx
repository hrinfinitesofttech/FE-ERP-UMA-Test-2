'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Activity as ActivityIcon, Filter, Search, User, Clock, Shield } from 'lucide-react';

export default function ActivityLogPage() {
  const { auditLogs } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.notes?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      log.module?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      log.recordId?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#544B45] font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
              <ActivityIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Global ERP Activity & Audit Log</h1>
              <p className="text-xs text-[#70665F] font-medium mt-0.5">
                Immutable Central Audit Trail • Tracking Every Transaction, Approval & Status Modification
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search activity logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#544B45] outline-none focus:border-yellow-500 w-64"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Module / Page</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Record ID</th>
                <th className="py-3.5 px-4">Details / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="py-3 px-4 text-[#70665F] text-[11px]">{new Date(log.timestamp)?.toLocaleString()}</td>
                  <td className="py-3 px-4 font-sans font-bold text-[#211B17]">{log.userName}</td>
                  <td className="py-3 px-4 font-sans text-crm-brand-500">{log.module} / {log.page}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.action === 'APPROVE'
                          ? 'bg-crm-brand-600/20 text-crm-brand-500'
                          : log.action === 'REJECT'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-400">{log.recordId}</td>
                  <td className="py-3 px-4 font-sans text-[#544B45] max-w-md truncate">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
