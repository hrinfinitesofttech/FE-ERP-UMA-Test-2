'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Layers, Plus, DollarSign, Lock, ShieldCheck, X } from 'lucide-react';

export default function SalaryStructuresPage() {
  const { salaryStructures, addSalaryStructure, availableEmployees, currentUser } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    effectiveFrom: new Date().toISOString().split('T')[0],
    basicSalary: 35000,
    hra: 17500,
    conveyanceAllowance: 3000,
    medicalAllowance: 2500,
    specialAllowance: 7000,
  });

  const canViewSalary = currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Manager' || currentUser?.role === 'Admin';

  const grossSalary = Number(formData.basicSalary) + Number(formData.hra) + Number(formData.conveyanceAllowance) + Number(formData.medicalAllowance) + Number(formData.specialAllowance);
  const employeePF = Math.round(Number(formData.basicSalary) * 0.12);
  const employeeESI = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;
  const professionalTax = grossSalary > 12000 ? 200 : 0;
  const tdsMonthly = 1500;
  const totalDeductions = employeePF + employeeESI + professionalTax + tdsMonthly;
  const netSalary = grossSalary - totalDeductions;
  const employerPF = Math.round(Number(formData.basicSalary) * 0.12);
  const employerESI = grossSalary <= 21000 ? Math.round(grossSalary * 0.0325) : 0;
  const totalCTC = grossSalary + employerPF + employerESI;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);

    addSalaryStructure({
      structureName: `${emp?.name || 'Staff'} Salary CTC Structure 2026`,
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Member',
      effectiveFrom: formData.effectiveFrom,
      basicSalary: Number(formData.basicSalary),
      hra: Number(formData.hra),
      conveyanceAllowance: Number(formData.conveyanceAllowance),
      medicalAllowance: Number(formData.medicalAllowance),
      specialAllowance: Number(formData.specialAllowance),
      grossSalary,
      employeePF,
      employeeESI,
      professionalTax,
      tdsMonthly,
      totalDeductions,
      netSalary,
      employerPF,
      employerESI,
      totalCTC,
      status: 'Active',
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-teal-400" />
            Employee Salary Structure Master
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Breakdown of Basic Pay, HRA, Allowances, Statutory PF/ESI Deductions, Net Take-Home & CTC
          </p>
        </div>
        {canViewSalary && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Define New Salary Structure
          </button>
        )}
      </div>

      {!canViewSalary ? (
        <div className="p-12 bg-white/60 border border-[#EBE3DB]/60 rounded-xl text-center space-y-3">
          <Lock className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-[#211B17]">Sensitive Compensation Records Locked</h2>
          <p className="text-sm text-[#70665F] max-w-md mx-auto">
            Salary structure details are restricted under Role-Based Access Control (RBAC). Only Super Admin, Admin and HR Managers are permitted to inspect CTC allocations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {salaryStructures.map((struct) => (
            <div key={struct.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#EBE3DB]/60 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-400">{struct.id}</span>
                  <h3 className="text-base font-bold text-[#211B17]">{struct.employeeName}</h3>
                  <div className="text-xs text-[#70665F]">Effective From: {struct.effectiveFrom}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  {struct.status}
                </span>
              </div>

              {/* Earnings vs Deductions grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white/60 p-3.5 rounded-lg border border-[#EBE3DB]/50">
                <div className="space-y-1">
                  <span className="font-bold text-emerald-400 block border-b border-[#EBE3DB] pb-1">Earnings</span>
                  <div className="flex justify-between"><span>Basic:</span> <strong className="text-[#211B17]">₹{struct.basicSalary?.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span>HRA:</span> <strong className="text-[#211B17]">₹{struct.hra?.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span>Allowances:</span> <strong className="text-[#211B17]">₹{(struct.conveyanceAllowance + struct.medicalAllowance + struct.specialAllowance)?.toLocaleString()}</strong></div>
                  <div className="flex justify-between border-t border-[#EBE3DB] pt-1 font-bold text-emerald-400">
                    <span>Gross:</span> <span>₹{struct.grossSalary?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-rose-400 block border-b border-[#EBE3DB] pb-1">Deductions</span>
                  <div className="flex justify-between"><span>PF (Emp):</span> <strong className="text-[#211B17]">₹{struct.employeePF?.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span>ESI (Emp):</span> <strong className="text-[#211B17]">₹{struct.employeeESI?.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span>PT & TDS:</span> <strong className="text-[#211B17]">₹{(struct.professionalTax + struct.tdsMonthly)?.toLocaleString()}</strong></div>
                  <div className="flex justify-between border-t border-[#EBE3DB] pt-1 font-bold text-rose-400">
                    <span>Total Ded:</span> <span>₹{struct.totalDeductions?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EBE3DB]/60 text-xs">
                <div>
                  <span className="text-[#70665F] block">Monthly Net Pay</span>
                  <span className="text-lg font-black text-emerald-400">₹{struct.netSalary?.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#70665F] block">Annual Company CTC</span>
                  <span className="text-lg font-black text-pink-400">₹{struct.totalCTC?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" /> New Salary Structure
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                >
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Basic Monthly (₹)</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">HRA (₹)</label>
                  <input
                    type="number"
                    value={formData.hra}
                    onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Conveyance (₹)</label>
                  <input
                    type="number"
                    value={formData.conveyanceAllowance}
                    onChange={(e) => setFormData({ ...formData, conveyanceAllowance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Special Allowance (₹)</label>
                  <input
                    type="number"
                    value={formData.specialAllowance}
                    onChange={(e) => setFormData({ ...formData, specialAllowance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#EBE3DB] space-y-1 text-xs">
                <div className="flex justify-between"><span>Calculated Gross:</span> <strong className="text-emerald-400">₹{grossSalary?.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Est. Deductions (PF/ESI/PT/TDS):</span> <strong className="text-rose-400">₹{totalDeductions?.toLocaleString()}</strong></div>
                <div className="flex justify-between font-bold border-t border-[#EBE3DB] pt-1"><span>Net Salary:</span> <strong className="text-[#211B17]">₹{netSalary?.toLocaleString()}</strong></div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-[#211B17] font-semibold rounded-lg">
                  Save Salary Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
