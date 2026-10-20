'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import {
  DeliveryChallanDoc,
  DeliveryChallanItem,
  DispatchOrder,
  ProductionCompletion,
} from '../../../types/production';
import { formatDate } from '../../../lib/utils';
import { toast } from '@/context/ToastContext';
import {
  Truck,
  Plus,
  ShieldCheck,
  Search,
  Printer,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  MapPin,
  Calendar,
  Phone,
  FileText,
  User,
  Package,
  Layers,
  Sparkles,
  Award,
  Building,
  RotateCcw,
  Check,
  Save,
  Share2,
  Palette,
  Clock,
} from 'lucide-react';

// Default sample challans (including exact replica of user photo Ch. No. 547)
const INITIAL_DELIVERY_CHALLANS: DeliveryChallanDoc[] = [
  {
    id: 'CHALLAN-547',
    challanNo: '547',
    date: '2026-06-26',
    copyNumber: '1',
    companyName: 'UMA TECHNOFAB',
    companyLogoText: 'UMA TECHNO FAB',
    companyTagline: 'All Industrial Equipments. Tranki Projects...',
    companyPhones: 'Mo. : 98250 98367 / 99250 11676',
    companyAddress:
      'S.No. 1040/3, Village : Rajpur, Nr. Sandvik Tube, Ta-Kadi, Dist-Mehsana. Pin Code - 382721',
    gstin: '24AAEFU9027H1Z3',
    jurisdiction: 'Subject to KALOL (N.G) Jurisdiction',
    customerName: 'UMA Food',
    customerAddress: 'GIDC Industrial Estate, Rajpur Road, Kadi - 382715',
    destinationCity: 'Kadi',
    vehicleNumber: 'GJ-02.AT.3826',
    transporterName: 'Local Transport (Kadi)',
    items: [
      {
        srNo: 1,
        particulars: 'Berger Luxol PU Enamel. W-305\n05 Drum.',
        quantity: '20',
        unitOrAmount: '4 Ltr',
        notes: '05 Drums of 4 Ltr each (Total 20 Ltr)',
      },
    ],
    totalQuantity: '20 Ltr',
    totalAmount: '20 Ltr',
    department: 'Paint & Surface Coating Store',
    receiverSign: '',
    authorizedSignatory: 'UMA Technofab Dispatch Officer',
    status: 'Delivered',
    remarks: 'Dispatched in Vehicle GJ-02.AT.3826. Received in good condition.',
    createdAt: '2026-06-26T10:30:00Z',
  },
  {
    id: 'CHALLAN-548',
    challanNo: '548',
    date: '2026-05-09',
    copyNumber: '1',
    companyName: 'UMA TECHNOFAB',
    companyLogoText: 'UMA TECHNO FAB',
    companyTagline: 'All Industrial Equipments. Tranki Projects...',
    companyPhones: 'Mo. : 98250 98367 / 99250 11676',
    companyAddress:
      'S.No. 1040/3, Village : Rajpur, Nr. Sandvik Tube, Ta-Kadi, Dist-Mehsana. Pin Code - 382721',
    gstin: '24AAEFU9027H1Z3',
    jurisdiction: 'Subject to KALOL (N.G) Jurisdiction',
    customerName: 'Ananth Chem',
    customerAddress: 'Plot 102/B, GIDC Chemical Zone, Jhagadia, Dist. Bharuch, Gujarat - 393110',
    destinationCity: 'Jhagadia',
    projectId: 'PRJ-2026-001',
    jobNumber: 'UTF-26-46 B',
    workOrderNumber: 'UTF-26-46 B',
    qcReportNo: 'QC-2026-001 (F - QAS - 02)',
    vehicleNumber: 'GJ-01-CZ-4521',
    transporterName: 'Mahavir Heavy Logistics',
    lrNumber: 'LR-2026-9182',
    driverName: 'Ramesh Patel',
    driverMobile: '98254 77812',
    eWayBillNumber: 'EWB-24-99812401',
    items: [
      {
        srNo: 1,
        particulars:
          '25 KL Vertical Tank (SS304 / MS)\nInspection Cleared as per Doc no.: F - QAS - 02\nHydro Tested & Primer Painted.',
        quantity: '1',
        unitOrAmount: '1 Nos',
        notes: 'Loaded on Low-bed Trailer with wooden saddles and tarpaulin cover.',
      },
    ],
    totalQuantity: '1 Nos',
    totalAmount: '1 Nos Equipment',
    department: 'Heavy Fabrication Dispatch',
    receiverSign: '',
    authorizedSignatory: 'UMA Technofab Dispatch Officer',
    status: 'In Transit',
    remarks: 'Dispatched with Gate Out Pass & E-Way Bill after QC Clearance.',
    createdAt: '2026-05-09T14:15:00Z',
  },
];

