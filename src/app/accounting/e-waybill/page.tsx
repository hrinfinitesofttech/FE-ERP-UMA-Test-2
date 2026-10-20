'use client';

import React, { useState, useMemo } from 'react';
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
  Building
} from 'lucide-react';

interface EWayBillRecord {
  id: string;
  ewayBillNo: string;
  invoiceNumber: string;
  invoiceDate: string;
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

export default function EWayBillPage() {
  const { salesInvoices, customers } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<EWayBillRecord | null>(null);

  // Form State
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState('');
  const [transporterName, setTransporterName] = useState('V-Trans India Ltd');
  const [transporterId, setTransporterId] = useState('24AAACV1234F1Z0');
  const [vehicleNumber, setVehicleNumber] = useState('GJ-01-BX-4455');
  const [distanceKm, setDistanceKm] = useState<number | string>(180);
  const [destinationPincode, setDestinationPincode] = useState('382415');

  // Stored E-Way Bills (Persisted in localStorage with initial defaults)
  const [ewayBills, setEwayBills] = useState<EWayBillRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('UMA_ERP_ewayBills');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
    }
    return [
      {
        id: 'EWB-001',
        ewayBillNo: '241098765432',
        invoiceNumber: 'INV-2026-0001',
        invoiceDate: '2026-08-20',
        customerName: 'Tata Steel Processing Ltd',
        customerGstin: '24AAACT1234A1Z5',
        deliveryPincode: '382445',
        transporterName: 'V-Trans India Ltd',
        transporterId: '24AAACV1234F1Z0',
        vehicleNumber: 'GJ-01-BX-7890',
        distanceKm: 240,
        consignmentValue: 4484000,
        validUpto: '2026-08-22',
        status: 'Active',
        generatedDate: '2026-08-20',
      },
      {
        id: 'EWB-002',
        ewayBillNo: '241087654321',
        invoiceNumber: 'INV-2026-0002',
        invoiceDate: '2026-08-18',
        customerName: 'Jindal Steel & Power Ltd',
        customerGstin: '24AAACJ9876B1Z2',
        deliveryPincode: '394101',
        transporterName: 'Gati KWE Logistics',
        transporterId: '24AAACG5678C1Z8',
        vehicleNumber: 'GJ-06-ZZ-1234',
        distanceKm: 310,
        consignmentValue: 2850000,
        validUpto: '2026-08-21',
        status: 'Delivered',
        generatedDate: '2026-08-18',
      },
    ];
  });

  // Eligible Invoices (> ₹50,000 threshold for Indian E-Way Bill rules)
  const eligibleInvoices = useMemo(() => {
    return (salesInvoices || []).filter((inv) => {
      const total = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
      return total >= 50000;
    });
  }, [salesInvoices]);

  const handleOpenModal = () => {
    if (eligibleInvoices.length > 0) {
      setSelectedInvoiceNo(eligibleInvoices[0].invoiceNumber || eligibleInvoices[0].id);
      const cust = customers.find((c) => c.id === eligibleInvoices[0].customerId);
      if (cust && (cust as any).pincode) {
        setDestinationPincode((cust as any).pincode);
      }
    }
    setIsModalOpen(true);
  };

  const handleGenerateEWayBill = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedInv = salesInvoices.find(
      (inv) => inv.invoiceNumber === selectedInvoiceNo || inv.id === selectedInvoiceNo
    );

    const val = Number(matchedInv?.grandTotal ?? (matchedInv as any)?.grand_total ?? 150000);
    const dist = Number(distanceKm) || 150;
    const daysValid = Math.max(1, Math.ceil(dist / 200));
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + daysValid);

    const random12Digit = `24${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const newEwb: EWayBillRecord = {
      id: `EWB-${Date.now().toString().slice(-4)}`,
      ewayBillNo: random12Digit,
      invoiceNumber: selectedInvoiceNo || 'INV-2026-0001',
      invoiceDate: matchedInv?.invoiceDate || new Date().toISOString().split('T')[0],
      customerName: matchedInv?.customerName || 'Customer Ltd',
      customerGstin: (matchedInv as any)?.customerGstin || '24AAACX0000X1Z1',
      deliveryPincode: destinationPincode || '382415',
      transporterName: transporterName || 'V-Trans Logistics',
      transporterId: transporterId || '24AAACV1234F1Z0',
      vehicleNumber: vehicleNumber || 'GJ-01-AX-9999',
      distanceKm: dist,
      consignmentValue: val,
      validUpto: validDate.toISOString().split('T')[0],
      status: 'Active',
      generatedDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newEwb, ...ewayBills];
    setEwayBills(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('UMA_ERP_ewayBills', JSON.stringify(updated));
      } catch (_) {}
    }

    setIsModalOpen(false);
    setSelectedBillForPrint(newEwb);
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
                <th className="py-3 px-4">INVOICE NO</th>
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
              {filtered.length === 0 ? (
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
                      {b.invoiceNumber}
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
                      <button
                        type="button"
                        onClick={() => setSelectedBillForPrint(b)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 mx-auto cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                      </button>
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
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Select Qualifying Sales Invoice (&gt; ₹50,000) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedInvoiceNo}
                  onChange={(e) => setSelectedInvoiceNo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-sky-500"
                  required
                >
                  {eligibleInvoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNumber || inv.id}>
                      {inv.invoiceNumber || inv.id} — {inv.customerName} (₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
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
                    min="1"
                    required
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Destination PIN
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={destinationPincode}
                    onChange={(e) => setDestinationPincode(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-[11px] space-y-1">
                <div className="font-bold">E-Way Bill Validity Calculation:</div>
                <div>Dispatched from: 382415 (Odhav GIDC, Ahmedabad) ➔ Distance: {distanceKm} KM</div>
                <div className="text-slate-500">Validity: Valid for 2 Days under standard road transport rules.</div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs active:scale-95 transition"
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
                  onClick={() => window.print()}
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
            <div className="border border-slate-300 rounded-xl p-5 space-y-4 text-xs font-sans">
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
