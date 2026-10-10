'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { ArrowLeft, FileCheck2, Plus, Trash2, Save, IndianRupee, Sparkles } from 'lucide-react';
import { QuotationItem } from '../../../../types/crm';
import { formatCurrency } from '../../../../lib/utils';

function QuotationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, enquiries, leads, addQuotation, currentUser } = useERP();

  const prefillCustId = searchParams.get('customerId') || '';
  const prefillEnqId = searchParams.get('enquiryId') || '';
  const prefillLeadId = searchParams.get('leadId') || '';

  // Match Lead from search params or localStorage
  const matchedLead = leads.find((l) =>
    (prefillLeadId && (l.id === prefillLeadId || l.leadNo === prefillLeadId)) ||
    (prefillEnqId && (l.convertedEnquiryId === prefillEnqId || l.id === prefillEnqId)) ||
    (prefillCustId && (l.convertedCustomerId === prefillCustId || l.id === prefillCustId))
  ) || (typeof window !== 'undefined' ? (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('UMA_ERP_leads') || '[]');
      return stored.find((l: any) =>
        (prefillLeadId && (l.id === prefillLeadId || l.leadNo === prefillLeadId)) ||
        (prefillEnqId && (l.convertedEnquiryId === prefillEnqId || l.id === prefillEnqId)) ||
        (prefillCustId && (l.convertedCustomerId === prefillCustId || l.id === prefillCustId))
      );
    } catch (_) { return null; }
  })() : null);

  const matchedEnquiry = enquiries.find((e) =>
    (prefillEnqId && (e.id === prefillEnqId || e.enquiryNo === prefillEnqId)) ||
    (prefillCustId && e.customerId === prefillCustId) ||
    (prefillLeadId && e.leadId === prefillLeadId)
  );

  // Match Customer by ID, Code, or Company Name
  const matchedCustomer = customers.find(
    (c) =>
      (prefillCustId && (c.id === prefillCustId || c.customerCode === prefillCustId)) ||
      (matchedLead?.convertedCustomerId && (c.id === matchedLead.convertedCustomerId || c.customerCode === matchedLead.convertedCustomerId)) ||
      (matchedLead?.companyName && c.companyName.toLowerCase() === matchedLead.companyName.toLowerCase())
  );

  const [customerId, setCustomerId] = useState(
    matchedCustomer?.id || prefillCustId || matchedLead?.convertedCustomerId || customers[0]?.id || ''
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('2026-10-30');

  // Compute initial product name, desc, qty, rate from lead/enquiry
  const initProductName =
    matchedLead?.productName ||
    matchedEnquiry?.machineProduct ||
    'Heavy SS 316L Chemical Reactor Vessel (10 KL)';
  const initDesc =
    matchedLead?.requirementDescription ||
    matchedEnquiry?.requirement ||
    matchedEnquiry?.specification ||
    'Shell: 8mm SS 316L, Jacket: Dimple SS 304, 15 HP Anchor Agitator with Dual Mechanical Seal.';
  const initQty = Number(matchedLead?.quantity || matchedEnquiry?.quantity || 1);
  const initRate = matchedLead?.budget
    ? Math.round(Number(matchedLead.budget) / (initQty || 1))
    : 4200000;
  const initTax = 18;
  const initBase = initQty * initRate;
  const initAmount = Math.round(initBase * (1 + initTax / 100));

  // Items
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: 'item-1',
      productName: initProductName,
      description: initDesc,
      quantity: initQty,
      unit: 'Set',
      rate: initRate,
      discountPercent: 0,
      taxPercent: initTax,
      amount: initAmount,
    },
  ]);

  // Commercials & Scope
  const [technicalSpecs, setTechnicalSpecs] = useState(
    matchedLead?.capacity
      ? `Capacity: ${matchedLead.capacity} (${matchedLead.machineType || 'Industrial Equipment'}). ${matchedLead.requirementDescription || ''}`
      : matchedEnquiry?.specification || 'Design Code: ASME Sec VIII Div 1. Hydro test: 12 Bar. Design Temp: 180°C.'
  );
  const [scopeOfSupply, setScopeOfSupply] = useState(
    matchedLead?.productName
      ? `Supply, fabrication, inspection and testing of ${matchedLead.productName} as per specifications.`
      : 'Supply of complete reactor vessel, motor, gearbox, seal pot, mounting stool.'
  );
  const [exclusions, setExclusions] = useState('Civil foundations, interconnecting piping, insulation cladding.');
  const [paymentTerms, setPaymentTerms] = useState('30% Advance, 60% ag. Proforma Invoice, 10% after Commissioning.');
  const [deliveryTime, setDeliveryTime] = useState(matchedLead?.expectedDelivery ? `By ${matchedLead.expectedDelivery}` : '8 to 10 Weeks from approved GA drawing.');
  const [warranty, setWarranty] = useState('18 Months from dispatch or 12 Months from commissioning.');
  const [termsAndConditions, setTermsAndConditions] = useState('Prices Ex-Works Makarpura, Vadodara. Freight extra at actuals.');

  const handleItemChange = (idx: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;

    // Recalculate amount
    const qty = Number(updated[idx].quantity) || 1;
    const rate = Number(updated[idx].rate) || 0;
    const disc = Number(updated[idx].discountPercent) || 0;
    const tax = Number(updated[idx].taxPercent) || 0;

    const base = qty * rate * (1 - disc / 100);
    const amt = base * (1 + tax / 100);
    updated[idx].amount = Math.round(amt);

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        productName: '',
        description: '',
        quantity: 1,
        unit: 'Unit',
        rate: 100000,
        discountPercent: 0,
        taxPercent: 18,
        amount: 118000,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate * (1 - item.discountPercent / 100)), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.quantity * item.rate * (1 - item.discountPercent / 100) * (item.taxPercent / 100)), 0);
  const grandTotal = Math.round(subTotal + totalTax);

  useEffect(() => {
    if (matchedCustomer && customerId !== matchedCustomer.id) {
      setCustomerId(matchedCustomer.id);
    } else if (prefillCustId && customerId !== prefillCustId) {
      setCustomerId(prefillCustId);
    } else if (matchedLead?.convertedCustomerId && !customerId) {
      setCustomerId(matchedLead.convertedCustomerId);
    }
  }, [matchedCustomer, prefillCustId, matchedLead, customerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);

    const created = addQuotation({
      currentRevision: 'Rev-00',
      date,
      validUntil,
      customerId,
      customerName: cust?.companyName || matchedLead?.companyName || 'Valued Customer',
      contactPerson: cust?.contactPerson || matchedLead?.contactPerson || 'Purchase Head',
      contactEmail: cust?.email || matchedLead?.email || '',
      contactMobile: cust?.mobile || matchedLead?.mobile || '',
      leadId: matchedLead?.id || prefillLeadId || undefined,
      enquiryId: prefillEnqId || undefined,
      latestSummary: {
        grandTotal,
        status: 'draft',
        machineProduct: items[0]?.productName || 'Custom Manufacturing Machine',
      },
      revisions: [
        {
          revisionNumber: 'Rev-00',
          date,
          preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
          items: items.map(it => ({ ...it, quantity: Number(it.quantity) || 1, rate: Number(it.rate) || 0, discountPercent: Number(it.discountPercent) || 0 })),
          subTotal: Math.round(subTotal),
          discountAmount: 0,
          taxAmount: Math.round(totalTax),
          grandTotal,
          technicalSpecs,
          scopeOfSupply,
          exclusions,
          paymentTerms,
          deliveryTime,
          warranty,
          termsAndConditions,
          status: 'draft',
        },
      ],
    });

    router.push(`/crm/quotations/${created.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 text-xs pb-10">
      <Link href="/crm/quotations" className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:underline font-semibold">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Quotations
      </Link>

      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-[#EBE3DB] pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-crm-brand-700" />
              Generate Technical & Commercial Quotation (Rev-00)
            </h1>
            <p className="text-[#70665F] mt-0.5">
              Build formal machine quotation with line items, tax calculations, technical scope, and payment milestones.
            </p>
          </div>
          <span className="px-3 py-1 bg-crm-brand-50 text-crm-brand-800 border border-crm-brand-200 font-mono font-bold rounded-lg text-xs">
            NEW REVISION: Rev-00
          </span>
        </div>

        {matchedLead && (
          <div className="p-3.5 bg-gradient-to-r from-crm-brand-50 via-[#FDF8F3] to-emerald-50 border border-crm-brand-200 rounded-xl flex items-center justify-between text-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-crm-brand-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Generating Quotation for Lead: <span className="font-mono text-crm-brand-800 font-extrabold">{matchedLead.leadNo || matchedLead.id}</span> — {matchedLead.companyName}
                </span>
                <span className="text-[11px] text-[#70665F]">
                  Contact: {matchedLead.contactPerson} ({matchedLead.mobile || 'N/A'}) • Machine Requirement: <strong className="text-slate-800">{matchedLead.productName}</strong>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#70665F] block">Lead Budget</span>
              <span className="font-mono font-bold text-emerald-700 text-xs">
                {formatCurrency(matchedLead.budget || 0)}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* HEADER METADATA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Customer *</label>
              <select
                value={customerId}
                onChange={(e) => {
                  const newCustId = e.target.value;
                  setCustomerId(newCustId);
                  const custLead = leads.find((l) => l.convertedCustomerId === newCustId || l.id === newCustId);
                  const custEnq = enquiries.find((enq) => enq.customerId === newCustId);
                  if (custLead || custEnq) {
                    const prodName = custLead?.productName || custEnq?.machineProduct;
                    const desc = custLead?.requirementDescription || custEnq?.requirement || custEnq?.specification;
                    const qty = Number(custLead?.quantity || custEnq?.quantity || 1);
                    const rate = custLead?.budget ? Math.round(Number(custLead.budget) / (qty || 1)) : 100000;
                    const tax = 18;
                    const base = qty * rate;
                    const amt = Math.round(base * (1 + tax / 100));

                    if (prodName) {
                      setItems([
                        {
                          id: 'item-1',
                          productName: prodName,
                          description: desc || 'Standard technical specifications',
                          quantity: qty,
                          unit: 'Set',
                          rate,
                          discountPercent: 0,
                          taxPercent: tax,
                          amount: amt,
                        },
                      ]);
                      setScopeOfSupply(`Supply, fabrication, inspection and testing of ${prodName} as per specifications.`);
                    }
                    if (custLead?.capacity) {
                      setTechnicalSpecs(`Capacity: ${custLead.capacity} (${custLead.machineType || 'Industrial'}). ${custLead.requirementDescription || ''}`);
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-bold text-slate-900 dark:text-[#211B17]"
              >
                {!customers.some((c) => c.id === customerId) && matchedLead ? (
                  <option value={customerId}>{matchedLead.companyName}</option>
                ) : null}
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Quotation Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
              />
            </div>
          </div>

          {/* LINE ITEMS TABLE */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Equipment / Machine Line Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 bg-[#FAF7F2] text-[#3E2723] hover:bg-[#F2ECE4] border border-[#E7DED5] rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-slate-50/50 dark:bg-[#FAF7F2]/30 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-slate-600 font-semibold mb-1">Machine / Item Name *</label>
                        <input
                          type="text"
                          required
                          value={item.productName}
                          onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                          placeholder="e.g. 10 KL SS 316L Limpet Jacketed Reactor"
                          className="w-full px-3 py-1.5 bg-white dark:bg-white border rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Unit</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-white border rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30 mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Item Technical Description</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Shell thk, dish ends, agitator drive, motor rating..."
                      className="w-full px-3 py-1.5 bg-white dark:bg-white border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[11px]">
                    <div>
                      <label className="block text-[#70665F] mb-0.5">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white dark:bg-white border rounded font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#70665F] mb-0.5">Unit Rate (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white dark:bg-white border rounded font-mono font-bold text-slate-800 dark:text-[#544B45]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#70665F] mb-0.5">Discount %</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.discountPercent}
                        onChange={(e) => handleItemChange(idx, 'discountPercent', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white dark:bg-white border rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[#70665F] mb-0.5">GST %</label>
                      <select
                        value={item.taxPercent}
                        onChange={(e) => handleItemChange(idx, 'taxPercent', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white dark:bg-white border rounded font-mono"
                      >
                        <option value={18}>18% GST</option>
                        <option value={12}>12% GST</option>
                        <option value={5}>5% GST</option>
                        <option value={0}>0% Exempt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#70665F] mb-0.5">Total Amount (₹)</label>
                      <span className="px-2 py-1 bg-slate-200 dark:bg-[#FAF7F2] rounded font-mono font-bold text-emerald-600 block text-center">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary Strip */}
            <div className="p-4 bg-slate-100 dark:bg-[#FAF7F2] rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="font-semibold text-slate-600 dark:text-[#70665F]">
                Taxable Subtotal: {formatCurrency(subTotal)} • Total Tax: {formatCurrency(totalTax)}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Grand Total:</span>
                <span className="text-base font-extrabold text-emerald-600 font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* COMMERCIAL TERMS & SPECS */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Technical Scope & Commercial Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Technical Specifications</label>
                <textarea
                  rows={2}
                  value={technicalSpecs}
                  onChange={(e) => setTechnicalSpecs(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Scope of Supply</label>
                <textarea
                  rows={2}
                  value={scopeOfSupply}
                  onChange={(e) => setScopeOfSupply(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Delivery Schedule</label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Warranty Period</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Terms & Conditions</label>
              <textarea
                rows={2}
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <Link
              href="/crm/quotations"
              className="px-4 py-2 border rounded-lg hover:bg-slate-100 font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold shadow-md transition"
            >
              Save & Generate Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading quotation editor...</div>}>
      <QuotationFormContent />
    </Suspense>
  );
}
