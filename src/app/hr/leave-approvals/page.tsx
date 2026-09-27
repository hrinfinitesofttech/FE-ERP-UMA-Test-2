'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { CheckSquare, CheckCircle2, XCircle, Clock, ShieldCheck, UserCheck, Calendar } from 'lucide-react';

export default function LeaveApprovalsPage() {
  const { leaveRequests, updateLeaveRequestStatus, currentUser } = useERP();

  const pendingRequests = leaveRequests.filter((l) => l.status === 'Pending');

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-green-400" />
            Leave Approval & Sign-Off Portal
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            4-Level Hierarchy Approval: Employee -&gt; Manager -&gt; HOD -&gt; HR Final Approval
          </p>
        </div>
      </div>

      {/* Pending Approval List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" /> Pending Leave Approvals ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="p-8 bg-white/60 border border-[#EBE3DB]/60 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-[#211B17]">All Leave Requests Cleared!</h3>
            <p className="text-xs text-[#70665F]">There are no pending leave requests awaiting manager or HR authorization.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE3DB]/60 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-400">{req.leaveNumber}</span>
                    <h3 className="text-base font-bold text-[#211B17]">{req.employeeName}</h3>
                    <div className="text-xs text-[#70665F]">Dept: {req.department} | Manager: {req.reportingManager}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateLeaveRequestStatus(req.id, 'Rejected', currentUser?.name)}
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-lg transition"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => updateLeaveRequestStatus(req.id, 'Approved', currentUser?.name)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-bold rounded-lg shadow transition"
                    >
                      Approve & Grant Leave
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/60 p-4 rounded-lg border border-[#EBE3DB]/50 text-xs">
                  <div>
                    <span className="text-[#70665F] block font-semibold">Requested Dates</span>
                    <span className="text-[#211B17] font-mono">{req.fromDate} to {req.toDate}</span>
                    <span className="text-emerald-400 font-bold block mt-1">{req.numberOfDays} Day(s)</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block font-semibold">Leave Type & Available Balance</span>
                    <span className="text-[#3E2723] font-bold">{req.leaveName}</span>
                    <span className="text-amber-400 block mt-1">12 Days Available in Quota</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block font-semibold">Application Reason</span>
                    <span className="text-[#544B45] italic">&quot;{req.reason}&quot;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
