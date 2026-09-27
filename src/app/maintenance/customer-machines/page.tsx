'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import {
  Building,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  FileCheck,
  MapPin,
  Phone,
  Mail,
  User,
  X,
  Layers,
} from 'lucide-react';

export default function CustomerMachinesPage() {
  const { customerMachines, addCustomerMachine, openJobModal } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    customerMachineId: `MAC-CUST-${900 + customerMachines.length + 1}`,
    customerId: '',
    customerName: '',
    projectId: '',
    projectName: '',
    jobId: '',
    jobNumber: '',
    salesOrderId: '',
    customerPo: '',
    dispatchNumber: '',
    installationNumber: '',
    machineName: '',
    machineModel: '',
    serialNumber: `UTF-CR-2026-00${customerMachines.length + 1}`,
    manufacturingDate: new Date().toISOString().split('T')[0],
    installationDate: '',
    commissioningDate: '',
    warrantyStart: '',
    warrantyEnd: '',
    machineLocation: '',
    customerContact: '',
    contactPhone: '',
    contactEmail: '',
    serviceEngineer: '',
    status: 'In Warranty' as const,
  });

  const filteredMachines = customerMachines.filter((cm) => {
    const matchesSearch =
      cm.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cm.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cm.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cm.jobNumber && cm.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || cm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomerMachine({
      ...formData,
      documents: ['installation_cert.pdf'],
    });
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
              CUSTOMER MACHINES REGISTER
            </span>
            <span className="text-xs text-slate-400">Post-Dispatch Product Traceability</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-500" />
            Customer Machine Master
          </h1>
          <p className="text-xs text-slate-500">
            Registered machines supplied by Uma Techno Fab after dispatch, installation & commissioning.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          Register Customer Machine
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search serial no, machine name, customer or job no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="In Warranty">In Warranty</option>
            <option value="Under AMC">Under AMC</option>
            <option value="Installed & Operational">Installed & Operational</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Breakdown">Breakdown</option>
          </select>
        </div>
      </div>

      {/* Machine Master List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4">Serial / Machine ID</th>
                <th className="py-3.5 px-4">Machine & Model</th>
                <th className="py-3.5 px-4">Customer & Location</th>
                <th className="py-3.5 px-4">Job & PO Link</th>
                <th className="py-3.5 px-4">Warranty & AMC Dates</th>
                <th className="py-3.5 px-4">Assigned Engineer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredMachines.map((cm) => (
                <tr key={cm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{cm.serialNumber}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{cm.customerMachineId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{cm.machineName}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Model: {cm.machineModel}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{cm.customerName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {cm.machineLocation}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {cm.jobNumber ? (
                      <button
                        onClick={() => openJobModal(cm.jobNumber!)}
                        className="font-mono text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3" />
                        {cm.jobNumber}
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">N/A</span>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono">PO: {cm.customerPo || 'N/A'}</div>
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3 h-3 text-amber-500" />
                      <span className="text-slate-600 dark:text-slate-300">Exp: {formatDate(cm.warrantyEnd)}</span>
                    </div>
                    {cm.amcEnd && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-600">
                        <FileCheck className="w-3 h-3" />
                        <span>AMC: {formatDate(cm.amcEnd)}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {cm.serviceEngineer}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        cm.status === 'In Warranty'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : cm.status === 'Under AMC'
                          ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}
                    >
                      {cm.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <Link
                      href={`/maintenance/customer-history?serial=${cm.serialNumber}`}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 text-[11px]"
                    >
                      Full 360° Timeline
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-500" />
                Register New Customer Machine
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Machine Name</label>
                  <input
                    type="text"
                    required
                    value={formData.machineName}
                    onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Job Number</label>
                  <input
                    type="text"
                    value={formData.jobNumber}
                    onChange={(e) => setFormData({ ...formData, jobNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Warranty Start</label>
                  <input
                    type="date"
                    value={formData.warrantyStart}
                    onChange={(e) => setFormData({ ...formData, warrantyStart: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Warranty End</label>
                  <input
                    type="date"
                    value={formData.warrantyEnd}
                    onChange={(e) => setFormData({ ...formData, warrantyEnd: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">
                  Register Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
