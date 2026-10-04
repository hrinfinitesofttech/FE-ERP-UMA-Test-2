'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DispatchOrder, DispatchStatus } from '../../../types/production';
import {
  Truck,
  Plus,
  ShieldCheck,
  Building,
  Search,
  Printer,
  Eye,
  Edit,
  Trash2,
  X,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowUpRight,
  MapPin,
  Calendar,
  Phone,
  FileText,
  User,
  Package,
} from 'lucide-react';

export default function DispatchPage() {
  const {
    dispatchOrders,
    finishedGoods,
    workOrders,
    customers,
    projectJobs,
    addDispatchOrder,
    updateDispatchOrder,
    deleteDispatchOrder,
    markDispatchInTransit,
    markDispatchDelivered,
    openJobModal,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCustomer, setFilterCustomer] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingDisp, setEditingDisp] = useState<DispatchOrder | null>(null);
  const [viewChallan, setViewChallan] = useState<DispatchOrder | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const defaultWo = workOrders[0]?.workOrderNumber || 'WO-2026-001-A';
  const defaultJob = workOrders[0]?.jobNumber || 'JOB-2026-001';
  const defaultCust = customers[0]?.companyName || 'Reliance Industries Limited (Jamnagar)';

  const [selectedFg, setSelectedFg] = useState('');
  const [selectedWo, setSelectedWo] = useState(defaultWo);
  const [selectedJob, setSelectedJob] = useState(defaultJob);
  const [customerName, setCustomerName] = useState(defaultCust);
  const [customerAddress, setCustomerAddress] = useState('Refinery Complex, Moti Khavdi, Jamnagar, Gujarat - 361140');
  const [destinationCity, setDestinationCity] = useState('Jamnagar');
  const [productName, setProductName] = useState('Heavy SS 316L Chemical Reactor Vessel (10 KL)');
  const [specification, setSpecification] = useState('SS 316L Limpet Coil, 10 KL Capacity, Design Pressure 6 Bar');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [uom, setUom] = useState('Unit');
  const [serialNumber, setSerialNumber] = useState('UTF-CR-2026-001');
  const [batchNumber, setBatchNumber] = useState('HEAT-SS316-9921');
  const [weightMT, setWeightMT] = useState<number | string>(8.5);
  const [transporterName, setTransporterName] = useState('Mahavir Heavy Logistics & Trailers');
  const [vehicleNumber, setVehicleNumber] = useState('GJ-01-XX-9900');
  const [lrNumber, setLrNumber] = useState('LR-2026-8899');
  const [driverName, setDriverName] = useState('Ramesh Bhai Solanki');
  const [driverMobile, setDriverMobile] = useState('9825112233');
  const [eWayBillNumber, setEWayBillNumber] = useState('EWB-24-99887766');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0089');
  const [packagingType, setPackagingType] = useState('Wooden Saddle & Tarpaulin Protection');
  const [dispatchType, setDispatchType] = useState('Road Freight (Semi Low Bed Trailer)');
  const [qcClearanceBy, setQcClearanceBy] = useState('Sanjay Mehta (QC Lead)');
  const [dispatchedBy, setDispatchedBy] = useState('Pravin Patel (Dispatch Manager)');
  const [status, setStatus] = useState<DispatchStatus>('Ready for Dispatch');
  const [remarks, setRemarks] = useState('FAT inspection cleared, ready for customer transit.');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setEditingDisp(null);
        setViewChallan(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFgSelect = (fgNo: string) => {
    setSelectedFg(fgNo);
    const fg = finishedGoods.find((f) => f.finishedGoodsNumber === fgNo || f.id === fgNo);
    if (fg) {
      setSelectedWo(fg.workOrderNumber || defaultWo);
      setSelectedJob(fg.jobNumber || defaultJob);
      setProductName(fg.productName || '');
      setSpecification(fg.specification || '');
      setSerialNumber(fg.serialNumber || `UTF-SER-${Date.now().toString().slice(-4)}`);
      setBatchNumber(fg.batchNumber || '');
      setQuantity(fg.quantity || 1);
      setUom(fg.uom || 'Unit');
    }
  };

  const handleCustomerSelect = (custName: string) => {
    setCustomerName(custName);
    const c = customers.find((cust) => cust.companyName === custName);
    if (c) {
      setCustomerAddress(c.shippingAddress || c.billingAddress || `${c.city}, ${c.state}`);
      setDestinationCity(c.city || 'Ahmedabad');
    }
  };

  const openCreateModal = () => {
    setEditingDisp(null);
    const firstFg = finishedGoods[0];
    if (firstFg) {
      handleFgSelect(firstFg.finishedGoodsNumber);
    } else {
      setSelectedWo(workOrders[0]?.workOrderNumber || 'WO-2026-001-A');
      setSelectedJob(workOrders[0]?.jobNumber || 'JOB-2026-001');
      setProductName('Heavy SS 316L Chemical Reactor Vessel (10 KL)');
    }
    const cust = customers[0];
    setCustomerName(cust?.companyName || 'Reliance Industries Limited (Jamnagar)');
    setCustomerAddress(cust?.shippingAddress || 'Refinery Complex, Moti Khavdi, Jamnagar, Gujarat - 361140');
    setDestinationCity(cust?.city || 'Jamnagar');
    setWeightMT(8.5);
    setTransporterName('Mahavir Heavy Logistics & Trailers');
    setVehicleNumber(`GJ-${Math.floor(Math.random() * 30 + 1).toString().padStart(2, '0')}-AB-${Math.floor(Math.random() * 8999 + 1000)}`);
    setLrNumber(`LR-2026-${Date.now().toString().slice(-4)}`);
    setDriverName('Ramesh Bhai Solanki');
    setDriverMobile('9825112233');
    setEWayBillNumber(`EWB-24-${Date.now().toString().slice(-8)}`);
    setInvoiceNumber(`INV-2026-${Date.now().toString().slice(-4)}`);
    setPackagingType('Wooden Saddle & Tarpaulin Protection');
    setDispatchType('Road Freight (Semi Low Bed Trailer)');
    setStatus('Ready for Dispatch');
    setShowModal(true);
  };

  const openEditModal = (disp: DispatchOrder) => {
    setEditingDisp(disp);
    setSelectedFg(disp.finishedGoodsNumber || '');
    setSelectedWo(disp.workOrderNumber || '');
    setSelectedJob(disp.jobNumber || '');
    setCustomerName(disp.customerName || '');
    setCustomerAddress(disp.customerAddress || '');
    setDestinationCity(disp.destinationCity || '');
    setProductName(disp.productName || '');
    setSpecification(disp.specification || '');
    setQuantity(disp.quantity || 1);
    setUom(disp.uom || 'Unit');
    setSerialNumber(disp.serialNumber || '');
    setBatchNumber(disp.batchNumber || '');
    setWeightMT(disp.weightMT || 0);
    setTransporterName(disp.transporterName || '');
    setVehicleNumber(disp.vehicleNumber || '');
    setLrNumber(disp.lrNumber || '');
    setDriverName(disp.driverName || '');
    setDriverMobile(disp.driverMobile || '');
    setEWayBillNumber(disp.eWayBillNumber || '');
    setInvoiceNumber(disp.invoiceNumber || '');
    setPackagingType(disp.packagingType || 'Wooden Saddle & Tarpaulin Protection');
    setDispatchType(disp.dispatchType || 'Road Freight (Semi Low Bed Trailer)');
    setStatus(disp.status || 'Ready for Dispatch');
    setRemarks(disp.remarks || '');
    setShowModal(true);
  };

  const handleDelete = (id: string, dispNo: string) => {
    if (confirm(`Are you sure you want to delete Dispatch record ${dispNo}?`)) {
      deleteDispatchOrder(id);
    }
  };

  const handleStatusCycle = (disp: DispatchOrder) => {
    const sequence: DispatchStatus[] = [
      'Ready for Dispatch',
      'Vehicle Loading',
      'In Transit',
      'Delivered to Site',
      'Handover Complete',
    ];
    const currentIndex = sequence.indexOf(disp.status);
    const nextStatus = sequence[(currentIndex + 1) % sequence.length];
    updateDispatchOrder(disp.id, { status: nextStatus });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedWo = workOrders.find((w) => w.workOrderNumber === selectedWo);
    const matchedJob = projectJobs.find((j) => j.jobNumber === (matchedWo?.jobNumber || selectedJob));

    const payload = {
      dispatchDate: new Date().toISOString().split('T')[0],
      jobId: matchedWo?.jobId || matchedJob?.id || selectedJob || 'JOB-2026-001',
      jobNumber: matchedWo?.jobNumber || matchedJob?.jobNumber || selectedJob || 'JOB-2026-001',
      workOrderNumber: selectedWo || 'WO-2026-001-A',
      finishedGoodsNumber: selectedFg || undefined,
      customerId: customers.find((c) => c.companyName === customerName)?.id || 'CUST-001',
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim(),
      destinationCity: destinationCity.trim(),
      productName: productName.trim(),
      specification: specification.trim(),
      quantity: Number(quantity) || 1,
      uom: uom || 'Unit',
      serialNumber: serialNumber.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      weightMT: Number(weightMT) || 0,
      transporterName: transporterName.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      lrNumber: lrNumber.trim() || undefined,
      driverName: driverName.trim() || undefined,
      driverMobile: driverMobile.trim() || undefined,
      eWayBillNumber: eWayBillNumber.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      packagingType: packagingType,
      dispatchType: dispatchType,
      qcClearanceBy: qcClearanceBy,
      dispatchedBy: dispatchedBy,
      status: status,
      remarks: remarks,
    };

    if (editingDisp) {
      updateDispatchOrder(editingDisp.id, payload);
    } else {
      addDispatchOrder(payload);
    }

    setShowModal(false);
    setEditingDisp(null);
  };

  // Filtered Dispatches
  const filtered = useMemo(() => {
    return dispatchOrders.filter((disp) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        disp.dispatchNumber?.toLowerCase().includes(q) ||
        disp.jobNumber?.toLowerCase().includes(q) ||
        disp.workOrderNumber?.toLowerCase().includes(q) ||
        disp.customerName?.toLowerCase().includes(q) ||
        disp.productName?.toLowerCase().includes(q) ||
        disp.vehicleNumber?.toLowerCase().includes(q) ||
        disp.lrNumber?.toLowerCase().includes(q) ||
        disp.eWayBillNumber?.toLowerCase().includes(q);

      const matchesStatus = filterStatus === 'ALL' || disp.status === filterStatus;
      const matchesCustomer = filterCustomer === 'ALL' || disp.customerName === filterCustomer;

      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [dispatchOrders, searchTerm, filterStatus, filterCustomer]);

  // Metrics
  const totalDispatches = dispatchOrders.length;
  const inTransitCount = dispatchOrders.filter((d) => d.status === 'In Transit' || d.status === 'Vehicle Loading').length;
  const deliveredCount = dispatchOrders.filter((d) => d.status === 'Delivered to Site' || d.status === 'Handover Complete').length;
  const totalWeightMT = dispatchOrders.reduce((sum, d) => sum + Number(d.weightMT || 0), 0);

  if (!mounted) {
    return (
      <div className="p-6 bg-[#FAF7F2] min-h-screen text-[#544B45] flex items-center justify-center">
        <div className="text-xs font-mono text-[#70665F]">Loading Dispatch & Logistics Management...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-700 border border-indigo-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-800 font-mono font-bold border border-indigo-500/20">
                LOGISTICS & TRANSPORT
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 font-bold border border-emerald-500/30">
                Delivery Challan (Form Annexure 1)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#211B17] tracking-tight mt-1">
              Equipment Dispatch & Delivery Challans
            </h1>
            <p className="text-xs text-[#70665F]">
              Gate-Out Delivery Challans, E-Way Bills, Transporter LR, Vehicle Loading, and Customer Site Handover
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-700/20 hover:bg-indigo-800 transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Generate Delivery Challan
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-[#70665F] uppercase">Total Dispatches</div>
          <div className="text-2xl font-black text-[#211B17] font-mono mt-1">{totalDispatches}</div>
          <div className="text-[11px] text-[#70665F] mt-0.5">Recorded Gate Passes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Vehicles In Transit</div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">{inTransitCount} En Route</div>
          <div className="text-[11px] text-amber-600 mt-0.5">On Road to Client Site</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Delivered & Handover</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{deliveredCount} Units</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Received at Customer Plant</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-indigo-700 uppercase">Total Freight Weight</div>
          <div className="text-2xl font-black text-indigo-700 font-mono mt-1">{totalWeightMT.toFixed(1)} MT</div>
          <div className="text-[11px] text-indigo-600 mt-0.5">Heavy Fabricated Load</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search Challan #, Job #, Client, Vehicle, LR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] placeholder-[#70665F] focus:outline-none focus:border-indigo-600"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-indigo-600 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Ready for Dispatch">Ready for Dispatch</option>
            <option value="Vehicle Loading">Vehicle Loading</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered to Site">Delivered to Site</option>
            <option value="Handover Complete">Handover Complete</option>
          </select>
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Showing <span className="text-[#211B17] font-bold">{filtered.length}</span> of{' '}
          <span className="text-[#211B17] font-bold">{dispatchOrders.length}</span> Consignments
        </div>
      </div>

      {/* Dispatch Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-mono uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Challan # & Date</th>
                <th className="p-3.5">Customer & Destination</th>
                <th className="p-3.5">Job & Equipment</th>
                <th className="p-3.5">Vehicle & Transporter</th>
                <th className="p-3.5 text-right">Weight (MT)</th>
                <th className="p-3.5">E-Way Bill & LR</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#70665F]">
                    No dispatch delivery challans found. Click &quot;Generate Delivery Challan&quot; to issue a gate pass.
                  </td>
                </tr>
              ) : (
                filtered.map((disp) => (
                  <tr key={disp.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="p-3.5 font-medium">
                      <div className="font-mono font-bold text-indigo-700">{disp.dispatchNumber}</div>
                      <div className="text-[10px] text-[#70665F] mt-0.5">{disp.dispatchDate}</div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-[#211B17] flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-indigo-600" />
                        {disp.customerName}
                      </div>
                      <div className="text-[10px] text-[#70665F] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {disp.destinationCity || 'Site Location'}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-[#211B17]">{disp.productName}</div>
                      <div className="font-mono text-emerald-700 text-[11px] mt-0.5 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {disp.jobNumber} • {disp.workOrderNumber}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-[#211B17] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EBE3DB] w-fit">
                        {disp.vehicleNumber}
                      </div>
                      <div className="text-[11px] text-[#70665F] mt-0.5">{disp.transporterName}</div>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#211B17]">
                      {disp.weightMT ? `${disp.weightMT} MT` : '-'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-sky-700 font-bold">{disp.eWayBillNumber || 'Pending EWB'}</div>
                      <div className="text-[#70665F] mt-0.5">LR: {disp.lrNumber || '-'}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleStatusCycle(disp)}
                        title="Click to advance status"
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          disp.status === 'Delivered to Site' || disp.status === 'Handover Complete'
                            ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
                            : disp.status === 'In Transit'
                            ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                            : 'bg-sky-500/15 text-sky-800 border-sky-500/30'
                        }`}
                      >
                        <Truck className="w-3 h-3" />
                        {disp.status}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openJobModal(disp.jobNumber)}
                          className="px-2 py-1 rounded-lg bg-[#FAF7F2] hover:bg-indigo-50 text-indigo-800 border border-[#EBE3DB] hover:border-indigo-300 text-[11px] font-bold transition"
                          title="360° Traceability"
                        >
                          360° Trace
                        </button>
                        <button
                          onClick={() => setViewChallan(disp)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-800 border border-[#EBE3DB] hover:border-emerald-300 transition"
                          title="View & Print Delivery Challan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(disp)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-sky-50 text-sky-800 border border-[#EBE3DB] hover:border-sky-300 transition"
                          title="Edit Dispatch Record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(disp.id, disp.dispatchNumber)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-rose-50 text-rose-700 border border-[#EBE3DB] hover:border-rose-300 transition"
                          title="Delete Dispatch Record"
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

      {/* Generate / Edit Dispatch Challan Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl text-[#544B45] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-700" />
                  {editingDisp ? 'Edit Delivery Challan' : 'Generate Delivery Challan & Gate Pass'}
                </h3>
                <p className="text-[11px] text-[#70665F]">
                  Form Annexure 1 Dispatch Note for Heavy Engineering Equipment Transportation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#70665F] hover:text-[#211B17] font-bold text-lg p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Equipment & Job Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Select Finished Goods Item</label>
                  <select
                    value={selectedFg}
                    onChange={(e) => handleFgSelect(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-indigo-600 font-mono"
                  >
                    <option value="">-- Choose Finished Goods (Optional) --</option>
                    {finishedGoods.map((fg) => (
                      <option key={fg.id} value={fg.finishedGoodsNumber}>
                        {fg.finishedGoodsNumber} — {fg.productName.slice(0, 30)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Target Work Order *</label>
                  <select
                    required
                    value={selectedWo}
                    onChange={(e) => setSelectedWo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-indigo-600 font-mono"
                  >
                    {workOrders.length > 0 ? (
                      workOrders.map((w) => (
                        <option key={w.id} value={w.workOrderNumber}>
                          {w.workOrderNumber} — {w.jobNumber}
                        </option>
                      ))
                    ) : (
                      <option value="WO-2026-001-A">WO-2026-001-A — JOB-2026-001</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Consignee / Customer *</label>
                  <select
                    required
                    value={customerName}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-indigo-600 font-semibold"
                  >
                    {customers.length > 0 ? (
                      customers.map((c) => (
                        <option key={c.id} value={c.companyName}>
                          {c.companyName} ({c.city})
                        </option>
                      ))
                    ) : (
                      <option value="Reliance Industries Limited (Jamnagar)">
                        Reliance Industries Limited (Jamnagar)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Destination City / Site *</label>
                  <input
                    type="text"
                    required
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="e.g. Jamnagar, Dahej, Hazira"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#70665F] mb-1">Customer Delivery Address</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Full Delivery Site Address"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Product Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Machine / Product Description *</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Equipment Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. UTF-CR-2026-001"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              {/* Logistics & Transporter Details */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                <div className="text-xs font-bold text-[#211B17]">Transport & Vehicle Logistics</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#70665F] mb-1">Vehicle / Trailer # *</label>
                    <input
                      type="text"
                      required
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="e.g. GJ-01-XX-9900"
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-[#211B17] font-mono font-bold uppercase focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#70665F] mb-1">Transporter Name *</label>
                    <input
                      type="text"
                      required
                      value={transporterName}
                      onChange={(e) => setTransporterName(e.target.value)}
                      placeholder="e.g. Mahavir Heavy Logistics"
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-[#211B17] focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#70665F] mb-1">Lorry Receipt (LR) #</label>
                    <input
                      type="text"
                      value={lrNumber}
                      onChange={(e) => setLrNumber(e.target.value)}
                      placeholder="e.g. LR-2026-8899"
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-[#211B17] font-mono focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#70665F] mb-1">Driver Name</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Driver Name"
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-[#211B17] focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#70665F] mb-1">Driver Mobile</label>
                    <input
                      type="text"
                      value={driverMobile}
                      onChange={(e) => setDriverMobile(e.target.value)}
                      placeholder="9825xxxxxx"
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-[#211B17] font-mono focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#70665F] mb-1">E-Way Bill #</label>
                    <input
                      type="text"
                      value={eWayBillNumber}
                      onChange={(e) => setEWayBillNumber(e.target.value)}
                      placeholder="EWB-24-xxxx"
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-sky-700 font-mono font-bold focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#70665F] mb-1">Weight (MT)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightMT}
                      onChange={(e) => setWeightMT(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="8.5"
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-[#211B17] font-mono font-bold focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Packaging */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Packaging Protection</label>
                  <select
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Wooden Saddle & Tarpaulin Protection">Wooden Saddle & Tarpaulin Protection</option>
                    <option value="Heavy Wooden Crate (Export Packaging)">Heavy Wooden Crate (Export Packaging)</option>
                    <option value="Steel Skid with Shrink Wrap">Steel Skid with Shrink Wrap</option>
                    <option value="Bare Equipment on Trailer">Bare Equipment on Trailer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Dispatch Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-indigo-600 font-bold"
                  >
                    <option value="Ready for Dispatch">Ready for Dispatch</option>
                    <option value="Vehicle Loading">Vehicle Loading</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered to Site">Delivered to Site</option>
                    <option value="Handover Complete">Handover Complete</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] font-semibold hover:bg-[#EBE3DB] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-700 font-bold text-white hover:bg-indigo-800 shadow-lg shadow-indigo-700/20 transition active:scale-95"
                >
                  {editingDisp ? 'Update Delivery Challan' : 'Issue Delivery Challan & Gate Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Delivery Challan Slip Modal */}
      {viewChallan && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Slip Header */}
            <div className="flex items-start justify-between border-b border-[#EBE3DB] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-indigo-500/15 text-indigo-800 font-mono text-[10px] font-bold">
                  DELIVERY CHALLAN & GATE-OUT PASS (ANNEXURE 1)
                </span>
                <h3 className="text-xl font-black text-[#211B17] mt-1">
                  {viewChallan.dispatchNumber}
                </h3>
                <p className="text-xs text-[#70665F]">
                  Date: <span className="font-bold text-[#211B17]">{viewChallan.dispatchDate}</span> • Status:{' '}
                  <span className="font-bold text-indigo-700">{viewChallan.status}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-indigo-50 text-indigo-800 border border-[#EBE3DB] text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print Challan
                </button>
                <button
                  onClick={() => setViewChallan(null)}
                  className="p-2 rounded-xl text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Consignor & Consignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div className="text-[10px] font-bold text-[#70665F] uppercase">Consignor (Dispatched By)</div>
                <div className="font-black text-sm text-[#211B17] mt-0.5">UMA TECHNO FAB</div>
                <div className="text-[#70665F] text-[11px] mt-0.5">
                  Plot 45, GIDC Vatva Industrial Estate, Ahmedabad, Gujarat - 382445
                </div>
                <div className="text-[#70665F] text-[11px] font-mono mt-1">GSTIN: 24AAACU1234M1Z5</div>
              </div>

              <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-200">
                <div className="text-[10px] font-bold text-indigo-700 uppercase">Consignee (Delivered To)</div>
                <div className="font-black text-sm text-[#211B17] mt-0.5">{viewChallan.customerName}</div>
                <div className="text-[#544B45] text-[11px] mt-0.5">
                  {viewChallan.customerAddress || `${viewChallan.destinationCity}, Site Location`}
                </div>
                <div className="text-[#70665F] text-[11px] font-mono mt-1">Destination: {viewChallan.destinationCity}</div>
              </div>
            </div>

            {/* Equipment Description */}
            <div className="p-4 bg-white rounded-xl border border-[#EBE3DB] space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-black text-sm text-[#211B17]">{viewChallan.productName}</div>
                  {viewChallan.specification && (
                    <div className="text-[#70665F] text-[11px] mt-0.5">{viewChallan.specification}</div>
                  )}
                </div>
                <div className="text-right font-mono">
                  <div className="font-extrabold text-sm text-emerald-800">
                    {viewChallan.quantity} {viewChallan.uom}
                  </div>
                  {viewChallan.weightMT ? <div className="text-[11px] text-[#70665F]">{viewChallan.weightMT} MT</div> : null}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#EBE3DB] text-[11px] font-mono">
                <div>
                  <span className="text-[#70665F]">Job #:</span>{' '}
                  <span className="font-bold text-[#211B17]">{viewChallan.jobNumber}</span>
                </div>
                <div>
                  <span className="text-[#70665F]">WO #:</span>{' '}
                  <span className="font-bold text-[#211B17]">{viewChallan.workOrderNumber}</span>
                </div>
                <div>
                  <span className="text-[#70665F]">Serial #:</span>{' '}
                  <span className="font-bold text-[#211B17]">{viewChallan.serialNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#70665F]">Heat #:</span>{' '}
                  <span className="font-bold text-[#211B17]">{viewChallan.batchNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Transport & Vehicle Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] text-xs">
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">Vehicle Number</span>
                <span className="font-mono font-bold text-[#211B17] text-sm">{viewChallan.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">Transporter</span>
                <span className="font-semibold text-[#211B17]">{viewChallan.transporterName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">LR (Lorry Receipt) #</span>
                <span className="font-mono font-bold text-indigo-700">{viewChallan.lrNumber || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">E-Way Bill #</span>
                <span className="font-mono font-bold text-sky-700">{viewChallan.eWayBillNumber || '-'}</span>
              </div>
            </div>

            {/* Driver & Signoff */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-[#EBE3DB] text-xs">
              <div>
                <span className="text-[10px] text-[#70665F] block font-semibold">Driver Details</span>
                <span className="font-bold text-[#211B17]">{viewChallan.driverName || 'Designated Driver'}</span>
                {viewChallan.driverMobile && (
                  <span className="text-[#70665F] block font-mono text-[11px]">{viewChallan.driverMobile}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block font-semibold">QC Clearance Signoff</span>
                <span className="font-bold text-emerald-700">{viewChallan.qcClearanceBy || 'Quality Manager'}</span>
                <span className="text-[10px] text-emerald-600 block">FAT & Hydro Passed</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block font-semibold">Dispatched By</span>
                <span className="font-bold text-[#211B17]">{viewChallan.dispatchedBy || 'Dispatch Lead'}</span>
                <span className="text-[10px] text-[#70665F] block">Gate Out Passed</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setViewChallan(null);
                  openJobModal(viewChallan.jobNumber);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-300 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition"
              >
                View 360° Trace <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setViewChallan(null)}
                className="px-5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] text-xs font-semibold"
              >
                Close Challan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
