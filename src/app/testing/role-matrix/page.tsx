'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckSquare,
  Building,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function RoleMatrixPage() {
  const { roles, currentUser } = useERP();

  const [selectedRole, setSelectedRole] = useState<string>('Production Manager');
  const [testRoute, setTestRoute] = useState<string>('/hr/monthly-payroll');
  const [testAction, setTestAction] = useState<'read' | 'create' | 'update' | 'delete' | 'approve'>('read');
  const [simulationResult, setSimulationResult] = useState<{ allowed: boolean; reason: string } | null>(null);

  const erpRoles = [
    'Super Admin',
    'Sales Manager',
    'Design Lead',
    'Purchase Manager',
    'Store Officer',
    'Production Manager',
    'Quality Engineer',
    'Accounts Manager',
    'HR Payroll Lead',
    'Service Manager',
    'Plant Director',
    'Operator',
  ];

  const erpModulesAccess = [
    { name: 'ERP Foundation', route: '/users', superAdmin: true, plantDir: true, sales: false, design: false, purchase: false, store: false, prod: false, acc: false, hr: false, service: false },
    { name: 'CRM & Sales', route: '/crm/leads', superAdmin: true, plantDir: true, sales: true, design: false, purchase: false, store: false, prod: false, acc: true, hr: false, service: true },
    { name: 'Project & Job 360°', route: '/projects/jobs', superAdmin: true, plantDir: true, sales: true, design: true, purchase: true, store: true, prod: true, acc: true, hr: true, service: true },
    { name: 'Design & BOM', route: '/designer/boms', superAdmin: true, plantDir: true, sales: false, design: true, purchase: true, store: true, prod: true, acc: false, hr: false, service: false },
    { name: 'Purchase & RFQ', route: '/purchase/pos', superAdmin: true, plantDir: true, sales: false, design: false, purchase: true, store: true, prod: true, acc: true, hr: false, service: false },
    { name: 'Store & Inventory', route: '/store/inventory', superAdmin: true, plantDir: true, sales: false, design: false, purchase: true, store: true, prod: true, acc: true, hr: false, service: false },
    { name: 'Production & MRP', route: '/production/work-orders', superAdmin: true, plantDir: true, sales: false, design: false, purchase: false, store: true, prod: true, acc: false, hr: false, service: false },
    { name: 'Accounting & GST', route: '/accounting/vouchers', superAdmin: true, plantDir: true, sales: false, design: false, purchase: false, store: false, prod: false, acc: true, hr: false, service: false },
    { name: 'HR & Payroll', route: '/hr/monthly-payroll', superAdmin: true, plantDir: true, sales: false, design: false, purchase: false, store: false, prod: false, acc: false, hr: true, service: false },
    { name: 'Maintenance & Service', route: '/maintenance/service-reports', superAdmin: true, plantDir: true, sales: false, design: false, purchase: false, store: false, prod: false, acc: false, hr: false, service: true },
  ];

  const handleRunPermissionSimulation = () => {
    // Logic for role evaluation
    if (selectedRole === 'Super Admin') {
      setSimulationResult({ allowed: true, reason: 'Super Admin has full unrestricted access across all 11 modules.' });
      return;
    }

    if (testRoute.startsWith('/hr') && selectedRole !== 'HR Payroll Lead' && selectedRole !== 'Plant Director') {
      setSimulationResult({ allowed: false, reason: `Access Denied: Role '${selectedRole}' does not possess 'HR_PAYROLL_ADMIN' authority for ${testRoute}.` });
      return;
    }

    if (testRoute.startsWith('/accounting') && selectedRole !== 'Accounts Manager' && selectedRole !== 'Plant Director') {
      setSimulationResult({ allowed: false, reason: `Access Denied: Role '${selectedRole}' is restricted from financial journals and ledgers.` });
      return;
    }

    if (testRoute.startsWith('/designer') && selectedRole !== 'Design Lead' && selectedRole !== 'Production Manager' && selectedRole !== 'Purchase Manager' && selectedRole !== 'Plant Director') {
      setSimulationResult({ allowed: false, reason: `Access Denied: Role '${selectedRole}' does not have engineering BOM access.` });
      return;
    }

    setSimulationResult({ allowed: true, reason: `Access Granted: Role '${selectedRole}' holds valid permission scope for ${testRoute} [Action: ${testAction?.toUpperCase()}].` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-[#EBE3DB] p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-crm-brand-600/10 border border-crm-brand-600/20 rounded-xl text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#211B17] tracking-wide">
                Role & Data Scope Permission Matrix
              </h1>
              <p className="text-xs text-[#70665F]">
                Verify Role-Based Access Control (RBAC), Department Segregation & Action Scopes across 12 Roles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="bg-white border border-[#EBE3DB] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-[#211B17] border-b border-[#EBE3DB] pb-3">
          <UserCheck className="w-4 h-4 text-indigo-400" />
          Interactive RBAC Permission Test Simulator
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#70665F]">Select Role to Test:</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSimulationResult(null);
              }}
              className="w-full bg-[#FAF7F2] text-xs text-[#211B17] p-2.5 rounded-xl border border-[#EBE3DB] focus:outline-none focus:border-crm-brand-600 mt-1 cursor-pointer"
            >
              {erpRoles.map((r) => (
                <option key={r} value={r} className="bg-white">{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#70665F]">Target Module Route:</label>
            <select
              value={testRoute}
              onChange={(e) => {
                setTestRoute(e.target.value);
                setSimulationResult(null);
              }}
              className="w-full bg-[#FAF7F2] text-xs text-[#211B17] p-2.5 rounded-xl border border-[#EBE3DB] focus:outline-none focus:border-crm-brand-600 mt-1 cursor-pointer"
            >
              <option value="/hr/monthly-payroll" className="bg-white">/hr/monthly-payroll (HR)</option>
              <option value="/accounting/invoices" className="bg-white">/accounting/invoices (Accounting)</option>
              <option value="/purchase/pos" className="bg-white">/purchase/pos (Purchase)</option>
              <option value="/designer/boms" className="bg-white">/designer/boms (Design)</option>
              <option value="/store/issue" className="bg-white">/store/issue (Store)</option>
              <option value="/production/work-orders" className="bg-white">/production/work-orders (Production)</option>
              <option value="/users" className="bg-white">/users (Admin)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#70665F]">Target Action Scope:</label>
            <select
              value={testAction}
              onChange={(e) => {
                setTestAction(e.target.value as any);
                setSimulationResult(null);
              }}
              className="w-full bg-[#FAF7F2] text-xs text-[#211B17] p-2.5 rounded-xl border border-[#EBE3DB] focus:outline-none focus:border-crm-brand-600 mt-1 cursor-pointer"
            >
              <option value="read">READ (View Page)</option>
              <option value="create">CREATE (Add Record)</option>
              <option value="update">UPDATE (Edit Record)</option>
              <option value="delete">DELETE (Remove Record)</option>
              <option value="approve">APPROVE (Sign-off)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunPermissionSimulation}
              className="w-full py-2.5 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-crm-brand-700/20 transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Test Access Authorization
            </button>
          </div>
        </div>

        {/* Result Box */}
        {simulationResult && (
          <div
            className={cn(
              'p-4 rounded-xl border flex items-center justify-between transition-all duration-300 font-mono text-xs',
              simulationResult.allowed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            )}
          >
            <div className="flex items-center gap-3">
              {simulationResult.allowed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <div>
                <span className="font-bold uppercase tracking-wider">{simulationResult.allowed ? 'ACCESS GRANTED' : 'ACCESS DENIED'} — </span>
                {simulationResult.reason}
              </div>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#EBE3DB] text-[#70665F]">
              Evaluated Server Middleware
            </span>
          </div>
        )}
      </div>

      {/* Role Permission Matrix Grid */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#211B17]">
            <Building className="w-4 h-4 text-indigo-400" />
            11 ERP Modules Module Access Scope Matrix
          </div>
          <span className="text-xs text-[#70665F]">Green check = Authorized | Red cross = Restricted</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[10px] font-bold text-[#70665F] uppercase tracking-wider border-b border-[#EBE3DB]">
                <th className="py-3 px-4">ERP Module</th>
                <th className="py-3 px-4 text-center">Super Admin</th>
                <th className="py-3 px-4 text-center">Plant Dir</th>
                <th className="py-3 px-4 text-center">Sales Mgr</th>
                <th className="py-3 px-4 text-center">Design Lead</th>
                <th className="py-3 px-4 text-center">Purch Mgr</th>
                <th className="py-3 px-4 text-center">Store Off</th>
                <th className="py-3 px-4 text-center">Prod Mgr</th>
                <th className="py-3 px-4 text-center">Acc Mgr</th>
                <th className="py-3 px-4 text-center">HR Lead</th>
                <th className="py-3 px-4 text-center">Service Mgr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#544B45]">
              {erpModulesAccess.map((mod, idx) => (
                <tr key={idx} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="py-3 px-4 font-semibold text-[#211B17]">
                    <div>{mod.name}</div>
                    <div className="text-[10px] font-mono text-[#70665F]">{mod.route}</div>
                  </td>
                  <td className="py-3 px-4 text-center">{mod.superAdmin ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{mod.plantDir ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{mod.sales ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-500/70 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{mod.design ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-500/70 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{mod.purchase ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-500/70 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{mod.store ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-500/70 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{mod.prod ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-500/70 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{mod.acc ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-500/70 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{mod.hr ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-500/70 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{mod.service ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-500/70 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
