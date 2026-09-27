'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Users,
  Plus,
  Search,
  Building,
  Phone,
  Mail,
  UserCheck,
  Star,
  X,
} from 'lucide-react';
import { SupplierContact } from '../../../types/purchase';

export default function SupplierContactsPage() {
  const { supplierContacts, suppliers, addSupplierContact } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Contact Form
  const [newSupplierId, setNewSupplierId] = useState(suppliers[0]?.id || 'SUP-001');
  const [newName, setNewName] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDepartment, setNewDepartment] = useState('Sales');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newIsPrimary, setNewIsPrimary] = useState(true);

  const filteredContacts = supplierContacts.filter(c => {
    if (supplierFilter !== 'ALL' && c.supplierId !== supplierFilter) return false;
    if (searchQuery) {
      const q = searchQuery?.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.supplierName?.toLowerCase().includes(q) ||
        c.designation?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSupp = suppliers.find(s => s.id === newSupplierId);
    const suppName = targetSupp ? targetSupp.name : 'Supplier';

    const newContact: SupplierContact = {
      id: `SC-${Date.now()}`,
      supplierId: newSupplierId,
      supplierName: suppName,
      name: newName,
      designation: newDesignation || 'Sales Manager',
      department: newDepartment,
      phone: newPhone,
      email: newEmail,
      isPrimaryContact: newIsPrimary,
      notes: 'Added via Supplier Contacts directory',
      createdAt: new Date().toISOString(),
    };

    addSupplierContact(newContact);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand-500 text-xs font-mono font-bold border border-crm-brand-600/30">
              SUPPLIER CONTACTS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Supplier Key Contact Directory</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Sales, Logistics, Accounts & Technical contact persons for expediting purchase orders.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-crm-brand-700/30 transition"
        >
          <Plus className="w-4 h-4" />
          Add Supplier Contact
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search contact name, supplier, designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600 w-64"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F]">Supplier:</span>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredContacts.length}</span> contact persons
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map(contact => (
          <div
            key={contact.id}
            className="bg-white border border-[#EBE3DB] hover:border-crm-brand-600/50 rounded-2xl p-5 space-y-3 transition shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-crm-brand-500 font-bold bg-crm-brand-600/10 px-2 py-0.5 rounded border border-crm-brand-600/20">
                  {contact.department}
                </span>
                <h3 className="text-sm font-bold text-[#211B17] mt-1.5 flex items-center gap-1.5">
                  {contact.name}
                  {contact.isPrimaryContact && (
                    <span title="Primary Contact">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#70665F]">{contact.designation}</p>
              </div>

              <div className="w-8 h-8 rounded-full bg-crm-brand-700/20 text-crm-brand- font-bold text-xs flex items-center justify-center border border-crm-brand-600/30">
                {contact.name.slice(0, 2)?.toUpperCase()}
              </div>
            </div>

            <div className="pt-2 border-t border-[#EBE3DB] space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-[#70665F]" />
                <span className="text-[#544B45] font-semibold truncate">{contact.supplierName}</span>
              </div>
              <div className="flex items-center gap-2 text-[#544B45]">
                <Phone className="w-3.5 h-3.5 text-[#70665F]" />
                <a href={`tel:${contact.phone}`} className="hover:text-crm-brand-500 font-mono">{contact.phone}</a>
              </div>
              <div className="flex items-center gap-2 text-[#544B45]">
                <Mail className="w-3.5 h-3.5 text-[#70665F]" />
                <a href={`mailto:${contact.email}`} className="hover:text-crm-brand-500 font-mono truncate">{contact.email}</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD CONTACT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211B17]">Add Supplier Contact Person</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Supplier</label>
                <select
                  value={newSupplierId}
                  onChange={(e) => setNewSupplierId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Rajesh Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="Sr. Manager Sales"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Dispatch / Logistics">Dispatch / Logistics</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Phone / Mobile</label>
                  <input
                    type="text"
                    placeholder="+91 98250 12345"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="rajesh@supplier.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-[#544B45] pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsPrimary}
                  onChange={(e) => setNewIsPrimary(e.target.checked)}
                  className="rounded bg-[#FAF7F2] text-crm-brand-600"
                />
                <span>Set as Primary Contact for this Supplier</span>
              </label>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold rounded-xl">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
