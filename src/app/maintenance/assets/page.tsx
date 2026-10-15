'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { InternalAsset, MaintenanceAssetStatus, CriticalityLevel } from '../../../types/maintenance';
import {
  Cpu,
  Plus,
  Wrench,
  AlertTriangle,
  Building,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';

export default function AssetMasterPage() {
  const { internalAssets, addInternalAsset, updateInternalAsset } = useERP();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetForView, setSelectedAssetForView] = useState<InternalAsset | null>(null);

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
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesCriticality = criticalityFilter === 'all' || asset.criticality === criticalityFilter;
    return matchesStatus && matchesCriticality;
  });

  // KPI Metrics
  const totalAssetsCount = internalAssets.length;
  const activeAssetsCount = internalAssets.filter((a) => a.status === 'Active').length;
  const maintenanceCount = internalAssets.filter((a) => a.status === 'Under Maintenance' || a.status === 'Breakdown').length;
  const totalAssetValue = internalAssets.reduce((acc, curr) => acc + (Number(curr.purchaseCost) || 0), 0);

  const handleSubmitNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    addInternalAsset({
      ...formData,
      documents: ['spec_sheet.pdf'],
    });
    setShowAddModal(false);
    setFormData({
      assetCode: '',
      assetName: '',
      assetType: 'Machine',
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
      amcStatus: 'None',
      maintenanceFrequency: 'Monthly',
      criticality: 'Medium',
      status: 'Active',
    });
  };

  const columns: ERPColumn<InternalAsset>[] = [
    {
      key: 'assetCode',
      header: 'Asset Code',
      isCodeLink: true,
      onCodeClick: (asset) => setSelectedAssetForView(asset),
      cell: (asset) => (
        <span className="font-mono font-bold text-[#7C3AED] hover:underline cursor-pointer">
          {asset.assetCode}
        </span>
      ),
    },
    {
      key: 'assetName',
      header: 'Asset & Machinery Name',
      cell: (asset) => (
        <div>
          <span className="font-bold text-slate-900 block">{asset.assetName}</span>
          <span className="text-[11px] text-slate-500">
            {asset.manufacturer} {asset.model} • SN: {asset.serialNumber || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location & Dept',
      cell: (asset) => (
        <div>
          <span className="font-semibold text-slate-800 block">{asset.location}</span>
          <span className="text-[11px] text-slate-500">{asset.department}</span>
        </div>
      ),
    },
    {
      key: 'purchaseCost',
      header: 'Purchase Cost',
      cell: (asset) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(asset.purchaseCost)}
        </span>
      ),
    },
    {
      key: 'criticality',
      header: 'Criticality',
      cell: (asset) => {
        const colors: Record<string, string> = {
          Critical: 'bg-rose-50 text-rose-700 border-rose-200',
          High: 'bg-amber-50 text-amber-700 border-amber-200',
          Medium: 'bg-blue-50 text-blue-700 border-blue-200',
          Low: 'bg-slate-50 text-slate-700 border-slate-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${colors[asset.criticality] || colors.Medium}`}>
            {asset.criticality}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (asset) => {
        const statusColors: Record<string, string> = {
          Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          'Under Maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
          Breakdown: 'bg-rose-50 text-rose-700 border-rose-200',
          Idle: 'bg-slate-100 text-slate-600 border-slate-200',
          Retired: 'bg-gray-100 text-gray-600 border-gray-200',
          Scrapped: 'bg-red-50 text-red-700 border-red-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[asset.status] || 'bg-slate-100 text-slate-600'}`}>
            {asset.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (asset) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              updateInternalAsset(asset.id, {
                status: asset.status === 'Under Maintenance' ? 'Active' : 'Under Maintenance',
              })
            }
            className="px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
            title="Toggle Status"
          >
            {asset.status === 'Active' ? 'Mark Maint' : 'Mark Active'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Assets</span>
            <Cpu className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalAssetsCount} Machines</div>
          <div className="text-xs text-slate-500">Factory plant equipment</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Running</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{activeAssetsCount} Active</div>
          <div className="text-xs text-slate-500">Operational machines</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Maintenance & Down</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{maintenanceCount} Under Maint</div>
          <div className="text-xs text-slate-500">Service & breakdown queue</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Plant Value</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{formatCurrency(totalAssetValue)}</div>
          <div className="text-xs text-slate-500">Capital purchase cost</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
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
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
          >
            <option value="all">All Criticality Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Shasvatm ERP Standard List View */}
      <ERPListPageLayout<InternalAsset>
        breadcrumbs={['DASHBOARD', 'PLANT & MAINTENANCE', 'ASSET & MACHINE MASTER']}
        columns={columns}
        data={filteredAssets}
        addNewLabel="+ Add Internal Asset"
        onAddNew={() => setShowAddModal(true)}
        onExport={() => {
          const csv = [
            ['Asset Code', 'Asset Name', 'Manufacturer', 'Model', 'Serial No', 'Location', 'Department', 'Purchase Cost', 'Criticality', 'Status'].join(','),
            ...filteredAssets.map(a => [
              `"${a.assetCode}"`,
              `"${(a.assetName || '').replace(/"/g, '""')}"`,
              `"${(a.manufacturer || '').replace(/"/g, '""')}"`,
              `"${(a.model || '').replace(/"/g, '""')}"`,
              `"${(a.serialNumber || '').replace(/"/g, '""')}"`,
              `"${(a.location || '').replace(/"/g, '""')}"`,
              `"${(a.department || '').replace(/"/g, '""')}"`,
              a.purchaseCost || 0,
              a.criticality || '',
              a.status || ''
            ].join(','))
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `plant_assets_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        }}
        searchPlaceholder="Search machine code, name, serial or brand..."
      />

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#7C3AED]" />
                Register New Factory Asset
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewAsset} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCH-CNC-05"
                    value={formData.assetCode}
                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3kW Fiber Laser Cutter"
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="Haas / Trumpf / Bystronic"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="Serial No"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location & Dept</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold cursor-pointer">
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
