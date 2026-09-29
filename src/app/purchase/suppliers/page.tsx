'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Building,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  X,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Supplier } from '../../../types/purchase';

export default function SupplierMasterPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form errors
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  // New Supplier Form State
  const [newVendorCode, setNewVendorCode] = useState(`VEN-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Raw Material' | 'Bought-out Items' | 'Subcontractor' | 'Standard Components' | 'Services'>('Raw Material');
  const [newGstin, setNewGstin] = useState('');
  const [newPan, setNewPan] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('Gujarat');
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Credit');

  const filteredSuppliers = suppliers.filter((s) => {
    if (categoryFilter !== 'ALL' && s.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      return (
        (s.name || s.supplierName || '')?.toLowerCase().includes(q) ||
        (s.vendorCode || s.supplierCode || s.id || '')?.toLowerCase().includes(q) ||
        (s.gstin || '')?.toLowerCase().includes(q) ||
        (s.city || '')?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const validateAddSupplier = () => {
    const errs: Record<string, string> = {};
    if (!newName.trim()) errs.name = 'Supplier company name is required.';
    if (!newGstin.trim()) errs.gstin = 'GSTIN is required.';
    else if (!gstinRegex.test(newGstin.trim().toUpperCase())) {
      errs.gstin = 'Invalid GSTIN (15 characters, e.g. 24AAAAA0000A1Z5).';
    }

    const cleanPhone = newPhone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits.';
    }

    if (newEmail.trim() && !emailRegex.test(newEmail.trim())) {
      errs.email = 'Invalid email address format.';
    }

    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEditSupplier = () => {
    if (!editingSupplier) return false;
    const errs: Record<string, string> = {};
    if (!editingSupplier.name?.trim() && !editingSupplier.supplierName?.trim()) {
      errs.name = 'Supplier company name is required.';
    }
    if (editingSupplier.gstin && !gstinRegex.test(editingSupplier.gstin.trim().toUpperCase())) {
      errs.gstin = 'Invalid GSTIN (15 characters).';
    }
    const cleanPhone = (editingSupplier.phone || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits.';
    }
    if (editingSupplier.email?.trim() && !emailRegex.test(editingSupplier.email.trim())) {
      errs.email = 'Invalid email address format.';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddSupplier()) return;

    const newSupp: Supplier = {
      id: `SUP-${Date.now()}`,
      vendorCode: newVendorCode,
      name: newName.trim(),
      supplierName: newName.trim(),
      category: newCategory,
      gstin: newGstin.toUpperCase().trim(),
      panNumber: newPan.toUpperCase().trim() || newGstin.slice(2, 12).toUpperCase(),
      msmeRegistered: true,
      msmeNumber: 'UDYAM-GJ-01-0098765',
      address: 'Industrial GIDC Area',
      city: newCity || 'Ahmedabad',
      state: newState,
      pinCode: '380015',
      country: 'India',
      contactPerson: newContactPerson.trim(),
      phone: newPhone.replace(/\D/g, '').slice(0, 10),
      email: newEmail.trim(),
      paymentTerms: newPaymentTerms,
      creditPeriodDays: 30,
      bankName: 'HDFC Bank',
      bankAccountNumber: '50200098765432',
      ifscCode: 'HDFC0000123',
      performanceRating: 85,
      status: 'Approved',
      documents: [
        { id: 'DOC-1', documentType: 'GST Certificate', documentName: 'GST_Reg.pdf', fileUrl: '#', uploadDate: '2026-04-01' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addSupplier(newSupp);
    setShowAddModal(false);
    setNewName('');
    setNewGstin('');
    setNewPan('');
    setNewContactPerson('');
    setNewPhone('');
    setNewEmail('');
    setAddErrors({});
  };

  const handleUpdateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    if (!validateEditSupplier()) return;

    const updated = {
      ...editingSupplier,
      supplierName: editingSupplier.name || editingSupplier.supplierName,
      phone: (editingSupplier.phone || '').replace(/\D/g, '').slice(0, 10),
      gstin: editingSupplier.gstin?.toUpperCase().trim(),
      panNumber: editingSupplier.panNumber?.toUpperCase().trim(),
      email: editingSupplier.email?.trim(),
      updatedAt: new Date().toISOString(),
    };

    updateSupplier(editingSupplier.id, updated);
    if (selectedSupplier && selectedSupplier.id === editingSupplier.id) {
      setSelectedSupplier({ ...updated });
    }
    setEditingSupplier(null);
    setEditErrors({});
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete supplier "${name}"? This action cannot be undone.`)) {
      deleteSupplier(id);
      if (selectedSupplier?.id === id) setSelectedSupplier(null);
      if (editingSupplier?.id === id) setEditingSupplier(null);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-indigo-400 text-xs font-mono font-bold border border-crm-brand-600/30">
              SUPPLIER MASTER
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Supplier & Vendor Master Registry</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Verified vendor profiles with GSTIN, MSME registration, payment terms & performance ratings.
          </p>
        </div>

        <button
          onClick={() => {
            setNewVendorCode(`VEN-2026-${Math.floor(100 + Math.random() * 900)}`);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-crm-brand-700/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Supplier Master
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search Vendor Name, Code, GSTIN, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600 w-64"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Raw Material">Raw Material</option>
              <option value="Bought-out Items">Bought-out Items</option>
              <option value="Standard Components">Standard Components</option>
              <option value="Subcontractor">Subcontractor</option>
              <option value="Services">Services</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredSuppliers.length}</span> active vendors
        </div>
      </div>

      {/* Grid of Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => {
          const suppName = supplier.name || supplier.supplierName || 'Unnamed Supplier';
          const suppCode = supplier.vendorCode || supplier.supplierCode || supplier.id;
          return (
            <div
              key={supplier.id}
              className="bg-white border border-[#EBE3DB] hover:border-crm-brand-600/50 rounded-2xl p-5 space-y-3 transition flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-indigo-400 font-bold bg-crm-brand-600/10 px-2 py-0.5 rounded border border-crm-brand-600/20">
                      {suppCode}
                    </span>
                    <h3 className="text-sm font-bold text-[#211B17] mt-1.5 leading-snug">{suppName}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      supplier.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : supplier.status === 'Pending Verification'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {supplier.status || 'Approved'}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-[#544B45]">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-[#70665F]" />
                    <span className="text-[#70665F]">Category:</span>
                    <span className="font-semibold text-[#211B17]">{supplier.category || 'Raw Material'}</span>
                  </div>
                  {supplier.gstin && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#70665F]" />
                      <span className="text-[#70665F]">GSTIN:</span>
                      <span className="font-mono text-emerald-400">{supplier.gstin}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#70665F]" />
                    <span className="text-[#70665F]">Location:</span>
                    <span className="text-[#544B45]">
                      {supplier.city || 'Gujarat'}, {supplier.state || 'India'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#70665F]" />
                    <span className="text-[#70665F]">Contact:</span>
                    <span className="text-[#544B45]">
                      {supplier.contactPerson || 'Sales Desk'} ({supplier.phone || supplier.email || 'N/A'})
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-mono text-xs font-bold text-amber-400">{supplier.performanceRating || 90}%</span>
                  <span className="text-[10px] text-[#70665F]">Rating</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSupplier(supplier)}
                    className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                    title="View Profile"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingSupplier({ ...supplier, name: suppName })}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Edit Supplier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id, suppName)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW SUPPLIER MODAL */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] bg-crm-brand-600/20 text-indigo-400 px-2 py-0.5 rounded font-bold">
                  {selectedSupplier.vendorCode || selectedSupplier.id}
                </span>
                <h2 className="text-lg font-black text-[#211B17] mt-1">
                  {selectedSupplier.name || selectedSupplier.supplierName}
                </h2>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div>
                  <div className="text-[#70665F]">GSTIN Number:</div>
                  <div className="font-mono font-bold text-emerald-400">{selectedSupplier.gstin || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">PAN Number:</div>
                  <div className="font-mono font-bold text-[#211B17]">{selectedSupplier.panNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Payment Terms:</div>
                  <div className="font-semibold text-[#211B17]">{selectedSupplier.paymentTerms || '30 Days'}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">MSME Registered:</div>
                  <div className="font-semibold text-crm-brand-500">
                    {selectedSupplier.msmeRegistered ? `Yes (${selectedSupplier.msmeNumber || 'Verified'})` : 'No'}
                  </div>
                </div>
                <div>
                  <div className="text-[#70665F]">Contact Person:</div>
                  <div className="font-semibold text-[#211B17]">
                    {selectedSupplier.contactPerson || 'N/A'} ({selectedSupplier.phone || selectedSupplier.email || 'N/A'})
                  </div>
                </div>
                <div>
                  <div className="text-[#70665F]">Location:</div>
                  <div className="font-semibold text-[#211B17]">
                    {selectedSupplier.city}, {selectedSupplier.state} - {selectedSupplier.pinCode}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#211B17] mb-1">Banking Information</h4>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] flex justify-between font-mono">
                  <span>Bank: {selectedSupplier.bankName || 'HDFC Bank'}</span>
                  <span>A/C: {selectedSupplier.bankAccountNumber || '502000XXXXXX'}</span>
                  <span>IFSC: {selectedSupplier.ifscCode || 'HDFC0000123'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#EBE3DB] flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const s = selectedSupplier;
                    setSelectedSupplier(null);
                    setEditingSupplier({ ...s, name: s.name || s.supplierName || '' });
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Supplier
                </button>
                <button
                  onClick={() => {
                    const s = selectedSupplier;
                    handleDelete(s.id, s.name || s.supplierName || 'Supplier');
                  }}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-slate-200 text-[#211B17] font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SUPPLIER MODAL */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                Edit Supplier: {editingSupplier.name || editingSupplier.supplierName}
              </h2>
              <button onClick={() => setEditingSupplier(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSupplier} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">Vendor Code</label>
                  <input
                    type="text"
                    value={editingSupplier.vendorCode || editingSupplier.id}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, vendorCode: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Category</label>
                  <select
                    value={editingSupplier.category}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, category: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Bought-out Items">Bought-out Items</option>
                    <option value="Standard Components">Standard Components</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Supplier Company Name *</label>
                <input
                  type="text"
                  value={editingSupplier.name || editingSupplier.supplierName || ''}
                  onChange={(e) => {
                    setEditingSupplier({ ...editingSupplier, name: e.target.value, supplierName: e.target.value });
                    if (editErrors.name) setEditErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`w-full bg-[#FAF7F2] border p-2 rounded-xl text-[#211B17] font-bold ${
                    editErrors.name ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                  }`}
                  required
                />
                {editErrors.name && (
                  <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {editErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">GSTIN Number *</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={editingSupplier.gstin || ''}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
                      setEditingSupplier({ ...editingSupplier, gstin: val });
                      if (editErrors.gstin) setEditErrors(prev => ({ ...prev, gstin: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border p-2 rounded-xl text-[#211B17] font-mono uppercase font-bold ${
                      editErrors.gstin ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                    required
                  />
                  {editErrors.gstin && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.gstin}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">PAN Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editingSupplier.panNumber || ''}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10);
                      setEditingSupplier({ ...editingSupplier, panNumber: val });
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editingSupplier.contactPerson || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Phone (10 Digits)</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={editingSupplier.phone || ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setEditingSupplier({ ...editingSupplier, phone: clean });
                      if (editErrors.phone) setEditErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border p-2 rounded-xl text-[#211B17] font-mono ${
                      editErrors.phone ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.phone && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Email</label>
                  <input
                    type="email"
                    value={editingSupplier.email || ''}
                    onChange={(e) => {
                      setEditingSupplier({ ...editingSupplier, email: e.target.value });
                      if (editErrors.email) setEditErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border p-2 rounded-xl text-[#211B17] ${
                      editErrors.email ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.email && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">City</label>
                  <input
                    type="text"
                    value={editingSupplier.city || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, city: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={editingSupplier.paymentTerms || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, paymentTerms: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >
                  Update Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211B17]">Add New Supplier Master</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">Vendor Code</label>
                  <input
                    type="text"
                    value={newVendorCode}
                    onChange={(e) => setNewVendorCode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Bought-out Items">Bought-out Items</option>
                    <option value="Standard Components">Standard Components</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Supplier Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tata Steel Ltd"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (addErrors.name) setAddErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`w-full bg-[#FAF7F2] border p-2 rounded-xl text-[#211B17] font-bold ${
                    addErrors.name ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                  }`}
                  required
                />
                {addErrors.name && (
                  <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">GSTIN Number *</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="24AAAAA0000A1Z5"
                    value={newGstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
                      setNewGstin(val);
                      if (addErrors.gstin) setAddErrors(prev => ({ ...prev, gstin: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border p-2 rounded-xl text-[#211B17] font-mono uppercase font-bold ${
                      addErrors.gstin ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                    required
                  />
                  {addErrors.gstin && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {addErrors.gstin}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">PAN Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="AAAAA0000A"
                    value={newPan}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10);
                      setNewPan(val);
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Phone (10 Digits)</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={newPhone}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewPhone(clean);
                      if (addErrors.phone) setAddErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    placeholder="9825012345"
                    className={`w-full bg-[#FAF7F2] border p-2 rounded-xl text-[#211B17] font-mono ${
                      addErrors.phone ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {addErrors.phone && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {addErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      if (addErrors.email) setAddErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="vendor@domain.com"
                    className={`w-full bg-[#FAF7F2] border p-2 rounded-xl text-[#211B17] ${
                      addErrors.email ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {addErrors.email && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {addErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Ahmedabad"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={newPaymentTerms}
                    onChange={(e) => setNewPaymentTerms(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold rounded-xl"
                >
                  Save Supplier Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
