'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { QuotationComparison } from '../../../types/purchase';

export default function QuotationComparisonPage() {
  const { quotationComparisons, approveQuotationComparison, addQuotationComparison, rfqs, supplierQuotations, addSupplierQuotation, currentUser } = useERP();
  const [selectedRfqId, setSelectedRfqId] = useState<string>(rfqs[0]?.id || rfqs[0]?.rfqNumber || 'RFQ-2026-2048');
  const [autoGenSuccess, setAutoGenSuccess] = useState<string | null>(null);

  // Find exact comparison or check if any exists for selected RFQ
  const currentCS = useMemo(() => {
    return quotationComparisons.find(
      (qc) => qc.rfqId === selectedRfqId || qc.rfqNumber === selectedRfqId || qc.id === selectedRfqId
    ) || null;
  }, [quotationComparisons, selectedRfqId]);

  const activeRfq = useMemo(() => {
    return rfqs.find((r) => r.id === selectedRfqId || r.rfqNumber === selectedRfqId) || rfqs[0];
  }, [rfqs, selectedRfqId]);

  // Handle 1-Click Auto-Generate Multi-Vendor Bids & Build Comparison Matrix
  const handleAutoGenerateMatrix = () => {
    if (!activeRfq) return;

    const rfqNo = activeRfq.rfqNumber || activeRfq.id || 'RFQ-2026-2048';
    const jId = (activeRfq as any).jobId || (activeRfq as any).jobNumber || 'PRJ-2026-0055';
    const pId = activeRfq.projectId || 'PRJ-2026-0055';

    const sampleItems = activeRfq.items && activeRfq.items.length > 0 ? activeRfq.items : [
      {
        id: 'ITM-01',
        itemCode: 'RM-SS-PL-12MM',
        itemName: 'SS 316L Plates 12mm x 1500 x 6000',
        requiredQuantity: 6,
        unitOfMeasure: 'NOS',
        specification: 'ASTM A240 Gr. 316L',
      },
      {
        id: 'ITM-02',
        itemCode: 'RM-FLANGE-150',
        itemName: '100NB Class 150 SORF Flanges SS316',
        requiredQuantity: 16,
        unitOfMeasure: 'NOS',
        specification: 'ASME B16.5 / ASTM A182',
      },
      {
        id: 'ITM-03',
        itemCode: 'BO-VLV-2IN',
        itemName: '2 Inch SS316 Ball Valve 3-Piece',
        requiredQuantity: 8,
        unitOfMeasure: 'NOS',
        specification: 'Class 150 Fire-safe API 607',
      },
    ];

    // Vendor bids
    const v1Rate1 = 28500, v1Rate2 = 4200, v1Rate3 = 9800;
    const v2Rate1 = 27200, v2Rate2 = 4500, v2Rate3 = 10200; // L1 for Item 1
    const v3Rate1 = 29000, v3Rate2 = 3950, v3Rate3 = 9400; // L1 for Item 2 & 3

    const v1Total = (sampleItems[0]?.requiredQuantity || 6) * v1Rate1 + (sampleItems[1]?.requiredQuantity || 16) * v1Rate2 + (sampleItems[2]?.requiredQuantity || 8) * v1Rate3;
    const v2Total = (sampleItems[0]?.requiredQuantity || 6) * v2Rate1 + (sampleItems[1]?.requiredQuantity || 16) * v2Rate2 + (sampleItems[2]?.requiredQuantity || 8) * v2Rate3;
    const v3Total = (sampleItems[0]?.requiredQuantity || 6) * v3Rate1 + (sampleItems[1]?.requiredQuantity || 16) * v3Rate2 + (sampleItems[2]?.requiredQuantity || 8) * v3Rate3;

    const compId = `CS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMatrix: QuotationComparison = {
      id: compId,
      comparisonNumber: compId,
      rfqId: rfqNo,
      rfqNumber: rfqNo,
      jobId: jId,
      projectId: pId,
      comparisonDate: new Date().toISOString().split('T')[0],
      preparedBy: `${currentUser.firstName || 'Purchase'} ${currentUser.lastName || 'Officer'} (Lead Buyer)`,
      status: 'Under Review',
      approvalStatus: 'pending',
      recommendedSupplierId: 'SUP-002',
      recommendedSupplierName: 'Ratnamani Metals & Tubes Ltd',
      buyerReason: 'Ratnamani Metals offered the lowest commercial bid for prime SS 316L plates (L1) with ISO 9001 and Mill Test Certificates matching ASME Boiler & Pressure Vessel codes. Technical parameters fully compliant.',
      suppliersEvaluated: [
        {
          supplierId: 'SUP-001',
          supplierName: 'Jindal Stainless Steelway Ltd',
          grandTotal: v1Total,
          deliveryTerms: 'Ex-works Vadodara (7 Days)',
          paymentTerms: '30 Days Net',
        },
        {
          supplierId: 'SUP-002',
          supplierName: 'Ratnamani Metals & Tubes Ltd',
          grandTotal: v2Total,
          deliveryTerms: 'FOR Factory Site (5 Days)',
          paymentTerms: '45 Days PDC',
        },
        {
          supplierId: 'SUP-003',
          supplierName: 'Tubacex Prakash India Pvt Ltd',
          grandTotal: v3Total,
          deliveryTerms: 'Ex-works Umbergaon (10 Days)',
          paymentTerms: '100% Against PI',
        },
      ],
      items: sampleItems.map((itm, idx) => {
        const rates: Record<string, number> = {
          'SUP-001': idx === 0 ? v1Rate1 : idx === 1 ? v1Rate2 : v1Rate3,
          'SUP-002': idx === 0 ? v2Rate1 : idx === 1 ? v2Rate2 : v2Rate3,
          'SUP-003': idx === 0 ? v3Rate1 : idx === 1 ? v3Rate2 : v3Rate3,
        };
        const lowestSupId = idx === 0 ? 'SUP-002' : 'SUP-003';
        return {
          id: `CSI-${idx + 1}`,
          itemCode: itm.itemCode || `ITEM-${idx + 1}`,
          itemName: itm.itemName || 'Engineering Material',
          requiredQuantity: Number(itm.requiredQuantity || 1),
          unitOfMeasure: itm.unitOfMeasure || 'NOS',
          supplierRates: rates,
          lowestSupplierId: lowestSupId,
        };
      }),
    };

    addQuotationComparison(newMatrix);
    setAutoGenSuccess(`Generated Comparative Statement ${compId} for ${rfqNo} with 3 supplier bids! L1 calculated.`);
    setTimeout(() => setAutoGenSuccess(null), 6000);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]">
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
            Side-by-side technical & commercial evaluation, L1 pricing identification & buyer rationale log.
          </p>
        </div>

        {/* RFQ Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#EBE3DB] rounded-xl px-3.5 py-2 text-xs shadow-xs">
          <span className="text-[#70665F] font-semibold whitespace-nowrap">Select RFQ Statement:</span>
          <select
            value={selectedRfqId}
            onChange={(e) => setSelectedRfqId(e.target.value)}
            className="bg-transparent text-[#211B17] font-bold cursor-pointer focus:outline-none"
          >
            {rfqs.map(r => (
              <option key={r.id} value={r.id} className="bg-white">
                {r.rfqNumber} ({(r as any).jobId || (r as any).jobNumber || r.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {autoGenSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{autoGenSuccess}</span>
          </div>
        </div>
      )}

      {currentCS ? (
        <div className="space-y-6">
          {/* Header Summary Card */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                  {currentCS.comparisonNumber}
                </span>
                <span className="text-xs text-[#70665F]">Job: <span className="text-amber-700 font-bold font-mono">{currentCS.jobId}</span></span>
              </div>
              <h2 className="text-lg font-bold text-[#211B17]">Commercial Statement Evaluation Matrix</h2>
              <div className="text-xs text-[#70665F] flex flex-wrap items-center gap-4">
                <span>Evaluated By: <strong className="text-[#211B17]">{currentCS.preparedBy}</strong></span>
                <span>Date: <strong className="text-[#211B17]">{currentCS.comparisonDate}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                currentCS.approvalStatus === 'approved' || currentCS.status === 'Approved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                CS Status: {currentCS.approvalStatus === 'approved' || currentCS.status === 'Approved' ? 'Approved' : 'Under Review'}
              </span>

              {currentCS.approvalStatus !== 'approved' && currentCS.status !== 'Approved' && (
                <button
                  onClick={() => {
                    approveQuotationComparison(currentCS.id, `${currentUser.firstName || 'Purchase'} ${currentUser.lastName || 'Officer'}`);
                    setAutoGenSuccess(`Approved Comparative Statement ${currentCS.comparisonNumber} and authorized Purchase Order release!`);
                    setTimeout(() => setAutoGenSuccess(null), 5000);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Approve CS Matrix & Authorize PO
                </button>
              )}
            </div>
          </div>

          {/* Comparative Matrix Table */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-pink-700" />
                Line Item Side-by-Side Rate Matrix
              </h3>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> L1 (Lowest Bid) highlighted in Emerald Green
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
                  <tr>
                    <th className="p-3 w-64">Item Description</th>
                    <th className="p-3 text-right">Required Qty</th>
                    {currentCS.suppliersEvaluated.map((sup, idx) => (
                      <th key={idx} className="p-3 text-center border-l border-[#EBE3DB]">
                        <div className="font-bold text-[#211B17]">{sup.supplierName}</div>
                        <div className="text-[10px] text-[#70665F] font-mono mt-0.5">Total: ₹{sup.grandTotal?.toLocaleString('en-IN')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {currentCS.items.map(item => (
                    <tr key={item.id} className="hover:bg-[#FAF7F2]/40 transition">
                      <td className="p-3">
                        <div className="font-bold text-[#211B17]">{item.itemName}</div>
                        <div className="font-mono text-[10px] text-[#70665F]">{item.itemCode}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#211B17]">
                        {item.requiredQuantity} {item.unitOfMeasure}
                      </td>

                      {currentCS.suppliersEvaluated.map((sup, sIdx) => {
                        const isL1 = sup.supplierId === item.lowestSupplierId;

                        return (
                          <td
                            key={sIdx}
                            className={`p-3 text-center border-l border-[#EBE3DB] ${
                              isL1 ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-[#544B45]'
                            }`}
                          >
                            <div className="font-mono text-xs">
                              ₹{item.supplierRates[sup.supplierId]?.toLocaleString('en-IN') || 'N/A'} / {item.unitOfMeasure}
                            </div>

                            {isL1 && (
                              <span className="mt-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-bold block w-fit mx-auto">
                                L1 RATE
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation & Commercial Rationale Box */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-700" />
              <h3 className="text-sm font-bold text-[#211B17]">Buyer Recommendation & Purchase Rationale</h3>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#211B17]">
                <span className="text-[#70665F]">Recommended Vendor:</span>
                <span className="font-bold text-amber-800 text-sm">{currentCS.recommendedSupplierName}</span>
              </div>
              <div className="text-[#544B45]">
                <span className="text-[#70665F] font-semibold">Justification / Reason:</span>
                <p className="mt-1 text-[#544B45] italic leading-relaxed">{currentCS.buyerReason}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center mx-auto border border-pink-200">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-base text-[#211B17]">
              No Comparison Matrix Evaluated Yet for {activeRfq?.rfqNumber || selectedRfqId}
            </h3>
            <p className="text-xs text-[#70665F] leading-relaxed">
              When multiple suppliers submit their commercial quotes for an RFQ, the Comparative Statement (CS) creates a line-item rate matrix and automatically identifies L1 (lowest pricing) for buyer justification.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleAutoGenerateMatrix}
              className="px-4 py-2.5 bg-gradient-to-r from-pink-700 to-amber-700 hover:from-pink-800 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Generate Multi-Vendor Bids & Build Comparison</span>
            </button>
            <Link
              href="/purchase/quotations"
              className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] text-xs font-semibold rounded-xl border border-[#EBE3DB] transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enter Manual Supplier Quote</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
