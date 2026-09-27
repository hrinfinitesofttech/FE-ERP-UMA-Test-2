'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  FileCheck2,
  UserCheck,
  Building,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { PurchaseOrder, PORevision } from '../../../types/purchase';

export default function POApprovalPage() {
  const { purchaseOrders, poRevisions, approvePurchaseOrder, currentUser } = useERP();
  const [activeTab, setActiveTab] = useState<'pending' | 'revisions'>('pending');

  const pendingPOs = purchaseOrders.filter(po => po.status === 'Submitted' || po.status === 'Pending Approval');
  const approvedPOs = purchaseOrders.filter(po => po.status === 'Approved' || po.status === 'Ordered' || po.status === 'Partially Received' || po.status === 'Completed');

  const handleApprovePO = (poId: string) => {
    approvePurchaseOrder(poId, `${currentUser.firstName} ${currentUser.lastName}`);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand-500 text-xs font-mono font-bold border border-crm-brand-600/30">
              APPROVAL & REVISIONS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">PO Approval Workflow & Immutable Revision History</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            3-Tier Approval Control Matrix (<code className="text-crm-brand- font-mono">Executive → Manager → Super Admin</code>) & Version Log.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-white p-1 border border-[#EBE3DB] rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'pending' ? 'bg-crm-brand-700 text-white shadow-md' : 'text-[#70665F] hover:text-white'
            }`}
          >
            Pending Approvals ({pendingPOs.length})
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'revisions' ? 'bg-crm-brand-700 text-white shadow-md' : 'text-[#70665F] hover:text-white'
            }`}
          >
            Revision Audit Logs ({poRevisions.length})
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Purchase Orders Awaiting Approval
          </h2>

          {pendingPOs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPOs.map(po => (
                <div key={po.id} className="bg-white border border-[#EBE3DB] rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {po.poNumber} (Rev-{po.revisionNumber})
                      </span>
                      <h3 className="text-base font-bold text-[#211B17] mt-1.5">{po.supplierName}</h3>
                      <p className="text-xs text-amber-400 font-mono font-semibold">Job Reference: {po.jobId}</p>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        {po.approvalTier || 'Tier 2 - Manager'}
                      </span>
                      <div className="text-lg font-extrabold text-[#211B17] mt-2 font-mono">
                        ₹{po.grandTotal?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1 text-xs text-[#544B45]">
                    <div className="flex justify-between">
                      <span className="text-[#70665F]">Created By:</span>
                      <span className="font-semibold text-[#211B17]">{po.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#70665F]">Expected Delivery:</span>
                      <span className="font-mono text-amber-300">{po.expectedDeliveryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#70665F]">Total Line Items:</span>
                      <span className="font-mono text-[#211B17]">{po.items.length} items</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleApprovePO(po.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Release PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-[#EBE3DB] rounded-2xl text-[#70665F] text-xs">
              No purchase orders currently pending approval. All POs are up to date!
            </div>
          )}
        </div>
      ) : (
        /* Revisions History Log */
        <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-crm-brand-500" />
              Immutable PO Revision Audit Trail
            </h3>
            <span className="text-xs text-[#70665F]">Total Revision Logs: {poRevisions.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-[#544B45]">
              <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Revision</th>
                  <th className="p-3">Revision Date</th>
                  <th className="p-3">Reason for Revision</th>
                  <th className="p-3">Modified By</th>
                  <th className="p-3 text-right">Revised Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB]">
                {poRevisions.map(rev => (
                  <tr key={rev.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="p-3 font-mono font-bold text-emerald-400">{rev.poNumber}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- font-mono text-[10px] font-bold border border-crm-brand-600/30">
                        Rev-{rev.revisionNumber}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[#544B45] text-[11px]">{rev.revisionDate}</td>
                    <td className="p-3 text-[#544B45]">{rev.reasonForRevision}</td>
                    <td className="p-3 font-semibold text-[#211B17]">{rev.revisedBy}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      ₹{rev.revisedGrandTotal?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
