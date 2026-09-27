'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { ProjectCostItem } from '../../../types/crm';
import { DollarSign, ShieldAlert, Edit, Save, Plus, X, Lock, TrendingUp, TrendingDown } from 'lucide-react';

export default function ProjectCostPage() {
  const { projectCosts, updateProjectCost, projectJobs, can, currentUser } = useERP();
  const [selectedProjectId, setSelectedProjectId] = useState('PRJ-2026-0001');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [estVal, setEstVal] = useState<number>(0);
  const [actVal, setActVal] = useState<number>(0);
  const [permissionErr, setPermissionErr] = useState('');

  const activeProject = projectJobs.find((p) => p.id === selectedProjectId) || projectJobs[0];
  const costs = projectCosts.filter((c) => c.projectId === activeProject.id || c.jobNumber === activeProject.jobNumber);

  const totalEstimated = costs.reduce((sum, c) => sum + c.estimatedCost, 0);
  const totalActual = costs.reduce((sum, c) => sum + c.actualCost, 0);
  const totalVariance = totalEstimated - totalActual;

  const canEditCost = can('project', 'cost', 'edit') || currentUser.roleName?.toLowerCase().includes('admin');

  const handleStartEdit = (cost: ProjectCostItem) => {
    if (!canEditCost) {
      setPermissionErr('Financial Permission Locked: Employees cannot alter financial cost records without manager approval.');
      return;
    }
    setEditingId(cost.id);
    setEstVal(cost.estimatedCost);
    setActVal(cost.actualCost);
    setPermissionErr('');
  };

  const handleSaveEdit = (costId: string) => {
    try {
      updateProjectCost(costId, {
        estimatedCost: Number(estVal),
        actualCost: Number(actVal),
      });
      setEditingId(null);
    } catch (err: any) {
      setPermissionErr(err.message || 'Unauthorized action');
    }
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
              Financial Variance Control
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Project Cost Tracking (Estimated vs Actual)
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Monitor budget vs actual costs across 9 manufacturing cost categories. Financial values are RBAC locked.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#70665F] font-bold">Select Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl text-xs font-bold focus:outline-none"
          >
            {projectJobs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectNumber} ({p.jobNumber}) • {p.customerName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {permissionErr && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>{permissionErr}</span>
        </div>
      )}

      {/* KPI Cost Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
          <div className="text-[#70665F] font-bold mb-1">Total Order Value</div>
          <div className="text-lg font-black text-slate-900 dark:text-[#211B17] font-mono">{formatCurrency(activeProject?.orderValue || 0)}</div>
        </div>
        <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
          <div className="text-[#70665F] font-bold mb-1">Total Estimated Cost</div>
          <div className="text-lg font-black text-crm-brand-600 font-mono">{formatCurrency(totalEstimated)}</div>
        </div>
        <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
          <div className="text-[#70665F] font-bold mb-1">Total Actual Spent</div>
          <div className="text-lg font-black text-crm-brand-600 font-mono">{formatCurrency(totalActual)}</div>
        </div>
        <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
          <div className="text-[#70665F] font-bold mb-1">Budget Variance (Diff)</div>
          <div className={`text-lg font-black font-mono ${totalVariance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatCurrency(totalVariance)}
          </div>
        </div>
      </div>

      {/* 9 Categories Cost Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] flex justify-between items-center bg-slate-50 dark:bg-white">
          <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Category Breakdown</h3>
          {!canEditCost && (
            <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1 font-bold">
              <Lock className="w-3 h-3" /> Financial Editing Locked (Requires Accounting / Manager Perm)
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-white text-[#70665F] font-semibold border-b border-slate-200 dark:border-[#EBE3DB]">
              <tr>
                <th className="p-3">Cost Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Estimated Cost</th>
                <th className="p-3">Actual Cost</th>
                <th className="p-3">Difference (Savings/Overrun)</th>
                <th className="p-3">Updated By / Date</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#EBE3DB]">
              {costs.map((c) => {
                const isEditing = editingId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-white transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-[#211B17]">{c.category}</td>
                    <td className="p-3 text-[#70665F]">{c.description}</td>
                    <td className="p-3 font-mono font-bold text-crm-brand-600">
                      {isEditing ? (
                        <input
                          type="number"
                          value={estVal}
                          onChange={(e) => setEstVal(Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-100 dark:bg-[#FAF7F2] border rounded font-mono"
                        />
                      ) : (
                        formatCurrency(c.estimatedCost)
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-crm-brand-600">
                      {isEditing ? (
                        <input
                          type="number"
                          value={actVal}
                          onChange={(e) => setActVal(Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-100 dark:bg-[#FAF7F2] border rounded font-mono"
                        />
                      ) : (
                        formatCurrency(c.actualCost)
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={c.difference >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                        {formatCurrency(c.difference)}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-[#70665F] font-mono">
                      {c.updatedBy} ({c.updatedAt})
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(c.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="p-1.5 bg-slate-100 dark:bg-[#FAF7F2] hover:bg-slate-200 text-slate-600 dark:text-[#544B45] rounded font-bold"
                          title="Edit Financial Cost"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
