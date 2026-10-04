'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency } from '../../../lib/utils';
import { WorkOrderStatus, ServiceWorkOrder } from '../../../types/maintenance';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Package,
  UserCheck,
  X,
  FileText,
  Eye,
  Printer,
  Clock,
  Wrench,
  Building2,
  AlertCircle,
  Layers,
  Trash2,
} from 'lucide-react';

export default function WorkOrdersPage() {
  const {
    serviceWorkOrders,
    addServiceWorkOrder,
    updateWorkOrderStatus,
    customers,
    customerMachines,
    serviceRequests,
    technicians,
    employees,
    itemMasters,
    projectJobs,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<ServiceWorkOrder | null>(null);
  const [isManualCustomer, setIsManualCustomer] = useState(false);
  const [isManualMachine, setIsManualMachine] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Consolidate unique customer list
  const customerList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code?: string }>();

    customers.forEach((c) => {
      const name = c.companyName || (c as any).customerName || (c as any).name || c.customerCode;
      if (name) {
        map.set(name.toLowerCase(), { id: c.id || name, name, code: c.customerCode });
      }
    });

    customerMachines.forEach((m) => {
      const name = m.customerName || (m as any).companyName;
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { id: m.customerId || name, name });
      }
    });

    serviceRequests.forEach((sr) => {
      const name = sr.customerName || (sr as any).companyName;
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { id: sr.customerId || name, name });
      }
    });

    if (projectJobs && Array.isArray(projectJobs)) {
      projectJobs.forEach((j) => {
        const name = j.customerName;
        if (name && !map.has(name.toLowerCase())) {
          map.set(name.toLowerCase(), { id: j.id || name, name });
        }
      });
    }

    if (map.size === 0) {
      map.set('reliance', { id: 'CUST-001', name: 'Reliance Industries Limited (Jamnagar)' });
      map.set('tata', { id: 'CUST-002', name: 'Tata Chemicals Limited (Mithapur)' });
      map.set('l&t', { id: 'CUST-003', name: 'Larsen & Toubro Heavy Engineering (Hazira)' });
      map.set('adani', { id: 'CUST-004', name: 'Adani Ports & Special Economic Zone (Mundra)' });
    }

    return Array.from(map.values());
  }, [customers, customerMachines, serviceRequests, projectJobs]);

  const defaultCust = customerList[0]?.name || 'Reliance Industries Limited (Jamnagar)';

  // Form State
  const [customerId, setCustomerId] = useState(customerList[0]?.id || 'CUST-001');
  const [customerName, setCustomerName] = useState(defaultCust);
  const [machineId, setMachineId] = useState('CM-001');
  const [machineName, setMachineName] = useState('High Pressure Autoclave Reactor 50 KL');
  const [serviceRequestId, setServiceRequestId] = useState('');
  const [requestNumber, setRequestNumber] = useState('');
  const [technicianId, setTechnicianId] = useState('TECH-001');
  const [technicianName, setTechnicianName] = useState('Ramesh Parmar (Sr. Service Engineer)');
  const [problem, setProblem] = useState('Mechanical seal leakage and bearing vibration');
  const [scopeOfWork, setScopeOfWork] = useState('Dismantle mechanical seal, clean mating faces, replace O-rings, pressure test at 4.5 bar.');
  const [labourHours, setLabourHours] = useState(4);
  const [labourRate, setLabourRate] = useState(750);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [status, setStatus] = useState<WorkOrderStatus>('Pending');
  const [requiredParts, setRequiredParts] = useState<
    { itemCode: string; itemName: string; requestedQty: number; rate: number }[]
  >([]);

  // Spare parts input row state
  const [partCode, setPartCode] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partRate, setPartRate] = useState(1200);

  // Available machines for current customer
  const availableMachines = useMemo(() => {
    if (!customerName) return customerMachines;
    const matched = customerMachines.filter(
      (m) =>
        m.customerName?.toLowerCase() === customerName.toLowerCase() ||
        m.customerId === customerId
    );
    return matched.length > 0 ? matched : customerMachines;
  }, [customerMachines, customerName, customerId]);

  // Auto handle Customer selection
  const handleCustomerChange = (selectedVal: string) => {
    const cust = customerList.find((c) => c.name === selectedVal || c.id === selectedVal);
    const name = cust?.name || selectedVal;
    const id = cust?.id || selectedVal;
    setCustomerId(id);
    setCustomerName(name);

    // Auto-filter machine for this customer
    const matchingMachine = customerMachines.find(
      (m) => (m.customerName && m.customerName.toLowerCase() === name.toLowerCase()) || m.customerId === id
    );
    if (matchingMachine) {
      setMachineId(matchingMachine.id);
      setMachineName(matchingMachine.machineName);
    }
  };

  // Auto handle Service Request selection
  const handleServiceRequestChange = (srId: string) => {
    setServiceRequestId(srId);
    const sr = serviceRequests.find((r) => r.id === srId || r.requestNumber === srId);
    if (sr) {
      setRequestNumber(sr.requestNumber);
      const cName = sr.customerName || (sr as any).companyName || '';
      if (cName) {
        setCustomerName(cName);
        setCustomerId(sr.customerId || cName);
      }
      if (sr.machineName) {
        setMachineName(sr.machineName);
        setMachineId(sr.customerMachineId || 'CM-001');
      }
      if (sr.problemDescription) {
        setProblem(sr.problemDescription);
        setScopeOfWork(`Inspect, service and repair ${sr.machineName || 'equipment'}: ${sr.problemDescription}`);
      }
      if (sr.assignedTechnicianName) {
        setTechnicianName(sr.assignedTechnicianName);
        setTechnicianId(sr.assignedTechnicianId || 'TECH-001');
      }
    }
  };

  const addSparePart = () => {
    if (!partCode.trim()) return;
    const item = itemMasters.find((i) => i.itemCode === partCode || i.id === partCode);
    const name = item?.itemName || partCode;
    const rate = Number(partRate) || (item?.standardCost || 500);

    setRequiredParts([
      ...requiredParts,
      {
        itemCode: item?.itemCode || partCode,
        itemName: name,
        requestedQty: Number(partQty) || 1,
        rate,
      },
    ]);
    setPartCode('');
    setPartQty(1);
  };

  const removeSparePart = (idx: number) => {
    setRequiredParts(requiredParts.filter((_, i) => i !== idx));
  };

  const partsTotal = requiredParts.reduce((sum, p) => sum + p.requestedQty * p.rate, 0);
  const estimatedCostTotal = partsTotal + labourHours * labourRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCustName = customerName.trim() || defaultCust;
    const finalMachineName = machineName.trim() || 'High Pressure Autoclave Reactor 50 KL';
    const finalTechName = technicianName.trim() || 'Ramesh Parmar (Sr. Service Engineer)';

    addServiceWorkOrder({
      serviceRequestId: serviceRequestId || (requestNumber ? `SR-${requestNumber}` : 'SR-2026-0001'),
      requestNumber: requestNumber || 'SR-2026-0001',
      customerId: customerId || 'CUST-001',
      customerName: finalCustName,
      customerMachineId: machineId || 'CM-001',
      machineName: finalMachineName,
      technicianId: technicianId || 'TECH-001',
      technicianName: finalTechName,
      problem: problem || 'Preventive inspection and seal replacement',
      scopeOfWork: scopeOfWork || 'Dismantle mechanical seal, clean mating faces, replace O-rings, pressure test at 4.5 bar.',
      requiredParts: requiredParts.length > 0 ? requiredParts : [
        { itemCode: 'SEAL-MECH-50MM', itemName: 'Mechanical Seal Cartridge 50mm', requestedQty: 1, rate: 8500 },
      ],
      labourHours: Number(labourHours) || 4,
      estimatedCost: estimatedCostTotal || 11500,
      actualCost: 0,
      approvalRequired,
      status,
    });

    // Reset Form
    setShowAddModal(false);
    setProblem('Mechanical seal leakage and bearing vibration');
    setScopeOfWork('Dismantle mechanical seal, clean mating faces, replace O-rings, pressure test at 4.5 bar.');
    setRequiredParts([]);
  };

  const filteredOrders = serviceWorkOrders.filter((swo) => {
    const matchesSearch =
      !searchTerm?.trim() ||
      swo.workOrderNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      swo.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      swo.machineName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      swo.technicianName?.toLowerCase().includes(searchTerm?.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || swo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = serviceWorkOrders.length;
  const pendingCount = serviceWorkOrders.filter((s) => s.status === 'Pending' || s.status === 'Draft').length;
  const inProgressCount = serviceWorkOrders.filter((s) => s.status === 'In Progress' || s.status === 'Assigned').length;
  const completedCount = serviceWorkOrders.filter((s) => s.status === 'Completed' || s.status === 'Closed').length;
  const totalEstValue = serviceWorkOrders.reduce((sum, s) => sum + Number(s.estimatedCost || 0), 0);

  if (!mounted) {
    return (
      <div className="p-6 bg-[#FAF7F2] min-h-screen text-[#544B45] flex items-center justify-center">
        <div className="text-xs font-mono text-[#70665F]">Loading Service Work Orders...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 font-mono text-xs font-bold">
              MAINTENANCE & SERVICES
            </span>
            <span className="text-xs text-[#70665F]">Formal Job Scope, Spare Parts & Cost Approvals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#211B17] mt-1 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-700" />
            Service Work Orders
          </h1>
          <p className="text-xs text-[#70665F]">
            Define repair scope, allocate store spare parts, track estimated vs actual labour hours, and manage field service authorization.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Service Work Order
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-[#70665F] uppercase">Total Work Orders</div>
          <div className="text-2xl font-black text-[#211B17] font-mono mt-1">{totalCount}</div>
          <div className="text-[11px] text-[#70665F] mt-0.5">Est. {formatCurrency(totalEstValue)}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Pending / Draft</div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Awaiting Approval</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-sky-700 uppercase">Active / In Progress</div>
          <div className="text-2xl font-black text-sky-700 font-mono mt-1">{inProgressCount}</div>
          <div className="text-[11px] text-sky-600 mt-0.5">Field Execution</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Completed / Closed</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{completedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Service Verified</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search work order no, customer, machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] placeholder-[#70665F] focus:outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-emerald-600 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting for Parts">Waiting for Parts</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Showing <span className="text-[#211B17] font-bold">{filteredOrders.length}</span> of{' '}
          <span className="text-[#211B17] font-bold">{serviceWorkOrders.length}</span> Orders
        </div>
      </div>

      {/* Work Order Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] p-12 text-center shadow-sm">
          <ClipboardList className="w-12 h-12 text-[#70665F]/40 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#211B17]">No Service Work Orders Found</h3>
          <p className="text-xs text-[#70665F] mt-1">
            Click &quot;Create Service Work Order&quot; to define a new maintenance job scope.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((swo, idx) => (
            <div
              key={`${swo.id || 'swo'}-${idx}`}
              className="bg-white rounded-2xl border border-[#EBE3DB] p-5 shadow-sm space-y-4 hover:border-emerald-500/50 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-[#EBE3DB] pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-800 text-white font-mono font-bold text-xs">
                      {swo.workOrderNumber || swo.id}
                    </span>
                    <h3 className="font-bold text-sm text-[#211B17] mt-1.5">{swo.customerName}</h3>
                    <p className="text-xs text-[#70665F]">
                      {swo.machineName} {swo.requestNumber ? `• Ref: ${swo.requestNumber}` : ''}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                      swo.status === 'Completed' || swo.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : swo.status === 'In Progress' || swo.status === 'Assigned'
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {swo.status}
                  </span>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider block">
                    Scope of Work
                  </span>
                  <p className="text-xs text-[#544B45] font-medium line-clamp-2">{swo.scopeOfWork}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-[#70665F] bg-[#FAF7F2] p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-[#70665F] block">Est. Cost</span>
                    <span className="font-mono font-bold text-[#211B17]">{formatCurrency(swo.estimatedCost)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#70665F] block">Actual Cost</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {swo.actualCost ? formatCurrency(swo.actualCost) : '₹0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#70665F] block">Labour Hours</span>
                    <span className="font-bold text-[#211B17]">{swo.labourHours} Hrs</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EBE3DB]">
                <div className="text-xs font-semibold text-[#544B45]">
                  <span className="text-[#70665F]">Tech:</span> {swo.technicianName}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedVoucher(swo)}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-800 border border-[#EBE3DB] hover:border-emerald-300 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Voucher
                  </button>

                  <select
                    value={swo.status}
                    onChange={(e) => updateWorkOrderStatus(swo.id, e.target.value as WorkOrderStatus)}
                    className="px-2 py-1 text-xs bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Parts">Waiting for Parts</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#211B17] flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-700" />
                  Create Service Work Order
                </h3>
                <p className="text-[11px] text-[#70665F]">Scope of work, technician assignment & required spare parts.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Reference Service Request */}
              <div>
                <label className="block font-semibold text-[#70665F] mb-1">
                  Link Service Request (Optional)
                </label>
                <select
                  value={serviceRequestId}
                  onChange={(e) => handleServiceRequestChange(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-emerald-600 font-mono"
                >
                  <option value="">-- Direct Work Order (No prior request) --</option>
                  {serviceRequests.map((sr) => (
                    <option key={`modal-sr-${sr.id}`} value={sr.id}>
                      {sr.requestNumber} — {sr.customerName} ({sr.machineName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer and Machine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#70665F]">Customer Name *</label>
                    <button
                      type="button"
                      onClick={() => setIsManualCustomer(!isManualCustomer)}
                      className="text-[10px] text-emerald-700 font-bold hover:underline"
                    >
                      {isManualCustomer ? 'Select from list' : '+ Enter custom'}
                    </button>
                  </div>

                  {isManualCustomer ? (
                    <input
                      type="text"
                      required
                      value={customerName}
                      placeholder="e.g. Reliance Industries Limited"
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setCustomerId(e.target.value);
                      }}
                      className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  ) : (
                    <select
                      value={customerName}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-emerald-600 font-medium"
                    >
                      <option value="">-- Select Customer --</option>
                      {customerList.map((c) => (
                        <option key={`modal-cust-${c.name}`} value={c.name}>
                          {c.name} {c.code ? `[${c.code}]` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#70665F]">Machine / Equipment *</label>
                    <button
                      type="button"
                      onClick={() => setIsManualMachine(!isManualMachine)}
                      className="text-[10px] text-emerald-700 font-bold hover:underline"
                    >
                      {isManualMachine ? 'Select from list' : '+ Enter custom'}
                    </button>
                  </div>

                  {isManualMachine || availableMachines.length === 0 ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. High Pressure Autoclave Reactor 50 KL"
                      value={machineName}
                      onChange={(e) => {
                        setMachineName(e.target.value);
                        setMachineId(e.target.value);
                      }}
                      className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-emerald-600"
                    />
                  ) : (
                    <select
                      value={machineName}
                      onChange={(e) => {
                        setMachineName(e.target.value);
                        const match = availableMachines.find((m) => m.machineName === e.target.value);
                        if (match) setMachineId(match.id);
                      }}
                      className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-emerald-600 font-medium"
                    >
                      <option value="">-- Select Machine --</option>
                      {availableMachines.map((m) => (
                        <option key={`modal-m-${m.id}`} value={m.machineName}>
                          {m.machineName} {m.machineCode ? `(${m.machineCode})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Technician & Initial Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Assigned Technician / Lead</label>
                  <select
                    value={technicianName}
                    onChange={(e) => {
                      setTechnicianName(e.target.value);
                      const t = technicians.find((tech) => tech.technicianName === e.target.value);
                      if (t) setTechnicianId(t.id);
                    }}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    <option value="Ramesh Parmar (Sr. Service Engineer)">Ramesh Parmar (Sr. Service Engineer)</option>
                    <option value="Pravin Vaghela (Field Technician)">Pravin Vaghela (Field Technician)</option>
                    <option value="Dinesh Solanki (Mechanical Specialist)">Dinesh Solanki (Mechanical Specialist)</option>
                    <option value="Ketan Patel (Electrical & Controls Lead)">Ketan Patel (Electrical & Controls Lead)</option>
                    {technicians.map((tech) => (
                      <option key={`modal-tech-${tech.id}`} value={tech.technicianName}>
                        {tech.technicianName} ({tech.skillLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-semibold"
                  >
                    <option value="Pending">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Assigned">Assigned to Technician</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>

              {/* Scope of Work */}
              <div>
                <label className="block font-semibold text-[#70665F] mb-1">Scope of Work *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe step-by-step repair, replacement, or testing procedure..."
                  value={scopeOfWork}
                  onChange={(e) => setScopeOfWork(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Spare Parts Section */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-2">
                <div className="font-semibold text-[#211B17] flex items-center justify-between">
                  <span>Required Store Spare Parts</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800">
                    Parts Total: {formatCurrency(partsTotal)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Item Code or Name"
                    value={partCode}
                    onChange={(e) => setPartCode(e.target.value)}
                    className="flex-1 p-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={partQty}
                    onChange={(e) => setPartQty(Number(e.target.value))}
                    className="w-20 p-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                  <input
                    type="number"
                    placeholder="Rate (₹)"
                    value={partRate}
                    onChange={(e) => setPartRate(Number(e.target.value))}
                    className="w-24 p-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                  <button
                    type="button"
                    onClick={addSparePart}
                    className="px-3 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 transition"
                  >
                    Add
                  </button>
                </div>

                {requiredParts.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {requiredParts.map((p, idx) => (
                      <div
                        key={`part-${idx}`}
                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#EBE3DB] text-[11px]"
                      >
                        <span className="font-semibold text-[#211B17]">{p.itemName} ({p.itemCode})</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#70665F]">
                            {p.requestedQty} × ₹{p.rate} = <b className="text-emerald-800">₹{p.requestedQty * p.rate}</b>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSparePart(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Labour Hours & Estimated Cost */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Labour Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={labourHours}
                    onChange={(e) => setLabourHours(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Labour Rate / Hr (₹)</label>
                  <input
                    type="number"
                    value={labourRate}
                    onChange={(e) => setLabourRate(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono"
                  />
                </div>
                <div className="sm:col-span-1 col-span-2">
                  <label className="block font-semibold text-[#70665F] mb-1">Total Estimated Cost</label>
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-bold font-mono text-sm">
                    {formatCurrency(estimatedCostTotal)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#EBE3DB] text-[#544B45] hover:bg-[#FAF7F2] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition active:scale-95"
                >
                  Generate Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-[#EBE3DB] flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-800 text-white font-mono font-bold text-xs">
                  OFFICIAL WORK ORDER VOUCHER
                </span>
                <h2 className="text-xl font-black text-[#211B17] mt-1">
                  {selectedVoucher.workOrderNumber || selectedVoucher.id}
                </h2>
                <p className="text-xs text-[#70665F]">
                  Customer: <span className="font-bold text-[#211B17]">{selectedVoucher.customerName}</span> • Machine:{' '}
                  <span className="font-bold text-[#211B17]">{selectedVoucher.machineName}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-800 border border-[#EBE3DB] text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="p-1.5 rounded-xl text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
                <div>
                  <span className="text-[10px] text-[#70665F] uppercase font-bold block">Status</span>
                  <span className="font-bold text-emerald-800">{selectedVoucher.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#70665F] uppercase font-bold block">Lead Technician</span>
                  <span className="font-semibold text-[#211B17]">{selectedVoucher.technicianName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#70665F] uppercase font-bold block">Estimated Labour</span>
                  <span className="font-mono font-bold text-[#211B17]">{selectedVoucher.labourHours} Hours</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#70665F] uppercase font-bold block">Estimated Cost</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {formatCurrency(selectedVoucher.estimatedCost)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#211B17] mb-1">Scope of Work & Technical Instructions</h4>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] text-[#544B45] leading-relaxed">
                  {selectedVoucher.scopeOfWork}
                </div>
              </div>

              {/* Spare Parts Table */}
              <div>
                <h4 className="font-bold text-sm text-[#211B17] mb-2">Required Spare Parts & Components</h4>
                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-[#70665F] font-mono text-[10px] uppercase border-b border-[#EBE3DB]">
                      <tr>
                        <th className="p-3">Item Code</th>
                        <th className="p-3">Item Description</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Unit Rate</th>
                        <th className="p-3 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {Array.isArray(selectedVoucher.requiredParts) && selectedVoucher.requiredParts.length > 0 ? (
                        selectedVoucher.requiredParts.map((p, i) => (
                          <tr key={`voucher-part-${i}`}>
                            <td className="p-3 font-mono font-bold text-emerald-800">{p.itemCode}</td>
                            <td className="p-3 text-[#211B17]">{p.itemName}</td>
                            <td className="p-3 text-right font-mono font-bold">{p.requestedQty}</td>
                            <td className="p-3 text-right font-mono text-[#70665F]">{formatCurrency(p.rate)}</td>
                            <td className="p-3 text-right font-mono font-bold text-[#211B17]">
                              {formatCurrency(p.requestedQty * p.rate)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-[#70665F]">
                            No separate spare parts requisitioned. Standard service toolkit used.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total & Signoff */}
              <div className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div>
                  <span className="text-[10px] text-[#70665F] uppercase font-bold block">Service Incharge</span>
                  <span className="font-bold text-[#211B17]">Service Manager Signature Verified</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#70665F] uppercase font-bold block">Grand Total Estimated</span>
                  <span className="text-lg font-black text-emerald-800 font-mono">
                    {formatCurrency(selectedVoucher.estimatedCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EBE3DB] flex justify-end">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] font-semibold transition"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
