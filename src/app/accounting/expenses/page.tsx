'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Wallet,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Building,
  DollarSign,
  Receipt,
  Check,
  AlertCircle,
  TrendingUp,
  FileText,
  User,
  CreditCard,
  Calendar,
} from 'lucide-react';

export default function ExpensesPage() {
  const {
    expenseEntries,
    addExpenseEntry,
    approveExpenseEntry,
    deleteExpenseEntry,
    employees,
    costCenters,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [category, setCategory] = useState('Power & Electricity');
  const [subTotal, setSubTotal] = useState<number | string>('');
  const [gstRate, setGstRate] = useState<number>(18);
  const [claimedBy, setClaimedBy] = useState('Rajesh Patel');
  const [vendorName, setVendorName] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank_Transfer');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const numSubTotal = Number(subTotal) || 0;
  const taxAmount = (numSubTotal * gstRate) / 100;
  const grandTotal = numSubTotal + taxAmount;

  // Filtered expenses
  const filtered = useMemo(() => {
    return (expenseEntries || []).filter((e) => {
      const matchesSearch =
        !searchTerm.trim() ||
        e.expenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.claimedBy || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.vendorName || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description || '')?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        e.status?.toLowerCase() === statusFilter.toLowerCase() ||
        (statusFilter === 'Pending' && e.status === 'Pending_Approval');

      return matchesSearch && matchesStatus;
    });
  }, [expenseEntries, searchTerm, statusFilter]);

  // KPI Stats
  const stats = useMemo(() => {
    const list = expenseEntries || [];
    const totalCount = list.length;
    const totalAmount = list.reduce(
      (sum, e) => sum + Number(e.grandTotal ?? e.totalAmount ?? e.amount ?? 0),
      0
    );
    const approvedList = list.filter((e) => e.status === 'Approved');
    const approvedAmount = approvedList.reduce(
      (sum, e) => sum + Number(e.grandTotal ?? e.totalAmount ?? e.amount ?? 0),
      0
    );
    const pendingList = list.filter(
      (e) => e.status === 'Pending_Approval' || e.status === 'Pending' || e.status === 'Draft'
    );
    const pendingAmount = pendingList.reduce(
      (sum, e) => sum + Number(e.grandTotal ?? e.totalAmount ?? e.amount ?? 0),
      0
    );

    return {
      totalCount,
      totalAmount,
      approvedCount: approvedList.length,
      approvedAmount,
      pendingCount: pendingList.length,
      pendingAmount,
    };
  }, [expenseEntries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numSubTotal || numSubTotal <= 0) return;

    addExpenseEntry({
      expenseDate,
      category,
      subTotal: numSubTotal,
      taxAmount,
      grandTotal,
      amount: grandTotal,
      claimedBy,
      vendorName,
      paymentMode,
      status: 'Pending_Approval',
      description,
    });

    setToastMessage(`✓ Expense of ₹${grandTotal.toLocaleString()} logged successfully!`);
    setTimeout(() => setToastMessage(''), 4000);

    // Reset Form
    setSubTotal('');
    setDescription('');
    setVendorName('');
    setIsModalOpen(false);
  };

  const handleApprove = (id: string) => {
    approveExpenseEntry(id, 'Super Admin');
    setToastMessage(`✓ Expense ${id} approved successfully!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDelete = (id: string) => {
    deleteExpenseEntry(id);
    setDeleteConfirmId(null);
    setToastMessage(`✓ Expense ${id} deleted.`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#211B17]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl border border-orange-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Factory & Operating Expense Tracker</h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Admin & Manufacturing Overhead Vouchers • Direct Database & Cash-Flow Sync
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Expense Entry</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70665F]">Total Expenses</span>
            <Receipt className="w-5 h-5 text-crm-brand-700" />
          </div>
          <div className="text-2xl font-extrabold text-[#211B17] mt-2 font-mono">{stats.totalCount}</div>
          <div className="text-[11px] text-[#70665F] mt-1">₹{stats.totalAmount.toLocaleString()} Total Spent</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70665F]">Pending Approval</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2 font-mono">{stats.pendingCount}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">₹{stats.pendingAmount.toLocaleString()} Awaiting Approval</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70665F]">Approved Vouchers</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">{stats.approvedCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">₹{stats.approvedAmount.toLocaleString()} Passed for Payment</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70665F]">Total Expense Volume</span>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#211B17] mt-2 font-mono">
            ₹{stats.totalAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#70665F] mt-1">Across all categories</div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search expense no, category, claimed by, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#70665F] font-semibold">Status:</span>
          {['All', 'Pending_Approval', 'Approved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                statusFilter === st
                  ? 'bg-crm-brand-700 text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#544B45] hover:bg-[#EBE3DB]'
              }`}
            >
              {st === 'Pending_Approval' ? 'Pending' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] uppercase font-bold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Expense No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Claimed By / Vendor</th>
                <th className="py-3.5 px-4">Description / Ref</th>
                <th className="py-3.5 px-4 text-right">Taxable SubTotal</th>
                <th className="py-3.5 px-4 text-right">Grand Total (Inc GST)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#70665F]">
                    No expense records found. Click &quot;+ Log Expense Entry&quot; to add a new expense.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const displaySubTotal = Number(e.subTotal ?? e.amount ?? 0);
                  const displayGrandTotal = Number(e.grandTotal ?? e.totalAmount ?? e.amount ?? 0);

                  return (
                    <tr key={e.id} className="hover:bg-[#FAF7F2]/60 transition font-sans">
                      <td className="py-3 px-4 font-mono font-bold text-orange-600">{e.expenseNumber || e.id}</td>
                      <td className="py-3 px-4 text-[#70665F] whitespace-nowrap">{e.expenseDate || e.date}</td>
                      <td className="py-3 px-4 font-semibold text-[#211B17]">{e.category}</td>
                      <td className="py-3 px-4 text-[#544B45]">
                        <div className="font-medium text-[#211B17]">{e.claimedBy}</div>
                        {e.vendorName && <div className="text-[10px] text-[#70665F] font-mono">Vendor: {e.vendorName}</div>}
                      </td>
                      <td className="py-3 px-4 text-[#70665F] max-w-xs truncate" title={e.description}>
                        {e.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#544B45]">
                        ₹{displaySubTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#211B17]">
                        ₹{displayGrandTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            e.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {e.status === 'Pending_Approval' ? 'Pending' : e.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {e.status !== 'Approved' && (
                            <button
                              onClick={() => handleApprove(e.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition shadow-xs"
                            >
                              Approve
                            </button>
                          )}

                          {deleteConfirmId === e.id ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                              <button
                                onClick={() => handleDelete(e.id)}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[10px] rounded"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(e.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-700">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#211B17]">Log Factory / Operating Expense</h3>
                  <p className="text-[11px] text-[#70665F]">Submit overhead expense voucher for approval</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Expense Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  >
                    <option value="Power & Electricity">Power & Electricity</option>
                    <option value="Factory Maintenance">Factory Maintenance</option>
                    <option value="Machine Fuel & Lubricants">Machine Fuel & Lubricants</option>
                    <option value="Logistics & Freight">Logistics & Freight</option>
                    <option value="Office & Admin">Office & Admin</option>
                    <option value="Safety & PPE Equipment">Safety & PPE Equipment</option>
                    <option value="Consumables & Tools">Consumables & Tools</option>
                    <option value="Legal & Professional Fees">Legal & Professional Fees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Taxable SubTotal (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 145000"
                    value={subTotal}
                    onChange={(e) => setSubTotal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-crm-brand-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">GST Rate</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  >
                    <option value={0}>0% (Exempted)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST (Standard)</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
              </div>

              {/* Tax & Total Summary Preview */}
              {numSubTotal > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#70665F]">GST ({gstRate}%): </span>
                    <strong className="font-mono text-[#211B17]">₹{taxAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[#70665F]">Grand Total: </span>
                    <strong className="font-mono text-base text-crm-brand-800">
                      ₹{grandTotal.toLocaleString()}
                    </strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Claimed By *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Patel"
                    value={claimedBy}
                    onChange={(e) => setClaimedBy(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  >
                    <option value="Bank_Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Petty Cash</option>
                    <option value="UPI">UPI / Digital</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Vendor / Payee Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. MGVCL / Torrent Power / Local Supplier"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Description / Bill Ref</label>
                <textarea
                  rows={2}
                  placeholder="e.g. MGVCL Plant 1 Industrial Power Bill - Sep 2026"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-semibold shadow-sm transition"
                >
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
