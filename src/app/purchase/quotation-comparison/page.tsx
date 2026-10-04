'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Award,
  Building,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Plus,
  Info,
  CheckCircle,
  Truck,
  FileCheck2,
  ShoppingCart,
  Printer,
  ChevronRight,
  Clock,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { QuotationComparison, SupplierQuotation, SupplierQuotationItem, PurchaseOrder } from '../../../types/purchase';

export default function QuotationComparisonPage() {
  const router = useRouter();
  const {
    quotationComparisons,
    approveQuotationComparison,
    addQuotationComparison,
    updateQuotationComparison,
    deleteQuotationComparison,
    rfqs,
    supplierQuotations,
    addSupplierQuotation,
    purchaseOrders,
    addPurchaseOrder,
    suppliers,
    projectJobs,
    currentUser,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [selectedRfqId, setSelectedRfqId] = useState<string>(rfqs[0]?.id || '');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [editingJustification, setEditingJustification] = useState(false);
  const [justificationText, setJustificationText] = useState('');
  const [recommendedVendorId, setRecommendedVendorId] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (rfqs.length > 0 && !selectedRfqId) {
      setSelectedRfqId(rfqs[0].id);
    }
  }, [rfqs, selectedRfqId]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Helper to get Customer Name and Job Details for an RFQ
  const getRfqJobDetails = useMemo(() => {
    return (rfqIdOrNum: string) => {
      const rfq = rfqs.find(
        (r) =>
          r.id === rfqIdOrNum ||
          r.rfqNumber === rfqIdOrNum ||
          String(r.id) === String(rfqIdOrNum)
      );
      if (!rfq) return null;
      const job = projectJobs.find(
        (j) =>
          j.id === rfq.jobId ||
          j.jobNumber === rfq.jobId ||
          j.jobCode === rfq.jobId
      );
      return {
        rfq,
        job,
        customerName: job?.customerName || 'Standard Client',
        productName: job?.productName || 'Industrial Pressure Equipment',
      };
    };
  }, [rfqs, projectJobs]);

  const activeRfq = useMemo(() => {
    if (rfqs.length > 0) {
      return (
        rfqs.find((r) => r.id === selectedRfqId || r.rfqNumber === selectedRfqId) ||
        rfqs[0]
      );
    }
    return {
      id: 'RFQ-2026-4586',
      rfqNumber: 'RFQ-2026-4586',
      jobId: 'JOB-2026-0065',
      projectId: 'PRJ-2026-001',
      status: 'Sent to Suppliers',
      items: [
        {
          id: 'ITM-01',
          itemCode: 'RM-MS-12MM',
          itemName: 'IS 2062 Grade E250 MS Plate 12mm',
          requiredQuantity: 2500,
          unitOfMeasure: 'KG',
          specification: 'Size 2500x6000mm, Standard Make (TATA/SAIL)',
          targetPrice: 68,
        },
        {
          id: 'ITM-02',
          itemCode: 'BO-FLG-300',
          itemName: '300 NB Class 150 SORF Flange ASTM A105',
          requiredQuantity: 12,
          unitOfMeasure: 'NOS',
          specification: 'ASME B16.5 Standard',
          targetPrice: 4200,
        },
        {
          id: 'ITM-03',
          itemCode: 'BO-VLV-4IN',
          itemName: '4 Inch Class 150 Cast Steel Gate Valve',
          requiredQuantity: 4,
          unitOfMeasure: 'NOS',
          specification: 'API 600 Design, Flanged End',
          targetPrice: 14500,
        },
      ],
    } as any;
  }, [rfqs, selectedRfqId]);

  // Find saved comparison matrix for this RFQ
  const savedCS = useMemo(() => {
    const currentId = activeRfq?.id || selectedRfqId || 'RFQ-2026-4586';
    const currentNum = activeRfq?.rfqNumber || selectedRfqId || 'RFQ-2026-4586';
    return (
      quotationComparisons.find(
        (qc) =>
          qc.rfqId === currentId ||
          qc.rfqNumber === currentNum ||
          qc.rfqId === currentNum ||
          qc.rfqNumber === currentId ||
          qc.id === currentId
      ) ||
      (quotationComparisons.length > 0 && (!selectedRfqId || selectedRfqId === 'ALL')
        ? quotationComparisons[0]
        : null)
    );
  }, [quotationComparisons, activeRfq, selectedRfqId]);

  // Find all actual supplier quotations received for this RFQ
  const receivedQuotesForRfq = useMemo(() => {
    const currentId = activeRfq?.id || selectedRfqId || 'RFQ-2026-4586';
    const currentNum = activeRfq?.rfqNumber || selectedRfqId || 'RFQ-2026-4586';
    return supplierQuotations.filter(
      (sq) =>
        sq.rfqId === currentId ||
        sq.rfqNumber === currentNum ||
        sq.rfqId === currentNum ||
        sq.rfqNumber === currentId
    );
  }, [supplierQuotations, activeRfq, selectedRfqId]);

  // Check if a PO is already created for this RFQ / Job
  const linkedPO = useMemo(() => {
    if (!activeRfq) return null;
    return purchaseOrders.find(
      (po) =>
        po.rfqNumber === activeRfq.rfqNumber ||
        po.jobId === activeRfq.jobId ||
        po.jobId === (activeRfq as any).jobNumber
    );
  }, [purchaseOrders, activeRfq]);

  // 1-Click Auto Generate 3 Competitive Supplier Bids & Build Matrix
  const handleAutoGenerateMultiVendorBids = () => {
    const currentRfq = activeRfq || {
      id: 'RFQ-2026-4586',
      rfqNumber: 'RFQ-2026-4586',
      jobId: 'JOB-2026-0065',
      projectId: 'PRJ-2026-001',
      items: [],
    };

    const rfqNo = currentRfq.rfqNumber || currentRfq.id || `RFQ-2026-4586`;
    const jId = (currentRfq as any).jobId || (currentRfq as any).jobNumber || 'JOB-2026-0065';
    const pId = currentRfq.projectId || 'PRJ-2026-001';

    const sampleItems =
      activeRfq.items && activeRfq.items.length > 0
        ? activeRfq.items
        : [
            {
              id: 'ITM-01',
              itemCode: 'RM-MS-12MM',
              itemName: 'IS 2062 Grade E250 MS Plate 12mm',
              requiredQuantity: 2500,
              unitOfMeasure: 'KG',
              specification: 'Size 2500x6000mm, Standard Make (TATA/SAIL)',
              targetPrice: 68,
            },
            {
              id: 'ITM-02',
              itemCode: 'BO-FLG-300',
              itemName: '300 NB Class 150 SORF Flange ASTM A105',
              requiredQuantity: 12,
              unitOfMeasure: 'NOS',
              specification: 'ASME B16.5 Standard',
              targetPrice: 4200,
            },
            {
              id: 'ITM-03',
              itemCode: 'BO-VLV-4IN',
              itemName: '4 Inch Class 150 Cast Steel Gate Valve',
              requiredQuantity: 4,
              unitOfMeasure: 'NOS',
              specification: 'API 600 Design, Flanged End',
              targetPrice: 14500,
            },
          ];

    // 3 Distinct Vendor Profiles
    const vendorProfiles = [
      {
        id: 'SUP-001',
        name: 'ABB India Limited (Bought-out Items)',
        refPrefix: 'SQ-ABB',
        priceMultipliers: [1.05, 0.96, 1.08], // Lower on Flanges
        terms: '30 Days Net Credit',
        delivery: 'Ex-works Vadodara (7 Days)',
        freight: 4500,
        leadTime: 7,
      },
      {
        id: 'SUP-002',
        name: 'Ratnamani Metals & Tubes Ltd',
        refPrefix: 'SQ-RMT',
        priceMultipliers: [0.94, 1.02, 0.95], // L1 on Plates & Valves (Overall Lowest)
        terms: '45 Days Credit after GRN',
        delivery: 'FOR Factory Site (5 Days)',
        freight: 2500,
        leadTime: 5,
      },
      {
        id: 'SUP-003',
        name: 'Jindal Steel & Power Ltd',
        refPrefix: 'SQ-JSPL',
        priceMultipliers: [0.98, 1.08, 1.02],
        terms: '100% Against Proforma Invoice',
        delivery: 'Ex-works Angul (12 Days)',
        freight: 8000,
        leadTime: 12,
      },
    ];

    const generatedQuotes: SupplierQuotation[] = [];

    vendorProfiles.forEach((vp, vIdx) => {
      const formattedItems: SupplierQuotationItem[] = sampleItems.map((itm: any, iIdx: number) => {
        const basePrice = Number(itm.targetPrice || itm.unitPrice || 100);
        const multiplier = vp.priceMultipliers[iIdx % vp.priceMultipliers.length];
        const unitRate = Math.round(basePrice * multiplier);
        const qty = Number(itm.requiredQuantity || itm.quantity || 1);
        const lineTot = qty * unitRate;

        return {
          id: `SQI-SIM-${Date.now()}-${vIdx}-${iIdx}`,
          itemCode: itm.itemCode || `ITEM-${iIdx + 1}`,
          itemName: itm.itemName || 'Engineering Item',
          specification: itm.specification || 'Standard Spec',
          category: (itm.category as any) || 'Raw Material',
          unitOfMeasure: itm.unitOfMeasure || 'NOS',
          quotedQuantity: qty,
          unitPrice: unitRate,
          totalPrice: lineTot,
          discountPercentage: vIdx === 1 ? 2 : 0,
          gstPercentage: 18,
          netPrice: lineTot * 1.18,
          leadTimeDays: vp.leadTime,
          technicalCompliant: true,
          remarks: 'Commercial bid confirmed',
        };
      });

      const sub = formattedItems.reduce((acc, it) => acc + (it.totalPrice || 0), 0);
      const tax = (sub * 18) / 100;
      const grand = sub + tax + vp.freight;

      const sq: SupplierQuotation = {
        id: `SQ-SIM-${Date.now()}-${vIdx}`,
        quotationNumber: `SQ-2026-${Math.floor(2000 + vIdx * 1000 + Math.random() * 900)}`,
        rfqId: activeRfq.id,
        rfqNumber: rfqNo,
        supplierId: vp.id,
        supplierName: vp.name,
        supplierQuotationRef: `${vp.refPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
        quotationDate: new Date().toISOString().split('T')[0],
        validityDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        paymentTerms: vp.terms,
        deliveryTerms: vp.delivery,
        leadTimeDays: vp.leadTime,
        currency: 'INR',
        subTotal: Math.round(sub),
        taxTotal: Math.round(tax),
        freightCharges: vp.freight,
        grandTotal: Math.round(grand),
        technicalStatus: 'Compliant',
        items: formattedItems,
        recordedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Lead',
        status: 'Submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      generatedQuotes.push(sq);
      addSupplierQuotation(sq);
    });

    // Build Comparative Statement Matrix
    const compId = `CS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const csSuppliers = generatedQuotes.map((q) => ({
      supplierId: q.supplierId,
      supplierName: q.supplierName,
      grandTotal: q.grandTotal,
      deliveryTerms: q.deliveryTerms || `${q.leadTimeDays} Days`,
      paymentTerms: q.paymentTerms || '30 Days',
    }));

    const csItems = sampleItems.map((itm: any, iIdx: number) => {
      const rates: Record<string, number> = {};
      generatedQuotes.forEach((q) => {
        rates[q.supplierId] = q.items[iIdx]?.unitPrice || 0;
      });

      // Find lowest supplier for this item
      let lowestSupId = generatedQuotes[0].supplierId;
      let minRate = rates[lowestSupId] || 99999999;
      generatedQuotes.forEach((q) => {
        if (rates[q.supplierId] && rates[q.supplierId] < minRate) {
          minRate = rates[q.supplierId];
          lowestSupId = q.supplierId;
        }
      });

      return {
        id: `CSI-${iIdx + 1}`,
        itemCode: itm.itemCode || `ITEM-${iIdx + 1}`,
        itemName: itm.itemName || 'Engineering Item',
        requiredQuantity: Number(itm.requiredQuantity || itm.quantity || 1),
        unitOfMeasure: itm.unitOfMeasure || 'NOS',
        supplierRates: rates,
        lowestSupplierId: lowestSupId,
      };
    });

    const newMatrix: QuotationComparison = {
      id: compId,
      comparisonNumber: compId,
      rfqId: activeRfq.id,
      rfqNumber: rfqNo,
      jobId: jId,
      projectId: pId,
      comparisonDate: new Date().toISOString().split('T')[0],
      preparedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName} (Lead Buyer)` : 'Purchase Lead (Lead Buyer)',
      status: 'Under Review',
      approvalStatus: 'pending',
      recommendedSupplierId: 'SUP-002',
      recommendedSupplierName: 'Ratnamani Metals & Tubes Ltd',
      buyerReason:
        'Ratnamani Metals & Tubes Ltd offered the lowest overall techno-commercial bid (L1) with shortest 5-day delivery lead time, FOR site destination terms, and ASME Mill Test Certificates compliance.',
      suppliersEvaluated: csSuppliers,
      items: csItems,
    };

    addQuotationComparison(newMatrix);
    showToast(`✓ Generated 3 Supplier Bids & built Comparison Matrix ${compId} for ${rfqNo}!`);
  };

  // Build Comparison Matrix from existing received Supplier Quotations
  const handleBuildMatrixFromReceivedQuotes = () => {
    if (!activeRfq || receivedQuotesForRfq.length === 0) return;

    const rfqNo = activeRfq.rfqNumber || activeRfq.id;
    const jId = (activeRfq as any).jobId || (activeRfq as any).jobNumber || 'JOB-2026-001';
    const pId = activeRfq.projectId || 'PRJ-2026-001';

    // Unique list of items from all quotes
    const allItemsMap = new Map<string, { itemCode: string; itemName: string; requiredQuantity: number; unitOfMeasure: string }>();

    receivedQuotesForRfq.forEach((q) => {
      (q.items || []).forEach((it) => {
        if (!allItemsMap.has(it.itemCode)) {
          allItemsMap.set(it.itemCode, {
            itemCode: it.itemCode,
            itemName: it.itemName,
            requiredQuantity: it.quotedQuantity || (it as any).quantity || 1,
            unitOfMeasure: it.unitOfMeasure || 'NOS',
          });
        }
      });
    });

    const itemsList = Array.from(allItemsMap.values());

    const csSuppliers = receivedQuotesForRfq.map((q) => ({
      supplierId: q.supplierId,
      supplierName: q.supplierName,
      grandTotal: q.grandTotal,
      deliveryTerms: q.deliveryTerms || `${q.leadTimeDays} Days`,
      paymentTerms: q.paymentTerms || '30 Days',
    }));

    const csItems = itemsList.map((itm, iIdx) => {
      const rates: Record<string, number> = {};
      let lowestSupId = receivedQuotesForRfq[0]?.supplierId || '';
      let minRate = 999999999;

      receivedQuotesForRfq.forEach((q) => {
        const matchingItem = (q.items || []).find((it) => it.itemCode === itm.itemCode);
        const rate = matchingItem ? matchingItem.unitPrice : 0;
        rates[q.supplierId] = rate;
        if (rate > 0 && rate < minRate) {
          minRate = rate;
          lowestSupId = q.supplierId;
        }
      });

      return {
        id: `CSI-${iIdx + 1}`,
        itemCode: itm.itemCode,
        itemName: itm.itemName,
        requiredQuantity: itm.requiredQuantity,
        unitOfMeasure: itm.unitOfMeasure,
        supplierRates: rates,
        lowestSupplierId: lowestSupId,
      };
    });

    // Find overall lowest vendor
    let lowestVendor = receivedQuotesForRfq[0];
    receivedQuotesForRfq.forEach((q) => {
      if (q.grandTotal < lowestVendor.grandTotal) {
        lowestVendor = q;
      }
    });

    const compId = `CS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMatrix: QuotationComparison = {
      id: compId,
      comparisonNumber: compId,
      rfqId: activeRfq.id,
      rfqNumber: rfqNo,
      jobId: jId,
      projectId: pId,
      comparisonDate: new Date().toISOString().split('T')[0],
      preparedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName} (Lead Buyer)` : 'Purchase Officer (Lead Buyer)',
      status: 'Under Review',
      approvalStatus: 'pending',
      recommendedSupplierId: lowestVendor?.supplierId || 'SUP-001',
      recommendedSupplierName: lowestVendor?.supplierName || 'Recommended Supplier',
      buyerReason: `${lowestVendor?.supplierName} is recommended based on lowest commercial pricing (L1 Total: ₹${lowestVendor?.grandTotal?.toLocaleString('en-IN')}) and compliance with delivery terms.`,
      suppliersEvaluated: csSuppliers,
      items: csItems,
    };

    addQuotationComparison(newMatrix);
    showToast(`✓ Comparative Matrix ${compId} built from ${receivedQuotesForRfq.length} received quotations!`);
  };

  // Approve Matrix and Authorize Purchase Order
  const handleApproveMatrix = (matrix: QuotationComparison) => {
    const approverName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Head';
    approveQuotationComparison(matrix.id, approverName);
    showToast(`✓ Comparative Statement ${matrix.comparisonNumber} Approved! Ready for Purchase Order creation.`);
  };

  // 1-Click Generate Purchase Order from Approved Matrix
  const handleCreatePOFromMatrix = (matrix: QuotationComparison) => {
    const recommendedQuote = supplierQuotations.find(
      (q) =>
        (q.rfqId === matrix.rfqId || q.rfqNumber === matrix.rfqNumber) &&
        (q.supplierId === matrix.recommendedSupplierId || q.supplierName === matrix.recommendedSupplierName)
    ) || supplierQuotations.find((q) => q.rfqId === matrix.rfqId || q.rfqNumber === matrix.rfqNumber) || supplierQuotations[0];

    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

    const poItems = (recommendedQuote?.items || []).map((it, idx) => ({
      id: `POI-${Date.now()}-${idx}`,
      poId: poNumber,
      itemCode: it.itemCode,
      itemName: it.itemName,
      specification: it.specification,
      category: it.category,
      unitOfMeasure: it.unitOfMeasure,
      orderedQuantity: it.quotedQuantity || (it as any).quantity || 1,
      receivedQuantity: 0,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
      gstPercentage: it.gstPercentage || 18,
      netPrice: it.netPrice,
      hsnCode: '72085110',
      drawingNumber: 'DWG-JOB-RELEASED',
    }));

    const newPO: PurchaseOrder = {
      id: poNumber,
      poNumber,
      quotationId: recommendedQuote?.id || '',
      rfqNumber: matrix.rfqNumber,
      supplierId: matrix.recommendedSupplierId,
      supplierName: matrix.recommendedSupplierName,
      supplierContactPerson: 'Sales & Commercial Lead',
      supplierPhone: '+91 98250 12345',
      supplierEmail: 'sales@vendor-industrial.com',
      projectId: matrix.projectId || 'PRJ-2026-001',
      jobId: matrix.jobId || 'JOB-2026-0065',
      poDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      paymentTerms: recommendedQuote?.paymentTerms || '30 Days Credit',
      deliveryTerms: recommendedQuote?.deliveryTerms || 'FOR Destination',
      shippingAddress: 'Plot No. 48/A, GIDC Phase II, Vatva, Ahmedabad, Gujarat 382445',
      billingAddress: 'Plot No. 48/A, GIDC Phase II, Vatva, Ahmedabad, Gujarat 382445',
      items: poItems,
      subTotal: recommendedQuote?.subTotal || 100000,
      taxTotal: recommendedQuote?.taxTotal || 18000,
      freightCharges: recommendedQuote?.freightCharges || 2500,
      otherCharges: 0,
      grandTotal: recommendedQuote?.grandTotal || 120500,
      specialInstructions: 'Test certificates (MTC) required along with material delivery conforming to ASME standard.',
      status: 'Approved',
      approvedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Head',
      approvedAt: new Date().toISOString(),
      createdByUser: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Lead',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPurchaseOrder(newPO);
    showToast(`✓ Purchase Order ${poNumber} created successfully! Redirecting to PO Register...`);
    setTimeout(() => {
      router.push('/purchase/po');
    }, 1500);
  };

  // Save updated buyer rationale
  const handleSaveJustification = () => {
    if (!savedCS) return;
    updateQuotationComparison(savedCS.id, {
      buyerReason: justificationText,
      recommendedSupplierId: recommendedVendorId || savedCS.recommendedSupplierId,
      recommendedSupplierName:
        savedCS.suppliersEvaluated.find((s) => s.supplierId === recommendedVendorId)?.supplierName ||
        savedCS.recommendedSupplierName,
    });
    setEditingJustification(false);
    showToast('✓ Updated Buyer Justification & Recommendation notes.');
  };

  if (!mounted) {
    return (
      <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#544B45]">
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE3DB]">
          <h1 className="text-2xl font-black text-[#211B17]">Supplier Quotation Comparison Matrix</h1>
        </div>
        <div className="p-12 text-center text-sm text-[#70665F]">Loading Comparative Statement...</div>
      </div>
    );
  }

  const isApproved = savedCS?.approvalStatus === 'approved' || savedCS?.status === 'Approved';
  const rfqDetails = activeRfq ? getRfqJobDetails(activeRfq.id) : null;

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] min-h-screen">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl animate-fade-in border border-emerald-400 font-medium text-xs">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-700 text-xs font-mono font-bold border border-pink-500/30">
              COMPARATIVE STATEMENT (CS)
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Supplier Quotation Comparison Matrix</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-pink-600 inline" />
            Side-by-side technical & commercial evaluation, automated L1 price discovery, and Purchase Order authorization.
          </p>
        </div>

        {/* RFQ Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#EBE3DB] rounded-xl px-3.5 py-2 text-xs shadow-xs">
          <span className="text-[#70665F] font-semibold whitespace-nowrap">Select RFQ Statement:</span>
          <select
            value={selectedRfqId}
            onChange={(e) => setSelectedRfqId(e.target.value)}
            className="bg-transparent text-[#211B17] font-bold cursor-pointer focus:outline-none max-w-[340px]"
          >
            {rfqs.map((r) => {
              const details = getRfqJobDetails(r.id);
              return (
                <option key={r.id} value={r.id} className="bg-white">
                  {r.rfqNumber || r.id} — [{details?.customerName || 'Customer'}]
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Workflow Explanatory Steps Banner */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-3 p-2 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 font-black flex items-center justify-center shrink-0 font-mono">
            1
          </div>
          <div>
            <div className="font-bold text-[#211B17]">Select RFQ</div>
            <div className="text-[11px] text-[#70665F]">
              {activeRfq ? `${activeRfq.rfqNumber} (${rfqDetails?.customerName})` : 'Choose RFQ above'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-800 font-black flex items-center justify-center shrink-0 font-mono">
            2
          </div>
          <div>
            <div className="font-bold text-[#211B17]">Received Bids</div>
            <div className="text-[11px] text-[#70665F]">
              <span className="font-bold text-[#211B17]">{receivedQuotesForRfq.length}</span> quotes recorded in register
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-800 font-black flex items-center justify-center shrink-0 font-mono">
            3
          </div>
          <div>
            <div className="font-bold text-[#211B17]">Comparative Matrix</div>
            <div className="text-[11px] text-[#70665F]">
              {savedCS ? (
                <span className="text-emerald-700 font-bold">Matrix Evaluated ({savedCS.status})</span>
              ) : (
                'Pending Matrix Build'
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-800 font-black flex items-center justify-center shrink-0 font-mono">
            4
          </div>
          <div>
            <div className="font-bold text-[#211B17]">PO Authorization</div>
            <div className="text-[11px] text-[#70665F]">
              {linkedPO ? (
                <span className="text-emerald-700 font-bold">{linkedPO.poNumber} Released ✓</span>
              ) : isApproved ? (
                'Ready to Release PO'
              ) : (
                'Approve CS to Release'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {savedCS ? (() => {
        const evaluatedSuppliers = Array.isArray(savedCS.suppliersEvaluated)
          ? savedCS.suppliersEvaluated
          : Array.isArray((savedCS as any).suppliers)
          ? (savedCS as any).suppliers
          : Array.isArray((savedCS as any).suppliers_evaluated)
          ? (savedCS as any).suppliers_evaluated
          : [];

        const matrixItems = Array.isArray(savedCS.items)
          ? savedCS.items
          : Array.isArray((savedCS as any).line_items)
          ? (savedCS as any).line_items
          : [];

        return (
        <div className="space-y-6">
          {/* Header Summary Card */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-pink-800 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                  {savedCS.comparisonNumber}
                </span>
                <span className="text-xs text-[#70665F]">
                  Job: <span className="text-amber-800 font-bold font-mono">{savedCS.jobId}</span>
                </span>
                <span className="text-xs text-stone-600 font-medium">[{rfqDetails?.customerName}]</span>
              </div>
              <h2 className="text-lg font-black text-[#211B17]">Commercial & Technical Comparative Statement</h2>
              <div className="text-xs text-[#70665F] flex flex-wrap items-center gap-4">
                <span>
                  Evaluated By: <strong className="text-[#211B17]">{savedCS.preparedBy}</strong>
                </span>
                <span>
                  Date: <strong className="text-[#211B17]">{savedCS.comparisonDate}</strong>
                </span>
                <span>
                  Suppliers Compared: <strong className="text-[#211B17]">{evaluatedSuppliers.length} Vendors</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                  isApproved
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                Status: {isApproved ? 'Approved' : 'Under Review'}
              </span>

              {!isApproved ? (
                <button
                  onClick={() => handleApproveMatrix(savedCS)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Approve CS Matrix
                </button>
              ) : (
                <button
                  onClick={() => handleCreatePOFromMatrix(savedCS)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Generate Purchase Order (PO) →</span>
                </button>
              )}

              <button
                onClick={() => handleAutoGenerateMultiVendorBids()}
                title="Re-generate multi vendor comparison"
                className="p-2 bg-stone-100 hover:bg-stone-200 text-[#544B45] rounded-xl transition"
              >
                <Sparkles className="w-4 h-4 text-pink-700" />
              </button>
            </div>
          </div>

          {/* Comparative Matrix Table */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-pink-700" />
                Line Item Side-by-Side Rate Matrix
              </h3>
              <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> L1 (Lowest Bid) highlighted in Emerald Green
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
                  <tr>
                    <th className="p-3 w-72">Item Description & Spec</th>
                    <th className="p-3 text-right w-28">Required Qty</th>
                    {evaluatedSuppliers.map((sup: any, idx: number) => (
                      <th key={idx} className="p-3 text-center border-l border-[#EBE3DB] min-w-[200px]">
                        <div className="font-bold text-[#211B17] text-xs">{sup.supplierName}</div>
                        <div className="text-[10px] text-emerald-800 font-bold font-mono mt-0.5">
                          Total: ₹{(sup.grandTotal || 0).toLocaleString('en-IN')}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {matrixItems.map((item: any, iIdx: number) => (
                    <tr key={item.id || iIdx} className="hover:bg-[#FAF7F2]/40 transition">
                      <td className="p-3">
                        <div className="font-bold text-[#211B17]">{item.itemName}</div>
                        <div className="font-mono text-[10px] text-[#70665F]">{item.itemCode}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#211B17]">
                        {item.requiredQuantity} {item.unitOfMeasure}
                      </td>

                      {evaluatedSuppliers.map((sup: any, sIdx: number) => {
                        const isL1 = sup.supplierId === item.lowestSupplierId;
                        const rate = item.supplierRates ? (item.supplierRates[sup.supplierId] || 0) : 0;
                        const lineTotal = rate * item.requiredQuantity;

                        return (
                          <td
                            key={sIdx}
                            className={`p-3 text-center border-l border-[#EBE3DB] ${
                              isL1 ? 'bg-emerald-50/70 text-emerald-900 font-bold' : 'text-[#544B45]'
                            }`}
                          >
                            <div className="font-mono text-xs">
                              ₹{rate ? rate.toLocaleString('en-IN') : 'N/A'} / {item.unitOfMeasure}
                            </div>
                            <div className="text-[10px] text-[#70665F] font-mono">
                              Line: ₹{lineTotal ? lineTotal.toLocaleString('en-IN') : 0}
                            </div>

                            {isL1 && (
                              <span className="mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black block w-fit mx-auto">
                                ✓ L1 RATE
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Commercial Terms Comparison Row */}
                  <tr className="bg-[#FAF7F2] font-semibold border-t-2 border-[#EBE3DB]">
                    <td colSpan={2} className="p-3 font-bold text-[#211B17]">
                      Payment & Delivery Commercial Terms
                    </td>
                    {evaluatedSuppliers.map((sup: any, sIdx: number) => (
                      <td key={sIdx} className="p-3 text-center border-l border-[#EBE3DB] text-[11px] space-y-1">
                        <div className="text-stone-700">
                          <span className="text-[#70665F]">Terms: </span>
                          <span className="font-bold">{sup.paymentTerms || '30 Days Net'}</span>
                        </div>
                        <div className="text-stone-700">
                          <span className="text-[#70665F]">Delivery: </span>
                          <span className="font-bold">{sup.deliveryTerms || 'FOR Site'}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Total Bid Row */}
                  <tr className="bg-stone-100 font-black border-t border-[#EBE3DB]">
                    <td colSpan={2} className="p-3 text-base text-[#211B17]">
                      Grand Total Quoted Value
                    </td>
                    {evaluatedSuppliers.map((sup: any, sIdx: number) => {
                      const allTotals = evaluatedSuppliers.map((s: any) => s.grandTotal || 0);
                      const minTotal = allTotals.length > 0 ? Math.min(...allTotals) : 0;
                      const isOverallL1 = sup.grandTotal === minTotal && minTotal > 0;
                      return (
                        <td
                          key={sIdx}
                          className={`p-3 text-center border-l border-[#EBE3DB] font-mono ${
                            isOverallL1 ? 'bg-emerald-100 text-emerald-900' : 'text-[#211B17]'
                          }`}
                        >
                          <div className="text-sm font-black">₹{(sup.grandTotal || 0).toLocaleString('en-IN')}</div>
                          {isOverallL1 && (
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-0.5 inline-block">
                              ★ Overall L1 Bid
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation & Commercial Rationale Box */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold text-[#211B17]">Buyer Recommendation & Commercial Justification</h3>
              </div>
              {!editingJustification && (
                <button
                  onClick={() => {
                    setJustificationText(savedCS.buyerReason || '');
                    setRecommendedVendorId(savedCS.recommendedSupplierId || '');
                    setEditingJustification(true);
                  }}
                  className="flex items-center gap-1 text-xs text-amber-800 hover:text-amber-900 font-bold cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Justification
                </button>
              )}
            </div>

            {editingJustification ? (
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#211B17] mb-1">Recommended Supplier:</label>
                  <select
                    value={recommendedVendorId}
                    onChange={(e) => setRecommendedVendorId(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-bold"
                  >
                    {evaluatedSuppliers.map((s: any) => (
                      <option key={s.supplierId} value={s.supplierId}>
                        {s.supplierName} — Total: ₹{(s.grandTotal || 0).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#211B17] mb-1">Commercial Reason / Buyer Justification:</label>
                  <textarea
                    rows={3}
                    value={justificationText}
                    onChange={(e) => setJustificationText(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingJustification(false)}
                    className="px-3 py-1.5 bg-stone-200 text-[#211B17] font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveJustification}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#211B17]">
                  <span className="text-[#70665F]">Recommended Vendor:</span>
                  <span className="font-black text-amber-900 text-sm">{savedCS.recommendedSupplierName}</span>
                </div>
                <div className="text-[#544B45]">
                  <span className="text-[#70665F] font-semibold">Justification / Reason:</span>
                  <p className="mt-1 text-[#544B45] italic leading-relaxed">{savedCS.buyerReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        );
      })() : (
        /* Empty State & Flow Action Area */
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center mx-auto border border-pink-200">
            <FileSpreadsheet className="w-7 h-7" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="font-black text-lg text-[#211B17]">
              No Comparison Matrix Evaluated Yet for {activeRfq?.rfqNumber || selectedRfqId}
            </h3>
            <p className="text-xs text-[#70665F] leading-relaxed">
              When multiple suppliers submit their commercial quotes for an RFQ, the <strong>Comparative Statement (CS)</strong>{' '}
              creates a side-by-side line item rate matrix and automatically identifies <strong>L1 (lowest pricing)</strong> for buyer justification and PO approval.
            </p>
          </div>

          {receivedQuotesForRfq.length > 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-lg mx-auto text-xs text-left space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Found {receivedQuotesForRfq.length} Received Quotation(s) in Database for this RFQ:
              </div>
              <ul className="list-disc list-inside text-emerald-800 space-y-0.5">
                {receivedQuotesForRfq.map((q) => (
                  <li key={q.id}>
                    <strong>{q.supplierName}</strong> ({q.quotationNumber}) — ₹{(q.grandTotal || 0).toLocaleString('en-IN')}
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <button
                  onClick={handleBuildMatrixFromReceivedQuotes}
                  className="w-full px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Build Comparison Matrix from These {receivedQuotesForRfq.length} Quotations</span>
                </button>
              </div>
            </div>
          ) : null}

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleAutoGenerateMultiVendorBids}
              className="px-5 py-3 bg-gradient-to-r from-pink-700 to-amber-700 hover:from-pink-800 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Generate 3 Vendor Bids & Build Comparison (1-Click)</span>
            </button>

            <Link
              href="/purchase/quotations"
              className="px-5 py-3 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] text-xs font-bold rounded-xl border border-[#EBE3DB] transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Received Supplier Quotation</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
