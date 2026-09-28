'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Wallet, Plus, Search, CheckCircle2, FileText, UserCheck } from 'lucide-react';

export default function ExpensesPage() {
  const { expenseEntries, addExpenseEntry, approveExpenseEntry } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [category, setCategory] = useState('Power & Electricity');
  const [amount, setAmount] = useState<number | string>('');
  const [claimedBy, setClaimedBy] = useState('Rajesh Patel');
  const [description, setDescription] = useState('');

  const filtered = expenseEntries.filter(
    (e) =>
      e.expenseNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (e.claimedBy || e.vendorName || '')?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount) || 0;
    addExpenseEntry({
      expenseDate: new Date().toISOString().split('T')[0],
      category,
      subTotal: numAmount,
      taxAmount: (numAmount * 18) / 100,
      grandTotal: numAmount * 1.18,
      claimedBy,
      paymentMode: 'Bank_Transfer',
      status: 'Pending_Approval',
      description,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/20 rounded-xl text-orange-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Factory & Operating Expense Tracker</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Admin & Manufacturing Overhead Vouchers • Management Approval Workflow</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Expense Entry</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search expense, category, claimed by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
        <table className="w-full text-left text-xs text-[#544B45]">
          <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
            <tr>
              <th className="py-3.5 px-4">Expense No</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Claimed By</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-right">Taxable SubTotal</th>
              <th className="py-3.5 px-4 text-right">Total (Inc Tax)</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-white/40 transition">
                <td className="py-3 px-4 font-bold text-orange-400">{e.expenseNumber}</td>
                <td className="py-3 px-4 text-[#70665F] font-sans">{e.expenseDate}</td>
                <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{e.category}</td>
                <td className="py-3 px-4 font-sans text-[#544B45]">{e.claimedBy}</td>
                <td className="py-3 px-4 font-sans text-[#70665F] truncate max-w-xs">{e.description}</td>
                <td className="py-3 px-4 text-right text-[#544B45]">₹{(e.subTotal || e.amount || 0)?.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-[#211B17]">₹{(e.grandTotal || e.totalAmount || e.amount || 0)?.toLocaleString()}</td>
                <td className="py-3 px-4 text-center font-sans">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      e.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-sans">
                  {e.status !== 'Approved' ? (
                    <button
                      onClick={() => approveExpenseEntry(e.id, 'Super Admin')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-[10px] font-semibold rounded-lg transition"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-[#70665F] text-[10px]">Approved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-[#211B17] border-b border-[#EBE3DB] pb-3">Log Factory Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                >
                  <option value="Power & Electricity">Power & Electricity</option>
                  <option value="Factory Maintenance">Factory Maintenance</option>
                  <option value="Machine Fuel & Lubricants">Machine Fuel & Lubricants</option>
                  <option value="Logistics & Freight">Logistics & Freight</option>
                  <option value="Office & Admin">Office & Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">SubTotal Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Claimed By</label>
                <input
                  type="text"
                  required
                  value={claimedBy}
                  onChange={(e) => setClaimedBy(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Description / Bill Ref</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-white text-[#544B45]">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-[#211B17] font-semibold">
                  Submit Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
