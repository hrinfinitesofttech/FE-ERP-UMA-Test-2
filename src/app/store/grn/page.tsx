'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { GoodsReceiptNote, GRNItem, GRNStatus } from '../../../types/store';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { toast } from '../../../context/ToastContext';
import { printContent } from '@/lib/printUtils';
import {
  PackageCheck,
  Plus,
  Search,
  Truck,
  FileText,
  CheckCircle,
  Clock,
  ShieldAlert,
  X,
  ShieldCheck,
  Eye,
  Printer,
  ArrowRight,
  ClipboardCheck,
  Box,
  Trash2,
  Building2,
  Calendar,
  Layers,
  CheckSquare,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

interface InwardItemRow {
  id: string;
  poNumber: string;
  poDate: string;
  indentNumber: string;
  indentDate: string;
  itemCode: string;
  itemName: string;
  description: string;
  makeBrand: string;
  heatSerialNo: string;
  dept: string;
  uom: string;
  challanQuantity: number;
  receivedQuantity: number;
  shortQuantity: number;
  excessQuantity: number;
  rejectedQuantity: number;
  acceptedQuantity: number;
  rate: number;
  discount: number;
  totalValue: number;
}

function GoodsReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poParam = searchParams.get('poNumber') || searchParams.get('poId') || '';

  const {
    goodsReceipts,
    addGRN,
    inwardGRNToStock,
    purchaseOrders,
    suppliers,
    warehouses,
    projectJobs,
    approveQCInspection,
    isInitialLoading,
  } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrnForDetails, setSelectedGrnForDetails] = useState<GoodsReceiptNote | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [stockAddedBanner, setStockAddedBanner] = useState(false);
  const [directInward, setDirectInward] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableWarehouses = warehouses || [];

  // Form State - Document Header
  const [grnNumberInput, setGrnNumberInput] = useState('');
  const [grnDate, setGrnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [poId, setPoId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [indentNumber, setIndentNumber] = useState('');
  const [indentDate, setIndentDate] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [gateEntryNo, setGateEntryNo] = useState('');
  const [gateEntryDate, setGateEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dcNo, setDcNo] = useState('');
  const [challanDate, setChallanDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lrNo, setLrNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [authorized, setAuthorized] = useState<'Yes' | 'No'>('Yes');
  const [inspectionRequired, setInspectionRequired] = useState<'Yes' | 'No'>('Yes');
  const [preparedBy, setPreparedBy] = useState('EDP / PREPARED BY');
  const [storeManager, setStoreManager] = useState('STORE MANAGER');
  const [inspectedBy, setInspectedBy] = useState('INSPECTED BY');
  const [hod, setHod] = useState('H.O.D.');
  const [accountManager, setAccountManager] = useState('ACCOUNT MANAGER');
  const [remarks, setRemarks] = useState('');

  // Form State - Line Items (15 Columns matching image)
  const [inwardItems, setInwardItems] = useState<InwardItemRow[]>([
    {
      id: 'ITM-1',
      poNumber: '0050/17-18',
      poDate: '2026-03-16',
      indentNumber: 'MMPR/0017/17-18',
      indentDate: '2026-03-16',
      itemCode: '0501040165',
      itemName: 'BEARING 2025',
      description: 'BEARING 2025',
      makeBrand: 'AIRMAX',
      heatSerialNo: '1236,1234,1235,1237,1238',
      dept: 'MEC',
      uom: 'KG',
      challanQuantity: 5,
      receivedQuantity: 5,
      shortQuantity: 0,
      excessQuantity: 0,
      rejectedQuantity: 1,
      acceptedQuantity: 4,
      rate: 1900,
      discount: 0,
      totalValue: 7600,
    },
  ]);

  // Combined suppliers including any PO supplier
  const combinedSuppliers = useMemo(() => {
    const list = [...(suppliers || [])];
    purchaseOrders.forEach((po) => {
      if (po.supplierName) {
        const found = list.some(
          (s) => s.id === po.supplierId || s.supplierName?.toLowerCase() === po.supplierName.toLowerCase()
        );
        if (!found) {
          list.push({
            id: po.supplierId || `SUP-${po.supplierName.replace(/\s+/g, '-').slice(0, 10)}`,
            supplierName: po.supplierName,
            status: 'Approved',
          } as any);
        }
      }
    });
    return list;
  }, [suppliers, purchaseOrders]);

  // Initialize modal values when PO param is present or when opening
  useEffect(() => {
    if (poParam && purchaseOrders.length > 0) {
      const match = purchaseOrders.find((p) => p.id === poParam || p.poNumber === poParam);
      if (match) {
        handleSelectPO(match.id || match.poNumber);
        setIsModalOpen(true);
      }
    }
  }, [poParam, purchaseOrders]);

  const handleSelectPO = (selectedPoId: string) => {
    setPoId(selectedPoId);
    if (!selectedPoId) return;

    const po = purchaseOrders.find((p) => p.id === selectedPoId || p.poNumber === selectedPoId);
    if (po) {
      setPoNumber(po.poNumber || '');
      setPoDate(po.poDate || new Date().toISOString().split('T')[0]);
      setIndentNumber((po as any).prNumber || (po as any).indentNumber || '');
      setIndentDate((po as any).prDate || po.poDate || new Date().toISOString().split('T')[0]);

      if (po.supplierId) setSupplierId(po.supplierId);
      if (po.supplierName) setSupplierName(po.supplierName);

      const suppMatch = combinedSuppliers.find(
        (s) => s.id === po.supplierId || s.supplierName?.toLowerCase() === po.supplierName?.toLowerCase()
      );
      if (suppMatch) {
        const addr = [suppMatch.address, (suppMatch as any).city, (suppMatch as any).state, (suppMatch as any).country || 'INDIA']
          .filter(Boolean)
          .join(', ');
        if (addr) setSupplierAddress(addr);
      }

      if (po.items && po.items.length > 0) {
        const loadedItems: InwardItemRow[] = po.items.map((itm: any, idx: number) => {
          const qty = Number(itm.quantity || itm.orderedQuantity || 1);
          const rate = Number(itm.rate || itm.unitPrice || 0);
          const discount = Number(itm.discount || 0);
          const acceptedQty = qty;
          const totalVal = Math.max(0, acceptedQty * rate - discount);

          return {
            id: `ITM-${Date.now()}-${idx + 1}`,
            poNumber: po.poNumber || '',
            poDate: po.poDate || '',
            indentNumber: (po as any).prNumber || (po as any).indentNumber || '',
            indentDate: (po as any).prDate || po.poDate || '',
            itemCode: itm.itemCode || `ITM-${idx + 1}`,
            itemName: itm.itemName || itm.description || 'Material Item',
            description: itm.description || itm.specification || itm.itemName || '',
            makeBrand: (itm as any).brandMake || (itm as any).make || '',
            heatSerialNo: '',
            dept: 'MEC',
            uom: itm.unitOfMeasure || itm.unit || 'KG',
            challanQuantity: qty,
            receivedQuantity: qty,
            shortQuantity: 0,
            excessQuantity: 0,
            rejectedQuantity: 0,
            acceptedQuantity: acceptedQty,
            rate: rate,
            discount: discount,
            totalValue: totalVal,
          };
        });
        setInwardItems(loadedItems);
      }
    }
  };

  const handleSelectSupplier = (suppId: string) => {
    setSupplierId(suppId);
    const supp = combinedSuppliers.find((s) => s.id === suppId);
    if (supp) {
      setSupplierName(supp.supplierName || (supp as any).name || '');
      const addr = [supp.address, (supp as any).city, (supp as any).state, (supp as any).country || 'INDIA']
        .filter(Boolean)
        .join(', ');
      setSupplierAddress(addr);
    }
  };

  const updateItemLine = (idx: number, field: keyof InwardItemRow, value: any) => {
    setInwardItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: value };

      const chQty = Number(field === 'challanQuantity' ? value : item.challanQuantity) || 0;
      const recQty = Number(field === 'receivedQuantity' ? value : item.receivedQuantity) || 0;
      const rejQty = Number(field === 'rejectedQuantity' ? value : item.rejectedQuantity) || 0;
      const rateVal = Number(field === 'rate' ? value : item.rate) || 0;
      const discVal = Number(field === 'discount' ? value : item.discount) || 0;

      item.shortQuantity = Math.max(0, chQty - recQty);
      item.excessQuantity = Math.max(0, recQty - chQty);
      item.acceptedQuantity = Math.max(0, recQty - rejQty);
      item.totalValue = Math.max(0, item.acceptedQuantity * rateVal - discVal);

      updated[idx] = item;
      return updated;
    });
  };

  const addItemLine = () => {
    setInwardItems((prev) => [
      ...prev,
      {
        id: `ITM-${Date.now()}-${prev.length + 1}`,
        poNumber: poNumber || '',
        poDate: poDate || grnDate,
        indentNumber: indentNumber || '',
        indentDate: indentDate || grnDate,
        itemCode: '',
        itemName: '',
        description: '',
        makeBrand: '',
        heatSerialNo: '',
        dept: 'MEC',
        uom: 'KG',
        challanQuantity: 1,
        receivedQuantity: 1,
        shortQuantity: 0,
        excessQuantity: 0,
        rejectedQuantity: 0,
        acceptedQuantity: 1,
        rate: 0,
        discount: 0,
        totalValue: 0,
      },
    ]);
  };

  const removeItemLine = (idx: number) => {
    if (inwardItems.length <= 1) {
      toast.warning('At least one material item line is required in the Material Receipt Note.');
      return;
    }
    setInwardItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const grandTotal = useMemo(() => {
    return inwardItems.reduce((acc, itm) => acc + (Number(itm.totalValue) || 0), 0);
  }, [inwardItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (inwardItems.length === 0) {
      toast.warning('Please add at least one item line to inward.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedWh = availableWarehouses.find((w) => w.id === warehouseId) || availableWarehouses[0] || {
        id: 'WH-001',
        warehouseName: 'Main Material Store',
      };

      const finalSuppName = supplierName || (selectedSupplier ? (selectedSupplier as any).supplierName : 'ABC Industries');
      const finalSuppId = supplierId || 'SUP-ABC-01';

      const finalGrnNumber =
        grnNumberInput.trim() ||
        `GRN\\Process\\${String((goodsReceipts?.length || 0) + 1).padStart(4, '0')}\\${new Date(grnDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.')}`;

      const formattedGrnItems: GRNItem[] = inwardItems.map((itm, idx) => ({
        id: `GRNITM-${Date.now()}-${idx + 1}`,
        grnId: finalGrnNumber,
        itemId: `ITM-${itm.itemCode || idx + 1}`,
        itemCode: itm.itemCode || `CODE-${idx + 1}`,
        itemName: itm.itemName || itm.description || `Item #${idx + 1}`,
        description: itm.description || itm.itemName,
        specification: itm.description,
        makeBrand: itm.makeBrand,
        dept: itm.dept,
        heatSerialNo: itm.heatSerialNo,
        poNumber: itm.poNumber || poNumber,
        poDate: itm.poDate || poDate,
        indentNumber: itm.indentNumber || indentNumber,
        indentDate: itm.indentDate || indentDate,
        challanQuantity: Number(itm.challanQuantity) || 0,
        poQuantity: Number(itm.challanQuantity) || 0,
        receivedQuantity: Number(itm.receivedQuantity) || 0,
        shortQuantity: Number(itm.shortQuantity) || 0,
        excessQuantity: Number(itm.excessQuantity) || 0,
        rejectedQuantity: Number(itm.rejectedQuantity) || 0,
        acceptedQuantity: Number(itm.acceptedQuantity) || 0,
        uom: itm.uom || 'KG',
        unitPrice: Number(itm.rate) || 0,
        rate: Number(itm.rate) || 0,
        discount: Number(itm.discount) || 0,
        totalAmount: Number(itm.totalValue) || 0,
        totalValue: Number(itm.totalValue) || 0,
        locationCode: 'WH-STORE-RACK-01',
      }));

      addGRN({
        grnDate: grnDate,
        supplierId: finalSuppId,
        supplierName: finalSuppName,
        supplierAddress: supplierAddress || 'Kurla, MUMBAI, MAHARASHTRA, INDIA',
        gateEntryNumber: gateEntryNo || `0040/17-18/Process-[${grnDate}]`,
        gateEntryDate: gateEntryDate,
        deliveryChallanNumber: dcNo || '65652',
        challanDate: challanDate,
        invoiceNumber: billNo || '632',
        billNumber: billNo || '632',
        billDate: billDate,
        lrNumber: lrNo || '-',
        transporterName: transporter || 'A.R.C.',
        vehicleNumber: vehicleNo || 'MH 12 HY 8907',
        poId: poId || '',
        poNumber: poNumber || '0050/17-18',
        poDate: poDate || grnDate,
        indentNumber: indentNumber || 'MMPR/0017/17-18',
        indentDate: indentDate || grnDate,
        projectId: 'PRJ-2026-0067',
        jobId: 'JOB-2026-0070',
        warehouseId: selectedWh.id,
        warehouseName: selectedWh.warehouseName || 'Main Material Store',
        receivedBy: 'Store Officer',
        authorized: authorized,
        inspectionRequired: inspectionRequired,
        status: directInward ? 'Accepted' : 'Inspection Pending',
        items: formattedGrnItems,
        totalReceivedValue: grandTotal,
        grandTotal: grandTotal,
        preparedBy: preparedBy,
        inspectedBy: inspectedBy,
        storeManager: storeManager,
        hod: hod,
        accountManager: accountManager,
        remarks: remarks || 'Received in good sealed condition as per supplier delivery challan.',
      });

      setIsModalOpen(false);
      toast.success(`GRN ${finalGrnNumber} created successfully! Stock register updated.`);
      setSuccessMessage(`GRN ${finalGrnNumber} created successfully! Stock register updated.`);
      if (directInward) {
        setStockAddedBanner(true);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Error creating GRN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSupplier = useMemo(() => {
    return combinedSuppliers.find((s) => s.id === supplierId) || null;
  }, [combinedSuppliers, supplierId]);

  const columns: ERPColumn<GoodsReceiptNote>[] = [
    {
      key: 'grnNumber',
      header: 'GRN NUMBER',
      isCodeLink: true,
      onCodeClick: (g) => setSelectedGrnForDetails(g),
      cell: (g) => {
        const grnNo = g.grnNumber || g.id;
        return (
          <button
            onClick={() => setSelectedGrnForDetails(g)}
            className="text-[#2563EB] hover:text-[#1D4ED8] underline font-bold font-mono text-xs cursor-pointer text-left"
          >
            {grnNo}
          </button>
        );
      },
    },
    {
      key: 'grnDate',
      header: 'GRN DATE',
      cell: (g) => <span className="font-mono text-[#475569] text-xs">{formatDate(g.grnDate)}</span>,
    },
    {
      key: 'supplier',
      header: 'SUPPLIER NAME & ADDRESS',
      cell: (g) => (
        <div>
          <span className="font-semibold text-[#1E293B] block">{g.supplierName || '-'}</span>
          <span className="text-[10px] text-[#64748B] line-clamp-1">{g.supplierAddress || '-'}</span>
        </div>
      ),
    },
    {
      key: 'poReference',
      header: 'PO & INDENT REF',
      cell: (g) => (
        <div>
          <span className="font-mono font-bold text-[#7C3AED] block">{g.poNumber || '-'}</span>
          <span className="text-[10px] text-[#64748B] block">Indent: {g.indentNumber || '-'}</span>
        </div>
      ),
    },
    {
      key: 'dcBill',
      header: 'BILL & CHALLAN NO',
      cell: (g) => (
        <div>
          <span className="text-xs text-[#334155] block">Bill: {g.billNumber || g.invoiceNumber || '-'}</span>
          <span className="text-[10.5px] text-[#64748B] block">Challan: {g.deliveryChallanNumber || '-'}</span>
        </div>
      ),
    },
    {
      key: 'transporter',
      header: 'TRANSPORTER & VEHICLE',
      cell: (g) => (
        <div>
          <span className="text-xs text-[#334155] block">{g.transporterName || '-'}</span>
          <span className="text-[10.5px] font-mono text-[#64748B] block">{g.vehicleNumber || '-'}</span>
        </div>
      ),
    },
    {
      key: 'warehouse',
      header: 'RECEIVING WAREHOUSE',
      cell: (g) => (
        <span className="text-[#334155] font-medium text-xs">{g.warehouseName || 'Main Store'}</span>
      ),
    },
    {
      key: 'grandTotal',
      header: 'TOTAL VALUE (₹)',
      cell: (g) => {
        const val =
          g.grandTotal ??
          g.totalReceivedValue ??
          (g.items && Array.isArray(g.items)
            ? g.items.reduce((sum: number, itm: any) => sum + Number(itm.totalValue || itm.totalAmount || 0), 0)
            : 7600);
        return <span className="font-mono font-bold text-[#1E293B] text-xs">{formatCurrency(val)}</span>;
      },
    },
    {
      key: 'status',
      header: 'QC STATUS',
      cell: (g) => {
        const isPending = g.status === 'Inspection Pending';
        if (g.status === 'Accepted') {
          return (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Accepted
            </span>
          );
        }
        if (isPending) {
          return (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 animate-pulse">
              <Clock className="w-3 h-3 text-amber-600" />
              Inspection Pending
            </span>
          );
        }
        return (
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            {g.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {successMessage && (
        <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {stockAddedBanner && (
        <div className="mx-4 sm:mx-6 p-4 rounded-xl bg-emerald-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Box className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <div className="font-bold text-xs text-emerald-200">
                Material Inwarded & Stock Balances Credited!
              </div>
              <div className="text-[11px] text-white/90">
                The items from this Goods Receipt Note have now been recorded into the warehouse stock balance.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/store/bom-verification"
              className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition shrink-0 flex items-center gap-1"
            >
              <span>Verify in BOM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setStockAddedBanner(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ERPListPageLayout<GoodsReceiptNote>
        breadcrumbs={['DASHBOARD', 'STORE', 'GOODS RECEIPT NOTE (GRN)']}
        data={goodsReceipts}
        columns={columns}
        searchPlaceholder="Search GRN #, Supplier, PO #, Bill #, Challan #, Transporter..."
        onAddNew={() => {
          setIsModalOpen(true);
        }}
        addNewLabel="Create Goods Receipt (GRN)"
        onView={(g) => setSelectedGrnForDetails(g)}
        isLoading={isInitialLoading}
        defaultPageSize={50}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowKey={(g, i) => g.id || g.grnNumber || i}
      />

      {/* ========================================================================= */}
      {/* AUTHENTIC MATERIAL RECEIPT NOTE DOCUMENT / PRINT SLIP MODAL               */}
      {/* ========================================================================= */}
      {selectedGrnForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-xl shadow-2xl max-w-5xl w-full p-4 sm:p-6 space-y-4 my-8 animate-in zoom-in-95 print:p-0 print:border-none print:shadow-none print:m-0">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Material Receipt Note Voucher
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printContent('printable-grn-note', { title: selectedGrnForDetails ? `GRN_${selectedGrnForDetails.grnNumber}` : 'Material_Receipt_Note' })}
                  className="px-3.5 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGrnForDetails(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Container matching exact image layout */}
            <div id="printable-grn-note" className="border border-slate-900 text-slate-900 text-[11px] leading-tight font-sans bg-white">
              {/* Top Company Header */}
              <div className="text-center py-2 px-4 border-b border-slate-900 relative">
                <div className="absolute left-4 top-2 text-left hidden sm:block">
                  <div className="font-extrabold text-blue-900 text-base tracking-tight">ForceIntellect</div>
                  <div className="text-[9px] text-slate-500 font-sans italic">adding value, enabling growth</div>
                </div>
                <div className="font-bold text-sm text-slate-900">Force Intellect Pvt Ltd.</div>
                <div className="text-[10px] text-slate-700">
                  HINJWADI ROAD BANER PUNE Pincode : 491001 MAHARASHTRA INDIA
                </div>
                <div className="text-[9.5px] text-slate-600">
                  Phone : 9993533344 Telefax : 0788-4038587 Email : contact@forceintellect.com
                </div>
              </div>

              {/* Title Box & Tag */}
              <div className="relative py-2 border-b border-slate-900 flex items-center justify-center bg-slate-50">
                <div className="border-2 border-slate-900 px-8 py-1 rounded-sm bg-white font-bold text-xs uppercase tracking-wider text-slate-950 shadow-xs">
                  Material Receipt Note
                </div>
                <div className="absolute right-4 font-bold text-[11px] text-slate-900">
                  {selectedGrnForDetails.authorized === 'No' || selectedGrnForDetails.authorized === false
                    ? 'Unauthorized'
                    : 'Authorized'}
                </div>
              </div>

              {/* Document Header 2-Box Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-900 divide-y md:divide-y-0 md:divide-x divide-slate-900">
                {/* Left Header Box */}
                <div className="p-2 space-y-1">
                  <div className="flex">
                    <span className="font-bold w-20">GRN NO.</span>
                    <span className="font-mono font-bold">: {selectedGrnForDetails.grnNumber || selectedGrnForDetails.id}</span>
                  </div>
                  <div className="pt-1">
                    <span className="font-bold block">From,</span>
                    <div className="font-bold pl-2 text-slate-950">
                      {selectedGrnForDetails.supplierName || 'ABC Industries'}
                    </div>
                    <div className="pl-2 text-[10px] text-slate-700 whitespace-pre-line">
                      {selectedGrnForDetails.supplierAddress || 'Kurla, MUMBAI, MAHARASHTRA, INDIA'}
                    </div>
                  </div>
                </div>

                {/* Right Header Box */}
                <div className="p-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold w-28">GRN DATE</span>
                    <span className="font-mono">: {formatDate(selectedGrnForDetails.grnDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold w-28">G.E. NO.</span>
                    <span className="font-mono">: {selectedGrnForDetails.gateEntryNumber || `0040/17-18/Process-[${selectedGrnForDetails.grnDate}]`}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="flex">
                      <span className="font-bold w-20">BILL NO.</span>
                      <span>: {selectedGrnForDetails.billNumber || selectedGrnForDetails.invoiceNumber || '632'}</span>
                    </div>
                    <div className="flex justify-end">
                      <span className="font-bold">DATE :</span>
                      <span className="pl-1">{formatDate(selectedGrnForDetails.billDate || selectedGrnForDetails.grnDate)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="flex">
                      <span className="font-bold w-20">CHALLAN NO.</span>
                      <span>: {selectedGrnForDetails.deliveryChallanNumber || '65652'}</span>
                    </div>
                    <div className="flex justify-end">
                      <span className="font-bold">DATE :</span>
                      <span className="pl-1">{formatDate(selectedGrnForDetails.challanDate || selectedGrnForDetails.grnDate)}</span>
                    </div>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-28">LR NO.</span>
                    <span>: {selectedGrnForDetails.lrNumber || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-28">TRANSPORTER</span>
                    <span>: {selectedGrnForDetails.transporterName || 'A.R.C.'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-28">VEHICLE NO.</span>
                    <span>: {selectedGrnForDetails.vehicleNumber || 'MH 12 HY 8907'}</span>
                  </div>
                </div>
              </div>

              {/* 15-Column Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border-b border-slate-900 text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-100 font-bold text-center divide-x divide-slate-900 text-slate-950">
                      <th className="p-1 w-7">Sl. No.</th>
                      <th className="p-1 w-24">PO No. / Date Indent No/Date</th>
                      <th className="p-1 w-20">Item Code</th>
                      <th className="p-1 min-w-[130px]">Item Description</th>
                      <th className="p-1 w-9">Dept.</th>
                      <th className="p-1 w-9">UOM</th>
                      <th className="p-1 w-12 text-right">Challan Qty.</th>
                      <th className="p-1 w-12 text-right">Received Qty.</th>
                      <th className="p-1 w-12 text-right">Short Qty.</th>
                      <th className="p-1 w-12 text-right">Excess Qty.</th>
                      <th className="p-1 w-12 text-right">Rejected Qty.</th>
                      <th className="p-1 w-12 text-right">Accepted Qty.</th>
                      <th className="p-1 w-14 text-right">Rate</th>
                      <th className="p-1 w-12 text-right">Discount</th>
                      <th className="p-1 w-16 text-right">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {selectedGrnForDetails.items && selectedGrnForDetails.items.length > 0 ? (
                      selectedGrnForDetails.items.map((itm: any, idx: number) => {
                        const poStr = itm.poNumber || selectedGrnForDetails.poNumber || '0050/17-18';
                        const poDt = itm.poDate ? formatDate(itm.poDate) : formatDate(selectedGrnForDetails.poDate || selectedGrnForDetails.grnDate);
                        const indentStr = itm.indentNumber || selectedGrnForDetails.indentNumber || 'MMPR/0017/17-18';
                        const indentDt = itm.indentDate ? formatDate(itm.indentDate) : formatDate(selectedGrnForDetails.indentDate || selectedGrnForDetails.grnDate);

                        const chQty = Number(itm.challanQuantity ?? itm.poQuantity ?? 5);
                        const recQty = Number(itm.receivedQuantity ?? 5);
                        const shortQty = Number(itm.shortQuantity ?? Math.max(0, chQty - recQty));
                        const excessQty = Number(itm.excessQuantity ?? Math.max(0, recQty - chQty));
                        const rejQty = Number(itm.rejectedQuantity ?? 0);
                        const accQty = Number(itm.acceptedQuantity ?? Math.max(0, recQty - rejQty));
                        const rateVal = Number(itm.rate ?? itm.unitPrice ?? 1900);
                        const discVal = Number(itm.discount ?? 0);
                        const totalVal = Number(itm.totalValue ?? itm.totalAmount ?? accQty * rateVal - discVal);

                        return (
                          <tr key={idx} className="divide-x divide-slate-900 align-top hover:bg-slate-50">
                            <td className="p-1 text-center font-bold">{idx + 1}</td>
                            <td className="p-1 leading-tight font-mono text-[9px]">
                              <div>{poStr} Dt. {poDt}</div>
                              <div className="text-slate-600">{indentStr} Dt. {indentDt}</div>
                            </td>
                            <td className="p-1 font-mono font-semibold">{itm.itemCode || '-'}</td>
                            <td className="p-1 leading-tight">
                              <div className="font-bold text-slate-900">{itm.itemName || itm.description || 'BEARING 2025'}</div>
                              {itm.makeBrand && <div className="text-slate-600">Make : {itm.makeBrand}</div>}
                              {itm.heatSerialNo && <div className="text-slate-600 font-mono text-[9px]">{itm.heatSerialNo}</div>}
                            </td>
                            <td className="p-1 text-center">{itm.dept || 'MEC'}</td>
                            <td className="p-1 text-center">{itm.uom || 'KG'}</td>
                            <td className="p-1 text-right font-mono">{chQty.toFixed(3)}</td>
                            <td className="p-1 text-right font-mono">{recQty.toFixed(3)}</td>
                            <td className="p-1 text-right font-mono">{shortQty.toFixed(3)}</td>
                            <td className="p-1 text-right font-mono">{excessQty.toFixed(3)}</td>
                            <td className="p-1 text-right font-mono">{rejQty.toFixed(3)}</td>
                            <td className="p-1 text-right font-mono font-bold">{accQty.toFixed(3)}</td>
                            <td className="p-1 text-right font-mono">{rateVal.toFixed(2)}</td>
                            <td className="p-1 text-right font-mono">{discVal.toFixed(2)}</td>
                            <td className="p-1 text-right font-mono font-bold text-slate-950">{totalVal.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="divide-x divide-slate-900 align-top">
                        <td className="p-1 text-center font-bold">1</td>
                        <td className="p-1 leading-tight font-mono text-[9px]">
                          <div>0050/17-18 Dt. 16/03/2018</div>
                          <div>MMPR/0017/17-18 Dt. 16/03/2018</div>
                        </td>
                        <td className="p-1 font-mono font-semibold">0501040165</td>
                        <td className="p-1 leading-tight">
                          <div className="font-bold">BEARING 2025</div>
                          <div>Make : AIRMAX</div>
                          <div className="font-mono text-[9px]">1236,1234,1235,1237,1238</div>
                        </td>
                        <td className="p-1 text-center">MEC</td>
                        <td className="p-1 text-center">KG</td>
                        <td className="p-1 text-right font-mono">5.000</td>
                        <td className="p-1 text-right font-mono">5.000</td>
                        <td className="p-1 text-right font-mono">0.000</td>
                        <td className="p-1 text-right font-mono">0.000</td>
                        <td className="p-1 text-right font-mono">1.000</td>
                        <td className="p-1 text-right font-mono font-bold">4.000</td>
                        <td className="p-1 text-right font-mono">1900.00</td>
                        <td className="p-1 text-right font-mono">0.00</td>
                        <td className="p-1 text-right font-mono font-bold">7600.00</td>
                      </tr>
                    )}

                    {/* Minimum space rows for clean printed look */}
                    <tr className="divide-x divide-slate-900 h-10">
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                      <td className="p-1"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Grand Total Row */}
              <div className="border-b border-slate-900 px-3 py-1.5 flex justify-end items-center bg-slate-50 font-bold text-xs">
                <span className="mr-8 uppercase">Grand Total :</span>
                <span className="font-mono text-sm">
                  {Number(
                    selectedGrnForDetails.grandTotal ||
                      selectedGrnForDetails.totalReceivedValue ||
                      7600
                  ).toFixed(2)}
                </span>
              </div>

              {/* Verification Row */}
              <div className="border-b border-slate-900 px-3 py-1 grid grid-cols-2 font-bold text-[10.5px]">
                <div>
                  Authorized :{' '}
                  <span className="font-semibold">
                    {selectedGrnForDetails.authorized === 'No' || selectedGrnForDetails.authorized === false ? 'No' : 'Yes'}
                  </span>
                </div>
                <div>
                  Inspection Required :{' '}
                  <span className="font-semibold">
                    {selectedGrnForDetails.inspectionRequired === 'No' || selectedGrnForDetails.inspectionRequired === false ? 'No' : 'Yes'}
                  </span>
                </div>
              </div>

              {/* Signatures Row */}
              <div className="pt-10 pb-2 px-4 grid grid-cols-5 text-center text-[10px] font-bold border-b border-slate-900 divide-x divide-slate-900 bg-white">
                <div className="px-1">
                  <div className="text-[9px] text-slate-500 font-normal">EDP</div>
                  <div>PREPARED BY</div>
                </div>
                <div className="px-1 flex items-end justify-center">
                  <div>STORE MANAGER</div>
                </div>
                <div className="px-1 flex items-end justify-center">
                  <div>INSPECTED BY</div>
                </div>
                <div className="px-1 flex items-end justify-center">
                  <div>H.O.D.</div>
                </div>
                <div className="px-1 flex items-end justify-center">
                  <div>ACCOUNT MANAGER</div>
                </div>
              </div>

              {/* Bottom Timestamp & Page Row */}
              <div className="px-3 py-1 flex items-center justify-between text-[9.5px] text-slate-600 bg-slate-50">
                <div>
                  {formatDate(selectedGrnForDetails.grnDate)} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
                <div>Page 1 of 1</div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                {selectedGrnForDetails.status === 'Inspection Pending' && (
                  <button
                    onClick={() => {
                      inwardGRNToStock(selectedGrnForDetails.grnNumber || selectedGrnForDetails.id);
                      setSuccessMessage(`Direct inward completed for ${selectedGrnForDetails.grnNumber}! Stock updated.`);
                      setStockAddedBanner(true);
                      setSelectedGrnForDetails(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Direct Inward to Stock</span>
                  </button>
                )}
                <span className="text-[11px] text-slate-500">
                  Receiving Warehouse: <strong className="text-slate-800">{selectedGrnForDetails.warehouseName || 'Main Store'}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGrnForDetails(null)}
                className="px-5 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / INWARD GOODS RECEIPT NOTE (GRN) MODAL WITH ALL FIELDS FROM IMAGE     */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-6xl w-full p-4 sm:p-6 space-y-5 my-8 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-[#7C3AED] rounded-lg">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wide">
                    Create Goods Receipt (GRN) / Material Receipt Note
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Inward received supplier consignments, verify delivery challan quantities & generate Material Receipt Note.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#1E293B] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: HEADER & DOCUMENT INFORMATION */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#7C3AED]" />
                    <span>1. Header & Dispatch Details</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-700">Link Purchase Order (PO):</label>
                    <select
                      value={poId}
                      onChange={(e) => handleSelectPO(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="">-- Manual GRN Entry (No PO) --</option>
                      {purchaseOrders.map((p) => (
                        <option key={p.id || p.poNumber} value={p.id || p.poNumber}>
                          {p.poNumber} - {p.supplierName || 'PO'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {/* GRN Number */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">GRN NO.</label>
                    <input
                      type="text"
                      value={grnNumberInput}
                      onChange={(e) => setGrnNumberInput(e.target.value)}
                      placeholder="e.g. GRN\Process\0001\16.03.18"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                    <span className="text-[10px] text-slate-500">Leave blank for auto GRN numbering</span>
                  </div>

                  {/* GRN Date */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      GRN DATE <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={grnDate}
                      onChange={(e) => setGrnDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Gate Entry No */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">G.E. NO. (Gate Entry)</label>
                    <input
                      type="text"
                      value={gateEntryNo}
                      onChange={(e) => setGateEntryNo(e.target.value)}
                      placeholder="e.g. 0040/17-18/Process-[16/03/2018]"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Gate Entry Date */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">G.E. DATE</label>
                    <input
                      type="date"
                      value={gateEntryDate}
                      onChange={(e) => setGateEntryDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Supplier Selection */}
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      From (Supplier Name) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={supplierId}
                        onChange={(e) => handleSelectSupplier(e.target.value)}
                        className="w-1/2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                      >
                        <option value="">-- Choose Supplier --</option>
                        {combinedSuppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.supplierName || (s as any).name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        placeholder="Or enter supplier name"
                        className="w-1/2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  {/* Supplier Address */}
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Supplier Address</label>
                    <input
                      type="text"
                      value={supplierAddress}
                      onChange={(e) => setSupplierAddress(e.target.value)}
                      placeholder="e.g. Kurla, MUMBAI, MAHARASHTRA, INDIA"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Bill No */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">BILL NO. (Invoice No.)</label>
                    <input
                      type="text"
                      value={billNo}
                      onChange={(e) => setBillNo(e.target.value)}
                      placeholder="e.g. 632"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Bill Date */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">BILL DATE</label>
                    <input
                      type="date"
                      value={billDate}
                      onChange={(e) => setBillDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Challan No */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">CHALLAN NO.</label>
                    <input
                      type="text"
                      value={dcNo}
                      onChange={(e) => setDcNo(e.target.value)}
                      placeholder="e.g. 65652"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Challan Date */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">CHALLAN DATE</label>
                    <input
                      type="date"
                      value={challanDate}
                      onChange={(e) => setChallanDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* LR No */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">LR NO. (Lorry Receipt)</label>
                    <input
                      type="text"
                      value={lrNo}
                      onChange={(e) => setLrNo(e.target.value)}
                      placeholder="e.g. LR-98124"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Transporter */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">TRANSPORTER</label>
                    <input
                      type="text"
                      value={transporter}
                      onChange={(e) => setTransporter(e.target.value)}
                      placeholder="e.g. A.R.C."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Vehicle No */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">VEHICLE NO.</label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="e.g. MH 12 HY 8907"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Warehouse */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Receiving Warehouse <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-purple-600"
                    >
                      {availableWarehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.warehouseName || w.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-toggles: Authorized, Inspection Required, Direct Inward */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">Authorized:</span>
                    <select
                      value={authorized}
                      onChange={(e) => setAuthorized(e.target.value as 'Yes' | 'No')}
                      className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-900"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">Inspection Required:</span>
                    <select
                      value={inspectionRequired}
                      onChange={(e) => setInspectionRequired(e.target.value as 'Yes' | 'No')}
                      className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-900"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <input
                      type="checkbox"
                      id="directInwardCheck"
                      checked={directInward}
                      onChange={(e) => setDirectInward(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="directInwardCheck" className="text-[11px] font-semibold text-emerald-900 cursor-pointer">
                      Direct Inward to Store Inventory
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 15-COLUMN MATERIAL RECEIPT LINE ITEMS TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#7C3AED]" />
                      <span>2. Material Line Items (As per Material Receipt Note)</span>
                    </span>
                    <p className="text-[10.5px] text-slate-500">
                      Enter Challan, Received & Rejected Quantities. Short, Excess, Accepted & Total Value will auto-calculate.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addItemLine}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] font-bold text-xs rounded-lg transition border border-purple-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Material Line</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-xs">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center divide-x divide-slate-300">
                        <th className="p-2 w-8">Sl. No.</th>
                        <th className="p-2 w-32">PO No. / Date & Indent No/Date</th>
                        <th className="p-2 w-24">Item Code</th>
                        <th className="p-2 min-w-[150px]">Item Description & Make</th>
                        <th className="p-2 w-14">Dept.</th>
                        <th className="p-2 w-14">UOM</th>
                        <th className="p-2 w-20">Challan Qty</th>
                        <th className="p-2 w-20">Received Qty</th>
                        <th className="p-2 w-16 bg-slate-200/50">Short Qty</th>
                        <th className="p-2 w-16 bg-slate-200/50">Excess Qty</th>
                        <th className="p-2 w-20">Rejected Qty</th>
                        <th className="p-2 w-20 bg-emerald-50">Accepted Qty</th>
                        <th className="p-2 w-20">Rate (₹)</th>
                        <th className="p-2 w-16">Discount</th>
                        <th className="p-2 w-24 bg-purple-50">Total Value (₹)</th>
                        <th className="p-2 w-10">Act</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {inwardItems.map((itm, idx) => (
                        <tr key={itm.id} className="divide-x divide-slate-200 hover:bg-slate-50/80">
                          {/* Sl. No. */}
                          <td className="p-2 text-center font-bold text-slate-700">{idx + 1}</td>

                          {/* PO No. / Date & Indent No/Date */}
                          <td className="p-1.5 space-y-1">
                            <input
                              type="text"
                              value={itm.poNumber}
                              onChange={(e) => updateItemLine(idx, 'poNumber', e.target.value)}
                              placeholder="PO No / Date"
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono"
                            />
                            <input
                              type="text"
                              value={itm.indentNumber}
                              onChange={(e) => updateItemLine(idx, 'indentNumber', e.target.value)}
                              placeholder="Indent No / Date"
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-500 font-mono"
                            />
                          </td>

                          {/* Item Code */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              required
                              value={itm.itemCode}
                              onChange={(e) => updateItemLine(idx, 'itemCode', e.target.value)}
                              placeholder="e.g. 0501040165"
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-mono font-semibold"
                            />
                          </td>

                          {/* Item Description, Make, Serial/Heat */}
                          <td className="p-1.5 space-y-1">
                            <input
                              type="text"
                              required
                              value={itm.description}
                              onChange={(e) => {
                                updateItemLine(idx, 'description', e.target.value);
                                if (!itm.itemName) updateItemLine(idx, 'itemName', e.target.value);
                              }}
                              placeholder="Item description (e.g. BEARING 2025)"
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-medium"
                            />
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={itm.makeBrand}
                                onChange={(e) => updateItemLine(idx, 'makeBrand', e.target.value)}
                                placeholder="Make: AIRMAX"
                                className="w-1/2 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                              />
                              <input
                                type="text"
                                value={itm.heatSerialNo}
                                onChange={(e) => updateItemLine(idx, 'heatSerialNo', e.target.value)}
                                placeholder="Serial / Heat Nos"
                                className="w-1/2 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono"
                              />
                            </div>
                          </td>

                          {/* Dept */}
                          <td className="p-1.5">
                            <select
                              value={itm.dept}
                              onChange={(e) => updateItemLine(idx, 'dept', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px] font-semibold text-center"
                            >
                              <option value="MEC">MEC</option>
                              <option value="FAB">FAB</option>
                              <option value="ELEC">ELEC</option>
                              <option value="STORE">STORE</option>
                              <option value="CIVIL">CIVIL</option>
                              <option value="PROD">PROD</option>
                            </select>
                          </td>

                          {/* UOM */}
                          <td className="p-1.5">
                            <select
                              value={itm.uom}
                              onChange={(e) => updateItemLine(idx, 'uom', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px] font-semibold text-center"
                            >
                              <option value="KG">KG</option>
                              <option value="NOS">NOS</option>
                              <option value="MTR">MTR</option>
                              <option value="PCS">PCS</option>
                              <option value="SET">SET</option>
                              <option value="TON">TON</option>
                              <option value="PKT">PKT</option>
                            </select>
                          </td>

                          {/* Challan Qty */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="any"
                              value={itm.challanQuantity || ''}
                              onChange={(e) => updateItemLine(idx, 'challanQuantity', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs text-right font-mono"
                            />
                          </td>

                          {/* Received Qty */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="any"
                              value={itm.receivedQuantity || ''}
                              onChange={(e) => updateItemLine(idx, 'receivedQuantity', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs text-right font-mono font-semibold"
                            />
                          </td>

                          {/* Short Qty (Calculated) */}
                          <td className="p-2 text-right font-mono text-slate-700 bg-slate-50">
                            {itm.shortQuantity.toFixed(3)}
                          </td>

                          {/* Excess Qty (Calculated) */}
                          <td className="p-2 text-right font-mono text-slate-700 bg-slate-50">
                            {itm.excessQuantity.toFixed(3)}
                          </td>

                          {/* Rejected Qty */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="any"
                              value={itm.rejectedQuantity || ''}
                              onChange={(e) => updateItemLine(idx, 'rejectedQuantity', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs text-right font-mono text-rose-600"
                            />
                          </td>

                          {/* Accepted Qty (Calculated) */}
                          <td className="p-2 text-right font-mono font-bold text-emerald-800 bg-emerald-50/50">
                            {itm.acceptedQuantity.toFixed(3)}
                          </td>

                          {/* Rate */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="any"
                              value={itm.rate || ''}
                              onChange={(e) => updateItemLine(idx, 'rate', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs text-right font-mono"
                            />
                          </td>

                          {/* Discount */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="any"
                              value={itm.discount || ''}
                              onChange={(e) => updateItemLine(idx, 'discount', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs text-right font-mono"
                            />
                          </td>

                          {/* Total Value (Calculated) */}
                          <td className="p-2 text-right font-mono font-bold text-purple-900 bg-purple-50/50">
                            {itm.totalValue.toFixed(2)}
                          </td>

                          {/* Delete Action */}
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeItemLine(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer: Total Value Summary */}
                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-600 font-medium">
                    Total Inward Lines: <strong>{inwardItems.length}</strong>
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Grand Total Value :
                    </span>
                    <span className="text-base font-mono font-extrabold text-[#7C3AED] bg-white px-3 py-1 rounded-lg border border-purple-200 shadow-xs">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SIGNATORIES & REMARKS */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                  <span>3. Verification Signatories & Store Remarks</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Prepared By (EDP)</label>
                    <input
                      type="text"
                      value={preparedBy}
                      onChange={(e) => setPreparedBy(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Store Manager</label>
                    <input
                      type="text"
                      value={storeManager}
                      onChange={(e) => setStoreManager(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Inspected By</label>
                    <input
                      type="text"
                      value={inspectedBy}
                      onChange={(e) => setInspectedBy(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">H.O.D.</label>
                    <input
                      type="text"
                      value={hod}
                      onChange={(e) => setHod(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Account Manager</label>
                    <input
                      type="text"
                      value={accountManager}
                      onChange={(e) => setAccountManager(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Material Inspection / Store Remarks</label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Received in good condition, seals checked, test certs verified..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B]"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl transition shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Inwarding GRN...' : 'Save & Generate Material Receipt Note'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GoodsReceiptPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Loading GRN Inward Hub...</div>}>
      <GoodsReceiptContent />
    </Suspense>
  );
}
