'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { Customer } from '../../../types/crm';
import { formatCurrency } from '../../../lib/utils';
import { Building, Plus, ArrowUpRight, Mail, Phone, Edit2, Trash2, X } from 'lucide-react';

export default function CustomersListPage() {
  const router = useRouter();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Speciality Chemicals');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('Vadodara');
  const [state, setState] = useState('Gujarat');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState(10000000);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      customerType: 'company',
      companyName,
      industry,
      gstin: gstin?.toUpperCase(),
      pan: gstin.slice(2, 12) || 'AAACX0000X',
      contactPerson,
      designation: 'General Manager',
      mobile,
      email,
      billingAddress: address,
      shippingAddress: address,
      city,
      state,
      country: 'India',
      pincode: '390010',
      paymentTerms: '30% Advance, 70% against Dispatch',
      creditLimit,
      currency: 'INR (₹)',
      category: 'gold',
      assignedSalesPerson: 'Pravin Patel',
    });

    setCompanyName('');
    setContactPerson('');
    setMobile('');
    setEmail('');
    setGstin('');
    setShowModal(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    updateCustomer(editingCustomer.id, editingCustomer);
    setEditingCustomer(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer account "${name}"?`)) {
      deleteCustomer(id);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Customer Code',
      accessorKey: 'customerCode',
      cell: (c) => <span className="font-mono font-bold text-crm-brand-700">{c.customerCode}</span>,
    },
    {
      header: 'Company Name & GSTIN',
      cell: (c) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-[#211B17] block">{c.companyName}</span>
          <span className="text-[10px] text-[#70665F] font-mono">GST: {c.gstin || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Industry Sector',
      accessorKey: 'industry',
    },
    {
      header: 'Key Contact Person',
      cell: (c) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-[#544B45] block">{c.contactPerson}</span>
          <span className="text-[11px] text-[#70665F]">{c.mobile || c.email}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (c) => (
        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
          {c.category}
        </span>
      ),
    },
    {
      header: 'Credit Limit',
      cell: (c) => <span className="font-mono font-bold text-slate-700 dark:text-[#544B45]">{formatCurrency(c.creditLimit)}</span>,
    },
    {
      header: 'Location',
      cell: (c) => <span className="text-slate-600 dark:text-[#70665F]">{c.city}, {c.state}</span>,
    },
    {
      header: 'Actions',
      cell: (c) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/crm/customers/${c.id}`}
            className="px-2 py-1 bg-crm-brand-50 hover:bg-crm-brand-100 text-crm-brand-800 rounded font-bold text-[11px] flex items-center gap-0.5"
            title="360° Profile"
          >
            <span>Profile</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setEditingCustomer(c)}
            className="p-1 text-amber-600 hover:bg-amber-50 rounded"
            title="Edit Customer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(c.id, c.companyName)}
            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
            title="Delete Customer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Building className="w-5 h-5 text-crm-brand-700" />
            Customer Directory & Accounts Master
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Central repository of corporate manufacturing clients with linked orders, GST, and historical ledgers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <DataTable
        title="Enterprise Customer Accounts"
        columns={columns}
        data={customers}
        onRowClick={(c) => router.push(`/crm/customers/${c.id}`)}
      />

      {/* ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-xl w-full max-w-md p-6 text-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17]">Add New Customer Account</h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Aarti Industries Ltd."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value?.toUpperCase())}
                    placeholder="24AAACX0000X1Z1"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Rajeev Singhal"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98250 XXXXX"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-xl w-full max-w-md p-6 text-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-500" />
                Edit Customer Account: {editingCustomer.customerCode}
              </h3>
              <button onClick={() => setEditingCustomer(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.companyName}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={editingCustomer.gstin || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, gstin: e.target.value?.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Industry</label>
                  <input
                    type="text"
                    value={editingCustomer.industry || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.contactPerson || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={editingCustomer.mobile || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={editingCustomer.city || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={editingCustomer.creditLimit || 0}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                >
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
