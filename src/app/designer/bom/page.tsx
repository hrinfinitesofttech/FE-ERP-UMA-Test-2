'use client';

import React, { useState, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import { BOMHeader, BOMItem, BOMItemType, ProcurementType } from '../../../types/designer';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  DollarSign,
  Download,
  Layers,
  X,
  PlusCircle,
  FileCode,
  ShieldCheck,
  Trash2,
  Package,
  Boxes,
  Code2,
  Check,
} from 'lucide-react';

interface NewBOMFormItem {
  id: string;
  material: string;
  quantity: number;
  unit: string;
  procurement: 'PURCHASE' | 'FABRICATE';
  item_type: 'RAW_MATERIAL' | 'FABRICATED' | 'BOUGHT_OUT' | 'CONSUMABLE' | 'HARDWARE' | 'ELECTRICAL';
  estimatedRate: number;
}

export default function MasterBOMPage() {
  const [mounted, setMounted] = useState(false);
  const { boms, addBOM, updateBOM, designJobs, projectJobs, itemMasters, currentUser } = useERP();

  const [selectedJobNumber, setSelectedJobNumber] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('UMA_ERP_activeBOMJob');
      if (saved) return saved;
    }
    return boms[0]?.jobNumber || 'JOB-2026-001';
  });
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isCreateBOMModalOpen, setIsCreateBOMModalOpen] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    if (selectedJobNumber && typeof window !== 'undefined') {
      localStorage.setItem('UMA_ERP_activeBOMJob', selectedJobNumber);
    }
  }, [selectedJobNumber]);

  // Active BOM
  const activeBOM =
    boms.find(
      (b) =>
        b.jobNumber === selectedJobNumber ||
        b.id === selectedJobNumber ||
        b.bomNumber === selectedJobNumber ||
        (b as any).bom_name === selectedJobNumber ||
        b.machineName === selectedJobNumber
    ) || boms[0];

  // ---------------------------------------------------------------------------
  // NEW MASTER BOM FORM STATE (matches Developer JSON schema exactly)
  // { product, bom_name, version, quantity, items: [ { material, quantity, unit, procurement, item_type } ] }
  // ---------------------------------------------------------------------------
  const [selectedProductId, setSelectedProductId] = useState(designJobs[0]?.id || '101');
  const [newBomName, setNewBomName] = useState('Steel Table BOM');
  const [newVersion, setNewVersion] = useState('V1');
  const [newProductQuantity, setNewProductQuantity] = useState(1);
  const [bomItemsList, setBomItemsList] = useState<NewBOMFormItem[]>([
    {
      id: 'itm-1',
      material: '201 - Mild Steel Plate 5mm',
      quantity: 4,
      unit: 'KG',
      procurement: 'PURCHASE',
      item_type: 'RAW_MATERIAL',
      estimatedRate: 150,
    },
    {
      id: 'itm-2',
      material: '202 - Table Legs 50x50 Box Sub-Assembly',
      quantity: 2,
      unit: 'PCS',
      procurement: 'FABRICATE',
      item_type: 'FABRICATED',
      estimatedRate: 850,
    },
    {
      id: 'itm-3',
      material: '203 - Heavy Duty Leveling Stud M12',
      quantity: 1,
      unit: 'PCS',
      procurement: 'PURCHASE',
      item_type: 'BOUGHT_OUT',
      estimatedRate: 320,
    },
    {
      id: 'itm-4',
      material: '204 - Anti-Rust Zinc Spray Coating',
      quantity: 0.5,
      unit: 'KG',
      procurement: 'PURCHASE',
      item_type: 'CONSUMABLE',
      estimatedRate: 480,
    },
  ]);

  // ---------------------------------------------------------------------------
  // SINGLE ITEM MODAL FORM STATE
  // ---------------------------------------------------------------------------
  const [partNumber, setPartNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<BOMItemType>('Raw Material');
  const [material, setMaterial] = useState('SS 316L');
  const [specification, setSpecification] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('Nos');
  const [makeBrand, setMakeBrand] = useState('');
  const [procurementType, setProcurementType] = useState<ProcurementType>('Purchase');
  const [estimatedRate, setEstimatedRate] = useState(5000);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddItemModalOpen) setIsAddItemModalOpen(false);
        if (isCreateBOMModalOpen) setIsCreateBOMModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddItemModalOpen, isCreateBOMModalOpen]);

  // Add line item in New BOM Modal
  const handleAddNewBOMRow = () => {
    const newId = `itm-${Date.now()}`;
    setBomItemsList((prev) => [
      ...prev,
      {
        id: newId,
        material: '',
        quantity: 1,
        unit: 'PCS',
        procurement: 'PURCHASE',
        item_type: 'RAW_MATERIAL',
        estimatedRate: 500,
      },
    ]);
  };

  const handleRemoveBOMRow = (id: string) => {
    if (bomItemsList.length <= 1) {
      alert('BOM must have at least 1 material item.');
      return;
    }
    setBomItemsList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateBOMRow = (id: string, field: keyof NewBOMFormItem, val: any) => {
    setBomItemsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  // Construct Developer JSON payload preview
  const developerJsonPayload = {
    product: selectedProductId,
    bom_name: newBomName,
    version: newVersion,
    quantity: newProductQuantity,
    items: bomItemsList.map((itm) => ({
      material: itm.material,
      quantity: Number(itm.quantity) || 1,
      unit: itm.unit,
      procurement: itm.procurement,
      item_type: itm.item_type,
      estimatedRate: Number(itm.estimatedRate) || 0,
      estimated_rate: Number(itm.estimatedRate) || 0,
      rate: Number(itm.estimatedRate) || 0,
      totalEstimatedAmount: (Number(itm.quantity) || 1) * (Number(itm.estimatedRate) || 0),
      total_amount: (Number(itm.quantity) || 1) * (Number(itm.estimatedRate) || 0),
    })),
  };

  const totalNewBOMCost = bomItemsList.reduce(
    (sum, itm) => sum + (Number(itm.quantity) || 0) * (Number(itm.estimatedRate) || 0),
    0
  );

  // Handle Submission of New Full BOM
  const handleCreateFullBOM = (e: React.FormEvent) => {
    e.preventDefault();
    const desJob = designJobs.find((j) => j.id === selectedProductId) || {
      id: selectedProductId,
      jobNumber: `JOB-${newBomName.replace(/\s+/g, '-').slice(0, 10).toUpperCase()}`,
      projectId: 'PRJ-2026-001',
      productName: newBomName,
    };

    const formattedItems: BOMItem[] = bomItemsList.map((itm, idx) => {
      const rate = Number(itm.estimatedRate ?? (itm as any).estimated_rate ?? (itm as any).rate ?? 0);
      const qty = Number(itm.quantity) || 1;
      const totalAmount = qty * rate;
      return {
        id: `bi-${Date.now()}-${idx + 1}`,
        itemNo: idx + 1,
        partNumber: `MAT-${String(idx + 1).padStart(3, '0')}`,
        itemName: itm.material || `Material Item ${idx + 1}`,
        description: `${itm.item_type} for ${newBomName}`,
        itemType: (itm.item_type === 'RAW_MATERIAL'
          ? 'Raw Material'
          : itm.item_type === 'FABRICATED'
          ? 'Fabricated'
          : itm.item_type === 'BOUGHT_OUT'
          ? 'Bought-Out'
          : itm.item_type === 'CONSUMABLE'
          ? 'Consumable'
          : itm.item_type === 'HARDWARE'
          ? 'Hardware'
          : 'Electrical') as BOMItemType,
        material: itm.material || 'Standard Grade',
        specification: `Procurement: ${itm.procurement}`,
        quantity: qty,
        unit: itm.unit || 'PCS',
        makeBrand: itm.procurement === 'PURCHASE' ? 'Standard Supplier' : 'In-House Shopfloor',
        procurementType: (itm.procurement === 'FABRICATE' ? 'In-House' : 'Purchase') as ProcurementType,
        procurement: itm.procurement,
        item_type: itm.item_type,
        estimatedRate: rate,
        estimated_rate: rate,
        rate: rate,
        totalEstimatedAmount: totalAmount,
        total_estimated_amount: totalAmount,
        total_amount: totalAmount,
      } as any;
    });

    const bomId = `BOM-${desJob.jobNumber}`;
    addBOM({
      bomNumber: `BOM-${desJob.jobNumber}-${newVersion}`,
      bomName: newBomName,
      bom_name: newBomName,
      product: selectedProductId,
      version: newVersion,
      quantity: newProductQuantity,
      projectId: desJob.projectId || 'PRJ-2026-001',
      jobNumber: desJob.jobNumber,
      designJobId: desJob.id,
      machineName: newBomName,
      revision: newVersion,
      revisionNumber: newVersion,
      preparedBy: `${currentUser?.firstName || 'Design'} ${currentUser?.lastName || 'Engineer'}`.trim(),
      status: 'draft',
      approvalStatus: 'draft',
      isLocked: false,
      totalItemCount: formattedItems.length,
      totalItemsCount: formattedItems.length,
      totalEstimatedCost: totalNewBOMCost,
      estimatedTotalCost: totalNewBOMCost,
      total_estimated_cost: totalNewBOMCost,
      items: formattedItems,
    });

    setSelectedJobNumber(desJob.jobNumber);
    setIsCreateBOMModalOpen(false);
    setSuccessToast(`Master BOM "${newBomName}" (${newVersion}) created successfully with ${formattedItems.length} line items!`);
    setTimeout(() => setSuccessToast(''), 5000);
  };

  // Add Item to Active BOM
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBOM || activeBOM.isLocked) return;

    const newNo = activeBOM.items.length + 1;
    const rate = Number(estimatedRate);
    const qty = Number(quantity);
    const newItem: BOMItem = {
      id: `bi-${Date.now()}`,
      itemNo: newNo,
      partNumber: partNumber || `PRT-PART-${newNo}`,
      itemName,
      description,
      itemType,
      material,
      specification,
      quantity: qty,
      unit,
      makeBrand: makeBrand || 'Tata Steel / Local',
      procurementType,
      procurement: procurementType === 'In-House' ? 'FABRICATE' : 'PURCHASE',
      item_type: (itemType === 'Raw Material'
        ? 'RAW_MATERIAL'
        : itemType === 'Fabricated'
        ? 'FABRICATED'
        : itemType === 'Bought-Out'
        ? 'BOUGHT_OUT'
        : itemType === 'Consumable'
        ? 'CONSUMABLE'
        : 'HARDWARE') as any,
      estimatedRate: rate,
      totalEstimatedAmount: rate * qty,
    };

    const updatedItems = [...activeBOM.items, newItem];
    const newTotal = updatedItems.reduce((s, i) => s + i.totalEstimatedAmount, 0);

    updateBOM(activeBOM.id, {
      items: updatedItems,
      totalItemsCount: updatedItems.length,
      estimatedTotalCost: newTotal,
    });

    setIsAddItemModalOpen(false);
    setSuccessToast(`Item "${itemName}" added to BOM ${activeBOM.bomNumber}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleLockBOM = () => {
    if (!activeBOM) return;
    updateBOM(activeBOM.id, {
      approvalStatus: 'approved',
      isLocked: true,
      approvedBy: `${currentUser?.firstName || 'Dharmesh'} ${currentUser?.lastName || 'Joshi'}`.trim(),
    });
    setSuccessToast(`Master BOM ${activeBOM.bomNumber} approved and locked for production!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const filteredItems =
    (activeBOM?.items || []).filter((item) => {
      const q = searchQuery?.toLowerCase() || '';
      const matchSearch =
        !q ||
        item.partNumber?.toLowerCase().includes(q) ||
        item.itemName?.toLowerCase().includes(q) ||
        item.material?.toLowerCase().includes(q) ||
        (item.makeBrand && item.makeBrand?.toLowerCase().includes(q));
      const matchType = itemTypeFilter === 'all' || item.itemType === itemTypeFilter;
      return matchSearch && matchType;
    });

  const totalBOMCost = (activeBOM?.items || []).reduce((sum, item: any) => {
    const rate = Number(item.estimatedRate ?? item.estimated_rate ?? item.rate ?? item.estRate ?? item.unitPrice ?? item.unit_price ?? item.costPerUnit ?? item.cost_per_unit ?? 0);
    const qty = Number(item.quantity ?? item.qty ?? 1);
    const amt = Number(item.totalEstimatedAmount ?? item.total_estimated_amount ?? item.total_amount ?? item.totalAmount ?? item.amount ?? (qty * rate));
    return sum + amt;
  }, 0) || Number(activeBOM?.totalEstimatedCost || (activeBOM as any)?.estimatedTotalCost || (activeBOM as any)?.total_estimated_cost || 0);

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-500/30 text-xs font-mono font-bold">
              MODULE 3.8
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-amber-600" />
              Multi-Level Master Bill of Materials (BOM)
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Component Hierarchy Structure for Production Items with Material, Unit, Procurement (PURCHASE/FABRICATE) & Item Types
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCreateBOMModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Create New Master BOM
          </button>

          {activeBOM && (
            <button
              onClick={() => alert(`Exporting Master BOM ${activeBOM.bomNumber} (${activeBOM.revisionNumber}) to CSV/Excel...`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-amber-800 border border-[#EBE3DB] text-xs font-bold transition shadow-xs"
            >
              <Download className="w-4 h-4 text-amber-600" />
              Export BOM Excel
            </button>
          )}

          {activeBOM && !activeBOM.isLocked ? (
            <button
              onClick={handleLockBOM}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Approve & Lock BOM
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
              <Lock className="w-4 h-4 text-emerald-600" />
              BOM Locked ({activeBOM?.revisionNumber})
            </span>
          )}
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successToast}
        </div>
      )}

      {/* BOM Job Selector & Summary Header */}
      {activeBOM && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-md">
          <div>
            <label className="text-[10px] font-bold text-[#70665F] block mb-1">Select Active Job BOM</label>
            <select
              value={selectedJobNumber}
              onChange={(e) => setSelectedJobNumber(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-amber-500"
            >
              {boms.map((b) => {
                const matchedJob = designJobs.find((j) => j.jobNumber === b.jobNumber) || (projectJobs || []).find((p) => p.jobNumber === b.jobNumber);
                const cust = matchedJob?.customerName;
                return (
                  <option key={b.id} value={b.jobNumber}>
                    {b.jobNumber} — {cust ? `[${cust}] ` : ''}{b.bomName || b.machineName || b.bomNumber} ({b.revisionNumber || 'V1'})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB]">
            <span className="text-[10px] text-[#70665F] block font-bold">TOTAL BOM COMPONENTS</span>
            <span className="font-mono text-xl font-black text-[#211B17]">{activeBOM.items?.length || 0} Items</span>
            <span className="text-[11px] text-amber-800 block font-mono font-semibold">Version: {activeBOM.revisionNumber || 'V1'}</span>
          </div>

          <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB]">
            <span className="text-[10px] text-[#70665F] block font-bold">ESTIMATED TOTAL BOM COST</span>
            <span className="font-mono text-xl font-black text-emerald-700">
              ₹ {totalBOMCost?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#70665F] block">Rollup Calculated for Production</span>
          </div>

          <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#70665F] block font-bold">APPROVAL STATUS</span>
              <span className="font-bold text-xs uppercase text-amber-700">{activeBOM.approvalStatus || 'draft'}</span>
              <span className="text-[10px] text-[#70665F] block">By: {activeBOM.approvedBy || 'Engineering Lead'}</span>
            </div>
            {activeBOM.isLocked ? (
              <Lock className="w-6 h-6 text-emerald-600" />
            ) : (
              <Unlock className="w-6 h-6 text-amber-600" />
            )}
          </div>
        </div>
      )}

      {/* Control & Item Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Material, Part #, Item Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="all">All Item Types</option>
            <option value="Raw Material">Raw Material (RAW_MATERIAL)</option>
            <option value="Fabricated">Fabricated (FABRICATED)</option>
            <option value="Bought-Out">Bought-Out (BOUGHT_OUT)</option>
            <option value="Consumable">Consumable (CONSUMABLE)</option>
            <option value="Hardware">Hardware</option>
            <option value="Electrical">Electrical</option>
          </select>

          {activeBOM && !activeBOM.isLocked && (
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Add Material Line
            </button>
          )}
        </div>
      </div>

      {/* BOM Multi-Level Hierarchy Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#EBE3DB] bg-white shadow-md">
        <table className="w-full text-left border-collapse text-xs text-[#544B45]">
          <thead>
            <tr className="bg-[#FAF7F2] text-[#70665F] font-mono text-[11px] uppercase border-b border-[#EBE3DB]">
              <th className="p-3.5 w-12 text-center">#</th>
              <th className="p-3.5">Material / Part Ref</th>
              <th className="p-3.5">Item Name & Spec</th>
              <th className="p-3.5">Item Type</th>
              <th className="p-3.5 text-center">Procurement</th>
              <th className="p-3.5 text-center">Qty / Unit</th>
              <th className="p-3.5 text-right">Est. Rate</th>
              <th className="p-3.5 text-right">Total Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB]">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#70665F]">
                  No BOM items match the selected filter. Click &quot;Add Material Line&quot; to populate.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isFabricate =
                  item.procurement === 'FABRICATE' ||
                  item.procurementType === 'In-House' ||
                  item.itemType === 'Fabricated';

                return (
                  <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="p-3.5 text-center font-mono font-bold text-[#70665F]">{item.itemNo}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-800">
                      {item.partNumber || item.material}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#211B17]">{item.itemName}</div>
                      <div className="text-[10px] text-[#70665F]">{item.specification || item.description}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          item.itemType === 'Raw Material'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.itemType === 'Bought-Out'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : item.itemType === 'Fabricated'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.itemType === 'Consumable'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {item.item_type || item.itemType}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          isFabricate
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-sky-50 text-sky-800 border-sky-300'
                        }`}
                      >
                        {item.procurement || (isFabricate ? 'FABRICATE' : 'PURCHASE')}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-[#211B17]">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#544B45]">
                      ₹ {Number(item.estimatedRate ?? (item as any).estimated_rate ?? (item as any).rate ?? (item as any).estRate ?? (item as any).unitPrice ?? (item as any).costPerUnit ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                      ₹ {Number(item.totalEstimatedAmount ?? (item as any).total_estimated_amount ?? (item as any).total_amount ?? (item as any).totalAmount ?? ((Number(item.quantity) || 1) * Number(item.estimatedRate ?? (item as any).estimated_rate ?? (item as any).rate ?? 0))).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================================= */}
      {/* MODAL 1: CREATE FULL MASTER BOM (Structured exactly per Developer Schema)*/}
      {/* ======================================================================= */}
      {isCreateBOMModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsCreateBOMModalOpen(false)}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-4 p-6 text-xs max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#211B17] flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-amber-600" />
                  Create Master BOM (Product & Materials Structure)
                </h3>
                <p className="text-[11px] text-[#70665F] mt-0.5">
                  Define Product Header, Output Quantity, and Child Material Requirements with Procurement Types
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowJsonPreview(!showJsonPreview)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[11px] font-mono font-bold text-[#544B45] hover:bg-white flex items-center gap-1 transition"
                >
                  <Code2 className="w-3.5 h-3.5 text-amber-600" />
                  {showJsonPreview ? 'Hide JSON' : 'Preview Developer JSON'}
                </button>
                <button
                  onClick={() => setIsCreateBOMModalOpen(false)}
                  className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Optional Live Developer JSON Payload View */}
            {showJsonPreview && (
              <div className="p-3.5 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-700 shadow-inner">
                <div className="text-slate-400 text-[10px] mb-1">// Real-time API Payload Output:</div>
                <pre>{JSON.stringify(developerJsonPayload, null, 2)}</pre>
              </div>
            )}

            <form onSubmit={handleCreateFullBOM} className="space-y-4">
              {/* Header Details Card */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-3">
                <div className="font-bold text-xs text-[#211B17] flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" /> 1. Product / BOM Header Information
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                    <label className="text-[#544B45] font-bold block mb-1">Product / Job Reference *</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        const sel = designJobs.find((j) => j.id === e.target.value);
                        if (sel) setNewBomName(`${sel.productName} BOM`);
                      }}
                      required
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-medium"
                    >
                      {designJobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName}
                        </option>
                      ))}
                      <option value="101">101 - Steel Table (Standard Item)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[#544B45] font-bold block mb-1">BOM Name (bom_name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Steel Table BOM"
                      value={newBomName}
                      onChange={(e) => setNewBomName(e.target.value)}
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[#544B45] font-bold block mb-1">Version (version) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. V1, V2, REV-01"
                      value={newVersion}
                      onChange={(e) => setNewVersion(e.target.value)}
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[#544B45] font-bold block mb-1">Output Product Quantity *</label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      required
                      value={newProductQuantity}
                      onChange={(e) => setNewProductQuantity(Number(e.target.value))}
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                    <span className="text-[10px] text-[#70665F] mt-0.5 block">Quantity of finished unit produced</span>
                  </div>
                  <div className="md:col-span-3 flex items-end justify-between p-2.5 bg-white rounded-xl border border-[#EBE3DB]">
                    <div>
                      <span className="text-[10px] text-[#70665F] block font-semibold">ESTIMATED PRODUCTION COST</span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        ₹ {totalNewBOMCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#70665F] block font-semibold">TOTAL LINE ITEMS</span>
                      <span className="text-base font-black text-[#211B17] font-mono">{bomItemsList.length} Materials</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#211B17] flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-amber-600" /> 2. Material Requirements List (items)
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewBOMRow}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Material Row
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#EBE3DB] bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FAF7F2] text-[#70665F] font-mono text-[10px] uppercase border-b border-[#EBE3DB]">
                      <tr>
                        <th className="p-2.5">Material (material) *</th>
                        <th className="p-2.5 w-24">Qty (quantity) *</th>
                        <th className="p-2.5 w-24">Unit (unit) *</th>
                        <th className="p-2.5 w-32">Procurement *</th>
                        <th className="p-2.5 w-40">Item Type (item_type) *</th>
                        <th className="p-2.5 w-28 text-right">Est Rate (₹)</th>
                        <th className="p-2.5 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {bomItemsList.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-[#FAF7F2]/40">
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="e.g. 201 - Mild Steel Plate 5mm"
                              value={row.material}
                              onChange={(e) => handleUpdateBOMRow(row.id, 'material', e.target.value)}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-500 font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              required
                              min="0.001"
                              step="any"
                              value={row.quantity}
                              onChange={(e) => handleUpdateBOMRow(row.id, 'quantity', Number(e.target.value))}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-500 font-mono font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={row.unit}
                              onChange={(e) => handleUpdateBOMRow(row.id, 'unit', e.target.value)}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-500 font-mono font-bold"
                            >
                              <option value="KG">KG</option>
                              <option value="PCS">PCS</option>
                              <option value="NOS">NOS</option>
                              <option value="MTR">MTR</option>
                              <option value="LTR">LTR</option>
                              <option value="SET">SET</option>
                              <option value="SQM">SQM</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <select
                              value={row.procurement}
                              onChange={(e) => handleUpdateBOMRow(row.id, 'procurement', e.target.value)}
                              className={`w-full border rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:outline-none ${
                                row.procurement === 'FABRICATE'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-sky-50 text-sky-800 border-sky-300'
                              }`}
                            >
                              <option value="PURCHASE">PURCHASE (Vendor)</option>
                              <option value="FABRICATE">FABRICATE (Shopfloor)</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <select
                              value={row.item_type}
                              onChange={(e) => handleUpdateBOMRow(row.id, 'item_type', e.target.value)}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-500 font-mono font-medium"
                            >
                              <option value="RAW_MATERIAL">RAW_MATERIAL</option>
                              <option value="FABRICATED">FABRICATED</option>
                              <option value="BOUGHT_OUT">BOUGHT_OUT</option>
                              <option value="CONSUMABLE">CONSUMABLE</option>
                              <option value="HARDWARE">HARDWARE</option>
                              <option value="ELECTRICAL">ELECTRICAL</option>
                            </select>
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              min="0"
                              value={row.estimatedRate}
                              onChange={(e) => handleUpdateBOMRow(row.id, 'estimatedRate', Number(e.target.value))}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-xs text-[#211B17] text-right focus:outline-none focus:border-amber-500 font-mono"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveBOMRow(row.id)}
                              className="p-1.5 rounded-lg text-[#70665F] hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Material Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsCreateBOMModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] font-semibold hover:bg-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white font-bold shadow-lg shadow-amber-600/30 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save & Release Master BOM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 2: ADD SINGLE ITEM TO ACTIVE BOM */}
      {/* ======================================================================= */}
      {isAddItemModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsAddItemModalOpen(false)}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6 text-xs max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                Add Item to Master BOM ({activeBOM?.jobNumber})
              </h3>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Part / Material Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 201-MS-PLATE"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Item Type (item_type) *</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  >
                    <option value="Raw Material">Raw Material (RAW_MATERIAL)</option>
                    <option value="Fabricated">Fabricated (FABRICATED)</option>
                    <option value="Bought-Out">Bought-Out (BOUGHT_OUT)</option>
                    <option value="Consumable">Consumable (CONSUMABLE)</option>
                    <option value="Sub-Assembly">Sub-Assembly</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Material / Item Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SS 316L Shell Plate 12mm Thick"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Qty (quantity) *</label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Unit (unit) *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono font-bold"
                  >
                    <option value="KG">KG</option>
                    <option value="PCS">PCS</option>
                    <option value="NOS">NOS</option>
                    <option value="MTR">MTR</option>
                    <option value="LTR">LTR</option>
                    <option value="SET">SET</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Procurement *</label>
                  <select
                    value={procurementType}
                    onChange={(e) => setProcurementType(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono font-bold"
                  >
                    <option value="Purchase">PURCHASE</option>
                    <option value="In-House">FABRICATE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Material Grade</label>
                  <input
                    type="text"
                    placeholder="e.g. SS 316L, IS 2062"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Est. Unit Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedRate}
                    onChange={(e) => setEstimatedRate(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] font-semibold hover:bg-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition"
                >
                  Add Item to BOM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
