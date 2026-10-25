'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { printContent } from '@/lib/printUtils';
import {
  Receipt,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  X,
  ShieldCheck,
  Trash2,
  PlusCircle,
  AlertCircle,
  Sparkles,
  PackageCheck,
  Building2,
  Check,
  Banknote,
} from 'lucide-react';
import { PurchaseInvoice, PurchaseInvoiceItem } from '../../../types/accounting';
import { POItem } from '../../../types/purchase';
import { GoodsReceiptNote } from '../../../types/store';
import { formatCurrency } from '../../../lib/utils';

function PurchaseBillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    purchaseInvoices,
    addPurchaseInvoice,
    deletePurchaseInvoice,
    updatePurchaseInvoicePayment,
    purchaseOrders,
    goodsReceipts,
    suppliers,
    bankAccounts,
    currentUser,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'partial' | 'grn_verified' | 'paid'>('all');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<PurchaseInvoice | null>(null);

  // Payment Modal Fields
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('NEFT/RTGS');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isFinalSettlement, setIsFinalSettlement] = useState<boolean>(false);

  // Create Bill Form Fields
  const [createMode, setCreateMode] = useState<'from_po' | 'manual'>('from_po');
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState<string>('');
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierName, setSupplierName] = useState<string>('');
  const [supplierGstin, setSupplierGstin] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('30% Advance before dispatch, Balance on Safe Delivery & GRN');
  const [poNumberRef, setPoNumberRef] = useState<string>('');
  const [projectJobRef, setProjectJobRef] = useState<string>('');
  const [billItems, setBillItems] = useState<PurchaseInvoiceItem[]>([
    {
      id: 'item-1',
      itemName: '',
      description: '',
      hsnSac: '7308',
      quantity: 1,
      unitPrice: 0,
      gstRatePercent: 18,
      totalAmount: 0,
    },
  ]);
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [advanceAmountPaidAtCreation, setAdvanceAmountPaidAtCreation] = useState<number>(0);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setMounted(true);
    const poParam = searchParams.get('poNumber') || searchParams.get('poId');
    if (poParam) {
      setSelectedPoId(poParam);
      setCreateMode('from_po');
      setShowCreateModal(true);
    }
  }, [searchParams]);

  // When selected PO changes in create modal, autofill details
  const handleSelectPO = (poIdOrNum: string) => {
    setSelectedPoId(poIdOrNum);
    const po = purchaseOrders.find(
      (p) => p.id === poIdOrNum || p.poNumber === poIdOrNum
    );
    if (po) {
      setPoNumberRef(po.poNumber);
      setSelectedSupplierId(po.supplierId || '');
      setSupplierName(po.supplierName || '');
      setSupplierGstin((po as any).supplierGstin || (po as any).gstin || '');
      setProjectJobRef(po.projectId || (po as any).jobNumber || '');
      if (po.paymentTerms) {
        setPaymentTerms(po.paymentTerms);
      }

      if (po.items && po.items.length > 0) {
        const mappedItems: PurchaseInvoiceItem[] = po.items.map((it: POItem, idx: number) => {
          const qty = Number(it.quantity || 1);
          const rate = Number(it.unitPrice || (it as any).rate || 0);
          const taxPct = Number((it as any).taxRate || (it as any).gstRate || 18);
          const taxable = qty * rate;
          const tax = (taxable * taxPct) / 100;
          return {
            id: `bill-item-${idx + 1}`,
            itemId: (it as any).itemId,
            itemName: it.itemName || `Item ${idx + 1}`,
            description: it.description || '',
            hsnSac: (it as any).hsnSac || '7308',
            quantity: qty,
            uom: (it as any).uom || 'Nos',
            unitPrice: rate,
            rate: rate,
            gstRatePercent: taxPct,
            taxRate: taxPct,
            taxableAmount: taxable,
            taxAmount: tax,
            totalAmount: taxable + tax,
          };
        });
        setBillItems(mappedItems);
      }
    }
  };

  // Calculations for create bill modal
  const calculatedSubtotal = useMemo(() => {
    return billItems.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  }, [billItems]);

  const calculatedTaxTotal = useMemo(() => {
    return billItems.reduce((acc, it) => {
      const taxable = Number(it.quantity || 0) * Number(it.unitPrice || 0);
      const taxPct = Number(it.gstRatePercent || 18);
      return acc + (taxable * taxPct) / 100;
    }, 0);
  }, [billItems]);

  const calculatedGrandTotal = useMemo(() => {
    return Math.round(calculatedSubtotal + calculatedTaxTotal + Number(freightCharges || 0) + Number(otherCharges || 0));
  }, [calculatedSubtotal, calculatedTaxTotal, freightCharges, otherCharges]);

  // Helper: Find matching GRN for a bill
  const getLinkedGRN = (bill: PurchaseInvoice): GoodsReceiptNote | undefined => {
    const poNum = bill.poNumber;
    const invNum = bill.vendorInvoiceNumber || bill.invoiceNumber;
    return goodsReceipts.find((grn) => {
      if (poNum && grn.poNumber && grn.poNumber.trim().toLowerCase() === poNum.trim().toLowerCase()) {
        return true;
      }
      if (invNum && grn.invoiceNumber && grn.invoiceNumber.trim().toLowerCase() === invNum.trim().toLowerCase()) {
        return true;
      }
      return false;
    });
  };

  // Filtered bills
  const filteredBills = useMemo(() => {
    return purchaseInvoices.filter((bill) => {
      const paid = Number(bill.paidAmount || 0);
      const grand = Number(bill.grandTotal || 0);
      const isPaid = paid >= grand && grand > 0;
      const isPartial = paid > 0 && !isPaid;
      const isUnpaid = paid === 0;
      const linkedGrn = getLinkedGRN(bill);
      const isGrnVerified =
        !!linkedGrn &&
        (linkedGrn.status === 'Accepted' ||
          linkedGrn.status === 'Received' ||
          linkedGrn.status === 'Partially Accepted' ||
          linkedGrn.status === 'Closed' ||
          String(linkedGrn.status).toLowerCase().includes('pass') ||
          String(linkedGrn.status).toLowerCase().includes('approved'));

      if (activeTab === 'unpaid') return isUnpaid;
      if (activeTab === 'partial') return isPartial;
      if (activeTab === 'grn_verified') return isGrnVerified;
      if (activeTab === 'paid') return isPaid;
      return true;
    });
  }, [purchaseInvoices, activeTab, goodsReceipts]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const totalCount = purchaseInvoices.length;
    const totalValue = purchaseInvoices.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const advancePaid = purchaseInvoices.reduce((sum, b) => sum + Number(b.paidAmount || 0), 0);
    const totalBalance = Math.max(0, totalValue - advancePaid);

    let grnVerifiedCount = 0;
    let readyForSettlementCount = 0;
    let fullyPaidCount = 0;

    purchaseInvoices.forEach((b) => {
      const paid = Number(b.paidAmount || 0);
      const grand = Number(b.grandTotal || 0);
      const isPaid = paid >= grand && grand > 0;
      const grn = getLinkedGRN(b);

      if (isPaid) {
        fullyPaidCount++;
      } else if (grn) {
        grnVerifiedCount++;
        readyForSettlementCount++;
      }
    });

    return {
      totalCount,
      totalValue,
      advancePaid,
      totalBalance,
      grnVerifiedCount,
      readyForSettlementCount,
      fullyPaidCount,
    };
  }, [purchaseInvoices, goodsReceipts]);

  // Open Payment Modal
  const handleOpenPaymentModal = (bill: PurchaseInvoice, finalSettle: boolean = false) => {
    setSelectedBill(bill);
    setIsFinalSettlement(finalSettle);
    const grand = Number(bill.grandTotal || 0);
    const paid = Number(bill.paidAmount || 0);
    const outstanding = Math.max(0, grand - paid);

    if (finalSettle) {
      setPaymentAmount(outstanding);
    } else {
      // Default to 30% or remaining outstanding
      const defaultAdvance = Math.round(grand * 0.3);
      setPaymentAmount(Math.min(defaultAdvance, outstanding));
    }

    setPaymentMode('NEFT/RTGS');
    setPaymentRef('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes(
      finalSettle
        ? 'Final balance settled after safe delivery & GRN inspection verification.'
        : 'Advance payment released as per vendor agreement before dispatch.'
    );
    if (bankAccounts && bankAccounts.length > 0) {
      setSelectedBank(bankAccounts[0].bankName || bankAccounts[0].accountNumber || '');
    }
    setShowPaymentModal(true);
  };

  // Submit Payment
  const handleRecordPaymentSubmit = () => {
    if (!selectedBill) return;
    if (paymentAmount <= 0) {
      showToast('⚠️ Please enter a valid payment amount.');
      return;
    }

    const currentPaid = Number(selectedBill.paidAmount || 0);
    const grand = Number(selectedBill.grandTotal || 0);
    const newPaid = currentPaid + Number(paymentAmount);
    const outstanding = Math.max(0, grand - newPaid);
    const newStatus: 'Paid' | 'Partially Paid' | 'Unpaid' = outstanding <= 0 ? 'Paid' : 'Partially Paid';

    if (updatePurchaseInvoicePayment) {
      (updatePurchaseInvoicePayment as any)(selectedBill.id, {
        paymentStatus: newStatus,
        paidAmount: newPaid,
        paymentMode: paymentMode,
        referenceNumber: paymentRef,
        paymentDate: paymentDate,
        bankName: selectedBank,
        notes: paymentNotes,
      });
    }

    showToast(
      isFinalSettlement || outstanding <= 0
        ? `✅ Payment for bill ${selectedBill.invoiceNumber} is fully settled! (100% Settled)`
        : `✅ Payment of ₹${paymentAmount.toLocaleString()} recorded for bill ${selectedBill.invoiceNumber}!`
    );

    setShowPaymentModal(false);
    setSelectedBill(null);
  };

  // Submit Create New Purchase Bill
  const handleCreateBillSubmit = () => {
    if (!vendorInvoiceNumber.trim()) {
      showToast('⚠️ Please enter Vendor Invoice Number.');
      return;
    }
    if (!supplierName.trim()) {
      showToast('⚠️ Please select a Supplier / Vendor.');
      return;
    }

    const nextId = `PBILL-2026-${String(purchaseInvoices.length + 1).padStart(4, '0')}`;
    const initialPaid = Number(advanceAmountPaidAtCreation || 0);
    const initialOutstanding = Math.max(0, calculatedGrandTotal - initialPaid);
    const initialStatus: 'Paid' | 'Partially Paid' | 'Unpaid' =
      initialPaid >= calculatedGrandTotal && calculatedGrandTotal > 0
        ? 'Paid'
        : initialPaid > 0
        ? 'Partially Paid'
        : 'Unpaid';

    const newBill: PurchaseInvoice = {
      id: nextId,
      invoiceNumber: nextId,
      vendorInvoiceNumber: vendorInvoiceNumber.trim(),
      supplierInvoiceNumber: vendorInvoiceNumber.trim(),
      invoiceDate: billDate,
      dueDate: dueDate,
      supplierId: selectedSupplierId,
      supplierName: supplierName.trim(),
      supplierGstin: supplierGstin.trim(),
      poNumber: poNumberRef || undefined,
      projectId: projectJobRef || undefined,
      paymentTerms: paymentTerms,
      items: billItems,
      subTotal: calculatedSubtotal,
      subtotal: calculatedSubtotal,
      taxTotal: calculatedTaxTotal,
      freightCharges: Number(freightCharges || 0),
      otherCharges: Number(otherCharges || 0),
      grandTotal: calculatedGrandTotal,
      paidAmount: initialPaid,
      outstandingAmount: initialOutstanding,
      paymentStatus: initialStatus,
      status: 'Posted',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Admin',
    };

    addPurchaseInvoice(newBill);
    showToast(`✅ Purchase bill ${newBill.invoiceNumber} created successfully!`);
    setShowCreateModal(false);

    // Reset Form
    setVendorInvoiceNumber('');
    setSelectedPoId('');
    setPoNumberRef('');
    setSupplierName('');
    setSupplierGstin('');
    setAdvanceAmountPaidAtCreation(0);
    setBillItems([
      {
        id: 'item-1',
        itemName: '',
        description: '',
        hsnSac: '7308',
        quantity: 1,
        unitPrice: 0,
        gstRatePercent: 18,
        totalAmount: 0,
      },
    ]);
  };

  // Table Columns
  const columns: ERPColumn<PurchaseInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Bill No & Invoice No',
      cell: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              onClick={() => {
                setSelectedBill(row);
                setShowViewModal(true);
              }}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Receipt className="w-3.5 h-3.5" />
              {row.invoiceNumber}
            </span>
          </div>
          {row.vendorInvoiceNumber && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <span className="text-[10px] uppercase font-semibold bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-600 dark:text-gray-300">
                Vendor:
              </span>
              {row.vendorInvoiceNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'invoiceDate',
      header: 'Bill Date & Due',
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-gray-900 dark:text-white font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            {row.invoiceDate || row.createdAt || '-'}
          </div>
          {row.dueDate && (
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              Due: {row.dueDate}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier / Vendor',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {row.supplierName || 'Vendor'}
          </span>
          {row.supplierGstin && (
            <span className="text-[11px] text-gray-400 font-mono mt-0.5">
              GST: {row.supplierGstin}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'poNumber',
      header: 'Linked PO',
      cell: (row) => {
        if (!row.poNumber) {
          return <span className="text-xs text-gray-400 italic">Direct / No PO</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            <Link
              href={`/purchase/po?search=${encodeURIComponent(row.poNumber)}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/60 transition-colors w-fit"
            >
              <Receipt className="w-3 h-3" />
              {row.poNumber}
            </Link>
            {row.projectId && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                Job: {row.projectId}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'grnStatus',
      header: 'Safe Delivery / GRN Verification',
      cell: (row) => {
        const grn = getLinkedGRN(row);
        if (grn) {
          return (
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 w-fit">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Material Verified (GRN)
              </span>
              <span className="text-[11px] text-gray-600 dark:text-gray-300 font-mono flex items-center gap-1">
                <PackageCheck className="w-3 h-3 text-emerald-500" />
                {grn.grnNumber}
              </span>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800 w-fit">
              <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
              Awaiting Safe Delivery
            </span>
            <span className="text-[10px] text-gray-400 italic">Material delivery pending</span>
          </div>
        );
      },
    },
    {
      key: 'grandTotal',
      header: 'Total Bill Amount',
      cell: (row) => (
        <div className="font-bold text-gray-900 dark:text-white text-sm">
          {formatCurrency(Number(row.grandTotal || 0))}
        </div>
      ),
    },
    {
      key: 'paidVsBalance',
      header: 'Paid vs Balance',
      cell: (row) => {
        const grand = Number(row.grandTotal || 0);
        const paid = Number(row.paidAmount || 0);
        const balance = Math.max(0, grand - paid);
        const pct = grand > 0 ? Math.min(100, Math.round((paid / grand) * 100)) : 0;

        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Paid: ₹{paid.toLocaleString()}
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Bal: ₹{balance.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-400 text-right">{pct}% cleared</div>
          </div>
        );
      },
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      cell: (row) => {
        const grand = Number(row.grandTotal || 0);
        const paid = Number(row.paidAmount || 0);
        const isPaid = paid >= grand && grand > 0;
        const isPartial = paid > 0 && !isPaid;

        if (isPaid) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Paid (100% Settled)
            </span>
          );
        }
        if (isPartial) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Partially Paid (Advance)
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Unpaid (Pending)
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => {
        const grand = Number(row.grandTotal || 0);
        const paid = Number(row.paidAmount || 0);
        const outstanding = Math.max(0, grand - paid);
        const isPaid = outstanding <= 0 && grand > 0;
        const grn = getLinkedGRN(row);

        return (
          <div className="flex items-center gap-1.5">
            {!isPaid && (
              <>
                {paid === 0 ? (
                  <button
                    onClick={() => handleOpenPaymentModal(row, false)}
                    title="Pay Advance before dispatch"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    Pay Advance
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenPaymentModal(row, true)}
                    title={
                      grn
                        ? 'Settle Final Balance (Material Received & Verified)'
                        : 'Settle Final Balance'
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded text-white shadow-sm transition-all ${
                      grn
                        ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Final Settle
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => {
                setSelectedBill(row);
                setShowViewModal(true);
              }}
              title="View Bill Voucher"
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>

            {deletePurchaseInvoice && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete Bill ${row.invoiceNumber}?`)) {
                    deletePurchaseInvoice(row.id);
                    showToast(`Bill ${row.invoiceNumber} deleted successfully.`);
                  }
                }}
                title="Delete Bill"
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Bills */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Purchase Bills
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.totalCount}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              ₹{(metrics.totalValue / 100000).toFixed(2)}L
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Total purchase invoice value
          </p>
        </div>

        {/* Advance / Part Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Advance Paid
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{(metrics.advancePaid / 100000).toFixed(2)}L
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Advance paid prior to dispatch
          </p>
        </div>

        {/* Safe Delivery & GRN Verified */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              GRN Verified
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.grnVerifiedCount}
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Verified Stock
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Store & QC verified inwards
          </p>
        </div>

        {/* Ready for Balance Settlement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Ready to Settle
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {metrics.readyForSettlementCount}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Bills
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Goods received — balance due
          </p>
        </div>

        {/* 100% Fully Settled */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Fully Settled
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.fullyPaidCount}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Closed
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            100% Paid & Bill Closed
          </p>
        </div>
      </div>

      {/* Main List Layout */}
      <ERPListPageLayout<PurchaseInvoice>
        breadcrumbs={['DASHBOARD', 'PROCUREMENT', 'PURCHASE BILLS']}
        title="Purchase Bills & Vendor Invoices"
        data={filteredBills}
        columns={columns}
        searchPlaceholder="Search by Bill No, Vendor Invoice, PO, Supplier..."
        onAddNew={() => setShowCreateModal(true)}
        addNewLabel="Create Purchase Bill"
        extraHeaderActions={
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              All ({purchaseInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'unpaid'
                  ? 'bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Unpaid
            </button>
            <button
              onClick={() => setActiveTab('partial')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'partial'
                  ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Advance Given
            </button>
            <button
              onClick={() => setActiveTab('grn_verified')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'grn_verified'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              🟢 Safe Delivery (GRN Verified)
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'paid'
                  ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Fully Settled
            </button>
          </div>
        }
      />

      {/* CREATE PURCHASE BILL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Create New Purchase Bill
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Import from confirmed PO or enter vendor invoice details directly
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Mode Toggle */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Bill Source:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateMode('from_po')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      createMode === 'from_po'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Import from Confirmed PO
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateMode('manual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      createMode === 'manual'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Direct Manual Entry
                  </button>
                </div>
              </div>

              {/* PO Selection (if in PO mode) */}
              {createMode === 'from_po' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Select Confirmed Purchase Order *</span>
                    <span className="text-[11px] text-gray-400">
                      Auto-populates items, rates, taxes & supplier
                    </span>
                  </label>
                  <select
                    value={selectedPoId}
                    onChange={(e) => handleSelectPO(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Purchase Order --</option>
                    {purchaseOrders.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} | {po.supplierName} | ₹{(po.grandTotal || 0).toLocaleString()} | {po.poDate || po.createdAt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Vendor Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-9843 or UT/2026/012"
                    value={vendorInvoiceNumber}
                    onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Bill / Invoice Date *
                  </label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Vendor & Ref Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Supplier / Vendor Name *
                  </label>
                  {createMode === 'manual' ? (
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => {
                        const sid = e.target.value;
                        setSelectedSupplierId(sid);
                        const s = suppliers.find((sup) => sup.id === sid);
                        if (s) {
                          setSupplierName(s.name);
                          setSupplierGstin(s.gstin || '');
                        }
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={supplierName}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Supplier GSTIN
                  </label>
                  <input
                    type="text"
                    value={supplierGstin}
                    onChange={(e) => setSupplierGstin(e.target.value)}
                    placeholder="24AAAAA0000A1Z5"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Project / Job Reference
                  </label>
                  <input
                    type="text"
                    value={projectJobRef}
                    onChange={(e) => setProjectJobRef(e.target.value)}
                    placeholder="e.g. UMA-MTO-2026-001"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Agreed Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. 30% Advance before dispatch, Balance 70% after safe delivery & GRN"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                />
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Bill Line Items & Material Details ({billItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setBillItems([
                        ...billItems,
                        {
                          id: `item-${billItems.length + 1}`,
                          itemName: '',
                          description: '',
                          hsnSac: '7308',
                          quantity: 1,
                          unitPrice: 0,
                          gstRatePercent: 18,
                          totalAmount: 0,
                        },
                      ]);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto shadow-xs bg-white dark:bg-gray-900">
                  <table className="w-full min-w-[780px] text-left text-xs border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 font-bold uppercase tracking-wider text-[11px]">
                      <tr className="divide-x divide-gray-200 dark:divide-gray-700">
                        <th className="p-2.5 min-w-[260px]">Item & Description</th>
                        <th className="p-2.5 w-28 min-w-[100px] text-center">HSN/SAC</th>
                        <th className="p-2.5 w-24 min-w-[85px] text-right">Qty</th>
                        <th className="p-2.5 w-32 min-w-[110px] text-right">Rate (₹)</th>
                        <th className="p-2.5 w-28 min-w-[95px] text-center">GST %</th>
                        <th className="p-2.5 w-32 min-w-[110px] text-right">Total (₹)</th>
                        <th className="p-2.5 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {billItems.map((it, idx) => {
                        const lineTaxable = Number(it.quantity || 0) * Number(it.unitPrice || 0);
                        const lineTax = (lineTaxable * Number(it.gstRatePercent || 18)) / 100;
                        const lineTotal = lineTaxable + lineTax;

                        return (
                          <tr key={it.id || idx} className="divide-x divide-gray-200 dark:divide-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 align-top">
                            <td className="p-2.5">
                              <div className="flex flex-col gap-1.5 w-full">
                                <input
                                  type="text"
                                  placeholder="Item Name (e.g. MS Flange 250NB)"
                                  value={it.itemName || ''}
                                  onChange={(e) => {
                                    const updated = [...billItems];
                                    updated[idx].itemName = e.target.value;
                                    setBillItems(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Specification / Grade"
                                  value={it.description || ''}
                                  onChange={(e) => {
                                    const updated = [...billItems];
                                    updated[idx].description = e.target.value;
                                    setBillItems(updated);
                                  }}
                                  className="w-full px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-[11px] text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={it.hsnSac || '7308'}
                                onChange={(e) => {
                                  const updated = [...billItems];
                                  updated[idx].hsnSac = e.target.value;
                                  setBillItems(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-mono text-center font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="0"
                                value={it.quantity || 1}
                                onChange={(e) => {
                                  const updated = [...billItems];
                                  updated[idx].quantity = Number(e.target.value);
                                  setBillItems(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-mono font-semibold text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="0"
                                value={it.unitPrice || 0}
                                onChange={(e) => {
                                  const updated = [...billItems];
                                  updated[idx].unitPrice = Number(e.target.value);
                                  setBillItems(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-mono font-bold text-right text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <select
                                value={it.gstRatePercent || 18}
                                onChange={(e) => {
                                  const updated = [...billItems];
                                  updated[idx].gstRatePercent = Number(e.target.value);
                                  setBillItems(updated);
                                }}
                                className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-center cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                              >
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                              </select>
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-sm text-gray-900 dark:text-white pt-3">
                              ₹{Math.round(lineTotal).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-center pt-3">
                              {billItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBillItems(billItems.filter((_, i) => i !== idx));
                                  }}
                                  className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                  title="Remove Line"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary & Advance input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase">
                    <Banknote className="w-4 h-4" />
                    Record Initial Advance Payment (If Paid)
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    If an advance payment was released to the vendor upon PO confirmation, record the amount here to track the remaining balance.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Advance Paid Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={calculatedGrandTotal}
                      value={advanceAmountPaidAtCreation}
                      onChange={(e) => setAdvanceAmountPaidAtCreation(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-700 rounded-lg text-sm font-bold text-amber-900 dark:text-amber-200"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Taxable Subtotal:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{calculatedSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>GST (CGST + SGST / IGST):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{Math.round(calculatedTaxTotal).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span>Freight / Transport (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={freightCharges}
                      onChange={(e) => setFreightCharges(Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-right text-xs"
                    />
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="text-blue-600 dark:text-blue-400 text-base">
                      ₹{calculatedGrandTotal.toLocaleString()}
                    </span>
                  </div>
                  {advanceAmountPaidAtCreation > 0 && (
                    <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Advance Paid:</span>
                      <span>- ₹{advanceAmountPaidAtCreation.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold text-rose-600 dark:text-rose-400 border-t border-dashed border-gray-300 dark:border-gray-700 pt-1">
                    <span>Balance Remaining on Delivery:</span>
                    <span>
                      ₹{Math.max(0, calculatedGrandTotal - advanceAmountPaidAtCreation).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 z-10">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBillSubmit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save & Post Purchase Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT / FINAL SETTLEMENT MODAL */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl text-white ${
                    isFinalSettlement ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                >
                  {isFinalSettlement ? <CheckCircle2 className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {isFinalSettlement
                      ? 'Final Payment Settlement'
                      : 'Record Advance / Part Payment'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bill: <span className="font-mono font-bold text-blue-600">{selectedBill.invoiceNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Summary Card */}
              <div className="bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendor / Supplier:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedBill.supplierName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Bill Value:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(Number(selectedBill.grandTotal || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Already Paid:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(Number(selectedBill.paidAmount || 0))}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700 font-bold">
                  <span className="text-rose-600 dark:text-rose-400">Balance Outstanding:</span>
                  <span className="text-rose-600 dark:text-rose-400 text-sm">
                    {formatCurrency(
                      Math.max(0, Number(selectedBill.grandTotal || 0) - Number(selectedBill.paidAmount || 0))
                    )}
                  </span>
                </div>
              </div>

              {/* Delivery / GRN Verification Banner */}
              {(() => {
                const grn = getLinkedGRN(selectedBill);
                if (grn) {
                  return (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">Material safely received & verified! </span>
                        (GRN: {grn.grnNumber} - Verified by Store/QC). Ready for final settlement.
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold">Material in transit / pending delivery. </span>
                        Standard practice is advance/part payment. Final balance is settled upon GRN verification.
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Amount Input with Shortcuts */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Payment Amount to Release (₹) *
                  </label>
                  <div className="flex gap-1">
                    {[20, 30, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          const grand = Number(selectedBill.grandTotal || 0);
                          const amt = Math.round((grand * pct) / 100);
                          const maxRemaining = Math.max(0, grand - Number(selectedBill.paidAmount || 0));
                          setPaymentAmount(Math.min(amt, maxRemaining));
                        }}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-200 rounded"
                      >
                        {pct}%
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const grand = Number(selectedBill.grandTotal || 0);
                        const maxRemaining = Math.max(0, grand - Number(selectedBill.paidAmount || 0));
                        setPaymentAmount(maxRemaining);
                      }}
                      className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                    >
                      Full Balance
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  max={Math.max(0, Number(selectedBill.grandTotal || 0) - Number(selectedBill.paidAmount || 0))}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-base font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mode & Bank Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs"
                  >
                    <option value="NEFT/RTGS">NEFT / RTGS</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Debit Bank Account
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs"
                  >
                    {bankAccounts && bankAccounts.length > 0 ? (
                      bankAccounts.map((b) => (
                        <option key={b.id} value={b.bankName}>
                          {b.bankName} ({b.accountNumber?.slice(-4) || 'Main'})
                        </option>
                      ))
                    ) : (
                      <option value="HDFC Bank Current">HDFC Bank Current A/c</option>
                    )}
                  </select>
                </div>
              </div>

              {/* UTR / Ref & Date Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    UTR / Cheque / Ref Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR192837465"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Payment Notes / Telephonic Agreement Remarks
                </label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid as agreed on phone call with supplier before dispatch."
                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPaymentSubmit}
                className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 ${
                  isFinalSettlement ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Check className="w-4 h-4" />
                {isFinalSettlement ? 'Confirm Final Settlement' : 'Record Payment Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW BILL DETAILS & PRINTABLE VOUCHER MODAL */}
      {showViewModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Purchase Bill Voucher: {selectedBill.invoiceNumber}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vendor Invoice: {selectedBill.vendorInvoiceNumber || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printContent('printable-purchase-bill-voucher')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Voucher
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content to Print */}
            <div id="printable-purchase-bill-voucher" className="p-6 space-y-6 text-xs text-gray-800 dark:text-gray-200">
              {/* Header Company & Supplier Info */}
              <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-blue-600 dark:text-blue-400 tracking-wide">
                    UMA TECHNOFAB PVT. LTD.
                  </h2>
                  <p className="text-gray-500">Rajpur Works, Mehsana-Ahmedabad Highway, Gujarat</p>
                  <p className="text-gray-500">GSTIN: 24AAACU1234F1Z8 | info@umatechnofab.com</p>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    PURCHASE BILL VOUCHER
                  </div>
                  <div className="font-mono text-blue-600 font-bold">{selectedBill.invoiceNumber}</div>
                  <div className="text-gray-500">Date: {selectedBill.invoiceDate || selectedBill.createdAt}</div>
                  {selectedBill.dueDate && (
                    <div className="text-gray-500">Due: {selectedBill.dueDate}</div>
                  )}
                </div>
              </div>

              {/* Vendor & PO Link Box */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Supplier / Vendor:</span>
                  <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedBill.supplierName}
                  </div>
                  {selectedBill.supplierGstin && (
                    <div className="text-gray-500 font-mono mt-0.5">GSTIN: {selectedBill.supplierGstin}</div>
                  )}
                  {selectedBill.vendorInvoiceNumber && (
                    <div className="text-gray-600 dark:text-gray-300 mt-1">
                      Vendor Inv No: <span className="font-mono font-semibold">{selectedBill.vendorInvoiceNumber}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Linked Purchase Order:</span>
                    <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedBill.poNumber || 'Direct Purchase (No PO)'}
                    </div>
                  </div>
                  {selectedBill.projectId && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">Project / Job:</span>
                      <div className="font-medium text-gray-700 dark:text-gray-200">{selectedBill.projectId}</div>
                    </div>
                  )}
                  {selectedBill.paymentTerms && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">Payment Terms:</span>
                      <div className="text-gray-600 dark:text-gray-300 italic">{selectedBill.paymentTerms}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Safe Delivery Verification Badge */}
              {(() => {
                const grn = getLinkedGRN(selectedBill);
                if (grn) {
                  return (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <div>
                          <div className="font-bold text-emerald-900 dark:text-emerald-200">
                            Material Safely Received & GRN Verified
                          </div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                            GRN No: {grn.grnNumber} | Received By: {grn.receivedBy || 'Store Incharge'} | Date: {grn.grnDate}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                        VERIFIED
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="text-amber-800 dark:text-amber-300">
                        <span className="font-bold">Awaiting Safe Delivery & Store Verification: </span>
                        Material delivery pending at works store.
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Items Table */}
              <div>
                <table className="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Item Description</th>
                      <th className="p-2">HSN</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Rate (₹)</th>
                      <th className="p-2 text-right">Tax (₹)</th>
                      <th className="p-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedBill.items && selectedBill.items.length > 0 ? (
                      selectedBill.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-gray-400">{idx + 1}</td>
                          <td className="p-2 font-medium">
                            {it.itemName || it.description}
                            {it.description && it.itemName && (
                              <div className="text-[11px] text-gray-400">{it.description}</div>
                            )}
                          </td>
                          <td className="p-2 font-mono">{it.hsnSac || '7308'}</td>
                          <td className="p-2 text-right font-medium">
                            {it.quantity} {it.uom || ''}
                          </td>
                          <td className="p-2 text-right font-mono">
                            ₹{(it.unitPrice || (it as any).rate || 0).toLocaleString()}
                          </td>
                          <td className="p-2 text-right font-mono text-gray-500">
                            ₹{(it.taxAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-2 text-right font-mono font-bold">
                            ₹{(it.totalAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-gray-400 italic">
                          No line items specified.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Taxable Subtotal:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(Number(selectedBill.subTotal || selectedBill.subtotal || 0))}
                    </span>
                  </div>
                  {Number(selectedBill.taxTotal || 0) > 0 && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Total Tax (GST):</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(selectedBill.taxTotal || 0))}
                      </span>
                    </div>
                  )}
                  {Number(selectedBill.freightCharges || 0) > 0 && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Freight Charges:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(selectedBill.freightCharges || 0))}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-1 flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">{formatCurrency(Number(selectedBill.grandTotal || 0))}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Advance / Paid:</span>
                    <span>{formatCurrency(Number(selectedBill.paidAmount || 0))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-600 border-t border-dashed border-gray-300 dark:border-gray-600 pt-1">
                    <span>Balance Remaining:</span>
                    <span>
                      {formatCurrency(
                        Math.max(0, Number(selectedBill.grandTotal || 0) - Number(selectedBill.paidAmount || 0))
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details Log */}
              {((selectedBill as any).paymentMode || (selectedBill as any).paymentReference) && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    Payment Audit Details:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Mode: </span>
                      <span className="font-semibold">{(selectedBill as any).paymentMode || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reference/UTR: </span>
                      <span className="font-mono font-semibold">
                        {(selectedBill as any).paymentReference || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date: </span>
                      <span className="font-semibold">{(selectedBill as any).paymentDate || 'N/A'}</span>
                    </div>
                  </div>
                  {(selectedBill as any).paymentNotes && (
                    <div className="mt-1 text-[11px] text-gray-500 italic">
                      Remarks: {(selectedBill as any).paymentNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
                <div>
                  <div className="border-b border-gray-300 dark:border-gray-600 pb-8"></div>
                  <span className="text-[11px] text-gray-500 font-semibold mt-1 block">Prepared By</span>
                </div>
                <div>
                  <div className="border-b border-gray-300 dark:border-gray-600 pb-8"></div>
                  <span className="text-[11px] text-gray-500 font-semibold mt-1 block">Store / QC Incharge</span>
                </div>
                <div>
                  <div className="border-b border-gray-300 dark:border-gray-600 pb-8"></div>
                  <span className="text-[11px] text-gray-500 font-semibold mt-1 block">Accounts Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PurchaseBillsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading Purchase Bills...</div>}>
      <PurchaseBillsContent />
    </Suspense>
  );
}
