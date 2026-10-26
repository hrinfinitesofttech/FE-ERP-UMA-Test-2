'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useERP } from '../../../../../context/ERPContext';
import {
  ERPFormLayout,
  ERPFormSection,
  ERPFormGrid,
  ERPInput,
  ERPSelect,
  ERPSubTableCard,
} from '../../../../../components/ui/ERPFormLayout';
import {
  Trash2,
  X,
  Building2,
  Copy,
  Truck,
  Landmark,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

interface AddressItem {
  id: string;
  addressType: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

interface ContactItem {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
}

export default function EditCustomerMasterPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const { customers, updateCustomer, employees, availableEmployees } = useERP();

  const allStaff =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  const decodedId = decodeURIComponent(String(customerId || '')).trim();
  const currentCustomer = customers.find(
    (c) =>
      c.id === decodedId ||
      c.customerCode === decodedId ||
      c.id?.toLowerCase() === decodedId.toLowerCase() ||
      c.customerCode?.toLowerCase() === decodedId.toLowerCase()
  );

  const [formData, setFormData] = useState({
    customerCode: '',
    companyName: '',
    customerType: 'company' as 'company' | 'individual',
    industry: '',
    category: 'standard' as 'platinum' | 'gold' | 'silver' | 'standard',
    currency: '₹ Indian rupee',
    website: '',
    assignedSalesPerson: '',

    // Primary Contact Person
    contactPerson: '',
    designation: '',
    mobile: '',
    whatsapp: '',
    email: '',

    // Tax & Statutory Compliance
    gstin: '',
    pan: '',
    tan: '',
    msmeNumber: '',
    taxCategory: 'regular' as 'regular' | 'sez_with_duty' | 'sez_without_duty' | 'export' | 'composite',

    // Banking & Financial Details
    bankName: '',
    bankAccountNo: '',
    bankAccountName: '',
    bankIfsc: '',
    bankBranch: '',

    // Commercial & Credit Terms
    paymentTerms: '',
    creditPeriodDays: 0,
    creditLimit: 0,

    // Primary Billing & Shipping
    billingAddress: '',
    shippingAddress: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',

    // Logistics & Engineering / Project Specifics
    nearestPortRailway: '',
    inspectionRequirements: '',
    specialInstructions: '',
    linkedLeadId: '',
  });

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    addressType: 'Plant / Site Delivery Address',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [showContactModal, setShowContactModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    designation: '',
    mobile: '',
    email: '',
  });

  useEffect(() => {
    if (currentCustomer) {
      const anyCust = currentCustomer as any;
      setFormData({
        customerCode: currentCustomer.customerCode || anyCust.customer_code || currentCustomer.id || '',
        companyName: currentCustomer.companyName || anyCust.company_name || '',
        customerType: currentCustomer.customerType || anyCust.customer_type || 'company',
        industry: currentCustomer.industry || '',
        category: (currentCustomer.category as any) || 'standard',
        currency: currentCustomer.currency || '₹ Indian rupee',
        website: currentCustomer.website || '',
        assignedSalesPerson: currentCustomer.assignedSalesPerson || anyCust.assigned_sales_person || '',

        contactPerson: currentCustomer.contactPerson || anyCust.contact_person || '',
        designation: currentCustomer.designation || '',
        mobile: currentCustomer.mobile || '',
        whatsapp: currentCustomer.whatsapp || '',
        email: currentCustomer.email || '',

        gstin: currentCustomer.gstin || '',
        pan: currentCustomer.pan || '',
        tan: currentCustomer.tan || '',
        msmeNumber: currentCustomer.msmeNumber || anyCust.msme_number || '',
        taxCategory: currentCustomer.taxCategory || anyCust.tax_category || 'regular',

        bankName: currentCustomer.bankName || anyCust.bank_name || '',
        bankAccountNo: currentCustomer.bankAccountNo || anyCust.bank_account_no || '',
        bankAccountName: currentCustomer.bankAccountName || anyCust.bank_account_name || '',
        bankIfsc: currentCustomer.bankIfsc || anyCust.bank_ifsc || '',
        bankBranch: currentCustomer.bankBranch || anyCust.bank_branch || '',

        paymentTerms: currentCustomer.paymentTerms || anyCust.payment_terms || '',
        creditPeriodDays: currentCustomer.creditPeriodDays !== undefined ? Number(currentCustomer.creditPeriodDays) : (anyCust.credit_period_days !== undefined ? Number(anyCust.credit_period_days) : 0),
        creditLimit: currentCustomer.creditLimit !== undefined ? Number(currentCustomer.creditLimit) : (anyCust.credit_limit !== undefined ? Number(anyCust.credit_limit) : 0),

        billingAddress: currentCustomer.billingAddress || anyCust.billing_address || anyCust.address || '',
        shippingAddress: currentCustomer.shippingAddress || anyCust.shipping_address || '',
        city: currentCustomer.city || '',
        state: currentCustomer.state || '',
        country: currentCustomer.country || 'India',
        pincode: currentCustomer.pincode || '',

        nearestPortRailway: currentCustomer.nearestPortRailway || anyCust.nearest_port_railway || '',
        inspectionRequirements: currentCustomer.inspectionRequirements || anyCust.inspection_requirements || '',
        specialInstructions: currentCustomer.specialInstructions || anyCust.special_instructions || '',
        linkedLeadId: currentCustomer.linkedLeadId || anyCust.linked_lead_id || '',
      });

      if (currentCustomer.billingAddress) {
        setAddresses([
          {
            id: 'CADDR-1',
            addressType: 'Registered Billing Address',
            addressLine: currentCustomer.billingAddress,
            city: currentCustomer.city || 'Vadodara',
            state: currentCustomer.state || 'Gujarat',
            pincode: currentCustomer.pincode || '',
          },
        ]);
      }

      if (currentCustomer.contactPerson) {
        setContacts([
          {
            id: 'CCON-1',
            name: currentCustomer.contactPerson,
            designation: currentCustomer.designation || 'Primary Contact',
            mobile: currentCustomer.mobile || '',
            email: currentCustomer.email || '',
          },
        ]);
      }
    }
  }, [currentCustomer]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSummary, setErrorSummary] = useState('');

  // Auto extract PAN from 15-digit GSTIN (Characters 3 to 12)
  const handleGstinChange = (gstinVal: string) => {
    const clean = gstinVal.toUpperCase().trim();
    const updates: Partial<typeof formData> = { gstin: clean };
    if (clean.length === 15) {
      const extractedPan = clean.substring(2, 12);
      if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(extractedPan)) {
        updates.pan = extractedPan;
      }
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleCopyBillingToShipping = () => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: prev.billingAddress,
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      errs.companyName = 'Company / Client Name is required.';
    }
    if (!formData.contactPerson.trim()) {
      errs.contactPerson = 'Primary Contact Person is required.';
    }
    if (!formData.mobile.trim()) {
      errs.mobile = 'Primary Mobile Number is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.addressLine.trim()) return;
    setAddresses((prev) => [
      ...prev,
      {
        id: `CADDR-${Date.now().toString().slice(-4)}`,
        ...newAddr,
      },
    ]);
    setShowAddressModal(false);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.mobile.trim()) return;
    setContacts((prev) => [
      ...prev,
      {
        id: `CCON-${Date.now().toString().slice(-4)}`,
        ...newContact,
      },
    ]);
    setShowContactModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSummary('');
    if (!validate()) {
      setErrorSummary('Please resolve the highlighted fields before saving.');
      return;
    }

    if (!currentCustomer) return;

    setIsSubmitting(true);
    try {
      const primaryAddr = addresses[0];

      updateCustomer(currentCustomer.id, {
        customerType: formData.customerType,
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        category: formData.category,
        currency: formData.currency,
        website: formData.website.trim() || undefined,
        assignedSalesPerson: formData.assignedSalesPerson,

        contactPerson: formData.contactPerson.trim(),
        designation: formData.designation.trim() || 'Managing Director',
        mobile: formData.mobile.trim(),
        whatsapp: formData.whatsapp.trim() || undefined,
        email: formData.email.trim(),

        gstin: formData.gstin.toUpperCase().trim(),
        pan: formData.pan.toUpperCase().trim(),
        tan: formData.tan.toUpperCase().trim() || undefined,
        msmeNumber: formData.msmeNumber.trim() || undefined,
        taxCategory: formData.taxCategory,

        bankName: formData.bankName.trim() || undefined,
        bankAccountNo: formData.bankAccountNo.trim() || undefined,
        bankAccountName: formData.bankAccountName.trim() || undefined,
        bankIfsc: formData.bankIfsc.toUpperCase().trim() || undefined,
        bankBranch: formData.bankBranch.trim() || undefined,

        paymentTerms: formData.paymentTerms,
        creditPeriodDays: Number(formData.creditPeriodDays) || 30,
        creditLimit: Number(formData.creditLimit) || 0,

        billingAddress: primaryAddr?.addressLine || formData.billingAddress,
        shippingAddress: formData.shippingAddress || primaryAddr?.addressLine || formData.billingAddress,
        city: primaryAddr?.city || formData.city,
        state: primaryAddr?.state || formData.state,
        country: formData.country || 'India',
        pincode: primaryAddr?.pincode || formData.pincode,

        nearestPortRailway: formData.nearestPortRailway.trim() || undefined,
        inspectionRequirements: formData.inspectionRequirements.trim() || undefined,
        specialInstructions: formData.specialInstructions.trim() || undefined,
      });

      setTimeout(() => {
        router.push('/crm/customers?updated=' + encodeURIComponent(formData.companyName));
      }, 300);
    } catch (err: any) {
      console.error(err);
      setErrorSummary(err?.message || 'Failed to update customer record.');
      setIsSubmitting(false);
    }
  };

  if (!currentCustomer) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Customer Not Found</h2>
        <p className="text-xs text-slate-500">The requested customer record does not exist or was deleted.</p>
        <button
          type="button"
          onClick={() => router.push('/crm/customers')}
          className="px-4 py-2 bg-[#75401F] text-white rounded-lg text-xs font-bold"
        >
          Back to Customer Master
        </button>
      </div>
    );
  }

  return (
    <ERPFormLayout
      breadcrumbs={['DASHBOARD', 'CRM', 'CUSTOMER MASTER', 'UPDATE']}
      actionTitle="UPDATE"
      backHref="/crm/customers"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Update Customer Master"
      errorSummary={errorSummary}
    >
      {/* 1. Company Profile & Commercial Classification */}
      <ERPFormSection number="1." title="Company Profile & Classification" defaultExpanded={true}>
        <ERPFormGrid>
          <ERPInput
            label="Customer Code"
            value={formData.customerCode}
            disabled
          />

          <ERPInput
            label="Company / Client Name"
            required
            value={formData.companyName}
            onChange={(e) => {
              setFormData({ ...formData, companyName: e.target.value });
              if (errors.companyName) setErrors({ ...errors, companyName: '' });
            }}
            placeholder="Enter Company Name"
            error={errors.companyName}
          />

          <ERPSelect
            label="Customer Type"
            required
            value={formData.customerType}
            onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
            options={[
              { label: 'Private Limited / Corporate Enterprise', value: 'company' },
              { label: 'Public Limited / PSU / Government', value: 'company' },
              { label: 'Partnership / LLP Firm', value: 'company' },
              { label: 'Proprietorship / Individual', value: 'individual' },
            ]}
          />

          <ERPSelect
            label="Industry Sector"
            required
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            options={[
              { label: 'Heavy Engineering & Fabrication', value: 'Heavy Engineering & Fabrication' },
              { label: 'Chemical & Petrochemical', value: 'Chemical & Petrochemical' },
              { label: 'Pharmaceutical & Cleanroom', value: 'Pharmaceutical & Cleanroom' },
              { label: 'Food & Beverage Equipment', value: 'Food & Beverage Equipment' },
              { label: 'Oil, Gas & Energy', value: 'Oil, Gas & Energy' },
              { label: 'Power & Infrastructure', value: 'Power & Infrastructure' },
              { label: 'Dairy & Agro Processing', value: 'Dairy & Agro Processing' },
            ]}
          />

          <ERPSelect
            label="Tier Category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            options={[
              { label: 'Standard Client', value: 'standard' },
              { label: 'Silver Priority', value: 'silver' },
              { label: 'Gold Key Account', value: 'gold' },
              { label: 'Platinum Elite Partner', value: 'platinum' },
            ]}
          />

          <ERPSelect
            label="Billing Currency"
            required
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={[
              { label: '₹ Indian Rupee (INR)', value: '₹ Indian rupee' },
              { label: '$ US Dollar (USD)', value: '$ US Dollar' },
              { label: '€ Euro (EUR)', value: '€ Euro' },
              { label: '£ British Pound (GBP)', value: '£ British Pound' },
              { label: 'AED UAE Dirham', value: 'AED' },
            ]}
          />

          <ERPInput
            label="Company Website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://clientdomain.com"
          />

          <ERPInput
            label="Assigned Sales Engineer"
            value={formData.assignedSalesPerson}
            onChange={(e) => setFormData({ ...formData, assignedSalesPerson: e.target.value })}
            placeholder="Sales Engineer Name"
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* 2. Primary Contact Person Details */}
      <ERPFormSection number="2." title="Primary Contact Person" defaultExpanded={true}>
        <ERPFormGrid>
          <ERPInput
            label="Contact Person Name"
            required
            value={formData.contactPerson}
            onChange={(e) => {
              setFormData({ ...formData, contactPerson: e.target.value });
              if (errors.contactPerson) setErrors({ ...errors, contactPerson: '' });
            }}
            placeholder="Full Name of Primary Contact"
            error={errors.contactPerson}
          />

          <ERPInput
            label="Designation / Role"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="e.g. Managing Director / Purchase Head"
          />

          <ERPInput
            label="Mobile Number"
            required
            value={formData.mobile}
            onChange={(e) => {
              setFormData({ ...formData, mobile: e.target.value });
              if (errors.mobile) setErrors({ ...errors, mobile: '' });
            }}
            placeholder="10-digit mobile number"
            error={errors.mobile}
          />

          <ERPInput
            label="WhatsApp Number"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            placeholder="WhatsApp number"
          />

          <ERPInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@clientdomain.com"
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* 3. Tax, Statutory & Compliance Details */}
      <ERPFormSection
        number="3."
        title="Tax, Statutory & Compliance Details"
        subtitle="GSTIN, PAN, TAN & MSME Registration"
        defaultExpanded={true}
      >
        <ERPFormGrid>
          <ERPInput
            label="GSTIN Number (15 Digits)"
            value={formData.gstin}
            onChange={(e) => handleGstinChange(e.target.value)}
            placeholder="e.g. 24AAACU1234A1Z5"
            error={errors.gstin}
          />

          <ERPInput
            label="Permanent Account Number (PAN)"
            value={formData.pan}
            onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase().trim() })}
            placeholder="e.g. AAACU1234A"
          />

          <ERPInput
            label="TAN Number (Tax Deduction Account)"
            value={formData.tan}
            onChange={(e) => setFormData({ ...formData, tan: e.target.value.toUpperCase().trim() })}
            placeholder="e.g. AHMA12345B"
          />

          <ERPInput
            label="UDYAM / MSME Registration No."
            value={formData.msmeNumber}
            onChange={(e) => setFormData({ ...formData, msmeNumber: e.target.value.trim() })}
            placeholder="e.g. UDYAM-GJ-01-0012345"
          />

          <ERPSelect
            label="Tax Category"
            value={formData.taxCategory}
            onChange={(e) => setFormData({ ...formData, taxCategory: e.target.value as any })}
            options={[
              { label: 'Regular Taxpayer (Interstate / Intrastate GST)', value: 'regular' },
              { label: 'SEZ Unit (With Payment of Duty)', value: 'sez_with_duty' },
              { label: 'SEZ Unit (Without Payment of Duty under LUT)', value: 'sez_without_duty' },
              { label: 'Export of Goods / Deemed Export', value: 'export' },
              { label: 'Composition Scheme Dealer', value: 'composite' },
            ]}
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* 4. Banking & Financial Details */}
      <ERPFormSection
        number="4."
        title="Banking & Financial Details"
        subtitle="Customer Bank Details for Invoicing & Payments"
        defaultExpanded={true}
      >
        <ERPFormGrid>
          <ERPInput
            label="Bank Name"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            placeholder="e.g. State Bank of India, HDFC Bank, ICICI Bank"
          />

          <ERPInput
            label="Bank Account Number"
            value={formData.bankAccountNo}
            onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value.trim() })}
            placeholder="e.g. 50200012345678"
          />

          <ERPInput
            label="Account / Beneficiary Name"
            value={formData.bankAccountName}
            onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
            placeholder="e.g. Reliance Industries Limited"
          />

          <ERPInput
            label="IFSC Code"
            value={formData.bankIfsc}
            onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase().trim() })}
            placeholder="e.g. SBIN0001234 / HDFC0001234"
          />

          <ERPInput
            label="Bank Branch & City"
            value={formData.bankBranch}
            onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
            placeholder="e.g. Makarpura GIDC Branch, Vadodara"
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* 5. Commercial, Credit & Payment Terms */}
      <ERPFormSection
        number="5."
        title="Commercial, Credit & Payment Terms"
        defaultExpanded={true}
      >
        <ERPFormGrid>
          <ERPSelect
            label="Payment Terms"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            options={[
              { label: '100% Advance Payment', value: '100% Advance' },
              { label: '30 Days Net Credit', value: '30 Days Credit' },
              { label: '45 Days Net Credit', value: '45 Days Credit' },
              { label: '60 Days Net Credit', value: '60 Days Credit' },
              { label: '50% Advance & 50% Against Proforma Before Dispatch', value: '50% Advance & Balance Before Dispatch' },
              { label: 'Letter of Credit (LC) at Sight', value: 'Letter of Credit' },
              { label: 'Cash Against Delivery (CAD)', value: 'Against Delivery' },
            ]}
          />

          <ERPInput
            label="Credit Period (in Days)"
            type="number"
            value={formData.creditPeriodDays}
            onChange={(e) => setFormData({ ...formData, creditPeriodDays: Number(e.target.value) })}
            placeholder="e.g. 30"
          />

          <ERPInput
            label="Approved Credit Limit (₹)"
            type="number"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
            placeholder="e.g. 1000000"
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* 6. Addresses & Logistics Details */}
      <ERPFormSection
        number="6."
        title="Addresses & Logistics / Delivery Details"
        subtitle="Billing, Factory / Site Shipping & Nearest Freight Hub"
        defaultExpanded={true}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Billing Address Card */}
            <div className="p-4 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl space-y-3">
              <span className="text-xs font-bold text-[#211B17] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#75401F]" />
                Registered Billing Address
              </span>
              <textarea
                rows={2}
                value={formData.billingAddress}
                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                placeholder="Plot No., Industrial Area, Street Name..."
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:border-[#7C3AED]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="p-4 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#211B17] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#75401F]" />
                  Shipping / Site Delivery Address
                </span>
                <button
                  type="button"
                  onClick={handleCopyBillingToShipping}
                  className="text-[11px] font-bold text-[#75401F] hover:text-[#5C3218] flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#E7DED5] cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Same as Billing</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                placeholder="Plant site, Delivery Gate No., Project Site address..."
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:border-[#7C3AED]"
              />
              <div className="pt-1">
                <input
                  type="text"
                  value={formData.nearestPortRailway}
                  onChange={(e) => setFormData({ ...formData, nearestPortRailway: e.target.value })}
                  placeholder="Nearest Port / Railway Freight Station (e.g. Kandla, Mundra, Vadodara)"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Sub-records: Extra Delivery Sites / Extra Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
            <ERPSubTableCard
              title="Additional Delivery Plant Sites"
              onAdd={() => setShowAddressModal(true)}
              addLabel="+ Add Site Address"
              isEmpty={addresses.length === 0}
              emptyText="No additional sites added"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-bold">
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Address</th>
                      <th className="py-2 px-3">City</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {addresses.map((a) => (
                      <tr key={a.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2 px-3 font-semibold text-[#1E293B]">{a.addressType}</td>
                        <td className="py-2 px-3 text-[#475569]">{a.addressLine}</td>
                        <td className="py-2 px-3 text-[#475569]">{a.city}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setAddresses(addresses.filter((x) => x.id !== a.id))}
                            className="p-1 text-[#EF4444] hover:bg-rose-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ERPSubTableCard>

            <ERPSubTableCard
              title="Additional Contact Persons (Accounts, Plant, QC)"
              onAdd={() => setShowContactModal(true)}
              addLabel="+ Add Contact"
              isEmpty={contacts.length === 0}
              emptyText="No additional contacts added"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-bold">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Designation</th>
                      <th className="py-2 px-3">Mobile</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {contacts.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2 px-3 font-semibold text-[#1E293B]">{c.name}</td>
                        <td className="py-2 px-3 text-[#475569]">{c.designation}</td>
                        <td className="py-2 px-3 text-[#475569]">{c.mobile}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setContacts(contacts.filter((x) => x.id !== c.id))}
                            className="p-1 text-[#EF4444] hover:bg-rose-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ERPSubTableCard>
          </div>
        </div>
      </ERPFormSection>

      {/* 7. Project & Quality Inspection Requirements */}
      <ERPFormSection
        number="7."
        title="Project & Quality Inspection Requirements"
        subtitle="Third-party Inspection, Certifications & Manufacturing Standards"
        isCollapsible={true}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">
              Third-Party Inspection & Quality Standards (TPI / QC)
            </label>
            <textarea
              rows={3}
              value={formData.inspectionRequirements}
              onChange={(e) => setFormData({ ...formData, inspectionRequirements: e.target.value })}
              placeholder="e.g. Third-Party Inspection required: TUV / BVQI / Lloyd's / IBR / ASME. Radiography test, Hydro-testing witnessed by client."
              className="w-full py-2 px-3 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#1E293B] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">
              Special Handling, Packaging & Delivery Instructions
            </label>
            <textarea
              rows={3}
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              placeholder="e.g. Seaworthy wooden box packaging, Nitrogen purging before dispatch, pickling & passivation required, specific primer paint shade."
              className="w-full py-2 px-3 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#1E293B] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
        </div>
      </ERPFormSection>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B]">Add Plant / Delivery Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <ERPInput
                label="Address Label / Type"
                value={newAddr.addressType}
                onChange={(e) => setNewAddr({ ...newAddr, addressType: e.target.value })}
                placeholder="e.g. Dahej Plant Site / Unit 2"
              />
              <ERPInput
                label="Address Line"
                required
                value={newAddr.addressLine}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                placeholder="Plot / Street / GIDC"
              />
              <div className="grid grid-cols-2 gap-2">
                <ERPInput
                  label="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  placeholder="City"
                />
                <ERPInput
                  label="State"
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              <ERPInput
                label="Pincode"
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                placeholder="Pincode"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAddress}
                className="px-4 py-2 text-xs font-bold bg-[#75401F] hover:bg-[#5C3218] text-white rounded-lg transition"
              >
                Add Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B]">Add Contact Person</h3>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <ERPInput
                label="Contact Person Name"
                required
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Full Name"
              />
              <ERPInput
                label="Designation"
                value={newContact.designation}
                onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                placeholder="e.g. Accounts / Purchase Head"
              />
              <ERPInput
                label="Mobile Number"
                required
                value={newContact.mobile}
                onChange={(e) => setNewContact({ ...newContact, mobile: e.target.value })}
                placeholder="10-digit mobile"
              />
              <ERPInput
                label="Email Address"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="name@client.com"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddContact}
                className="px-4 py-2 text-xs font-bold bg-[#75401F] hover:bg-[#5C3218] text-white rounded-lg transition"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </ERPFormLayout>
  );
}
