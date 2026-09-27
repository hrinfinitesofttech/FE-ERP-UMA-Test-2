'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { InternalAsset, MaintenanceAssetStatus, CriticalityLevel } from '../../../types/maintenance';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  Wrench,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function AssetMasterPage() {
  const { internalAssets, addInternalAsset, updateInternalAsset } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Asset Form state
  const [formData, setFormData] = useState({
    assetCode: '',
    assetName: '',
    assetType: 'Machine' as const,
    category: 'Machining Center',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseSupplier: '',
    purchaseInvoice: '',
    purchaseCost: 0,
    installationDate: new Date().toISOString().split('T')[0],
    location: 'Bay 1',
    department: 'Production',
    responsiblePerson: '',
    warrantyStart: new Date().toISOString().split('T')[0],
    warrantyEnd: new Date().toISOString().split('T')[0],
    amcStatus: 'None' as const,
    maintenanceFrequency: 'Monthly' as const,
    criticality: 'Medium' as CriticalityLevel,
    status: 'Active' as MaintenanceAssetStatus,
  });

  const filteredAssets = internalAssets.filter((asset) => {
    const matchesSearch =
      asset.assetName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      asset.assetCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      asset.manufacturer?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesCriticality = criticalityFilter === 'all' || asset.criticality === criticalityFilter;
    return matchesSearch && matchesStatus && matchesCriticality;
  });

  const handleSubmitNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    addInternalAsset({
      ...formData,
      documents: ['spec_sheet.pdf'],
    });
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-crm-brand- dark:bg-crm-brand-/40 text-crm-brand-800 dark:text-crm-brand- font-mono text-xs font-bold">
              INTERNAL ASSET MASTER
            </span>
            <span className="text-xs text-[#70665F]">Uma Techno Fab Equipment & Machinery</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-crm-brand-600" />
            Asset & Machine Master
          </h1>
          <p className="text-xs text-[#70665F]">
            Register and manage Uma Techno Fab&apos;s own machines, utilities, tooling & factory infrastructure.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-crm-brand-700/30"
        >
          <Plus className="w-4 h-4" />
          Add Internal Asset
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search code, name, serial or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-brand-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#70665F]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          >
            <option value="all">All Asset Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Breakdown">Breakdown</option>
            <option value="Idle">Idle</option>
            <option value="Retired">Retired</option>
            <option value="Scrapped">Scrapped</option>
          </select>

          <select
            value={criticalityFilter}
            onChange={(e) => setCriticalityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          >
            <option value="all">All Criticality Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Asset Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-5 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#FAF7F2] text-slate-800 dark:text-[#544B45] font-mono font-bold text-xs">
                    {asset.assetCode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      asset.criticality === 'Critical'
                        ? 'bg-red-500/10 text-red-600'
                        : asset.criticality === 'High'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-crm-brand-600/10 text-crm-brand-700'
                    }`}
                  >
                    {asset.criticality} Critical
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#211B17] mt-1.5">{asset.assetName}</h3>
                <p className="text-xs text-[#70665F]">
                  {asset.manufacturer} {asset.model} • SN: {asset.serialNumber}
                </p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                  asset.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : asset.status === 'Under Maintenance'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : asset.status === 'Breakdown'
                    ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {asset.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 dark:border-[#EBE3DB] py-3">
              <div>
                <span className="text-[#70665F] block text-[10px]">Location / Dept</span>
                <span className="font-medium text-slate-700 dark:text-[#544B45]">{asset.location} ({asset.department})</span>
              </div>
              <div>
                <span className="text-[#70665F] block text-[10px]">Purchase Cost</span>
                <span className="font-mono font-bold text-slate-900 dark:text-[#544B45]">{formatCurrency(asset.purchaseCost)}</span>
              </div>
              <div>
                <span className="text-[#70665F] block text-[10px]">Warranty End</span>
                <span className="font-medium text-slate-700 dark:text-[#544B45]">{formatDate(asset.warrantyEnd)}</span>
              </div>
              <div>
                <span className="text-[#70665F] block text-[10px]">PM Frequency</span>
                <span className="font-medium text-slate-700 dark:text-[#544B45]">{asset.maintenanceFrequency}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#70665F] text-[11px]">Responsible: {asset.responsiblePerson}</span>
              <button
                onClick={() =>
                  updateInternalAsset(asset.id, {
                    status: asset.status === 'Under Maintenance' ? 'Active' : 'Under Maintenance',
                  })
                }
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-[#EBE3DB] hover:bg-slate-100 dark:hover:bg-[#FAF7F2] text-xs font-medium text-slate-700 dark:text-[#544B45] transition"
              >
                Toggle Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-crm-brand-600" />
                Register New Internal Asset
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewAsset} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-[#544B45] mb-1">Asset Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCH-CNC-05"
                    value={formData.assetCode}
                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-[#544B45] mb-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3kW Fiber Laser Cutter"
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-[#544B45] mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="Haas / Trumpf / Bystronic"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-[#544B45] mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="Serial No"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-[#544B45] mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-[#544B45] mb-1">Location & Dept</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-crm-brand-700 text-white font-semibold">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
