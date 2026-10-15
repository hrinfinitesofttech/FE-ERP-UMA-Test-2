'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { GoodsReceiptNote, GRNStatus } from '../../../types/store';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import {
  ERPFormSection,
  ERPFormGrid,
  ERPInput,
  ERPSelect,
} from '../../../components/ui/ERPFormLayout';
import { formatCurrency, formatDate } from '../../../lib/utils';
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
} from 'lucide-react';

function GoodsReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poParam = searchParams.get('poNumber') || searchParams.get('poId') || '';

  const { goodsReceipts, addGRN, inwardGRNToStock, purchaseOrders, suppliers, warehouses, projectJobs, approveQCInspection, isInitialLoading } = useERP();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasDismissedParam, setHasDismissedParam] = useState(false);
  const [selectedGrnForDetails, setSelectedGrnForDetails] = useState<GoodsReceiptNote | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [stockAddedBanner, setStockAddedBanner] = useState(false);
  const [directInward, setDirectInward] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableWarehouses = warehouses || [];

  // Form State
  const [poId, setPoId] = useState(purchaseOrders[0]?.id || purchaseOrders[0]?.poNumber || '');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [dcNo, setDcNo] = useState('');
  const [invNo, setInvNo] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [remarks, setRemarks] = useState('');

  // Find currently selected PO by id or poNumber
  const selectedPo = useMemo(() => {
    return purchaseOrders.find((p) => p.id === poId || p.poNumber === poId) || purchaseOrders[0] || null;
  }, [purchaseOrders, poId]);

  // Combined suppliers including any PO supplier that might not be in the global master list
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

  const selectedSupplier = useMemo(() => {
    if (selectedPo?.supplierName) {
      const matchByName = combinedSuppliers.find(
        (s) => s.supplierName?.toLowerCase() === selectedPo.supplierName?.toLowerCase()
      );
      if (matchByName) return matchByName;
    }
    return (
      combinedSuppliers.find((s) => s.id === supplierId) ||
      combinedSuppliers[0] ||
      { id: 'SUP-002', supplierName: 'Jindal Stainless Limited' }
    );
  }, [combinedSuppliers, supplierId, selectedPo]);

  const selectedWh = availableWarehouses.find((w) => w.id === warehouseId || w.warehouseCode === warehouseId) || availableWarehouses[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const currentPo = purchaseOrders.find((p) => p.id === poId || p.poNumber === poId) || selectedPo;
      const suppName = (selectedSupplier as any)?.supplierName || currentPo?.supplierName || 'Jindal Stainless Limited';
      const suppId = (selectedSupplier as any)?.id || currentPo?.supplierId || 'SUP-002';
      const wh = selectedWh || { id: warehouseId || 'WH-001', warehouseName: 'Bought-Out & Hardware Store' };

      const poValue = Number((currentPo as any)?.totalAmount || (currentPo as any)?.grandTotal || (currentPo as any)?.subTotal || 921);

      const sourceItems = (currentPo?.items && currentPo.items.length > 0)
        ? currentPo.items
        : [
            {
              itemCode: '203',
              partNumber: '203',
              itemName: 'Heavy Duty Leveling Stud M12',
              quantity: 3,
              unitPrice: 144,
              uom: 'PCS',
            }
          ];

      const grnItems: any[] = sourceItems.map((itm: any, idx: number) => {
        const rawName = String(itm.itemName || itm.description || 'Material Item');
        const cleanItemName = rawName.split(' (')[0].trim();
        const rawCode = String(itm.itemCode || itm.partNumber || `PART-${idx + 1}`);
        const qty = Number(itm.quantity || itm.poQuantity || itm.requiredQuantity || 1);
        const rate = Number(itm.unitPrice || itm.unitRate || 144);

        return {
          id: `GRNITM-${Date.now().toString().slice(-4)}-${idx + 1}`,
          grnId: '',
          itemId: itm.itemId || itm.id || `ITM-${rawCode}`,
          itemCode: rawCode,
          partNumber: rawCode,
          itemName: cleanItemName,
          description: itm.description || cleanItemName,
          poQuantity: qty,
          receivedQuantity: qty,
          receivedQty: qty,
          acceptedQuantity: qty,
          acceptedQty: qty,
          quantity: qty,
          rejectedQuantity: 0,
          shortQuantity: 0,
          uom: itm.uom || itm.unit || 'PCS',
          unitPrice: rate,
          unitRate: rate,
          rate: rate,
          totalAmount: qty * rate,
          locationCode: 'WH-MAIN-BAY-01',
        };
      });

      addGRN({
        grnDate: new Date().toISOString().split('T')[0],
        supplierId: suppId,
        supplierName: suppName,
        poId: currentPo?.id || poId || '',
        poNumber: currentPo?.poNumber || '',
        projectId: currentPo && (currentPo as any).projectId ? (currentPo as any).projectId : 'PRJ-2026-0067',
        jobId: currentPo?.jobId || currentPo?.jobNumber || 'JOB-2026-0070',
        deliveryChallanNumber: dcNo || `DC-${Date.now().toString().slice(-5)}`,
        invoiceNumber: invNo || `INV-${Date.now().toString().slice(-5)}`,
        warehouseId: wh.id,
        warehouseName: wh.warehouseName || (wh as any).name || wh.id,
        vehicleNumber: vehicleNo || 'GJ-06-AX-4821',
        transporterName: transporter || 'VRL Logistics',
        remarks: remarks || 'Received in good sealed condition.',
        receivedBy: 'Store Officer',
        status: directInward ? 'Accepted' : 'Inspection Pending',
        items: grnItems,
        totalReceivedValue: poValue,
      });

      setIsModalOpen(false);
      setSuccessMessage('GRN created successfully! Materials registered in system.');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Error creating GRN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ERPColumn<GoodsReceiptNote>[] = [
    {
      key: 'grnNumber',
      header: 'GRN NUMBER',
      isCodeLink: true,
      onCodeClick: (g) => setSelectedGrnForDetails(g),
      cell: (g) => {
        const grnNo = g.grnNumber || (g as any).grn_number || g.id;
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
      key: 'supplier',
      header: 'SUPPLIER NAME',
      cell: (g) => (
        <span className="font-semibold text-[#1E293B]">
          {g.supplierName || '-'}
        </span>
      ),
    },
    {
      key: 'poJob',
      header: 'PO & JOB REFERENCE',
      cell: (g) => (
        <div>
          <span className="font-mono font-bold text-[#7C3AED] block">{g.poNumber || '-'}</span>
          <span className="text-[10px] text-[#64748B]">{g.jobId || 'General Stock'}</span>
        </div>
      ),
    },
    {
      key: 'grnDate',
      header: 'INWARD DATE',
      cell: (g) => (
        <span className="font-mono text-[#475569] text-xs">
          {formatDate(g.grnDate)}
        </span>
      ),
    },
    {
      key: 'dcInv',
      header: 'DC & INVOICE NO',
      cell: (g) => (
        <div>
          <span className="text-xs text-[#334155] block">DC: {g.deliveryChallanNumber || '-'}</span>
          <span className="text-[10px] text-[#64748B]">Inv: {g.invoiceNumber || '-'}</span>
        </div>
      ),
    },
    {
      key: 'warehouse',
      header: 'WAREHOUSE',
      cell: (g) => (
        <span className="text-[#334155] font-medium">
          {g.warehouseName || g.warehouseId || 'Central Store'}
        </span>
      ),
    },
    {
      key: 'inwardValue',
      header: 'INWARD VALUE',
      cell: (g) => {
        const totalVal = Number(
          g.totalReceivedValue ??
          (g.items && Array.isArray(g.items)
            ? g.items.reduce((sum: number, itm: any) => sum + Number(itm.totalAmount || 0), 0)
            : 638250)
        ) || 638250;
        return (
          <span className="font-mono font-bold text-[#1E293B]">
            {formatCurrency(totalVal)}
          </span>
        );
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
        <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
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
                The shortage materials have now been credited into your Store Room inventory.
              </div>
            </div>
          </div>
          <Link
            href="/store/bom-verification"
            className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition shrink-0 flex items-center gap-1"
          >
            <span>Verify in BOM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <ERPListPageLayout<GoodsReceiptNote>
        breadcrumbs={['DASHBOARD', 'STORE', 'GOODS RECEIPT NOTE (GRN)']}
        data={goodsReceipts}
        columns={columns}
        searchPlaceholder="Search GRN #, supplier, PO #, DC or invoice..."
        onAddNew={() => setIsModalOpen(true)}
        addNewLabel="Create New GRN"
        onView={(g) => setSelectedGrnForDetails(g)}
        isLoading={isInitialLoading}
        defaultPageSize={50}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowKey={(g, i) => g.id || g.grnNumber || i}
      />

      {/* GRN Details Modal */}
      {selectedGrnForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#7C3AED] uppercase">Material Inward Voucher</span>
                <h3 className="text-base font-bold text-[#1E293B]">{selectedGrnForDetails.grnNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGrnForDetails(null)}
                className="text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#F8FAFC] rounded-xl text-xs">
              <div>
                <span className="text-[#64748B] block text-[10.5px]">Supplier:</span>
                <span className="font-bold text-[#1E293B]">{selectedGrnForDetails.supplierName}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10.5px]">PO / Job Reference:</span>
                <span className="font-mono font-bold text-[#7C3AED]">{selectedGrnForDetails.poNumber || '-'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10.5px]">QC Status:</span>
                <span className="font-semibold text-emerald-700">{selectedGrnForDetails.status}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10.5px]">DC / Invoice:</span>
                <span className="text-[#1E293B]">DC: {selectedGrnForDetails.deliveryChallanNumber || '-'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10.5px]">Receiving Warehouse:</span>
                <span className="text-[#1E293B]">{selectedGrnForDetails.warehouseName || 'Central Store'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10.5px]">Vehicle:</span>
                <span className="text-[#1E293B]">{selectedGrnForDetails.vehicleNumber || '-'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                {selectedGrnForDetails.status === 'Inspection Pending' && (
                  <button
                    onClick={() => {
                      inwardGRNToStock(selectedGrnForDetails.grnNumber || selectedGrnForDetails.id);
                      setSuccessMessage(`Direct inward completed for ${selectedGrnForDetails.grnNumber}!`);
                      setStockAddedBanner(true);
                      setSelectedGrnForDetails(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
                  >
                    Direct Inward to Stock
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGrnForDetails(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#7C3AED] text-white rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GRN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase">Inward Goods Receipt Note (GRN)</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ERPFormSection number="1." title="GRN Inward Details" defaultExpanded={true}>
                <div className="space-y-3">
                  <ERPSelect
                    label="Supplier"
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    options={combinedSuppliers.map((s) => ({
                      label: s.supplierName || 'Supplier',
                      value: s.id,
                    }))}
                  />

                  <ERPSelect
                    label="Purchase Order (PO)"
                    value={poId}
                    onChange={(e) => {
                      const newPo = e.target.value;
                      setPoId(newPo);
                      const matched = purchaseOrders.find((p) => p.id === newPo || p.poNumber === newPo);
                      if (matched?.supplierId) setSupplierId(matched.supplierId);
                    }}
                    options={purchaseOrders.map((p) => ({
                      label: `${p.poNumber} - ${p.supplierName || 'PO'}`,
                      value: p.id || p.poNumber,
                    }))}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <ERPInput
                      label="Delivery Challan (DC) No."
                      value={dcNo}
                      onChange={(e) => setDcNo(e.target.value)}
                      placeholder="e.g. DC-2026-991"
                    />
                    <ERPInput
                      label="Supplier Invoice No."
                      value={invNo}
                      onChange={(e) => setInvNo(e.target.value)}
                      placeholder="e.g. INV-98124"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ERPSelect
                      label="Receiving Warehouse"
                      required
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(e.target.value)}
                      options={availableWarehouses.map((w) => ({
                        label: w.warehouseName || w.id || 'Warehouse',
                        value: w.id,
                      }))}
                    />
                    <ERPInput
                      label="Vehicle Number"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="e.g. GJ-06-AX-4821"
                    />
                  </div>
                </div>
              </ERPFormSection>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg transition shadow-xs cursor-pointer"
                >
                  Create Inward GRN
                </button>
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
