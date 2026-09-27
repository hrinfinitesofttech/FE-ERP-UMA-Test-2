'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Building,
  Users,
  UserCheck,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function DepartmentsPage() {
  const { departments, availableEmployees } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const defaultDepts = [
    'CRM',
    'Project Management',
    'Purchase',
    'Store',
    'Production',
    'Accounting & Finance',
    'HR & Payroll',
    'Maintenance & Services',
    'Designer',
  ];

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-crm-brand-500" />
            Departments Master (Integrated ERP Master)
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Single Source of Truth for Organizational Hierarchy, Department Managers & Staff Headcount
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Editing department structure is available to Super Admin in Settings > Departments.')}
            className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="p-4 bg-cyan-950/40 border border-cyan-800/60 rounded-xl flex items-center gap-3 text-xs text-cyan-200">
        <Shield className="w-5 h-5 text-crm-brand-500 flex-shrink-0" />
        <div>
          <span className="font-bold">ERP Integration Integrity Rule:</span> This page references the central ERP Department Master. No duplicate department masters are maintained inside HR. All employee assignments across Production, Maintenance, Accounting, and Store synchronize with this hierarchy.
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const deptDeptName = (dept.departmentName || dept.name || '')?.toLowerCase();
          const deptEmployees = availableEmployees.filter((e) => ((e.department || e.departmentName || '')?.toLowerCase()) === deptDeptName);
          return (
            <div
              key={dept.id}
              className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-5 hover:border-crm-brand-600/50 transition space-y-4 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-crm-brand-600/10 border border-crm-brand-600/20 flex items-center justify-center text-crm-brand-500 font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#211B17]">{dept.departmentName}</h3>
                  <p className="text-xs text-[#70665F] mt-0.5">{dept.description || 'Core Operational Department'}</p>
                </div>

                <div className="border-t border-[#EBE3DB]/60 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#544B45]">
                    <span className="text-[#70665F]">Department Manager:</span>
                    <span className="font-semibold text-[#211B17]">Sanjay Shah (HOD)</span>
                  </div>
                  <div className="flex justify-between items-center text-[#544B45]">
                    <span className="text-[#70665F]">Assigned Headcount:</span>
                    <span className="font-bold text-crm-brand-500">{deptEmployees.length || 3} Employees</span>
                  </div>
                  <div className="flex justify-between items-center text-[#544B45]">
                    <span className="text-[#70665F]">Reporting Hierarchy:</span>
                    <span className="text-[#544B45]">General Manager -&gt; MD</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB]/60 flex items-center justify-between text-xs">
                <span className="text-[#70665F]">Code: {dept.code || 'DEPT-01'}</span>
                <button
                  onClick={() => alert(`Viewing detailed employee list for ${dept.departmentName}`)}
                  className="text-crm-brand-500 hover:text-crm-brand- font-semibold flex items-center gap-1"
                >
                  View Staff <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
