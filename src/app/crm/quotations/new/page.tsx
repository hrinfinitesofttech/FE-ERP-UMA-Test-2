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
  Sparkles,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { QuotationItem } from '../../../../types/crm';
import { formatCurrency, formatDate } from '../../../../lib/utils';

const DEFAULT_TERMS = [
  'Prices Ex-Works Makarpura, Vadodara. Freight extra at actuals.',
  'GST: 18% extra as applicable at the time of final invoicing / dispatch.',
  'Payment Terms: 30% advance along with order confirmation, balance 70% against proforma invoice before dispatch.',
  'Delivery Schedule: 6 to 8 weeks from date of technically and commercially clear purchase order and approved engineering drawings.',
  'Warranty: 12 months from the date of commissioning or 18 months from delivery against manufacturing defects.',
];

interface FormLineItem extends QuotationItem {
  descriptionLines: string[];
}

function QuotationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, enquiries, leads, quotations, addQuotation, currentUser, updateLead, updateEnquiry } = useERP();

  const prefillCustId = searchParams.get('customerId') || '';
  const prefillEnqId = searchParams.get('enquiryId') || '';
  const prefillLeadId = searchParams.get('leadId') || '';

  // Check if an inquiry already has a quotation
  const hasQuotationForEnquiry = (enq: any) => {
    if (!enq) return false;
    if (enq.quotationId) return true;
    if (enq.status === 'quotation_sent' || enq.status === 'converted_to_quotation' || enq.status === 'order_won') {
      return true;
    }
    const hasQ = (quotations || []).some(
      (q) =>
        (q.enquiryId && (q.enquiryId === enq.id || q.enquiryId === enq.enquiryNo)) ||
        ((q as any).enquiryNumber && (q as any).enquiryNumber === enq.enquiryNo)
    );
    return hasQ;
  };

  // Only show inquiries where quotation is pending (or matched from URL)
  const availableEnquiries = enquiries.filter((e) => {
    if (prefillEnqId && (e.id === prefillEnqId || e.enquiryNo === prefillEnqId)) return true;
    return !hasQuotationForEnquiry(e);
  });

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

  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>(
    matchedEnquiry?.id || prefillEnqId || ''
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    matchedLead?.id || prefillLeadId || matchedEnquiry?.leadId || ''
  );
  const [customerId, setCustomerId] = useState<string>(
    matchedCustomer?.id || prefillCustId || matchedEnquiry?.customerId || ''
  );

  const [contactPerson, setContactPerson] = useState<string>(
    matchedEnquiry?.contactPerson || matchedLead?.contactPerson || matchedCustomer?.contactPerson || ''
  );
  const [contactEmail, setContactEmail] = useState<string>(
    matchedEnquiry?.customerEmail || matchedLead?.email || matchedCustomer?.email || ''
  );
  const [contactMobile, setContactMobile] = useState<string>(
    (matchedEnquiry?.contactMobile && matchedEnquiry.contactMobile !== '9999999999' ? matchedEnquiry.contactMobile : '') ||
    (matchedLead?.mobile && matchedLead.mobile !== '9999999999' ? matchedLead.mobile : '') ||
    (matchedCustomer?.mobile && matchedCustomer.mobile !== '9999999999' ? matchedCustomer.mobile : '') || ''
  );

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Initial Item details
  const initProductName = matchedEnquiry?.machineProduct || matchedLead?.productName || '';
  const initDescLines = [
    matchedLead?.companyName ? `New lead registered for ${matchedLead.companyName} by ${matchedLead.contactPerson || 'sales'}` : '',
    matchedEnquiry?.specification || matchedLead?.requirementDescription || '',
    matchedEnquiry?.capacity ? `Capacity: ${matchedEnquiry.capacity}` : '',
    matchedEnquiry?.materialGrade ? `MOC: ${matchedEnquiry.materialGrade}` : '',
  ].filter(Boolean);

  const initQty = Number(matchedEnquiry?.quantity || matchedLead?.quantity || 1);
  const initRate = 0;
  const initTax = 18;
  const initBase = 0;
  const initAmount = 0;

  const [items, setItems] = useState<FormLineItem[]>([
    {
      id: 'item-1',
      productName: initProductName || 'General Inquiry / Process Equipment',
      description: initDescLines.join(' • '),
      descriptionLines: initDescLines.length > 0 ? initDescLines : ['Standard technical specifications'],
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

  // Dynamic Terms and Conditions Lines (Image 3)
  const [termsList, setTermsList] = useState<string[]>(DEFAULT_TERMS);

  // Handle Enquiry / Lead / Customer Selection from Dropdown
  const handleRecordSelect = (val: string) => {
    if (!val) {
      setSelectedEnquiryId('');
      setSelectedLeadId('');
      setCustomerId('');
      setContactPerson('');
      setContactEmail('');
      setContactMobile('');
      return;
    }

    if (val.startsWith('lead:')) {
      const lId = val.replace('lead:', '');
      const l = leads.find((lead) => lead.id === lId || lead.leadNo === lId);
      if (l) {
        setSelectedLeadId(l.id);
        setSelectedEnquiryId(l.convertedEnquiryId || '');
        setCustomerId(l.convertedCustomerId || '');
        setContactPerson(l.contactPerson || '');
        setContactEmail(l.email || '');
        setContactMobile(l.mobile && l.mobile !== '9999999999' ? l.mobile : '');

        const prodName = l.productName || l.machineType || 'Industrial Process Equipment';
        const lines: string[] = [];
        if (l.requirementDescription) lines.push(l.requirementDescription);
        if (l.capacity || l.machineType) {
          lines.push([l.capacity ? `Capacity: ${l.capacity}` : '', l.machineType ? `Type: ${l.machineType}` : ''].filter(Boolean).join(', '));
        }
        if (lines.length === 0) lines.push(`Standard proposal for ${l.companyName}`);

        setItems([
          {
            id: `item-lead-${Date.now()}`,
            productName: prodName,
            description: lines.join(' • '),
            descriptionLines: lines,
            quantity: Number(l.quantity) || 1,
            unit: 'Nos',
            rate: Number(l.budget) || 0,
            discountPercent: 0,
            taxPercent: 18,
            amount: Number(l.budget) || 0,
          },
        ]);
        setScopeOfSupply(`Design, fabrication, testing, and supply of ${prodName} as per specifications.`);
        if (l.expectedDelivery) {
          setDeliveryTime(l.expectedDelivery.startsWith('By') ? l.expectedDelivery : `By ${l.expectedDelivery}`);
        }
      }
    } else if (val.startsWith('enquiry:')) {
      const enqId = val.replace('enquiry:', '');
      const enq = enquiries.find((e) => e.id === enqId || e.enquiryNo === enqId);
      if (enq) {
        setSelectedEnquiryId(enq.id);
        setSelectedLeadId(enq.leadId || '');

        const l = enq.leadId ? leads.find((lead) => lead.id === enq.leadId || lead.leadNo === enq.leadId) : null;
        const cust = customers.find(
          (c) =>
            (enq.customerId && (c.id === enq.customerId || c.customerCode === enq.customerId)) ||
            (enq.customerName && c.companyName.toLowerCase() === enq.customerName.toLowerCase())
        );
        setCustomerId(cust?.id || enq.customerId || `cust-enq-${enq.id}`);

        setContactPerson(enq.contactPerson || l?.contactPerson || cust?.contactPerson || '');
        setContactEmail(enq.customerEmail || l?.email || cust?.email || '');
        setContactMobile(
          (enq.contactMobile && enq.contactMobile !== '9999999999' ? enq.contactMobile : '') ||
          (l?.mobile && l.mobile !== '9999999999' ? l.mobile : '') ||
          (cust?.mobile && cust.mobile !== '9999999999' ? cust.mobile : '') || ''
        );

        const prodName = enq.machineProduct || 'Process Equipment';
        const lines: string[] = [];
        if (enq.leadId) {
          if (l?.companyName) {
            lines.push(`New lead registered for ${l.companyName} by ${l.contactPerson || enq.contactPerson || 'sales'}`);
          }
        }
        if (enq.specification) {
          lines.push(enq.specification);
        }
        if (enq.capacity || enq.materialGrade || enq.machineType) {
          lines.push(
            [
              enq.capacity ? `Capacity: ${enq.capacity}` : '',
              enq.materialGrade ? `MOC: ${enq.materialGrade}` : '',
              enq.machineType ? `Type: ${enq.machineType}` : '',
            ].filter(Boolean).join(', ')
          );
        }
        if (lines.length === 0) {
          lines.push('Standard technical specifications');
        }

        const q = Number(enq.quantity) || 1;
        const r = 0;
        const tax = 18;
        const amt = 0;

        setItems([
          {
            id: `item-enq-${Date.now()}`,
            productName: prodName,
            description: lines.join(' • '),
            descriptionLines: lines,
            quantity: q,
            unit: enq.unitOfMeasure || 'Nos',
            rate: r,
            discountPercent: 0,
            taxPercent: tax,
            amount: amt,
          },
        ]);

        if (enq.specification || enq.capacity || enq.materialGrade || enq.operatingConditions) {
          setTechnicalSpecs(
            [
              enq.capacity ? `Capacity / Rating: ${enq.capacity}` : '',
              enq.machineType ? `Machine Category: ${enq.machineType}` : '',
              enq.materialGrade ? `Material of Construction (MOC): ${enq.materialGrade}` : '',
              enq.operatingConditions ? `Operating Conditions: ${enq.operatingConditions}` : '',
              enq.technicalClarifications ? `Technical Clarifications: ${enq.technicalClarifications}` : '',
              enq.specification || '',
            ].filter(Boolean).join('\n')
          );
        }

        setScopeOfSupply(
          `Design, engineering, fabrication, inspection, testing and supply of ${prodName} as per approved engineering drawings and specifications.`
        );

        if (enq.expectedDelivery) {
          setDeliveryTime(enq.expectedDelivery.startsWith('By') ? enq.expectedDelivery : `By ${enq.expectedDelivery}`);
        }
      }
    } else if (val.startsWith('customer:')) {
      const cId = val.replace('customer:', '');
      setSelectedEnquiryId('');
      setSelectedLeadId('');
      setCustomerId(cId);
      const cust = customers.find((c) => c.id === cId || c.customerCode === cId);
      if (cust) {
        setContactPerson(cust.contactPerson || '');
        setContactEmail(cust.email || '');
        setContactMobile(cust.mobile && cust.mobile !== '9999999999' ? cust.mobile : '');
      }
    }
  };

  // Sync if prefill enquiry or lead provided in URL
  useEffect(() => {
    if (prefillEnqId && !selectedEnquiryId) {
      handleRecordSelect(`enquiry:${prefillEnqId}`);
    } else if (prefillLeadId && !selectedLeadId) {
      handleRecordSelect(`lead:${prefillLeadId}`);
    }
  }, [prefillEnqId, prefillLeadId]);

  // Handle Line item numeric changes
  const handleItemChange = (idx: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;

    const qty = Number(updated[idx].quantity) || 1;
    const rate = Number(updated[idx].rate) || 0;
    const disc = Number(updated[idx].discountPercent) || 0;
    const tax = Number(updated[idx].taxPercent) || 0;

    const base = qty * rate * (1 - disc / 100);
    const amt = base * (1 + tax / 100);
    updated[idx].amount = Math.round(amt);

    setItems(updated);
  };

  // Add description line (Image 2)
  const addDescriptionLine = (itemIdx: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const curLines = updated[itemIdx].descriptionLines || [];
      const newLines = [...curLines, ''];
      updated[itemIdx] = {
        ...updated[itemIdx],
        descriptionLines: newLines,
        description: newLines.filter(Boolean).join(' • '),
      };
      return updated;
    });
  };

  // Remove description line (Image 2)
  const removeDescriptionLine = (itemIdx: number, lineIdx: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const curLines = updated[itemIdx].descriptionLines || [];
      const newLines = curLines.length <= 1 ? [''] : curLines.filter((_, i) => i !== lineIdx);
      updated[itemIdx] = {
        ...updated[itemIdx],
        descriptionLines: newLines,
        description: newLines.filter(Boolean).join(' • '),
      };
      return updated;
    });
  };

  // Update description line (Image 2)
  const handleDescriptionLineChange = (itemIdx: number, lineIdx: number, val: string) => {
    setItems((prev) => {
      const updated = [...prev];
      const curLines = [...(updated[itemIdx].descriptionLines || [''])];
      curLines[lineIdx] = val;
      updated[itemIdx] = {
        ...updated[itemIdx],
        descriptionLines: curLines,
        description: curLines.filter(Boolean).join(' • '),
      };
      return updated;
    });
  };

  // Add new Machine / Line Item (Image 2)
  const addItem = (preset?: Partial<QuotationItem>) => {
    const qty = preset?.quantity ?? 1;
    const rate = preset?.rate ?? 0;
    const disc = preset?.discountPercent ?? 0;
    const tax = preset?.taxPercent ?? 18;
    const base = qty * rate * (1 - disc / 100);
    const amt = Math.round(base * (1 + tax / 100));

    const defaultLines = preset?.description
      ? preset.description.split(' • ').map((s) => s.trim()).filter(Boolean)
      : ['Standard technical specifications'];

    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productName: preset?.productName || '',
        description: preset?.description || '',
        descriptionLines: defaultLines,
        quantity: qty,
        unit: preset?.unit || 'Nos',
        rate,
        discountPercent: disc,
        taxPercent: tax,
        amount: amt,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Terms and conditions handlers (Image 3)
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

  // Totals
  const subTotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 1) *
        Number(item.rate || 0) *
        (1 - Number(item.discountPercent || 0) / 100),
    0
  );
  const totalTax = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 1) *
        Number(item.rate || 0) *
        (1 - Number(item.discountPercent || 0) / 100) *
        (Number(item.taxPercent || 0) / 100),
    0
  );
  const grandTotal = Math.round(subTotal + totalTax);

  const selectedEnquiry =
    enquiries.find((e) => e.id === selectedEnquiryId || e.enquiryNo === selectedEnquiryId) ||
    matchedEnquiry;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    const activeLead = leads.find((l) => l.id === selectedLeadId || l.leadNo === selectedLeadId) || matchedLead;

    const finalCustomerName =
      selectedEnquiry?.customerName ||
      cust?.companyName ||
      activeLead?.companyName ||
      'Valued Customer';
    const finalContactPerson =
      contactPerson.trim() ||
      selectedEnquiry?.contactPerson ||
      cust?.contactPerson ||
      activeLead?.contactPerson ||
      'Purchase Head';
    const finalContactEmail =
      contactEmail.trim() ||
      selectedEnquiry?.customerEmail ||
      cust?.email ||
      activeLead?.email ||
      '';
    const finalContactMobile =
      contactMobile.trim() ||
      selectedEnquiry?.contactMobile ||
      cust?.mobile ||
      activeLead?.mobile ||
      '';

    const compiledTerms = termsList
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .join('\n');

    const created = addQuotation({
      currentRevision: 'Rev-00',
      date,
      validUntil,
      customerId: cust?.id || customerId || selectedEnquiry?.customerId || `CUST-${Date.now()}`,
      customerName: finalCustomerName,
      contactPerson: finalContactPerson,
      contactEmail: finalContactEmail,
      contactMobile: finalContactMobile,
      leadId: selectedLeadId || selectedEnquiry?.leadId || activeLead?.id || prefillLeadId || undefined,
      enquiryId: selectedEnquiry?.id || prefillEnqId || matchedEnquiry?.id || undefined,
      latestSummary: {
        grandTotal,
        status: 'draft',
        machineProduct: items[0]?.productName || selectedEnquiry?.machineProduct || activeLead?.productName || 'Industrial Process Equipment',
      },
      revisions: [
        {
          revisionNumber: 'Rev-00',
          date,
          preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
          items: items.map((it) => ({
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

    // Update enquiry so it will not appear in pending inquiries anymore
    const activeEnquiryId = selectedEnquiry?.id || prefillEnqId || matchedEnquiry?.id;
    if (activeEnquiryId) {
      try {
        updateEnquiry(activeEnquiryId, {
          status: 'quotation_sent',
          quotationId: created.id,
        });
      } catch (_) {}
    }

    // Update lead if linked
    const activeLeadId = selectedEnquiry?.leadId || matchedLead?.id;
    if (activeLeadId) {
      const qNum = (created as any)?.quotationNumber || (created as any)?.quotationNo || created.id;
      try {
        updateLead(activeLeadId, {
          status: 'quotation_sent',
          remarks: `Quotation ${qNum} generated (₹${grandTotal.toLocaleString('en-IN')})`,
        });
      } catch (_) {}
    }

    router.push(`/crm/quotations/${created.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 text-xs pb-10">
      <Link
        href="/crm/quotations"
        className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:underline font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Quotations
      </Link>

      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-[#EBE3DB] pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
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

        {/* Selected Enquiry Autofill Banner */}
        {selectedEnquiry && (
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-[#FAF7F2] to-amber-50 border border-purple-200 rounded-xl flex items-center justify-between text-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Quotation for Enquiry: <span className="font-mono text-purple-800 font-extrabold">{selectedEnquiry.enquiryNo || selectedEnquiry.id}</span> — {selectedEnquiry.customerName}
                </span>
                <span className="text-[11px] text-[#70665F]">
                  Contact: {selectedEnquiry.contactPerson || 'N/A'} ({selectedEnquiry.contactMobile || 'N/A'}) • Machine: <strong className="text-slate-800">{selectedEnquiry.machineProduct}</strong> • Quantity: <strong className="text-slate-800">{selectedEnquiry.quantity || 1} {selectedEnquiry.unitOfMeasure || 'Nos'}</strong>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#70665F] block">Enquiry Date</span>
              <span className="font-mono font-bold text-purple-700 text-xs">
                {formatDate(selectedEnquiry.enquiryDate)}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* HEADER METADATA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#544B45] font-semibold mb-1">
                Select Customer / Technical Inquiry <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={
                  selectedEnquiryId
                    ? `enquiry:${selectedEnquiryId}`
                    : selectedLeadId
                    ? `lead:${selectedLeadId}`
                    : customerId
                    ? `customer:${customerId}`
                    : ''
                }
                onChange={(e) => handleRecordSelect(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-bold text-[#211B17] focus:outline-none focus:border-crm-brand-700"
              >
                <option value="">-- Select Pending Inquiry, Lead, or Customer --</option>

                {/* 1. Inquiries with pending quotation */}
                {availableEnquiries.length > 0 ? (
                  <optgroup label="Pending Technical Inquiries (Quotation Needed)">
                    {availableEnquiries.map((enq) => (
                      <option key={`enq-${enq.id}`} value={`enquiry:${enq.id}`}>
                        {enq.customerName} — {enq.enquiryNo || enq.id} ({enq.machineProduct})
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <optgroup label="Pending Technical Inquiries">
                    <option value="" disabled>No pending inquiries</option>
                  </optgroup>
                )}

                {/* 2. Direct Leads with contact & requirements */}
                {leads.length > 0 && (
                  <optgroup label="Active CRM Leads (Direct Quotation)">
                    {leads.map((l) => (
                      <option key={`lead-${l.id}`} value={`lead:${l.id}`}>
                        {l.companyName} — {l.leadNo || l.id} ({l.productName || l.email || 'Lead'})
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* 3. Direct Registered Customers */}
                {customers.length > 0 && (
                  <optgroup label="Registered Customer Accounts">
                    {customers.map((c) => (
                      <option key={`cust-${c.id}`} value={`customer:${c.id}`}>
                        {c.companyName} ({c.customerCode || c.id})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[#544B45] font-semibold mb-1">Quotation Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono font-medium text-[#211B17]"
              />
            </div>

            <div>
              <label className="block text-[#544B45] font-semibold mb-1">Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono font-medium text-[#211B17]"
              />
            </div>
          </div>

          {/* RECIPIENT & CONTACT DETAILS CARD */}
          <div className="p-4 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#211B17] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-crm-brand-700" />
                Quotation Recipient & Contact Details (Email Dispatch Target)
              </span>
              {contactEmail ? (
                <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Email Linked: {contactEmail}
                </span>
              ) : (
                <span className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                  ⚠️ Please enter recipient email ID
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#70665F]" /> Attention / Contact Person
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg font-medium text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#70665F]" />
                  Recipient Email ID (Quotation will be sent here) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. client@company.com"
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg font-medium text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#70665F]" /> Contact Mobile Number
                </label>
                <input
                  type="tel"
                  value={contactMobile}
                  onChange={(e) => setContactMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg font-medium text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                />
              </div>
            </div>
          </div>

          {/* LINE ITEMS / MACHINERY TABLE (Image 2) */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-[#211B17]">
              Equipment / Machine Line Items
            </h3>

            {/* Items List */}
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-[#EBE3DB] bg-white space-y-4 shadow-xs"
                >
                  {/* Machine Name & Add Machine button */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#4A3B32]">
                        Machine / Item Name * (#{idx + 1})
                      </label>
                      <button
                        type="button"
                        onClick={() => addItem()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#FAF7F2] text-[#3E2723] border border-[#E7DED5] rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Machine</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={item.productName}
                        onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                        placeholder="e.g. 10 KL SS 316L Limpet Jacketed Reactor"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E7DED5] rounded-xl text-xs font-bold text-[#211B17] focus:outline-none focus:border-[#3E2723]"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                          title="Remove Machine Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Item Technical Description with + Add Line */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#4A3B32]">
                        Item Technical Description
                      </label>
                      <button
                        type="button"
                        onClick={() => addDescriptionLine(idx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#3E2723] bg-white hover:bg-[#FAF7F2] border border-[#E7DED5] rounded-lg transition shadow-2xs cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Line</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(item.descriptionLines && item.descriptionLines.length > 0
                        ? item.descriptionLines
                        : ['']
                      ).map((line, lineIdx) => (
                        <div key={lineIdx} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#70665F] w-4 shrink-0 font-mono">
                            {lineIdx + 1}.
                          </span>
                          <input
                            type="text"
                            value={line}
                            onChange={(e) =>
                              handleDescriptionLineChange(idx, lineIdx, e.target.value)
                            }
                            placeholder={
                              lineIdx === 0
                                ? 'Standard technical specifications'
                                : 'Shell thk, dish ends, agitator drive, motor rating...'
                            }
                            className="w-full px-3.5 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#3E2723]"
                          />
                          <button
                            type="button"
                            onClick={() => removeDescriptionLine(idx, lineIdx)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg transition shrink-0 cursor-pointer"
                            title="Remove Line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantity, Unit Rate, Discount %, GST %, Total Amount */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            'quantity',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs font-mono font-bold text-[#211B17]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                        Unit Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            'rate',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs font-mono font-bold text-[#211B17]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                        Discount %
                      </label>
                      <input
                        type="number"
                        value={item.discountPercent}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            'discountPercent',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs font-mono text-[#211B17]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                        GST %
                      </label>
                      <select
                        value={item.taxPercent}
                        onChange={(e) =>
                          handleItemChange(idx, 'taxPercent', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs font-semibold text-[#211B17]"
                      >
                        <option value={18}>18% GST</option>
                        <option value={12}>12% GST</option>
                        <option value={5}>5% GST</option>
                        <option value={0}>0% GST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#70665F] mb-1">
                        Total Amount (₹)
                      </label>
                      <div className="w-full px-3 py-2 bg-[#E8F5E9]/60 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 font-mono flex items-center">
                        ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Taxable Subtotal & Grand Total Summary Bar (Image 3) */}
            <div className="p-4 bg-[#FAF7F2] border border-[#EBE3DB] rounded-2xl flex items-center justify-between flex-wrap gap-4">
              <div className="text-xs text-[#70665F]">
                <span>Taxable Subtotal: </span>
                <strong className="text-[#211B17] font-mono">₹{subTotal.toLocaleString('en-IN')}</strong>
                <span className="mx-2">•</span>
                <span>Total Tax: </span>
                <strong className="text-[#211B17] font-mono">₹{totalTax.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-xs text-[#70665F] font-bold mr-2">Grand Total:</span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* TERMS & CONDITIONS (Image 3) */}
          <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#211B17]">
                Terms & Conditions
              </h3>
              <button
                type="button"
                onClick={addTermLine}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#FAF7F2] text-[#3E2723] border border-[#E7DED5] rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add New</span>
              </button>
            </div>

            <div className="space-y-2">
              {termsList.map((term, tIdx) => (
                <div key={tIdx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#70665F] w-4 shrink-0 font-mono">
                    {tIdx + 1}.
                  </span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleTermChange(tIdx, e.target.value)}
                    placeholder="Enter term or condition..."
                    className="w-full px-3.5 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#3E2723]"
                  />
                  <button
                    type="button"
                    onClick={() => removeTermLine(tIdx)}
                    className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg transition shrink-0 cursor-pointer"
                    title="Remove Term"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER ACTIONS (Image 3) */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBE3DB]">
            <Link
              href="/crm/quotations"
              className="px-5 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#3E2723] hover:bg-[#2A1810] text-white rounded-xl font-bold transition text-xs shadow-xs active:scale-95 cursor-pointer"
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
