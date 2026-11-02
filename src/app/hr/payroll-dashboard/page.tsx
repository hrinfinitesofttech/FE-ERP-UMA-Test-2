'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { LayoutDashboard, DollarSign, Banknote, FileText, CheckCircle2, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function PayrollDashboardPage() {
  const { payrollRecords, salaryStructures, salaryComponents, employeeAdvanceLoans, reimbursementExpenses } = useERP();

  const totalGrossPayroll = salaryStructures.reduce((sum, s) => sum + s.grossSalary, 0);
  const totalNetDisbursement = salaryStructures.reduce((sum, s) => sum + s.netSalary, 0);
  const totalEmployerPFESI = salaryStructures.reduce((sum, s) => sum + s.employerPF + s.employerESI, 0);
  const totalCTC = salaryStructures.reduce((sum, s) => sum + s.totalCTC, 0);

  const activeLoansCount = employeeAdvanceLoans.filter((l) => l.status === 'Active').length;
  const pendingReimbursementsCount = reimbursementExpenses.filter((r) => r.status === 'Pending Manager').length;

  return (
    <div className="p-6 space-y-6 bg-white text-[color:var(--crm-text-primary)] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[color:var(--crm-border-default)] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--crm-text-primary)] tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-emerald-700" />
            Payroll Analytics & Executive Dashboard
          </h1>
          <p className="text-sm text-[color:var(--crm-text-secondary)] mt-1">
            Financial Salary Costs, Statutory PF/ESI/TDS Deductions & Monthly Bank Disbursement Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/hr/monthly-payroll"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition cursor-pointer"
          >
            <Banknote className="w-4 h-4" /> Run Payroll Processing
          </Link>
        </div>
      </div>

      {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[color:var(--crm-text-secondary)]">
            <span>Total Monthly Gross Payroll</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{(totalGrossPayroll / 100000).toFixed(2)} Lakhs</div>
          <span className="text-[11px] text-[color:var(--crm-text-secondary)]">Basic + HRA + Allowances</span>
        </div>

        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[color:var(--crm-text-secondary)]">
            <span>Net Employee Disbursement</span>
            <Banknote className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-2xl font-black text-crm-brand-500">₹{(totalNetDisbursement / 100000).toFixed(2)} Lakhs</div>
          <span className="text-[11px] text-crm-brand-500">Direct Bank Transfer</span>
        </div>

        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[color:var(--crm-text-secondary)]">
            <span>Employer PF & ESI Contribution</span>
            <ShieldCheck className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-2xl font-black text-crm-brand-500">₹{totalEmployerPFESI?.toLocaleString()}</div>
          <span className="text-[11px] text-[color:var(--crm-text-secondary)]">Statutory Compliance Cost</span>
        </div>

        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[color:var(--crm-text-secondary)]">
            <span>Total Monthly Company CTC</span>
            <TrendingUp className="w-4 h-4 text-pink-700" />
          </div>
          <div className="text-2xl font-black text-[color:var(--crm-text-primary)]">₹{(totalCTC / 100000).toFixed(2)} Lakhs</div>
          <span className="text-[11px] text-pink-700">Complete Workforce Cost</span>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Loan & Reimbursements Summary */}
        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-5 space-y-4 shadow-lg">
          <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-crm-brand-600" />
            Advances, Loans & Expense Recoveries
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white/60 rounded-xl border border-[#E2E7EF]/50 space-y-1">
              <span className="text-[color:var(--crm-text-secondary)]">Active Salary Advances / Loans</span>
              <div className="text-xl font-bold text-amber-700">{activeLoansCount} Active EMI Recovery</div>
              <span className="text-[11px] text-[color:var(--crm-text-secondary)]">Auto Deducted from Monthly Payroll</span>
            </div>
            <div className="p-4 bg-white/60 rounded-xl border border-[#E2E7EF]/50 space-y-1">
              <span className="text-[color:var(--crm-text-secondary)]">Pending Reimbursements</span>
              <div className="text-xl font-bold text-rose-700">{pendingReimbursementsCount} Requests</div>
              <span className="text-[11px] text-[color:var(--crm-text-secondary)]">Awaiting Manager / Accounts Approval</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl p-5 space-y-4 shadow-lg">
          <h3 className="text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            Payroll Workflow Modules
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link href="/hr/salary-structures" className="p-3 bg-white/80 hover:bg-[#F4F6FA]/60 border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)] font-semibold transition text-center">
              Salary Structure Master
            </Link>
            <Link href="/hr/salary-components" className="p-3 bg-white/80 hover:bg-[#F4F6FA]/60 border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)] font-semibold transition text-center">
              PF/ESI Statutory Rules
            </Link>
            <Link href="/hr/payroll-approvals" className="p-3 bg-white/80 hover:bg-[#F4F6FA]/60 border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)] font-semibold transition text-center">
              Payroll Approval & Lock
            </Link>
            <Link href="/hr/payslips" className="p-3 bg-white/80 hover:bg-[#F4F6FA]/60 border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)] font-semibold transition text-center">
              Generate PDF Payslips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
