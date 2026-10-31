'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { api } from '../../../lib/apiClient';
import { printContent } from '../../../lib/printUtils';
import {
  Truck,
  Printer,
  Eye,
  FileText,
  Calendar,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';

interface GatePassRecord {
  id: string;
  gatePassNo: string;
  challanNo: string;
  date: string;
  passType: 'Returnable' | 'Non-Returnable' | 'Outward Goods';
  customerName: string;
  destinationCity: string;
  jobNumber: string;
  vehicleNumber: string;
  transporterName: string;
  driverName: string;
  driverMobile: string;
  eWayBillNumber: string;
  totalPackages: number;
  totalWeightKg: number;
  status: 'Draft' | 'Approved' | 'Gate Out' | 'Delivered';
  preparedBy: string;
  securityGuardName: string;
}

export default function GatePassListPage() {
  const { customers, projectJobs } = useERP();
  const [gatePasses, setGatePasses] = useState<GatePassRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState<GatePassRecord | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const fetchGatePasses = async () => {
      setIsLoading(true);
      try {
        const res = await api.production.dispatch.list();
        const data = Array.isArray(res) ? res : (res as any)?.data || [];
        if (isSubscribed) {
          if (data.length > 0) {
            const mapped: GatePassRecord[] = data.map((d: any, idx: number) => {
              const num = d.id || idx + 1;
              return {
                id: String(d.id || num),
                gatePassNo: String(d.gatePassNo || d.gate_pass_no || `GP-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`),
                challanNo: String(d.challanNumber || d.challan_number || d.challanNo || `DC-${num}`),
                date: d.dispatchDate || d.dispatch_date || d.date || new Date().toISOString().split('T')[0],
                passType: (d.passType || 'Outward Goods') as any,
                customerName: d.customerName || d.customer_name || 'Commercial Client',
                destinationCity: d.destinationCity || d.destination_city || 'Works Site',
                jobNumber: d.jobNumber || d.job_number || d.jobId || 'JOB-FAB-001',
                vehicleNumber: d.vehicleNumber || d.vehicle_number || 'GJ-01-XX-0000',
                transporterName: d.transporterName || d.transporter_name || 'Dedicated Logistics',
                driverName: d.driverName || d.driver_name || 'Driver',
                driverMobile: d.driverMobile || d.driver_mobile || '9876543210',
                eWayBillNumber: d.eWayBillNumber || d.e_way_bill_number || '—',
                totalPackages: Number(d.totalPackages || d.items?.length || 1),
                totalWeightKg: Number(d.totalWeightKg || d.weight || 0),
                status: (d.status === 'dispatched' ? 'Gate Out' : d.status === 'delivered' ? 'Delivered' : 'Approved') as any,
                preparedBy: d.preparedBy || 'Dispatch Supervisor',
                securityGuardName: d.securityGuard || 'Main Gate Security',
              };
            });
            setGatePasses(mapped);
          } else {
            setGatePasses([]);
          }
        }
      } catch (err) {
        console.warn('Could not load dispatch orders from API, rendering fallback view:', err);
        if (isSubscribed) setGatePasses([]);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    fetchGatePasses();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const handlePrint = (pass: GatePassRecord) => {
    setSelectedPass(pass);
    setTimeout(() => {
      printContent('printable-gate-pass', { title: `GatePass_${pass.gatePassNo}` });
    }, 150);
  };

  const columns: ERPColumn<GatePassRecord>[] = useMemo(
    () => [
      {
        key: 'gatePassNo',
        header: 'Gate Pass No',
        isCodeLink: true,
        onCodeClick: (item) => setSelectedPass(item),
        cell: (item) => (
          <div className="space-y-0.5">
            <span className="font-mono font-bold text-xs text-[#18417D] hover:underline cursor-pointer">
              {item.gatePassNo}
            </span>
            <div className="text-[10px] text-slate-500 font-mono">Challan: {item.challanNo}</div>
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Pass Date',
        cell: (item) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.date}</span>
          </div>
        ),
      },
      {
        key: 'customerName',
        header: 'Customer / Consignee',
        cell: (item) => (
          <div className="space-y-0.5">
            <div className="font-bold text-xs text-[#211B17] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.customerName}</span>
            </div>
            <div className="text-[11px] text-slate-500">{item.destinationCity}</div>
          </div>
        ),
      },
      {
        key: 'jobNumber',
        header: 'Job Ref',
        cell: (item) => (
          <span className="font-mono text-xs font-bold text-[#75401F] bg-[#FAF3EA] px-2 py-0.5 rounded border border-[#E7DED5]">
            {item.jobNumber}
          </span>
        ),
      },
      {
        key: 'vehicleNumber',
        header: 'Vehicle & Logistics',
        cell: (item) => (
          <div className="space-y-0.5">
            <div className="font-mono font-bold text-xs text-slate-800 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>{item.vehicleNumber}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
              {item.transporterName} • {item.driverName}
            </div>
          </div>
        ),
      },
      {
        key: 'passType',
        header: 'Pass Type',
        cell: (item) => {
          const isReturnable = item.passType === 'Returnable';
          return (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isReturnable
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {item.passType}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Security Clearance',
        cell: (item) => {
          const isOut = item.status === 'Gate Out' || item.status === 'Delivered';
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isOut
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {isOut ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-blue-600" />}
              <span>{item.status}</span>
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <ERPListPageLayout<GatePassRecord>
        breadcrumbs={['PRODUCTION', 'DISPATCH', 'GATE PASS REGISTER']}
        title="Gate Pass Register"
        data={gatePasses}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search by Gate Pass No, Challan, Vehicle, Customer..."
        addNewHref="/production/dispatch"
        addNewLabel="New Delivery Challan"
        onView={(item) => setSelectedPass(item)}
        extraHeaderActions={
          <Link
            href="/production/dispatch"
            className="px-3.5 py-2 min-h-[40px] bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Dispatch Console</span>
          </Link>
        }
      />

      {/* Gate Pass Printable Modal / Inspector */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E7DED5] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E7DED5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-crm-brand-700 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#211B17]">
                    Gate Pass Details ({selectedPass.gatePassNo})
                  </h3>
                  <p className="text-xs text-[#70665F]">
                    Security Clearance for Outward Materials & Finished Goods
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedPass)}
                  className="px-3 py-1.5 min-h-[38px] rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Pass</span>
                </button>
                <button
                  onClick={() => setSelectedPass(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div id="printable-gate-pass" className="p-6 overflow-y-auto space-y-5 text-xs text-[#211B17]">
              {/* Header Box */}
              <div className="border border-[#E7DED5] rounded-2xl p-4 bg-[#FCFAF7] space-y-2">
                <div className="flex items-center justify-between border-b border-[#E7DED5] pb-2">
                  <span className="font-extrabold text-sm text-[#18417D]">UMA TECHNO FAB</span>
                  <span className="font-mono text-xs font-bold text-[#75401F] bg-[#FAF3EA] px-2.5 py-0.5 rounded border border-[#E7DED5]">
                    {selectedPass.gatePassNo}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block font-semibold">Date:</span>
                    <strong className="font-mono">{selectedPass.date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Pass Type:</span>
                    <strong>{selectedPass.passType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Challan Ref:</span>
                    <strong className="font-mono">{selectedPass.challanNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Job Number:</span>
                    <strong className="font-mono">{selectedPass.jobNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Consignee & Vehicle Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[#E7DED5] rounded-2xl p-4 space-y-2 bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Consignee / Destination
                  </span>
                  <div className="font-bold text-sm text-[#211B17]">{selectedPass.customerName}</div>
                  <div className="text-slate-600 text-[11px]">{selectedPass.destinationCity}</div>
                </div>

                <div className="border border-[#E7DED5] rounded-2xl p-4 space-y-2 bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Vehicle & Transport Details
                  </span>
                  <div className="font-mono font-bold text-sm text-slate-900">{selectedPass.vehicleNumber}</div>
                  <div className="text-slate-600 text-[11px]">
                    Transporter: {selectedPass.transporterName}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Driver: {selectedPass.driverName} ({selectedPass.driverMobile})
                  </div>
                </div>
              </div>

              {/* Signatures Strip */}
              <div className="border-t border-[#E7DED5] pt-6 grid grid-cols-3 gap-4 text-center text-[11px] text-slate-500">
                <div className="space-y-8">
                  <div className="h-6" />
                  <div className="border-t border-slate-300 pt-1 font-semibold">Prepared By ({selectedPass.preparedBy})</div>
                </div>
                <div className="space-y-8">
                  <div className="h-6" />
                  <div className="border-t border-slate-300 pt-1 font-semibold">Security Guard Sign & Stamp</div>
                </div>
                <div className="space-y-8">
                  <div className="h-6" />
                  <div className="border-t border-slate-300 pt-1 font-semibold">Receiver / Driver Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
