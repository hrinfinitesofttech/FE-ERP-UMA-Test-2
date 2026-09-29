'use client';

import React, { useState, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Building, Save, CheckCircle2, Shield } from 'lucide-react';

export default function CompanySettingsPage() {
  const { company, updateCompany } = useERP();
  const [formData, setFormData] = useState({ ...company });
  const [savedMsg, setSavedMsg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (company && Object.keys(company).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...company,
      }));
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateCompany(formData);
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      setIsSaving(false);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-xs pb-10">
      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-[#EBE3DB] pb-4">
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Building className="w-5 h-5 text-crm-brand-700" />
            Company Profile & Legal Details
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Configure enterprise header details, GSTIN, PAN, Bank records, and official stationery layout.
          </p>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Company profile details updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: BUSINESS IDENTITY */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Legal Enterprise Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg font-bold text-slate-900 dark:text-[#211B17]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Tagline / Sub-Title</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">GSTIN Number *</label>
                <input
                  type="text"
                  required
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value?.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg font-mono uppercase font-bold text-slate-900 dark:text-[#211B17]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Permanent Account No (PAN)</label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value?.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg font-mono uppercase font-bold text-slate-900 dark:text-[#211B17]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Corporate ID No (CIN)</label>
                <input
                  type="text"
                  value={formData.cin}
                  onChange={(e) => setFormData({ ...formData, cin: e.target.value?.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg font-mono text-slate-900 dark:text-[#211B17]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ADDRESS & CONTACT */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Registered Office & Works Address</h3>
            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Factory Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: BANK DETAILS */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Bank Commercial Details (For Quotations & Invoices)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccountNo}
                  onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg font-mono text-slate-900 dark:text-[#211B17]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value?.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg font-mono uppercase text-slate-900 dark:text-[#211B17]"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Branch</label>
                <input
                  type="text"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Profile...' : 'Save Company Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