export default function DispatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    dispatchOrders,
    finishedGoods,
    customers,
    projectJobs,
    projectPlanningRecords,
    productionCompletions,
    addDispatchOrder,
  } = useERP();

  // Delivery Challan List (Persisted in localStorage)
  const [challans, setChallans] = useState<DeliveryChallanDoc[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('UMA_ERP_deliveryChallans');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_DELIVERY_CHALLANS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('UMA_ERP_deliveryChallans', JSON.stringify(challans));
      } catch (_) {}
    }
  }, [challans]);

  // Inspection Reports from localStorage (for 1-click QC link)
  const [inspectionReports, setInspectionReports] = useState<ProductionCompletion[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('UMA_ERP_inspectionReports');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return productionCompletions || [];
  });

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Draft' | 'Issued' | 'In Transit' | 'Delivered'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [viewChallan, setViewChallan] = useState<DeliveryChallanDoc | null>(null);
  const [editingChallanId, setEditingChallanId] = useState<string | null>(null);

  // Print View Theme: 'yellow' (authentic physical yellow paper) or 'white' (clean A4 paper)
  const [slipTheme, setSlipTheme] = useState<'yellow' | 'white'>('yellow');

  // Quick Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --------------------------------------------------------------------------
  // FORM STATE FOR NEW / EDIT DELIVERY CHALLAN (Doc replica)
  // --------------------------------------------------------------------------
  const [formChallanNo, setFormChallanNo] = useState('549');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formCopyNo, setFormCopyNo] = useState('1');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerAddress, setFormCustomerAddress] = useState('');
  const [formDestinationCity, setFormDestinationCity] = useState('');
  const [formVehicleNumber, setFormVehicleNumber] = useState('GJ-02.AT.3826');
  const [formTransporterName, setFormTransporterName] = useState('');
  const [formLrNumber, setFormLrNumber] = useState('');
  const [formDriverName, setFormDriverName] = useState('');
  const [formDriverMobile, setFormDriverMobile] = useState('');
  const [formEWayBillNumber, setFormEWayBillNumber] = useState('');
  const [formDepartment, setFormDepartment] = useState('Dispatch / Store');
  const [formStatus, setFormStatus] = useState<'Draft' | 'Issued' | 'In Transit' | 'Delivered'>('Issued');
  const [formRemarks, setFormRemarks] = useState('');
  const [formJobNumber, setFormJobNumber] = useState('');
  const [formQcReportNo, setFormQcReportNo] = useState('');

  // Dynamic Line Items
  const [formItems, setFormItems] = useState<DeliveryChallanItem[]>([
    {
      srNo: 1,
      particulars: 'Industrial Equipment Fabrication / Parts',
      quantity: '1',
      unitOrAmount: '1 Nos',
      notes: '',
    },
  ]);

  // Next Challan Number Generator
  const generateNextChallanNo = () => {
    const nums = challans
      .map((c) => parseInt(c.challanNo, 10))
      .filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 548;
    return String(max + 1);
  };

  // Check URL params on load (e.g. from completion QC page: /production/dispatch?fromQC=...)
  useEffect(() => {
    const fromQC = searchParams?.get('fromQC');
    const cust = searchParams?.get('customer');
    const item = searchParams?.get('item');
    const qty = searchParams?.get('qty');
    const job = searchParams?.get('job');

    if (fromQC || cust || item) {
      setFormChallanNo(generateNextChallanNo());
      setFormDate(new Date().toISOString().split('T')[0]);
      if (cust) setFormCustomerName(decodeURIComponent(cust));
      if (job) setFormJobNumber(decodeURIComponent(job));
      if (fromQC) setFormQcReportNo(decodeURIComponent(fromQC));
      if (item) {
        setFormItems([
          {
            srNo: 1,
            particulars: `${decodeURIComponent(item)}\n(QC Cleared as per Doc no.: F - QAS - 02)`,
            quantity: qty || '1',
            unitOrAmount: `${qty || 1} Nos`,
            notes: 'Final Inspection Cleared',
          },
        ]);
      }
      setShowModal(true);
      showToast(`Pre-filled from QC Inspection: ${cust || 'Project'}`);
    }
  }, [searchParams]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingChallanId(null);
    setFormChallanNo(generateNextChallanNo());
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCopyNo('1');

    // Default to first customer if available
    const cust = customers[0];
    if (cust) {
      setFormCustomerName(cust.companyName);
      setFormCustomerAddress(cust.shippingAddress || cust.billingAddress || `${cust.city}, Gujarat`);
      setFormDestinationCity(cust.city || 'Ahmedabad');
    } else {
      setFormCustomerName('UMA Food');
      setFormCustomerAddress('GIDC Industrial Estate, Rajpur Road, Kadi - 382715');
      setFormDestinationCity('Kadi');
    }

    setFormVehicleNumber('GJ-02.AT.3826');
    setFormTransporterName('');
    setFormLrNumber('');
    setFormDriverName('');
    setFormDriverMobile('');
    setFormEWayBillNumber('');
    setFormDepartment('Dispatch / Fabrication');
    setFormStatus('Issued');
    setFormRemarks('');
    setFormJobNumber('');
    setFormQcReportNo('');
    setFormItems([
      {
        srNo: 1,
        particulars: 'Industrial Equipment Scope / Job Parts',
        quantity: '1',
        unitOrAmount: '1 Nos',
        notes: '',
      },
    ]);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (ch: DeliveryChallanDoc) => {
    setEditingChallanId(ch.id);
    setFormChallanNo(ch.challanNo);
    setFormDate(ch.date);
    setFormCopyNo(String(ch.copyNumber || '1'));
    setFormCustomerName(ch.customerName);
    setFormCustomerAddress(ch.customerAddress);
    setFormDestinationCity(ch.destinationCity || '');
    setFormVehicleNumber(ch.vehicleNumber || '');
    setFormTransporterName(ch.transporterName || '');
    setFormLrNumber(ch.lrNumber || '');
    setFormDriverName(ch.driverName || '');
    setFormDriverMobile(ch.driverMobile || '');
    setFormEWayBillNumber(ch.eWayBillNumber || '');
    setFormDepartment(ch.department || 'Dispatch');
    setFormStatus(ch.status as any);
    setFormRemarks(ch.remarks || '');
    setFormJobNumber(ch.jobNumber || '');
    setFormQcReportNo(ch.qcReportNo || '');
    setFormItems(ch.items.map((it) => ({ ...it })));
    setShowModal(true);
  };

  // 1-Click Pre-fill from QC Inspection Reports (Doc no.: F-QAS-02)
  const handlePreFillFromQC = (reportId: string) => {
    const r = inspectionReports.find((x) => x.id === reportId || x.completionNumber === reportId);
    if (!r) return;
    setFormCustomerName(r.customerName || 'Customer');
    setFormJobNumber(r.jobNumber || r.workOrderNumber || '');
    setFormQcReportNo(r.completionNumber || 'F-QAS-02');
    setFormCustomerAddress(
      `${r.customerName} Delivery Site / Plant Location`
    );
    setFormItems([
      {
        srNo: 1,
        particulars: `${r.productName || 'Process Equipment'}\n(Inspection Cleared Doc no.: F - QAS - 02)\nInspected by: ${r.inspectionBy || r.completedBy}`,
        quantity: String(r.completedQuantity || 1),
        unitOrAmount: `${r.completedQuantity || 1} Nos`,
        notes: 'Quality Inspection Cleared. Fit for dispatch.',
      },
    ]);
    showToast(`Pre-filled from QC Report ${r.completionNumber}`);
  };

  // 1-Click Pre-fill from Finished Goods
  const handlePreFillFromFG = (fgId: string) => {
    const fg = finishedGoods.find((f) => f.id === fgId || f.finishedGoodsNumber === fgId);
    if (!fg) return;
    setFormJobNumber(fg.jobNumber || fg.workOrderNumber || '');
    const relatedJob = projectJobs.find((p) => p.jobNumber === fg.jobNumber || p.id === fg.jobId);
    setFormCustomerName(fg.customerName || relatedJob?.customerName || 'Customer');
    setFormItems([
      {
        srNo: 1,
        particulars: `${fg.productName}\n${fg.specification || ''}`,
        quantity: String(fg.quantity || 1),
        unitOrAmount: `${fg.quantity || 1} ${fg.uom || 'NOS'}`,
        notes: `Finished Goods Bay: ${fg.locationBin || 'Bay 4'}`,
      },
    ]);
    showToast(`Pre-filled from Finished Goods ${fg.finishedGoodsNumber}`);
  };

  // Add Item Row
  const handleAddItemRow = () => {
    setFormItems((prev) => [
      ...prev,
      {
        srNo: prev.length + 1,
        particulars: '',
        quantity: '1',
        unitOrAmount: '1 Nos',
        notes: '',
      },
    ]);
  };

  // Update Item Row
  const handleUpdateItemRow = (index: number, field: keyof DeliveryChallanItem, val: any) => {
    setFormItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, [field]: val } : it))
    );
  };

  // Remove Item Row
  const handleRemoveItemRow = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((it, idx) => ({ ...it, srNo: idx + 1 }))
    );
  };

  // Calculate Total Quantity
  const calculatedTotalQuantity = useMemo(() => {
    const numericTotal = formItems.reduce((acc, it) => {
      const parsed = parseFloat(String(it.quantity).replace(/[^0-9.]/g, ''));
      return acc + (isNaN(parsed) ? 0 : parsed);
    }, 0);
    const firstUnit = formItems[0]?.unitOrAmount || '';
    return numericTotal > 0 ? `${numericTotal} ${firstUnit.includes('Ltr') ? 'Ltr' : firstUnit}`.trim() : '0';
  }, [formItems]);

  // Submit / Save Challan
  const handleSaveChallan = (e: React.FormEvent) => {
    e.preventDefault();

    const newChallanDoc: DeliveryChallanDoc = {
      id: editingChallanId || `CHALLAN-${Date.now()}`,
      challanNo: formChallanNo || generateNextChallanNo(),
      date: formDate,
      copyNumber: formCopyNo || '1',
      companyName: 'UMA TECHNOFAB',
      companyLogoText: 'UMA TECHNO FAB',
      companyTagline: 'All Industrial Equipments. Tranki Projects...',
      companyPhones: 'Mo. : 98250 98367 / 99250 11676',
      companyAddress:
        'S.No. 1040/3, Village : Rajpur, Nr. Sandvik Tube, Ta-Kadi, Dist-Mehsana. Pin Code - 382721',
      gstin: '24AAEFU9027H1Z3',
      jurisdiction: 'Subject to KALOL (N.G) Jurisdiction',
      customerName: formCustomerName || 'M/s Customer',
      customerAddress: formCustomerAddress || 'Customer Site Address',
      destinationCity: formDestinationCity,
      projectId: formJobNumber,
      jobNumber: formJobNumber,
      workOrderNumber: formJobNumber,
      qcReportNo: formQcReportNo,
      vehicleNumber: formVehicleNumber,
      transporterName: formTransporterName,
      lrNumber: formLrNumber,
      driverName: formDriverName,
      driverMobile: formDriverMobile,
      eWayBillNumber: formEWayBillNumber,
      items: formItems,
      totalQuantity: calculatedTotalQuantity,
      totalAmount: calculatedTotalQuantity,
      department: formDepartment || 'Dispatch / Logistics',
      receiverSign: '',
      authorizedSignatory: 'UMA Technofab Dispatch Officer',
      status: formStatus,
      remarks: formRemarks,
      createdAt: new Date().toISOString(),
    };

    if (editingChallanId) {
      setChallans((prev) =>
        prev.map((c) => (c.id === editingChallanId ? newChallanDoc : c))
      );
      showToast(`Delivery Challan #${formChallanNo} updated successfully!`);
    } else {
      setChallans((prev) => [newChallanDoc, ...prev]);

      // Also sync with dispatch orders for compatibility
      addDispatchOrder({
        dispatchDate: formDate,
        jobId: formJobNumber || 'JOB-DISP',
        jobNumber: formJobNumber || 'JOB-DISP',
        workOrderNumber: formJobNumber || 'WO-DISP',
        customerId: formCustomerName,
        customerName: formCustomerName,
        customerAddress: formCustomerAddress,
        destinationCity: formDestinationCity,
        productName: formItems[0]?.particulars || 'Fabrication Equipment',
        specification: `Challan #${formChallanNo} - Vehicle: ${formVehicleNumber}`,
        quantity: parseFloat(calculatedTotalQuantity) || 1,
        uom: 'NOS',
        transporterName: formTransporterName || 'Direct Logistics',
        vehicleNumber: formVehicleNumber,
        lrNumber: formLrNumber,
        driverName: formDriverName,
        driverMobile: formDriverMobile,
        eWayBillNumber: formEWayBillNumber,
        status: formStatus === 'Delivered' ? 'Delivered to Site' : 'In Transit',
        remarks: formRemarks,
      });

      showToast(`Delivery Challan #${formChallanNo} created & issued!`);
    }

    setShowModal(false);
  };

  // Delete Challan
  const handleDeleteChallan = (id: string, chNo: string) => {
    toast.confirm({
      title: 'Delete Delivery Challan',
      message: `Are you sure you want to delete Delivery Challan #${chNo}?`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        setChallans((prev) => prev.filter((c) => c.id !== id));
        toast.success(`Delivery Challan #${chNo} deleted`);
      },
    });
  };

  // Quick Status Advance
  const handleAdvanceStatus = (ch: DeliveryChallanDoc) => {
    const nextStatus =
      ch.status === 'Draft'
        ? 'Issued'
        : ch.status === 'Issued'
        ? 'In Transit'
        : ch.status === 'In Transit'
        ? 'Delivered'
        : 'Acknowledged';

    setChallans((prev) =>
      prev.map((c) => (c.id === ch.id ? { ...c, status: nextStatus as any } : c))
    );
    showToast(`Challan #${ch.challanNo} status updated to "${nextStatus}"`);
  };

  // Filtered Challans
  const filteredChallans = useMemo(() => {
    return challans.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          c.challanNo.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          (c.customerAddress && c.customerAddress.toLowerCase().includes(q)) ||
          (c.vehicleNumber && c.vehicleNumber.toLowerCase().includes(q)) ||
          (c.transporterName && c.transporterName.toLowerCase().includes(q)) ||
          c.items.some((it) => it.particulars.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [challans, statusFilter, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#211B17] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#EBE3DB]/20 text-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
            DASHBOARD / PRODUCTION &amp; LOGISTICS / DISPATCH &amp; DELIVERY CHALLAN
          </div>
          <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-600" />
            <span>Delivery Challan &amp; Gate-Out Pass</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 font-mono">
              Official Delivery Slip
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            UMA TECHNOFAB Official Delivery Challans. Generate after Production &amp; QC Clearance. Physical Yellow Slip replica with GSTIN &amp; Vehicle tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Generate Delivery Challan</span>
          </button>
          <Link
            href="/production/completion"
            className="px-3.5 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>QC Clearance (F - QAS - 02)</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Challans</span>
            <FileText className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-[#211B17]">{challans.length}</div>
          <div className="text-[11px] text-slate-500">Challan Records Logged</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Transit / On Road</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">
            {challans.filter((c) => c.status === 'In Transit').length}
          </div>
          <div className="text-[11px] text-slate-500">Vehicle Moving to Site</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Delivered &amp; Handed Over</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {challans.filter((c) => c.status === 'Delivered').length}
          </div>
          <div className="text-[11px] text-slate-500">Site Acknowledged</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Official Slip Format</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-mono font-black text-[#211B17]">UMA TECHNOFAB</div>
          <div className="text-[11px] text-slate-500">GST: 24AAEFU9027H1Z3</div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Ch. No (e.g. 547), Customer, Vehicle #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Delivery Challans ({challans.length})</option>
            <option value="Issued">Issued / Ready for Gate-Out</option>
            <option value="In Transit">In Transit (Vehicle on Road)</option>
            <option value="Delivered">Delivered &amp; Received</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* TABLE: DELIVERY CHALLANS LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 min-w-[120px]">Challan # &amp; Date</th>
                <th className="py-3 px-4 min-w-[200px]">Customer (M/s) &amp; Address</th>
                <th className="py-3 px-4 min-w-[240px]">Particulars (Material / Equipment)</th>
                <th className="py-3 px-4 min-w-[140px]">Vehicle &amp; Transporter</th>
                <th className="py-3 px-4 min-w-[100px]">Total Qty</th>
                <th className="py-3 px-4 min-w-[110px]">Status</th>
                <th className="py-3 px-4 w-40 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No delivery challans found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click "+ Generate Delivery Challan" to issue one.</p>
                  </td>
                </tr>
              ) : (
                filteredChallans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-amber-50/20 transition">
                    {/* Challan No & Date */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-amber-700 text-sm">
                          Ch. No: {ch.challanNo}
                        </span>
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center border border-amber-300">
                          {ch.copyNumber || 1}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        {ch.date}
                      </span>
                    </td>

                    {/* Customer & Address */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">
                        M/s. {ch.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                        {ch.customerAddress}
                      </div>
                      {ch.jobNumber && (
                        <span className="inline-block px-1.5 py-0.2 mt-1 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          Job: {ch.jobNumber}
                        </span>
                      )}
                    </td>

                    {/* Particulars & Items */}
                    <td className="py-3 px-4">
                      {ch.items.map((it, idx) => (
                        <div key={idx} className="mb-1 last:mb-0">
                          <div className="font-semibold text-slate-800 line-clamp-2">
                            {it.particulars}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Qty: <span className="font-bold text-slate-700">{it.quantity}</span> ({it.unitOrAmount})
                          </div>
                        </div>
                      ))}
                    </td>

                    {/* Vehicle & Logistics */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-black text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block text-xs">
                        {ch.vehicleNumber || 'No Vehicle'}
                      </div>
                      {ch.transporterName && (
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                          {ch.transporterName}
                        </div>
                      )}
                      {ch.eWayBillNumber && (
                        <div className="text-[10px] text-sky-700 font-mono">
                          EWB: {ch.eWayBillNumber}
                        </div>
                      )}
                    </td>

                    {/* Total Qty */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-xs">
                      {ch.totalQuantity}
                    </td>

                    {/* Status with quick 1-click advance */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleAdvanceStatus(ch)}
                        title="Click to advance status"
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold inline-flex items-center gap-1 border cursor-pointer hover:opacity-80 transition ${
                          ch.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ch.status === 'In Transit'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {ch.status === 'Delivered' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Truck className="w-3 h-3 text-blue-600" />
                        )}
                        <span>{ch.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewChallan(ch)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
                          title="View Official Yellow Challan Slip"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Slip</span>
                        </button>
                        <Link
                          href={`/accounting/sales-invoices?challanNo=${encodeURIComponent(ch.challanNo)}&customerName=${encodeURIComponent(ch.customerName)}&jobNumber=${encodeURIComponent(ch.jobNumber || '')}&vehicle=${encodeURIComponent(ch.vehicleNumber || '')}`}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-xs transition flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
                          title="Generate GST Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Invoice</span>
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(ch)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteChallan(ch.id, ch.challanNo)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
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

      {/* ========================================================================= */}
      {/* MODAL 1: GENERATE / EDIT DELIVERY CHALLAN (FORM)                           */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-800 w-full max-w-4xl overflow-hidden my-4">
            {/* Modal Header */}
            <div className="bg-[#211B17] text-white p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-amber-400 font-mono tracking-widest uppercase font-bold">
                  UMA TECHNOFAB — DISPATCH &amp; LOGISTICS
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>{editingChallanId ? 'Edit Delivery Challan' : 'Generate Delivery Challan'}</span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-amber-400/20 rounded-lg text-xs font-mono font-bold text-amber-300 border border-amber-400/30">
                  Ch. No : {formChallanNo}
                </span>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveChallan} className="p-5 space-y-4 text-xs">
              {/* Quick Fill Bar: From QC Reports or Finished Goods */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="font-bold text-slate-800">Quick Fill from QC Cleared Projects / FG:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {inspectionReports.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handlePreFillFromQC(e.target.value);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Pre-fill from QC Report (F-QAS-02) --</option>
                      {inspectionReports.map((qc) => (
                        <option key={qc.id} value={qc.id}>
                          QC: {qc.completionNumber} • {qc.customerName} • {qc.productName}
                        </option>
                      ))}
                    </select>
                  )}

                  {finishedGoods.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handlePreFillFromFG(e.target.value);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Pre-fill from Finished Goods --</option>
                      {finishedGoods.map((fg) => (
                        <option key={fg.id} value={fg.id}>
                          FG: {fg.finishedGoodsNumber} • {fg.productName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* SECTION 1: HEADER & CHALLAN METADATA (MATCHING PHYSICAL SLIP) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Challan No */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Challan No: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formChallanNo}
                    onChange={(e) => setFormChallanNo(e.target.value)}
                    placeholder="e.g. 547"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-amber-800 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Date: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Copy Number */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Copy No:
                  </label>
                  <select
                    value={formCopyNo}
                    onChange={(e) => setFormCopyNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="1">1 - Original (Consignee Copy)</option>
                    <option value="2">2 - Duplicate (Transporter Copy)</option>
                    <option value="3">3 - Triplicate (Office Copy)</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Dispatch Status:
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Issued">Issued / Ready for Gate-Out</option>
                    <option value="In Transit">In Transit (On Road)</option>
                    <option value="Delivered">Delivered &amp; Handed Over</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                {/* M/s. Customer Name */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    M/s. (Customer / Buyer Name): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    placeholder="e.g. UMA Food / Ananth Chem"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Delivery Address */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Address (Destination / Site): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCustomerAddress}
                    onChange={(e) => setFormCustomerAddress(e.target.value)}
                    placeholder="e.g. GIDC Industrial Estate, Rajpur Road, Kadi - 382715"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* SECTION 2: TRANSPORT & VEHICLE LOGISTICS (MATCHING WRITTEN NOTES ON SLIP) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Transport, Vehicle &amp; Delivery Logistics</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Annotated on Delivery Slip)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Vehicle Number (Prominent on slip: GJ-02.AT.3826) */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Vehicle No: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formVehicleNumber}
                      onChange={(e) => setFormVehicleNumber(e.target.value)}
                      placeholder="e.g. GJ-02.AT.3826"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-black text-amber-900 uppercase focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  {/* Transporter Name */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Transporter Name:
                    </label>
                    <input
                      type="text"
                      value={formTransporterName}
                      onChange={(e) => setFormTransporterName(e.target.value)}
                      placeholder="e.g. Mahavir Heavy Logistics"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  {/* LR Number */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Lorry Receipt (LR) #:
                    </label>
                    <input
                      type="text"
                      value={formLrNumber}
                      onChange={(e) => setFormLrNumber(e.target.value)}
                      placeholder="e.g. LR-2026-547"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  {/* E-Way Bill Number */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      E-Way Bill #:
                    </label>
                    <input
                      type="text"
                      value={formEWayBillNumber}
                      onChange={(e) => setFormEWayBillNumber(e.target.value)}
                      placeholder="e.g. EWB-24-99812"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-sky-700 font-bold focus:ring-2 focus:ring-sky-500 text-xs"
                    />
                  </div>

                  {/* Driver Name */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Driver Name:
                    </label>
                    <input
                      type="text"
                      value={formDriverName}
                      onChange={(e) => setFormDriverName(e.target.value)}
                      placeholder="Driver Name"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  {/* Driver Mobile */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Driver Mobile:
                    </label>
                    <input
                      type="text"
                      value={formDriverMobile}
                      onChange={(e) => setFormDriverMobile(e.target.value)}
                      placeholder="9825xxxxxx"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Department:
                    </label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      placeholder="e.g. Paint Store / Dispatch"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  {/* Job No / QC Ref */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Job / QC Reference:
                    </label>
                    <input
                      type="text"
                      value={formJobNumber}
                      onChange={(e) => setFormJobNumber(e.target.value)}
                      placeholder="e.g. UTF-26-46 B"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ITEMS TABLE (MATCHING PHYSICAL SLIP COLUMNS: Sr. No., Particulars, Qty., Amount) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                    <span>Particulars &amp; Quantity Table</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Sr. No. | Particulars | Qty. | Amount/Unit)
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-amber-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Line Item</span>
                  </button>
                </div>

                <div className="border border-slate-300 rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-black text-slate-900 uppercase text-[11px]">
                        <th className="p-2.5 w-16 border-r border-slate-300 text-center">Sr. No.</th>
                        <th className="p-2.5 min-w-[280px] border-r border-slate-300">
                          Particulars
                        </th>
                        <th className="p-2.5 w-28 border-r border-slate-300">Qty.</th>
                        <th className="p-2.5 w-32 border-r border-slate-300">Amount / Unit</th>
                        <th className="p-2.5 w-12 text-center">Act</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/20">
                          {/* Sr No */}
                          <td className="p-2 border-r border-slate-300 text-center font-mono font-bold align-top">
                            {item.srNo}
                          </td>

                          {/* Particulars */}
                          <td className="p-2 border-r border-slate-300 align-top">
                            <textarea
                              rows={2}
                              required
                              value={item.particulars}
                              onChange={(e) =>
                                handleUpdateItemRow(idx, 'particulars', e.target.value)
                              }
                              placeholder="e.g. Berger Luxol PU Enamel. W-305 / 05 Drum."
                              className="w-full p-1.5 bg-white border border-slate-200 rounded font-semibold text-slate-900 text-xs focus:ring-1 focus:ring-amber-500"
                            />
                          </td>

                          {/* Qty */}
                          <td className="p-2 border-r border-slate-300 align-top">
                            <input
                              type="text"
                              required
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItemRow(idx, 'quantity', e.target.value)
                              }
                              placeholder="e.g. 20"
                              className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-900 text-xs text-center"
                            />
                          </td>

                          {/* Amount / Unit */}
                          <td className="p-2 border-r border-slate-300 align-top">
                            <input
                              type="text"
                              value={item.unitOrAmount}
                              onChange={(e) =>
                                handleUpdateItemRow(idx, 'unitOrAmount', e.target.value)
                              }
                              placeholder="e.g. 4 Ltr / NOS"
                              className="w-full p-1.5 bg-white border border-slate-200 rounded font-bold text-slate-900 text-xs"
                            />
                          </td>

                          {/* Delete row */}
                          <td className="p-2 text-center align-top">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              disabled={formItems.length <= 1}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-amber-50 font-black border-t-2 border-slate-300">
                        <td colSpan={2} className="p-2.5 text-right uppercase tracking-wider text-slate-700">
                          GSTIN No. : 24AAEFU9027H1Z3 &nbsp;&nbsp;|&nbsp;&nbsp; TOTAL:
                        </td>
                        <td colSpan={3} className="p-2.5 font-mono text-amber-900 text-sm">
                          {calculatedTotalQuantity}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingChallanId ? 'Update Delivery Challan' : 'Save & Issue Delivery Challan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW & PRINT OFFICIAL DELIVERY CHALLAN (EXACT REPLICA OF USER PHOTO) */}
      {/* ========================================================================= */}
      {viewChallan && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black w-full max-w-3xl overflow-hidden my-4 print:m-0 print:border-none print:shadow-none print:w-full">
            {/* Control Bar (Hidden during Print) */}
            <div className="bg-[#211B17] text-white p-3.5 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">Official Delivery Challan Slip Preview</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
                  Ch. No: {viewChallan.challanNo}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Theme Toggle: Yellow vs Clean White */}
                <button
                  type="button"
                  onClick={() => setSlipTheme(slipTheme === 'yellow' ? 'white' : 'yellow')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Toggle between authentic yellow paper and clean white"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-300" />
                  <span>{slipTheme === 'yellow' ? 'Yellow Paper Slip' : 'White Print'}</span>
                </button>

                <Link
                  href={`/accounting/sales-invoices?challanNo=${encodeURIComponent(viewChallan.challanNo)}&customerName=${encodeURIComponent(viewChallan.customerName)}&jobNumber=${encodeURIComponent(viewChallan.jobNumber || '')}&vehicle=${encodeURIComponent(viewChallan.vehicleNumber || '')}`}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  title="Create GST Tax Invoice for this delivery challan"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Create Tax Invoice</span>
                </Link>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Challan</span>
                </button>
                <button
                  onClick={() => setViewChallan(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* =================================================================== */}
            {/* AUTHENTIC DELIVERY CHALLAN SLIP (REPRODUCING THE USER'S PHOTO SLIP) */}
            {/* =================================================================== */}
            <div
              className={`p-6 sm:p-8 font-sans transition-colors ${
                slipTheme === 'yellow'
                  ? 'bg-[#FEF08A] text-slate-950 border-8 border-[#FDE047]'
                  : 'bg-white text-slate-950'
              } print:p-0 print:border-none print:bg-white`}
            >
              <div className="border-2 border-black p-4 space-y-2 text-black bg-transparent">
                {/* TOP HEADER */}
                <div className="flex items-start justify-between border-b-2 border-black pb-2">
                  {/* Left: Brand Logo & Title */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {/* Logo Box */}
                      <div className="border-2 border-black px-2 py-0.5 font-black text-lg tracking-wider font-mono">
                        UMA
                      </div>
                      <div className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                        UMA TECHNOFAB
                      </div>
                    </div>
                    <div className="text-[11px] font-bold tracking-tight text-slate-800">
                      All Industrial Equipments. Tranki Projects...
                    </div>
                  </div>

                  {/* Center: Main Title */}
                  <div className="text-center">
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider border-b-2 border-black inline-block px-3 pb-0.5">
                      DELIVERY CHALLAN
                    </h2>
                  </div>

                  {/* Right: Mobile numbers & Circled copy number */}
                  <div className="text-right space-y-1">
                    <div className="text-[11px] font-bold font-mono">
                      Mo. : 98250 98367
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;99250 11676
                    </div>
                    <div className="flex justify-end">
                      <div className="w-7 h-7 rounded-full border-2 border-black font-bold flex items-center justify-center text-xs font-mono">
                        {viewChallan.copyNumber || '1'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FACTORY ADDRESS BOX */}
                <div className="border-b-2 border-black pb-2 text-center text-[10.5px] sm:text-[11.5px] font-semibold leading-tight">
                  S.No. 1040/3, Village : Rajpur, Nr. Sandvik Tube,
                  <br />
                  Ta-Kadi, Dist-Mehsana. Pin Code - 382721
                </div>

                {/* CONSIGNEE (BUYER) & CHALLAN METADATA GRID */}
                <div className="grid grid-cols-12 border-b-2 border-black pb-2 text-xs">
                  {/* Left: M/s & Address (8 cols) */}
                  <div className="col-span-8 pr-3 border-r-2 border-black space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-black text-sm whitespace-nowrap">M/s.</span>
                      <span className="font-black text-sm sm:text-base border-b border-black flex-1 pb-0.5">
                        {viewChallan.customerName}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="font-bold text-xs whitespace-nowrap">Address</span>
                      <span className="font-semibold text-xs border-b border-black flex-1 pb-0.5">
                        {viewChallan.customerAddress}
                      </span>
                    </div>
                  </div>

                  {/* Right: Ch. No & Date (4 cols) */}
                  <div className="col-span-4 pl-3 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="font-black text-sm">Ch. No :</span>
                      <span className="font-black font-mono text-base border-b-2 border-black px-2 pb-0.5">
                        {viewChallan.challanNo}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-xs">Date :</span>
                      <span className="font-black font-mono text-xs border-b border-black px-2 pb-0.5">
                        {viewChallan.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* MAIN TABLE: SR NO | PARTICULARS | QTY | AMOUNT */}
                <div className="border-2 border-black">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-black font-black uppercase text-[11px] text-center">
                        <th className="p-2 w-14 border-r-2 border-black">Sr. No.</th>
                        <th className="p-2 border-r-2 border-black text-left">Particulars</th>
                        <th className="p-2 w-20 border-r-2 border-black">Qty.</th>
                        <th className="p-2 w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/40 min-h-[220px]">
                      {viewChallan.items.map((it, idx) => (
                        <tr key={idx} className="align-top">
                          {/* Sr No with circled number like photo */}
                          <td className="p-2.5 border-r-2 border-black text-center font-bold font-mono">
                            <span className="inline-block w-5 h-5 rounded-full border border-black text-[11px] leading-4">
                              {it.srNo}
                            </span>
                          </td>

                          {/* Particulars (includes material & packaging) */}
                          <td className="p-2.5 border-r-2 border-black space-y-1.5">
                            <div className="font-bold text-sm leading-snug whitespace-pre-line">
                              {it.particulars}
                            </div>
                            {it.notes && (
                              <div className="text-[11px] text-slate-800 italic">
                                {it.notes}
                              </div>
                            )}

                            {/* Transport / Vehicle Details written in body (exactly like photo) */}
                            {idx === viewChallan.items.length - 1 && viewChallan.vehicleNumber && (
                              <div className="pt-6 pb-2">
                                <span className="font-black font-mono text-sm border-2 border-black px-3 py-1 bg-black/5 rounded">
                                  {viewChallan.vehicleNumber}
                                </span>
                                {viewChallan.transporterName && (
                                  <span className="text-[11px] font-semibold text-slate-800 ml-2">
                                    ({viewChallan.transporterName})
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Qty */}
                          <td className="p-2.5 border-r-2 border-black text-center font-black font-mono text-sm">
                            {it.quantity}
                          </td>

                          {/* Amount / Unit */}
                          <td className="p-2.5 text-center font-bold text-xs">
                            {it.unitOrAmount}
                          </td>
                        </tr>
                      ))}

                      {/* Spacer rows if few items to fill the Challan height like physical ledger */}
                      {viewChallan.items.length < 3 && (
                        <tr>
                          <td className="p-6 border-r-2 border-black">&nbsp;</td>
                          <td className="p-6 border-r-2 border-black">&nbsp;</td>
                          <td className="p-6 border-r-2 border-black">&nbsp;</td>
                          <td className="p-6">&nbsp;</td>
                        </tr>
                      )}
                    </tbody>

                    {/* TABLE FOOTER: GSTIN NO & TOTAL */}
                    <tfoot>
                      <tr className="border-t-2 border-black font-black text-xs">
                        <td colSpan={2} className="p-2.5 border-r-2 border-black">
                          <span className="font-black font-mono text-xs sm:text-sm">
                            GSTIN No. : {viewChallan.gstin || '24AAEFU9027H1Z3'}
                          </span>
                        </td>
                        <td className="p-2.5 border-r-2 border-black text-center uppercase tracking-wider font-bold">
                          TOTAL
                        </td>
                        <td className="p-2.5 text-center font-black font-mono text-sm">
                          {viewChallan.totalQuantity}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* BOTTOM FOOTER: JURISDICTION, RECEIVER SIGN & FOR UMA TECHNOFAB */}
                <div className="pt-3 grid grid-cols-2 gap-4 text-xs">
                  {/* Left: Jurisdiction & Receiver */}
                  <div className="space-y-4">
                    <div className="text-[11px] font-bold">
                      Subject to KALOL (N.G) Jurisdiction
                    </div>
                    <div className="font-bold">
                      Receiver Signature &amp; Date
                    </div>
                    <div className="pt-2 font-bold flex items-center gap-1.5">
                      <span>Department:-</span>
                      <span className="border-b border-black flex-1 font-semibold">
                        {viewChallan.department || 'Dispatch'}
                      </span>
                    </div>
                  </div>

                  {/* Right: For, UMA Technofab */}
                  <div className="text-right space-y-8 flex flex-col justify-between">
                    <div className="font-black text-sm">
                      For, UMA Technofab
                    </div>
                    <div className="pt-6">
                      <div className="border-t border-black inline-block w-48 text-center text-[10.5px] font-bold">
                        Authorized Signatory
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
              <div className="text-xs text-slate-500 font-medium">
                Certified copy of delivery challan for vehicle gate pass and customer receipt.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewChallan(null)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
