'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { Activity as ActivityIcon, Search, Filter, History, Clock, User, Briefcase } from 'lucide-react';

export default function ProjectActivityPage() {
  const { projectActivities, projectJobs } = useERP();
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = projectActivities.filter((act) => {
    if (selectedProjectId !== 'all' && act.projectId !== selectedProjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery?.toLowerCase();
      return (
        act.action?.toLowerCase().includes(q) ||
        act.details?.toLowerCase().includes(q) ||
        act.userName?.toLowerCase().includes(q) ||
        act.jobNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 font-mono text-[10px] font-bold uppercase tracking-wider border border-sky-500/20">
              Complete Auditability
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-sky-500" />
            Project Activity Trail & Chronological History
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Immutable system logs recording [User + Date + Time + Action] for all project events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#70665F] font-bold">Project Filter:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl text-xs font-bold focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projectJobs.map((p) => (
              <option key={p.id} value={p.id}>{p.projectNumber} ({p.jobNumber}) • {p.customerName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search log by action, user name, details, job #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto text-sky-600">
            <ActivityIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#211B17]">No Activity Logs Found</h3>
          <p className="text-xs text-[#70665F] max-w-md mx-auto">
            There are no recorded activity events matching the current project or search criteria. As team members update planning stages, complete milestones, log delays, or upload drawings, automated chronological logs will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm p-6">
          <div className="relative pl-6 border-l-2 border-[#EBE3DB] space-y-6">
            {filteredActivities.map((act) => (
              <div key={act.id} className="relative group">
                <div className="w-3.5 h-3.5 bg-sky-500 rounded-full absolute -left-[31px] top-1.5 border-4 border-white shadow-sm" />

                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1.5 hover:border-sky-300 transition">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#211B17] text-xs">{act.action}</span>
                      <span className="font-mono text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded text-[10px] border border-sky-200">
                        {act.jobNumber || act.projectId}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#70665F] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#70665F]" />
                      {act.date} at {act.time}
                    </span>
                  </div>

                  <p className="text-[#544B45] text-xs">{act.details}</p>

                  <div className="text-[10px] text-[#70665F] font-semibold flex items-center gap-1.5 pt-1">
                    <User className="w-3 h-3 text-[#70665F]" />
                    <span>Performed by: <strong className="text-[#211B17]">{act.userName}</strong> ({act.userRole})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
