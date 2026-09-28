'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Building,
  Plus,
  Search,
  Calendar,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingDown,
  Layers,
  FileText,
  DollarSign,
  Package,
} from 'lucide-react';
import { FixedAsset } from '../../../types/accounting';

export default function FixedAssetsPage() {
  const { fixedAssets, addFixedAsset, updateFixedAsset, deleteFixedAsset } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Register Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetCode, setAssetCode] = useState('');
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState('Plant & Machinery');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseCost, setPurchaseCost] = useState<number | string>('');
  const [supplierName, setSupplierName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [location, setLocation] = useState('Bay-3 Heavy Machine Shop');
  const [department, setDepartment] = useState('Production');
  const [depreciationMethod, setDepreciationMethod] = useState<'SLM' | 'WDV'>('WDV');
  const [depreciationRate, setDepreciationRate] = useState<number | string>(15);
  const [usefulLifeYears, setUsefulLifeYears] = useState<number | string>(10);
  const [residualValue, setResidualValue] = useState<number | string>(0);
  const [initialAccDep, setInitialAccDep] = useState<number | string>(0);

  // Edit Modal State
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<FixedAsset>>({});

  // Delete Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // KPI Calculations
  const totalGrossCost = fixedAssets.reduce((acc, a) => acc + (Number(a.purchaseCost || a.purchaseValue) || 0), 0);
  const totalAccumulatedDep = fixedAssets.reduce((acc, a) => acc + (Number(a.accumulatedDepreciation) || 0), 0);
  const totalNetBookValue = fixedAssets.reduce((acc, a) => acc + (Number(a.currentBookValue) || 0), 0);
  const activeCount = fixedAssets.filter((a) => a.status === 'Active').length;

  const filtered = fixedAssets.filter((a) => {
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus;
    const matchesSearch =
      !searchTerm?.trim() ||
      a.assetCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleOpenRegisterModal = () => {
    const nextNum = String(fixedAssets.length + 1).padStart(3, '0');
    setAssetCode(`AST-${category.slice(0, 3).toUpperCase()}-${nextNum}`);
    setAssetName('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseCost('');
    setSupplierName('');
    setInvoiceNumber('');
    setLocation('Bay-3 Heavy Machine Shop');
    setDepartment('Production');
    setDepreciationMethod('WDV');
    setDepreciationRate(15);
    setUsefulLifeYears(10);
    setResidualValue(0);
    setInitialAccDep(0);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Number(purchaseCost) || 0;
    const rate = Number(depreciationRate) || 0;
    const life = Number(usefulLifeYears) || 10;
    const resVal = Number(residualValue) || (cost * 0.05);
    const accDep = Number(initialAccDep) || 0;
    const bookVal = Math.max(0, cost - accDep);

    addFixedAsset({
      assetCode: assetCode.trim() || `AST-2026-${String(fixedAssets.length + 1).padStart(3, '0')}`,
      assetName: assetName.trim(),
      category,
      purchaseDate,
      purchaseCost: cost,
      purchaseValue: cost,
      supplierName: supplierName.trim(),
      invoiceNumber: invoiceNumber.trim(),
      location: location.trim(),
      department: department.trim(),
      usefulLifeYears: life,
      depreciationMethod,
      depreciationRate: rate,
      residualValue: resVal,
      accumulatedDepreciation: accDep,
      currentBookValue: bookVal,
      status: 'Active',
    });
    setIsModalOpen(false);
  };

  const handleOpenEditModal = (asset: FixedAsset) => {
    setEditingAsset(asset);
    setEditFormData({
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      category: asset.category,
      purchaseDate: asset.purchaseDate,
      purchaseCost: asset.purchaseCost || asset.purchaseValue || 0,
      supplierName: asset.supplierName || '',
      invoiceNumber: asset.invoiceNumber || '',
      location: asset.location || '',
      department: asset.department || '',
      usefulLifeYears: asset.usefulLifeYears || 10,
      depreciationMethod: asset.depreciationMethod || 'WDV',
      depreciationRate: asset.depreciationRate || 15,
      residualValue: asset.residualValue || 0,
      accumulatedDepreciation: asset.accumulatedDepreciation || 0,
      currentBookValue: asset.currentBookValue || 0,
      status: asset.status || 'Active',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    const cost = Number(editFormData.purchaseCost) || 0;
    const accDep = Number(editFormData.accumulatedDepreciation) || 0;
    const bookVal = Math.max(0, cost - accDep);

    updateFixedAsset(editingAsset.id, {
      ...editFormData,
      purchaseCost: cost,
      purchaseValue: cost,
      accumulatedDepreciation: accDep,
      currentBookValue: bookVal,
    });
    setEditingAsset(null);
  };

  const handleConfirmDelete = (id: string) => {
    deleteFixedAsset(id);
    setDeletingId(null);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#211B17]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-700">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">
              Fixed Assets Register & Capital Expenditure
            </h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Plant, Machinery, Factory Buildings & Heavy Vehicles • Income Tax Act & Companies Act Depreciation
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenRegisterModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Fixed Asset</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-[#70665F] font-medium flex items-center justify-between">
            <span>Total Gross Asset Cost</span>
            <DollarSign className="w-4 h-4 text-[#70665F]" />
          </div>
          <div className="text-2xl font-bold text-[#211B17] font-mono">
            ₹{totalGrossCost.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#70665F]">{fixedAssets.length} Registered Capital Assets</div>
        </div>

        <div className="bg-white border border-rose-200 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-rose-700 font-medium flex items-center justify-between">
            <span>Accumulated Depreciation</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono">
            ₹{totalAccumulatedDep.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-rose-600">Total Written Off Value</div>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-emerald-700 font-medium flex items-center justify-between">
            <span>Net Book Value (WDV)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            ₹{totalNetBookValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600">Balance Sheet Asset Value</div>
        </div>

        <div className="bg-white border border-teal-200 p-4 rounded-xl space-y-1 shadow-sm">
          <div className="text-xs text-teal-700 font-medium flex items-center justify-between">
            <span>Active Assets</span>
            <Package className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700 font-mono">{activeCount}</div>
          <div className="text-[10px] text-teal-600">Operational on Shop Floor</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#EBE3DB] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#EBE3DB]">
            <Filter className="w-3.5 h-3.5 text-[#70665F]" />
            <span className="text-xs text-[#544B45] font-semibold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-[#211B17] font-medium focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Plant & Machinery">Plant & Machinery</option>
              <option value="Factory Building">Factory Building</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Computers & IT">Computers & IT</option>
              <option value="Electrical Equipment">Electrical Equipment</option>
              <option value="Tools & Dies">Tools & Dies</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#EBE3DB]">
            <span className="text-xs text-[#544B45] font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-[#211B17] font-medium focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Disposed">Disposed</option>
              <option value="Written Off">Written Off</option>
            </select>
          </div>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search asset code, name, location, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#211B17] focus:outline-none focus:border-teal-500 transition"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#211B17]">
            <Layers className="w-4 h-4 text-teal-600" />
            Fixed Asset Master Register ({filtered.length} Assets)
          </div>
          <span className="text-xs text-[#70665F]">Real-time database records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45] border-collapse">
            <thead className="bg-[#FAF7F2] text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Asset Code</th>
                <th className="py-3.5 px-4">Asset Name & Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Purchase Cost (₹)</th>
                <th className="py-3.5 px-4 text-right">Acc. Dep. (₹)</th>
                <th className="py-3.5 px-4 text-right">Net Book Value (₹)</th>
                <th className="py-3.5 px-4 text-center">Dep. Method</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#70665F]">
                    No fixed assets found. Click &quot;Register Fixed Asset&quot; to add one.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{a.assetCode}</td>
                    <td className="py-3 px-4 max-w-xs space-y-0.5">
                      <div className="font-semibold text-[#211B17]">{a.assetName}</div>
                      {a.supplierName && (
                        <div className="text-[10px] text-[#70665F] truncate">
                          Vendor: {a.supplierName} {a.invoiceNumber ? `(${a.invoiceNumber})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#544B45]">{a.category}</td>
                    <td className="py-3 px-4 text-[#70665F]">{a.location}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#211B17]">
                      ₹{Number(a.purchaseCost || a.purchaseValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600">
                      ₹{Number(a.accumulatedDepreciation || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{Number(a.currentBookValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px]">
                      {a.depreciationMethod} ({a.depreciationRate || 15}%)
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          a.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : a.status === 'Under Maintenance'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {a.status === 'Active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(a)}
                          title="Edit / Update Asset Details"
                          className="p-1.5 bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] border border-[#EBE3DB] rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#544B45]" />
                        </button>
                        <button
                          onClick={() => setDeletingId(a.id)}
                          title="Delete Fixed Asset"
                          className="p-1.5 bg-[#FAF7F2] hover:bg-rose-50 text-rose-600 border border-[#EBE3DB] rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Fixed Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-600" />
                Register New Fixed Asset
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#70665F] hover:text-[#211B17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Asset Code</label>
                  <input
                    type="text"
                    required
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Plant & Machinery">Plant & Machinery</option>
                    <option value="Factory Building">Factory Building</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Computers & IT">Computers & IT</option>
                    <option value="Electrical Equipment">Electrical Equipment</option>
                    <option value="Tools & Dies">Tools & Dies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Asset Name & Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Precision CNC Plasma Cutting Machine"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="2850000"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Supplier / Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Messer Cutting Systems"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Invoice / PO Number</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-MES-2024-089"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Physical Location</label>
                  <input
                    type="text"
                    placeholder="Bay-3 Machine Shop"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Production"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB]">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Dep. Method</label>
                  <select
                    value={depreciationMethod}
                    onChange={(e) => setDepreciationMethod(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#211B17] focus:outline-none cursor-pointer"
                  >
                    <option value="WDV">WDV</option>
                    <option value="SLM">SLM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={depreciationRate}
                    onChange={(e) => setDepreciationRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#211B17] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Useful Life (Yrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#211B17] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] font-semibold border border-[#EBE3DB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition cursor-pointer"
                >
                  Save Fixed Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Update Fixed Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                Update Fixed Asset: {editingAsset.assetCode}
              </h3>
              <button
                onClick={() => setEditingAsset(null)}
                className="text-[#70665F] hover:text-[#211B17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Asset Code</label>
                  <input
                    type="text"
                    required
                    value={editFormData.assetCode || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, assetCode: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Category</label>
                  <select
                    value={editFormData.category || 'Plant & Machinery'}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none cursor-pointer"
                  >
                    <option value="Plant & Machinery">Plant & Machinery</option>
                    <option value="Factory Building">Factory Building</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Computers & IT">Computers & IT</option>
                    <option value="Electrical Equipment">Electrical Equipment</option>
                    <option value="Tools & Dies">Tools & Dies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.assetName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, assetName: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={editFormData.purchaseCost || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, purchaseCost: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Accumulated Dep. (₹)</label>
                  <input
                    type="number"
                    value={editFormData.accumulatedDepreciation || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, accumulatedDepreciation: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-mono focus:outline-none text-rose-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Status</label>
                  <select
                    value={editFormData.status || 'Active'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Disposed">Disposed</option>
                    <option value="Written Off">Written Off</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Physical Location</label>
                  <input
                    type="text"
                    value={editFormData.location || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={editFormData.department || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] font-semibold border border-[#EBE3DB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold shadow-md transition cursor-pointer"
                >
                  Update Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-[#211B17]">Delete Fixed Asset?</h3>
            </div>
            <p className="text-xs text-[#70665F]">
              Are you sure you want to delete this Fixed Asset record? This action will remove it from the asset register.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EFE9E1] text-[#544B45] text-xs font-semibold rounded-xl border border-[#EBE3DB]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deletingId)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
