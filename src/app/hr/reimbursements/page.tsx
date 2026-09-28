'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Receipt, Plus, CheckCircle2, Clock, Landmark, Download, X } from 'lucide-react';

export default function ReimbursementsPage() {
  const { reimbursementExpenses, addReimbursementExpense, updateReimbursementStatus, availableEmployees } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'Travel / Conveyance' as const,
    amount: 3250,
    description: 'Site travel to Tata Motors Sanand plant for machine erection.',
    receiptUrl: '/receipts/travel_sanand.pdf',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);

    addReimbursementExpense({
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Member',
      department: emp?.department || 'Maintenance & Services',
      expenseDate: formData.expenseDate,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      receiptUrl: formData.receiptUrl,
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-rose-400" />
            Reimbursements & Employee Expense Claims
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Travel, Client Entertainment & On-Site Tool Purchase Expense Claims with Accounting Voucher Integration
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Submit Expense Claim
        </button>
      </div>

      {/* Reimbursements Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Claim Ref</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Category & Date</th>
                <th className="p-4">Amount Claimed</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {reimbursementExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-4 font-mono text-xs text-rose-400 font-bold">{exp.reimbursementNo}</td>
                  <td className="p-4">
                    <div className="font-bold text-[#211B17]">{exp.employeeName}</div>
                    <div className="text-xs text-[#70665F]">{exp.department}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-[#544B45]">
                    <div className="text-rose-400 font-bold">{exp.category}</div>
                    <div className="text-[#70665F]">{exp.expenseDate}</div>
                  </td>
                  <td className="p-4 font-mono font-extrabold text-emerald-400 text-sm">
                    ₹{exp.amount?.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs text-[#544B45] max-w-xs truncate">&quot;{exp.description}&quot;</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        exp.status === 'Approved' || exp.status === 'Paid via Accounts'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {exp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {exp.status === 'Pending Manager' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateReimbursementStatus(exp.id, 'Approved', 'Sanjay Shah (HOD)')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateReimbursementStatus(exp.id, 'Rejected' as any, 'Sanjay Shah (HOD)')}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded shadow transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-400" /> Submit Expense Claim
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                >
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Expense Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    <option value="Travel / Conveyance">Travel / Conveyance</option>
                    <option value="Client Entertainment">Client Entertainment</option>
                    <option value="Tooling & Site Purchase">Tooling & Site Purchase</option>
                    <option value="Medical">Medical Reimbursement</option>
                    <option value="Mobile Bill">Mobile / Internet Bill</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Amount Claimed (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Expense Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-[#211B17] font-semibold rounded-lg">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
