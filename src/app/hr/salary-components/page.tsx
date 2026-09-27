'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Calculator, Plus, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function SalaryComponentsPage() {
  const { salaryComponents, addSalaryComponent, updateSalaryComponent } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    componentCode: '',
    componentName: '',
    componentType: 'Earning' as const,
    calculationType: 'Percentage of Basic' as const,
    percentageOrFormula: '50% of Basic',
    isTaxable: true,
    isStatutory: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.componentName) return;

    addSalaryComponent({
      componentCode: formData.componentCode || `COMP-${salaryComponents.length + 1}`,
      componentName: formData.componentName,
      componentType: formData.componentType,
      calculationType: formData.calculationType,
      percentageOrFormula: formData.percentageOrFormula,
      isTaxable: formData.isTaxable,
      isStatutory: formData.isStatutory,
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
            <Calculator className="w-7 h-7 text-crm-brand-500" />
            Configurable Salary Component Master
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Indian Statutory Formula Engine: PF, ESI, Professional Tax, TDS & Employer Contribution Rules
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Add Salary Component Rule
        </button>
      </div>

      {/* Components Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Code</th>
                <th className="p-4">Component Name</th>
                <th className="p-4">Category Type</th>
                <th className="p-4">Calculation Formula / Rule</th>
                <th className="p-4">Taxable & Statutory</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {salaryComponents.map((comp) => (
                <tr key={comp.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-4 font-mono text-xs text-crm-brand-500 font-bold">{comp.componentCode}</td>
                  <td className="p-4 font-bold text-[#211B17]">{comp.componentName}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        comp.componentType === 'Earning'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : comp.componentType === 'Deduction'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-crm-brand-600/10 text-crm-brand-500 border border-crm-brand-600/20'
                      }`}
                    >
                      {comp.componentType}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-[#544B45]">
                    <div className="font-semibold text-[#3E2723]">{comp.calculationType}</div>
                    {comp.percentageOrFormula && <div className="text-amber-400">{comp.percentageOrFormula}</div>}
                  </td>
                  <td className="p-4 text-xs">
                    <div>Taxable: {comp.isTaxable ? <span className="text-amber-400 font-semibold">Yes</span> : 'No'}</div>
                    <div>Statutory: {comp.isStatutory ? <span className="text-crm-brand-500 font-semibold">Statutory Rule</span> : 'Standard'}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-emerald-400">{comp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-crm-brand-500" /> Define Salary Component
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Component Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Performance Incentive"
                  value={formData.componentName}
                  onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Type</label>
                  <select
                    value={formData.componentType}
                    onChange={(e) => setFormData({ ...formData, componentType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                    <option value="Employer Contribution">Employer Contribution</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Calculation Method</label>
                  <select
                    value={formData.calculationType}
                    onChange={(e) => setFormData({ ...formData, calculationType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Percentage of Basic">Percentage of Basic</option>
                    <option value="Formula">Formula Driven</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Formula / Rate Description</label>
                <input
                  type="text"
                  placeholder="e.g. 12% of Basic Salary"
                  value={formData.percentageOrFormula}
                  onChange={(e) => setFormData({ ...formData, percentageOrFormula: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold rounded-lg">
                  Save Component Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
