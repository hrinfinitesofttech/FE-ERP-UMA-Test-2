'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  UserPlus,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck2,
  Building,
  Briefcase,
  DollarSign,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function EmployeeOnboardingPage() {
  const { employeeOnboardings, addEmployeeOnboarding, updateEmployeeOnboardingStatus, departments, designations } = useERP();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    mobile: '',
    joiningDate: new Date().toISOString().split('T')[0],
    department: 'Production',
    designation: 'Senior CNC Operator',
    reportingManager: 'Rajesh Patel',
    shift: 'General Day Shift (09:00 - 18:00)',
    offeredCTC: 480000,
  });

  const onboardingSteps = [
    'Recruitment',
    'Offer Letter',
    'Joining',
    'Doc Verification',
    'Employee Creation',
    'Dept Assignment',
    'Role Assignment',
    'Shift Assignment',
    'Salary Structure',
    'Active Employee',
  ];

  const handleCreateOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateName) return;

    addEmployeeOnboarding({
      candidateName: formData.candidateName,
      email: formData.email,
      mobile: formData.mobile,
      joiningDate: formData.joiningDate,
      department: formData.department,
      designation: formData.designation,
      reportingManager: formData.reportingManager,
      shift: formData.shift,
      salaryStructureId: 'SAL-STR-01',
      offeredCTC: Number(formData.offeredCTC),
      onboardingChecklist: [
        { task: 'Appointment Letter Signed', completed: true, assignedTo: 'HR Manager' },
        { task: 'Aadhaar & PAN Verification', completed: true, assignedTo: 'HR Admin' },
        { task: 'Bank Account Passbook Uploaded', completed: false, assignedTo: 'Employee' },
        { task: 'PPE & Shop Floor Safety Induction', completed: false, assignedTo: 'Safety Officer' },
        { task: 'ERP Account & Role Assigned', completed: true, assignedTo: 'IT Admin' },
      ],
      status: 'In Progress',
    });

    setShowAddModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-crm-brand-500" />
            Employee Onboarding Workflow
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Complete 10-Step Joining Execution: Offer -&gt; Verification -&gt; Creation -&gt; Role -&gt; Shift -&gt; Payroll Structure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Initiate New Onboarding
          </button>
        </div>
      </div>

      {/* 10-Step Onboarding Pipeline Visualization */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">Standard Onboarding Lifecycle Stages</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 text-center">
          {onboardingSteps.map((step, idx) => (
            <div key={idx} className="p-2 bg-white/80 border border-[#EBE3DB]/60 rounded-lg space-y-1">
              <span className="w-5 h-5 rounded-full bg-crm-brand-700/30 text-crm-brand-500 font-bold text-[10px] inline-flex items-center justify-center">
                {idx + 1}
              </span>
              <div className="text-[11px] font-semibold text-[#3E2723]">{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding Records Grid */}
      <div className="grid grid-cols-1 gap-6">
        {employeeOnboardings.map((item) => (
          <div key={item.id} className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB]/60 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-[#211B17]">{item.candidateName}</h3>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-crm-brand-600/10 text-crm-brand-500 border border-crm-brand-600/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-xs text-[#70665F] mt-1 flex flex-wrap gap-4">
                  <span>Department: <strong className="text-crm-brand-500">{item.department}</strong></span>
                  <span>Designation: <strong className="text-[#211B17]">{item.designation}</strong></span>
                  <span>Joining Date: <strong className="text-amber-400">{item.joiningDate}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.status !== 'Completed' && (
                  <button
                    onClick={() => updateEmployeeOnboardingStatus(item.id, 'Completed')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-semibold text-xs rounded-lg transition"
                  >
                    Complete Onboarding & Activate Employee
                  </button>
                )}
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">Onboarding Mandatory Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {item.onboardingChecklist.map((chk, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-[#EBE3DB]/50 text-xs">
                    <div className="flex items-center gap-2">
                      {chk.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                      <span className={chk.completed ? 'text-[#3E2723] font-medium' : 'text-[#70665F]'}>{chk.task}</span>
                    </div>
                    <span className="text-[10px] text-crm-brand-500 bg-crm-brand-/40 px-2 py-0.5 rounded">{chk.assignedTo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-crm-brand-500" /> Initiate Employee Onboarding
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOnboarding} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pankaj Mehta"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Mobile</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.departmentName}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Offered CTC (₹)</label>
                  <input
                    type="number"
                    value={formData.offeredCTC}
                    onChange={(e) => setFormData({ ...formData, offeredCTC: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold rounded-lg">
                  Start Onboarding Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
