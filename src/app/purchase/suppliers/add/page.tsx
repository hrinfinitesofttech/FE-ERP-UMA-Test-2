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
  ERPCheckbox,
  ERPSubTableCard,
} from '../../../../components/ui/ERPFormLayout';
import { Plus, Trash2, MapPin, Phone, Mail, Building, X } from 'lucide-react';
import { Supplier } from '../../../../types/purchase';

interface AddressItem {
  id: string;
  addressType: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
}

interface ContactItem {
  id: string;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
}

export default function CreateVendorMasterPage() {
  const router = useRouter();
  const { addSupplier } = useERP();

  // Auto-generate code like VM-26101964
  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const initialCode = `VM-${yy}${mm}${Math.floor(1000 + Math.random() * 9000)}`;

  // Form State
  const [formData, setFormData] = useState({
    activity: 'Purchase',
    vendorTaxType: 'Registered Regular',
    currency: '₹ Indian rupee',
    vendorStatus: 'Under Review',
    vendorCode: initialCode,
    vendorName: '',
    chequeName: '',
    alias: '',
    pan: '',
    aadhar: '',
    cin: '',
    creditDays: 30,
    isMsme: false,
    msmeNumber: '',
    isGstRetention: false,
    gstin: '',
  });

  // Dynamic Sub-records (Address & Contacts)
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);

  // Modals for sub-records
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    addressType: 'Registered Office',
    addressLine: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pinCode: '',
  });

  const [showContactModal, setShowContactModal] = useState(false);
  const [newContact, setNewContact] = useState({
    contactPerson: '',
    designation: 'Sales Representative',
    phone: '',
    email: '',
  });

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSummary, setErrorSummary] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.vendorName.trim()) {
      errs.vendorName = 'Vendor Name is required.';
    }
    if (!formData.creditDays || Number(formData.creditDays) < 0) {
      errs.creditDays = 'Valid Credit Days is required.';
    }
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan.trim())) {
      errs.pan = 'Invalid PAN format (e.g. ABCDE1234F).';
    }
    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(formData.gstin.trim())) {
      errs.gstin = 'Invalid GSTIN format (15 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.addressLine.trim() || !newAddr.city.trim()) return;
    setAddresses((prev) => [
      ...prev,
      {
        id: `ADDR-${Date.now().toString().slice(-4)}`,
        ...newAddr,
      },
    ]);
    setNewAddr({
      addressType: 'Branch Office',
      addressLine: '',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pinCode: '',
    });
    setShowAddressModal(false);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.contactPerson.trim() || !newContact.phone.trim()) return;
    setContacts((prev) => [
      ...prev,
      {
        id: `CONT-${Date.now().toString().slice(-4)}`,
        ...newContact,
      },
    ]);
    setNewContact({
      contactPerson: '',
      designation: 'Accounts Executive',
      phone: '',
      email: '',
    });
    setShowContactModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSummary('');
    if (!validate()) {
      setErrorSummary('Please review and resolve the highlighted errors before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const primaryAddr = addresses[0];
      const primaryContact = contacts[0];

      const newSupplier: Omit<Supplier, 'id'> = {
        vendorCode: formData.vendorCode.trim(),
        supplierCode: formData.vendorCode.trim(),
        name: formData.vendorName.trim(),
        supplierName: formData.vendorName.trim(),
        category: formData.activity || 'Raw Material',
        activity: formData.activity,
        vendorTaxType: formData.vendorTaxType,
        currency: formData.currency,
        vendorStatus: formData.vendorStatus,
        chequeName: formData.chequeName.trim() || formData.vendorName.trim(),
        alias: formData.alias.trim(),
        panNumber: formData.pan.toUpperCase().trim(),
        pan: formData.pan.toUpperCase().trim(),
        aadhar: formData.aadhar.trim(),
        cin: formData.cin.trim(),
        gstin: formData.gstin.toUpperCase().trim() || '24AAACU1234D1Z5',
        creditDays: Number(formData.creditDays) || 30,
        creditPeriodDays: Number(formData.creditDays) || 30,
        msmeRegistered: formData.isMsme,
        msmeNumber: formData.msmeNumber || '',
        gstRetentionApplicable: formData.isGstRetention,
        createdBy: 'darshit.admin',
        approvedBy: 'darshit.admin',
        approvalStatus: 'Approved',
        docStatus: 'Submit',
        status: 'Approved',
        contactPerson: primaryContact?.contactPerson || 'Office Contact',
        phone: primaryContact?.phone || '9876543210',
        email: primaryContact?.email || 'vendor@example.com',
        address: primaryAddr?.addressLine || 'GIDC Industrial Area',
        city: primaryAddr?.city || 'Ahmedabad',
        state: primaryAddr?.state || 'Gujarat',
        country: 'India',
        paymentTerms: `${formData.creditDays} Days Credit`,
        bankName: 'HDFC Bank',
        bankAccountNumber: '50200012345678',
        ifscCode: 'HDFC0000123',
        performanceRating: 90,
        addresses: addresses.map((a) => ({
          id: a.id,
          addressType: a.addressType,
          addressLine: a.addressLine,
          city: a.city,
          state: a.state,
          pinCode: a.pinCode,
        })),
        contacts: contacts.map((c) => ({
          id: c.id,
          contactPerson: c.contactPerson,
          designation: c.designation,
          phone: c.phone,
          email: c.email,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addSupplier(newSupplier);

      // Redirect to vendor list with success notification
      setTimeout(() => {
        router.push('/purchase/suppliers?created=' + encodeURIComponent(formData.vendorName));
      }, 300);
    } catch (err: any) {
      console.error(err);
      setErrorSummary(err?.message || 'Failed to register vendor.');
      setIsSubmitting(false);
    }
  };

  return (
    <ERPFormLayout
      breadcrumbs={['DASHBOARD', 'PROCUREMENT', 'VENDOR MASTER', 'CREATE']}
      actionTitle="CREATE"
      backHref="/purchase/suppliers"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save Vendor Master"
      errorSummary={errorSummary}
    >
      {/* 1. Vendor Details (Exact 4-Column Grid matching Screenshot 2) */}
      <ERPFormSection number="1." title="Vendor Details" defaultExpanded={true}>
        <ERPFormGrid>
          {/* Row 1 */}
          <ERPSelect
            label="Activity"
            required
            value={formData.activity}
            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
            options={[
              { label: 'Purchase', value: 'Purchase' },
              { label: 'Transport', value: 'Transport' },
              { label: 'Subcontractor', value: 'Subcontractor' },
              { label: 'Service Provider', value: 'Service Provider' },
              { label: 'Job Work', value: 'Job Work' },
            ]}
          />

          <ERPSelect
            label="Vendor Tax Type"
            required
            value={formData.vendorTaxType}
            onChange={(e) => setFormData({ ...formData, vendorTaxType: e.target.value })}
            options={[
              { label: 'Registered Regular', value: 'Registered Regular' },
              { label: 'Composition Dealer', value: 'Composition Dealer' },
              { label: 'Unregistered', value: 'Unregistered' },
              { label: 'SEZ Unit / Developer', value: 'SEZ Unit / Developer' },
              { label: 'Overseas Import', value: 'Overseas Import' },
            ]}
          />

          <ERPSelect
            label="Currencies"
            required
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={[
              { label: '₹ Indian rupee', value: '₹ Indian rupee' },
              { label: '$ US Dollar', value: '$ US Dollar' },
              { label: '€ Euro', value: '€ Euro' },
              { label: '£ British Pound', value: '£ British Pound' },
            ]}
          />

          <ERPSelect
            label="Vendor Status"
            required
            value={formData.vendorStatus}
            onChange={(e) => setFormData({ ...formData, vendorStatus: e.target.value })}
            options={[
              { label: 'Under Review', value: 'Under Review' },
              { label: 'Running', value: 'Running' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Blacklisted', value: 'Blacklisted' },
            ]}
          />

          {/* Row 2 */}
          <ERPInput
            label="Vendor Code"
            value={formData.vendorCode}
            disabled
            placeholder="Auto-generated"
          />

          <ERPInput
            label="Vendor Name"
            required
            value={formData.vendorName}
            onChange={(e) => {
              setFormData({ ...formData, vendorName: e.target.value });
              if (errors.vendorName) setErrors({ ...errors, vendorName: '' });
            }}
            placeholder="Enter Vendor Name"
            error={errors.vendorName}
          />

          <ERPInput
            label="cheque Name"
            value={formData.chequeName}
            onChange={(e) => setFormData({ ...formData, chequeName: e.target.value })}
            placeholder="Enter Cheque Name"
          />

          <ERPInput
            label="Alias"
            value={formData.alias}
            onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
            placeholder="Enter Alias Name"
          />

          {/* Row 3 */}
          <ERPInput
            label="PAN"
            value={formData.pan}
            onChange={(e) => {
              setFormData({ ...formData, pan: e.target.value.toUpperCase() });
              if (errors.pan) setErrors({ ...errors, pan: '' });
            }}
            placeholder="Enter PAN Number"
            error={errors.pan}
          />

          <ERPInput
            label="AADHAR"
            value={formData.aadhar}
            onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
            placeholder="Enter AADHAR Number"
          />

          <ERPInput
            label="CIN"
            value={formData.cin}
            onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
            placeholder="Enter CIN Number"
          />

          <ERPInput
            label="Credit Days"
            required
            type="number"
            value={formData.creditDays}
            onChange={(e) => setFormData({ ...formData, creditDays: Number(e.target.value) })}
            placeholder="Credit Days"
            error={errors.creditDays}
          />
        </ERPFormGrid>

        {/* Checkboxes Row */}
        <div className="flex flex-wrap items-center gap-8 pt-2">
          <ERPCheckbox
            label="Is MSME registered?"
            checked={formData.isMsme}
            onChange={(checked) => setFormData({ ...formData, isMsme: checked })}
          />

          <ERPCheckbox
            label="Is Gst Retention Applicable ?"
            checked={formData.isGstRetention}
            onChange={(checked) => setFormData({ ...formData, isGstRetention: checked })}
          />
        </div>

        {/* Conditional MSME Number input */}
        {formData.isMsme && (
          <div className="pt-2 max-w-sm animate-in slide-in-from-top-1">
            <ERPInput
              label="Udyam / MSME Registration Number"
              value={formData.msmeNumber}
              onChange={(e) => setFormData({ ...formData, msmeNumber: e.target.value })}
              placeholder="e.g. UDYAM-GJ-01-0012345"
            />
          </div>
        )}
      </ERPFormSection>

      {/* 2. Basic Details (Collapsible Accordion matching Screenshot 2) */}
      <ERPFormSection
        number="2."
        title="Basic Details"
        subtitle="Address & Contact Details"
        isCollapsible={true}
        defaultExpanded={true}
      >
        <div className="space-y-6">
          <div className="text-xs font-bold text-[#64748B] border-b border-[#F1F5F9] pb-2">
            Address & Contact Details
          </div>

          {/* Sub-Card 1: Address Details */}
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
                    <th className="py-2 px-3">Pin Code</th>
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
                      <td className="py-2.5 px-3 text-[#475569]">{a.pinCode || '-'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setAddresses(addresses.filter((x) => x.id !== a.id))}
                          className="p-1 text-[#EF4444] hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Remove Address"
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

          {/* Sub-Card 2: Contact Details */}
          <ERPSubTableCard
            title="Contact Details"
            onAdd={() => setShowContactModal(true)}
            addLabel="+ Add Contact"
            isEmpty={contacts.length === 0}
            emptyText="No Records Found"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-bold">
                    <th className="py-2 px-3">Contact Person</th>
                    <th className="py-2 px-3">Designation</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-semibold text-[#1E293B]">{c.contactPerson}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{c.designation}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{c.phone}</td>
                      <td className="py-2.5 px-3 text-[#475569]">{c.email || '-'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setContacts(contacts.filter((x) => x.id !== c.id))}
                          className="p-1 text-[#EF4444] hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Remove Contact"
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

      {/* Modal: Add Address */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-md w-full p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B]">Add New Address</h3>
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
                  { label: 'Registered Office', value: 'Registered Office' },
                  { label: 'Factory / Works', value: 'Factory / Works' },
                  { label: 'Branch Office', value: 'Branch Office' },
                  { label: 'Warehouse / Godown', value: 'Warehouse / Godown' },
                ]}
              />
              <ERPInput
                label="Address Line"
                required
                value={newAddr.addressLine}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                placeholder="Plot No, Street, Industrial Area"
              />
              <div className="grid grid-cols-2 gap-3">
                <ERPInput
                  label="City"
                  required
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  placeholder="City"
                />
                <ERPInput
                  label="State"
                  required
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              <ERPInput
                label="Pin Code"
                value={newAddr.pinCode}
                onChange={(e) => setNewAddr({ ...newAddr, pinCode: e.target.value })}
                placeholder="e.g. 382445"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAddress}
                className="px-4 py-2 text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg transition shadow-xs"
              >
                Add Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Contact */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-md w-full p-5 space-y-4 animate-in zoom-in-95">
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
                value={newContact.contactPerson}
                onChange={(e) => setNewContact({ ...newContact, contactPerson: e.target.value })}
                placeholder="Full Name"
              />
              <ERPInput
                label="Designation"
                value={newContact.designation}
                onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                placeholder="e.g. Director / Sales Head"
              />
              <ERPInput
                label="Phone / Mobile"
                required
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="10-digit mobile number"
              />
              <ERPInput
                label="Email Address"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="name@vendor.com"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddContact}
                className="px-4 py-2 text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg transition shadow-xs"
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
