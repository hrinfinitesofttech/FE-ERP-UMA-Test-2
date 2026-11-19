'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { ItemMaster } from '../../../types/store';
import { toast } from '../../../context/ToastContext';
import { api } from '@/lib/apiClient';
import {
  CheckCircle2,
  Eye,
  Truck,
  FileText,
  Calendar,
  Building2,
  FolderKanban,
  Scale,
  User,
  X,
  Edit2,
  Save,
  Clock,
  Sparkles,
  Info,
  Check,
  FileSpreadsheet,
  Upload,
  Download,
  Layers,
  Boxes,
  AlertTriangle,
  RefreshCw,
  Filter,
} from 'lucide-react';

export default function ItemMasterListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    itemMasters,
    deleteItemMaster,
    updateItemMaster,
    goodsReceipts,
    stockBalances,
    isInitialLoading,
  } = useERP();

  const createdParam = searchParams?.get('created');
  const updatedParam = searchParams?.get('updated');

  // Local state for fetched items if user imports or refreshes
  const [localItems, setLocalItems] = useState<ItemMaster[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync with context
  useEffect(() => {
    if (itemMasters && itemMasters.length > 0) {
      setLocalItems(itemMasters);
    }
  }, [itemMasters]);

  // Load items directly from API
  const refreshItemsFromApi = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await api.store.items.list();
      if (Array.isArray(res)) {
        const normalized: ItemMaster[] = res.map((item: any) => ({
          id: String(item.id || item.item_code || item.itemCode || ''),
          itemCode: item.item_code || item.itemCode || item.id || '',
          itemName: item.item_name || item.itemName || 'Item',
          itemType: (item.item_type || item.itemType || 'Raw Material') as any,
          category: item.category || 'General',
          subCategory: item.sub_category || item.subCategory || '',
          description: item.description || '',
          specification: item.specification || '',
          brandMake: item.brand_make || item.brandMake || '',
          hsnSac: item.hsn_sac || item.hsnSac || '72193200',
          gstRate: Number(item.gst_rate || item.gstRate || 18.0),
          uom: item.uom || 'NOS',
          minimumStock: Number(item.minimum_stock || item.minimumStock || 0),
          maximumStock: Number(item.maximum_stock || item.maximumStock || 0),
          reorderLevel: Number(item.reorder_level || item.reorderLevel || 0),
          safetyStock: Number(item.safety_stock || item.safetyStock || 0),
          leadTimeDays: Number(item.lead_time_days || item.leadTimeDays || 7),
          defaultWarehouseId: item.default_warehouse_id || item.defaultWarehouseId || 'WH-MAIN',
          defaultLocationBin: item.default_location_bin || item.defaultLocationBin || 'A-01',
          batchTracking: Boolean(item.batch_tracking ?? item.batchTracking ?? false),
          serialTracking: Boolean(item.serial_tracking ?? item.serialTracking ?? false),
          lotTracking: Boolean(item.lot_tracking ?? item.lotTracking ?? false),
          defaultPurchaseRate: Number(item.unit_cost || item.defaultPurchaseRate || 0),
          lastPurchaseRate: Number(item.unit_cost || item.lastPurchaseRate || 0),
          standardCost: Number(item.unit_cost || item.standardCost || 0),
          status: (item.status || 'Active') as any,
          currentStock: Number(item.currentStock || item.quantity || 0),
        }));
        setLocalItems(normalized);
      }
    } catch (err) {
      console.error('Failed to refresh items from API:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Filter & Category States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Excel / CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    importedCount?: number;
    updatedCount?: number;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Inward Traceability Modal State
  const [selectedItemForInward, setSelectedItemForInward] = useState<ItemMaster | null>(null);
  const [isEditingInward, setIsEditingInward] = useState(false);
  const [inwardForm, setInwardForm] = useState({
    supplierName: '',
    invoiceNumber: '',
    challanNumber: '',
    invoiceDate: '',
    vehicleNumber: '',
    jobNumber: '',
    projectNumber: '',
    weight: '',
    receivedBy: '',
    remarks: '',
  });
  const [inwardSuccessToast, setInwardSuccessToast] = useState('');

  // Items Source (localItems or context)
  const allItems: ItemMaster[] = useMemo(() => {
    return localItems.length > 0 ? localItems : itemMasters || [];
  }, [localItems, itemMasters]);

  // Unique Categories for Filter Dropdown
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    allItems.forEach((it) => {
      if (it.category && it.category.trim()) {
        cats.add(it.category.trim());
      }
    });
    return Array.from(cats).sort();
  }, [allItems]);

  // Helper to extract stock/quantity
  const getItemQuantity = useCallback((item: ItemMaster) => {
    const cleanName = (item.itemName || '').trim().toLowerCase();
    const cleanCode = (item.itemCode || item.id || '').trim().toLowerCase();

    // 1. Check matching stock balances for live available quantity
    const matchedStock = (stockBalances || []).find((s) => {
      const sCode = (s.itemCode || (s as any).item_code || '').trim().toLowerCase();
      const sName = (s.itemName || (s as any).item_name || '').split(' (')[0].trim().toLowerCase();
      return (
        (cleanCode && sCode === cleanCode) ||
        (cleanName && (sName === cleanName || sName.includes(cleanName) || cleanName.includes(sName)))
      );
    });
    if (matchedStock && typeof matchedStock.availableQty === 'number') {
      return matchedStock.availableQty;
    }
    if (matchedStock && typeof (matchedStock as any).quantity === 'number') {
      return (matchedStock as any).quantity;
    }

    // 2. Check received or accepted GRNs for actual inwarded quantity
    const grnInwardQty = (goodsReceipts || [])
      .filter((g) => g.status === 'Accepted' || g.status === 'Received' || (g as any).directInward)
      .flatMap((g) => g.items || [])
      .filter((gitm: any) => {
        const gCode = (gitm.itemCode || gitm.partNumber || '').trim().toLowerCase();
        const gName = (gitm.itemName || gitm.description || '').split(' (')[0].trim().toLowerCase();
        return (
          (cleanCode && (gCode === cleanCode || gCode.includes(cleanCode) || cleanCode.includes(gCode))) ||
          (cleanName && (gName === cleanName || gName.includes(cleanName) || cleanName.includes(gName)))
        );
      })
      .reduce((sum: number, gitm: any) => sum + Number(gitm.acceptedQuantity || gitm.acceptedQty || gitm.receivedQuantity || gitm.receivedQty || gitm.quantity || gitm.poQuantity || 0), 0);
    if (grnInwardQty > 0) {
      return grnInwardQty;
    }

    if (item.currentStock !== undefined && item.currentStock !== null) {
      return Number(item.currentStock);
    }

    return Number((item as any).quantity ?? 0);
  }, [stockBalances, goodsReceipts]);

  // Helper to extract description
  const getItemDescription = (item: ItemMaster) => {
    if (item.description && item.description.trim()) {
      return item.description;
    }
    if (item.specification && item.specification.trim()) {
      return item.specification;
    }
    return (item as any).size || (item as any).thk || '-';
  };

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = allItems.length;
    let inStock = 0;
    let lowStock = 0;
    let totalValuation = 0;

    allItems.forEach((it) => {
      const qty = getItemQuantity(it);
      const cost = Number((it as any).unitCost || it.standardCost || it.defaultPurchaseRate || 0);
      totalValuation += qty > 0 ? qty * cost : 0;
      if (qty > (it.minimumStock || 0)) {
        inStock++;
      } else {
        lowStock++;
      }
    });

    return {
      total,
      categoriesCount: uniqueCategories.length,
      inStock,
      lowStock,
      totalValuation,
    };
  }, [allItems, uniqueCategories, getItemQuantity]);

  // Filtered Display Items
  const filteredDisplayItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
        return false;
      }
      // Stock Status filter
      if (stockStatusFilter !== 'ALL') {
        const qty = getItemQuantity(item);
        const min = item.minimumStock || 0;
        if (stockStatusFilter === 'IN_STOCK' && qty <= min) return false;
        if (stockStatusFilter === 'LOW_STOCK' && (qty <= 0 || qty > min)) return false;
        if (stockStatusFilter === 'OUT_OF_STOCK' && qty > 0) return false;
      }
      return true;
    });
  }, [allItems, selectedCategoryFilter, stockStatusFilter, getItemQuantity]);

  // Open Inward Details Modal
  const handleOpenInwardModal = (item: ItemMaster) => {
    setSelectedItemForInward(item);
    setIsEditingInward(false);
    setInwardSuccessToast('');

    const matchedGrn = (goodsReceipts || []).find((grn) =>
      grn.items?.some(
        (it) =>
          it.itemId === item.id ||
          it.itemCode === item.itemCode ||
          it.itemName.toLowerCase() === item.itemName.toLowerCase()
      )
    );

    const anyItem = item as any;
    setInwardForm({
      supplierName:
        anyItem.supplierName ||
        item.preferredSupplierName ||
        matchedGrn?.supplierName ||
        '',
      invoiceNumber:
        anyItem.invoiceNumber ||
        matchedGrn?.invoiceNumber ||
        '',
      challanNumber:
        anyItem.challanNumber ||
        matchedGrn?.deliveryChallanNumber ||
        '',
      invoiceDate:
        anyItem.invoiceDate ||
        anyItem.inwardDate ||
        matchedGrn?.grnDate ||
        '',
      vehicleNumber:
        anyItem.vehicleNumber ||
        matchedGrn?.vehicleNumber ||
        '',
      jobNumber:
        anyItem.jobNumber ||
        anyItem.projectNumber ||
        '',
      projectNumber:
        anyItem.projectNumber ||
        anyItem.jobNumber ||
        '',
      weight:
        anyItem.weight ||
        '',
      receivedBy:
        anyItem.receivedBy ||
        matchedGrn?.receivedBy ||
        'Store Inward Team',
      remarks:
        anyItem.inwardRemarks ||
        matchedGrn?.remarks ||
        '',
    });
  };

  const handleSaveInwardDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForInward) return;

    if (updateItemMaster) {
      updateItemMaster(selectedItemForInward.id, {
        supplierName: inwardForm.supplierName,
        preferredSupplierName: inwardForm.supplierName,
        invoiceNumber: inwardForm.invoiceNumber,
        challanNumber: inwardForm.challanNumber,
        invoiceDate: inwardForm.invoiceDate,
        inwardDate: inwardForm.invoiceDate,
        vehicleNumber: inwardForm.vehicleNumber,
        jobNumber: inwardForm.jobNumber,
        projectNumber: inwardForm.projectNumber,
        weight: inwardForm.weight,
        receivedBy: inwardForm.receivedBy,
        inwardRemarks: inwardForm.remarks,
      } as any);
    }

    toast.success('Inward details saved to database successfully!');
    setInwardSuccessToast('Inward details saved to database successfully!');
    setIsEditingInward(false);
    setTimeout(() => setInwardSuccessToast(''), 4000);
  };

  const handleEdit = (item: ItemMaster) => {
    const targetId = item.id || item.itemCode || '';
    if (targetId) {
      router.push(`/store/items/${encodeURIComponent(targetId)}/edit`);
    }
  };

  const handleDelete = (item: ItemMaster) => {
    toast.confirm({
      title: 'Delete Item Master',
      message: `Are you sure you want to delete item "${item.itemName}" (${item.itemCode})? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        if (deleteItemMaster) {
          deleteItemMaster(item.id);
        }
        setLocalItems((prev) => prev.filter((i) => i.id !== item.id && i.itemCode !== item.itemCode));
        toast.success(`Item "${item.itemName}" deleted successfully.`);
      },
    });
  };

  // Handle Excel File Drop / Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setImportResult(null);
    }
  };

  // Submit Excel / CSV to Backend API
  const handleUploadExcel = async () => {
    if (!selectedFile) {
      toast.error('Please select an Excel (.xlsx, .xls) or CSV file first.');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.store.items.importExcel(formData);
      if (res && res.success) {
        setImportResult({
          success: true,
          message: res.message || 'File processed and imported successfully!',
          importedCount: res.imported_count,
          updatedCount: res.updated_count,
        });
        toast.success(res.message || 'Items successfully imported into Store Master!');
        await refreshItemsFromApi();
      } else {
        setImportResult({
          success: false,
          message: res?.error || 'Failed to process file on server.',
        });
        toast.error(res?.error || 'Upload failed.');
      }
    } catch (err: any) {
      console.error('Error importing Excel:', err);
      setImportResult({
        success: false,
        message: err?.message || 'Error uploading file to ERP server.',
      });
      toast.error(err?.message || 'Upload error.');
    } finally {
      setIsImporting(false);
    }
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const headers = ['Item Code', 'Item Name', 'Category', 'UOM', 'Opening Stock', 'Unit Cost', 'Minimum Stock'];
    const sampleRows = [
      ['ALN-M10-20', 'ALN 02- M10 x 20 Allencap Screw', 'Allen Cap Screws', 'NOS', '128', '15.0', '20'],
      ['BRG-6205', 'BRG - 6205 Skf Bearing', 'Bearings & Housings', 'NOS', '5', '350.0', '2'],
      ['ISMB-150-75', 'ISMB 01-ISMB 150 x 75 I BIM M.S.', 'Structural Beams', 'KG', '394.0', '72.0', '50'],
      ['PLT-SS304-10', '10MM SS 304 Plate', 'SS 304 Plates', 'KG', '27.72', '240.0', '10'],
      ['SSP-SS304-2NB', '2" NB x SCH 10 SS 304 Pipe', 'SS 304 Pipes', 'MTR', '67.61', '520.0', '12'],
      ['GB-NMRV63', 'NMRV63/30:1/71b5 Gear Box', 'Gear Boxes & Reducers', 'NOS', '7', '4800.0', '1'],
    ];

    const csvContent = [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uma_store_items_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Sample template downloaded!');
  };

  // ERP Columns
  const columns: ERPColumn<ItemMaster>[] = [
    {
      key: 'seqNo',
      header: '#',
      cell: (_item, index) => (
        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
          {index + 1}
        </span>
      ),
    },
    {
      key: 'itemCode',
      header: 'ITEM CODE',
      isCodeLink: true,
      onCodeClick: handleEdit,
      cell: (item) => (
        <button
          onClick={() => handleEdit(item)}
          className="text-blue-600 hover:text-blue-800 underline font-bold font-mono text-xs cursor-pointer text-left"
        >
          {item.itemCode || item.id}
        </button>
      ),
    },
    {
      key: 'itemName',
      header: 'MATERIAL HEAD / ITEM NAME',
      cell: (item) => (
        <div className="max-w-xs">
          <span className="font-bold text-slate-900 text-xs block truncate" title={item.itemName}>
            {item.itemName}
          </span>
          <span className="text-[10.5px] text-slate-500 block truncate">
            {item.brandMake || 'Standard Spec'}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'CATEGORY',
      cell: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
          {item.category || 'General Store'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'DESCRIPTION',
      cell: (item) => {
        const desc = getItemDescription(item);
        return (
          <div className="max-w-[200px]" title={desc}>
            <span className="text-xs font-medium text-slate-700 block truncate">
              {desc}
            </span>
          </div>
        );
      },
    },
    {
      key: 'quantity',
      header: 'STOCK QUANTITY',
      cell: (item) => {
        const qty = getItemQuantity(item);
        const min = item.minimumStock || 0;
        const isLow = qty <= min && qty > 0;
        const isOut = qty <= 0;

        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${
                isOut
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : isLow
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {qty}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              {item.uom || 'NOS'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'uom',
      header: 'UOM',
      cell: (item) => (
        <span className="font-mono font-bold text-slate-700 text-xs">
          {item.uom || 'NOS'}
        </span>
      ),
    },
    {
      key: 'inwardAction',
      header: 'TRACEABILITY & INWARD',
      cell: (item) => (
        <button
          type="button"
          onClick={() => handleOpenInwardModal(item)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition shadow-2xs cursor-pointer"
          title="View Supplier, Invoice/Challan No, Date, Vehicle No & Project Reference"
        >
          <Eye className="w-3.5 h-3.5 text-amber-700" />
          <span>Inward Details</span>
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-4 pb-12">
      {/* ======================================================================= */}
      {/* 1. TOP KPI METRIC BANNER CARDS                                          */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mx-4 sm:mx-6 mt-4">
        {/* Total Materials */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Materials
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {kpiStats.total.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Cataloged Items</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Item Categories
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {kpiStats.categoriesCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Industrial Groups</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* In-Stock Items */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
              In Stock Items
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">
              {kpiStats.inStock.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Available in Store</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock / Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
              Low / Reorder Alerts
            </span>
            <span className="text-2xl font-black text-rose-700 mt-1 block font-mono">
              {kpiStats.lowStock.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">Below Min Threshold</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 border border-rose-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Success Notifications */}
      {createdParam && (
        <div className="mx-4 sm:mx-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Item &quot;{decodeURIComponent(createdParam)}&quot; created successfully!</span>
        </div>
      )}

      {updatedParam && (
        <div className="mx-4 sm:mx-6 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Item &quot;{decodeURIComponent(updatedParam)}&quot; updated successfully!</span>
        </div>
      )}

      {/* Main List Layout */}
      <ERPListPageLayout<ItemMaster>
        breadcrumbs={['DASHBOARD', 'STORE', 'ITEM MASTER']}
        title="Item Master (Store Inward & Material Directory)"
        data={filteredDisplayItems}
        columns={columns}
        searchPlaceholder="Search material name, code, description, category or supplier..."
        addNewHref="/store/items/add"
        addNewLabel="Add Item Master"
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isInitialLoading || isRefreshing}
        defaultPageSize={50}
        pageSizeOptions={[10, 25, 50, 100, 250]}
        getRowKey={(item, i) => item.id || item.itemCode || i}
        extraHeaderActions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 max-w-[200px] truncate cursor-pointer"
                title="Filter by Category"
              >
                <option value="ALL">All Categories ({uniqueCategories.length})</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={refreshItemsFromApi}
              disabled={isRefreshing}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition cursor-pointer"
              title="Refresh from server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-700' : ''}`} />
            </button>

            {/* Open Import Excel Modal Button */}
            <button
              type="button"
              onClick={() => {
                setIsImportModalOpen(true);
                setImportResult(null);
                setSelectedFile(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
              title="Upload and batch import materials from Excel (.xlsx) or CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import Excel / XLSX</span>
            </button>
          </div>
        }
      />

      {/* ======================================================================= */}
      {/* 2. EXCEL / CSV BATCH IMPORT MODAL                                       */}
      {/* ======================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Import Store Items from Excel / XLSX
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Auto-maps Item Code, Name, Category, UOM &amp; Opening Stock
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              {/* Notification Banner */}
              {importResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    importResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {importResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {importResult.success ? 'Import Completed' : 'Import Error'}
                    </span>
                    <span className="text-[11.5px]">{importResult.message}</span>
                  </div>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-600">
                  <Upload className="w-6 h-6 text-emerald-700" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Click to select or drag and drop your Excel file here'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)
                  </p>
                </div>

                {selectedFile && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB Ready for Import
                  </span>
                )}
              </div>

              {/* Template Download Option */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Download className="w-3.5 h-3.5 text-amber-700" />
                  <span>Need the standard Excel format?</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-amber-800 hover:text-amber-900 font-bold underline cursor-pointer text-xs"
                >
                  Download Sample CSV
                </button>
              </div>

              {/* Instructions */}
              <div className="text-[11px] text-slate-500 space-y-1 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                <span className="font-bold text-amber-900 block">Automatic Intelligent Mapping:</span>
                <p>• The system automatically matches columns for Item Code, Name, Category, UOM, and Opening Stock.</p>
                <p>• New Categories and Units of Measure (UOM) will be automatically created in the Master tables.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleUploadExcel}
                disabled={!selectedFile || isImporting}
                className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition cursor-pointer ${
                  !selectedFile || isImporting
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing &amp; Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import to Inventory</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. INWARD TRACEABILITY MODAL (Authentic Scanned Register Style)         */}
      {/* ======================================================================= */}
      {selectedItemForInward && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] shadow-2xl max-w-2xl w-full overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-crm-brand-700" />
                  <h2 className="text-base font-bold text-[color:var(--crm-text-primary)]">
                    Material Inward &amp; Source Traceability
                  </h2>
                </div>
                <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">
                  Supplier, Invoice, Challan, Date, Vehicle &amp; Job Reference (Inward Register)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForInward(null)}
                className="p-1.5 text-[color:var(--crm-text-tertiary)] hover:text-[color:var(--crm-text-primary)] hover:bg-[color:var(--crm-surface-subtle)] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {inwardSuccessToast && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{inwardSuccessToast}</span>
                </div>
              )}

              {/* Item Summary Banner */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {selectedItemForInward.itemCode}
                    </span>
                    <span className="text-xs font-bold text-[color:var(--crm-text-primary)]">
                      {selectedItemForInward.itemName}
                    </span>
                  </div>
                  <div className="text-xs text-[color:var(--crm-text-secondary)] mt-1">
                    <strong>Description:</strong> {getItemDescription(selectedItemForInward)}
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-amber-200 sm:pl-4">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--crm-text-secondary)] block">In Stock Qty</span>
                  <span className="font-mono text-lg font-black text-emerald-700">
                    {getItemQuantity(selectedItemForInward)}{' '}
                    <span className="text-xs font-normal text-[color:var(--crm-text-secondary)]">{selectedItemForInward.uom || 'NOS'}</span>
                  </span>
                </div>
              </div>

              {/* Inward Details Grid / Form */}
              {!isEditingInward ? (
                <div className="border border-[color:var(--crm-border-default)] rounded-xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-[color:var(--crm-bg-app)] border-b border-[color:var(--crm-border-default)] flex items-center justify-between">
                    <span className="text-xs font-bold text-[color:var(--crm-text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-crm-brand-700" />
                      <span>Physical Register Inward Data</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingInward(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-crm-brand-700 hover:text-crm-brand-800 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Inward Info</span>
                    </button>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] text-[color:var(--crm-text-secondary)] font-semibold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-crm-brand-700" />
                        <span>Supplier / Source Vendor:</span>
                      </span>
                      <div className="font-bold text-[color:var(--crm-text-primary)] text-sm bg-[color:var(--crm-bg-app)] p-2 rounded-lg border border-[color:var(--crm-border-default)]">
                        {inwardForm.supplierName || 'UMA FABRICATION & ENG'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[color:var(--crm-text-secondary)] font-semibold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Invoice &amp; Challan No:</span>
                      </span>
                      <div className="font-mono font-bold text-[color:var(--crm-text-primary)] text-sm bg-[color:var(--crm-bg-app)] p-2 rounded-lg border border-[color:var(--crm-border-default)] flex items-center justify-between">
                        <span>Inv: {inwardForm.invoiceNumber || '-'}</span>
                        <span className="text-purple-700">Challan: {inwardForm.challanNumber || '-'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[color:var(--crm-text-secondary)] font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Challan / Inward Date:</span>
                      </span>
                      <div className="font-bold text-[color:var(--crm-text-primary)] text-xs bg-[color:var(--crm-bg-app)] p-2 rounded-lg border border-[color:var(--crm-border-default)]">
                        {inwardForm.invoiceDate || '01/08/2026'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[color:var(--crm-text-secondary)] font-semibold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-crm-brand-600" />
                        <span>Vehicle No. / Transporter:</span>
                      </span>
                      <div className="font-mono font-bold text-[color:var(--crm-text-primary)] text-xs bg-[color:var(--crm-bg-app)] p-2 rounded-lg border border-[color:var(--crm-border-default)]">
                        {inwardForm.vehicleNumber || 'GJ-02-AT-3826'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[color:var(--crm-text-secondary)] font-semibold flex items-center gap-1">
                        <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
                        <span>Project / Job Reference:</span>
                      </span>
                      <div className="font-mono font-bold text-crm-brand-700 text-xs bg-[color:var(--crm-bg-app)] p-2 rounded-lg border border-[color:var(--crm-border-default)]">
                        {inwardForm.projectNumber || inwardForm.jobNumber || 'PRJ-2026-001'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[color:var(--crm-text-secondary)] font-semibold flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-rose-600" />
                        <span>Weight:</span>
                      </span>
                      <div className="font-mono font-bold text-[color:var(--crm-text-primary)] text-xs bg-[color:var(--crm-bg-app)] p-2 rounded-lg border border-[color:var(--crm-border-default)]">
                        {inwardForm.weight || '14.750 KG'}
                      </div>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-[11px] text-[color:var(--crm-text-secondary)] font-semibold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-600" />
                        <span>Received By / Handover Staff:</span>
                      </span>
                      <div className="font-medium text-[color:var(--crm-text-primary)] text-xs bg-[color:var(--crm-bg-app)] p-2 rounded-lg border border-[color:var(--crm-border-default)]">
                        {inwardForm.receivedBy || 'Store Inward Team / Harsh'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveInwardDetails} className="space-y-3 bg-[color:var(--crm-bg-app)] p-4 rounded-xl border border-[color:var(--crm-border-default)]">
                  <div className="text-xs font-bold text-[color:var(--crm-text-primary)] mb-1 flex items-center justify-between">
                    <span>Edit Inward Provenance Details</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingInward(false)}
                      className="text-xs text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-[color:var(--crm-text-primary)] mb-1">Supplier Name *</label>
                      <input
                        type="text"
                        value={inwardForm.supplierName}
                        onChange={(e) => setInwardForm({ ...inwardForm, supplierName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs font-medium text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. UMA FABRICATION & ENG"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[color:var(--crm-text-primary)] mb-1">Invoice Number</label>
                      <input
                        type="text"
                        value={inwardForm.invoiceNumber}
                        onChange={(e) => setInwardForm({ ...inwardForm, invoiceNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs font-mono text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. 402"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[color:var(--crm-text-primary)] mb-1">Delivery Challan Number</label>
                      <input
                        type="text"
                        value={inwardForm.challanNumber}
                        onChange={(e) => setInwardForm({ ...inwardForm, challanNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs font-mono text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. CH-402"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[color:var(--crm-text-primary)] mb-1">Challan / Invoice Date</label>
                      <input
                        type="text"
                        value={inwardForm.invoiceDate}
                        onChange={(e) => setInwardForm({ ...inwardForm, invoiceDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. 01/08/2026"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[color:var(--crm-text-primary)] mb-1">Vehicle Number</label>
                      <input
                        type="text"
                        value={inwardForm.vehicleNumber}
                        onChange={(e) => setInwardForm({ ...inwardForm, vehicleNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs font-mono text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. GJ-02-AT-3826 or BY HARSH"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[color:var(--crm-text-primary)] mb-1">Project Reference</label>
                      <input
                        type="text"
                        value={inwardForm.projectNumber || inwardForm.jobNumber}
                        onChange={(e) => setInwardForm({ ...inwardForm, projectNumber: e.target.value, jobNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs font-mono text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. PRJ-26-130 or UMA FOOD"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[color:var(--crm-text-primary)] mb-1">Material Weight</label>
                      <input
                        type="text"
                        value={inwardForm.weight}
                        onChange={(e) => setInwardForm({ ...inwardForm, weight: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs font-mono text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. 14.750 KG"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[color:var(--crm-text-primary)] mb-1">Received By / Handover</label>
                      <input
                        type="text"
                        value={inwardForm.receivedBy}
                        onChange={(e) => setInwardForm({ ...inwardForm, receivedBy: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-xs text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. Store Inward Team"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInward(false)}
                      className="px-3 py-1.5 text-xs text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-crm-brand-700 hover:bg-crm-brand-800 rounded-lg shadow-2xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Inward Info</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] flex items-center justify-between">
              <span className="text-[11px] text-[color:var(--crm-text-secondary)]">
                Linked directly to Uma Technofab Material Inward Physical Register.
              </span>
              <button
                type="button"
                onClick={() => setSelectedItemForInward(null)}
                className="px-4 py-1.5 text-xs font-bold text-[color:var(--crm-text-primary)] bg-white border border-[color:var(--crm-border-default)] hover:bg-[color:var(--crm-surface-subtle)] rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
