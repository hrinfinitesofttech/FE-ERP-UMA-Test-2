'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { SalesInvoice } from '../../../types/accounting';
import { Receipt, Search, Plus, Filter, CheckCircle2, Clock, Eye, Download, FileSpreadsheet, Building, Users, Printer, X } from 'lucide-react';

export default function SalesInvoicesPage() {
  const { salesInvoices, addSalesInvoice, approveSalesInvoice, customers, salesOrders } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesInvoice | null>(null);

  // Form state
  const [selectedSoId, setSelectedSoId] = useState<string>(salesOrders[0]?.id || salesOrders[0]?.salesOrderNumber || '');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [salesOrderNumber, setSalesOrderNumber] = useState(salesOrders[0]?.salesOrderNumber || (salesOrders[0] as any)?.salesOrderNo || 'SO-2026-0001');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [placeOfSupply, setPlaceOfSupply] = useState('Gujarat (24)');

  // Form line items
  const [items, setItems] = useState<Array<{ description: string; hsnSac: string; qty: number | string; unitPrice: number | string; taxRate: number | string }>>([
    { description: 'Automated Hydraulic Scrap Baling Press 100-Ton', hsnSac: '8462', qty: 1, unitPrice: 3800000, taxRate: 18 },
  ]);

  // Handle Sales Order Selection - Automatically prefill Customer, Items, Rates & GST
  const handleSelectSalesOrder = (soIdOrNo: string) => {
    setSelectedSoId(soIdOrNo);
    if (!soIdOrNo || soIdOrNo === 'DIRECT_INVOICE') {
      setSalesOrderNumber('');
      return;
    }

    const matchedSo = salesOrders.find(
      (s) => s.id === soIdOrNo || s.salesOrderNumber === soIdOrNo || (s as any).salesOrderNo === soIdOrNo
    );

    if (matchedSo) {
      setSalesOrderNumber(matchedSo.salesOrderNumber || (matchedSo as any).salesOrderNo || '');
      
      // Match and set customer
      const cust = customers.find(
        (c) => c.id === matchedSo.customerId || c.companyName?.toLowerCase() === matchedSo.customerName?.toLowerCase()
      );
      if (cust) {
        setCustomerId(cust.id);
        if (cust.gstin && !cust.gstin.startsWith('24')) {
          setPlaceOfSupply('Other State (Interstate IGST)');
        } else {
          setPlaceOfSupply('Gujarat (24)');
        }
      }

      // Auto populate items from Sales Order
      if (matchedSo.items && matchedSo.items.length > 0) {
        const autoItems = matchedSo.items.map((it: any) => ({
          description: it.productName ? `${it.productName}${it.specification ? ' - ' + it.specification : ''}` : it.description || 'Machinery / Equipment',
          hsnSac: it.hsnSac || it.hsnCode || '8462',
          qty: Number(it.quantity || it.qty || 1),
          unitPrice: Number(it.rate || it.unitPrice || it.amount || 0),
          taxRate: 18,
        }));
        setItems(autoItems);
      } else if (matchedSo.orderValue) {
        setItems([
          {
            description: `Sales Order Contract: ${matchedSo.salesOrderNumber}`,
            hsnSac: '8462',
            qty: 1,
            unitPrice: matchedSo.orderValue,
            taxRate: 18,
          },
        ]);
      }
    }
  };

  const filteredInvoices = salesInvoices.filter((inv) => {
    const matchesSearch =

      !searchTerm?.trim() || (

      inv.invoiceNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      inv.salesOrderNumber?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: '', hsnSac: '8462', qty: 1, unitPrice: 0, taxRate: 18 }]);
  };

  const handleRemoveItem = (idxToRemove: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idxToRemove));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId) || customers[0];

    let subTotal = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    const formattedItems = items.map((item, idx) => {
      const q = Number(item.qty) || 0;
      const rate = Number(item.unitPrice) || 0;
      const tRate = Number(item.taxRate) || 0;
      const lineTotal = q * rate;
      subTotal += lineTotal;
      const taxVal = (lineTotal * tRate) / 100;
      if (placeOfSupply.includes('Gujarat')) {
        cgstAmount += taxVal / 2;
        sgstAmount += taxVal / 2;
      } else {
        igstAmount += taxVal;
      }
      return {
        id: `SITEM-${idx + 1}`,
        description: item.description,
        hsnSac: item.hsnSac,
        quantity: q,
        unitPrice: rate,
        taxRate: tRate,
        taxAmount: taxVal,
        totalAmount: lineTotal + taxVal,
      };
    });

    const taxTotal = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = subTotal + taxTotal;

    addSalesInvoice({
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate,
      customerId: cust.id,
      customerName: cust.companyName || (cust as any).customerName || (cust as any).name || 'Unknown Customer',
      customerGstin: cust.gstin || '',
      salesOrderNumber,
      jobNumber: (salesOrders.find((s) => s.salesOrderNumber === salesOrderNumber || s.id === salesOrderNumber) as any)?.jobNumber || '',
      projectId: (salesOrders.find((s) => s.salesOrderNumber === salesOrderNumber || s.id === salesOrderNumber) as any)?.projectId || '',
      placeOfSupply,
      items: formattedItems,
      subTotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      taxTotal,
      grandTotal,
      status: 'Draft',
      paymentStatus: 'Unpaid',
      termsAndConditions: '1. Subject to Vadodara Jurisdiction. 2. Payment due within 30 days.',
      createdBy: 'Rajesh Patel',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Sales Invoices & GST Output Register</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Automated GST Invoicing • Linked to Sales Order & Job Traceability</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Sales Invoice</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search invoice no, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Draft', 'Approved', 'Posted'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedStatus === st ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#FAF7F2] text-[#70665F] border border-[#EBE3DB]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
        <table className="w-full text-left text-xs text-[#544B45]">
          <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
            <tr>
              <th className="py-3.5 px-4">Invoice No</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Sales Order / Job</th>
              <th className="py-3.5 px-4 text-right">Taxable SubTotal</th>
              <th className="py-3.5 px-4 text-right">GST Total</th>
              <th className="py-3.5 px-4 text-right">Grand Total</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/40 transition">
                <td className="py-3 px-4 font-bold text-emerald-400">{inv.invoiceNumber}</td>
                <td className="py-3 px-4 text-[#70665F] font-sans">{inv.invoiceDate}</td>
                <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{inv.customerName}</td>
                <td className="py-3 px-4 font-sans text-[#70665F]">
                  {inv.salesOrderNumber} {inv.jobNumber && `(${inv.jobNumber})`}
                </td>
                <td className="py-3 px-4 text-right text-[#544B45]">
                  ₹{Number(inv.subTotal ?? inv.subtotal ?? (inv as any).taxable_amount ?? inv.taxableAmount ?? 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right text-yellow-600 dark:text-yellow-400">
                  ₹{Number(inv.taxTotal ?? (Number((inv as any).cgst_amount || inv.cgstAmount || 0) + Number((inv as any).sgst_amount || inv.sgstAmount || 0) + Number((inv as any).igst_amount || inv.igstAmount || 0))).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-bold text-[#211B17]">
                  ₹{Number(inv.grandTotal ?? (inv as any).grand_total ?? 0).toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-center font-sans">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      inv.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : inv.status === 'Posted'
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-sans">
                  <div className="flex items-center justify-center gap-1.5">
                    {inv.status === 'Draft' || (inv.status as string)?.toLowerCase() === 'draft' ? (
                      <button
                        type="button"
                        onClick={() => approveSalesInvoice(inv.id || inv.invoiceNumber || (inv as any).invoice_number)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold rounded-lg transition shadow-xs cursor-pointer"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                      className="p-1.5 text-[#544B45] hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                      title="View & Print Official GST Tax Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#211B17]">Generate GST Sales Invoice</h3>
                <p className="text-[11px] text-[#70665F]">Select a Sales Order to auto-fill customer, items, and pricing</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200">
                ✨ Auto-Calculated
              </span>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              {/* Sales Order Auto-Fetch Selection */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                <label className="block text-amber-900 font-semibold mb-1 text-[11px]">
                  Select Sales Order (Auto-fills Customer, Items & Rates)
                </label>
                <select
                  value={selectedSoId}
                  onChange={(e) => handleSelectSalesOrder(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-[#3E2723] font-medium"
                >
                  <option value="DIRECT_INVOICE">-- Direct / Manual Sales Invoice --</option>
                  {salesOrders.map((so) => (
                    <option key={so.id} value={so.id || so.salesOrderNumber}>
                      {so.salesOrderNumber} - {so.customerName} (₹{Number(so.orderValue || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">Customer</label>
                  <select
                    value={customerId}
                    onChange={(e) => {
                      setCustomerId(e.target.value);
                      const c = customers.find((x) => x.id === e.target.value);
                      if (c && c.gstin && !c.gstin.startsWith('24')) {
                        setPlaceOfSupply('Other State (Interstate IGST)');
                      } else {
                        setPlaceOfSupply('Gujarat (24)');
                      }
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} {c.gstin ? `(${c.gstin})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">Place of Supply (GST Type)</label>
                  <select
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                  >
                    <option value="Gujarat (24)">Gujarat (Intrastate CGST 9% + SGST 9%)</option>
                    <option value="Other State (Interstate IGST)">Other State (Interstate IGST 18%)</option>
                    <option value="Maharashtra (27)">Maharashtra (Interstate IGST 18%)</option>
                    <option value="Rajasthan (08)">Rajasthan (Interstate IGST 18%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">Sales Order Reference</label>
                  <input
                    type="text"
                    value={salesOrderNumber}
                    onChange={(e) => setSalesOrderNumber(e.target.value)}
                    placeholder="e.g. SO-2026-0001"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                  />
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">Payment Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 pt-2 border-t border-[#EBE3DB]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#211B17]">Invoice Line Items ({items.length})</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer"
                  >
                    + Add Line Item
                  </button>
                </div>

                {items.map((it, idx) => {
                  const lineTotal = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] items-end">
                      <div className="col-span-5">
                        <label className="block text-[#70665F] text-[10px]">Description / Product</label>
                        <input
                          type="text"
                          value={it.description}
                          placeholder="Item name & specs"
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, description: val } : item)));
                          }}
                          className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-[#3E2723] text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[#70665F] text-[10px]">HSN/SAC</label>
                        <input
                          type="text"
                          value={it.hsnSac}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, hsnSac: val } : item)));
                          }}
                          className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#3E2723] text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[#70665F] text-[10px]">Qty</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={it.qty}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, qty: val } : item)));
                          }}
                          className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#3E2723] text-xs text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[#70665F] text-[10px]">Unit Rate (₹)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={it.unitPrice}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, unitPrice: val } : item)));
                          }}
                          className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#3E2723] text-xs text-right font-mono"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pb-1">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-time Calculation Summary Box */}
              {(() => {
                const subTotal = items.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
                const isGujarat = placeOfSupply.includes('Gujarat');
                const taxRate = 18;
                const totalTax = (subTotal * taxRate) / 100;
                const cgst = isGujarat ? totalTax / 2 : 0;
                const sgst = isGujarat ? totalTax / 2 : 0;
                const igst = !isGujarat ? totalTax : 0;
                const grandTotal = subTotal + totalTax;

                return (
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#70665F]">
                      <span>Taxable Value (Subtotal):</span>
                      <span className="font-mono font-semibold text-[#3E2723]">₹{subTotal.toLocaleString('en-IN')}</span>
                    </div>
                    {isGujarat ? (
                      <>
                        <div className="flex justify-between text-[#70665F]">
                          <span>CGST (9%):</span>
                          <span className="font-mono text-amber-700">₹{cgst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-[#70665F]">
                          <span>SGST (9%):</span>
                          <span className="font-mono text-amber-700">₹{sgst.toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-[#70665F]">
                        <span>IGST (18%):</span>
                        <span className="font-mono text-amber-700">₹{igst.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-[#211B17] pt-2 border-t border-[#EBE3DB]">
                      <span>Grand Total (Payable):</span>
                      <span className="font-mono text-emerald-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#EBE3DB] text-[#544B45] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-sm cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT OFFICIAL GST TAX INVOICE MODAL */}
      {selectedInvoiceForPrint && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedInvoiceForPrint(null)}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto text-[#211B17]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (Hidden when printed) */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE3DB] print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#211B17]">
                  Tax Invoice Preview: <span className="font-mono text-emerald-700">{selectedInvoiceForPrint.invoiceNumber}</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="p-2 rounded-xl text-[#70665F] hover:bg-[#FAF7F2] hover:text-[#211B17] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document Body */}
            <div className="space-y-6 font-sans">
              {/* Header Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4">
                <div>
                  <h1 className="text-xl font-black text-emerald-950 uppercase tracking-tight">UMA TECHNO FAB PVT. LTD.</h1>
                  <p className="text-[11px] text-[#544B45] font-medium leading-relaxed">
                    Plot No. 42-45, GIDC Industrial Estate, Manjusar, Savli, Vadodara - 391775, Gujarat, India<br />
                    GSTIN: <span className="font-mono font-bold text-[#211B17]">24AAACU1234F1Z5</span> • PAN: <span className="font-mono font-bold text-[#211B17]">AAACU1234F</span> • State Code: 24<br />
                    Email: accounts@umatechnofab.com • Phone: +91 265 2984110
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-800 text-white text-xs font-black uppercase rounded tracking-wider">
                    TAX INVOICE
                  </span>
                  <div className="text-[11px] font-mono text-[#544B45] mt-1.5">
                    Original for Recipient
                  </div>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#70665F] block">Invoice Number</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">{selectedInvoiceForPrint.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#70665F] block">Invoice Date</span>
                  <span className="font-mono font-semibold text-[#211B17]">{selectedInvoiceForPrint.invoiceDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#70665F] block">Sales Order Ref</span>
                  <span className="font-mono font-semibold text-[#211B17]">{selectedInvoiceForPrint.salesOrderNumber || 'SO-DIRECT'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#70665F] block">Due Date</span>
                  <span className="font-mono font-semibold text-[#211B17]">{selectedInvoiceForPrint.dueDate || selectedInvoiceForPrint.invoiceDate}</span>
                </div>
              </div>

              {/* Bill To & Ship To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-[#EBE3DB] bg-white">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">Details of Receiver (Billed To)</span>
                  <h4 className="font-bold text-[#211B17] text-sm">{selectedInvoiceForPrint.customerName}</h4>
                  <div className="text-[#544B45] text-[11px] space-y-0.5 mt-1">
                    <p>Customer ID: <span className="font-mono">{selectedInvoiceForPrint.customerId || '—'}</span></p>
                    <p>GSTIN: <span className="font-mono font-semibold text-[#211B17]">{(selectedInvoiceForPrint as any).customerGstin || '—'}</span></p>
                    <p>Place of Supply: <span className="font-semibold">{selectedInvoiceForPrint.placeOfSupply || 'Gujarat (24)'}</span></p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-[#EBE3DB] bg-white">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">Dispatched From (Factory Site)</span>
                  <h4 className="font-bold text-[#211B17] text-sm">UMA Techno Fab Work Center 01</h4>
                  <div className="text-[#544B45] text-[11px] space-y-0.5 mt-1">
                    <p>Job / Project Ref: <span className="font-mono font-semibold">{selectedInvoiceForPrint.jobNumber || 'PROJECT MTO'}</span></p>
                    <p>Payment Terms: 30 Days Net from Delivery</p>
                    <p>Status: <span className="font-bold text-emerald-700">{selectedInvoiceForPrint.status}</span></p>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#544B45] uppercase text-[10px] font-bold border-b border-[#EBE3DB]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">HSN/SAC</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Rate (₹)</th>
                      <th className="p-2.5 text-right">Taxable Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3DB]">
                    {(selectedInvoiceForPrint.items && selectedInvoiceForPrint.items.length > 0
                      ? selectedInvoiceForPrint.items
                      : [
                          {
                            description: 'Fabricated Process Equipment / Industrial Tank (MTO)',
                            hsnSac: '8462',
                            quantity: 1,
                            rate: Number(selectedInvoiceForPrint.subTotal ?? (selectedInvoiceForPrint as any).taxable_amount ?? 0),
                            amount: Number(selectedInvoiceForPrint.subTotal ?? (selectedInvoiceForPrint as any).taxable_amount ?? 0),
                          },
                        ]
                    ).map((itm: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FAF7F2]/50">
                        <td className="p-2.5 text-[#70665F] font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-[#211B17]">{itm.description || itm.item_description || itm.itemName || 'Engineering Equipment'}</td>
                        <td className="p-2.5 font-mono text-[#544B45]">{itm.hsnSac || itm.hsn_sac || '8462'}</td>
                        <td className="p-2.5 text-right font-mono">{itm.quantity ?? itm.qty ?? 1}</td>
                        <td className="p-2.5 text-right font-mono">₹{Number(itm.rate || itm.unitPrice || 0).toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#211B17]">
                          ₹{Number(itm.amount || (itm.quantity * itm.rate) || selectedInvoiceForPrint.subTotal || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax & Total Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] text-xs flex-1 space-y-1">
                  <span className="font-bold text-[#211B17] block text-[11px]">Bank Remittance Details:</span>
                  <p className="text-[11px] text-[#544B45]">Bank Name: <span className="font-semibold text-[#211B17]">HDFC Bank Ltd</span></p>
                  <p className="text-[11px] text-[#544B45]">A/C No: <span className="font-mono font-bold text-[#211B17]">50200088991234</span> (Current)</p>
                  <p className="text-[11px] text-[#544B45]">IFSC Code: <span className="font-mono font-bold text-[#211B17]">HDFC0000288</span> (Vadodara Branch)</p>
                </div>

                <div className="w-full sm:w-72 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] space-y-2 text-xs">
                  <div className="flex justify-between text-[#544B45]">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono font-semibold text-[#211B17]">
                      ₹{Number(selectedInvoiceForPrint.subTotal ?? (selectedInvoiceForPrint as any).taxable_amount ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#544B45]">
                    <span>CGST (9%):</span>
                    <span className="font-mono font-semibold text-[#211B17]">
                      ₹{Number((selectedInvoiceForPrint as any).cgst_amount || selectedInvoiceForPrint.cgstAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#544B45]">
                    <span>SGST (9%):</span>
                    <span className="font-mono font-semibold text-[#211B17]">
                      ₹{Number((selectedInvoiceForPrint as any).sgst_amount || selectedInvoiceForPrint.sgstAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {(Number((selectedInvoiceForPrint as any).igst_amount || selectedInvoiceForPrint.igstAmount || 0) > 0) && (
                    <div className="flex justify-between text-[#544B45]">
                      <span>IGST (18%):</span>
                      <span className="font-mono font-semibold text-[#211B17]">
                        ₹{Number((selectedInvoiceForPrint as any).igst_amount || selectedInvoiceForPrint.igstAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#EBE3DB] text-sm">
                    <span className="font-black text-emerald-950">Grand Total:</span>
                    <span className="font-mono font-black text-emerald-800 text-base">
                      ₹{Number(selectedInvoiceForPrint.grandTotal ?? (selectedInvoiceForPrint as any).grand_total ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Authorized Signatory */}
              <div className="pt-8 border-t border-[#EBE3DB] flex justify-between items-end text-[11px] text-[#70665F]">
                <div>
                  <p>Declaration: Certified that all particulars are true and correct.</p>
                  <p>Subject to Vadodara Jurisdiction.</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#211B17]">For UMA TECHNO FAB PRIVATE LIMITED</p>
                  <div className="h-10"></div>
                  <p className="font-semibold text-[#211B17]">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
