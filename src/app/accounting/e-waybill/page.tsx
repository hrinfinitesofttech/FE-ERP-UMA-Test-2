'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  FileText,
  MapPin,
  Calendar,
  X,
  ShieldCheck,
  Building,
  Trash2,
  Loader2,
} from 'lucide-react';
import { printContent } from '@/lib/printUtils';
import { api } from '@/lib/apiClient';
import { toast } from '@/context/ToastContext';

interface EWayBillRecord {
  id: string;
  ewayBillNo: string;
  invoiceNumber: string;
  invoiceDate: string;
  deliveryChallanNumber?: string;
  customerName: string;
  customerGstin: string;
  deliveryPincode: string;
  transporterName: string;
  transporterId: string;
  vehicleNumber: string;
  distanceKm: number;
  consignmentValue: number;
  validUpto: string;
  status: 'Active' | 'Delivered' | 'Cancelled';
  generatedDate: string;
}

function EWayBillPageContent() {
  const searchParams = useSearchParams();
  const { salesInvoices, customers } = useERP();

  const [ewayBills, setEwayBills] = useState<EWayBillRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<EWayBillRecord | null>(null);

  // Form State
  const [docType, setDocType] = useState<'Invoice' | 'Challan'>('Invoice');
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState('');
  const [deliveryChallanNo, setDeliveryChallanNo] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerGstinInput, setCustomerGstinInput] = useState('24AAACX0000X1Z1');
  const [consignmentValueInput, setConsignmentValueInput] = useState<number | string>(150000);
  const [transporterName, setTransporterName] = useState('V-Trans India Ltd');
  const [transporterId, setTransporterId] = useState('24AAACV1234F1Z0');
  const [vehicleNumber, setVehicleNumber] = useState('GJ-01-BX-4455');
  const [distanceKm, setDistanceKm] = useState<number | string>(180);
  const [destinationPincode, setDestinationPincode] = useState('382415');

  // Fetch real E-Way Bills from database
  const fetchEWayBills = async () => {
    setIsLoading(true);
    try {
      const res = await api.accounting.ewayBills.list();
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      const mapped: EWayBillRecord[] = data.map((b: any) => ({
        id: String(b.id || b.ewayBillNo || b.eway_bill_no),
        ewayBillNo: String(b.ewayBillNo || b.eway_bill_no || b.id),
        invoiceNumber: b.invoiceNumber || b.invoice_number || b.deliveryChallanNumber || b.delivery_challan_number || 'INV-001',
        invoiceDate: b.invoiceDate || b.invoice_date || (b.validFrom ? String(b.validFrom).split('T')[0] : new Date().toISOString().split('T')[0]),
        deliveryChallanNumber: b.deliveryChallanNumber || b.delivery_challan_number || '',
        customerName: b.customerName || b.customer_name || 'Customer Ltd',
        customerGstin: b.customerGstin || b.customer_gstin || '24AAACX0000X1Z1',
        deliveryPincode: b.deliveryPincode || b.delivery_pincode || '382415',
        transporterName: b.transporterName || b.transporter_name || 'V-Trans Logistics',
        transporterId: b.transporterId || b.transporter_id || '24AAACV1234F1Z0',
        vehicleNumber: b.vehicleNumber || b.vehicle_number || 'GJ-01-AX-9999',
        distanceKm: Number(b.distanceKm || b.distance_km || 150),
        consignmentValue: Number(b.consignmentValue || b.consignment_value || 0),
        validUpto: b.validUpto || b.valid_upto ? String(b.validUpto || b.valid_upto).split('T')[0] : new Date().toISOString().split('T')[0],
        status: b.status || 'Active',
        generatedDate: b.validFrom || b.created_at ? String(b.validFrom || b.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
      }));
      setEwayBills(mapped);
    } catch (err) {
      console.error('Failed to load E-Way Bills:', err);
      toast.error('Failed to load E-Way Bills from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEWayBills();
  }, []);

  // Pre-fill from URL query parameters (e.g. from /production/dispatch or /accounting/sales-invoices)
  useEffect(() => {
    const challanNo = searchParams?.get('challanNo');
    const customer = searchParams?.get('customerName');
    const vehicle = searchParams?.get('vehicle');
    const destination = searchParams?.get('destination');
    const transporter = searchParams?.get('transporter');
    const invoiceNo = searchParams?.get('invoiceNo');
    const value = searchParams?.get('value');

    if (challanNo || invoiceNo || customer) {
      if (challanNo) {
        setDocType('Challan');
        setDeliveryChallanNo(challanNo);
        setSelectedInvoiceNo(challanNo);
      }
      if (invoiceNo) {
        setDocType('Invoice');
        setSelectedInvoiceNo(invoiceNo);
      }
      if (customer) setCustomerNameInput(customer);
      if (vehicle) setVehicleNumber(vehicle);
      if (transporter) setTransporterName(transporter);
      if (value) setConsignmentValueInput(Number(value));
      if (destination) {
        // Find pincode if available
        const cust = customers.find((c) => c.companyName?.toLowerCase().includes(customer?.toLowerCase() || ''));
        if (cust && (cust as any).pincode) {
          setDestinationPincode((cust as any).pincode);
        }
      }
      setIsModalOpen(true);
    }
  }, [searchParams, customers]);

  // Eligible Invoices (> ₹50,000 threshold for Indian E-Way Bill rules)
  const eligibleInvoices = useMemo(() => {
    return (salesInvoices || []).filter((inv) => {
      const total = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
      return total >= 50000;
    });
  }, [salesInvoices]);

  const handleOpenModal = () => {
    if (eligibleInvoices.length > 0 && docType === 'Invoice') {
      setSelectedInvoiceNo(eligibleInvoices[0].invoiceNumber || eligibleInvoices[0].id);
      setCustomerNameInput(eligibleInvoices[0].customerName || '');
      setConsignmentValueInput(Number(eligibleInvoices[0].grandTotal || 150000));
      const cust = customers.find((c) => c.id === eligibleInvoices[0].customerId);
      if (cust && (cust as any).pincode) {
        setDestinationPincode((cust as any).pincode);
      }
    }
    setIsModalOpen(true);
  };

  const handleGenerateEWayBill = async (e: React.FormEvent) => {
    e.preventDefault();

    let matchedInv = salesInvoices.find(
      (inv) => inv.invoiceNumber === selectedInvoiceNo || inv.id === selectedInvoiceNo
    );

    const val = Number(
      consignmentValueInput ||
      matchedInv?.grandTotal ||
      (matchedInv as any)?.grand_total ||
      150000
    );
    const dist = Number(distanceKm) || 150;
    const daysValid = Math.max(1, Math.ceil(dist / 200));
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + daysValid);

    const random12Digit = `24${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const finalDocNo = docType === 'Challan' ? (deliveryChallanNo || 'CH-547') : (selectedInvoiceNo || 'INV-2026-0001');
    const finalCustName = customerNameInput || matchedInv?.customerName || 'Customer Ltd';

    const payload = {
      eway_bill_no: random12Digit,
      invoice_number: docType === 'Invoice' ? finalDocNo : '',
      delivery_challan_number: docType === 'Challan' ? finalDocNo : '',
      invoice_date: matchedInv?.invoiceDate || new Date().toISOString().split('T')[0],
      customer_name: finalCustName,
      customer_gstin: customerGstinInput || (matchedInv as any)?.customerGstin || '24AAACX0000X1Z1',
      delivery_pincode: destinationPincode || '382415',
      transporter_name: transporterName || 'V-Trans Logistics',
      transporter_id: transporterId || '24AAACV1234F1Z0',
      vehicle_number: vehicleNumber || 'GJ-01-AX-9999',
      distance_km: dist,
      consignment_value: val,
      valid_upto: validDate.toISOString(),
      status: 'Active',
    };

    try {
      const created = await api.accounting.ewayBills.create(payload);
      toast.success(`E-Way Bill #${random12Digit} generated and saved to database!`);
      await fetchEWayBills();
      setIsModalOpen(false);

      const printRecord: EWayBillRecord = {
        id: created.id || random12Digit,
        ewayBillNo: random12Digit,
        invoiceNumber: finalDocNo,
        invoiceDate: new Date().toISOString().split('T')[0],
        deliveryChallanNumber: docType === 'Challan' ? finalDocNo : '',
        customerName: finalCustName,
        customerGstin: payload.customer_gstin,
        deliveryPincode: payload.delivery_pincode,
        transporterName: payload.transporter_name,
        transporterId: payload.transporter_id,
        vehicleNumber: payload.vehicle_number,
        distanceKm: dist,
        consignmentValue: val,
        validUpto: validDate.toISOString().split('T')[0],
        status: 'Active',
        generatedDate: new Date().toISOString().split('T')[0],
      };
      setSelectedBillForPrint(printRecord);
    } catch (err) {
      console.error('Failed to create E-Way Bill:', err);
      toast.error('Failed to generate E-Way Bill in database.');
    }
  };

  const handleDeleteEWayBill = (id: string, ewbNo: string) => {
    toast.confirm({
      title: 'Delete E-Way Bill',
      message: `Are you sure you want to delete E-Way Bill #${ewbNo}? This will remove it from the database.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.accounting.ewayBills.delete(id);
          toast.success(`E-Way Bill #${ewbNo} deleted`);
          await fetchEWayBills();
        } catch (err) {
          console.error('Failed to delete E-Way Bill:', err);
          toast.error('Failed to delete E-Way Bill from database.');
        }
      },
    });
  };

  const filtered = useMemo(() => {
    return ewayBills.filter((b) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.ewayBillNo.includes(q) ||
        b.invoiceNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.vehicleNumber.toLowerCase().includes(q) ||
        b.transporterName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || b.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ewayBills, searchTerm, statusFilter]);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#211B17]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-200">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
              ACCOUNTING &amp; GST COMPLIANCE / E-WAY BILL SYSTEM
            </div>
            <h1 className="text-xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <span>Electronic Way Bill Portal (E-Way Bill)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-300 font-mono">
                Rule 138 GST
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mandatory for Inter-state &amp; Intra-state Goods Movement &gt; ₹50,000 • 12-Digit EWB Generator &amp; Part A/B Verification
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-[#211B17] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>+ Generate E-Way Bill</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total E-Way Bills
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {ewayBills.length}
          </div>
          <div className="text-[10px] text-slate-400">Total bills registered</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Active Consignments
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700">
            {ewayBills.filter((b) => b.status === 'Active').length}
          </div>
          <div className="text-[10px] text-slate-400">Currently in-transit</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">
            Eligible Invoices
          </div>
          <div className="text-2xl font-black font-mono text-sky-700">
            {eligibleInvoices.length}
          </div>
          <div className="text-[10px] text-slate-400">Invoices &gt; ₹50,000 threshold</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">
            Dispatched Value
          </div>
          <div className="text-2xl font-black font-mono text-purple-700">
            ₹{ewayBills.reduce((s, b) => s + b.consignmentValue, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400">Total goods in movement</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#EBE3DB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search E-Way Bill no, invoice, vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Records' : st}
            </button>
          ))}
        </div>
      </div>

      {/* E-Way Bills Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3 px-4">E-WAY BILL NO</th>
                <th className="py-3 px-4">DOC (INVOICE / CHALLAN)</th>
                <th className="py-3 px-4">CUSTOMER &amp; DESTINATION</th>
                <th className="py-3 px-4">TRANSPORTER &amp; VEHICLE</th>
                <th className="py-3 px-4 text-right">DISTANCE</th>
                <th className="py-3 px-4 text-right">VALUE (₹)</th>
                <th className="py-3 px-4">VALID UPTO</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 text-sky-500 animate-spin" />
                    <p className="font-semibold text-slate-700 text-sm">Loading E-Way Bills from database...</p>
                    <p className="text-xs text-slate-400 mt-0.5">Please wait while active consignments are retrieved.</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No E-Way Bills found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click '+ Generate E-Way Bill' to generate your first document.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-sky-50/20 transition group">
                    <td className="py-3 px-4 font-bold text-sky-800 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-sky-600" />
                      <span>{b.ewayBillNo}</span>
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      <div>{b.invoiceNumber}</div>
                      {b.deliveryChallanNumber && (
                        <div className="text-[10px] text-amber-700 font-mono">Challan: {b.deliveryChallanNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-900">{b.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">PIN: {b.deliveryPincode}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-800">{b.transporterName}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded inline-block">
                        {b.vehicleNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-sans">
                      {b.distanceKm} km
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ₹{b.consignmentValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 text-[11px]">
                      {b.validUpto}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                          b.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : b.status === 'Delivered'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedBillForPrint(b)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Print Official Slip"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Print</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEWayBill(b.id, b.ewayBillNo)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete from database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE E-WAY BILL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#211B17] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold">Generate New E-Way Bill (Part A &amp; B)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateEWayBill} className="p-5 space-y-4 text-xs">
              {/* Document Type Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Document Type for E-Way Bill
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDocType('Invoice')}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center cursor-pointer ${
                      docType === 'Invoice'
                        ? 'bg-sky-50 text-sky-800 border-sky-400'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Tax Invoice (&gt; ₹50,000)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocType('Challan')}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center cursor-pointer ${
                      docType === 'Challan'
                        ? 'bg-amber-50 text-amber-800 border-amber-400'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Delivery Challan (Dispatch)
                  </button>
                </div>
              </div>

              {docType === 'Invoice' ? (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Select Qualifying Sales Invoice (&gt; ₹50,000) <span className="text-rose-500">*</span>
                  </label>
                  {eligibleInvoices.length > 0 ? (
                    <select
                      value={selectedInvoiceNo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedInvoiceNo(val);
                        const inv = salesInvoices.find((i) => (i.invoiceNumber || i.id) === val);
                        if (inv) {
                          setCustomerNameInput(inv.customerName || '');
                          setConsignmentValueInput(Number(inv.grandTotal || 150000));
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-sky-500"
                      required
                    >
                      {eligibleInvoices.map((inv) => (
                        <option key={inv.id} value={inv.invoiceNumber || inv.id}>
                          {inv.invoiceNumber || inv.id} — {inv.customerName} (₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-0001"
                      value={selectedInvoiceNo}
                      onChange={(e) => setSelectedInvoiceNo(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  )}
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Delivery Challan Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 547 or CHALLAN-547"
                    value={deliveryChallanNo}
                    onChange={(e) => setDeliveryChallanNo(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UMA Food / Tata Steel"
                    value={customerNameInput}
                    onChange={(e) => setCustomerNameInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Consignment Value (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={consignmentValueInput}
                    onChange={(e) => setConsignmentValueInput(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Transporter Name
                  </label>
                  <input
                    type="text"
                    required
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Transporter ID / GSTIN
                  </label>
                  <input
                    type="text"
                    required
                    value={transporterId}
                    onChange={(e) => setTransporterId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Vehicle Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GJ-01-AB-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase font-bold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Distance (KM)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Destination PIN
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={destinationPincode}
                    onChange={(e) => setDestinationPincode(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl flex items-start gap-2 text-sky-800">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-sky-600 flex-shrink-0" />
                <p className="text-[11px]">
                  Under GST Rule 138, Part-A contains supplier &amp; recipient GSTINs and values. Part-B authenticates the conveyance vehicle. Validity is calculated automatically (1 day per 200 km).
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  Generate E-Way Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT E-WAY BILL MODAL */}
      {selectedBillForPrint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <span className="font-bold text-slate-800 text-sm">Official Government of India E-Way Bill</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printContent('printable-ewaybill-slip', { title: selectedBillForPrint ? `EWayBill_${selectedBillForPrint.ewayBillNo}` : 'EWayBill_Slip' })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedBillForPrint(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Slip Layout */}
            <div id="printable-ewaybill-slip" className="border border-slate-300 rounded-xl p-5 space-y-4 text-xs font-sans">
              <div className="text-center border-b pb-3 border-slate-300">
                <h2 className="text-base font-black uppercase tracking-wider text-slate-900 font-mono">
                  GOVERNMENT OF INDIA — E-WAY BILL SYSTEM
                </h2>
                <div className="text-xs font-mono font-bold text-sky-800 mt-1">
                  E-WAY BILL NO: {selectedBillForPrint.ewayBillNo}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  GENERATED ON: {selectedBillForPrint.generatedDate} • VALID UPTO: {selectedBillForPrint.validUpto}
                </div>
              </div>

              {/* Part A */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-800 uppercase text-[11px] bg-slate-100 px-2 py-1 rounded">
                  PART - A: GOODS CONSIGNMENT DETAILS
                </div>
                <div className="grid grid-cols-2 gap-3 p-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">FROM (SUPPLIER):</span>
                    <strong className="text-slate-900">UMA TECHNO FAB PRIVATE LIMITED</strong>
                    <div className="text-slate-600 font-mono">GSTIN: 24AAACU1234F1Z9</div>
                    <div className="text-slate-500">Dispatch From: 382415 (Odhav GIDC)</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">TO (RECIPIENT):</span>
                    <strong className="text-slate-900">{selectedBillForPrint.customerName}</strong>
                    <div className="text-slate-600 font-mono">GSTIN: {selectedBillForPrint.customerGstin}</div>
                    <div className="text-slate-500">Ship To PIN: {selectedBillForPrint.deliveryPincode}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 px-2 text-[11px] font-mono bg-slate-50 p-2 rounded">
                  <div>Doc No: <strong>{selectedBillForPrint.invoiceNumber}</strong></div>
                  <div>Doc Date: <strong>{selectedBillForPrint.invoiceDate}</strong></div>
                  <div>Value: <strong>₹{selectedBillForPrint.consignmentValue.toLocaleString('en-IN')}</strong></div>
                </div>
              </div>

              {/* Part B */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-800 uppercase text-[11px] bg-slate-100 px-2 py-1 rounded">
                  PART - B: VEHICLE &amp; TRANSPORTATION DETAILS
                </div>
                <div className="grid grid-cols-3 gap-3 p-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">TRANSPORTER:</span>
                    <strong className="text-slate-900">{selectedBillForPrint.transporterName}</strong>
                    <div className="font-mono text-slate-500">{selectedBillForPrint.transporterId}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">VEHICLE NO:</span>
                    <strong className="text-slate-900 font-mono text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {selectedBillForPrint.vehicleNumber}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">APPROX DISTANCE:</span>
                    <strong className="text-slate-900 font-mono">{selectedBillForPrint.distanceKm} KM</strong>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-slate-200">
                This document is computer generated under Rule 138 of the Central Goods and Services Tax Rules, 2017.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EWayBillPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
          <span>Loading E-Way Bill System...</span>
        </div>
      }
    >
      <EWayBillPageContent />
    </Suspense>
  );
}
