'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Truck,
  Plus,
  Search,
  Clock,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  Send,
} from 'lucide-react';
import { PurchaseFollowUp } from '../../../types/purchase';

export default function PurchaseFollowupPage() {
  const { purchaseFollowUps, purchaseOrders, addPurchaseFollowUp, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Follow-up state
  const [selectedPoId, setSelectedPoId] = useState(purchaseOrders[0]?.id || 'PO-001');
  const [newFollowUpDate, setNewFollowUpDate] = useState(new Date().toISOString().split('T')[0]);
  const [newContactedPerson, setNewContactedPerson] = useState('Mr. Rajesh Sharma');
  const [newCommChannel, setNewCommChannel] = useState<'Phone' | 'Email' | 'WhatsApp' | 'Site Visit'>('Phone');
  const [newCommitmentDate, setNewCommitmentDate] = useState('2026-10-22');
  const [newDelayRisk, setNewDelayRisk] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newRemarks, setNewRemarks] = useState('Supplier confirmed material cutting completed, dispatched expected in 2 days.');

  const filteredFollowups = purchaseFollowUps.filter(f => {
    if (searchQuery) {
      const q = searchQuery?.toLowerCase();
      return (
        f.poNumber?.toLowerCase().includes(q) ||
        f.supplierName?.toLowerCase().includes(q) ||
        f.contactedPerson?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddFollowupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const poObj = purchaseOrders.find(p => p.id === selectedPoId);
    if (!poObj) return;

    const newFU: PurchaseFollowUp = {
      id: `PFU-${Date.now()}`,
      poId: poObj.id,
      poNumber: poObj.poNumber,
      supplierId: poObj.supplierId,
      supplierName: poObj.supplierName,
      followUpDate: newFollowUpDate,
      contactedPerson: newContactedPerson,
      communicationChannel: newCommChannel,
      supplierCommitmentDate: newCommitmentDate,
      delayRisk: newDelayRisk,
      followUpBy: `${currentUser.firstName} ${currentUser.lastName}`,
      remarks: newRemarks,
      nextFollowUpDate: '2026-10-25',
      createdAt: new Date().toISOString(),
    };

    addPurchaseFollowUp(newFU);
    setShowAddModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-mono font-bold border border-sky-500/30">
              EXPEDITING & FOLLOW-UP
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Purchase Order Expediting Manager</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Active tracking of vendor dispatch commitments, delay risk alerts & communication logs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-[#211B17] font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Log Follow-up Call / Entry
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search PO No, Supplier, Contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-sky-500 w-64"
          />
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredFollowups.length}</span> expediting logs
        </div>
      </div>

      {/* Follow-up Logs Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">PO Reference</th>
                <th className="p-3">Supplier Name</th>
                <th className="p-3">Follow-up Date</th>
                <th className="p-3">Contact Person & Channel</th>
                <th className="p-3">Supplier Commitment Date</th>
                <th className="p-3">Delay Risk</th>
                <th className="p-3">Remarks / Summary</th>
                <th className="p-3">Expedited By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredFollowups.map(f => (
                <tr key={f.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-sky-400">{f.poNumber}</td>
                  <td className="p-3 font-semibold text-[#211B17]">{f.supplierName}</td>
                  <td className="p-3 text-[#544B45] font-mono text-[11px]">{f.followUpDate}</td>
                  <td className="p-3">
                    <div className="font-semibold text-[#211B17]">{f.contactedPerson}</div>
                    <div className="text-[10px] text-sky-400 font-mono">Via {f.communicationChannel}</div>
                  </td>
                  <td className="p-3 font-mono text-amber-400 font-bold text-[11px]">{f.supplierCommitmentDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.delayRisk === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      f.delayRisk === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      f.delayRisk === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {f.delayRisk} Risk
                    </span>
                  </td>
                  <td className="p-3 text-[#544B45] max-w-xs truncate" title={f.remarks}>{f.remarks}</td>
                  <td className="p-3 text-[#70665F]">{f.followUpBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD FOLLOW-UP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211B17]">Log Purchase Expediting Entry</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFollowupSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Active Purchase Order</label>
                <select
                  value={selectedPoId}
                  onChange={(e) => setSelectedPoId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                >
                  {purchaseOrders.map(p => (
                    <option key={p.id} value={p.id}>{p.poNumber} - {p.supplierName} ({p.jobId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">Contacted Person</label>
                  <input
                    type="text"
                    value={newContactedPerson}
                    onChange={(e) => setNewContactedPerson(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Channel</label>
                  <select
                    value={newCommChannel}
                    onChange={(e) => setNewCommChannel(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  >
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Site Visit">Site Visit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">New Supplier Commitment Date</label>
                  <input
                    type="date"
                    value={newCommitmentDate}
                    onChange={(e) => setNewCommitmentDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Assessed Delay Risk</label>
                  <select
                    value={newDelayRisk}
                    onChange={(e) => setNewDelayRisk(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Follow-up Remarks</label>
                <textarea
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] h-20"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-[#211B17] font-bold rounded-xl">
                  Save Follow-up Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
