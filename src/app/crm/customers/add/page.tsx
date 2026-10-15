'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../../context/ERPContext';
import {
  ERPFormLayout,
  ERPFormSection,
  ERPFormGrid,
  ERPInput,
  ERPSelect,
  ERPSubTableCard,
} from '../../../../components/ui/ERPFormLayout';
import { Trash2, X } from 'lucide-react';

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

export default function CreateCustomerMasterPage() {
  const router = useRouter();
  const { addCustomer, employees } = useERP();

  const initialCode = `CUST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState({
    customerCode: initialCode,
    companyName: '',
    customerType: 'company' as 'company' | 'individual',
    industry: 'Heavy Engineering & Fabrication',
    category: 'standard' as 'platinum' | 'gold' | 'silver' | 'standard',
    currency: '₹ Indian rupee',
    contactPerson: '',
    designation: 'Managing Director',
    mobile: '',
    email: '',
    pan: '',
    gstin: '',
    paymentTerms: '30 Days Credit',
    creditLimit: 500000,
    assignedSalesPerson: employees[0]?.firstName ? `${employees[0].firstName} ${employees[0].lastName || ''}`.trim() : 'Pravin Patel',
    billingAddress: 'GIDC Industrial Area',
    shippingAddress: 'GIDC Industrial Area',
    city: 'Vadodara',
    state: 'Gujarat',
    country: 'India',
    pincode: '390010',
  });

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);

  // Modals for sub-records
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    addressType: 'Billing Address',
    addressLine: '',
    city: 'Vadodara',
    state: 'Gujarat',
    pincode: '',
  });

  const [showContactModal, setShowContactModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    designation: 'Procurement Manager',
    mobile: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSummary, setErrorSummary] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      errs.companyName = 'Company / Client Name is required.';
    }
    if (!formData.contactPerson.trim()) {
      errs.contactPerson = 'Primary Contact Person is required.';
    }
    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile Number is required.';
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
    setNewAddr({
      addressType: 'Shipping Address',
      addressLine: '',
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '',
    });
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
    setNewContact({
      name: '',
      designation: 'Accounts Manager',
      mobile: '',
      email: '',
    });
    setShowContactModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSummary('');
    if (!validate()) {
      setErrorSummary('Please resolve the highlighted errors before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryAddr = addresses[0];

      addCustomer({
        customerType: formData.customerType,
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        gstin: formData.gstin.toUpperCase().trim() || '24AAACC1234D1Z5',
        pan: formData.pan.toUpperCase().trim() || 'AAACC1234D',
        contactPerson: formData.contactPerson.trim(),
        designation: formData.designation.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        billingAddress: primaryAddr?.addressLine || formData.billingAddress,
        shippingAddress: primaryAddr?.addressLine || formData.shippingAddress,
        city: primaryAddr?.city || formData.city,
        state: primaryAddr?.state || formData.state,
        country: 'India',
        pincode: primaryAddr?.pincode || formData.pincode,
        paymentTerms: formData.paymentTerms,
        creditLimit: Number(formData.creditLimit) || 0,
        currency: formData.currency,
        category: formData.category,
        assignedSalesPerson: formData.assignedSalesPerson,
      });

      setTimeout(() => {
        router.push('/crm/customers?created=' + encodeURIComponent(formData.companyName));
      }, 300);
    } catch (err: any) {
      console.error(err);
      setErrorSummary(err?.message || 'Failed to create customer.');
      setIsSubmitting(false);
    }
  };

  return (
    <ERPFormLayout
      breadcrumbs={['DASHBOARD', 'CRM', 'CUSTOMER MASTER', 'CREATE']}
      actionTitle="CREATE"
      backHref="/crm/customers"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save Customer Master"
      errorSummary={errorSummary}
    >
      {/* 1. Customer Details (4-Column Grid) */}
      <ERPFormSection number="1." title="Customer Details" defaultExpanded={true}>
        <ERPFormGrid>
          <ERPSelect
            label="Customer Type"
            required
            value={formData.customerType}
            onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
            options={[
              { label: 'Company / Corporate Enterprise', value: 'company' },
              { label: 'Individual / Proprietorship', value: 'individual' },
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
              { label: 'Power & Infrastructure', value: 'Power & Infrastructure' },
            ]}
          />

          <ERPSelect
            label="Currency"
            required
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={[
              { label: '₹ Indian rupee', value: '₹ Indian rupee' },
              { label: '$ US Dollar', value: '$ US Dollar' },
              { label: '€ Euro', value: '€ Euro' },
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
              { label: 'Platinum Elite', value: 'platinum' },
            ]}
          />

          <ERPInput
            label="Customer Code"
            value={formData.customerCode}
            disabled
            placeholder="Auto-generated"
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

          <ERPInput
            label="Contact Person Name"
            required
            value={formData.contactPerson}
            onChange={(e) => {
              setFormData({ ...formData, contactPerson: e.target.value });
              if (errors.contactPerson) setErrors({ ...errors, contactPerson: '' });
            }}
            placeholder="Enter Contact Person"
            error={errors.contactPerson}
          />

          <ERPInput
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="e.g. Managing Director"
          />

          <ERPInput
            label="Mobile Number"
            required
            value={formData.mobile}
            onChange={(e) => {
              setFormData({ ...formData, mobile: e.target.value });
              if (errors.mobile) setErrors({ ...errors, mobile: '' });
            }}
            placeholder="10-digit mobile"
            error={errors.mobile}
          />

          <ERPInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="client@company.com"
          />

          <ERPInput
            label="PAN Number"
            value={formData.pan}
            onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
            placeholder="Enter PAN"
          />

          <ERPInput
            label="GSTIN Number"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
            placeholder="Enter 15-digit GSTIN"
          />

          <ERPSelect
            label="Payment Terms"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            options={[
              { label: '100% Advance Payment', value: '100% Advance' },
              { label: '30 Days Credit', value: '30 Days Credit' },
              { label: '45 Days Credit', value: '45 Days Credit' },
              { label: '60 Days Credit', value: '60 Days Credit' },
              { label: 'Against Delivery / CAD', value: 'Against Delivery' },
            ]}
          />

          <ERPInput
            label="Credit Limit (₹)"
            type="number"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
            placeholder="e.g. 500000"
          />

          <ERPInput
            label="Assigned Sales Engineer"
            value={formData.assignedSalesPerson}
            onChange={(e) => setFormData({ ...formData, assignedSalesPerson: e.target.value })}
            placeholder="Engineer Name"
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* 2. Basic Details (Collapsible Accordion) */}
      <ERPFormSection
        number="2."
        title="Basic Details"
        subtitle="Address & Contacts"
        isCollapsible={true}
        defaultExpanded={true}
      >
        <div className="space-y-6">
          <ERPSubTableCard
            title="Address Details"
            onAdd={() => setShowAddressModal(true)}
            addLabel="+ Add Address"
            isEmpty={addresses.length === 0}
            emptyText="No Records Found"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-bold">
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Address</th>
                    <th className="py-2 px-3">City</th>
                    <th className="py-2 px-3">State</th>
                    <th className="py-2 px-3">Pincode</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {addresses.map((a) => (
                    <tr key={a.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-semibold text-[#1E293B]">{a.addressType}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{a.addressLine}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{a.city}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{a.state}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{a.pincode || '-'}</td>
                      <td className="py-2.5 px-3 text-right">
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
            title="Contact Persons"
            onAdd={() => setShowContactModal(true)}
            addLabel="+ Add Contact"
            isEmpty={contacts.length === 0}
            emptyText="No Records Found"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-bold">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Designation</th>
                    <th className="py-2 px-3">Mobile</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-semibold text-[#1E293B]">{c.name}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{c.designation}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{c.mobile}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{c.email || '-'}</td>
                      <td className="py-2.5 px-3 text-right">
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
      </ERPFormSection>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B]">Add Customer Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <ERPSelect
                label="Address Type"
                value={newAddr.addressType}
                onChange={(e) => setNewAddr({ ...newAddr, addressType: e.target.value })}
                options={[
                  { label: 'Billing Address', value: 'Billing Address' },
                  { label: 'Shipping / Plant Delivery Site', value: 'Shipping Address' },
                  { label: 'Registered Head Office', value: 'Registered Office' },
                ]}
              />
              <ERPInput
                label="Address Line"
                required
                value={newAddr.addressLine}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                placeholder="Plot No, Industrial Estate"
              />
              <div className="grid grid-cols-2 gap-3">
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
                label="Pin Code"
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                placeholder="e.g. 390010"
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
                className="px-4 py-2 text-xs font-bold bg-[#7C3AED] text-white rounded-lg"
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
                placeholder="e.g. Purchase Manager"
              />
              <ERPInput
                label="Mobile Number"
                required
                value={newContact.mobile}
                onChange={(e) => setNewContact({ ...newContact, mobile: e.target.value })}
                placeholder="Mobile"
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
                className="px-4 py-2 text-xs font-bold bg-[#7C3AED] text-white rounded-lg"
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
