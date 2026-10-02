'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { Enquiry } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import { FileText, Plus, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function EnquiriesPage() {
  const { enquiries, addEnquiry, customers, employees, quotations } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [machineProduct, setMachineProduct] = useState('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [specification, setSpecification] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('2026-11-15');
  const [assignedPersonId, setAssignedPersonId] = useState(employees[0]?.id || '');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    const emp = employees.find((e) => e.id === assignedPersonId);

    addEnquiry({
      customerId,
      customerName: cust?.companyName || 'Valued Customer',
      requirement: specification,
      machineProduct,
      quantity: Number(quantity) || 1,
      specification,
      expectedDelivery,
      assignedPersonId,
      assignedPersonName: emp ? `${emp.firstName} ${emp.lastName}` : 'Sales Engineer',
      status: 'technical_review',
    });

    setMachineProduct('');
    setSpecification('');
    setShowModal(false);
  };

  const columns: Column<Enquiry>[] = [
    {
      header: 'Enquiry No.',
      accessorKey: 'enquiryNo',
      cell: (enq) => (
        <span className="font-mono font-bold text-crm-brand-700 bg-crm-brand-50 dark:bg-crm-brand-950/60 px-2 py-0.5 rounded border border-crm-brand-200">
          {enq.enquiryNo}
        </span>
      ),
    },
    {
      header: 'Customer',
      cell: (enq) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-[#211B17] block">{enq.customerName}</span>
          <span className="text-[10px] text-[#70665F] font-mono">ID: {enq.customerId}</span>
        </div>
      ),
    },
    {
      header: 'Machine / Equipment Requirement',
      cell: (enq) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-[#544B45] block">{enq.machineProduct}</span>
          <span className="text-[10px] text-[#70665F] block truncate max-w-xs">{enq.specification}</span>
        </div>
      ),
    },
    {
      header: 'Qty',
      accessorKey: 'quantity',
      cell: (enq) => <span className="font-mono font-bold">{enq.quantity}</span>,
    },
    {
      header: 'Assigned Engineer',
      accessorKey: 'assignedPersonName',
    },
    {
      header: 'Status',
      cell: (enq) => {
        const linkedQuo = quotations.find(
          (q) =>
            (enq.quotationId && (q.id === enq.quotationId || q.quotationNumber === enq.quotationId)) ||
            (q.enquiryId && (q.enquiryId === enq.id || q.enquiryId === enq.enquiryNo)) ||
            (q.customerId === enq.customerId && (q.latestSummary?.machineProduct === enq.machineProduct || q.customerName === enq.customerName))
        );
        const hasQuo = Boolean(enq.quotationId || linkedQuo);
        const effectiveStatus = hasQuo ? 'quotation_sent' : enq.status;
        return <StatusBadge status={effectiveStatus as any} />;
      },
    },
    {
      header: 'Actions',
      cell: (enq) => {
        const linkedQuo = quotations.find(
          (q) =>
            (enq.quotationId && (q.id === enq.quotationId || q.quotationNumber === enq.quotationId)) ||
            (q.enquiryId && (q.enquiryId === enq.id || q.enquiryId === enq.enquiryNo)) ||
            (q.customerId === enq.customerId && (q.latestSummary?.machineProduct === enq.machineProduct || q.customerName === enq.customerName))
        );
        const quoId = enq.quotationId || linkedQuo?.quotationNumber || linkedQuo?.id;

        return (
          <div className="flex items-center gap-2">
            {quoId ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 rounded text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quotation Generated</span>
                </span>
                <Link
                  href={`/crm/quotations/${quoId}`}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-800 dark:text-stone-100 rounded text-[11px] font-bold border border-slate-300 dark:border-stone-600 flex items-center gap-1 shadow-2xs hover:shadow transition"
                >
                  <span>View ({quoId})</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-crm-brand-700" />
                </Link>
              </div>
            ) : (
              <Link
                href={`/crm/quotations/new?customerId=${enq.customerId}&enquiryId=${enq.id}`}
                className="px-3 py-1.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-lg text-[11px] font-bold shadow-xs hover:shadow transition flex items-center gap-1 cursor-pointer"
              >
                <span>Generate Quotation</span>
                <ArrowUpRight className="w-3 h-3 opacity-70" />
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <FileText className="w-5 h-5 text-crm-brand-700" />
            Technical Enquiries & Requirement Review
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Technical feasibility checks and estimation before raising formal Quotations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Technical Enquiry</span>
        </button>
      </div>

      <DataTable
        title="Technical Enquiries Master"
        columns={columns}
        data={enquiries}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-xl w-full max-w-md p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17]">Create Technical Enquiry</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Customer *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Machine / Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={machineProduct}
                  onChange={(e) => setMachineProduct(e.target.value)}
                  placeholder="e.g. 5000L Limpet Jacketed SS Reactor"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Expected Delivery</label>
                  <input
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Assigned Estimation Engineer</label>
                <select
                  value={assignedPersonId}
                  onChange={(e) => setAssignedPersonId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Technical Specifications</label>
                <textarea
                  rows={3}
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  placeholder="Material specs, pressure, temperature ratings..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
