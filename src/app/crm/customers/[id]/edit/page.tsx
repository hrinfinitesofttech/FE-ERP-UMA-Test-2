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
import { Trash2, X } from 'lucide-react';
import { Customer } from '../../../../../types/crm';

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

  const { customers, updateCustomer, employees } = useERP();

  const currentCustomer = customers.find(
    (c) => c.id === customerId || c.customerCode === customerId
  );

  const [formData, setFormData] = useState({
    customerCode: '',
    companyName: '',
    customerType: 'company' as 'company' | 'individual',
    industry: 'Heavy Engineering & Fabrication',
    category: 'standard' as 'platinum' | 'gold' | 'silver' | 'standard',
    currency: '₹ Indian rupee',
    contactPerson: '',
    designation: '',
    mobile: '',
    email: '',
    pan: '',
    gstin: '',
    paymentTerms: '30 Days Credit',
    creditLimit: 500000,
    assignedSalesPerson: '',
    billingAddress: '',
    shippingAddress: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  });

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);

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
    designation: 'Procurement Head',
    mobile: '',
    email: '',
  });

  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        customerCode: currentCustomer.customerCode || currentCustomer.id,
        companyName: currentCustomer.companyName || '',
        customerType: currentCustomer.customerType || 'company',
        industry: currentCustomer.industry || 'Heavy Engineering & Fabrication',
        category: (currentCustomer.category as any) || 'standard',
        currency: currentCustomer.currency || '₹ Indian rupee',
        contactPerson: currentCustomer.contactPerson || '',
        designation: currentCustomer.designation || 'Managing Director',
        mobile: currentCustomer.mobile || '',
        email: currentCustomer.email || '',
        pan: currentCustomer.pan || '',
        gstin: currentCustomer.gstin || '',
        paymentTerms: currentCustomer.paymentTerms || '30 Days Credit',
        creditLimit: currentCustomer.creditLimit || 500000,
        assignedSalesPerson: currentCustomer.assignedSalesPerson || 'Pravin Patel',
        billingAddress: currentCustomer.billingAddress || '',
        shippingAddress: currentCustomer.shippingAddress || '',
        city: currentCustomer.city || 'Vadodara',
        state: currentCustomer.state || 'Gujarat',
        country: 'India',
        pincode: currentCustomer.pincode || '',
      });

      if (currentCustomer.billingAddress) {
        setAddresses([
          {
            id: 'CADDR-1',
            addressType: 'Billing Address',
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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      errs.companyName = 'Company / Client Name is required.';
    }
    if (!formData.contactPerson.trim()) {
      errs.contactPerson = 'Primary Contact Person is required.';
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
      setErrorSummary('Please resolve the highlighted errors.');
      return;
    }

    if (!currentCustomer) {
      setErrorSummary('Customer record not found.');
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryAddr = addresses[0];

      if (updateCustomer) {
        updateCustomer(currentCustomer.id, {
          companyName: formData.companyName.trim(),
          industry: formData.industry,
          category: formData.category,
          contactPerson: formData.contactPerson.trim(),
          designation: formData.designation.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim(),
          pan: formData.pan.toUpperCase().trim(),
          gstin: formData.gstin.toUpperCase().trim(),
          paymentTerms: formData.paymentTerms,
          creditLimit: Number(formData.creditLimit) || 0,
          assignedSalesPerson: formData.assignedSalesPerson,
          city: primaryAddr?.city || formData.city,
          state: primaryAddr?.state || formData.state,
          billingAddress: primaryAddr?.addressLine || formData.billingAddress,
          shippingAddress: primaryAddr?.addressLine || formData.shippingAddress,
          pincode: primaryAddr?.pincode || formData.pincode,
        });
      }

      setTimeout(() => {
        router.push('/crm/customers?updated=' + encodeURIComponent(formData.companyName));
      }, 300);
    } catch (err: any) {
      console.error(err);
      setErrorSummary(err?.message || 'Failed to update customer.');
      setIsSubmitting(false);
    }
  };

  if (!currentCustomer) {
    return (
      <div className="p-8 text-center bg-[#F8FAFC] min-h-screen">
        <p className="text-sm font-semibold text-[#64748B]">Customer record not found.</p>
        <button
          onClick={() => router.push('/crm/customers')}
          className="mt-3 px-4 py-2 bg-[#7C3AED] text-white text-xs font-bold rounded-lg"
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
            placeholder="Designation"
          />

          <ERPInput
            label="Mobile Number"
            required
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            placeholder="Mobile Number"
          />

          <ERPInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
          />

          <ERPInput
            label="PAN Number"
            value={formData.pan}
            onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
            placeholder="PAN"
          />

          <ERPInput
            label="GSTIN Number"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
            placeholder="GSTIN"
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
          />

          <ERPInput
            label="Assigned Sales Engineer"
            value={formData.assignedSalesPerson}
            onChange={(e) => setFormData({ ...formData, assignedSalesPerson: e.target.value })}
          />
        </ERPFormGrid>
      </ERPFormSection>

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

      {/* Modals */}
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
