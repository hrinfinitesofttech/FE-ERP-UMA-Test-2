'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import {
  ArrowLeft,
  FileCheck2,
  Plus,
  Trash2,
  Save,
  IndianRupee,
  Sparkles,
  Copy,
  RotateCcw,
  Wrench,
  Layers,
} from 'lucide-react';
import { QuotationItem } from '../../../../types/crm';
import { formatCurrency, formatDate } from '../../../../lib/utils';

const DEFAULT_TERMS = [
  'Prices: Ex-Works Makarpura, Vadodara. Packaging & forwarding charges extra at actuals.',
  'GST: 18% extra as applicable at the time of final invoicing / dispatch.',
  'Freight & Transit Insurance: Borne and arranged by the client / buyer at actuals.',
  'Delivery Schedule: 6 to 8 weeks from date of technically and commercially clear purchase order and approved engineering drawings.',
  'Payment Terms: 30% advance along with order confirmation, balance 70% against proforma invoice before dispatch.',
  'Warranty: 12 months from the date of commissioning or 18 months from delivery, whichever is earlier, against manufacturing defects.',
  'Inspection: Stage inspection and final hydrostatic test at our factory works prior to dispatch.',
  'Validity: This commercial quotation is valid for 30 days from the date of submission.',
];

const MACHINERY_PRESETS = [
  {
    name: 'SS 316L Reactor with Limpet',
    desc: 'SS 316L Limpet Jacketed Chemical Reactor with heavy duty Agitator, reduction gearbox & mechanical seal.',
    unit: 'Set',
    rate: 850000,
  },
  {
    name: 'Shell & Tube Heat Exchanger',
    desc: 'Fixed tubesheet design, SS 316 seamless tubes with Carbon Steel shell, 10 bar hydro-tested.',
    unit: 'Unit',
    rate: 420000,
  },
  {
    name: 'Bulk Chemical Storage Tank',
    desc: 'SS 304 vertical atmospheric chemical storage tank with level transmitter & dished bottom.',
    unit: 'Nos',
    rate: 350000,
  },
  {
    name: 'Heavy Agitator Assembly',
    desc: 'Agitator assembly with flameproof motor, lantern stool, reduction gearbox & high-efficiency impeller.',
    unit: 'Set',
    rate: 180000,
  },
  {
    name: 'Condenser / Receiver Column',
    desc: 'SS 316 distillation column condenser with reflux divider and sight glasses.',
    unit: 'Set',
    rate: 290000,
  },
];

function QuotationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, enquiries, leads, addQuotation, currentUser, updateLead, updateEnquiry } = useERP();

  const prefillCustId = searchParams.get('customerId') || '';
  const prefillEnqId = searchParams.get('enquiryId') || '';
  const prefillLeadId = searchParams.get('leadId') || '';

  // Match Enquiry from search params or localStorage
  const matchedEnquiry = enquiries.find((e) =>
    (prefillEnqId && (e.id === prefillEnqId || e.enquiryNo === prefillEnqId)) ||
    (prefillCustId && e.customerId === prefillCustId) ||
    (prefillLeadId && e.leadId === prefillLeadId)
  ) || (typeof window !== 'undefined' ? (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('UMA_ERP_enquiries') || '[]');
      return stored.find((e: any) =>
        (prefillEnqId && (e.id === prefillEnqId || e.enquiryNo === prefillEnqId)) ||
        (prefillCustId && e.customerId === prefillCustId) ||
        (prefillLeadId && e.leadId === prefillLeadId)
      );
    } catch (_) { return null; }
  })() : null);

  // Match Lead from search params, enquiry or localStorage
  const matchedLead = leads.find((l) =>
    (prefillLeadId && (l.id === prefillLeadId || l.leadNo === prefillLeadId)) ||
    (matchedEnquiry?.leadId && (l.id === matchedEnquiry.leadId || l.leadNo === matchedEnquiry.leadId)) ||
    (prefillEnqId && (l.convertedEnquiryId === prefillEnqId || l.id === prefillEnqId)) ||
    (prefillCustId && (l.convertedCustomerId === prefillCustId || l.id === prefillCustId))
  ) || (typeof window !== 'undefined' ? (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('UMA_ERP_leads') || '[]');
      return stored.find((l: any) =>
        (prefillLeadId && (l.id === prefillLeadId || l.leadNo === prefillLeadId)) ||
        (matchedEnquiry?.leadId && (l.id === matchedEnquiry.leadId || l.leadNo === matchedEnquiry.leadId)) ||
        (prefillEnqId && (l.convertedEnquiryId === prefillEnqId || l.id === prefillEnqId)) ||
        (prefillCustId && (l.convertedCustomerId === prefillCustId || l.id === prefillCustId))
      );
    } catch (_) { return null; }
  })() : null);

  // Match Customer by ID, Code, or Company Name
  const matchedCustomer = customers.find(
    (c) =>
      (prefillCustId && (c.id === prefillCustId || c.customerCode === prefillCustId)) ||
      (matchedEnquiry?.customerId && (c.id === matchedEnquiry.customerId || c.customerCode === matchedEnquiry.customerId)) ||
      (matchedEnquiry?.customerName && c.companyName.toLowerCase() === matchedEnquiry.customerName.toLowerCase()) ||
      (matchedLead?.convertedCustomerId && (c.id === matchedLead.convertedCustomerId || c.customerCode === matchedLead.convertedCustomerId)) ||
      (matchedLead?.companyName && c.companyName.toLowerCase() === matchedLead.companyName.toLowerCase())
  );

  const [customerId, setCustomerId] = useState(
    matchedCustomer?.id || prefillCustId || matchedEnquiry?.customerId || matchedLead?.convertedCustomerId || customers[0]?.id || ''
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Compute initial product name, desc, qty, rate from lead/enquiry
  const initProductName =
    matchedEnquiry?.machineProduct ||
    matchedLead?.productName ||
    '';
  const initDesc =
    [
      matchedEnquiry?.capacity ? `Capacity: ${matchedEnquiry.capacity}` : '',
      matchedEnquiry?.machineType ? `Type: ${matchedEnquiry.machineType}` : '',
      matchedEnquiry?.materialGrade ? `MOC: ${matchedEnquiry.materialGrade}` : '',
      matchedEnquiry?.specification || matchedEnquiry?.requirement || matchedLead?.requirementDescription || '',
    ].filter(Boolean).join(' • ');
  const initQty = Number(matchedEnquiry?.quantity || matchedLead?.quantity || 1);
  const initRate = (matchedEnquiry?.budget || matchedLead?.budget)
    ? Math.round(Number(matchedEnquiry?.budget || matchedLead?.budget) / (initQty || 1))
    : 0;
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
      unit: matchedEnquiry?.unitOfMeasure || 'Nos',
      rate: initRate,
      discountPercent: 0,
      taxPercent: initTax,
      amount: initAmount,
    },
  ]);

  // Commercials & Scope
  const [technicalSpecs, setTechnicalSpecs] = useState(
    matchedEnquiry?.specification ||
    (matchedLead?.capacity
      ? `Capacity: ${matchedLead.capacity} (${matchedLead.machineType || 'Industrial Equipment'}). ${matchedLead.requirementDescription || ''}`
      : '')
  );
  const [scopeOfSupply, setScopeOfSupply] = useState(
    matchedEnquiry?.machineProduct
      ? `Supply, fabrication, inspection and testing of ${matchedEnquiry.machineProduct} as per specifications.`
      : (matchedLead?.productName
        ? `Supply, fabrication, inspection and testing of ${matchedLead.productName} as per specifications.`
        : '')
  );
  const [exclusions, setExclusions] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(
    matchedEnquiry?.expectedDelivery
      ? (matchedEnquiry.expectedDelivery.startsWith('By') ? matchedEnquiry.expectedDelivery : `By ${matchedEnquiry.expectedDelivery}`)
      : (matchedLead?.expectedDelivery ? `By ${matchedLead.expectedDelivery}` : '')
  );
  const [warranty, setWarranty] = useState('');

  // Dynamic Terms and Conditions Lines
  const [termsList, setTermsList] = useState<string[]>(DEFAULT_TERMS);

  // Reliable Auto-Fill from Enquiry
  const isEnquiryPrefilledRef = React.useRef(false);
  useEffect(() => {
    if (matchedEnquiry && !isEnquiryPrefilledRef.current) {
      isEnquiryPrefilledRef.current = true;
      const q = Number(matchedEnquiry.quantity) || 1;
      const r = matchedEnquiry.budget ? Math.round(Number(matchedEnquiry.budget) / q) : 0;
      const tax = 18;
      const base = q * r;
      const amt = Math.round(base * (1 + tax / 100));

      setItems([
        {
          id: `item-enq-${Date.now()}`,
          productName: matchedEnquiry.machineProduct || matchedEnquiry.requirement || 'Industrial Machinery Equipment',
          description: [
            matchedEnquiry.capacity ? `Capacity: ${matchedEnquiry.capacity}` : '',
            matchedEnquiry.machineType ? `Type: ${matchedEnquiry.machineType}` : '',
            matchedEnquiry.materialGrade ? `MOC: ${matchedEnquiry.materialGrade}` : '',
            matchedEnquiry.specification || matchedEnquiry.requirement || '',
          ].filter(Boolean).join(' • '),
          quantity: q,
          unit: matchedEnquiry.unitOfMeasure || 'Nos',
          rate: r,
          discountPercent: 0,
          taxPercent: tax,
          amount: amt,
        },
      ]);

      if (matchedEnquiry.specification || matchedEnquiry.capacity || matchedEnquiry.materialGrade || matchedEnquiry.operatingConditions) {
        setTechnicalSpecs(
          [
            matchedEnquiry.capacity ? `Capacity / Rating: ${matchedEnquiry.capacity}` : '',
            matchedEnquiry.machineType ? `Machine Category: ${matchedEnquiry.machineType}` : '',
            matchedEnquiry.materialGrade ? `Material of Construction (MOC): ${matchedEnquiry.materialGrade}` : '',
            matchedEnquiry.operatingConditions ? `Operating Conditions: ${matchedEnquiry.operatingConditions}` : '',
            matchedEnquiry.technicalClarifications ? `Technical Clarifications: ${matchedEnquiry.technicalClarifications}` : '',
            matchedEnquiry.specification ? `Detailed Specifications:\n${matchedEnquiry.specification}` : '',
          ].filter(Boolean).join('\n')
        );
      }

      if (matchedEnquiry.machineProduct) {
        setScopeOfSupply(
          `Design, engineering, fabrication, inspection, testing and supply of ${matchedEnquiry.machineProduct} as per approved engineering drawings and specifications.`
        );
      }

      if (matchedEnquiry.expectedDelivery) {
        setDeliveryTime(matchedEnquiry.expectedDelivery.startsWith('By') ? matchedEnquiry.expectedDelivery : `By ${matchedEnquiry.expectedDelivery}`);
      }

      if (matchedCustomer) {
        setCustomerId(matchedCustomer.id);
      } else if (matchedEnquiry.customerId) {
        setCustomerId(matchedEnquiry.customerId);
      } else if (matchedEnquiry.customerName) {
        const found = customers.find(c => c.companyName.toLowerCase() === matchedEnquiry.customerName.toLowerCase());
        if (found) {
          setCustomerId(found.id);
        } else {
          setCustomerId(`cust-enq-${matchedEnquiry.id || 'direct'}`);
        }
      }
    }
  }, [matchedEnquiry, matchedCustomer, customers]);

  // Reliable Auto-Fill from Lead
  const isLeadPrefilledRef = React.useRef(false);
  useEffect(() => {
    if (matchedLead && !matchedEnquiry && !isLeadPrefilledRef.current) {
      isLeadPrefilledRef.current = true;
      const q = Number(matchedLead.quantity) || 1;
      const r = matchedLead.budget ? Math.round(Number(matchedLead.budget) / q) : 100000;
      const tax = 18;
      const base = q * r;
      const amt = Math.round(base * (1 + tax / 100));

      setItems([
        {
          id: 'item-lead',
          productName: matchedLead.productName || 'Industrial Machine Equipment',
          description:
            matchedLead.requirementDescription ||
            (matchedLead.capacity ? `Capacity: ${matchedLead.capacity}` : 'Standard machinery specifications'),
          quantity: q,
          unit: 'Set',
          rate: r,
          discountPercent: 0,
          taxPercent: tax,
          amount: amt,
        },
      ]);

      if (matchedLead.capacity || matchedLead.machineType || matchedLead.requirementDescription) {
        setTechnicalSpecs(
          `Capacity: ${matchedLead.capacity || 'Standard'} (${matchedLead.machineType || 'Industrial Equipment'}).\nSpecifications: ${matchedLead.requirementDescription || ''}`
        );
      }
      if (matchedLead.productName) {
        setScopeOfSupply(
          `Design, engineering, fabrication, inspection and testing of ${matchedLead.productName} as per specifications.`
        );
      }
      if (matchedLead.expectedDelivery) {
        setDeliveryTime(`Expected Delivery: ${matchedLead.expectedDelivery} (or 6-8 weeks from engineering approval)`);
      }
      if (matchedLead.convertedCustomerId) {
        setCustomerId(matchedLead.convertedCustomerId);
      }
    }
  }, [matchedLead, matchedEnquiry]);

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

  const addItem = (preset?: Partial<QuotationItem>) => {
    const qty = preset?.quantity ?? 1;
    const rate = preset?.rate ?? 0;
    const disc = preset?.discountPercent ?? 0;
    const tax = preset?.taxPercent ?? 18;
    const base = qty * rate * (1 - disc / 100);
    const amt = Math.round(base * (1 + tax / 100));

    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productName: preset?.productName || '',
        description: preset?.description || '',
        quantity: qty,
        unit: preset?.unit || 'Nos',
        rate,
        discountPercent: disc,
        taxPercent: tax,
        amount: amt,
      },
    ]);
  };

  const duplicateItem = (idx: number) => {
    const it = items[idx];
    setItems((prev) => [
      ...prev,
      {
        ...it,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productName: it.productName ? `${it.productName} (Copy)` : '',
      },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Terms and conditions handlers
  const handleTermChange = (idx: number, val: string) => {
    setTermsList((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const addTermLine = () => {
    setTermsList((prev) => [...prev, '']);
  };

  const removeTermLine = (idx: number) => {
    if (termsList.length <= 1) {
      setTermsList(['']);
      return;
    }
    setTermsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetDefaultTerms = () => {
    setTermsList(DEFAULT_TERMS);
  };

  const subTotal = items.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.rate || 0) * (1 - Number(item.discountPercent || 0) / 100)), 0);
  const totalTax = items.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.rate || 0) * (1 - Number(item.discountPercent || 0) / 100) * (Number(item.taxPercent || 0) / 100)), 0);
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

    const finalCustomerName = cust?.companyName || matchedEnquiry?.customerName || matchedLead?.companyName || 'Valued Customer';
    const finalContactPerson = cust?.contactPerson || matchedEnquiry?.contactPerson || matchedLead?.contactPerson || 'Purchase Head';
    const finalContactEmail = cust?.email || matchedEnquiry?.customerEmail || matchedLead?.email || '';
    const finalContactMobile = cust?.mobile || matchedEnquiry?.contactMobile || matchedLead?.mobile || '';

    const compiledTerms = termsList
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .join('\n');

    const created = addQuotation({
      currentRevision: 'Rev-00',
      date,
      validUntil,
      customerId: cust?.id || customerId || matchedEnquiry?.customerId || `CUST-${Date.now()}`,
      customerName: finalCustomerName,
      contactPerson: finalContactPerson,
      contactEmail: finalContactEmail,
      contactMobile: finalContactMobile,
      leadId: matchedLead?.id || prefillLeadId || undefined,
      enquiryId: prefillEnqId || matchedEnquiry?.id || undefined,
      latestSummary: {
        grandTotal,
        status: 'draft',
        machineProduct: items[0]?.productName || 'Industrial Process Equipment',
      },
      revisions: [
        {
          revisionNumber: 'Rev-00',
          date,
          preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
          items: items.map(it => ({
            ...it,
            quantity: Number(it.quantity) || 1,
            rate: Number(it.rate) || 0,
            discountPercent: Number(it.discountPercent) || 0,
            taxPercent: Number(it.taxPercent) || 18,
            amount: Number(it.amount) || 0,
          })),
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
          termsAndConditions: compiledTerms,
          status: 'draft',
        },
      ],
    });

    if (matchedLead) {
      const qNum = (created as any)?.quotationNumber || (created as any)?.quotationNo || created.id;
      updateLead(matchedLead.id, {
        status: 'quotation_sent',
        remarks: `Quotation ${qNum} generated (₹${grandTotal.toLocaleString('en-IN')})`,
      });
    }

    if (prefillEnqId || matchedEnquiry) {
      const targetEnqId = prefillEnqId || matchedEnquiry?.id;
      if (targetEnqId) {
        updateEnquiry(targetEnqId, {
          status: 'quotation_sent',
          quotationId: created.id,
        });
      }
    }

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
              Build formal machine quotation with line items, tax calculations, technical scope, and dynamic terms & conditions.
            </p>
          </div>
          <span className="px-3 py-1 bg-crm-brand-50 text-crm-brand-800 border border-crm-brand-200 font-mono font-bold rounded-lg text-xs">
            NEW REVISION: Rev-00
          </span>
        </div>

        {/* Enquiry Autofill Banner */}
        {matchedEnquiry && (
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-[#FAF7F2] to-amber-50 border border-purple-200 rounded-xl flex items-center justify-between text-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Generating Quotation for Enquiry: <span className="font-mono text-purple-800 font-extrabold">{matchedEnquiry.enquiryNo || matchedEnquiry.id}</span> — {matchedEnquiry.customerName}
                </span>
                <span className="text-[11px] text-[#70665F]">
                  Contact: {matchedEnquiry.contactPerson || 'N/A'} ({matchedEnquiry.contactMobile || 'N/A'}) • Machine: <strong className="text-slate-800">{matchedEnquiry.machineProduct}</strong> • Quantity: <strong className="text-slate-800">{matchedEnquiry.quantity} {matchedEnquiry.unitOfMeasure || 'Nos'}</strong>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#70665F] block">Enquiry Date</span>
              <span className="font-mono font-bold text-purple-700 text-xs">
                {formatDate(matchedEnquiry.enquiryDate)}
              </span>
            </div>
          </div>
        )}

        {/* Lead Autofill Banner (if no enquiry) */}
        {!matchedEnquiry && matchedLead && (
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
                  const custEnq = enquiries.find((enq) => enq.customerId === newCustId || enq.id === newCustId);
                  if (custLead || custEnq) {
                    const prodName = custEnq?.machineProduct || custLead?.productName;
                    const desc = custEnq?.specification || custEnq?.requirement || custLead?.requirementDescription;
                    const qty = Number(custEnq?.quantity || custLead?.quantity || 1);
                    const rate = custLead?.budget ? Math.round(Number(custLead.budget) / (qty || 1)) : 0;
                    const tax = 18;
                    const base = qty * rate;
                    const amt = Math.round(base * (1 + tax / 100));

                    if (prodName) {
                      setItems([
                        {
                          id: `item-${Date.now()}`,
                          productName: prodName,
                          description: desc || 'Standard technical specifications',
                          quantity: qty,
                          unit: custEnq?.unitOfMeasure || 'Nos',
                          rate,
                          discountPercent: 0,
                          taxPercent: tax,
                          amount: amt,
                        },
                      ]);
                      setScopeOfSupply(`Supply, fabrication, inspection and testing of ${prodName} as per specifications.`);
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-bold text-slate-900 dark:text-[#211B17]"
              >
                <option value="">-- Select Customer --</option>
                {!customers.some((c) => c.id === customerId) && (matchedEnquiry?.customerName || matchedLead?.companyName) && (
                  <option value={customerId || (matchedEnquiry?.customerId || `cust-enq-${matchedEnquiry?.id}` || matchedLead?.convertedCustomerId || 'cust-direct')}>
                    {matchedEnquiry?.customerName || matchedLead?.companyName} (From {matchedEnquiry ? 'Enquiry' : 'Lead'})
                  </option>
                )}
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.customerCode || c.id})
                  </option>
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

          {/* LINE ITEMS / MACHINERY TABLE */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45] flex items-center gap-2">
                  <span>Equipment / Machine Line Items</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-[#70665F] rounded-full text-[10px] font-mono font-bold">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </h3>
                <p className="text-[11px] text-[#70665F]">
                  Add multiple machinery lines with custom technical specifications, quantities, and GST rates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addItem()}
                  className="px-3 py-1.5 bg-[#FAF7F2] text-[#3E2723] hover:bg-[#F2ECE4] border border-[#E7DED5] rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Machine / Line Item</span>
                </button>
              </div>
            </div>

            {/* Quick Machinery Presets */}
            <div className="p-2.5 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl border border-dashed border-[#E7DED5] flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-[#70665F] flex items-center gap-1 mr-1">
                <Wrench className="w-3 h-3" /> Quick Add Machine:
              </span>
              {MACHINERY_PRESETS.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => addItem({
                    productName: preset.name,
                    description: preset.desc,
                    unit: preset.unit,
                    rate: preset.rate,
                    quantity: 1,
                    discountPercent: 0,
                    taxPercent: 18,
                  })}
                  className="px-2 py-1 bg-white hover:bg-[#F3ECE4] text-[#3E2723] border border-[#E7DED5] rounded-md text-[11px] font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
                >
                  + {preset.name}
                </button>
              ))}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-slate-50/50 dark:bg-[#FAF7F2]/30 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#3E2723] text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        Machine #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => duplicateItem(idx)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                        title="Duplicate this machine item"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30 transition cursor-pointer"
                        title="Remove machine item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-slate-600 font-semibold mb-1">Machine / Equipment Name *</label>
                      <input
                        type="text"
                        required
                        value={item.productName}
                        onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                        placeholder="e.g. 10 KL SS 316L Limpet Jacketed Reactor"
                        className="w-full px-3 py-1.5 bg-white dark:bg-white border rounded-lg font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Unit of Measure</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-white border rounded-lg font-mono"
                      >
                        <option value="Nos">Nos</option>
                        <option value="Set">Set</option>
                        <option value="Unit">Unit</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Lot">Lot</option>
                        <option value="MT">MT</option>
                        <option value="KG">KG</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Equipment Technical Specifications & Description</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Shell thk, dished ends, jacket/limpet design, agitator drive, motor rating, test pressure..."
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
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Technical Scope & Commercial Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Technical Specifications</label>
                <textarea
                  rows={2}
                  value={technicalSpecs}
                  onChange={(e) => setTechnicalSpecs(e.target.value)}
                  placeholder="e.g. Design Code: ASME Sec VIII Div 1. Hydro test: 12 Bar. Design Temp: 180°C..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Scope of Supply</label>
                <textarea
                  rows={2}
                  value={scopeOfSupply}
                  onChange={(e) => setScopeOfSupply(e.target.value)}
                  placeholder="e.g. Supply of complete equipment, motor, gearbox, accessories as per specifications..."
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
                  placeholder="e.g. 30% Advance, 60% ag. PI, 10% after Commissioning"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Delivery Schedule</label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="e.g. 8 to 10 Weeks from approved GA drawing"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Warranty Period</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="e.g. 18 Months from dispatch or 12 Months from commissioning"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC TERMS & CONDITIONS */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45] flex items-center gap-2">
                  <span>Terms & Conditions</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-[#70665F] rounded-full text-[10px] font-mono font-bold">
                    {termsList.filter(t => t.trim().length > 0).length} Clauses
                  </span>
                </h3>
                <p className="text-[11px] text-[#70665F]">
                  Customize conditions, add new clauses, or remove items. These will appear in the formal quotation document.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetDefaultTerms}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Reset to standard manufacturing terms"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={addTermLine}
                  className="px-3 py-1.5 bg-[#FAF7F2] text-[#3E2723] hover:bg-[#F2ECE4] border border-[#E7DED5] rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Line / Condition</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50/50 dark:bg-[#FAF7F2]/30 p-3.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
              {termsList.map((term, tIdx) => (
                <div key={tIdx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-[#EBE3DB] text-slate-700 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                    {tIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleTermChange(tIdx, e.target.value)}
                    placeholder={`Condition #${tIdx + 1} (e.g. Price Ex-Works, Delivery schedule, Inspection...)`}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-white border rounded-lg text-xs text-slate-800 font-medium focus:ring-1 focus:ring-crm-brand-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeTermLine(tIdx)}
                    disabled={termsList.length <= 1 && tIdx === 0}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30 transition cursor-pointer shrink-0"
                    title="Delete condition line"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={addTermLine}
                  className="w-full py-2 border-2 border-dashed border-[#E7DED5] hover:border-crm-brand-700 hover:bg-white text-crm-brand-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Line / Condition</span>
                </button>
              </div>
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
              className="px-6 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold shadow-md transition cursor-pointer active:scale-95"
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
