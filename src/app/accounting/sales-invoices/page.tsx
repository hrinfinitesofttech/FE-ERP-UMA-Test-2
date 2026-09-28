'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { SalesInvoice } from '../../../types/accounting';
import { Receipt, Search, Plus, Filter, CheckCircle2, Clock, Eye, Download, FileSpreadsheet, Building, Users } from 'lucide-react';

export default function SalesInvoicesPage() {
  const { salesInvoices, addSalesInvoice, approveSalesInvoice, customers, salesOrders } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      inv.invoiceNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      inv.salesOrderNumber?.toLowerCase().includes(searchTerm?.toLowerCase());
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
      customerGstin: cust.gstin || '24AAACX0000X1Z1',
      salesOrderNumber,
      jobNumber: 'JOB-2026-001',
      projectId: 'PROJ-2026-001',
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
                  {inv.status === 'Draft' || (inv.status as string)?.toLowerCase() === 'draft' ? (
                    <button
                      type="button"
                      onClick={() => approveSalesInvoice(inv.id || inv.invoiceNumber || (inv as any).invoice_number)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold rounded-lg transition shadow-sm cursor-pointer"
                    >
                      Approve Invoice
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
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
    </div>
  );
}
